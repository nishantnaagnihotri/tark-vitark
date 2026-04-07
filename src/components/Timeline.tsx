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
            <div className="timeline__spine" aria-hidden="true">
                <Divider orientation="vertical" />
            </div>
            <ol className="timeline__list">
                {args.map((arg) => (
                    <li
                        key={arg.id}
                        className={`timeline__item timeline__item--${arg.side}`}
                    >
                        <ArgumentCard argument={arg} />
                        <div className="timeline__spine-cell" aria-hidden="true">
                            <span className="timeline__dot" />
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
