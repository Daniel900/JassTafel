import type { Meld } from '../domain/melds';
import { describeMeld, meldPoints } from '../domain/melds';

interface Props {
  index: 0 | 1;
  name: string;
  total: number;
  melds: Meld[];
  rotated?: boolean;
  /** Remaining points until the target score. */
  remaining: number;
  hasTrump: boolean;
  disabled?: boolean;
  onTakeTrump: () => void;
  onMeld: () => void;
  onPoints: () => void;
  onRemoveMeld: (id: string) => void;
  onRename: () => void;
}

export function TeamPanel({
  index,
  name,
  total,
  melds,
  rotated,
  remaining,
  hasTrump,
  disabled,
  onTakeTrump,
  onMeld,
  onPoints,
  onRemoveMeld,
  onRename,
}: Props) {
  return (
    <section className={`team team--${index}${rotated ? ' rotated' : ''}`} aria-label={name} data-testid={`team-${index}`}>
      <div className="team__head">
        <button type="button" className="team__name" onClick={onRename}>
          {name}
        </button>
        <button
          type="button"
          className={`trump-badge${hasTrump ? ' active' : ''}`}
          onClick={onTakeTrump}
          aria-pressed={hasTrump}
          data-testid={`trump-badge-${index}`}
          aria-label={hasTrump ? 'Hat Trumpf' : 'Trumpf übernehmen'}
        >
          {hasTrump ? 'Trumpf' : 'Trumpf?'}
        </button>
      </div>
      <div className="team__total" data-testid={`total-${index}`}>
        {total}
      </div>
      <div className="team__remaining" data-testid={`remaining-${index}`}>
        {remaining > 0 ? `noch ${remaining}` : 'Ziel erreicht'}
      </div>
      <ul className="team__melds" aria-label="Weis dieser Runde">
        {melds.map((m) => (
          <li key={m.id} className="chip">
            <span>
              {describeMeld(m)} <strong>{meldPoints(m)}</strong>
            </span>
            <button type="button" className="chip__remove" onClick={() => onRemoveMeld(m.id)} aria-label={`${describeMeld(m)} entfernen`}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="team__actions">
        <button type="button" className="secondary-btn" onClick={onMeld} disabled={disabled}>
          Melden
        </button>
        <button type="button" className="primary-btn" onClick={onPoints} disabled={disabled}>
          Punkte
        </button>
      </div>
    </section>
  );
}
