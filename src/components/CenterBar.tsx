import { SUITS, SUIT_NAMES, SUIT_SYMBOLS, type Suit, isRedSuit } from '../domain/cards';

interface Props {
  round: number;
  trump: Suit | null;
  onTrump: (trump: Suit | null) => void;
  onMenu: () => void;
}

export function CenterBar({ round, trump, onTrump, onMenu }: Props) {
  return (
    <div className="center-bar">
      <div className="round" data-testid="round">
        Runde {round}
      </div>
      <div className="trump" role="group" aria-label="Trumpf">
        {SUITS.map((s) => (
          <button
            key={s}
            type="button"
            className={`trump__btn${trump === s ? ' active' : ''}${isRedSuit(s) ? ' red' : ''}`}
            aria-pressed={trump === s}
            aria-label={`Trumpf ${SUIT_NAMES[s]}`}
            onClick={() => onTrump(trump === s ? null : s)}
          >
            {SUIT_SYMBOLS[s]}
          </button>
        ))}
      </div>
      <button type="button" className="icon-btn" onClick={onMenu} aria-label="Menü">
        ☰
      </button>
    </div>
  );
}
