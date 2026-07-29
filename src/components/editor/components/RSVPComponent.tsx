import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2, Heart, User, Phone, Users, MessageSquare, Loader2 } from 'lucide-react';
import type { UnifiedComponentInstance } from '../../../registry/ComponentRegistry';
import { rsvpWishService } from '../../../services/rsvpWishService';
import { toast } from 'sonner';

interface RSVPComponentProps {
  component?: UnifiedComponentInstance;
  props?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export const RSVPComponent: React.FC<RSVPComponentProps> = ({ component, props: inputProps, style: inputStyle }) => {
  const props = component?.props || inputProps || {};
  const style = component?.style || inputStyle || {};

  const title = (props.title as string) || 'Xác Nhận Tham Dự Lễ Cưới';
  const subtitle = (props.subtitle as string) || 'Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi';
  const buttonText = (props.buttonText as string) || 'Gửi Xác Nhận';
  const invitationId = (props.invitationId as string) || 'inv-preview-default';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<'attending' | 'declined'>('attending');
  const [guestCount, setGuestCount] = useState(1);
  const [wish, setWish] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Kích thước cơ sở khi thiết kế (tương ứng với lúc form hiển thị đẹp)
  const BASE_WIDTH = 420;
  const BASE_HEIGHT = 560;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const currentWidth = container.clientWidth;
      const currentHeight = container.clientHeight;
      const widthRatio = currentWidth / BASE_WIDTH;
      const heightRatio = currentHeight / BASE_HEIGHT;
      // Lấy tỉ lệ nhỏ nhất để vừa khung, giữ nguyên tỉ lệ nội dung
      const newScale = Math.min(widthRatio, heightRatio, 1); // không scale lên > 1
      setScale(Math.max(0.3, newScale)); // giới hạn scale tối thiểu
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      resizeObserver.disconnect();
    };
  }, []);

  // Lấy các style từ input, nhưng vẫn đảm bảo overflow hidden và position relative
  const containerStyle: React.CSSProperties = {
    fontFamily: (style.fontFamily as string) || 'inherit',
    fontSize: typeof style.fontSize === 'number' ? `${style.fontSize}px` : (style.fontSize as string) || '14px',
    color: (style.color as string) || '#0f172a',
    backgroundColor: (style.backgroundColor as string) || '#ffffff',
    opacity: style.opacity !== undefined ? Number(style.opacity) : 1,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : (style.borderRadius as string) || '20px',
    border: (style.border as string) || '1px solid #e2e8f0',
    boxShadow: (style.boxShadow as string) || '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    // Quan trọng: không cho scroll, scale sẽ xử lý
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '100%',
  };

  const contentStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    padding: '24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    // Không set overflow ở đây, vì scale sẽ co lại toàn bộ
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập Họ và Tên!');
      return;
    }

    setIsSubmitting(true);

    try {
      await rsvpWishService.submitRSVP({
        invitation_id: invitationId,
        guest_name: name.trim(),
        phone: phone.trim() || undefined,
        attendance_status: attending,
        attendee_count: attending === 'attending' ? guestCount : 0,
        note: wish.trim() || undefined,
      });

      if (wish.trim()) {
        await rsvpWishService.submitWish({
          invitation_id: invitationId,
          guest_name: name.trim(),
          message: wish.trim(),
        });
      }

      setIsSubmitted(true);
      toast.success('Đã gửi phản hồi xác nhận tham dự thành công!');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu vào database!';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} style={containerStyle} className="w-full h-full">
      <div style={contentStyle} className="text-center font-sans select-none">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <h3 className="font-serif font-bold text-xl text-rose-900 tracking-wide">{title}</h3>
          <p className="text-xs text-slate-500 font-sans mt-1 max-w-sm mx-auto">{subtitle}</p>
        </div>

        {isSubmitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-base">Đã Lưu Phản Hỏi Vào Hệ Thống!</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Cảm ơn <span className="font-bold text-emerald-950">{name}</span> đã xác nhận. Thông tin của bạn đã được ghi nhận trong cơ sở dữ liệu!
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setName('');
                setPhone('');
                setWish('');
              }}
              className="mt-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Gửi phản hồi cho người khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-xs">
            {/* Họ tên */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>Họ và Tên (*)</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập họ và tên quý khách..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>Số Điện Thoại</span>
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại để gia đình liên hệ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Xác nhận tham dự */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Xác Nhận Tham Dự</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttending('attending')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    attending === 'attending'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>✓ Sẽ Tham Dự</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttending('declined')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    attending === 'declined'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-slate-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>✕ Rất Tiếc Không Thể</span>
                </button>
              </div>
            </div>

            {/* Số người tham dự */}
            {attending === 'attending' && (
              <div className="animate-in fade-in duration-200">
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span>Số Người Tham Dự</span>
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-rose-500 focus:bg-white cursor-pointer font-bold transition-all shadow-2xs"
                >
                  <option value={1}>1 Người (Chỉ mình tôi)</option>
                  <option value={2}>2 Người (+ 1 Đi cùng)</option>
                  <option value={3}>3 Người (+ 2 Đi cùng)</option>
                  <option value={4}>4 Người (Cả gia đình)</option>
                </select>
              </div>
            )}

            {/* Lời chúc */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                <span>Lời Chúc Mừng</span>
              </label>
              <textarea
                rows={3}
                placeholder="Gửi lời chúc mừng tới cô dâu & chú rể..."
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-rose-500 focus:bg-white resize-none transition-all shadow-2xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang lưu vào Database...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{buttonText}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};