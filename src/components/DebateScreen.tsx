import { useEffect, useRef, useState } from 'react';
import type { Argument, Side } from '../data/debate';
import { DEBATE } from '../data/debate';
import { Topic } from './Topic';
import { LegendBar } from './LegendBar';
import { Timeline } from './Timeline';
import { Podium } from './Podium';
import { PodiumFAB } from './PodiumFAB';
import { PodiumBottomSheet } from './PodiumBottomSheet';
import { ThemeToggle } from './ThemeToggle';
import '../styles/debate-screen.css';

export function DebateScreen() {
    const [localPosts, setLocalPosts] = useState<Argument[]>([]);
    const [selectedSide, setSelectedSide] = useState<Side>('tark');
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const ignoreNextSheetCloseRef = useRef(false);
    const clearIgnoreCloseAnimationFrameRef = useRef<number | null>(null);
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia('(max-width: 767px)').matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const handleViewportChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);

            if (!event.matches) {
                setIsFabExpanded(false);
                setIsSheetOpen(false);
            }
        };

        mediaQuery.addEventListener('change', handleViewportChange);
        return () => {
            mediaQuery.removeEventListener('change', handleViewportChange);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (clearIgnoreCloseAnimationFrameRef.current !== null) {
                window.cancelAnimationFrame(clearIgnoreCloseAnimationFrameRef.current);
            }
        };
    }, []);

    function handlePublish(text: string, side: Side): string | null {
        setLocalPosts((existingPosts) => [
            ...existingPosts,
            {
                id: DEBATE.arguments.length + existingPosts.length + 1,
                side,
                text,
            },
        ]);

        return null;
    }

    return (
        <main role="main" className="debate-screen">
            <header className="debate-header">
                <Topic text={DEBATE.topic} />
            </header>
            <LegendBar />
            <Timeline arguments={[...DEBATE.arguments, ...localPosts]} />
            {isMobile ? (
                <>
                    <PodiumFAB
                        isExpanded={isFabExpanded}
                        onExpand={() => setIsFabExpanded(true)}
                        onSideSelect={(side) => {
                            setSelectedSide(side);
                            setIsFabExpanded(false);
                            ignoreNextSheetCloseRef.current = true;

                            if (clearIgnoreCloseAnimationFrameRef.current !== null) {
                                window.cancelAnimationFrame(clearIgnoreCloseAnimationFrameRef.current);
                            }
                            clearIgnoreCloseAnimationFrameRef.current = window.requestAnimationFrame(() => {
                                ignoreNextSheetCloseRef.current = false;
                                clearIgnoreCloseAnimationFrameRef.current = null;
                            });

                            setIsSheetOpen(true);
                        }}
                        onCollapse={() => setIsFabExpanded(false)}
                    />
                    <PodiumBottomSheet
                        isOpen={isSheetOpen}
                        selectedSide={selectedSide}
                        onSideChange={setSelectedSide}
                        onPublish={handlePublish}
                        onClose={() => {
                            if (ignoreNextSheetCloseRef.current) {
                                ignoreNextSheetCloseRef.current = false;
                                return;
                            }

                            setIsSheetOpen(false);
                        }}
                    />
                </>
            ) : (
                <Podium
                    selectedSide={selectedSide}
                    onSideChange={setSelectedSide}
                    onPublish={handlePublish}
                />
            )}
            <ThemeToggle />
        </main>
    );
}
