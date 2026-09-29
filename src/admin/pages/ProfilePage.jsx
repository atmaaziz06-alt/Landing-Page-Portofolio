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
  Image as ImageIcon
} from 'lucide-react';

export default function ProfilePage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

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
        if (res.success && res.data) {
          setFormData({
            ...res.data,
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

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingAbout(true);

    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        if (isAvatar) {
          setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
        } else {
          setFormData((prev) => ({ ...prev, aboutImageUrl: res.url }));
        }
        toast.success(`Foto ${isAvatar ? 'avatar' : 'about'} berhasil diunggah.`);
      }
    } catch (err) {
      toast.error('Gagal mengunggah foto: ' + err.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false);
      else setUploadingAbout(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const res = await api.updateProfile(formData);
      if (res.success) {
        toast.success('Profil berhasil diperbarui dan tersimpan di database!');
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
                Foto Hero Portrait (Bulat)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[#F6E7DF] flex-shrink-0">
                  <img
                    src={formData.avatarUrl || '/assets/images/user-portrait.png'}
                    alt="Hero Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/images/user-portrait.png'; }}
                  />
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-white/80 border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs hover:shadow-xs transition-all">
                    {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#E66F52]" />}
                    <span>{uploadingAvatar ? 'Mengunggah...' : 'Ganti Foto Hero'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], 'avatar')}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <p className="text-[11px] text-[#5F5A57] mt-1.5">Format JPG/PNG/WebP, rasio 1:1.</p>
                </div>
              </div>
            </div>

            {/* About Section Image */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-2">
                Foto Bagian About (Tegak)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-[#F6E7DF] flex-shrink-0">
                  <img
                    src={formData.aboutImageUrl || '/assets/images/about-user.jpg'}
                    alt="About Portrait"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/images/about-user.jpg'; }}
                  />
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-white/80 border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs hover:shadow-xs transition-all">
                    {uploadingAbout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#E66F52]" />}
                    <span>{uploadingAbout ? 'Mengunggah...' : 'Ganti Foto About'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], 'about')}
                      disabled={uploadingAbout}
                    />
                  </label>
                  <p className="text-[11px] text-[#5F5A57] mt-1.5">Format JPG/PNG/WebP, rasio 4:5.</p>
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
    </div>
  );
}
