import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Mail, Lock, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'password' | 'otp' | 'signup';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, loginWithPassword, signUpWithEmail, sendMagicLink, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleGoogleClick = async () => {
    try {
      await loginWithGoogle();
      closeLoginModal();
    } catch (e: any) {
      toast.error('Lỗi khi đăng nhập bằng Google');
    }
  };

  // Handle Email + Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      closeLoginModal();
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    }
  };

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsSubmitting(true);
    const res = await signUpWithEmail(email.trim(), password, fullName.trim());
    setIsSubmitting(false);

    if (res.success) {
      closeLoginModal();
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Đăng ký không thành công.');
    }
  };

  // Handle Send OTP / Magic Link
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập Email hợp lệ!');
      return;
    }

    setIsSubmitting(true);
    const res = await sendMagicLink(email.trim());
    setIsSubmitting(false);

    if (res.success) {
      setOtpSent(true);
      toast.success('Mã OTP đã được gửi đến Email của bạn!');
    } else {
      toast.error(res.message);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyOtp(email.trim(), otp.trim());
    setIsSubmitting(false);

    if (res.success) {
      closeLoginModal();
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        {/* Decorative Top Orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'signup' ? 'Tạo Tài Khoản Pudwedding' : 'Đăng nhập Hệ thống'}
          </h2>
          <p className="text-xs text-slate-400">Tự động phân quyền tài khoản sau khi xác thực</p>
        </div>

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleClick}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-white font-medium text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Hoặc Email
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-800/60 p-1 rounded-xl text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => { setMode('password'); setOtpSent(false); }}
            className={`py-1.5 rounded-lg transition-colors ${mode === 'password' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Mật khẩu
          </button>
          <button
            type="button"
            onClick={() => { setMode('otp'); setOtpSent(false); }}
            className={`py-1.5 rounded-lg transition-colors ${mode === 'otp' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            OTP / Link
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setOtpSent(false); }}
            className={`py-1.5 rounded-lg transition-colors ${mode === 'signup' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng ký
          </button>
        </div>

        {/* MODE 1: EMAIL + PASSWORD LOGIN (Admin & User) */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Địa chỉ Email</span>
              </label>
              <input
                type="email"
                placeholder="user@gmail.com hoặc admin@chungdoi.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Mật khẩu</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang kiểm tra...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE 2: EMAIL OTP / MAGIC LINK */}
        {mode === 'otp' && (
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-400" />
                  <span>Nhập Email để nhận mã OTP</span>
                </label>
                <input
                  type="email"
                  placeholder="vidu@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang gửi mã...</span>
                ) : (
                  <>
                    <span>Gửi Mã OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Đã gửi OTP đến {email}. Nhập mã 6 chữ số bên dưới.</span>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mã OTP (6 chữ số)</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-center tracking-widest text-lg font-mono text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang xác minh...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận & Đăng nhập</span>
                  </>
                )}
              </button>
            </form>
          )
        )}

        {/* MODE 3: SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="vidu@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang tạo tài khoản...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Tạo Tài Khoản Ngay</span>
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-[11px] text-center text-slate-500">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Chính sách của ChungĐôi.
        </p>
      </div>
    </div>
  );
};
