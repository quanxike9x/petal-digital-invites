import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { invitationService } from '../../services/invitationService';
import { guestService } from '../../services/guestService';
import { useAuth } from '../../context/AuthContext';
import type { Invitation, InvitationAnalyticsData, AnalyticsPeriod } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { 
  Eye, 
  Users, 
  CheckCircle2, 
  Heart, 
  MessageSquare, 
  Download, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  Clock, 
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const InvitationAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [analytics, setAnalytics] = useState<InvitationAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load User's Invitations
  useEffect(() => {
    if (user?.id) {
      invitationService.getInvitations(user.id).then((invList) => {
        setInvitations(invList);
        if (invList.length > 0) {
          setSelectedInvitationId(invList[0].id);
        }
      });
    }
  }, [user]);

  // Load Analytics Data when active invitation or period changes
  const fetchAnalytics = async () => {
    if (selectedInvitationId) {
      setLoading(true);
      try {
        const data = await analyticsService.getInvitationAnalytics(selectedInvitationId, period);
        setAnalytics(data);
      } catch (e) {
        toast.error('Lỗi khi nạp dữ liệu thống kê!');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedInvitationId, period]);

  const activeInvitation = invitations.find((i) => i.id === selectedInvitationId) || invitations[0];

  // Export Analytics Report
  const handleExportCSV = async () => {
    if (!selectedInvitationId) return;
    try {
      const guests = await guestService.getGuestsByInvitationId(selectedInvitationId);
      analyticsService.exportReport('guests', guests, `BaoCaoThongKe_${activeInvitation?.slug || 'wedding'}`);
      toast.success('Đã xuất file báo cáo Excel/CSV thành công!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi xuất báo cáo.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Top Header Banner & Invitation Switcher */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/40 border border-rose-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Realtime Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Thống Kê Chi Tiết Thiệp Cưới
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Theo dõi lượt truy cập, thiết bị, phản hồi RSVP và dòng thời gian tương tác realtime.
          </p>
        </div>

        {/* Action Controls: Switch Invitation & Export */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {invitations.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-2 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold pl-2">Thiệp:</span>
              <select
                value={selectedInvitationId}
                onChange={(e) => setSelectedInvitationId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-400 focus:outline-none"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo Excel</span>
          </button>
        </div>
      </div>

      {/* TIME RANGE SELECTOR BAR */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <span className="text-xs font-bold text-slate-300">Chọn Chu Kỳ Thống Kê:</span>
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {[
            { id: '7d', label: '7 Ngày' },
            { id: '30d', label: '30 Ngày' },
            { id: '90d', label: '90 Ngày' },
            { id: 'all', label: 'Toàn Bộ' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as AnalyticsPeriod)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                period === item.id ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC SUMMARY CARDS GRID */}
      {loading || !analytics ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500" />
          <p className="text-xs">Đang phân tích dữ liệu thống kê...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Tổng Lượt Xem Thiệp"
              value={analytics.views.total}
              subtext={`Hôm nay: +${analytics.views.today} lượt xem`}
              icon={Eye}
              variant="slate"
            />

            <StatCard
              title="Khách Mời Đã Mở Link"
              value={`${analytics.guests.opened} / ${analytics.guests.total}`}
              subtext={`Chưa mở: ${analytics.guests.unopened} khách`}
              icon={Users}
              variant="emerald"
            />

            <StatCard
              title="Khách Xác Nhận RSVP"
              value={`${analytics.rsvp.attending} Tham Dự`}
              subtext={`Tổng ${analytics.rsvp.totalHeadcount} người đi`}
              icon={CheckCircle2}
              variant="rose"
            />

            <StatCard
              title="Lời Chúc Mừng"
              value={analytics.wishes.total}
              subtext={`Hôm nay: +${analytics.wishes.today} lời chúc`}
              icon={MessageSquare}
              variant="amber"
            />
          </div>

          {/* TIME-SERIES TREND CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Daily Views Trend Chart */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-500" />
                    <span>Biểu Đồ Lượt Truy Cập Theo Ngày</span>
                  </h3>
                  <p className="text-xs text-slate-400">Xu hướng người xem mở thiệp cưới trong chu kỳ {period}</p>
                </div>
              </div>

              {/* SVG / Styled Bar Chart */}
              <div className="h-52 flex items-end justify-between gap-2 pt-6 border-b border-slate-800 pb-2">
                {analytics.views.timeSeries.map((point, idx) => {
                  const maxVal = Math.max(...analytics.views.timeSeries.map((p) => p.value), 1);
                  const heightPercent = Math.max(Math.round((point.value / maxVal) * 100), 8);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] text-rose-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {point.value}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all group-hover:brightness-125 shadow-md shadow-rose-500/10"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{point.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. RSVP Attendance Breakdown Pie Chart Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Tỷ Lệ Phản Hồi RSVP</span>
              </h3>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sẽ Tham Dự
                    </span>
                    <span className="text-white font-mono">{analytics.rsvp.attending} khách</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          analytics.guests.total > 0 ? (analytics.rsvp.attending / analytics.guests.total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Rất Tiếc Vắng Mặt
                    </span>
                    <span className="text-white font-mono">{analytics.rsvp.declined} khách</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{
                        width: `${
                          analytics.guests.total > 0 ? (analytics.rsvp.declined / analytics.guests.total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Chưa Phản Hồi
                    </span>
                    <span className="text-white font-mono">{analytics.rsvp.pending} khách</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          analytics.guests.total > 0 ? (analytics.rsvp.pending / analytics.guests.total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">Tổng Số Người Sẽ Đi (Headcount)</span>
                <p className="text-2xl font-extrabold text-rose-400">{analytics.rsvp.totalHeadcount} người</p>
              </div>
            </div>
          </div>

          {/* VISITOR DEVICE, BROWSER & OS BREAKDOWN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device Type Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>Loại Thiết Bị Truy Cập</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Điện thoại (Mobile)</span>
                  <span className="font-mono text-rose-400 font-bold">{analytics.devices.mobile}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Máy tính (Desktop)</span>
                  <span className="font-mono text-amber-400 font-bold">{analytics.devices.desktop}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Máy tính bảng (Tablet)</span>
                  <span className="font-mono text-indigo-400 font-bold">{analytics.devices.tablet}</span>
                </div>
              </div>
            </div>

            {/* Browser Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Trình Duyệt Sử Dụng</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Google Chrome</span>
                  <span className="font-mono text-white font-bold">{analytics.browsers.chrome}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Safari (iOS/Mac)</span>
                  <span className="font-mono text-white font-bold">{analytics.browsers.safari}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Microsoft Edge</span>
                  <span className="font-mono text-white font-bold">{analytics.browsers.edge}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Mozilla Firefox</span>
                  <span className="font-mono text-white font-bold">{analytics.browsers.firefox}</span>
                </div>
              </div>
            </div>

            {/* OS Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>Hệ Điều Hành</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">iOS (iPhone/iPad)</span>
                  <span className="font-mono text-white font-bold">{analytics.os.ios}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Android</span>
                  <span className="font-mono text-white font-bold">{analytics.os.android}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Windows OS</span>
                  <span className="font-mono text-white font-bold">{analytics.os.windows}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">macOS</span>
                  <span className="font-mono text-white font-bold">{analytics.os.macos}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
