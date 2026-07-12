#!/usr/bin/env node
/**
 * PanchangPal — Project Command Center generator.
 *
 * Parses the repository (the .claude/* operating docs, docs/**, ADR index, OpenAPI,
 * migrations, workspace package.json graph, test files, git log, and code greps) and emits
 * `command-center.json`. The dashboard (index.html) renders that file. This is the single
 * source of truth for the dashboard — nothing in the UI is hand-maintained.
 *
 * Usage:  node scripts/command-center/generate.mjs [--watch]
 * No external dependencies (pure Node fs/child_process).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'command-center.json');
const GH = 'https://github.com/siddharthagarwal1983/PanchangPal/blob/main';

// ---------- fs helpers ----------
const read = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; } };
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/');
const ghLink = (relPath) => `${GH}/${relPath}`;

function walk(dir, filter, acc = []) {
  let entries = [];
  try { entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (['node_modules', '.git', 'dist', '.turbo'].includes(e.name)) continue;
    const r = `${dir}/${e.name}`.replace(/^\//, '');
    if (e.isDirectory()) walk(r, filter, acc);
    else if (filter(r)) acc.push(r);
  }
  return acc;
}
const firstMatch = (s, re) => { const m = s.match(re); return m ? m[1].trim() : null; };
const lastUpdated = (s) => firstMatch(s, /Last Updated:\s*(.+)/);

// ---------- git ----------
function git(cmd, fallback = '') { try { return execSync(`git ${cmd}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch { return fallback; } }

// ============================================================================
// PARSERS
// ============================================================================

function parseExecutive() {
  const status = read('.claude/PROJECT_STATUS.md');
  const dash = read('.claude/DASHBOARD.md');
  const progress = firstMatch(status, /\*\*(\d+)% Complete\*\*/) ?? firstMatch(dash, /Progress\s*\n+\s*(\d+)%/);
  const health = /🟢/.test(status) ? 'On Track' : /🟡/.test(status) ? 'At Risk' : 'Unknown';
  const phase = firstMatch(dash, /# Current Phase\s*\n+\s*🚧?\s*(.+)/);
  const milestone = firstMatch(dash, /# Current Milestone\s*\n+\s*(.+)/);
  const task = firstMatch(dash, /# Current Task\s*\n+\s*(.+)/);
  return {
    progress: progress ? Number(progress) : null,
    health, phase, milestone, task,
    lastUpdated: lastUpdated(dash),
    source: { label: '.claude/PROJECT_STATUS.md', href: ghLink('.claude/PROJECT_STATUS.md') },
  };
}

function parsePhases() {
  const status = read('.claude/PROJECT_STATUS.md');
  const rows = [];
  const re = /^\|\s*([^|]+?)\s*\|\s*(✅|🟡|⏳)\s*([^|]*?)\s*\|\s*(\d+)%\s*\|/gm;
  let m;
  while ((m = re.exec(status))) {
    if (/^Phase$/i.test(m[1])) continue;
    rows.push({ phase: m[1], status: m[3] || (m[2] === '✅' ? 'Complete' : m[2] === '🟡' ? 'In Progress' : 'Pending'), icon: m[2], progress: Number(m[4]) });
  }
  return { rows, source: { label: '.claude/PROJECT_STATUS.md · Phase Progress', href: ghLink('.claude/PROJECT_STATUS.md') } };
}

function parseMilestones() {
  const cm = read('.claude/CURRENT_MILESTONE.md');
  const rows = [];
  const re = /^\|\s*(M\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(✅[^|]*|⏳[^|]*|🟡[^|]*)\s*\|/gm;
  let m;
  while ((m = re.exec(cm))) {
    const statusText = m[4].replace(/[✅⏳🟡]/g, '').trim();
    rows.push({ id: m[1], name: m[2], screens: m[3], status: statusText || 'Pending', done: /✅/.test(m[4]) });
  }
  return {
    milestoneName: firstMatch(cm, /##\s*(.+)\n/),
    rows,
    source: { label: '.claude/CURRENT_MILESTONE.md', href: ghLink('.claude/CURRENT_MILESTONE.md') },
  };
}

function parseRoadmap() {
  const rm = read('.claude/IMPLEMENTATION_ROADMAP.md');
  const tracks = [];
  const re = /^##\s*(Track [A-Z][^\n]*)\n([\s\S]*?)(?=^##\s|\Z)/gm;
  let m;
  while ((m = re.exec(rm))) {
    const items = [...m[2].matchAll(/^\s*\d+\.\s+(.+)/gm)].map((x) => x[1].replace(/\s+←.*/, '').trim()).slice(0, 6);
    tracks.push({ title: m[1].trim(), items });
  }
  return { tracks, source: { label: '.claude/IMPLEMENTATION_ROADMAP.md', href: ghLink('.claude/IMPLEMENTATION_ROADMAP.md') } };
}

// Extract a "## Heading" section body from a markdown doc (until the next ## or ---).
function mdSection(text, heading) {
  const re = new RegExp(`^##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=^##\\s|^---\\s*$|\\Z)`, 'mi');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);

function parseADRs() {
  const readme = read('docs/architecture/adr/README.md');
  const rows = [];
  const re = /^\|\s*\[(ADR-\d+)\]\(([^)]+)\)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
  let m;
  while ((m = re.exec(readme))) {
    const file = `docs/architecture/adr/${m[2]}`;
    const body = read(file);
    // strip markdown noise for compact summaries
    const flat = (s) => (s || '').replace(/\n+/g, ' ').replace(/[*_`>#-]+/g, '').replace(/\s+/g, ' ').trim();
    const ids = [...new Set((body.match(/\b(MOD_[A-Za-z]+|SCR_[A-Z0-9_]+|SVC_[A-Za-z0-9_]+|API_[A-Z0-9_]+|TBL_[A-Za-z0-9_]+)\b/g) || []))].slice(0, 12);
    rows.push({
      id: m[1], title: m[3], status: m[4], date: m[5], summary: m[6], href: ghLink(file),
      decision: clip(flat(mdSection(body, 'Decision')), 420),
      consequences: clip(flat(mdSection(body, 'Consequences')), 420),
      context: clip(flat(mdSection(body, 'Context')), 260),
      related: ids,
    });
  }
  const byStatus = rows.reduce((a, r) => { const k = r.status.replace(/\(.+/, '').trim(); a[k] = (a[k] || 0) + 1; return a; }, {});
  return { count: rows.length, byStatus, rows, source: { label: 'docs/architecture/adr/', href: ghLink('docs/architecture/adr/README.md') } };
}

function parseTraceability() {
  const spec = read('docs/api/openapi.yaml');
  const ops = [];
  const opRe = /x-impl:\s*([^\n]+)[\s\S]*?operationId:\s*(API_[A-Z0-9_]+)|operationId:\s*(API_[A-Z0-9_]+)[\s\S]{0,400}?x-impl:\s*([^\n]+)/g;
  // simpler: pair each operationId with its tag + x-impl by scanning blocks
  const lines = spec.split('\n');
  let currentTag = null, currentImpl = null, currentId = null;
  for (const line of lines) {
    const tag = line.match(/^\s*tags:\s*\[([^\]]+)\]/);
    if (tag) currentTag = tag[1].split(',')[0].trim();
    const impl = line.match(/x-impl:\s*(\S+)/);
    if (impl) currentImpl = impl[1];
    const id = line.match(/operationId:\s*(API_[A-Z0-9_]+)/);
    if (id) { currentId = id[1]; ops.push({ api: currentId, impl: currentImpl, tag: currentTag }); currentImpl = null; }
  }
  const svcSet = [...new Set(ops.map((o) => o.impl).filter((i) => i && i.startsWith('SVC_')))];
  const tables = [...new Set((read('apps/backend/migrations/20260712000010_identity.sql') + walk('apps/backend/migrations', (r) => r.endsWith('.sql')).map(read).join('\n')).match(/create table (\w+)/g)?.map((s) => s.replace('create table ', '')) ?? [])];
  return {
    layers: [
      { layer: 'API_* endpoints', count: ops.length, where: 'docs/api/openapi.yaml' },
      { layer: 'SVC_* functions', count: svcSet.length, where: 'apps/backend/functions/' },
      { layer: 'TBL_* tables', count: tables.length, where: 'apps/backend/migrations/' },
    ],
    sample: ops.filter((o) => o.impl).slice(0, 14),
    source: { label: 'docs/api/openapi.yaml', href: ghLink('docs/api/openapi.yaml') },
  };
}

// Factual, descriptive roles for each workspace package (not fabricated data — what each package is).
const PKG_ROLE = {
  shared: { role: 'Domain types + canonical event/error identifiers. No runtime deps.', layer: 'foundation' },
  'design-tokens': { role: 'Design tokens (color/space/type) from PDD §6. No runtime deps.', layer: 'foundation' },
  database: { role: 'Supabase schema, migrations, RLS, pgTAP contracts.', layer: 'data' },
  api: { role: 'API contracts / DTOs (zod) shared by client + Edge Functions.', layer: 'contract' },
  ai: { role: 'RAG + LLM provider adapters (ADR-011). Grounded-or-silent.', layer: 'service' },
  ui: { role: 'Cross-platform component library + theme (tokens-driven).', layer: 'presentation' },
  mobile: { role: 'React Native / Expo app. Thin client, server-authoritative.', layer: 'app' },
  backend: { role: 'Supabase Edge Functions (SVC_*). Server-authoritative state.', layer: 'app' },
};

function parseDependencyGraph() {
  const pkgs = walk('apps', (r) => r.endsWith('package.json')).concat(walk('packages', (r) => r.endsWith('package.json')));
  const nodes = [], edges = [];
  for (const p of pkgs) {
    try {
      const j = JSON.parse(read(p));
      if (!j.name) continue;
      const short = j.name.replace('@panchangpal/', '');
      const meta = PKG_ROLE[short] || { role: '', layer: 'service' };
      const dir = p.replace('/package.json', '');
      nodes.push({ id: short, full: j.name, path: dir, href: ghLink(dir), role: meta.role, layer: meta.layer });
      const deps = { ...(j.dependencies || {}), ...(j.peerDependencies || {}) };
      for (const d of Object.keys(deps)) if (d.startsWith('@panchangpal/')) edges.push({ from: short, to: d.replace('@panchangpal/', '') });
    } catch { /* skip */ }
  }
  return { nodes, edges, source: { label: 'workspace package.json graph', href: ghLink('pnpm-workspace.yaml') } };
}

function parseRepoHealth() {
  const code = walk('apps', (r) => /\.(ts|tsx)$/.test(r)).concat(walk('packages', (r) => /\.(ts|tsx)$/.test(r)));
  const docs = walk('docs', (r) => r.endsWith('.md'));
  const sql = walk('apps/backend/migrations', (r) => r.endsWith('.sql'));
  const sloc = code.reduce((n, f) => n + read(f).split('\n').length, 0);
  const pkgs = walk('apps', (r) => r.endsWith('package.json')).length + walk('packages', (r) => r.endsWith('package.json')).length;
  return {
    metrics: [
      { label: 'TS/TSX files', value: code.length },
      { label: 'Lines of code', value: sloc },
      { label: 'Doc files', value: docs.length },
      { label: 'Workspace packages', value: pkgs },
      { label: 'SQL migrations', value: sql.length },
    ],
    source: { label: 'repository scan', href: GH },
  };
}

function grepRepo(patterns) {
  const files = walk('apps', (r) => /\.(ts|tsx|sql|md)$/.test(r)).concat(walk('packages', (r) => /\.(ts|tsx|md)$/.test(r))).concat(walk('docs', (r) => r.endsWith('.md')));
  const hits = [];
  for (const f of files) {
    const lines = read(f).split('\n');
    lines.forEach((ln, i) => {
      for (const { tag, re } of patterns) if (re.test(ln)) hits.push({ tag, file: f, line: i + 1, text: ln.trim().slice(0, 160), href: `${ghLink(f)}#L${i + 1}` });
    });
  }
  return hits;
}

const DEBT_PATTERNS = [
  { tag: 'TODO', re: /\bTODO\b/ },
  { tag: 'FIXME', re: /\bFIXME\b/ },
  { tag: 'HACK', re: /\bHACK\b/ },
  { tag: 'BLOCKED', re: /BLOCKED|blocked on|fails closed/i },
  { tag: 'PRD-FOLLOWUP', re: /\[PRD FOLLOW-UP/ },
  { tag: 'ASSUMPTION', re: /\[ASSUMPTION/ },
];
// Severity buckets for the tech-debt kanban (derived from tag semantics, not invented).
const DEBT_SEVERITY = { BLOCKED: 'Critical', FIXME: 'High', HACK: 'High', TODO: 'Medium', 'PRD-FOLLOWUP': 'Low', ASSUMPTION: 'Low' };

function parseTechDebt(hits) {
  const byTag = hits.reduce((a, h) => { a[h.tag] = (a[h.tag] || 0) + 1; return a; }, {});
  const items = hits.map((h) => ({ ...h, severity: DEBT_SEVERITY[h.tag] || 'Low', area: areaOf(h.file) }));
  const byArea = items.reduce((a, h) => { a[h.area] = (a[h.area] || 0) + 1; return a; }, {});
  const bySeverity = items.reduce((a, h) => { a[h.severity] = (a[h.severity] || 0) + 1; return a; }, {});
  return { count: hits.length, byTag, bySeverity, byArea, items, source: { label: 'code + docs grep', href: GH } };
}

function parseDocDrift() {
  const files = ['.claude/DASHBOARD.md', '.claude/CURRENT_MILESTONE.md', '.claude/PROJECT_STATUS.md', '.claude/SESSION.md', '.claude/TASK.md', '.claude/PROJECT_MEMORY.md', '.claude/IMPLEMENTATION_ROADMAP.md'];
  const rows = files.map((f) => ({ file: f, lastUpdated: lastUpdated(read(f)) || '—', href: ghLink(f) }));
  const dates = rows.map((r) => r.lastUpdated).filter((d) => /\d{4}-\d{2}-\d{2}/.test(d)).sort();
  const newest = dates[dates.length - 1] || null;
  const drift = rows.map((r) => ({ ...r, stale: r.lastUpdated !== '—' && newest && r.lastUpdated.slice(0, 10) < newest.slice(0, 10) }));
  return { newest, rows: drift, source: { label: '.claude/ state files', href: ghLink('.claude/DASHBOARD.md') } };
}

function parseTests() {
  const testFiles = walk('apps', (r) => /\.test\.tsx?$/.test(r)).concat(walk('packages', (r) => /\.test\.tsx?$/.test(r)));
  const areas = {};
  let cases = 0;
  for (const f of testFiles) {
    const area = f.startsWith('packages/ui') ? 'packages/ui' : f.startsWith('packages/ai') ? 'packages/ai' : f.startsWith('apps/backend') ? 'apps/backend' : f.startsWith('apps/mobile') ? 'apps/mobile' : 'other';
    const n = (read(f).match(/\b(it|test)\(/g) || []).length;
    areas[area] = areas[area] || { files: 0, cases: 0 };
    areas[area].files++; areas[area].cases += n; cases += n;
  }
  // pgTAP plans
  const pgtap = walk('apps/backend/tests', (r) => r.endsWith('.test.sql')).reduce((n, f) => n + Number(firstMatch(read(f), /select plan\((\d+)\)/) || 0), 0);
  return {
    totalFiles: testFiles.length, totalCases: cases, pgtapAssertions: pgtap, areas,
    note: 'Static counts (Vitest/jest-expo + pgTAP). No live coverage % — sandbox is offline; runs in CI.',
    source: { label: 'test files', href: GH },
  };
}

function parseCI() {
  const wf = walk('.github/workflows', (r) => r.endsWith('.yml'));
  const workflows = wf.map((f) => {
    const s = read(f);
    const name = firstMatch(s, /^name:\s*(.+)/m) || f;
    const jobs = [...s.matchAll(/^\s{2}([a-z][\w-]*):\n\s{4}name:/gm)].map((m) => m[1]);
    const jobNames = [...s.matchAll(/^\s{4}name:\s*(.+)/gm)].map((m) => m[1].trim());
    return { file: f, name, jobs: jobNames.length ? jobNames : jobs, href: ghLink(f) };
  });
  return {
    workflows,
    note: 'Configured pipeline (GitHub Actions). Live run status requires the GitHub API — not available offline.',
    source: { label: '.github/workflows/', href: ghLink('.github/workflows/ci.yml') },
  };
}

function parseBlockers() {
  const dash = read('.claude/DASHBOARD.md');
  const block = firstMatch(dash, /# Blockers\s*\n+([\s\S]*?)\n#/);
  const items = [];
  if (block) {
    if (/ADR-033|Panchang Engine/i.test(block)) items.push({ severity: 'critical', title: 'Canonical Panchang Engine (ADR-033, Proposed)', detail: 'Astronomical algorithm undocumented — panchang compute, calendar/festival markers, sunrise/tithi notifications blocked until Part B ratified.', href: ghLink('docs/architecture/adr/ADR-033-Canonical-Panchang-Computation-Engine.md') });
    if (/GURU_LIVE|Ask Guru live/i.test(block)) items.push({ severity: 'gated', title: 'Ask Guru live answers gated (GURU_LIVE=false)', detail: 'Client complete; live answers off until reviewed corpus + eval readiness (TDD Part 3 §10B).', href: ghLink('apps/mobile/src/domain/guru/transportFactory.ts') });
  }
  return { count: items.length, items, source: { label: '.claude/DASHBOARD.md · Blockers', href: ghLink('.claude/DASHBOARD.md') } };
}

function parseReleaseReadiness() {
  // TDD Part 5 §10.1 go/no-go — derive status from repo signals.
  const items = [
    { item: 'CI gates defined (lint/type/test/a11y/RLS)', done: exists('.github/workflows/ci.yml') },
    { item: 'RLS policy test-suite present', done: exists('apps/backend/tests/rls/rls_policies.test.sql') },
    { item: 'DB integration tests present', done: exists('apps/backend/tests/integration/db_operations.test.sql') },
    { item: 'Migrations + seed present', done: exists('apps/backend/migrations') && exists('apps/backend/seed/seed.sql') },
    { item: 'Panchang accuracy validated (ADR-033)', done: false, note: 'Blocked — engine not implemented' },
    { item: 'AI §10B passed (corpus + eval)', done: false, note: 'Pending — GURU_LIVE off' },
    { item: 'Live Supabase project + secrets provisioned', done: false, note: 'Not yet provisioned' },
    { item: 'Store submission / phased rollout', done: false, note: 'Future milestone (TDD Part 5)' },
  ];
  const ready = items.filter((i) => i.done).length;
  return { ready, total: items.length, items, source: { label: 'TDD Part 5 §10.1 go/no-go', href: ghLink('docs/tdd/05_PLATFORM_DEVOPS.md') } };
}

// Pull a "# Heading" section body out of SESSION.md (single-# headings).
function sessionSection(text, heading) {
  const re = new RegExp(`^#\\s*${heading}[^\\n]*\\n([\\s\\S]*?)(?=^#\\s|\\Z)`, 'mi');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
const bullets = (s) => (s ? s.split('\n').map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean).slice(0, 12) : []);

function parseSessions() {
  const log = git('log --pretty=format:%h%x1f%ad%x1f%s --date=short -40');
  const commits = log.split('\n').filter(Boolean).map((l, idx) => {
    const [hash, date, ...s] = l.split('\x1f');
    let files = [];
    if (idx < 16 && hash) {
      const stat = git(`show --stat --oneline --pretty=format: ${hash}`).trim().split('\n')
        .map((x) => x.trim()).filter((x) => x.includes('|'));
      files = stat.map((x) => x.split('|')[0].trim()).filter(Boolean).slice(0, 20);
    }
    return { hash, date, subject: s.join(''), files, fileCount: files.length };
  });
  const session = read('.claude/SESSION.md');
  const objective = sessionSection(session, 'Session Objective');
  // Structured "journal" view of the current session.
  const journal = {
    objective: objective ? objective.trim() : null,
    workCompleted: bullets(sessionSection(session, 'Work Completed')),
    architecture: bullets(sessionSection(session, 'Architecture Compliance')),
    validation: bullets(sessionSection(session, 'Validation')),
    remaining: bullets(sessionSection(session, 'Remaining Work')),
  };
  return {
    currentObjective: journal.objective,
    currentLastUpdated: lastUpdated(session),
    journal,
    commits,
    source: { label: '.claude/SESSION.md + git log', href: ghLink('.claude/SESSION.md') },
  };
}

// ---------- derived, cross-cutting views (no fabricated data — all from repo signals) ----------
const areaOf = (f) => {
  if (f.startsWith('apps/backend')) return 'backend';
  if (f.startsWith('apps/mobile')) return 'mobile';
  if (f.startsWith('packages/ai')) return 'ai';
  if (f.startsWith('packages/ui') || f.startsWith('packages/design-tokens')) return 'design-system';
  if (f.startsWith('packages/shared') || f.startsWith('packages/api') || f.startsWith('packages/database')) return 'contracts';
  if (f.startsWith('docs')) return 'docs';
  return 'other';
};
const tsCount = (dir) => walk(dir, (r) => /\.(ts|tsx)$/.test(r)).length;
const sloc = (dir) => walk(dir, (r) => /\.(ts|tsx)$/.test(r)).reduce((n, f) => n + read(f).split('\n').length, 0);

function healthOf({ impl, tests, gated, blocked }) {
  if (blocked) return { label: 'Blocked', pill: 'crit' };
  if (gated) return { label: 'Live gated', pill: 'gated' };
  if (impl && tests) return { label: 'Healthy', pill: 'ok' };
  if (impl || tests) return { label: 'In progress', pill: 'warn' };
  return { label: 'Not started', pill: 'mut' };
}

function parseModuleHealth(debtHits, tests) {
  const debtByArea = debtHits.reduce((a, h) => { const k = areaOf(h.file); a[k] = (a[k] || 0) + 1; return a; }, {});
  const t = (a) => tests.areas[a] || { files: 0, cases: 0 };
  const migrations = walk('apps/backend/migrations', (r) => r.endsWith('.sql')).length;
  const docCount = walk('docs', (r) => r.endsWith('.md')).length;
  const wf = walk('.github/workflows', (r) => r.endsWith('.yml')).length;
  const mods = [
    { key: 'Backend', dir: 'apps/backend', href: ghLink('apps/backend'),
      metrics: [{ k: 'Files', v: tsCount('apps/backend') }, { k: 'Migrations', v: migrations }, { k: 'pgTAP', v: tests.pgtapAssertions }, { k: 'Debt', v: debtByArea.backend || 0 }],
      h: healthOf({ impl: migrations > 0, tests: tests.pgtapAssertions > 0 }) },
    { key: 'Mobile', dir: 'apps/mobile', href: ghLink('apps/mobile'),
      metrics: [{ k: 'Files', v: tsCount('apps/mobile') }, { k: 'LOC', v: sloc('apps/mobile') }, { k: 'Test cases', v: t('apps/mobile').cases }, { k: 'Debt', v: debtByArea.mobile || 0 }],
      h: healthOf({ impl: tsCount('apps/mobile') > 3, tests: t('apps/mobile').cases > 0 }) },
    { key: 'AI', dir: 'packages/ai', href: ghLink('packages/ai'),
      metrics: [{ k: 'Files', v: tsCount('packages/ai') }, { k: 'Test cases', v: t('packages/ai').cases }, { k: 'Debt', v: debtByArea.ai || 0 }],
      h: healthOf({ impl: tsCount('packages/ai') > 0, tests: t('packages/ai').cases > 0, gated: true }) },
    { key: 'Design System', dir: 'packages/ui', href: ghLink('packages/ui'),
      metrics: [{ k: 'Files', v: tsCount('packages/ui') + tsCount('packages/design-tokens') }, { k: 'Test cases', v: t('packages/ui').cases }, { k: 'Debt', v: debtByArea['design-system'] || 0 }],
      h: healthOf({ impl: tsCount('packages/ui') > 0, tests: t('packages/ui').cases > 0 }) },
    { key: 'Documentation', dir: 'docs', href: ghLink('docs'),
      metrics: [{ k: 'Doc files', v: docCount }, { k: 'ADRs', v: walk('docs/architecture/adr', (r) => /ADR-\d+.*\.md$/.test(r)).length }],
      h: healthOf({ impl: docCount > 0, tests: true }) },
    { key: 'Testing', dir: 'apps', href: ghLink('.github/workflows/ci.yml'),
      metrics: [{ k: 'Test files', v: tests.totalFiles }, { k: 'Cases', v: tests.totalCases }, { k: 'pgTAP', v: tests.pgtapAssertions }],
      h: healthOf({ impl: tests.totalFiles > 0, tests: tests.totalCases > 0 }) },
    { key: 'Infrastructure', dir: '.github', href: ghLink('.github/workflows'),
      metrics: [{ k: 'Workflows', v: wf }, { k: 'Migrations', v: migrations }],
      h: healthOf({ impl: wf > 0, tests: false }) },
  ];
  return { modules: mods, source: { label: 'repository scan (files · tests · debt)', href: GH } };
}

function parseAiContext() {
  const md = (dir) => walk(dir, (r) => r.endsWith('.md')).map(read).join('\n');
  const corpus = { MRD: md('docs/mrd'), PRD: md('docs/prd'), PDD: md('docs/pdd'), TDD: md('docs/tdd'), ADR: md('docs/architecture/adr') };
  const links = { MRD: ghLink('docs/mrd'), PRD: ghLink('docs/prd'), PDD: ghLink('docs/pdd'), TDD: ghLink('docs/tdd'), ADR: ghLink('docs/architecture/adr/README.md') };
  const testCorpus = walk('apps', (r) => /\.test\.tsx?$/.test(r)).concat(walk('packages', (r) => /\.test\.tsx?$/.test(r))).map(read).join('\n');
  const defs = [
    { name: 'Architecture', kw: /architecture|provider adapter|server-authoritative/i, impl: ['docs/architecture'], gated: false, blocked: false },
    { name: 'Backend', kw: /backend|edge function|SVC_|supabase/i, impl: ['apps/backend'], gated: false, blocked: false },
    { name: 'Mobile', kw: /mobile|react native|expo|SCR_/i, impl: ['apps/mobile'], gated: false, blocked: false },
    { name: 'Design System', kw: /design token|component library|design system/i, impl: ['packages/ui', 'packages/design-tokens'], gated: false, blocked: false },
    { name: 'Ask Guru', kw: /ask guru|\bguru\b|retrieval|RAG/i, impl: ['apps/mobile/src/domain/guru', 'packages/ai'], gated: true, blocked: false },
    { name: 'Notifications', kw: /notification|push|reminder/i, impl: ['apps/mobile/src/notifications', 'apps/backend/functions/notify'], gated: false, blocked: false },
    { name: 'Panchang Engine', kw: /panchang.*(engine|comput)|ADR-033|astronom/i, impl: ['apps/backend/functions/panchang', 'apps/mobile/src/domain/panchang'], gated: false, blocked: true },
  ];
  const nodes = defs.map((d) => {
    const implPresent = d.impl.some((p) => exists(p) && tsCount(p) > 0);
    const tested = d.kw.test(testCorpus);
    const layers = {
      MRD: d.kw.test(corpus.MRD), PRD: d.kw.test(corpus.PRD), PDD: d.kw.test(corpus.PDD),
      TDD: d.kw.test(corpus.TDD), ADR: d.kw.test(corpus.ADR), Impl: implPresent, Tests: tested,
    };
    const keys = Object.keys(layers);
    const have = keys.filter((k) => layers[k]).length;
    const maturity = Math.round((have / keys.length) * 100);
    const h = healthOf({ impl: implPresent, tests: tested, gated: d.gated, blocked: d.blocked });
    return { name: d.name, maturity, layers, links, status: h.label, pill: h.pill };
  });
  return { nodes, source: { label: 'doc corpus + impl presence', href: GH } };
}

function parseRisks(blockers, release, adrs) {
  const risks = [];
  for (const b of blockers.items) {
    const critical = b.severity === 'critical';
    risks.push({
      risk: b.title, probability: critical ? 'High' : 'Medium', impact: 'High',
      level: 'High', owner: 'unassigned', mitigation: b.detail, status: 'Open', href: b.href,
    });
  }
  for (const a of adrs.rows.filter((r) => /proposed/i.test(r.status))) {
    risks.push({
      risk: `Unratified decision: ${a.id} — ${a.title}`, probability: 'Medium', impact: 'Medium',
      level: 'Medium', owner: 'unassigned', mitigation: 'Ratify ADR before dependent work proceeds.', status: 'Open', href: a.href,
    });
  }
  for (const g of release.items.filter((i) => !i.done && i.note)) {
    risks.push({
      risk: g.item, probability: /blocked/i.test(g.note) ? 'High' : 'Medium', impact: 'Medium',
      level: /blocked/i.test(g.note) ? 'High' : 'Low', owner: 'unassigned', mitigation: g.note, status: 'Open',
      href: release.source.href,
    });
  }
  const order = { High: 0, Medium: 1, Low: 2 };
  risks.sort((a, b) => order[a.level] - order[b.level]);
  const byLevel = risks.reduce((a, r) => { a[r.level] = (a[r.level] || 0) + 1; return a; }, {});
  return { count: risks.length, byLevel, items: risks, source: { label: 'derived: blockers + proposed ADRs + open release gates', href: ghLink('.claude/DASHBOARD.md') } };
}

function parseDecisions(adrs) {
  const items = adrs.rows
    .filter((a) => /\d{4}-\d{2}-\d{2}/.test(a.date))
    .map((a) => ({ id: a.id, title: a.title, date: a.date, status: a.status, impact: a.consequences || a.decision || a.summary, href: a.href, related: a.related }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return { count: items.length, items, source: { label: 'ADR log (dates + consequences) · .claude/DECISIONS.md', href: ghLink('docs/architecture/adr/README.md') } };
}

// ============================================================================
function build() {
  // Compute shared signals once, then derive cross-cutting views from them.
  const debtHits = grepRepo(DEBT_PATTERNS);
  const adrs = parseADRs();
  const tests = parseTests();
  const blockers = parseBlockers();
  const releaseReadiness = parseReleaseReadiness();
  const techDebt = parseTechDebt(debtHits);

  const data = {
    generatedAt: new Date().toISOString(),
    repo: { name: 'PanchangPal', branch: 'main', github: GH.replace('/blob/main', ''), head: git('rev-parse --short HEAD').trim() || null },
    executive: parseExecutive(),
    phases: parsePhases(),
    milestones: parseMilestones(),
    roadmap: parseRoadmap(),
    adrs,
    traceability: parseTraceability(),
    dependencyGraph: parseDependencyGraph(),
    repoHealth: parseRepoHealth(),
    moduleHealth: parseModuleHealth(debtHits, tests),
    aiContext: parseAiContext(),
    techDebt,
    docDrift: parseDocDrift(),
    tests,
    ci: parseCI(),
    blockers,
    risks: parseRisks(blockers, releaseReadiness, adrs),
    decisions: parseDecisions(adrs),
    releaseReadiness,
    sessions: parseSessions(),
  };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
  return data;
}

const data = build();
console.log(`command-center.json written (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB) at ${data.generatedAt}`);

if (process.argv.includes('--watch')) {
  const watchDirs = ['.claude', 'docs', 'apps', 'packages', '.github'];
  let timer = null;
  const rebuild = () => { clearTimeout(timer); timer = setTimeout(() => { try { build(); console.log(`↻ regenerated ${new Date().toLocaleTimeString()}`); } catch (e) { console.error(e.message); } }, 300); };
  for (const d of watchDirs) { try { fs.watch(path.join(ROOT, d), { recursive: true }, rebuild); } catch { /* dir may not exist */ } }
  console.log('watching for changes… (Ctrl+C to stop)');
}
