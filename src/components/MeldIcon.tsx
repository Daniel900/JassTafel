import type { Card } from '../domain/cards';
import type { MeldType } from '../domain/melds';
import { CardFan } from './CardImage';

const EXAMPLES: Record<MeldType, Card[]> = {
  dreiblatt: [
    { suit: 'herz', rank: 'D' },
    { suit: 'herz', rank: 'K' },
    { suit: 'herz', rank: 'A' },
  ],
  vierblatt: [
    { suit: 'pik', rank: 'B' },
    { suit: 'pik', rank: 'D' },
    { suit: 'pik', rank: 'K' },
    { suit: 'pik', rank: 'A' },
  ],
  fuenfblatt: [
    { suit: 'karo', rank: '10' },
    { suit: 'karo', rank: 'B' },
    { suit: 'karo', rank: 'D' },
    { suit: 'karo', rank: 'K' },
    { suit: 'karo', rank: 'A' },
  ],
  vierling: [
    { suit: 'kreuz', rank: 'A' },
    { suit: 'pik', rank: 'A' },
    { suit: 'herz', rank: 'A' },
    { suit: 'karo', rank: 'A' },
  ],
  vierNell: [
    { suit: 'kreuz', rank: '9' },
    { suit: 'pik', rank: '9' },
    { suit: 'herz', rank: '9' },
    { suit: 'karo', rank: '9' },
  ],
  vierBuur: [
    { suit: 'kreuz', rank: 'B' },
    { suit: 'pik', rank: 'B' },
    { suit: 'herz', rank: 'B' },
    { suit: 'karo', rank: 'B' },
  ],
  steck: [
    { suit: 'kreuz', rank: 'D' },
    { suit: 'kreuz', rank: 'K' },
  ],
};

export function MeldIcon({ type, width }: { type: MeldType; width?: number }) {
  return <CardFan cards={EXAMPLES[type]} width={width} />;
}
