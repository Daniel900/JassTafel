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

  it.each(['Dreiblatt', 'Vierblatt', 'Fünfblatt', 'Vierling', 'Steck'])(
    'adds a %s with one tap, without asking for a card',
    async (name) => {
      const { onAdd, onClose, user } = setup();
      await user.click(screen.getByRole('button', { name }));
      expect(onAdd).toHaveBeenCalledTimes(1);
      expect(onAdd.mock.calls[0][0]).not.toHaveProperty('rank');
      expect(onClose).toHaveBeenCalled();
    },
  );
});
