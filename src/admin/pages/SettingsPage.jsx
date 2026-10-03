// src/admin/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePortfolioData } from '../../context/PortfolioDataContext';
import {
  Settings,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  Search,
  Globe,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const toast = useToast();
  const { publishUpdate } = usePortfolioData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  // Settings form
  const [settingsData, setSettingsData] = useState({
    siteTitle: '',
    brandName: '',
    siteDescription: '',
    footerBrand: '',
    footerCopyright: '',
    footerNote: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: ''
  });

  // Password form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setSettingsData(res.data);
        }
      } catch (err) {
        toast.error('Gagal memuat pengaturan situs: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await api.updateSettings(settingsData);
      if (res.success) {
        toast.success('Pengaturan situs & SEO berhasil diperbarui!');
        await publishUpdate({
          section: 'Site Settings',
          sectionKey: 'settings',
          action: 'Update',
          details: settingsData.siteTitle || 'SEO & footer',
          patch: { settings: settingsData }
        });
      }
    } catch (err) {
      toast.error('Gagal memperbarui pengaturan: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleOgImageUpload = async (file) => {
    if (!file) return;
    setUploadingOg(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setSettingsData((prev) => ({ ...prev, ogImage: res.url }));
        toast.success('Foto OG / Social Preview berhasil diunggah.');
      }
    } catch (err) {
      toast.error('Gagal mengunggah foto: ' + err.message);
    } finally {
      setUploadingOg(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword || !passData.newPassword) {
      toast.error('Kata sandi saat ini dan kata sandi baru wajib diisi.');
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.changePassword(passData.currentPassword, passData.newPassword);
      if (res.success) {
        toast.success('Kata sandi admin berhasil diperbarui.');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error('Gagal mengubah kata sandi: ' + err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
        <p className="text-sm text-[#5F5A57]">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
          Site & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
          Konfigurasi nama website, identitas brand, footer copyright, metadata SEO, serta ganti kata sandi admin.
        </p>
      </div>

      {/* 1. General & SEO Settings */}
      <form onSubmit={handleSaveSettings} className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.06)]">
          <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#E66F52]" />
            <span>Identitas Situs, Footer & SEO Metadata</span>
          </h2>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 hover-lift"
          >
            {isSavingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Judul Website (Browser Tab Title)
            </label>
            <input
              type="text"
              name="siteTitle"
              value={settingsData.siteTitle}
              onChange={handleSettingsChange}
              placeholder="Raditya Atma Aziz — Graphic Designer & Web Designer"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Nama Brand / Logo Teks
            </label>
            <input
              type="text"
              name="brandName"
              value={settingsData.brandName}
              onChange={handleSettingsChange}
              placeholder="Vezta Studio"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Deskripsi Singkat Situs (Meta Description)
            </label>
            <textarea
              name="siteDescription"
              rows={2}
              value={settingsData.siteDescription}
              onChange={handleSettingsChange}
              placeholder="Deskripsi untuk ringkasan di mesin pencari..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Teks Copyright Footer
            </label>
            <input
              type="text"
              name="footerCopyright"
              value={settingsData.footerCopyright}
              onChange={handleSettingsChange}
              placeholder="Vezta Studio. All rights reserved."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Teks Catatan Footer
            </label>
            <input
              type="text"
              name="footerNote"
              value={settingsData.footerNote}
              onChange={handleSettingsChange}
              placeholder="Designed & built with intention."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>
        </div>

        {/* SEO Section */}
        <div className="pt-4 border-t border-[rgba(23,23,23,0.06)] space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5F5A57] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#E66F52]" />
            <span>Search Engine Optimization (SEO) & Social Sharing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={settingsData.seoTitle}
                onChange={handleSettingsChange}
                placeholder="Raditya Atma Aziz Portfolio"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                SEO Keywords (Pisahkan koma)
              </label>
              <input
                type="text"
                name="seoKeywords"
                value={settingsData.seoKeywords}
                onChange={handleSettingsChange}
                placeholder="graphic design, UI/UX, AI video, web designer"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Social Preview / Open Graph (OG) Image URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="ogImage"
                  value={settingsData.ogImage}
                  onChange={handleSettingsChange}
                  placeholder="/assets/images/user-portrait.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
                <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-white/80 border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs whitespace-nowrap">
                  {uploadingOg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#E66F52]" />}
                  <span>{uploadingOg ? 'Upload...' : 'Upload OG'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleOgImageUpload(e.target.files?.[0])}
                    disabled={uploadingOg}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* 2. Change Admin Password Section */}
      <form onSubmit={handleChangePassword} className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.06)]">
          <div>
            <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E66F52]" />
              <span>Ganti Kata Sandi Admin</span>
            </h2>
            <p className="text-xs text-[#5F5A57]">
              Pastikan gunakan kombinasi kata sandi yang kuat untuk keamanan sistem.
            </p>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#171717] hover:bg-black text-white text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 hover-lift"
          >
            {isChangingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isChangingPass ? 'Memperbarui...' : 'Perbarui Sandi'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Kata Sandi Baru (Min. 6 Karakter)
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="inline-flex items-center gap-1.5 text-xs text-[#5F5A57] hover:text-[#171717] cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
