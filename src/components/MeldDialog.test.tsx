import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MeldDialog } from './MeldDialog';

const setup = () => {
  const onAdd = vi.fn();
  const onClose = vi.fn();
  render(<MeldDialog teamName="Team 1" onAdd={onAdd} onClose={onClose} />);
  return { onAdd, onClose, user: userEvent.setup() };
};

describe('MeldDialog', () => {
  it('shows all meld types', () => {
    setup();
    for (const name of ['Dreiblatt', 'Vierblatt', 'Fünfblatt', 'Vierling', 'Vier Nell', 'Vier Buur', 'Steck']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('asks for the highest card of a Dreiblatt', async () => {
    const { onAdd, onClose, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Dreiblatt' }));
    // only the highest card is chosen, no suit; 7 and 8 cannot be the highest card
    expect(screen.queryByRole('button', { name: 'Dreiblatt bis 8' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Dreiblatt bis / })).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Dreiblatt bis Ass' }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ type: 'dreiblatt', rank: 'A' }));
    expect(onAdd.mock.calls[0][0]).not.toHaveProperty('highCard');
    expect(onClose).toHaveBeenCalled();
  });

  it('only offers valid highest cards for a Fünfblatt', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Fünfblatt' }));
    expect(screen.queryByRole('button', { name: 'Fünfblatt bis 10' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fünfblatt bis Bauer' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Fünfblatt bis / })).toHaveLength(4);
  });

  it('asks for the card type of a Vierling', async () => {
    const { onAdd, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Vierling' }));
    await user.click(screen.getByRole('button', { name: 'Vierling König' }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ type: 'vierling', rank: 'K' }));
  });

  it('adds melds without selection directly', async () => {
    const { onAdd, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Steck' }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ type: 'steck' }));
  });

  it('can go back to the overview', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Vierblatt' }));
    await user.click(screen.getByRole('button', { name: '‹ Zurück' }));
    expect(screen.getByRole('button', { name: 'Steck' })).toBeInTheDocument();
  });
});
