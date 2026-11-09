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
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-[#fff5f3] shadow-sm shadow-red-100/70">
              <span className="h-4 w-4 rounded-full bg-[#e54b3d]" aria-hidden="true" />
            </div>

            <div className="flex flex-1 flex-col gap-3 rounded-[26px] border border-[#f2b8b0] bg-[#f7e4e0] p-4 text-base leading-relaxed text-[#7f2a2a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="max-w-[95%] text-[0.98rem] font-medium text-[#7b2727] sm:text-[1.2rem]">
                Konten terbaru gagal dimuat dari server: {dataError.message}
              </p>

              <button
                type="button"
                onClick={() => refreshData()}
                className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#d74338] p-2 text-center text-[0.82rem] font-bold leading-[1.05rem] text-white shadow-md shadow-red-300/60 transition hover:bg-[#c53a31] focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
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
