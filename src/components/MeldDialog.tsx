import { useState } from 'react';
import { type Card, type Rank, SUITS, RANK_NAMES } from '../domain/cards';
import { type Meld, type MeldType, MELD_DEFINITIONS, MELD_ORDER, VIERLING_RANKS, possibleHighRanks } from '../domain/melds';
import { CardFan, CardImage } from './CardImage';
import { Dialog } from './Dialog';
import { MeldIcon } from './MeldIcon';

interface Props {
  teamName: string;
  rotated?: boolean;
  onAdd: (meld: Meld) => void;
  onClose: () => void;
}

let idCounter = 0;
const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function MeldDialog({ teamName, rotated, onAdd, onClose }: Props) {
  const [type, setType] = useState<MeldType | null>(null);

  const add = (meld: Omit<Meld, 'id'>) => {
    onAdd({ ...meld, id: newId() });
    onClose();
  };

  const choose = (t: MeldType) => {
    if (MELD_DEFINITIONS[t].needs === 'nothing') add({ type: t });
    else setType(t);
  };

  if (type === null) {
    return (
      <Dialog title={`Melden – ${teamName}`} onClose={onClose} rotated={rotated}>
        <div className="meld-grid">
          {MELD_ORDER.map((t) => {
            const def = MELD_DEFINITIONS[t];
            return (
              <button key={t} type="button" className="meld-option" onClick={() => choose(t)} aria-label={def.name}>
                <MeldIcon type={t} />
                <span className="meld-option__name">{def.name}</span>
                <span className="meld-option__points">{def.points}</span>
              </button>
            );
          })}
        </div>
      </Dialog>
    );
  }

  const def = MELD_DEFINITIONS[type];
  return (
    <Dialog title={def.name} onClose={onClose} rotated={rotated}>
      <button type="button" className="link-btn" onClick={() => setType(null)}>
        ‹ Zurück
      </button>
      {def.needs === 'highCard' ? (
        <>
          <p className="hint">Höchste Karte wählen:</p>
          <div className="card-picker">
            {SUITS.map((suit) => (
              <div key={suit} className="card-picker__row">
                {possibleHighRanks(def.length!).map((rank) => {
                  const card: Card = { suit, rank };
                  return (
                    <button key={rank} type="button" className="card-btn" onClick={() => add({ type, highCard: card })}>
                      <CardImage card={card} width={44} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="hint">Welche Karte?</p>
          <div className="rank-picker">
            {VIERLING_RANKS.map((rank: Rank) => (
              <button
                key={rank}
                type="button"
                className="meld-option"
                aria-label={`Vierling ${RANK_NAMES[rank]}`}
                onClick={() => add({ type, rank })}
              >
                <CardFan cards={SUITS.map((suit) => ({ suit, rank }))} width={30} />
                <span className="meld-option__name">{RANK_NAMES[rank]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Dialog>
  );
}
