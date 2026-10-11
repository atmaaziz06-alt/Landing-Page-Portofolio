// Optional browser cache and cross-tab notifications; the database is authoritative.

export const CONTENT_STORAGE_KEYS = {
  SNAPSHOT: 'vezta_content_snapshot',
  CHANNEL: 'vezta_content_sync',
  EVENT: 'vezta:content-updated'
};

let memoryPublished = null;

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('vezta_update_history');
  } catch {}
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeSnapshotToStorage(snapshot) {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEYS.SNAPSHOT, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function readSnapshot() {
  if (typeof window === 'undefined') return null;
  const parsed = safeParse(localStorage.getItem(CONTENT_STORAGE_KEYS.SNAPSHOT), null);
  return parsed && typeof parsed === 'object' ? parsed : null;
}

export function getPublishedContent() {
  if (memoryPublished) return memoryPublished;
  memoryPublished = readSnapshot();
  return memoryPublished;
}

export function cachePublishedContent(snapshot, { broadcast = false } = {}) {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new TypeError('Published content snapshot must be an object.');
  }

  memoryPublished = snapshot;
  const persisted = writeSnapshotToStorage(snapshot);
  if (broadcast) {
    broadcastContentUpdate({
      source: 'api',
      timestamp: snapshot.updatedAt || new Date().toISOString(),
      persisted
    });
  }
  return persisted;
}

export function visibleOnly(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && item.isVisible !== false);
}

export function broadcastContentUpdate(detail = {}) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(CONTENT_STORAGE_KEYS.EVENT, { detail }));

  try {
    const channel = new BroadcastChannel(CONTENT_STORAGE_KEYS.CHANNEL);
    channel.postMessage({ type: 'content-updated', ...detail });
    channel.close();
  } catch {}
}

export function subscribeContentUpdates(onUpdate) {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (event) => onUpdate(event.detail || {});
  const handleStorage = (event) => {
    if (event.key === CONTENT_STORAGE_KEYS.SNAPSHOT) {
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
  } catch {}

  return () => {
    window.removeEventListener(CONTENT_STORAGE_KEYS.EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('pageshow', handlePageShow);
    document.removeEventListener('visibilitychange', handleVisibility);
    try {
      channel?.close();
    } catch {}
  };
}
