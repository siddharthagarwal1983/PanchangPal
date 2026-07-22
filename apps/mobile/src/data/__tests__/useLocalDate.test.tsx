/**
 * HOOK_useLocalDate tests (ADR-026, issue #30, increment 3).
 *
 * Two defects are under test, and they are separate:
 *   1. the WRONG ZONE — a UTC date named yesterday for a whole NZ/AU morning;
 *   2. the WRONG LIFETIME — a module-scope constant never refreshed, so an app open across
 *      midnight kept yesterday's date and, with it, yesterday's ritual session key.
 *
 * Time is driven by fake timers and an explicit system time throughout. A test that read the
 * real clock or the machine's zone would pass in IST and fail in Auckland — which is precisely
 * the bug it is meant to guard.
 */
import { renderHook, act, cleanup } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useLocalDate } from '../hooks/useLocalDate';
import { usePrefsStore } from '../../store/prefs';

const setZone = (timezone: string | null) => usePrefsStore.getState().setPrefs({ timezone });

describe('useLocalDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setZone(null);
  });

  afterEach(() => {
    // The hook always has a rollover timer armed. Left pending, it fires inside a LATER test —
    // after RNTL has unmounted the component — and React surfaces that as an unrelated
    // AggregateError in whichever test happens to be running.
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('returns null until the zone is known, rather than guessing a day', () => {
    jest.setSystemTime(new Date('2026-07-22T21:00:00Z'));
    const { result } = renderHook(() => useLocalDate());
    expect(result.current).toBeNull();
  });

  it('names the local day, not the UTC day', () => {
    // 21:00Z on 22 July is already 09:00 on the 23rd in Auckland — the morning ritual slot.
    jest.setSystemTime(new Date('2026-07-22T21:00:00Z'));
    setZone('Pacific/Auckland');

    const { result } = renderHook(() => useLocalDate());
    expect(result.current).toBe('2026-07-23');
  });

  it('gives the same instant a different day in a different zone', () => {
    jest.setSystemTime(new Date('2026-07-23T01:00:00Z'));
    setZone('America/New_York');

    const { result } = renderHook(() => useLocalDate());
    // Still Wednesday evening in New York while UTC has rolled over to Thursday.
    expect(result.current).toBe('2026-07-22');
  });

  it('rolls over on its own while the app stays open', () => {
    // 23:59:30 local in New York (EDT, UTC-4).
    jest.setSystemTime(new Date('2026-07-23T03:59:30Z'));
    setZone('America/New_York');

    const { result } = renderHook(() => useLocalDate());
    expect(result.current).toBe('2026-07-22');

    // Past local midnight. The old module-scope constant would have stayed on the 22nd
    // indefinitely — and the ritual session key with it.
    act(() => {
      jest.advanceTimersByTime(31_000);
    });
    expect(result.current).toBe('2026-07-23');
  });

  it('recomputes on foreground, because timers do not run reliably in the background', () => {
    // Capture the listener the hook registers. AppState has no emit() under jest-expo, and
    // going through addEventListener also proves the subscription is actually made.
    // Swap the function directly and restore the ORIGINAL reference afterwards. jest.spyOn +
    // restoreAllMocks does not round-trip here: AppState.addEventListener is already a
    // jest-expo mock, and restoring the spy leaves it returning undefined, so the next test's
    // effect cleanup throws on `subscription.remove()` — a failure that lands in an unrelated
    // test and looks nothing like its cause.
    let onChange: ((status: string) => void) | undefined;
    const original = AppState.addEventListener;
    AppState.addEventListener = ((_type: string, handler: (status: string) => void) => {
      onChange = handler;
      return { remove: jest.fn() };
    }) as unknown as typeof AppState.addEventListener;

    jest.setSystemTime(new Date('2026-07-23T03:00:00Z'));
    setZone('America/New_York');

    const { result } = renderHook(() => useLocalDate());
    expect(result.current).toBe('2026-07-22');
    expect(onChange).toBeDefined();

    // The phone was in a pocket overnight: the scheduled timer never fired, and the app comes
    // back to a new day.
    jest.setSystemTime(new Date('2026-07-23T16:00:00Z'));
    act(() => {
      onChange?.('active');
    });
    expect(result.current).toBe('2026-07-23');

    // A background transition must NOT recompute — only 'active' does.
    jest.setSystemTime(new Date('2026-07-24T16:00:00Z'));
    act(() => {
      onChange?.('background');
    });
    expect(result.current).toBe('2026-07-23');

    AppState.addEventListener = original;
  });

  it('follows a zone change, so correcting your location fixes the day immediately', () => {
    jest.setSystemTime(new Date('2026-07-22T21:00:00Z'));
    setZone('America/New_York');

    const { result } = renderHook(() => useLocalDate());
    expect(result.current).toBe('2026-07-22');

    act(() => {
      setZone('Pacific/Auckland');
    });
    expect(result.current).toBe('2026-07-23');
  });
});
