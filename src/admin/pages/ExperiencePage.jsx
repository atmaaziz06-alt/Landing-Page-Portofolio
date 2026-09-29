// src/admin/pages/ExperiencePage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Building2,
  MapPin,
  Calendar,
  Save,
  Search
} from 'lucide-react';

export default function ExperiencePage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    period: '',
    location: '',
    description: '',
    highlights: '',
    logoUrl: '',
    displayOrder: 1,
    isVisible: true
  });

  const loadExperiences = async () => {
    try {
      const res = await api.getExperience(true);
      if (res.success && res.data) {
        setExperiences(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data pengalaman kerja: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  // Open add form if query param ?action=add is set
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      company: '',
      role: '',
      period: '',
      location: '',
      description: '',
      highlights: '',
      logoUrl: '',
      displayOrder: experiences.length + 1,
      isVisible: true
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      company: item.company,
      role: item.role,
      period: item.period || '',
      location: item.location || '',
      description: item.description || '',
      highlights: Array.isArray(item.highlights) ? item.highlights.join('\n') : '',
      logoUrl: item.logoUrl || '',
      displayOrder: item.displayOrder ?? 1,
      isVisible: item.isVisible
    });
    setIsFormOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextState = !item.isVisible;
    try {
      const res = await api.toggleExperienceVisibility(item.id, nextState);
      if (res.success) {
        setExperiences((prev) =>
          prev.map((exp) => (exp.id === item.id ? { ...exp, isVisible: nextState } : exp))
        );
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Gagal mengubah visibilitas: ' + err.message);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const newItems = [...experiences];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate displayOrder
    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    setExperiences(newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));

    try {
      await api.reorderExperience(payload);
      toast.success('Urutan pengalaman kerja berhasil diperbarui.');
    } catch (err) {
      toast.error('Gagal menyimpan urutan baru: ' + err.message);
      loadExperiences();
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.company.trim()) {
      toast.error('Nama Perusahaan / Organisasi wajib diisi.');
      return;
    }
    if (!formData.role.trim()) {
      toast.error('Posisi / Role wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        highlights: formData.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      };

      if (editingItem) {
        const res = await api.updateExperience(editingItem.id, payload);
        if (res.success) {
          toast.success('Data pengalaman kerja berhasil diperbarui.');
          setIsFormOpen(false);
          loadExperiences();
        }
      } else {
        const res = await api.createExperience(payload);
        if (res.success) {
          toast.success('Pengalaman kerja baru berhasil ditambahkan.');
          setIsFormOpen(false);
          loadExperiences();
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan pengalaman: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteExperience(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
        setExperiences((prev) => prev.filter((exp) => exp.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error('Gagal menghapus pengalaman: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter experiences
  const filteredList = experiences.filter((exp) => {
    const matchesSearch =
      exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVisibility =
      filterVisibility === 'ALL'
        ? true
        : filterVisibility === 'VISIBLE'
        ? exp.isVisible
        : !exp.isVisible;

    return matchesSearch && matchesVisibility;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Experience Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Kelola rekam jejak karier, tempat magang, dan peran profesional yang ditampilkan di linimasa.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#FBEFE9] p-4 rounded-2xl border border-[rgba(23,23,23,0.06)]">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#5F5A57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari perusahaan atau role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[rgba(23,23,23,0.08)] text-xs sm:text-sm focus:border-[#E66F52] focus:outline-none"
          />
        </div>

        {/* Visibility Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/80 border border-[rgba(23,23,23,0.06)] text-xs w-full sm:w-auto justify-center">
          {['ALL', 'VISIBLE', 'HIDDEN'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterVisibility(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterVisibility === status
                  ? 'bg-[#E66F52] text-white shadow-2xs'
                  : 'text-[#5F5A57] hover:text-[#171717]'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status === 'VISIBLE' ? 'Visible' : 'Hidden'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Experience List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
          <p className="text-sm text-[#5F5A57]">Memuat daftar pengalaman...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState
          title="Tidak ada pengalaman ditemukan"
          description={searchQuery ? 'Coba ubah kata kunci pencarian atau filter status.' : 'Mulai tambahkan pengalaman kerja pertama Anda.'}
          icon={Briefcase}
          actionLabel="Add Experience"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[24px] bg-[#FBEFE9] border p-5 sm:p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.isVisible ? 'border-[rgba(23,23,23,0.08)] hover:bg-white shadow-2xs' : 'border-stone-200/80 opacity-70 bg-stone-50'
              }`}
            >
              {/* Left Content */}
              <div className="flex items-start gap-4 flex-grow">
                {/* Reorder Up/Down controls */}
                <div className="flex flex-col gap-1 pt-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    title="Pindahkan ke atas"
                    className="p-1 rounded-md text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === filteredList.length - 1}
                    title="Pindahkan ke bawah"
                    className="p-1 rounded-md text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#E66F52]/10 text-[#E66F52] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-[#171717]">
                      {item.role}
                    </h3>
                    <span className="text-sm text-[#5F5A57]">at</span>
                    <span className="text-sm font-semibold text-[#E66F52]">{item.company}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5F5A57]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.period}</span>
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.location}</span>
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs sm:text-sm text-[#5F5A57] max-w-2xl line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}

                  {/* Highlights pills */}
                  {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.highlights.map((h, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] bg-white text-[#171717] border border-[rgba(23,23,23,0.06)]">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2.5 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[rgba(23,23,23,0.06)]">
                {/* Status Toggle */}
                <StatusBadge
                  isVisible={item.isVisible}
                  onClick={() => handleToggleVisibility(item)}
                />

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-xl text-[#5F5A57] hover:text-[#171717] hover:bg-white border border-transparent hover:border-[rgba(23,23,23,0.08)] transition-colors cursor-pointer"
                  title="Edit data"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="p-2 rounded-xl text-[#5F5A57] hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors cursor-pointer"
                  title="Hapus data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,23,23,0.08)] mb-6">
              <h2 className="text-xl font-semibold text-[#171717]">
                {editingItem ? 'Edit Experience' : 'Add Experience'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Nama Perusahaan / Organisasi *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Contoh: Impala Network"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Posisi / Role *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Contoh: Intern Graphic Designer"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Periode / Rentang Waktu
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="June 2026 — Present"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Lokasi Kerja
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Semarang, Indonesia & Hybrid"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deskripsi Tanggung Jawab & Pekerjaan
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan peran utama dan kontribusi..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Key Highlights / Tags (1 per baris)
                </label>
                <textarea
                  rows={3}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Design post and videos for social media content&#10;Create visual guidelines&#10;Work on the development of digital products"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Nomor Urut Tampil
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
                    Status Visibilitas
                  </label>
                  <select
                    value={formData.isVisible ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  >
                    <option value="true">● Visible (Tampil di Landing Page)</option>
                    <option value="false">○ Hidden (Disembunyikan)</option>
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan Experience'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Pengalaman Kerja?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.role} at ${deleteTarget?.company}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pengalaman"
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
