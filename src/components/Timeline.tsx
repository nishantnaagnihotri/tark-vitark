import type { Argument } from '../data/debate';
import { Divider } from '../design-system';
import { ArgumentCard } from './ArgumentCard';
import '../styles/components/timeline.css';

interface TimelineProps {
    arguments: Argument[];
}

export function Timeline({ arguments: args }: TimelineProps) {
    return (
        <section className="timeline" aria-label="Debate arguments">
            <ol className="timeline__list">
                <li className="timeline__spine" aria-hidden="true">
                    <Divider orientation="vertical" />
                </li>
                {args.map((arg) => (
                    <li
                        key={arg.id}
                        className={`timeline__item timeline__item--${arg.side}`}
                    >
                        <span className="timeline__dot" aria-hidden="true" />
                        <ArgumentCard argument={arg} />
                    </li>
                ))}
            </ol>
        </section>
    );
}
