// server/routes/certifications.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

function formatCertification(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    issuer: row.issuer || '',
    issueDate: row.issue_date || '',
    expiryDate: row.expiry_date || '',
    credentialId: row.credential_id || '',
    credentialUrl: row.credential_url || '',
    imageUrl: row.image_url || '',
    category: row.category || 'General',
    description: row.description || '',
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/certifications
router.get('/', (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    let isAdmin = false;

    if (showAll) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          jwt.verify(token, JWT_SECRET);
          isAdmin = true;
        } catch (_) {
          isAdmin = false;
        }
      }
    }

    let rows;
    if (showAll && isAdmin) {
      rows = db.prepare('SELECT * FROM certifications ORDER BY display_order ASC, id DESC').all();
    } else {
      rows = db.prepare('SELECT * FROM certifications WHERE is_visible = 1 ORDER BY display_order ASC, id DESC').all();
    }

    return res.json({ success: true, data: rows.map(formatCertification) });
  } catch (err) {
    console.error('Fetch certifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch certifications' });
  }
});

// GET /api/certifications/:id
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }
    return res.json({ success: true, data: formatCertification(row) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch certification' });
  }
});

// POST /api/certifications (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      imageUrl,
      category,
      description,
      displayOrder,
      isVisible
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Nama sertifikasi wajib diisi.' });
    }
    if (!issuer || !issuer.trim()) {
      return res.status(400).json({ success: false, message: 'Penerbit/Organisasi sertifikat wajib diisi.' });
    }

    const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM certifications').get()?.maxOrder || 0;
    const finalOrder = displayOrder !== undefined ? displayOrder : maxOrder + 1;

    const stmt = db.prepare(`
      INSERT INTO certifications (
        title, issuer, issue_date, expiry_date, credential_id,
        credential_url, image_url, category, description,
        display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      issuer.trim(),
      issueDate || '',
      expiryDate || '',
      credentialId || '',
      credentialUrl || '',
      imageUrl || '',
      category || 'General',
      description || '',
      finalOrder,
      isVisible !== false ? 1 : 0
    );

    const newId = result.lastInsertRowid;
    logActivity('Create Certification', `Created certification: ${title} from ${issuer}`);

    const newRow = db.prepare('SELECT * FROM certifications WHERE id = ?').get(newId);
    return res.status(201).json({ success: true, message: 'Sertifikasi berhasil ditambahkan', data: formatCertification(newRow) });
  } catch (err) {
    console.error('Create certification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create certification: ' + err.message });
  }
});

// PUT /api/certifications/:id (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const {
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      imageUrl,
      category,
      description,
      displayOrder,
      isVisible
    } = req.body;

    const existing = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    const stmt = db.prepare(`
      UPDATE certifications SET
        title = ?,
        issuer = ?,
        issue_date = ?,
        expiry_date = ?,
        credential_id = ?,
        credential_url = ?,
        image_url = ?,
        category = ?,
        description = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title || existing.title,
      issuer || existing.issuer,
      issueDate !== undefined ? issueDate : existing.issue_date,
      expiryDate !== undefined ? expiryDate : existing.expiry_date,
      credentialId !== undefined ? credentialId : existing.credential_id,
      credentialUrl !== undefined ? credentialUrl : existing.credential_url,
      imageUrl !== undefined ? imageUrl : existing.image_url,
      category !== undefined ? category : existing.category,
      description !== undefined ? description : existing.description,
      displayOrder !== undefined ? displayOrder : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      req.params.id
    );

    logActivity('Update Certification', `Updated certification: ${title || existing.title}`);
    const updated = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
    return res.json({ success: true, message: 'Sertifikasi berhasil diperbarui', data: formatCertification(updated) });
  } catch (err) {
    console.error('Update certification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update certification: ' + err.message });
  }
});

// PATCH /api/certifications/:id/visibility (Protected)
router.patch('/:id/visibility', authenticateToken, (req, res) => {
  try {
    const { isVisible } = req.body;
    const existing = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    db.prepare('UPDATE certifications SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(isVisible ? 1 : 0, req.params.id);

    return res.json({ success: true, message: 'Status visibilitas berhasil diubah' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to change visibility' });
  }
});

// POST /api/certifications/reorder/batch (Protected)
router.post('/reorder/batch', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    for (const item of items) {
      if (item.id && typeof item.displayOrder === 'number') {
        db.prepare('UPDATE certifications SET display_order = ? WHERE id = ?')
          .run(item.displayOrder, item.id);
      }
    }

    return res.json({ success: true, message: 'Urutan sertifikasi berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reorder certifications' });
  }
});

// DELETE /api/certifications/:id (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id);
    logActivity('Delete Certification', `Deleted certification: ${existing.title}`);

    return res.json({ success: true, message: 'Sertifikasi berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete certification' });
  }
});

export default router;
