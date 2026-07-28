import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Users, 
  User, 
  LogOut,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { user, role, logout } = useAuth();

  // STRICTLY 4 ITEMS ONLY FOR USER ACCORDING TO SPECIFICATION
  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/invitations', label: 'Thiệp của tôi', icon: HeartHandshake },
    { path: '/guests', label: 'Khách mời', icon: Users },
    { path: '/settings', label: 'Hồ sơ', icon: User },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full font-sans">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                Pudwedding <span className="text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">Wedding</span>
              </h1>
              <p className="text-xs text-slate-400">Hệ thống Thiệp Cưới Online</p>
            </div>
          </div>

          {onMobileClose && (
            <button onClick={onMobileClose} className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation - Strictly 4 Menu Items */}
        <div className="px-3 py-4 space-y-6">
          {/* Admin Switcher if logged in as Admin */}
          {role === 'admin' && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị Hệ Thống
              </div>
              <NavLink
                to="/admin"
                onClick={onMobileClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Chuyển Sang Admin Portal</span>
              </NavLink>
            </div>
          )}

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Danh Mục Làm Việc
            </div>
            <nav className="space-y-1">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Khách hàng'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'email@domain.com'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onMobileClose) onMobileClose();
              logout();
            }}
            title="Đăng xuất"
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        />
      )}

      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
