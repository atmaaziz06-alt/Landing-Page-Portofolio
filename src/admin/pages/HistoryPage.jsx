import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Eye, History, X, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatUpdateTime,
  readHistory,
  subscribeContentUpdates,
  HISTORY_PAGE_SIZE,
  deleteHistoryEntry,
  deleteOldestHistory,
  restoreBeforeHistoryEntry,
  canRestoreHistoryEntry
} from '../../utils/contentStore';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

function previewValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string') {
    if (value.startsWith('data:image')) return '[Gambar terpasang]';
    return value.length > 180 ? `${value.slice(0, 180)}…` : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Tidak ada item';
    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return String(item);
        return item.title || item.name || item.company || item.role || `#${item.id ?? ''}`;
      })
      .filter(Boolean)
      .slice(0, 8)
      .join(', ');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).slice(0, 6);
    return keys.map((key) => `${key}: ${previewValue(value[key])}`).join(' · ');
  }
  return String(value);
}

function SectionPreview({ title, data }) {
  if (data == null) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-[#171717] mb-2">{title}</h4>
        <p className="text-xs text-[#5F5A57] italic">Tidak ada data untuk versi ini.</p>
      </div>
    );
  }

  const entries = Array.isArray(data)
    ? data.slice(0, 12).map((item, index) => [
        `#${index + 1}`,
        item && typeof item === 'object'
          ? item.title || item.name || item.company || previewValue(item)
          : previewValue(item)
      ])
    : Object.entries(data).filter(([key]) => key !== 'updatedAt' && key !== 'previousSnapshot');

  return (
    <div>
      <h4 className="text-sm font-semibold text-[#171717] mb-2">{title}</h4>
      <div className="rounded-2xl bg-white/70 border border-[rgba(23,23,23,0.08)] divide-y divide-[rgba(23,23,23,0.06)]">
        {entries.length === 0 ? (
          <p className="text-xs text-[#5F5A57] italic p-3">Kosong</p>
        ) : (
          entries.map(([label, value]) => (
            <div key={label} className="px-3 py-2.5 grid grid-cols-[120px_1fr] gap-3 text-xs">
              <span className="font-medium text-[#5F5A57]">{label}</span>
              <span className="text-[#171717] break-words">{previewValue(value)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const toast = useToast();
  const [history, setHistory] = useState(() => readHistory());
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState(null);

  const refresh = () => {
    const next = readHistory();
    setHistory(next);
    setSelected((current) => (current ? next.find((item) => item.id === current.id) || null : null));
  };

  useEffect(() => {
    refresh();
    return subscribeContentUpdates(() => {
      refresh();
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = useMemo(() => {
    const start = safePage * HISTORY_PAGE_SIZE;
    return history.slice(start, start + HISTORY_PAGE_SIZE);
  }, [history, safePage]);

  const oldestBatchCount = Math.min(HISTORY_PAGE_SIZE, history.length);
  const selectedCanRestore = selected ? canRestoreHistoryEntry(selected, history) : false;

  const handleDeleteOne = () => {
    if (!selected) return;
    deleteHistoryEntry(selected.id);
    toast.success('Histori tersebut berhasil dihapus.');
    setSelected(null);
    setConfirm(null);
    refresh();
  };

  const handleDeleteOldest = () => {
    const removed = oldestBatchCount;
    deleteOldestHistory(HISTORY_PAGE_SIZE);
    toast.success(`${removed} histori terlama berhasil dihapus.`);
    setConfirm(null);
    setPage(0);
    refresh();
  };

  const handleRestore = () => {
    if (!selected) return;
    const entry = restoreBeforeHistoryEntry(selected.id);
    if (!entry) {
      toast.error('Versi sebelumnya tidak tersedia untuk histori ini.');
      setConfirm(null);
      return;
    }
    toast.success('Konten dikembalikan ke versi sebelum histori ini. Landing page sudah diperbarui.');
    setSelected(null);
    setConfirm(null);
    setPage(0);
    refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Histori Update
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Klik salah satu baris untuk melihat versi, menghapus histori itu, atau mengembalikan
            konten ke kondisi sebelum update tersebut. Landing page selalu memakai entri terbaru.
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

        {history.length === 0 ? (
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
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-5 sm:p-7 shadow-2xl"
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

            <div className="grid gap-5">
              <SectionPreview title="Versi setelah update ini" data={selected.sectionData} />
              <SectionPreview title="Versi sebelumnya" data={selected.previousSectionData} />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6 pt-4 border-t border-[rgba(23,23,23,0.08)]">
              <button
                type="button"
                disabled={!selectedCanRestore}
                onClick={() =>
                  setConfirm({
                    type: 'restore',
                    title: 'Kembalikan versi sebelumnya',
                    message:
                      'Landing page akan dikembalikan ke kondisi sebelum update histori ini, lalu dicatat sebagai entri baru di log.',
                    confirmText: 'Pulihkan versi sebelumnya',
                    variant: 'primary'
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[rgba(23,23,23,0.1)] text-xs sm:text-sm font-medium text-[#171717] hover:bg-[#F6E7DF] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Pulihkan versi sebelumnya
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirm({
                    type: 'one',
                    title: 'Hapus histori ini',
                    message:
                      'Entri histori ini akan dihapus dari log. Jika ini versi terbaru, landing page memakai histori berikutnya.',
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
