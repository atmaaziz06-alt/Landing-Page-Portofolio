// src/admin/pages/ProjectsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Eye,
  Sparkles,
  Layers,
  ArrowUpRight,
  Tag,
  Check,
  Crop as CropIcon
} from 'lucide-react';
import ImageCropModal from '../components/ImageCropModal';
import { usePortfolioData } from '../../context/PortfolioDataContext';

export default function ProjectsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Preview Modal State
  const [previewProject, setPreviewProject] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'Desain Grafis',
    type: 'Visual Identity',
    year: '2026',
    image: '',
    images: [],
    description: '',
    role: '',
    client: '',
    link: '',
    linkLabel: 'Lihat Project Asli',
    servicesText: '',
    highlight: '',
    deliverables: '',
    displayOrder: 1,
    isVisible: true
  });

  const defaultCategories = ['Desain Grafis', 'Ai Video Content', 'UI/UX', 'Branding', 'Digital Marketing', 'Other'];
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('vezta_project_custom_categories');
      return saved ? JSON.parse(saved) : defaultCategories;
    } catch (_) {
      return defaultCategories;
    }
  });

  const categories = useMemo(() => {
    const set = new Set(customCategories);
    projects.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [customCategories, projects]);

  const [isAddingCategoryNav, setIsAddingCategoryNav] = useState(false);
  const [newCategoryNavName, setNewCategoryNavName] = useState('');
  const [isAddingCategoryForm, setIsAddingCategoryForm] = useState(false);
  const [newCategoryFormName, setNewCategoryFormName] = useState('');

  const handleAddCategory = (name) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (!customCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try {
        localStorage.setItem('vezta_project_custom_categories', JSON.stringify(updated));
      } catch (_) {}
      toast.success(`Kategori "${trimmed}" berhasil ditambahkan!`);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.getProjects(true);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data projects: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Quick open add modal from URL param ?action=add
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
      id: '',
      title: '',
      category: 'Desain Grafis',
      type: 'Visual Identity',
      year: new Date().getFullYear().toString(),
      image: '',
      images: [],
      description: '',
      role: 'Desainer Grafis',
      client: '',
      link: '',
      linkLabel: 'Lihat Project Asli',
      servicesText: 'Art Direction, Visual Identity, Digital Design',
      highlight: '',
      deliverables: '',
      displayOrder: projects.length + 1,
      isVisible: true
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      title: item.title,
      category: item.category || 'Desain Grafis',
      type: item.type || '',
      year: item.year || '',
      image: item.image || '',
      images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
      description: item.description || '',
      role: item.role || '',
      client: item.client || '',
      link: item.link || '',
      linkLabel: item.linkLabel || 'Lihat Project Asli',
      servicesText: Array.isArray(item.services) ? item.services.join(', ') : '',
      highlight: item.highlight || '',
      deliverables: item.deliverables || '',
      displayOrder: item.displayOrder ?? 1,
      isVisible: item.isVisible
    });
    setIsFormOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextState = !item.isVisible;
    try {
      const res = await api.toggleProjectVisibility(item.id, nextState);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, isVisible: nextState } : p))
        );
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Gagal mengubah visibilitas: ' + err.message);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newItems = [...projects];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    setProjects(newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));

    try {
      await api.reorderProjects(payload);
      toast.success('Urutan project berhasil diperbarui.');
    } catch (err) {
      toast.error('Gagal memperbarui urutan: ' + err.message);
      loadProjects();
    }
  };

  // Thumbnail file upload
  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    setUploadingThumb(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          image: res.url,
          images: prev.images.length === 0 ? [res.url] : prev.images
        }));
        toast.success('Thumbnail berhasil diunggah!');
      }
    } catch (err) {
      toast.error('Gagal mengunggah thumbnail: ' + err.message);
    } finally {
      setUploadingThumb(false);
    }
  };

  // Multi-image gallery upload
  const handleGalleryUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingGallery(true);
    try {
      const res = await api.uploadMultipleFiles(fileList);
      if (res.success && res.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.urls]
        }));
        toast.success(`${res.urls.length} gambar galeri berhasil diunggah.`);
      }
    } catch (err) {
      toast.error('Gagal mengunggah gambar galeri: ' + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul Project wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const servicesList = formData.servicesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        services: servicesList,
        images: formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : [])
      };

      if (editingItem) {
        const res = await api.updateProject(editingItem.id, payload);
        if (res.success) {
          toast.success('Project berhasil diperbarui.');
          setIsFormOpen(false);
          loadProjects();
        }
      } else {
        const res = await api.createProject(payload);
        if (res.success) {
          toast.success('Project baru berhasil ditambahkan.');
          setIsFormOpen(false);
          loadProjects();
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan project: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteProject(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error('Gagal menghapus project: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVisibility =
      filterVisibility === 'ALL'
        ? true
        : filterVisibility === 'VISIBLE'
        ? p.isVisible
        : !p.isVisible;

    const matchesCategory =
      filterCategory === 'ALL' ? true : p.category === filterCategory;

    return matchesSearch && matchesVisibility && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Project Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Kelola karya portfolio, thumbnail, galeri multi-foto, link showcase, serta urutan tampilan di public website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Filter, Search & Category Controls */}
      <div className="space-y-3 bg-[#FBEFE9] p-4 rounded-2xl border border-[rgba(23,23,23,0.06)]">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5F5A57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama project, kategori..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[rgba(23,23,23,0.08)] text-xs sm:text-sm focus:border-[#E66F52] focus:outline-none"
            />
          </div>

          {/* Visibility Status Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/80 border border-[rgba(23,23,23,0.06)] text-xs w-full sm:w-auto justify-center">
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          <span className="text-[11px] font-semibold text-[#5F5A57] uppercase tracking-wider mr-1 whitespace-nowrap">
            Kategori:
          </span>
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'ALL'
                ? 'bg-[#171717] text-white'
                : 'bg-white/80 text-[#5F5A57] hover:bg-white hover:text-[#171717]'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#E66F52] text-white shadow-2xs'
                  : 'bg-white/80 text-[#5F5A57] hover:bg-white hover:text-[#171717]'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Quick Add Custom Category Button */}
          {isAddingCategoryNav ? (
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E66F52] shadow-2xs">
              <input
                type="text"
                value={newCategoryNavName}
                onChange={(e) => setNewCategoryNavName(e.target.value)}
                placeholder="Nama kategori..."
                className="text-xs px-2 py-1 outline-none w-28 text-[#171717]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory(newCategoryNavName);
                    if (newCategoryNavName.trim()) setFilterCategory(newCategoryNavName.trim());
                    setNewCategoryNavName('');
                    setIsAddingCategoryNav(false);
                  } else if (e.key === 'Escape') {
                    setIsAddingCategoryNav(false);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  handleAddCategory(newCategoryNavName);
                  if (newCategoryNavName.trim()) setFilterCategory(newCategoryNavName.trim());
                  setNewCategoryNavName('');
                  setIsAddingCategoryNav(false);
                }}
                className="p-1 rounded-full bg-[#E66F52] text-white hover:bg-[#D65F42]"
                title="Simpan Kategori"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategoryNav(false)}
                className="p-1 rounded-full text-[#5F5A57] hover:bg-neutral-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategoryNav(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/60 hover:bg-white text-[#E66F52] border border-dashed border-[#E66F52]/60 hover:border-[#E66F52] transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3 h-3" />
              <span>+ Kategori</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
          <p className="text-sm text-[#5F5A57]">Memuat daftar project...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="Tidak ada project ditemukan"
          description={searchQuery ? 'Coba ubah kata kunci pencarian atau filter kategori.' : 'Mulai publikasikan karya pertama Anda sekarang.'}
          icon={FolderKanban}
          actionLabel="Add Project"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[26px] bg-[#FBEFE9] border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-subtle ${
                item.isVisible ? 'border-[rgba(23,23,23,0.08)] hover:bg-white' : 'border-stone-200 opacity-70 bg-stone-50'
              }`}
            >
              <div>
                {/* Thumbnail Preview Aspect Ratio */}
                <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-[#F6E7DF] mb-3 flex items-center justify-center group">
                  <img
                    src={item.image || '/assets/images/placeholder.png'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/assets/images/hero.png'; }}
                  />

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#171717] shadow-2xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Order indicator */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-black/60 text-white backdrop-blur-xs">
                      #{item.displayOrder}
                    </span>
                  </div>

                  {/* Hover Overlay with Live Preview Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewProject(item)}
                      className="px-3.5 py-1.5 rounded-full bg-white text-xs font-semibold text-[#171717] hover:bg-[#E66F52] hover:text-white transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Detail</span>
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1 px-1">
                  <h3 className="text-base sm:text-lg font-semibold text-[#171717] line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#5F5A57] line-clamp-1">{item.type || 'Portfolio Item'}</p>
                  <p className="text-xs text-[#5F5A57]/90 line-clamp-2 mt-1.5">
                    {item.description || 'Tidak ada deskripsi singkat.'}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)] flex items-center justify-between">
                {/* Move order up/down */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-md text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                    title="Pindahkan ke depan"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === filteredProjects.length - 1}
                    className="p-1 rounded-md text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                    title="Pindahkan ke belakang"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status Badge + Edit + Delete */}
                <div className="flex items-center gap-2">
                  <StatusBadge
                    isVisible={item.isVisible}
                    onClick={() => handleToggleVisibility(item)}
                  />

                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-[#171717] hover:bg-white border border-transparent hover:border-[rgba(23,23,23,0.08)] transition-colors cursor-pointer"
                    title="Edit project"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg text-[#5F5A57] hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors cursor-pointer"
                    title="Hapus project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PROJECT MODAL */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,23,23,0.08)] mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#171717]">
                  {editingItem ? 'Edit Project' : 'Add New Project'}
                </h2>
                <p className="text-xs text-[#5F5A57]">
                  Lengkapi informasi project untuk ditampilkan pada portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-[#5F5A57] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Judul Project *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Honea E-Commerce"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#171717]">
                      Kategori Project
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategoryForm(!isAddingCategoryForm)}
                      className="text-[11px] font-medium text-[#E66F52] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingCategoryForm ? 'Pilih dari List' : '+ Kategori Baru'}</span>
                    </button>
                  </div>

                  {isAddingCategoryForm ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryFormName}
                        onChange={(e) => setNewCategoryFormName(e.target.value)}
                        placeholder="Ketik kategori baru..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E66F52] text-sm focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryFormName.trim()) {
                            handleAddCategory(newCategoryFormName);
                            setFormData({ ...formData, category: newCategoryFormName.trim() });
                            setNewCategoryFormName('');
                            setIsAddingCategoryForm(false);
                          }
                        }}
                        className="px-3 py-2.5 rounded-xl bg-[#E66F52] text-white text-xs font-semibold hover:bg-[#D65F42]"
                      >
                        Pakai
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 2: Type, Year, Role, Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Sub-tipe / Bidang
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Visual Identity"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Tahun
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Peran / Role Anda
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="UI/UX Designer"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Klien / Brand
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="PT. Example"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Thumbnail Upload & Preview */}
              <div className="p-4 rounded-2xl bg-white/70 border border-[rgba(23,23,23,0.08)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Foto Thumbnail Utama
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#FBEFE9] border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs transition-colors">
                    {uploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#E66F52]" />}
                    <span>{uploadingThumb ? 'Mengunggah...' : 'Upload Thumbnail'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                      disabled={uploadingThumb}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative w-36 aspect-[4/3] rounded-xl overflow-hidden border border-[rgba(23,23,23,0.1)] bg-[#F6E7DF]">
                      <img src={formData.image} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                        title="Hapus gambar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 aspect-[4/3] rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-xs text-gray-400 bg-gray-50">
                      <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                      <span>Belum ada foto</span>
                    </div>
                  )}

                  <div className="flex-grow">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Atau masukkan URL / path gambar..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-xs focus:border-[#E66F52] focus:outline-none"
                    />
                    <p className="text-[11px] text-[#5F5A57] mt-1">
                      Gambar ini tampil sebagai cover card di landing page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 4: Multi-image Gallery */}
              <div className="p-4 rounded-2xl bg-white/70 border border-[rgba(23,23,23,0.08)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                      Galeri Gambar Tambahan (Multi-Slide)
                    </label>
                    <p className="text-[11px] text-[#5F5A57]">
                      Digunakan pada carousel / popup detail modal proyek.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#FBEFE9] border border-[rgba(23,23,23,0.1)] text-xs font-medium text-[#171717] cursor-pointer shadow-2xs transition-colors">
                    {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#E66F52]" />}
                    <span>{uploadingGallery ? 'Mengunggah...' : 'Upload Gambar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleGalleryUpload(e.target.files)}
                      disabled={uploadingGallery}
                    />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
                        <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Hapus foto ini"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 5: Descriptions */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deskripsi Proyek (Narasi Utama)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ceritakan latar belakang, konsep desain, atau tujuan proyek..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Deliverables & Hasil Akhir
                </label>
                <textarea
                  rows={2}
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="Aset grafis siap cetak, panduan identitas visual..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                />
              </div>

              {/* Row 6: Tools / Services Tags & Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Skills / Tools Dipakai (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={formData.servicesText}
                    onChange={(e) => setFormData({ ...formData, servicesText: e.target.value })}
                    placeholder="Figma, Canva, Art Direction, Poster Design"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Highlight / Capaian
                  </label>
                  <input
                    type="text"
                    value={formData.highlight}
                    onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                    placeholder="Featured on Instagram Post / Deployed in Vercel"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 7: Link URL & Link Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    URL Proyek Asli / Live Demo / Google Drive
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Label Tombol Link
                  </label>
                  <input
                    type="text"
                    value={formData.linkLabel}
                    onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })}
                    placeholder="Lihat Project Asli"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 8: Order & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Nomor Urut Tampil (display_order)
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

              {/* Modal Buttons */}
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {previewProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewProject(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,23,23,0.06)] mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E66F52]">
                Admin Live Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewProject(null)}
                className="p-1.5 rounded-lg text-[#5F5A57] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/10 flex items-center justify-center">
                <img
                  src={previewProject.image}
                  alt={previewProject.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#171717] border">
                  {previewProject.category}
                </span>
                <h2 className="text-2xl font-bold text-[#171717] mt-2">
                  {previewProject.title}
                </h2>
                <p className="text-xs text-[#5F5A57]">
                  {previewProject.type} • {previewProject.year} • Role: {previewProject.role}
                </p>
              </div>

              <p className="text-sm text-[#5F5A57] leading-relaxed">
                {previewProject.description}
              </p>

              {previewProject.link && (
                <div className="pt-2">
                  <a
                    href={previewProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] text-white text-xs font-semibold"
                  >
                    <span>{previewProject.linkLabel || 'Lihat Project'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Project?"
        message={`Apakah Anda yakin ingin menghapus project "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Project"
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
