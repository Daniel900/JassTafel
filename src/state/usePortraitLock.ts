import { type CSSProperties, useEffect, useState } from 'react';

/** Phones (short side below this) are kept in portrait; tablets may use landscape. */
export const PORTRAIT_LOCK_MAX_SHORT_SIDE = 600;

/**
 * Style for the app frame that keeps the portrait layout on a phone held in landscape:
 * the frame gets the portrait size and is rotated back by 90°, so the board stays
 * exactly where it was relative to the phone. `angle` is the screen orientation angle
 * (90 = turned counter-clockwise, 270 = turned clockwise). Returns null when no rotation is needed.
 */
export function portraitLockStyle(
  width: number,
  height: number,
  angle: number,
  /** Real portrait screen size (iPhone home-screen app), used instead of the reported size. */
  portraitScreen?: { width: number; height: number },
): CSSProperties | null {
  const landscape = width > height;
  if (!landscape || Math.min(width, height) >= PORTRAIT_LOCK_MAX_SHORT_SIDE) return null;
  const base: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${portraitScreen?.width ?? height}px`,
    height: `${portraitScreen?.height ?? width}px`,
    transformOrigin: 'top left',
  };
  // The safe areas (notch, home indicator) of the landscape screen are mapped onto the rotated board.
  const insets = (top: string, right: string, bottom: string, left: string) =>
    ({
      '--inset-top': `env(safe-area-inset-${top})`,
      '--inset-right': `env(safe-area-inset-${right})`,
      '--inset-bottom': `env(safe-area-inset-${bottom})`,
      '--inset-left': `env(safe-area-inset-${left})`,
    }) as CSSProperties;
  // phone turned clockwise (270): the portrait top is on the right
  if (angle === 270 || angle === -90) {
    return { ...base, ...insets('right', 'bottom', 'left', 'top'), transform: 'rotate(90deg) translateY(-100%)' };
  }
  // phone turned counter-clockwise (90) or unknown: the portrait top is on the left
  return { ...base, ...insets('left', 'top', 'right', 'bottom'), transform: 'rotate(-90deg) translateX(-100%)' };
}

/**
 * iPhone home-screen app (standalone) in portrait: iOS sometimes reports the visible height
 * without the status bar while the page still starts under it, so the board ended one
 * status-bar height above the bottom edge. In a home-screen app the page always covers the
 * whole screen, so the frame simply gets the real screen height. Returns null elsewhere.
 */
export function iosStandaloneFrameStyle(
  innerWidth: number,
  innerHeight: number,
  screenHeight: number,
  iosStandalone: boolean,
): CSSProperties | null {
  if (!iosStandalone || innerWidth > innerHeight || !screenHeight) return null;
  return { position: 'fixed', top: 0, left: 0, width: '100%', height: `${screenHeight}px` };
}

/** `navigator.standalone` exists only on iOS and is true for apps started from the home screen. */
const isIosStandalone = () => (navigator as Navigator & { standalone?: boolean }).standalone === true;

function currentAngle(): number {
  const so = typeof screen !== 'undefined' ? screen.orientation : undefined;
  if (so && typeof so.angle === 'number') return so.angle;
  // older iOS Safari
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === 'number' ? legacy : 0;
}

/**
 * Keeps the app in portrait on phones: asks the browser to lock the orientation where that
 * is allowed (Android home-screen app), and otherwise rotates the layout back (iPhone).
 */
export function usePortraitLock(): CSSProperties | null {
  const compute = () =>
    portraitLockStyle(
      window.innerWidth,
      window.innerHeight,
      currentAngle(),
      // iOS reports screen.width/height in portrait orientation, also when the phone is turned
      isIosStandalone() ? { width: Math.min(screen.width, screen.height), height: Math.max(screen.width, screen.height) } : undefined,
    ) ??
    iosStandaloneFrameStyle(window.innerWidth, window.innerHeight, screen.height, isIosStandalone());
  const [style, setStyle] = useState<CSSProperties | null>(compute);

  useEffect(() => {
    const update = () => setStyle(compute());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    screen.orientation?.addEventListener?.('change', update);
    // Only works for installed apps on some browsers (e.g. Android); harmless elsewhere.
    const lockable = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    lockable?.lock?.('portrait').catch(() => {});
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      screen.orientation?.removeEventListener?.('change', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return style;
}
