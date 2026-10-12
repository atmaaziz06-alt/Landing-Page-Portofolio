import React from 'react';

export default function ProjectWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center overflow-hidden"
    >
      <span
        className="whitespace-nowrap -rotate-[28deg] text-[clamp(14px,2.8vw,24px)] font-medium uppercase tracking-[0.16em] text-white/65"
        style={{
          WebkitTextStroke: '0.35px rgba(20, 20, 20, 0.4)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)'
        }}
      >
        Vezta Studio
      </span>
    </div>
  );
}
