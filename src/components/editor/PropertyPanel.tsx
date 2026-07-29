import React, { useState } from 'react';
import { 
  Sliders, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown,
  FolderOpen,
  Palette,
  Check,
  GripVertical,
  Layers,
  Scaling,
  Paintbrush,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Wand2,
  Calendar,
  Clock,
  MapPin,
  FlipHorizontal,
  FlipVertical,
  ExternalLink,
  SunMedium,
  Image as ImageIcon,
  Heart,
  MailCheck
} from 'lucide-react';
import type { UnifiedComponentInstance } from '../../registry/ComponentRegistry';
import { getRegisteredComponentByType } from '../../registry/ComponentRegistry';
import type { PropertyFieldSchema } from '../../types/propertySchema';
import type { TemplateSection, ContainerType } from '../../schema/TemplateSchema';
import { getSectionContainers } from '../../schema/TemplateSchema';
import { AssetPickerModal } from './AssetPickerModal';
import { useTheme } from '../../context/ThemeContext';
import { useDragEngine } from '../../context/DragContext';

interface PropertyPanelProps {
  selectedSection?: TemplateSection | null;
  selectedSectionIndex?: number;
  selectedComponent?: UnifiedComponentInstance | null;
  onChangeSection?: (updatedSection: TemplateSection) => void;
  onDuplicateSection?: (section: TemplateSection) => void;
  onDeleteSection?: (sectionId: string) => void;
  onMoveSectionUp?: (sIdx: number) => void;
  onMoveSectionDown?: (sIdx: number) => void;
  onChangeComponent?: (updatedComp: UnifiedComponentInstance) => void;
  onDuplicateComponent?: (comp: UnifiedComponentInstance) => void;
  onDeleteComponent?: (compId: string) => void;
  onMoveComponentUp?: () => void;
  onMoveComponentDown?: () => void;
  onBringComponentToFront?: () => void;
  onSendComponentToBack?: () => void;
}

/**
 * TASK UI 3.4 - UI 3.8 PROPERTY PANEL ACCORDION SPECIFICATIONS
 */
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedSection,
  selectedSectionIndex = 0,
  selectedComponent,
  onChangeSection,
  onDuplicateSection,
  onDeleteSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onChangeComponent,
  onDuplicateComponent,
  onDeleteComponent,
}) => {
  const { currentTheme, availablePresets, activePresetId, setThemePreset } = useTheme();
  const { startSectionDrag, endDrag } = useDragEngine();

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    custom: true,
    padding: false,
    border: false,
    shadow: false,
    hyperlink: false,
    entranceAnim: false,
    continuousAnim: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Asset Picker Modal State
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState<boolean>(false);
  const [pickerTargetType, setPickerTargetType] = useState<'sectionBg' | 'componentProp'>('sectionBg');
  const [pickerTargetField, setPickerTargetField] = useState<string>('src');

  // 1. SECTION INSPECTOR (UI 3.4 SECTION BACKGROUND WITH IMAGE PICKER BUTTON)
  if (selectedSection && !selectedComponent) {
    const containers = getSectionContainers(selectedSection);
    const primaryContainer = containers[0] || { id: `cnt-${selectedSection.id}`, type: 'vertical', components: [] };

    const handleSectionStyleChange = (key: string, value: string | number) => {
      if (!onChangeSection) return;
      onChangeSection({
        ...selectedSection,
        style: {
          ...selectedSection.style,
          [key]: value,
        },
      });
    };

    const handleSectionNameChange = (name: string) => {
      if (!onChangeSection) return;
      onChangeSection({
        ...selectedSection,
        name,
      });
    };

    const handleContainerTypeChange = (newType: ContainerType) => {
      if (!onChangeSection) return;
      const updatedContainers = containers.map((c, idx) => 
        idx === 0 ? { ...c, type: newType } : c
      );
      onChangeSection({
        ...selectedSection,
        containers: updatedContainers,
      });
    };

    const minHeightNum = parseInt(String(selectedSection.style?.minHeight || 800), 10) || 800;

    return (
      <aside className="w-[350px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 font-sans select-none h-full overflow-hidden">
        {/* Panel Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs text-slate-200 uppercase tracking-wider">SECTION INSPECTOR</span>
          </div>
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
            Section #{selectedSectionIndex + 1}
          </span>
        </div>

        {/* SECTION ACTION BUTTONS BAR */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-2">
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('text/plain', selectedSection.id);
              startSectionDrag(selectedSection.id);
            }}
            onDragEnd={() => {
              endDrag();
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-grab active:cursor-grabbing shadow-sm"
            title="Kéo để di chuyển vị trí Section"
          >
            <GripVertical className="w-4 h-4" />
            <span>☰ Drag Section</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {onMoveSectionUp && (
                <button
                  onClick={() => onMoveSectionUp(selectedSectionIndex)}
                  disabled={selectedSectionIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title="Move Section Up"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
                </button>
              )}

              {onMoveSectionDown && (
                <button
                  onClick={() => onMoveSectionDown(selectedSectionIndex)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Move Section Down"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                </button>
              )}

              {onDuplicateSection && (
                <button
                  onClick={() => onDuplicateSection(selectedSection)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer"
                  title="Duplicate Section"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {onDeleteSection && (
              <button
                onClick={() => onDeleteSection(selectedSection.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                title="Delete Section"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Property Controls Form */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Container Layout Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => handleContainerTypeChange('vertical')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  primaryContainer.type === 'vertical'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Vertical (Tự nhiên)
              </button>
              <button
                onClick={() => handleContainerTypeChange('stack')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  primaryContainer.type === 'stack'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Stack (Layer đè)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tên Section</label>
            <input
              type="text"
              value={selectedSection.name || `Section #${selectedSectionIndex + 1}`}
              onChange={(e) => handleSectionNameChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">Min Height (px)</label>
              <span className="font-mono text-[10px] text-amber-400">{minHeightNum}px</span>
            </div>
            <input
              type="number"
              min={100}
              max={3000}
              step={10}
              value={minHeightNum}
              onChange={(e) => handleSectionStyleChange('minHeight', `${e.target.value}px`)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* UI 3.4 SECTION BACKGROUND PROPERTY WITH IMAGE PICKER BUTTON */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Nền Section (Background)</span>
            </label>

            {/* Solid Background Color */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Màu Nền (Solid)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedSection.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleSectionStyleChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedSection.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleSectionStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* UI 3.4 IMAGE PICKER BUTTON FOR SECTION BACKGROUND */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-300 block">Hình Ảnh Nền Section</label>
              <button
                onClick={() => {
                  setPickerTargetType('sectionBg');
                  setIsAssetPickerOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <ImageIcon className="w-4 h-4" />
                <span>🖼️ Chọn Ảnh Nền / Upload Ảnh</span>
              </button>

              {selectedSection.style?.backgroundImage && (
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 mt-2">
                  <span className="text-[10px] text-slate-300 truncate max-w-[200px]">
                    {String(selectedSection.style.backgroundImage)}
                  </span>
                  <button
                    onClick={() => handleSectionStyleChange('backgroundImage', '')}
                    className="text-[10px] text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Xóa Ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <AssetPickerModal
          isOpen={isAssetPickerOpen}
          onClose={() => setIsAssetPickerOpen(false)}
          isMultiSelect={false}
          initialSelectedUrls={selectedSection.style?.backgroundImage ? [String(selectedSection.style.backgroundImage)] : []}
          onConfirm={(urls) => {
            if (urls[0]) {
              handleSectionStyleChange('backgroundImage', urls[0]);
            }
          }}
        />
      </aside>
    );
  }

  // 2. UNSELECTED COMPONENT STATE -> RENDER THEME INSPECTOR
  if (!selectedComponent) {
    return (
      <aside className="w-[350px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 font-sans select-none h-full overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>THEME INSPECTOR</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            {currentTheme.name}
          </span>
        </div>

        <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Theme Presets
            </label>

            <div className="space-y-2">
              {availablePresets.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setThemePreset(preset.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-amber-500 bg-slate-950 ring-2 ring-amber-500/20 shadow-lg'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div
                      className="h-9 w-full rounded-xl mb-2 flex items-center justify-end px-3 relative overflow-hidden shadow-inner"
                      style={{ background: preset.thumbnail }}
                    >
                      <div className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.tokens.colors.primary }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.tokens.colors.accent }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-amber-500 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 3. COMPONENT INSPECTOR (TASK UI 3.5 - UI 3.8 ACCORDIONS)
  const definition = getRegisteredComponentByType(selectedComponent.type);
  const propertiesList: PropertyFieldSchema[] = definition?.properties || [];
  const layerName = selectedComponent.name || selectedComponent.type;

  const handleFieldValueChange = (
    key: string,
    target: 'props' | 'style',
    val: unknown
  ) => {
    if (!onChangeComponent) return;

    if (target === 'props') {
      onChangeComponent({
        ...selectedComponent,
        props: {
          ...selectedComponent.props,
          [key]: val,
        },
      });
    } else {
      onChangeComponent({
        ...selectedComponent,
        style: {
          ...selectedComponent.style,
          [key]: val,
        },
      });
    }
  };

  return (
    <aside className="w-[350px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 font-sans select-none h-full overflow-hidden">
      {/* HEADER: COMPONENT NAME & ID */}
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-white truncate leading-tight">{layerName}</h4>
            <span className="font-mono text-[9px] text-slate-400 block truncate">
              Type: {selectedComponent.type} | ID: {selectedComponent.id.substring(0, 10)}...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onDuplicateComponent && (
            <button
              onClick={() => onDuplicateComponent(selectedComponent)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer transition-colors"
              title="Duplicate Component"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteComponent && (
            <button
              onClick={() => onDeleteComponent(selectedComponent.id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer transition-colors"
              title="Delete Component"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ACCORDIONS FOR TASK UI 3.5 TO UI 3.8 */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs scrollbar-thin">
        
        {/* 1. TÙY CHỈNH (CUSTOM PROPERTIES PER COMPONENT TYPE) */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => toggleAccordion('custom')}
            className="w-full p-2.5 flex items-center justify-between font-bold text-xs text-amber-400 bg-slate-950 border-b border-slate-800 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Tùy Chỉnh ({selectedComponent.type})</span>
            </span>
            {openAccordions.custom ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openAccordions.custom && (
            <div className="p-3 space-y-3">
              {/* UI 3.5 MONTHLY CALENDAR SPECIFIC CONTROLS */}
              {selectedComponent.type === 'Timeline' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Chọn Tháng</label>
                      <select
                        value={Number(selectedComponent.props.month || 12)}
                        onChange={(e) => handleFieldValueChange('month', 'props', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-amber-300 rounded-lg p-1.5 text-xs font-bold font-mono"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>Tháng {m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Chọn Năm</label>
                      <input
                        type="number"
                        value={Number(selectedComponent.props.year || 2026)}
                        onChange={(e) => handleFieldValueChange('year', 'props', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-amber-300 rounded-lg p-1.5 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Ngày Cưới (Day 1)</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={Number(selectedComponent.props.weddingDay || 20)}
                        onChange={(e) => handleFieldValueChange('weddingDay', 'props', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-rose-400 rounded-lg p-1.5 text-xs font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Ngày Ăn Hỏi (Day 2)</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={Number(selectedComponent.props.engagementDay || 15)}
                        onChange={(e) => handleFieldValueChange('engagementDay', 'props', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-amber-400 rounded-lg p-1.5 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-300">Hiển Thị 2 Ngày Cùng Lúc</label>
                    <input
                      type="checkbox"
                      checked={selectedComponent.props.showTwoDates === true}
                      onChange={(e) => handleFieldValueChange('showTwoDates', 'props', e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Style Lịch Tháng</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleFieldValueChange('styleType', 'props', 'style1')}
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                          selectedComponent.props.styleType === 'style1' || !selectedComponent.props.styleType
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Style Kiểu 1 (Tròn)
                      </button>
                      <button
                        onClick={() => handleFieldValueChange('styleType', 'props', 'style2')}
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                          selectedComponent.props.styleType === 'style2'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Style Kiểu 2 (Vuông)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Màu Giao Diện Lịch (Accent)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={String(selectedComponent.props.accentColor || '#e11d48')}
                        onChange={(e) => handleFieldValueChange('accentColor', 'props', e.target.value)}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={String(selectedComponent.props.accentColor || '#e11d48')}
                        onChange={(e) => handleFieldValueChange('accentColor', 'props', e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UI 03.6 COUNTDOWN SPECIFIC CONTROLS */}
              {selectedComponent.type === 'Countdown' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Chọn Ngày & Giờ Đếm Ngược</label>
                    <input
                      type="datetime-local"
                      value={String(selectedComponent.props.targetDate || '2026-12-31T18:00')}
                      onChange={(e) => handleFieldValueChange('targetDate', 'props', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-amber-300 rounded-xl p-2 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Hướng Hiển Thị</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleFieldValueChange('orientation', 'props', 'horizontal')}
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                          selectedComponent.props.orientation === 'horizontal' || !selectedComponent.props.orientation
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Hướng Ngang
                      </button>
                      <button
                        onClick={() => handleFieldValueChange('orientation', 'props', 'vertical')}
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                          selectedComponent.props.orientation === 'vertical'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Hướng Dọc
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Màu Khung</label>
                      <input
                        type="color"
                        value={String(selectedComponent.props.frameColor || '#cbd5e1')}
                        onChange={(e) => handleFieldValueChange('frameColor', 'props', e.target.value)}
                        className="w-full h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Màu Ô Số</label>
                      <input
                        type="color"
                        value={String(selectedComponent.props.cardBg || '#ffffff')}
                        onChange={(e) => handleFieldValueChange('cardBg', 'props', e.target.value)}
                        className="w-full h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UI 03.7 QR BOX SPECIFIC CONTROLS */}
              {selectedComponent.type === 'QR' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Ảnh Hộp Quà Mừng Cưới</label>
                    <button
                      onClick={() => {
                        setPickerTargetType('componentProp');
                        setPickerTargetField('giftBoxImage');
                        setIsAssetPickerOpen(true);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Đổi Ảnh Hộp Quà</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Tên Ngân Hàng</label>
                    <input
                      type="text"
                      value={String(selectedComponent.props.bankName || 'MBBank')}
                      onChange={(e) => handleFieldValueChange('bankName', 'props', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Số Tài Khoản</label>
                    <input
                      type="text"
                      value={String(selectedComponent.props.accountNo || '8888888888')}
                      onChange={(e) => handleFieldValueChange('accountNo', 'props', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Chủ Tài Khoản</label>
                    <input
                      type="text"
                      value={String(selectedComponent.props.accountName || 'TRAN MINH PHONG')}
                      onChange={(e) => handleFieldValueChange('accountName', 'props', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase font-mono"
                    />
                  </div>
                </div>
              )}

              {/* UI 03.8 RSVP SPECIFIC CONTROLS */}
              {selectedComponent.type === 'RSVP' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Tiêu Đề Form RSVP</label>
                    <input
                      type="text"
                      value={String(selectedComponent.props.title || 'Xác Nhận Tham Dự Lễ Cưới')}
                      onChange={(e) => handleFieldValueChange('title', 'props', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Tên Nút Bấm</label>
                    <input
                      type="text"
                      value={String(selectedComponent.props.buttonText || 'Gửi Xác Nhận')}
                      onChange={(e) => handleFieldValueChange('buttonText', 'props', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC REGISTRY FIELD SCHEMA GENERATION */}
              {propertiesList.map((field) => {
                const currentValue = field.target === 'props'
                  ? selectedComponent.props[field.key]
                  : selectedComponent.style[field.key];
                const displayVal = currentValue !== undefined ? currentValue : (field.defaultValue ?? '');

                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">{field.label}</label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={String(displayVal)}
                        onChange={(e) => handleFieldValueChange(field.key, field.target, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={Number(displayVal)}
                        onChange={(e) => handleFieldValueChange(field.key, field.target, Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    )}

                    {field.type === 'color' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(displayVal)}
                          onChange={(e) => handleFieldValueChange(field.key, field.target, e.target.value)}
                          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={String(displayVal)}
                          onChange={(e) => handleFieldValueChange(field.key, field.target, e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    {field.type === 'select' && (
                      <select
                        value={String(displayVal)}
                        onChange={(e) => handleFieldValueChange(field.key, field.target, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {(field.options || []).map((opt) => (
                          <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        isMultiSelect={false}
        initialSelectedUrls={[]}
        onConfirm={(urls) => {
          if (urls[0]) {
            if (pickerTargetType === 'componentProp') {
              handleFieldValueChange(pickerTargetField, 'props', urls[0]);
            }
          }
        }}
      />
    </aside>
  );
};
