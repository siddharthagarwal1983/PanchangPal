/**
 * Every Edge Function declared in `supabase/config.toml` is actually deployed by `cd.yml`.
 *
 * WHY THIS EXISTS. `supabase functions deploy` takes an explicit list of names, and cd.yml
 * hand-maintains it. Declaring a function in config.toml gives it an entrypoint and an import map
 * — it does **not** put it in that list. So a new function ships as a no-op: the config says it
 * exists, the docs say it is deployed, CD is green, and nothing is serving it.
 *
 * This is not hypothetical. `health` (SVC_health, the NFR-14 uptime probe) was declared in
 * config.toml and omitted from the deploy list on 2026-08-02; the gap was caught before merge only
 * because someone read the workflow. The failure mode is the one this milestone keeps finding —
 * a documented control that nothing implements, with nothing asserting it.
 *
 * Compared in BOTH directions, for different reasons:
 *   · declared but not deployed → the function is dead weight and any claim about it is false;
 *   · deployed but not declared → the CLI resolves it from the default (empty) functions dir and
 *     the deploy fails, or worse, deploys something unintended.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const config = readFileSync(path.join(REPO_ROOT, 'supabase/config.toml'), 'utf8');
const cd = readFileSync(path.join(REPO_ROOT, '.github/workflows/cd.yml'), 'utf8');

/** `[functions.<name>]` headers, ignoring comments. */
function declaredFunctions(): string[] {
  return [...config.matchAll(/^\[functions\.([a-z0-9-]+)\]$/gm)].map((m) => m[1]).sort();
}

/** The names passed to `supabase functions deploy`, which spans a line continuation. */
function deployedFunctions(): string[] {
  const cmd = /supabase functions deploy\s*\\\s*\n\s*([^\n]+?)\s*\\?\s*\n\s*--project-ref/.exec(cd);
  if (!cmd) throw new Error('Could not find the `supabase functions deploy` invocation in cd.yml');
  return cmd[1].trim().split(/\s+/).sort();
}

describe('the Edge Function deploy list', () => {
  it('deploys exactly what config.toml declares', () => {
    const declared = declaredFunctions();
    const deployed = deployedFunctions();

    expect(declared.length).toBeGreaterThan(0);
    expect(
      deployed,
      `cd.yml's deploy list and supabase/config.toml disagree.\n` +
        `  declared: ${declared.join(', ')}\n` +
        `  deployed: ${deployed.join(', ')}\n` +
        `A function declared but not deployed ships as a no-op: config says it exists, CD is ` +
        `green, and nothing serves it.`,
    ).toEqual(declared);
  });

  it('includes `health`, without which NFR-14 has no probe to monitor', () => {
    expect(deployedFunctions()).toContain('health');
  });
});
