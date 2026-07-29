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
    width?: string | number;
    height?: string | number;
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
  const borderRadius = style?.borderRadius !== undefined ? `${style.borderRadius}px` : '16px';
  const spacing = style?.spacing !== undefined ? `${style.spacing}px` : '10px';

  return (
    <div
      id={id}
      style={{
        width: style?.width || '100%',
        height: style?.height || '100%',
        fontFamily,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderRadius: borderRadius,
        color: textColor,
      }}
      className="p-4 border shadow-lg flex flex-col justify-between overflow-y-auto font-sans"
    >
      {/* Header - Thu gọn */}
      <div className="flex items-center justify-center gap-2 text-rose-600 mb-3">
        <HeartHandshake className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-bold">{content || 'Xác Nhận Tham Dự'}</span>
      </div>

      {submitted ? (
        <div className="py-6 text-center space-y-1.5 bg-rose-50/80 border border-rose-200 rounded-xl">
          <CheckCircle2 className="w-8 h-8 mx-auto text-rose-600" />
          <p className="font-bold text-rose-900 text-xs">Cảm ơn bạn!</p>
          <p className="text-[10px] text-rose-700">Phản hồi đã được ghi nhận.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ gap: spacing }} className="flex flex-col text-xs">
          {/* Họ tên */}
          <div className="space-y-1">
            <label className="font-medium block text-[10px] text-slate-700">Họ và tên *</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Nhập họ tên..."
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1">
            <label className="font-medium block text-[10px] text-slate-700">Số điện thoại *</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Tham dự - Radio Button gọn */}
          <div className="space-y-1">
            <label className="font-medium block text-[10px] text-slate-700">Xác nhận tham dự *</label>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px]">
                <input
                  type="radio"
                  name="attending"
                  value="yes"
                  checked={formData.attending === 'yes'}
                  onChange={() => setFormData({ ...formData, attending: 'yes' })}
                  className="w-3 h-3 accent-rose-600"
                />
                <span className="font-medium">Tham dự</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px]">
                <input
                  type="radio"
                  name="attending"
                  value="no"
                  checked={formData.attending === 'no'}
                  onChange={() => setFormData({ ...formData, attending: 'no' })}
                  className="w-3 h-3 accent-slate-600"
                />
                <span className="font-medium">Vắng mặt</span>
              </label>
            </div>
          </div>

          {/* Số lượng khách - Chỉ hiện khi tham dự */}
          {formData.attending === 'yes' && (
            <div className="space-y-1">
              <label className="font-medium block text-[10px] text-slate-700">Số người đi cùng</label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-medium"
                >
                  <option value={1}>1 người</option>
                  <option value={2}>2 người</option>
                  <option value={3}>3 người</option>
                  <option value={4}>4+ người</option>
                </select>
              </div>
            </div>
          )}

          {/* Lời chúc */}
          <div className="space-y-1">
            <label className="font-medium block text-[10px] text-slate-700">Lời chúc</label>
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Gửi lời chúc..."
                value={formData.wishes}
                onChange={(e) => setFormData({ ...formData, wishes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none"
              />
            </div>
          </div>

          {/* Button gửi - Thu gọn */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all mt-0.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Xác Nhận</span>
          </button>
        </form>
      )}
    </div>
  );
};