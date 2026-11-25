import { useEffect } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}

interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

/**
 * Keeps the screen on while the page is open and visible (Screen Wake Lock API).
 * Browsers release the lock when the tab is hidden or the phone is locked, so it is
 * requested again whenever the page becomes visible and on the next tap if a request
 * was refused (some browsers only allow it after a user interaction).
 * Requires HTTPS (or localhost); does nothing in browsers without support.
 */
export function useWakeLock(enabled = true): void {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
    if (!enabled || !wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let pending = false;
    let disposed = false;

    const acquire = async () => {
      if (disposed || pending || document.visibilityState !== 'visible') return;
      if (sentinel && !sentinel.released) return;
      pending = true;
      try {
        const lock = await wakeLock.request('screen');
        if (disposed) {
          void lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // Refused (e.g. no user interaction yet, battery saver) – retried on the next tap or visibility change.
      } finally {
        pending = false;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    const onInteraction = () => void acquire();

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('pointerdown', onInteraction);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('pointerdown', onInteraction);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [enabled]);
}
