import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LayoutTemplate, 
  CreditCard, 
  Globe, 
  BarChart3, 
  Database, 
  Settings, 
  LogOut, 
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/domains', label: 'Domains', icon: Globe },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/storage', label: 'Storage', icon: Database },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
                Pudwedding <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">ADMIN</span>
              </h1>
              <p className="text-[11px] text-slate-400">System Management</p>
            </div>
          </div>

          {onMobileClose && (
            <button onClick={onMobileClose} className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Trung Tâm Quản Trị
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
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

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
              alt="Admin Avatar"
              className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-amber-300 truncate">{user?.user_metadata?.full_name || 'System Admin'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onMobileClose) onMobileClose();
              logout();
            }}
            title="Đăng xuất Admin"
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
