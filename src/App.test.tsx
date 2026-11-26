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

    // Team 2 melds a Vierblatt – one tap, no card question (Team 1 has nothing comparable)
    await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Melden' }));
    await user.click(screen.getByRole('button', { name: 'Vierblatt' }));
    expect(within(screen.getByTestId('team-1')).getByText(/Vierblatt/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

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

  it('asks both teams for their highest card only when both meld the same kind', async () => {
    const user = userEvent.setup();
    render(<App />);
    const meld = async (team: 0 | 1, name: string) => {
      await user.click(within(screen.getByTestId(`team-${team}`)).getByRole('button', { name: 'Melden' }));
      await user.click(screen.getByRole('button', { name }));
    };
    await meld(0, 'Dreiblatt');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // second team melds the same kind → split screen appears
    await meld(1, 'Dreiblatt');
    const tie = screen.getByRole('dialog', { name: 'Gleicher Weis' });
    await user.click(within(within(tie).getByTestId('tie-0')).getByRole('button', { name: 'Dreiblatt bis König' }));
    expect(screen.getByRole('dialog', { name: 'Gleicher Weis' })).toBeInTheDocument(); // team 2 still open
    await user.click(within(within(tie).getByTestId('tie-1')).getByRole('button', { name: 'Dreiblatt bis Ass' }));
    expect(screen.queryByRole('dialog', { name: 'Gleicher Weis' })).not.toBeInTheDocument();
    expect(within(screen.getByTestId('team-1')).getByText(/Dreiblatt bis Ass/)).toBeInTheDocument();

    // Team 2 has the higher Dreiblatt → only Team 2's Weis counts (Team 1 has Trumpf, but Ass > König)
    await user.click(within(screen.getByTestId('team-0')).getByRole('button', { name: 'Punkte' }));
    await enter(user, '80');
    expect(screen.getByTestId('total-0')).toHaveTextContent('80');
    expect(screen.getByTestId('total-1')).toHaveTextContent('97'); // 77 + 20
  });

  it('a postponed card question must be answered before the points can be entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (const team of [0, 1] as const) {
      await user.click(within(screen.getByTestId(`team-${team}`)).getByRole('button', { name: 'Melden' }));
      await user.click(screen.getByRole('button', { name: 'Vierling' }));
    }
    await user.click(screen.getByRole('button', { name: 'Später' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // "Punkte" brings the question back first …
    await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Punkte' }));
    const tie = screen.getByRole('dialog', { name: 'Gleicher Weis' });
    expect(tie).toHaveTextContent('(vor den Punkten)');
    expect(screen.queryByRole('dialog', { name: /Punkte/ })).not.toBeInTheDocument();

    // … "Zurück" cancels both …
    await user.click(within(tie).getByRole('button', { name: 'Zurück' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // … and after both teams have chosen, the points screen of the tapping team opens by itself
    await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Punkte' }));
    await user.click(within(screen.getByTestId('tie-0')).getByRole('button', { name: 'Vierling Ass' }));
    await user.click(within(screen.getByTestId('tie-1')).getByRole('button', { name: 'Vierling König' }));
    expect(screen.queryByRole('dialog', { name: 'Gleicher Weis' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Punkte – Team 2' })).toBeInTheDocument();
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

  it('shows the winner at 1000 points, counts the wins and keeps them for the next game', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('wins-1')).toHaveTextContent('0 Siege');
    for (let i = 0; i < 4; i++) {
      await user.click(within(screen.getByTestId('team-1')).getByRole('button', { name: 'Punkte' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Match' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Bestätigen' }));
    }
    const dialog = screen.getByRole('dialog', { name: 'Spielende' });
    expect(within(dialog).getByText('Team 2 gewinnt!')).toBeInTheDocument();
    // team 1 has 0 points (< 500) → 2 wins
    expect(within(dialog).getByTestId('award')).toHaveTextContent('+2 Siege');
    expect(within(dialog).getByTestId('final-wins-1')).toHaveTextContent('2');

    await user.click(within(dialog).getByRole('button', { name: 'Nächstes Spiel' }));
    expect(screen.getByTestId('total-1')).toHaveTextContent('0');
    expect(screen.getByTestId('round')).toHaveTextContent('Runde 1');
    expect(screen.getByTestId('wins-1')).toHaveTextContent('2 Siege');

    // "Neuer Jass-Abend" in the menu resets the win counter
    await user.click(screen.getByRole('button', { name: 'Menü' }));
    await user.click(screen.getByRole('button', { name: 'Neuer Jass-Abend' }));
    expect(screen.getByTestId('wins-1')).toHaveTextContent('0 Siege');
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

  it('opens the rules from the menu and returns to the menu', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Menü' }));
    await user.click(screen.getByRole('button', { name: 'Regeln & Anleitung' }));
    expect(screen.getByRole('dialog', { name: 'Regeln & Anleitung' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Schliessen' }));
    expect(screen.getByRole('dialog', { name: 'Menü' })).toBeInTheDocument();
  });

  it('renames a team', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Die Bauern');
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Team 1' }));
    expect(screen.getByRole('button', { name: 'Die Bauern' })).toBeInTheDocument();
  });
});
