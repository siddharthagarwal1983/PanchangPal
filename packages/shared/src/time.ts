/**
 * Canonical time-zone-aware date logic (ADR-026 — UTC Store, IANA Compute).
 *
 * ADR-026 is mandatory and specific: "All date logic goes through a single tz-aware utility
 * — no ad-hoc `Date` arithmetic anywhere in the codebase". This module IS that utility. It
 * did not exist, and its absence produced issue #30: two screens derived the day with
 * `new Date().toISOString().slice(0, 10)`, which is UTC by definition. In New Zealand and
 * Australia that names YESTERDAY for the whole local morning — so the morning ritual, the
 * product's central daily loop, was recorded against the wrong day in two of the three
 * primary launch markets. It survived review because in IST the two agree for 18.5 hours a
 * day, and it type-checked perfectly: a `string` that is a valid date, just the wrong one.
 *
 * It lives in `shared` rather than in the mobile app because `local_date` is written by the
 * client and read by Edge Functions; a single definition both sides import is the only way
 * "one utility" stays true across the boundary.
 *
 * NO RUNTIME DEPENDENCIES, and none may be added — Edge Functions consume this package.
 * The device's zone is therefore always passed IN (see `resolveTimeZone`); this module never
 * reaches for `expo-localization`, and never calls `new Date()` on its own, so every function
 * here is pure and testable at a fixed instant.
 */

/** Milliseconds in a nominal day. NOT a safe unit of calendar arithmetic — see `msUntilNextLocalMidnight`. */
const DAY_MS = 86_400_000;

/**
 * `Intl.DateTimeFormat` construction is expensive relative to formatting, and these run on a
 * render path. One formatter per zone, reused.
 */
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timeZone);
  if (cached) return cached;
  // Throws RangeError on an unknown zone, which is what `isValidTimeZone` relies on.
  const created = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  formatters.set(timeZone, created);
  return created;
}

/** True when the IANA identifier is one this runtime can actually compute with. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Wall-clock parts in `timeZone` at `instant`.
 *
 * `formatToParts`, not a formatted string that gets parsed back: a locale is free to change
 * its pattern, insert marks, or use non-Latin digits, and any of those turn a parse into a
 * silent wrong answer. Parts are addressed by name and cannot drift.
 */
function partsIn(instant: Date, timeZone: string): LocalParts {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((part) => part.type === type);
    if (!found) throw new Error(`Time zone formatting produced no "${type}" part for "${timeZone}"`);
    return Number(found.value);
  };
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

const pad = (value: number, width = 2): string => String(value).padStart(width, '0');

/**
 * The calendar date at `instant` as seen in `timeZone`, as `YYYY-MM-DD`.
 *
 * THIS IS THE ONLY SANCTIONED WAY to produce a `local_date` / `localDate` value. The column
 * is documented "user-tz date (client-authoritative)" and carries a one-per-day uniqueness
 * constraint, so the value decides whether a completion lands on the right day, whether a
 * streak survives, and which ritual session is resumed.
 */
export function localDateIn(instant: Date, timeZone: string): string {
  const { year, month, day } = partsIn(instant, timeZone);
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/**
 * Which zone to compute in, given the server-held profile value and the device's own zone.
 *
 * Precedence is profile → device. The profile wins because it is server-authoritative and a
 * user can set it deliberately (a traveller keeping their home observance is the case that
 * motivates it); the device is the fallback because a null profile zone is the normal state
 * before the first sync — `user_profile.timezone` exists but nothing populates it yet, which
 * is why issue #30's fix needs Increment 2.
 *
 * THROWS when neither is available, deliberately. ADR-026: "Never default to India time." A
 * plausible-looking wrong zone silently mis-dates every completion a user records; a throw
 * is loud, and the caller has a real zone to give. There is no ERR_* identifier for this
 * because it is a programming error at a seam that should always have a value, not a user-
 * facing error state — inventing an ERR_* code here would put a fake entry in the canonical
 * list (CLAUDE.md).
 */
export function resolveTimeZone(
  profileTimeZone: string | null | undefined,
  deviceTimeZone: string | null | undefined,
): string {
  for (const candidate of [profileTimeZone, deviceTimeZone]) {
    if (candidate && isValidTimeZone(candidate)) return candidate;
  }
  throw new Error(
    'No usable IANA time zone: profile and device values are both absent or unrecognised. ' +
      'ADR-026 forbids defaulting — supply the device zone (expo-localization) at the call site.',
  );
}

/**
 * Milliseconds from `instant` until the next local-midnight rollover in `timeZone`.
 *
 * Increment 3 uses this to refresh the day while the app stays warm. The screens currently
 * hold the date in a module-scope constant evaluated once at import, so an app left open
 * across midnight keeps yesterday's date — and since that value keys ritual session storage,
 * the in-progress session becomes unreachable and presents as "the session was lost".
 *
 * BISECTION, not `+ DAY_MS`. A local day is 23 or 25 hours across a DST transition, so
 * adding a nominal day lands an hour early or late — exactly on the days when being wrong is
 * most visible. Bisection needs only that "has the local date changed yet" is monotonic over
 * the search window, which it is, and returns the true boundary to the millisecond. ~28
 * iterations over a two-day window; this runs once per rollover, not per render.
 */
export function msUntilNextLocalMidnight(instant: Date, timeZone: string): number {
  const today = localDateIn(instant, timeZone);
  const start = instant.getTime();

  // Two days spans any real transition and always contains a rollover, so the predicate is
  // guaranteed false at `start` and true at `end`.
  let low = start;
  let high = start + 2 * DAY_MS;

  while (high - low > 1) {
    const mid = low + Math.floor((high - low) / 2);
    if (localDateIn(new Date(mid), timeZone) === today) low = mid;
    else high = mid;
  }

  return high - start;
}
