import { describe, expect, it } from 'vitest';
import {
    TOPIC_MAX_LENGTH,
    TOPIC_MIN_LENGTH,
    validateDebateTopic,
} from '../../src/lib/validateDebateTopic';

describe('validateDebateTopic', () => {
    it('uses trimmed canonical length for the too-short state (AC-29, AC-30)', () => {
        expect(validateDebateTopic('         abcdefghi         ')).toEqual({
            canonicalTopic: 'abcdefghi',
            canonicalLength: TOPIC_MIN_LENGTH - 1,
            state: 'too-short',
        });
    });

    it('uses trimmed canonical length for the valid state (AC-29, AC-30, AC-31)', () => {
        expect(validateDebateTopic('         abcdefghij         ')).toEqual({
            canonicalTopic: 'abcdefghij',
            canonicalLength: TOPIC_MIN_LENGTH,
            state: 'valid',
        });
    });

    it('returns valid at the upper boundary of 120 characters (AC-30)', () => {
        const maxLengthTopic = 'a'.repeat(TOPIC_MAX_LENGTH);
        expect(validateDebateTopic(maxLengthTopic)).toEqual({
            canonicalTopic: maxLengthTopic,
            canonicalLength: TOPIC_MAX_LENGTH,
            state: 'valid',
        });
    });

    it('returns too-long for canonical lengths above 120 (AC-30)', () => {
        const tooLongTopic = 'a'.repeat(TOPIC_MAX_LENGTH + 1);
        expect(validateDebateTopic(tooLongTopic)).toEqual({
            canonicalTopic: tooLongTopic,
            canonicalLength: TOPIC_MAX_LENGTH + 1,
            state: 'too-long',
        });
    });
});
