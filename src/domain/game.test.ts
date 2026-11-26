import {
  DOUBLE_WIN_THRESHOLD,
  type GameState,
  TARGET_SCORE,
  createGame,
  gameReducer,
  gameWinner,
  previewRound,
  totalScore,
  totalWins,
  winAward,
} from './game';
import type { Meld } from './melds';

const dreiblatt: Meld = { id: 'a', type: 'dreiblatt', rank: 'A' };
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
    g = gameReducer(g, { type: 'confirmRound', team: 0, points: 90 });
    expect(g.round).toBe(2);
    expect(totalScore(g, 0)).toBe(90);
    expect(totalScore(g, 1)).toBe(67 + 20);
    expect(g.pendingMelds).toEqual([[], []]);
    expect(g.history[0]).toMatchObject({ number: 1, trumpTeam: 0, cardPoints: [90, 67], meldPoints: [0, 20] });
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

/** Plays rounds where `team` enters `points` each time. */
const play = (g: GameState, team: 0 | 1, points: number, times: number) => {
  for (let i = 0; i < times; i++) g = gameReducer(g, { type: 'confirmRound', team, points });
  return g;
};

describe('win counter (Siege)', () => {
  it('gives 2 wins if the losing team has fewer than 500 points', () => {
    expect(DOUBLE_WIN_THRESHOLD).toBe(500);
    const g = play(createGame(), 1, 257, 4); // 1028 : 0
    expect(winAward(g)).toEqual({ team: 1, wins: 2 });
    expect(totalWins(g, 1)).toBe(2);
    expect(totalWins(g, 0)).toBe(0);
  });

  it('gives 1 win if the losing team has 500 points or more', () => {
    // team 0 enters 100 each round → 100 : 57 per round
    let g = play(createGame(), 0, 100, 9); // 900 : 513
    expect(winAward(g)).toBeNull();
    g = play(g, 0, 100, 1); // 1000 : 570
    expect(winAward(g)).toEqual({ team: 0, wins: 1 });
  });

  it('uses exactly 500 as single win (only below 500 counts double)', () => {
    const round = (cards: [number, number]) => ({
      number: 1,
      cardPoints: cards,
      meldPoints: [0, 0] as [number, number],
      melds: [[], []] as [never[], never[]],
      enteredBy: 0 as const,
      trumpTeam: 0 as const,
    });
    expect(winAward({ ...createGame(), history: [round([1000, 500])] })).toEqual({ team: 0, wins: 1 });
    expect(winAward({ ...createGame(), history: [round([1000, 499])] })).toEqual({ team: 0, wins: 2 });
  });

  it('"Nächstes Spiel" books the win, keeps the counter and names, resets the game', () => {
    let g = gameReducer(createGame(), { type: 'renameTeam', team: 0, name: 'Hirsche' });
    g = play(g, 1, 257, 4);
    g = gameReducer(g, { type: 'nextGame' });
    expect(g.wins).toEqual([0, 2]);
    expect(g.history).toHaveLength(0);
    expect(g.round).toBe(1);
    expect(g.teams[0].name).toBe('Hirsche');
    expect(totalWins(g, 1)).toBe(2);
    // second game, team 0 wins against a team with more than 500
    g = play(g, 0, 100, 10);
    g = gameReducer(g, { type: 'nextGame' });
    expect(g.wins).toEqual([1, 2]);
  });

  it('keeps Trumpf alternating into the next game', () => {
    // 4 rounds: Trumpf 0, 1, 0, 1 → the next game starts with team 0's turn after team 1
    let g = play(createGame(), 1, 257, 4);
    expect(g.history[3].trumpTeam).toBe(1);
    g = gameReducer(g, { type: 'nextGame' });
    expect(g.trumpTeam).toBe(0);
    // 3 rounds: Trumpf 0, 1, 0 → next game starts with team 1
    g = play(g, 1, 257, 3);
    g = play(g, 0, 100, 7); // team 0 can't reach 1000 here, team 1 wins at 771 + 7×57 = 1170
    const last = g.history[g.history.length - 1].trumpTeam;
    g = gameReducer(g, { type: 'nextGame' });
    expect(g.trumpTeam).toBe(last === 0 ? 1 : 0);
  });

  it('ignores "Nächstes Spiel" while the game is still running', () => {
    const g = play(createGame(), 0, 100, 2);
    expect(gameReducer(g, { type: 'nextGame' })).toBe(g);
  });

  it('undoing the winning round also removes the not yet booked win', () => {
    let g = play(createGame(), 1, 257, 4);
    expect(totalWins(g, 1)).toBe(2);
    g = gameReducer(g, { type: 'undoRound' });
    expect(totalWins(g, 1)).toBe(0);
  });

  it('"Neuer Jass-Abend" (newGame) resets the win counter', () => {
    let g = gameReducer(play(createGame(), 1, 257, 4), { type: 'nextGame' });
    expect(g.wins).toEqual([0, 2]);
    g = gameReducer(g, { type: 'newGame' });
    expect(g.wins).toEqual([0, 0]);
  });
});
