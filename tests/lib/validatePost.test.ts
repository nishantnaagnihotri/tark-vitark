import { describe, it, expect } from 'vitest';
import { validatePost } from '../../src/lib/validatePost';

describe('validatePost', () => {
  it('returns whitespace-only for an empty string', () => {
    expect(validatePost('')).toEqual({
      valid: false,
      error: 'whitespace-only',
      message: 'Text cannot be empty or whitespace only.',
    });
  });

  it('returns whitespace-only for a spaces-only string', () => {
    expect(validatePost('   ')).toEqual({
      valid: false,
      error: 'whitespace-only',
      message: 'Text cannot be empty or whitespace only.',
    });
  });

  it('returns too-short for trimmed length below 10', () => {
    expect(validatePost('abc')).toEqual({
      valid: false,
      error: 'too-short',
      message: 'Text must be between 10 and 300 characters.',
    });

    expect(validatePost('a'.repeat(9))).toEqual({
      valid: false,
      error: 'too-short',
      message: 'Text must be between 10 and 300 characters.',
    });
  });

  it('returns valid true at the 10-character minimum boundary', () => {
    expect(validatePost('a'.repeat(10))).toEqual({ valid: true });
  });

  it('returns valid true at the 300-character maximum boundary', () => {
    expect(validatePost('a'.repeat(300))).toEqual({ valid: true });
  });

  it('returns too-long for trimmed length above 300', () => {
    expect(validatePost('a'.repeat(301))).toEqual({
      valid: false,
      error: 'too-long',
      message: 'Text must be between 10 and 300 characters.',
    });
  });

  it('trims leading and trailing whitespace for validation', () => {
    expect(validatePost('  hello world  ')).toEqual({ valid: true });
  });

  it('accepts internal newlines when trimmed length is in range', () => {
    expect(validatePost('hello\nworld!!')).toEqual({ valid: true });
  });
});
