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
  Info
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

  // Handle Drag / Pan
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
    const delta = -e.deltaY * 0.001;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  // Execute Canvas Crop & Export High Quality Image
  const handleApplyCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Desired output dimensions based on aspect
      let outWidth = 600;
      let outHeight = 600;
      if (aspect) {
        outHeight = Math.round(outWidth / aspect);
      }

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill canvas background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outWidth, outHeight);

      // Save state for transforms
      ctx.save();
      ctx.translate(outWidth / 2, outHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Ratio scaling from screen preview to actual output canvas
      const scaleMultiplier = outWidth / rect.width;
      ctx.translate(pan.x * scaleMultiplier, pan.y * scaleMultiplier);
      ctx.scale(zoom * scaleMultiplier, zoom * scaleMultiplier);

      // Draw original image centered
      const drawWidth = img.naturalWidth || img.width;
      const drawHeight = img.naturalHeight || img.height;
      const baseScale = Math.max(rect.width / drawWidth, rect.height / drawHeight);

      ctx.drawImage(
        img,
        (-drawWidth * baseScale) / 2,
        (-drawHeight * baseScale) / 2,
        drawWidth * baseScale,
        drawHeight * baseScale
      );

      ctx.restore();

      // Convert to webp or jpeg data url
      let dataUrl;
      try {
        dataUrl = canvas.toDataURL('image/webp', 0.9);
      } catch (_) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-[rgba(23,23,23,0.1)] flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[rgba(23,23,23,0.06)] flex items-center justify-between bg-[#FBEFE9]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E66F52]/15 text-[#E66F52] flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">{title}</h3>
              <p className="text-[11px] text-[#5F5A57]">Geser dan perbesar untuk mengatur posisi foto yang pas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#5F5A57] hover:text-[#171717] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Interactive Viewport */}
        <div className="p-6 flex-grow flex flex-col items-center justify-center select-none bg-[#171717]">
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
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-dashed border-[#E66F52] bg-neutral-900 transition-all ${
              circular ? 'rounded-full aspect-square w-72 h-72' : ''
            }`}
            style={{
              width: circular ? '280px' : '320px',
              height: circular ? '280px' : aspect ? `${320 / aspect}px` : '320px',
              maxHeight: '360px'
            }}
          >
            {/* Guide Grid overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-white/60"></div>
              <div className="border-r border-white/60"></div>
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
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#E66F52]" />
            <span>Tahan klik & geser gambar untuk menyesuaikan posisi</span>
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="px-6 py-4 bg-[#FBEFE9]/40 border-t border-[rgba(23,23,23,0.06)] space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1.5 rounded-lg bg-white border border-[rgba(23,23,23,0.1)] text-[#171717] hover:bg-neutral-50 shadow-2xs"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-grow accent-[#E66F52] h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
              className="p-1.5 rounded-lg bg-white border border-[rgba(23,23,23,0.1)] text-[#171717] hover:bg-neutral-50 shadow-2xs"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              title="Putar 90 Derajat"
              className="p-1.5 rounded-lg bg-white border border-[rgba(23,23,23,0.1)] text-[#171717] hover:bg-neutral-50 shadow-2xs flex items-center gap-1 text-xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#E66F52]" />
              <span className="text-[11px] font-medium">{rotation}°</span>
            </button>
          </div>

          {/* Aspect Ratio Buttons (Only if not strictly circular avatar) */}
          {!circular && (
            <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1">
              <span className="text-xs font-semibold text-[#5F5A57] uppercase tracking-wider text-nowrap">
                Rasio:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                <button
                  type="button"
                  onClick={() => setAspect(1)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    aspect === 1
                      ? 'bg-[#E66F52] text-white shadow-xs'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  1:1 Persegi
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(0.8)} // 4:5
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    aspect === 0.8
                      ? 'bg-[#E66F52] text-white shadow-xs'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  4:5 Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(0.75)} // 3:4
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    aspect === 0.75
                      ? 'bg-[#E66F52] text-white shadow-xs'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  3:4 Standar
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(1.777)} // 16:9
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    aspect === 1.777
                      ? 'bg-[#E66F52] text-white shadow-xs'
                      : 'bg-white border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-neutral-50'
                  }`}
                >
                  16:9 Wide
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[rgba(23,23,23,0.06)] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2 rounded-full border border-[rgba(23,23,23,0.12)] text-xs sm:text-sm font-medium text-[#171717] hover:bg-black/5 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-semibold shadow-card hover:shadow-subtle transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 hover-lift"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Memproses...' : 'Terapkan & Simpan'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
