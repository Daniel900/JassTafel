import { useState } from 'react';
import { CenterBar } from './components/CenterBar';
import { MeldDialog } from './components/MeldDialog';
import { MenuDialog } from './components/MenuDialog';
import { PointsDialog } from './components/PointsDialog';
import { TeamPanel } from './components/TeamPanel';
import { WinnerDialog } from './components/WinnerDialog';
import { TARGET_SCORE, type TeamIndex, gameWinner, totalScore } from './domain/game';
import { useGame } from './state/useGame';

const ROTATE_KEY = 'jasstafel.rotateTop';

function readRotate(): boolean {
  try {
    return localStorage.getItem(ROTATE_KEY) !== 'false';
  } catch {
    return true;
  }
}

type Open = { kind: 'meld' | 'points'; team: TeamIndex } | { kind: 'menu' } | null;

export default function App() {
  const [state, dispatch] = useGame();
  const [open, setOpen] = useState<Open>(null);
  const [rotateTop, setRotateTop] = useState(readRotate);
  const winner = gameWinner(state);

  const toggleRotate = () => {
    const next = !rotateTop;
    setRotateTop(next);
    try {
      localStorage.setItem(ROTATE_KEY, String(next));
    } catch {
      // ignore
    }
  };

  // Team 1 sits on the top half, team 2 on the bottom half.
  const isRotated = (team: TeamIndex) => team === 0 && rotateTop;

  const rename = (team: TeamIndex) => {
    const name = window.prompt('Teamname', state.teams[team].name);
    if (name !== null) dispatch({ type: 'renameTeam', team, name });
  };

  const panel = (team: TeamIndex) => (
    <TeamPanel
      index={team}
      name={state.teams[team].name}
      total={totalScore(state, team)}
      remaining={Math.max(0, TARGET_SCORE - totalScore(state, team))}
      melds={state.pendingMelds[team]}
      rotated={isRotated(team)}
      hasTrump={state.trumpTeam === team}
            disabled={winner !== null}
      onTakeTrump={() => dispatch({ type: 'setTrumpTeam', team })}
      onMeld={() => setOpen({ kind: 'meld', team })}
      onPoints={() => setOpen({ kind: 'points', team })}
      onRemoveMeld={(id) => dispatch({ type: 'removeMeld', team, id })}
      onRename={() => rename(team)}
    />
  );

  return (
    <main className="tafel">
      {panel(0)}
      <CenterBar
        round={state.round}
        onMenu={() => setOpen({ kind: 'menu' })}
      />
      {panel(1)}

      {winner !== null && open === null && (
        <WinnerDialog
          winnerName={state.teams[winner].name}
          scores={[totalScore(state, 0), totalScore(state, 1)]}
          teamNames={[state.teams[0].name, state.teams[1].name]}
          onUndo={() => dispatch({ type: 'undoRound' })}
          onNewGame={() => dispatch({ type: 'newGame' })}
        />
      )}
      {open?.kind === 'meld' && (
        <MeldDialog
          teamName={state.teams[open.team].name}
          rotated={isRotated(open.team)}
          onAdd={(meld) => dispatch({ type: 'addMeld', team: open.team, meld })}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === 'points' && (
        <PointsDialog
          state={state}
          team={open.team}
          rotated={isRotated(open.team)}
          onConfirm={(points) => {
            dispatch({ type: 'confirmRound', team: open.team, points });
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === 'menu' && (
        <MenuDialog
          state={state}
          rotateTop={rotateTop}
          onToggleRotate={toggleRotate}
          onUndo={() => dispatch({ type: 'undoRound' })}
          onNewGame={() => dispatch({ type: 'newGame' })}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  );
}
