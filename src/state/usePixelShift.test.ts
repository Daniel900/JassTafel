import { act, renderHook } from '@testing-library/react';
import { PIXEL_SHIFT_INTERVAL_MS, PIXEL_SHIFT_STEPS, usePixelShift } from './usePixelShift';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('usePixelShift', () => {
  it('keeps all offsets within 3 px', () => {
    for (const [x, y] of PIXEL_SHIFT_STEPS) {
      expect(Math.abs(x)).toBeLessThanOrEqual(3);
      expect(Math.abs(y)).toBeLessThanOrEqual(3);
    }
  });

  it('moves to the next offset every minute and cycles through all of them', () => {
    expect(PIXEL_SHIFT_INTERVAL_MS).toBe(60_000);
    const { result } = renderHook(() => usePixelShift());
    expect(result.current).toEqual([0, 0]);
    const seen = new Set<string>([result.current.join()]);
    for (let i = 1; i < PIXEL_SHIFT_STEPS.length; i++) {
      act(() => vi.advanceTimersByTime(PIXEL_SHIFT_INTERVAL_MS));
      seen.add(result.current.join());
    }
    expect(seen.size).toBe(PIXEL_SHIFT_STEPS.length);
    act(() => vi.advanceTimersByTime(PIXEL_SHIFT_INTERVAL_MS));
    expect(result.current).toEqual([0, 0]);
  });
});
