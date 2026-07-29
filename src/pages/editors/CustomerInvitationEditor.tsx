import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invitationService } from '../../services/invitationService';
import { templateService } from '../../services/templateService';
import type { Invitation, Template } from '../../types';
import { ExpiredTrialPaymentModal } from '../../components/payments/ExpiredTrialPaymentModal';
import { fixVietnamese } from '../../utils/vietnameseUtils';
import { TextInput, TextAreaInput } from '../../components/common/VietnameseInputs';
import { TemplatePreviewModal } from '../../components/templates/TemplatePreviewModal';
import { InvitationRuntime } from '../../components/runtime/InvitationRuntime';
import { MusicLibraryModal } from '../../components/music/MusicLibraryModal';
import { useAuth } from '../../context/AuthContext';
import { mockTemplates } from '../../data/mockData';
import { VIETNAMESE_BANKS, generateVietQRUrl } from '../../services/vietQRService';
import { useInvitationHistory } from '../../hooks/useInvitationHistory';
import { 
  ArrowLeft, 
  Heart, 
  Calendar, 
  Image as ImageIcon, 
  Music, 
  QrCode, 
  Palette, 
  Globe2, 
  Copy, 
  ExternalLink, 
  Eye, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Monitor,
  Tablet,
  Lock,
  CreditCard,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

import { MediaManagerModal } from '../../components/media/MediaManagerModal';
import type { MediaType } from '../../types';

export const CustomerInvitationEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('info');
  
  // Media & Music Library Modal States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalTab, setMediaModalTab] = useState<MediaType>('image');
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  
  // Autosave & Dirty States
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [isDirty, setIsDirty] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Viewport & Zoom Controls
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('100');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // History Stack for Undo/Redo
  const {
    present,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    initHistory,
  } = useInvitationHistory(invitation);

  // Debounced Autosave Timer Ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch invitation & template data on mount
  useEffect(() => {
    if (id) {
      invitationService.getInvitationById(id).then((inv) => {
        if (inv) {
          setInvitation(inv);
          initHistory(inv);
          if (inv.template_id) {
            templateService.getTemplateById(inv.template_id).then(setTemplate);
          }
        }
      });
    }
  }, [id, initHistory]);

  // Sync state when present history changes via Undo/Redo
  useEffect(() => {
    if (present && present !== invitation) {
      setInvitation(present);
    }
  }, [present]);

  // Keyboard Shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Shift+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Ctrl + Shift + Z -> Redo
          e.preventDefault();
          const next = redo();
          if (next) {
            setInvitation(next);
            toast.info('Đã làm lại (Redo)');
          }
        } else {
          // Ctrl + Z -> Undo
          e.preventDefault();
          const prev = undo();
          if (prev) {
            setInvitation(prev);
            toast.info('Đã hoàn tác (Undo)');
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        // Ctrl + Y -> Redo
        e.preventDefault();
        const next = redo();
        if (next) {
          setInvitation(next);
          toast.info('Đã làm lại (Redo)');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Timer Cleanup Effect on Unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Background Silent Autosave (1000ms Debounce)
  const triggerDebouncedAutosave = useCallback(
    (updated: Invitation) => {
      if (!id) return;
      setSaveState('saving');

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await invitationService.updateInvitation(id, updated);
          setSaveState('saved');
        } catch (err) {
          console.error('Autosave error:', err);
          setSaveState('error');
        }
      }, 1000);
    },
    [id]
  );

  // Immediate Form State Update -> Instant Preview Sync & History Push
  const handleFieldChange = (field: keyof Invitation, value: any) => {
    if (!invitation) return;

    const cleanedVal = typeof value === 'string' ? fixVietnamese(value) : value;
    const updated = { ...invitation, [field]: cleanedVal };

    if (field === 'bride_name' || field === 'groom_name') {
      updated.title = `${fixVietnamese(updated.bride_name)} & ${fixVietnamese(updated.groom_name)}`;
    }

    // 1. Update active state instantly -> Realtime Preview updates
    setInvitation(updated);
    setIsDirty(true);

    // 2. Push to Undo/Redo history stack
    pushState(updated);

    // 3. Trigger 1000ms debounced autosave
    triggerDebouncedAutosave(updated);
  };

  // Handle Manual Undo Click
  const handleUndoClick = () => {
    const prev = undo();
    if (prev) {
      setInvitation(prev);
      toast.info('Đã hoàn tác (Undo)');
    }
  };

  // Handle Manual Redo Click
  const handleRedoClick = () => {
    const next = redo();
    if (next) {
      setInvitation(next);
      toast.info('Đã làm lại (Redo)');
    }
  };

  // Open Draft Preview in New Tab
  const handleOpenDraftPreviewNewTab = () => {
    if (!invitation) return;
    const draftPreviewUrl = `${window.location.origin}/w/${invitation.slug}?preview=draft`;
    window.open(draftPreviewUrl, '_blank');
  };

  // Publish Action & Pre-check Validation
  const handlePublish = async () => {
    if (!id || !invitation) return;

    if (!invitation.bride_name?.trim()) {
      toast.error('Chưa nhập Tên Cô Dâu! Vui lòng bổ sung trước khi xuất bản.');
      setActiveTab('info');
      return;
    }
    if (!invitation.groom_name?.trim()) {
      toast.error('Chưa nhập Tên Chú Rể! Vui lòng bổ sung trước khi xuất bản.');
      setActiveTab('info');
      return;
    }
    if (!invitation.wedding_date?.trim()) {
      toast.error('Chưa nhập Ngày Tổ Chức Cưới! Vui lòng chọn ngày trước khi xuất bản.');
      setActiveTab('events');
      return;
    }

    setIsPublishing(true);
    try {
      const published = await invitationService.publishInvitation(id);
      setInvitation(published);
      setIsDirty(false);
      toast.success('Xuất bản Thiệp cưới thành công! Website công khai đã sẵn sàng.');
      setActiveTab('publish');
    } catch (err: any) {
      toast.error(err.message || 'Không thể xuất bản thiệp.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (!invitation) return;
    const publicUrl = `${window.location.origin}/w/${invitation.slug}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success(`Đã sao chép link công khai: ${publicUrl}`);
  };

  const handleDownloadQR = () => {
    if (!invitation) return;
    const qrUrl = generateVietQRUrl(
      invitation.bank_name,
      invitation.account_number,
      invitation.account_name,
      `Mung cuoi ${invitation.title}`
    );
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `VietQR_ThiepCuoi_${invitation.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải mã VietQR chuyển khoản!');
  };

  // SKELETON LOADING PLACEHOLDER
  if (!invitation) {
    return (
      <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="w-36 h-6 bg-slate-800 rounded-xl animate-pulse" />
          <div className="w-48 h-8 bg-slate-800 rounded-xl animate-pulse" />
        </header>
        <div className="flex-1 flex p-6 gap-6">
          <div className="w-1/2 space-y-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 animate-pulse">
            <div className="h-10 bg-slate-800 rounded-2xl" />
            <div className="h-40 bg-slate-800 rounded-2xl" />
            <div className="h-40 bg-slate-800 rounded-2xl" />
          </div>
          <div className="w-1/2 bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center">
            <div className="w-72 h-[500px] bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const selectedTemplate = mockTemplates.find((t) => t.id === invitation.template_id) || mockTemplates[0];
  const publicUrl = `${window.location.origin}/w/${invitation.slug}`;
  const currentVietQRUrl = generateVietQRUrl(
    invitation.groom_bank_name || invitation.bank_name,
    invitation.groom_account_number || invitation.account_number,
    invitation.groom_account_name || invitation.account_name,
    `Mung cuoi ${invitation.groom_name} ${invitation.bride_name}`
  );

  // Zoom Transform Helper
  const getZoomScale = () => {
    switch (zoomLevel) {
      case '50': return 0.5;
      case '75': return 0.75;
      case '125': return 1.25;
      case '150': return 1.5;
      default: return 1.0;
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Navigation & Desktop Toolbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            to="/invitations"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">{invitation.title}</h2>
              {/* Dirty State & Published Status Badge */}
              {isDirty ? (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Có thay đổi chưa xuất bản</span>
                </span>
              ) : invitation.status === 'published' ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Đã xuất bản</span>
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-700">
                  Bản nháp (Draft)
                </span>
              )}
            </div>

            {/* Autosave Status Indicator */}
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              {saveState === 'saving' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-300">Saving...</span>
                </>
              ) : saveState === 'saved' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">✔ Đã lưu</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">Lỗi lưu</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Undo / Redo History Buttons & Action Controls */}
        <div className="flex items-center gap-3">
          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={handleUndoClick}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                canUndo ? 'text-slate-200 hover:bg-slate-700 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedoClick}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                canRedo ? 'text-slate-200 hover:bg-slate-700 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mở Preview Tab Mới (Draft Preview in New Tab) */}
          <button
            onClick={handleOpenDraftPreviewNewTab}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            title="Mở tab mới xem trước bản nháp mà chưa cần Publish"
          >
            <ExternalLink className="w-4 h-4 text-rose-400" />
            <span>Mở Preview Tab Mới</span>
          </button>

          {/* Desktop Preview Modal & Publish Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Xem Trước</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                invitation.status === 'published' && !isDirty
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/25'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{invitation.status === 'published' && !isDirty ? 'Đã Xuất Bản' : 'Xuất Bản ngay'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Split View */}
      <div className="flex-1 flex min-h-0 overflow-hidden pb-16 md:pb-0">
        {/* Left Side Tab Controls & Data Form */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-800 bg-slate-900/60 overflow-y-auto">
          {/* Navigation Tab Menu */}
          <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 overflow-x-auto shrink-0">
            {[
              { id: 'info', label: 'Cô Dâu & Chú Rể', icon: Heart },
              { id: 'events', label: 'Sự Kiện & Maps', icon: Calendar },
              { id: 'gallery', label: 'Album Ảnh', icon: ImageIcon },
              { id: 'music_gift', label: 'Nhạc & VietQR Quà Mừng', icon: CreditCard },
              { id: 'style', label: 'Màu & Font', icon: Palette },
              { id: 'publish', label: 'Quản Lý Website', icon: Globe2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as EditorTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Tab Content */}
          <div className="p-6 space-y-6">
            {/* TAB 1: THÔNG TIN CÔ DÂU & CHÚ RỂ */}
            {activeTab === 'info' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Thông Tin Cô Dâu & Chú Rể</span>
                </h3>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="text-xs font-bold text-amber-400">Thông tin Chú Rể</h4>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Tên Chú Rể *</label>
                    <TextInput
                      value={invitation.groom_name || ''}
                      onChange={(val) => handleFieldChange('groom_name', val)}
                      required
                      placeholder="Nhập tên chú rể (VD: Trần Minh Phong)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Gia đình Nhà Trai (Cha & Mẹ)</label>
                    <TextInput
                      value={invitation.groom_parent || ''}
                      onChange={(val) => handleFieldChange('groom_parent', val)}
                      placeholder="Ông Trần Văn A - Bà Lê Thị B"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="text-xs font-bold text-rose-400">Thông tin Cô Dâu</h4>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Tên Cô Dâu *</label>
                    <TextInput
                      value={invitation.bride_name || ''}
                      onChange={(val) => handleFieldChange('bride_name', val)}
                      required
                      placeholder="Nhập tên cô dâu (VD: Nguyễn Quỳnh Hoa)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Gia đình Nhà Gái (Cha & Mẹ)</label>
                    <TextInput
                      value={invitation.bride_parent || ''}
                      onChange={(val) => handleFieldChange('bride_parent', val)}
                      placeholder="Ông Nguyễn Văn C - Bà Phạm Thị D"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <label className="text-xs text-slate-300 block mb-1">Lời ngỏ / Câu chuyện tình yêu</label>
                  <TextAreaInput
                    rows={3}
                    value={invitation.story || ''}
                    onChange={(val) => handleFieldChange('story', val)}
                    placeholder="Nhập câu chuyện tình yêu..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: SỰ KIỆN & ĐỊA ĐIỂM */}
            {activeTab === 'events' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Sự Kiện & Bản Đồ Google Maps</span>
                </h3>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Ngày cưới *</label>
                      <input
                        type="date"
                        value={invitation.wedding_date || ''}
                        onChange={(e) => handleFieldChange('wedding_date', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Giờ cử hành</label>
                      <TextInput
                        value={invitation.ceremony_time || ''}
                        onChange={(val) => handleFieldChange('ceremony_time', val)}
                        placeholder="11:00 AM"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Giờ đón khách</label>
                      <TextInput
                        value={invitation.reception_time || ''}
                        onChange={(val) => handleFieldChange('reception_time', val)}
                        placeholder="06:00 PM"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Tên trung tâm / Nhà hàng</label>
                    <TextInput
                      value={invitation.venue_name || ''}
                      onChange={(val) => handleFieldChange('venue_name', val)}
                      placeholder="VD: Trung Tâm Hội Nghị Đại Nam"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Địa chỉ chi tiết</label>
                    <TextInput
                      value={invitation.address || ''}
                      onChange={(val) => handleFieldChange('address', val)}
                      placeholder="123 Đường Nguyễn Huệ, Quận 1, TP. HCM"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Link Google Maps</label>
                    <TextInput
                      value={invitation.google_map || ''}
                      onChange={(val) => handleFieldChange('google_map', val)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ALBUM ẢNH CƯỚI (GALLERY MANAGER) */}
            {activeTab === 'gallery' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Album Ảnh Cưới Gallery ({invitation.gallery?.length || 0} ảnh)</span>
                  </h3>

                  <button
                    onClick={() => {
                      setMediaModalTab('image');
                      setIsMediaModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mở Quản Lý Media & Kéo Thả Upload</span>
                  </button>
                </div>

                {/* Gallery Quick Preview */}
                <div className="p-5 rounded-3xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Ảnh đã nạp vào Gallery thiệp:</span>
                    <span className="font-mono text-rose-400">{invitation.gallery?.length || 0} / 100 ảnh</span>
                  </div>

                  {invitation.gallery && invitation.gallery.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                      {invitation.gallery.map((url, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group relative">
                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-white font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                      <p>Chưa có ảnh nào trong Album thiệp cưới này.</p>
                      <button
                        onClick={() => {
                          setMediaModalTab('image');
                          setIsMediaModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs border border-slate-700"
                      >
                        + Upload ảnh cưới ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: NHẠC NỀN & QUÀ MỪNG VIETQR */}
            {activeTab === 'music_gift' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Cấu Hình VietQR Ngân Hàng Mừng Cưới & Nhạc Nền</span>
                </h3>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-400 uppercase flex items-center gap-2">
                        <Music className="w-4 h-4 text-rose-400" />
                        <span>Nhạc Nền Thiệp Cưới (Music Library)</span>
                      </label>
                      {user?.role === 'admin' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                          ADMIN MODE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                      <div className="overflow-hidden pr-2">
                        <p className="text-xs font-bold text-white truncate">
                          {invitation.music ? 'Bài hát đang phát' : 'Chưa chọn nhạc nền'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {invitation.music || 'Chọn bài hát ngọt ngào từ Music Library'}
                        </p>
                      </div>

                      <button
                        onClick={() => setIsMusicModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all"
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span>{user?.role === 'admin' ? 'Quản Lý & Chọn Nhạc Nền' : 'Chọn Bài Hát Từ Music Library'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>Cấu Hình Mã VietQR Chuyển Khoản Mừng Cưới</span>
                    </h4>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Chọn Ngân Hàng (Chuẩn VietQR)</label>
                      <select
                        value={invitation.bank_name || 'MB Bank'}
                        onChange={(e) => handleFieldChange('bank_name', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none"
                      >
                        {VIETNAMESE_BANKS.map((b) => (
                          <option key={b.code} value={b.shortName}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-700/70 bg-slate-800/70 p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Chú rể</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">Số Tài Khoản</label>
                            <TextInput
                              value={invitation.groom_account_number || invitation.account_number || ''}
                              onChange={(val) => handleFieldChange('groom_account_number', val)}
                              placeholder="1018920192"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">Tên Chủ Tài Khoản</label>
                            <TextInput
                              value={invitation.groom_account_name || invitation.account_name || ''}
                              onChange={(val) => handleFieldChange('groom_account_name', val)}
                              placeholder="TRAN MINH PHONG"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-rose-700/50 bg-rose-500/10 p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Cô dâu</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">Số Tài Khoản</label>
                            <TextInput
                              value={invitation.bride_account_number || invitation.account_number || ''}
                              onChange={(val) => handleFieldChange('bride_account_number', val)}
                              placeholder="0988291029"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">Tên Chủ Tài Khoản</label>
                            <TextInput
                              value={invitation.bride_account_name || invitation.account_name || ''}
                              onChange={(val) => handleFieldChange('bride_account_name', val)}
                              placeholder="LE QUYNH HOA"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-4">
                      <img
                        src={currentVietQRUrl}
                        alt="VietQR Preview"
                        className="w-24 h-24 rounded-lg bg-white p-1 shadow-md object-contain"
                      />
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-white">Mã VietQR Chuẩn Ngân Hàng</p>
                        <p className="text-slate-400 text-[11px]">
                          Quét trực tiếp bằng App Vietcombank, MB, Techcombank, BIDV, Agribank, VPBank, MoMo,...
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          VietQR National Standard
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MÀU SẮC & FONT CHỮ */}
            {activeTab === 'style' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Màu Sắc & Font Chữ Thiệp</span>
                </h3>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div>
                    <label className="text-xs text-slate-300 block mb-2">Tông màu chủ đạo</label>
                    <div className="flex items-center gap-3">
                      {['#E11D48', '#DC2626', '#D97706', '#0D9488', '#475569'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleFieldChange('theme_color', color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            invitation.theme_color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="text-xs text-slate-300 block mb-1">Font chữ chủ đạo</label>
                    <select
                      value={invitation.font || 'Lora'}
                      onChange={(e) => handleFieldChange('font', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-semibold"
                    >
                      <option value="Lora">Lora (Serif Cao Cấp Tiếng Việt)</option>
                      <option value="Merriweather">Merriweather (Sang Trọng)</option>
                      <option value="Be Vietnam Pro">Be Vietnam Pro (Hiện Đại)</option>
                      <option value="Great Vibes">Great Vibes (Nghệ Thuật)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: HỘP QUẢN LÝ WEBSITE CÔNG KHAI */}
            {activeTab === 'publish' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  <span>Hộp Quản Lý Website Công Khai</span>
                </h3>

                {invitation.status !== 'published' ? (
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Thiệp đang ở trạng thái Bản Nháp. Hãy hoàn thiện thông tin và bấm Xuất Bản!</span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1.5">Domain Chọn</label>
                      <select
                        value={invitation.domain_id || 'pudwedding.shop'}
                        onChange={(e) => handleFieldChange('domain_id', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold"
                      >
                        <option value="pudwedding.shop">pudwedding.shop (Mặc định)</option>
                        <option value="weddingvip.vn">weddingvip.vn (Domain Phụ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1.5">Slug Đường Dẫn (Được sửa trước khi Xuất bản)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">https://{invitation.domain_id || 'pudwedding.shop'}/w/</span>
                        <TextInput
                          value={invitation.slug}
                          onChange={(val) => handleFieldChange('slug', val)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-400 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Xác Nhận & Xuất Bản Website Ngay</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Website Đã Xuất Bản Thành Công</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md border border-emerald-500/40">
                        PUBLISHED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                        <span className="text-slate-400 text-[11px]">Domain phát hành:</span>
                        <p className="font-bold text-white font-mono mt-0.5">{invitation.domain_id || 'pudwedding.shop'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                        <span className="text-slate-400 text-[11px]">Slug cố định:</span>
                        <p className="font-bold text-rose-400 font-mono mt-0.5">/{invitation.slug}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Đường dẫn URL và Slug đã được khóa cố định để đảm bảo liên kết công khai luôn hoạt động tốt.</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 font-mono text-xs text-emerald-400 flex items-center justify-between">
                      <span className="truncate">{publicUrl}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white shrink-0 ml-2"
                        title="Sao chép"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <img
                        src={currentVietQRUrl}
                        alt="VietQR Code"
                        className="w-28 h-28 rounded-xl bg-white p-1.5 shadow-md object-contain"
                      />
                      <div className="space-y-2">
                        <p className="font-bold text-white text-xs">Mã VietQR Quét Chuyển Khoản Mừng Cưới</p>
                        <p className="text-[11px] text-slate-400">Khách mời có thể dùng App Ngân Hàng quét để chuyển khoản tức thì.</p>
                        <button
                          onClick={handleDownloadQR}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>Tải Mã VietQR PNG</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mở Website</span>
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Sao chép Link</span>
                      </button>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-800">
                      <span>Xuất bản: {new Date(invitation.created_at).toLocaleString('vi-VN')}</span>
                      <span>Cập nhật mới nhất: {new Date(invitation.updated_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Realtime Interactive Preview Pane (With Viewport Switcher & Zoom Controls) */}
        <div className="hidden lg:flex flex-1 flex-col bg-slate-950 p-6 items-center justify-center relative overflow-hidden">
          {/* Top Control Bar: Viewport Switcher & Zoom Selector */}
          <div className="absolute top-4 right-4 flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 z-20 shadow-xl">
            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  previewDevice === 'mobile' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  previewDevice === 'tablet' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  previewDevice === 'desktop' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'
                }`}
                title="Desktop (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-5 bg-slate-800" />

            {/* Zoom Selector */}
            <div className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <select
                value={zoomLevel}
                onChange={(e) => setZoomLevel(e.target.value as ZoomLevel)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
                <option value="125">125%</option>
                <option value="150">150%</option>
              </select>
              <ZoomIn className="w-3.5 h-3.5 text-slate-400 mr-1" />
            </div>
          </div>

          {/* Interactive Realtime Device Frame (Scaled by Zoom Level) */}
          <div className="flex items-center justify-center w-full h-full overflow-auto">
            <div
              className="transition-all duration-300 bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-800 flex flex-col origin-center"
              style={{
                width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '680px' : '840px',
                height: previewDevice === 'mobile' ? '680px' : '680px',
                transform: `scale(${getZoomScale()})`,
              }}
            >
              <div className="flex-1 overflow-y-auto bg-slate-950 text-left">
                <InvitationRuntime invitation={invitation} template={template} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-3 md:hidden">
        <button
          onClick={handleOpenDraftPreviewNewTab}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
        >
          <ExternalLink className="w-4 h-4 text-rose-400" />
          <span>Mở Tab Mới</span>
        </button>

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg ${
            invitation.status === 'published' && !isDirty
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{invitation.status === 'published' && !isDirty ? 'Đã Xuất Bản' : 'Xuất Bản'}</span>
        </button>
      </div>

      {/* MANDATORY FULLSCREEN EXPIRED TRIAL & PAYMENT MODAL */}
      {(invitation.payment_status === 'expired' || invitation.is_expired) && (
        <ExpiredTrialPaymentModal
          invitation={invitation}
          onPaymentSubmitted={() => {
            if (id) {
              invitationService.getInvitationById(id).then((inv) => {
                if (inv) setInvitation(inv);
              });
            }
          }}
        />
      )}

      {/* Music Library Selector & Admin Manager Modal */}
      <MusicLibraryModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        selectedSongId={invitation.invitation_json?.music_id}
        isAdmin={user?.role === 'admin'}
        onSelectSong={(song) => {
          handleFieldChange('music', song.url);
          const updatedJson = {
            ...invitation.invitation_json,
            music_id: song.id,
            music_title: song.title,
            music_artist: song.artist,
          };
          handleFieldChange('invitation_json', updatedJson);
        }}
      />

      {/* Full Realtime Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onUseTemplate={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
};
