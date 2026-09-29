// src/admin/components/AdminLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FolderKanban,
  Wrench,
  Layers,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/admin/profile', icon: User },
    { label: 'Experience', path: '/admin/experience', icon: Briefcase },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Tools', path: '/admin/tools', icon: Wrench },
    { label: 'Skills', path: '/admin/skills', icon: Layers },
    { label: 'Contact / CTA', path: '/admin/contact', icon: Mail },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout dari sistem admin.');
    navigate('/admin/login', { replace: true });
  };

  // Close mobile drawer on item click
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F6E7DF]/30 text-[#171717] flex font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR (Desktop fixed left, Mobile slide-out drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FBEFE9] border-r border-[rgba(23,23,23,0.08)] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[rgba(23,23,23,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E66F52] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#171717]">Vezta CMS</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E66F52]/15 text-[#E66F52]">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[#5F5A57]">Portfolio Management</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#5F5A57] hover:bg-black/5"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-[#5F5A57]/70 uppercase tracking-wider">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#E66F52] text-white shadow-xs font-semibold'
                    : 'text-[#5F5A57] hover:text-[#171717] hover:bg-white/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-[#5F5A57] group-hover:text-[#E66F52]'
                  }`}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-[rgba(23,23,23,0.06)] bg-white/40 space-y-3">
          {/* Quick link to public website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-medium text-[#171717] bg-white hover:bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] shadow-2xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#E66F52]" />
              <span>Lihat Website Public</span>
            </span>
            <span className="text-[10px] text-[#5F5A57]">Buka Tab Baru</span>
          </a>

          {/* User profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#E66F52]/15 text-[#E66F52] flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#171717] truncate">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-[#5F5A57] truncate">{user?.email || 'atmaaziz06@gmail.com'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-[#5F5A57] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#FBEFE9]/80 backdrop-blur-md border-b border-[rgba(23,23,23,0.06)] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#171717] hover:bg-white/80 border border-[rgba(23,23,23,0.08)]"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E66F52]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F5A57]">
                Admin Dashboard Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Connected</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#171717] bg-white hover:bg-white/80 border border-[rgba(23,23,23,0.1)] shadow-2xs hover:shadow-xs transition-all"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-[#5F5A57]" />
            </a>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
