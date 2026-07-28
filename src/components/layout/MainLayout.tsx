import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LoginModal } from '../auth/LoginModal';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageInfo = (path: string) => {
    if (path.startsWith('/dashboard')) return { title: 'Dashboard', subtitle: 'Tổng quan hệ thống thiệp cưới' };
    if (path.startsWith('/invitations')) return { title: 'My Invitations', subtitle: 'Danh sách thiệp đã tạo' };
    if (path.startsWith('/templates')) return { title: 'Templates Library', subtitle: 'Kho giao diện thiệp cưới mẫu' };
    if (path.startsWith('/customers')) return { title: 'Customers', subtitle: 'Quản lý danh sách khách hàng' };
    if (path.startsWith('/domains')) return { title: 'Custom Domains', subtitle: 'Quản lý tên miền tùy chỉnh' };
    if (path.startsWith('/payments')) return { title: 'Payments & Billing', subtitle: 'Lịch sử giao dịch và nâng cấp' };
    if (path.startsWith('/settings')) return { title: 'Settings', subtitle: 'Cấu hình tài khoản & hệ thống' };
    return { title: 'ChungĐôi Platform', subtitle: 'Hệ thống thiệp cưới online' };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <LoginModal />
    </div>
  );
};
