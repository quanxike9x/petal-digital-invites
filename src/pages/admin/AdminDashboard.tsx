import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { 
  Users, 
  HeartHandshake, 
  LayoutTemplate, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Eye, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Download,
  MessageSquare
} from 'lucide-react';
import { mockUsers, mockInvitations, mockTemplates, mockPayments } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const [topTab, setTopTab] = useState<'views' | 'rsvp' | 'wishes'>('views');

  const totalUsers = mockUsers.length;
  const usersOnline = 1;
  const totalInvitations = mockInvitations.length;
  const activeTemplates = mockTemplates.filter((t) => t.is_active).length;
  const trialInvitations = mockInvitations.filter((i) => i.plan_type === 'trial' || i.payment_status === 'trial').length;
  const premiumInvitations = mockInvitations.filter((i) => i.plan_type === 'paid' || i.payment_status === 'paid').length;
  
  const todayStr = new Date().toLocaleDateString('vi-VN');
  const totalRevenue = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const todayRevenue = mockPayments
    .filter((p) => new Date(p.created_at).toLocaleDateString('vi-VN') === todayStr)
    .reduce((acc, p) => acc + p.amount, 0);
  const monthlyRevenue = totalRevenue;

  const topViewedInvitations = [...mockInvitations].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  const topRSVPInvitations = [...mockInvitations].sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0));
  const topWishInvitations = [...mockInvitations].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));

  const currentTopList = topTab === 'views' ? topViewedInvitations : topTab === 'rsvp' ? topRSVPInvitations : topWishInvitations;

  const handleExportSystemReport = () => {
    try {
      const summaryData = {
        'Tổng Số User': totalUsers,
        'Tổng Số Thiệp': totalInvitations,
        'Thiệp Trial': trialInvitations,
        'Thiệp Premium': premiumInvitations,
        'Tổng Doanh Thu': `${totalRevenue.toLocaleString('vi-VN')} đ`,
        'Thanh Toán Tháng Này': `${monthlyRevenue.toLocaleString('vi-VN')} đ`,
      };
      analyticsService.exportReport('analytics', summaryData as any, 'BaoCaoAdminMaster_Pudwedding');
      toast.success('Đã xuất báo cáo tổng quan hệ thống Admin!');
    } catch (e: any) {
      toast.error('Lỗi xuất báo cáo.');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner Metric Overview */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>SaaS Control Center • Live Realtime Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tổng quan Hoạt động Pudwedding System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Theo dõi chỉ số tăng trưởng, người dùng, giao dịch thanh toán và dung lượng hoạt động.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">User Online</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {usersOnline}
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center min-w-[140px]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Doanh thu tháng</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              {(monthlyRevenue / 1000).toFixed(0)}k đ
            </p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 9 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Tổng số User"
          value={totalUsers}
          subtext="+25% so với tháng trước"
          icon={Users}
          variant="amber"
          trend="+4 tuần này"
        />
        <StatCard
          title="User Online"
          value={usersOnline}
          subtext="Đang hoạt động trên web"
          icon={Activity}
          variant="emerald"
        />
        <StatCard
          title="Tổng số Thiệp"
          value={totalInvitations}
          subtext="Thiệp cưới đã khởi tạo"
          icon={HeartHandshake}
          variant="rose"
        />
        <StatCard
          title="Template Đang Hoạt Động"
          value={activeTemplates}
          subtext="Mẫu giao diện sẵn sàng"
          icon={LayoutTemplate}
          variant="slate"
        />
        <StatCard
          title="Thiệp Trial (Dùng Thử)"
          value={trialInvitations}
          subtext="Gói dùng thử 3 ngày"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Thiệp Premium (Đã mua)"
          value={premiumInvitations}
          subtext="Gói VIP / Tên Miền"
          icon={CheckCircle2}
          variant="emerald"
          trend="100% active"
        />
        <StatCard
          title="Tổng Doanh Thu"
          value={`${totalRevenue.toLocaleString('vi-VN')}đ`}
          subtext="Tích lũy hệ thống"
          icon={DollarSign}
          variant="emerald"
        />
        <StatCard
          title="Thanh Toán Hôm Nay"
          value={`${todayRevenue.toLocaleString('vi-VN')}đ`}
          subtext="1 giao dịch hôm nay"
          icon={CreditCard}
          variant="rose"
        />
        <StatCard
          title="Thanh Toán Tháng Này"
          value={`${monthlyRevenue.toLocaleString('vi-VN')}đ`}
          subtext="Tháng 07/2026"
          icon={TrendingUp}
          variant="amber"
        />
      </div>

      {/* Biểu đồ Tăng trưởng & Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>Biểu đồ Tăng trưởng Thiệp & Doanh Thu</span>
              </h3>
              <p className="text-xs text-slate-400">Thống kê lượng tạo thiệp và doanh thu 6 tháng gần nhất</p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1 rounded-xl border border-slate-700">
              Năm 2026
            </span>
          </div>

          {/* CSS Bar Chart Simulation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2">
            {[
              { month: 'Tháng 2', invitations: 40, revenue: 30 },
              { month: 'Tháng 3', invitations: 65, revenue: 55 },
              { month: 'Tháng 4', invitations: 80, revenue: 70 },
              { month: 'Tháng 5', invitations: 120, revenue: 90 },
              { month: 'Tháng 6', invitations: 180, revenue: 140 },
              { month: 'Tháng 7', invitations: 240, revenue: 190 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    style={{ height: `${bar.invitations}%` }}
                    className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all group-hover:brightness-125"
                    title={`Thiệp: ${bar.invitations}`}
                  />
                  <div
                    style={{ height: `${bar.revenue}%` }}
                    className="w-1/2 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all group-hover:brightness-125"
                    title={`Doanh thu: ${bar.revenue}00k`}
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-8 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500" />
              Lượng Thiệp Tạo Mới
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500" />
              Doanh Thu Nâng Cấp
            </span>
          </div>
        </div>

        {/* Top 10 Leaderboards Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-400" />
              <span>Bảng Xếp Hạng Top 10 Thiệp</span>
            </h3>

            <button
              onClick={handleExportSystemReport}
              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1"
              title="Xuất Báo Cáo System Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Report</span>
            </button>
          </div>

          {/* Leaderboard Tab Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setTopTab('views')}
              className={`py-1.5 rounded-lg transition-all ${topTab === 'views' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
            >
              Nhiều Xem Nhất
            </button>
            <button
              onClick={() => setTopTab('rsvp')}
              className={`py-1.5 rounded-lg transition-all ${topTab === 'rsvp' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
            >
              Nhiều RSVP
            </button>
            <button
              onClick={() => setTopTab('wishes')}
              className={`py-1.5 rounded-lg transition-all ${topTab === 'wishes' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
            >
              Nhiều Lời Chúc
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {currentTopList.map((inv, i) => (
              <div
                key={inv.id}
                className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-extrabold text-amber-400 text-xs w-4">{i + 1}</span>
                  <img src={inv.thumbnail_url} alt={inv.title} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 truncate">{inv.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">/{inv.slug}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-400">
                    {topTab === 'views' ? `${inv.views_count} lượt xem` : topTab === 'rsvp' ? `${inv.rsvp_count} RSVP` : `${inv.views_count} lời chúc`}
                  </p>
                  <p className="text-[10px] text-slate-400">{inv.status.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Users & Recent Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Users List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Danh Sách User Mới Giới Thiệu</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {mockUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={u.avatar_url} alt={u.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">{u.full_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                  </div>
                </div>
                <Badge variant={u.role === 'admin' ? 'paid' : 'trial'}>
                  {u.role.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments Feed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Thanh Toán Gần Đây</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {mockPayments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{p.plan_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Ref: {p.transaction_ref} • {p.payment_method.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">+{p.amount.toLocaleString('vi-VN')}đ</p>
                  <span className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
