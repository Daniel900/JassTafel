import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const enter = async (user: ReturnType<typeof userEvent.setup>, digits: string) => {
  const dialog = screen.getByRole('dialog');
  for (const d of digits) await user.click(within(dialog).getByRole('button', { name: d }));
  await user.click(within(dialog).getByRole('button', { name: 'Bestätigen' }));
};

describe('App', () => {
  it('plays a round with melds and keeps the state after a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 1');

    // Team 2 melds a Vierblatt up to Pik Ass
    await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Melden' }));
    await user.click(screen.getByRole('button', { name: 'Vierblatt' }));
    await user.click(screen.getByRole('img', { name: 'Pik Ass' }));
    expect(within(screen.getByTestId('team-1')).getByText(/Vierblatt bis Pik Ass/)).toBeInTheDocument();

    // Team 1 has a Steck
    await user.click(within(screen.getByTestId('team-0')).getByRole('button', { name: 'Melden' }));
    await user.click(screen.getByRole('button', { name: 'Steck' }));

    // Team 1 enters its card points
    await user.click(within(screen.getByTestId('team-0')).getByRole('button', { name: 'Punkte' }));
    await enter(user, '60');

    expect(screen.getByTestId('total-0')).toHaveTextContent('80'); // 60 + Steck 20
    expect(screen.getByTestId('total-1')).toHaveTextContent('147'); // 97 + Vierblatt 50
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 2');

    // reload
    unmount();
    render(<App />);
    expect(screen.getByTestId('total-0')).toHaveTextContent('80');
    expect(screen.getByTestId('total-1')).toHaveTextContent('147');
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 2');
  });

  it('undoes the last round from the menu', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Punkte' }));
    await enter(user, '157');
    expect(screen.getByTestId('total-1')).toHaveTextContent('257');
    await user.click(screen.getByRole('button', { name: 'Menü' }));
    await user.click(screen.getByRole('button', { name: 'Letzte Runde rückgängig' }));
    await user.click(screen.getByRole('button', { name: 'Schliessen' }));
    expect(screen.getByTestId('total-1')).toHaveTextContent('0');
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 1');
  });

  it('renames a team', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Die Bauern');
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Team 1' }));
    expect(screen.getByRole('button', { name: 'Die Bauern' })).toBeInTheDocument();
  });
});
