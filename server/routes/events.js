// server/routes/events.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

function formatEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    organizer: row.organizer || '',
    date: row.date || '',
    period: row.period || '',
    location: row.location || '',
    role: row.role || '',
    description: row.description || '',
    imageUrl: row.image_url || '',
    linkUrl: row.link_url || '',
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/events
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
      rows = db.prepare('SELECT * FROM events ORDER BY display_order ASC, id DESC').all();
    } else {
      rows = db.prepare('SELECT * FROM events WHERE is_visible = 1 ORDER BY display_order ASC, id DESC').all();
    }

    return res.json({ success: true, data: rows.map(formatEvent) });
  } catch (err) {
    console.error('Fetch events error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.json({ success: true, data: formatEvent(row) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch event' });
  }
});

// POST /api/events (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      organizer,
      date,
      period,
      location,
      role,
      description,
      imageUrl,
      linkUrl,
      displayOrder,
      isVisible
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Nama event / kegiatan wajib diisi.' });
    }

    const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM events').get()?.maxOrder || 0;
    const finalOrder = displayOrder !== undefined ? displayOrder : maxOrder + 1;

    const stmt = db.prepare(`
      INSERT INTO events (
        title, organizer, date, period, location, role,
        description, image_url, link_url, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      organizer || '',
      date || '',
      period || '',
      location || '',
      role || 'Peserta',
      description || '',
      imageUrl || '',
      linkUrl || '',
      finalOrder,
      isVisible !== false ? 1 : 0
    );

    const newId = result.lastInsertRowid;
    logActivity('Create Event', `Created event: ${title}`);

    const newRow = db.prepare('SELECT * FROM events WHERE id = ?').get(newId);
    return res.status(201).json({ success: true, message: 'Event berhasil ditambahkan', data: formatEvent(newRow) });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create event: ' + err.message });
  }
});

// PUT /api/events/:id (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const {
      title,
      organizer,
      date,
      period,
      location,
      role,
      description,
      imageUrl,
      linkUrl,
      displayOrder,
      isVisible
    } = req.body;

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const stmt = db.prepare(`
      UPDATE events SET
        title = ?,
        organizer = ?,
        date = ?,
        period = ?,
        location = ?,
        role = ?,
        description = ?,
        image_url = ?,
        link_url = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title || existing.title,
      organizer !== undefined ? organizer : existing.organizer,
      date !== undefined ? date : existing.date,
      period !== undefined ? period : existing.period,
      location !== undefined ? location : existing.location,
      role !== undefined ? role : existing.role,
      description !== undefined ? description : existing.description,
      imageUrl !== undefined ? imageUrl : existing.image_url,
      linkUrl !== undefined ? linkUrl : existing.link_url,
      displayOrder !== undefined ? displayOrder : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      req.params.id
    );

    logActivity('Update Event', `Updated event: ${title || existing.title}`);
    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    return res.json({ success: true, message: 'Event berhasil diperbarui', data: formatEvent(updated) });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update event: ' + err.message });
  }
});

// PATCH /api/events/:id/visibility (Protected)
router.patch('/:id/visibility', authenticateToken, (req, res) => {
  try {
    const { isVisible } = req.body;
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    db.prepare('UPDATE events SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(isVisible ? 1 : 0, req.params.id);

    return res.json({ success: true, message: 'Status visibilitas berhasil diubah' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to change visibility' });
  }
});

// POST /api/events/reorder/batch (Protected)
router.post('/reorder/batch', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    for (const item of items) {
      if (item.id && typeof item.displayOrder === 'number') {
        db.prepare('UPDATE events SET display_order = ? WHERE id = ?')
          .run(item.displayOrder, item.id);
      }
    }

    return res.json({ success: true, message: 'Urutan event berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reorder events' });
  }
});

// DELETE /api/events/:id (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    logActivity('Delete Event', `Deleted event: ${existing.title}`);

    return res.json({ success: true, message: 'Event berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

export default router;
