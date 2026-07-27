/**
 * DATA_INVENTORY.md conformance (TDD Part 5 §6.1, ADR-031).
 *
 * The inventory is what the privacy policy and the store Data Safety / App Privacy labels are
 * derived from. A store label must be accurate to what the app actually collects, so an inventory
 * that silently falls behind the schema is not a stale document — it is an inaccurate legal
 * disclosure with a paper trail saying it was checked.
 *
 * These tests read the migrations and the mobile source and compare them against the inventory in
 * BOTH directions:
 *
 *   - a table in the schema but not the inventory  → new collection nobody classified
 *   - a table in the inventory but not the schema  → a disclosure for data that no longer exists
 *
 * Same for the `EVT_*` ids the app emits. The pattern is the one `SYNCABLE_KINDS` already uses
 * against SVC_sync's handler: read the other side out of its SOURCE, so the two cannot drift.
 *
 * Deliberately parsed from `apps/backend/migrations` rather than from `packages/database`'s
 * `TABLES` registry — that registry had itself already drifted (29 names against 32 tables), which
 * is the exact failure this test exists to prevent.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const MIGRATIONS_DIR = path.join(REPO_ROOT, 'apps/backend/migrations');
const MOBILE_DIRS = ['apps/mobile/app', 'apps/mobile/src'].map((d) => path.join(REPO_ROOT, d));
const INVENTORY = path.join(REPO_ROOT, 'docs/devops/DATA_INVENTORY.md');

const inventoryText = readFileSync(INVENTORY, 'utf8');

/** Every `create table [if not exists] <name>` across the migrations. */
function tablesInSchema(): Set<string> {
  const found = new Set<string>();
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)) {
      found.add(m[1].toLowerCase());
    }
  }
  return found;
}

/**
 * Table names classified in §2 — the leading `| \`name\` |` cell of each row. Anchored to the
 * section so a table named in prose elsewhere in the document does not count as a classification.
 */
function tablesInInventory(): Set<string> {
  const section = sectionOf('## 2. Database tables', '## 3.');
  const found = new Set<string>();
  for (const m of section.matchAll(/^\|\s*`([a-z_][a-z0-9_]*)`\s*\|/gm)) found.add(m[1]);
  return found;
}

/**
 * `EVT_*` ids that reach the analytics port. Quoted string literals only: the ids that appear in
 * `//` comments beside not-yet-written call sites are intentions, and this inventory records
 * collection. Tests are excluded — they deliberately construct invalid ids to prove rejection.
 */
function eventsEmitted(): Set<string> {
  const found = new Set<string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__' && entry.name !== 'node_modules') walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) continue;
      const src = readFileSync(full, 'utf8');
      for (const m of src.matchAll(/'(EVT_\d{3})'/g)) found.add(m[1]);
    }
  };
  MOBILE_DIRS.forEach(walk);
  return found;
}

/** `EVT_*` ids listed in the §4 table. */
function eventsInInventory(): Set<string> {
  const section = sectionOf('## 4. Analytics events actually emitted', '### 4.1');
  const found = new Set<string>();
  for (const m of section.matchAll(/^\|\s*`(EVT_\d{3})`\s*\|/gm)) found.add(m[1]);
  return found;
}

function sectionOf(startsWith: string, endsWith: string): string {
  const start = inventoryText.indexOf(startsWith);
  const end = inventoryText.indexOf(endsWith, start + 1);
  if (start === -1 || end === -1) {
    throw new Error(`DATA_INVENTORY.md is missing the section "${startsWith}" or "${endsWith}".`);
  }
  return inventoryText.slice(start, end);
}

const sorted = (s: Set<string>): string[] => [...s].sort();

describe('DATA_INVENTORY.md — database tables', () => {
  it('classifies every table in the schema', () => {
    const missing = sorted(tablesInSchema()).filter((t) => !tablesInInventory().has(t));
    expect(
      missing,
      `Tables exist in apps/backend/migrations with no privacy classification in ` +
        `docs/devops/DATA_INVENTORY.md §2. Classify them before shipping: a table nobody ` +
        `classified is collection nobody disclosed.`,
    ).toEqual([]);
  });

  it('does not disclose tables the schema no longer has', () => {
    const stale = sorted(tablesInInventory()).filter((t) => !tablesInSchema().has(t));
    expect(
      stale,
      `DATA_INVENTORY.md §2 classifies tables that no longer exist in the migrations. Remove ` +
        `them — a privacy disclosure for data the product does not hold is still a wrong ` +
        `disclosure.`,
    ).toEqual([]);
  });

  it('parses a plausible schema at all (guards the parser itself)', () => {
    // A regex that silently stops matching would make both tests above pass vacuously.
    const tables = tablesInSchema();
    expect(tables.size).toBeGreaterThan(25);
    expect(tables).toContain('personal_date');
    expect(tables).toContain('analytics_event');
  });
});

describe('DATA_INVENTORY.md — analytics events', () => {
  it('lists every EVT_* the app actually emits', () => {
    const missing = sorted(eventsEmitted()).filter((e) => !eventsInInventory().has(e));
    expect(
      missing,
      `These EVT_* ids reach AnalyticsService.track() but are not listed in ` +
        `DATA_INVENTORY.md §4. Every emitted event is collection and must be inventoried ` +
        `with the props it carries.`,
    ).toEqual([]);
  });

  it('does not claim events the app does not emit', () => {
    const stale = sorted(eventsInInventory()).filter((e) => !eventsEmitted().has(e));
    expect(
      stale,
      `DATA_INVENTORY.md §4 lists EVT_* ids that no longer reach track(). The inventory records ` +
        `collection, not intent — move them to the "named in comments but not emitted" note.`,
    ).toEqual([]);
  });

  it('finds the emitted set at all (guards the parser itself)', () => {
    const events = eventsEmitted();
    expect(events.size).toBeGreaterThan(5);
    expect(events).toContain('EVT_017'); // the North Star input
  });
});
