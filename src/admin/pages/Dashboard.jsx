// src/admin/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatUpdateTime, readHistory, subscribeContentUpdates } from '../../utils/contentStore';
import {
  FolderKanban,
  Briefcase,
  Wrench,
  Layers,
  Eye,
  EyeOff,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contentHistory, setContentHistory] = useState(() => readHistory());

  const fetchStats = async () => {
    try {
      const res = await api.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    return subscribeContentUpdates(() => {
      setContentHistory(readHistory());
    });
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-8 h-8 text-[#E66F52] animate-spin mb-3" />
        <p className="text-sm text-[#5F5A57]">Memuat statistik dashboard...</p>
      </div>
    );
  }

  const pStats = stats?.projects || { total: 0, visible: 0, hidden: 0 };
  const eStats = stats?.experience || { total: 0, visible: 0, hidden: 0 };
  const tStats = stats?.tools || { total: 0, visible: 0, hidden: 0 };
  const sStats = stats?.skills || { total: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="rounded-[32px] bg-gradient-to-br from-[#FCEBE6] via-[#FBEFE9] to-[#F4B09D]/30 border border-[#F4B09D]/40 p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[rgba(23,23,23,0.08)] text-xs font-semibold text-[#E66F52] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Content Management Overview</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#5F5A57] mt-2 leading-relaxed">
            Kelola seluruh konten portfolio Anda secara real-time. Setiap perubahan yang disimpan langsung otomatis tampil di landing page publik.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/admin/projects?action=add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-xs sm:text-sm font-medium shadow-sm transition-all hover-lift"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </Link>

            <Link
              to="/admin/experience?action=add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-white/80 text-[#171717] border border-[rgba(23,23,23,0.1)] text-xs sm:text-sm font-medium shadow-2xs transition-all hover-lift"
            >
              <Plus className="w-4 h-4 text-[#5F5A57]" />
              <span>Add Experience</span>
            </Link>

            <Link
              to="/admin/tools?action=add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-white/80 text-[#171717] border border-[rgba(23,23,23,0.1)] text-xs sm:text-sm font-medium shadow-2xs transition-all hover-lift"
            >
              <Plus className="w-4 h-4 text-[#5F5A57]" />
              <span>Add Tool</span>
            </Link>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#5F5A57] hover:text-[#171717] border border-[rgba(23,23,23,0.08)] transition-colors cursor-pointer"
              title="Perbarui data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ambient background accent */}
        <div
          className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#E66F52]/10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* STATS METRIC CARDS */}
      <div>
        <h2 className="text-base font-semibold text-[#171717] mb-4 flex items-center gap-2">
          <span>Ringkasan Statistik</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. Projects Card */}
          <Link
            to="/admin/projects"
            className="group rounded-[24px] bg-[#FBEFE9] hover:bg-white border border-[rgba(23,23,23,0.08)] p-6 shadow-sm hover:shadow-subtle transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E66F52]/15 text-[#E66F52] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#5F5A57] group-hover:translate-x-1 group-hover:text-[#E66F52] transition-all" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#5F5A57]">Total Projects</p>
            <p className="text-3xl font-bold text-[#171717] mt-1">{pStats.total}</p>

            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)] text-xs text-[#5F5A57]">
              <span className="flex items-center gap-1 text-emerald-700">
                <Eye className="w-3.5 h-3.5" />
                <span>{pStats.visible} Visible</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-600">
                <EyeOff className="w-3.5 h-3.5" />
                <span>{pStats.hidden} Hidden</span>
              </span>
            </div>
          </Link>

          {/* 2. Experience Card */}
          <Link
            to="/admin/experience"
            className="group rounded-[24px] bg-[#FBEFE9] hover:bg-white border border-[rgba(23,23,23,0.08)] p-6 shadow-sm hover:shadow-subtle transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#5F5A57] group-hover:translate-x-1 group-hover:text-[#0284C7] transition-all" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#5F5A57]">Total Experience</p>
            <p className="text-3xl font-bold text-[#171717] mt-1">{eStats.total}</p>

            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)] text-xs text-[#5F5A57]">
              <span className="flex items-center gap-1 text-emerald-700">
                <Eye className="w-3.5 h-3.5" />
                <span>{eStats.visible} Visible</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-600">
                <EyeOff className="w-3.5 h-3.5" />
                <span>{eStats.hidden} Hidden</span>
              </span>
            </div>
          </Link>

          {/* 3. Tools Card */}
          <Link
            to="/admin/tools"
            className="group rounded-[24px] bg-[#FBEFE9] hover:bg-white border border-[rgba(23,23,23,0.08)] p-6 shadow-sm hover:shadow-subtle transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/15 text-[#7B61FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#5F5A57] group-hover:translate-x-1 group-hover:text-[#7B61FF] transition-all" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#5F5A57]">Total Tools</p>
            <p className="text-3xl font-bold text-[#171717] mt-1">{tStats.total}</p>

            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)] text-xs text-[#5F5A57]">
              <span className="flex items-center gap-1 text-emerald-700">
                <Eye className="w-3.5 h-3.5" />
                <span>{tStats.visible} Visible</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-600">
                <EyeOff className="w-3.5 h-3.5" />
                <span>{tStats.hidden} Hidden</span>
              </span>
            </div>
          </Link>

          {/* 4. Skills Card */}
          <Link
            to="/admin/skills"
            className="group rounded-[24px] bg-[#FBEFE9] hover:bg-white border border-[rgba(23,23,23,0.08)] p-6 shadow-sm hover:shadow-subtle transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#5F5A57] group-hover:translate-x-1 group-hover:text-[#059669] transition-all" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#5F5A57]">Skills & Services</p>
            <p className="text-3xl font-bold text-[#171717] mt-1">{sStats.total}</p>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[rgba(23,23,23,0.06)] text-xs text-[#5F5A57]">
              <span>Active in landing page</span>
            </div>
          </Link>
        </div>
      </div>

      {/* HISTORI UPDATE */}
      <div className="rounded-[28px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.08)] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-5 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E66F52]" />
            <h2 className="text-base font-semibold text-[#171717]">Histori Update</h2>
          </div>
          <Link
            to="/admin/history"
            className="text-xs font-medium text-[#E66F52] hover:underline inline-flex items-center gap-1"
          >
            Lihat semua
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {contentHistory.length === 0 ? (
          <p className="text-xs sm:text-sm text-[#5F5A57] italic py-4 text-center">
            Belum ada histori update. Perubahan yang disimpan dari halaman admin akan muncul di sini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[#5F5A57] border-b border-[rgba(23,23,23,0.08)]">
                  <th className="py-2 pr-3 font-semibold">Waktu Update</th>
                  <th className="py-2 pr-3 font-semibold">Bagian yang diubah</th>
                  <th className="py-2 pr-3 font-semibold">Detail</th>
                  <th className="py-2 font-semibold text-right">Versi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(23,23,23,0.06)]">
                {contentHistory.slice(0, 8).map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-3 whitespace-nowrap text-[#171717] font-medium">
                      {formatUpdateTime(item.timestamp)}
                    </td>
                    <td className="py-3 pr-3">
                      {item.section || 'Konten'}
                      {index === 0 && (
                        <span className="ml-2 text-[10px] font-semibold text-[#E66F52]">Terbaru</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-[#5F5A57]">
                      {item.action}
                      {item.details ? ` — ${item.details}` : ''}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/admin/history"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#E66F52] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
