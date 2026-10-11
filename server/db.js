// server/db.js
import path from 'node:path';
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
  initialSettings,
  initialCertifications,
  initialEvents
} from './seedData.js';

if (!process.env.VERCEL) dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Try loading native node:sqlite dynamically (only when NOT on Vercel)
let DatabaseSync = null;
if (!process.env.VERCEL) {
  try {
    const sqlite = await import('node:sqlite');
    DatabaseSync = sqlite.DatabaseSync || sqlite.default?.DatabaseSync || null;
  } catch (err) {
    // Expected on environments where node:sqlite is not bundled or supported
    DatabaseSync = null;
  }
}

// 2. Initialize native SQLite if available
let nativeDb = null;
if (DatabaseSync) {
  try {
    const dbPath = path.resolve(__dirname, 'portfolio.db');
    nativeDb = new DatabaseSync(dbPath);
    try {
      nativeDb.exec('PRAGMA journal_mode = WAL;');
    } catch (_) {}
    nativeDb.exec('PRAGMA foreign_keys = ON;');
  } catch (err) {
    console.warn('[DB] Native SQLite could not be initialized; no durable local database is available:', err.message);
    nativeDb = null;
  }
}

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(process.env.VERCEL);

function validateSupabaseUrl() {
  if (!supabaseUrl) return 'Set SUPABASE_URL to the Supabase Project URL in Vercel.';
  try {
    const parsed = new URL(supabaseUrl);
    if (
      parsed.protocol !== 'https:' ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash ||
      parsed.username ||
      parsed.password
    ) {
      return 'SUPABASE_URL must be the HTTPS Supabase Project URL (for example, https://<project-ref>.supabase.co), not a dashboard URL or database connection string.';
    }
  } catch (_) {
    return 'SUPABASE_URL is not a valid URL. Use the HTTPS Project URL shown in Supabase project settings.';
  }
  return null;
}

async function callSupabaseRpc(functionName, parameters) {
  const urlError = validateSupabaseUrl();
  if (urlError) {
    throw new Error(urlError);
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('Set SUPABASE_SERVICE_ROLE_KEY to the Supabase service_role key in Vercel.');
  }

  const requestUrl = `${supabaseUrl}/rest/v1/rpc/${functionName}`;
  const requestOptions = {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parameters)
  };

  let response;
  for (let attempt = 0; ; attempt += 1) {
    try {
      response = await fetch(requestUrl, {
        ...requestOptions,
        signal: AbortSignal.timeout(10000)
      });
      break;
    } catch (error) {
      if (attempt > 0 || error?.cause?.code !== 'EAI_AGAIN') throw error;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.details || `Supabase request failed (${response.status}).`);
    error.status = response.status;
    error.code = payload?.code;
    throw error;
  }
  return payload;
}

function describeSupabaseFailure(error) {
  const code = error?.code;
  const causeCode = error?.cause?.code;
  if (error?.status === 401 || error?.status === 403) {
    return 'Supabase rejected the server key. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in this Vercel environment.';
  }
  if (error?.status === 404 || code === 'PGRST202' || code === 'PGRST203') {
    return 'Supabase CMS RPC functions were not found. Apply the CMS migration, then redeploy or wait for the Supabase API schema cache to refresh.';
  }
  if (code === '42P01' || /relation .* does not exist/i.test(error?.message || '')) {
    return 'Supabase CMS tables are missing. Apply the complete CMS migration.';
  }
  if (error?.name === 'TimeoutError' || causeCode === 'ETIMEDOUT') {
    return 'Connection to Supabase timed out. Verify the Supabase project is active and reachable from Vercel.';
  }
  if (causeCode === 'ENOTFOUND') {
    return 'Vercel could not resolve the Supabase hostname configured for this deployment. Verify that the deployment uses the expected HTTPS Project URL, then redeploy if you changed the environment variable.';
  }
  if (causeCode === 'EAI_AGAIN') {
    return 'Vercel could not resolve the Supabase hostname after a retry. This may be a temporary DNS issue; retry shortly, and verify the deployment uses the expected HTTPS Project URL if it persists.';
  }
  if (causeCode === 'ECONNREFUSED' || causeCode === 'ECONNRESET') {
    return 'The Supabase endpoint refused or reset the connection. Verify SUPABASE_URL and that the Supabase project is active.';
  }
  if (error?.name === 'TypeError' || /fetch failed|ENOTFOUND|ECONNREFUSED|Invalid URL/i.test(error?.message || '')) {
    return 'Supabase could not be reached. Verify that SUPABASE_URL is the HTTPS Project URL from Supabase settings and that the project is active.';
  }
  return 'Supabase initialization failed. Check the Vercel function logs for the database error and verify the CMS migration.';
}

async function supabaseQuery(sql, params, mode) {
  return callSupabaseRpc('cms_execute', {
    p_sql: sql,
    p_params: params,
    p_mode: mode
  });
}

const supabaseDb = {
  prepare(sql) {
    return {
      get: async (...params) => supabaseQuery(sql, params, 'one'),
      all: async (...params) => supabaseQuery(sql, params, 'all'),
      run: async (...params) => supabaseQuery(sql, params, 'run')
    };
  }
};

const unavailableDb = {
  prepare() {
    const unavailable = () => {
      throw new Error('No durable database is available. Configure Supabase on Vercel or use Node.js 22.13+ locally.');
    };
    return { get: unavailable, all: unavailable, run: unavailable };
  },
  exec() {
    throw new Error('No durable database is available.');
  }
};

// Local SQLite remains synchronous; callers await these methods so the same
// route code can use the asynchronous Supabase RPC adapter in production.
export const db = nativeDb || (useSupabase ? supabaseDb : unavailableDb);

export let databaseStatus = {
  ready: Boolean(nativeDb),
  message: nativeDb ? '' : 'Persistent database is not initialized.'
};

// Initialize the local SQLite schema or verify and seed durable Supabase storage.
export async function initDB() {
  if (!nativeDb) {
    if (useSupabase) {
      const urlError = validateSupabaseUrl();
      if (urlError || !supabaseServiceRoleKey) {
        databaseStatus = {
          ready: false,
          message: urlError || 'Set SUPABASE_SERVICE_ROLE_KEY to the Supabase service_role key in Vercel.'
        };
        console.error(`[DB] ${databaseStatus.message}`);
        return databaseStatus;
      }
      try {
        await supabaseQuery('SELECT 1 AS ready', [], 'one');
        await seedSupabaseData();
        databaseStatus = { ready: true, message: '' };
      } catch (error) {
        databaseStatus = {
          ready: false,
          message: describeSupabaseFailure(error)
        };
        console.error('[DB] Supabase initialization failed.', {
          status: error?.status,
          code: error?.code,
          causeCode: error?.cause?.code,
          hostname: new URL(supabaseUrl).hostname,
          message: error?.message
        });
      }
      return databaseStatus;
    }
    throw new Error('Persistent SQLite is unavailable. Run this application on Node.js 22.13 or newer.');
  }

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

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        organizer TEXT,
        date TEXT,
        period TEXT,
        location TEXT,
        role TEXT,
        description TEXT,
        image_url TEXT,
        link_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issue_date TEXT,
        expiry_date TEXT,
        credential_id TEXT,
        credential_url TEXT,
        image_url TEXT,
        category TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

  `);

  nativeDb.exec('DROP TABLE IF EXISTS content_history;');
  seedInitialData();
  databaseStatus = { ready: true, message: '' };
  return databaseStatus;
}

async function seedSupabaseData() {
  const timestamp = new Date().toISOString();
  const withTimestamps = (row) => ({ ...row, created_at: timestamp, updated_at: timestamp });
  const adminEmail = process.env.ADMIN_EMAIL || 'atmaaziz06@gmail.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'atmaaziz06';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!adminPassword) {
    throw new Error('Set ADMIN_DEFAULT_PASSWORD before initializing the Supabase CMS.');
  }

  const seed = {
    users: [withTimestamps({
      id: 1,
      username: adminUsername,
      email: adminEmail,
      password_hash: bcrypt.hashSync(adminPassword, 10),
      name: 'Raditya Atma Aziz',
      role: 'admin'
    })],
    profiles: [{
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
      updated_at: timestamp
    }],
    projects: initialProjects.map(item => withTimestamps({
      id: item.id,
      title: item.title,
      category: item.category,
      type: item.type,
      year: item.year,
      image: item.image,
      images: JSON.stringify(item.images || []),
      description: item.description,
      role: item.role,
      client: item.client,
      link: item.link,
      link_label: item.linkLabel,
      services: JSON.stringify(item.services || []),
      highlight: item.highlight,
      deliverables: item.deliverables,
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    })),
    experiences: initialExperience.map((item, index) => withTimestamps({
      id: index + 1,
      period: item.period,
      role: item.role,
      company: item.company,
      location: item.location,
      description: item.description,
      highlights: JSON.stringify(item.highlights || []),
      logo_url: item.logoUrl || '',
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    })),
    tools: initialTools.map((item, index) => withTimestamps({
      id: index + 1,
      name: item.name,
      role: item.role,
      category: item.category,
      icon_key: item.iconKey,
      custom_icon_url: item.customIconUrl || '',
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    })),
    skills: initialSkills.map((item, index) => withTimestamps({
      id: index + 1,
      number: item.number,
      title: item.title,
      description: item.description,
      deliverables: JSON.stringify(item.deliverables || []),
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    })),
    social_links: initialSocials.map((item, index) => withTimestamps({
      id: index + 1,
      name: item.name,
      url: item.url,
      username: item.username,
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    })),
    contact_settings: [{
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
      updated_at: timestamp
    }],
    site_settings: [{
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
      updated_at: timestamp
    }],
    events: initialEvents.map((item, index) => withTimestamps({
      id: index + 1,
      title: item.title,
      organizer: item.organizer || '',
      date: item.date || '',
      period: item.period || '',
      location: item.location || '',
      role: item.role || '',
      description: item.description || '',
      image_url: item.imageUrl || '',
      link_url: item.linkUrl || '',
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    })),
    certifications: initialCertifications.map((item, index) => withTimestamps({
      id: index + 1,
      title: item.title,
      issuer: item.issuer,
      issue_date: item.issueDate || '',
      expiry_date: item.expiryDate || '',
      credential_id: item.credentialId || '',
      credential_url: item.credentialUrl || '',
      image_url: item.imageUrl || '',
      category: item.category || '',
      description: item.description || '',
      display_order: item.displayOrder,
      is_visible: item.isVisible === false ? 0 : 1
    }))
  };

  await callSupabaseRpc('cms_initialize', { p_seed: seed });
}

// Activity logging helper
export async function logActivity(action, details = '') {
  try {
    const stmt = db.prepare('INSERT INTO activity_logs (action, details) VALUES (?, ?)');
    await stmt.run(action, details);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Seed Initial Data if empty in native SQLite
function seedInitialData() {
  if (!nativeDb) return;

  const isFreshDb = (nativeDb.prepare('SELECT COUNT(*) as count FROM activity_logs').get()?.count || 0) === 0;
  if (!isFreshDb) {
    // Database has already been initialized in the past.
    // Preserve all user deletions and changes — do not re-seed!
    return;
  }

  const userCount = nativeDb.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'atmaaziz06@gmail.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'atmaaziz06';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
    if (!adminPassword) {
      throw new Error('Set ADMIN_DEFAULT_PASSWORD before initializing the local CMS.');
    }
    const passwordHash = bcrypt.hashSync(adminPassword, 10);

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

  // 3. Projects
  const projectCount = nativeDb.prepare('SELECT COUNT(*) as count FROM projects').get()?.count || 0;
  if (projectCount === 0) {
    const insertProject = nativeDb.prepare(`
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
  const expCount = nativeDb.prepare('SELECT COUNT(*) as count FROM experiences').get()?.count || 0;
  if (expCount === 0) {
    const insertExp = nativeDb.prepare(`
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
  const toolsCount = nativeDb.prepare('SELECT COUNT(*) as count FROM tools').get()?.count || 0;
  if (toolsCount === 0) {
    const insertTool = nativeDb.prepare(`
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
  const skillsCount = nativeDb.prepare('SELECT COUNT(*) as count FROM skills').get()?.count || 0;
  if (skillsCount === 0) {
    const insertSkill = nativeDb.prepare(`
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
  const socialCount = nativeDb.prepare('SELECT COUNT(*) as count FROM social_links').get()?.count || 0;
  if (socialCount === 0) {
    const insertSocial = nativeDb.prepare(`
      INSERT INTO social_links (name, url, username, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const soc of initialSocials) {
      insertSocial.run(soc.name, soc.url, soc.username, soc.displayOrder, soc.isVisible ? 1 : 0);
    }
  }

  // 8. Contact Settings
  const contactCount = nativeDb.prepare('SELECT COUNT(*) as count FROM contact_settings').get()?.count || 0;
  if (contactCount === 0) {
    const insertContact = nativeDb.prepare(`
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
  const settingsCount = nativeDb.prepare('SELECT COUNT(*) as count FROM site_settings').get()?.count || 0;
  if (settingsCount === 0) {
    const insertSettings = nativeDb.prepare(`
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

  // 10. Certifications
  const certCount = nativeDb.prepare('SELECT COUNT(*) as count FROM certifications').get()?.count || 0;
  if (certCount === 0) {
    const insertCert = nativeDb.prepare(`
      INSERT INTO certifications (
        title, issuer, issue_date, expiry_date, credential_id,
        credential_url, image_url, category, description,
        display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const cert of initialCertifications) {
      insertCert.run(
        cert.title,
        cert.issuer,
        cert.issueDate || '',
        cert.expiryDate || '',
        cert.credentialId || '',
        cert.credentialUrl || '',
        cert.imageUrl || '',
        cert.category || 'General',
        cert.description || '',
        cert.displayOrder,
        cert.isVisible ? 1 : 0
      );
    }
  }

  // 11. Events
  const eventsCount = nativeDb.prepare('SELECT COUNT(*) as count FROM events').get()?.count || 0;
  if (eventsCount === 0) {
    const insertEv = nativeDb.prepare(`
      INSERT INTO events (
        title, organizer, date, period, location, role,
        description, image_url, link_url, display_order, is_visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ev of initialEvents) {
      insertEv.run(
        ev.title,
        ev.organizer || '',
        ev.date || '',
        ev.period || '',
        ev.location || '',
        ev.role || '',
        ev.description || '',
        ev.imageUrl || '',
        ev.linkUrl || '',
        ev.displayOrder,
        ev.isVisible ? 1 : 0
      );
    }
  }

  // Initial log
  const logCount = nativeDb.prepare('SELECT COUNT(*) as count FROM activity_logs').get()?.count || 0;
  if (logCount === 0) {
    logActivity('System Initialized', 'Database setup and loaded with initial portfolio content');
  }
}
