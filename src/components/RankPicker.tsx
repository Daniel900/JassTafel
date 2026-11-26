import { RANK_NAMES, type Rank, SUITS } from '../domain/cards';
import { MELD_DEFINITIONS, type MeldType, possibleRanks, sequenceRanks } from '../domain/melds';
import { CardFan } from './CardImage';

interface Props {
  type: MeldType;
  selected?: Rank;
  onPick: (rank: Rank) => void;
}

/** Choose the highest card of a sequence ("bis Ass") or the card of a Vierling, shown as images. */
export function RankPicker({ type, selected, onPick }: Props) {
  const def = MELD_DEFINITIONS[type];
  return (
    <div className="rank-picker">
      {possibleRanks(type).map((rank) => {
        const isSequence = def.needs === 'highRank';
        const cards = isSequence
          ? sequenceRanks(def.length!, rank).map((r) => ({ suit: 'herz' as const, rank: r }))
          : SUITS.map((suit) => ({ suit, rank }));
        const label = isSequence ? `bis ${RANK_NAMES[rank]}` : RANK_NAMES[rank];
        return (
          <button
            key={rank}
            type="button"
            className={`meld-option rank-option${selected === rank ? ' selected' : ''}`}
            aria-label={`${def.name} ${label}`}
            aria-pressed={selected === rank}
            onClick={() => onPick(rank)}
          >
            <CardFan cards={cards} width={24} />
            <span className="meld-option__name">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
