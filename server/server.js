// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { databaseStatus, initDB } from './db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import projectsRoutes from './routes/projects.js';
import experienceRoutes from './routes/experience.js';
import toolsRoutes from './routes/tools.js';
import skillsRoutes from './routes/skills.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import eventsRoutes from './routes/events.js';
import certificationsRoutes from './routes/certifications.js';
import contentHistoryRoutes from './routes/contentHistory.js';

if (!process.env.VERCEL) dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize durable storage and seed local defaults before accepting requests.
await initDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
});

const apiAliases = [
  '/auth', '/profile', '/projects', '/experience', '/tools', '/skills',
  '/contact', '/settings', '/upload', '/stats', '/events', '/certifications',
  '/content-history'
];
app.use(async (req, res, next) => {
  const isApiRequest = req.path.startsWith('/api') || req.path === '/health' ||
    apiAliases.some(prefix => req.path === prefix || req.path.startsWith(`${prefix}/`));
  if (isApiRequest && !databaseStatus.ready && process.env.VERCEL) {
    await initDB();
  }
  if (isApiRequest && !databaseStatus.ready) {
    return res.status(503).json({
      success: false,
      message: databaseStatus.message || 'Durable CMS storage is unavailable.'
    });
  }
  next();
});

// Static uploads directory
const uploadsDir = process.env.VERCEL
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('[Uploads] Directory creation warning:', err.message);
  }
}
app.use('/uploads', express.static(uploadsDir));

// API Routes (supports /api/* and /* paths for resilient Vercel rewrites)
const apiRoutes = [
  ['/api/auth', '/auth', authRoutes],
  ['/api/profile', '/profile', profileRoutes],
  ['/api/projects', '/projects', projectsRoutes],
  ['/api/experience', '/experience', experienceRoutes],
  ['/api/tools', '/tools', toolsRoutes],
  ['/api/skills', '/skills', skillsRoutes],
  ['/api/contact', '/contact', contactRoutes],
  ['/api/settings', '/settings', settingsRoutes],
  ['/api/upload', '/upload', uploadRoutes],
  ['/api/stats', '/stats', statsRoutes],
  ['/api/events', '/events', eventsRoutes],
  ['/api/certifications', '/certifications', certificationsRoutes],
  ['/api/content-history', '/content-history', contentHistoryRoutes],
];

for (const [apiPath, altPath, router] of apiRoutes) {
  app.use(apiPath, router);
  app.use(altPath, router);
}

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  const ready = databaseStatus.ready;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    database: ready ? (process.env.VERCEL ? 'supabase' : 'sqlite') : 'unavailable',
    message: databaseStatus.message || undefined,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Production: Serve Frontend if dist exists
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.resolve(distPath, 'index.html'));
    }
    next();
  });
}

// Error handling middleware to catch any runtime exceptions
app.use((err, req, res, next) => {
  console.error('[Vezta Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server backend.'
  });
});

// Start Server (standalone mode, not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Vezta CMS API] Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
