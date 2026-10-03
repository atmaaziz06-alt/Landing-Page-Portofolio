// Persistent published content + update history (LocalStorage source of truth)

export const CONTENT_STORAGE_KEYS = {
  SNAPSHOT: 'vezta_content_snapshot',
  HISTORY: 'vezta_update_history',
  CHANNEL: 'vezta_content_sync',
  EVENT: 'vezta:content-updated'
};

export const HISTORY_LIMIT = 40;

const SECTION_KEYS = [
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

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function writeJson(key, value) {
  const serialized = JSON.stringify(value);
  try {
    localStorage.setItem(key, serialized);
    return true;
  } catch (_) {
    return false;
  }
}

export function readSnapshot() {
  if (typeof window === 'undefined') return null;
  const parsed = safeParse(localStorage.getItem(CONTENT_STORAGE_KEYS.SNAPSHOT), null);
  return parsed && typeof parsed === 'object' ? parsed : null;
}

export function writeSnapshot(snapshot) {
  if (typeof window === 'undefined' || !snapshot) return false;
  return writeJson(CONTENT_STORAGE_KEYS.SNAPSHOT, snapshot);
}

export function readHistory() {
  if (typeof window === 'undefined') return [];
  const parsed = safeParse(localStorage.getItem(CONTENT_STORAGE_KEYS.HISTORY), []);
  return Array.isArray(parsed) ? parsed : [];
}

function compactHistory(entries) {
  return entries.map((entry, index) => {
    if (index === 0) return entry;
    if (!entry?.snapshot) return entry;
    const { snapshot, ...rest } = entry;
    return rest;
  });
}

function persistHistory(entries) {
  const limited = compactHistory(entries.slice(0, HISTORY_LIMIT));
  if (writeJson(CONTENT_STORAGE_KEYS.HISTORY, limited)) return true;

  const tighter = compactHistory(limited.slice(0, 12));
  if (writeJson(CONTENT_STORAGE_KEYS.HISTORY, tighter)) return true;

  const minimal = compactHistory(limited.slice(0, 4));
  return writeJson(CONTENT_STORAGE_KEYS.HISTORY, minimal);
}

export function getLatestHistoryEntry() {
  const history = readHistory();
  return history.length ? history[0] : null;
}

export function getPublishedContent() {
  const latest = getLatestHistoryEntry();
  if (latest?.snapshot && typeof latest.snapshot === 'object') {
    return latest.snapshot;
  }
  return readSnapshot();
}

export function visibleOnly(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && item.isVisible !== false);
}

export function formatUpdateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function pickSectionData(snapshot, sectionKey) {
  if (!snapshot || !sectionKey) return null;
  if (sectionKey === 'contact') {
    return {
      contact: snapshot.contact || null,
      socials: snapshot.socials || []
    };
  }
  return snapshot[sectionKey] ?? null;
}

export function broadcastContentUpdate(detail = {}) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(CONTENT_STORAGE_KEYS.EVENT, { detail }));

  try {
    const channel = new BroadcastChannel(CONTENT_STORAGE_KEYS.CHANNEL);
    channel.postMessage({ type: 'content-updated', ...detail });
    channel.close();
  } catch (_) {}
}

export function subscribeContentUpdates(onUpdate) {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (event) => onUpdate(event.detail || {});
  const handleStorage = (event) => {
    if (
      event.key === CONTENT_STORAGE_KEYS.HISTORY ||
      event.key === CONTENT_STORAGE_KEYS.SNAPSHOT
    ) {
      onUpdate({ source: 'storage', key: event.key });
    }
  };

  const handleFocus = () => onUpdate({ source: 'focus' });
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') onUpdate({ source: 'visibility' });
  };
  const handlePageShow = () => onUpdate({ source: 'pageshow' });

  window.addEventListener(CONTENT_STORAGE_KEYS.EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('pageshow', handlePageShow);
  document.addEventListener('visibilitychange', handleVisibility);

  let channel = null;
  try {
    channel = new BroadcastChannel(CONTENT_STORAGE_KEYS.CHANNEL);
    channel.onmessage = (event) => onUpdate(event.data || {});
  } catch (_) {}

  return () => {
    window.removeEventListener(CONTENT_STORAGE_KEYS.EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('pageshow', handlePageShow);
    document.removeEventListener('visibilitychange', handleVisibility);
    try {
      channel?.close();
    } catch (_) {}
  };
}

export function recordContentUpdate({
  section = 'Konten',
  sectionKey = '',
  action = 'Update',
  details = '',
  snapshot
} = {}) {
  if (!snapshot || typeof snapshot !== 'object') return null;

  const previous = getPublishedContent() || readSnapshot() || {};
  const stamped = {
    ...snapshot,
    updatedAt: snapshot.updatedAt || new Date().toISOString()
  };

  writeSnapshot(stamped);

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: stamped.updatedAt,
    section,
    sectionKey,
    action,
    details: details || '',
    snapshot: stamped,
    sectionData: pickSectionData(stamped, sectionKey),
    previousSectionData: pickSectionData(previous, sectionKey)
  };

  const history = [entry, ...readHistory().filter((item) => item?.id !== entry.id)];
  persistHistory(history);
  broadcastContentUpdate({
    id: entry.id,
    section,
    action,
    timestamp: entry.timestamp
  });

  return entry;
}

export function inferSectionKey(sectionLabel = '') {
  const label = String(sectionLabel).toLowerCase();
  if (label.includes('hero') || label.includes('profil') || label.includes('profile') || label.includes('gambar')) {
    return 'profile';
  }
  if (label.includes('project')) return 'projects';
  if (label.includes('experience') || label.includes('pengalaman')) return 'experience';
  if (label.includes('skill') || label.includes('layanan') || label.includes('fitur') || label.includes('service')) {
    return 'skills';
  }
  if (label.includes('tool')) return 'tools';
  if (label.includes('event')) return 'events';
  if (label.includes('sertifikasi') || label.includes('certif')) return 'certifications';
  if (label.includes('contact') || label.includes('cta') || label.includes('sosial')) return 'contact';
  if (label.includes('setting') || label.includes('seo') || label.includes('footer')) return 'settings';
  return '';
}

export { SECTION_KEYS };
