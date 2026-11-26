import { portraitLockStyle } from './usePortraitLock';

describe('portraitLockStyle', () => {
  it('does nothing in portrait', () => {
    expect(portraitLockStyle(390, 844, 0)).toBeNull();
  });

  it('keeps landscape on tablets (enough room)', () => {
    expect(portraitLockStyle(1024, 768, 90)).toBeNull();
  });

  it('rotates a phone turned counter-clockwise back to portrait', () => {
    const style = portraitLockStyle(844, 390, 90)!;
    expect(style).toMatchObject({ width: '390px', height: '844px', transform: 'rotate(-90deg) translateX(-100%)' });
    // the notch (left side of the landscape screen) becomes the top of the board
    expect(style).toMatchObject({ '--inset-top': 'env(safe-area-inset-left)', '--inset-bottom': 'env(safe-area-inset-right)' });
  });

  it('rotates a phone turned clockwise back to portrait', () => {
    for (const angle of [270, -90]) {
      const style = portraitLockStyle(844, 390, angle)!;
      expect(style).toMatchObject({ width: '390px', height: '844px', transform: 'rotate(90deg) translateY(-100%)' });
      expect(style).toMatchObject({ '--inset-top': 'env(safe-area-inset-right)' });
    }
  });
});
