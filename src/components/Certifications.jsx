import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import CertificationDetailModal from './CertificationDetailModal';
import { Award, ExternalLink, Calendar, CheckCircle2, Eye, FileCheck, ArrowUpRight } from 'lucide-react';

export default function Certifications() {
  const { certifications } = usePortfolioData();
  const [activeCert, setActiveCert] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Filter strictly to visible certifications only
  const visibleCertifications = useMemo(() => {
    return (certifications || []).filter(
      (item) => item && item.isVisible !== false
    );
  }, [certifications]);

  // Extract all categories dynamically from visible certifications
  const categories = useMemo(() => {
    const set = new Set(['Semua']);
    visibleCertifications.forEach((c) => {
      if (c.category && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set);
  }, [visibleCertifications]);

  // Auto-reset active category if it no longer exists
  useEffect(() => {
    if (activeCategory !== 'Semua' && !categories.includes(activeCategory)) {
      setActiveCategory('Semua');
    }
  }, [categories, activeCategory]);

  // Filter certifications by selected category
  const filteredCertifications = useMemo(() => {
    return visibleCertifications.filter((item) =>
      activeCategory === 'Semua' ? true : (item.category || '').trim() === activeCategory
    );
  }, [visibleCertifications, activeCategory]);

  // CRITICAL REQUIREMENT: Do NOT render section on landing page if empty!
  if (!visibleCertifications || visibleCertifications.length === 0) {
    return null;
  }

  return (
    <section id="certifications" className="py-20 md:py-28 lg:py-36 bg-[#F6E7DF]/40 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Section Heading with Dynamic Category Filter Pills */}
        <Reveal variant="fade-up">
          <SectionHeading
            eyebrow="VERIFIED CREDENTIALS"
            title={
              <>
                Sertifikasi &amp; Lisensi <br className="hidden sm:inline" />
                Kompetensi Profesional.
              </>
            }
            description="Bukti kredensial terverifikasi dari berbagai lembaga kredibel yang menguji dan mengakui standar keahlian. Klik untuk melihat detail sertifikat selengkapnya."
            action={
              categories.length > 1 && (
                <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-white/70 backdrop-blur-md border border-[rgba(23,23,23,0.06)] shadow-xs overflow-x-auto max-w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-[#E66F52] text-white shadow-xs font-semibold'
                          : 'text-[#5F5A57] hover:text-[#171717] hover:bg-black/[0.03]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )
            }
          />
        </Reveal>

        {/* Certifications Grid */}
        {filteredCertifications.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border border-[rgba(23,23,23,0.06)] mt-8">
            <Award className="w-10 h-10 text-[#5F5A57]/40 mx-auto mb-3" />
            <p className="text-sm text-[#5F5A57] font-medium">
              Belum ada sertifikasi dalam kategori "{activeCategory}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {filteredCertifications.map((item, index) => (
            <Reveal
              key={item.id || index}
              variant="fade-up"
              delay={index * 100}
            >
              <div
                onClick={() => setActiveCert(item)}
                className="group rounded-[32px] bg-white border border-[rgba(23,23,23,0.08)] hover:border-[#E66F52]/40 overflow-hidden shadow-xs hover:shadow-subtle transition-all duration-300 flex flex-col justify-between h-full hover-lift cursor-pointer relative"
              >
                <div>
                  {/* Certificate Image Banner */}
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
                      {item.category && (
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#171717]/85 text-white backdrop-blur-xs shadow-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-[#FBEFE9]/70 flex items-center justify-center relative border-b border-[rgba(23,23,23,0.06)]">
                      <Award className="w-10 h-10 text-[#E66F52]" />
                      {item.category && (
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#171717]/85 text-white backdrop-blur-xs shadow-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#171717] tracking-tight mb-1.5 group-hover:text-[#E66F52] transition-colors flex items-start justify-between gap-2">
                      <span>{item.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#5F5A57] group-hover:text-[#E66F52] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 mt-1" />
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

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3 border-t border-[rgba(23,23,23,0.04)] mt-2 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] group-hover:text-[#E66F52] transition-colors">
                    <span>Lihat Selengkapnya</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>

                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F5A57] hover:text-[#E66F52] transition-colors"
                      title="Buka link verifikasi langsung"
                    >
                      <span>Verifikasi</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      </div>

      {/* Certification Detail Modal */}
      {activeCert && (
        <CertificationDetailModal
          cert={activeCert}
          onClose={() => setActiveCert(null)}
        />
      )}
    </section>
  );
}
