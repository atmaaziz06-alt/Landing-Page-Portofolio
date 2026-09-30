// src/admin/pages/CertificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ImageCropModal from '../components/ImageCropModal';
import { usePortfolioData } from '../../context/PortfolioDataContext';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Upload,
  Search,
  ExternalLink,
  Calendar,
  FileCheck,
  CheckCircle2,
  Eye,
  Crop as CropIcon,
  Image as ImageIcon
} from 'lucide-react';

export default function CertificationsPage() {
  const toast = useToast();
  const portfolioData = usePortfolioData();

  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview certificate image modal
  const [previewCert, setPreviewCert] = useState(null);

  // Crop modal state
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    imageUrl: '',
    category: 'Desain Grafis',
    description: '',
    displayOrder: 1,
    isVisible: true
  });

  const categories = ['Desain Grafis', 'Artificial Intelligence', 'UI/UX Design', 'Web Development', 'Digital Marketing', 'General'];

  const loadCertifications = async () => {
    try {
      const res = await api.getCertifications(true);
      if (res.success && res.data) {
        setCertifications(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat sertifikasi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      issuer: '',
      issueDate: new Date().getFullYear().toString(),
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      imageUrl: '',
      category: 'Desain Grafis',
      description: '',
      displayOrder: certifications.length + 1,
      isVisible: true
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      issuer: item.issuer || '',
      issueDate: item.issueDate || '',
      expiryDate: item.expiryDate || '',
      credentialId: item.credentialId || '',
      credentialUrl: item.credentialUrl || '',
      imageUrl: item.imageUrl || '',
      category: item.category || 'Desain Grafis',
      description: item.description || '',
      displayOrder: item.displayOrder,
      isVisible: item.isVisible
    });
    setIsFormOpen(true);
  };

  const handleImageFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar sertifikat (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropModal({
        isOpen: true,
        imageSrc: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedDataUrl) => {
    setFormData((prev) => ({ ...prev, imageUrl: croppedDataUrl }));
    toast.success('Foto sertifikat berhasil dipotong & disesuaikan!');
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Nama sertifikasi wajib diisi.');
      return;
    }
    if (!formData.issuer.trim()) {
      toast.error('Penerbit sertifikasi wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const res = await api.updateCertification(editingItem.id, formData);
        if (res.success) {
          toast.success('Sertifikasi berhasil diperbarui.');
          loadCertifications();
          if (portfolioData?.refreshData) portfolioData.refreshData();
          setIsFormOpen(false);
        }
      } else {
        const res = await api.createCertification(formData);
        if (res.success) {
          toast.success('Sertifikasi baru berhasil ditambahkan.');
          loadCertifications();
          if (portfolioData?.refreshData) portfolioData.refreshData();
          setIsFormOpen(false);
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan sertifikasi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const newStatus = !item.isVisible;
      await api.toggleCertificationVisibility(item.id, newStatus);
      setCertifications((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, isVisible: newStatus } : c))
      );
      toast.success(`Sertifikasi ${newStatus ? 'ditampilkan' : 'disembunyikan'}.`);
      if (portfolioData?.refreshData) portfolioData.refreshData();
    } catch (err) {
      toast.error('Gagal mengubah status: ' + err.message);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= certifications.length) return;

    const newItems = [...certifications];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    setCertifications(newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));

    try {
      await api.reorderCertifications(payload);
      toast.success('Urutan sertifikasi berhasil diperbarui.');
    } catch (err) {
      toast.error('Gagal memperbarui urutan: ' + err.message);
      loadCertifications();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteCertification(deleteTarget.id);
      toast.success('Sertifikasi berhasil dihapus.');
      loadCertifications();
      if (portfolioData?.refreshData) portfolioData.refreshData();
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Gagal menghapus sertifikasi: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCerts = certifications.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.issuer && item.issuer.toLowerCase().includes(query)) ||
      (item.credentialId && item.credentialId.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Sertifikasi & Lisensi
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Upload sertifikat keahlian, nomor lisensi, kredensial resmi, dan bukti kompetensi profesional.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sertifikasi</span>
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
            placeholder="Cari sertifikasi, penerbit, nomor ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[rgba(23,23,23,0.08)] text-xs sm:text-sm focus:border-[#E66F52] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#5F5A57] font-medium hidden sm:block">
          Total: {certifications.length} sertifikat
        </div>
      </div>

      {/* Certifications Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
          <p className="text-sm text-[#5F5A57]">Memuat daftar sertifikasi...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <EmptyState
          title="Belum ada sertifikasi"
          description="Unggah bukti sertifikat atau lisensi kursus dan pelatihan Anda."
          icon={Award}
          actionLabel="Add Sertifikasi"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCerts.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[26px] bg-[#FBEFE9] border p-5 flex flex-col justify-between transition-all duration-200 ${
                item.isVisible
                  ? 'border-[rgba(23,23,23,0.08)] hover:bg-white shadow-2xs hover:shadow-subtle'
                  : 'border-stone-200 opacity-65 bg-stone-50'
              }`}
            >
              <div>
                {/* Certificate Image Preview */}
                {item.imageUrl ? (
                  <div
                    onClick={() => setPreviewCert(item)}
                    className="w-full h-40 rounded-2xl overflow-hidden mb-4 bg-white border border-[rgba(23,23,23,0.08)] cursor-pointer relative group shadow-2xs"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Lihat Sertifikat</span>
                    </div>
                    {item.category && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#171717] text-white shadow-xs">
                        {item.category}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-2xl bg-white border border-dashed border-[rgba(23,23,23,0.1)] flex items-center justify-center text-[#5F5A57] text-xs mb-4">
                    <Award className="w-5 h-5 mr-1 text-[#E66F52]" />
                    <span>Tidak ada foto sertifikat</span>
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
                      disabled={index === filteredCerts.length - 1}
                      className="p-1 rounded text-[#5F5A57] hover:bg-black/5 disabled:opacity-20 cursor-pointer"
                      title="Turunkan urutan"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E66F52] mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.issuer}</span>
                </div>

                <div className="space-y-1 text-[11px] text-[#5F5A57] mb-3">
                  {item.issueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#5F5A57]" />
                      <span>Terbit: {item.issueDate}</span>
                      {item.expiryDate && <span>(Berlaku s/d: {item.expiryDate})</span>}
                    </div>
                  )}

                  {item.credentialId && (
                    <div className="flex items-center gap-1 font-mono text-[10px] text-[#5F5A57]/90 truncate">
                      <FileCheck className="w-3 h-3 flex-shrink-0 text-[#E66F52]" />
                      <span className="truncate">ID: {item.credentialId}</span>
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-[#5F5A57] line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}

                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E66F52] hover:underline"
                  >
                    <span>Verifikasi Kredensial Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Bottom Actions */}
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
                    title="Edit sertifikat"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus sertifikat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT CERTIFICATION MODAL */}
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
                  {editingItem ? 'Edit Sertifikasi' : 'Tambah Sertifikasi Baru'}
                </h2>
                <p className="text-xs text-[#5F5A57]">
                  Lengkapi data sertifikat keahlian dan lisensi kompetensi.
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
                  Nama Sertifikasi / Lisensi *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Google Certified Professional UX Designer"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Penerbit / Organisasi (Issuer) *
                  </label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="Contoh: Google / Coursera / Dicoding"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Bidang / Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Tanggal Perolehan (Issue Date)
                  </label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    placeholder="Contoh: Agustus 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Masa Berlaku (Expiry Date - Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    placeholder="Contoh: Tidak ada masa kedaluwarsa"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload Foto Sertifikat dengan Crop */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Foto / Gambar Sertifikat
                </label>
                <div className="flex items-center gap-3">
                  {formData.imageUrl && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-white shadow-2xs bg-white flex-shrink-0">
                      <img src={formData.imageUrl} alt="Cert Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs hover:shadow-xs transition-all">
                    <Upload className="w-3.5 h-3.5 text-[#E66F52]" />
                    <span>{formData.imageUrl ? 'Ganti & Crop Foto Sertifikat' : 'Upload & Crop Sertifikat'}</span>
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
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#5F5A57] mt-1">Rasio 4:3 standar sertifikat disesuaikan otomatis dengan fitur crop.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Credential ID / Nomor Sertifikat
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="Contoh: CERT-9281-XYZ"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Link Verifikasi (Credential URL)
                  </label>
                  <input
                    type="url"
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    placeholder="https://coursera.org/verify/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deskripsi / Keterampilan yang Diuji
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ringkasan materi atau kompetensi yang dikuasai melalui sertifikasi ini..."
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
                    id="certIsVisible"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E66F52] focus:ring-[#E66F52] accent-[#E66F52]"
                  />
                  <label htmlFor="certIsVisible" className="text-xs font-medium text-[#171717] cursor-pointer">
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
                  {isSaving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Sertifikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Certificate Image Lightbox Modal */}
      {previewCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewCert(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.08)]">
              <div>
                <h3 className="font-semibold text-base text-[#171717]">{previewCert.title}</h3>
                <p className="text-xs text-[#E66F52] font-medium">{previewCert.issuer}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[#5F5A57]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 flex justify-center max-h-[75vh] overflow-auto">
              <img
                src={previewCert.imageUrl}
                alt={previewCert.title}
                className="max-h-[70vh] rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Sertifikasi?"
        message={`Apakah Anda yakin ingin menghapus sertifikat "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Sertifikat"
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Image Crop Modal for Certificate */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal({ isOpen: false, imageSrc: '' })}
        imageSrc={cropModal.imageSrc}
        title="Sesuaikan & Crop Gambar Sertifikat"
        initialAspect={1.333} // 4:3
        circular={false}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
