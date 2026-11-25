/** Skat deck: four suits, ranks 7 to Ass, no jokers (32 cards). */
export const SUITS = ['kreuz', 'pik', 'herz', 'karo'] as const;
export type Suit = (typeof SUITS)[number];

/** Ranks in natural sequence order (used for Dreiblatt, Vierblatt, ...). */
export const RANKS = ['7', '8', '9', '10', 'B', 'D', 'K', 'A'] as const;
export type Rank = (typeof RANKS)[number];

export interface Card {
  suit: Suit;
  rank: Rank;
}

export const SUIT_NAMES: Record<Suit, string> = {
  kreuz: 'Kreuz',
  pik: 'Pik',
  herz: 'Herz',
  karo: 'Karo',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  kreuz: '♣',
  pik: '♠',
  herz: '♥',
  karo: '♦',
};

export const RANK_NAMES: Record<Rank, string> = {
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  B: 'Bauer',
  D: 'Dame',
  K: 'König',
  A: 'Ass',
};

export const isRedSuit = (suit: Suit): boolean => suit === 'herz' || suit === 'karo';

/** Position of a rank in the sequence order (7 = 0 … Ass = 7). */
export const rankIndex = (rank: Rank): number => RANKS.indexOf(rank);

export const cardLabel = (card: Card): string => `${SUIT_NAMES[card.suit]} ${RANK_NAMES[card.rank]}`;

/** Card points of a single card, depending on whether its suit is trump. */
export function cardPoints(card: Card, trump: Suit | null): number {
  const isTrump = trump !== null && card.suit === trump;
  switch (card.rank) {
    case '7':
    case '8':
      return 0;
    case '9':
      return isTrump ? 14 : 0;
    case '10':
      return 10;
    case 'B':
      return isTrump ? 20 : 2;
    case 'D':
      return 3;
    case 'K':
      return 4;
    case 'A':
      return 11;
  }
}

/** Bonus for the last trick – makes the round total 152 + 5 = 157. */
export const LAST_TRICK_BONUS = 5;

export const fullDeck = (): Card[] => SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));
