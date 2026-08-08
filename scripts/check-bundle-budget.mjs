#!/usr/bin/env node
/**
 * Bundle-size budget gate — TDD Part 5 §10.1 (performance gate, release-blocking), NFR-01.
 *
 * Usage:  node scripts/check-bundle-budget.mjs <export-dir> [budget-file]
 *
 * Compares the size of each platform's Metro/Hermes bundle against a checked-in ceiling and
 * exits non-zero when one is exceeded. Wired into ci.yml's Bundle gate, which already runs
 * `expo export` and until now threw the output away.
 *
 * ⚠️ THE LOGIC LIVES IN A SCRIPT AND IS INVOKED AS ONE LINE, DELIBERATELY. `e2e.yml` carried an
 * inline multi-line `if`/`fi` for three weeks that could never run, because
 * `reactivecircus/android-emulator-runner` executes its `script:` input one `sh -c` PER LINE — the
 * block was a syntax error and the step aborted before reaching the command that mattered. One
 * shell parsing one program makes that bug class unreachable rather than merely avoided. Same
 * reasoning as scripts/run-maestro-flows.sh.
 *
 * ⛔ EVERY "I MEASURED NOTHING" PATH EXITS 1, NOT 0. A missing directory, a platform with no
 * bundle, an unreadable budget file, or a platform present in the export but absent from the
 * budget all FAIL. A size gate that passes because it found nothing to weigh is the defect this
 * repository keeps finding — a documented control, wired, and inert — and it would be invisible
 * precisely when it mattered (a refactor moves the output path, and the gate goes quietly green
 * forever). Silence is never success here.
 */
import { readFileSync, readdirSync, statSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIB = 1024 * 1024;

/** Bundles Metro emits: Hermes bytecode normally, plain JS if Hermes is ever disabled. */
const BUNDLE_EXTENSIONS = ['.hbc', '.js'];

/** @param {number} bytes */
export function formatMiB(bytes) {
  return `${(bytes / MIB).toFixed(2)} MiB`;
}

/**
 * Locates the single bundle for a platform inside an `expo export` output directory.
 *
 * Returns a discriminated result rather than throwing or returning null, because each failure
 * needs a DIFFERENT message: "you pointed me at the wrong directory" and "this platform built no
 * bundle" send an operator to different places, and a gate whose only output is "failed" wastes
 * the reader's time at the moment they have least of it.
 *
 * @param {string} exportDir
 * @param {string} platform
 * @returns {{ok: true, file: string, bytes: number} | {ok: false, reason: string}}
 */
export function findBundle(exportDir, platform) {
  const dir = path.join(exportDir, '_expo', 'static', 'js', platform);
  if (!existsSync(dir)) {
    return { ok: false, reason: `no bundle directory at ${path.relative(exportDir, dir)}` };
  }

  const candidates = readdirSync(dir).filter((f) =>
    BUNDLE_EXTENSIONS.includes(path.extname(f)),
  );

  if (candidates.length === 0) {
    return { ok: false, reason: `no ${BUNDLE_EXTENSIONS.join('/')} file in ${dir}` };
  }
  if (candidates.length > 1) {
    // Ambiguity is a failure, not a "pick the biggest". Two bundles for one platform means the
    // export shape changed, and guessing which one ships is how a gate starts measuring the
    // wrong artifact while still reporting a number.
    return { ok: false, reason: `expected exactly 1 bundle, found ${candidates.length}: ${candidates.join(', ')}` };
  }

  const file = path.join(dir, candidates[0]);
  return { ok: true, file, bytes: statSync(file).size };
}

/**
 * Pure comparison. Kept separate from I/O so the pass/fail rule is inspectable on its own.
 *
 * @param {Record<string, number>} budgets
 * @param {Record<string, {ok: true, file: string, bytes: number} | {ok: false, reason: string}>} found
 * @param {string[]} platformsInExport
 */
export function evaluate(budgets, found, platformsInExport) {
  /** @type {{platform: string, bytes: number|null, budget: number, status: string, detail: string}[]} */
  const rows = [];
  const failures = [];

  for (const [platform, budget] of Object.entries(budgets)) {
    const result = found[platform];
    if (!result.ok) {
      rows.push({ platform, bytes: null, budget, status: 'NOT MEASURED', detail: result.reason });
      failures.push(`${platform}: ${result.reason}`);
      continue;
    }
    const over = result.bytes > budget;
    const delta = result.bytes - budget;
    rows.push({
      platform,
      bytes: result.bytes,
      budget,
      status: over ? 'OVER BUDGET' : 'ok',
      detail: over
        ? `over by ${formatMiB(delta)}`
        : `${formatMiB(-delta)} headroom (${((result.bytes / budget) * 100).toFixed(1)}% used)`,
    });
    if (over) {
      failures.push(
        `${platform}: ${formatMiB(result.bytes)} exceeds the ${formatMiB(budget)} budget by ${formatMiB(delta)}`,
      );
    }
  }

  // A platform that built but is not budgeted is silently ungated — the same shape as
  // `cd.yml`'s deploy list omitting `health`, which would have merged green and served nothing.
  for (const platform of platformsInExport) {
    if (!(platform in budgets)) {
      failures.push(
        `${platform} produced a bundle but has no budget. Add one to the budget file — an ` +
          'unbudgeted platform is an ungated platform.',
      );
    }
  }

  return { ok: failures.length === 0, rows, failures };
}

function main() {
  const [exportDir, budgetArg] = process.argv.slice(2);
  if (!exportDir) {
    console.error('usage: check-bundle-budget.mjs <export-dir> [budget-file]');
    process.exit(1);
  }

  // fileURLToPath rather than `new URL(...).pathname`: the latter percent-encodes, so a repo
  // checked out to a path containing a space resolves to a file that does not exist.
  const budgetFile =
    budgetArg ??
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../apps/mobile/performance-budget.json');

  if (!existsSync(exportDir)) {
    console.error(`::error::bundle budget: export directory not found: ${exportDir}`);
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(readFileSync(budgetFile, 'utf8'));
  } catch (err) {
    console.error(`::error::bundle budget: cannot read budget file ${budgetFile}: ${err.message}`);
    process.exit(1);
  }

  const budgets = config.budgets;
  if (!budgets || Object.keys(budgets).length === 0) {
    console.error(`::error::bundle budget: ${budgetFile} declares no budgets — nothing would be checked`);
    process.exit(1);
  }

  const jsRoot = path.join(exportDir, '_expo', 'static', 'js');
  const platformsInExport = existsSync(jsRoot)
    ? readdirSync(jsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];

  const found = Object.fromEntries(
    Object.keys(budgets).map((p) => [p, findBundle(exportDir, p)]),
  );
  const { ok, rows, failures } = evaluate(budgets, found, platformsInExport);

  const table = [
    '| Platform | Size | Budget | Status |',
    '|---|---:|---:|---|',
    ...rows.map(
      (r) =>
        `| ${r.platform} | ${r.bytes === null ? '—' : formatMiB(r.bytes)} | ${formatMiB(r.budget)} | ${r.status === 'ok' ? `✅ ${r.detail}` : `❌ ${r.status} — ${r.detail}`} |`,
    ),
  ].join('\n');

  console.log(table);

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Bundle size budget (NFR-01)\n\n${table}\n\n`,
    );
  }

  if (!ok) {
    for (const f of failures) console.error(`::error::bundle budget: ${f}`);
    console.error(
      '\nThe bundle is what a device downloads, parses and executes before the first frame ' +
        '(NFR-01). If the growth is intended, raise the ceiling in the budget file and say why — ' +
        'that is the decision this gate exists to surface, not an obstacle to it.',
    );
    process.exit(1);
  }

  console.log('\nAll bundles within budget.');
}

// Only run when executed directly, so the exported helpers stay importable. Compared through
// fileURLToPath for the same encoding reason as the budget path above.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
