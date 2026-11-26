import { iosStandaloneFrameStyle, portraitLockStyle } from './usePortraitLock';

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

describe('portraitLockStyle in the iPhone home-screen app', () => {
  it('uses the real screen size for the rotated board', () => {
    expect(portraitLockStyle(844, 380, 90, { width: 390, height: 844 })).toMatchObject({ width: '390px', height: '844px' });
  });
});

describe('iosStandaloneFrameStyle', () => {
  it('uses the real screen height in the iPhone home-screen app (status bar bug)', () => {
    // iOS reports 793 instead of 852 (status bar missing) – the frame still covers the whole screen
    expect(iosStandaloneFrameStyle(393, 793, 852, true)).toMatchObject({ top: 0, height: '852px', width: '100%' });
  });

  it('does nothing in the browser, on Android or in landscape', () => {
    expect(iosStandaloneFrameStyle(393, 700, 852, false)).toBeNull();
    expect(iosStandaloneFrameStyle(852, 393, 852, true)).toBeNull();
  });
});
