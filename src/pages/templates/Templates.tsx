import React, { useState } from 'react';
import { mockTemplates } from '../../data/mockData';
import { Eye, Sparkles, Plus, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const navigate = useNavigate();

  const categories = ['Tất cả', 'Luxury', 'Minimalist', 'Traditional', 'Modern'];

  const filteredTemplates = mockTemplates.filter((tpl) =>
    selectedCategory === 'Tất cả' ? true : tpl.category === selectedCategory
  );

  const handleUseTemplate = (templateId: string) => {
    // Navigates directly to customer editor with mock new invitation ID
    navigate(`/editor/customer/new?templateId=${templateId}`);
  };

  return (
    <div className="space-y-8">
      {/* Category Filter Pills & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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

        <Link
          to="/editor/admin/tpl-1"
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Admin Template Studio</span>
        </Link>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md hover:border-rose-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                <button
                  onClick={() => alert(`Xem trước giao diện mẫu: ${template.name}`)}
                  className="p-3 rounded-full bg-slate-900/90 text-white hover:bg-rose-500 transition-colors shadow-lg"
                  title="Xem trước"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="px-4 py-2.5 rounded-full bg-rose-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:bg-rose-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dùng mẫu này</span>
                </button>
              </div>

              {/* Category Badge */}
              <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-rose-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-rose-500/20">
                {template.category}
              </span>
            </div>

            {/* Template Title & Action Bar */}
            <div className="p-5 flex items-center justify-between border-t border-slate-800">
              <div>
                <h4 className="font-bold text-slate-100 text-sm group-hover:text-rose-400 transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Mẫu thiệp cao cấp</p>
              </div>

              <button
                onClick={() => handleUseTemplate(template.id)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors border border-slate-700/60"
                title="Dùng mẫu này"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
