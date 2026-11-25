import { splitRoundPoints, validateEnteredPoints } from './scoring';

describe('scoring', () => {
  it('calculates the points of the other team', () => {
    expect(splitRoundPoints(100)).toEqual({ own: 100, other: 57 });
    expect(splitRoundPoints(1)).toEqual({ own: 1, other: 156 });
  });

  it('only turns 257 (Match preset) into a Match', () => {
    expect(splitRoundPoints(257)).toEqual({ own: 257, other: 0 });
  });

  it('keeps 157 / 0 as normal points (other team won only tricks without points)', () => {
    expect(splitRoundPoints(157)).toEqual({ own: 157, other: 0 });
    expect(splitRoundPoints(0)).toEqual({ own: 0, other: 157 });
  });

  it('rejects invalid values', () => {
    expect(validateEnteredPoints(158).ok).toBe(false);
    expect(validateEnteredPoints(-1).ok).toBe(false);
    expect(validateEnteredPoints(1.5).ok).toBe(false);
    expect(validateEnteredPoints(256).ok).toBe(false);
    expect(validateEnteredPoints(257).ok).toBe(true);
    expect(() => splitRoundPoints(200)).toThrow();
  });
});
