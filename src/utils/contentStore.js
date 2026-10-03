// Persistent published content + update history (LocalStorage source of truth)

export const CONTENT_STORAGE_KEYS = {
  SNAPSHOT: 'vezta_content_snapshot',
  HISTORY: 'vezta_update_history',
  CHANNEL: 'vezta_content_sync',
  EVENT: 'vezta:content-updated'
};

export const HISTORY_LIMIT = 40;
export const HISTORY_PAGE_SIZE = 10;

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
    if (!entry) return entry;
    const next = { ...entry };
    delete next.snapshot;
    if (index >= HISTORY_PAGE_SIZE) {
      delete next.previousSnapshot;
    }
    return next;
  });
}

function syncPublishedFromHistory(entries) {
  const latest = entries[0];
  if (latest?.snapshot && typeof latest.snapshot === 'object') {
    writeSnapshot(latest.snapshot);
    return latest.snapshot;
  }
  return readSnapshot();
}

function commitHistory(entries, extraBroadcast = {}) {
  persistHistory(entries);
  syncPublishedFromHistory(entries);
  broadcastContentUpdate({ type: 'history-changed', ...extraBroadcast });
  return readHistory();
}

function applyPreviousSection(base = {}, sectionKey, previousSectionData) {
  if (previousSectionData == null) return base;
  if (
    sectionKey === 'contact' &&
    typeof previousSectionData === 'object' &&
    !Array.isArray(previousSectionData)
  ) {
    return {
      ...base,
      contact: previousSectionData.contact ?? base.contact,
      socials: previousSectionData.socials ?? base.socials
    };
  }
  if (sectionKey) {
    return { ...base, [sectionKey]: previousSectionData };
  }
  if (typeof previousSectionData === 'object' && !Array.isArray(previousSectionData)) {
    return { ...base, ...previousSectionData };
  }
  return base;
}

export function getRestoreSnapshot(entry, history = readHistory()) {
  if (!entry) return null;
  const index = history.findIndex((item) => item?.id === entry.id);
  const older = index >= 0 ? history[index + 1] : null;
  if (older?.snapshot && typeof older.snapshot === 'object') return older.snapshot;
  if (entry.previousSnapshot && typeof entry.previousSnapshot === 'object') {
    return entry.previousSnapshot;
  }

  const current = getPublishedContent() || readSnapshot() || {};
  if (entry.previousSectionData != null) {
    return applyPreviousSection(current, entry.sectionKey, entry.previousSectionData);
  }
  if (older?.sectionData != null && older.sectionKey) {
    return applyPreviousSection(current, older.sectionKey, older.sectionData);
  }
  return null;
}

export function canRestoreHistoryEntry(entry, history = readHistory()) {
  return Boolean(getRestoreSnapshot(entry, history));
}

export function deleteHistoryEntry(entryId) {
  if (!entryId) return readHistory();
  const history = readHistory();
  const index = history.findIndex((item) => item?.id === entryId);
  if (index < 0) return history;

  const removed = history[index];
  const remaining = history.filter((item) => item?.id !== entryId);

  if (index === 0 && remaining[0] && !remaining[0].snapshot) {
    const fallback = removed?.previousSnapshot || remaining[0].previousSnapshot;
    if (fallback && typeof fallback === 'object') {
      remaining[0] = { ...remaining[0], snapshot: fallback };
    }
  }

  return commitHistory(remaining, { action: 'history-delete', id: entryId });
}

export function deleteOldestHistory(count = HISTORY_PAGE_SIZE) {
  const history = readHistory();
  const removeCount = Math.min(Math.max(0, count), history.length);
  if (!removeCount) return history;
  const remaining = history.slice(0, history.length - removeCount);
  return commitHistory(remaining, { action: 'history-delete-oldest', count: removeCount });
}

export function restoreBeforeHistoryEntry(entryId) {
  const history = readHistory();
  const entry = history.find((item) => item?.id === entryId);
  if (!entry) return null;

  const restored = getRestoreSnapshot(entry, history);
  if (!restored || typeof restored !== 'object') return null;

  return recordContentUpdate({
    section: entry.section || 'Konten',
    sectionKey: entry.sectionKey || '',
    action: 'Pulihkan',
    details: `Kembali ke versi sebelum: ${entry.details || entry.section || 'update ini'}`,
    snapshot: restored
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
    previousSnapshot: previous && Object.keys(previous).length ? previous : null,
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
