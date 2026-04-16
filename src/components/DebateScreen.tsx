import { useState } from 'react';
import type { Argument, Side } from '../data/debate';
import { DEBATE } from '../data/debate';
import { Topic } from './Topic';
import { LegendBar } from './LegendBar';
import { Timeline } from './Timeline';
import { Podium } from './Podium';
import { ThemeToggle } from './ThemeToggle';
import '../styles/debate-screen.css';

export function DebateScreen() {
    const [localPosts, setLocalPosts] = useState<Argument[]>([]);
    const [selectedSide, setSelectedSide] = useState<Side>('tark');

    function handlePublish(text: string, side: Side): void {
        setLocalPosts((existingPosts) => [
            ...existingPosts,
            {
                id: DEBATE.arguments.length + existingPosts.length + 1,
                side,
                text,
            },
        ]);
    }

    return (
        <main role="main" className="debate-screen">
            <header className="debate-header">
                <Topic text={DEBATE.topic} />
            </header>
            <LegendBar />
            <Timeline arguments={[...DEBATE.arguments, ...localPosts]} />
            <Podium
                selectedSide={selectedSide}
                onSideChange={setSelectedSide}
                onPublish={handlePublish}
            />
            <ThemeToggle />
        </main>
    );
}
