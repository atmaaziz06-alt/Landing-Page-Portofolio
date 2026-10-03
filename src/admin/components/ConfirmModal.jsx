// src/admin/components/ConfirmModal.jsx
import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
  variant = 'danger',
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.12)] p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              variant === 'primary' ? 'bg-[#E66F52]/15 text-[#E66F52]' : 'bg-red-100 text-red-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#171717]">{title}</h3>
            <p className="text-sm text-[#5F5A57] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-7 pt-4 border-t border-[rgba(23,23,23,0.06)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#171717] hover:bg-black/5 border border-[rgba(23,23,23,0.1)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
              variant === 'primary' ? 'bg-[#E66F52] hover:bg-[#D65F42]' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
