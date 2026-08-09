#!/usr/bin/env node
/**
 * golden-dataset.mjs — validate the panchang golden dataset, and derive its UTC columns.
 *
 * WHY THIS EXISTS. The reviewer transcribes what a reference site (Drik / mPanchang) actually
 * shows, which is LOCAL wall-clock time. ADR-033's dataset needs UTC instants for the boundary
 * columns, because a boundary near local midnight is ambiguous in local time — and that ambiguity
 * is exactly what the S1-dst stratum tests.
 *
 * ⚠️ ASKING A HUMAN TO CONVERT THOSE BY HAND WAS THE ORIGINAL DESIGN AND IT WAS WRONG. 18 of the
 * 46 rows are DST transition days, where the UTC offset changes mid-day. Those are the rows most
 * likely to be mis-converted and the rows specifically built to catch DST bugs, so a slip there
 * would either mask a real defect or manufacture a fake one — with no way to tell which. The
 * reviewer transcribes; code does the arithmetic.
 *
 * ⛔ AND THE ARITHMETIC REFUSES TO GUESS. On a fall-back day a local wall time can occur TWICE,
 * and on a spring-forward day it can not exist at all. Both are hard errors here, never a silent
 * pick: choosing one of two candidate instants would put an hour-wrong value into the one stratum
 * that exists to detect hour-wrong behaviour.
 *
 * Usage:
 *   node scripts/golden-dataset.mjs <csv>            # validate + report; never writes
 *   node scripts/golden-dataset.mjs <csv> --write    # also fill the derived *_end_utc columns
 *
 * Exit 0 = every filled row is internally consistent. Exit 1 = something is wrong or ambiguous.
 * A row that is entirely empty is UNFILLED, which is reported but is not an error — the dataset
 * ships unfilled on purpose (see GOLDEN_DATASET.md §0).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const KEYS = ['row_id', 'tradition', 'location', 'tz', 'lat', 'lng', 'local_date', 'stratum', 'rationale'];
const TRANSCRIBED = ['sunrise', 'sunset', 'tithi', 'tithi_end_local', 'nakshatra', 'nakshatra_end_local', 'yoga', 'karana', 'rahu_kaal_start', 'rahu_kaal_end'];
const DERIVED = ['tithi_end_utc', 'nakshatra_end_utc'];
const PROVENANCE = ['source', 'source_url', 'checked_by', 'checked_on'];
const DERIVED_FROM = { tithi_end_utc: 'tithi_end_local', nakshatra_end_utc: 'nakshatra_end_local' };

const TIME_ONLY = /^([01]\d|2[0-3]):[0-5]\d$/;              // sunrise/sunset/rahu kaal, on local_date
const LOCAL_DT = /^\d{4}-\d{2}-\d{2} ([01]\d|2[0-3]):[0-5]\d$/; // a boundary may fall on another date
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SOURCES = new Set(['drik', 'mpanchang']);

// --- CSV (RFC4180 enough for this file: quoted fields, embedded commas, doubled quotes) ---
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}
const esc = (v) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);

/** Offset (minutes) that `tz` is ahead of UTC at a given instant. */
function offsetAt(instant, tz) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, p.hour === '24' ? 0 : +p.hour, +p.minute, +p.second);
  return (asUtc - instant.getTime()) / 60000;
}

/**
 * Convert "YYYY-MM-DD HH:MM" wall time in `tz` to a UTC instant.
 * Returns {utc} or {error} — never a guess. See the header for why.
 */
function localToUtc(local, tz) {
  const [d, t] = local.split(' ');
  const [Y, M, D] = d.split('-').map(Number);
  const [h, m] = t.split(':').map(Number);
  const naive = Date.UTC(Y, M - 1, D, h, m);

  // Candidate offsets on either side of a possible transition, then keep the ones that round-trip.
  const candidates = new Set();
  for (const probe of [naive - 86400000, naive, naive + 86400000]) candidates.add(offsetAt(new Date(probe), tz));

  const valid = [];
  for (const off of candidates) {
    const utc = new Date(naive - off * 60000);
    if (offsetAt(utc, tz) === off) valid.push(utc.getTime()); // round-trips => this wall time really occurs
  }
  const unique = [...new Set(valid)].sort((a, b) => a - b);

  if (unique.length === 0) {
    return { error: `local time does not exist in ${tz} (spring-forward gap) — check the reference; the clock skipped this hour` };
  }
  if (unique.length > 1) {
    const opts = unique.map((u) => `${new Date(u).toISOString()} (UTC${offsetAt(new Date(u), tz) >= 0 ? '+' : ''}${offsetAt(new Date(u), tz) / 60})`).join(' or ');
    return { error: `local time is AMBIGUOUS in ${tz} (fall-back hour occurs twice): ${opts}. Record the offset the reference used; this tool will not choose.` };
  }
  return { utc: new Date(unique[0]).toISOString().replace('.000Z', 'Z') };
}

// --- main ---
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const write = args.includes('--write');
if (!file) { console.error('usage: node scripts/golden-dataset.mjs <csv> [--write]'); process.exit(1); }

const grid = parseCsv(readFileSync(file, 'utf8'));
const header = grid[0];
const rows = grid.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));

for (const col of [...KEYS, ...TRANSCRIBED, ...DERIVED, ...PROVENANCE]) {
  if (!header.includes(col)) { console.error(`✗ schema: column '${col}' is missing from ${file}`); process.exit(1); }
}

const errors = [];
let unfilled = 0, filled = 0, derivedCount = 0;

for (const r of rows) {
  const id = r.row_id;
  const anyTranscribed = TRANSCRIBED.some((c) => r[c].trim() !== '');
  if (!anyTranscribed) { unfilled++; continue; }
  filled++;

  for (const c of TRANSCRIBED) {
    if (r[c].trim() === '') errors.push(`${id}: '${c}' is empty but the row is partially filled — a half-filled row is worse than an empty one, because it looks checked`);
  }
  for (const c of ['sunrise', 'sunset', 'rahu_kaal_start', 'rahu_kaal_end']) {
    if (r[c].trim() && !TIME_ONLY.test(r[c].trim())) errors.push(`${id}: '${c}' = "${r[c]}" — expected HH:MM (24h) local time on ${r.local_date}`);
  }
  for (const c of ['tithi_end_local', 'nakshatra_end_local']) {
    if (r[c].trim() && !LOCAL_DT.test(r[c].trim())) errors.push(`${id}: '${c}' = "${r[c]}" — expected "YYYY-MM-DD HH:MM" local; a boundary can fall on a different date than local_date, so the date is required`);
  }
  if (!SOURCES.has(r.source.trim())) errors.push(`${id}: 'source' = "${r.source}" — must be one of ${[...SOURCES].join(' | ')}`);
  if (!/^https?:\/\//.test(r.source_url.trim())) errors.push(`${id}: 'source_url' must be the exact dated reference page — a golden value without provenance is an assertion, not a reference`);
  if (!r.checked_by.trim()) errors.push(`${id}: 'checked_by' is empty — reviewer approval is per-row, not per-file`);
  if (r.checked_on.trim() && !ISO_DATE.test(r.checked_on.trim())) errors.push(`${id}: 'checked_on' = "${r.checked_on}" — expected YYYY-MM-DD`);

  for (const [utcCol, localCol] of Object.entries(DERIVED_FROM)) {
    const local = r[localCol].trim();
    if (!local || !LOCAL_DT.test(local)) continue;
    const res = localToUtc(local, r.tz);
    if (res.error) { errors.push(`${id}: ${localCol} "${local}" — ${res.error}`); continue; }
    if (write) { if (r[utcCol] !== res.utc) derivedCount++; r[utcCol] = res.utc; }
    else if (r[utcCol].trim() && r[utcCol].trim() !== res.utc) {
      errors.push(`${id}: ${utcCol} = "${r[utcCol]}" but ${localCol} "${local}" in ${r.tz} is ${res.utc} — the derived column disagrees with what was transcribed`);
    }
  }
}

if (write && !errors.length) {
  const out = [header.map(esc).join(','), ...rows.map((r) => header.map((h) => esc(r[h])).join(','))].join('\n') + '\n';
  writeFileSync(file, out);
}

console.log(`[golden] ${rows.length} rows — ${filled} filled, ${unfilled} unfilled`);
if (write) console.log(errors.length ? '[golden] --write skipped: fix the errors first' : `[golden] wrote ${derivedCount} derived UTC value(s)`);
if (unfilled && !filled) console.log('[golden] dataset is entirely unfilled, which is its shipped state (GOLDEN_DATASET.md §0) — nothing to validate yet.');

if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✓ every filled row is internally consistent.');
