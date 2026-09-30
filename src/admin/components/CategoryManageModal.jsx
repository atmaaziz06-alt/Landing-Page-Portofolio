// src/admin/components/CategoryManageModal.jsx
import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CategoryManageModal({
  isOpen,
  onClose,
  title = 'Kelola Kategori',
  itemTypeLabel = 'item', // 'tool' atau 'proyek'
  categories = [],
  items = [], // array of objects with .category
  onAddCategory,
  onDeleteCategory, // async (categoryToDelete, fallbackCategory) => boolean/void
  defaultFallback = ''
}) {
  const toast = useToast();
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Delete confirmation state
  const [catToDelete, setCatToDelete] = useState(null);
  const [fallbackCat, setFallbackCat] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newCatName || !newCatName.trim()) {
      toast.error('Nama kategori tidak boleh kosong.');
      return;
    }
    const trimmed = newCatName.trim();
    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error(`Kategori "${trimmed}" sudah ada.`);
      return;
    }

    setIsAdding(true);
    try {
      onAddCategory(trimmed);
      setNewCatName('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartDelete = (cat) => {
    const usageCount = items.filter((item) => (item.category || '').trim() === cat).length;
    const remaining = categories.filter((c) => c !== cat);
    const initialFallback = remaining.includes(defaultFallback)
      ? defaultFallback
      : remaining[0] || 'Other';

    setCatToDelete({
      name: cat,
      count: usageCount
    });
    setFallbackCat(initialFallback);
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteCategory(catToDelete.name, fallbackCat);
      setCatToDelete(null);
    } catch (err) {
      toast.error('Gagal menghapus kategori: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[26px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,23,23,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-[rgba(23,23,23,0.08)] shadow-2xs text-[#E66F52]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#171717]">{title}</h2>
              <p className="text-xs text-[#5F5A57]">
                Tambah kategori baru atau hapus kategori yang sudah tidak digunakan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar">
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="text-xs font-semibold text-[#171717] uppercase tracking-wider block">
              Tambah Kategori Baru
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={`Contoh: AI Tools, 3D Art, Motion Graphic...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-xs sm:text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none shadow-2xs"
              />
              <button
                type="submit"
                disabled={isAdding || !newCatName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </form>

          {/* Delete Warning / Reassign Section */}
          {catToDelete && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <h4 className="font-semibold text-amber-900">
                    Hapus Kategori "{catToDelete.name}"?
                  </h4>
                  {catToDelete.count > 0 ? (
                    <div className="mt-1.5 space-y-2 text-amber-800">
                      <p>
                        Kategori ini sedang digunakan oleh{' '}
                        <span className="font-bold">{catToDelete.count} {itemTypeLabel}</span>.
                        Silakan pilih kategori pengganti:
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          value={fallbackCat}
                          onChange={(e) => setFallbackCat(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-[#171717] outline-none"
                        >
                          {categories
                            .filter((c) => c !== catToDelete.name)
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>
                        <span className="text-[11px] text-amber-700">sebagai tujuan pemindahan</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-amber-800">
                      Kategori ini tidak digunakan oleh {itemTypeLabel} mana pun dan dapat dihapus dengan aman.
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => setCatToDelete(null)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-2xs"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menghapus...</span>
                        </>
                      ) : (
                        <span>Hapus Kategori</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171717] uppercase tracking-wider">
              <span>Daftar Kategori ({categories.length})</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = items.filter((item) => (item.category || '').trim() === cat).length;
                const isOnlyOne = categories.length <= 1;

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[rgba(23,23,23,0.06)] shadow-2xs hover:border-[rgba(23,23,23,0.12)] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#E66F52]" />
                      <span className="text-xs sm:text-sm font-semibold text-[#171717]">
                        {cat}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#FBEFE9] text-[#5F5A57] border border-[rgba(23,23,23,0.05)]">
                        {count} {itemTypeLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartDelete(cat)}
                      disabled={isOnlyOne || (catToDelete && catToDelete.name === cat)}
                      className="p-1.5 rounded-xl text-[#5F5A57] hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title={isOnlyOne ? 'Minimal harus ada 1 kategori' : `Hapus kategori "${cat}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(23,23,23,0.06)] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#171717] hover:bg-white bg-white/70 border border-[rgba(23,23,23,0.08)] shadow-2xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
