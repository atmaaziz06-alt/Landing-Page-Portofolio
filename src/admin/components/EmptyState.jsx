// src/admin/components/EmptyState.jsx
import React from 'react';
import { Plus } from 'lucide-react';

export default function EmptyState({
  title = 'Belum ada data',
  description = 'Tambahkan item baru untuk mulai mengelola konten.',
  icon: Icon,
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px] bg-[#FBEFE9]/50 border border-dashed border-[rgba(23,23,23,0.15)] my-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#E66F52]/10 flex items-center justify-center text-[#E66F52] mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-medium text-[#171717]">{title}</h3>
      <p className="text-xs sm:text-sm text-[#5F5A57] max-w-sm mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-[#E66F52] hover:bg-[#D65F42] shadow-sm hover:shadow transition-all cursor-pointer hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
