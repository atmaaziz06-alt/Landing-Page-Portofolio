import React from 'react';
import { isGraphicDesignProjectCategory } from '../utils/media';

const WATERMARK_TILES = Array.from({ length: 12 }, (_, index) => index);

export default function ProjectWatermark({ category }) {
  const isPatterned = isGraphicDesignProjectCategory(category);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[15] overflow-hidden ${isPatterned ? '' : 'flex items-center justify-center'}`}
    >
      {isPatterned ? (
        <div className="absolute inset-[-25%] grid grid-cols-3 grid-rows-4 place-items-center gap-x-6 gap-y-10 -rotate-[28deg]">
          {WATERMARK_TILES.map((tile) => (
            <span
              key={tile}
              className="whitespace-nowrap text-[clamp(9px,0.85vw,13px)] font-normal uppercase tracking-[0.05em] text-white/70"
              style={{
                WebkitTextStroke: '0.3px rgba(20, 20, 20, 0.45)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
              }}
            >
              Vezta Studio
            </span>
          ))}
        </div>
      ) : (
        <span
          className="whitespace-nowrap -rotate-[28deg] text-[clamp(12px,1.4vw,20px)] font-normal uppercase tracking-[0.08em] text-white/70"
          style={{
            WebkitTextStroke: '0.3px rgba(20, 20, 20, 0.45)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
          }}
        >
          Vezta Studio
        </span>
      )}
    </div>
  );
}
