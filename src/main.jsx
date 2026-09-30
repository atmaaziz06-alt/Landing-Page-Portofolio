import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './admin/components/ProtectedRoute.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';

import Login from './admin/pages/Login.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import ProfilePage from './admin/pages/ProfilePage.jsx';
import ExperiencePage from './admin/pages/ExperiencePage.jsx';
import ProjectsPage from './admin/pages/ProjectsPage.jsx';
import ToolsPage from './admin/pages/ToolsPage.jsx';
import SkillsPage from './admin/pages/SkillsPage.jsx';
import ContactPage from './admin/pages/ContactPage.jsx';
import SettingsPage from './admin/pages/SettingsPage.jsx';
import EventsPage from './admin/pages/EventsPage.jsx';
import CertificationsPage from './admin/pages/CertificationsPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<App />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Dashboard Area */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="experience" element={<ExperiencePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tools" element={<ToolsPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="certifications" element={<CertificationsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
