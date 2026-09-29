// server/routes/projects.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_vezta_admin_jwt_key_2026_x89a';

// Helper to format project database row
function formatProject(row) {
  if (!row) return null;
  let parsedImages = [];
  try {
    parsedImages = row.images ? JSON.parse(row.images) : [];
  } catch (e) {
    parsedImages = row.image ? [row.image] : [];
  }

  let parsedServices = [];
  try {
    parsedServices = row.services ? JSON.parse(row.services) : [];
  } catch (e) {
    parsedServices = [];
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category || 'General',
    type: row.type || '',
    year: row.year || new Date().getFullYear().toString(),
    image: row.image || '',
    images: parsedImages.length > 0 ? parsedImages : (row.image ? [row.image] : []),
    description: row.description || '',
    role: row.role || '',
    client: row.client || '',
    link: row.link || '',
    linkLabel: row.link_label || 'Lihat Project',
    services: parsedServices,
    highlight: row.highlight || '',
    deliverables: row.deliverables || '',
    displayOrder: row.display_order ?? 0,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/projects
// If query ?all=true and authenticated -> returns all projects
// Otherwise -> returns only visible projects
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
      rows = db.prepare('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC').all();
    } else {
      rows = db.prepare('SELECT * FROM projects WHERE is_visible = 1 ORDER BY display_order ASC, created_at DESC').all();
    }

    return res.json({ success: true, data: rows.map(formatProject) });
  } catch (err) {
    console.error('Fetch projects error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.json({ success: true, data: formatProject(row) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// POST /api/projects (Protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      id,
      title,
      category,
      type,
      year,
      image,
      images,
      description,
      role,
      client,
      link,
      linkLabel,
      services,
      highlight,
      deliverables,
      displayOrder,
      isVisible
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    // Generate clean unique ID if not provided
    let projectId = id ? id.trim() : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!projectId) projectId = 'project-' + Date.now();

    // Check duplicate ID
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
    if (existing) {
      projectId = `${projectId}-${Date.now().toString().slice(-4)}`;
    }

    // Default display order
    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM projects').get()?.maxOrder || 0;
      order = maxOrder + 1;
    }

    const galleryImages = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const servicesList = Array.isArray(services) ? services : (typeof services === 'string' ? services.split(',').map(s => s.trim()).filter(Boolean) : []);

    const stmt = db.prepare(`
      INSERT INTO projects (
        id, title, category, type, year, image, images,
        description, role, client, link, link_label,
        services, highlight, deliverables, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      projectId,
      title,
      category || 'Desain Grafis',
      type || 'Visual Identity',
      year || new Date().getFullYear().toString(),
      image || (galleryImages[0] || ''),
      JSON.stringify(galleryImages),
      description || '',
      role || 'Designer',
      client || '',
      link || '',
      linkLabel || 'Lihat Project Asli',
      JSON.stringify(servicesList),
      highlight || '',
      deliverables || '',
      Number(order),
      isVisible === false ? 0 : 1
    );

    logActivity('Project Created', `Added project "${title}"`);

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    return res.status(201).json({ success: true, message: 'Project created successfully', data: formatProject(created) });
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// PUT /api/projects/:id (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const projectId = req.params.id;
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const {
      title,
      category,
      type,
      year,
      image,
      images,
      description,
      role,
      client,
      link,
      linkLabel,
      services,
      highlight,
      deliverables,
      displayOrder,
      isVisible
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const galleryImages = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const servicesList = Array.isArray(services) ? services : (typeof services === 'string' ? services.split(',').map(s => s.trim()).filter(Boolean) : []);

    const stmt = db.prepare(`
      UPDATE projects SET
        title = ?,
        category = ?,
        type = ?,
        year = ?,
        image = ?,
        images = ?,
        description = ?,
        role = ?,
        client = ?,
        link = ?,
        link_label = ?,
        services = ?,
        highlight = ?,
        deliverables = ?,
        display_order = ?,
        is_visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title,
      category || existing.category,
      type ?? existing.type,
      year ?? existing.year,
      image || (galleryImages[0] || existing.image),
      JSON.stringify(galleryImages),
      description ?? existing.description,
      role ?? existing.role,
      client ?? existing.client,
      link ?? existing.link,
      linkLabel ?? existing.link_label,
      JSON.stringify(servicesList),
      highlight ?? existing.highlight,
      deliverables ?? existing.deliverables,
      displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
      projectId
    );

    logActivity('Project Updated', `Updated project "${title}"`);

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    return res.json({ success: true, message: 'Project updated successfully', data: formatProject(updated) });
  } catch (err) {
    console.error('Update project error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project' });
  }
});

// PATCH /api/projects/:id/visibility (Protected)
router.patch('/:id/visibility', authenticateToken, (req, res) => {
  try {
    const projectId = req.params.id;
    const project = db.prepare('SELECT id, title, is_visible FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const newVisibility = req.body.isVisible !== undefined ? (req.body.isVisible ? 1 : 0) : (project.is_visible ? 0 : 1);
    db.prepare('UPDATE projects SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newVisibility, projectId);

    const statusText = newVisibility ? 'Visible' : 'Hidden';
    logActivity('Project Visibility Changed', `Project "${project.title}" set to ${statusText}`);

    return res.json({
      success: true,
      message: `Project "${project.title}" is now ${statusText.toLowerCase()}.`,
      isVisible: Boolean(newVisibility)
    });
  } catch (err) {
    console.error('Visibility error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change visibility' });
  }
});

// PATCH /api/projects/order (Protected)
router.patch('/reorder/batch', authenticateToken, (req, res) => {
  try {
    const { items } = req.body; // array of { id, displayOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const stmt = db.prepare('UPDATE projects SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    for (const item of items) {
      if (item.id && item.displayOrder !== undefined) {
        stmt.run(Number(item.displayOrder), item.id);
      }
    }

    logActivity('Projects Reordered', `Updated display order for ${items.length} projects`);
    return res.json({ success: true, message: 'Projects order updated successfully.' });
  } catch (err) {
    console.error('Reorder error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reorder projects' });
  }
});

// DELETE /api/projects/:id (Protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const projectId = req.params.id;
    const project = db.prepare('SELECT id, title FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    logActivity('Project Deleted', `Deleted project "${project.title}"`);

    return res.json({ success: true, message: `Project "${project.title}" deleted successfully.` });
  } catch (err) {
    console.error('Delete project error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

export default router;
