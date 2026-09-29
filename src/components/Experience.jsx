import React, { useState } from 'react';
import { experienceData as fallbackExperience } from '../data/experience';
import { usePortfolioData } from '../context/PortfolioDataContext';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Experience() {
  const { experience: dynamicExperience } = usePortfolioData();
  const experienceData = (dynamicExperience && dynamicExperience.length > 0) ? dynamicExperience : fallbackExperience;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="experience" className="py-20 md:py-28 lg:py-36 bg-[#F6E7DF]/60">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Section Heading with Reveal */}
        <Reveal variant="fade-up">
          <SectionHeading
            eyebrow="CAREER PATH"
            title={
              <>
                A few places where <br className="hidden sm:inline" />
                I've made an impact.
              </>
            }
            description="Over 8 years partnering with venture-backed startups and design studios to bring ambitious creative visions to life."
          />
        </Reveal>

        {/* Experience Timeline Rows */}
        <div className="flex flex-col divide-y divide-[rgba(23,23,23,0.08)] border-t border-b border-[rgba(23,23,23,0.08)]">
          {experienceData.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <Reveal
                key={index}
                variant="fade-up"
                delay={index * 100}
              >
                <div
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group py-8 sm:py-10 px-4 sm:px-6 rounded-2xl transition-all duration-300 relative ${
                    isHovered
                      ? 'bg-[#FBEFE9] shadow-sm translate-x-2'
                      : 'bg-transparent'
                  }`}
                >
                  {/* Left Accent indicator line on hover */}
                  <div
                    className={`absolute left-0 top-6 bottom-6 w-1 rounded-full bg-[#E66F52] transition-all duration-300 ${
                      isHovered ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                    }`}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                    
                    {/* Period */}
                    <div className="md:col-span-3">
                      <span className="inline-block text-sm sm:text-base font-semibold text-[#E66F52] tracking-tight">
                        {item.period}
                      </span>
                      <span className="block text-xs text-[#5F5A57] mt-1">
                        {item.location}
                      </span>
                    </div>

                    {/* Role & Company */}
                    <div className="md:col-span-4">
                      <h3 className="text-xl sm:text-2xl font-medium text-[#171717] group-hover:text-[#E66F52] transition-colors">
                        {item.role}
                      </h3>
                      <p className="text-sm sm:text-base text-[#5F5A57] font-normal mt-0.5">
                        {item.company}
                      </p>
                    </div>

                    {/* Narrative Description & Highlights */}
                    <div className="md:col-span-5 flex flex-col justify-between">
                      <p className="text-sm sm:text-base text-[#5F5A57] leading-relaxed mb-4">
                        {item.description}
                      </p>
                      
                      {/* Tags / Key Highlights */}
                      <div className="flex flex-wrap gap-2">
                        {item.highlights.map((highlight, hIdx) => (
                          <span
                            key={hIdx}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/70 text-[#171717] border border-[rgba(23,23,23,0.06)] group-hover:border-[#E66F52]/20 transition-colors"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
