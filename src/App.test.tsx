import { act, render, screen, within } from '@testing-library/react';
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

    // Team 2 melds a Vierblatt up to Ass
    await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Melden' }));
    await user.click(screen.getByRole('button', { name: 'Vierblatt' }));
    await user.click(screen.getByRole('button', { name: 'Vierblatt bis Ass' }));
    expect(within(screen.getByTestId('team-1')).getByText(/Vierblatt bis Ass/)).toBeInTheDocument();

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
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Match' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Bestätigen' }));
    expect(screen.getByTestId('total-1')).toHaveTextContent('257');
    await user.click(screen.getByRole('button', { name: 'Menü' }));
    await user.click(screen.getByRole('button', { name: 'Letzte Runde rückgängig' }));
    await user.click(screen.getByRole('button', { name: 'Schliessen' }));
    expect(screen.getByTestId('total-1')).toHaveTextContent('0');
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 1');
  });

  it('moves the Trumpf indicator to the other team after each round', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('trump-badge-0')).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(screen.getByTestId('team-0')).getByRole('button', { name: 'Punkte' }));
    await enter(user, '80');
    expect(screen.getByTestId('trump-badge-1')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('trump-badge-0')).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the winner at 1000 points and allows a new game', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (let i = 0; i < 4; i++) {
      await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Punkte' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Match' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Bestätigen' }));
    }
    const dialog = screen.getByRole('dialog', { name: 'Spielende' });
    expect(within(dialog).getByText('Team 2 gewinnt!')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Neues Spiel' }));
    expect(screen.getByTestId('total-1')).toHaveTextContent('0');
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 1');
  });

  it('switches to the black outline mode after 30 s and back on a tap, with buttons still working', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);
      const tafel = screen.getByTestId('tafel');
      expect(tafel).not.toHaveClass('tafel--idle');
      act(() => vi.advanceTimersByTime(30_000));
      expect(tafel).toHaveClass('tafel--idle');
      // pixel shift is doubled in outline mode
      act(() => vi.advanceTimersByTime(60_000));
      expect(tafel.style.transform).toBe('translate(4px, 2px)');

      // a tap on a button works directly and leaves the outline mode
      await user.click(within(screen.getByTestId('team-0')).getByRole('button', { name: 'Punkte' }));
      expect(tafel).not.toHaveClass('tafel--idle');
      expect(tafel.style.transform).toBe('translate(2px, 1px)');
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // no outline mode while a dialog is open
      act(() => vi.advanceTimersByTime(60_000));
      expect(tafel).not.toHaveClass('tafel--idle');
    } finally {
      vi.useRealTimers();
    }
  });

  it('renames a team', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Die Bauern');
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Team 1' }));
    expect(screen.getByRole('button', { name: 'Die Bauern' })).toBeInTheDocument();
  });
});
