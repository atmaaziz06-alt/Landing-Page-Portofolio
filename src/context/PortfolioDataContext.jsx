// src/context/PortfolioDataContext.jsx
// Public landing data is sourced from Histori Update (latest entry) in LocalStorage.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  getPublishedContent,
  subscribeContentUpdates,
  visibleOnly,
  recordContentUpdate,
  readHistory,
  readSnapshot
} from '../utils/contentStore';
import { collectPublicSnapshot, publishContentUpdate } from '../utils/publishContent';

import { profileData as fallbackProfile } from '../data/profile';
import { projects as fallbackProjects } from '../data/projects';
import { experienceData as fallbackExperience } from '../data/experience';
import { servicesData as fallbackServices } from '../data/services';
import { fallbackCertifications } from '../data/certifications';
import { fallbackEvents } from '../data/events';

const PortfolioDataContext = createContext(null);

let publicHydrateLock = null;

const defaultContact = {
  ctaTitle: "Have a project in mind? Let's create something iconic.",
  ctaDescription: "Currently accepting selected freelance and contract design projects. Available for creative direction, visual brand identity, and modern digital web experiences.",
  email: fallbackProfile.contact?.email || 'atmaaziz06@gmail.com',
  phone: fallbackProfile.contact?.phone || '+62-877-6279-8586',
  whatsapp: fallbackProfile.contact?.whatsapp || '6287762798586',
  primaryBtnText: 'Start a conversation',
  primaryBtnLink: '#contact',
  secondaryBtnText: 'Email me directly',
  secondaryBtnLink: `mailto:${fallbackProfile.contact?.email || 'atmaaziz06@gmail.com'}`
};

const defaultSettings = {
  siteTitle: 'Raditya Atma Aziz — Graphic Design & Web Designer',
  brandName: fallbackProfile.brandName || 'Vezta Studio',
  footerBrand: fallbackProfile.brandName || 'Vezta Studio',
  footerCopyright: `${fallbackProfile.brandName || 'Vezta Studio'}. All rights reserved.`,
  footerNote: 'Designed & built with intention.'
};

function mergeProfile(base, extra) {
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    availability: {
      ...(base.availability || {}),
      ...(extra.availability || {})
    }
  };
}

function readLegacyOverride() {
  try {
    const stored = localStorage.getItem('vezta_profile_override');
    return stored ? JSON.parse(stored) : null;
  } catch (_) {
    return null;
  }
}

function normalizeFromSnapshot(snapshot) {
  const published = snapshot && typeof snapshot === 'object' ? snapshot : {};
  const override = readLegacyOverride();

  return {
    profile: mergeProfile(fallbackProfile, {
      ...(published.profile || {}),
      ...(override?.avatarUrl ? { avatarUrl: override.avatarUrl } : {}),
      ...(override?.aboutImageUrl ? { aboutImageUrl: override.aboutImageUrl } : {})
    }),
    projects: Array.isArray(published.projects) && published.projects.length
      ? visibleOnly(published.projects)
      : fallbackProjects,
    experience: Array.isArray(published.experience) && published.experience.length
      ? visibleOnly(published.experience)
      : fallbackExperience,
    skills: Array.isArray(published.skills) && published.skills.length
      ? visibleOnly(published.skills)
      : fallbackServices,
    tools: Array.isArray(published.tools) ? visibleOnly(published.tools) : [],
    events: Array.isArray(published.events)
      ? visibleOnly(published.events)
      : fallbackEvents,
    certifications: Array.isArray(published.certifications)
      ? visibleOnly(published.certifications)
      : fallbackCertifications,
    contact: published.contact ? { ...defaultContact, ...published.contact } : defaultContact,
    socials: Array.isArray(published.socials) && published.socials.length
      ? visibleOnly(published.socials)
      : (fallbackProfile.contact?.socials || []),
    settings: published.settings ? { ...defaultSettings, ...published.settings } : defaultSettings
  };
}

function getInitialPublicState() {
  if (typeof window === 'undefined') {
    return normalizeFromSnapshot(null);
  }
  return normalizeFromSnapshot(getPublishedContent());
}

export function PortfolioDataProvider({ children }) {
  const initial = getInitialPublicState();
  const [profile, setProfile] = useState(initial.profile);
  const [projects, setProjects] = useState(initial.projects);
  const [experience, setExperience] = useState(initial.experience);
  const [skills, setSkills] = useState(initial.skills);
  const [tools, setTools] = useState(initial.tools);
  const [events, setEvents] = useState(initial.events);
  const [certifications, setCertifications] = useState(initial.certifications);
  const [contact, setContact] = useState(initial.contact);
  const [socials, setSocials] = useState(initial.socials);
  const [settings, setSettings] = useState(initial.settings);
  const [isLoading, setIsLoading] = useState(true);

  const applyPublishedContent = useCallback((snapshot) => {
    const next = normalizeFromSnapshot(snapshot);
    setProfile(next.profile);
    setProjects(next.projects);
    setExperience(next.experience);
    setSkills(next.skills);
    setTools(next.tools);
    setEvents(next.events);
    setCertifications(next.certifications);
    setContact(next.contact);
    setSocials(next.socials);
    setSettings(next.settings);

    if (next.settings?.siteTitle) {
      document.title = next.settings.siteTitle;
    }

    try {
      if (Array.isArray(next.events)) {
        localStorage.setItem('vezta_events_cache', JSON.stringify(next.events));
      }
      if (Array.isArray(next.certifications)) {
        localStorage.setItem('vezta_certifications_cache', JSON.stringify(next.certifications));
      }
    } catch (_) {}
  }, []);

  const hydrateFromStorage = useCallback(() => {
    applyPublishedContent(getPublishedContent());
  }, [applyPublishedContent]);

  const fetchPublicData = useCallback(async () => {
    const stored = getPublishedContent();
    if (stored) {
      applyPublishedContent(stored);
      setIsLoading(false);
      return;
    }

    if (!publicHydrateLock) {
      publicHydrateLock = (async () => {
        const collected = await collectPublicSnapshot({});
        const stamped = { ...collected, updatedAt: new Date().toISOString() };
        if (!getPublishedContent()) {
          recordContentUpdate({
            section: 'Konten',
            action: 'Inisialisasi',
            details: 'Snapshot awal landing page',
            snapshot: stamped
          });
        }
        return getPublishedContent() || stamped;
      })().finally(() => {
        publicHydrateLock = null;
      });
    }

    try {
      const snapshot = await publicHydrateLock;
      applyPublishedContent(snapshot);
    } catch (err) {
      console.warn('Could not sync public data from API, using stored/fallback:', err);
      try {
        const pRes = await api.getProfile().catch(() => null);
        if (pRes?.success && pRes.data) {
          setProfile((prev) => mergeProfile(prev, pRes.data));
        }
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  }, [applyPublishedContent]);

  const publishUpdate = useCallback(async (meta) => {
    const entry = await publishContentUpdate(meta);
    applyPublishedContent(getPublishedContent());
    return entry;
  }, [applyPublishedContent]);

  useEffect(() => {
    if (readHistory().length === 0) {
      const existing = readSnapshot();
      if (existing && typeof existing === 'object') {
        recordContentUpdate({
          section: 'Konten',
          action: 'Inisialisasi',
          details: 'Dipulihkan dari penyimpanan lokal',
          snapshot: existing
        });
      }
    }
    fetchPublicData();
  }, [fetchPublicData]);

  useEffect(() => {
    return subscribeContentUpdates(() => {
      hydrateFromStorage();
    });
  }, [hydrateFromStorage]);

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
    refreshData: fetchPublicData,
    hydrateFromStorage,
    publishUpdate
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
      contact: defaultContact,
      socials: fallbackProfile.contact?.socials || [],
      settings: defaultSettings,
      isLoading: false,
      refreshData: async () => {},
      hydrateFromStorage: () => {},
      publishUpdate: async () => null
    };
  }
  return context;
}
