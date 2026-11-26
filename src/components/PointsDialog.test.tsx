import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame, gameReducer } from '../domain/game';
import { PointsDialog } from './PointsDialog';

const state = gameReducer(createGame(), {
  type: 'addMeld',
  team: 0,
  meld: { id: 'm', type: 'vierblatt', rank: 'A' },
});

const setup = (team: 0 | 1 = 0) => {
  const onConfirm = vi.fn();
  render(<PointsDialog state={state} team={team} onConfirm={onConfirm} onClose={vi.fn()} />);
  return { onConfirm, user: userEvent.setup() };
};

const type = async (user: ReturnType<typeof userEvent.setup>, digits: string) => {
  for (const d of digits) await user.click(screen.getByRole('button', { name: d }));
};

describe('PointsDialog', () => {
  it('calculates the points of the other team and previews melds', async () => {
    const { onConfirm, user } = setup();
    await type(user, '97');
    expect(screen.getByTestId('preview-cards-0')).toHaveTextContent('97');
    expect(screen.getByTestId('preview-cards-1')).toHaveTextContent('60');
    expect(screen.getByTestId('preview-melds-0')).toHaveTextContent('+50');
    await user.click(screen.getByRole('button', { name: 'Bestätigen' }));
    expect(onConfirm).toHaveBeenCalledWith(97);
  });

  it('keeps 157 as 157 and uses the Match preset for 257', async () => {
    const { user } = setup(1);
    await type(user, '157');
    expect(screen.getByTestId('preview-cards-1')).toHaveTextContent('157');
    expect(screen.getByTestId('preview-cards-0')).toHaveTextContent('0');
    // team 0 made no point → its melds do not count
    expect(screen.getByTestId('preview-melds-0')).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: 'Match' }));
    expect(screen.getByTestId('points-input')).toHaveTextContent('257');
    expect(screen.getByTestId('preview-cards-1')).toHaveTextContent('257');
  });

  it('disables confirm for invalid values', async () => {
    const { user } = setup();
    await type(user, '200');
    expect(screen.getByRole('button', { name: 'Bestätigen' })).toBeDisabled();
    expect(screen.getByText(/Erlaubt sind/)).toBeInTheDocument();
  });

  it('supports delete, clear and the Match shortcut', async () => {
    const { onConfirm, user } = setup();
    await type(user, '12');
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    expect(screen.getByTestId('points-input')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'C' }));
    expect(screen.getByTestId('points-input')).toHaveTextContent('0');
    await user.click(screen.getByRole('button', { name: 'Match' }));
    await user.click(screen.getByRole('button', { name: 'Bestätigen' }));
    expect(onConfirm).toHaveBeenCalledWith(257);
  });

  it('cannot confirm while both teams still have to choose their highest card', async () => {
    let tied = gameReducer(createGame(), { type: 'addMeld', team: 0, meld: { id: 'a', type: 'dreiblatt' } });
    tied = gameReducer(tied, { type: 'addMeld', team: 1, meld: { id: 'b', type: 'dreiblatt' } });
    const onConfirm = vi.fn();
    render(<PointsDialog state={tied} team={0} onConfirm={onConfirm} onClose={vi.fn()} />);
    const user = userEvent.setup();
    await type(user, '80');
    expect(screen.getByTestId('tie-hint')).toHaveTextContent('zuerst die höchste Karte wählen');
    expect(screen.getByRole('button', { name: 'Bestätigen' })).toBeDisabled();
  });
});
