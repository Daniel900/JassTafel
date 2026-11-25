import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CenterBar } from './CenterBar';

describe('CenterBar', () => {
  it('shows the round and opens the menu', async () => {
    const onMenu = vi.fn();
    render(<CenterBar round={3} onMenu={onMenu} />);
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 3');
    expect(screen.queryByRole('group', { name: 'Trumpf' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Menü' }));
    expect(onMenu).toHaveBeenCalled();
  });
});
