import React from 'react';

export default function SectionHeading({ eyebrow, title, description, action, align = "left" }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16 ${align === "center" ? "text-center md:items-center" : ""}`}>
      <div className="max-w-[680px]">
        {eyebrow && (
          <span className="block text-xs uppercase tracking-[0.16em] font-semibold text-[#E66F52] mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#171717] leading-[1.15]">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base sm:text-lg text-[#5F5A57] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
