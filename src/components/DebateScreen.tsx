import { useEffect, useRef, useState } from 'react';
import type { Argument, Debate, Side } from '../data/debate';
import { loadStoredActiveDebateRecord } from '../lib/activeDebateStorage';
import { Topic } from './Topic';
import { LegendBar } from './LegendBar';
import { Timeline } from './Timeline';
import { PodiumFAB } from './PodiumFAB';
import { PodiumBottomSheet } from './PodiumBottomSheet';
import { ThemeToggle } from './ThemeToggle';
import '../styles/debate-screen.css';

function emptyActiveDebate(): Debate {
    return {
        topic: '',
        arguments: [],
    };
}

function loadInitialActiveDebate(): Debate {
    return (
        loadStoredActiveDebateRecord().record.activeDebate ?? emptyActiveDebate()
    );
}

function nextPublishedArgumentId(
    baselineArguments: Argument[],
    localArguments: Argument[],
): number {
    const highestArgumentId = [...baselineArguments, ...localArguments].reduce(
        (highestId, argument) => Math.max(highestId, argument.id),
        0,
    );

    return highestArgumentId + 1;
}

export function DebateScreen() {
    const [activeDebate] = useState<Debate>(loadInitialActiveDebate);
    const [localPosts, setLocalPosts] = useState<Argument[]>([]);
    const [selectedSide, setSelectedSide] = useState<Side>('tark');
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const ignoreNextSheetCloseRef = useRef(false);
    const clearIgnoreCloseAnimationFrameRef = useRef<number | null>(null);

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
                id: nextPublishedArgumentId(activeDebate.arguments, existingPosts),
                side,
                text,
            },
        ]);

        return null;
    }

    return (
        <main role="main" className="debate-screen">
            <header className="debate-header">
                <Topic text={activeDebate.topic} />
            </header>
            <LegendBar />
            <Timeline arguments={[...activeDebate.arguments, ...localPosts]} />
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
            <ThemeToggle />
        </main>
    );
}
