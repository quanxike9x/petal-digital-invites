import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../../hooks/useTemplates';
import { Badge } from '../../components/common/Badge';
import type { Template } from '../../types';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Globe2, 
  Sparkles, 
  Crown, 
  Eye, 
  X, 
  Save, 
  Palette,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';

import { TemplatePreviewModal } from '../../components/templates/TemplatePreviewModal';
import { TemplateRepository } from '../../repositories/TemplateRepository';

export const AdminTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { 
    templates, 
    isLoading, 
    updateTemplate, 
    duplicateTemplate, 
    deleteTemplate, 
    bulkDeleteTemplates 
  } = useTemplates();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    slug: '',
    category: 'Modern',
    description: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    cover_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    primary_color: '#E11D48',
    is_premium: false,
    is_active: true,
    version: 'v1.0.0',
  });

  // Filter templates
  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Checkbox select handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTemplates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTemplates.map((t) => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} Template đã chọn?`)) {
      bulkDeleteTemplates(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      slug: '',
      category: 'Modern',
      description: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
      cover_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      primary_color: '#E11D48',
      is_premium: false,
      is_active: true,
      version: 'v1.0.0',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormData(template);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Vui lòng nhập Tên Template!');
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate({ id: editingTemplate.id, updates: formData });
        toast.success('Cập nhật Template thành công!');
        setIsModalOpen(false);
      } else {
        // Create new template via TemplateRepository
        const createdRecord = await TemplateRepository.createTemplate({
          name: formData.name,
          slug: formData.slug || `tpl-${Date.now()}`,
          version: '1.0.0',
          metadata: {
            thumbnail: formData.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
            preview: '',
            status: 'draft',
          },
          status: 'draft',
        });

        if (createdRecord && createdRecord.id) {
          toast.success(`Đã tạo thành công Template "${createdRecord.name}"!`);
          setIsModalOpen(false);
          // NAVIGATE DIRECTLY TO EDITOR!
          navigate(`/editor/admin/${createdRecord.id}`);
          return;
        }
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Lỗi khi tạo Template mới.');
    }
  };

  // Quick Direct "New Template" Creator
  const handleQuickCreateAndEdit = async () => {
    try {
      const createdRecord = await TemplateRepository.createTemplate({
        name: 'Mẫu Thiệp Mới',
        slug: `tpl-new-${Date.now()}`,
        version: '1.0.0',
        metadata: {
          thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
          preview: '',
          status: 'draft',
        },
        status: 'draft',
      });

      if (createdRecord && createdRecord.id) {
        toast.success('Đã khởi tạo Template mới!');
        navigate(`/editor/admin/${createdRecord.id}`);
      }
    } catch {
      toast.error('Không thể tạo mới Template');
    }
  };

  const isAllSelected = filteredTemplates.length > 0 && selectedIds.length === filteredTemplates.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Bulk Selection Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mẫu thiệp hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Select All Toggle Button */}
          <button
            onClick={handleSelectAll}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors shrink-0 ${
              isAllSelected
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-rose-500" /> : <Square className="w-4 h-4" />}
            <span>{isAllSelected ? 'Bỏ Chọn Tất Cả' : 'Chọn Tất Cả'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/30"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa ({selectedIds.length}) Mẫu Đã Chọn</span>
            </button>
          )}

          <button
            onClick={handleQuickCreateAndEdit}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tạo New Template Ngay</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-800/60 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isSelected = selectedIds.includes(template.id);
            return (
              <div
                key={template.id}
                className={`group bg-slate-900/80 border rounded-3xl overflow-hidden backdrop-blur-md transition-all flex flex-col justify-between relative ${
                  isSelected ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-xl' : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {/* Individual Select Checkbox */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(template.id);
                  }}
                  className="absolute top-3 left-3 z-20 cursor-pointer"
                >
                  <div className={`p-1.5 rounded-xl backdrop-blur-md border transition-all ${
                    isSelected ? 'bg-rose-600 text-white border-rose-500 shadow-md' : 'bg-slate-950/70 border-slate-700 text-slate-400 hover:text-white'
                  }`}>
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                </div>

                {/* Cover/Thumbnail View */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-12 flex items-center gap-2">
                    <Badge variant={template.is_premium ? 'warning' : 'secondary'}>
                      {template.is_premium ? 'VIP Premium' : 'Free'}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-950/80 backdrop-blur-sm border-slate-700 text-slate-200">
                      {template.category}
                    </Badge>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors text-base line-clamp-1">
                        {template.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        {template.version || 'v1.0.0'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {template.description || 'Mẫu thiệp cưới thiết kế tinh tế sang trọng.'}
                    </p>
                  </div>

                  {/* Theme Color Circle */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>Màu chủ đạo:</span>
                    <span
                      className="w-6 h-6 rounded-full border border-slate-700 shadow-inner shrink-0"
                      style={{ backgroundColor: template.primary_color || '#E11D48' }}
                      title={`Màu chủ đạo: ${template.primary_color}`}
                    />
                  </div>

                  {/* Status Toggles: Publish/Unpublish & VIP Status */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        const newActive = !template.is_active;
                        const newStatus = newActive ? 'published' : 'draft';
                        updateTemplate({ id: template.id, updates: { is_active: newActive, status: newStatus } });
                        toast.success(newActive ? 'Đã Xuất Bản (Publish) Template!' : 'Đã Hủy Xuất Bản (Unpublish) Template!');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                        template.is_active || template.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title={template.is_active ? 'Click để Hủy Xuất Bản' : 'Click để Xuất Bản'}
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>{template.is_active || template.status === 'published' ? 'Publish' : 'Draft'}</span>
                    </button>

                    <button
                      onClick={() => updateTemplate({ id: template.id, updates: { is_premium: !template.is_premium } })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                        template.is_premium
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{template.is_premium ? 'VIP Premium' : 'Miễn Phí'}</span>
                    </button>
                  </div>

                  {/* 6 Core Action Buttons: Edit, Preview, Duplicate, Export, Delete */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => navigate(`/editor/admin/${template.id}`)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors cursor-pointer"
                      title="Mở Trang Editor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Preview Xem Trước"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          duplicateTemplate(template.id);
                          toast.success(`Đã nhân bản Template "${template.name}"!`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Duplicate (Nhân Bản)"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(template)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Chỉnh Sửa Thông Tin"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa template "${template.name}"?`)) {
                            deleteTemplate(template.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Xóa Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={(id) => navigate(`/editor/admin/${id}`)}
      />

      {/* Modal Add / Edit Template Metadata */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingTemplate ? 'Chỉnh Sửa Thông Tin Template' : 'Thêm Template Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Template *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Song Hỷ Green Luxury"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Slug URL</label>
                <input
                  type="text"
                  placeholder="song-hy-green-luxury"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Danh Mục</label>
                  <select
                    value={formData.category || 'Modern'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Modern">Modern (Hiện Đại)</option>
                    <option value="Classic">Classic (Cổ Điển)</option>
                    <option value="Minimalist">Minimalist (Tối Giản)</option>
                    <option value="Luxury">Luxury (Sang Trọng)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Màu Chủ Đạo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primary_color || '#E11D48'}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color || '#E11D48'}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link Ảnh Thumbnail</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnail_url || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTemplate ? 'Lưu Thay Đổi' : 'Tạo & Mở Editor ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
