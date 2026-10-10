import { api } from '../services/api';

function unwrap(res, label) {
  if (!res?.success || res.data == null) {
    throw new Error(res?.message || `Gagal membaca data ${label} dari API.`);
  }
  return res.data;
}

function unwrapList(res, label) {
  const data = unwrap(res, label);
  if (!Array.isArray(data)) {
    throw new Error(`Format data ${label} dari API tidak valid.`);
  }
  return data;
}

function hasAdminToken() {
  return Boolean(
    sessionStorage.getItem('vezta_admin_token') ||
    localStorage.getItem('vezta_admin_token')
  );
}

export async function collectPublicSnapshot({ showAll = hasAdminToken() } = {}) {
  const [
    profileRes,
    projectsRes,
    experienceRes,
    toolsRes,
    skillsRes,
    contactRes,
    settingsRes,
    eventsRes,
    certificationsRes
  ] = await Promise.all([
    api.getProfile(),
    api.getProjects(showAll),
    api.getExperience(showAll),
    api.getTools(showAll),
    api.getSkills(showAll),
    api.getContact(showAll),
    api.getSettings(),
    api.getEvents(showAll),
    api.getCertifications(showAll)
  ]);

  const contactBundle = unwrap(contactRes, 'kontak');
  if (!contactBundle.contact || !Array.isArray(contactBundle.socials)) {
    throw new Error('Format data kontak dari API tidak valid.');
  }

  return {
    profile: unwrap(profileRes, 'profil'),
    projects: unwrapList(projectsRes, 'project'),
    experience: unwrapList(experienceRes, 'pengalaman'),
    skills: unwrapList(skillsRes, 'skill'),
    tools: unwrapList(toolsRes, 'tool'),
    events: unwrapList(eventsRes, 'event'),
    certifications: unwrapList(certificationsRes, 'sertifikasi'),
    contact: contactBundle.contact,
    socials: contactBundle.socials,
    settings: unwrap(settingsRes, 'pengaturan')
  };
}

export async function publishContentUpdate({
  section = 'Konten',
  sectionKey = '',
  action = 'Update',
  details = '',
  patch = null
} = {}) {
  const collected = await collectPublicSnapshot();
  const snapshot = {
    ...collected,
    ...(patch && typeof patch === 'object' ? patch : {}),
    updatedAt: new Date().toISOString()
  };

  const response = await api.createContentHistory({
    section,
    sectionKey,
    action,
    details,
    snapshot
  });
  if (!response?.success || !response.data) {
    throw new Error(response?.message || 'Gagal menyimpan histori konten ke database.');
  }
  return response.data;
}
