import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Stats from './Stats';
import Reveal from './Reveal';
import TiltCard from './TiltCard';

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 lg:py-36 bg-[#F6E7DF]/40">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
          
          {/* Left Column: Secondary Portrait / Studio Image with 3D Tilt */}
          <div className="lg:col-span-5 relative">
            <Reveal variant="scale-up">
              {/* Ambient Background Accent */}
              <div 
                className="absolute -top-6 -left-6 w-full h-full rounded-[32px] bg-[#F4B09D]/25 -z-10 animate-pulse-subtle"
                aria-hidden="true"
              />

              <TiltCard
                maxTilt={6}
                glare={true}
                className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden border-4 border-white/70 shadow-subtle bg-[#F8EEE8] group"
              >
                <img
                  src="/assets/images/about-user.jpg"
                  alt="Raditya Atma Aziz"
                  className="w-full h-full object-cover object-top img-zoom"
                  loading="lazy"
                />

                {/* Floating Studio Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-[18px] glass-card border border-white/80 shadow-card animate-float-slow">
                  <p className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E66F52]" />
                    Design Philosophy
                  </p>
                  <p className="text-xs text-[#5F5A57] mt-0.5 italic">
                    "Simplicity is not the absence of clutter, but the presence of purpose."
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          </div>

          {/* Right Column: Editorial Bio Narrative with Staggered Reveal */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Reveal variant="fade-up" delay={100}>
              <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[#E66F52] mb-3 inline-block">
                ABOUT ME
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#171717] leading-[1.15] mb-6">
                Designing with <br />
                <span className="text-[#E66F52]">clarity</span> and intention.
              </h2>

              <p className="text-base sm:text-lg text-[#171717] font-medium leading-relaxed mb-4">
                I'm a multidisciplinary designer focused on building brands and digital experiences that feel clear, human, and memorable.
              </p>

              <p className="text-base text-[#5F5A57] leading-relaxed mb-8">
                I work with ambitious startups, founders, and creative teams to turn ideas into thoughtful visual experiences. With a background blending typography, user-centered interface architecture, and brand storytelling, I craft systems that don't just look stunning—they solve real human problems and scale alongside growing businesses.
              </p>
            </Reveal>

            {/* Core Values / Focus */}
            <Reveal variant="fade-up" delay={200}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/50 border border-[rgba(23,23,23,0.04)] hover:bg-white transition-colors duration-200">
                  <div className="w-5 h-5 rounded-full bg-[#E66F52]/15 flex items-center justify-center text-[#E66F52] flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#E66F52]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717]">Strategic Craft</h4>
                    <p className="text-xs text-[#5F5A57] mt-0.5">Every design decision backed by clear brand objectives.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/50 border border-[rgba(23,23,23,0.04)] hover:bg-white transition-colors duration-200">
                  <div className="w-5 h-5 rounded-full bg-[#E66F52]/15 flex items-center justify-center text-[#E66F52] flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#E66F52]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717]">Human-Centric</h4>
                    <p className="text-xs text-[#5F5A57] mt-0.5">Interfaces crafted for warmth, clarity, and tactile delight.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* CTA Link */}
            <Reveal variant="fade-up" delay={300}>
              <div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#171717] hover:text-[#E66F52] group transition-colors"
                >
                  <span>Read more about my background</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </a>
              </div>
            </Reveal>

          </div>

        </div>

        {/* Statistics Component */}
        <Reveal variant="fade-up" delay={200}>
          <Stats />
        </Reveal>

      </div>
    </section>
  );
}
