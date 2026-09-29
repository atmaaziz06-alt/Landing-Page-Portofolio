// server/routes/profile.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to format profile database row to camelCase
function formatProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    brandName: row.brand_name,
    monogram: row.monogram,
    eyebrow: row.eyebrow,
    role: row.role,
    location: row.location,
    headlinePrefix: row.headline_prefix,
    description: row.description,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    aboutImageUrl: row.about_image_url,
    availability: {
      badge: row.availability_badge,
      statusText: row.availability_status_text,
      period: row.availability_period,
      resumeUrl: row.resume_url,
      resumeLabel: row.resume_label,
    },
    updatedAt: row.updated_at
  };
}

// GET /api/profile (Public)
router.get('/', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM profiles WHERE id = 1').get();
    return res.json({ success: true, data: formatProfile(row) });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PUT /api/profile (Protected)
router.put('/', authenticateToken, (req, res) => {
  try {
    const {
      name,
      brandName,
      monogram,
      eyebrow,
      role,
      location,
      headlinePrefix,
      description,
      bio,
      avatarUrl,
      aboutImageUrl,
      availability
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({ success: false, message: 'Name and professional title/role are required.' });
    }

    const badge = availability?.badge || 'Available for work';
    const statusText = availability?.statusText || 'I am currently accepting new projects for';
    const period = availability?.period || 'October 2026.';
    const resumeUrl = availability?.resumeUrl || '';
    const resumeLabel = availability?.resumeLabel || 'Download Resume';

    const stmt = db.prepare(`
      UPDATE profiles SET
        name = ?,
        brand_name = ?,
        monogram = ?,
        eyebrow = ?,
        role = ?,
        location = ?,
        headline_prefix = ?,
        description = ?,
        bio = ?,
        avatar_url = ?,
        about_image_url = ?,
        availability_badge = ?,
        availability_status_text = ?,
        availability_period = ?,
        resume_url = ?,
        resume_label = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    stmt.run(
      name,
      brandName || 'Vezta Studio',
      monogram || brandName || 'Vezta Studio',
      eyebrow || 'AVAILABLE FOR SELECT PROJECTS',
      role,
      location || 'Semarang, Indonesia',
      headlinePrefix || "Hi, I'm",
      description || '',
      bio || '',
      avatarUrl || '/assets/images/user-portrait.png',
      aboutImageUrl || '/assets/images/about-user.jpg',
      badge,
      statusText,
      period,
      resumeUrl,
      resumeLabel
    );

    logActivity('Profile Updated', `Updated profile information for ${name}`);

    const updated = db.prepare('SELECT * FROM profiles WHERE id = 1').get();
    return res.json({ success: true, message: 'Profile updated successfully', data: formatProfile(updated) });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
