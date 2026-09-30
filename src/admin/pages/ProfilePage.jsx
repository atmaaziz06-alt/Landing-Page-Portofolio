// src/admin/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Upload,
  Save,
  Loader2,
  FileText,
  MapPin,
  Sparkles,
  Crop as CropIcon,
  Image as ImageIcon
} from 'lucide-react';
import ImageCropModal from '../components/ImageCropModal';
import { usePortfolioData } from '../../context/PortfolioDataContext';

export default function ProfilePage() {
  const toast = useToast();
  const portfolioData = usePortfolioData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: '',
    type: 'avatar',
    aspect: 1,
    circular: true,
    title: 'Sesuaikan & Crop Foto Hero Avatar'
  });

  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    monogram: '',
    eyebrow: '',
    role: '',
    location: '',
    headlinePrefix: '',
    description: '',
    bio: '',
    avatarUrl: '',
    aboutImageUrl: '',
    availability: {
      badge: '',
      statusText: '',
      period: '',
      resumeUrl: '',
      resumeLabel: ''
    }
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        let localOverride = null;
        try {
          const stored = localStorage.getItem('vezta_profile_override');
          if (stored) localOverride = JSON.parse(stored);
        } catch (_) {}

        if (res.success && res.data) {
          setFormData({
            ...res.data,
            avatarUrl: localOverride?.avatarUrl || res.data.avatarUrl || '',
            aboutImageUrl: localOverride?.aboutImageUrl || res.data.aboutImageUrl || '',
            availability: res.data.availability || {}
          });
        }
      } catch (err) {
        toast.error('Gagal memuat profil: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('avail_')) {
      const field = name.replace('avail_', '');
      setFormData((prev) => ({
        ...prev,
        availability: { ...prev.availability, [field]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (file, type) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      if (type === 'avatar') {
        setCropModal({
          isOpen: true,
          imageSrc: src,
          type: 'avatar',
          aspect: 1,
          circular: true,
          title: 'Sesuaikan & Crop Foto Hero Avatar (1:1 Bulat)'
        });
      } else {
        setCropModal({
          isOpen: true,
          imageSrc: src,
          type: 'about',
          aspect: 0.8, // 4:5
          circular: false,
          title: 'Sesuaikan & Crop Foto About Portrait (4:5)'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCropCurrent = (type) => {
    const currentSrc = type === 'avatar' 
      ? (formData.avatarUrl || '/assets/images/user-portrait.png')
      : (formData.aboutImageUrl || '/assets/images/about-user.jpg');
    
    setCropModal({
      isOpen: true,
      imageSrc: currentSrc,
      type,
      aspect: type === 'avatar' ? 1 : 0.8,
      circular: type === 'avatar',
      title: type === 'avatar' ? 'Sesuaikan & Crop Foto Hero Avatar (1:1)' : 'Sesuaikan & Crop Foto About (4:5)'
    });
  };

  const handleCropComplete = async (croppedDataUrl) => {
    const isAvatar = cropModal.type === 'avatar';
    const fieldName = isAvatar ? 'avatarUrl' : 'aboutImageUrl';
    const updatedData = {
      ...formData,
      [fieldName]: croppedDataUrl
    };
    setFormData(updatedData);

    // Save locally to guarantee persistence across serverless reboots
    try {
      const stored = localStorage.getItem('vezta_profile_override');
      const prev = stored ? JSON.parse(stored) : {};
      localStorage.setItem('vezta_profile_override', JSON.stringify({
        ...prev,
        [fieldName]: croppedDataUrl
      }));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Auto-save immediately to database
    try {
      setIsSaving(true);
      const res = await api.updateProfile(updatedData);
      if (res.success) {
        toast.success(`Foto ${isAvatar ? 'Hero Avatar' : 'About'} berhasil diperbarui & langsung tersimpan!`);
        if (portfolioData?.refreshData) {
          portfolioData.refreshData();
        }
      }
    } catch (err) {
      console.warn('Auto-save error:', err);
      toast.info('Foto berhasil disesuaikan di halaman ini. Klik "Simpan Perubahan" untuk konfirmasi manual.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama lengkap wajib diisi.');
      return;
    }
    if (!formData.role.trim()) {
      toast.error('Professional title / role wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      // Save local backup as well
      try {
        localStorage.setItem('vezta_profile_override', JSON.stringify({
          avatarUrl: formData.avatarUrl,
          aboutImageUrl: formData.aboutImageUrl
        }));
      } catch (_) {}

      const res = await api.updateProfile(formData);
      if (res.success) {
        toast.success('Profil & foto berhasil diperbarui dan tersimpan di database!');
        if (portfolioData?.refreshData) {
          portfolioData.refreshData();
        }
      }
    } catch (err) {
      toast.error('Gagal memperbarui profil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
        <p className="text-sm text-[#5F5A57]">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Profile Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Ubah identitas diri, headline hero, narasi bio, status ketersediaan, serta foto profil.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer disabled:opacity-50 hover-lift"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Photos Section */}
        <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-semibold text-[#171717] mb-5 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#E66F52]" />
            <span>Foto & Visual Profil</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Hero Avatar */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-2">
                Foto Hero Portrait (Bulat 1:1)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E66F52] shadow-sm bg-[#F6E7DF] flex-shrink-0 relative group">
                  <img
                    src={formData.avatarUrl || '/assets/images/user-portrait.png'}
                    alt="Hero Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/images/user-portrait.png'; }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs font-medium cursor-pointer shadow-xs transition-all hover-lift">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Crop Foto Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleFileSelect(e.target.files?.[0], 'avatar');
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenCropCurrent('avatar')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-neutral-50 border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] shadow-2xs transition-all cursor-pointer"
                    >
                      <CropIcon className="w-3.5 h-3.5 text-[#E66F52]" />
                      <span>Crop Ulang</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5F5A57]">Format JPG/PNG/WebP dengan rasio 1:1 bulat otomatis.</p>
                </div>
              </div>
            </div>

            {/* About Section Image */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-2">
                Foto Bagian About (Tegak 4:5)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-[#E66F52] shadow-sm bg-[#F6E7DF] flex-shrink-0 relative">
                  <img
                    src={formData.aboutImageUrl || '/assets/images/about-user.jpg'}
                    alt="About Portrait"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/images/about-user.jpg'; }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs font-medium cursor-pointer shadow-xs transition-all hover-lift">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Crop Foto Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleFileSelect(e.target.files?.[0], 'about');
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenCropCurrent('about')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-neutral-50 border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] shadow-2xs transition-all cursor-pointer"
                    >
                      <CropIcon className="w-3.5 h-3.5 text-[#E66F52]" />
                      <span>Crop Ulang</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5F5A57]">Format JPG/PNG/WebP dengan rasio 4:5 vertikal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Basic Info Section */}
        <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-[#171717] mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[#E66F52]" />
            <span>Informasi Pribadi & Headline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Professional Title / Role *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Graphic Design & Web Designer"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Brand / Studio Name
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="Vezta Studio"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Lokasi Domisili
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Semarang, Indonesia"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Deskripsi Singkat Hero
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Narasi About Me (Biografi Lengkap)
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
            />
          </div>
        </div>

        {/* 3. Availability & Resume */}
        <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-[#171717] mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E66F52]" />
            <span>Ketersediaan Proyek & Unduhan CV</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Status Badge
              </label>
              <input
                type="text"
                name="avail_badge"
                value={formData.availability.badge}
                onChange={handleChange}
                placeholder="Available for work"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Periode / Bulan Aktif
              </label>
              <input
                type="text"
                name="avail_period"
                value={formData.availability.period}
                onChange={handleChange}
                placeholder="October 2026."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Kalimat Status Ketersediaan
              </label>
              <input
                type="text"
                name="avail_statusText"
                value={formData.availability.statusText}
                onChange={handleChange}
                placeholder="I'm currently accepting new projects for"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                URL File Resume / CV
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="avail_resumeUrl"
                  value={formData.availability.resumeUrl}
                  onChange={handleChange}
                  placeholder="/assets/CV ATS Raditya Atma Aziz_Graphic Design.pdf atau link Google Drive"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] focus:border-[#E66F52] focus:outline-none focus:ring-1 focus:ring-[#E66F52]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-sm font-semibold shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer disabled:opacity-50 hover-lift"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Menyimpan ke Database...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </form>

      {/* Interactive Image Cropper Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal((prev) => ({ ...prev, isOpen: false }))}
        imageSrc={cropModal.imageSrc}
        title={cropModal.title}
        initialAspect={cropModal.aspect}
        circular={cropModal.circular}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
