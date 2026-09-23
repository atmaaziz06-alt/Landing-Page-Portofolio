import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import TiltCard from './TiltCard';

export default function ProjectCard({ project, onClick, className = '' }) {
  return (
    <TiltCard
      maxTilt={6}
      glare={true}
      onClick={() => onClick(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(project);
        }
      }}
      aria-label={`View details for ${project.title}`}
      className={`group relative flex flex-col rounded-[26px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-3.5 sm:p-4 cursor-pointer hover:shadow-subtle transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-[#E66F52] overflow-hidden ${className}`}
    >
      {/* Image Container 4:3 with overflow hidden */}
      <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-[#F6E7DF] mb-4 flex items-center justify-center">
        {project.category === 'Desain Grafis' ? (
          <>
            {/* Ambient blurred backdrop so the landscape frame stays rich and filled */}
            <img
              src={project.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/[0.06] backdrop-blur-[2px]" />

            {/* Original uncropped poster / design */}
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="relative z-[1] w-full h-full object-contain p-2 sm:p-2.5 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
              width="600"
              height="450"
            />
          </>
        ) : (
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover img-zoom"
            width="600"
            height="450"
          />
        )}

        {/* Floating Category Badge with backdrop blur */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/90 backdrop-blur-md text-[#171717] border border-white/80 shadow-xs group-hover:bg-white group-hover:text-[#E66F52] transition-colors duration-200">
            {project.category}
          </span>
        </div>

        {/* Subtle Dark Gradient Overlay on Hover for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[2]" />
      </div>

      {/* Card Info Footer */}
      <div className="flex items-center justify-between px-2 pb-1.5 pt-0.5">
        <div>
          <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#171717] group-hover:text-[#E66F52] transition-colors duration-200">
            {project.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-0.5">
            {project.type}
          </p>
        </div>

        {/* Circular Arrow Button with micro-rotation */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(project);
          }}
          aria-label={`Buka detail ${project.title}`}
          className="w-10 h-10 rounded-full bg-white/85 group-hover:bg-[#E66F52] border border-[rgba(23,23,23,0.08)] flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0 group-hover:scale-105 cursor-pointer focus:outline-none"
        >
          <ArrowUpRight className="w-4 h-4 text-[#171717] group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
        </button>
      </div>
    </TiltCard>
  );
}
