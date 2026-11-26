import { DOUBLE_WIN_THRESHOLD, TARGET_SCORE } from '../domain/game';

interface Props {
  winnerName: string;
  teamNames: [string, string];
  scores: [number, number];
  /** Wins per team including this game. */
  wins: [number, number];
  /** Wins the winner gets for this game (2 if the other team has fewer than 500 points). */
  award: 1 | 2;
  onUndo: () => void;
  onNextGame: () => void;
}

/** Shown as soon as a team reached the target score. */
export function WinnerDialog({ winnerName, teamNames, scores, wins, award, onUndo, onNextGame }: Props) {
  return (
    <div className="overlay">
      <div className="dialog winner" role="dialog" aria-modal="true" aria-label="Spielende">
        <div className="dialog__body">
          <div className="winner__trophy" aria-hidden="true">
            🏆
          </div>
          <h2 className="winner__title">{winnerName} gewinnt!</h2>
          <p className="winner__award" data-testid="award">
            {award === 2 ? `+2 Siege (Gegner unter ${DOUBLE_WIN_THRESHOLD} Punkten)` : '+1 Sieg'}
          </p>
          <p className="hint">Ziel: {TARGET_SCORE} Punkte</p>
          <div className="preview">
            <div className="preview__row preview__head">
              <span />
              <span>Punkte</span>
              <span>Siege</span>
            </div>
            {teamNames.map((name, i) => (
              <div className="preview__row" key={name + i}>
                <span className="preview__team">{name}</span>
                <span data-testid={`final-${i}`}>{scores[i]}</span>
                <span data-testid={`final-wins-${i}`}>{wins[i]}</span>
              </div>
            ))}
          </div>
          <button type="button" className="primary-btn" onClick={onNextGame}>
            Nächstes Spiel
          </button>
          <button type="button" className="secondary-btn" onClick={onUndo}>
            Letzte Runde rückgängig
          </button>
        </div>
      </div>
    </div>
  );
}
