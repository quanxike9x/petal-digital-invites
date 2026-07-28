import React, { useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Flower2, 
  Square, 
  Palette, 
  Music, 
  Wrench, 
  LayoutTemplate, 
  Layers, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Heart,
  Video,
  Images,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  MailCheck,
  QrCode,
  FolderOpen,
  Circle,
  Triangle,
  X
} from 'lucide-react';
import type { WidgetType } from '../../registry/ComponentRegistry';

interface CineloveToolboxSidebarProps {
  activeSectionIndex: number;
  onAddComponent: (type: WidgetType) => void;
  onAddPresetBlock?: (presetName: string) => void;
  onApplyGlobalEffect?: (effectType: string, value: string) => void;
}

export type SidebarToolId = 
  | 'text' 
  | 'media' 
  | 'stock' 
  | 'shapes' 
  | 'bg' 
  | 'music' 
  | 'widgets' 
  | 'presets' 
  | 'templates' 
  | 'effects';

/**
 * TASK UI-03.1 — CANVA / CINELOVE STYLE VERTICAL LEFT TOOLBAR
 */
export const CineloveToolboxSidebar: React.FC<CineloveToolboxSidebarProps> = ({
  activeSectionIndex,
  onAddComponent,
  onAddPresetBlock,
  onApplyGlobalEffect,
}) => {
  const [activeTool, setActiveTool] = useState<SidebarToolId | null>('text');

  const [expandedCategory, setExpandedCategory] = useState<string>('flower');
  const [openingEffect, setOpeningEffect] = useState<string>('Envelope');
  const [fallingEffect, setFallingEffect] = useState<string>('Heart');
  const [bgMode, setBgMode] = useState<'solid' | 'gradient' | 'image'>('solid');

  const TOOLS: { id: SidebarToolId; label: string; icon: React.ElementType }[] = [
    { id: 'text', label: 'Văn bản', icon: Type },
    { id: 'media', label: 'Hình ảnh', icon: ImageIcon },
    { id: 'stock', label: 'Stock', icon: Flower2 },
    { id: 'shapes', label: 'Hình dạng', icon: Square },
    { id: 'bg', label: 'Nền', icon: Palette },
    { id: 'music', label: 'Âm nhạc', icon: Music },
    { id: 'widgets', label: 'Tiện ích', icon: Wrench },
    { id: 'presets', label: 'Preset', icon: LayoutTemplate },
    { id: 'templates', label: 'Mẫu', icon: Layers },
    { id: 'effects', label: 'Hiệu ứng', icon: Sparkles },
  ];

  const toggleTool = (toolId: SidebarToolId) => {
    if (activeTool === toolId) {
      setActiveTool(null);
    } else {
      setActiveTool(toolId);
    }
  };

  return (
    <div className="flex h-full font-sans select-none shrink-0 z-30">
      {/* 1. VERTICAL ICON STRIP (72PX) */}
      <aside className="w-[72px] md:w-[72px] w-full bg-slate-950 border-r border-slate-800 flex md:flex-col flex-row items-center py-2 px-1 gap-1 shrink-0 overflow-y-auto overflow-x-hidden scrollbar-none">
        {TOOLS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTool === id;
          return (
            <button
              key={id}
              onClick={() => toggleTool(id)}
              className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
              title={label}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-[10px] font-medium truncate tracking-tight text-center max-w-full leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* 2. COLLAPSIBLE DRAWER PANEL (280PX) */}
      {activeTool && (
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden font-sans h-full shadow-2xl animate-in slide-in-from-left duration-200">
          <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <span className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
              {TOOLS.find((t) => t.id === activeTool)?.label}
            </span>
            <button
              onClick={() => setActiveTool(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin">
            {/* TOOL 1: VĂN BẢN (TEXT) */}
            {activeTool === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="font-bold text-xs text-slate-300">Thêm Thẻ Văn Bản</span>
                  <span className="text-[9px] font-mono text-amber-400">Section #{activeSectionIndex + 1}</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onAddComponent('Text')}
                    className="w-full p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
                  >
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-300">
                      + Heading (Tiêu đề chính)
                    </h3>
                    <span className="text-[10px] text-slate-400">Tên Cô Dâu & Chú Rể</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Text')}
                    className="w-full p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
                  >
                    <h4 className="font-sans font-semibold text-sm text-slate-200 group-hover:text-amber-300">
                      + Sub Heading (Tiêu đề phụ)
                    </h4>
                    <span className="text-[10px] text-slate-400">Lời mời trân trọng</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Text')}
                    className="w-full p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
                  >
                    <p className="font-sans text-xs text-slate-400 group-hover:text-amber-300">
                      + Paragraph (Đoạn văn)
                    </p>
                    <span className="text-[10px] text-slate-500">Chi tiết lễ cưới & tiệc mừng</span>
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 2: HÌNH ẢNH (MEDIA) */}
            {activeTool === 'media' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Hình Ảnh & Video</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddComponent('Image')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <ImageIcon className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xs">Single Image</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Gallery')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Images className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xs">Gallery Grid</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Gallery')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <FolderOpen className="w-5 h-5 text-sky-400" />
                    <span className="font-bold text-xs">Carousel Ảnh</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Video')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Video className="w-5 h-5 text-rose-400" />
                    <span className="font-bold text-xs">YouTube / Vimeo</span>
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 3: STOCK WEDDING ASSET */}
            {activeTool === 'stock' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Stock Wedding Asset</span>
                <div className="space-y-2">
                  {[
                    { id: 'flower', label: '🌸 Hoa (Flower)', count: 24 },
                    { id: 'leaf', label: '🌿 Lá (Leaf)', count: 18 },
                    { id: 'ring', label: '💍 Nhẫn (Ring & Heart)', count: 12 },
                    { id: 'frame', label: '🖼️ Khung (Frame & Corner)', count: 16 },
                    { id: 'stamp', label: '🏷️ Con Dấu Sáp (Wax Seal)', count: 8 },
                  ].map(({ id, label, count }) => {
                    const isExpanded = expandedCategory === id;
                    return (
                      <div key={id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? '' : id)}
                          className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <span>{label}</span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            {count} {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="p-2 border-t border-slate-800/60 grid grid-cols-3 gap-1.5 bg-slate-900/60">
                            {Array.from({ length: 6 }).map((_, idx) => (
                              <div
                                key={idx}
                                onClick={() => onAddComponent('Image')}
                                className="aspect-square rounded-lg border border-slate-800 hover:border-amber-500 bg-slate-950 p-1 flex items-center justify-center cursor-pointer group transition-all"
                              >
                                <Heart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TOOL 4: HÌNH DẠNG (SHAPES & LINES) */}
            {activeTool === 'shapes' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Hình Dạng & Đường Kẻ</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onAddComponent('Spacer')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Square className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-bold">Vuông</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Spacer')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Circle className="w-5 h-5 text-sky-400" />
                    <span className="text-[10px] font-bold">Tròn</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Spacer')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Triangle className="w-5 h-5 text-rose-400" />
                    <span className="text-[10px] font-bold">Tam Giác</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-xs text-slate-300 block">Kiểu Đường Kẻ</span>
                  <button
                    onClick={() => onAddComponent('Divider')}
                    className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-slate-200 cursor-pointer transition-all"
                  >
                    <div className="w-32 h-0.5 bg-amber-400" />
                    <span className="text-xs font-bold">Nét Phân Cách</span>
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 5: NỀN (BACKGROUND) */}
            {activeTool === 'bg' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Cấu Hình Nền</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setBgMode('solid')}
                    className={`py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${bgMode === 'solid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Màu Đơn
                  </button>
                  <button
                    onClick={() => setBgMode('gradient')}
                    className={`py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${bgMode === 'gradient' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Gradient
                  </button>
                  <button
                    onClick={() => setBgMode('image')}
                    className={`py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${bgMode === 'image' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Hình Nền
                  </button>
                </div>

                {bgMode === 'solid' && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">Màu Nền</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {['#ffffff', '#f8fafc', '#fff1f2', '#fdf4ff', '#0f172a'].map((color) => (
                        <div
                          key={color}
                          className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TOOL 6: ÂM NHẠC (MUSIC) */}
            {activeTool === 'music' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Âm Nhạc Tiệc Cưới</span>
                <button
                  onClick={() => onAddComponent('Music')}
                  className="w-full p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-slate-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs">Nhạc Nền Autoplay</span>
                  </div>
                  <Plus className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            )}

            {/* TOOL 7: TIỆN ÍCH (WIDGETS) */}
            {activeTool === 'widgets' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Tiện Ích Tương Tác</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddComponent('Timeline')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <CalendarDays className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xs">Lịch (Calendar)</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Countdown')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Clock className="w-5 h-5 text-sky-400" />
                    <span className="font-bold text-xs">Countdown</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Map')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <MapPin className="w-5 h-5 text-rose-400" />
                    <span className="font-bold text-xs">Bản Đồ (Map)</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('QR')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-xs">VietQR Box</span>
                  </button>

                  <button
                    onClick={() => onAddComponent('Text')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-200 hover:text-amber-400 transition-all"
                  >
                    <Phone className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xs">Nút Gọi</span>
                  </button>

                  {/* FIXED: CALL onAddComponent('RSVP') FOR RSVP FORM */}
                  <button
                    onClick={() => onAddComponent('RSVP')}
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex flex-col items-center justify-center gap-1 cursor-pointer text-amber-300 transition-all"
                  >
                    <MailCheck className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xs">RSVP Form</span>
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 8: PRESET BLOCK */}
            {activeTool === 'presets' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Preset Blocks</span>
                <div className="space-y-2">
                  {[
                    'Bride Intro',
                    'Groom Intro',
                    'Wedding Date',
                    'Gallery Section',
                    'Timeline Section',
                    'RSVP Section',
                    'Footer Card',
                  ].map((name) => (
                    <button
                      key={name}
                      onClick={() => onAddPresetBlock && onAddPresetBlock(name)}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-xs font-bold text-slate-200 cursor-pointer transition-all"
                    >
                      <span>+ {name}</span>
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL 9: MẪU (TEMPLATES) */}
            {activeTool === 'templates' && (
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-300 block">Mẫu Thư Thư Phổ Biến</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Template Repository</span>
                  <p className="text-[10px] text-slate-400">Tải cấu trúc mẫu từ database.</p>
                </div>
              </div>
            )}

            {/* TOOL 10: HIỆU ỨNG (EFFECTS) */}
            {activeTool === 'effects' && (
              <div className="space-y-4">
                <span className="font-bold text-xs text-slate-300 block">Hiệu Ứng Toàn Trang</span>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Hiệu ứng Mở Màn</label>
                  <select
                    value={openingEffect}
                    onChange={(e) => {
                      setOpeningEffect(e.target.value);
                      if (onApplyGlobalEffect) onApplyGlobalEffect('opening', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {['Envelope', 'Curtain', 'Book', 'Gate', 'Flower', 'Ribbon'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Hiệu ứng Rơi</label>
                  <select
                    value={fallingEffect}
                    onChange={(e) => {
                      setFallingEffect(e.target.value);
                      if (onApplyGlobalEffect) onApplyGlobalEffect('falling', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {['Heart', 'Snow', 'Flower', 'Leaf', 'Sparkle'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
