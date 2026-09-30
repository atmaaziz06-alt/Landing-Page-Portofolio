// src/admin/pages/ToolsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import CategoryManageModal from '../components/CategoryManageModal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { resolveToolIcon } from '../../utils/toolIcons';
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Search,
  Upload,
  Sparkles,
  Bot,
  Code2,
  Briefcase,
  Palette,
  Check,
  Tag,
  ChevronDown,
  SlidersHorizontal,
  Image as ImageIcon
} from 'lucide-react';

export default function ToolsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // Category Manage Modal
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultToolCategories = ['Desain', 'Prompting AI', 'Front End Development', 'Office'];
  const [customToolCategories, setCustomToolCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('vezta_tool_custom_categories');
      return saved ? JSON.parse(saved) : defaultToolCategories;
    } catch (_) {
      return defaultToolCategories;
    }
  });

  const categories = useMemo(() => {
    const set = new Set(customToolCategories);
    tools.forEach((t) => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set);
  }, [customToolCategories, tools]);

  const [isAddingCategoryNav, setIsAddingCategoryNav] = useState(false);
  const [newCategoryNavName, setNewCategoryNavName] = useState('');
  const [isAddingCategoryForm, setIsAddingCategoryForm] = useState(false);
  const [newCategoryFormName, setNewCategoryFormName] = useState('');

  const handleAddCategory = (name) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (!customToolCategories.includes(trimmed)) {
      const updated = [...customToolCategories, trimmed];
      setCustomToolCategories(updated);
      try {
        localStorage.setItem('vezta_tool_custom_categories', JSON.stringify(updated));
      } catch (_) {}
      toast.success(`Kategori "${trimmed}" berhasil ditambahkan!`);
    }
  };

  const handleDeleteCategory = async (catToDelete, fallbackCategory) => {
    // 1. Reassign affected tools
    const affected = tools.filter((t) => (t.category || '').trim() === catToDelete);
    if (affected.length > 0) {
      for (const t of affected) {
        await api.updateTool(t.id, {
          name: t.name,
          role: t.role,
          category: fallbackCategory,
          iconKey: t.iconKey,
          customIconUrl: t.customIconUrl,
          displayOrder: t.displayOrder,
          isVisible: t.isVisible
        });
      }
      setTools((prev) =>
        prev.map((t) =>
          (t.category || '').trim() === catToDelete ? { ...t, category: fallbackCategory } : t
        )
      );
    }

    // 2. Remove from custom categories
    const updated = customToolCategories.filter((c) => c !== catToDelete);
    setCustomToolCategories(updated);
    try {
      localStorage.setItem('vezta_tool_custom_categories', JSON.stringify(updated));
    } catch (_) {}

    // 3. Reset selected filter if needed
    if (selectedCategory === catToDelete) {
      setSelectedCategory('ALL');
    }

    toast.success(`Kategori "${catToDelete}" berhasil dihapus.`);
  };

  const handleMoveCategory = async (tool, newCategory) => {
    if (!newCategory || newCategory === tool.category) return;
    try {
      const payload = {
        name: tool.name,
        role: tool.role,
        category: newCategory,
        iconKey: tool.iconKey,
        customIconUrl: tool.customIconUrl,
        displayOrder: tool.displayOrder,
        isVisible: tool.isVisible
      };
      await api.updateTool(tool.id, payload);
      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, category: newCategory } : t))
      );
      toast.success(`"${tool.name}" dipindahkan ke kategori "${newCategory}"!`);
    } catch (err) {
      toast.error('Gagal memindahkan kategori: ' + err.message);
    }
  };

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'Desain',
    iconKey: '',
    customIconUrl: '',
    displayOrder: 1,
    isVisible: true
  });

  const loadTools = async () => {
    try {
      const res = await api.getTools(true);
      if (res.success && res.data) {
        setTools(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat tools: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
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
      name: '',
      role: '',
      category: selectedCategory !== 'ALL' ? selectedCategory : (categories[0] || 'Desain'),
      iconKey: '',
      customIconUrl: '',
      displayOrder: tools.length + 1,
      isVisible: true
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role || '',
      category: item.category || 'Desain',
      iconKey: item.iconKey || '',
      customIconUrl: item.customIconUrl || '',
      displayOrder: item.displayOrder ?? 1,
      isVisible: item.isVisible
    });
    setIsFormOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextState = !item.isVisible;
    try {
      const res = await api.toggleToolVisibility(item.id, nextState);
      if (res.success) {
        setTools((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isVisible: nextState } : t))
        );
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Gagal mengubah visibilitas: ' + err.message);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tools.length) return;

    const newItems = [...tools];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    setTools(newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));

    try {
      await api.reorderTools(payload);
      toast.success('Urutan tool berhasil diperbarui.');
    } catch (err) {
      toast.error('Gagal memperbarui urutan: ' + err.message);
      loadTools();
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const res = await api.uploadFile(file);
      const uploadedUrl = res.url || res.data?.url || res.data;
      if (res.success && uploadedUrl) {
        setFormData((prev) => ({ ...prev, customIconUrl: uploadedUrl }));
        toast.success('Icon custom berhasil diunggah!');
      } else {
        toast.error(res.message || 'Gagal mengunggah icon.');
      }
    } catch (err) {
      toast.error('Gagal mengunggah icon: ' + err.message);
    } finally {
      setUploadingIcon(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama Tool wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const res = await api.updateTool(editingItem.id, formData);
        if (res.success) {
          toast.success('Tool berhasil diperbarui.');
          setIsFormOpen(false);
          loadTools();
        }
      } else {
        const res = await api.createTool(formData);
        if (res.success) {
          toast.success('Tool baru berhasil ditambahkan.');
          setIsFormOpen(false);
          loadTools();
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan tool: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteTool(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
        setTools((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error('Gagal menghapus tool: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTools = tools.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Desain':
        return <Palette className="w-3.5 h-3.5 text-[#E66F52]" />;
      case 'Prompting AI':
        return <Bot className="w-3.5 h-3.5 text-[#7B61FF]" />;
      case 'Front End Development':
        return <Code2 className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'Office':
        return <Briefcase className="w-3.5 h-3.5 text-[#059669]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#E66F52]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
            Tools & Software Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
            Kelola software desain, platform AI Prompting, teknologi frontend, serta tools kolaborasi kantor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsManageCatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-[#171717] text-xs sm:text-sm font-medium border border-[rgba(23,23,23,0.08)] shadow-2xs transition-all duration-200 cursor-pointer"
            title="Kelola Kategori (Tambah & Hapus)"
          >
            <Tag className="w-4 h-4 text-[#E66F52]" />
            <span>Kelola Kategori</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-card hover:shadow-subtle transition-all duration-200 cursor-pointer hover-lift"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-[#FBEFE9] p-4 rounded-2xl border border-[rgba(23,23,23,0.06)]">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5F5A57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tool atau fungsi..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[rgba(23,23,23,0.08)] text-xs sm:text-sm focus:border-[#E66F52] focus:outline-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#171717] text-white shadow-2xs'
                  : 'bg-white/80 text-[#5F5A57] hover:bg-white hover:text-[#171717]'
              }`}
            >
              Semua ({tools.length})
            </button>
            {categories.map((cat) => {
              const count = tools.filter((t) => (t.category || '').trim() === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#E66F52] text-white shadow-2xs'
                      : 'bg-white/80 text-[#5F5A57] hover:bg-white hover:text-[#171717]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      selectedCategory === cat
                        ? 'bg-white/25 text-white'
                        : 'bg-black/5 text-[#5F5A57]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick Add Custom Category */}
            {isAddingCategoryNav ? (
              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-xl border border-[#E66F52] shadow-2xs">
                <input
                  type="text"
                  value={newCategoryNavName}
                  onChange={(e) => setNewCategoryNavName(e.target.value)}
                  placeholder="Kategori baru..."
                  className="text-xs px-2 py-1 outline-none w-28 text-[#171717]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory(newCategoryNavName);
                      if (newCategoryNavName.trim()) setSelectedCategory(newCategoryNavName.trim());
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
                    if (newCategoryNavName.trim()) setSelectedCategory(newCategoryNavName.trim());
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/60 hover:bg-white text-[#E66F52] border border-dashed border-[#E66F52]/60 hover:border-[#E66F52] transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3 h-3" />
                <span>+ Kategori</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
          <p className="text-sm text-[#5F5A57]">Memuat daftar tools...</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <EmptyState
          title="Tidak ada tools ditemukan"
          description="Coba ubah kata kunci pencarian atau tambahkan tool baru."
          icon={Wrench}
          actionLabel="Add Tool"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((item, index) => (
            <div
              key={item.id}
              className={`group relative rounded-[24px] bg-white border p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                item.isVisible
                  ? 'border-[rgba(23,23,23,0.08)] hover:border-[#E66F52]/40 shadow-xs hover:shadow-card'
                  : 'border-dashed border-stone-300 opacity-60 bg-stone-50/80'
              }`}
            >
              <div>
                {/* Header: Tool Icon & Reorder Controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBEFE9]/70 border border-[rgba(23,23,23,0.06)] flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                    {resolveToolIcon(item)}
                  </div>

                  {/* Sleek Order Reorder Pill */}
                  <div className="flex items-center bg-[#FBEFE9]/60 hover:bg-[#FBEFE9] rounded-xl px-2.5 py-1 border border-[rgba(23,23,23,0.06)] shadow-2xs transition-colors">
                    <span className="text-[11px] font-mono font-semibold text-[#5F5A57]">
                      #{item.displayOrder}
                    </span>
                    <div className="flex items-center ml-2 pl-2 border-l border-[rgba(23,23,23,0.1)] gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 rounded text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-20 cursor-pointer transition-colors"
                        title="Pindahkan ke atas"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === filteredTools.length - 1}
                        className="p-0.5 rounded text-[#5F5A57] hover:text-[#171717] hover:bg-black/5 disabled:opacity-20 cursor-pointer transition-colors"
                        title="Pindahkan ke bawah"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tool Title & Role */}
                <div className="mt-3.5 space-y-1">
                  <h3 className="text-base font-semibold text-[#171717] tracking-tight group-hover:text-[#E66F52] transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#5F5A57] line-clamp-2 leading-relaxed min-h-[32px]">
                    {item.role || 'Tidak ada keterangan fungsi.'}
                  </p>
                </div>

                {/* Category Pill Tag (Clickable / Quick Transfer Selector) */}
                <div className="mt-3 flex items-center">
                  <div className="relative inline-flex items-center group/cat">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#FBEFE9] text-[#171717] border border-[rgba(23,23,23,0.06)] hover:border-[#E66F52] shadow-2xs transition-colors">
                      {getCategoryIcon(item.category)}
                      <select
                        value={item.category}
                        onChange={(e) => handleMoveCategory(item, e.target.value)}
                        title="Klik untuk memindahkan ke kategori lain"
                        className="bg-transparent text-[11px] font-semibold text-[#171717] cursor-pointer outline-none appearance-none pr-4.5"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-[#5F5A57] absolute right-2.5 pointer-events-none group-hover/cat:text-[#E66F52] transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Visibility & Edit/Delete Actions */}
              <div className="mt-4 pt-3.5 border-t border-[rgba(23,23,23,0.06)] flex items-center justify-between">
                <StatusBadge
                  isVisible={item.isVisible}
                  onClick={() => handleToggleVisibility(item)}
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-[#5F5A57] hover:text-[#171717] hover:bg-[#FBEFE9] transition-all cursor-pointer shadow-2xs hover:shadow-subtle"
                    title="Edit Tool"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-xl text-[#5F5A57] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shadow-2xs hover:shadow-subtle"
                    title="Hapus Tool"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      <CategoryManageModal
        isOpen={isManageCatOpen}
        onClose={() => setIsManageCatOpen(false)}
        title="Kelola Kategori Tools"
        itemTypeLabel="tool"
        categories={categories}
        items={tools}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        defaultFallback="Desain"
      />

      {/* ADD / EDIT TOOL MODAL */}
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
                {editingItem ? 'Edit Tool' : 'Add New Tool'}
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
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Nama Tool / Software *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Figma, CapCut, Illustrator, ChatGPT"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none shadow-2xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Kategori Tool
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategoryForm(!isAddingCategoryForm)}
                    className="text-[11px] font-medium text-[#E66F52] hover:underline flex items-center gap-1 cursor-pointer"
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
                      placeholder="Ketik kategori tool baru..."
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
                      className="px-4 py-2.5 rounded-xl bg-[#E66F52] text-white text-xs font-semibold hover:bg-[#D65F42] cursor-pointer"
                    >
                      Gunakan
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none shadow-2xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Fungsi / Peran Penggunaan
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Contoh: UI/UX Design & Prototyping"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none shadow-2xs"
                />
              </div>

              {/* Custom Icon Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Icon Kustom (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] flex items-center justify-center p-2 shadow-2xs flex-shrink-0">
                    {resolveToolIcon({
                      name: formData.name,
                      customIconUrl: formData.customIconUrl,
                      category: formData.category
                    })}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-dashed border-[rgba(23,23,23,0.2)] hover:border-[#E66F52] text-xs font-medium text-[#5F5A57] hover:text-[#171717] cursor-pointer transition-colors shadow-2xs">
                    {uploadingIcon ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#E66F52]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#E66F52]" />
                    )}
                    <span>{formData.customIconUrl ? 'Ganti Icon Gambar' : 'Unggah Icon (PNG/SVG)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={uploadingIcon}
                      className="hidden"
                    />
                  </label>
                  {formData.customIconUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customIconUrl: '' })}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-white transition-colors"
                      title="Hapus icon kustom dan gunakan default"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Nomor Urut Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Visibilitas
                  </label>
                  <select
                    value={formData.isVisible ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-sm focus:border-[#E66F52] focus:outline-none shadow-2xs"
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan Tool'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Tool?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Tool"
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
