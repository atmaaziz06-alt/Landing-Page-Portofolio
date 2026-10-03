import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Eye, History, X } from 'lucide-react';
import {
  formatUpdateTime,
  readHistory,
  subscribeContentUpdates
} from '../../utils/contentStore';
import EmptyState from '../components/EmptyState';

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
    : Object.entries(data).filter(([key]) => key !== 'updatedAt');

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
  const [history, setHistory] = useState(() => readHistory());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setHistory(readHistory());
    return subscribeContentUpdates(() => {
      setHistory(readHistory());
    });
  }, []);

  const rows = useMemo(() => history, [history]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
          Histori Update
        </h1>
        <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
          Setiap kali tombol Simpan atau Update ditekan, perubahan dicatat di sini. Landing page
          selalu merender item terbaru (urutan pertama) sebagai sumber data utama.
        </p>
      </div>

      <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#E66F52]" />
          <h2 className="text-base font-semibold text-[#171717]">Log perubahan konten</h2>
          <span className="ml-auto text-xs text-[#5F5A57]">{rows.length} entri</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={History}
            title="Belum ada histori update"
            description="Simpan perubahan dari halaman admin (profil, project, fitur, dan lainnya) untuk mulai mencatat histori."
          />
        ) : (
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
                {rows.map((entry, index) => (
                  <tr key={entry.id} className="align-top">
                    <td className="py-3 pr-4 whitespace-nowrap text-[#171717] font-medium">
                      {formatUpdateTime(entry.timestamp)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-[#171717]">{entry.section || 'Konten'}</span>
                      {index === 0 && (
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
                        onClick={() => setSelected(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] hover:bg-[#F6E7DF] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
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
          </div>
        </div>
      )}
    </div>
  );
}
