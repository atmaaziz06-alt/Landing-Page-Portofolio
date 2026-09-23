import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowUpRight, CheckCircle2, Calendar, User, Layers, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectDetailModal({ project, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages = (project?.images && project.images.length > 0)
    ? project.images
    : (project?.image ? [project.image] : []);

  const totalImages = galleryImages.length;
  const currentImage = galleryImages[activeImageIndex] || project?.image;

  const handlePrevImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const handleNextImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  // Reset image index when project changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [project]);

  // Keyboard navigation for Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, handlePrevImage, handleNextImage]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FBEFE9] rounded-[28px] border border-[rgba(23,23,23,0.1)] shadow-2xl p-6 sm:p-8 md:p-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white text-[#171717] hover:text-[#E66F52] border border-[rgba(23,23,23,0.08)] shadow-sm transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#E66F52] text-white">
            {project.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/70 text-[#5F5A57] border border-[rgba(23,23,23,0.08)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E66F52]" />
            {project.year}
          </span>
          {project.highlight && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FCEBE6] text-[#E66F52] border border-[#F4B09D]/40">
              <Sparkles className="w-3 h-3" />
              {project.highlight}
            </span>
          )}
        </div>

        {/* Project Title & Subtitle */}
        <h3 id="modal-title" className="text-2xl sm:text-4xl font-medium tracking-tight text-[#171717] mb-2">
          {project.title}
        </h3>
        <p className="text-base sm:text-lg text-[#5F5A57] mb-6">
          {project.type}
        </p>

        {/* ============================================================ */}
        {/* E-COMMERCE STYLE INTERACTIVE SHOWCASE GALLERY                */}
        {/* ============================================================ */}
        <div className="relative w-full h-[300px] sm:h-[460px] md:h-[500px] rounded-[22px] overflow-hidden border border-[rgba(23,23,23,0.08)] shadow-subtle bg-[#171717]/5 flex items-center justify-center select-none group/gallery mb-3">
          {project.category === 'Desain Grafis' ? (
            <>
              {/* Ambient blurred backdrop so frame matches active slide */}
              <img
                src={currentImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 select-none pointer-events-none transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/[0.06] backdrop-blur-[1px]" />

              {/* Main sharp uncropped slide */}
              <img
                key={currentImage}
                src={currentImage}
                alt={`${project.title} slide ${activeImageIndex + 1}`}
                className="relative z-10 max-h-full max-w-full object-contain p-3 sm:p-5 drop-shadow-xl transition-all duration-300 animate-in fade-in"
              />
            </>
          ) : (
            <img
              key={currentImage}
              src={currentImage}
              alt={`${project.title} slide ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300 animate-in fade-in"
            />
          )}

          {/* E-Commerce Floating Prev & Next Buttons */}
          {totalImages > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Slide sebelumnya"
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#171717] hover:text-[#E66F52] border border-[rgba(23,23,23,0.1)] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Slide berikutnya"
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#171717] hover:text-[#E66F52] border border-[rgba(23,23,23,0.1)] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Slide Counter Indicator Badge */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-black/65 backdrop-blur-md text-white border border-white/20 shadow-sm tracking-wider">
                  {activeImageIndex + 1} / {totalImages}
                </span>
              </div>
            </>
          )}
        </div>

        {/* E-Commerce Thumbnails Strip Below Main Showcase */}
        {totalImages > 1 && (
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-2 px-1 mb-8 no-scrollbar">
            {galleryImages.map((imgSrc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-[#E66F52] ring-2 ring-[#E66F52]/40 scale-105 shadow-md opacity-100'
                    : 'border-[rgba(23,23,23,0.12)] opacity-50 hover:opacity-90 hover:border-black/30'
                }`}
              >
                <img
                  src={imgSrc}
                  alt={`${project.title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {totalImages <= 1 && <div className="mb-8" />}

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Overview & Narrative */}
          <div className="md:col-span-7">
            <h4 className="text-sm uppercase tracking-wider font-semibold text-[#171717] mb-3">
              Overview
            </h4>
            <p className="text-base text-[#5F5A57] leading-relaxed mb-6">
              {project.description}
            </p>

            <h4 className="text-sm uppercase tracking-wider font-semibold text-[#171717] mb-3">
              Key Deliverables
            </h4>
            <p className="text-sm text-[#5F5A57] leading-relaxed">
              {project.deliverables}
            </p>
          </div>

          {/* Sidebar Meta: Role, Client, Services */}
          <div className="md:col-span-5 flex flex-col space-y-5 p-6 rounded-[20px] bg-white/60 border border-[rgba(23,23,23,0.06)]">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#5F5A57] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#E66F52]" />
                Role
              </span>
              <p className="text-sm font-medium text-[#171717]">
                {project.role}
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#5F5A57] mb-1 block">
                Client
              </span>
              <p className="text-sm font-medium text-[#171717]">
                {project.client}
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#5F5A57] flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-[#E66F52]" />
                Services Provided
              </span>
              <div className="flex flex-wrap gap-2">
                {project.services.map((service, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8EEE8] text-[#171717] border border-[rgba(23,23,23,0.06)]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#E66F52]" />
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action inside Modal */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[rgba(23,23,23,0.08)]">
          <p className="text-xs text-[#5F5A57]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[rgba(23,23,23,0.15)] text-[11px] font-mono">Esc</kbd> or click outside to close
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white/80 hover:bg-white text-[#171717] hover:text-[#E66F52] border border-[rgba(23,23,23,0.1)] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {/* Note: External link button is hidden for category 'Desain Grafis' as requested */}
            {project.link && project.category !== 'Desain Grafis' && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#171717] hover:bg-[#E66F52] text-white text-xs sm:text-sm font-medium transition-all duration-200 group shadow-sm hover:shadow"
              >
                <span>{project.linkLabel || 'Lihat Project Asli'}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
