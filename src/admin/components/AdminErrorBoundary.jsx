// src/admin/components/AdminErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-[#FBEFE9] rounded-3xl border border-[rgba(23,23,23,0.1)] shadow-sm m-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] mb-2">Terjadi Gangguan pada Halaman Ini</h2>
          <p className="text-sm text-[#5F5A57] max-w-md mb-6">
            Halaman mengalami kendala saat memuat data. Silakan klik tombol di bawah untuk memuat ulang.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </button>
            <a
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-stone-100 text-[#171717] text-sm font-semibold border border-[rgba(23,23,23,0.1)] transition-colors cursor-pointer"
            >
              <span>Kembali ke Dashboard</span>
            </a>
          </div>
          {this.state.error?.message && (
            <p className="text-xs text-[#5F5A57]/70 mt-6 font-mono bg-white/60 px-4 py-2 rounded-lg border border-[rgba(23,23,23,0.06)]">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
