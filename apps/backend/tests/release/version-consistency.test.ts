import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * THE APP VERSION, THE CHANGELOG AND THE RELEASE TAG MUST AGREE (TDD Part 5 §3.1, PDD §3.0A.4).
 *
 * §3.1 requires that the app version and build number are tracked and that "each release [is] tagged
 * with the change log". Three places carry the version and nothing kept them in step:
 *
 *   1. `apps/mobile/app.config.ts` — `version`, which is what the binary reports
 *   2. `CHANGELOG.md` — what humans read to know what shipped
 *   3. the `vX.Y.Z` git tag — what `release-build.yml` triggers on
 *
 * ⚠️ THE MISMATCH IS NOT COSMETIC. **Sentry sets no explicit release**, so `@sentry/react-native`
 * derives it from the NATIVE APP VERSION. A release tagged `v0.2.0` built from an `app.config.ts`
 * still saying `0.1.0` files its crashes under `0.1.0` — and the crash-free SLOs (NFR-06 crash-free
 * sessions, NFR-07 crash-free users) are read per release, so the new release would look healthy
 * because its crashes landed in the old release's bucket. That is the same class as CI reporting
 * itself as `production` (#98): a real signal, attributed to the wrong thing.
 *
 * This test covers (1) against (2), which is checkable on every PR. The tag half — (3) against (1) —
 * can only be violated by a tag push, so it is enforced in `release-build.yml`, which fails the build
 * rather than producing a mislabelled artifact.
 */

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const APP_CONFIG = path.join(REPO_ROOT, 'apps/mobile/app.config.ts');
const CHANGELOG = path.join(REPO_ROOT, 'CHANGELOG.md');

const appConfig = readFileSync(APP_CONFIG, 'utf8');
const changelog = readFileSync(CHANGELOG, 'utf8');

/** The `version:` declared in app.config.ts — the value the built binary reports. */
function appVersion(): string {
  const m = /^\s*version:\s*'([^']+)'/m.exec(appConfig);
  if (!m) throw new Error('app.config.ts has no top-level `version:` — has the config shape changed?');
  return m[1];
}

/** Released versions in CHANGELOG.md, newest first. `[Unreleased]` is deliberately excluded. */
function changelogVersions(): string[] {
  return [...changelog.matchAll(/^##\s*\[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);
}

describe('version consistency (§3.1)', () => {
  it('app.config.ts declares a semver version', () => {
    expect(appVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('CHANGELOG.md has an Unreleased section to collect work in progress', () => {
    // Without it there is nowhere to record a change before a release is cut, and the entry gets
    // written from memory at tag time — which is how a changelog becomes fiction.
    expect(changelog).toMatch(/^##\s*\[Unreleased\]/m);
  });

  it('the current app version has a CHANGELOG entry', () => {
    const version = appVersion();
    const versions = changelogVersions();
    expect(
      versions,
      `apps/mobile/app.config.ts declares version ${version} but CHANGELOG.md has no ` +
        `"## [${version}]" heading. §3.1 requires each release to be tagged with its change log. ` +
        `Either add the entry, or leave app.config.ts on the last released version until you cut ` +
        `the next one.`,
    ).toContain(version);
  });

  it('the newest CHANGELOG entry is the current app version', () => {
    // Ordering matters: a changelog whose newest entry is older than the shipping version means the
    // release notes describe a build nobody is running.
    const version = appVersion();
    const [newest] = changelogVersions();
    expect(
      newest,
      `CHANGELOG.md's newest released entry is ${newest}, but the app declares ${version}. ` +
        `Newest-first ordering is what makes "what is in the current build?" answerable.`,
    ).toBe(version);
  });

  it('CHANGELOG.md records the semver bump rules rather than assuming them', () => {
    // PDD §3.0A.4 chooses the bump by the NATURE of the change. A changelog that does not restate
    // the rule invites bumping by size — a large refactor read as MAJOR, a breaking rename as PATCH.
    for (const bump of ['MAJOR', 'MINOR', 'PATCH']) {
      expect(changelog).toContain(bump);
    }
  });
});
