import type { FormEvent } from 'react';
import { useId, useState } from 'react';
import {
    TOPIC_MAX_LENGTH,
    validateDebateTopic,
} from '../lib/validateDebateTopic';
import '../styles/components/debate-topic-form.css';

interface DebateTopicFormSharedProps {
    initialTopic?: string;
    onStartDebate: (canonicalTopic: string) => void | Promise<void>;
}

interface DebateTopicCreateFormProps extends DebateTopicFormSharedProps {
    mode: 'create';
}

interface DebateTopicReplaceFormProps extends DebateTopicFormSharedProps {
    mode: 'replace';
    onCancelReplace: () => void;
}

export type DebateTopicFormProps = DebateTopicCreateFormProps | DebateTopicReplaceFormProps;

const TOO_LONG_TOPIC_MESSAGE = `Topic must be ${TOPIC_MAX_LENGTH} characters or fewer.`;
const REPLACE_WARNING_TITLE = '⚠  You already have an active debate.';
const REPLACE_WARNING_DETAIL = 'Starting a new one will replace it.';

export function DebateTopicForm(props: DebateTopicFormProps) {
    const [topicDraft, setTopicDraft] = useState(props.initialTopic ?? '');
    const [isStartingDebate, setIsStartingDebate] = useState(false);

    const topicCounterId = useId();
    const topicWarningId = useId();
    const topicErrorId = useId();

    const topicValidation = validateDebateTopic(topicDraft);
    const isTopicTooLong = topicValidation.state === 'too-long';
    const canStartDebate = topicValidation.state === 'valid' && !isStartingDebate;

    const startSpacingClassName = isTopicTooLong
        ? 'debate-topic-form__start--after-error'
        : props.mode === 'replace'
            ? 'debate-topic-form__start--after-warning'
            : 'debate-topic-form__start--default';

    const topicDescriptionIds = [
        topicCounterId,
        props.mode === 'replace' ? topicWarningId : null,
        isTopicTooLong ? topicErrorId : null,
    ]
        .filter(Boolean)
        .join(' ');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canStartDebate) {
            return;
        }

        setIsStartingDebate(true);

        try {
            await Promise.resolve(props.onStartDebate(topicValidation.canonicalTopic));
        } finally {
            setIsStartingDebate(false);
        }
    };

    return (
        <section
            className="debate-topic-form"
            aria-label={props.mode === 'replace' ? 'Replace debate topic form' : 'Create debate topic form'}
        >
            <div className="debate-topic-form__lettermark" aria-hidden="true">
                <span className="debate-topic-form__lettermark-text">TV</span>
            </div>

            <form className="debate-topic-form__form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="debate-topic"
                    className={`debate-topic-form__topic-input${isTopicTooLong ? ' debate-topic-form__topic-input--error' : ''}`}
                    value={topicDraft}
                    onChange={(event) => setTopicDraft(event.target.value)}
                    autoFocus
                    placeholder="What is the Tark Vitark about?"
                    aria-label="Debate topic"
                    aria-describedby={topicDescriptionIds}
                    aria-invalid={isTopicTooLong}
                />

                <p
                    id={topicCounterId}
                    className={`debate-topic-form__counter${isTopicTooLong ? ' debate-topic-form__counter--error' : ''}`}
                >
                    {topicValidation.canonicalLength} / {TOPIC_MAX_LENGTH}
                </p>

                {props.mode === 'replace' ? (
                    <p id={topicWarningId} className="debate-topic-form__replace-warning">
                        <span>{REPLACE_WARNING_TITLE}</span>
                        <span>{REPLACE_WARNING_DETAIL}</span>
                    </p>
                ) : null}

                {isTopicTooLong ? (
                    <p id={topicErrorId} className="debate-topic-form__error" role="alert">
                        {TOO_LONG_TOPIC_MESSAGE}
                    </p>
                ) : null}

                <button
                    type="submit"
                    className={`debate-topic-form__start ${startSpacingClassName}`}
                    disabled={!canStartDebate}
                    aria-label="Start"
                >
                    <span className="debate-topic-form__start-label">Start</span>
                </button>

                {props.mode === 'replace' ? (
                    <button
                        type="button"
                        className="debate-topic-form__cancel"
                        disabled={isStartingDebate}
                        onClick={() => {
                            if (isStartingDebate) {
                                return;
                            }
                            props.onCancelReplace();
                        }}
                    >
                        Cancel
                    </button>
                ) : null}
            </form>
        </section>
    );
}
