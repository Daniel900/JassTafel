import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RulesDialog } from './RulesDialog';

describe('RulesDialog', () => {
  it('contains all chapters of the rules and instructions', () => {
    render(<RulesDialog onClose={vi.fn()} />);
    for (const chapter of [
      '1. Überblick',
      '2. Karten',
      '3. Trumpf',
      '4. Spielablauf',
      '5. Kartenpunkte',
      '6. Melden',
      '7. Spielende & Siege',
      '8. So bedient ihr die Tafel',
    ]) {
      expect(screen.getByText(chapter)).toBeInTheDocument();
    }
  });

  it('states the house rules with the values used by the app', () => {
    render(<RulesDialog onClose={vi.fn()} />);
    const text = screen.getByRole('dialog').textContent ?? '';
    expect(text).toContain('Skat-Blatt');
    expect(text).toContain('Man muss immer die ausgespielte Farbe angeben');
    expect(text).not.toContain('am Tisch fest');
    expect(text).toContain('5 Punkte für den letzten Stich');
    expect(text).toContain('157 Punkte');
    expect(text).toContain('257');
    expect(text).toContain('1000 Punkte');
    expect(text).toContain('weniger als 500 Punkte');
    expect(text).toContain('höchsten einzelnen Meldung');
    expect(text).toContain('Team, das den Trumpf hat');
    for (const meld of ['Dreiblatt', 'Vierblatt', 'Fünfblatt', 'Vierling', 'Vier Nell', 'Vier Buur', 'Steck']) {
      expect(text).toContain(meld);
    }
  });

  it('closes', async () => {
    const onClose = vi.fn();
    render(<RulesDialog onClose={onClose} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Schliessen' }));
    expect(onClose).toHaveBeenCalled();
  });
});
