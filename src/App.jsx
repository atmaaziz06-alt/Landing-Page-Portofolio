import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Certifications from './components/Certifications';
import Events from './components/Events';
import Services from './components/Services';
import About from './components/About';
import Testimonials from './components/Testimonials';
import ContactCTA from './components/ContactCTA';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import { useAuth } from './context/AuthContext';
import { usePortfolioData } from './context/PortfolioDataContext';

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  const { dataError, refreshData } = usePortfolioData();

  React.useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  return (
    <div className="min-h-screen bg-[#F8EEE8] text-[#171717] selection:bg-[#F4B09D] selection:text-[#171717] flex flex-col font-sans">
      {/* Smooth Ambient Custom Cursor */}
      <CustomCursor />

      {/* Fixed/Sticky Navigation */}
      <Navbar />

      {dataError && (
        <div role="alert" aria-live="assertive" className="mx-auto mt-24 w-full max-w-[1600px] px-5">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f3b1aa] bg-[#f7efed]">
              <span className="h-4 w-4 rounded-full bg-[#e14d3d]" aria-hidden="true" />
            </div>

            <div className="flex w-full items-center justify-between gap-4 rounded-[28px] border border-[#f0b8b2] bg-[#f6e1de] px-4 py-4 text-[#5d2a2a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:px-6">
              <p className="max-w-[calc(100%-96px)] text-[1.05rem] font-medium leading-relaxed text-[#6a2a2a] sm:text-[1.45rem] sm:leading-[1.5]">
                Konten terbaru gagal dimuat dari server: {dataError.message}
              </p>

              <button
                type="button"
                onClick={() => refreshData()}
                className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d5483a] px-3 text-center text-[1.05rem] font-bold leading-tight text-white shadow-[0_6px_18px_rgba(213,73,58,0.28)] transition hover:bg-[#c53d32] focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Trust Bar */}
        <TrustBar />

        {/* 3. Selected Projects */}
        <Projects />

        {/* 4. Experience Timeline */}
        <Experience />

        {/* 5. Certifications (Only renders if has items) */}
        <Certifications />

        {/* 6. Events & Activities (Only renders if has items) */}
        <Events />

        {/* 7. Services & Capabilities */}
        <Services />

        {/* 6. About Me & Stats */}
        <About />

        {/* 7. Client Testimonials Carousel */}
        <Testimonials />

        {/* 8. Contact & Conversation CTA */}
        <ContactCTA />
      </main>

      {/* 9. Minimal Editorial Footer */}
      <Footer />
    </div>
  );
}
