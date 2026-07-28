import React from 'react';
import { Bell, Search, PlusCircle, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
  onNewInvitation?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title = 'Dashboard',
  subtitle,
  onMobileMenuToggle,
  onNewInvitation,
}) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-48 lg:w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full bg-slate-800/70 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* New Invitation CTA */}
        {onNewInvitation ? (
          <button
            onClick={onNewInvitation}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo Thiệp Mới</span>
          </button>
        ) : (
          <Link
            to="/invitations"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo Thiệp Mới</span>
          </Link>
        )}
      </div>
    </header>
  );
};
