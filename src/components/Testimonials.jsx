import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialsData } from '../data/testimonials';
import Reveal from './Reveal';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = testimonialsData.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const current = testimonialsData[currentIndex];

  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        <Reveal variant="fade-up">
          {/* Main Testimonial Card */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative w-full rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-8 sm:p-12 lg:p-14 shadow-card hover:shadow-subtle transition-all duration-300"
          >
            {/* Subtle corner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#F4B09D]/20 to-transparent blur-2xl pointer-events-none -z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Quote icon & text with animated transition key */}
              <div
                key={`quote-${currentIndex}`}
                className="lg:col-span-8 flex items-start gap-4 sm:gap-6 animate-in fade-in duration-300"
              >
                <div className="text-[#E66F52] select-none flex-shrink-0">
                  <span className="font-serif text-5xl sm:text-6xl md:text-7xl leading-none block font-bold text-[#E66F52]">
                    “
                  </span>
                </div>
                <div>
                  <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[#171717] leading-snug sm:leading-relaxed">
                    {current.quote}
                  </blockquote>
                </div>
              </div>

              {/* Author info & controls */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-[rgba(23,23,23,0.08)]">
                
                {/* Author badge with animated key */}
                <div
                  key={`author-${currentIndex}`}
                  className="flex items-center gap-4 animate-in fade-in duration-300"
                >
                  <img
                    src={current.avatar}
                    alt={current.author}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-[#E66F52]/20"
                    width="56"
                    height="56"
                  />
                  <div className="text-left">
                    <h4 className="text-base sm:text-lg font-semibold text-[#171717]">
                      {current.author}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5F5A57]">
                      {current.role}, {current.company}
                    </p>
                  </div>
                </div>

                {/* Navigation controls & Dots */}
                <div className="flex items-center gap-4">
                  {/* Dots indicator */}
                  <div className="flex items-center gap-1.5 mr-2">
                    {testimonialsData.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Go to testimonial ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentIndex === idx
                            ? 'w-7 bg-[#E66F52]'
                            : 'w-2 bg-[#5F5A57]/30 hover:bg-[#5F5A57]/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Arrow Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      aria-label="Previous testimonial"
                      className="w-10 h-10 rounded-full bg-white/80 hover:bg-[#E66F52] hover:text-white text-[#171717] border border-[rgba(23,23,23,0.08)] flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label="Next testimonial"
                      className="w-10 h-10 rounded-full bg-white/80 hover:bg-[#E66F52] hover:text-white text-[#171717] border border-[rgba(23,23,23,0.08)] flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
