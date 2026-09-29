// server/db.js
import { DatabaseSync } from 'node:sqlite';
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

let dbPath = path.resolve(__dirname, 'portfolio.db');

// Handle Vercel Serverless read-only environment: copy DB to temp directory
if (process.env.VERCEL) {
  const tmpDir = os.platform() === 'win32' ? os.tmpdir() : '/tmp';
  const tmpDbPath = path.resolve(tmpDir, 'portfolio.db');
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpDbPath);
      }
    }
    dbPath = tmpDbPath;
  } catch (err) {
    console.warn('[DB] Could not copy DB to temp dir, using fallback path:', err.message);
  }
}

export const db = new DatabaseSync(dbPath);

// Enable WAL mode for performance
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch (err) {
  console.warn('[DB] WAL mode not supported in current environment, using default journal mode');
}
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
export function initDB() {
  db.exec(`
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

// Activity logging helper
export function logActivity(action, details = '') {
  try {
    const stmt = db.prepare('INSERT INTO activity_logs (action, details) VALUES (?, ?)');
    stmt.run(action, details);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Auto-seed Initial Data if empty
function seedInitialData() {
  // 1. Admin User
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'atmaaziz06@gmail.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'atmaaziz06';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Albassam';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run(adminUsername, adminEmail, passwordHash, 'Raditya Atma Aziz', 'admin');
    console.log(`[Seed] Created default admin user: ${adminEmail} (password: ${defaultPassword})`);
  }

  // 2. Profile
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get()?.count || 0;
  if (profileCount === 0) {
    const insertProfile = db.prepare(`
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

  // 3. Projects
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get()?.count || 0;
  if (projectCount === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (
        id, title, category, type, year, image, images,
        description, role, client, link, link_label,
        services, highlight, deliverables, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const proj of initialProjects) {
      insertProject.run(
        proj.id,
        proj.title,
        proj.category,
        proj.type,
        proj.year,
        proj.image,
        JSON.stringify(proj.images || [proj.image]),
        proj.description,
        proj.role,
        proj.client,
        proj.link,
        proj.linkLabel,
        JSON.stringify(proj.services || []),
        proj.highlight,
        proj.deliverables,
        proj.displayOrder,
        proj.isVisible ? 1 : 0
      );
    }
  }

  // 4. Experience
  const expCount = db.prepare('SELECT COUNT(*) as count FROM experiences').get()?.count || 0;
  if (expCount === 0) {
    const insertExp = db.prepare(`
      INSERT INTO experiences (
        period, role, company, location, description, highlights,
        display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const exp of initialExperience) {
      insertExp.run(
        exp.period,
        exp.role,
        exp.company,
        exp.location,
        exp.description,
        JSON.stringify(exp.highlights || []),
        exp.displayOrder,
        exp.isVisible ? 1 : 0
      );
    }
  }

  // 5. Tools
  const toolsCount = db.prepare('SELECT COUNT(*) as count FROM tools').get()?.count || 0;
  if (toolsCount === 0) {
    const insertTool = db.prepare(`
      INSERT INTO tools (
        name, role, category, icon_key, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const tool of initialTools) {
      insertTool.run(
        tool.name,
        tool.role,
        tool.category,
        tool.iconKey,
        tool.displayOrder,
        tool.isVisible ? 1 : 0
      );
    }
  }

  // 6. Skills
  const skillsCount = db.prepare('SELECT COUNT(*) as count FROM skills').get()?.count || 0;
  if (skillsCount === 0) {
    const insertSkill = db.prepare(`
      INSERT INTO skills (
        number, title, description, deliverables, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const skill of initialSkills) {
      insertSkill.run(
        skill.number,
        skill.title,
        skill.description,
        JSON.stringify(skill.deliverables || []),
        skill.displayOrder,
        skill.isVisible ? 1 : 0
      );
    }
  }

  // 7. Socials
  const socialCount = db.prepare('SELECT COUNT(*) as count FROM social_links').get()?.count || 0;
  if (socialCount === 0) {
    const insertSocial = db.prepare(`
      INSERT INTO social_links (name, url, username, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const soc of initialSocials) {
      insertSocial.run(soc.name, soc.url, soc.username, soc.displayOrder, soc.isVisible ? 1 : 0);
    }
  }

  // 8. Contact Settings
  const contactCount = db.prepare('SELECT COUNT(*) as count FROM contact_settings').get()?.count || 0;
  if (contactCount === 0) {
    const insertContact = db.prepare(`
      INSERT INTO contact_settings (
        id, cta_title, cta_description, email, phone, whatsapp,
        primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertContact.run(
      initialContact.ctaTitle,
      initialContact.ctaDescription,
      initialContact.email,
      initialContact.phone,
      initialContact.whatsapp,
      initialContact.primaryBtnText,
      initialContact.primaryBtnLink,
      initialContact.secondaryBtnText,
      initialContact.secondaryBtnLink
    );
  }

  // 9. Site Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get()?.count || 0;
  if (settingsCount === 0) {
    const insertSettings = db.prepare(`
      INSERT INTO site_settings (
        id, site_title, brand_name, site_description, footer_brand,
        footer_copyright, footer_note, seo_title, seo_description, seo_keywords, og_image
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSettings.run(
      initialSettings.siteTitle,
      initialSettings.brandName,
      initialSettings.siteDescription,
      initialSettings.footerBrand,
      initialSettings.footerCopyright,
      initialSettings.footerNote,
      initialSettings.seoTitle,
      initialSettings.seoDescription,
      initialSettings.seoKeywords,
      initialSettings.ogImage
    );
  }

  // Initial log
  const logCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get()?.count || 0;
  if (logCount === 0) {
    logActivity('System Initialized', 'Database setup and loaded with initial portfolio content');
  }
}
