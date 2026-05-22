/**
 * server.js  –  Express API Server
 * Serves all_news.json  +  static React build (production)
 */

import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync   = promisify(exec);
const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const PORT        = process.env.PORT || 3001;
const NEWS_FILE   = path.join(__dirname, 'all_news.json');
const FRONT_DIST  = path.join(__dirname, 'dist');

const app = express();

app.use(cors());
app.use(express.json());

// ─── API Routes ────────────────────────────────────────────────────────────

/** GET /api/news  →  returns full all_news.json array */
app.get('/api/news', async (_req, res) => {
  try {
    const raw  = await readFile(NEWS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    res.json(Array.isArray(data) ? data : []);
  } catch {
    res.json([]);
  }
});

/** POST /api/fetch  →  triggers fetch_news.js manually */
app.post('/api/fetch', async (_req, res) => {
  try {
    res.json({ status: 'started', message: 'Fetch pipeline running in background…' });
    execAsync('node fetch_news.js', { cwd: __dirname })
      .then(({ stdout }) => console.log('[fetch]', stdout))
      .catch((e)         => console.error('[fetch error]', e.message));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** GET /api/status  →  health check */
app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve React build (production) ───────────────────────────────────────

import { existsSync } from 'fs';
if (existsSync(FRONT_DIST)) {
  app.use(express.static(FRONT_DIST));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONT_DIST, 'index.html'));
  });
  console.log('📦  Serving React build from', FRONT_DIST);
}

// ─── Start ─────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀  API server running at http://localhost:${PORT}`);
  console.log(`    GET  http://localhost:${PORT}/api/news`);
  console.log(`    POST http://localhost:${PORT}/api/fetch   ← trigger pipeline`);
  console.log(`    GET  http://localhost:${PORT}/api/status\n`);
});
