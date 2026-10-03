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
  const { hydrateFromStorage } = usePortfolioData();

  React.useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  React.useEffect(() => {
    console.log('[Vezta Sync] landing mounted, re-fetch from storage');
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <div className="min-h-screen bg-[#F8EEE8] text-[#171717] selection:bg-[#F4B09D] selection:text-[#171717] flex flex-col font-sans">
      {/* Smooth Ambient Custom Cursor */}
      <CustomCursor />

      {/* Fixed/Sticky Navigation */}
      <Navbar />

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
