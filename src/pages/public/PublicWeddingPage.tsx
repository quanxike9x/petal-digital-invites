import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invitationService } from '../../services/invitationService';
import { guestService } from '../../services/guestService';
import { templateService } from '../../services/templateService';
import { InvitationRuntime } from '../../components/runtime/InvitationRuntime';
import type { Invitation, Guest, Template } from '../../types';
import { Clock, AlertCircle } from 'lucide-react';

export const PublicWeddingPage: React.FC = () => {
  const { slug, guest_slug } = useParams<{ slug: string; guest_slug?: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      invitationService.getInvitationBySlug(slug).then(async (inv) => {
        setInvitation(inv);
        if (inv) {
          // Fetch template details if template_id exists
          if (inv.template_id) {
            const templates = await templateService.getTemplates();
            const foundTpl = templates.find((t) => t.id === inv.template_id);
            if (foundTpl) setTemplate(foundTpl);
          }

          // Fetch personalized guest details if guest_slug exists
          if (guest_slug) {
            const guestList = await guestService.getGuestsByInvitationId(inv.id);
            const foundGuest = guestList.find((g) => g.guest_slug === guest_slug);
            if (foundGuest) {
              setGuest(foundGuest);
              // Record guest open analytics event
              guestService.recordGuestOpen(foundGuest.id);
            }
          }
        }
        setLoading(false);
      });
    }
  }, [slug, guest_slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
        <p className="text-xs font-serif tracking-widest uppercase">Đang nạp động cơ thiệp Pudwedding...</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Không tìm thấy thiệp cưới</h2>
        <p className="text-xs text-slate-400 max-w-sm">Đường dẫn này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs">Về Trang Chủ</Link>
      </div>
    );
  }

  const searchParams = new URLSearchParams(window.location.search);
  const isDraftPreviewMode = searchParams.get('preview') === 'draft';

  if (invitation.status === 'draft' && !isDraftPreviewMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
          <Clock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Thiệp cưới chưa được xuất bản</h2>
        <p className="text-xs text-slate-400 max-w-sm">Mẫu thiệp này đang trong quá trình chỉnh sửa bản nháp. Vui lòng quay lại sau.</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Về Trang Chủ</Link>
      </div>
    );
  }

  if (invitation.status === 'archived') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Thiệp cưới đã ngừng hoạt động</h2>
        <p className="text-xs text-slate-400 max-w-sm">Thiệp cưới này đã lưu trữ hoặc hết thời hạn phát hành.</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Về Trang Chủ</Link>
      </div>
    );
  }

  // RENDER INVITATION RUNTIME ENGINE
  return <InvitationRuntime invitation={invitation} guest={guest} template={template} />;
};
