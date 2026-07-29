import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <Heart className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-rose-400 font-mono text-xs font-bold">
            ERROR 404
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Trang Không Tồn Tại</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Đường dẫn thiệp cưới hoặc trang bạn đang truy cập không tồn tại hoặc đã bị thay đổi địa chỉ.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về Dashboard</span>
          </Link>
          <Link
            to="/"
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
