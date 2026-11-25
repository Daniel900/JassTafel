import type { Meld } from '../domain/melds';
import { describeMeld, meldPoints } from '../domain/melds';

interface Props {
  index: 0 | 1;
  name: string;
  total: number;
  melds: Meld[];
  rotated?: boolean;
  onMeld: () => void;
  onPoints: () => void;
  onRemoveMeld: (id: string) => void;
  onRename: () => void;
}

export function TeamPanel({ index, name, total, melds, rotated, onMeld, onPoints, onRemoveMeld, onRename }: Props) {
  return (
    <section className={`team team--${index}${rotated ? ' rotated' : ''}`} aria-label={name} data-testid={`team-${index}`}>
      <button type="button" className="team__name" onClick={onRename}>
        {name}
      </button>
      <div className="team__total" data-testid={`total-${index}`}>
        {total}
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
        <button type="button" className="secondary-btn" onClick={onMeld}>
          Melden
        </button>
        <button type="button" className="primary-btn" onClick={onPoints}>
          Punkte
        </button>
      </div>
    </section>
  );
}
