/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// ---------------------------------------------------------------------------
// Projektstand als Datei im Projektordner (data/projekt.json) + automatische Backups.
// Es gibt keine Cloud-Anbindung: Transkripte verlassen deinen Rechner nicht.
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const PROJECT_FILE = path.join(DATA_DIR, 'projekt.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 50;
const BACKUP_INTERVAL_MS = 10 * 60 * 1000; // im Betrieb höchstens alle 10 Minuten ein Backup
let lastBackupAt = 0;

function backup(prefix: string) {
  if (!fs.existsSync(PROJECT_FILE)) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(PROJECT_FILE, path.join(BACKUP_DIR, `${prefix}-${stamp}.json`));
  lastBackupAt = Date.now();
  const all = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith('projekt-') && f.endsWith('.json')).sort();
  for (const f of all.slice(0, Math.max(0, all.length - MAX_BACKUPS))) fs.unlinkSync(path.join(BACKUP_DIR, f));
}

// Bei jedem Serverstart den vorhandenen Stand sichern, bevor irgendetwas geschrieben wird
try {
  backup('projekt-start');
} catch (err) {
  console.error('Start-Backup fehlgeschlagen:', err);
}

app.get('/api/qda/project', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(PROJECT_FILE)) {
      res.json({ project: null });
      return;
    }
    res.json({ project: JSON.parse(fs.readFileSync(PROJECT_FILE, 'utf8')) });
  } catch (err: any) {
    console.error('Projektdatei konnte nicht gelesen werden:', err);
    res.status(500).json({ error: 'Projektdatei konnte nicht gelesen werden.' });
  }
});

app.put('/api/qda/project', (req: Request, res: Response) => {
  try {
    const { project, forceBackup } = req.body || {};
    if (!project || typeof project !== 'object' || !Array.isArray(project.documents)) {
      res.status(400).json({ error: 'Ungültiger Projektstand.' });
      return;
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (forceBackup || Date.now() - lastBackupAt > BACKUP_INTERVAL_MS) backup('projekt');

    // Atomar schreiben: erst temporäre Datei, dann umbenennen
    const tmp = `${PROJECT_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(project, null, 2), 'utf8');
    fs.renameSync(tmp, PROJECT_FILE);
    res.json({ ok: true });
  } catch (err: any) {
    console.error('Projektdatei konnte nicht geschrieben werden:', err);
    res.status(500).json({ error: 'Projektdatei konnte nicht geschrieben werden.' });
  }
});

// ---------------------------------------------------------------------------
// Optionale KI-Codevorschläge über ein LOKALES Ollama (z. B. llama3).
// Die Anfrage geht nur an Ollama auf diesem Rechner, nicht ins Internet.
// ---------------------------------------------------------------------------
const OLLAMA = (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '');

// Ist Ollama erreichbar, welche Modelle sind installiert?
app.get('/api/ki/status', async (_req: Request, res: Response) => {
  try {
    const r = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(4000) });
    const data: any = await r.json();
    res.json({ ok: true, models: (data.models || []).map((m: any) => m.name) });
  } catch {
    res.json({ ok: false, models: [] });
  }
});

// Ein Abschnitt des Transkripts an das Modell schicken und die JSON-Antwort zurückgeben.
// Prüfung der Zitate passiert im Browser (dort liegen Absätze und Codes).
app.post('/api/ki/vorschlaege', async (req: Request, res: Response) => {
  const { model, system, prompt, format } = req.body || {};
  if (!model || !system || !prompt) {
    res.status(400).json({ error: 'model, system und prompt erforderlich' });
    return;
  }
  // format: JSON-Schema (erzwingt die Antwortstruktur); ältere Ollama-Versionen kennen nur 'json'
  const anfrage = (fmt: unknown) =>
    fetch(`${OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        format: fmt,
        options: { temperature: 0.1, num_ctx: 8192 },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(5 * 60 * 1000), // langsame Rechner: bis 5 Minuten je Anfrage
    });
  try {
    let r = await anfrage(format || 'json');
    if (!r.ok && format) r = await anfrage('json');
    if (!r.ok) {
      res.status(502).json({ error: `Ollama antwortet mit Status ${r.status}: ${await r.text()}` });
      return;
    }
    const data: any = await r.json();
    res.json({ content: data.message?.content ?? '' });
  } catch (err: any) {
    res.status(502).json({ error: `Ollama nicht erreichbar oder Zeitüberschreitung: ${err?.message || err}` });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Nur lokal erreichbar: die Transkripte sollen nicht im Netzwerk auftauchen
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`AMK Interviewauswertung läuft auf http://localhost:${PORT}`);
  });
}

startServer();
