// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { initDB } from './db.js';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and Seed data
initDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
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
