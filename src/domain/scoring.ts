/** Total card points of one round (sum of all 32 cards with a trump suit). */
export const ROUND_TOTAL = 157;
/** Points a team gets if it takes all card points (a "Match"). */
export const MATCH_POINTS = 257;

export interface RoundPoints {
  /** Card points of the team that entered the value. */
  own: number;
  /** Card points of the other team (calculated automatically). */
  other: number;
}

export type PointsValidation = { ok: true } | { ok: false; error: string };

export function validateEnteredPoints(value: number): PointsValidation {
  if (!Number.isInteger(value) || value < 0) {
    return { ok: false, error: 'Bitte eine ganze Zahl ≥ 0 eingeben.' };
  }
  if (value > ROUND_TOTAL && value !== MATCH_POINTS) {
    return { ok: false, error: `Erlaubt sind 0–${ROUND_TOTAL} oder ${MATCH_POINTS}.` };
  }
  return { ok: true };
}

/**
 * Splits the round points between the two teams.
 * 257 entered (Match preset) → own team gets 257, other team 0.
 * Any other value 0–157 → the other team gets the rest of 157
 * (e.g. 157 / 0 is possible if the other team only won tricks without points).
 */
export function splitRoundPoints(entered: number): RoundPoints {
  const validation = validateEnteredPoints(entered);
  if (!validation.ok) throw new Error(validation.error);
  if (entered === MATCH_POINTS) {
    return { own: MATCH_POINTS, other: 0 };
  }
  return { own: entered, other: ROUND_TOTAL - entered };
}
