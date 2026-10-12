import React from 'react';
import { isGraphicDesignProjectCategory } from '../utils/media';

const WATERMARK_TILES = Array.from({ length: 12 }, (_, index) => index);

export default function ProjectWatermark({ category }) {
  const isPatterned = isGraphicDesignProjectCategory(category);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[15] overflow-hidden ${isPatterned ? 'grid grid-cols-4 grid-rows-5 place-items-center' : 'flex items-center justify-center'}`}
    >
      {(isPatterned ? WATERMARK_TILES : [0]).map((tile) => (
        <span
          key={tile}
          className={`whitespace-nowrap -rotate-[28deg] font-normal uppercase text-white/70 ${isPatterned
            ? 'text-[clamp(8px,0.8vw,12px)] tracking-[0.05em]'
            : 'text-[clamp(12px,1.4vw,20px)] tracking-[0.08em]'}`}
          style={{
            WebkitTextStroke: '0.3px rgba(20, 20, 20, 0.45)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
          }}
        >
          Vezta Studio
        </span>
      ))}
    </div>
  );
}
