import type { Rank } from '../domain/cards';
import type { TeamIndex } from '../domain/game';
import { MELD_DEFINITIONS, type Meld, type MeldTie, chosenRank } from '../domain/melds';
import { RankPicker } from './RankPicker';

interface Props {
  tie: MeldTie;
  teamNames: [string, string];
  melds: [Meld[], Meld[]];
  /** Rotate the top half (team 1) like the board. */
  rotateTop: boolean;
  onPick: (team: TeamIndex, rank: Rank) => void;
  onLater: () => void;
}

/**
 * Both teams have the same kind of Weis as their highest one: each team chooses its
 * highest card on its own half of the screen. Closes by itself once both have chosen.
 */
export function TieDialog({ tie, teamNames, melds, rotateTop, onPick, onLater }: Props) {
  const def = MELD_DEFINITIONS[tie.type];
  const question = def.needs === 'highRank' ? 'Bis zu welcher Karte?' : 'Welche Karte?';

  const half = (team: TeamIndex) => {
    const selected = chosenRank(melds[team], tie.type);
    return (
      <section
        className={`tie__half tie__half--${team}${team === 0 && rotateTop ? ' rotated' : ''}`}
        aria-label={`Höchste Karte ${teamNames[team]}`}
        data-testid={`tie-${team}`}
      >
        <h3 className="tie__title">
          {teamNames[team]}: {question}
        </h3>
        <RankPicker type={tie.type} selected={selected} onPick={(rank) => onPick(team, rank)} />
        <p className="tie__status">{selected ? '✓ gewählt' : 'noch offen'}</p>
      </section>
    );
  };

  return (
    <div className="tie" role="dialog" aria-modal="true" aria-label="Gleicher Weis">
      {half(0)}
      <div className="tie__bar">
        <span>
          Beide: <strong>{def.name}</strong> – höchste Karte wählen
        </span>
        <button type="button" className="link-btn tie__later" onClick={onLater}>
          Später
        </button>
      </div>
      {half(1)}
    </div>
  );
}
