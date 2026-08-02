/**
 * `@types/node`'s major must match the Node version this project actually runs.
 *
 * The types describe the RUNTIME. If they run ahead of it, TypeScript accepts built-ins that do not
 * exist where the code executes, and the error moves from build time to run time — the compiler
 * stops doing the one job it is here for.
 *
 * WHY A TEST AND NOT JUST THE IGNORE RULE. `.github/dependabot.yml` now ignores `@types/node`, which
 * stops the bot proposing it. It does not stop a person bumping it while chasing a type error, and
 * that ignore list has leaked FOUR times (`@expo/*`, `@babel/runtime`, `react`,
 * `@react-native-community/*`, `jest`, `babel-preset-expo`) — a hand-maintained pattern list is not
 * a guarantee. This asserts the invariant itself.
 *
 * WHY IT CANNOT BE CAUGHT ANY OTHER WAY. Newer `@types/node` describes strictly MORE APIs, so a bump
 * compiles clean and every gate passes. PR #95 (20 → 26) was green on all five. Green is the
 * symptom here, not the reassurance, so nothing else in CI would ever object.
 *
 * If this fails, the fix is to decide deliberately: either raise `engines.node` and `NODE_VERSION`
 * together with the types, or leave the types where the runtime is. Do not relax the assertion.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const rootPkg = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')) as {
  engines?: { node?: string };
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
};

/** Leading major from a semver range like `>=20.11.0`, `^20.14.0`, `20.11.0`. */
function major(range: string): number {
  const m = /(\d+)\./.exec(range);
  if (!m) throw new Error(`Could not read a major version from: ${range}`);
  return Number(m[1]);
}

/**
 * Every Node version pinned across the workflows, in BOTH forms.
 *
 * ⚠️ An earlier version of this matched only `NODE_VERSION:` and therefore could not see
 * `cd.yml`'s `node-version: 20.11.0`, which is hardcoded on the step rather than read from the env.
 * That is precisely the drift this test exists to prevent, and it was hiding inside the test. A
 * literal `node-version:` is now matched too; the `${{ env.NODE_VERSION }}` form is skipped, since
 * it is not itself a pin.
 */
function workflowNodeVersions(): { file: string; version: string }[] {
  const dir = path.join(REPO_ROOT, '.github/workflows');
  const found: { file: string; version: string }[] = [];
  for (const file of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
    const src = readFileSync(path.join(dir, file), 'utf8');
    for (const m of src.matchAll(/^\s*(?:NODE_VERSION|node-version):\s*'?([\d]+\.[\d.]+)'?\s*$/gm)) {
      found.push({ file, version: m[1] });
    }
  }
  return found;
}

describe('@types/node tracks the runtime, not the newest release', () => {
  const engineRange = rootPkg.engines?.node;
  const typesRange = rootPkg.devDependencies?.['@types/node'] ?? rootPkg.dependencies?.['@types/node'];

  it('declares both an engine floor and a @types/node range', () => {
    expect(engineRange, 'package.json engines.node is missing').toBeTruthy();
    expect(typesRange, 'package.json @types/node is missing').toBeTruthy();
  });

  it('matches @types/node major to the engines.node floor', () => {
    expect(
      major(typesRange!),
      `@types/node is ${typesRange} but engines.node is ${engineRange}. The types describe the ` +
        `runtime: ahead of it, TypeScript accepts built-ins that do not exist where the code runs, ` +
        `and it compiles GREEN because newer types only ADD APIs. Raise engines.node and ` +
        `NODE_VERSION deliberately, or leave the types where the runtime is.`,
    ).toBe(major(engineRange!));
  });

  it('matches every workflow Node pin to that same floor, in both pin forms', () => {
    // A CI runtime ahead of (or behind) the declared floor makes the floor fiction, and this test's
    // premise with it.
    const pins = workflowNodeVersions();
    expect(pins.length, 'no Node version pin found in any workflow').toBeGreaterThan(0);
    for (const { file, version } of pins) {
      expect(
        major(version),
        `${file} pins Node ${version}, which disagrees with engines.node ${engineRange}`,
      ).toBe(major(engineRange!));
    }
  });

  it('is not running an end-of-life Node major', () => {
    // Node 20 reached EOL on 2026-04-30 and this repo was still pinned to 20.11.0 on 2026-08-02 —
    // three months on an unsupported runtime, with the upgrade queued behind a test-library bump
    // rather than treated as the security item it was. Verified against
    // nodejs/Release/schedule.json; update this floor when 22 approaches its own EOL (2027-04-30).
    expect(
      major(engineRange!),
      `Node ${major(engineRange!)} is end-of-life. Check nodejs/Release/schedule.json and upgrade.`,
    ).toBeGreaterThanOrEqual(22);
  });
});
