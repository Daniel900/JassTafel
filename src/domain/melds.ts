import { type Card, type Rank, type Suit, RANKS, RANK_NAMES, cardLabel, rankIndex } from './cards';

export type MeldType =
  | 'dreiblatt'
  | 'vierblatt'
  | 'fuenfblatt'
  | 'vierling'
  | 'vierNell'
  | 'vierBuur'
  | 'steck';

export interface Meld {
  id: string;
  type: MeldType;
  /** Highest card of a sequence (Dreiblatt/Vierblatt/Fünfblatt). */
  highCard?: Card;
  /** Rank of a Vierling (four cards of one type). */
  rank?: Rank;
}

export interface MeldDefinition {
  type: MeldType;
  name: string;
  points: number;
  description: string;
  /** What the user has to select additionally. */
  needs: 'highCard' | 'rank' | 'nothing';
  /** Number of cards of a sequence (only for sequences). */
  length?: number;
  /** Order among melds with the same points (higher wins). */
  priority: number;
}

export const MELD_DEFINITIONS: Record<MeldType, MeldDefinition> = {
  dreiblatt: {
    type: 'dreiblatt',
    name: 'Dreiblatt',
    points: 20,
    description: '3 aufeinanderfolgende Karten derselben Farbe',
    needs: 'highCard',
    length: 3,
    priority: 0,
  },
  vierblatt: {
    type: 'vierblatt',
    name: 'Vierblatt',
    points: 50,
    description: '4 aufeinanderfolgende Karten derselben Farbe',
    needs: 'highCard',
    length: 4,
    priority: 0,
  },
  fuenfblatt: {
    type: 'fuenfblatt',
    name: 'Fünfblatt',
    points: 100,
    description: '5 aufeinanderfolgende Karten derselben Farbe',
    needs: 'highCard',
    length: 5,
    priority: 1,
  },
  vierling: {
    type: 'vierling',
    name: 'Vierling',
    points: 100,
    description: '4 gleiche Karten (10, Dame, König oder Ass)',
    needs: 'rank',
    priority: 0,
  },
  vierNell: {
    type: 'vierNell',
    name: 'Vier Nell',
    points: 150,
    description: 'Alle vier Neuner',
    needs: 'nothing',
    priority: 0,
  },
  vierBuur: {
    type: 'vierBuur',
    name: 'Vier Buur',
    points: 200,
    description: 'Alle vier Bauern',
    needs: 'nothing',
    priority: 0,
  },
  steck: {
    type: 'steck',
    name: 'Steck',
    points: 20,
    description: 'Dame und König im Trumpf – zählt immer',
    needs: 'nothing',
    priority: 0,
  },
};

export const MELD_ORDER: MeldType[] = [
  'dreiblatt',
  'vierblatt',
  'fuenfblatt',
  'vierling',
  'vierNell',
  'vierBuur',
  'steck',
];

/** Ranks that can form a Vierling (9 = Vier Nell, Bauer = Vier Buur). */
export const VIERLING_RANKS: Rank[] = ['10', 'D', 'K', 'A'];

/** Ranks that can be the highest card of a sequence of the given length. */
export function possibleHighRanks(length: number): Rank[] {
  return RANKS.slice(length - 1);
}

export const meldPoints = (meld: Meld): number => MELD_DEFINITIONS[meld.type].points;

/** Steck always counts and does not compete with the other melds. */
export const isCompetingMeld = (meld: Meld): boolean => meld.type !== 'steck';

export function isValidMeld(meld: Meld): boolean {
  const def = MELD_DEFINITIONS[meld.type];
  if (!def) return false;
  if (def.needs === 'highCard') {
    return !!meld.highCard && possibleHighRanks(def.length!).includes(meld.highCard.rank);
  }
  if (def.needs === 'rank') {
    return !!meld.rank && VIERLING_RANKS.includes(meld.rank);
  }
  return true;
}

function meldRankIndex(meld: Meld): number {
  if (meld.highCard) return rankIndex(meld.highCard.rank);
  if (meld.rank) return rankIndex(meld.rank);
  return 0;
}

/**
 * Compares two melds. Positive → a is higher, negative → b is higher, 0 → equal.
 * Order: points, then type priority (Fünfblatt > Vierling), then highest card,
 * then a sequence in the trump suit beats one in another suit.
 */
export function compareMelds(a: Meld, b: Meld, trump: Suit | null): number {
  const defA = MELD_DEFINITIONS[a.type];
  const defB = MELD_DEFINITIONS[b.type];
  if (defA.points !== defB.points) return defA.points - defB.points;
  if (defA.priority !== defB.priority) return defA.priority - defB.priority;
  const rankDiff = meldRankIndex(a) - meldRankIndex(b);
  if (rankDiff !== 0) return rankDiff;
  if (trump) {
    const aTrump = a.highCard?.suit === trump ? 1 : 0;
    const bTrump = b.highCard?.suit === trump ? 1 : 0;
    return aTrump - bTrump;
  }
  return 0;
}

/** Highest competing meld of a team, or null. */
export function highestMeld(melds: Meld[], trump: Suit | null): Meld | null {
  return melds
    .filter(isCompetingMeld)
    .reduce<Meld | null>((best, m) => (best === null || compareMelds(m, best, trump) > 0 ? m : best), null);
}

export type MeldWinner = 0 | 1 | null;

/**
 * Determines which team's melds are counted (the team with the highest single meld).
 * Returns null if nobody melded or the highest melds are exactly equal.
 */
export function meldWinner(melds: [Meld[], Meld[]], trump: Suit | null): MeldWinner {
  const best0 = highestMeld(melds[0], trump);
  const best1 = highestMeld(melds[1], trump);
  if (!best0 && !best1) return null;
  if (!best1) return 0;
  if (!best0) return 1;
  const cmp = compareMelds(best0, best1, trump);
  if (cmp > 0) return 0;
  if (cmp < 0) return 1;
  return null;
}

export interface MeldResult {
  /** Meld points counted per team. */
  points: [number, number];
  /** Team whose competing melds won (null = none). */
  winner: MeldWinner;
  /** True if both teams had equally high melds that could not be decided. */
  tie: boolean;
}

/**
 * Calculates the meld points of a round.
 * - Only the team with the highest single meld gets its (competing) melds counted,
 *   and only if that team made at least one card point.
 * - Steck always counts, also if the team made no points.
 */
export function evaluateMelds(
  melds: [Meld[], Meld[]],
  cardPointsByTeam: [number, number],
  trump: Suit | null,
): MeldResult {
  const winner = meldWinner(melds, trump);
  const hasCompeting = melds.some((list) => list.some(isCompetingMeld));
  const points: [number, number] = [0, 0];
  for (const team of [0, 1] as const) {
    for (const meld of melds[team]) {
      if (!isCompetingMeld(meld)) {
        points[team] += meldPoints(meld);
      } else if (winner === team && cardPointsByTeam[team] > 0) {
        points[team] += meldPoints(meld);
      }
    }
  }
  return { points, winner, tie: hasCompeting && winner === null };
}

export function describeMeld(meld: Meld): string {
  const def = MELD_DEFINITIONS[meld.type];
  if (meld.highCard) return `${def.name} bis ${cardLabel(meld.highCard)}`;
  if (meld.rank) return `${def.name} ${RANK_NAMES[meld.rank]}`;
  return def.name;
}
