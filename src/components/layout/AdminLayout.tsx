import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getAdminPageInfo = (path: string) => {
    if (path === '/admin') return { title: 'SaaS Dashboard', subtitle: 'Tổng quan chỉ số hoạt động toàn hệ thống' };
    if (path.startsWith('/admin/users')) return { title: 'Quản lý Users', subtitle: 'Danh sách người dùng & phân quyền' };
    if (path.startsWith('/admin/templates')) return { title: 'Quản lý Templates', subtitle: 'Danh sách giao diện mẫu thiệp cưới' };
    if (path.startsWith('/admin/payments')) return { title: 'Quản lý Payments', subtitle: 'Lịch sử giao dịch & doanh thu hệ thống' };
    if (path.startsWith('/admin/domains')) return { title: 'Quản lý Tên Miền', subtitle: 'Custom Domains & chứng chỉ SSL' };
    if (path.startsWith('/admin/analytics')) return { title: 'System Analytics', subtitle: 'Thống kê truy cập & biểu đồ tăng trưởng' };
    if (path.startsWith('/admin/storage')) return { title: 'Storage & Assets', subtitle: 'Quản lý lưu trữ & hình ảnh' };
    if (path.startsWith('/admin/settings')) return { title: 'System Settings', subtitle: 'Cấu hình hệ thống & API Keys' };
    return { title: 'Admin Portal', subtitle: 'Hệ thống quản trị ChungĐôi' };
  };

  const pageInfo = getAdminPageInfo(location.pathname);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
