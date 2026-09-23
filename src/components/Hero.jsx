import React, { useRef, useState } from 'react';
import { ArrowRight, User, Download, Sparkles } from 'lucide-react';
import { profileData } from '../data/profile';
import Reveal from './Reveal';

export default function Hero() {
  const portraitSectionRef = useRef(null);
  const [portraitTilt, setPortraitTilt] = useState({ rotateX: 0, rotateY: 0 });

  const scrollToWork = (e) => {
    e.preventDefault();
    document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = (e) => {
    e.preventDefault();
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mouse parallax tilt on portrait column
  const handleMouseMove = (e) => {
    const section = portraitSectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setPortraitTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setPortraitTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-36 overflow-hidden">
      {/* Background Soft Coral Ambient Glow with slow floating animation */}
      <div 
        className="absolute top-10 right-0 w-[500px] md:w-[700px] h-[500px] md:h-[700px] pointer-events-none rounded-full ambient-glow-strong blur-3xl opacity-80 -z-10 translate-x-1/4 -translate-y-12 animate-pulse-subtle"
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/2 left-[-100px] w-[400px] h-[400px] pointer-events-none rounded-full ambient-glow blur-2xl opacity-40 -z-10 animate-float-slow"
        aria-hidden="true"
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center z-10">
            {/* Status Eyebrow with animated dot */}
            <Reveal variant="fade-up" delay={50}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[rgba(23,23,23,0.08)] w-fit mb-6 text-xs font-medium text-[#5F5A57] shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E66F52] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E66F52]"></span>
                </span>
                <span>Brand & Digital Product Studio</span>
              </div>
            </Reveal>

            {/* Huge Impactful Heading with staggered reveal */}
            <Reveal variant="fade-up" delay={150}>
              <h1 className="text-[44px] sm:text-[62px] md:text-[76px] lg:text-[88px] leading-[1.05] font-medium tracking-tight text-[#171717] mb-6">
                Hi, I'm <br />
                <span className="text-[#E66F52] font-semibold bg-gradient-to-r from-[#E66F52] via-[#E66F52] to-[#F4B09D] bg-clip-text text-transparent">
                  {profileData.name}.
                </span>
              </h1>
            </Reveal>

            {/* Subheading / Role */}
            <Reveal variant="fade-up" delay={250}>
              <p className="text-xl sm:text-2xl font-medium text-[#171717] mb-3">
                {profileData.role} <br className="hidden sm:inline" />
                <span className="text-[#5F5A57] font-normal">based in {profileData.location}.</span>
              </p>
            </Reveal>

            {/* Narrative Description */}
            <Reveal variant="fade-up" delay={350}>
              <p className="text-base sm:text-lg text-[#5F5A57] max-w-[540px] leading-relaxed mb-9">
                {profileData.description}
              </p>
            </Reveal>

            {/* CTA Buttons */}
            <Reveal variant="fade-up" delay={450}>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#work"
                  onClick={scrollToWork}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-sm sm:text-base font-medium shadow-card hover:shadow-float transition-all duration-300 hover-lift group"
                >
                  <span>View my work</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </a>

                <a
                  href="#about"
                  onClick={scrollToAbout}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#171717] text-sm sm:text-base font-medium border border-[rgba(23,23,23,0.12)] shadow-card transition-all duration-300 hover-lift group"
                >
                  <span>About me</span>
                  <User className="w-4 h-4 text-[#5F5A57] group-hover:text-[#171717] transition-colors" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Hero Portrait with 3D Depth & Floating Availability Card */}
          <div 
            ref={portraitSectionRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-5 relative flex justify-center lg:justify-end items-center perspective-1000"
          >
            {/* Soft Ambient Radial Behind Portrait */}
            <div 
              className="absolute w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-[#F4B09D]/30 to-[#E66F52]/20 blur-xl -z-1 animate-pulse-subtle"
              aria-hidden="true"
            />

            {/* Floating Decorative Experience Badge (Top Left of Portrait) */}
            <div 
              className="absolute -top-4 -left-4 sm:top-2 sm:left-4 z-20 px-3.5 py-2 rounded-full glass-card border border-white/90 shadow-card flex items-center gap-2 animate-float-reverse pointer-events-none"
              style={{
                transform: `perspective(1000px) translateZ(30px)`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E66F52]" />
              <span className="text-xs font-semibold text-[#171717]">Creative Direction</span>
            </div>

            {/* Portrait 3D Parallax Container */}
            <div 
              className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px] rounded-full overflow-hidden border-[6px] border-white/70 shadow-subtle bg-[#F6E7DF] preserve-3d transition-transform duration-300 ease-out"
              style={{
                transform: `rotateX(${portraitTilt.rotateX}deg) rotateY(${portraitTilt.rotateY}deg)`,
              }}
            >
              <img
                src="/assets/images/user-portrait.png"
                alt={`Portrait of ${profileData.name}, ${profileData.role}`}
                className="w-full h-full object-cover scale-105 transition-transform duration-500 hover:scale-110"
                style={{ objectPosition: 'center 15%' }}
                loading="eager"
                width="460"
                height="460"
              />
            </div>

            {/* Floating Availability Card (Overlapping portrait with depth parallax) */}
            <div 
              className="absolute -bottom-6 right-2 sm:right-6 lg:-right-4 w-[240px] sm:w-[270px] p-5 sm:p-6 rounded-[22px] glass-card shadow-subtle border border-white/80 animate-float-slow z-20"
              style={{
                transform: `perspective(1000px) rotateX(${portraitTilt.rotateX * 1.2}deg) rotateY(${portraitTilt.rotateY * 1.2}deg) translateZ(40px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E66F52] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E66F52]"></span>
                </span>
                <span className="text-xs font-semibold text-[#E66F52] tracking-wide uppercase">
                  {profileData.availability.badge}
                </span>
              </div>

              {/* Status Message */}
              <p className="text-xs sm:text-sm text-[#171717] font-medium leading-snug mb-4">
                {profileData.availability.statusText}{' '}
                <span className="font-semibold">{profileData.availability.period}</span>
              </p>

              {/* Download Resume Action */}
              <a
                href={profileData.availability.resumeUrl}
                download={profileData.availability.resumeUrl.split('/').pop()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-full bg-white/80 hover:bg-white text-xs font-medium text-[#171717] border border-[rgba(23,23,23,0.08)] shadow-sm hover:shadow transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#F8EEE8] flex items-center justify-center text-[#5F5A57] group-hover:text-[#E66F52] transition-colors">
                    <Download className="w-3 h-3" />
                  </div>
                  <span>{profileData.availability.resumeLabel}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#5F5A57] group-hover:translate-x-1 group-hover:text-[#E66F52] transition-all" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
