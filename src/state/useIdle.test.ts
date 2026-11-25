import { act, renderHook } from '@testing-library/react';
import { IDLE_TIMEOUT_MS, useIdle } from './useIdle';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useIdle', () => {
  it('becomes idle after 30 seconds without a tap', () => {
    expect(IDLE_TIMEOUT_MS).toBe(30_000);
    const { result } = renderHook(() => useIdle());
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(29_999));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it('wakes up on a tap and restarts the timer', () => {
    const { result } = renderHook(() => useIdle());
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current).toBe(true);
    act(() => {
      document.dispatchEvent(new Event('pointerdown'));
    });
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(20_000));
    act(() => {
      document.dispatchEvent(new Event('pointerdown'));
    });
    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current).toBe(false); // timer was reset by the second tap
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(true);
  });

  it('never becomes idle while paused (dialog open)', () => {
    const { result, rerender } = renderHook(({ paused }) => useIdle(undefined, paused), {
      initialProps: { paused: false },
    });
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current).toBe(true);
    rerender({ paused: true });
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(120_000));
    expect(result.current).toBe(false);
  });
});
