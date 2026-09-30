// src/context/PortfolioDataContext.jsx
// Seamless data provider for the Public Landing Page
// Syncs with the Database / CMS with instant fallback to existing data

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

// Existing local fallbacks
import { profileData as fallbackProfile } from '../data/profile';
import { projects as fallbackProjects } from '../data/projects';
import { experienceData as fallbackExperience } from '../data/experience';
import { servicesData as fallbackServices } from '../data/services';
import { fallbackCertifications } from '../data/certifications';
import { fallbackEvents } from '../data/events';

const PortfolioDataContext = createContext(null);

export function PortfolioDataProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('vezta_profile_override');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...fallbackProfile,
          ...(parsed.avatarUrl ? { avatarUrl: parsed.avatarUrl } : {}),
          ...(parsed.aboutImageUrl ? { aboutImageUrl: parsed.aboutImageUrl } : {})
        };
      }
    } catch (_) {}
    return fallbackProfile;
  });
  const [projects, setProjects] = useState(fallbackProjects);
  const [experience, setExperience] = useState(fallbackExperience);
  const [skills, setSkills] = useState(fallbackServices);
  const [tools, setTools] = useState([]);
  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem('vezta_events_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return fallbackEvents;
  });
  const [certifications, setCertifications] = useState(() => {
    try {
      const stored = localStorage.getItem('vezta_certifications_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return fallbackCertifications;
  });
  const [contact, setContact] = useState({
    ctaTitle: "Have a project in mind? Let's create something iconic.",
    ctaDescription: "Currently accepting selected freelance and contract design projects. Available for creative direction, visual brand identity, and modern digital web experiences.",
    email: fallbackProfile.contact?.email || "atmaaziz06@gmail.com",
    phone: fallbackProfile.contact?.phone || "+62-877-6279-8586",
    whatsapp: fallbackProfile.contact?.whatsapp || "6287762798586",
    primaryBtnText: "Start a conversation",
    primaryBtnLink: "#contact",
    secondaryBtnText: "Email me directly",
    secondaryBtnLink: `mailto:${fallbackProfile.contact?.email || 'atmaaziz06@gmail.com'}`
  });
  const [socials, setSocials] = useState(fallbackProfile.contact?.socials || []);
  const [settings, setSettings] = useState({
    siteTitle: "Raditya Atma Aziz — Graphic Design & Web Designer",
    brandName: fallbackProfile.brandName || "Vezta Studio",
    footerBrand: fallbackProfile.brandName || "Vezta Studio",
    footerCopyright: `${fallbackProfile.brandName || 'Vezta Studio'}. All rights reserved.`,
    footerNote: "Designed & built with intention."
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublicData = useCallback(async () => {
    try {
      // 1. Profile
      const pRes = await api.getProfile().catch(() => null);
      let localOverride = null;
      try {
        const stored = localStorage.getItem('vezta_profile_override');
        if (stored) localOverride = JSON.parse(stored);
      } catch (_) {}

      if (pRes?.success && pRes.data) {
        setProfile((prev) => ({
          ...prev,
          name: pRes.data.name || prev.name,
          role: pRes.data.role || prev.role,
          brandName: pRes.data.brandName || prev.brandName,
          monogram: pRes.data.monogram || prev.monogram,
          eyebrow: pRes.data.eyebrow || prev.eyebrow,
          location: pRes.data.location || prev.location,
          headlinePrefix: pRes.data.headlinePrefix || prev.headlinePrefix,
          description: pRes.data.description || prev.description,
          bio: pRes.data.bio || prev.bio,
          avatarUrl: localOverride?.avatarUrl || pRes.data.avatarUrl || prev.avatarUrl,
          aboutImageUrl: localOverride?.aboutImageUrl || pRes.data.aboutImageUrl || prev.aboutImageUrl,
          availability: {
            ...prev.availability,
            ...(pRes.data.availability || {})
          }
        }));
      } else if (localOverride) {
        setProfile((prev) => ({
          ...prev,
          avatarUrl: localOverride.avatarUrl || prev.avatarUrl,
          aboutImageUrl: localOverride.aboutImageUrl || prev.aboutImageUrl
        }));
      }

      // 2. Projects (only visible)
      const projRes = await api.getProjects(false).catch(() => null);
      if (projRes?.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
        setProjects(projRes.data);
      }

      // 3. Experience (only visible)
      const expRes = await api.getExperience(false).catch(() => null);
      if (expRes?.success && Array.isArray(expRes.data) && expRes.data.length > 0) {
        setExperience(expRes.data);
      }

      // 4. Tools (only visible)
      const toolsRes = await api.getTools(false).catch(() => null);
      if (toolsRes?.success && Array.isArray(toolsRes.data)) {
        setTools(toolsRes.data);
      }

      // 5. Skills (only visible)
      const skillsRes = await api.getSkills(false).catch(() => null);
      if (skillsRes?.success && Array.isArray(skillsRes.data) && skillsRes.data.length > 0) {
        setSkills(skillsRes.data);
      }

      // 6. Contact & Socials
      const cRes = await api.getContact(false).catch(() => null);
      if (cRes?.success && cRes.data) {
        if (cRes.data.contact) {
          setContact(cRes.data.contact);
        }
        if (Array.isArray(cRes.data.socials) && cRes.data.socials.length > 0) {
          setSocials(cRes.data.socials);
        }
      }

      // 7. Site Settings
      const setRes = await api.getSettings().catch(() => null);
      if (setRes?.success && setRes.data) {
        setSettings(setRes.data);
        if (setRes.data.siteTitle) {
          document.title = setRes.data.siteTitle;
        }
      }

      // 8. Events & Kegiatan (only visible)
      const evRes = await api.getEvents(false).catch(() => null);
      if (evRes?.success && Array.isArray(evRes.data) && evRes.data.length > 0) {
        setEvents(evRes.data);
        try {
          localStorage.setItem('vezta_events_cache', JSON.stringify(evRes.data));
        } catch (_) {}
      }

      // 9. Certifications (only visible)
      const certRes = await api.getCertifications(false).catch(() => null);
      if (certRes?.success && Array.isArray(certRes.data) && certRes.data.length > 0) {
        setCertifications(certRes.data);
        try {
          localStorage.setItem('vezta_certifications_cache', JSON.stringify(certRes.data));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Could not sync public data from API, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  const value = {
    profile,
    projects,
    experience,
    skills,
    tools,
    events,
    certifications,
    contact,
    socials,
    settings,
    isLoading,
    refreshData: fetchPublicData
  };

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    return {
      profile: fallbackProfile,
      projects: fallbackProjects,
      experience: fallbackExperience,
      skills: fallbackServices,
      tools: [],
      events: fallbackEvents,
      certifications: fallbackCertifications,
      contact: {},
      socials: [],
      settings: {},
      isLoading: false,
      refreshData: async () => {}
    };
  }
  return context;
}
