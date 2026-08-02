/**
 * Exactly one Edge Function may be reachable without a JWT.
 *
 * `verify_jwt` defaults to true in `supabase/config.toml`, and every function relies on that
 * default except `health`, which needs to be anonymous or NFR-14 has no instrument (an uptime
 * monitor polling an authenticated function measures the auth layer returning 401).
 *
 * WHY THIS NEEDS A TEST RATHER THAN A COMMENT. `verify_jwt = false` is one line, it is easy to add
 * while debugging a 401, and **nothing else in the system would notice**. Edge Functions run with
 * the SERVICE ROLE, so RLS is not a backstop — that is the finding B6.2 already paid for, when
 * `SVC_account` derived identity from the request body and any caller could delete any account.
 * A second unauthenticated function is the same class of hole, and it would ship green.
 *
 * If this fails, do not add the new function to the allowlist to make it pass. Establish first
 * whether it can be authenticated, and treat exposing it as a security decision with an owner.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CONFIG = path.resolve(__dirname, '../../../../supabase/config.toml');
const config = readFileSync(CONFIG, 'utf8');

/** Functions whose block sets `verify_jwt = false`, ignoring commented-out lines. */
function unauthenticatedFunctions(): string[] {
  const found: string[] = [];
  let current: string | null = null;

  for (const raw of config.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('#')) continue;

    const header = /^\[functions\.([a-z0-9-]+)\]$/.exec(line);
    if (header) {
      current = header[1];
      continue;
    }
    if (line.startsWith('[')) {
      current = null; // left the functions section
      continue;
    }
    if (current && /^verify_jwt\s*=\s*false$/.test(line)) found.push(current);
  }
  return found.sort();
}

describe('the unauthenticated attack surface', () => {
  it('is exactly [health] — every other function requires a JWT', () => {
    expect(
      unauthenticatedFunctions(),
      'A function other than `health` now sets verify_jwt = false. Edge Functions run with the ' +
        'SERVICE ROLE, so RLS is NOT a backstop — an anonymous caller reaches privileged code ' +
        'directly. Do not extend this list to go green.',
    ).toEqual(['health']);
  });

  it('declares `health` at all, so the probe NFR-14 depends on is deployable', () => {
    expect(config).toMatch(/\[functions\.health\]/);
  });
});
