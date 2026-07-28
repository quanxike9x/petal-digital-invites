import React, { useState } from 'react';
import type { Invitation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { paymentService, getAdminBankConfig } from '../../services/paymentService';
import { generateVietQRUrl } from '../../services/vietQRService';
import { 
  AlertTriangle, 
  CreditCard, 
  LogOut, 
  QrCode, 
  CheckCircle2, 
  Crown, 
  Copy,
  Download,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface ExpiredTrialPaymentModalProps {
  invitation: Invitation;
  onPaymentSubmitted?: () => void;
}

export const ExpiredTrialPaymentModal: React.FC<ExpiredTrialPaymentModalProps> = ({
  invitation,
  onPaymentSubmitted,
}) => {
  const { user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any | null>(null);
  const [copiedSTK, setCopiedSTK] = useState(false);

  const adminBankConfig = getAdminBankConfig();
  const SINGLE_PLAN_PRICE = 199000;
  const SINGLE_PLAN_NAME = 'Gói Dịch Vụ Thiệp Cưới Trọn Gói';

  const handleCreateAndSubmitOrder = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const order = await paymentService.createOrder({
        invitation_id: invitation.id,
        invitation_title: invitation.title,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email.split('@')[0],
        user_email: user.email,
        package_name: 'Pro',
      });

      setOrderCreated(order);
      toast.success(`Đã tạo đơn thanh toán ${order.order_code}! Vui lòng quét mã VietQR để chuyển khoản.`);
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo đơn thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderCode = orderCreated?.order_code || `PWD-INV-${invitation.id.slice(-6).toUpperCase()}`;
  const amount = orderCreated?.amount || SINGLE_PLAN_PRICE;

  const vietQRUrl = generateVietQRUrl(
    adminBankConfig.bankName,
    adminBankConfig.accountNumber,
    adminBankConfig.accountName,
    orderCode,
    amount
  );

  const handleCopySTK = () => {
    navigator.clipboard.writeText(adminBankConfig.accountNumber);
    setCopiedSTK(true);
    toast.success(`Đã sao chép số tài khoản: ${adminBankConfig.accountNumber}`);
    setTimeout(() => setCopiedSTK(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = vietQRUrl;
    link.download = `VietQR_ThanhToan_${orderCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải ảnh mã VietQR thanh toán!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn font-sans text-slate-100 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        {/* TOP ALERT HEADER */}
        <div className="flex flex-col items-center text-center space-y-2 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500/50 text-rose-500 flex items-center justify-center shadow-inner animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Dùng Thử Đã Hết Hạn</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Thời gian 03 ngày dùng thử miễn phí cho thiệp <span className="text-rose-400 font-bold">"{invitation.title}"</span> đã kết thúc. Vui lòng thanh toán để mở khóa tiếp tục sử dụng.
          </p>
        </div>

        {/* SINGLE 199K PRICING PLAN CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border-2 border-rose-500/60 space-y-3 relative shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
              <span className="font-bold text-base text-white">{SINGLE_PLAN_NAME}</span>
            </div>
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              DUY NHẤT 199.000đ
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">199.000 VNĐ</span>
            <span className="text-xs text-slate-400">/ Thiệp cưới vĩnh viễn</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full tính năng VIP không giới hạn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Tạo VietQR mừng cưới ngân hàng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Nhạc nền MP3 & Album ảnh cưới</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Quản lý danh sách & RSVP khách</span>
            </div>
          </div>
        </div>

        {/* VIETQR PAYMENT DISPLAY CARD WITH COPY & DOWNLOAD */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <QrCode className="w-4 h-4" />
              <span>Thanh Toán Chuyển Khoản Mã VietQR Chuẩn Quốc Gia</span>
            </div>
            <button
              onClick={handleDownloadQR}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/40 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Ảnh QR</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-36 h-36 bg-white p-2 rounded-2xl shadow-lg border shrink-0 flex flex-col items-center justify-center">
              <img src={vietQRUrl} alt="VietQR Payment" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2 text-xs text-slate-300 flex-1 w-full">
              <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/90 p-3.5 rounded-xl border border-slate-700">
                <p><span className="text-slate-400">Ngân hàng:</span> <span className="text-white font-bold">{adminBankConfig.bankName}</span></p>
                
                <div className="flex items-center justify-between">
                  <p>
                    <span className="text-slate-400">Số tài khoản:</span>{' '}
                    <span className="text-amber-400 font-bold text-xs">{adminBankConfig.accountNumber}</span>
                  </p>
                  <button
                    onClick={handleCopySTK}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-600 flex items-center gap-1 shrink-0 ml-2"
                  >
                    {copiedSTK ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-rose-400" />}
                    <span>{copiedSTK ? 'Đã chép' : 'Copy STK'}</span>
                  </button>
                </div>

                <p><span className="text-slate-400">Chủ tài khoản:</span> <span className="text-white font-bold">{adminBankConfig.accountName}</span></p>
                <p><span className="text-slate-400">Nội dung CK:</span> <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded">{orderCode}</span></p>
                <p><span className="text-slate-400">Số tiền:</span> <span className="text-emerald-400 font-bold text-sm">199.000 VNĐ</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>

          <button
            onClick={handleCreateAndSubmitOrder}
            disabled={isSubmitting}
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all hover:scale-[1.02]"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang tạo đơn...' : orderCreated ? 'Đã Gửi Đơn - Chờ Xác Nhận' : 'Thanh Toán Ngay 199.000đ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
