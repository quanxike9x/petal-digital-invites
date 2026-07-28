import React, { useState, useMemo } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Template } from '../../types';
import { TemplatePreviewModal } from '../../components/templates/TemplatePreviewModal';
import { CreateInvitationModal } from '../../components/invitations/CreateInvitationModal';
import { ExistingInvitationChoiceModal } from '../../components/invitations/ExistingInvitationChoiceModal';
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  Crown, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

export const TemplateGallery: React.FC = () => {
  const { templates, isLoading } = useTemplates();
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'name'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');
  const [userInvitations, setUserInvitations] = useState<any[]>([]);

  const categories = ['Tất cả', 'Luxury', 'Minimalist', 'Traditional', 'Modern'];

  // Filtered & Sorted Templates
  const processedTemplates = useMemo(() => {
    return templates
      .filter((tpl) => {
        const matchesSearch = tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) || tpl.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tất cả' || tpl.category === selectedCategory;
        const matchesType = typeFilter === 'all' || (typeFilter === 'free' ? !tpl.is_premium : tpl.is_premium);
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.name.localeCompare(b.name);
      });
  }, [templates, searchTerm, selectedCategory, typeFilter, sortOption]);

  // Pagination
  const totalPages = Math.ceil(processedTemplates.length / itemsPerPage) || 1;
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedTemplates.slice(start, start + itemsPerPage);
  }, [processedTemplates, currentPage, itemsPerPage]);

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!user) {
      openLoginModal();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Mẫu Thiệp Cưới Đa Dạng & Sang Trọng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Template Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Lựa chọn phong cách thiết kế thiệp cưới ưng ý nhất cho ngày trọng đại.
          </p>
        </div>

        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="space-y-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên mẫu..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Type Filter & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${typeFilter === 'all' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => { setTypeFilter('free'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${typeFilter === 'free' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Free
              </button>
              <button
                onClick={() => { setTypeFilter('premium'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${typeFilter === 'premium' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                VIP Premium
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800/60 rounded-3xl animate-pulse" />
          <div className="h-80 bg-slate-800/60 rounded-3xl animate-pulse" />
          <div className="h-80 bg-slate-800/60 rounded-3xl animate-pulse" />
        </div>
      ) : paginatedTemplates.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">Không tìm thấy Mẫu thiệp nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md hover:border-rose-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between"
            >
              {/* Thumbnail Frame */}
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="p-3 rounded-full bg-slate-900/90 text-white hover:bg-rose-500 transition-colors shadow-lg"
                      title="Xem trước giao diện"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template.id)}
                      className="px-4 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-rose-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Dùng Mẫu Này</span>
                    </button>
                  </div>

                  {(user?.role === 'admin' || user?.email?.toLowerCase().includes('admin')) && (
                    <button
                      onClick={() => navigate(`/editor/admin/${template.id}`)}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-md hover:bg-amber-400 transition-colors"
                    >
                      <span>Sửa Template (Admin Builder)</span>
                    </button>
                  )}
                </div>

                {/* Category & Premium Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-slate-950/80 backdrop-blur-md text-rose-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-rose-500/20">
                    {template.category}
                  </span>
                  {template.is_premium && (
                    <span className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Crown className="w-3 h-3 fill-current" /> VIP
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Primary Color Swatch */}
              <div className="p-5 flex items-center justify-between border-t border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-100 text-base group-hover:text-rose-400 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Version {template.version_label || `v${template.version || 1}.0`}</p>
                </div>

                <div
                  className="w-5 h-5 rounded-full border border-slate-700 shadow-inner shrink-0"
                  style={{ backgroundColor: template.primary_color || '#E11D48' }}
                  title={`Color: ${template.primary_color}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-300">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={handleUseTemplate}
      />

      {/* Create Invitation Modal */}
      <CreateInvitationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialTemplateId={selectedTemplateId}
      />

      {/* Existing Invitation Choice Modal */}
      <ExistingInvitationChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        existingInvitations={userInvitations}
        onChooseCreateNew={() => {
          setIsChoiceModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
};
