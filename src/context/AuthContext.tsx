import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; message: string; role?: UserRole }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to resolve role from user object / email
export const resolveUserRole = (user: User | null): UserRole => {
  if (!user) return 'user';
  // Check user metadata role or admin email
  if (
    user.user_metadata?.role === 'admin' ||
    user.email === 'admin@chungdoi.vn' ||
    user.email?.toLowerCase().startsWith('admin')
  ) {
    return 'admin';
  }
  return 'user';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync user state and role
  const updateUserState = (newUser: User | null, currentSession: Session | null) => {
    setUser(newUser);
    setSession(currentSession);
    const resolvedRole = resolveUserRole(newUser);
    setRole(resolvedRole);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted) {
            updateUserState(session?.user || null, session);
          }
        } catch (err) {
          console.error('Supabase session fetch error:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          if (mounted) {
            updateUserState(currentSession?.user || null, currentSession);
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        // Fallback for local development when Supabase env is not set
        const savedUser = localStorage.getItem('chungdoi_active_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (mounted) updateUserState(parsed, null);
          } catch (e) {
            console.error(e);
          }
        }
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // 1. Google OAuth
  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(`Đăng nhập Google thất bại: ${error.message}`);
        throw error;
      }
    } else {
      // Local dev fallback
      const mockGoogleUser: any = {
        id: 'usr-google-' + Date.now(),
        email: 'user.google@gmail.com',
        user_metadata: {
          full_name: 'Google Test User',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          role: 'user',
        },
        created_at: new Date().toISOString(),
      };
      updateUserState(mockGoogleUser, null);
      localStorage.setItem('chungdoi_active_user', JSON.stringify(mockGoogleUser));
      closeLoginModal();
      toast.success('Đăng nhập với Google thành công!');
    }
  };

  // 2. Email + Password (Supabase Auth for Admin & User)
  const loginWithPassword = async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        updateUserState(data.user, data.session);
        closeLoginModal();
        const userRole = resolveUserRole(data.user);
        toast.success(`Đăng nhập thành công! (${userRole === 'admin' ? 'Quản trị viên' : 'Khách hàng'})`);
        return { success: true, role: userRole };
      }

      return { success: false, message: 'Đăng nhập không thành công.' };
    } else {
      // Local dev fallback for Email + Password
      const isAdmin = email.toLowerCase().includes('admin');
      const mockUser: any = {
        id: isAdmin ? 'usr-admin-1' : 'usr-user-1',
        email: email,
        user_metadata: {
          full_name: isAdmin ? 'Quản Trị Viên (Admin)' : email.split('@')[0],
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          role: isAdmin ? 'admin' : 'user',
        },
        created_at: new Date().toISOString(),
      };
      updateUserState(mockUser, null);
      localStorage.setItem('chungdoi_active_user', JSON.stringify(mockUser));
      closeLoginModal();
      const userRole = resolveUserRole(mockUser);
      toast.success(`Đăng nhập thành công! (${userRole === 'admin' ? 'Quản trị viên Admin' : 'Khách hàng'})`);
      return { success: true, role: userRole };
    }
  };

  // 3. SignUp with Email + Password
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user',
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        updateUserState(data.user, data.session);
        closeLoginModal();
        toast.success('Đăng ký tài khoản thành công!');
        return { success: true };
      }

      return { success: true, message: 'Vui lòng kiểm tra Email để xác nhận tài khoản!' };
    } else {
      const mockUser: any = {
        id: 'usr-' + Date.now(),
        email: email,
        user_metadata: {
          full_name: fullName,
          role: 'user',
        },
        created_at: new Date().toISOString(),
      };
      updateUserState(mockUser, null);
      localStorage.setItem('chungdoi_active_user', JSON.stringify(mockUser));
      closeLoginModal();
      toast.success('Đăng ký tài khoản thành công!');
      return { success: true };
    }
  };

  // 4. Magic Link / OTP
  const sendMagicLink = async (email: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Đã gửi mã OTP / Magic Link tới Email của bạn!' };
    } else {
      return { success: true, message: 'Mã xác thực OTP Demo của bạn là: 123456' };
    }
  };

  // 5. Verify OTP
  const verifyOtp = async (email: string, token: string) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) {
        return { success: false, message: error.message };
      }
      if (data.user) {
        updateUserState(data.user, data.session);
        closeLoginModal();
        const userRole = resolveUserRole(data.user);
        toast.success('Xác thực OTP thành công!');
        return { success: true, role: userRole };
      }
      return { success: false, message: 'Mã OTP không chính xác.' };
    } else {
      if (token === '123456' || token.length === 6) {
        const isAdmin = email.toLowerCase().includes('admin');
        const mockUser: any = {
          id: 'usr-' + Date.now(),
          email: email,
          user_metadata: {
            full_name: isAdmin ? 'Quản Trị Viên (Admin)' : email.split('@')[0],
            role: isAdmin ? 'admin' : 'user',
          },
          created_at: new Date().toISOString(),
        };
        updateUserState(mockUser, null);
        localStorage.setItem('chungdoi_active_user', JSON.stringify(mockUser));
        closeLoginModal();
        const userRole = resolveUserRole(mockUser);
        toast.success('Xác thực OTP thành công!');
        return { success: true, role: userRole };
      }
      return { success: false, message: 'Mã OTP không đúng (Gợi ý Demo: 123456)' };
    }
  };

  // 6. Logout
  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Signout error:', err);
      }
    }
    localStorage.removeItem('chungdoi_active_user');
    setUser(null);
    setSession(null);
    setRole('user');
    toast.success('Đã đăng xuất tài khoản');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        loginWithPassword,
        signUpWithEmail,
        sendMagicLink,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
