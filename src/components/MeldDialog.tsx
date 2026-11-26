import { type Meld, type MeldType, MELD_DEFINITIONS, MELD_ORDER } from '../domain/melds';
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

/**
 * Choose what to meld – one tap adds it. The highest card is only asked later,
 * when both teams have the same kind of meld (see TieDialog).
 */
export function MeldDialog({ teamName, rotated, onAdd, onClose }: Props) {
  const add = (type: MeldType) => {
    onAdd({ id: newId(), type });
    onClose();
  };

  return (
    <Dialog title={`Melden – ${teamName}`} onClose={onClose} rotated={rotated}>
      <div className="meld-grid">
        {MELD_ORDER.map((t) => {
          const def = MELD_DEFINITIONS[t];
          return (
            <button key={t} type="button" className="meld-option" onClick={() => add(t)} aria-label={def.name}>
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
