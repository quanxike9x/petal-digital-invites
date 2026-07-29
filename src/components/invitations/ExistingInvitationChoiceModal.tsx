import React from 'react';
import type { Invitation } from '../../types';
import { X, PlusCircle, Edit3, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExistingInvitationChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingInvitations: Invitation[];
  onChooseCreateNew: () => void;
  templateName?: string;
}

export const ExistingInvitationChoiceModal: React.FC<ExistingInvitationChoiceModalProps> = ({
  isOpen,
  onClose,
  existingInvitations,
  onChooseCreateNew,
  templateName = 'Mẫu thiệp',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectExisting = (invitationId: string) => {
    onClose();
    navigate(`/editor/customer/${invitationId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Bạn Đã Có Thiệp Cưới Sẵn Có</h2>
          <p className="text-xs text-slate-400">
            Bạn muốn tạo thiệp mới từ mẫu <strong className="text-rose-400">"{templateName}"</strong> hay muốn tiếp tục chỉnh sửa thiệp cưới hiện có?
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Option 1: Create New Invitation */}
          <button
            onClick={() => {
              onClose();
              onChooseCreateNew();
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-sm">Tạo Thiệp Mới Với Mẫu Này</p>
                <p className="text-[11px] text-rose-100 font-normal">Tạo thêm 1 thiệp cưới mới dùng mẫu "{templateName}"</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>

          {/* Divider */}
          <div className="relative text-center my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <span className="relative px-3 bg-slate-900 text-[11px] text-slate-500 uppercase font-bold">Hoặc tiếp tục sửa thiệp hiện có</span>
          </div>

          {/* Option 2: List of Existing Invitations */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {existingInvitations.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleSelectExisting(inv.id)}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-rose-500/60 cursor-pointer flex items-center justify-between transition-all hover:bg-slate-800 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={inv.thumbnail_url} alt={inv.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors truncate">
                      {inv.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">/{inv.slug} • Trạng thái: {inv.status.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
