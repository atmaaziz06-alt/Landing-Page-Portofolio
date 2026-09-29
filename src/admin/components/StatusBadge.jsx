// src/admin/components/StatusBadge.jsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function StatusBadge({ isVisible, onClick, isLoading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      title={isVisible ? 'Klik untuk sembunyikan dari landing page' : 'Klik untuk tampilkan di landing page'}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer disabled:opacity-50 ${
        isVisible
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isVisible ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
      <span>{isVisible ? 'Visible' : 'Hidden'}</span>
      {isVisible ? (
        <Eye className="w-3 h-3 ml-0.5 text-emerald-600 opacity-70" />
      ) : (
        <EyeOff className="w-3 h-3 ml-0.5 text-stone-500 opacity-70" />
      )}
    </button>
  );
}
