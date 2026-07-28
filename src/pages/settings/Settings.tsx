import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || 'Trần Minh Phong');
  const [phone, setPhone] = useState('0901234567');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã cập nhật thông tin hồ sơ thành công!');
    setNewPassword('');
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-400" />
              <span>Hồ Sơ Cá Nhân</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Quản lý thông tin tài khoản và mật khẩu của bạn</p>
          </div>
          <span className="text-xs bg-rose-500/20 text-rose-400 font-bold px-3 py-1 rounded-full border border-rose-500/30">
            Tài Khoản Khách Hàng
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Thông Tin Tài Khoản</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Họ và tên</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email liên hệ</span>
                </label>
                <input
                  type="email"
                  value={user?.email || 'minhphong@gmail.com'}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Số điện thoại liên hệ</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Change Password */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Đổi Mật Khẩu</span>
            </h4>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Mật khẩu mới (nếu muốn thay đổi)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi Hồ Sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
