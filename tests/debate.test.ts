import { describe, it, expect } from 'vitest';
import { DEBATE } from '../src/data/debate';
import type { Side } from '../src/data/debate';

describe('DEBATE data shape', () => {
  it('has a non-empty topic string', () => {
    expect(typeof DEBATE.topic).toBe('string');
    expect(DEBATE.topic.length).toBeGreaterThan(0);
  });

  it('has an arguments array with ~8 entries', () => {
    expect(Array.isArray(DEBATE.arguments)).toBe(true);
    expect(DEBATE.arguments.length).toBeGreaterThanOrEqual(6);
    expect(DEBATE.arguments.length).toBeLessThanOrEqual(12);
  });

  it('argument IDs are sequential starting from 1', () => {
    DEBATE.arguments.forEach((arg, index) => {
      expect(arg.id).toBe(index + 1);
    });
  });

  it('every argument has a valid Side value', () => {
    const validSides: Side[] = ['tark', 'vitark'];
    DEBATE.arguments.forEach((arg) => {
      expect(validSides).toContain(arg.side);
    });
  });

  it('every argument has a non-empty text string', () => {
    DEBATE.arguments.forEach((arg) => {
      expect(typeof arg.text).toBe('string');
      expect(arg.text.length).toBeGreaterThan(0);
    });
  });

  it('arguments contain a mix of tark and vitark sides', () => {
    const sides = DEBATE.arguments.map((arg) => arg.side);
    expect(sides).toContain('tark');
    expect(sides).toContain('vitark');
  });

  it('arguments alternate between tark and vitark sides', () => {
    DEBATE.arguments.forEach((arg, index) => {
      const expected: Side = index % 2 === 0 ? 'tark' : 'vitark';
      expect(arg.side).toBe(expected);
    });
  });
});
