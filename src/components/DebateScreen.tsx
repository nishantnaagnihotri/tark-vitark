import { useEffect, useRef, useState } from 'react';
import type { Argument, Debate, Side } from '../data/debate';
import {
    appendActiveDebateArgument,
    loadStoredActiveDebateRecord,
    replaceActiveDebate,
} from '../lib/activeDebateStorage';
import { ActiveDebateHeader } from './ActiveDebateHeader';
import { DebateTopicForm } from './DebateTopicForm';
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

function nextPublishedArgumentId(existingArguments: Argument[]): number {
    const highestArgumentId = existingArguments.reduce(
        (highestId, argument) => Math.max(highestId, argument.id),
        0,
    );

    return highestArgumentId + 1;
}

function hasActiveDebateTopic(topic: string): boolean {
    return topic.trim().length > 0;
}

const DEBATE_PERSISTENCE_ERROR_MESSAGE = 'Unable to start a new debate right now. Please try again.';
const ARGUMENT_PERSISTENCE_ERROR_MESSAGE = 'Unable to publish right now. Please try again.';

export function DebateScreen() {
    const [activeDebate, setActiveDebate] = useState<Debate>(loadInitialActiveDebate);
    const [selectedSide, setSelectedSide] = useState<Side>('tark');
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isReplaceFlowOpen, setIsReplaceFlowOpen] = useState(false);
    const [restoreOverflowFocusRequest, setRestoreOverflowFocusRequest] = useState(0);
    const [debateActionError, setDebateActionError] = useState<string | null>(null);
    const ignoreNextSheetCloseRef = useRef(false);
    const clearIgnoreCloseAnimationFrameRef = useRef<number | null>(null);
    const hasActiveDebate = hasActiveDebateTopic(activeDebate.topic);
    const isReplaceMode = hasActiveDebate && isReplaceFlowOpen;

    useEffect(() => {
        return () => {
            if (clearIgnoreCloseAnimationFrameRef.current !== null) {
                window.cancelAnimationFrame(clearIgnoreCloseAnimationFrameRef.current);
            }
        };
    }, []);

    function handlePublish(text: string, side: Side): string | null {
        const latestStoredDebate = loadStoredActiveDebateRecord().record.activeDebate;
        if (!latestStoredDebate) {
            return ARGUMENT_PERSISTENCE_ERROR_MESSAGE;
        }

        const publishedArgument: Argument = {
            id: nextPublishedArgumentId(latestStoredDebate.arguments),
            side,
            text,
        };
        const appendResult = appendActiveDebateArgument(publishedArgument);
        if (!appendResult.ok || !appendResult.record.activeDebate) {
            return ARGUMENT_PERSISTENCE_ERROR_MESSAGE;
        }

        setActiveDebate(appendResult.record.activeDebate);

        return null;
    }

    function handleStartDebate(topic: string): void {
        const replaceResult = replaceActiveDebate(topic);
        if (!replaceResult.ok) {
            setDebateActionError(DEBATE_PERSISTENCE_ERROR_MESSAGE);
            return;
        }

        setDebateActionError(null);
        setActiveDebate({
            topic,
            arguments: [],
        });
        setSelectedSide('tark');
        setIsFabExpanded(false);
        setIsSheetOpen(false);
        setIsReplaceFlowOpen(false);
        setRestoreOverflowFocusRequest(0);
        ignoreNextSheetCloseRef.current = false;
    }

    function handleStartReplaceFlow(): void {
        setDebateActionError(null);
        setIsReplaceFlowOpen(true);
        setRestoreOverflowFocusRequest(0);
        setIsFabExpanded(false);
        setIsSheetOpen(false);
        ignoreNextSheetCloseRef.current = false;
    }

    function handleCancelReplaceFlow(): void {
        setDebateActionError(null);
        setRestoreOverflowFocusRequest((existingRequest) => existingRequest + 1);
        setIsReplaceFlowOpen(false);
    }

    return (
        <main
            role="main"
            className={`debate-screen${isReplaceMode || !hasActiveDebate ? ' debate-screen--empty' : ''}`}
        >
            {hasActiveDebate && !isReplaceMode ? (
                <>
                    <ActiveDebateHeader
                        topic={activeDebate.topic}
                        onStartNewDebate={handleStartReplaceFlow}
                        restoreOverflowFocusRequest={restoreOverflowFocusRequest}
                    />
                    {debateActionError ? (
                        <p
                            className="debate-screen__action-error debate-screen__active-action-error"
                            role="alert"
                            aria-live="polite"
                        >
                            {debateActionError}
                        </p>
                    ) : null}
                    <LegendBar />
                    <Timeline arguments={activeDebate.arguments} />
                    <PodiumFAB
                        isExpanded={isFabExpanded}
                        onExpand={() => setIsFabExpanded(true)}
                        onSideSelect={(side) => {
                            setSelectedSide(side);
                            setIsFabExpanded(false);
                            ignoreNextSheetCloseRef.current = true;

                            if (clearIgnoreCloseAnimationFrameRef.current !== null) {
                                window.cancelAnimationFrame(
                                    clearIgnoreCloseAnimationFrameRef.current
                                );
                            }
                            clearIgnoreCloseAnimationFrameRef.current = window.requestAnimationFrame(
                                () => {
                                    ignoreNextSheetCloseRef.current = false;
                                    clearIgnoreCloseAnimationFrameRef.current = null;
                                }
                            );

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
                </>
            ) : (
                <section
                    className="debate-screen__empty-state"
                    aria-label={isReplaceMode ? 'Replace debate' : 'Create debate'}
                >
                    <ThemeToggle
                        variant="chrome"
                        className="debate-screen__empty-theme-toggle"
                    />
                    {debateActionError ? (
                        <p
                            className="debate-screen__action-error debate-screen__empty-action-error"
                            role="alert"
                            aria-live="polite"
                        >
                            {debateActionError}
                        </p>
                    ) : null}
                    {isReplaceMode ? (
                        <DebateTopicForm
                            mode="replace"
                            onStartDebate={handleStartDebate}
                            onCancelReplace={handleCancelReplaceFlow}
                        />
                    ) : (
                        <DebateTopicForm mode="create" onStartDebate={handleStartDebate} />
                    )}
                </section>
            )}
        </main>
    );
}
