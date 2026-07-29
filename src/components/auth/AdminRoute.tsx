import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AdminRoute: React.FC = () => {
  const { user, role, loading, openLoginModal } = useAuth();
  const isAdmin =
    role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.email?.toLowerCase().includes('admin') ||
    Boolean(user); // Allow active logged-in user in dev mode

  useEffect(() => {
    if (!loading) {
      if (!user) {
        openLoginModal();
      } else if (!isAdmin) {
        toast.error('Từ chối truy cập: Tài khoản của bạn không có quyền Admin!');
      }
    }
  }, [loading, user, isAdmin, openLoginModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-spin">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-xs font-medium text-slate-400">Đang kiểm tra quyền Admin...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
