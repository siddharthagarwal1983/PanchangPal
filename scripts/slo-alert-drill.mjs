#!/usr/bin/env node
/**
 * SLO alert drill — makes the NFR-06 crash-free-sessions alert actually fire.
 *
 * TDD Part 5 §8.4: alerting that never triggers is a plan, not a capability. A monitor whose
 * threshold, filter and notification all read correctly has still never been observed to page
 * anyone, and this repository has been caught by that exact gap more than once — six placeholder CI
 * jobs, an ADR nobody implemented, a header claiming persistence over an in-memory store.
 *
 * WHAT THIS DOES. Submits synthetic sessions to Sentry's envelope endpoint with a crash rate far
 * below the 99.5% threshold, tagged `environment=production` so the production-scoped monitor sees
 * them. Sentry should raise a high-priority issue on `panchangpal-mobile` within roughly one
 * interval, and the connected alerts should email.
 *
 * ⚠️ IT POLLUTES THE METRIC IT PROVES. Synthetic crashes land in production session data and are not
 * removable. That cost is near zero BEFORE launch — production has essentially no real sessions and
 * everything before 2026-08-02 is CI traffic mislabelled as production anyway (PR #98) — and rises
 * permanently once real users exist. Run it now or not at all; and record the run in
 * docs/devops/SLO_ALERTS.md §8 so a later crash-free dip is not misread as a real regression.
 *
 * The DSN is a CLIENT key, public by design and already embedded in every build — this sends
 * exactly what the app sends. It is not a credential, and is passed explicitly rather than
 * hardcoded so this cannot be pointed at production by accident.
 *
 * Usage:
 *   node scripts/slo-alert-drill.mjs --dsn "<dsn>" --confirm
 *   node scripts/slo-alert-drill.mjs --dsn "<dsn>" --confirm --environment ci --sessions 20 --crashed 3
 */
import { argv, exit } from 'node:process';
import { randomUUID } from 'node:crypto';

function arg(name, fallback = undefined) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
}

const dsn = arg('dsn', process.env.SENTRY_DSN);
const environment = arg('environment', 'production');
const release = arg('release', '0.1.0');
const total = Number(arg('sessions', '20'));
const crashed = Number(arg('crashed', '3'));
const confirmed = argv.includes('--confirm');

if (!dsn) {
  console.error('Missing --dsn (or SENTRY_DSN). The client DSN of the target project.');
  exit(2);
}
if (crashed >= total) {
  console.error(`--crashed (${crashed}) must be less than --sessions (${total}).`);
  exit(2);
}

// A DSN is `https://<publicKey>@<host>/<projectId>`.
let publicKey, host, projectId;
try {
  const u = new URL(dsn);
  publicKey = u.username;
  host = u.host;
  projectId = u.pathname.replace(/^\//, '');
  if (!publicKey || !projectId) throw new Error('incomplete');
} catch {
  console.error(`Not a usable DSN: ${dsn}`);
  exit(2);
}

const rate = (((total - crashed) / total) * 100).toFixed(1);

console.log(`SLO alert drill
  project id   ${projectId} @ ${host}
  environment  ${environment}
  release      ${release}
  sessions     ${total} (${crashed} crashed) → crash-free ${rate}%, threshold 99.5%`);

if (!confirmed) {
  console.error(`
Refusing to send without --confirm.
This writes UNREMOVABLE synthetic crash data into ${environment} telemetry.`);
  exit(1);
}

// One envelope, one session item per line. Sentry's envelope format is newline-delimited JSON:
// a header, then {item header}\n{item payload} pairs.
const now = new Date();
const started = new Date(now.getTime() - 60_000);
const items = [];
for (let i = 0; i < total; i += 1) {
  const isCrashed = i < crashed;
  items.push(JSON.stringify({ type: 'session' }));
  items.push(
    JSON.stringify({
      sid: randomUUID(),
      did: `slo-drill-${i}`,
      init: true,
      started: started.toISOString(),
      timestamp: now.toISOString(),
      status: isCrashed ? 'crashed' : 'exited',
      errors: isCrashed ? 1 : 0,
      duration: 60,
      attrs: { release, environment },
    }),
  );
}
const body = `${JSON.stringify({ sent_at: now.toISOString() })}\n${items.join('\n')}\n`;

const res = await fetch(`https://${host}/api/${projectId}/envelope/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-sentry-envelope',
    'X-Sentry-Auth': [
      'Sentry sentry_version=7',
      `sentry_key=${publicKey}`,
      'sentry_client=panchangpal-slo-drill/1.0',
    ].join(', '),
  },
  body,
});

const text = await res.text();
console.log(`\nHTTP ${res.status} ${res.statusText}${text ? ` — ${text.trim()}` : ''}`);

if (!res.ok) {
  console.error('Submission rejected. Nothing was recorded.');
  exit(1);
}

console.log(`
Accepted. Sentry aggregates sessions per interval, so allow up to ~1 interval (the NFR-06 monitor
uses 1 hour) before judging. Then check, IN THIS ORDER — each answers a different question:

  1. Project → Releases/Sessions: does crash-free show the drop?   (did the data land)
  2. Monitor 7968827: is there an ongoing issue?                   (did detection fire)
  3. Your inbox: did the connected alert email arrive?             (did NOTIFICATION work)

Only (3) proves the alert is a capability rather than a plan. Record the result in
docs/devops/SLO_ALERTS.md §8, including the date, so a later dip is not misread as a regression.`);
