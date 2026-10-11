// src/context/PortfolioDataContext.jsx
// Public content is always refreshed from the API; browser storage is only a startup cache.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getPublishedContent,
  subscribeContentUpdates,
  visibleOnly,
  cachePublishedContent,
  broadcastContentUpdate
} from '../utils/contentStore';
import { collectPublicSnapshot, publishContentUpdate } from '../utils/publishContent';

import { profileData as fallbackProfile } from '../data/profile';
import { projects as fallbackProjects } from '../data/projects';
import { experienceData as fallbackExperience } from '../data/experience';
import { servicesData as fallbackServices } from '../data/services';
import { fallbackCertifications } from '../data/certifications';
import { fallbackEvents } from '../data/events';

const PortfolioDataContext = createContext(null);

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

function normalizeFromSnapshot(snapshot) {
  const published = snapshot && typeof snapshot === 'object' ? snapshot : {};

  return {
    profile: mergeProfile(fallbackProfile, published.profile || {}),
    projects: Array.isArray(published.projects)
      ? visibleOnly(published.projects)
      : fallbackProjects,
    experience: Array.isArray(published.experience)
      ? visibleOnly(published.experience)
      : fallbackExperience,
    skills: Array.isArray(published.skills)
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
    socials: Array.isArray(published.socials)
      ? visibleOnly(published.socials)
      : (fallbackProfile.contact?.socials || []),
    settings: published.settings ? { ...defaultSettings, ...published.settings } : defaultSettings
  };
}

function getInitialPublicState() {
  if (typeof window === 'undefined') {
    return normalizeFromSnapshot(null);
  }
  const published = getPublishedContent();
  return normalizeFromSnapshot(published);
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
  const [dataError, setDataError] = useState(null);

  const applyPublishedContent = useCallback((snapshot) => {
    const next = normalizeFromSnapshot(snapshot);
    cachePublishedContent(snapshot);
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

  }, []);

  const fetchPublicData = useCallback(async () => {
    try {
      const snapshot = await collectPublicSnapshot({ showAll: false });
      snapshot.updatedAt = new Date().toISOString();
      applyPublishedContent(snapshot);
      setDataError(null);
    } catch (err) {
      console.error('Gagal memuat konten publik dari API:', err);
      setDataError(err);
    } finally {
      setIsLoading(false);
    }
  }, [applyPublishedContent]);

  const hydrateFromStorage = fetchPublicData;

  const publishUpdate = useCallback(async (meta) => {
    const entry = await publishContentUpdate(meta);
    const published = entry.snapshot;
    applyPublishedContent(published);
    broadcastContentUpdate({
      id: entry.id,
      section: entry.section,
      action: entry.action,
      timestamp: published.updatedAt
    });
    return entry;
  }, [applyPublishedContent]);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  useEffect(() => {
    return subscribeContentUpdates(() => {
      fetchPublicData();
    });
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
    dataError,
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
      dataError: null,
      refreshData: async () => {},
      hydrateFromStorage: () => {},
      publishUpdate: async () => null
    };
  }
  return context;
}
