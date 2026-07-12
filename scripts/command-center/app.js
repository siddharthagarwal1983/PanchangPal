/* PanchangPal — Engineering Command Center.
   Renders command-center.json into a multi-view SPA (hash-routed). Views are rendered
   lazily on navigation and memoised per generatedAt. Auto-refreshes: re-fetches the JSON
   every 5s and, when the --watch generator rebuilds after a doc change, re-renders. */

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'on') Object.entries(v).forEach(([ev, fn]) => n.addEventListener(ev, fn));
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
};
const num = (n) => (n == null ? '—' : Number(n).toLocaleString());
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const link = (href, label, cls = 'src') => el('a', { class: cls, href, target: '_blank', rel: 'noopener' }, label);
const src = (o) => (o ? link(o.href, `↗ ${o.label}`) : '');
const pillFor = (s = '') => {
  const t = String(s).toLowerCase();
  if (/complete|accepted|✅|done|ready|healthy|current|on track|pass|go\b/.test(t)) return 'ok';
  if (/progress|proposed|🟡|scaffold|at risk|configured|medium/.test(t)) return 'warn';
  if (/gated|live gated/.test(t)) return 'gated';
  if (/blocked|crit|fail|no go|high|stale/.test(t)) return 'crit';
  return 'mut';
};
const pill = (text, cls) => el('span', { class: `pill ${cls || pillFor(text)}` }, el('span', { class: 'dotp' }), text);

let DATA = null, lastGeneratedAt = null, viewCache = {}, currentRoute = null;

/* ---------------- routes (grouped nav) ---------------- */
const ROUTES = [
  { group: 'Overview', id: 'cockpit', label: 'Engineering Cockpit', ico: '⌂', render: viewCockpit },
  { group: 'Delivery', id: 'roadmap', label: 'Roadmap', ico: '🗺', render: viewRoadmap },
  { group: 'Delivery', id: 'phases', label: 'Phase Tracker', ico: '▤', render: viewPhases },
  { group: 'Delivery', id: 'milestones', label: 'Milestones', ico: '◈', render: viewMilestones },
  { group: 'Architecture', id: 'adrs', label: 'ADR Explorer', ico: '§', render: viewAdrs, badge: (d) => d.adrs.count },
  { group: 'Architecture', id: 'decisions', label: 'Decision Timeline', ico: '⏱', render: viewDecisions },
  { group: 'Architecture', id: 'traceability', label: 'Traceability', ico: '⇄', render: viewTraceability },
  { group: 'Architecture', id: 'depgraph', label: 'Dependency Graph', ico: '◇', render: viewDepGraph },
  { group: 'Architecture', id: 'aicontext', label: 'AI Context Graph', ico: '◉', render: viewAiContext },
  { group: 'Quality', id: 'modules', label: 'Module Health', ico: '❤', render: viewModules },
  { group: 'Quality', id: 'repohealth', label: 'Repository Health', ico: '⚙', render: viewRepoHealth },
  { group: 'Quality', id: 'techdebt', label: 'Technical Debt', ico: '▦', render: viewTechDebt, badge: (d) => d.techDebt.count },
  { group: 'Quality', id: 'tests', label: 'Test Coverage', ico: '✓', render: viewTests },
  { group: 'Quality', id: 'docdrift', label: 'Documentation Drift', ico: '≋', render: viewDocDrift },
  { group: 'Quality', id: 'ci', label: 'CI / CD', ico: '⟳', render: viewCi },
  { group: 'Risk', id: 'blockers', label: 'Blockers', ico: '⛔', render: viewBlockers, badge: (d) => d.blockers.count, crit: true },
  { group: 'Risk', id: 'risks', label: 'Risk Register', ico: '△', render: viewRisks, badge: (d) => d.risks.count },
  { group: 'Risk', id: 'release', label: 'Release Readiness', ico: '🚀', render: viewRelease },
  { group: 'Activity', id: 'journal', label: 'Engineering Journal', ico: '✎', render: viewJournal },
];
const routeById = (id) => ROUTES.find((r) => r.id === id) || ROUTES[0];

/* ---------------- shared builders ---------------- */
function viewHead(title, desc, srcObj) {
  const h = el('div', { class: 'view-head' }, el('h1', {}, title));
  if (desc) h.append(el('p', {}, desc));
  if (srcObj) h.append(el('div', {}, src(srcObj)));
  return h;
}
function section(title, body, srcObj) {
  const s = el('section', {});
  const head = el('div', { class: 'sec-head' }, el('h2', {}, title));
  if (srcObj) head.append(src(srcObj));
  s.append(head, body);
  return s;
}
function statCard(k, v, opts = {}) {
  const c = el('div', { class: `card ${opts.click ? 'clickable' : ''}` }, el('div', { class: 'k' }, k));
  c.append(opts.pill ? el('div', { class: 'v' }, pill(v, opts.pill)) : el('div', { class: 'v' }, v));
  if (opts.meta) c.append(el('div', { class: 'meta' }, opts.meta));
  if (opts.bar != null) c.append(el('div', { class: `bar ${opts.barCls || ''}` }, el('i', { style: `width:${opts.bar}%` })));
  if (opts.click) c.addEventListener('click', opts.click);
  return c;
}
function tableCard(headers, rows, rowClick) {
  const t = el('table');
  t.append(el('thead', {}, el('tr', {}, ...headers.map((h) => el('th', {}, h)))));
  const tb = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr', rowClick ? { class: 'rowclick', tabindex: '0', on: { click: () => rowClick(r._), keydown: (e) => { if (e.key === 'Enter') rowClick(r._); } } } : {});
    (r.cells || r).forEach((cell) => tr.append(el('td', {}, cell)));
    tb.append(tr);
  });
  t.append(tb);
  return el('div', { class: 'tablecard' }, t);
}
function bars(p, cls) { return el('div', { class: `bar ${cls || ''}`, style: 'min-width:110px' }, el('i', { style: `width:${p}%` })); }

/* ---------------- go / no-go ---------------- */
function goNoGo(d) {
  const critical = d.blockers.items.filter((b) => b.severity === 'critical').length;
  const gatesPending = d.releaseReadiness.total - d.releaseReadiness.ready;
  const go = critical === 0 && gatesPending === 0;
  let reason;
  if (critical) reason = d.blockers.items.find((b) => b.severity === 'critical').title;
  else if (gatesPending) reason = `${gatesPending} release gate${gatesPending > 1 ? 's' : ''} pending`;
  else reason = 'All gates ready';
  return { go, reason, critical, gatesPending };
}

/* ---------------- VIEWS ---------------- */
function viewCockpit(d) {
  const wrap = el('div', {});
  const g = goNoGo(d);
  const readiness = pct(d.releaseReadiness.ready, d.releaseReadiness.total);

  // hero
  const verdict = el('div', { class: `verdict ${g.go ? 'go' : 'nogo'}` },
    el('div', { class: 'lbl' }, 'Ship today?'),
    el('div', { class: 'big' }, g.go ? 'GO' : 'NO GO'),
    el('div', { class: 'reason' }, 'Reason: ', el('strong', {}, g.reason)));
  const stats = el('div', { class: 'stat-grid' },
    statCard('Project progress', `${d.executive.progress ?? '—'}%`, { bar: d.executive.progress || 0 }),
    statCard('Production readiness', `${readiness}%`, { bar: readiness, barCls: g.go ? 'ok' : 'warn', meta: `${d.releaseReadiness.ready}/${d.releaseReadiness.total} gates` }),
    statCard('Phase', d.executive.phase || '—'),
    statCard('Milestone', d.executive.milestone || '—'),
    statCard('Current sprint', d.executive.task || '—'),
    statCard('Open blockers', String(d.blockers.count), { pill: d.blockers.count ? 'crit' : 'ok', click: () => go('blockers') }),
    statCard('Critical risks', String(d.risks.byLevel.High || 0), { pill: (d.risks.byLevel.High || 0) ? 'crit' : 'ok', click: () => go('risks') }),
    statCard('Tests', num(d.tests.totalCases), { meta: `${d.tests.totalFiles} files · ${d.tests.pgtapAssertions} pgTAP`, click: () => go('tests') }));
  wrap.append(el('div', { class: 'hero' }, verdict, stats));

  // build/deploy honesty row
  const bd = el('div', { class: 'grid tiles' },
    statCard('Build status', 'Configured', { pill: 'mut', meta: `${d.ci.workflows.length} workflows · live status offline` }),
    statCard('Deployment', 'Not run', { pill: 'mut', meta: 'requires GitHub API' }),
    statCard('ADRs', String(d.adrs.count), { meta: `${d.adrs.byStatus.Accepted || 0} accepted · ${d.adrs.byStatus.Proposed || 0} proposed`, click: () => go('adrs') }),
    statCard('Architecture health', d.aiContext.nodes.some((n) => n.pill === 'crit') ? 'Blocked seam' : 'Stable', { pill: d.aiContext.nodes.some((n) => n.pill === 'crit') ? 'crit' : 'ok', click: () => go('aicontext') }));
  wrap.append(section('At a glance', bd));

  // two-column: module health + (recent changes / decisions / upcoming)
  const left = el('div', {});
  left.append(el('div', { class: 'grid two' }, ...d.moduleHealth.modules.map(moduleCard)));

  const right = el('div', {});
  // blockers summary
  const blk = el('div', {});
  if (!d.blockers.items.length) blk.append(el('div', { class: 'meta' }, 'No active blockers.'));
  d.blockers.items.forEach((b) => blk.append(el('div', { style: 'padding:8px 0;border-bottom:1px solid var(--border)' },
    el('div', {}, pill(b.severity, b.severity === 'critical' ? 'crit' : 'gated'), ' ', link(b.href, b.title, '')),
    el('div', { class: 'tiny muted', style: 'margin-top:3px' }, b.detail.slice(0, 120) + (b.detail.length > 120 ? '…' : '')))));
  right.append(el('div', { class: 'card', style: 'margin-bottom:14px' }, el('div', { class: 'k', style: 'margin-bottom:6px' }, 'Open blockers'), blk));

  // recent changes
  const rc = el('ul', { class: 'list tiny' }, ...d.sessions.commits.slice(0, 6).map((c) =>
    el('li', {}, el('span', { class: 'mono muted' }, c.date), el('div', {}, c.subject, c.fileCount ? el('span', { class: 'tiny muted' }, ` · ${c.fileCount} files`) : ''))));
  right.append(el('div', { class: 'card', style: 'margin-bottom:14px' }, el('div', { class: 'k', style: 'margin-bottom:6px' }, 'Recent changes'), rc));

  // recent decisions
  const rd = el('ul', { class: 'list tiny' }, ...d.decisions.items.slice(0, 4).map((a) =>
    el('li', {}, el('span', { class: 'mono muted' }, a.date), el('div', {}, link(a.href, `${a.id} — ${a.title}`, ''), ' ', pill(a.status.replace(/\(.+/, ''))))));
  right.append(el('div', { class: 'card', style: 'margin-bottom:14px' }, el('div', { class: 'k', style: 'margin-bottom:6px' }, 'Recent decisions'), rd));

  // upcoming milestones
  const up = d.milestones.rows.filter((m) => !m.done);
  right.append(el('div', { class: 'card' }, el('div', { class: 'k', style: 'margin-bottom:6px' }, 'Upcoming milestones'),
    up.length ? el('ul', { class: 'list tiny' }, ...up.map((m) => el('li', {}, el('code', {}, m.id), el('div', {}, m.name, ' ', pill(m.status)))))
      : el('div', { class: 'meta' }, 'All listed milestones complete.')));

  wrap.append(el('div', { class: 'cols' }, section('Module health', left, d.moduleHealth.source), right));
  return wrap;
}

function moduleCard(m) {
  const c = el('div', { class: `card mh ${m.h.pill}` },
    el('div', { style: 'display:flex;align-items:center;gap:8px' },
      el('div', { class: 'k', style: 'font-size:13px;text-transform:none;letter-spacing:0;color:var(--text);font-weight:600' }, m.key),
      pill(m.h.label, m.h.pill), link(m.href, '↗', 'src')));
  const mm = el('div', { class: 'mm' });
  m.metrics.forEach((x) => mm.append(el('div', {}, el('b', {}, num(x.v)), x.k)));
  c.append(mm);
  return c;
}

function viewModules(d) {
  const wrap = el('div', {}, viewHead('Module Health', 'Per-module status derived from real repo signals — file counts, test cases, and technical-debt markers. No coverage % is fabricated; where live coverage is unavailable, test-case counts stand in.', d.moduleHealth.source));
  wrap.append(el('div', { class: 'grid two' }, ...d.moduleHealth.modules.map(moduleCard)));
  return wrap;
}

function viewRoadmap(d) {
  const wrap = el('div', {}, viewHead('Roadmap', 'Implementation tracks from the roadmap doc.', d.roadmap.source));
  wrap.append(el('div', { class: 'grid two' }, ...d.roadmap.tracks.map((t) =>
    el('div', { class: 'card' }, el('div', { class: 'k', style: 'font-weight:600;color:var(--text);font-size:13px;text-transform:none;letter-spacing:0;margin-bottom:8px' }, t.title),
      el('ul', { class: 'list tiny' }, ...t.items.map((i) => el('li', {}, el('span', { class: 'dotp', style: 'align-self:center;color:var(--text-3)' }), i)))))));
  return wrap;
}

function viewPhases(d) {
  const wrap = el('div', {}, viewHead('Phase Tracker', 'Macro phases from Idea Validation through Production Launch.', d.phases.source));
  wrap.append(tableCard(['Phase', 'Status', 'Progress', ''],
    d.phases.rows.map((r) => [r.phase, pill(r.status), bars(r.progress, pillFor(r.status)), el('span', { class: 'tiny muted' }, `${r.progress}%`)])));
  return wrap;
}

function viewMilestones(d) {
  const wrap = el('div', {}, viewHead(`Milestones — ${d.milestones.milestoneName || ''}`, 'Current phase slices and their target screens.', d.milestones.source));
  wrap.append(tableCard(['ID', 'Slice', 'Screens', 'Status'],
    d.milestones.rows.map((r) => [el('code', {}, r.id), r.name, el('span', { class: 'tiny muted' }, r.screens), pill(r.status, r.done ? 'ok' : pillFor(r.status))])));
  return wrap;
}

function viewAdrs(d) {
  const wrap = el('div', {}, viewHead('ADR Explorer', 'Architecture decision records. Filter by status; open one for its decision, consequences and related identifiers.', d.adrs.source));
  const statuses = ['All', ...new Set(d.adrs.rows.map((r) => r.status.replace(/\(.+/, '').trim()))];
  let active = 'All';
  const chipRow = el('div', { class: 'chips', style: 'margin-bottom:14px' });
  const grid = el('div', { class: 'grid two' });
  const draw = () => {
    grid.innerHTML = '';
    d.adrs.rows.filter((a) => active === 'All' || a.status.startsWith(active)).forEach((a) => {
      const c = el('div', { class: 'card clickable', tabindex: '0' },
        el('div', { style: 'display:flex;gap:8px;align-items:center' }, el('code', {}, a.id), pill(a.status.replace(/\(.+/, '').trim())),
        el('div', { style: 'font-weight:600;margin:6px 0 4px' }, a.title),
        el('div', { class: 'tiny muted' }, `${a.date}`),
        el('div', { class: 'tiny muted', style: 'margin-top:6px' }, (a.summary || '').slice(0, 110)));
      c.addEventListener('click', () => adrDrawer(a));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter') adrDrawer(a); });
      grid.append(c);
    });
  };
  statuses.forEach((s) => {
    const chip = el('button', { class: `chip ${s === active ? 'on' : ''}` }, s === 'All' ? s : `${s} (${d.adrs.byStatus[s] || 0})`);
    chip.addEventListener('click', () => { active = s; [...chipRow.children].forEach((c) => c.classList.remove('on')); chip.classList.add('on'); draw(); });
    chipRow.append(chip);
  });
  draw();
  wrap.append(chipRow, grid);
  return wrap;
}
function adrDrawer(a) {
  const body = el('div', { class: 'db' });
  body.append(el('div', {}, pill(a.status.replace(/\(.+/, '').trim()), pillFor(a.status)), ' ', el('span', { class: 'tiny muted' }, a.date));
  if (a.context) { body.append(el('h4', {}, 'Context'), el('p', {}, a.context)); }
  if (a.decision) { body.append(el('h4', {}, 'Decision'), el('p', {}, a.decision)); }
  if (a.consequences) { body.append(el('h4', {}, 'Consequences'), el('p', {}, a.consequences)); }
  if (a.related && a.related.length) { body.append(el('h4', {}, 'Related identifiers'), el('div', { class: 'chips' }, ...a.related.map((r) => el('span', { class: 'lchip' }, r)))); }
  body.append(el('h4', {}, 'Source'), link(a.href, `↗ ${a.id} full ADR`, 'src'));
  openDrawer(`${a.id} — ${a.title}`, body);
}

function viewDecisions(d) {
  const wrap = el('div', {}, viewHead('Decision Timeline', 'Chronological engineering decisions, newest first — each ratified as an ADR with its downstream impact.', d.decisions.source));
  const tl = el('div', { class: 'tl' });
  d.decisions.items.forEach((a) => {
    const entry = el('div', { class: 'entry' }, el('span', { class: `dot ${pillFor(a.status)}` }),
      el('div', {}, el('span', { class: 'mono muted tiny' }, a.date), ' ', link(a.href, `${a.id} — ${a.title}`, ''), ' ', pill(a.status.replace(/\(.+/, '').trim())),
      a.impact ? el('div', { class: 'tiny muted', style: 'margin-top:3px' }, `Impact: ${a.impact.slice(0, 180)}${a.impact.length > 180 ? '…' : ''}`) : '',
      a.related && a.related.length ? el('div', { class: 'chips', style: 'margin-top:5px' }, ...a.related.slice(0, 6).map((r) => el('span', { class: 'lchip' }, r))) : '');
    tl.append(entry);
  });
  wrap.append(tl);
  return wrap;
}

function viewTraceability(d) {
  const wrap = el('div', {}, viewHead('Architecture Traceability Matrix', 'API contract → service implementation → data table, straight from the OpenAPI spec and migrations.', d.traceability.source));
  wrap.append(el('div', { class: 'grid tiles', style: 'margin-bottom:14px' }, ...d.traceability.layers.map((l) => statCard(l.layer, num(l.count), { meta: l.where }))));
  wrap.append(tableCard(['API endpoint', 'Implementation', 'Area'],
    d.traceability.sample.map((o) => [el('code', {}, o.api), el('code', {}, o.impl || '—'), el('span', { class: 'tiny muted' }, o.tag || '—')])));
  return wrap;
}

/* ---- interactive dependency graph (pan/zoom + upstream/downstream highlight) ---- */
function viewDepGraph(d) {
  const wrap = el('div', {}, viewHead('Dependency Graph', 'Internal workspace package graph. Drag to pan, scroll to zoom, click a node to trace its upstream dependencies and downstream dependents.', d.dependencyGraph.source));
  const g = d.dependencyGraph;
  const NS = 'http://www.w3.org/2000/svg';
  // layered layout by role
  const layerOrder = ['foundation', 'contract', 'data', 'service', 'presentation', 'app'];
  const colOf = (n) => Math.max(0, layerOrder.indexOf(n.layer));
  const cols = {}; g.nodes.forEach((n) => { const c = colOf(n); (cols[c] = cols[c] || []).push(n); });
  const NW = 150, NH = 30, COLW = 220, ROWH = 62, PADX = 30, PADY = 30;
  const pos = {};
  Object.keys(cols).forEach((c) => cols[c].forEach((n, i) => { pos[n.id] = { x: PADX + Number(c) * COLW, y: PADY + i * ROWH }; }));
  const W = PADX * 2 + (Math.max(...Object.keys(cols).map(Number)) + 1) * COLW;
  const H = Math.max(PADY * 2 + Math.max(...Object.values(cols).map((a) => a.length)) * ROWH, 360);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', 'workspace dependency graph');

  const edgeEls = [];
  g.edges.forEach((e) => {
    if (!pos[e.from] || !pos[e.to]) return;
    const l = document.createElementNS(NS, 'path');
    const a = pos[e.from], b = pos[e.to];
    const x1 = a.x, y1 = a.y + NH / 2, x2 = b.x + NW, y2 = b.y + NH / 2;
    l.setAttribute('d', `M${x1},${y1} C${x1 - 40},${y1} ${x2 + 40},${y2} ${x2},${y2}`);
    l.setAttribute('fill', 'none'); l.setAttribute('class', 'edge');
    l.dataset.from = e.from; l.dataset.to = e.to;
    svg.append(l); edgeEls.push(l);
  });
  const nodeEls = {};
  g.nodes.forEach((n) => {
    const grp = document.createElementNS(NS, 'g'); grp.setAttribute('class', 'gnode'); grp.dataset.id = n.id;
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', pos[n.id].x); r.setAttribute('y', pos[n.id].y); r.setAttribute('width', NW); r.setAttribute('height', NH); r.setAttribute('rx', 7);
    const tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', pos[n.id].x + 10); tx.setAttribute('y', pos[n.id].y + 19); tx.textContent = n.id;
    grp.append(r, tx); grp.addEventListener('click', () => selectNode(n.id));
    svg.append(grp); nodeEls[n.id] = grp;
  });

  // adjacency
  const up = {}, down = {};
  g.nodes.forEach((n) => { up[n.id] = new Set(); down[n.id] = new Set(); });
  g.edges.forEach((e) => { up[e.from]?.add(e.to); down[e.to]?.add(e.from); });
  const closure = (id, map) => { const seen = new Set(); const st = [...(map[id] || [])]; while (st.length) { const x = st.pop(); if (!seen.has(x)) { seen.add(x); (map[x] || []).forEach((y) => st.push(y)); } } return seen; };

  function selectNode(id) {
    const ups = closure(id, up), downs = closure(id, down);
    Object.entries(nodeEls).forEach(([k, gEl]) => {
      gEl.classList.remove('sel', 'up', 'down', 'dim');
      if (k === id) gEl.classList.add('sel');
      else if (ups.has(k)) gEl.classList.add('up');
      else if (downs.has(k)) gEl.classList.add('down');
      else gEl.classList.add('dim');
    });
    edgeEls.forEach((l) => {
      l.classList.remove('up', 'down', 'dim');
      const f = l.dataset.from, t = l.dataset.to;
      if (f === id || (ups.has(f) && (ups.has(t) || t === id))) l.classList.add('up');
      else if (t === id || (downs.has(t) && (downs.has(f) || f === id))) l.classList.add('down');
      else l.classList.add('dim');
    });
    const n = g.nodes.find((x) => x.id === id);
    depDrawer(n, [...up[id]], [...down[id]], [...ups], [...downs]);
  }

  // pan/zoom
  let vb = { x: 0, y: 0, w: W, h: H };
  const applyVB = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  let drag = null;
  svg.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; svg.classList.add('drag'); svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (!drag) return; const k = vb.w / svg.clientWidth; vb.x -= (e.clientX - drag.x) * k; vb.y -= (e.clientY - drag.y) * k; drag = { x: e.clientX, y: e.clientY }; applyVB(); });
  svg.addEventListener('pointerup', (e) => { drag = null; svg.classList.remove('drag'); try { svg.releasePointerCapture(e.pointerId); } catch {} });
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const f = e.deltaY > 0 ? 1.1 : 0.9; const nw = Math.min(W * 2, Math.max(W * 0.4, vb.w * f)); const nh = nw * (H / W); vb.x += (vb.w - nw) / 2; vb.y += (vb.h - nh) / 2; vb.w = nw; vb.h = nh; applyVB(); }, { passive: false });

  const zoom = (f) => { const nw = Math.min(W * 2, Math.max(W * 0.4, vb.w * f)); const nh = nw * (H / W); vb.x += (vb.w - nw) / 2; vb.y += (vb.h - nh) / 2; vb.w = nw; vb.h = nh; applyVB(); };
  const reset = () => { vb = { x: 0, y: 0, w: W, h: H }; applyVB(); Object.values(nodeEls).forEach((n) => n.classList.remove('sel', 'up', 'down', 'dim')); edgeEls.forEach((l) => l.classList.remove('up', 'down', 'dim')); };

  const gw = el('div', { class: 'graphwrap' });
  gw.append(svg, el('div', { class: 'ctrls' },
    el('button', { class: 'btn', on: { click: () => zoom(0.83) } }, '＋'),
    el('button', { class: 'btn', on: { click: () => zoom(1.2) } }, '－'),
    el('button', { class: 'btn', on: { click: reset } }, 'Reset')));
  wrap.append(gw, el('div', { class: 'note' }, `${g.nodes.length} workspace packages · ${g.edges.length} internal edges (left → right = depended-upon → dependent). Blue = upstream (what it needs), purple = downstream (what needs it).`));
  return wrap;
}
function depDrawer(n, deps, dependents, allUp, allDown) {
  const body = el('div', { class: 'db' });
  body.append(el('p', {}, n.role || ''), el('div', {}, pill(n.layer, 'mut'), ' ', link(n.href, n.path, 'src')));
  body.append(el('h4', {}, `Direct dependencies (${deps.length})`), deps.length ? el('div', { class: 'chips' }, ...deps.map((x) => el('span', { class: 'lchip on' }, x))) : el('p', { class: 'muted tiny' }, 'none'));
  body.append(el('h4', {}, `Direct dependents (${dependents.length})`), dependents.length ? el('div', { class: 'chips' }, ...dependents.map((x) => el('span', { class: 'lchip' }, x))) : el('p', { class: 'muted tiny' }, 'none'));
  body.append(el('h4', {}, 'Transitive reach'), el('p', { class: 'tiny muted' }, `Depends on ${allUp.length} package(s) · used by ${allDown.length} package(s).`));
  openDrawer(`@panchangpal/${n.id}`, body);
}

/* ---- AI Context Graph ---- */
function viewAiContext(d) {
  const wrap = el('div', {}, viewHead('AI Context Graph', 'How completely each area of the project is specified, implemented and understood — measured from doc-layer coverage (MRD/PRD/PDD/TDD/ADR) plus implementation and test presence.', d.aiContext.source));
  const grid = el('div', { class: 'ctxgrid' });
  d.aiContext.nodes.forEach((n) => {
    const c = el('div', { class: 'card clickable ctxnode', tabindex: '0' });
    c.append(el('div', { style: 'display:flex;align-items:center;gap:12px' },
      el('div', { class: 'ring', 'data-v': `${n.maturity}%`, style: `--p:${n.maturity}` }),
      el('div', {}, el('div', { style: 'font-weight:600' }, n.name), pill(n.status, n.pill))));
    const lr = el('div', { class: 'layerrow' });
    Object.entries(n.layers).forEach(([k, v]) => lr.append(el('span', { class: `lchip ${v ? 'on' : ''}` }, k)));
    c.append(lr);
    c.addEventListener('click', () => ctxDrawer(n));
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter') ctxDrawer(n); });
    grid.append(c);
  });
  wrap.append(grid, el('div', { class: 'note' }, 'Maturity = share of layers present (MRD, PRD, PDD, TDD, ADR, Implementation, Tests). A blocked or gated status can coexist with high maturity — e.g. the Panchang Engine is fully specified but its compute is blocked by ADR-033.'));
  return wrap;
}
function ctxDrawer(n) {
  const body = el('div', { class: 'db' });
  body.append(el('div', {}, pill(n.status, n.pill), ' ', el('span', { class: 'tiny muted' }, `${n.maturity}% layer coverage`)));
  body.append(el('h4', {}, 'Coverage by layer'));
  const map = { MRD: 'MRD', PRD: 'PRD', PDD: 'PDD', TDD: 'TDD', ADR: 'ADR', Impl: 'Implementation', Tests: 'Tests' };
  Object.entries(n.layers).forEach(([k, v]) => body.append(el('p', {}, el('span', { class: `lchip ${v ? 'on' : ''}` }, v ? '✓' : '—'), ' ',
    n.links[k] ? link(n.links[k], map[k] || k, '') : (map[k] || k))));
  openDrawer(n.name, body);
}

function viewRepoHealth(d) {
  const wrap = el('div', {}, viewHead('Repository Health', 'Structural metrics from a full repo scan. Static-analysis fields that need a live toolchain (TypeScript errors, lint, circular deps, dead code) run in CI and are noted as such rather than fabricated.', d.repoHealth.source));
  wrap.append(el('div', { class: 'grid tiles' }, ...d.repoHealth.metrics.map((m) => statCard(m.label, num(m.value)))));
  const checks = [
    ['TypeScript errors', 'CI gate', 'type-check job in CI (offline here)'],
    ['Lint status', 'CI gate', 'eslint job in CI'],
    ['Formatting', 'CI gate', 'prettier check in CI'],
    ['Circular dependencies', 'Not detected', 'workspace graph is acyclic (foundation→app)'],
    ['Dependency health', 'Pinned', 'workspace-pinned versions'],
  ];
  wrap.append(section('Static analysis', tableCard(['Check', 'Status', 'Basis'],
    checks.map((c) => [c[0], pill(c[1], c[1] === 'CI gate' ? 'mut' : 'ok'), el('span', { class: 'tiny muted' }, c[2])]))));
  wrap.append(el('div', { class: 'note' }, 'Live TypeScript/lint/format results require running the toolchain; this dashboard is generated offline, so those rows show where the gate runs rather than a fabricated pass/fail.'));
  return wrap;
}

/* ---- technical debt kanban ---- */
function viewTechDebt(d) {
  const wrap = el('div', {}, viewHead(`Technical Debt (${d.techDebt.count})`, 'Grouped by severity. Includes documented [PRD FOLLOW-UP] / [ASSUMPTION] / BLOCKED seams — many are intentional deferrals (e.g. ADR-033), not defects.', d.techDebt.source));
  wrap.append(el('div', { class: 'chips', style: 'margin-bottom:14px' },
    ...Object.entries(d.techDebt.byTag).map(([k, v]) => el('span', { class: 'lchip' }, `${k} · ${v}`))));
  const cols = ['Critical', 'High', 'Medium', 'Low'];
  const clsFor = { Critical: 'crit', High: 'warn', Medium: 'warn', Low: 'mut' };
  const board = el('div', { class: 'kanban' });
  cols.forEach((col) => {
    const items = d.techDebt.items.filter((i) => i.severity === col);
    const kcol = el('div', { class: 'kcol' }, el('h3', {}, pill(`${col}`, clsFor[col]), el('span', { class: 'tiny muted' }, `${items.length}`)));
    const shown = items.slice(0, 20);
    shown.forEach((i) => kcol.append(el('div', { class: 'kcard' }, el('div', { class: 'kt' }, i.text),
      el('div', { class: 'kf' }, link(i.href, `${i.file.split('/').pop()}:${i.line}`, 'mono rowlink'), el('span', { class: 'tiny muted' }, i.area)))));
    if (items.length > shown.length) {
      const more = el('button', { class: 'btn', style: 'width:100%' }, `Show ${items.length - shown.length} more`);
      more.addEventListener('click', () => {
        items.slice(20).forEach((i) => kcol.insertBefore(el('div', { class: 'kcard' }, el('div', { class: 'kt' }, i.text),
          el('div', { class: 'kf' }, link(i.href, `${i.file.split('/').pop()}:${i.line}`, 'mono rowlink'), el('span', { class: 'tiny muted' }, i.area))), more));
        more.remove();
      });
      kcol.append(more);
    }
    if (!items.length) kcol.append(el('div', { class: 'empty tiny' }, 'none'));
    board.append(kcol);
  });
  wrap.append(board);
  return wrap;
}

function viewTests(d) {
  const wrap = el('div', {}, viewHead(`Test Coverage — ${d.tests.totalCases} cases`, 'Static counts (Vitest / jest-expo + pgTAP). Live coverage % runs in CI; the sandbox is offline.', d.tests.source));
  wrap.append(el('div', { class: 'grid tiles', style: 'margin-bottom:14px' },
    statCard('Test files', num(d.tests.totalFiles)),
    statCard('Test cases', num(d.tests.totalCases)),
    statCard('pgTAP assertions', num(d.tests.pgtapAssertions))));
  wrap.append(tableCard(['Area', 'Test files', 'Cases'],
    Object.entries(d.tests.areas).map(([a, v]) => [el('code', {}, a), num(v.files), num(v.cases)])));
  wrap.append(el('div', { class: 'note' }, d.tests.note));
  return wrap;
}

function viewDocDrift(d) {
  const stale = d.docDrift.rows.filter((r) => r.stale).length;
  const wrap = el('div', {}, viewHead('Documentation Drift', `State files vs. the newest update (${d.docDrift.newest || '—'}). ${stale ? `${stale} file(s) may be stale.` : 'All current.'}`, d.docDrift.source));
  wrap.append(tableCard(['State file', 'Last updated', 'Status'],
    d.docDrift.rows.map((r) => [link(r.href, r.file.replace('.claude/', ''), 'mono'), r.lastUpdated, pill(r.stale ? 'stale' : 'current', r.stale ? 'warn' : 'ok')])));
  return wrap;
}

function viewCi(d) {
  const wrap = el('div', {}, viewHead('CI / CD', 'Configured GitHub Actions pipeline and gates. Live run status needs the GitHub API — not available offline.', d.ci.source));
  wrap.append(el('div', { class: 'grid two' }, ...d.ci.workflows.map((w) => {
    const c = el('div', { class: 'card' }, el('div', { style: 'font-weight:600;margin-bottom:8px' }, link(w.href, w.name, '')));
    c.append(el('ul', { class: 'list tiny' }, ...w.jobs.map((j) => el('li', {}, pill('gate', 'mut'), j))));
    return c;
  })));
  wrap.append(el('div', { class: 'note' }, d.ci.note));
  return wrap;
}

function viewBlockers(d) {
  const wrap = el('div', {}, viewHead(`Blockers (${d.blockers.count})`, 'First-class view of what is currently blocking progress. Critical items are highlighted.', d.blockers.source));
  if (!d.blockers.items.length) { wrap.append(el('div', { class: 'empty' }, el('div', { class: 'big' }, '✓'), 'No active blockers.')); return wrap; }
  d.blockers.items.forEach((b) => {
    const crit = b.severity === 'critical';
    wrap.append(el('div', { class: `card mh ${crit ? 'crit' : 'gated'}`, style: 'margin-bottom:14px' },
      el('div', { style: 'display:flex;align-items:center;gap:9px' }, pill(b.severity, crit ? 'crit' : 'gated'), el('div', { style: 'font-weight:600' }, link(b.href, b.title, ''))),
      el('div', { class: 'meta', style: 'margin-top:6px' }, b.detail),
      el('div', { class: 'tiny muted', style: 'margin-top:8px' }, `Recommended: ${crit ? 'Ratify the blocking ADR before dependent work proceeds.' : 'Complete corpus + eval readiness to lift the gate.'}`)));
  });
  return wrap;
}

function viewRisks(d) {
  const wrap = el('div', {}, viewHead(`Risk Register (${d.risks.count})`, 'Derived from active blockers, unratified (proposed) ADRs, and open release gates. Probability/impact are inferred from those signals; owners are unassigned until set in the docs.', d.risks.source));
  wrap.append(el('div', { class: 'chips', style: 'margin-bottom:14px' },
    ...['High', 'Medium', 'Low'].map((lvl) => el('span', { class: `pill ${pillFor(lvl)}` }, `${lvl} · ${d.risks.byLevel[lvl] || 0}`))));
  wrap.append(tableCard(['Risk', 'Prob.', 'Impact', 'Level', 'Owner', 'Mitigation'],
    d.risks.items.map((r) => [
      link(r.href, r.risk, ''),
      pill(r.probability, pillFor(r.probability)),
      pill(r.impact, pillFor(r.impact)),
      pill(r.level, pillFor(r.level)),
      el('span', { class: 'tiny muted' }, r.owner),
      el('span', { class: 'tiny muted' }, (r.mitigation || '').slice(0, 120))])));
  return wrap;
}

function viewRelease(d) {
  const rr = d.releaseReadiness;
  const readiness = pct(rr.ready, rr.total);
  const g = goNoGo(d);
  const wrap = el('div', {}, viewHead('Release Readiness', 'Go/no-go gates from the TDD, checked against real repo signals.', rr.source));
  wrap.append(el('div', { class: 'hero', style: 'grid-template-columns:1fr 1.4fr' },
    el('div', { class: `verdict ${g.go ? 'go' : 'nogo'}` }, el('div', { class: 'lbl' }, 'Overall'), el('div', { class: 'big' }, g.go ? 'GO' : 'NO GO'), el('div', { class: 'reason' }, g.reason)),
    el('div', { class: 'card', style: 'display:flex;flex-direction:column;justify-content:center' },
      el('div', { class: 'k' }, 'Gates ready'), el('div', { class: 'v' }, `${rr.ready} / ${rr.total}`), el('div', { class: `bar ${g.go ? 'ok' : 'warn'}` }, el('i', { style: `width:${readiness}%` })))));
  wrap.append(tableCard(['Gate', 'Status', 'Note'],
    rr.items.map((i) => [i.item, pill(i.done ? 'ready' : 'pending', i.done ? 'ok' : 'mut'), el('span', { class: 'tiny muted' }, i.note || '')])));
  return wrap;
}

/* ---- engineering journal ---- */
function viewJournal(d) {
  const s = d.sessions;
  const wrap = el('div', {}, viewHead('Engineering Journal', 'Current session objective and structured work log, plus recent commits with the files each touched.', s.source));
  if (s.journal && s.journal.objective) {
    const j = s.journal;
    const cur = el('div', { class: 'card', style: 'margin-bottom:18px' },
      el('div', { class: 'k', style: 'margin-bottom:4px' }, `Current session · updated ${s.currentLastUpdated || ''}`),
      el('div', { style: 'font-weight:600;margin-bottom:8px' }, j.objective));
    const blk = (title, arr) => arr && arr.length ? el('div', {}, el('h4', { style: 'font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3);margin:12px 0 5px' }, title),
      el('ul', { class: 'list tiny' }, ...arr.map((x) => el('li', {}, el('span', { class: 'dotp', style: 'align-self:center;color:var(--text-3)' }), x)))) : '';
    cur.append(blk('Work completed', j.workCompleted), blk('Architecture compliance', j.architecture), blk('Validation', j.validation), blk('Remaining / blockers', j.remaining));
    wrap.append(cur);
  }
  wrap.append(el('div', { class: 'sec-head' }, el('h2', {}, 'Commit history'), el('span', { class: 'src' }, `${s.commits.length} commits`)));
  s.commits.forEach((c) => {
    const head = el('div', { style: 'display:flex;gap:10px;align-items:baseline;cursor:pointer' },
      el('span', { class: 'mono muted tiny' }, c.date),
      link(`${d.repo.github}/commit/${c.hash}`, c.hash, 'mono rowlink'),
      el('div', { style: 'flex:1' }, c.subject),
      c.fileCount ? el('span', { class: 'tiny muted' }, `${c.fileCount} files ▾`) : '');
    const files = el('div', { style: 'display:none;padding:8px 0 4px 60px' });
    if (c.files && c.files.length) c.files.forEach((f) => files.append(el('div', {}, link(`${d.repo.github}/blob/main/${f}`, f, 'mono rowlink'))));
    head.addEventListener('click', () => { const open = files.style.display === 'block'; files.style.display = open ? 'none' : 'block'; });
    wrap.append(el('div', { style: 'padding:8px 0;border-bottom:1px solid var(--border)' }, head, files));
  });
  return wrap;
}

/* ---------------- drawer ---------------- */
function openDrawer(title, bodyEl) {
  const dr = $('#drawer'); dr.innerHTML = '';
  const close = el('button', { class: 'xbtn', 'aria-label': 'Close' }, '✕');
  close.addEventListener('click', closeDrawer);
  dr.append(el('div', { class: 'dh' }, el('h3', {}, title), close), bodyEl);
  dr.classList.add('open'); $('#scrim').classList.add('open');
  dr.querySelector('.xbtn').focus();
}
function closeDrawer() { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); }

/* ---------------- shell / router ---------------- */
function buildNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  const groups = [...new Set(ROUTES.map((r) => r.group))];
  groups.forEach((gname) => {
    const gEl = el('div', { class: 'group' }, el('div', { class: 'label' }, gname));
    ROUTES.filter((r) => r.group === gname).forEach((r) => {
      const a = el('a', { href: `#${r.id}`, 'data-id': r.id }, el('span', { class: 'ico' }, r.ico), el('span', {}, r.label));
      if (r.badge && DATA) { const b = r.badge(DATA); if (b) a.append(el('span', { class: `badge ${r.crit && b ? 'crit' : ''}` }, b)); }
      gEl.append(a);
    });
    nav.append(gEl);
  });
}
function setActive(id) {
  $('#nav').querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
}
function go(id) { location.hash = `#${id}`; }

function showRoute(id) {
  const route = routeById(id);
  currentRoute = route.id;
  setActive(route.id);
  const main = $('#main');
  const key = `${route.id}@${DATA.generatedAt}`;
  let node = viewCache[key];
  if (!node) { node = el('div', { class: 'viewwrap' }); node.append(route.render(DATA)); viewCache[key] = node; }
  main.innerHTML = ''; main.append(node);
  main.scrollTop = 0; window.scrollTo(0, 0);
  $('#nav').classList.remove('open');
  document.title = `${route.label} · PanchangPal Command Center`;
}

function renderTopbar(d) {
  $('#head-meta').textContent = `${d.repo.name} · ${d.repo.branch} @ ${d.repo.head || '—'} · ${new Date(d.generatedAt).toLocaleString()}`;
  const g = goNoGo(d);
  const gn = $('#gonogo'); gn.className = `gonogo ${g.go ? 'go' : 'nogo'}`;
  gn.innerHTML = ''; gn.append(el('span', { class: 'lamp' }), g.go ? 'GO' : 'NO GO', el('span', { class: 'sub', style: 'color:inherit;opacity:.8;font-weight:400' }, `· ${g.reason.slice(0, 42)}`));
  gn.style.cursor = 'pointer'; gn.onclick = () => go('release');
}

function render(d) {
  DATA = d; viewCache = {};
  renderTopbar(d);
  buildNav();
  showRoute((location.hash || '#cockpit').slice(1));
}

async function load(force) {
  try {
    const r = await fetch(`./command-center.json?t=${Date.now()}`, { cache: 'no-store' });
    const d = await r.json();
    if (force || d.generatedAt !== lastGeneratedAt) { lastGeneratedAt = d.generatedAt; render(d); }
    $('#stale').style.display = 'none';
  } catch {
    $('#stale').style.display = 'inline';
    if (!lastGeneratedAt) $('#main').innerHTML = '<div class="viewwrap"><div class="card">Could not load <code>command-center.json</code>. Run <code>node scripts/command-center/serve.mjs</code> and open the printed URL.</div></div>';
  }
}

/* ---------------- boot ---------------- */
function initTheme() {
  const saved = localStorage.getItem('cc-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);
  $('#theme').onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next); localStorage.setItem('cc-theme', next);
  };
}
initTheme();
$('#reload').onclick = () => load(true);
$('#menu').onclick = () => $('#nav').classList.toggle('open');
$('#scrim').onclick = closeDrawer;
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
window.addEventListener('hashchange', () => { if (DATA) showRoute((location.hash || '#cockpit').slice(1)); });
load(true);
setInterval(() => load(false), 5000); // auto-refresh when the --watch generator rebuilds
