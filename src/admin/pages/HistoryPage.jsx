import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, Eye, History, X, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatUpdateTime,
  subscribeContentUpdates,
  cachePublishedContent,
  HISTORY_PAGE_SIZE
} from '../../utils/contentStore';
import { api } from '../../services/api';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const SKIP_KEYS = new Set([
  'updatedAt',
  'createdAt',
  'previousSnapshot',
  'snapshot',
  'password',
  'password_hash'
]);

function itemLabel(item, index) {
  if (item == null) return `#${index + 1}`;
  if (typeof item !== 'object') return String(item);
  return item.title || item.name || item.company || item.role || item.issuer || `#${item.id ?? index + 1}`;
}

function previewValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string') {
    if (value.startsWith('data:image') || value.startsWith('blob:')) return '[Gambar terpasang]';
    return value.length > 160 ? `${value.slice(0, 160)}…` : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Tidak ada item';
    return value.map((item, index) => itemLabel(item, index)).filter(Boolean).slice(0, 10).join(', ');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).filter((key) => !SKIP_KEYS.has(key)).slice(0, 8);
    if (!keys.length) return '—';
    return keys.map((key) => `${key}: ${previewValue(value[key])}`).join(' · ');
  }
  return String(value);
}

function stableString(value) {
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(value);
  }
}

function flattenObject(data, prefix = '') {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return prefix ? { [prefix]: data } : {};
  }
  const rows = {};
  Object.entries(data).forEach(([key, value]) => {
    if (SKIP_KEYS.has(key)) return;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && !String(value).startsWith('data:image')) {
      Object.assign(rows, flattenObject(value, path));
    } else {
      rows[path] = value;
    }
  });
  return rows;
}

function itemKey(item, index) {
  if (item && typeof item === 'object') {
    return String(item.id ?? item.title ?? item.name ?? item.company ?? index);
  }
  return String(item ?? index);
}

function compareValues(before, after) {
  if (Array.isArray(before) || Array.isArray(after)) {
    const prevList = Array.isArray(before) ? before : [];
    const nextList = Array.isArray(after) ? after : [];
    const prevMap = new Map(prevList.map((item, index) => [itemKey(item, index), item]));
    const nextMap = new Map(nextList.map((item, index) => [itemKey(item, index), item]));
    const keys = [...new Set([...prevMap.keys(), ...nextMap.keys()])];
    const rows = [];

    keys.forEach((key) => {
      const prevItem = prevMap.get(key);
      const nextItem = nextMap.get(key);
      if (prevItem == null && nextItem != null) {
        rows.push({
          field: itemLabel(nextItem, 0),
          before: '—',
          after: previewValue(nextItem),
          kind: 'added'
        });
        return;
      }
      if (nextItem == null && prevItem != null) {
        rows.push({
          field: itemLabel(prevItem, 0),
          before: previewValue(prevItem),
          after: 'Dihapus',
          kind: 'removed'
        });
        return;
      }
      if (stableString(prevItem) !== stableString(nextItem)) {
        const prevFlat = flattenObject(prevItem);
        const nextFlat = flattenObject(nextItem);
        const fieldKeys = [...new Set([...Object.keys(prevFlat), ...Object.keys(nextFlat)])];
        const changedFields = fieldKeys.filter((field) => stableString(prevFlat[field]) !== stableString(nextFlat[field]));
        rows.push({
          field: itemLabel(nextItem || prevItem, 0),
          before: changedFields.length
            ? changedFields.map((field) => `${field}: ${previewValue(prevFlat[field])}`).join(' · ')
            : previewValue(prevItem),
          after: changedFields.length
            ? changedFields.map((field) => `${field}: ${previewValue(nextFlat[field])}`).join(' · ')
            : previewValue(nextItem),
          kind: 'changed'
        });
      }
    });

    return rows;
  }

  const prevFlat = flattenObject(before && typeof before === 'object' && !Array.isArray(before) ? before : { nilai: before });
  const nextFlat = flattenObject(after && typeof after === 'object' && !Array.isArray(after) ? after : { nilai: after });
  const fieldKeys = [...new Set([...Object.keys(prevFlat), ...Object.keys(nextFlat)])];
  const rows = [];

  fieldKeys.forEach((field) => {
    const prevValue = prevFlat[field];
    const nextValue = nextFlat[field];
    if (Array.isArray(prevValue) || Array.isArray(nextValue)) {
      compareValues(prevValue, nextValue).forEach((row) => {
        rows.push({ ...row, field: `${field} · ${row.field}` });
      });
      return;
    }
    if (stableString(prevValue) === stableString(nextValue)) return;
    rows.push({
      field,
      before: previewValue(prevValue),
      after: previewValue(nextValue),
      kind: prevValue == null ? 'added' : nextValue == null ? 'removed' : 'changed'
    });
  });

  return rows;
}

function kindLabel(kind) {
  if (kind === 'added') return 'Ditambah';
  if (kind === 'removed') return 'Dihapus';
  return 'Diubah';
}

function kindClass(kind) {
  if (kind === 'added') return 'bg-emerald-50 text-emerald-800';
  if (kind === 'removed') return 'bg-red-50 text-red-700';
  return 'bg-[#E66F52]/12 text-[#E66F52]';
}

function ChangeComparison({ before, after }) {
  const rows = compareValues(before, after);

  if (!rows.length) {
    return (
      <div className="rounded-2xl bg-white/70 border border-[rgba(23,23,23,0.08)] p-4">
        <p className="text-xs text-[#5F5A57] italic">
          Tidak ada perbedaan field yang terdeteksi. Versi sebelumnya mungkin belum tercatat
          (misalnya entri inisialisasi).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/70 border border-[rgba(23,23,23,0.08)] overflow-hidden">
      <div className="grid grid-cols-[minmax(88px,0.7fr)_1fr_1fr] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-[#5F5A57] bg-white/60 border-b border-[rgba(23,23,23,0.06)]">
        <span>Field / Item</span>
        <span>Perubahan sebelumnya</span>
        <span>Perubahan terbaru</span>
      </div>
      <div className="divide-y divide-[rgba(23,23,23,0.06)]">
        {rows.map((row) => (
          <div key={`${row.field}-${row.kind}`} className="grid grid-cols-[minmax(88px,0.7fr)_1fr_1fr] gap-2 px-3 py-2.5 text-xs">
            <div>
              <p className="font-semibold text-[#171717] break-words">{row.field}</p>
              <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${kindClass(row.kind)}`}>
                {kindLabel(row.kind)}
              </span>
            </div>
            <p className="text-[#5F5A57] break-words">{row.before}</p>
            <p className="text-[#171717] font-medium break-words">{row.after}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await api.getContentHistory();
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(response?.message || 'Format histori dari server tidak valid.');
      }
      const next = response.data;
      setHistory(next);
      setSelected((current) => (current ? next.find((item) => item.id === current.id) || null : null));
    } catch (err) {
      console.error('Gagal memuat histori update:', err);
      toast.error(err.message || 'Gagal memuat histori update.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
    return subscribeContentUpdates(() => {
      void refresh();
    });
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = useMemo(() => {
    const start = safePage * HISTORY_PAGE_SIZE;
    return history.slice(start, start + HISTORY_PAGE_SIZE);
  }, [history, safePage]);

  const oldestBatchCount = Math.min(HISTORY_PAGE_SIZE, history.length);
  const selectedCanRestore = Boolean(selected?.snapshot);

  const handleDeleteOne = async () => {
    if (!selected) return;
    try {
      await api.deleteContentHistory(selected.id);
      toast.success('Histori tersebut berhasil dihapus.');
      setSelected(null);
      setConfirm(null);
      await refresh();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus histori.');
    }
  };

  const handleDeleteOldest = async () => {
    try {
      const response = await api.deleteOldestContentHistory(HISTORY_PAGE_SIZE);
      const removed = response?.data?.deleted ?? oldestBatchCount;
      toast.success(`${removed} histori terlama berhasil dihapus.`);
      setConfirm(null);
      setPage(0);
      await refresh();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus histori lama.');
    }
  };

  const handleRestore = async () => {
    if (!selected) return;
    try {
      const response = await api.restoreContentHistory(selected.id);
      if (!response?.success || !response.data?.snapshot) {
        throw new Error(response?.message || 'Server tidak mengembalikan snapshot hasil restore.');
      }
      cachePublishedContent(response.data.snapshot, { broadcast: true });
      toast.success('Versi yang dipilih dipulihkan ke database dan landing page.');
      setSelected(null);
      setConfirm(null);
      setPage(0);
      await refresh();
    } catch (err) {
      toast.error(err.message || 'Gagal memulihkan versi yang dipilih.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Histori Update
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Klik salah satu baris untuk melihat versi, menghapus catatan histori, atau memulihkan
            konten tepat ke snapshot versi yang dipilih.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setConfirm({
                type: 'oldest',
                title: `Hapus ${oldestBatchCount} histori terlama`,
                message: `Hapus ${oldestBatchCount} entri paling lama dari log. Konten terbaru di landing page tetap dipakai selama masih ada histori yang tersisa.`,
                confirmText: `Hapus ${oldestBatchCount} terlama`,
                variant: 'danger'
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-red-200 text-red-700 text-xs sm:text-sm font-medium hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Hapus 10 terlama
          </button>
        )}
      </div>

      <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#E66F52]" />
          <h2 className="text-base font-semibold text-[#171717]">Log perubahan konten</h2>
          <span className="ml-auto text-xs text-[#5F5A57]">
            {history.length} entri · {HISTORY_PAGE_SIZE} per halaman
          </span>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-[#5F5A57]">Memuat histori dari database...</p>
        ) : history.length === 0 ? (
          <EmptyState
            icon={History}
            title="Belum ada histori update"
            description="Simpan perubahan dari halaman admin (profil, project, fitur, dan lainnya) untuk mulai mencatat histori."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-[#5F5A57] border-b border-[rgba(23,23,23,0.08)]">
                    <th className="py-3 pr-4 font-semibold">Waktu Update</th>
                    <th className="py-3 pr-4 font-semibold">Bagian yang diubah</th>
                    <th className="py-3 pr-4 font-semibold">Aksi</th>
                    <th className="py-3 pr-4 font-semibold">Detail</th>
                    <th className="py-3 font-semibold text-right">Versi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(23,23,23,0.06)]">
                  {pageRows.map((entry, index) => {
                    const globalIndex = safePage * HISTORY_PAGE_SIZE + index;
                    const isSelected = selected?.id === entry.id;
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => setSelected(entry)}
                        className={`align-top cursor-pointer transition-colors ${
                          isSelected ? 'bg-white/80' : 'hover:bg-white/50'
                        }`}
                      >
                        <td className="py-3 pr-4 whitespace-nowrap text-[#171717] font-medium">
                          {formatUpdateTime(entry.timestamp)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-[#171717]">{entry.section || 'Konten'}</span>
                          {globalIndex === 0 && (
                            <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E66F52]/15 text-[#E66F52]">
                              Terbaru
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-[#5F5A57]">{entry.action || 'Update'}</td>
                        <td className="py-3 pr-4 text-[#5F5A57]">{entry.details || '—'}</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelected(entry);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] hover:bg-[#F6E7DF] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {history.length > HISTORY_PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)]">
                <p className="text-xs text-[#5F5A57]">
                  Halaman {safePage + 1} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[rgba(23,23,23,0.1)] text-xs font-medium disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[rgba(23,23,23,0.1)] text-xs font-medium disabled:opacity-40 cursor-pointer"
                  >
                    Berikutnya
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-5 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#E66F52]">
                  Pratinjau versi
                </p>
                <h3 className="text-lg font-semibold text-[#171717] mt-1">
                  {selected.section || 'Konten'} — {selected.action || 'Update'}
                </h3>
                <p className="text-xs text-[#5F5A57] mt-1">
                  {formatUpdateTime(selected.timestamp)}
                  {selected.details ? ` · ${selected.details}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-black/5 text-[#5F5A57] cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-[#171717]">Perbandingan perubahan</h4>
                <p className="text-xs text-[#5F5A57] mt-0.5">
                  Kolom kiri = kondisi sebelum update ini. Kolom kanan = perubahan terbaru yang disimpan.
                </p>
              </div>
              <ChangeComparison
                before={selected.previousSectionData}
                after={selected.sectionData}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6 pt-4 border-t border-[rgba(23,23,23,0.08)]">
              <button
                type="button"
                disabled={!selectedCanRestore}
                onClick={() =>
                  setConfirm({
                    type: 'restore',
                    title: 'Pulihkan versi yang dipilih',
                    message:
                      'Data aktif di database dan landing page akan ditimpa menggunakan snapshot versi ini. Aksi pemulihan juga dicatat sebagai histori baru.',
                    confirmText: 'Pulihkan versi ini',
                    variant: 'primary'
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[rgba(23,23,23,0.1)] text-xs sm:text-sm font-medium text-[#171717] hover:bg-[#F6E7DF] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Pulihkan versi ini
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirm({
                    type: 'one',
                    title: 'Hapus histori ini',
                    message:
                      'Entri histori ini hanya dihapus dari log. Data aktif di database dan landing page tidak berubah.',
                    confirmText: 'Hapus histori',
                    variant: 'danger'
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Hapus histori ini
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmText={confirm?.confirmText}
        variant={confirm?.variant === 'primary' ? 'primary' : 'danger'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === 'oldest') handleDeleteOldest();
          else if (confirm?.type === 'one') handleDeleteOne();
          else if (confirm?.type === 'restore') handleRestore();
        }}
      />
    </div>
  );
}
