// src/services/api.js
// Centralized API client for Vezta Portfolio & CMS

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('vezta_admin_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // If unauthorized on an admin route, trigger session cleanup
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('vezta_admin_token');
        localStorage.removeItem('vezta_admin_user');
        window.location.href = '/admin/login?session=expired';
      }
    }
    let errorMsg = data?.message;
    if (typeof errorMsg === 'string' && (errorMsg.includes('NOT_FOUND') || errorMsg.includes('<!DOCTYPE') || errorMsg.includes('<html'))) {
      errorMsg = 'Server API tidak ditemukan (404). Pastikan backend aktif dan rute Vercel telah terpasang.';
    }
    const error = new Error(errorMsg || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  async login(identifier, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(res);
  },

  // Profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`);
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  // Projects
  async getProjects(showAll = false) {
    const url = showAll ? `${API_BASE}/projects?all=true` : `${API_BASE}/projects`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse(res);
  },

  async createProject(projectData) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return handleResponse(res);
  },

  async updateProject(id, projectData) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return handleResponse(res);
  },

  async toggleProjectVisibility(id, isVisible) {
    const res = await fetch(`${API_BASE}/projects/${id}/visibility`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isVisible })
    });
    return handleResponse(res);
  },

  async reorderProjects(items) {
    const res = await fetch(`${API_BASE}/projects/reorder/batch`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Experience
  async getExperience(showAll = false) {
    const url = showAll ? `${API_BASE}/experience?all=true` : `${API_BASE}/experience`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createExperience(data) {
    const res = await fetch(`${API_BASE}/experience`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateExperience(id, data) {
    const res = await fetch(`${API_BASE}/experience/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleExperienceVisibility(id, isVisible) {
    const res = await fetch(`${API_BASE}/experience/${id}/visibility`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isVisible })
    });
    return handleResponse(res);
  },

  async reorderExperience(items) {
    const res = await fetch(`${API_BASE}/experience/reorder/batch`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  },

  async deleteExperience(id) {
    const res = await fetch(`${API_BASE}/experience/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Tools
  async getTools(showAll = false) {
    const url = showAll ? `${API_BASE}/tools?all=true` : `${API_BASE}/tools`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createTool(data) {
    const res = await fetch(`${API_BASE}/tools`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateTool(id, data) {
    const res = await fetch(`${API_BASE}/tools/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleToolVisibility(id, isVisible) {
    const res = await fetch(`${API_BASE}/tools/${id}/visibility`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isVisible })
    });
    return handleResponse(res);
  },

  async reorderTools(items) {
    const res = await fetch(`${API_BASE}/tools/reorder/batch`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  },

  async deleteTool(id) {
    const res = await fetch(`${API_BASE}/tools/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Skills / Services
  async getSkills(showAll = false) {
    const url = showAll ? `${API_BASE}/skills?all=true` : `${API_BASE}/skills`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createSkill(data) {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateSkill(id, data) {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleSkillVisibility(id, isVisible) {
    const res = await fetch(`${API_BASE}/skills/${id}/visibility`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isVisible })
    });
    return handleResponse(res);
  },

  async reorderSkills(items) {
    const res = await fetch(`${API_BASE}/skills/reorder/batch`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  },

  async deleteSkill(id) {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Contact & Socials
  async getContact(showAll = false) {
    const url = showAll ? `${API_BASE}/contact?all=true` : `${API_BASE}/contact`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateContact(data) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async createSocial(data) {
    const res = await fetch(`${API_BASE}/contact/socials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateSocial(id, data) {
    const res = await fetch(`${API_BASE}/contact/socials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleSocialVisibility(id, isVisible) {
    const res = await fetch(`${API_BASE}/contact/socials/${id}/visibility`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isVisible })
    });
    return handleResponse(res);
  },

  async deleteSocial(id) {
    const res = await fetch(`${API_BASE}/contact/socials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },

  async updateSettings(data) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Upload file
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('vezta_admin_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(res);
  },

  // Upload multiple files
  async uploadMultipleFiles(fileList) {
    const formData = new FormData();
    for (const f of fileList) {
      formData.append('files', f);
    }

    const token = localStorage.getItem('vezta_admin_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/multiple`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(res);
  },

  // Stats & Dashboard
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
