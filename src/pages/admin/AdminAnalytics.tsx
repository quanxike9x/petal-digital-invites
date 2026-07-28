import React from 'react';
import { BarChart3, TrendingUp, Eye, Users, HeartHandshake } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Thống Kê Analytics & Lượt Truy Cập</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Tổng Lượt Xem Thiệp" value="2.662" subtext="Tháng này" icon={Eye} variant="amber" />
          <StatCard title="Tỷ Lệ Chuyển Đổi RSVP" value="78%" subtext="Khách xác nhận" icon={TrendingUp} variant="emerald" />
          <StatCard title="Thời Gian Mở Trang TB" value="1m 45s" subtext="Trải nghiệm người dùng" icon={Users} variant="rose" />
        </div>
      </div>
    </div>
  );
};
