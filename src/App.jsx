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
        <div role="alert" className="mx-auto mt-24 w-full max-w-5xl px-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <p>Konten terbaru gagal dimuat dari server: {dataError.message}</p>
            <button
              type="button"
              onClick={() => refreshData()}
              className="shrink-0 rounded-full bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800"
            >
              Coba lagi
            </button>
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
