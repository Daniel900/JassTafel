import { type GameState, createGame } from '../domain/game';

export const STORAGE_KEY = 'jasstafel.game.v1';

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<GameState>;
  return (
    v.version === 1 &&
    Array.isArray(v.teams) &&
    v.teams.length === 2 &&
    typeof v.round === 'number' &&
    Array.isArray(v.pendingMelds) &&
    v.pendingMelds.length === 2 &&
    Array.isArray(v.history)
  );
}

/** Fills in fields added after the first release so older saved games still load. */
function migrate(saved: GameState): GameState {
  // Older versions stored a trump suit, which is no longer used.
  const { trump: _unused, ...state } = saved as GameState & { trump?: unknown };
  return {
    ...state,
    trumpTeam: state.trumpTeam ?? (((state.round - 1) % 2) as 0 | 1),
    history: state.history.map((round, i) => {
      const { trump: _t, ...r } = round as typeof round & { trump?: unknown };
      return { ...r, trumpTeam: r.trumpTeam ?? ((i % 2) as 0 | 1) };
    }),
  };
}

export function loadGame(storage: Storage = localStorage): GameState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createGame();
    const parsed: unknown = JSON.parse(raw);
    return isGameState(parsed) ? migrate(parsed) : createGame();
  } catch {
    return createGame();
  }
}

export function saveGame(state: GameState, storage: Storage = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (e.g. private mode) – the game keeps running in memory.
  }
}
