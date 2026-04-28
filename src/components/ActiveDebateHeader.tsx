import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Topic } from './Topic';
import '../styles/components/active-debate-header.css';

interface ActiveDebateHeaderProps {
    topic: string;
    onStartNewDebate: () => void;
    restoreOverflowFocus?: boolean;
    onOverflowFocusRestored?: () => void;
}

export function ActiveDebateHeader({
    topic,
    onStartNewDebate,
    restoreOverflowFocus = false,
    onOverflowFocusRestored,
}: ActiveDebateHeaderProps) {
    const [isDebateActionsOpen, setIsDebateActionsOpen] = useState(false);
    const debateActionsRef = useRef<HTMLDivElement | null>(null);
    const overflowTriggerRef = useRef<HTMLButtonElement | null>(null);

    function closeDebateActions(options?: { restoreFocus?: boolean }) {
        setIsDebateActionsOpen(false);

        if (!options?.restoreFocus) {
            return;
        }

        window.requestAnimationFrame(() => {
            const overflowTrigger = overflowTriggerRef.current;
            if (overflowTrigger && document.contains(overflowTrigger)) {
                overflowTrigger.focus();
            }
        });
    }

    useEffect(() => {
        if (!isDebateActionsOpen) {
            return;
        }

        function handleMouseDown(event: MouseEvent) {
            const clickTarget = event.target;
            if (!(clickTarget instanceof Node)) {
                return;
            }

            if (!debateActionsRef.current?.contains(clickTarget)) {
                closeDebateActions();
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeDebateActions({ restoreFocus: true });
            }
        }

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isDebateActionsOpen]);

    useEffect(() => {
        if (!restoreOverflowFocus) {
            return;
        }

        window.requestAnimationFrame(() => {
            const overflowTrigger = overflowTriggerRef.current;
            if (overflowTrigger && document.contains(overflowTrigger)) {
                overflowTrigger.focus();
            }
            onOverflowFocusRestored?.();
        });
    }, [restoreOverflowFocus, onOverflowFocusRestored]);

    return (
        <header className="active-debate-header">
            <div className="active-debate-header__chrome">
                <ThemeToggle
                    variant="chrome"
                    className="active-debate-header__theme-action"
                />
                <div className="active-debate-header__overflow" ref={debateActionsRef}>
                    <button
                        ref={overflowTriggerRef}
                        type="button"
                        className="active-debate-header__overflow-trigger"
                        aria-label="Open debate actions"
                        aria-controls={isDebateActionsOpen ? 'active-debate-header-actions' : undefined}
                        aria-expanded={isDebateActionsOpen}
                        onClick={() => setIsDebateActionsOpen((isOpen) => !isOpen)}
                    >
                        <span className="active-debate-header__overflow-glyph" aria-hidden="true">
                            ⋮
                        </span>
                    </button>
                    {isDebateActionsOpen ? (
                        <div
                            className="active-debate-header__menu"
                            id="active-debate-header-actions"
                        >
                            <button
                                type="button"
                                className="active-debate-header__menu-item"
                                onClick={() => {
                                    closeDebateActions({ restoreFocus: true });
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
