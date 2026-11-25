import { useState } from 'react';
import { type GameState, type TeamIndex, previewRound } from '../domain/game';
import { MATCH_POINTS, validateEnteredPoints } from '../domain/scoring';
import { Dialog } from './Dialog';

interface Props {
  state: GameState;
  team: TeamIndex;
  rotated?: boolean;
  onConfirm: (points: number) => void;
  onClose: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

export function PointsDialog({ state, team, rotated, onConfirm, onClose }: Props) {
  const [input, setInput] = useState('');
  const value = input === '' ? null : Number(input);
  const validation = value === null ? null : validateEnteredPoints(value);
  const valid = validation?.ok === true;
  const preview = valid ? previewRound(state, team, value!) : null;

  const press = (key: string) => {
    if (key === 'C') setInput('');
    else if (key === '⌫') setInput((s) => s.slice(0, -1));
    else setInput((s) => (s === '0' ? key : (s + key).slice(0, 3)));
  };

  const other: TeamIndex = team === 0 ? 1 : 0;
  const row = (t: TeamIndex) => (
    <div className="preview__row" key={t}>
      <span className="preview__team">{state.teams[t].name}</span>
      <span data-testid={`preview-cards-${t}`}>{preview ? preview.cardPoints[t] : '–'}</span>
      <span className="preview__meld" data-testid={`preview-melds-${t}`}>
        {preview && preview.melds.points[t] > 0 ? `+${preview.melds.points[t]}` : ''}
      </span>
    </div>
  );

  return (
    <Dialog title={`Punkte – ${state.teams[team].name}`} onClose={onClose} rotated={rotated}>
      <div className="points-display" aria-live="polite" data-testid="points-input">
        {input || '0'}
      </div>
      <p className={`hint${validation && !validation.ok ? ' error' : ''}`}>
        {validation && !validation.ok ? validation.error : `Kartenpunkte 0–157 (157 oder ${MATCH_POINTS} = Match)`}
      </p>
      <div className="preview">
        {row(team)}
        {row(other)}
      </div>
      {preview?.melds.tie && <p className="hint error">Gleich hohe Weis – keiner wird gezählt.</p>}
      <div className="keypad">
        {KEYS.map((k) => (
          <button key={k} type="button" className="key" onClick={() => press(k)} aria-label={k === '⌫' ? 'Löschen' : k}>
            {k}
          </button>
        ))}
        <button type="button" className="key key--wide" onClick={() => setInput(String(MATCH_POINTS))}>
          Match (257)
        </button>
      </div>
      <button type="button" className="primary-btn" disabled={!valid} onClick={() => valid && onConfirm(value!)}>
        Bestätigen
      </button>
    </Dialog>
  );
}
