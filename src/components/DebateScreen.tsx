import { DEBATE } from '../data/debate';
import { Topic } from './Topic';
import { LegendBar } from './LegendBar';
import { Timeline } from './Timeline';
import { ThemeToggle } from './ThemeToggle';
import '../styles/debate-screen.css';

export function DebateScreen() {
    return (
        <main role="main" className="debate-screen">
            <header className="debate-header">
                <Topic text={DEBATE.topic} />
            </header>
            <LegendBar />
            <Timeline arguments={DEBATE.arguments} />
            <ThemeToggle />
        </main>
    );
}
