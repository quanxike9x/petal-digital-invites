import React, { useState } from 'react';
import { useInvitations } from '../../hooks/useInvitations';
import { X, Edit3, Save } from 'lucide-react';
import { toast } from 'sonner';

interface RenameInvitationModalProps {
  isOpen: boolean;
  invitationId: string;
  currentTitle: string;
  onClose: () => void;
}

export const RenameInvitationModal: React.FC<RenameInvitationModalProps> = ({
  isOpen,
  invitationId,
  currentTitle,
  onClose,
}) => {
  const { updateInvitation } = useInvitations();
  const [title, setTitle] = useState(currentTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Tên thiệp không được để trống!');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateInvitation({
        id: invitationId,
        updates: { title: title.trim() },
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Đổi Tên Thiệp Cưới</h2>
          <p className="text-xs text-slate-400">Cập nhật tiêu đề hiển thị của thiệp cưới</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Tên thiệp cưới mới</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Tên Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
