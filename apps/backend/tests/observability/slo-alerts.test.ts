/**
 * Keeps `docs/devops/SLO_ALERTS.md` honest about which §7.2 SLOs are unmeasurable.
 *
 * That document says three SLOs cannot be measured because their instrument does not exist:
 * NFR-05 needs `EVT_030`, NFR-11 needs `EVT_040`, and NFR-10 needs sync events that `syncService`
 * does not emit. Those are claims about the CODE, and the code will move.
 *
 * WHY IT MATTERS WHICH DIRECTION IT ROTS. The dangerous direction is not the doc overstating what
 * exists — that fails loudly the first time someone looks for a dashboard. It is the doc continuing
 * to say "blocked, nothing emitted" after the instrument LANDS: the SLO then looks permanently
 * unavailable, the alert is never built, and the gap is invisible because a document says it is
 * expected. That is this milestone's signature defect (a documented control nothing implements)
 * with the polarity reversed, and it is exactly what happened to TDD Part 4 §6 for two milestones.
 *
 * So these tests fail when an instrument APPEARS while the document still calls it missing. The
 * fix is never to delete the assertion — it is to build the alert and update §1's table.
 *
 * Same pattern as `privacy/data-inventory.test.ts`, which pins DATA_INVENTORY.md to the schema and
 * the emitted event set, and as `syncPlan.test.ts`, which reads SVC_sync's own source.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SLO_DOC = path.join(REPO_ROOT, 'docs/devops/SLO_ALERTS.md');
const MOBILE_DIRS = ['apps/mobile/app', 'apps/mobile/src'].map((d) => path.join(REPO_ROOT, d));
const SYNC_SOURCES = [
  'apps/mobile/src/data/syncService.ts',
  'apps/mobile/src/data/hooks/useOfflineSync.ts',
].map((f) => path.join(REPO_ROOT, f));

const sloText = readFileSync(SLO_DOC, 'utf8');

/** `EVT_*` ids that reach the analytics port, excluding test files. Mirrors the inventory test. */
function eventsEmitted(): Set<string> {
  const found = new Set<string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) {
        for (const m of readFileSync(full, 'utf8').matchAll(/'(EVT_\d{3})'/g)) found.add(m[1]);
      }
    }
  };
  MOBILE_DIRS.forEach(walk);
  return found;
}

describe('SLO_ALERTS.md still describes the instruments that exist', () => {
  const emitted = eventsEmitted();

  it.each([
    ['EVT_030', 'NFR-05', 'AI first-token latency'],
    ['EVT_040', 'NFR-11', 'push delivery'],
  ])('%s is still unemitted, so %s (%s) is still correctly recorded as blocked', (evt, nfr) => {
    expect(
      emitted.has(evt),
      `${evt} is now emitted, so ${nfr} has an instrument and SLO_ALERTS.md is out of date. ` +
        `Build the alert and move ${nfr} out of the blocked rows in §1 — do not delete this test.`,
    ).toBe(false);

    // And the document must still be the one making the claim, so deleting the prose fails too.
    expect(sloText).toContain(evt);
  });

  it('syncService emits no EVT_*, so NFR-10 still has no success denominator', () => {
    const emittingSource = SYNC_SOURCES.filter((f) => /'EVT_\d{3}'/.test(readFileSync(f, 'utf8')));

    expect(
      emittingSource.map((f) => f.replace(`${REPO_ROOT}/`, '')),
      'The sync seam now emits events. NFR-10 may be measurable — check whether both an ATTEMPT ' +
        'and an OUTCOME are counted, since a failure count with no denominator still cannot be ' +
        'compared against 99.5%, then update SLO_ALERTS.md §5.',
    ).toEqual([]);
  });

  it('records NFR-06 as the live one, with its Sentry monitor id', () => {
    // The one SLO that pages. If this section is ever removed, the document has stopped describing
    // the only alerting that exists.
    expect(sloText).toMatch(/NFR-06/);
    expect(sloText).toMatch(/7968827/);
    expect(sloText).toMatch(/99\.5/);
  });
});
