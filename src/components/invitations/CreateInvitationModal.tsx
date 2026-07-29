import React, { useState, useEffect } from 'react';
import { useInvitations } from '../../hooks/useInvitations';
import { useAuth } from '../../context/AuthContext';
import { useTemplates } from '../../hooks/useTemplates';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, PlusCircle, AlertCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface CreateInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateId?: string;
}

export const CreateInvitationModal: React.FC<CreateInvitationModalProps> = ({ isOpen, onClose, initialTemplateId }) => {
  const { user } = useAuth();
  const { createInvitation, isCreating } = useInvitations(user?.id);
  const { templates, isLoading: isLoadingTemplates } = useTemplates(true);
  const navigate = useNavigate();

  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || '');

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(initialTemplateId || templates[0].id);
    }
  }, [templates, initialTemplateId, selectedTemplateId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brideName.trim() || !groomName.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tên Cô Dâu và Tên Chú Rể!');
      return;
    }

    try {
      const created = await createInvitation({
        template_id: selectedTemplateId,
        bride_name: brideName.trim(),
        groom_name: groomName.trim(),
      });
      
      setBrideName('');
      setGroomName('');
      onClose();
      toast.success(`Đã tạo thành công thiệp cưới "${created.title}" với Gói Dùng Thử 3 Ngày!`);
      // Auto redirect to Customer Form Editor
      navigate(`/editor/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo thiệp mới.');
    }
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

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Khởi Tạo Thiệp Cưới Mới</h2>
          <p className="text-xs text-slate-400">
            Mỗi thiệp cưới sẽ có <strong className="text-amber-400">Gói Dùng Thử 3 Ngày</strong> độc lập.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Inputs for Bride & Groom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Tên Cô Dâu</span>
              </label>
              <input
                type="text"
                placeholder="VD: Quỳnh Hoa"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-amber-400" />
                <span>Tên Chú Rể</span>
              </label>
              <input
                type="text"
                placeholder="VD: Minh Phong"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Title Preview */}
          {brideName.trim() && groomName.trim() && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
              Tiêu đề thiệp cưới: "{brideName.trim()} & {groomName.trim()}"
            </div>
          )}

          {/* Template Picker */}
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Chọn mẫu giao diện (Template từ Admin Supabase)</label>
            {isLoadingTemplates ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/40 rounded-xl animate-pulse">
                Đang nạp kho mẫu từ Supabase...
              </div>
            ) : templates.length === 0 ? (
              <div className="p-4 text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                Chưa có mẫu thiệp nào được Admin xuất bản trên Supabase. Vui lòng quay lại sau!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedTemplateId === tpl.id
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <img src={tpl.thumbnail_url} alt={tpl.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{tpl.name}</p>
                      <p className="text-[10px] opacity-70">{tpl.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
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
              disabled={isCreating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isCreating ? 'Đang tạo...' : 'Tạo Thiệp & Mở Editor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
