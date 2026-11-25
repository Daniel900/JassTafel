import { TARGET_SCORE, createGame, gameReducer, gameWinner, previewRound, totalScore } from './game';
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
    g = gameReducer(g, { type: 'confirmRound', team: 1, points: 257 });
    expect(totalScore(g, 1)).toBe(257);
    expect(totalScore(g, 0)).toBe(20);
  });

  it('alternates the team with Trumpf every round and restores it on undo', () => {
    let g = createGame();
    expect(g.trumpTeam).toBe(0);
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 80 });
    expect(g.trumpTeam).toBe(1);
    g = gameReducer(g, { type: 'setTrumpTeam', team: 0 });
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 80 });
    expect(g.history[1].trumpTeam).toBe(0);
    expect(g.trumpTeam).toBe(1);
    g = gameReducer(g, { type: 'undoRound' });
    expect(g.trumpTeam).toBe(0);
  });

  it('ends the game at the target score of 1000', () => {
    expect(TARGET_SCORE).toBe(1000);
    let g = createGame();
    for (let i = 0; i < 3; i++) g = gameReducer(g, { type: 'confirmRound', team: 0, points: 257 });
    expect(gameWinner(g)).toBeNull(); // 771
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 257 });
    expect(totalScore(g, 0)).toBe(1028);
    expect(gameWinner(g)).toBe(0);
    // no more rounds once the game is over
    expect(gameReducer(g, { type: 'confirmRound', team: 1, points: 100 })).toBe(g);
  });

  it('lets the higher total win if both teams pass the target in the same round', () => {
    const round = (n: number, cards: [number, number], melds: [number, number], trumpTeam: 0 | 1) => ({
      number: n,
      trump: null,
      cardPoints: cards,
      meldPoints: melds,
      melds: [[], []] as [Meld[], Meld[]],
      enteredBy: 0 as const,
      trumpTeam,
    });
    const base = { ...createGame(), history: [round(1, [950, 900], [0, 0], 0)] };
    expect(gameWinner(base)).toBeNull();
    const higher = { ...base, history: [...base.history, round(2, [57, 100], [0, 50], 1)] };
    expect(gameWinner(higher)).toBe(1); // 1007 : 1050
    const equal = { ...base, history: [...base.history, round(2, [57, 107], [0, 0], 0)] };
    expect(gameWinner(equal)).toBe(0); // 1007 : 1007 → team with Trumpf
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
