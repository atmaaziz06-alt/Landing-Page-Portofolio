import express from 'express';
import { db, isSupabase, logActivity } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const HISTORY_LIMIT = 40;
const SNAPSHOT_KEYS = [
  'profile',
  'projects',
  'experience',
  'skills',
  'tools',
  'events',
  'certifications',
  'contact',
  'socials',
  'settings'
];

function parseSnapshot(value) {
  const snapshot = JSON.parse(value);
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Stored content history snapshot is invalid.');
  }
  return snapshot;
}

function sectionData(snapshot, key) {
  if (!key) return null;
  if (key === 'contact') {
    return { contact: snapshot.contact || null, socials: snapshot.socials || [] };
  }
  return snapshot[key] ?? null;
}

function toHistoryEntry(row) {
  const snapshot = parseSnapshot(row.snapshot_json);
  const previousSnapshot = row.previous_snapshot_json
    ? parseSnapshot(row.previous_snapshot_json)
    : null;
  return {
    id: String(row.id),
    timestamp: row.timestamp,
    section: row.section,
    sectionKey: row.section_key || '',
    action: row.action,
    details: row.details || '',
    snapshot,
    previousSnapshot,
    sectionData: sectionData(snapshot, row.section_key),
    previousSectionData: previousSnapshot
      ? sectionData(previousSnapshot, row.section_key)
      : null
  };
}

function requireSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return 'A content snapshot is required.';
  }
  for (const key of SNAPSHOT_KEYS) {
    if (!(key in snapshot)) return `The content snapshot is missing "${key}".`;
  }
  if (!snapshot.profile || typeof snapshot.profile !== 'object' || Array.isArray(snapshot.profile)) {
    return 'The content snapshot profile is invalid.';
  }
  for (const key of ['projects', 'experience', 'skills', 'tools', 'events', 'certifications', 'socials']) {
    if (!Array.isArray(snapshot[key])) return `The content snapshot "${key}" value must be an array.`;
  }
  if (!snapshot.contact || typeof snapshot.contact !== 'object' || Array.isArray(snapshot.contact)) {
    return 'The content snapshot contact is invalid.';
  }
  if (!snapshot.settings || typeof snapshot.settings !== 'object' || Array.isArray(snapshot.settings)) {
    return 'The content snapshot settings are invalid.';
  }
  return null;
}

function jsonList(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return typeof value === 'string' ? value : '[]';
}

function dbVisibility(item) {
  return item.isVisible === false ? 0 : 1;
}

async function replaceRows(table, columns, rows, valuesForRow) {
  await db.prepare(`DELETE FROM ${table}`).run();
  if (!rows.length) return;
  const placeholders = columns.map(() => '?').join(', ');
  const insert = db.prepare(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
  );
  for (const row of rows) {
    await insert.run(...valuesForRow(row));
  }
}

async function restoreSnapshot(snapshot) {
  const profile = snapshot.profile;
  const availability = profile.availability || {};
  await db.prepare(`
    UPDATE profiles SET
      name = ?, brand_name = ?, monogram = ?, eyebrow = ?, role = ?, location = ?,
      headline_prefix = ?, description = ?, bio = ?, avatar_url = ?, about_image_url = ?,
      availability_badge = ?, availability_status_text = ?, availability_period = ?,
      resume_url = ?, resume_label = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    profile.name || '',
    profile.brandName || '',
    profile.monogram || '',
    profile.eyebrow || '',
    profile.role || '',
    profile.location || '',
    profile.headlinePrefix || '',
    profile.description || '',
    profile.bio || '',
    profile.avatarUrl || '',
    profile.aboutImageUrl || '',
    availability.badge || '',
    availability.statusText || '',
    availability.period || '',
    availability.resumeUrl || '',
    availability.resumeLabel || ''
  );

  await replaceRows('projects', [
    'id', 'title', 'category', 'type', 'year', 'image', 'images', 'description',
    'role', 'client', 'link', 'link_label', 'services', 'highlight', 'deliverables',
    'display_order', 'is_visible'
  ], snapshot.projects, (item) => [
    item.id, item.title || '', item.category || '', item.type || '', item.year || '',
    item.image || '', jsonList(item.images), item.description || '', item.role || '',
    item.client || '', item.link || '', item.linkLabel || '', jsonList(item.services),
    item.highlight || '', jsonList(item.deliverables), item.displayOrder ?? 0, dbVisibility(item)
  ]);

  await replaceRows('experiences', [
    'id', 'period', 'role', 'company', 'location', 'description', 'highlights',
    'logo_url', 'display_order', 'is_visible'
  ], snapshot.experience, (item) => [
    item.id, item.period || '', item.role || '', item.company || '', item.location || '',
    item.description || '', jsonList(item.highlights), item.logoUrl || '',
    item.displayOrder ?? 0, dbVisibility(item)
  ]);

  await replaceRows('tools', [
    'id', 'name', 'role', 'category', 'icon_key', 'custom_icon_url', 'display_order', 'is_visible'
  ], snapshot.tools, (item) => [
    item.id, item.name || '', item.role || '', item.category || '', item.iconKey || '',
    item.customIconUrl || '', item.displayOrder ?? 0, dbVisibility(item)
  ]);

  await replaceRows('skills', [
    'id', 'number', 'title', 'description', 'deliverables', 'display_order', 'is_visible'
  ], snapshot.skills, (item) => [
    item.id, item.number || '', item.title || '', item.description || '',
    jsonList(item.deliverables), item.displayOrder ?? 0, dbVisibility(item)
  ]);

  await replaceRows('events', [
    'id', 'title', 'organizer', 'date', 'period', 'location', 'role', 'description',
    'image_url', 'link_url', 'display_order', 'is_visible'
  ], snapshot.events, (item) => [
    item.id, item.title || '', item.organizer || '', item.date || '', item.period || '',
    item.location || '', item.role || '', item.description || '', item.imageUrl || '',
    item.linkUrl || '', item.displayOrder ?? 0, dbVisibility(item)
  ]);

  await replaceRows('certifications', [
    'id', 'title', 'issuer', 'issue_date', 'expiry_date', 'credential_id',
    'credential_url', 'image_url', 'category', 'description', 'display_order', 'is_visible'
  ], snapshot.certifications, (item) => [
    item.id, item.title || '', item.issuer || '', item.issueDate || '', item.expiryDate || '',
    item.credentialId || '', item.credentialUrl || '', item.imageUrl || '',
    item.category || '', item.description || '', item.displayOrder ?? 0, dbVisibility(item)
  ]);

  await replaceRows('social_links', [
    'id', 'name', 'url', 'username', 'display_order', 'is_visible'
  ], snapshot.socials, (item) => [
    item.id, item.name || '', item.url || '', item.username || '',
    item.displayOrder ?? 0, dbVisibility(item)
  ]);

  const contact = snapshot.contact;
  await db.prepare(`
    UPDATE contact_settings SET
      cta_title = ?, cta_description = ?, email = ?, phone = ?, whatsapp = ?,
      primary_btn_text = ?, primary_btn_link = ?, secondary_btn_text = ?,
      secondary_btn_link = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    contact.ctaTitle || '',
    contact.ctaDescription || '',
    contact.email || '',
    contact.phone || '',
    contact.whatsapp || '',
    contact.primaryBtnText || '',
    contact.primaryBtnLink || '',
    contact.secondaryBtnText || '',
    contact.secondaryBtnLink || ''
  );

  const settings = snapshot.settings;
  await db.prepare(`
    UPDATE site_settings SET
      site_title = ?, brand_name = ?, site_description = ?, footer_brand = ?,
      footer_copyright = ?, footer_note = ?, seo_title = ?, seo_description = ?,
      seo_keywords = ?, og_image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    settings.siteTitle || '',
    settings.brandName || '',
    settings.siteDescription || '',
    settings.footerBrand || '',
    settings.footerCopyright || '',
    settings.footerNote || '',
    settings.seoTitle || '',
    settings.seoDescription || '',
    settings.seoKeywords || '',
    settings.ogImage || ''
  );
}

async function insertHistoryEntry({ section, sectionKey, action, details, snapshot }) {
  if (isSupabase) {
    const row = await db.saveContentSnapshot({ section, sectionKey, action, details, snapshot });
    return toHistoryEntry(row);
  }

  const previousRow = (await db.prepare('SELECT * FROM content_history ORDER BY id DESC').all())[0];
  const previousSnapshot = previousRow ? parseSnapshot(previousRow.snapshot_json) : null;
  const timestamp = new Date().toISOString();
  const stampedSnapshot = { ...snapshot, updatedAt: timestamp };
  const result = await db.prepare(`
    INSERT INTO content_history (
      timestamp, section, section_key, action, details, snapshot_json, previous_snapshot_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    timestamp,
    section || 'Konten',
    sectionKey || '',
    action || 'Update',
    details || '',
    JSON.stringify(stampedSnapshot),
    previousSnapshot ? JSON.stringify(previousSnapshot) : null
  );

  const rows = await db.prepare('SELECT * FROM content_history ORDER BY id DESC').all();
  for (const oldRow of rows.slice(HISTORY_LIMIT)) {
    await db.prepare('DELETE FROM content_history WHERE id = ?').run(oldRow.id);
  }

  return toHistoryEntry({
    id: result.lastInsertRowid,
    timestamp,
    section: section || 'Konten',
    section_key: sectionKey || '',
    action: action || 'Update',
    details: details || '',
    snapshot_json: JSON.stringify(stampedSnapshot),
    previous_snapshot_json: previousSnapshot ? JSON.stringify(previousSnapshot) : null
  });
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const entries = (await db.prepare('SELECT * FROM content_history ORDER BY id DESC')
      .all()
    ).slice(0, HISTORY_LIMIT)
      .map(toHistoryEntry);
    res.set('Cache-Control', 'no-store');
    return res.json({ success: true, data: entries });
  } catch (err) {
    console.error('Fetch content history error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat histori konten.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const validationError = requireSnapshot(req.body?.snapshot);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const entry = await insertHistoryEntry({
      section: req.body.section,
      sectionKey: req.body.sectionKey,
      action: req.body.action,
      details: req.body.details,
      snapshot: req.body.snapshot
    });
    await logActivity('Content Snapshot Saved', `${entry.section}: ${entry.action}`);
    return res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('Save content history error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan versi konten ke database.' });
  }
});

router.post('/:id/restore', authenticateToken, async (req, res) => {
  try {
    const selected = await db.prepare('SELECT * FROM content_history WHERE id = ?').get(req.params.id);
    if (!selected) {
      return res.status(404).json({ success: false, message: 'Versi histori tidak ditemukan.' });
    }
    const snapshot = parseSnapshot(selected.snapshot_json);
    const validationError = requireSnapshot(snapshot);
    if (validationError) {
      return res.status(422).json({ success: false, message: 'Versi ini tidak lengkap dan tidak dapat dipulihkan.' });
    }

    if (isSupabase) {
      const restored = await db.restoreContentSnapshot(selected.id);
      if (!restored) {
        return res.status(404).json({ success: false, message: 'Versi histori tidak ditemukan.' });
      }
      const entry = toHistoryEntry(restored);
      await logActivity('Content Restored', `Restored content history version ${selected.id}`);
      return res.json({ success: true, data: entry });
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      await restoreSnapshot(snapshot);
      const entry = await insertHistoryEntry({
        section: selected.section,
        sectionKey: selected.section_key,
        action: 'Pulihkan',
        details: `Dipulihkan ke versi ${selected.id}: ${selected.details || selected.section}`,
        snapshot
      });
      db.exec('COMMIT');
      await logActivity('Content Restored', `Restored content history version ${selected.id}`);
      return res.json({ success: true, data: entry });
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Restore content history error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memulihkan versi konten.' });
  }
});

router.delete('/oldest', authenticateToken, async (req, res) => {
  try {
    const requested = Number(req.query.count) || 10;
    const count = Math.min(Math.max(Math.floor(requested), 1), HISTORY_LIMIT);
    const rows = await db.prepare('SELECT * FROM content_history ORDER BY id DESC').all();
    const oldestRows = rows.slice(Math.max(rows.length - count, 0));
    for (const row of oldestRows) {
      await db.prepare('DELETE FROM content_history WHERE id = ?').run(row.id);
    }
    return res.json({ success: true, data: { deleted: oldestRows.length } });
  } catch (err) {
    console.error('Delete oldest content history error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus histori lama.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM content_history WHERE id = ?').run(req.params.id);
    if (!result.changes) {
      return res.status(404).json({ success: false, message: 'Versi histori tidak ditemukan.' });
    }
    return res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    console.error('Delete content history error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus histori konten.' });
  }
});

export default router;
