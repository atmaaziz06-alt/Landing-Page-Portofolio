import React, { useState, useRef, useMemo } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Pause, Play, LayoutGrid } from 'lucide-react';
import { projects as fallbackProjects } from '../data/projects';
import { usePortfolioData } from '../context/PortfolioDataContext';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Projects() {
  const { projects: dynamicProjects } = usePortfolioData();
  const projects = (dynamicProjects && dynamicProjects.length > 0) ? dynamicProjects : fallbackProjects;

  const [selectedProject, setSelectedProject] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);

  // Dynamic categories with default fallback
  const categories = useMemo(() => {
    const set = new Set(['All', 'Desain Grafis', 'Ai Video Content', 'UI/UX']);
    projects.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [projects]);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    return projects.filter((item) =>
      activeCategory === 'All' ? true : item.category === activeCategory
    );
  }, [projects, activeCategory]);

  // Marquee projects: dynamically generated to fit continuous infinite loop for ANY category
  const marqueeProjects = useMemo(() => {
    if (filteredProjects.length === 0) return [];
    if (filteredProjects.length === 1) {
      return Array(8).fill(filteredProjects[0]);
    }
    if (filteredProjects.length <= 3) {
      return [...filteredProjects, ...filteredProjects, ...filteredProjects, ...filteredProjects];
    }
    return [...filteredProjects, ...filteredProjects];
  }, [filteredProjects]);

  // Manual scroll helper for horizontal track
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="work" className="py-20 md:py-28 lg:py-36 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Section Header with Reveal */}
        <Reveal variant="fade-up">
          <SectionHeading
            eyebrow="SELECTED WORK"
            title={
              <>
                Designing digital <br className="hidden sm:inline" />
                experiences that <br className="hidden sm:inline" />
                make an impact.
              </>
            }
            action={
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Category Filter Pills (Always active in both Slider & Grid modes) */}
                <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-white/70 backdrop-blur-md border border-[rgba(23,23,23,0.06)] shadow-xs overflow-x-auto max-w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-[#E66F52] text-white shadow-xs'
                          : 'text-[#5F5A57] hover:text-[#171717] hover:bg-black/[0.03]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle: Grid vs Auto-Scroll Marquee */}
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/85 hover:bg-white text-xs sm:text-sm font-medium text-[#171717] border border-[rgba(23,23,23,0.1)] shadow-card transition-all duration-300 hover-lift group cursor-pointer whitespace-nowrap"
                >
                  {showAll ? (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E66F52] animate-pulse" />
                      <span>Mode Geser Otomatis</span>
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="w-4 h-4 text-[#5F5A57] group-hover:text-[#E66F52] transition-colors" />
                      <span>Tampilan Grid ({filteredProjects.length})</span>
                    </>
                  )}
                </button>
              </div>
            }
          />
        </Reveal>

      </div>

      {/* Main Content Area with Smooth Mode Transition */}
      <div className="relative mt-4 transition-opacity duration-500 ease-out">
        {!showAll ? (
          /* ============================================================ */
          /* 1. HORIZONTAL AUTO-SCROLLING TRACK (FEATURED SHOWCASE)       */
          /* ============================================================ */
          <div className="w-full relative group">
            {/* Top subtle indicator bar */}
            <div className="max-w-[1240px] mx-auto px-5 sm:px-8 mb-4 flex items-center justify-between text-xs text-[#5F5A57]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E66F52] opacity-75 ${isPaused ? 'hidden' : ''}`} />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E66F52]" />
                </span>
                <span className="font-medium tracking-wide">
                  {isPaused ? 'Dijeda (Hover) • Klik kartu untuk detail' : `Berjalan Otomatis (${activeCategory}) • Arahkan kursor untuk jeda`}
                </span>
              </div>

              {/* Pause/Play & Manual Navigation Controls */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white border border-[rgba(23,23,23,0.08)] text-[#5F5A57] hover:text-[#171717] transition-colors cursor-pointer"
                  title={isPaused ? "Lanjutkan pergeseran" : "Jeda pergeseran"}
                  aria-label={isPaused ? "Play animation" : "Pause animation"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-[#E66F52] fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white border border-[rgba(23,23,23,0.08)] text-[#5F5A57] hover:text-[#171717] transition-colors cursor-pointer"
                  title="Geser ke kiri"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white border border-[rgba(23,23,23,0.08)] text-[#5F5A57] hover:text-[#171717] transition-colors cursor-pointer"
                  title="Geser ke kanan"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Gradient Fades on Left & Right Edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 md:w-36 bg-gradient-to-r from-[#F8EEE8] via-[#F8EEE8]/80 to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 md:w-36 bg-gradient-to-l from-[#F8EEE8] via-[#F8EEE8]/80 to-transparent z-20" />

            {/* Continuous Marquee Track */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto no-scrollbar py-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className={`project-marquee-track ${isPaused ? 'is-paused' : ''}`}>
                {marqueeProjects.map((project, index) => (
                  <div
                    key={`${project.id}-marquee-${activeCategory}-${index}`}
                    className="w-[300px] sm:w-[360px] md:w-[400px] lg:w-[420px] min-w-[300px] sm:min-w-[360px] md:min-w-[400px] lg:min-w-[420px] flex-shrink-0 mx-2.5 sm:mx-3.5"
                  >
                    <ProjectCard
                      project={project}
                      onClick={(p) => setSelectedProject(p)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. ALL PROJECTS GRID VIEW (SMOOTH & STAGGERED ENTRANCE)      */
          /* ============================================================ */
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((project, index) => (
                <div
                  key={`${project.id}-grid-${index}`}
                  className="card-smooth-enter"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <ProjectCard
                    project={project}
                    onClick={(p) => setSelectedProject(p)}
                  />
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-16 text-[#5F5A57]">
                <p className="text-base">Tidak ada project untuk kategori ini.</p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className="mt-3 px-4 py-2 rounded-full bg-white text-xs font-medium text-[#E66F52] border border-[#E66F52]/30 shadow-xs hover:bg-[#FBEFE9] transition-colors"
                >
                  Tampilkan Semua Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Project Deep Dive */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
