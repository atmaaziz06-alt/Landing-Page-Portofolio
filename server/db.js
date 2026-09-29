// server/db.js
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  initialProfile,
  initialProjects,
  initialExperience,
  initialTools,
  initialSkills,
  initialSocials,
  initialContact,
  initialSettings
} from './seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Try loading native node:sqlite dynamically
let DatabaseSync = null;
try {
  const sqlite = await import('node:sqlite');
  DatabaseSync = sqlite.DatabaseSync;
} catch (err) {
  // Expected on serverless runtimes (like Vercel) where node:sqlite is not bundled
  DatabaseSync = null;
}

// 2. Initialize native SQLite if available
let nativeDb = null;
if (DatabaseSync) {
  try {
    let dbPath = path.resolve(__dirname, 'portfolio.db');
    if (process.env.VERCEL) {
      const tmpDir = os.platform() === 'win32' ? os.tmpdir() : '/tmp';
      const tmpDbPath = path.resolve(tmpDir, 'portfolio.db');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpDbPath);
      }
      dbPath = tmpDbPath;
    }
    nativeDb = new DatabaseSync(dbPath);
    try {
      nativeDb.exec('PRAGMA journal_mode = WAL;');
    } catch (_) {}
    nativeDb.exec('PRAGMA foreign_keys = ON;');
  } catch (err) {
    console.warn('[DB] Native SQLite initialization error, switching to Memory Store:', err.message);
    nativeDb = null;
  }
}

// 3. Resilient In-Memory Database Engine for Vercel Serverless
function createMemoryDB() {
  const adminEmail = process.env.ADMIN_EMAIL || 'atmaaziz06@gmail.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'atmaaziz06';
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Albassam';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  const state = {
    users: [
      {
        id: 1,
        username: adminUsername,
        email: adminEmail,
        password_hash: passwordHash,
        name: 'Raditya Atma Aziz',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    profiles: [
      {
        id: 1,
        name: initialProfile.name,
        brand_name: initialProfile.brandName,
        monogram: initialProfile.monogram,
        eyebrow: initialProfile.eyebrow,
        role: initialProfile.role,
        location: initialProfile.location,
        headline_prefix: initialProfile.headlinePrefix,
        description: initialProfile.description,
        bio: initialProfile.bio,
        avatar_url: initialProfile.avatarUrl,
        about_image_url: initialProfile.aboutImageUrl,
        availability_badge: initialProfile.availabilityBadge,
        availability_status_text: initialProfile.availabilityStatusText,
        availability_period: initialProfile.availabilityPeriod,
        resume_url: initialProfile.resumeUrl,
        resume_label: initialProfile.resumeLabel,
        updated_at: new Date().toISOString()
      }
    ],
    projects: initialProjects.map((p, idx) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      type: p.type,
      year: p.year,
      image: p.image,
      images: JSON.stringify(p.images || []),
      description: p.description,
      role: p.role,
      client: p.client,
      link: p.link,
      link_label: p.linkLabel,
      services: JSON.stringify(p.services || []),
      highlight: p.highlight,
      deliverables: JSON.stringify(p.deliverables || []),
      display_order: p.displayOrder ?? idx,
      is_visible: p.isVisible !== false ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    experiences: initialExperience.map((e, idx) => ({
      id: idx + 1,
      period: e.period,
      role: e.role,
      company: e.company,
      location: e.location,
      description: e.description,
      highlights: JSON.stringify(e.highlights || []),
      logo_url: e.logoUrl,
      display_order: e.displayOrder ?? idx,
      is_visible: e.isVisible !== false ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    tools: initialTools.map((t, idx) => ({
      id: idx + 1,
      name: t.name,
      role: t.role,
      category: t.category,
      icon_key: t.iconKey,
      custom_icon_url: t.customIconUrl,
      display_order: t.displayOrder ?? idx,
      is_visible: t.isVisible !== false ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    skills: initialSkills.map((s, idx) => ({
      id: idx + 1,
      number: s.number,
      title: s.title,
      description: s.description,
      deliverables: JSON.stringify(s.deliverables || []),
      display_order: s.displayOrder ?? idx,
      is_visible: s.isVisible !== false ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    social_links: initialSocials.map((s, idx) => ({
      id: idx + 1,
      name: s.name,
      url: s.url,
      username: s.username,
      display_order: s.displayOrder ?? idx,
      is_visible: s.isVisible !== false ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    contact_settings: [
      {
        id: 1,
        cta_title: initialContact.ctaTitle,
        cta_description: initialContact.ctaDescription,
        email: initialContact.email,
        phone: initialContact.phone,
        whatsapp: initialContact.whatsapp,
        primary_btn_text: initialContact.primaryBtnText,
        primary_btn_link: initialContact.primaryBtnLink,
        secondary_btn_text: initialContact.secondaryBtnText,
        secondary_btn_link: initialContact.secondaryBtnLink,
        updated_at: new Date().toISOString()
      }
    ],
    site_settings: [
      {
        id: 1,
        site_title: initialSettings.siteTitle,
        brand_name: initialSettings.brandName,
        site_description: initialSettings.siteDescription,
        footer_brand: initialSettings.footerBrand,
        footer_copyright: initialSettings.footerCopyright,
        footer_note: initialSettings.footerNote,
        seo_title: initialSettings.seoTitle,
        seo_description: initialSettings.seoDescription,
        seo_keywords: initialSettings.seoKeywords,
        og_image: initialSettings.ogImage,
        updated_at: new Date().toISOString()
      }
    ],
    activity_logs: []
  };

  function getTable(name) {
    const key = name.toLowerCase();
    if (!state[key]) {
      state[key] = [];
    }
    return state[key];
  }

  function handleSelect(sql, params, mode) {
    const fromMatch = sql.match(/FROM\s+([a-zA-Z_]+)/i);
    if (!fromMatch) return mode === 'all' ? [] : undefined;
    const tableName = fromMatch[1].toLowerCase();
    const table = getTable(tableName);

    // 1. COUNT
    if (sql.includes('COUNT(*)')) {
      let filtered = table;
      if (sql.includes('is_visible = 1')) {
        filtered = filtered.filter(item => item.is_visible == 1);
      }
      return { count: filtered.length };
    }

    // 2. MAX
    if (sql.includes('MAX(')) {
      const fieldMatch = sql.match(/MAX\(([a-zA-Z_]+)\)/i);
      const field = fieldMatch ? fieldMatch[1] : 'display_order';
      const maxVal = table.reduce((max, item) => Math.max(max, Number(item[field]) || 0), 0);
      return { maxOrder: maxVal };
    }

    // 3. User lookup
    if (tableName === 'users') {
      if (sql.includes('LOWER(email)')) {
        const id = String(params[0] || '').toLowerCase();
        return table.find(u => 
          u.email.toLowerCase() === id || 
          u.username.toLowerCase() === id || 
          (id === 'admin' && u.role === 'admin')
        );
      }
      if (sql.includes('WHERE id = ?')) {
        const targetId = params[0];
        const user = table.find(u => String(u.id) === String(targetId));
        if (user && sql.includes('SELECT id, username, email, name, role')) {
          return { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role };
        }
        return user;
      }
    }

    // 4. By ID
    if (sql.includes('WHERE id = ?')) {
      const targetId = params[0];
      return table.find(item => String(item.id) === String(targetId));
    }

    // 5. WHERE is_visible = 1
    let result = table;
    if (sql.includes('is_visible = 1')) {
      result = result.filter(item => item.is_visible == 1);
    }

    // 6. ORDER BY
    if (sql.includes('ORDER BY display_order ASC')) {
      result = [...result].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    } else if (sql.includes('ORDER BY id DESC')) {
      result = [...result].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }

    // 7. LIMIT
    if (sql.includes('LIMIT 10')) {
      result = result.slice(0, 10);
    }

    if (mode === 'all') {
      return result;
    }
    return result[0];
  }

  function handleInsert(sql, params) {
    const intoMatch = sql.match(/INSERT\s+INTO\s+([a-zA-Z_]+)/i);
    if (!intoMatch) return { changes: 0 };
    const tableName = intoMatch[1].toLowerCase();
    const table = getTable(tableName);

    const colsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
    const cols = colsMatch ? colsMatch[1].split(',').map(c => c.trim()) : [];

    const newObj = {};
    cols.forEach((col, i) => {
      newObj[col] = params[i];
    });

    if (!newObj.id) {
      const maxId = table.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
      newObj.id = maxId + 1;
    }

    newObj.created_at = newObj.created_at || new Date().toISOString();
    newObj.updated_at = new Date().toISOString();

    table.push(newObj);
    return { changes: 1, lastInsertRowid: newObj.id };
  }

  function handleUpdate(sql, params) {
    const updateMatch = sql.match(/UPDATE\s+([a-zA-Z_]+)/i);
    if (!updateMatch) return { changes: 0 };
    const tableName = updateMatch[1].toLowerCase();
    const table = getTable(tableName);

    // Target ID is the last parameter in WHERE ... id = ?
    const targetId = params[params.length - 1];
    let target = table.find(item => String(item.id) === String(targetId));

    if (!target && (targetId === 1 || tableName === 'site_settings' || tableName === 'contact_settings' || tableName === 'profiles')) {
      target = table[0];
    }

    if (!target) return { changes: 0 };

    if (sql.includes('SET is_visible = ?')) {
      target.is_visible = params[0];
      target.updated_at = new Date().toISOString();
      return { changes: 1 };
    }

    if (sql.includes('SET display_order = ?')) {
      target.display_order = params[0];
      target.updated_at = new Date().toISOString();
      return { changes: 1 };
    }

    if (sql.includes('SET password_hash = ?')) {
      target.password_hash = params[0];
      target.updated_at = new Date().toISOString();
      return { changes: 1 };
    }

    // Generic multi-field update
    const setMatch = sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
    if (setMatch) {
      const setClauses = setMatch[1].split(',').map(s => s.trim());
      let paramIdx = 0;
      for (const clause of setClauses) {
        if (clause.includes('=')) {
          const colName = clause.split('=')[0].trim();
          if (clause.includes('CURRENT_TIMESTAMP')) {
            target[colName] = new Date().toISOString();
          } else if (clause.includes('?')) {
            target[colName] = params[paramIdx++];
          }
        }
      }
      target.updated_at = new Date().toISOString();
    }

    return { changes: 1 };
  }

  function handleDelete(sql, params) {
    const fromMatch = sql.match(/FROM\s+([a-zA-Z_]+)/i);
    if (!fromMatch) return { changes: 0 };
    const tableName = fromMatch[1].toLowerCase();
    const table = getTable(tableName);

    const targetId = params[0];
    const idx = table.findIndex(item => String(item.id) === String(targetId));
    if (idx !== -1) {
      table.splice(idx, 1);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  return {
    exec(sql) {
      // Schema creates are implicit in Memory Store
    },
    prepare(sql) {
      const normalized = sql.trim().replace(/\s+/g, ' ');

      return {
        get(...params) {
          return handleSelect(normalized, params, 'get');
        },
        all(...params) {
          return handleSelect(normalized, params, 'all');
        },
        run(...params) {
          if (normalized.startsWith('INSERT')) {
            return handleInsert(normalized, params);
          }
          if (normalized.startsWith('UPDATE')) {
            return handleUpdate(normalized, params);
          }
          if (normalized.startsWith('DELETE')) {
            return handleDelete(normalized, params);
          }
          return { changes: 1 };
        }
      };
    }
  };
}

// Export active database instance (Native SQLite or resilient Serverless Memory Engine)
export const db = nativeDb || createMemoryDB();

// Initialize Tables and seed if using native SQLite
export function initDB() {
  if (nativeDb) {
    nativeDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY,
        name TEXT,
        brand_name TEXT,
        monogram TEXT,
        eyebrow TEXT,
        role TEXT,
        location TEXT,
        headline_prefix TEXT,
        description TEXT,
        bio TEXT,
        avatar_url TEXT,
        about_image_url TEXT,
        availability_badge TEXT,
        availability_status_text TEXT,
        availability_period TEXT,
        resume_url TEXT,
        resume_label TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        type TEXT,
        year TEXT,
        image TEXT,
        images TEXT,
        description TEXT,
        role TEXT,
        client TEXT,
        link TEXT,
        link_label TEXT,
        services TEXT,
        highlight TEXT,
        deliverables TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period TEXT,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        description TEXT,
        highlights TEXT,
        logo_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        category TEXT,
        icon_key TEXT,
        custom_icon_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT,
        title TEXT NOT NULL,
        description TEXT,
        deliverables TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        username TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_settings (
        id INTEGER PRIMARY KEY,
        cta_title TEXT,
        cta_description TEXT,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        primary_btn_text TEXT,
        primary_btn_link TEXT,
        secondary_btn_text TEXT,
        secondary_btn_link TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        site_title TEXT,
        brand_name TEXT,
        site_description TEXT,
        footer_brand TEXT,
        footer_copyright TEXT,
        footer_note TEXT,
        seo_title TEXT,
        seo_description TEXT,
        seo_keywords TEXT,
        og_image TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    seedInitialData();
  }
}

// Activity logging helper
export function logActivity(action, details = '') {
  try {
    const stmt = db.prepare('INSERT INTO activity_logs (action, details) VALUES (?, ?)');
    stmt.run(action, details);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Seed Initial Data if empty in native SQLite
function seedInitialData() {
  if (!nativeDb) return;
  const userCount = nativeDb.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'atmaaziz06@gmail.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'atmaaziz06';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Albassam';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    const insertUser = nativeDb.prepare(`
      INSERT INTO users (username, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run(adminUsername, adminEmail, passwordHash, 'Raditya Atma Aziz', 'admin');
  }

  const profileCount = nativeDb.prepare('SELECT COUNT(*) as count FROM profiles').get()?.count || 0;
  if (profileCount === 0) {
    const insertProfile = nativeDb.prepare(`
      INSERT INTO profiles (
        id, name, brand_name, monogram, eyebrow, role, location,
        headline_prefix, description, bio, avatar_url, about_image_url,
        availability_badge, availability_status_text, availability_period,
        resume_url, resume_label
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertProfile.run(
      initialProfile.name,
      initialProfile.brandName,
      initialProfile.monogram,
      initialProfile.eyebrow,
      initialProfile.role,
      initialProfile.location,
      initialProfile.headlinePrefix,
      initialProfile.description,
      initialProfile.bio,
      initialProfile.avatarUrl,
      initialProfile.aboutImageUrl,
      initialProfile.availabilityBadge,
      initialProfile.availabilityStatusText,
      initialProfile.availabilityPeriod,
      initialProfile.resumeUrl,
      initialProfile.resumeLabel
    );
  }
}
