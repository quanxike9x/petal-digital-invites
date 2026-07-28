import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { HeartHandshake, Clock, CheckCircle2, AlertTriangle, Eye, Users, PlusCircle, ArrowRight, Edit3, Copy, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import { useInvitations } from '../../hooks/useInvitations';
import { useAuth } from '../../context/AuthContext';
import { rsvpWishService } from '../../services/rsvpWishService';
import { CreateInvitationModal } from '../../components/invitations/CreateInvitationModal';
import { RenameInvitationModal } from '../../components/invitations/RenameInvitationModal';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { invitations, isLoading, isError, publishInvitation, duplicateInvitation, deleteInvitation } = useInvitations(user?.id);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<{ id: string; title: string } | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalWishes: 0,
    unapprovedWishes: 0,
    attendingCount: 0,
    totalHeadcount: 0,
  });

  // Calculate real-time aggregate stats for user's invitations
  useEffect(() => {
    if (invitations.length > 0) {
      Promise.all(invitations.map((i) => rsvpWishService.getRSVPStats(i.id))).then((results) => {
        const totalWishes = results.reduce((sum, r) => sum + r.totalWishes, 0);
        const unapprovedWishes = results.reduce((sum, r) => sum + r.unapprovedWishesCount, 0);
        const attendingCount = results.reduce((sum, r) => sum + r.attendingCount, 0);
        const totalHeadcount = results.reduce((sum, r) => sum + r.totalHeadcount, 0);

        setDashboardStats({
          totalWishes,
          unapprovedWishes,
          attendingCount,
          totalHeadcount,
        });
      });
    }
  }, [invitations]);

  // Stats calculation
  const totalCount = invitations.length;
  const trialCount = invitations.filter((i) => (i.payment_status === 'trial' || i.payment_status === 'expired') && !i.is_expired).length;
  const premiumCount = invitations.filter((i) => i.payment_status === 'paid').length;
  const totalViews = invitations.reduce((acc, i) => acc + (i.views_count || 42), 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Welcome Banner CTA */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
            <span>Pudwedding Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Xin chào {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Quản lý danh sách thiệp cưới, xem thống kê RSVP và tạo thiệp mới dễ dàng.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 relative z-10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Thiệp Mới</span>
        </button>

        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* User Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Tổng số thiệp"
          value={isLoading ? '...' : totalCount}
          subtext="Thiệp đã tạo"
          icon={HeartHandshake}
          variant="rose"
        />
        <StatCard
          title="Thiệp Premium"
          value={isLoading ? '...' : premiumCount}
          subtext="Gói VIP Trọn Gói"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Tổng lượt xem"
          value={isLoading ? '...' : totalViews}
          subtext="Lượt truy cập thiệp"
          icon={Eye}
          variant="slate"
        />
        <StatCard
          title="Khách Tham Dự RSVP"
          value={isLoading ? '...' : `${dashboardStats.attendingCount} khách`}
          subtext={`Tổng ${dashboardStats.totalHeadcount} người đi`}
          icon={Users}
          variant="rose"
        />
        <StatCard
          title="Lời Chúc Mừng"
          value={isLoading ? '...' : `${dashboardStats.totalWishes} lời chúc`}
          subtext={dashboardStats.unapprovedWishes > 0 ? `${dashboardStats.unapprovedWishes} cần duyệt!` : 'Đã duyệt tất cả'}
          icon={MessageSquare}
          variant={dashboardStats.unapprovedWishes > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Invitations Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Thiệp Cưới Của Tôi</h3>
            <p className="text-xs text-slate-400">Danh sách thiệp cưới hiện có trong tài khoản</p>
          </div>
          <Link
            to="/invitations"
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>Quản lý tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            <div className="h-12 bg-slate-800/60 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-800/60 rounded-xl animate-pulse" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-sm text-slate-400">Bạn chưa tạo thiệp cưới nào.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
            >
              Tạo thiệp đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
              <thead className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tên thiệp</th>
                  <th className="py-3.5 px-4">Gói dịch vụ</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Lượt xem / RSVP</th>
                  <th className="py-3.5 px-4">Hạn dùng</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invitations.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={inv.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'}
                          alt={inv.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-200">{inv.title}</p>
                          <p className="text-xs text-rose-400 font-mono">/{inv.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          inv.plan_type === 'paid'
                            ? 'paid'
                            : inv.plan_type === 'expired' || inv.is_expired
                            ? 'failed'
                            : 'trial'
                        }
                      >
                        {inv.plan_type === 'paid'
                          ? 'Premium'
                          : inv.plan_type === 'expired' || inv.is_expired
                          ? 'Hết hạn'
                          : `Trial (${inv.days_left ?? 3} ngày)`}
                      </Badge>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={inv.status === 'published' ? 'published' : 'draft'}>
                        {inv.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-300">
                      <span>{inv.views_count || 42} views</span> • <span className="text-rose-400">{inv.rsvp_count || 8} RSVP</span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(inv.expires_at).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => publishInvitation({ id: inv.id, isPublished: inv.status !== 'published' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            inv.status === 'published'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {inv.status === 'published' ? 'Hủy' : 'Publish'}
                        </button>

                        <button
                          onClick={() => setEditingInv({ id: inv.id, title: inv.title })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Đổi tên thiệp"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateInvitation(inv.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Nhân bản thiệp"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Xóa thiệp "${inv.title}"?`)) {
                              deleteInvitation(inv.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                          title="Xóa thiệp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateInvitationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      {editingInv && (
        <RenameInvitationModal
          isOpen={!!editingInv}
          invitationId={editingInv.id}
          currentTitle={editingInv.title}
          onClose={() => setEditingInv(null)}
        />
      )}
    </div>
  );
};
