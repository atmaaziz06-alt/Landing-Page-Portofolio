import React from 'react';
import { ArrowUp } from 'lucide-react';
import { profileData } from '../data/profile';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 border-t border-[rgba(23,23,23,0.08)] bg-[#F8EEE8]">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Brand Monogram & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center text-xl font-bold tracking-tight text-[#171717]">
              <span>Vezta Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E66F52] ml-1 inline-block"></span>
            </div>
            <p className="text-xs sm:text-sm text-[#5F5A57]">
              © {new Date().getFullYear()} {profileData.brandName}. All rights reserved.
            </p>
          </div>

          {/* Center: Built with Intention */}
          <div className="text-xs text-[#5F5A57] italic">
            Designed & built with intention.
          </div>

          {/* Right: Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#171717] hover:text-[#E66F52] px-4 py-2 rounded-full bg-white/70 hover:bg-white border border-[rgba(23,23,23,0.08)] shadow-xs transition-all group"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

        </div>
      </div>
    </footer>
  );
}
