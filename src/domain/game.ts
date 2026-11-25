import { type Meld, type MeldResult, evaluateMelds, isValidMeld } from './melds';
import { splitRoundPoints } from './scoring';

export type TeamIndex = 0 | 1;
/** Only "Schieber" for now – "Steiger" uses the same rules and can be added later. */
export type GameMode = 'schieber';

export interface Team {
  name: string;
}

export interface RoundResult {
  number: number;
  cardPoints: [number, number];
  meldPoints: [number, number];
  melds: [Meld[], Meld[]];
  /** Team that entered the card points. */
  enteredBy: TeamIndex;
  /** Team that had Trumpf (chose trump) in this round. */
  trumpTeam: TeamIndex;
}

/** The game is won by the first team reaching this score. */
export const TARGET_SCORE = 1000;

export interface GameState {
  version: 1;
  mode: GameMode;
  teams: [Team, Team];
  /** Number of the round currently being played (starts at 1). */
  round: number;
  /** Team that has Trumpf this round – alternates every round, wins equal melds. */
  trumpTeam: TeamIndex;
  /** Melds announced during the current round. */
  pendingMelds: [Meld[], Meld[]];
  history: RoundResult[];
}

export const createGame = (teams: [string, string] = ['Team 1', 'Team 2']): GameState => ({
  version: 1,
  mode: 'schieber',
  teams: [{ name: teams[0] }, { name: teams[1] }],
  round: 1,
  trumpTeam: 0,
  pendingMelds: [[], []],
  history: [],
});

export type GameAction =
  | { type: 'addMeld'; team: TeamIndex; meld: Meld }
  | { type: 'removeMeld'; team: TeamIndex; id: string }
  | { type: 'setTrumpTeam'; team: TeamIndex }
  | { type: 'confirmRound'; team: TeamIndex; points: number }
  | { type: 'undoRound' }
  | { type: 'renameTeam'; team: TeamIndex; name: string }
  | { type: 'newGame' };

const other = (team: TeamIndex): TeamIndex => (team === 0 ? 1 : 0);

const updateTeamList = <T,>(pair: [T, T], team: TeamIndex, value: T): [T, T] =>
  team === 0 ? [value, pair[1]] : [pair[0], value];

/** Card points per team for a value entered by one team. */
export function cardPointsFor(team: TeamIndex, entered: number): [number, number] {
  const { own, other: rest } = splitRoundPoints(entered);
  return team === 0 ? [own, rest] : [rest, own];
}

/** Preview of a round result without changing the state. */
export function previewRound(
  state: GameState,
  team: TeamIndex,
  entered: number,
): { cardPoints: [number, number]; melds: MeldResult } {
  const cardPoints = cardPointsFor(team, entered);
  return { cardPoints, melds: evaluateMelds(state.pendingMelds, cardPoints, state.trumpTeam) };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'addMeld': {
      if (!isValidMeld(action.meld)) return state;
      const list = [...state.pendingMelds[action.team], action.meld];
      return { ...state, pendingMelds: updateTeamList(state.pendingMelds, action.team, list) };
    }
    case 'removeMeld': {
      const list = state.pendingMelds[action.team].filter((m) => m.id !== action.id);
      return { ...state, pendingMelds: updateTeamList(state.pendingMelds, action.team, list) };
    }
    case 'setTrumpTeam':
      return { ...state, trumpTeam: action.team };
    case 'confirmRound': {
      if (isGameOver(state)) return state;
      const { cardPoints, melds } = previewRound(state, action.team, action.points);
      const result: RoundResult = {
        number: state.round,
        cardPoints,
        meldPoints: melds.points,
        melds: state.pendingMelds,
        enteredBy: action.team,
        trumpTeam: state.trumpTeam,
      };
      return {
        ...state,
        round: state.round + 1,
        trumpTeam: other(state.trumpTeam),
        pendingMelds: [[], []],
        history: [...state.history, result],
      };
    }
    case 'undoRound': {
      const last = state.history[state.history.length - 1];
      if (!last) return state;
      return {
        ...state,
        round: last.number,
        trumpTeam: last.trumpTeam,
        pendingMelds: last.melds,
        history: state.history.slice(0, -1),
      };
    }
    case 'renameTeam': {
      const name = action.name.trim() || `Team ${action.team + 1}`;
      return { ...state, teams: updateTeamList(state.teams, action.team, { name }) };
    }
    case 'newGame':
      return { ...createGame([state.teams[0].name, state.teams[1].name]) };
  }
}

/** Total score of a team: card points + counted melds of all finished rounds. */
export function totalScore(state: GameState, team: TeamIndex): number {
  return state.history.reduce((sum, r) => sum + r.cardPoints[team] + r.meldPoints[team], 0);
}

/**
 * Winner of the game once a team reached the target score, otherwise null.
 * If both teams pass the target in the same round, the higher total wins
 * (on an exact tie the team with Trumpf in that round wins).
 */
export function gameWinner(state: GameState, target = TARGET_SCORE): TeamIndex | null {
  const t0 = totalScore(state, 0);
  const t1 = totalScore(state, 1);
  if (t0 < target && t1 < target) return null;
  if (t0 !== t1) return t0 > t1 ? 0 : 1;
  return state.history[state.history.length - 1]?.trumpTeam ?? 0;
}

export const isGameOver = (state: GameState): boolean => gameWinner(state) !== null;

export { other as otherTeam };
