import React from 'react';

const WATERMARK_TILES = Array.from({ length: 15 }, (_, index) => index);

export default function ProjectWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      <div className="absolute inset-[-25%] grid grid-cols-3 grid-rows-5 place-items-center gap-x-10 gap-y-12 -rotate-[28deg]">
        {WATERMARK_TILES.map((tile) => (
          <span
            key={tile}
            className="whitespace-nowrap text-[clamp(12px,2.8vw,24px)] font-extrabold uppercase tracking-[0.16em] text-white/75"
            style={{
              WebkitTextStroke: '1px rgba(20, 20, 20, 0.85)',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
            }}
          >
            Vezta Studio
          </span>
        ))}
      </div>
    </div>
  );
}
