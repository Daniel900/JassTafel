import { LAST_TRICK_BONUS, type Suit, cardLabel, cardPoints, fullDeck, isRedSuit, rankIndex } from './cards';

const total = (trump: Suit | null) => fullDeck().reduce((sum, c) => sum + cardPoints(c, trump), 0);

describe('cards', () => {
  it('has a Skat deck with 32 cards from 7 to Ass', () => {
    const deck = fullDeck();
    expect(deck).toHaveLength(32);
    expect(new Set(deck.map((c) => c.rank))).toEqual(new Set(['7', '8', '9', '10', 'B', 'D', 'K', 'A']));
  });

  it('counts non-trump cards correctly', () => {
    const p = (rank: '7' | '8' | '9' | '10' | 'B' | 'D' | 'K' | 'A') => cardPoints({ suit: 'herz', rank }, 'pik');
    expect([p('7'), p('8'), p('9'), p('10'), p('B'), p('D'), p('K'), p('A')]).toEqual([0, 0, 0, 10, 2, 3, 4, 11]);
  });

  it('counts trump 9 as 14 and trump Bauer as 20', () => {
    expect(cardPoints({ suit: 'pik', rank: '9' }, 'pik')).toBe(14);
    expect(cardPoints({ suit: 'pik', rank: 'B' }, 'pik')).toBe(20);
  });

  it.each(['kreuz', 'pik', 'herz', 'karo'] as const)('sums up to 157 (incl. last trick) with trump %s', (trump) => {
    expect(total(trump)).toBe(152);
    expect(total(trump) + LAST_TRICK_BONUS).toBe(157);
  });

  it('orders ranks for sequences', () => {
    expect(rankIndex('7')).toBeLessThan(rankIndex('10'));
    expect(rankIndex('10')).toBeLessThan(rankIndex('B'));
    expect(rankIndex('K')).toBeLessThan(rankIndex('A'));
  });

  it('knows red suits and labels', () => {
    expect(isRedSuit('herz')).toBe(true);
    expect(isRedSuit('kreuz')).toBe(false);
    expect(cardLabel({ suit: 'karo', rank: 'D' })).toBe('Karo Dame');
  });
});
