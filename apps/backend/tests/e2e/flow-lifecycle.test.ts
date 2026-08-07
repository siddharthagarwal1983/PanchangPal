import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * FLOW LIFECYCLE INVARIANT — a Maestro flow establishes its OWN preconditions and never cleans up
 * for its successor.
 *
 * WHY THIS IS A TEST AND NOT A COMMENT. On 2026-08-06 (E2E 31120798108) FLOW_SESSION_PERSISTENCE
 * hung on `Launch app "com.panchangpal.app"` — the command itself never returning — 0.5s after its
 * own `clearState`, which followed FLOW_OFFLINE_SYNC's trailing `stopApp` + `clearState`. Two
 * `pm clear` calls ~0.5s apart on one flow boundary, with `Destroy timeout of remove-task` in
 * logcat 11s earlier: the second clear raced the task teardown the first had just started.
 *
 * The cause was not the clear itself but the DUPLICATE. Several flows ended with a trailing
 * `clearState` "so the next flow inherits nothing", while every flow that needs a clean device
 * already clears at its own start — so both sides of each boundary were clearing. Deleting the
 * trailing clears removes the race outright, which is the fix this repo's rules demand: added
 * settle time can mask a race real users hit, so a `sleep` here would have hidden it rather than
 * fixed it.
 *
 * This test pins the invariant because the alternative is a convention in six YAML headers that the
 * next flow author cannot be expected to read. It fails in the direction that matters: adding a
 * trailing clear to any flow.
 *
 * ⚠️ MAESTRO'S EXECUTION ORDER IS NOT ALPHABETICAL — observed on run 31147599553 as
 * MORNING_RITUAL -> OFFLINE_SYNC -> SESSION_PERSISTENCE -> AUTH_SESSION_PERSISTENCE -> ONBOARDING
 * -> RETURNING. So no flow may rely on which flow precedes it, and the invariant is deliberately
 * order-independent rather than a rule about specific adjacent pairs.
 */

const FLOWS_DIR = path.resolve(__dirname, '../../../../tests/flows');

type Flow = { name: string; header: string; body: string; bodyLines: string[] };

function loadFlows(): Flow[] {
  const files = readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.yaml'));
  return files.map((file) => {
    const raw = readFileSync(path.join(FLOWS_DIR, file), 'utf8');
    // A Maestro flow is `<header>\n---\n<commands>`. Only the command section is executable;
    // the header holds appId and hooks, and both sections contain prose comments.
    const sep = raw.indexOf('\n---\n');
    expect(sep, `${file} has no '---' separating header from commands`).toBeGreaterThan(-1);
    const body = raw.slice(sep + 5);
    return {
      name: file.replace(/\.yaml$/, ''),
      header: raw.slice(0, sep),
      body,
      // Executable lines only: strip comments and blanks so prose mentioning `clearState`
      // (which every one of these files now does, at length) cannot trip the assertions.
      bodyLines: body
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#')),
    };
  });
}

const flows = loadFlows();

describe('Maestro flow lifecycle', () => {
  it('finds the flow suite', () => {
    expect(flows.length).toBeGreaterThanOrEqual(6);
  });

  /**
   * THE CORE INVARIANT. A trailing clear is what collides with the next flow's opening clear.
   * "Last executable command" is the right granularity: a clear in the MIDDLE of a flow is
   * separated from its neighbours by assertions and waits, and is not part of a boundary.
   */
  it.each(flows.map((f) => [f.name, f] as const))(
    '%s does not end with a clearState — it must not clean up for its successor',
    (_name, flow) => {
      const tail = flow.bodyLines.slice(-3);
      expect(
        tail.some((l) => l === '- clearState' || l === 'clearState'),
        `${flow.name} ends with a clearState. A trailing clear collides with the next flow's ` +
          `opening clear (two pm clear calls ~0.5s apart) and hung the suite on E2E 31120798108. ` +
          `Let the next flow clear at its own start instead.`,
      ).toBe(false);
    },
  );

  /**
   * The other half: having removed the trailing clears, a flow that NEEDS a clean device has to
   * clear for itself. Without this, deleting a trailing clear could silently strand a flow that
   * was relying on it — which is exactly how FLOW_MORNING_RITUAL was left when its neighbours
   * cleared on the way out.
   */
  it.each(flows.map((f) => [f.name, f] as const))(
    '%s never uses the fused `launchApp: clearState: true`',
    (_name, flow) => {
      // The fused form races the previous flow's TASK teardown: Android's
      // `Destroy timeout of remove-task` fires ~1.1s into the launch and kills the process it has
      // just created. Three discrete steps let the teardown finish first (Maestro rule 1).
      const fused = /- *launchApp:\s*\n\s*clearState: true/.test(flow.body);
      expect(
        fused,
        `${flow.name} fuses the clear and the launch. Use three discrete steps: ` +
          `stopApp / clearState / launchApp.`,
      ).toBe(false);
    },
  );

  /**
   * Any flow that clears does so as its own opening act, and stops the app first. `stopApp` before
   * `clearState` is not decoration: the clear force-stops anyway, but starting from a known-stopped
   * app is what makes the single remaining clear per boundary behave the same every run.
   */
  it.each(
    flows
      .filter((f) => f.bodyLines.some((l) => l === '- clearState'))
      .map((f) => [f.name, f] as const),
  )('%s pairs its opening clearState with a preceding stopApp', (_name, flow) => {
    const first = flow.bodyLines.indexOf('- clearState');
    expect(
      flow.bodyLines[first - 1],
      `${flow.name}'s first clearState is not immediately preceded by stopApp`,
    ).toBe('- stopApp');
  });

  /**
   * FLOW_RETURNING is the one flow that deliberately does not clear — a returning user with an
   * existing anonymous session is its entire point. That is only safe because it is insensitive to
   * whatever the previous flow left behind, and this pins the two properties that make it so:
   * it never opens the ritual screen, and it handles the onboarding gate conditionally.
   *
   * (The third property lives in the app: Today's card reads "Begin" from a hardcoded
   * `completedToday: false` in app/(tabs)/today/index.tsx, so a completed session cannot change
   * what this flow asserts. That is verified there, not here.)
   */
  it('FLOW_RETURNING tolerates inherited state', () => {
    const returning = flows.find((f) => f.name === 'FLOW_RETURNING');
    if (!returning) throw new Error('FLOW_RETURNING is missing');
    expect(
      returning.bodyLines.some((l) => l.includes("id: 'ritual-action'")),
      'FLOW_RETURNING now taps into the ritual, so a completed session left by an earlier flow ' +
        'can change its result. It must either clear at its own start or stop tapping the ritual.',
    ).toBe(false);
    expect(
      returning.body.includes('Skip for now'),
      'FLOW_RETURNING must keep handling the onboarding gate conditionally — it does not clear ' +
        'state, so it can meet either a gated or an ungated device.',
    ).toBe(true);
  });
});
