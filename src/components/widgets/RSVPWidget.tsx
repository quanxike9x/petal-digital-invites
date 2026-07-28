import React, { useState } from 'react';
import { Send, CheckCircle2, User, Phone, Users, HeartHandshake, MessageSquare } from 'lucide-react';

export interface RSVPWidgetProps {
  id: string;
  content?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    spacing?: number;
  };
}

export const RSVPWidget: React.FC<RSVPWidgetProps> = ({ id, content, style }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    attending: 'yes',
    guestCount: 1,
    wishes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const fontFamily = style?.fontFamily || 'Be Vietnam Pro';
  const bgColor = style?.bgColor || '#ffffff';
  const textColor = style?.color || '#0f172a';
  const borderColor = style?.borderColor || '#e2e8f0';
  const borderRadius = style?.borderRadius !== undefined ? `${style.borderRadius}px` : '24px';
  const spacing = style?.spacing !== undefined ? `${style.spacing}px` : '12px';

  return (
    <div
      id={id}
      style={{
        fontFamily,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderRadius: borderRadius,
        color: textColor,
      }}
      className="w-full h-full p-6 border shadow-xl flex flex-col justify-between overflow-y-auto font-sans"
    >
      <h3 className="text-sm font-bold text-center mb-3 flex items-center justify-center gap-2 text-rose-600">
        <HeartHandshake className="w-4 h-4" />
        <span>{content || 'Xác Nhận Tham Dự Lễ Cưới (RSVP)'}</span>
      </h3>

      {submitted ? (
        <div className="py-8 text-center space-y-2 bg-rose-50/80 border border-rose-200 rounded-2xl">
          <CheckCircle2 className="w-10 h-10 mx-auto text-rose-600 animate-bounce" />
          <h4 className="font-bold text-rose-900 text-xs">Cảm ơn bạn đã gửi lời chúc!</h4>
          <p className="text-[11px] text-rose-700">Phản hồi của bạn đã được ghi nhận.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ gap: spacing }} className="flex flex-col text-xs">
          {/* Họ tên */}
          <div className="space-y-1">
            <label className="font-semibold block text-[11px] text-slate-700">Họ và tên *</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Nhập họ và tên..."
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1">
            <label className="font-semibold block text-[11px] text-slate-700">Số điện thoại *</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Tham dự / Không tham dự */}
          <div className="space-y-1">
            <label className="font-semibold block text-[11px] text-slate-700">Xác nhận tham dự *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: 'yes' })}
                className={`py-2 rounded-xl font-bold border transition-colors ${
                  formData.attending === 'yes'
                    ? 'bg-rose-600 border-rose-600 text-white shadow'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sẽ Tham Dự
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: 'no' })}
                className={`py-2 rounded-xl font-bold border transition-colors ${
                  formData.attending === 'no'
                    ? 'bg-slate-800 border-slate-800 text-white shadow'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Rất Tiếc Vắng Mặt
              </button>
            </div>
          </div>

          {/* Số lượng khách */}
          {formData.attending === 'yes' && (
            <div className="space-y-1">
              <label className="font-semibold block text-[11px] text-slate-700">Số lượng người đi cùng</label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-500 font-semibold"
                >
                  <option value={1}>1 người (Đi một mình)</option>
                  <option value={2}>2 người (Đi cùng bạn)</option>
                  <option value={3}>3 người (Đi cùng gia đình)</option>
                  <option value={4}>4+ người (Đi cùng đại gia đình)</option>
                </select>
              </div>
            </div>
          )}

          {/* Lời chúc */}
          <div className="space-y-1">
            <label className="font-semibold block text-[11px] text-slate-700">Lời chúc gửi Dâu Rể</label>
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Gửi lời chúc mừng hạnh phúc..."
                value={formData.wishes}
                onChange={(e) => setFormData({ ...formData, wishes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Button gửi */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 transition-all mt-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Xác Nhận RSVP</span>
          </button>
        </form>
      )}
    </div>
  );
};
