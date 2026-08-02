/**
 * SVC_health — the two properties that make it worth having (NFR-14, TDD Part 5 §7.2).
 *
 * 1. **It can report unhealthy.** A probe that always returns 200 is a monitor that cannot go red,
 *    and would report 99.9% availability straight through a total database outage — the same defect
 *    as a CI gate that cannot fail, which is what this milestone exists to remove.
 * 2. **It leaks nothing.** This is the only unauthenticated surface in the system (`verify_jwt` is
 *    true everywhere else), so the body is public to the internet. A health endpoint that echoes
 *    its dependency error hands out Postgres versions, table names and role names to anyone who
 *    curls it.
 */
import { describe, expect, it } from 'vitest';
import { evaluateHealth, type HealthResult } from './probe';

describe('evaluateHealth', () => {
  it('reports ok with 200 when the database answered', () => {
    expect(evaluateHealth(true)).toMatchObject({ status: 'ok', httpStatus: 200 });
  });

  it('CAN report unhealthy — 503 when the database did not answer', () => {
    // The assertion that makes the monitor meaningful. If this ever fails, the endpoint has become
    // a bare liveness check and NFR-14 is being measured by something that cannot fail.
    expect(evaluateHealth(false)).toMatchObject({ status: 'degraded', httpStatus: 503 });
  });

  it('distinguishes the two states in the body, not only the status code', () => {
    // An uptime monitor keys on the code, but a human reading a response should not have to infer.
    expect(evaluateHealth(true).body.status).toBe('ok');
    expect(evaluateHealth(false).body.status).toBe('degraded');
  });
});

describe('the response body is a closed shape — it is public to the internet', () => {
  const bodies = [evaluateHealth(true), evaluateHealth(false)].map((r: HealthResult) => r.body);

  it.each(bodies)('exposes exactly {status, checked} and nothing else (%j)', (body) => {
    expect(Object.keys(body).sort()).toEqual(['checked', 'status']);
  });

  it.each(bodies)('carries no value that could describe the infrastructure (%j)', (body) => {
    const serialised = JSON.stringify(body).toLowerCase();
    // The classes of leak a health endpoint characteristically produces.
    for (const forbidden of [
      'postgres',
      'supabase',
      'error',
      'stack',
      'version',
      'host',
      'port',
      'key',
      'role',
      'token',
      'password',
      'connection',
      'schema',
      'feature_flag',
    ]) {
      expect(serialised).not.toContain(forbidden);
    }
  });

  it('cannot be handed the dependency error in the first place', () => {
    // Structural, not a convention: `evaluateHealth` takes a boolean. There is no parameter through
    // which an error message could reach the body, so the leak cannot be reintroduced by a
    // well-meaning edit that "adds a little more detail".
    expect(evaluateHealth.length).toBe(1);
    expect(evaluateHealth(false).body).not.toHaveProperty('message');
    expect(evaluateHealth(false).body).not.toHaveProperty('detail');
  });
});
