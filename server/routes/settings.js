// server/routes/settings.js
import express from 'express';
import { db, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function formatSettings(row) {
  if (!row) return null;
  return {
    id: row.id,
    siteTitle: row.site_title,
    brandName: row.brand_name,
    siteDescription: row.site_description,
    footerBrand: row.footer_brand,
    footerCopyright: row.footer_copyright,
    footerNote: row.footer_note,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    ogImage: row.og_image,
    updatedAt: row.updated_at
  };
}

// GET /api/settings (Public)
router.get('/', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
    return res.json({ success: true, data: formatSettings(row) });
  } catch (err) {
    console.error('Fetch settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// PUT /api/settings (Protected)
router.put('/', authenticateToken, (req, res) => {
  try {
    const {
      siteTitle,
      brandName,
      siteDescription,
      footerBrand,
      footerCopyright,
      footerNote,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage
    } = req.body;

    const stmt = db.prepare(`
      UPDATE site_settings SET
        site_title = ?,
        brand_name = ?,
        site_description = ?,
        footer_brand = ?,
        footer_copyright = ?,
        footer_note = ?,
        seo_title = ?,
        seo_description = ?,
        seo_keywords = ?,
        og_image = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    stmt.run(
      siteTitle || 'Raditya Atma Aziz — Portfolio',
      brandName || 'Vezta Studio',
      siteDescription || '',
      footerBrand || 'Vezta Studio',
      footerCopyright || 'Vezta Studio. All rights reserved.',
      footerNote || 'Designed & built with intention.',
      seoTitle || 'Raditya Atma Aziz Portfolio',
      seoDescription || '',
      seoKeywords || '',
      ogImage || '/assets/images/user-portrait.png'
    );

    logActivity('Site Settings Updated', 'Updated site and SEO settings');

    const updated = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
    return res.json({ success: true, message: 'Site settings updated successfully', data: formatSettings(updated) });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
