import React, { useState } from 'react';
import { ArrowRight, Mail, Phone, Check } from 'lucide-react';
import { profileData } from '../data/profile';
import Reveal from './Reveal';

// Clean, precise social icons
const SocialIcon = ({ name }) => {
  if (name === 'LinkedIn') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74V9.92H5.06v8.58h2.8z" />
      </svg>
    );
  }
  if (name === 'Google Drive') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M7.71 3.502L1.15 15l3.428 5.952 6.56-11.5L7.71 3.502zM9.73 15.002l-3.43 5.95h13.12l3.43-5.95H9.73zM22.85 13.5L16.29 2H9.43l6.56 11.5h6.86z" />
      </svg>
    );
  }
  if (name === 'GitHub') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  // Instagram
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
};

export default function ContactCTA() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const cleanPhone = (profileData.contact.whatsapp || profileData.contact.phone).replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent("Halo Atma, saya tertarik untuk mendiskusikan proyek baru dengan Anda.")}`;

  const emailSubject = encodeURIComponent("Project Inquiry — Vezta Studio");
  const emailBody = encodeURIComponent("Halo Atma,\n\nSaya tertarik untuk bekerja sama dalam proyek desain / web dengan Anda.\n\nDetail proyek:\n- Jenis Proyek:\n- Timeline / Deadline:\n- Estimasi Budget:\n\nTerima kasih!");
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${profileData.contact.email}&su=${emailSubject}&body=${emailBody}`;
  const mailtoUrl = `mailto:${profileData.contact.email}?subject=${emailSubject}&body=${emailBody}`;

  const handleEmailClick = (e) => {
    e.preventDefault();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = mailtoUrl;
    } else {
      window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Direct client to WhatsApp with their typed project message
    const messageText = `Halo Atma, nama saya *${formData.name}* (${formData.email}).\n\n*Detail Proyek:*\n${formData.message || 'Saya tertarik untuk mendiskusikan proyek baru.'}`;
    const directWaUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(messageText)}`;

    window.open(directWaUrl, '_blank', 'noopener,noreferrer');

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 5000);
  };

  return (
    <section id="contact" className="py-20 md:py-28 lg:py-36">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">

        <Reveal variant="scale-up">
          {/* Contact Container with Warm Accent Gradient */}
          <div className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#FCEBE6] via-[#FBEFE9] to-[#F4B09D]/30 border border-[#F4B09D]/40 p-8 sm:p-12 md:p-16 lg:p-20 shadow-subtle overflow-hidden">

            {/* Subtle Ambient Blob with float animation */}
            <div
              className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-[#E66F52]/12 blur-3xl pointer-events-none -z-1 animate-float-slow"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-[#F4B09D]/20 blur-2xl pointer-events-none -z-1 animate-float-reverse"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">

              {/* Left Content Column */}
              <div className="lg:col-span-7">
                <span className="inline-block text-xs uppercase tracking-[0.16em] font-semibold text-[#E66F52] mb-3">
                  LET'S TALK
                </span>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#171717] leading-[1.1] mb-6">
                  Let's create something <br />
                  <span className="text-[#E66F52]">amazing</span> together.
                </h2>

                <p className="text-base sm:text-lg text-[#5F5A57] max-w-[520px] leading-relaxed mb-10">
                  Have a project in mind, an idea to explore, or just want to connect? Let's talk about how we can turn your vision into something meaningful and enduring.
                </p>

                {/* Direct Reach Info */}
                <div className="flex flex-col sm:flex-row gap-6 mb-10">
                  <a
                    href={mailtoUrl}
                    onClick={handleEmailClick}
                    title="Kirim pesan via Email (Buka Gmail / Mail App)"
                    className="inline-flex items-center gap-3 text-sm sm:text-base font-medium text-[#171717] hover:text-[#E66F52] transition-colors group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-[rgba(23,23,23,0.08)] shadow-xs group-hover:bg-[#E66F52] group-hover:scale-105 transition-all">
                      <Mail className="w-4 h-4 text-[#5F5A57] group-hover:text-white transition-colors" />
                    </div>
                    <span>{profileData.contact.email}</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    onClick={handleWhatsAppClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chat langsung di WhatsApp"
                    className="inline-flex items-center gap-3 text-sm sm:text-base font-medium text-[#171717] hover:text-[#25D366] transition-colors group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-[rgba(23,23,23,0.08)] shadow-xs group-hover:bg-[#25D366] group-hover:border-[#25D366] group-hover:scale-105 transition-all">
                      <Phone className="w-4 h-4 text-[#5F5A57] group-hover:text-white transition-colors" />
                    </div>
                    <span>{profileData.contact.phone}</span>
                  </a>
                </div>

                {/* Social Channels */}
                <div className="flex items-center gap-3">
                  {profileData.contact.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="w-11 h-11 rounded-full bg-white/80 hover:bg-white text-[#171717] hover:text-[#E66F52] border border-[rgba(23,23,23,0.08)] flex items-center justify-center shadow-xs hover-lift transition-all hover:scale-105"
                    >
                      <SocialIcon name={social.name} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Right Quick Inquiry Form */}
              <div className="lg:col-span-5 w-full p-6 sm:p-8 rounded-[24px] bg-white/90 backdrop-blur-md border border-white shadow-card">
                <h3 className="text-lg font-semibold text-[#171717] mb-1">
                  Start a Conversation
                </h3>
                <p className="text-xs sm:text-sm text-[#5F5A57] mb-6">
                  Tell me a little about your project timeline and vision.
                </p>

                {formSubmitted ? (
                  <div className="p-6 rounded-2xl bg-[#FCEBE6] border border-[#F4B09D]/40 text-center animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-[#E66F52] text-white flex items-center justify-center mx-auto mb-3 animate-bounce">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-[#171717]">
                      Message Sent!
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5F5A57] mt-1">
                      Thanks for reaching out. Opening WhatsApp conversation...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-[#5F5A57] mb-1.5">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Alex Taylor"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8EEE8]/60 border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] placeholder:text-[#5F5A57]/50 focus:outline-none focus:border-[#E66F52] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-[#5F5A57] mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="alex@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8EEE8]/60 border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] placeholder:text-[#5F5A57]/50 focus:outline-none focus:border-[#E66F52] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-[#5F5A57] mb-1.5">
                        Project Details
                      </label>
                      <textarea
                        id="contact-message"
                        rows={3}
                        placeholder="Tell me about your goals, timeline, and scope..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8EEE8]/60 border border-[rgba(23,23,23,0.1)] text-sm text-[#171717] placeholder:text-[#5F5A57]/50 focus:outline-none focus:border-[#E66F52] focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-sm font-medium shadow-card hover:shadow-float transition-all duration-200 hover-lift group cursor-pointer"
                    >
                      <span>Send inquiry</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
