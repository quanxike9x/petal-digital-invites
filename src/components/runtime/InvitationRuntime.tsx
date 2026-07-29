import React, { useState, useEffect } from 'react';
import type { Invitation, Guest, Template, WishRecord } from '../../types';
import { 
  createBindingContext, 
  interpolateString, 
  shouldHideComponent, 
  updateSEOMetadata 
} from '../../services/runtimeEngine';
import { generateVietQRUrl } from '../../services/vietQRService';
import { guestService } from '../../services/guestService';
import { rsvpWishService } from '../../services/rsvpWishService';
import { analyticsService } from '../../services/analyticsService';
import { getGoogleMapEmbedUrl } from '../../utils/googleMapUtils';
import { getEmbedVideoUrl } from '../../utils/youtubeUtils';
import { fixVietnamese } from '../../utils/vietnameseUtils';

// MODULAR WIDGET IMPORTS
import { TextWidget } from '../widgets/TextWidget';
import { SingleImageWidget } from '../widgets/SingleImageWidget';
import { GalleryWidget } from '../widgets/GalleryWidget';
import { CountdownWidget } from '../widgets/CountdownWidget';
import { VietQRWidget } from '../widgets/VietQRWidget';
import { GoogleMapWidget } from '../widgets/GoogleMapWidget';
import { TimelineWidget } from '../widgets/TimelineWidget';
import { VideoWidget } from '../widgets/VideoWidget';
import { CustomHtmlWidget } from '../widgets/CustomHtmlWidget';
import { MusicWidget } from '../widgets/MusicWidget';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Music, 
  Volume2, 
  VolumeX, 
  Gift, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  ChevronDown, 
  Play, 
  QrCode, 
  Video, 
  MessageSquare,
  Sparkles,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface InvitationRuntimeProps {
  invitation: Invitation;
  guest?: Guest | null;
  template?: Template | null;
}

export const InvitationRuntime: React.FC<InvitationRuntimeProps> = ({
  invitation,
  guest,
  template,
}) => {
  // 1. Create Dynamic Data Binding Context
  const ctx = createBindingContext(invitation, guest);

  // Audio Music State
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audio] = useState(new Audio());

  // Gift Modal & RSVP State
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState(guest ? guest.guest_name : '');
  const [rsvpPhone, setRsvpPhone] = useState(guest?.phone || '');
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | 'pending'>('attending');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpNote, setRsvpNote] = useState('');
  const [wishText, setWishText] = useState('');
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Live Guest Wishes List Timeline
  const [wishesTimeline, setWishesTimeline] = useState<WishRecord[]>([]);

  // Load Wishes on Mount
  useEffect(() => {
    rsvpWishService.getWishesByInvitationId(invitation.id, false).then(setWishesTimeline);
  }, [invitation.id]);

  // Inject SEO Metadata & Track Page View Analytics on Load
  useEffect(() => {
    updateSEOMetadata(invitation, guest);
    analyticsService.trackPageView(invitation.id, guest?.id);
  }, [invitation.id, guest?.id]);

  // Toggle Background Music
  const toggleMusic = () => {
    if (!ctx.music) return;
    if (isPlayingMusic) {
      audio.pause();
      setIsPlayingMusic(false);
    } else {
      audio.src = ctx.music;
      audio.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  // Submit RSVP Form
  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      toast.error('Vui lòng nhập tên của bạn!');
      return;
    }
    if (!rsvpStatus) {
      toast.error('Vui lòng chọn trạng thái xác nhận tham dự!');
      return;
    }
    if (rsvpStatus === 'attending' && rsvpCount < 1) {
      toast.error('Số người tham dự phải ít nhất là 1 người!');
      return;
    }

    setIsSubmittingRSVP(true);
    try {
      await rsvpWishService.submitRSVP({
        invitation_id: invitation.id,
        guest_id: guest?.id,
        guest_name: rsvpName,
        phone: rsvpPhone,
        attendance_status: rsvpStatus,
        attendee_count: rsvpCount,
        note: rsvpNote,
      });

      setRsvpSubmitted(true);
      toast.success('Gửi xác nhận tham dự (RSVP) thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi phản hồi RSVP.');
    } finally {
      setIsSubmittingRSVP(false);
    }
  };

  // Submit Wedding Wish
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      toast.error('Vui lòng nhập tên của bạn!');
      return;
    }
    if (!wishText.trim()) {
      toast.error('Vui lòng nhập nội dung lời chúc!');
      return;
    }

    setIsSubmittingWish(true);
    try {
      const created = await rsvpWishService.submitWish({
        invitation_id: invitation.id,
        guest_id: guest?.id,
        guest_name: rsvpName,
        message: wishText,
      });

      if (created.is_approved) {
        setWishesTimeline((prev) => [created, ...prev]);
        toast.success('Gửi lời chúc thành công! Lời chúc của bạn đã được đăng lên thiệp.');
      } else {
        toast.info('Lời chúc của bạn đã được gửi và đang chờ Chủ thiệp duyệt!');
      }

      setWishText('');
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi lời chúc.');
    } finally {
      setIsSubmittingWish(false);
    }
  };

  const primaryColor = invitation.primary_color || template?.primary_color || '#E11D48';

  // 2. CHECK IF CUSTOM INVITATION / TEMPLATE WIDGETS ARE AVAILABLE FOR SCHEMATIC RUNTIME RENDER
  const savedComponents = invitation.invitation_json?.components || template?.template_json?.components || template?.components || [];

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden selection:bg-rose-500 selection:text-white"
      style={{
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      {/* FLOATING MUSIC PLAYER BUTTON */}
      {ctx.music && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
          style={{ backgroundColor: primaryColor }}
          title={isPlayingMusic ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        >
          {isPlayingMusic ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
        </button>
      )}

      {/* FLOATING GIFT / LÌ XÌ BUTTON */}
      {ctx.gift.account_number && (
        <button
          onClick={() => setIsGiftModalOpen(true)}
          className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-amber-500 text-slate-950 font-sans font-bold text-xs shadow-2xl flex items-center gap-2 border-2 border-white/20 hover:scale-105 transition-all"
        >
          <Gift className="w-4 h-4" />
          <span>Mừng Cưới / Lì Xì</span>
        </button>
      )}

      {/* PERSONALIZED GUEST GREETING BANNER */}
      {guest && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md mx-auto px-4 py-2.5 rounded-full bg-slate-900/95 text-white font-sans shadow-2xl backdrop-blur-md border border-rose-500/40 flex items-center justify-center gap-2 animate-fadeIn">
          <UserCheck className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-xs font-bold truncate">
            Kính Mời: <span className="text-rose-400 uppercase">{ctx.guest.name}</span>
          </span>
        </div>
      )}

      {/* 3. DYNAMIC TEMPLATE CANVAS RUNTIME (RENDER COMPONENTS IF SAVED IN TEMPLATE) */}
      {savedComponents.length > 0 ? (
        <div className="py-12 px-4 max-w-xl mx-auto space-y-8">
          {savedComponents.map((comp: any) => {
            // CONDITIONAL RENDERING: CHECK IF COMPONENT SHOULD BE HIDDEN
            if (shouldHideComponent(comp.type, comp.binding, ctx)) {
              return null;
            }

            // INTERPOLATE CONTENT WITH MUSTACHE TEMPLATE ENGINE
            const interpolatedContent = interpolateString(comp.content || '', ctx);

            return (
              <div key={comp.id} className="w-full text-center">
                {/* 1. TEXT WIDGET (INCLUDES HEADING & PARAGRAPH) */}
                {(comp.type === 'text' || comp.type === 'heading') && (
                  <TextWidget
                    id={comp.id || 'text-001'}
                    content={interpolatedContent || `${ctx.groom.name} & ${ctx.bride.name}`}
                    tag={comp.tag || (comp.type === 'heading' ? 'h1' : 'p')}
                    style={comp.style}
                    interactions={comp.interactions}
                  />
                )}

                {/* 2. SINGLE IMAGE WIDGET */}
                {comp.type === 'image' && (
                  <SingleImageWidget
                    id={comp.id || 'image-001'}
                    src={comp.content || ctx.gallery[0] || invitation.thumbnail_url}
                    alt={comp.label}
                    style={comp.style}
                    interactions={comp.interactions}
                  />
                )}

                {/* 3. GALLERY WIDGET (ALBUM 20 IMAGES MAX) */}
                {comp.type === 'gallery' && (
                  <GalleryWidget
                    id={comp.id || 'gallery-001'}
                    images={ctx.gallery.length > 0 ? ctx.gallery : [invitation.thumbnail_url]}
                    mode={comp.mode || 'grid'}
                    autoplay={comp.autoplay}
                    loop={comp.loop}
                  />
                )}

                {/* 4. COUNTDOWN WIDGET */}
                {comp.type === 'countdown' && (
                  <CountdownWidget
                    id={comp.id || 'countdown-001'}
                    targetDate={invitation.wedding_date || '2026-10-24'}
                    targetTime={comp.targetTime || '11:00'}
                  />
                )}

                {/* 5. VIETQR WIDGET (NO WHITE CARD, FLOATING GLOW ONLY) */}
                {comp.type === 'vietqr' && ctx.gift.account_number && (
                  <VietQRWidget
                    id={comp.id || 'vietqr-001'}
                    bankName={ctx.gift.bank_name}
                    accountNumber={ctx.gift.account_number}
                    accountName={ctx.gift.account_name}
                    memo={`Mung cuoi ${ctx.groom.name}`}
                    settings={{
                      groomBank: ctx.gift.groom_bank_name || ctx.gift.bank_name,
                      groomOwner: ctx.gift.groom_account_name || ctx.gift.account_name,
                      groomAccount: ctx.gift.groom_account_number || ctx.gift.account_number,
                      brideBank: ctx.gift.bride_bank_name || ctx.gift.bank_name,
                      brideOwner: ctx.gift.bride_account_name || ctx.gift.account_name,
                      brideAccount: ctx.gift.bride_account_number || ctx.gift.account_number,
                    }}
                    style={comp.style}
                  />
                )}

                {/* 6. GOOGLE MAP WIDGET */}
                {comp.type === 'maps' && (
                  <GoogleMapWidget
                    id={comp.id || 'map-001'}
                    mapUrl={comp.content || ctx.venue.map_url}
                    venueName={ctx.venue.name}
                    address={ctx.venue.address}
                  />
                )}

                {/* 7. TIMELINE WIDGET & MONTHLY CALENDAR */}
                {comp.type === 'timeline' && (
                  <TimelineWidget
                    id={comp.id || 'timeline-001'}
                    weddingDate={invitation.wedding_date || '2026-10-24'}
                  />
                )}

                {/* 8. VIDEO WIDGET */}
                {comp.type === 'video' && (
                  <VideoWidget
                    id={comp.id || 'video-001'}
                    url={comp.content || invitation.invitation_json?.video_url}
                    autoplay={comp.settings?.autoplay}
                    mute={comp.settings?.mute}
                    loop={comp.settings?.loop}
                  />
                )}

                {/* 9. CUSTOM HTML / CSS / JS WIDGET */}
                {comp.type === 'custom_html' && (
                  <CustomHtmlWidget
                    id={comp.id || 'custom-001'}
                    headCode={invitation.invitation_json?.head_code}
                    bodyCode={invitation.invitation_json?.body_code}
                    customCss={invitation.invitation_json?.custom_css}
                    customJs={invitation.invitation_json?.custom_js}
                    rawHtml={comp.content}
                  />
                )}

                {/* 10. MUSIC WIDGET */}
                {comp.type === 'music' && (
                  <MusicWidget
                    id={comp.id || 'music-001'}
                    songTitle={comp.content || 'Ngày Chung Đôi'}
                    artist={comp.artist || 'Văn Mai Hương'}
                    isPlaying={isPlayingMusic}
                    onTogglePlay={toggleMusic}
                  />
                )}

                {/* STORY WIDGET */}
                {comp.type === 'story' && ctx.story && (
                  <div className="p-6 bg-rose-950/40 border border-rose-900/50 rounded-3xl text-center space-y-3 my-4">
                    <Heart className="w-6 h-6 text-rose-500 mx-auto fill-current" />
                    <h3 className="text-lg font-bold text-white">Lời Ngỏ Của Cặp Đôi</h3>
                    <p className="text-xs italic text-slate-300 leading-relaxed">"{ctx.story}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. DEFAULT FULL-FEATURED INVITATION RUNTIME LAYOUT (WHEN TEMPLATE COMPONENTS ARE NOT CUSTOM SPECIFIED) */
        <div className="space-y-16 pb-20">
          {/* HERO SECTION */}
          <section className="min-h-screen relative flex flex-col items-center justify-between text-center p-6 sm:p-12 overflow-hidden bg-gradient-to-b from-rose-950/70 via-slate-950 to-slate-950">
            <div
              className="absolute inset-0 z-0 opacity-20 bg-cover bg-center filter blur-md scale-105"
              style={{ backgroundImage: `url(${invitation.thumbnail_url})` }}
            />

            <div className="relative z-10 pt-16 space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-rose-400">SAVE THE DATE</span>
              <h1 className="text-4xl sm:text-7xl font-sans font-extrabold tracking-tight text-white drop-shadow-md">
                {ctx.groom.name} <span style={{ color: primaryColor }}>&</span> {ctx.bride.name}
              </h1>
              <p className="text-sm font-mono text-slate-300 tracking-wider">
                {ctx.event.time} • {ctx.event.date}
              </p>
            </div>

            <div className="relative z-10 my-8 w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
              <img
                src={invitation.thumbnail_url}
                alt={invitation.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 pb-8 animate-bounce">
              <ChevronDown className="w-6 h-6 text-rose-400 mx-auto" />
            </div>
          </section>

          {/* STORY & FAMILIES */}
          {ctx.story && (
            <section className="py-12 px-6 max-w-3xl mx-auto text-center space-y-8">
              <Heart className="w-8 h-8 text-rose-500 mx-auto" />
              <h2 className="text-3xl font-bold text-white">Lời Ngỏ</h2>
              <p className="text-sm text-slate-300 leading-relaxed italic max-w-lg mx-auto">
                "{ctx.story}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-sans">
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">NHÀ NỘI (NHÀ TRAI)</span>
                  <p className="text-lg font-bold text-white">{ctx.groom.name}</p>
                  <p className="text-xs text-slate-400">{ctx.groom.parents}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">NHÀ NGOẠI (NHÀ GÁI)</span>
                  <p className="text-lg font-bold text-white">{ctx.bride.name}</p>
                  <p className="text-xs text-slate-400">{ctx.bride.parents}</p>
                </div>
              </div>
            </section>
          )}

          {/* SCHEDULE & VENUE */}
          <section className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
            <div className="max-w-3xl mx-auto space-y-8 text-center">
              <div className="space-y-2">
                <Calendar className="w-8 h-8 text-rose-500 mx-auto" />
                <h2 className="text-3xl font-bold text-white">Thời Gian & Địa Điểm</h2>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 border-b border-slate-800 pb-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Lễ Thành Hôn</p>
                    <p className="text-xl font-bold text-white mt-1">{ctx.event.time || '11:00 AM'}</p>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-slate-800" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Tiệc Mừng Cưới</p>
                    <p className="text-xl font-bold text-rose-400 mt-1">{ctx.event.reception_time || '06:00 PM'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{ctx.venue.name || 'Trung Tâm Hội Nghị'}</h3>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{ctx.venue.address}</span>
                  </p>
                </div>

                {ctx.venue.map_url && (
                  <a
                    href={ctx.venue.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Xem Chỉ Đường Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* 5. REPEAT COMPONENT: PHOTO GALLERY */}
          {ctx.gallery.length > 0 && (
            <section className="py-12 px-6 max-w-4xl mx-auto space-y-8 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white">
                <Camera className="w-6 h-6 text-rose-500" />
                <span>Album Ảnh Cưới</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ctx.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-[4/5] rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RSVP FORM & WEDDING WISHES SECTION */}
          <section className="py-12 px-6 max-w-xl mx-auto font-sans space-y-8">
            {/* 1. RSVP FORM CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
              <div className="space-y-2">
                <Send className="w-8 h-8 text-rose-500 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Xác Nhận Tham Dự (RSVP)</h2>
                <p className="text-xs text-slate-400">Phản hồi của bạn giúp hai gia đình chuẩn bị đón tiếp chu đáo nhất!</p>
              </div>

              {rsvpSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2 animate-fadeIn">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-bold text-sm">Cảm ơn bạn đã xác nhận tham dự!</p>
                  <p className="text-slate-300">Thông tin phản hồi của bạn đã được ghi nhận thành công.</p>
                </div>
              ) : (
                <form onSubmit={handleRSVPSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Họ và Tên khách mời *</label>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên..."
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Số điện thoại (tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="0901234567"
                      value={rsvpPhone}
                      onChange={(e) => setRsvpPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 block">Trạng thái tham dự *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRsvpStatus('attending')}
                        className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                          rsvpStatus === 'attending' ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Tham dự
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpStatus('declined')}
                        className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                          rsvpStatus === 'declined' ? 'bg-slate-700 text-white border-slate-600 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Không tham dự
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpStatus('pending')}
                        className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                          rsvpStatus === 'pending' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Chưa xác định
                      </button>
                    </div>
                  </div>

                  {rsvpStatus === 'attending' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Số lượng người tham dự (≥ 1)</label>
                      <select
                        value={rsvpCount}
                        onChange={(e) => setRsvpCount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
                      >
                        <option value={1}>1 người (Đi 1 mình)</option>
                        <option value={2}>2 người (Đi cùng người thương)</option>
                        <option value={3}>3 người (Gia đình 3 người)</option>
                        <option value={4}>4 người trở lên</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Ghi chú thêm</label>
                    <input
                      type="text"
                      placeholder="Ghi chú về ăn chay, trẻ em..."
                      value={rsvpNote}
                      onChange={(e) => setRsvpNote(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingRSVP}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all"
                  >
                    {isSubmittingRSVP ? 'Đang gửi...' : 'Gửi Xác Nhận RSVP'}
                  </button>
                </form>
              )}
            </div>

            {/* 2. WEDDING WISHES FORM & TIMELINE CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="space-y-1 text-center">
                <MessageSquare className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Lời Chúc Mừng Cặp Đôi</h3>
                <p className="text-xs text-slate-400">Gửi lời chúc yêu thương đến Cô Dâu & Chú Rể!</p>
              </div>

              {/* Wish Submission Form */}
              <form onSubmit={handleWishSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Tên người gửi *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên người gửi lời chúc..."
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nội dung lời chúc *</label>
                  <textarea
                    rows={3}
                    placeholder="Viết lời chúc ý nghĩa của bạn tại đây..."
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWish}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  {isSubmittingWish ? 'Đang gửi...' : 'Gửi Lời Chúc Mừng'}
                </button>
              </form>

              {/* Wishes Timeline List */}
              {wishesTimeline.length > 0 && (
                <div className="pt-6 border-t border-slate-800 text-left space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Dòng Thời Gian Lời Chúc ({wishesTimeline.length})</span>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {wishesTimeline.map((w) => (
                      <div key={w.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {w.guest_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{w.guest_name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(w.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                              {new Date(w.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            "{w.message}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* GIFT / LÌ XÌ MODAL */}
      {isGiftModalOpen && ctx.gift.account_number && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <button onClick={() => setIsGiftModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Mừng Cưới Cho Cô Dâu & Chú Rể</h3>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <p className="text-slate-400 font-semibold">{ctx.gift.bank_name || 'Ngân Hàng'}</p>
              <p className="text-xl font-extrabold text-amber-400 font-mono tracking-wider">{ctx.gift.account_number}</p>
              <p className="font-bold text-white uppercase">{ctx.gift.account_name}</p>
            </div>

            <img
              src={generateVietQRUrl(ctx.gift.bank_name, ctx.gift.account_number, ctx.gift.account_name, `Mung cuoi ${ctx.groom.name}`)}
              alt="VietQR Bank"
              loading="lazy"
              className="w-48 h-48 mx-auto rounded-xl bg-white p-2 shadow-md object-contain"
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-8 text-center text-xs text-slate-500 font-sans border-t border-slate-900">
        <p>Powered by Pudwedding Platform • Thiệp cưới online chuyên nghiệp</p>
      </footer>
    </div>
  );
};
