// server/routes/contact.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

function formatContact(row) {
  if (!row) return null;
  return {
    id: row.id,
    ctaTitle: row.cta_title,
    ctaDescription: row.cta_description,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    primaryBtnText: row.primary_btn_text,
    primaryBtnLink: row.primary_btn_link,
    secondaryBtnText: row.secondary_btn_text,
    secondaryBtnLink: row.secondary_btn_link,
    updatedAt: row.updated_at
  };
}

function formatSocial(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    username: row.username || '',
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/contact
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

    const contactRow = db.prepare('SELECT * FROM contact_settings WHERE id = 1').get();
    let socialsRows;
    if (showAll && isAdmin) {
      socialsRows = db.prepare('SELECT * FROM social_links ORDER BY display_order ASC, id ASC').all();
    } else {
      socialsRows = db.prepare('SELECT * FROM social_links WHERE is_visible = 1 ORDER BY display_order ASC, id ASC').all();
    }

    return res.json({
      success: true,
      data: {
        contact: formatContact(contactRow),
        socials: socialsRows.map(formatSocial)
      }
    });
  } catch (err) {
    console.error('Fetch contact error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch contact settings' });
  }
});

// PUT /api/contact (Protected)
router.put('/', authenticateToken, (req, res) => {
  try {
    const {
      ctaTitle,
      ctaDescription,
      email,
      phone,
      whatsapp,
      primaryBtnText,
      primaryBtnLink,
      secondaryBtnText,
      secondaryBtnLink
    } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const stmt = db.prepare(`
      UPDATE contact_settings SET
        cta_title = ?,
        cta_description = ?,
        email = ?,
        phone = ?,
        whatsapp = ?,
        primary_btn_text = ?,
        primary_btn_link = ?,
        secondary_btn_text = ?,
        secondary_btn_link = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    stmt.run(
      ctaTitle || "Have a project in mind? Let's create something iconic.",
      ctaDescription || '',
      email,
      phone || '',
      whatsapp || '',
      primaryBtnText || 'Start a conversation',
      primaryBtnLink || '#contact',
      secondaryBtnText || 'Email me directly',
      secondaryBtnLink || `mailto:${email}`
    );

    logActivity('Contact Updated', `Updated contact & CTA settings`);

    const updated = db.prepare('SELECT * FROM contact_settings WHERE id = 1').get();
    return res.json({ success: true, message: 'Contact settings updated successfully', data: formatContact(updated) });
  } catch (err) {
    console.error('Update contact error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update contact settings' });
  }
});

// POST /api/contact/socials (Protected)
router.post('/socials', authenticateToken, (req, res) => {
  try {
    const { name, url, username, displayOrder, isVisible } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Platform name and URL are required.' });
    }

    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM social_links').get()?.maxOrder || 0;
      order = maxOrder + 1;
    }

    const stmt = db.prepare(`
      INSERT INTO social_links (name, url, username, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, url, username || '', Number(order), isVisible === false ? 0 : 1);
    logActivity('Social Link Added', `Added social link "${name}"`);

    const created = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Social link added successfully', data: formatSocial(created) });
  } catch (err) {
    console.error('Add social error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add social link' });
  }
});

// PUT /api/contact/socials/:id (Protected)
router.put('/socials/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Social link not found' });
    }

    const { name, url, username, displayOrder, isVisible } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Platform name and URL are required.' });
    }

    const stmt = db.prepare(`
      UPDATE social_links SET
        name = ?,
        url = ?,
        username = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name,
      url,
      username ?? existing.username,
      displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      id
    );

    logActivity('Social Link Updated', `Updated social link "${name}"`);

    const updated = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Social link updated successfully', data: formatSocial(updated) });
  } catch (err) {
    console.error('Update social error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update social link' });
  }
});

// PATCH /api/contact/socials/:id/visibility (Protected)
router.patch('/socials/:id/visibility', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const soc = db.prepare('SELECT id, name, is_visible FROM social_links WHERE id = ?').get(id);
    if (!soc) {
      return res.status(404).json({ success: false, message: 'Social link not found' });
    }

    const newVisibility = req.body.isVisible !== undefined ? (req.body.isVisible ? 1 : 0) : (soc.is_visible ? 0 : 1);
    db.prepare('UPDATE social_links SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newVisibility, id);

    const statusText = newVisibility ? 'Visible' : 'Hidden';
    logActivity('Social Visibility Changed', `Social link "${soc.name}" set to ${statusText}`);

    return res.json({
      success: true,
      message: `Social link "${soc.name}" is now ${statusText.toLowerCase()}.`,
      isVisible: Boolean(newVisibility)
    });
  } catch (err) {
    console.error('Visibility error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update visibility' });
  }
});

// DELETE /api/contact/socials/:id (Protected)
router.delete('/socials/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const soc = db.prepare('SELECT id, name FROM social_links WHERE id = ?').get(id);
    if (!soc) {
      return res.status(404).json({ success: false, message: 'Social link not found' });
    }

    db.prepare('DELETE FROM social_links WHERE id = ?').run(id);
    logActivity('Social Link Deleted', `Deleted social link "${soc.name}"`);

    return res.json({ success: true, message: `Social link "${soc.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete social error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete social link' });
  }
});

export default router;
