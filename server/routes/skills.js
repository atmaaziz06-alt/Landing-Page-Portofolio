// server/routes/skills.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

function formatSkill(row) {
  if (!row) return null;
  let parsedDeliverables = [];
  try {
    parsedDeliverables = row.deliverables ? JSON.parse(row.deliverables) : [];
  } catch (e) {
    parsedDeliverables = [];
  }

  return {
    id: row.id,
    number: row.number || '',
    title: row.title,
    description: row.description || '',
    deliverables: parsedDeliverables,
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/skills
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
      rows = db.prepare('SELECT * FROM skills ORDER BY display_order ASC, id ASC').all();
    } else {
      rows = db.prepare('SELECT * FROM skills WHERE is_visible = 1 ORDER BY display_order ASC, id ASC').all();
    }

    return res.json({ success: true, data: rows.map(formatSkill) });
  } catch (err) {
    console.error('Fetch skills error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch skills' });
  }
});

// POST /api/skills (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { number, title, description, deliverables, displayOrder, isVisible } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Skill/Service title is required.' });
    }

    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM skills').get()?.maxOrder || 0;
      order = maxOrder + 1;
    }

    const deliverablesList = Array.isArray(deliverables)
      ? deliverables
      : (typeof deliverables === 'string' ? deliverables.split('\n').map(d => d.trim()).filter(Boolean) : []);

    const numStr = number || (order < 10 ? `0${order}` : `${order}`);

    const stmt = db.prepare(`
      INSERT INTO skills (number, title, description, deliverables, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      numStr,
      title,
      description || '',
      JSON.stringify(deliverablesList),
      Number(order),
      isVisible === false ? 0 : 1
    );

    logActivity('Skill Added', `Added skill/service "${title}"`);

    const created = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Skill added successfully', data: formatSkill(created) });
  } catch (err) {
    console.error('Add skill error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add skill' });
  }
});

// PUT /api/skills/:id (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const { number, title, description, deliverables, displayOrder, isVisible } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Skill/Service title is required.' });
    }

    const deliverablesList = Array.isArray(deliverables)
      ? deliverables
      : (typeof deliverables === 'string' ? deliverables.split('\n').map(d => d.trim()).filter(Boolean) : []);

    const stmt = db.prepare(`
      UPDATE skills SET
        number = ?,
        title = ?,
        description = ?,
        deliverables = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      number ?? existing.number,
      title,
      description ?? existing.description,
      JSON.stringify(deliverablesList),
      displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      id
    );

    logActivity('Skill Updated', `Updated skill/service "${title}"`);

    const updated = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Skill updated successfully', data: formatSkill(updated) });
  } catch (err) {
    console.error('Update skill error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update skill' });
  }
});

// PATCH /api/skills/:id/visibility (Protected)
router.patch('/:id/visibility', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const skill = db.prepare('SELECT id, title, is_visible FROM skills WHERE id = ?').get(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const newVisibility = req.body.isVisible !== undefined ? (req.body.isVisible ? 1 : 0) : (skill.is_visible ? 0 : 1);
    db.prepare('UPDATE skills SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newVisibility, id);

    const statusText = newVisibility ? 'Visible' : 'Hidden';
    logActivity('Skill Visibility Changed', `Skill "${skill.title}" set to ${statusText}`);

    return res.json({
      success: true,
      message: `Skill "${skill.title}" is now ${statusText.toLowerCase()}.`,
      isVisible: Boolean(newVisibility)
    });
  } catch (err) {
    console.error('Visibility error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update visibility' });
  }
});

// PATCH /api/skills/reorder/batch (Protected)
router.patch('/reorder/batch', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const stmt = db.prepare('UPDATE skills SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    for (const item of items) {
      if (item.id && item.displayOrder !== undefined) {
        stmt.run(Number(item.displayOrder), item.id);
      }
    }

    logActivity('Skills Reordered', `Updated display order for ${items.length} skills`);
    return res.json({ success: true, message: 'Skills order updated successfully.' });
  } catch (err) {
    console.error('Reorder skills error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reorder skills' });
  }
});

// DELETE /api/skills/:id (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const skill = db.prepare('SELECT id, title FROM skills WHERE id = ?').get(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    db.prepare('DELETE FROM skills WHERE id = ?').run(id);
    logActivity('Skill Deleted', `Deleted skill "${skill.title}"`);

    return res.json({ success: true, message: `Skill "${skill.title}" deleted successfully.` });
  } catch (err) {
    console.error('Delete skill error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete skill' });
  }
});

export default router;
