import { useEffect, useState } from 'react';
import { CenterBar } from './components/CenterBar';
import { MeldDialog } from './components/MeldDialog';
import { MenuDialog } from './components/MenuDialog';
import { PointsDialog } from './components/PointsDialog';
import { TeamPanel } from './components/TeamPanel';
import { RulesDialog } from './components/RulesDialog';
import { TieDialog } from './components/TieDialog';
import { WinnerDialog } from './components/WinnerDialog';
import { TARGET_SCORE, type TeamIndex, gameWinner, totalScore, totalWins, winAward } from './domain/game';
import { findMeldTie } from './domain/melds';
import { useGame } from './state/useGame';
import { useIdle } from './state/useIdle';
import { IDLE_SHIFT_FACTOR, usePixelShift } from './state/usePixelShift';
import { useWakeLock } from './state/useWakeLock';

const ROTATE_KEY = 'jasstafel.rotateTop';

function readRotate(): boolean {
  try {
    return localStorage.getItem(ROTATE_KEY) !== 'false';
  } catch {
    return true;
  }
}

type Open = { kind: 'meld' | 'points'; team: TeamIndex } | { kind: 'menu' } | { kind: 'rules' } | null;

export default function App() {
  const [state, dispatch] = useGame();
  useWakeLock();
  const [open, setOpen] = useState<Open>(null);
  const [rotateTop, setRotateTop] = useState(readRotate);
  const winner = gameWinner(state);
  // Both teams have the same kind of meld → ask for the highest card (unless postponed with "Später").
  const tie = findMeldTie(state.pendingMelds);
  const tieKey = tie ? `${state.round}:${tie.type}` : null;
  const [postponedTie, setPostponedTie] = useState<string | null>(null);
  const showTie = tie !== null && open === null && winner === null && postponedTie !== tieKey;
  // "Punkte" tapped while the highest card is still open: answer that first, then open the points screen.
  const [pointsAfterTie, setPointsAfterTie] = useState<TeamIndex | null>(null);
  useEffect(() => {
    if (tie === null && pointsAfterTie !== null) {
      setOpen({ kind: 'points', team: pointsAfterTie });
      setPointsAfterTie(null);
    }
  }, [tie, pointsAfterTie]);
  const openPoints = (team: TeamIndex) => {
    if (tie) {
      setPostponedTie(null);
      setPointsAfterTie(team);
    } else {
      setOpen({ kind: 'points', team });
    }
  };
  // Black outline mode after 30 s without a tap (not while a dialog is open) – protects OLED screens.
  const idle = useIdle(undefined, open !== null || winner !== null || showTie);
  const [baseX, baseY] = usePixelShift();
  const shiftFactor = idle ? IDLE_SHIFT_FACTOR : 1;
  const shiftX = baseX * shiftFactor;
  const shiftY = baseY * shiftFactor;

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
      wins={totalWins(state, team)}
      melds={state.pendingMelds[team]}
      rotated={isRotated(team)}
      hasTrump={state.trumpTeam === team}
            disabled={winner !== null}
      onTakeTrump={() => dispatch({ type: 'setTrumpTeam', team })}
      onMeld={() => setOpen({ kind: 'meld', team })}
      onPoints={() => openPoints(team)}
      onRemoveMeld={(id) => dispatch({ type: 'removeMeld', team, id })}
      onRename={() => rename(team)}
    />
  );

  return (
    <main
      className={`tafel${idle ? ' tafel--idle' : ''}`}
      data-testid="tafel"
      style={{ transform: `translate(${shiftX}px, ${shiftY}px)` }}
    >
      {panel(0)}
      <CenterBar
        round={state.round}
        onMenu={() => setOpen({ kind: 'menu' })}
      />
      {panel(1)}

      {showTie && tie && (
        <TieDialog
          tie={tie}
          teamNames={[state.teams[0].name, state.teams[1].name]}
          melds={state.pendingMelds}
          rotateTop={rotateTop}
          requiredForPoints={pointsAfterTie !== null}
          onPick={(team, rank) => dispatch({ type: 'setMeldRank', team, meldType: tie.type, rank })}
          onLater={() => {
            setPostponedTie(tieKey);
            setPointsAfterTie(null);
          }}
        />
      )}
      {winner !== null && open === null && (
        <WinnerDialog
          winnerName={state.teams[winner].name}
          scores={[totalScore(state, 0), totalScore(state, 1)]}
          teamNames={[state.teams[0].name, state.teams[1].name]}
          wins={[totalWins(state, 0), totalWins(state, 1)]}
          award={winAward(state)!.wins}
          onUndo={() => dispatch({ type: 'undoRound' })}
          onNextGame={() => dispatch({ type: 'nextGame' })}
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
          onShowRules={() => setOpen({ kind: 'rules' })}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === 'rules' && <RulesDialog onClose={() => setOpen({ kind: 'menu' })} />}
    </main>
  );
}
