import { splitRoundPoints, validateEnteredPoints } from './scoring';

describe('scoring', () => {
  it('calculates the points of the other team', () => {
    expect(splitRoundPoints(100)).toEqual({ own: 100, other: 57 });
    expect(splitRoundPoints(1)).toEqual({ own: 1, other: 156 });
  });

  it('turns 157 and 257 into a Match with 257 points', () => {
    expect(splitRoundPoints(157)).toEqual({ own: 257, other: 0 });
    expect(splitRoundPoints(257)).toEqual({ own: 257, other: 0 });
  });

  it('gives the other team a Match if 0 is entered', () => {
    expect(splitRoundPoints(0)).toEqual({ own: 0, other: 257 });
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
