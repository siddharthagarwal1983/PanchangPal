/**
 * HOOK_useTimeZoneSync — adopt the device's time zone into the profile when it has none
 * (ADR-026, issue #30, increment 2).
 *
 * `user_profile.timezone` is null for every user because nothing has ever written it, which is
 * what blocks computing dates in the user's zone. This fills it once, from the device, per the
 * PDD's documented fallback — and never overwrites a value that location resolution or the user
 * put there (see `decideTimeZoneSync` for the rule and its rationale).
 *
 * Mounted once at the root layout, alongside the notification-routing hook. It renders nothing
 * and returns the resolved zone for callers that want it without a second lookup.
 */
import { useEffect, useRef } from 'react';
import { usePreferences, useUpdatePreferences } from './usePreferences';
import { getDeviceTimeZone } from '../deviceTimeZone';
import { decideTimeZoneSync } from '../../domain/profile/timezoneSync';
import { usePrefsStore } from '../../store/prefs';

export function useTimeZoneSync(): string | null {
  const preferences = usePreferences();
  const update = useUpdatePreferences();

  // The write is attempted once per app run. Without this guard the effect would re-fire on
  // every render while the mutation is in flight — the profile query has not been updated yet,
  // so the decision still reads "absent" — and enqueue a burst of identical patches into the
  // offline queue. `useRef`, not mutation state, because an offline patch stays pending
  // indefinitely and must still count as attempted.
  const attempted = useRef(false);

  const profileTimeZone = preferences.data?.timezone ?? null;
  const decision = decideTimeZoneSync(profileTimeZone, getDeviceTimeZone());

  // Publish the resolved zone to STORE_prefs, which is where screens read it synchronously
  // during render (see useLocalDate). This hook is the SINGLE WRITER of that field and is
  // mounted once, at AppProviders.
  //
  // It must happen here rather than in usePreferences' mirror, because that mirror only runs
  // on a MUTATION. A returning user whose profile already carries a zone never mutates
  // anything on launch, so the store would sit at null forever and every screen would wait
  // for a day it could not name.
  useEffect(() => {
    usePrefsStore.getState().setPrefs({ timezone: decision.timeZone });
  }, [decision.timeZone]);

  useEffect(() => {
    // Wait for the profile to load before deciding. Acting on `undefined` data would read as
    // "no zone stored" and overwrite a perfectly good one on every cold start.
    if (!preferences.data) return;
    if (!decision.shouldPersist || attempted.current) return;
    attempted.current = true;
    update.mutate({ timezone: decision.timeZone });
  }, [preferences.data, decision.shouldPersist, decision.timeZone, update]);

  return decision.timeZone;
}
