import React from 'react';

const WATERMARK_TILES = Array.from({ length: 6 }, (_, index) => index);

export default function ProjectWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      <div className="absolute inset-[-15%] grid grid-cols-2 grid-rows-3 place-items-center gap-x-12 gap-y-16 -rotate-[28deg]">
        {WATERMARK_TILES.map((tile) => (
          <span
            key={tile}
            className="whitespace-nowrap text-[clamp(11px,2.2vw,20px)] font-semibold uppercase tracking-[0.12em] text-white/55"
            style={{
              WebkitTextStroke: '0.5px rgba(20, 20, 20, 0.45)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)'
            }}
          >
            Vezta Studio
          </span>
        ))}
      </div>
    </div>
  );
}
