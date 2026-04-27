import { describe, expect, it } from 'vitest';
import {
    MAX_DEBATE_TOPIC_LENGTH,
    MIN_DEBATE_TOPIC_LENGTH,
    validateDebateTopic,
} from '../../src/lib/validateDebateTopic';

describe('validateDebateTopic', () => {
    it('AC-29 keeps canonical topic trimmed and submission-ready when canonical length is valid', () => {
        const result = validateDebateTopic('   Is remote work better than office work?   ');

        expect(result).toEqual({
            canonicalTopic: 'Is remote work better than office work?',
            canonicalLength: 39,
            state: 'valid',
            isSubmitEnabled: true,
            isTooLong: false,
            isTooShort: false,
        });
    });

    it('AC-29 treats whitespace-only entry as empty canonical topic', () => {
        const result = validateDebateTopic('      ');

        expect(result).toEqual({
            canonicalTopic: '',
            canonicalLength: 0,
            state: 'empty',
            isSubmitEnabled: false,
            isTooLong: false,
            isTooShort: false,
        });
    });

    it('AC-31 reports too-short state when trimmed canonical length is below minimum', () => {
        const topicBelowMinimum = `   ${'a'.repeat(MIN_DEBATE_TOPIC_LENGTH - 1)}   `;
        const result = validateDebateTopic(topicBelowMinimum);

        expect(result.canonicalLength).toBe(MIN_DEBATE_TOPIC_LENGTH - 1);
        expect(result.state).toBe('too-short');
        expect(result.isTooShort).toBe(true);
        expect(result.isTooLong).toBe(false);
        expect(result.isSubmitEnabled).toBe(false);
    });

    it('AC-31 reports valid state at minimum and maximum canonical boundaries', () => {
        const atMinimum = validateDebateTopic('a'.repeat(MIN_DEBATE_TOPIC_LENGTH));
        const atMaximum = validateDebateTopic('a'.repeat(MAX_DEBATE_TOPIC_LENGTH));

        expect(atMinimum.state).toBe('valid');
        expect(atMinimum.isSubmitEnabled).toBe(true);
        expect(atMaximum.state).toBe('valid');
        expect(atMaximum.isSubmitEnabled).toBe(true);
    });

    it('AC-31 reports too-long state when canonical topic exceeds maximum', () => {
        const tooLongTopic = 'a'.repeat(MAX_DEBATE_TOPIC_LENGTH + 1);
        const result = validateDebateTopic(tooLongTopic);

        expect(result.canonicalLength).toBe(MAX_DEBATE_TOPIC_LENGTH + 1);
        expect(result.state).toBe('too-long');
        expect(result.isTooLong).toBe(true);
        expect(result.isTooShort).toBe(false);
        expect(result.isSubmitEnabled).toBe(false);
    });
});
