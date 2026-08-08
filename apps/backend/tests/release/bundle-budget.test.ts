/**
 * The bundle-size budget gate — TDD Part 5 §10.1 (performance gate, release-blocking), NFR-01.
 *
 * WHY THIS TESTS THE SCRIPT AS A SUBPROCESS RATHER THAN AN EXPORTED FUNCTION. The gate is not the
 * comparison rule — it is the script's EXIT CODE, because that is the only thing `ci.yml` observes.
 * Importing `evaluate()` and asserting it returns `{ok: false}` would prove the rule while saying
 * nothing about whether the process fails, and this repository has twice paid for a test that
 * proved the wrong layer: the `process.env` unit test that passed while the bundler path delivered
 * nothing, and the `timeout` shim that established exit-code semantics on a layer where the real
 * defect (one `sh -c` per line) could not appear. So every case below runs the real file and reads
 * `status`.
 *
 * ⛔ MOST OF THESE ASSERT THAT "MEASURED NOTHING" FAILS. A size gate that exits 0 because it found
 * no bundle is worse than no gate: it is a documented control, wired into CI, reporting green
 * forever after a refactor moves the output path. That is this milestone's signature defect, and
 * the reason the not-found cases outnumber the over-budget one here.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts/check-bundle-budget.mjs');
const BUDGET_FILE = path.join(REPO_ROOT, 'apps/mobile/performance-budget.json');
const CI_WORKFLOW = path.join(REPO_ROOT, '.github/workflows/ci.yml');

let work: string;

/** Builds a minimal `expo export` output tree: one bundle of `bytes` per named platform. */
function makeExport(name: string, platforms: Record<string, number>): string {
  const dir = path.join(work, name);
  for (const [platform, bytes] of Object.entries(platforms)) {
    const jsDir = path.join(dir, '_expo', 'static', 'js', platform);
    mkdirSync(jsDir, { recursive: true });
    writeFileSync(path.join(jsDir, `entry-${platform}.hbc`), Buffer.alloc(bytes));
  }
  return dir;
}

function makeBudget(name: string, budgets: Record<string, number>): string {
  const file = path.join(work, `${name}.json`);
  writeFileSync(file, JSON.stringify({ budgets }));
  return file;
}

/** Runs the real gate. Returns its exit status and combined output. */
function run(exportDir: string, budgetFile: string) {
  const r = spawnSync(process.execPath, [SCRIPT, exportDir, budgetFile], { encoding: 'utf8' });
  return { status: r.status, output: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

beforeAll(() => {
  work = mkdtempSync(path.join(tmpdir(), 'ppal-bundle-budget-'));
});
afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

describe('the bundle budget gate fails when it should', () => {
  it('passes when every platform is within budget', () => {
    const dir = makeExport('good', { ios: 1000, android: 1000 });
    const { status, output } = run(dir, makeBudget('ok', { ios: 2000, android: 2000 }));
    expect(status, `control must pass, got:\n${output}`).toBe(0);
    expect(output).toMatch(/headroom/);
  });

  it('fails when a bundle exceeds its budget', () => {
    const dir = makeExport('over', { ios: 1000, android: 1000 });
    const { status, output } = run(dir, makeBudget('tight', { ios: 500, android: 500 }));
    expect(status).toBe(1);
    expect(output).toMatch(/OVER BUDGET|exceeds/);
  });

  // ---- every "nothing was measured" path below must FAIL, never pass silently ----

  it('fails when the export directory does not exist', () => {
    const { status } = run(path.join(work, 'absent'), makeBudget('ok2', { ios: 2000 }));
    expect(status).toBe(1);
  });

  it('fails when a budgeted platform produced no bundle directory', () => {
    const dir = makeExport('android-only', { android: 1000 });
    const { status, output } = run(dir, makeBudget('both', { ios: 2000, android: 2000 }));
    expect(status).toBe(1);
    expect(output).toMatch(/NOT MEASURED|no bundle directory/);
  });

  it('fails when a platform directory exists but is empty', () => {
    const dir = makeExport('empty-dir', { android: 1000 });
    mkdirSync(path.join(dir, '_expo', 'static', 'js', 'ios'), { recursive: true });
    const { status, output } = run(dir, makeBudget('both2', { ios: 2000, android: 2000 }));
    expect(status).toBe(1);
    expect(output).toMatch(/no \.hbc|NOT MEASURED/);
  });

  it('fails when a platform has two bundles, rather than guessing which one ships', () => {
    const dir = makeExport('ambiguous', { ios: 1000, android: 1000 });
    writeFileSync(path.join(dir, '_expo', 'static', 'js', 'ios', 'extra.hbc'), Buffer.alloc(10));
    const { status, output } = run(dir, makeBudget('ok3', { ios: 2000, android: 2000 }));
    expect(status).toBe(1);
    expect(output).toMatch(/expected exactly 1 bundle/);
  });

  it('fails when a platform builds a bundle that no budget covers', () => {
    // An unbudgeted platform is an ungated platform — the `cd.yml` deploy-list shape, where
    // omitting `health` would have merged green and served nothing.
    const dir = makeExport('extra-platform', { ios: 1000, android: 1000, web: 1000 });
    const { status, output } = run(dir, makeBudget('ok4', { ios: 2000, android: 2000 }));
    expect(status).toBe(1);
    expect(output).toMatch(/no budget|ungated/);
  });

  it('fails when the budget file declares no budgets at all', () => {
    const dir = makeExport('good2', { ios: 1000 });
    const { status, output } = run(dir, makeBudget('none', {}));
    expect(status).toBe(1);
    expect(output).toMatch(/no budgets/);
  });

  it('fails when the budget file cannot be read', () => {
    const dir = makeExport('good3', { ios: 1000 });
    const { status, output } = run(dir, path.join(work, 'does-not-exist.json'));
    expect(status).toBe(1);
    expect(output).toMatch(/cannot read budget file/);
  });
});

describe('the gate is wired to the artifact it claims to measure', () => {
  it('the real budget file parses and covers both shipped platforms', () => {
    const config = JSON.parse(execFileSync('cat', [BUDGET_FILE], { encoding: 'utf8' })) as {
      budgets: Record<string, number>;
      measured: Record<string, number>;
    };
    expect(Object.keys(config.budgets).sort()).toEqual(['android', 'ios']);

    // The recorded measurement must sit under its own budget. If someone raises `measured` past
    // `budgets` while editing this file by hand, CI would fail on the next run for a reason that
    // looks like a code regression — catch it here, where the message can say so.
    for (const platform of Object.keys(config.budgets)) {
      expect(
        config.measured[platform],
        `${platform}: recorded measurement exceeds its own budget in performance-budget.json`,
      ).toBeLessThanOrEqual(config.budgets[platform]);
    }
  });

  it('ci.yml invokes the gate as a single line, in the job that produces the bundle', () => {
    // One shell parsing one program. `e2e.yml` carried an inline multi-line block for three weeks
    // that could never run, because the emulator action executes `script:` one `sh -c` per line.
    const ci = execFileSync('cat', [CI_WORKFLOW], { encoding: 'utf8' });
    const invocation = /run:\s*node scripts\/check-bundle-budget\.mjs[^\n]*\n/.exec(ci);

    expect(
      invocation,
      'ci.yml no longer invokes check-bundle-budget.mjs on one line. The performance gate is ' +
        'release-blocking per §10.1 — if it has moved, update this assertion; if it was removed, ' +
        'GO_NO_GO.md §10.1 item 8 must go back to "no gate exists".',
    ).not.toBeNull();

    // …and it must run in the bundle job, which is the only one that produces an export.
    const bundleJob = ci.split(/^  bundle:$/m)[1]?.split(/^  \w[\w-]*:$/m)[0] ?? '';
    expect(bundleJob).toContain('check-bundle-budget.mjs');
  });
});
