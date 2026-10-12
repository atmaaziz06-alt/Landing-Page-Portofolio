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
          className={`whitespace-nowrap -rotate-[28deg] font-bold uppercase text-white/80 ${isPatterned
            ? 'text-[clamp(12px,1.6vw,22px)] tracking-[0.08em]'
            : 'text-[clamp(20px,3vw,44px)] tracking-[0.12em]'}`}
          style={{
            WebkitTextStroke: '1px rgba(20, 20, 20, 0.75)',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.75)'
          }}
        >
          Vezta Studio
        </span>
      ))}
    </div>
  );
}
