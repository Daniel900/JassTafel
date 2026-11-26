import { type Rank, RANKS, RANK_NAMES, rankIndex } from './cards';

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
  /**
   * Highest card of a sequence (Dreiblatt/Vierblatt/Fünfblatt) or the card of a Vierling.
   * Only asked when both teams have the same kind of Weis as their highest one
   * (see `findMeldTie`). The suit is not needed – it never matters for the rules.
   */
  rank?: Rank;
}

export interface MeldDefinition {
  type: MeldType;
  name: string;
  points: number;
  description: string;
  /** What the user has to select additionally. */
  needs: 'highRank' | 'rank' | 'nothing';
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
    needs: 'highRank',
    length: 3,
    priority: 0,
  },
  vierblatt: {
    type: 'vierblatt',
    name: 'Vierblatt',
    points: 50,
    description: '4 aufeinanderfolgende Karten derselben Farbe',
    needs: 'highRank',
    length: 4,
    priority: 0,
  },
  fuenfblatt: {
    type: 'fuenfblatt',
    name: 'Fünfblatt',
    points: 100,
    description: '5 aufeinanderfolgende Karten derselben Farbe',
    needs: 'highRank',
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

/** Cards that can be chosen as "highest card" for a meld type (empty if none is needed). */
export function possibleRanks(type: MeldType): Rank[] {
  const def = MELD_DEFINITIONS[type];
  if (def.needs === 'highRank') return possibleHighRanks(def.length!);
  if (def.needs === 'rank') return VIERLING_RANKS;
  return [];
}

/** A meld is valid without a card; if a card is given it must fit the meld type. */
export function isValidMeld(meld: Meld): boolean {
  const def = MELD_DEFINITIONS[meld.type];
  if (!def) return false;
  if (meld.rank === undefined) return true;
  return possibleRanks(meld.type).includes(meld.rank);
}

function meldRankIndex(meld: Meld): number {
  return meld.rank ? rankIndex(meld.rank) : 0;
}

/**
 * Compares two melds. Positive → a is higher, negative → b is higher, 0 → equal.
 * Order: points, then type priority (Fünfblatt > Vierling), then highest card.
 * The suit never matters – equal melds are decided by the team with Trumpf.
 */
export function compareMelds(a: Meld, b: Meld): number {
  const defA = MELD_DEFINITIONS[a.type];
  const defB = MELD_DEFINITIONS[b.type];
  if (defA.points !== defB.points) return defA.points - defB.points;
  if (defA.priority !== defB.priority) return defA.priority - defB.priority;
  return meldRankIndex(a) - meldRankIndex(b);
}

/** Highest competing meld of a team, or null. */
export function highestMeld(melds: Meld[]): Meld | null {
  return melds
    .filter(isCompetingMeld)
    .reduce<Meld | null>((best, m) => (best === null || compareMelds(m, best) > 0 ? m : best), null);
}

export type MeldWinner = 0 | 1 | null;
type TeamIndex = 0 | 1;

export interface MeldTie {
  /** The kind of Weis both teams have as their highest one. */
  type: MeldType;
  /** Per team: true if its highest card for this kind has not been chosen yet. */
  missing: [boolean, boolean];
}

/**
 * The highest card only matters if both teams' highest Weis is of the same kind
 * (e.g. both a Dreiblatt). Returns that kind while a team still has to choose its
 * highest card, otherwise null.
 */
export function findMeldTie(melds: [Meld[], Meld[]]): MeldTie | null {
  const best0 = highestMeld(melds[0]);
  const best1 = highestMeld(melds[1]);
  if (!best0 || !best1 || best0.type !== best1.type) return null;
  const type = best0.type;
  if (possibleRanks(type).length === 0) return null;
  const missing: [boolean, boolean] = [
    !melds[0].some((m) => m.type === type && m.rank),
    !melds[1].some((m) => m.type === type && m.rank),
  ];
  return missing[0] || missing[1] ? { type, missing } : null;
}

/** The chosen highest card of a team for a meld kind (the highest if several were chosen). */
export function chosenRank(melds: Meld[], type: MeldType): Rank | undefined {
  return melds
    .filter((m) => m.type === type && m.rank)
    .map((m) => m.rank!)
    .sort((a, b) => rankIndex(b) - rankIndex(a))[0];
}

/**
 * Determines which team has the highest single meld.
 * Exactly equal melds are won by the team that has Trumpf (chose trump this round).
 * Returns null only if no team announced a competing meld.
 */
export function meldWinner(melds: [Meld[], Meld[]], trumpTeam: TeamIndex): MeldWinner {
  const best0 = highestMeld(melds[0]);
  const best1 = highestMeld(melds[1]);
  if (!best0 && !best1) return null;
  if (!best1) return 0;
  if (!best0) return 1;
  const cmp = compareMelds(best0, best1);
  if (cmp > 0) return 0;
  if (cmp < 0) return 1;
  return trumpTeam;
}

export interface MeldResult {
  /** Meld points counted per team. */
  points: [number, number];
  /** Team whose competing melds are counted (null = none). */
  counted: MeldWinner;
}

/**
 * Calculates the meld points of a round.
 * - The team with the highest single meld gets all its (competing) melds counted,
 *   if it made at least one card point.
 * - If that team made no card point, the other team gets its melds counted instead
 *   (if it has any and made at least one card point).
 * - Steck always counts, also if the team made no points.
 */
export function evaluateMelds(
  melds: [Meld[], Meld[]],
  cardPointsByTeam: [number, number],
  trumpTeam: TeamIndex = 0,
): MeldResult {
  const winner = meldWinner(melds, trumpTeam);
  let counted: MeldWinner = null;
  if (winner !== null) {
    const loser: TeamIndex = winner === 0 ? 1 : 0;
    if (cardPointsByTeam[winner] > 0) counted = winner;
    else if (cardPointsByTeam[loser] > 0 && melds[loser].some(isCompetingMeld)) counted = loser;
  }
  const points: [number, number] = [0, 0];
  for (const team of [0, 1] as const) {
    for (const meld of melds[team]) {
      if (!isCompetingMeld(meld) || counted === team) points[team] += meldPoints(meld);
    }
  }
  return { points, counted };
}

export function describeMeld(meld: Meld): string {
  const def = MELD_DEFINITIONS[meld.type];
  if (!meld.rank) return def.name;
  return def.needs === 'highRank' ? `${def.name} bis ${RANK_NAMES[meld.rank]}` : `${def.name} ${RANK_NAMES[meld.rank]}`;
}

/** The ranks of a sequence ending with the given highest rank, e.g. 3 / Ass → Dame, König, Ass. */
export function sequenceRanks(length: number, highRank: Rank): Rank[] {
  const end = rankIndex(highRank) + 1;
  return RANKS.slice(end - length, end);
}
