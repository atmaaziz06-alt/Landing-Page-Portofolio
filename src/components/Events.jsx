// src/components/Events.jsx
import React from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { Calendar, MapPin, ExternalLink, Sparkles } from 'lucide-react';

export default function Events() {
  const { events } = usePortfolioData();

  // CRITICAL REQUIREMENT: Do NOT render section on landing page if empty!
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section id="events" className="py-20 md:py-28 lg:py-36 bg-[#F8EEE8] overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Section Heading */}
        <Reveal variant="fade-up">
          <SectionHeading
            eyebrow="EVENTS & ACTIVITIES"
            title={
              <>
                Aktivitas, Workshop &amp; <br className="hidden sm:inline" />
                Kegiatan yang Pernah Diikuti.
              </>
            }
            description="Rekam jejak keikutsertaan dalam forum kreatif, seminar teknologi, kompetisi, dan program pelatihan kolaboratif."
          />
        </Reveal>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {events.map((item, index) => (
            <Reveal
              key={item.id || index}
              variant="fade-up"
              delay={index * 100}
            >
              <div className="group rounded-[32px] bg-white border border-[rgba(23,23,23,0.08)] overflow-hidden shadow-xs hover:shadow-subtle transition-all duration-300 flex flex-col justify-between h-full hover-lift">
                <div>
                  {/* Photo Documentation */}
                  {item.imageUrl && (
                    <div className="w-full h-48 sm:h-52 overflow-hidden bg-neutral-100 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {item.role && (
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E66F52] text-white shadow-xs">
                          {item.role}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    {/* Role badge if no image */}
                    {!item.imageUrl && item.role && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#E66F52]/15 text-[#E66F52] mb-3">
                        {item.role}
                      </span>
                    )}

                    <h3 className="text-lg sm:text-xl font-semibold text-[#171717] tracking-tight mb-1 group-hover:text-[#E66F52] transition-colors">
                      {item.title}
                    </h3>

                    {item.organizer && (
                      <p className="text-xs sm:text-sm font-medium text-[#E66F52] mb-3">
                        {item.organizer}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#5F5A57] mb-4">
                      {(item.date || item.period) && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#E66F52]" />
                          <span>{item.date || item.period}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#5F5A57]" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs sm:text-sm text-[#5F5A57] leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {item.linkUrl && (
                  <div className="px-6 pb-6 pt-0">
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#E66F52] hover:text-[#D65F42] transition-colors group/link"
                    >
                      <span>Lihat Dokumentasi Kegiatan</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
