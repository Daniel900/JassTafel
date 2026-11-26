import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame, gameReducer } from '../domain/game';
import { MenuDialog } from './MenuDialog';

describe('MenuDialog', () => {
  it('shows the history and offers undo / new game', async () => {
    const state = gameReducer(createGame(), { type: 'confirmRound', team: 0, points: 100 });
    const props = { onToggleRotate: vi.fn(), onUndo: vi.fn(), onNewGame: vi.fn(), onShowRules: vi.fn(), onClose: vi.fn() };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MenuDialog state={state} rotateTop {...props} />);
    const user = userEvent.setup();
    expect(screen.getByRole('cell', { name: '100' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '57' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Letzte Runde rückgängig' }));
    await user.click(screen.getByRole('button', { name: 'Neuer Jass-Abend' }));
    await user.click(screen.getByRole('checkbox'));
    expect(props.onUndo).toHaveBeenCalled();
    expect(props.onNewGame).toHaveBeenCalled();
    expect(props.onToggleRotate).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Regeln & Anleitung' }));
    expect(props.onShowRules).toHaveBeenCalled();
  });

  it('disables undo without history', () => {
    render(
      <MenuDialog
        state={createGame()}
        rotateTop
        onToggleRotate={vi.fn()}
        onUndo={vi.fn()}
        onNewGame={vi.fn()}
        onShowRules={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Letzte Runde rückgängig' })).toBeDisabled();
  });
});
