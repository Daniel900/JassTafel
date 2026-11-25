import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CenterBar } from './CenterBar';

describe('CenterBar', () => {
  it('shows the round and toggles trump', async () => {
    const onTrump = vi.fn();
    const { rerender } = render(<CenterBar round={3} trump={null} onTrump={onTrump} onMenu={vi.fn()} />);
    const user = userEvent.setup();
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 3');
    await user.click(screen.getByRole('button', { name: 'Trumpf Herz' }));
    expect(onTrump).toHaveBeenLastCalledWith('herz');
    rerender(<CenterBar round={3} trump="herz" onTrump={onTrump} onMenu={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Trumpf Herz' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Trumpf Herz' }));
    expect(onTrump).toHaveBeenLastCalledWith(null);
  });
});
