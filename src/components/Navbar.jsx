import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';

export default function Navbar() {
  const { settings, profile } = usePortfolioData();
  const brandName = settings?.brandName || profile?.brandName || 'Vezta Studio';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Work', href: '#work' },
    { label: 'Experience', href: '#experience' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3.5 glass-nav border-b border-[rgba(23,23,23,0.06)] shadow-sm'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="group flex items-center text-xl sm:text-2xl font-bold tracking-tight text-[#171717] transition-transform duration-200 active:scale-95"
          aria-label={`${brandName} Portfolio Home`}
        >
          <span>{brandName}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E66F52] ml-1 inline-block group-hover:scale-125 transition-transform duration-200"></span>
        </a>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm font-medium text-[#5F5A57] hover:text-[#171717] transition-colors duration-200 relative py-1 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#E66F52] transition-all duration-200 group-hover:w-full rounded-full"></span>
            </a>
          ))}
        </nav>

        {/* CTA Button Desktop */}
        <div className="hidden md:flex items-center">
          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white text-xs sm:text-sm font-medium text-[#171717] border border-[rgba(23,23,23,0.1)] shadow-card hover:shadow-subtle transition-all duration-200 hover-lift group"
          >
            <span>Let's talk</span>
            <ArrowUpRight className="w-4 h-4 text-[#5F5A57] group-hover:text-[#E66F52] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 rounded-full bg-white/70 border border-[rgba(23,23,23,0.08)] text-[#171717] hover:bg-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-[rgba(23,23,23,0.08)] px-6 py-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-base font-medium text-[#171717] hover:text-[#E66F52] py-1 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, '#contact')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#E66F52] text-white font-medium text-sm shadow-md hover:bg-[#D65F42] transition-colors"
              >
                <span>Let's talk</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
