// src/admin/components/ImageCropModal.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop as CropIcon,
  Maximize2,
  Sparkles,
  Info,
  Move,
  RotateCcw,
  Loader2
} from 'lucide-react';

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  initialAspect = 1, // 1 for 1:1, 0.8 for 4:5, 1.777 for 16:9, null for free
  circular = false,
  title = 'Sesuaikan & Crop Foto'
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState(initialAspect);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset state when opening new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setAspect(initialAspect);
    }
  }, [isOpen, imageSrc, initialAspect]);

  // Reset to default
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Handle Drag / Pan Mouse
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(2))), 3.5));
  };

  // Execute Canvas Crop & Export High Quality Image
  const handleApplyCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const container = containerRef.current;
      const viewWidth = container.offsetWidth || 300;
      const viewHeight = container.offsetHeight || 300;

      // Desired high-res output dimensions
      const outWidth = 800;
      let outHeight = 800;
      if (aspect) {
        outHeight = Math.round(outWidth / aspect);
      } else {
        outHeight = Math.round(outWidth * (viewHeight / viewWidth));
      }

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outWidth, outHeight);

      // Base scaling from on-screen preview to high-res canvas
      const scaleMultiplier = outWidth / viewWidth;

      ctx.save();
      // Move to center of canvas
      ctx.translate(outWidth / 2, outHeight / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply pan (scaled to output resolution)
      ctx.translate(pan.x * scaleMultiplier, pan.y * scaleMultiplier);

      // Apply zoom
      ctx.scale(zoom, zoom);

      // Render image centered matching preview
      const naturalW = img.naturalWidth || 600;
      const naturalH = img.naturalHeight || 600;

      // Fit preview image bounds
      const coverRatio = Math.max(viewWidth / naturalW, viewHeight / naturalH);
      const drawW = naturalW * coverRatio * scaleMultiplier;
      const drawH = naturalH * coverRatio * scaleMultiplier;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Convert to webp or jpeg data url
      let dataUrl;
      try {
        dataUrl = canvas.toDataURL('image/webp', 0.92);
      } catch (_) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      }

      onCropComplete(dataUrl);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  // Viewport dimensions
  const viewWidth = circular ? 260 : 300;
  const viewHeight = circular ? 260 : aspect ? Math.min(300, Math.round(300 / aspect)) : 300;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-[#FBEFE9] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-[rgba(23,23,23,0.12)] flex flex-col my-auto transition-all">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[rgba(23,23,23,0.06)] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E66F52]/15 text-[#E66F52] flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#171717]">{title}</h3>
              <p className="text-[11px] text-[#5F5A57]">Geser, putar, & perbesar untuk mengatur foto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#5F5A57] hover:text-[#171717] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Interactive Viewport */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center select-none bg-[#141414] relative overflow-hidden">
          
          {/* Viewport Frame */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-dashed border-[#E66F52] shadow-2xl transition-all ${
              circular ? 'rounded-full' : 'rounded-2xl'
            }`}
            style={{
              width: `${viewWidth}px`,
              height: `${viewHeight}px`,
              backgroundColor: '#1E1E1E'
            }}
          >
            {/* Guide Grid overlay (Rule of Thirds) */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div></div>
            </div>

            {/* Transformable Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Source"
              draggable={false}
              className="absolute max-w-none select-none pointer-events-none origin-center"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Interactive Cue */}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-[#E66F52]" />
              <span>Geser untuk atur posisi</span>
            </span>
            <span>•</span>
            <span>Scroll mouse untuk zoom</span>
          </div>
        </div>

        {/* Controls Toolbar (Always scrollable and visible) */}
        <div className="px-5 sm:px-6 py-4 bg-white/70 border-t border-[rgba(23,23,23,0.06)] space-y-3.5">
          
          {/* Zoom Slider + Percentage + Reset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#5F5A57]">Perbesaran (Zoom):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#E66F52] bg-[#E66F52]/10 px-2 py-0.5 rounded-full">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F5A57] hover:text-[#171717] px-2 py-0.5 rounded-md hover:bg-black/5 cursor-pointer"
                  title="Kembalikan ke posisi semula"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}
                className="p-2 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-[#171717] hover:bg-neutral-50 shadow-2xs cursor-pointer"
                aria-label="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="0.6"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-grow accent-[#E66F52] h-2 bg-neutral-200 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3.0, Number((prev + 0.1).toFixed(2))))}
                className="p-2 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-[#171717] hover:bg-neutral-50 shadow-2xs cursor-pointer"
                aria-label="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                title="Putar 90 Derajat"
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[rgba(23,23,23,0.1)] text-[#171717] hover:bg-neutral-50 shadow-2xs flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#E66F52]" />
                <span>{rotation}°</span>
              </button>
            </div>

            {/* Quick zoom presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#5F5A57] font-medium mr-1">Preset:</span>
              {[1.0, 1.3, 1.6, 2.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setZoom(preset)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    Math.abs(zoom - preset) < 0.05
                      ? 'bg-[#E66F52] text-white'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#5F5A57] hover:text-[#171717]'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Buttons (Only if not strictly circular avatar) */}
          {!circular && (
            <div className="pt-2 border-t border-[rgba(23,23,23,0.06)]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-[#5F5A57] uppercase tracking-wider">
                  Rasio Bingkai:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setAspect(0.8)} // 4:5
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    aspect === 0.8
                      ? 'bg-[#E66F52] text-white shadow-xs font-semibold'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  4:5 (About Me)
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(1)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    aspect === 1
                      ? 'bg-[#E66F52] text-white shadow-xs font-semibold'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  1:1 Persegi
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(0.75)} // 3:4
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    aspect === 0.75
                      ? 'bg-[#E66F52] text-white shadow-xs font-semibold'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  3:4 Standar
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(1.777)} // 16:9
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    aspect === 1.777
                      ? 'bg-[#E66F52] text-white shadow-xs font-semibold'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  16:9 Wide
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Always accessible, sticky at bottom) */}
        <div className="px-5 sm:px-6 py-4 bg-white border-t border-[rgba(23,23,23,0.08)] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-full border border-[rgba(23,23,23,0.12)] text-xs sm:text-sm font-medium text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="px-7 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-semibold shadow-card hover:shadow-subtle transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 hover-lift"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isProcessing ? 'Memproses Foto...' : 'Terapkan & Simpan Foto'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
