import { type FormEvent, useEffect, useId, useState } from 'react';
import {
    MAX_DEBATE_TOPIC_LENGTH,
    validateDebateTopic,
} from '../lib/validateDebateTopic';
import '../styles/components/debate-topic-form.css';

interface DebateTopicFormBaseProps {
    initialTopic?: string;
    onSubmitTopic: (canonicalTopic: string) => void;
}

interface CreateDebateTopicFormProps extends DebateTopicFormBaseProps {
    mode: 'create';
}

interface ReplaceDebateTopicFormProps extends DebateTopicFormBaseProps {
    mode: 'replace';
    onCancelReplace: () => void;
}

export type DebateTopicFormProps = CreateDebateTopicFormProps | ReplaceDebateTopicFormProps;

const TOPIC_INPUT_PLACEHOLDER = 'What is the Tark Vitark about?';
const TOPIC_TOO_LONG_MESSAGE = `Topic must be ${MAX_DEBATE_TOPIC_LENGTH} characters or fewer.`;

export function DebateTopicForm(props: DebateTopicFormProps) {
    const [topicDraft, setTopicDraft] = useState(props.initialTopic ?? '');
    const topicValidation = validateDebateTopic(topicDraft);
    const topicCounterId = useId();
    const topicErrorId = useId();
    const replaceWarningId = useId();

    useEffect(() => {
        setTopicDraft(props.initialTopic ?? '');
    }, [props.initialTopic]);

    const topicDescriptionIds = [topicCounterId];
    if (topicValidation.isTooLong) {
        topicDescriptionIds.push(topicErrorId);
    }
    if (props.mode === 'replace') {
        topicDescriptionIds.push(replaceWarningId);
    }

    function handleTopicSubmission(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!topicValidation.isSubmitEnabled) {
            return;
        }

        props.onSubmitTopic(topicValidation.canonicalTopic);
    }

    const startActionClassName = [
        'debate-topic-form__start-action',
        topicValidation.isTooLong ? 'debate-topic-form__start-action--after-too-long' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section
            className={`debate-topic-form${props.mode === 'replace' ? ' debate-topic-form--replace' : ''}`}
            aria-label={props.mode === 'replace' ? 'Replace debate topic' : 'Create debate topic'}
        >
            <div className="debate-topic-form__capture">
                <div className="debate-topic-form__lettermark" aria-hidden="true">
                    TV
                </div>
                <form className="debate-topic-form__topic-capture" onSubmit={handleTopicSubmission}>
                    <label
                        className={`debate-topic-form__topic-field-shell${
                            topicValidation.isTooLong
                                ? ' debate-topic-form__topic-field-shell--too-long'
                                : ''
                        }`}
                    >
                        <span className="debate-topic-form__screen-reader-label">Debate topic</span>
                        <input
                            value={topicDraft}
                            onChange={(event) => setTopicDraft(event.target.value)}
                            className="debate-topic-form__topic-field"
                            placeholder={TOPIC_INPUT_PLACEHOLDER}
                            aria-describedby={topicDescriptionIds.join(' ')}
                            aria-invalid={topicValidation.isTooLong}
                        />
                    </label>
                    <p
                        id={topicCounterId}
                        className={`debate-topic-form__topic-counter${
                            topicValidation.isTooLong ? ' debate-topic-form__topic-counter--too-long' : ''
                        }`}
                    >
                        {topicValidation.canonicalLength} / {MAX_DEBATE_TOPIC_LENGTH}
                    </p>
                    {props.mode === 'replace' ? (
                        <p id={replaceWarningId} className="debate-topic-form__replace-warning">
                            <span>⚠&nbsp;&nbsp;You already have an active debate.</span>
                            <span>Starting a new one will replace it.</span>
                        </p>
                    ) : null}
                    {topicValidation.isTooLong ? (
                        <p id={topicErrorId} className="debate-topic-form__topic-error" role="alert">
                            {TOPIC_TOO_LONG_MESSAGE}
                        </p>
                    ) : null}
                    <button
                        type="submit"
                        className={startActionClassName}
                        aria-label="Start debate"
                        disabled={!topicValidation.isSubmitEnabled}
                    >
                        <span className="debate-topic-form__start-action-label">Start</span>
                    </button>
                    {props.mode === 'replace' ? (
                        <button
                            type="button"
                            className="debate-topic-form__cancel-action"
                            aria-label="Cancel debate replacement"
                            onClick={props.onCancelReplace}
                        >
                            Cancel
                        </button>
                    ) : null}
                </form>
            </div>
        </section>
    );
}
