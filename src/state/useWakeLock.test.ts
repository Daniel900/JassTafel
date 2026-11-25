import { act, renderHook } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

type Listener = () => void;

function createSentinel() {
  const listeners: Listener[] = [];
  const sentinel = {
    released: false,
    release: vi.fn(async () => {
      sentinel.released = true;
      listeners.forEach((l) => l());
    }),
    addEventListener: (_: 'release', l: Listener) => listeners.push(l),
  };
  return sentinel;
}

let visibility: DocumentVisibilityState = 'visible';
const flush = () => act(async () => {});

function installWakeLock(request: () => Promise<ReturnType<typeof createSentinel>>) {
  const wakeLock = { request: vi.fn(request) };
  Object.defineProperty(navigator, 'wakeLock', { value: wakeLock, configurable: true });
  return wakeLock;
}

beforeEach(() => {
  visibility = 'visible';
  Object.defineProperty(document, 'visibilityState', { get: () => visibility, configurable: true });
});

afterEach(() => {
  delete (navigator as unknown as Record<string, unknown>).wakeLock;
});

describe('useWakeLock', () => {
  it('requests a screen wake lock when the page is open', async () => {
    const wakeLock = installWakeLock(async () => createSentinel());
    renderHook(() => useWakeLock());
    await flush();
    expect(wakeLock.request).toHaveBeenCalledWith('screen');
    expect(wakeLock.request).toHaveBeenCalledTimes(1);
  });

  it('requests it again when the page becomes visible after being released', async () => {
    const sentinels: ReturnType<typeof createSentinel>[] = [];
    const wakeLock = installWakeLock(async () => {
      const s = createSentinel();
      sentinels.push(s);
      return s;
    });
    renderHook(() => useWakeLock());
    await flush();

    // the browser releases the lock when the page is hidden (e.g. phone locked)
    visibility = 'hidden';
    await act(async () => {
      await sentinels[0].release();
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(wakeLock.request).toHaveBeenCalledTimes(1);

    visibility = 'visible';
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(wakeLock.request).toHaveBeenCalledTimes(2);
  });

  it('retries on the next tap if the request was refused', async () => {
    let refuse = true;
    const wakeLock = installWakeLock(async () => {
      if (refuse) throw new Error('NotAllowedError');
      return createSentinel();
    });
    renderHook(() => useWakeLock());
    await flush();
    expect(wakeLock.request).toHaveBeenCalledTimes(1);

    refuse = false;
    await act(async () => {
      document.dispatchEvent(new Event('pointerdown'));
    });
    expect(wakeLock.request).toHaveBeenCalledTimes(2);

    // already held → further taps don't request again
    await act(async () => {
      document.dispatchEvent(new Event('pointerdown'));
    });
    expect(wakeLock.request).toHaveBeenCalledTimes(2);
  });

  it('releases the lock when the app is closed', async () => {
    const sentinel = createSentinel();
    installWakeLock(async () => sentinel);
    const { unmount } = renderHook(() => useWakeLock());
    await flush();
    unmount();
    expect(sentinel.release).toHaveBeenCalled();
  });

  it('does nothing in browsers without support', () => {
    expect(() => renderHook(() => useWakeLock())).not.toThrow();
  });
});
