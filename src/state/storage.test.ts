import { createGame, gameReducer } from '../domain/game';
import { STORAGE_KEY, loadGame, saveGame } from './storage';

describe('storage', () => {
  it('returns a new game if nothing is stored', () => {
    expect(loadGame()).toEqual(createGame());
  });

  it('saves and loads the game state', () => {
    const g = gameReducer(createGame(), { type: 'confirmRound', team: 0, points: 80 });
    saveGame(g);
    expect(loadGame()).toEqual(g);
  });

  it('falls back to a new game for corrupt data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadGame()).toEqual(createGame());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadGame()).toEqual(createGame());
  });

  it('migrates saved games without Trumpf team', () => {
    const g = gameReducer(createGame(), { type: 'confirmRound', team: 0, points: 80 });
    const old = JSON.parse(JSON.stringify(g));
    delete old.trumpTeam;
    delete old.history[0].trumpTeam;
    old.trump = 'herz';
    old.history[0].trump = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const loaded = loadGame();
    expect(loaded.trumpTeam).toBe(1);
    expect(loaded.history[0].trumpTeam).toBe(0);
    expect(loaded).not.toHaveProperty('trump');
    expect(loaded.history[0]).not.toHaveProperty('trump');
  });

  it('adds an empty win counter to games saved before it existed', () => {
    const old = JSON.parse(JSON.stringify(createGame()));
    delete old.wins;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    expect(loadGame().wins).toEqual([0, 0]);
  });

  it('migrates sequence melds that stored the full highest card', () => {
    const g = createGame();
    const old = JSON.parse(JSON.stringify(g));
    old.pendingMelds[0] = [{ id: 'a', type: 'dreiblatt', highCard: { suit: 'herz', rank: 'A' } }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    expect(loadGame().pendingMelds[0]).toEqual([{ id: 'a', type: 'dreiblatt', rank: 'A' }]);
  });

  it('does not throw if storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(() => saveGame(createGame(), broken)).not.toThrow();
    expect(loadGame(broken)).toEqual(createGame());
  });
});
