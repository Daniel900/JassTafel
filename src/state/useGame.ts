import { useEffect, useReducer } from 'react';
import { gameReducer } from '../domain/game';
import { loadGame, saveGame } from './storage';

/** Game state that is persisted in localStorage and survives page reloads. */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadGame());
  useEffect(() => saveGame(state), [state]);
  return [state, dispatch] as const;
}
