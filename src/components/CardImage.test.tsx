import { render, screen } from '@testing-library/react';
import { CardFan, CardImage } from './CardImage';
import { MeldIcon } from './MeldIcon';

describe('CardImage', () => {
  it('renders an accessible card', () => {
    render(<CardImage card={{ suit: 'herz', rank: 'K' }} />);
    expect(screen.getByRole('img', { name: 'Herz König' })).toBeInTheDocument();
  });

  it('renders a fan of cards', () => {
    render(<CardFan cards={[{ suit: 'pik', rank: '7' }, { suit: 'pik', rank: '8' }]} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('renders meld images', () => {
    render(<MeldIcon type="vierBuur" />);
    expect(screen.getAllByRole('img').map((i) => i.getAttribute('aria-label'))).toEqual([
      'Kreuz Bauer',
      'Pik Bauer',
      'Herz Bauer',
      'Karo Bauer',
    ]);
  });
});
