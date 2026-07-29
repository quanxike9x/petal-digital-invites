import React from 'react';
import { Bell, Search, Menu, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminTopbarProps {
  title?: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  title = 'Admin Portal',
  subtitle,
  onMobileMenuToggle,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{title}</span>
          </h2>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-48 lg:w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm hệ thống..."
            className="w-full bg-slate-800/70 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <button className="relative p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </button>

        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/80 transition-colors"
        >
          <span>Xem Workspace User</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
};
