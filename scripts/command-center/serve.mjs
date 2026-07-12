#!/usr/bin/env node
/**
 * Static server for the Command Center + live regeneration. Serves this folder and, unless
 * --no-watch is passed, watches the repo and rebuilds command-center.json on any change so the
 * dashboard auto-refreshes (the UI polls the JSON every 5s). No external dependencies.
 *
 *   node scripts/command-center/serve.mjs [--port 4599] [--no-watch]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const portArg = process.argv.indexOf('--port');
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 4599;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function regenerate() {
  try { execFileSync(process.execPath, [path.join(__dirname, 'generate.mjs')], { stdio: 'ignore' }); }
  catch (e) { console.error('generate failed:', e.message); }
}

regenerate(); // fresh data on boot

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  const file = path.join(__dirname, url === '/' ? 'index.html' : decodeURIComponent(url));
  if (!file.startsWith(__dirname)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Command Center → http://localhost:${PORT}`));

if (!process.argv.includes('--no-watch')) {
  let timer = null;
  const onChange = () => { clearTimeout(timer); timer = setTimeout(() => { regenerate(); console.log(`↻ regenerated ${new Date().toLocaleTimeString()}`); }, 400); };
  for (const d of ['.claude', 'docs', 'apps', 'packages', '.github']) {
    try { fs.watch(path.join(ROOT, d), { recursive: true }, onChange); } catch { /* ignore */ }
  }
  console.log('watching repo for changes — dashboard updates automatically.');
}
