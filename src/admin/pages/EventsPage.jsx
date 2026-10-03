// src/admin/pages/EventsPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ImageCropModal from '../components/ImageCropModal';
import { usePortfolioData } from '../../context/PortfolioDataContext';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Upload,
  Search,
  MapPin,
  ExternalLink,
  Award,
  Crop as CropIcon,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

export default function EventsPage() {
  const toast = useToast();
  const { publishUpdate } = usePortfolioData();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Crop Modal state
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    date: '',
    period: '',
    location: '',
    role: 'Peserta',
    description: '',
    imageUrl: '',
    linkUrl: '',
    displayOrder: 1,
    isVisible: true
  });

  const syncCache = (items) => {
    try {
      localStorage.setItem('vezta_events_admin', JSON.stringify(items));
      // Public landing page cache MUST only contain visible items!
      const visibleOnly = items.filter((item) => item && item.isVisible !== false);
      localStorage.setItem('vezta_events_cache', JSON.stringify(visibleOnly));
    } catch (_) {}
  };

  const processEventImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          try {
            resolve(canvas.toDataURL('image/webp', 0.88));
          } catch (_) {
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const loadEvents = async () => {
    try {
      const res = await api.getEvents(true);
      if (res.success && Array.isArray(res.data)) {
        setEvents(res.data);
        syncCache(res.data);
      } else {
        const cached = localStorage.getItem('vezta_events_admin');
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        }
      }
    } catch (err) {
      const cached = localStorage.getItem('vezta_events_admin');
      if (cached !== null) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
            return;
          }
        } catch (_) {}
      }
      toast.error('Gagal memuat events: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      organizer: '',
      date: '',
      period: new Date().getFullYear().toString(),
      location: '',
      role: 'Peserta',
      description: '',
      imageUrl: '',
      linkUrl: '',
      displayOrder: events.length + 1,
      isVisible: true
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      organizer: item.organizer || '',
      date: item.date || '',
      period: item.period || '',
      location: item.location || '',
      role: item.role || 'Peserta',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      displayOrder: item.displayOrder,
      isVisible: item.isVisible
    });
    setIsFormOpen(true);
  };

  const [isProcessingImg, setIsProcessingImg] = useState(false);

  const handleImageFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WebP)');
      return;
    }
    setIsProcessingImg(true);
    try {
      const optimizedUrl = await processEventImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: optimizedUrl }));
      toast.success('Foto dokumentasi event berhasil diunggah & dioptimalkan!');
    } catch (err) {
      toast.error('Gagal memproses gambar: ' + err.message);
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleOpenCrop = () => {
    if (!formData.imageUrl) return;
    setCropModal({
      isOpen: true,
      imageSrc: formData.imageUrl
    });
  };

  const handleCropComplete = (croppedDataUrl) => {
    setFormData((prev) => ({ ...prev, imageUrl: croppedDataUrl }));
    toast.success('Foto dokumentasi event berhasil dipotong & disesuaikan!');
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Nama Event/Kegiatan wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await api.updateEvent(editingItem.id, formData).catch(() => null);
        toast.success('Event berhasil diperbarui.');
        const updatedList = events.map((ev) =>
          ev.id === editingItem.id ? { ...ev, ...formData } : ev
        );
        setEvents(updatedList);
        syncCache(updatedList);
        await publishUpdate({
          section: 'Event & Kegiatan',
          sectionKey: 'events',
          action: 'Update',
          details: formData.title,
          patch: { events: updatedList }
        });
        setIsFormOpen(false);
      } else {
        const res = await api.createEvent(formData).catch(() => null);
        const newItem = res?.data || {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        toast.success('Event baru berhasil ditambahkan.');
        const newList = [...events, newItem];
        setEvents(newList);
        syncCache(newList);
        await publishUpdate({
          section: 'Event & Kegiatan',
          sectionKey: 'events',
          action: 'Tambah',
          details: formData.title,
          patch: { events: newList }
        });
        setIsFormOpen(false);
      }
      loadEvents();
    } catch (err) {
      toast.error('Gagal menyimpan event: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const newStatus = !item.isVisible;
      await api.toggleEventVisibility(item.id, newStatus).catch(() => null);
      const updatedList = events.map((e) =>
        e.id === item.id ? { ...e, isVisible: newStatus } : e
      );
      setEvents(updatedList);
      syncCache(updatedList);
      toast.success(`Event ${newStatus ? 'ditampilkan' : 'disembunyikan'}.`);
      await publishUpdate({
        section: 'Event & Kegiatan',
        sectionKey: 'events',
        action: 'Update',
        details: `${item.title} — ${newStatus ? 'ditampilkan' : 'disembunyikan'}`,
        patch: { events: updatedList }
      });
    } catch (err) {
      toast.error('Gagal mengubah status: ' + err.message);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const newItems = [...events];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    const finalItems = newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    setEvents(finalItems);
    syncCache(finalItems);

    try {
      await api.reorderEvents(payload);
      toast.success('Urutan event berhasil diperbarui.');
      await publishUpdate({
        section: 'Event & Kegiatan',
        sectionKey: 'events',
        action: 'Update',
        details: 'Urutan tampilan',
        patch: { events: finalItems }
      });
    } catch (err) {
      toast.error('Gagal memperbarui urutan: ' + err.message);
      loadEvents();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteEvent(deleteTarget.id);
      if (res && res.success) {
        toast.success('Event berhasil dihapus.');
        const remaining = events.filter((e) => e.id !== deleteTarget.id);
        setEvents(remaining);
        syncCache(remaining);
        await publishUpdate({
          section: 'Event & Kegiatan',
          sectionKey: 'events',
          action: 'Hapus',
          details: deleteTarget.title,
          patch: { events: remaining }
        });
        setDeleteTarget(null);
        await loadEvents();
      } else {
        throw new Error(res?.message || 'Gagal menghapus event dari server.');
      }
    } catch (err) {
      toast.error('Gagal menghapus event: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.organizer && item.organizer.toLowerCase().includes(query)) ||
      (item.role && item.role.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Event & Kegiatan
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Kelola rekam jejak kepanitiaan, workshop, seminar, kompetisi, dan kegiatan yang pernah diikuti.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event / Kegiatan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FBEFE9] p-4 rounded-2xl border border-[rgba(23,23,23,0.06)] flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#5F5A57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari event, penyelenggara, lokasi..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[rgba(23,23,23,0.08)] text-xs sm:text-sm focus:border-[#E66F52] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#5F5A57] font-medium hidden sm:block">
          Total: {events.length} kegiatan
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
          <p className="text-sm text-[#5F5A57]">Memuat daftar event...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="Belum ada event atau kegiatan"
          description="Tambahkan kegiatan, seminar, lomba, atau workshop yang pernah Anda ikuti."
          icon={Calendar}
          actionLabel="Add Event / Kegiatan"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[26px] bg-[#FBEFE9] border p-5 flex flex-col justify-between transition-all duration-200 ${
                item.isVisible
                  ? 'border-[rgba(23,23,23,0.08)] hover:bg-white shadow-2xs hover:shadow-subtle'
                  : 'border-stone-200 opacity-65 bg-stone-50'
              }`}
            >
              <div>
                {/* Event Photo Preview */}
                {item.imageUrl ? (
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 bg-white border border-[rgba(23,23,23,0.06)] relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.role && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#E66F52] text-white shadow-xs">
                        {item.role}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-2xl bg-white border border-dashed border-[rgba(23,23,23,0.1)] flex items-center justify-center text-[#5F5A57] text-xs mb-4">
                    <ImageIcon className="w-5 h-5 mr-1 text-[#5F5A57]/60" />
                    <span>Tidak ada foto</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[#171717] line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-[#5F5A57] hover:bg-black/5 disabled:opacity-20 cursor-pointer"
                      title="Naikkan urutan"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === filteredEvents.length - 1}
                      className="p-1 rounded text-[#5F5A57] hover:bg-black/5 disabled:opacity-20 cursor-pointer"
                      title="Turunkan urutan"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.organizer && (
                  <p className="text-xs font-medium text-[#E66F52] mb-1.5">{item.organizer}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5F5A57] mb-3">
                  {(item.date || item.period) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#5F5A57]" />
                      <span>{item.date || item.period}</span>
                    </span>
                  )}
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5F5A57]" />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-[#5F5A57] line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}

                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E66F52] hover:underline"
                  >
                    <span>Link Kegiatan / Dokumentasi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#5F5A57]">#{item.displayOrder}</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge
                    isVisible={item.isVisible}
                    onClick={() => handleToggleVisibility(item)}
                  />
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
                    title="Edit event"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,23,23,0.08)] mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#171717]">
                  {editingItem ? 'Edit Event / Kegiatan' : 'Tambah Event / Kegiatan'}
                </h2>
                <p className="text-xs text-[#5F5A57]">
                  Lengkapi data kegiatan untuk portofolio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-[#5F5A57] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Nama Event / Kegiatan *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: GDG DevFest Semarang 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Penyelenggara / Organisasi
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Contoh: Google Developer Groups"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Peran / Status Anda
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Contoh: Peserta, Juara 1, Pembicara, Panitia"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Waktu / Periode
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Contoh: 15 Okt 2026 atau 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Semarang, Indonesia / Online"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              {/* Foto Dokumentasi dengan Direct Upload & Crop */}
              <div className="p-4 rounded-2xl bg-white/70 border border-[rgba(23,23,23,0.08)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Foto Dokumentasi Event
                  </label>
                  <span className="text-[11px] text-[#5F5A57]">Format JPG, PNG, WebP (Rasio 16:9 ideal)</span>
                </div>

                {isProcessingImg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E66F52]/10 text-[#E66F52] text-xs font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang memproses & mengoptimalkan foto event...</span>
                  </div>
                )}

                {formData.imageUrl ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-white rounded-xl border border-[rgba(23,23,23,0.06)] shadow-2xs">
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 relative group">
                      <img src={formData.imageUrl} alt="Event Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>

                    <div className="space-y-2 flex-grow">
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto dokumentasi event siap ditampilkan di website</span>
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-[rgba(23,23,23,0.12)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs transition-all">
                          <Upload className="w-3 h-3 text-[#E66F52]" />
                          <span>Ganti Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleImageFileSelect(e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenCrop}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-[rgba(23,23,23,0.12)] text-xs font-medium text-[#171717] shadow-2xs transition-all cursor-pointer"
                        >
                          <CropIcon className="w-3 h-3 text-[#E66F52]" />
                          <span>Sesuaikan & Potong (Crop)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="text-xs text-red-600 hover:underline px-2 py-1"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-[#E66F52]/40 hover:border-[#E66F52] bg-white/60 hover:bg-white text-center cursor-pointer transition-all group">
                      <div className="w-10 h-10 rounded-full bg-[#E66F52]/10 text-[#E66F52] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-[#171717]">
                        Klik untuk upload foto dokumentasi kegiatan
                      </span>
                      <span className="text-[11px] text-[#5F5A57] mt-0.5">
                        Otomatis dikompres & dioptimalkan agar ringan dan jernih
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleImageFileSelect(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5F5A57] whitespace-nowrap">Atau URL Gambar:</span>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="flex-grow px-3 py-1.5 rounded-lg bg-white border border-[rgba(23,23,23,0.1)] text-xs focus:border-[#E66F52] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ceritakan pengalaman, wawasan, atau pencapaian yang diperoleh dari kegiatan ini..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Link Dokumentasi / Berita / Website (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
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

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="eventIsVisible"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E66F52] focus:ring-[#E66F52] accent-[#E66F52]"
                  />
                  <label htmlFor="eventIsVisible" className="text-xs font-medium text-[#171717] cursor-pointer">
                    Tampilkan di Website
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(23,23,23,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[rgba(23,23,23,0.12)] text-xs font-medium text-[#171717] hover:bg-black/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs font-semibold shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Event / Kegiatan?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Event"
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Image Crop Modal for Event Documentation */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal({ isOpen: false, imageSrc: '' })}
        imageSrc={cropModal.imageSrc}
        title="Sesuaikan & Crop Foto Event"
        initialAspect={1.777} // 16:9
        circular={false}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
