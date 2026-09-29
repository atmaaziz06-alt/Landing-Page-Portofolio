// server/routes/experience.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

// Helper to format experience row
function formatExperience(row) {
  if (!row) return null;
  let parsedHighlights = [];
  try {
    parsedHighlights = row.highlights ? JSON.parse(row.highlights) : [];
  } catch (e) {
    parsedHighlights = [];
  }

  return {
    id: row.id,
    period: row.period || '',
    role: row.role || '',
    company: row.company || '',
    location: row.location || '',
    description: row.description || '',
    highlights: parsedHighlights,
    logoUrl: row.logo_url || '',
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/experience
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
        } catch (e) {
          isAdmin = false;
        }
      }
    }

    let rows;
    if (showAll && isAdmin) {
      rows = db.prepare('SELECT * FROM experiences ORDER BY display_order ASC, id ASC').all();
    } else {
      rows = db.prepare('SELECT * FROM experiences WHERE is_visible = 1 ORDER BY display_order ASC, id ASC').all();
    }

    return res.json({ success: true, data: rows.map(formatExperience) });
  } catch (err) {
    console.error('Fetch experience error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch experience' });
  }
});

// POST /api/experience (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      period,
      role,
      company,
      location,
      description,
      highlights,
      logoUrl,
      displayOrder,
      isVisible
    } = req.body;

    if (!role || !company) {
      return res.status(400).json({ success: false, message: 'Role and Company name are required.' });
    }

    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM experiences').get()?.maxOrder || 0;
      order = maxOrder + 1;
    }

    const highlightsList = Array.isArray(highlights)
      ? highlights
      : (typeof highlights === 'string' ? highlights.split('\n').map(h => h.trim()).filter(Boolean) : []);

    const stmt = db.prepare(`
      INSERT INTO experiences (
        period, role, company, location, description, highlights, logo_url, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      period || '',
      role,
      company,
      location || '',
      description || '',
      JSON.stringify(highlightsList),
      logoUrl || '',
      Number(order),
      isVisible === false ? 0 : 1
    );

    logActivity('Experience Added', `Added experience "${role} at ${company}"`);

    const created = db.prepare('SELECT * FROM experiences WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Experience added successfully', data: formatExperience(created) });
  } catch (err) {
    console.error('Create experience error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add experience' });
  }
});

// PUT /api/experience/:id (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const {
      period,
      role,
      company,
      location,
      description,
      highlights,
      logoUrl,
      displayOrder,
      isVisible
    } = req.body;

    if (!role || !company) {
      return res.status(400).json({ success: false, message: 'Role and Company name are required.' });
    }

    const highlightsList = Array.isArray(highlights)
      ? highlights
      : (typeof highlights === 'string' ? highlights.split('\n').map(h => h.trim()).filter(Boolean) : []);

    const stmt = db.prepare(`
      UPDATE experiences SET
        period = ?,
        role = ?,
        company = ?,
        location = ?,
        description = ?,
        highlights = ?,
        logo_url = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      period ?? existing.period,
      role,
      company,
      location ?? existing.location,
      description ?? existing.description,
      JSON.stringify(highlightsList),
      logoUrl ?? existing.logo_url,
      displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      id
    );

    logActivity('Experience Updated', `Updated "${role} at ${company}"`);

    const updated = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Experience updated successfully', data: formatExperience(updated) });
  } catch (err) {
    console.error('Update experience error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update experience' });
  }
});

// PATCH /api/experience/:id/visibility (Protected)
router.patch('/:id/visibility', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const exp = db.prepare('SELECT id, company, role, is_visible FROM experiences WHERE id = ?').get(id);
    if (!exp) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const newVisibility = req.body.isVisible !== undefined ? (req.body.isVisible ? 1 : 0) : (exp.is_visible ? 0 : 1);
    db.prepare('UPDATE experiences SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newVisibility, id);

    const statusText = newVisibility ? 'Visible' : 'Hidden';
    logActivity('Experience Visibility Changed', `Experience at "${exp.company}" set to ${statusText}`);

    return res.json({
      success: true,
      message: `Experience at "${exp.company}" is now ${statusText.toLowerCase()}.`,
      isVisible: Boolean(newVisibility)
    });
  } catch (err) {
    console.error('Visibility error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update visibility' });
  }
});

// PATCH /api/experience/reorder/batch (Protected)
router.patch('/reorder/batch', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const stmt = db.prepare('UPDATE experiences SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    for (const item of items) {
      if (item.id && item.displayOrder !== undefined) {
        stmt.run(Number(item.displayOrder), item.id);
      }
    }

    logActivity('Experience Reordered', `Updated display order for ${items.length} items`);
    return res.json({ success: true, message: 'Experience order updated successfully.' });
  } catch (err) {
    console.error('Reorder error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reorder experience' });
  }
});

// DELETE /api/experience/:id (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const exp = db.prepare('SELECT id, company, role FROM experiences WHERE id = ?').get(id);
    if (!exp) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    db.prepare('DELETE FROM experiences WHERE id = ?').run(id);
    logActivity('Experience Deleted', `Deleted "${exp.role} at ${exp.company}"`);

    return res.json({ success: true, message: `Experience at "${exp.company}" deleted successfully.` });
  } catch (err) {
    console.error('Delete experience error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete experience' });
  }
});

export default router;
