/**
 * Keeps `docs/devops/GO_NO_GO.md` honest about the §10.1 pre-launch checklist.
 *
 * The document walks TDD Part 5 §10.1 `[MANDATORY]` — 22 items across five categories — and records
 * a verdict for each. Two things about it will rot, and they rot in opposite directions.
 *
 * 1. THE CHECKLIST ITSELF CAN MOVE. §10.1 is the authority; this document is a reading of it. If an
 *    item is added to the TDD and nobody walks it, the go/no-go silently stops covering the thing
 *    the TDD says gates a launch. So the item list is parsed OUT OF THE TDD and compared BOTH WAYS:
 *    an item missing from the doc fails, and an item the doc invented fails too. Same two-directional
 *    pattern as `privacy/data-inventory.test.ts`, where an unclassified table is undisclosed
 *    collection and a classified missing table is a disclosure for data that no longer exists.
 *
 * 2. THE VERDICTS CAN GO STALE, AND ONE DIRECTION IS DANGEROUS. A document overstating what exists
 *    fails loudly the first time someone looks for the thing. A document that keeps saying "blocked"
 *    after the blocker clears makes the gap INVISIBLE — the capability looks permanently unavailable,
 *    nobody builds on it, and a file everyone trusts says that is expected. That is this milestone's
 *    signature defect with the polarity reversed, and it is how TDD Part 4 §6 (offline-first) stayed
 *    unimplemented across two milestones while every document agreed it was fine.
 *
 * So the assertions below fail when a CAPABILITY APPEARS while the document still calls it missing.
 * The fix is never to delete an assertion — it is to close the item and update the table.
 *
 * ⚠️ DELIBERATELY NOT ASSERTED: that any item is complete. A test cannot check whether a lawyer read
 * the privacy policy, whether a reviewer signed the RAG corpus, or whether the founder confirmed
 * runway. §10.1 is mostly not a property of this repository, and pretending otherwise would make the
 * checklist look mechanised while measuring nothing — the exact failure §8.4 exists to reject.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const GO_NO_GO = path.join(REPO_ROOT, 'docs/devops/GO_NO_GO.md');
const TDD_PART5 = path.join(REPO_ROOT, 'docs/tdd/05_PLATFORM_DEVOPS.md');
const WORKFLOWS = path.join(REPO_ROOT, '.github/workflows');
const GURU_FACTORY = path.join(REPO_ROOT, 'apps/mobile/src/domain/guru/transportFactory.ts');
const MOBILE_MANIFEST = path.join(REPO_ROOT, 'apps/mobile/package.json');
const MOBILE_DIRS = ['apps/mobile/app', 'apps/mobile/src'].map((d) => path.join(REPO_ROOT, d));

const doc = readFileSync(GO_NO_GO, 'utf8');
// Whitespace-normalised: a phrase that happens to straddle a line break is the same statement.
// `release-runbook.test.ts` learned this the hard way — its first version pinned the paragraph's
// LAYOUT rather than its meaning and failed on a re-wrap.
const docFlat = doc.replace(/\s+/g, ' ');

/**
 * The §10 appendix ALONE — the section the document calls "the machine-checked surface".
 *
 * ⛔ Scoping this was a defect found by perturbation, and it is the exact failure the document
 * exists to prevent. The first version checked coverage against the WHOLE file, so deleting an item
 * from the appendix still passed: the human-readable table above quotes the same words, and the
 * assertion matched there instead. The appendix was therefore decorative while §9 and §10 both told
 * the reader it was load-bearing — a documented control that nothing implements, one layer inside
 * the very document written to catalogue them.
 *
 * Scoped here so the claim is true. The tables above stay free to paraphrase, which is why they are
 * readable at all.
 */
const appendix = doc.split(/^## 10\. Appendix/m)[1] ?? '';

/**
 * The §10.1 items, read out of the TDD. Each checklist line is
 * `**Category:** ☐ item · ☐ item · ☐ item.`
 */
function checklistItems(): { category: string; item: string }[] {
  const part5 = readFileSync(TDD_PART5, 'utf8');
  const section = part5.split('## 10.1')[1]?.split('## 10.2')[0] ?? '';
  return section
    .split('\n')
    .filter((l) => l.includes('☐'))
    .flatMap((line) => {
      const category = /\*\*(.+?):\*\*/.exec(line)?.[1] ?? 'uncategorised';
      return line
        .split('☐')
        .slice(1)
        .map((raw) => ({
          category,
          item: raw
            .replace(/·\s*$/, '')
            .trim()
            .replace(/\.$/, ''),
        }));
    });
}

/**
 * Normalises markdown so a comparison is about WORDS, not formatting. Applied to BOTH sides —
 * asymmetric normalisation was this test's own first defect: it stripped backticks and `§` from the
 * TDD item and not from the document, so "AI §10B passed for `AISET-2026.07`" could never match
 * itself. A normaliser used on one side of an equality is a bug generator.
 *
 * ⚠️ The first version also tried to be lenient — dropping parentheticals and splitting on `+`/`/`
 * so the doc could paraphrase. That made the check VACUOUS for item 2, whose key phrase reduced to
 * the word "traditions". The document now carries a verbatim appendix (§10) instead, so coverage is
 * checked exactly and the human-readable tables above it are free to paraphrase.
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*§]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** `EVT_*` ids that reach the analytics port in shipped code. Mirrors `slo-alerts.test.ts`. */
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

/** Every workflow file's contents, comments stripped — a control is code, not a mention of one. */
function workflowCode(): string {
  return readdirSync(WORKFLOWS)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => readFileSync(path.join(WORKFLOWS, f), 'utf8'))
    .join('\n')
    .split('\n')
    .filter((l) => !/^\s*#/.test(l))
    .join('\n');
}

describe('GO_NO_GO.md covers the §10.1 checklist the TDD actually specifies', () => {
  const items = checklistItems();

  it('finds the §10 appendix at all', () => {
    // Guards the SCOPING, not the content. If the appendix heading is renamed this split returns
    // '', every coverage assertion below passes against an empty string, and the whole suite goes
    // green while checking nothing — the vacuous-guard failure this repo has now paid for three
    // times (the gcTime comment count, the flows-timeout shim, and this file's own first version).
    expect(
      appendix.length,
      "GO_NO_GO.md's '## 10. Appendix' heading was not found, so item coverage is being checked " +
        'against an empty string. Restore the heading or fix the split.',
    ).toBeGreaterThan(500);
  });

  it('finds the checklist in the TDD at all', () => {
    // Guards the parser rather than the document. If §10.1 is restructured and this returns
    // nothing, every coverage assertion below would pass vacuously — the failure mode that made
    // the first gcTime guard and the first flows-timeout test worthless.
    expect(
      items.length,
      'Parsed 0 items from TDD Part 5 §10.1. The section format changed; fix the parser before ' +
        'trusting any coverage assertion in this file.',
    ).toBeGreaterThan(15);
  });

  it.each(checklistItems().map((i) => [i.category, i.item] as const))(
    '[%s] "%s" is quoted verbatim in the §10 appendix',
    (_category, item) => {
      expect(
        normalise(appendix),
        `TDD §10.1 lists "${item}" and GO_NO_GO.md's §10 appendix does not quote it. A checklist ` +
          'item that is not walked is not a passing item — add it to the appendix with a verdict ' +
          'marker and give it a row with evidence.',
      ).toContain(normalise(item));
    },
  );

  it('records a verdict for every item and does not invent extra ones', () => {
    // Verdict rows are the numbered table rows `| 1 | ... |`. The count must equal §10.1's.
    const numbered = new Set(
      [...doc.matchAll(/^\|\s*(\d{1,2})\s*\|/gm)].map((m) => Number.parseInt(m[1], 10)),
    );
    expect(
      [...numbered].sort((a, b) => a - b),
      `GO_NO_GO.md must carry exactly one numbered verdict row per §10.1 item (${items.length}).`,
    ).toEqual(items.map((_, n) => n + 1));
  });
});

describe('the verdicts have not gone stale in the dangerous direction', () => {
  it('still correctly reports that NO performance gate exists', () => {
    // §10.1 calls the performance gate release-blocking and the repository has none. The day one
    // lands, this document must stop saying so — otherwise the gate exists and the go/no-go still
    // reads as blocked, which is the invisible-gap failure described at the top of this file.
    const code = workflowCode();
    const hasPerfGate =
      /performance|perf[-_ ]?budget|bundle[-_ ]?size|lighthouse|budget\.json/i.test(code);

    expect(
      hasPerfGate,
      'A workflow now mentions a performance/budget gate. If it is real, close §10.1 item 8 in ' +
        'GO_NO_GO.md and rewrite §7.1 — do not delete this assertion.',
    ).toBe(false);

    // And the document must still be the one making the claim, so deleting the prose fails too.
    expect(docFlat).toMatch(/no performance gate|Performance has none|THERE IS NO GATE/i);
  });

  it('still correctly reports the paywall as uninstrumented', () => {
    // EVT_049 is already defined in PDD §11, so emitting it invents nothing and is likely to happen
    // soon. The moment it does, items 19 and 21 change and §7.2 is wrong.
    const emitted = eventsEmitted();

    expect(
      emitted.has('EVT_049'),
      'EVT_049 is now emitted, so the subscription surface has instrumentation. Update §10.1 ' +
        'item 19 and §7.2 of GO_NO_GO.md — do not delete this assertion.',
    ).toBe(false);

    expect(docFlat).toContain('EVT_049');
  });

  it('still correctly reports Ask Guru as gated off', () => {
    // Items 1 and 6 both rest on this constant. Flipping it is a deliberate, reviewed act; the
    // go/no-go must not keep describing a gated product after the gate opens.
    const factory = readFileSync(GURU_FACTORY, 'utf8');

    expect(
      /export const GURU_LIVE = false/.test(factory),
      'GURU_LIVE is no longer false. Items 1 and 6 of GO_NO_GO.md describe a gated-off Ask Guru ' +
        'and must be revisited alongside the corpus/eval readiness that permitted the flip.',
    ).toBe(true);

    expect(docFlat).toContain('GURU_LIVE');
  });

  it('still correctly reports the payments SDK as uninstalled', () => {
    // Item 17. `react-native-purchases` landing is the signal that the store half of the milestone
    // has started moving, and it changes items 17, 18 and (via the paywall) 19.
    const manifest = JSON.parse(readFileSync(MOBILE_MANIFEST, 'utf8')) as {
      dependencies?: Record<string, string>;
    };

    expect(
      Object.keys(manifest.dependencies ?? {}),
      'react-native-purchases is now declared. Items 17/18 of GO_NO_GO.md assume NullPaymentAdapter ' +
        'with no store products and must be re-walked.',
    ).not.toContain('react-native-purchases');
  });

  it('does not record a GO while the document still lists unmet items', () => {
    // The assertion that matters most, and the cheapest to get wrong: a verdict edited to GO while
    // the tables below it still carry ⛔ rows. §8.4's standard is that a claim is judged against
    // what was observed, not against what someone concluded.
    const claimsGo = /^#\s*✅?\s*GO\b/m.test(doc) || /# ✅ GO for a public launch/.test(doc);

    if (claimsGo) {
      expect(
        doc.includes('⛔'),
        'GO_NO_GO.md records a GO while its own tables still contain ⛔ (not met) items. Resolve ' +
          'the items or correct the verdict; the two must agree.',
      ).toBe(false);
    } else {
      // The current state: a NO-GO that names what is unmet. If the ⛔ markers vanish without the
      // verdict changing, the document has quietly stopped disclosing its own blockers.
      expect(
        doc.includes('⛔'),
        'GO_NO_GO.md records a NO-GO but no longer marks any item as unmet. Either the checklist ' +
          'is now met — in which case change the verdict — or the disclosure was lost.',
      ).toBe(true);
    }
  });
});
