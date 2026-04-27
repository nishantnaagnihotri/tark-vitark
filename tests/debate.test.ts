import { describe, it, expect } from 'vitest';
import type { Side } from '../src/data/debate';
import { activeDebateFixture } from './fixtures/activeDebateFixture';

describe('active debate baseline data shape', () => {
  it('has a non-empty topic string', () => {
    expect(typeof activeDebateFixture.topic).toBe('string');
    expect(activeDebateFixture.topic.length).toBeGreaterThan(0);
  });

  it('has an arguments array with exactly 8 entries', () => {
    expect(Array.isArray(activeDebateFixture.arguments)).toBe(true);
    expect(activeDebateFixture.arguments.length).toBe(8);
  });

  it('argument IDs are sequential starting from 1', () => {
    activeDebateFixture.arguments.forEach((arg, index) => {
      expect(arg.id).toBe(index + 1);
    });
  });

  it('every argument has a valid Side value', () => {
    const validSides: Side[] = ['tark', 'vitark'];
    activeDebateFixture.arguments.forEach((arg) => {
      expect(validSides).toContain(arg.side);
    });
  });

  it('every argument has a non-empty text string', () => {
    activeDebateFixture.arguments.forEach((arg) => {
      expect(typeof arg.text).toBe('string');
      expect(arg.text.length).toBeGreaterThan(0);
    });
  });

  it('arguments contain a mix of tark and vitark sides', () => {
    const sides = activeDebateFixture.arguments.map((arg) => arg.side);
    expect(sides).toContain('tark');
    expect(sides).toContain('vitark');
  });

  it('arguments follow the Figma posting order', () => {
    const expectedOrder: Side[] = [
      'tark', 'vitark', 'tark', 'vitark',
      'tark', 'vitark', 'vitark', 'tark',
    ];
    const actualOrder = activeDebateFixture.arguments.map((arg) => arg.side);
    expect(actualOrder).toEqual(expectedOrder);
  });
});
