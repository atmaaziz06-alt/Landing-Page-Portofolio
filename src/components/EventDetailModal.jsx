// src/components/EventDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
  Users,
  Award
} from 'lucide-react';

export default function EventDetailModal({ event, onClose }) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!event) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#FDFBF7] rounded-[28px] sm:rounded-[36px] border border-[rgba(23,23,23,0.12)] shadow-2xl p-5 sm:p-8 md:p-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full bg-white/90 hover:bg-white text-[#171717] hover:text-[#E66F52] border border-[rgba(23,23,23,0.1)] shadow-xs transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4">
          {event.role && (
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#E66F52] text-white shadow-xs">
              {event.role}
            </span>
          )}
          {(event.date || event.period) && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[#5F5A57] border border-[rgba(23,23,23,0.08)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#E66F52]" />
              <span>{event.date || event.period}</span>
            </span>
          )}
          {event.location && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[#5F5A57] border border-[rgba(23,23,23,0.08)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5F5A57]" />
              <span>{event.location}</span>
            </span>
          )}
        </div>

        {/* Title & Organizer */}
        <h2 id="event-modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717] tracking-tight mb-2 pr-8">
          {event.title}
        </h2>
        {event.organizer && (
          <p className="text-sm sm:text-base font-semibold text-[#E66F52] mb-6">
            Diselenggarakan oleh: {event.organizer}
          </p>
        )}

        {/* Event Photo Preview / Banner */}
        {event.imageUrl ? (
          <div className="relative mb-6 rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(23,23,23,0.08)] bg-neutral-900 group">
            <img
              src={event.imageUrl}
              alt={event.title}
              className={`w-full transition-all duration-300 ${
                isZoomed ? 'max-h-[85vh] object-contain' : 'max-h-[55vh] object-cover'
              }`}
            />
            <button
              type="button"
              onClick={() => setIsZoomed((prev) => !prev)}
              className="absolute bottom-3.5 right-3.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer shadow-md"
            >
              {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isZoomed ? 'Perkecil Foto' : 'Perbesar Foto'}</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-44 rounded-2xl bg-[#F6E7DF]/60 border border-[rgba(23,23,23,0.08)] flex flex-col items-center justify-center text-[#5F5A57] mb-6 p-6 text-center">
            <Users className="w-12 h-12 text-[#E66F52] mb-2" />
            <p className="text-xs font-medium">Aktivitas resmi dalam rekam jejak profesional Raditya Atma Aziz.</p>
          </div>
        )}

        {/* Event Description & Outcomes */}
        {event.description && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-[#5F5A57] uppercase tracking-wider mb-2">
              Uraian &amp; Hasil Kegiatan
            </h3>
            <p className="text-sm sm:text-base text-[#171717]/85 leading-relaxed bg-white/70 p-4 sm:p-5 rounded-2xl border border-[rgba(23,23,23,0.06)]">
              {event.description}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[rgba(23,23,23,0.08)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-[rgba(23,23,23,0.12)] text-xs sm:text-sm font-medium text-[#171717] hover:bg-black/5 transition-colors cursor-pointer text-center"
          >
            Tutup Pratinjau
          </button>

          {event.linkUrl && (
            <a
              href={event.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-semibold shadow-card hover:shadow-subtle transition-all duration-200 group cursor-pointer hover-lift text-center"
            >
              <span>Buka Dokumentasi Lengkap</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
