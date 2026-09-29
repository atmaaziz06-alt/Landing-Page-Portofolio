// src/admin/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, Shield } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan username atau alamat email.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
      toast.success('Login berhasil! Selamat datang di dashboard.');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Username/email atau kata sandi tidak valid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCEBE6] via-[#F8EEE8] to-[#F4B09D]/30 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden font-sans">
      {/* Ambient background orbs */}
      <div
        className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#E66F52]/10 blur-3xl pointer-events-none -z-10 animate-pulse-subtle"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#F4B09D]/20 blur-3xl pointer-events-none -z-10 animate-float-slow"
        aria-hidden="true"
      />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-[#171717] bg-white/80 hover:bg-white border border-[rgba(23,23,23,0.08)] shadow-xs transition-all hover-lift"
        >
          <ArrowLeft className="w-4 h-4 text-[#5F5A57]" />
          <span>Kembali ke Website</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-[32px] bg-white/90 backdrop-blur-xl border border-white/80 p-8 sm:p-10 shadow-subtle relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#E66F52] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md mb-4 hover:scale-105 transition-transform">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#5F5A57] mt-1.5">
              Masuk untuk mengelola portofolio & konten CMS
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div className="flex-grow">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Identifier (Email / Username) */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-[#171717] mb-2 uppercase tracking-wider"
              >
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F5A57]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="atmaaziz06@gmail.com atau atmaaziz06"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8EEE8]/70 focus:bg-white text-sm text-[#171717] placeholder-[#5F5A57]/60 border border-[rgba(23,23,23,0.1)] focus:border-[#E66F52] focus:outline-none focus:ring-2 focus:ring-[#E66F52]/20 transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#171717] mb-2 uppercase tracking-wider"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F5A57]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F8EEE8]/70 focus:bg-white text-sm text-[#171717] placeholder-[#5F5A57]/60 border border-[rgba(23,23,23,0.1)] focus:border-[#E66F52] focus:outline-none focus:ring-2 focus:ring-[#E66F52]/20 transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5F5A57] hover:text-[#171717] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-[#E66F52] hover:bg-[#D65F42] text-white text-sm sm:text-base font-semibold shadow-card hover:shadow-subtle transition-all duration-200 hover-lift flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Credential Hint for Local Setup */}
          <div className="mt-8 pt-6 border-t border-[rgba(23,23,23,0.06)] text-center">
            <p className="text-[11px] text-[#5F5A57]">
              Akun admin: <span className="font-semibold text-[#171717]">atmaaziz06@gmail.com</span> /{' '}
              <span className="font-semibold text-[#171717]">Albassam</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#5F5A57] mt-6">
          © {new Date().getFullYear()} Vezta Studio CMS. Dilindungi autentikasi JWT aman.
        </p>
      </div>
    </div>
  );
}
