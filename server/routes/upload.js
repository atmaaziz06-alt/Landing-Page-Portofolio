// server/routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const useSupabaseStorage = Boolean(process.env.VERCEL);
const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = 'portfolio-uploads';
const uploadDir = process.env.VERCEL
  ? path.resolve(os.tmpdir(), 'uploads')
  : path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('[Uploads] Directory creation warning:', err.message);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg|gif|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) || allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, SVG, GIF) and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

async function persistUploadedFile(file) {
  if (!useSupabaseStorage) {
    return `/uploads/${file.filename}`;
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const error = new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    error.status = 503;
    throw error;
  }

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${storageBucket}/${encodeURIComponent(file.filename)}`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': file.mimetype,
        'Cache-Control': 'max-age=31536000',
        'x-upsert': 'false'
      },
      body: await fs.promises.readFile(file.path),
      signal: AbortSignal.timeout(20000)
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const error = new Error(payload?.message || payload?.error || `Supabase Storage upload failed (${response.status}).`);
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${encodeURIComponent(file.filename)}`;
}

async function cleanupTemporaryFile(file) {
  if (useSupabaseStorage && file?.path) {
    await fs.promises.unlink(file.path).catch((error) => {
      if (error.code !== 'ENOENT') {
        console.warn('[Uploads] Could not remove temporary upload:', error.message);
      }
    });
  }
}

// POST /api/upload (Single file, Protected)
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  try {
    const fileUrl = await persistUploadedFile(req.file);
    return res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(err.status || 502).json({ success: false, message: 'Upload failed: ' + err.message });
  } finally {
    await cleanupTemporaryFile(req.file);
  }
});

// POST /api/upload/multiple (Multiple files, Protected)
router.post('/multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

  try {
    const urls = [];
    for (const file of req.files) {
      urls.push(await persistUploadedFile(file));
    }
    return res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      urls
    });
  } catch (err) {
    console.error('Multiple upload error:', err);
    return res.status(err.status || 502).json({ success: false, message: 'Upload failed: ' + err.message });
  } finally {
    await Promise.all(req.files.map(cleanupTemporaryFile));
  }
});

export default router;
