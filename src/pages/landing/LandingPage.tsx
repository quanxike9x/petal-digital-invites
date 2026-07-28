import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockTemplates } from '../../data/mockData';
import { LoginModal } from '../../components/auth/LoginModal';
import { CreateInvitationModal } from '../../components/invitations/CreateInvitationModal';
import { ExistingInvitationChoiceModal } from '../../components/invitations/ExistingInvitationChoiceModal';
import { invitationService } from '../../services/invitationService';
import type { Invitation, Template } from '../../types';
import { 
  Sparkles, 
  Heart, 
  ArrowRight, 
  Check, 
  Smartphone, 
  Globe, 
  QrCode, 
  Music, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Plus, 
  Menu, 
  X,
  Star,
  LogOut,
  LayoutDashboard,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useTemplates } from '../../hooks/useTemplates';

export const LandingPage: React.FC = () => {
  const { user, role, openLoginModal, logout } = useAuth();
  const { templates, isLoading } = useTemplates(true);
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Modals for Template Selection Flow
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userInvitations, setUserInvitations] = useState<Invitation[]>([]);

  const categories = ['Tất cả', 'Luxury', 'Minimalist', 'Traditional', 'Modern'];

  const filteredTemplates = templates.filter(
    (t) => activeCategory === 'Tất cả' || t.category === activeCategory
  );

  // Handle "Dùng Mẫu Này" (Use This Template) Action
  const handleUseTemplate = async (template?: Template | null) => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để chọn mẫu thiệp này!');
      openLoginModal();
      return;
    }

    if (template) setSelectedTemplate(template);
    try {
      const invitations = await invitationService.getInvitations(user.id);
      setUserInvitations(invitations);

      if (invitations.length === 0) {
        // No existing invitations -> Open Create Modal directly with preselected template
        setIsCreateModalOpen(true);
      } else {
        // Has existing invitations -> Ask choice (Create New OR Edit Existing)
        setIsChoiceModalOpen(true);
      }
    } catch (e) {
      setIsCreateModalOpen(true);
    }
  };

  // General Hero CTA Click
  const handleCtaClick = () => {
    if (!user) {
      openLoginModal();
    } else {
      handleUseTemplate(templates[0] || null);
    }
  };

  const faqs = [
    {
      question: 'Thiệp cưới online Pudwedding có dễ tạo không?',
      answer: 'Cực kỳ dễ dàng! Bạn chỉ cần chọn mẫu thiệp yêu thích, điền thông tin Cô dâu & Chú rể, tải ảnh cưới và mã QR mừng cưới là thiệp đã sẵn sàng chia sẻ ngay trong 5 phút.',
    },
    {
      question: 'Tôi có được dùng thử miễn phí không?',
      answer: 'Có! Pudwedding cung cấp gói Dùng Thử Miễn Phí 3 ngày cho mọi tài khoản mới với đầy đủ tính năng thiết kế, nhạc nền và gửi lời chúc.',
    },
    {
      question: 'Khách mời của tôi mở thiệp trên điện thoại có đẹp không?',
      answer: 'Hoàn hảo 100%! Giao diện được tối ưu responsive mượt mà trên mọi thiết bị: iPhone, Android, Tablet và Máy tính.',
    },
    {
      question: 'Tôi có thể gắn tên miền riêng cho thiệp cưới của mình không?',
      answer: 'Hoàn toàn được! Gói Tên Miền Riêng hỗ trợ gắn tên miền cá nhân như cuoiphongvahoa.com kèm chứng chỉ bảo mật SSL miễn phí.',
    },
    {
      question: 'Khách mời có thể gửi lời chúc và xác nhận tham dự (RSVP) được không?',
      answer: 'Có, tính năng RSVP thông minh giúp bạn theo dõi danh sách khách mời tham dự và nhận lời chúc ý nghĩa tức thì.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Pudwedding<span className="text-rose-500">.shop</span>
              </span>
              <p className="text-[10px] text-slate-400">Nền Tảng Thiệp Cưới Thông Minh</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-rose-400 transition-colors">Tính năng</a>
            <a href="#templates" className="hover:text-rose-400 transition-colors">Kho Mẫu Thiệp</a>
            <a href="#pricing" className="hover:text-rose-400 transition-colors">Bảng giá</a>
            <a href="#faq" className="hover:text-rose-400 transition-colors">Hỏi đáp (FAQ)</a>
          </nav>

          {/* Right Action Controls: Guest or Logged In User */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all"
                >
                  <img
                    src={user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-xl object-cover"
                  />
                  <div className="text-left leading-tight pr-1">
                    <p className="text-xs font-bold text-white max-w-[120px] truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Tài khoản'}
                    </p>
                    <span className="text-[9px] text-rose-400 font-semibold uppercase">{role === 'admin' ? 'Admin Master' : 'Khách hàng'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Account Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 text-xs font-semibold animate-fadeIn">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-rose-400" />
                      <span>Dashboard & Thống Kê</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/invitations');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-amber-400" />
                      <span>Quản Lý Thiệp Cưới</span>
                    </button>

                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 flex items-center gap-2.5 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Trình Quản Trị Admin</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={handleCtaClick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Tạo thiệp ngay
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 space-y-3 text-sm animate-fadeIn">
            {user ? (
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-white text-xs">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="p-2 rounded-xl bg-slate-900 text-rose-400 text-center"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="p-2 rounded-xl bg-red-500/20 text-red-300 text-center"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold text-center"
                >
                  Đăng nhập
                </button>
              </div>
            )}

            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-rose-400 font-semibold text-xs"
            >
              Tính năng
            </a>
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-rose-400 font-semibold text-xs"
            >
              Kho Mẫu Thiệp
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-rose-400 font-semibold text-xs"
            >
              Bảng giá
            </a>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative py-20 lg:py-32 px-6 overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-600/20 to-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold backdrop-blur-md">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Nền tảng tạo thiệp cưới online hàng đầu Việt Nam</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Tạo Thiệp Cưới Online <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Sang Trọng & Độc Đáo Chỉ Trong 5 Phút
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Thay thế thiệp giấy truyền thống bằng thiệp điện tử thông minh. Tích hợp album ảnh cưới, bản đồ tiệc, mã QR mừng cưới và theo dõi RSVP khách mời tức thì.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCtaClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Tạo Thiệp Dùng Thử 3 Ngày</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#templates"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all"
            >
              Khám Phá Mẫu Thiệp
            </a>
          </div>
        </div>
      </section>

      {/* 3. TEMPLATE GALLERY SHOWCASE */}
      <section id="templates" className="py-20 px-6 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Kho Mẫu Thiệp Cưới Đa Dạng</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Chọn mẫu thiệp yêu thích và bắt đầu tạo thiệp cưới cá nhân hóa cho bạn ngay lập tức.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Templates */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 text-sm animate-pulse">
              Đang nạp danh sách template trực tiếp từ Supabase...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16 p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <Sparkles className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Chưa Có Mẫu Thiệp Nào Trong Hệ Thống</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tất cả mẫu thiệp được quản lý và xuất bản trực tiếp bởi Admin từ Supabase. Vui lòng đăng nhập tài khoản Admin để xuất bản mẫu thiệp đầu tiên!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
                    <img
                      src={template.thumbnail_url}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Dùng Mẫu Này</span>
                      </button>
                    </div>
                    <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-rose-400 font-bold text-[10px] px-3 py-1 rounded-full border border-rose-500/20">
                      {template.category}
                    </span>
                  </div>

                  <div className="p-5 flex items-center justify-between border-t border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-sm">{template.name}</h4>
                      <p className="text-[11px] text-slate-400">Version {template.version_label || `v${template.version || 1}.0`}</p>
                    </div>

                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      Dùng Mẫu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODALS FOR SELECTION FLOW */}
      <LoginModal />

      {/* Create Invitation Modal */}
      <CreateInvitationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialTemplateId={selectedTemplate?.id}
      />

      {/* Existing Invitation Choice Modal */}
      <ExistingInvitationChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        existingInvitations={userInvitations}
        templateName={selectedTemplate?.name}
        onChooseCreateNew={() => {
          setIsChoiceModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
};
