import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading, openLoginModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openLoginModal();
    }
  }, [loading, user, openLoginModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center animate-spin shadow-lg shadow-rose-500/10">
          <Sparkles className="w-5 h-5 text-rose-400" />
        </div>
        <p className="text-xs font-medium text-slate-400">Đang xác thực phiên đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
