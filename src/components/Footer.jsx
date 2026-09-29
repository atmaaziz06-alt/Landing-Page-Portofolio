import React from 'react';
import { ArrowUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profileData as fallbackProfile } from '../data/profile';
import { usePortfolioData } from '../context/PortfolioDataContext';

export default function Footer() {
  const { settings, profile } = usePortfolioData();
  const brand = settings?.brandName || profile?.brandName || fallbackProfile.brandName;
  const copyright = settings?.footerCopyright || `${brand}. All rights reserved.`;
  const note = settings?.footerNote || 'Designed & built with intention.';

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
              <span>{brand}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E66F52] ml-1 inline-block"></span>
            </div>
            <p className="text-xs sm:text-sm text-[#5F5A57]">
              © {new Date().getFullYear()} {copyright}
            </p>
          </div>

          {/* Center: Built with Intention & Admin portal link */}
          <div className="flex items-center gap-4 text-xs text-[#5F5A57]">
            <span className="italic">{note}</span>
            <span>•</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 hover:text-[#E66F52] transition-colors py-1 px-2 rounded-md hover:bg-black/5"
              title="Admin CMS Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Login</span>
            </Link>
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
