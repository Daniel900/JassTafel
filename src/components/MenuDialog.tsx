import { SUIT_SYMBOLS } from '../domain/cards';
import type { GameState } from '../domain/game';
import { describeMeld } from '../domain/melds';
import { Dialog } from './Dialog';

interface Props {
  state: GameState;
  rotateTop: boolean;
  onToggleRotate: () => void;
  onUndo: () => void;
  onNewGame: () => void;
  onClose: () => void;
}

export function MenuDialog({ state, rotateTop, onToggleRotate, onUndo, onNewGame, onClose }: Props) {
  const confirmNewGame = () => {
    if (window.confirm('Neues Spiel starten? Alle Punkte werden gelöscht.')) {
      onNewGame();
      onClose();
    }
  };
  return (
    <Dialog title="Menü" onClose={onClose}>
      <div className="menu-actions">
        <button type="button" className="secondary-btn" onClick={onUndo} disabled={state.history.length === 0}>
          Letzte Runde rückgängig
        </button>
        <button type="button" className="secondary-btn" onClick={confirmNewGame}>
          Neues Spiel
        </button>
        <label className="toggle">
          <input type="checkbox" checked={rotateTop} onChange={onToggleRotate} />
          Obere Hälfte drehen (Tafel liegt zwischen den Teams)
        </label>
      </div>
      <h3>Verlauf</h3>
      {state.history.length === 0 ? (
        <p className="hint">Noch keine Runde gespielt.</p>
      ) : (
        <table className="history">
          <thead>
            <tr>
              <th>#</th>
              <th>{state.teams[0].name}</th>
              <th>{state.teams[1].name}</th>
            </tr>
          </thead>
          <tbody>
            {[...state.history].reverse().map((r) => (
              <tr key={r.number}>
                <td>
                  {r.number}
                  {r.trump ? ` ${SUIT_SYMBOLS[r.trump]}` : ''}
                </td>
                {([0, 1] as const).map((t) => (
                  <td key={t} title={r.melds[t].map(describeMeld).join(', ')}>
                    {r.cardPoints[t]}
                    {r.meldPoints[t] > 0 && <span className="history__meld"> +{r.meldPoints[t]}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Dialog>
  );
}
