import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInvitations } from '../../hooks/useInvitations';
import { Lock, Sparkles, CreditCard, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TrialExpiredLockModalProps {
  isLocked: boolean;
  expiredInvitationId?: string;
  onUnlocked?: () => void;
}

export const TrialExpiredLockModal: React.FC<TrialExpiredLockModalProps> = ({
  isLocked,
  expiredInvitationId,
  onUnlocked,
}) => {
  const { logout, user } = useAuth();
  const { updateInvitation } = useInvitations(user?.id);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isLocked) return null;

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      if (expiredInvitationId) {
        await updateInvitation({
          id: expiredInvitationId,
          updates: {
            plan_type: 'paid',
            status: 'published',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      }
      toast.success('Thanh toán thành công! Tài khoản đã được nâng cấp lên gói VIP Premium.');
      setIsProcessing(false);
      if (onUnlocked) onUnlocked();
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi xử lý thanh toán.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden">
        {/* Glow Background Orbs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>

        {/* Header Titles */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Dùng Thử Đã Hết Hạn!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Thời gian dùng thử 3 ngày cho thiệp cưới của bạn đã kết thúc. Vui lòng thanh toán để tiếp tục chỉnh sửa và giữ thiệp hoạt động.
          </p>
        </div>

        {/* Pricing Box */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Gói Nâng Cấp VIP Premium (1 Năm)</span>
            <span className="text-lg font-extrabold text-rose-400">299.000đ</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 border-t border-slate-700/60 pt-2">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mở khóa toàn bộ tính năng chỉnh sửa & xuất bản</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Không giới hạn lượt xem & lưu trữ album cưới</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hỗ trợ chọn Tên Miền Riêng (pudwedding.shop/slug)</span>
            </li>
          </ul>
        </div>

        {/* Buttons Action */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isProcessing ? 'Đang kích hoạt...' : 'Thanh Toán Ngay 299.000đ'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
