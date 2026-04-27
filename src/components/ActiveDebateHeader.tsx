import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Topic } from './Topic';
import '../styles/components/active-debate-header.css';

interface ActiveDebateHeaderProps {
    topic: string;
    onStartNewDebate: () => void;
}

export function ActiveDebateHeader({
    topic,
    onStartNewDebate,
}: ActiveDebateHeaderProps) {
    const [isDebateActionsOpen, setIsDebateActionsOpen] = useState(false);
    const debateActionsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isDebateActionsOpen) {
            return;
        }

        function handlePointerDown(event: MouseEvent) {
            const pointerTarget = event.target;
            if (!(pointerTarget instanceof Node)) {
                return;
            }

            if (!debateActionsRef.current?.contains(pointerTarget)) {
                setIsDebateActionsOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsDebateActionsOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isDebateActionsOpen]);

    return (
        <header className="active-debate-header">
            <div className="active-debate-header__chrome">
                <ThemeToggle
                    variant="chrome"
                    className="active-debate-header__theme-action"
                />
                <div className="active-debate-header__overflow" ref={debateActionsRef}>
                    <button
                        type="button"
                        className="active-debate-header__overflow-trigger"
                        aria-label="Open debate actions"
                        aria-haspopup="menu"
                        aria-expanded={isDebateActionsOpen}
                        onClick={() => setIsDebateActionsOpen((isOpen) => !isOpen)}
                    >
                        <span className="active-debate-header__overflow-glyph" aria-hidden="true">
                            ⋮
                        </span>
                    </button>
                    {isDebateActionsOpen ? (
                        <div className="active-debate-header__menu" role="menu" aria-label="Debate actions">
                            <button
                                type="button"
                                role="menuitem"
                                className="active-debate-header__menu-item"
                                onClick={() => {
                                    setIsDebateActionsOpen(false);
                                    onStartNewDebate();
                                }}
                            >
                                New Debate
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
            <Topic text={topic} />
        </header>
    );
}
