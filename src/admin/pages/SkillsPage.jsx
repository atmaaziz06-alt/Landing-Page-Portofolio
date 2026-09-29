// src/admin/pages/SkillsPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';

export default function SkillsPage() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    description: '',
    deliverablesText: '',
    displayOrder: 1,
    isVisible: true
  });

  const loadSkills = async () => {
    try {
      const res = await api.getSkills(true);
      if (res.success && res.data) {
        setSkills(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat skills: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    const nextOrder = skills.length + 1;
    setFormData({
      number: nextOrder < 10 ? `0${nextOrder}` : `${nextOrder}`,
      title: '',
      description: '',
      deliverablesText: '',
      displayOrder: nextOrder,
      isVisible: true
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      number: item.number || '',
      title: item.title,
      description: item.description || '',
      deliverablesText: Array.isArray(item.deliverables) ? item.deliverables.join('\n') : '',
      displayOrder: item.displayOrder ?? 1,
      isVisible: item.isVisible
    });
    setIsFormOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextState = !item.isVisible;
    try {
      const res = await api.toggleSkillVisibility(item.id, nextState);
      if (res.success) {
        setSkills((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, isVisible: nextState } : s))
        );
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Gagal mengubah visibilitas: ' + err.message);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= skills.length) return;

    const newItems = [...skills];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    setSkills(newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));

    try {
      await api.reorderSkills(payload);
      toast.success('Urutan skills berhasil diperbarui.');
    } catch (err) {
      toast.error('Gagal memperbarui urutan: ' + err.message);
      loadSkills();
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul Skill / Layanan wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const deliverablesList = formData.deliverablesText
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        deliverables: deliverablesList
      };

      if (editingItem) {
        const res = await api.updateSkill(editingItem.id, payload);
        if (res.success) {
          toast.success('Skill berhasil diperbarui.');
          setIsFormOpen(false);
          loadSkills();
        }
      } else {
        const res = await api.createSkill(payload);
        if (res.success) {
          toast.success('Skill baru berhasil ditambahkan.');
          setIsFormOpen(false);
          loadSkills();
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan skill: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteSkill(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
        setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error('Gagal menghapus skill: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Skills & Services Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Kelola pilar keahlian dan deliverables layanan yang Anda tawarkan pada bagian Services.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Skills List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
          <p className="text-sm text-[#5F5A57]">Memuat daftar skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <EmptyState
          title="Belum ada skills / layanan"
          description="Tambahkan skill dan layanan yang Anda kuasai."
          icon={Layers}
          actionLabel="Add Skill"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {skills.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[24px] bg-[#FBEFE9] border p-5 sm:p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.isVisible ? 'border-[rgba(23,23,23,0.08)] hover:bg-white shadow-2xs' : 'border-stone-200 opacity-70 bg-stone-50'
              }`}
            >
              <div className="flex items-start gap-4 flex-grow">
                {/* Reorder Up/Down */}
                <div className="flex flex-col gap-1 pt-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-md text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                    title="Pindahkan ke atas"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === skills.length - 1}
                    className="p-1 rounded-md text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                    title="Pindahkan ke bawah"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#E66F52]/10 text-[#E66F52] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {item.number || `0${index + 1}`}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold text-[#171717]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5F5A57] max-w-2xl">
                    {item.description}
                  </p>

                  {Array.isArray(item.deliverables) && item.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.deliverables.map((del, dIdx) => (
                        <span key={dIdx} className="px-2.5 py-0.5 rounded-full text-[11px] bg-white text-[#171717] border border-[rgba(23,23,23,0.06)]">
                          {del}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[rgba(23,23,23,0.06)]">
                <StatusBadge
                  isVisible={item.isVisible}
                  onClick={() => handleToggleVisibility(item)}
                />

                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-xl text-[#5F5A57] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
                  title="Edit skill"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="p-2 rounded-xl text-[#5F5A57] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT SKILL MODAL */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,23,23,0.08)] mb-6">
              <h2 className="text-xl font-semibold text-[#171717]">
                {editingItem ? 'Edit Skill / Service' : 'Add New Skill'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-[#5F5A57] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Nomor (e.g. 01)
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="01"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Judul Layanan / Skill *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Graphic Design"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deskripsi Layanan
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan value dan solusi yang Anda hadirkan..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deliverables (1 per baris)
                </label>
                <textarea
                  rows={4}
                  value={formData.deliverablesText}
                  onChange={(e) => setFormData({ ...formData, deliverablesText: e.target.value })}
                  placeholder="Social Media Post & Video&#10;Marketing Materials&#10;Logo & Brand Identity"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Visibilitas
                  </label>
                  <select
                    value={formData.isVisible ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  >
                    <option value="true">● Visible</option>
                    <option value="false">○ Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-[rgba(23,23,23,0.08)]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#171717] hover:bg-black/5 border border-[rgba(23,23,23,0.1)] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-[#E66F52] hover:bg-[#D65F42] shadow-sm transition-all cursor-pointer disabled:opacity-50 hover-lift"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Skill?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Skill"
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
