import React, { useState } from 'react';
import type { Template, Invitation } from '../../types';
import { InvitationRuntime } from '../runtime/InvitationRuntime';
import { fixVietnamese } from '../../utils/vietnameseUtils';
import { generateVietQRUrl } from '../../services/vietQRService';
import { X, Smartphone, Tablet, Monitor, Plus, Crown, Heart, ExternalLink } from 'lucide-react';

export interface TemplateComponent {
  id: string;
  type: string;
  label: string;
  binding?: string;
  content?: string;
  style: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    bgColor?: string;
    align?: 'left' | 'center' | 'right';
    padding?: number;
    margin?: number;
    borderRadius?: number;
  };
}

interface TemplatePreviewModalProps {
  template: Template | null;
  invitation?: Invitation | null;
  components?: TemplateComponent[];
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  invitation,
  components = [],
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  if (!isOpen) return null;

  const activeTemplate: Template = template || {
    id: invitation?.template_id || 'tpl-1',
    name: invitation?.title || 'Thiệp Cưới Cá Nhân',
    category: 'Modern',
    thumbnail_url: invitation?.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    is_premium: false,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const activeInvitation: Invitation = invitation || {
    id: 'preview-inv',
    template_id: activeTemplate.id,
    created_by: 'admin',
    title: activeTemplate.name || 'Xem Trước Thiệp Cưới',
    slug: 'xem-truoc-thiep',
    invitation_json: activeTemplate.template_json || {
      bride_name: 'Quỳnh Hoa',
      bride_parent: 'Gia đình Nhà Gái',
      groom_name: 'Minh Phong',
      groom_parent: 'Gia đình Nhà Trai',
      story: 'Tình yêu đẹp nhất là khi hai trái tim đồng điệu cùng bước về một nhà.',
      wedding_date: '2026-10-24',
      ceremony_time: '11:00 AM',
      reception_time: '06:00 PM',
      venue_name: 'Trung Tâm Tiệc Cưới Đại Nam',
      address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      theme_color: activeTemplate.primary_color || '#E11D48',
      font: 'Playfair Display',
      components: components && components.length > 0 ? components : activeTemplate.template_json?.components || [],
    },
    bride_name: 'Quỳnh Hoa',
    groom_name: 'Minh Phong',
    wedding_date: '2026-10-24',
    venue_name: 'Trung Tâm Tiệc Cưới Đại Nam',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl animate-fadeIn overflow-hidden font-sans">
      {/* Top Controls Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>{invitation ? invitation.title : activeTemplate.name}</span>
              {activeTemplate.is_premium && (
                <span className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-current" /> VIP
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {invitation ? `Mẫu: ${activeTemplate.name} • Status: ${invitation.status.toUpperCase()}` : `Category: ${activeTemplate.category}`}
            </p>
          </div>
        </div>

        {/* Center Device Viewport Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              device === 'mobile' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile (375px)</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              device === 'tablet' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              device === 'desktop' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop (1024px)</span>
          </button>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          {invitation && (
            <a
              href={`/w/${invitation.slug}?preview=draft`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
            >
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>Mở Tab Mới</span>
            </a>
          )}
          {onUseTemplate && (
            <button
              onClick={() => {
                onClose();
                onUseTemplate(activeTemplate.id);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Dùng Mẫu Này</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Preview Frame Container */}
      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-auto">
        <div
          className={`transition-all duration-300 bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-800 flex flex-col ${
            device === 'mobile'
              ? 'w-[375px] h-[720px]'
              : device === 'tablet'
              ? 'w-[720px] h-[780px]'
              : 'w-[1000px] h-[750px]'
          }`}
        >
          {/* Dynamic Live Component Renderer Viewport */}
          <div className="flex-1 overflow-y-auto bg-slate-950">
            {invitation ? (
              /* LIVE INVITATION RUNTIME PREVIEW */
              <InvitationRuntime invitation={activeInvitation} template={activeTemplate} />
            ) : components && components.length > 0 ? (
              /* EDITOR CANVAS COMPONENTS PREVIEW */
              <div className="p-6 space-y-6 bg-gradient-to-b from-rose-50 via-white to-amber-50 min-h-full">
                {components.map((comp) => (
                  <div key={comp.id} className="relative p-2 text-slate-900">
                    {comp.type === 'heading' && (
                      <h2
                        className="text-2xl font-bold font-sans text-center"
                        style={{ color: comp.style.color || '#1e293b', fontSize: comp.style.fontSize }}
                      >
                        {fixVietnamese(comp.content || '')}
                      </h2>
                    )}

                    {comp.type === 'countdown' && (
                      <div className="text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500">COUNTDOWN TO WEDDING</span>
                        <p className="text-sm font-mono font-bold text-slate-800">{comp.content}</p>
                      </div>
                    )}

                    {comp.type === 'image' && (
                      <div className="my-2 aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-2 border-white">
                        <img src={comp.content} alt={comp.label} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {comp.type === 'vietqr' && (
                      <div className="p-3 bg-white rounded-2xl border border-rose-100 text-center space-y-2 shadow-sm">
                        <p className="font-bold text-xs text-rose-600">VietQR Quét Mừng Cưới (Dynamic Binding)</p>
                        <img
                          src={generateVietQRUrl('MB Bank', '1018920192', 'TRAN MINH PHONG', 'Mung cuoi')}
                          alt="VietQR"
                          className="w-28 h-28 mx-auto bg-white p-1 rounded-xl shadow border object-contain"
                        />
                        <p className="text-[11px] font-mono text-slate-600">{comp.content}</p>
                      </div>
                    )}

                    {comp.type === 'text' && (
                      <p className="text-xs text-slate-600 text-center italic">{fixVietnamese(comp.content || '')}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback Template Preview Content */
              <div className="flex flex-col items-center justify-between text-center min-h-full py-8 space-y-6 bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
                <div className="space-y-4 pt-6">
                  <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-serif text-2xl font-bold mx-auto shadow-inner">
                    P & H
                  </div>
                  <span className="text-xs uppercase tracking-widest text-rose-500 font-bold">SAVE THE DATE</span>
                  <h1 className="text-3xl sm:text-4xl font-sans font-bold text-slate-800 tracking-tight">
                    Minh Phong & Quỳnh Hoa
                  </h1>
                  <p className="text-xs font-mono text-slate-500">CHỦ NHẬT, 24 THÁNG 10, 2026 • TP. HỒ CHÍ MINH</p>
                </div>

                <div className="my-6 w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src={activeTemplate.cover_url || activeTemplate.thumbnail_url}
                    alt={activeTemplate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
