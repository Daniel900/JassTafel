import { type Card, RANK_NAMES, SUIT_NAMES, SUIT_SYMBOLS, isRedSuit } from '../domain/cards';

const CORNER_LABEL: Record<Card['rank'], string> = {
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  B: 'B',
  D: 'D',
  K: 'K',
  A: 'A',
};

const FACE_LABEL: Partial<Record<Card['rank'], string>> = { B: 'Bauer', D: 'Dame', K: 'König' };

interface Props {
  card: Card;
  width?: number;
  className?: string;
}

/** A playing card drawn as inline SVG (no external images needed). */
export function CardImage({ card, width = 56, className }: Props) {
  const color = isRedSuit(card.suit) ? 'var(--card-red)' : 'var(--card-black)';
  const symbol = SUIT_SYMBOLS[card.suit];
  const face = FACE_LABEL[card.rank];
  return (
    <svg
      viewBox="0 0 60 84"
      width={width}
      height={(width * 84) / 60}
      className={className}
      role="img"
      aria-label={`${SUIT_NAMES[card.suit]} ${RANK_NAMES[card.rank]}`}
    >
      <rect x="1" y="1" width="58" height="82" rx="6" fill="var(--card-bg)" stroke="var(--card-border)" strokeWidth="1.5" />
      <text x="6" y="16" fontSize="13" fontWeight="700" fill={color}>
        {CORNER_LABEL[card.rank]}
      </text>
      <text x="6" y="29" fontSize="12" fill={color}>
        {symbol}
      </text>
      <g transform="rotate(180 30 42)">
        <text x="6" y="16" fontSize="13" fontWeight="700" fill={color}>
          {CORNER_LABEL[card.rank]}
        </text>
        <text x="6" y="29" fontSize="12" fill={color}>
          {symbol}
        </text>
      </g>
      {face ? (
        <>
          <rect x="15" y="22" width="30" height="40" rx="4" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
          <text x="30" y="46" fontSize="20" textAnchor="middle" fill={color}>
            {symbol}
          </text>
          <text x="30" y="58" fontSize="7" textAnchor="middle" fill={color}>
            {face}
          </text>
        </>
      ) : (
        <text x="30" y="52" fontSize="26" textAnchor="middle" fill={color}>
          {symbol}
        </text>
      )}
    </svg>
  );
}

/** Several cards fanned out, used as image for a meld type. */
export function CardFan({ cards, width = 34 }: { cards: Card[]; width?: number }) {
  const overlap = width * 0.45;
  return (
    <span className="card-fan" style={{ width: width + (cards.length - 1) * overlap, height: (width * 84) / 60 }}>
      {cards.map((c, i) => (
        <span key={`${c.suit}-${c.rank}`} className="card-fan__card" style={{ left: i * overlap }}>
          <CardImage card={c} width={width} />
        </span>
      ))}
    </span>
  );
}
