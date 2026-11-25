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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const loaded = loadGame();
    expect(loaded.trumpTeam).toBe(1);
    expect(loaded.history[0].trumpTeam).toBe(0);
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
