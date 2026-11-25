import { useEffect, useState } from 'react';

/** Time without interaction after which the board switches to the black outline mode. */
export const IDLE_TIMEOUT_MS = 30_000;

/**
 * Returns true once the user hasn't touched the screen for `timeoutMs`.
 * Any tap or key press resets the timer. While `paused` (e.g. a dialog is open)
 * the board never becomes idle.
 */
export function useIdle(timeoutMs = IDLE_TIMEOUT_MS, paused = false): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (paused) {
      setIdle(false);
      return;
    }
    let timer = window.setTimeout(() => setIdle(true), timeoutMs);
    const activity = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), timeoutMs);
    };
    document.addEventListener('pointerdown', activity);
    document.addEventListener('keydown', activity);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', activity);
      document.removeEventListener('keydown', activity);
    };
  }, [timeoutMs, paused]);

  return idle;
}
