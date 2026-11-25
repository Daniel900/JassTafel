import { useEffect, useState } from 'react';

/** Small offsets (in px) the whole board cycles through to protect OLED screens from burn-in. */
export const PIXEL_SHIFT_STEPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [2, 1],
  [3, -1],
  [1, -3],
  [-2, -2],
  [-3, 1],
  [-1, 3],
  [2, 2],
];

export const PIXEL_SHIFT_INTERVAL_MS = 60_000;

/** The outline mode runs longest with the brightest lines, so it moves twice as far (up to 6 px). */
export const IDLE_SHIFT_FACTOR = 2;

/** Returns the current [x, y] offset; moves to the next step every `intervalMs`. */
export function usePixelShift(intervalMs = PIXEL_SHIFT_INTERVAL_MS): readonly [number, number] {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % PIXEL_SHIFT_STEPS.length), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return PIXEL_SHIFT_STEPS[step];
}
