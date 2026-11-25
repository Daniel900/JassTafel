import type { Rank, Suit } from './cards';
import { type Meld, compareMelds, describeMeld, evaluateMelds, isValidMeld, meldWinner, possibleHighRanks } from './melds';

let n = 0;
const seq = (type: 'dreiblatt' | 'vierblatt' | 'fuenfblatt', suit: Suit, rank: Rank): Meld => ({
  id: String(n++),
  type,
  highCard: { suit, rank },
});
const vierling = (rank: Rank): Meld => ({ id: String(n++), type: 'vierling', rank });
const simple = (type: 'vierNell' | 'vierBuur' | 'steck'): Meld => ({ id: String(n++), type });

describe('melds', () => {
  it('validates the highest card of sequences', () => {
    expect(possibleHighRanks(3)).toEqual(['9', '10', 'B', 'D', 'K', 'A']);
    expect(isValidMeld(seq('dreiblatt', 'herz', '9'))).toBe(true);
    expect(isValidMeld(seq('dreiblatt', 'herz', '8'))).toBe(false);
    expect(isValidMeld(seq('fuenfblatt', 'herz', '10'))).toBe(false);
    expect(isValidMeld(vierling('9'))).toBe(false);
    expect(isValidMeld(vierling('A'))).toBe(true);
  });

  it('higher points win', () => {
    expect(compareMelds(seq('vierblatt', 'herz', '10'), seq('dreiblatt', 'pik', 'A'), null)).toBeGreaterThan(0);
    expect(compareMelds(simple('vierBuur'), simple('vierNell'), null)).toBeGreaterThan(0);
    expect(compareMelds(simple('vierNell'), seq('fuenfblatt', 'herz', 'A'), null)).toBeGreaterThan(0);
  });

  it('highest card wins for the same type', () => {
    expect(compareMelds(seq('dreiblatt', 'herz', 'A'), seq('dreiblatt', 'pik', 'K'), null)).toBeGreaterThan(0);
    expect(compareMelds(vierling('10'), vierling('A'), null)).toBeLessThan(0);
  });

  it('Fünfblatt wins over Vierling', () => {
    expect(compareMelds(seq('fuenfblatt', 'herz', 'B'), vierling('A'), null)).toBeGreaterThan(0);
  });

  it('trump breaks a tie between equal sequences', () => {
    expect(compareMelds(seq('dreiblatt', 'herz', 'A'), seq('dreiblatt', 'pik', 'A'), 'pik')).toBeLessThan(0);
    expect(compareMelds(seq('dreiblatt', 'herz', 'A'), seq('dreiblatt', 'pik', 'A'), null)).toBe(0);
  });

  it('determines the winning team by its highest single meld', () => {
    // Team 0: two Dreiblatt (40 total), team 1: one Vierblatt (50) → team 1 wins
    expect(meldWinner([[seq('dreiblatt', 'herz', 'A'), seq('dreiblatt', 'pik', 'A')], [seq('vierblatt', 'karo', '10')]], null, 0)).toBe(1);
    expect(meldWinner([[], []], null, 0)).toBeNull();
    expect(meldWinner([[simple('steck')], []], null, 0)).toBeNull();
  });

  it('gives exactly equal melds to the team with Trumpf', () => {
    const melds: [Meld[], Meld[]] = [[seq('dreiblatt', 'herz', 'A')], [seq('dreiblatt', 'pik', 'A')]];
    expect(meldWinner(melds, null, 1)).toBe(1);
    expect(meldWinner(melds, 'karo', 0)).toBe(0);
    // a sequence in the trump suit still beats the trump team
    expect(meldWinner(melds, 'pik', 0)).toBe(1);
    expect(evaluateMelds(melds, [80, 77], null, 1).points).toEqual([0, 20]);
  });

  it('counts all melds of the winning team only', () => {
    const result = evaluateMelds(
      [[seq('vierblatt', 'herz', 'A'), seq('dreiblatt', 'pik', 'K')], [seq('dreiblatt', 'karo', 'A')]],
      [80, 77],
      null,
    );
    expect(result.points).toEqual([70, 0]);
    expect(result.counted).toBe(0);
  });

  it('gives the melds to the other team if the highest team made no point', () => {
    const result = evaluateMelds(
      [[seq('vierblatt', 'herz', 'A')], [seq('dreiblatt', 'karo', 'A'), seq('dreiblatt', 'pik', 'K')]],
      [0, 157],
      null,
    );
    expect(result.points).toEqual([0, 40]);
    expect(result.counted).toBe(1);
  });

  it('counts no melds if the highest team made no point and the other has none', () => {
    const result = evaluateMelds([[seq('vierblatt', 'herz', 'A')], []], [0, 257], null);
    expect(result.points).toEqual([0, 0]);
    expect(result.counted).toBeNull();
  });

  it('always counts Steck, even without points and for the losing team', () => {
    const result = evaluateMelds([[simple('steck')], [seq('vierblatt', 'karo', 'A')]], [0, 257], 'kreuz');
    expect(result.points).toEqual([20, 50]);
  });

  it('describes melds', () => {
    expect(describeMeld(seq('dreiblatt', 'herz', 'A'))).toBe('Dreiblatt bis Herz Ass');
    expect(describeMeld(vierling('K'))).toBe('Vierling König');
    expect(describeMeld(simple('steck'))).toBe('Steck');
  });
});
