export const MIN_DEBATE_TOPIC_LENGTH = 10;
export const MAX_DEBATE_TOPIC_LENGTH = 120;

export type DebateTopicState = 'empty' | 'too-short' | 'valid' | 'too-long';

export interface DebateTopicValidation {
    canonicalTopic: string;
    canonicalLength: number;
    state: DebateTopicState;
    isSubmitEnabled: boolean;
    isTooShort: boolean;
    isTooLong: boolean;
}

export function validateDebateTopic(topicDraft: string): DebateTopicValidation {
    const canonicalTopic = topicDraft.trim();
    const canonicalLength = canonicalTopic.length;

    if (canonicalLength === 0) {
        return {
            canonicalTopic,
            canonicalLength,
            state: 'empty',
            isSubmitEnabled: false,
            isTooShort: false,
            isTooLong: false,
        };
    }

    if (canonicalLength < MIN_DEBATE_TOPIC_LENGTH) {
        return {
            canonicalTopic,
            canonicalLength,
            state: 'too-short',
            isSubmitEnabled: false,
            isTooShort: true,
            isTooLong: false,
        };
    }

    if (canonicalLength > MAX_DEBATE_TOPIC_LENGTH) {
        return {
            canonicalTopic,
            canonicalLength,
            state: 'too-long',
            isSubmitEnabled: false,
            isTooShort: false,
            isTooLong: true,
        };
    }

    return {
        canonicalTopic,
        canonicalLength,
        state: 'valid',
        isSubmitEnabled: true,
        isTooShort: false,
        isTooLong: false,
    };
}
