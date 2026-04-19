import { useEffect, useRef, useState } from 'react';
import type { Side } from '../data/debate';
import '../styles/components/podium-fab.css';

export interface PodiumFABProps {
    isExpanded: boolean;
    onExpand: () => void;
    onSideSelect: (side: Side) => void;
    onCollapse: () => void;
}

const FAB_TRANSITION_MS = 300;

export function PodiumFAB({ isExpanded, onExpand, onSideSelect, onCollapse }: PodiumFABProps) {
    const openComposerButtonRef = useRef<HTMLButtonElement>(null);
    const tarkComposerButtonRef = useRef<HTMLButtonElement>(null);
    const wasExpandedRef = useRef(isExpanded);
    const collapseTimeoutRef = useRef<number | null>(null);
    const expandFrameRef = useRef<number | null>(null);
    const [isComposerVisible, setIsComposerVisible] = useState(isExpanded);
    const [isComposerExpanded, setIsComposerExpanded] = useState(isExpanded);

    useEffect(() => {
        const wasExpanded = wasExpandedRef.current;

        if (isExpanded) {
            if (collapseTimeoutRef.current !== null) {
                window.clearTimeout(collapseTimeoutRef.current);
                collapseTimeoutRef.current = null;
            }

            setIsComposerVisible(true);

            if (!wasExpanded) {
                setIsComposerExpanded(false);

                if (expandFrameRef.current !== null) {
                    window.cancelAnimationFrame(expandFrameRef.current);
                }

                expandFrameRef.current = window.requestAnimationFrame(() => {
                    setIsComposerExpanded(true);
                    tarkComposerButtonRef.current?.focus();
                });
            } else {
                setIsComposerExpanded(true);
            }
        }

        if (!isExpanded) {
            if (expandFrameRef.current !== null) {
                window.cancelAnimationFrame(expandFrameRef.current);
                expandFrameRef.current = null;
            }

            if (wasExpanded) {
                openComposerButtonRef.current?.focus();
            }

            setIsComposerExpanded(false);

            if (isComposerVisible) {
                collapseTimeoutRef.current = window.setTimeout(() => {
                    setIsComposerVisible(false);
                    collapseTimeoutRef.current = null;
                }, FAB_TRANSITION_MS);
            }
        }

        wasExpandedRef.current = isExpanded;
    }, [isExpanded, isComposerVisible]);

    useEffect(
        () => () => {
            if (collapseTimeoutRef.current !== null) {
                window.clearTimeout(collapseTimeoutRef.current);
            }

            if (expandFrameRef.current !== null) {
                window.cancelAnimationFrame(expandFrameRef.current);
            }
        },
        []
    );

    const shouldRenderComposerGroup = isComposerVisible || isExpanded;

    return (
        <div className="podium-fab-shell">
            {!isExpanded && (
                <button
                    ref={openComposerButtonRef}
                    type="button"
                    className="podium-fab"
                    aria-label="Open post composer"
                    aria-expanded={false}
                    onClick={onExpand}
                >
                    <span aria-hidden="true">+</span>
                </button>
            )}
            {shouldRenderComposerGroup && (
                <div
                    className={`podium-fab podium-fab--group${isComposerExpanded ? ' podium-fab--expanded' : ''}`}
                    role={isComposerExpanded ? 'group' : undefined}
                    aria-label={isComposerExpanded ? 'Post composer options' : undefined}
                    aria-hidden={!isComposerExpanded}
                >
                    <button
                        ref={tarkComposerButtonRef}
                        type="button"
                        className="podium-fab__mini-btn podium-fab__mini-btn--tark"
                        aria-label="Post as Tark"
                        tabIndex={isComposerExpanded ? 0 : -1}
                        disabled={!isComposerExpanded}
                        onClick={() => onSideSelect('tark')}
                    >
                        T
                    </button>
                    <button
                        type="button"
                        className="podium-fab__mini-btn podium-fab__mini-btn--vitark"
                        aria-label="Post as Vitark"
                        tabIndex={isComposerExpanded ? 0 : -1}
                        disabled={!isComposerExpanded}
                        onClick={() => onSideSelect('vitark')}
                    >
                        V
                    </button>
                    <button
                        type="button"
                        className="podium-fab__dismiss"
                        aria-label="Close"
                        tabIndex={isComposerExpanded ? 0 : -1}
                        disabled={!isComposerExpanded}
                        onClick={onCollapse}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}
