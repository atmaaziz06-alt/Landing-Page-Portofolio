import { api } from '../services/api';
import { getPublishedContent, recordContentUpdate } from './contentStore';

function unwrap(res, fallback) {
  if (res?.success && res.data != null) return res.data;
  return fallback;
}

function unwrapList(res, fallback) {
  const data = unwrap(res, fallback);
  return Array.isArray(data) ? data : fallback;
}

function mergeProfile(base = {}, extra = {}) {
  return {
    ...base,
    ...extra,
    availability: {
      ...(base.availability || {}),
      ...(extra.availability || {})
    }
  };
}

function readProfileOverride() {
  try {
    const stored = localStorage.getItem('vezta_profile_override');
    return stored ? JSON.parse(stored) : null;
  } catch (_) {
    return null;
  }
}

function readCachedList(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
}

export async function collectPublicSnapshot(base = {}) {
  const showAll = Boolean(
    sessionStorage.getItem('vezta_admin_token') || localStorage.getItem('vezta_admin_token')
  );

  const [
    pRes,
    projRes,
    expRes,
    toolsRes,
    skillsRes,
    cRes,
    setRes,
    evRes,
    certRes
  ] = await Promise.all([
    api.getProfile().catch(() => null),
    api.getProjects(showAll).catch(() => null),
    api.getExperience(showAll).catch(() => null),
    api.getTools(showAll).catch(() => null),
    api.getSkills(showAll).catch(() => null),
    api.getContact(showAll).catch(() => null),
    api.getSettings().catch(() => null),
    api.getEvents(showAll).catch(() => null),
    api.getCertifications(showAll).catch(() => null)
  ]);

  const override = readProfileOverride();
  const profileFromApi = unwrap(pRes, null);
  const contactBundle = unwrap(cRes, null);

  return {
    profile: mergeProfile(base.profile || {}, {
      ...(profileFromApi || {}),
      ...(override?.avatarUrl ? { avatarUrl: override.avatarUrl } : {}),
      ...(override?.aboutImageUrl ? { aboutImageUrl: override.aboutImageUrl } : {})
    }),
    projects: unwrapList(projRes, base.projects || []),
    experience: unwrapList(expRes, base.experience || []),
    skills: unwrapList(skillsRes, base.skills || []),
    tools: unwrapList(toolsRes, base.tools || []),
    events: unwrapList(evRes, readCachedList('vezta_events_admin') || readCachedList('vezta_events_cache') || base.events || []),
    certifications: unwrapList(
      certRes,
      readCachedList('vezta_certifications_admin') || readCachedList('vezta_certifications_cache') || base.certifications || []
    ),
    contact: contactBundle?.contact || base.contact || null,
    socials: Array.isArray(contactBundle?.socials) ? contactBundle.socials : (base.socials || []),
    settings: unwrap(setRes, base.settings || null)
  };
}

export async function publishContentUpdate({
  section = 'Konten',
  sectionKey = '',
  action = 'Update',
  details = '',
  patch = null
} = {}) {
  const current = getPublishedContent() || {};
  let collected = current;

  try {
    collected = await collectPublicSnapshot(current);
  } catch (_) {
    collected = current;
  }

  const snapshot = {
    ...current,
    ...collected,
    ...(patch && typeof patch === 'object' ? patch : {})
  };

  console.log('[Vezta Sync] handleSave/publish', {
    section,
    sectionKey,
    action,
    details,
    hasPatch: Boolean(patch),
    patchKeys: patch && typeof patch === 'object' ? Object.keys(patch) : [],
    profileName: snapshot?.profile?.name
  });

  return recordContentUpdate({
    section,
    sectionKey,
    action,
    details,
    snapshot
  });
}
