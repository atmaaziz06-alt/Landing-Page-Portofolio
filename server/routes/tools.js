// server/routes/tools.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

function formatTool(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role || '',
    category: row.category || 'Desain',
    iconKey: row.icon_key || '',
    customIconUrl: row.custom_icon_url || '',
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/tools
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
      rows = db.prepare('SELECT * FROM tools ORDER BY display_order ASC, id ASC').all();
    } else {
      rows = db.prepare('SELECT * FROM tools WHERE is_visible = 1 ORDER BY display_order ASC, id ASC').all();
    }

    return res.json({ success: true, data: rows.map(formatTool) });
  } catch (err) {
    console.error('Fetch tools error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tools' });
  }
});

// POST /api/tools (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, role, category, iconKey, customIconUrl, displayOrder, isVisible } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tool name is required.' });
    }

    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM tools').get()?.maxOrder || 0;
      order = maxOrder + 1;
    }

    const stmt = db.prepare(`
      INSERT INTO tools (name, role, category, icon_key, custom_icon_url, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      role || '',
      category || 'Desain',
      iconKey || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      customIconUrl || '',
      Number(order),
      isVisible === false ? 0 : 1
    );

    logActivity('Tool Added', `Added tool "${name}" (${category || 'Desain'})`);

    const created = db.prepare('SELECT * FROM tools WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Tool added successfully', data: formatTool(created) });
  } catch (err) {
    console.error('Add tool error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add tool' });
  }
});

// PUT /api/tools/:id (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM tools WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    const { name, role, category, iconKey, customIconUrl, displayOrder, isVisible } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tool name is required.' });
    }

    const stmt = db.prepare(`
      UPDATE tools SET
        name = ?,
        role = ?,
        category = ?,
        icon_key = ?,
        custom_icon_url = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name,
      role ?? existing.role,
      category ?? existing.category,
      iconKey ?? existing.icon_key,
      customIconUrl ?? existing.custom_icon_url,
      displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      id
    );

    logActivity('Tool Updated', `Updated tool "${name}"`);

    const updated = db.prepare('SELECT * FROM tools WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Tool updated successfully', data: formatTool(updated) });
  } catch (err) {
    console.error('Update tool error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update tool' });
  }
});

// PATCH /api/tools/:id/visibility (Protected)
router.patch('/:id/visibility', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const tool = db.prepare('SELECT id, name, is_visible FROM tools WHERE id = ?').get(id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    const newVisibility = req.body.isVisible !== undefined ? (req.body.isVisible ? 1 : 0) : (tool.is_visible ? 0 : 1);
    db.prepare('UPDATE tools SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newVisibility, id);

    const statusText = newVisibility ? 'Visible' : 'Hidden';
    logActivity('Tool Visibility Changed', `Tool "${tool.name}" set to ${statusText}`);

    return res.json({
      success: true,
      message: `Tool "${tool.name}" is now ${statusText.toLowerCase()}.`,
      isVisible: Boolean(newVisibility)
    });
  } catch (err) {
    console.error('Visibility error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update visibility' });
  }
});

// PATCH /api/tools/reorder/batch (Protected)
router.patch('/reorder/batch', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const stmt = db.prepare('UPDATE tools SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    for (const item of items) {
      if (item.id && item.displayOrder !== undefined) {
        stmt.run(Number(item.displayOrder), item.id);
      }
    }

    logActivity('Tools Reordered', `Updated display order for ${items.length} tools`);
    return res.json({ success: true, message: 'Tools order updated successfully.' });
  } catch (err) {
    console.error('Reorder tools error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reorder tools' });
  }
});

// DELETE /api/tools/:id (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const tool = db.prepare('SELECT id, name FROM tools WHERE id = ?').get(id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    db.prepare('DELETE FROM tools WHERE id = ?').run(id);
    logActivity('Tool Deleted', `Deleted tool "${tool.name}"`);

    return res.json({ success: true, message: `Tool "${tool.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete tool error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete tool' });
  }
});

export default router;
