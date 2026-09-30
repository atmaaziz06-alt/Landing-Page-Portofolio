// src/components/Events.jsx
import React, { useState } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import EventDetailModal from './EventDetailModal';
import { Calendar, MapPin, ExternalLink, Eye, ArrowUpRight, Users } from 'lucide-react';

export default function Events() {
  const { events } = usePortfolioData();
  const [activeEvent, setActiveEvent] = useState(null);

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
            description="Rekam jejak keikutsertaan dalam forum kreatif, seminar teknologi, kompetisi, dan program pelatihan kolaboratif. Klik untuk melihat dokumentasi kegiatan selengkapnya."
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
              <div
                onClick={() => setActiveEvent(item)}
                className="group rounded-[32px] bg-white border border-[rgba(23,23,23,0.08)] hover:border-[#E66F52]/40 overflow-hidden shadow-xs hover:shadow-subtle transition-all duration-300 flex flex-col justify-between h-full hover-lift cursor-pointer relative"
              >
                <div>
                  {/* Photo Documentation Preview */}
                  {item.imageUrl ? (
                    <div className="w-full h-48 sm:h-52 overflow-hidden bg-neutral-100 relative group/img">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5 backdrop-blur-2xs">
                        <Eye className="w-4 h-4" />
                        <span>Klik untuk Lihat Selengkapnya</span>
                      </div>
                      {item.role && (
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E66F52] text-white shadow-xs">
                          {item.role}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-[#FBEFE9] flex items-center justify-center relative border-b border-[rgba(23,23,23,0.06)]">
                      <Users className="w-10 h-10 text-[#E66F52]" />
                      {item.role && (
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E66F52] text-white shadow-xs">
                          {item.role}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#171717] tracking-tight mb-1 group-hover:text-[#E66F52] transition-colors flex items-start justify-between gap-2">
                      <span>{item.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#5F5A57] group-hover:text-[#E66F52] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 mt-1" />
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

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3 border-t border-[rgba(23,23,23,0.04)] mt-2 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] group-hover:text-[#E66F52] transition-colors">
                    <span>Lihat Selengkapnya</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>

                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F5A57] hover:text-[#E66F52] transition-colors"
                      title="Buka link dokumentasi eksternal"
                    >
                      <span>Dokumentasi</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

      {/* Event Detail Modal */}
      {activeEvent && (
        <EventDetailModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </section>
  );
}
