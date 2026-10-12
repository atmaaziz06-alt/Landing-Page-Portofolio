// server/routes/upload.js
import express from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
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
const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;
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
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();
  const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'pdf', 'mp4', 'webm']);
  const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/webm'
  ]);

  if (allowedExtensions.has(ext) || allowedMimeTypes.has(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, SVG, GIF), MP4/WebM videos, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_SIZE }
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

// POST /api/upload/sign (Create a short-lived direct video upload URL)
router.post('/sign', authenticateToken, async (req, res) => {
  if (!useSupabaseStorage) {
    return res.status(501).json({
      success: false,
      code: 'DIRECT_UPLOAD_UNAVAILABLE',
      message: 'Direct uploads are only available when Supabase Storage is enabled.'
    });
  }

  const { name, type, size } = req.body || {};
  const extension = path.extname(typeof name === 'string' ? name : '').toLowerCase();
  const allowedVideoTypes = new Map([
    ['.mp4', 'video/mp4'],
    ['.webm', 'video/webm']
  ]);

  if (!allowedVideoTypes.has(extension) || allowedVideoTypes.get(extension) !== type) {
    return res.status(400).json({ success: false, message: 'Only MP4 or WebM videos are allowed.' });
  }
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_UPLOAD_SIZE) {
    return res.status(400).json({ success: false, message: 'Video size must be between 1 byte and 100 MB.' });
  }
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(503).json({
      success: false,
      message: 'Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
  }

  const baseName = path.basename(name, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'video';
  const filename = `${baseName}-${randomUUID()}${extension}`;
  const encodedFilename = encodeURIComponent(filename);

  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/upload/sign/${storageBucket}/${encodedFilename}`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseServiceRoleKey,
          Authorization: 'Bear' + 'er ' + supabaseServiceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ upsert: false }),
        signal: AbortSignal.timeout(20000)
      }
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.token) {
      const message = payload?.message || payload?.error || `Supabase signed upload URL request failed (${response.status}).`;
      console.error('[Uploads] Could not create signed upload URL:', message);
      return res.status(response.status >= 500 ? 502 : response.status || 502).json({
        success: false,
        message
      });
    }

    const uploadUrl = `${supabaseUrl}/storage/v1/object/upload/sign/${storageBucket}/${encodedFilename}?token=${encodeURIComponent(payload.token)}`;
    const url = `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${encodedFilename}`;
    return res.json({ success: true, uploadUrl, url, filename, size });
  } catch (err) {
    console.error('[Uploads] Could not create signed upload URL:', err);
    return res.status(502).json({ success: false, message: 'Could not prepare direct upload: ' + err.message });
  }
});

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
