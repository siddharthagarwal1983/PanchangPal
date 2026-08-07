import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * THE RELEASE RUNBOOK IS PINNED TO THE WORKFLOW IT INSTRUCTS OPERATORS TO USE.
 *
 * `docs/devops/RELEASE_RUNBOOK.md` §2 tells the operator, mid-incident, to dispatch OTA with
 * `action: rollback`. If that input is renamed or removed, the runbook becomes a set of
 * instructions that cannot be followed at the worst possible moment — and nothing else in the
 * repository would notice, because a documentation file has no other reader.
 *
 * This is the same pattern as `slo-alerts.test.ts` (the doc must not keep saying "blocked" after
 * the instrument lands) and `data-inventory.test.ts` (the classification must match the schema in
 * both directions). Documentation that describes a mechanism is treated as an assertion about that
 * mechanism, not as prose.
 *
 * ⚠️ Deliberately NOT asserted: that any rollback has been *performed*. §0 of the runbook records
 * that honestly in a table, and a test cannot check it. The gap between "documented" and
 * "performed" is exactly what this milestone exists to surface, so it is stated in prose and left
 * for a human to close.
 */

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const RUNBOOK = path.join(REPO_ROOT, 'docs/devops/RELEASE_RUNBOOK.md');
const OTA_WORKFLOW = path.join(REPO_ROOT, '.github/workflows/ota.yml');

// Whitespace-normalised, because a phrase that happens to straddle a line break is the same
// statement. The first version of this test asserted against the raw file and failed on
// `"staged\nrollout"` — pinning the paragraph's LAYOUT rather than its meaning, which any editor
// re-wrap would then have broken.
const runbook = readFileSync(RUNBOOK, 'utf8').replace(/\s+/g, ' ');
// Read as TEXT rather than parsed YAML, deliberately: `js-yaml` is not a declared dependency of
// this workspace — it exists only transitively in the pnpm store, which is the shape of the
// `@babel/runtime` / `babel-preset-expo` defects that broke bundling during the Execution Gap.
// Every assertion below is about the presence of a specific control, which text answers honestly.
const ota = readFileSync(OTA_WORKFLOW, 'utf8');
// ⚠️ COMMENTS STRIPPED before asserting that a COMMAND exists. The first version of this test
// checked the whole file for `update:rollback` and a perturbation proved it VACUOUS: the phrase
// also appears in a comment explaining the command, so deleting the invocation left the prose and
// the assertion still passed. Same failure as the gcTime guard in apps/mobile — a check that reads
// documentation and reports on behaviour.
const otaCode = ota
  .split('\n')
  .filter((l) => !/^\s*#/.test(l))
  .join('\n');

/** The `options: [...]` list declared for a `workflow_dispatch` input. */
function inputOptions(name: string): string[] {
  const block = new RegExp(`\\n\\s{6}${name}:\\n([\\s\\S]*?)(?=\\n\\s{6}\\w+:|\\n\\w)`).exec(ota);
  const options = block ? /options:\s*\[([^\]]*)\]/.exec(block[1]) : null;
  return options ? options[1].split(',').map((s) => s.trim()) : [];
}

describe('release runbook is executable as written', () => {
  it('OTA exposes the channel and action inputs the runbook names', () => {
    expect(
      inputOptions('action'),
      'RELEASE_RUNBOOK.md §2 instructs the operator to dispatch OTA with action: rollback',
    ).toEqual(expect.arrayContaining(['publish', 'rollback']));
    expect(
      inputOptions('channel'),
      'the runbook offers staging and production as the channels',
    ).toEqual(expect.arrayContaining(['staging', 'production']));
  });

  it('the rollback path actually invokes eas update:rollback', () => {
    expect(
      otaCode.includes('update:rollback'),
      'OTA has a rollback action but no step runs `eas update:rollback` — the runbook would send ' +
        'an operator to a control that does nothing.',
    ).toBe(true);
  });

  it('the publish path reports who will receive the update', () => {
    // The runbook tells the operator to read this number before concluding a rollback failed.
    // Without the check, that instruction refers to output that does not exist.
    expect(
      /build:list[\s\S]*--runtime-version/.test(otaCode),
      'the publish job no longer counts builds matching the update\'s runtime version, but ' +
        'RELEASE_RUNBOOK.md §2 tells the operator to read exactly that number.',
    ).toBe(true);
  });

  it('a production OTA stays behind an explicit confirmation', () => {
    // §3.2 requires staged rollouts, which cannot be expressed until a store presence exists.
    // The interim control is that production cannot be reached by a mis-click.
    expect(
      otaCode.includes('PUBLISH TO PRODUCTION'),
      'the production confirmation guard was removed; §3.2 has no staged-rollout mechanism yet, ' +
        'so this is the only thing standing between a dropdown and every installed build.',
    ).toBe(true);
  });

  /**
   * The runbook's §0 table is the part most likely to rot into a comfortable fiction, because it is
   * the part that says "no". This does not check the table's truth — it checks that the two
   * launch-blocking negatives are still stated, so removing one is a deliberate edit rather than a
   * silent tidy-up.
   */
  it('still states the two blockers that make rollback incomplete', () => {
    expect(runbook, 'PITR is unavailable (NFR-15) and the runbook must keep saying so').toMatch(
      /PITR IS NOT AVAILABLE/,
    );
    expect(
      /staged rollout.{0,80}(plan rather than a capability|blocked on)/is.test(runbook),
      'the runbook must keep stating that the STORE-side staged rollout is blocked on a store ' +
        'presence. The OTA-side rollout is performed (§2A); conflating the two would overstate ' +
        'what exists at a go/no-go.',
    ).toBe(true);
  });

  /**
   * §3.2's staged rollout, added in B7.4. The OTA half is real, so the runbook's §2A instructions
   * must remain executable — same contract as the rollback actions above.
   */
  it('OTA exposes the staged-rollout actions §2A instructs the operator to use', () => {
    expect(inputOptions('action')).toEqual(
      expect.arrayContaining(['rollout-start', 'rollout-advance', 'rollout-end']),
    );
    expect(
      otaCode.includes('channel:rollout'),
      'the rollout actions exist as inputs but no step runs `eas channel:rollout`',
    ).toBe(true);
  });

  it('rollout-end defaults to revert, not to keeping the candidate', () => {
    // The dangerous default is the one that KEEPS a bad update live. `revert` returns every user to
    // the branch they were on; `republish-and-revert` keeps the candidate. If the default ever
    // flips, a hurried operator ending a rollout during an incident would preserve the regression.
    const block = /\n\s{6}rollout_outcome:\n([\s\S]*?)(?=\n\s{6}\w+:|\n\w)/.exec(ota);
    expect(block, 'the rollout_outcome input is gone').not.toBeNull();
    expect(
      /default:\s*'?revert'?/.test(block?.[1] ?? ''),
      'rollout_outcome no longer defaults to `revert` — ending a rollout in a hurry would now keep ' +
        'the candidate live, which is the opposite of the crash-spike behaviour §2.4 asks for.',
    ).toBe(true);
  });

  /**
   * §2.4 says "auto-rollback on a crash spike". The action exists; nothing triggers it. That gap is
   * deliberate — a `repository_dispatch` receiver with no sender is a placeholder — but it must stay
   * VISIBLE, because "auto-rollback" in a TDD and a manually dispatched revert are different claims.
   */
  it('does not let "auto-rollback" imply automation that does not exist', () => {
    expect(
      /AUTO-ROLLBACK IS NOT AUTOMATED/.test(runbook),
      'the runbook must keep stating that nothing triggers the rollback automatically',
    ).toBe(true);
  });
});
