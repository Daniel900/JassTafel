import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Meld, MeldTie } from '../domain/melds';
import { TieDialog } from './TieDialog';

const setup = (melds: [Meld[], Meld[]], tie: MeldTie, rotateTop = true) => {
  const onPick = vi.fn();
  const onLater = vi.fn();
  render(
    <TieDialog tie={tie} teamNames={['Hirsche', 'Gäste']} melds={melds} rotateTop={rotateTop} onPick={onPick} onLater={onLater} />,
  );
  return { onPick, onLater, user: userEvent.setup() };
};

describe('TieDialog', () => {
  it('lets each team choose its highest card on its own half', async () => {
    const { onPick, user } = setup([[{ id: 'a', type: 'dreiblatt' }], [{ id: 'b', type: 'dreiblatt' }]], {
      type: 'dreiblatt',
      missing: [true, true],
    });
    expect(screen.getByRole('dialog', { name: 'Gleiche Meldung' })).toHaveTextContent('Beide: Dreiblatt');
    const top = screen.getByTestId('tie-0');
    const bottom = screen.getByTestId('tie-1');
    expect(top).toHaveClass('rotated');
    expect(bottom).not.toHaveClass('rotated');
    expect(top).toHaveTextContent('Hirsche: Bis zu welcher Karte?');
    // Dreiblatt: 6 options (bis 9 … bis Ass)
    expect(within(top).getAllByRole('button')).toHaveLength(6);

    await user.click(within(top).getByRole('button', { name: 'Dreiblatt bis Ass' }));
    await user.click(within(bottom).getByRole('button', { name: 'Dreiblatt bis König' }));
    expect(onPick).toHaveBeenNthCalledWith(1, 0, 'A');
    expect(onPick).toHaveBeenNthCalledWith(2, 1, 'K');
  });

  it('shows what a team already chose', () => {
    setup([[{ id: 'a', type: 'vierling', rank: 'D' }], [{ id: 'b', type: 'vierling' }]], {
      type: 'vierling',
      missing: [false, true],
    });
    const top = screen.getByTestId('tie-0');
    expect(top).toHaveTextContent('Welche Karte?');
    expect(within(top).getByRole('button', { name: 'Vierling Dame' })).toHaveAttribute('aria-pressed', 'true');
    expect(top).toHaveTextContent('✓ gewählt');
    expect(screen.getByTestId('tie-1')).toHaveTextContent('noch offen');
  });

  it('can be postponed and does not rotate when the board is not rotated', async () => {
    const { onLater, user } = setup([[], []], { type: 'fuenfblatt', missing: [true, true] }, false);
    expect(screen.getByTestId('tie-0')).not.toHaveClass('rotated');
    await user.click(screen.getByRole('button', { name: 'Später' }));
    expect(onLater).toHaveBeenCalled();
  });
});
