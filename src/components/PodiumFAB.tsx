import { useEffect, useRef } from 'react';
import type { Side } from '../data/debate';
import '../styles/components/podium-fab.css';

export interface PodiumFABProps {
    isExpanded: boolean;
    onExpand: () => void;
    onSideSelect: (side: Side) => void;
    onCollapse: () => void;
}

export function PodiumFAB({ isExpanded, onExpand, onSideSelect, onCollapse }: PodiumFABProps) {
    const openComposerButtonRef = useRef<HTMLButtonElement>(null);
    const tarkComposerButtonRef = useRef<HTMLButtonElement>(null);
    const wasExpandedRef = useRef(isExpanded);

    useEffect(() => {
        if (isExpanded && !wasExpandedRef.current) {
            tarkComposerButtonRef.current?.focus();
        }

        if (!isExpanded && wasExpandedRef.current) {
            openComposerButtonRef.current?.focus();
        }

        wasExpandedRef.current = isExpanded;
    }, [isExpanded]);

    return (
        <div className={`podium-fab-shell${isExpanded ? ' podium-fab-shell--expanded' : ''}`}>
            <button
                ref={openComposerButtonRef}
                type="button"
                className="podium-fab podium-fab__trigger"
                aria-label="Open post composer"
                aria-expanded={isExpanded ? 'true' : 'false'}
                aria-hidden={isExpanded}
                tabIndex={isExpanded ? -1 : 0}
                onClick={onExpand}
            >
                <span aria-hidden="true">+</span>
            </button>
            <div
                className="podium-fab podium-fab--expanded"
                role={isExpanded ? 'group' : undefined}
                aria-label={isExpanded ? 'Post composer options' : undefined}
                aria-hidden={!isExpanded}
            >
                <button
                    ref={tarkComposerButtonRef}
                    type="button"
                    className="podium-fab__mini-btn podium-fab__mini-btn--tark"
                    aria-label="Post as Tark"
                    tabIndex={isExpanded ? 0 : -1}
                    onClick={() => onSideSelect('tark')}
                >
                    T
                </button>
                <button
                    type="button"
                    className="podium-fab__mini-btn podium-fab__mini-btn--vitark"
                    aria-label="Post as Vitark"
                    tabIndex={isExpanded ? 0 : -1}
                    onClick={() => onSideSelect('vitark')}
                >
                    V
                </button>
                <button
                    type="button"
                    className="podium-fab__dismiss"
                    aria-label="Close"
                    tabIndex={isExpanded ? 0 : -1}
                    onClick={onCollapse}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
