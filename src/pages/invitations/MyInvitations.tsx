import React, { useState } from 'react';
import { useInvitations } from '../../hooks/useInvitations';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { CreateInvitationModal } from '../../components/invitations/CreateInvitationModal';
import { TemplatePreviewModal } from '../../components/templates/TemplatePreviewModal';
import { ExpiredTrialPaymentModal } from '../../components/payments/ExpiredTrialPaymentModal';
import { mockTemplates } from '../../data/mockData';
import type { Template, Invitation } from '../../types';
import { 
  PlusCircle, 
  Edit3, 
  Eye, 
  Trash2, 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  Calendar,
  CreditCard,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

export const MyInvitations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { invitations, isLoading, deleteInvitation, refetch } = useInvitations(user?.id);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewInvitation, setPreviewInvitation] = useState<Invitation | null>(null);
  const [paymentTargetInv, setPaymentTargetInv] = useState<Invitation | null>(null);

  const handleOpenPreview = (inv: Invitation) => {
    const found = mockTemplates.find((t) => t.id === inv.template_id) || mockTemplates[0];
    setPreviewTemplate(found);
    setPreviewInvitation(inv);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Hệ Thống Quản Lý Thiệp Cưới</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Thiệp Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Quản lý các mẫu thiệp cưới cá nhân. Mỗi thiệp có Gói Dùng Thử 3 Ngày và thanh toán riêng biệt.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/30 transition-all hover:scale-105 flex items-center gap-2 shrink-0 relative z-10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Thiệp Mới</span>
        </button>

        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Invitations List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800/60 rounded-3xl animate-pulse" />
          <div className="h-80 bg-slate-800/60 rounded-3xl animate-pulse" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">Bạn chưa tạo thiệp cưới nào.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
          >
            Tạo thiệp đầu tiên ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md hover:border-rose-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Header Thumbnail */}
              <div className="relative aspect-[16/9] bg-slate-800 overflow-hidden">
                <img
                  src={inv.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'}
                  alt={inv.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge
                    variant={
                      inv.payment_status === 'paid'
                        ? 'paid'
                        : inv.payment_status === 'expired' || inv.is_expired
                        ? 'failed'
                        : 'trial'
                    }
                  >
                    {inv.payment_status === 'paid'
                      ? 'Premium VIP'
                      : inv.payment_status === 'expired' || inv.is_expired
                      ? 'Hết hạn dùng thử'
                      : `Trial (${inv.days_left ?? 3} ngày)`}
                  </Badge>
                </div>
              </div>

              {/* Card Information */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{inv.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Ngày tạo: {new Date(inv.created_at).toLocaleDateString('vi-VN')}</span>
                  </p>
                </div>

                {/* Metrics & Trial Remaining Time */}
                <div className="grid grid-cols-2 gap-2 py-3 bg-slate-800/50 rounded-2xl text-center border border-slate-700/50 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Thời Gian Trial</p>
                    <p className="font-bold text-amber-400 mt-0.5 text-[11px]">
                      {inv.payment_status === 'paid'
                        ? 'Vĩnh Viễn (Paid)'
                        : inv.payment_status === 'expired' || inv.is_expired
                        ? 'Đã Hết Hạn'
                        : `Còn ${inv.days_left ?? 3} ngày`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Trạng Thái</p>
                    <p className="font-bold text-slate-200 mt-0.5 uppercase text-[11px]">{inv.payment_status}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => navigate(`/editor/customer/${inv.id}`)}
                    className="py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa thiệp</span>
                  </button>

                  <button
                    onClick={() => handleOpenPreview(inv)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem trước</span>
                  </button>

                  <button
                    onClick={() => setPaymentTargetInv(inv)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                      inv.payment_status === 'paid'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{inv.payment_status === 'paid' ? 'Đã Thanh Toán' : 'Thanh Toán 199k'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Xóa thiệp cưới "${inv.title}"?`)) {
                        deleteInvitation(inv.id);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa thiệp</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateInvitationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      <TemplatePreviewModal
        invitation={previewInvitation}
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => {
          setPreviewTemplate(null);
          setPreviewInvitation(null);
        }}
      />

      {paymentTargetInv && (
        <ExpiredTrialPaymentModal
          invitation={paymentTargetInv}
          onPaymentSubmitted={() => {
            setPaymentTargetInv(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
