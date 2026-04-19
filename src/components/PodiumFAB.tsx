import { useEffect, useRef, useState } from 'react';
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
    const shouldFocusExpandedControlRef = useRef(false);
    const shouldUnmountComposerGroupRef = useRef(false);
    const expandFrameRef = useRef<number | null>(null);
    const [isComposerVisible, setIsComposerVisible] = useState(isExpanded);
    const [isComposerExpanded, setIsComposerExpanded] = useState(isExpanded);

    useEffect(() => {
        const wasExpanded = wasExpandedRef.current;

        if (isExpanded) {
            shouldUnmountComposerGroupRef.current = false;
            setIsComposerVisible(true);

            if (!wasExpanded) {
                setIsComposerExpanded(false);

                if (expandFrameRef.current !== null) {
                    window.cancelAnimationFrame(expandFrameRef.current);
                }

                shouldFocusExpandedControlRef.current = true;
                expandFrameRef.current = window.requestAnimationFrame(() => {
                    setIsComposerExpanded(true);
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

            shouldFocusExpandedControlRef.current = false;
            setIsComposerExpanded(false);

            if (isComposerVisible) {
                shouldUnmountComposerGroupRef.current = true;
            }
        }

        wasExpandedRef.current = isExpanded;
    }, [isExpanded, isComposerVisible]);

    useEffect(
        () => () => {
            if (expandFrameRef.current !== null) {
                window.cancelAnimationFrame(expandFrameRef.current);
            }
        },
        []
    );

    useEffect(() => {
        if (isComposerExpanded && shouldFocusExpandedControlRef.current) {
            tarkComposerButtonRef.current?.focus();
            shouldFocusExpandedControlRef.current = false;
        }
    }, [isComposerExpanded]);

    const handleComposerCollapseTransitionEnd = () => {
        if (!isComposerExpanded && shouldUnmountComposerGroupRef.current) {
            setIsComposerVisible(false);
            shouldUnmountComposerGroupRef.current = false;
        }
    };

    const shouldRenderComposerGroup = isComposerVisible || isExpanded;

    return (
        <>
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
                    className={`podium-fab${isComposerExpanded ? ' podium-fab--expanded' : ''}`}
                    role="group"
                    aria-label="Post composer options"
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
                        onTransitionEnd={handleComposerCollapseTransitionEnd}
                        onClick={onCollapse}
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}
