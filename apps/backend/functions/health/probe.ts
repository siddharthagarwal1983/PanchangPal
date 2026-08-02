/**
 * The health decision, as a pure function (NFR-14 availability ≥ 99.9%, TDD Part 5 §7.2).
 *
 * Separated from the handler so the two properties that matter can be tested without a database:
 * **a dependency failure must report unhealthy**, and **the response body must leak nothing**.
 *
 * WHY THE BODY IS A CLOSED SHAPE. This is the only unauthenticated surface in the system —
 * `verify_jwt` is true for every other function — so anything it returns is public to the internet.
 * A health endpoint that echoes its dependency error hands out Postgres versions, table names,
 * connection strings and role names to anyone who curls it. The body is therefore built from a
 * fixed two-key shape and **never from the error**; the diagnosis goes to the server telemetry seam
 * instead, where it is already scrubbed (§7.1).
 *
 * WHY IT IS NOT A BARE 200. A probe that only proves the Edge runtime is up reports 99.9%
 * availability straight through a total database outage — a monitor that cannot go red, which is
 * the same defect as a CI gate that cannot fail. "Core reads" in NFR-14 means reads that reach
 * Postgres, so the probe must too.
 */

/** The only two states this endpoint can report. */
export type HealthStatus = 'ok' | 'degraded';

export interface HealthResult {
  status: HealthStatus;
  /** HTTP status: 200 healthy, 503 degraded — what an uptime monitor keys on. */
  httpStatus: number;
  /** The exact response body. A closed shape: no error text, no versions, no identifiers. */
  body: { status: HealthStatus; checked: 'database' };
}

const OK: HealthResult = { status: 'ok', httpStatus: 200, body: { status: 'ok', checked: 'database' } };
const DEGRADED: HealthResult = {
  status: 'degraded',
  httpStatus: 503,
  body: { status: 'degraded', checked: 'database' },
};

/**
 * Decide health from the outcome of the dependency check.
 *
 * `reachable` is the ONLY input. Deliberately not the error itself — taking the error as a
 * parameter is how its text ends up in the body by a later well-meaning edit.
 */
export function evaluateHealth(reachable: boolean): HealthResult {
  return reachable ? OK : DEGRADED;
}
