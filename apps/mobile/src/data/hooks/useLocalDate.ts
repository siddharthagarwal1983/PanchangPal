/**
 * HOOK_useLocalDate — today's date in the user's time zone (ADR-026, issue #30, increment 3).
 *
 * Replaces `const TODAY = new Date().toISOString().slice(0, 10)`, which was wrong twice over.
 *
 * WRONG ZONE. `toISOString()` is UTC, so in New Zealand and Australia it named YESTERDAY for
 * the whole local morning — the slot the morning ritual occupies, in two of the three primary
 * launch markets. The value keys ritual completion, the one-per-day uniqueness constraint,
 * checklist completion, streaks, and ritual session storage.
 *
 * WRONG LIFETIME. It was a module-scope constant, evaluated once at import, so an app left
 * open across midnight kept yesterday's date indefinitely. Because the same value keys session
 * storage, a rollover made an in-progress ritual unreachable — presenting exactly as "the
 * session was lost".
 *
 * Returns null while the zone is unknown, which callers must treat as "not ready" rather than
 * substituting a date. ADR-026 forbids defaulting, and a guessed day is the defect itself.
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDateIn, msUntilNextLocalMidnight } from '@panchangpal/shared';
import { usePrefsStore } from '../../store/prefs';

export function useLocalDate(): string | null {
  // Mirrored into STORE_prefs by useTimeZoneSync so it can be read synchronously during
  // render — a screen cannot await a query to decide which day it is showing.
  const timeZone = usePrefsStore((state) => state.timezone);

  // The date is DERIVED during render, not held in state, so it cannot go stale relative to
  // the clock and there is no setState inside an effect (react-hooks/set-state-in-effect —
  // the cascading-render hazard the ritual screen already documents). State here is only a
  // nudge: something happened, re-read the clock.
  const [, invalidate] = useState(0);
  const localDate = timeZone ? localDateIn(new Date(), timeZone) : null;

  useEffect(() => {
    if (!timeZone) return undefined;

    const nudge = () => invalidate((n) => n + 1);

    // Re-armed from the CURRENT instant on every rollover, never by adding 24h: a local day is
    // 23 or 25 hours across a DST transition, so a fixed interval drifts by an hour exactly
    // when correctness is most visible. The effect re-runs when `localDate` changes, which is
    // what schedules the next boundary.
    //
    // The 1s cushion keeps a timer that fires a few milliseconds early from re-reading the old
    // date and then sleeping another full day on it.
    const timer = setTimeout(nudge, msUntilNextLocalMidnight(new Date(), timeZone) + 1000);

    // Timers do not run reliably while an app is backgrounded — both platforms throttle or
    // suspend them — so the scheduled rollover cannot be the only trigger. Recomputing on
    // foreground covers the ordinary case: the phone was in a pocket overnight.
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') nudge();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [timeZone, localDate]);

  return localDate;
}
