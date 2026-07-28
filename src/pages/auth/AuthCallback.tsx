import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { closeLoginModal } = useAuth();

  useEffect(() => {
    let handled = false;

    const handleCallback = async () => {
      if (!isSupabaseConfigured()) {
        closeLoginModal();
        navigate('/', { replace: true });
        return;
      }

      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        toast.error(`Xác thực thất bại: ${error.message}`);
        navigate('/');
        return;
      }

      if (session && !handled) {
        handled = true;
        closeLoginModal();
        toast.success('Đăng nhập thành công!');
        navigate('/', { replace: true });
        return;
      }

      // Fallback listener for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if ((event === 'SIGNED_IN' || currentSession) && !handled) {
          handled = true;
          closeLoginModal();
          toast.success('Đăng nhập thành công!');
          navigate('/', { replace: true });
        }
      });

      // Timeout safety check
      const timeout = setTimeout(() => {
        if (!handled) {
          handled = true;
          toast.error('Quá thời gian xác thực. Vui lòng thử lại!');
          navigate('/');
        }
      }, 5000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    };

    handleCallback();
  }, [navigate, closeLoginModal]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center animate-bounce shadow-lg shadow-rose-500/20">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-semibold text-slate-300">Đang hoàn tất đăng nhập...</p>
      <p className="text-xs text-slate-500">Vui lòng chờ trong giây lát</p>
    </div>
  );
};
