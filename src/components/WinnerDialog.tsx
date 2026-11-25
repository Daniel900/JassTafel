import { TARGET_SCORE } from '../domain/game';

interface Props {
  winnerName: string;
  teamNames: [string, string];
  scores: [number, number];
  onUndo: () => void;
  onNewGame: () => void;
}

/** Shown as soon as a team reached the target score. */
export function WinnerDialog({ winnerName, teamNames, scores, onUndo, onNewGame }: Props) {
  return (
    <div className="overlay">
      <div className="dialog winner" role="dialog" aria-modal="true" aria-label="Spielende">
        <div className="dialog__body">
          <div className="winner__trophy" aria-hidden="true">
            🏆
          </div>
          <h2 className="winner__title">{winnerName} gewinnt!</h2>
          <p className="hint">Ziel: {TARGET_SCORE} Punkte</p>
          <div className="preview">
            {teamNames.map((name, i) => (
              <div className="preview__row" key={name + i}>
                <span className="preview__team">{name}</span>
                <span data-testid={`final-${i}`}>{scores[i]}</span>
                <span />
              </div>
            ))}
          </div>
          <button type="button" className="primary-btn" onClick={onNewGame}>
            Neues Spiel
          </button>
          <button type="button" className="secondary-btn" onClick={onUndo}>
            Letzte Runde rückgängig
          </button>
        </div>
      </div>
    </div>
  );
}
