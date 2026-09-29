import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { servicesData as fallbackServices } from '../data/services';
import { usePortfolioData } from '../context/PortfolioDataContext';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import TiltCard from './TiltCard';

export default function Services() {
  const { skills: dynamicSkills } = usePortfolioData();
  const servicesData = (dynamicSkills && dynamicSkills.length > 0) ? dynamicSkills : fallbackServices;
  return (
    <section id="services" className="py-20 md:py-28 lg:py-36">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <Reveal variant="fade-up">
          <SectionHeading
            eyebrow="CAPABILITIES"
            title={
              <>
                What I can help <br className="hidden sm:inline" />
                you build.
              </>
            }
            description="A holistic approach combining brand strategy, human-centered UI/UX, and creative art direction."
          />
        </Reveal>

        {/* 4 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((service, index) => (
            <Reveal
              key={index}
              variant="fade-up"
              delay={index * 120}
            >
              <TiltCard
                maxTilt={5}
                glare={true}
                className="group flex flex-col justify-between p-7 sm:p-8 rounded-[24px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] shadow-card hover:shadow-subtle transition-all duration-300 h-full"
              >
                <div>
                  {/* Number & Arrow Header */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-semibold tracking-wider text-[#E66F52] font-mono">
                      {service.number}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/70 group-hover:bg-[#E66F52] flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-110">
                      <ArrowUpRight className="w-4 h-4 text-[#5F5A57] group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-medium tracking-tight text-[#171717] group-hover:text-[#E66F52] transition-colors mb-3">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#5F5A57] leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Deliverable Tags */}
                <div className="pt-4 border-t border-[rgba(23,23,23,0.06)] flex flex-col space-y-1.5">
                  {service.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs text-[#5F5A57] group-hover:text-[#171717] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E66F52] group-hover:scale-125 transition-transform" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>

              </TiltCard>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
