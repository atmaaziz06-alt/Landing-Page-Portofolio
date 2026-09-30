// src/components/Certifications.jsx
import React, { useState } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { Award, ExternalLink, Calendar, CheckCircle2, Eye, X, FileCheck } from 'lucide-react';

export default function Certifications() {
  const { certifications } = usePortfolioData();
  const [activeCert, setActiveCert] = useState(null);

  // CRITICAL REQUIREMENT: Do NOT render section on landing page if empty!
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section id="certifications" className="py-20 md:py-28 lg:py-36 bg-[#F6E7DF]/40 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Section Heading */}
        <Reveal variant="fade-up">
          <SectionHeading
            eyebrow="VERIFIED CREDENTIALS"
            title={
              <>
                Sertifikasi &amp; Lisensi <br className="hidden sm:inline" />
                Kompetensi Profesional.
              </>
            }
            description="Bukti kredensial terverifikasi dari berbagai lembaga kredibel yang menguji dan mengakui standar keahlian."
          />
        </Reveal>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {certifications.map((item, index) => (
            <Reveal
              key={item.id || index}
              variant="fade-up"
              delay={index * 100}
            >
              <div className="group rounded-[32px] bg-white border border-[rgba(23,23,23,0.08)] overflow-hidden shadow-xs hover:shadow-subtle transition-all duration-300 flex flex-col justify-between h-full hover-lift">
                <div>
                  {/* Certificate Image Banner */}
                  {item.imageUrl && (
                    <div
                      onClick={() => setActiveCert(item)}
                      className="w-full h-48 sm:h-52 overflow-hidden bg-neutral-100 relative cursor-pointer group/img"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5 backdrop-blur-2xs">
                        <Eye className="w-4 h-4" />
                        <span>Pratinjau Sertifikat</span>
                      </div>
                      {item.category && (
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#171717]/85 text-white backdrop-blur-xs shadow-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    {/* Category pill if no image */}
                    {!item.imageUrl && item.category && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#E66F52]/15 text-[#E66F52] mb-3">
                        {item.category}
                      </span>
                    )}

                    <h3 className="text-lg sm:text-xl font-semibold text-[#171717] tracking-tight mb-1.5 group-hover:text-[#E66F52] transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#E66F52] mb-3">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{item.issuer}</span>
                    </div>

                    {item.issueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-[#5F5A57] mb-2">
                        <Calendar className="w-3.5 h-3.5 text-[#5F5A57]" />
                        <span>Terbit: {item.issueDate}</span>
                        {item.expiryDate && (
                          <span className="text-[11px] text-[#5F5A57]/80">· Berlaku: {item.expiryDate}</span>
                        )}
                      </div>
                    )}

                    {item.credentialId && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#5F5A57] bg-[#FBEFE9]/60 px-3 py-1.5 rounded-xl border border-[rgba(23,23,23,0.04)] mb-3">
                        <FileCheck className="w-3.5 h-3.5 text-[#E66F52] flex-shrink-0" />
                        <span className="truncate">ID: {item.credentialId}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs sm:text-sm text-[#5F5A57] leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Verification CTA */}
                <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3">
                  {item.credentialUrl ? (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E66F52] hover:text-[#D65F42] transition-colors group/link"
                    >
                      <span>Verifikasi Kredensial</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : item.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => setActiveCert(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] hover:text-[#E66F52] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Sertifikat</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

      {/* Lightbox Modal for Certificate Preview */}
      {activeCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveCert(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-[32px] p-6 sm:p-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,23,23,0.08)] mb-4">
              <div>
                <h3 className="font-semibold text-lg text-[#171717]">{activeCert.title}</h3>
                <p className="text-xs font-semibold text-[#E66F52]">{activeCert.issuer}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="p-2 rounded-full hover:bg-neutral-100 text-[#5F5A57] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeCert.imageUrl ? (
              <div className="flex justify-center max-h-[70vh] overflow-auto rounded-2xl bg-neutral-50 p-2">
                <img
                  src={activeCert.imageUrl}
                  alt={activeCert.title}
                  className="max-h-[65vh] w-auto rounded-xl object-contain shadow-sm"
                />
              </div>
            ) : null}

            {activeCert.credentialUrl && (
              <div className="mt-4 pt-4 border-t border-[rgba(23,23,23,0.06)] flex justify-end">
                <a
                  href={activeCert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E66F52] text-white text-xs font-semibold hover:bg-[#D65F42] shadow-xs"
                >
                  <span>Buka Tautan Kredensial Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
