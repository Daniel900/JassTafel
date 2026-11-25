import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamPanel } from './TeamPanel';

describe('TeamPanel', () => {
  it('shows name, total and melds and triggers actions', async () => {
    const handlers = { onMeld: vi.fn(), onPoints: vi.fn(), onRemoveMeld: vi.fn(), onRename: vi.fn() };
    render(
      <TeamPanel index={0} name="Hirsche" total={412} melds={[{ id: 's', type: 'steck' }]} rotated {...handlers} />,
    );
    const user = userEvent.setup();
    expect(screen.getByTestId('total-0')).toHaveTextContent('412');
    expect(screen.getByTestId('team-0')).toHaveClass('rotated');
    expect(screen.getByText('Steck')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Melden' }));
    await user.click(screen.getByRole('button', { name: 'Punkte' }));
    await user.click(screen.getByRole('button', { name: 'Steck entfernen' }));
    await user.click(screen.getByRole('button', { name: 'Hirsche' }));
    expect(handlers.onMeld).toHaveBeenCalled();
    expect(handlers.onPoints).toHaveBeenCalled();
    expect(handlers.onRemoveMeld).toHaveBeenCalledWith('s');
    expect(handlers.onRename).toHaveBeenCalled();
  });
});
