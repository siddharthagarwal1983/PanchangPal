import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * EVERY QueryClient BUILT IN A TEST MUST SET `gcTime`, AND THE REASON IS TEARDOWN, NOT TUNING.
 *
 * TanStack Query schedules a garbage-collection `setTimeout` — default **5 minutes** — for each
 * cached query and mutation the moment its last observer detaches. Unmounting at the end of a test
 * is exactly that moment, so a suite that renders a hook leaves live timers behind. They keep
 * Node's event loop alive, which means the jest worker cannot exit:
 *
 *   A worker process has failed to exit gracefully and has been force exited.
 *
 * That warning had been printed on every mobile run for as long as the suite has existed, on main
 * and in CI, and was easy to dismiss as noise. It is not noise — running any one of the three
 * offending suites on its own **hangs indefinitely** rather than warning, because the force-exit
 * path only applies to workers. `qc.clear()` in `afterEach` does not retract the timers.
 * `gcTime: Infinity` makes the timeout invalid, so none is ever scheduled.
 *
 * ⚠️ TWO METHOD NOTES, both of which cost time here.
 *
 * 1. **`--detectOpenHandles` cannot find this.** The flag implies `--runInBand`, so there are no
 *    worker processes and the warning — which is *about a worker* — cannot occur. On the full
 *    suite it reports nothing at all; on the single hanging file it never prints, because it
 *    reports after a run finishes and the run does not finish. What identified the leak was
 *    `process.getActiveResourcesInfo()` in an `afterAll`, showing five leftover `Timeout` handles.
 * 2. **The warning is the wrong instrument for locating the leak.** Bisecting by "does the warning
 *    appear" wrongly cleared `useChecklist`, because a single-file run may not use a worker at all.
 *    The reliable test is whether the jest process EXITS ON ITS OWN — which is what this guard
 *    defends, statically, without needing to run anything.
 */

const TEST_DIRS = ['src/data/__tests__', 'src/providers/__tests__'];
const MOBILE_ROOT = path.resolve(__dirname, '../../..');

/**
 * Remove block and line comments so the counts below reflect CODE only. Deliberately simple: it
 * does not try to respect comment-like sequences inside string or regex literals, because the only
 * thing being counted is `new QueryClient(` and `gcTime:`, neither of which appears in a string in
 * these suites. If that ever changes, this returns a conservative overcount of code, which fails
 * loudly rather than passing silently.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function testFilesWithQueryClient(): Array<{ file: string; source: string }> {
  const found: Array<{ file: string; source: string }> = [];
  for (const dir of TEST_DIRS) {
    const abs = path.join(MOBILE_ROOT, dir);
    let entries: string[];
    try {
      entries = readdirSync(abs);
    } catch {
      continue; // a directory that does not exist yet is not a failure
    }
    for (const entry of entries) {
      if (!/\.tsx?$/.test(entry)) continue;
      // Skip this file: its own failure message names the constructor, which would otherwise
      // make the guard flag itself.
      if (entry === path.basename(__filename)) continue;
      const source = readFileSync(path.join(abs, entry), 'utf8');
      if (source.includes('new QueryClient(')) found.push({ file: `${dir}/${entry}`, source });
    }
  }
  return found;
}

describe('test QueryClients do not leak GC timers', () => {
  const files = testFilesWithQueryClient();

  it('finds the suites that build a QueryClient', () => {
    // If this drops to zero the guard has stopped guarding anything — most likely because the
    // suites moved directory, not because the pattern disappeared.
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [f.file, f] as const))(
    '%s sets gcTime on every QueryClient it constructs',
    (_name, { file, source }) => {
      // Count constructions and gcTime settings rather than parsing: a suite may build more than
      // one client, and each needs its own.
      // ⚠️ STRIP COMMENTS FIRST. The first version of this guard counted `gcTime:` anywhere in the
      // file and was VACUOUS: every patched suite carries a comment explaining why `gcTime:
      // Infinity` is there, so deleting the actual setting left the prose behind and the count
      // never dropped. A perturbation proved it — the hang came back while this test still passed.
      // Count code only.
      const code = stripComments(source);
      const constructions = code.match(/new QueryClient\(/g)?.length ?? 0;
      const gcTimes = code.match(/gcTime:/g)?.length ?? 0;
      // NOTE: this is jest (jest-expo), not vitest — `expect(value, message)` throws
      // "Expect takes at most one argument." The failure message therefore has to be raised
      // directly, which is also what makes it legible when it fires.
      if (gcTimes < constructions) {
        throw new Error(
          `${file} constructs ${constructions} QueryClient(s) but sets gcTime ${gcTimes} time(s). ` +
            `Without it TanStack schedules a 5-minute GC timer per cached query/mutation on ` +
            `unmount, the jest worker cannot exit, and running this file alone hangs. Use: ` +
            `new QueryClient({ defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } } })`,
        );
      }
      expect(gcTimes).toBeGreaterThanOrEqual(constructions);
    },
  );
});
