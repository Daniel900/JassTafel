import { createGame, gameReducer, previewRound, totalScore } from './game';
import type { Meld } from './melds';

const dreiblatt: Meld = { id: 'a', type: 'dreiblatt', highCard: { suit: 'herz', rank: 'A' } };
const steck: Meld = { id: 'b', type: 'steck' };

describe('game', () => {
  it('starts in round 1 with zero points', () => {
    const g = createGame();
    expect(g.round).toBe(1);
    expect(g.mode).toBe('schieber');
    expect(totalScore(g, 0)).toBe(0);
  });

  it('adds and removes melds', () => {
    let g = gameReducer(createGame(), { type: 'addMeld', team: 0, meld: dreiblatt });
    expect(g.pendingMelds[0]).toHaveLength(1);
    g = gameReducer(g, { type: 'removeMeld', team: 0, id: 'a' });
    expect(g.pendingMelds[0]).toHaveLength(0);
  });

  it('ignores invalid melds', () => {
    const g = gameReducer(createGame(), { type: 'addMeld', team: 0, meld: { id: 'x', type: 'dreiblatt' } });
    expect(g.pendingMelds[0]).toHaveLength(0);
  });

  it('confirms a round: other team auto-calculated, melds added, next round', () => {
    let g = gameReducer(createGame(), { type: 'addMeld', team: 1, meld: dreiblatt });
    g = gameReducer(g, { type: 'setTrump', trump: 'pik' });
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 90 });
    expect(g.round).toBe(2);
    expect(totalScore(g, 0)).toBe(90);
    expect(totalScore(g, 1)).toBe(67 + 20);
    expect(g.pendingMelds).toEqual([[], []]);
    expect(g.trump).toBeNull();
    expect(g.history[0]).toMatchObject({ number: 1, trump: 'pik', cardPoints: [90, 67], meldPoints: [0, 20] });
  });

  it('handles a Match entered by the second team', () => {
    let g = gameReducer(createGame(), { type: 'addMeld', team: 0, meld: steck });
    g = gameReducer(g, { type: 'confirmRound', team: 1, points: 157 });
    expect(totalScore(g, 1)).toBe(257);
    expect(totalScore(g, 0)).toBe(20);
  });

  it('previews without changing state', () => {
    const g = gameReducer(createGame(), { type: 'addMeld', team: 0, meld: dreiblatt });
    expect(previewRound(g, 1, 100)).toMatchObject({ cardPoints: [57, 100], melds: { points: [20, 0] } });
    expect(g.round).toBe(1);
  });

  it('undoes the last round and restores its melds', () => {
    let g = gameReducer(createGame(), { type: 'addMeld', team: 0, meld: dreiblatt });
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 100 });
    g = gameReducer(g, { type: 'undoRound' });
    expect(g.round).toBe(1);
    expect(g.history).toHaveLength(0);
    expect(g.pendingMelds[0]).toEqual([dreiblatt]);
    expect(gameReducer(g, { type: 'undoRound' })).toBe(g);
  });

  it('renames teams and keeps names on a new game', () => {
    let g = gameReducer(createGame(), { type: 'renameTeam', team: 1, name: '  Gäste ' });
    expect(g.teams[1].name).toBe('Gäste');
    g = gameReducer(g, { type: 'renameTeam', team: 0, name: '' });
    expect(g.teams[0].name).toBe('Team 1');
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 50 });
    g = gameReducer(g, { type: 'newGame' });
    expect(g.history).toHaveLength(0);
    expect(g.teams[1].name).toBe('Gäste');
  });
});
