import React from 'react';
import { isGraphicDesignProjectCategory } from '../utils/media';

const WATERMARK_TILES = Array.from({ length: 12 }, (_, index) => index);

export default function ProjectWatermark({ category }) {
  const isPatterned = isGraphicDesignProjectCategory(category);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[5] overflow-hidden ${isPatterned ? 'grid grid-cols-3 grid-rows-4 place-items-center' : 'flex items-center justify-center'}`}
    >
      {(isPatterned ? WATERMARK_TILES : [0]).map((tile) => (
        <span
          key={tile}
          className={`whitespace-nowrap -rotate-[28deg] font-medium uppercase text-white/70 ${isPatterned
            ? 'text-[clamp(9px,1vw,15px)] tracking-[0.06em]'
            : 'text-[clamp(16px,2vw,30px)] tracking-[0.1em]'}`}
          style={{
            WebkitTextStroke: '0.45px rgba(20, 20, 20, 0.55)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          Vezta Studio
        </span>
      ))}
    </div>
  );
}
