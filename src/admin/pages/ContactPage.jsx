// src/admin/pages/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePortfolioData } from '../../context/PortfolioDataContext';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  Save,
  Share2,
  X,
  ExternalLink
} from 'lucide-react';

export default function ContactPage() {
  const toast = useToast();
  const { publishUpdate } = usePortfolioData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Contact & CTA form data
  const [contactData, setContactData] = useState({
    ctaTitle: '',
    ctaDescription: '',
    email: '',
    phone: '',
    whatsapp: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    secondaryBtnText: '',
    secondaryBtnLink: ''
  });

  // Socials list
  const [socials, setSocials] = useState([]);

  // Social Modal States
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);
  const [socialFormData, setSocialFormData] = useState({
    name: '',
    url: '',
    username: '',
    displayOrder: 1,
    isVisible: true
  });
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  // Delete Social State
  const [deleteSocialTarget, setDeleteSocialTarget] = useState(null);
  const [isDeletingSocial, setIsDeletingSocial] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.getContact(true);
      if (res.success && res.data) {
        if (res.data.contact) setContactData(res.data.contact);
        if (res.data.socials) setSocials(res.data.socials);
      }
    } catch (err) {
      toast.error('Gagal memuat data kontak: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contactData.email.trim()) {
      toast.error('Alamat email wajib diisi.');
      return;
    }

    setIsSavingContact(true);
    try {
      const res = await api.updateContact(contactData);
      if (res.success) {
        toast.success('Pengaturan kontak & CTA berhasil diperbarui!');
        await publishUpdate({
          section: 'Contact / CTA',
          sectionKey: 'contact',
          action: 'Update',
          details: 'Teks CTA, email, dan tombol',
          patch: { contact: contactData }
        });
      }
    } catch (err) {
      toast.error('Gagal menyimpan kontak: ' + err.message);
    } finally {
      setIsSavingContact(false);
    }
  };

  // Socials Handlers
  const openAddSocialModal = () => {
    setEditingSocial(null);
    setSocialFormData({
      name: '',
      url: '',
      username: '',
      displayOrder: socials.length + 1,
      isVisible: true
    });
    setIsSocialModalOpen(true);
  };

  const openEditSocialModal = (soc) => {
    setEditingSocial(soc);
    setSocialFormData({
      name: soc.name,
      url: soc.url,
      username: soc.username || '',
      displayOrder: soc.displayOrder ?? 1,
      isVisible: soc.isVisible
    });
    setIsSocialModalOpen(true);
  };

  const handleToggleSocialVisibility = async (soc) => {
    const nextState = !soc.isVisible;
    try {
      const res = await api.toggleSocialVisibility(soc.id, nextState);
      if (res.success) {
        setSocials((prev) =>
          prev.map((s) => (s.id === soc.id ? { ...s, isVisible: nextState } : s))
        );
        toast.success(res.message);
        const nextList = socials.map((s) => (s.id === soc.id ? { ...s, isVisible: nextState } : s));
        await publishUpdate({
          section: 'Contact / Sosial',
          sectionKey: 'contact',
          action: 'Update',
          details: `${soc.name} — ${nextState ? 'ditampilkan' : 'disembunyikan'}`,
          patch: { socials: nextList }
        });
      }
    } catch (err) {
      toast.error('Gagal mengubah visibilitas social link: ' + err.message);
    }
  };

  const handleMoveSocialOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= socials.length) return;

    const newItems = [...socials];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    const ordered = newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    setSocials(ordered);

    try {
      await api.reorderSocials(payload);
      toast.success('Urutan social link berhasil diperbarui.');
      await publishUpdate({
        section: 'Contact / Sosial',
        sectionKey: 'contact',
        action: 'Update',
        details: 'Urutan social link',
        patch: { socials: ordered }
      });
    } catch (err) {
      toast.error('Gagal memperbarui urutan: ' + err.message);
      loadData();
    }
  };

  const handleSaveSocial = async (e) => {
    e.preventDefault();
    if (!socialFormData.name.trim() || !socialFormData.url.trim()) {
      toast.error('Nama platform dan URL wajib diisi.');
      return;
    }

    setIsSavingSocial(true);
    try {
      if (editingSocial) {
        const res = await api.updateSocial(editingSocial.id, socialFormData);
        if (res.success) {
          toast.success('Social link berhasil diperbarui.');
          setIsSocialModalOpen(false);
          await loadData();
          await publishUpdate({
            section: 'Contact / Sosial',
            sectionKey: 'contact',
            action: 'Update',
            details: socialFormData.name
          });
        }
      } else {
        const res = await api.createSocial(socialFormData);
        if (res.success) {
          toast.success('Social link baru berhasil ditambahkan.');
          setIsSocialModalOpen(false);
          await loadData();
          await publishUpdate({
            section: 'Contact / Sosial',
            sectionKey: 'contact',
            action: 'Tambah',
            details: socialFormData.name
          });
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan social link: ' + err.message);
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleDeleteSocialConfirm = async () => {
    if (!deleteSocialTarget) return;
    setIsDeletingSocial(true);
    try {
      const res = await api.deleteSocial(deleteSocialTarget.id);
      if (res.success) {
        toast.success(res.message);
        const remaining = socials.filter((s) => s.id !== deleteSocialTarget.id);
        setSocials(remaining);
        setDeleteSocialTarget(null);
        await publishUpdate({
          section: 'Contact / Sosial',
          sectionKey: 'contact',
          action: 'Hapus',
          details: deleteSocialTarget.name,
          patch: { socials: remaining }
        });
      }
    } catch (err) {
      toast.error('Gagal menghapus social link: ' + err.message);
    } finally {
      setIsDeletingSocial(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
        <p className="text-sm text-[#5F5A57]">Memuat pengaturan kontak...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
          Contact & CTA Management
        </h1>
        <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
          Kelola teks ajakan aksi (CTA), email, WhatsApp, serta tautan jejaring sosial media Anda.
        </p>
      </div>

      {/* 1. CTA & Direct Contact Form */}
      <form onSubmit={handleSaveContact} className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.06)]">
          <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#E66F52]" />
            <span>Bagian CTA & Informasi Kontak Utama</span>
          </h2>

          <button
            type="submit"
            disabled={isSavingContact}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 hover-lift"
          >
            {isSavingContact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingContact ? 'Menyimpan...' : 'Simpan CTA'}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Judul CTA (Headline)
            </label>
            <input
              type="text"
              name="ctaTitle"
              value={contactData.ctaTitle}
              onChange={handleContactChange}
              placeholder="Have a project in mind? Let's create something iconic."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Deskripsi CTA
            </label>
            <textarea
              name="ctaDescription"
              rows={3}
              value={contactData.ctaDescription}
              onChange={handleContactChange}
              placeholder="Jelaskan ketersediaan Anda untuk proyek baru..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Alamat Email *
              </label>
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleContactChange}
                placeholder="atmaaziz06@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Nomor WhatsApp (Angka saja)
              </label>
              <input
                type="text"
                name="whatsapp"
                value={contactData.whatsapp}
                onChange={handleContactChange}
                placeholder="6287762798586"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Nomor Telepon Tampil
              </label>
              <input
                type="text"
                name="phone"
                value={contactData.phone}
                onChange={handleContactChange}
                placeholder="+62-877-6279-8586"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Teks Tombol Utama (Primary)
              </label>
              <input
                type="text"
                name="primaryBtnText"
                value={contactData.primaryBtnText}
                onChange={handleContactChange}
                placeholder="Start a conversation"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Link Tombol Utama
              </label>
              <input
                type="text"
                name="primaryBtnLink"
                value={contactData.primaryBtnLink}
                onChange={handleContactChange}
                placeholder="#contact atau link WA"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Teks Tombol Kedua (Secondary)
              </label>
              <input
                type="text"
                name="secondaryBtnText"
                value={contactData.secondaryBtnText}
                onChange={handleContactChange}
                placeholder="Email me directly"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Link Tombol Kedua
              </label>
              <input
                type="text"
                name="secondaryBtnLink"
                value={contactData.secondaryBtnLink}
                onChange={handleContactChange}
                placeholder="mailto:atmaaziz06@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. Social Media Management Section */}
      <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.06)]">
          <div>
            <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#E66F52]" />
              <span>Social Media Channels</span>
            </h2>
            <p className="text-xs text-[#5F5A57]">
              Kelola tautan LinkedIn, GitHub, Instagram, Behance, Dribbble, dsb.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddSocialModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FBEFE9] border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] shadow-2xs transition-colors cursor-pointer hover-lift"
          >
            <Plus className="w-3.5 h-3.5 text-[#E66F52]" />
            <span>Add Social Link</span>
          </button>
        </div>

        {socials.length === 0 ? (
          <EmptyState
            title="Belum ada social media"
            description="Tambahkan akun media sosial Anda."
            icon={Share2}
            actionLabel="Add Social Link"
            onAction={openAddSocialModal}
          />
        ) : (
          <div className="divide-y divide-[rgba(23,23,23,0.06)]">
            {socials.map((soc, index) => (
              <div
                key={soc.id}
                className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !soc.isVisible ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveSocialOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 rounded text-[#5F5A57] hover:text-[#171717] disabled:opacity-30"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSocialOrder(index, 'down')}
                      disabled={index === socials.length - 1}
                      className="p-0.5 rounded text-[#5F5A57] hover:text-[#171717] disabled:opacity-30"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-white border border-[rgba(23,23,23,0.06)] flex items-center justify-center font-bold text-xs text-[#E66F52] shadow-2xs">
                    {soc.name[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#171717]">{soc.name}</span>
                      {soc.username && (
                        <span className="text-xs text-[#5F5A57]">({soc.username})</span>
                      )}
                    </div>
                    <a
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#5F5A57] hover:text-[#E66F52] flex items-center gap-1 mt-0.5 truncate max-w-sm"
                    >
                      <span className="truncate">{soc.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <StatusBadge
                    isVisible={soc.isVisible}
                    onClick={() => handleToggleSocialVisibility(soc)}
                  />

                  <button
                    type="button"
                    onClick={() => openEditSocialModal(soc)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteSocialTarget(soc)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT SOCIAL MODAL */}
      {isSocialModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSocialModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.06)] mb-5">
              <h2 className="text-lg font-semibold text-[#171717]">
                {editingSocial ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              <button
                type="button"
                onClick={() => setIsSocialModalOpen(false)}
                className="p-1 rounded-lg text-[#5F5A57] hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSocial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Platform *
                </label>
                <input
                  type="text"
                  value={socialFormData.name}
                  onChange={(e) => setSocialFormData({ ...socialFormData, name: e.target.value })}
                  placeholder="LinkedIn, Instagram, GitHub, Behance, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Username / Label
                </label>
                <input
                  type="text"
                  value={socialFormData.username}
                  onChange={(e) => setSocialFormData({ ...socialFormData, username: e.target.value })}
                  placeholder="@atma_zyies atau Raditya Atma Aziz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  URL Profile *
                </label>
                <input
                  type="url"
                  value={socialFormData.url}
                  onChange={(e) => setSocialFormData({ ...socialFormData, url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={socialFormData.displayOrder}
                    onChange={(e) => setSocialFormData({ ...socialFormData, displayOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Visibilitas
                  </label>
                  <select
                    value={socialFormData.isVisible ? 'true' : 'false'}
                    onChange={(e) => setSocialFormData({ ...socialFormData, isVisible: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  >
                    <option value="true">● Visible</option>
                    <option value="false">○ Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(23,23,23,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  disabled={isSavingSocial}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#171717] hover:bg-black/5 border border-[rgba(23,23,23,0.1)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSocial}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-medium text-white bg-[#E66F52] hover:bg-[#D65F42] shadow-sm cursor-pointer disabled:opacity-50 hover-lift"
                >
                  {isSavingSocial && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSocial ? 'Simpan' : 'Tambahkan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SOCIAL CONFIRMATION */}
      <ConfirmModal
        isOpen={Boolean(deleteSocialTarget)}
        title="Hapus Social Link?"
        message={`Apakah Anda yakin ingin menghapus tautan ${deleteSocialTarget?.name}?`}
        confirmText="Hapus Link"
        cancelText="Batal"
        isLoading={isDeletingSocial}
        onConfirm={handleDeleteSocialConfirm}
        onClose={() => setDeleteSocialTarget(null)}
      />
    </div>
  );
}
