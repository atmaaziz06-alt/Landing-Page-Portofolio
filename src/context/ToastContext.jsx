// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3000; // Hilang otomatis dalam 3 detik

function ToastItem({ item, onRemove }) {
  const [isClosing, setIsClosing] = useState(false);
  const duration = typeof item.duration === 'number' ? item.duration : DEFAULT_DURATION;
  const timerRef = useRef(null);

  const startClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 280);
  }, [item.id, onRemove]);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        startClose();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, startClose]);

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform ${
        isClosing
          ? 'opacity-0 translate-y-3 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100'
      } ${
        item.type === 'success'
          ? 'bg-white/95 border-[#E66F52]/30 text-[#171717]'
          : item.type === 'error'
          ? 'bg-[#FEF2F2]/95 border-red-200 text-red-900'
          : 'bg-white/95 border-gray-200 text-[#171717]'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#E66F52]" />}
        {item.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
        {item.type === 'info' && <Info className="w-5 h-5 text-[#5F5A57]" />}
      </div>

      <div className="flex-grow text-sm font-medium leading-snug pr-2">
        {item.message}
      </div>

      <button
        type="button"
        onClick={startClose}
        className="text-[#5F5A57] hover:text-[#171717] p-0.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer flex-shrink-0"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Indikator hitung mundur 3 detik otomatis */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-[2.5px] rounded-full transition-all linear ${
            item.type === 'success'
              ? 'bg-[#E66F52]'
              : item.type === 'error'
              ? 'bg-red-500'
              : 'bg-gray-400'
          }`}
          style={{
            animation: `toastProgressBar ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = DEFAULT_DURATION) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    const validDuration = typeof duration === 'number' ? duration : DEFAULT_DURATION;
    setToasts((prev) => [...prev, { id, message, type, duration: validDuration }]);
  }, []);

  const toast = {
    success: (msg, dur = DEFAULT_DURATION) => addToast(msg, 'success', dur),
    error: (msg, dur = DEFAULT_DURATION) => addToast(msg, 'error', dur),
    info: (msg, dur = DEFAULT_DURATION) => addToast(msg, 'info', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

