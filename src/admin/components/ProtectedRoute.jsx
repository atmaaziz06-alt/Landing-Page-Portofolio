// src/admin/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8EEE8] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#E66F52] animate-spin mb-4" />
        <p className="text-sm font-medium text-[#5F5A57]">Memuat autentikasi admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
