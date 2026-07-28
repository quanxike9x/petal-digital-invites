import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 font-mono text-xs font-bold">
            ERROR 403
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Quyền Truy Cập Bị Từ Chối</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Tài khoản của bạn không có quyền truy cập vào trang Quản trị SaaS hoặc tài nguyên này.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về Dashboard Cá Nhân</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
