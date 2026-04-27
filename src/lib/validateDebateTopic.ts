export const TOPIC_MIN_LENGTH = 10;
export const TOPIC_MAX_LENGTH = 120;

export type DebateTopicValidationState = 'too-short' | 'valid' | 'too-long';

export interface DebateTopicValidationResult {
    canonicalTopic: string;
    canonicalLength: number;
    state: DebateTopicValidationState;
}

export function validateDebateTopic(topicDraft: string): DebateTopicValidationResult {
    const canonicalTopic = topicDraft.trim();
    const canonicalLength = canonicalTopic.length;

    if (canonicalLength < TOPIC_MIN_LENGTH) {
        return {
            canonicalTopic,
            canonicalLength,
            state: 'too-short',
        };
    }

    if (canonicalLength > TOPIC_MAX_LENGTH) {
        return {
            canonicalTopic,
            canonicalLength,
            state: 'too-long',
        };
    }

    return {
        canonicalTopic,
        canonicalLength,
        state: 'valid',
    };
}
