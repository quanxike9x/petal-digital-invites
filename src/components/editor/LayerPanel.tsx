import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  FolderTree, 
  Layers, 
  Type, 
  Image as ImageIcon, 
  Images, 
  Clock, 
  CalendarDays, 
  MapPin, 
  Music, 
  QrCode, 
  Video, 
  Minus, 
  Maximize2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
  Edit2,
  GripVertical
} from 'lucide-react';
import type { TemplateSection } from '../../schema/TemplateSchema';
import { getSectionContainers, getSectionComponents } from '../../schema/TemplateSchema';
import type { UnifiedComponentInstance, WidgetType } from '../../registry/ComponentRegistry';

interface LayerPanelProps {
  sections: TemplateSection[];
  selectedSectionId?: string | null;
  selectedComponentId?: string | null;
  onSelectSection?: (section: TemplateSection) => void;
  onSelectComponent?: (comp: UnifiedComponentInstance) => void;
  onMoveSectionUp?: (sIdx: number) => void;
  onMoveSectionDown?: (sIdx: number) => void;
  onDeleteSection?: (sectionId: string) => void;
  onMoveComponentUp?: (sectionId: string, compIndex: number) => void;
  onMoveComponentDown?: (sectionId: string, compIndex: number) => void;
  onDuplicateComponent?: (sectionId: string, comp: UnifiedComponentInstance) => void;
  onDeleteComponent?: (sectionId: string, compId: string) => void;
  onToggleComponentVisibility?: (sectionId: string, compId: string) => void;
  onToggleComponentLock?: (sectionId: string, compId: string) => void;
  onRenameComponent?: (sectionId: string, compId: string, newName: string) => void;
  onBringComponentToFront?: (sectionId: string, compId: string) => void;
  onSendComponentToBack?: (sectionId: string, compId: string) => void;
}

/**
 * PROFESSIONAL LAYER PANEL & LAYER TREE (TASK 16.4.3 LAYER MANAGEMENT ENGINE)
 * Full 2-way Selection Sync • Drag Reorder • Show/Hide • Lock/Unlock • Layer Order Actions • Rename
 */
export const LayerPanel: React.FC<LayerPanelProps> = ({
  sections,
  selectedSectionId,
  selectedComponentId,
  onSelectSection,
  onSelectComponent,
  onMoveSectionUp,
  onMoveSectionDown,
  onDeleteSection,
  onMoveComponentUp,
  onMoveComponentDown,
  onDuplicateComponent,
  onDeleteComponent,
  onToggleComponentVisibility,
  onToggleComponentLock,
  onRenameComponent,
  onBringComponentToFront,
  onSendComponentToBack,
}) => {
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    sections.forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });

  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const toggleExpand = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSectionIds((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getComponentIcon = (type: WidgetType) => {
    switch (type) {
      case 'Text': return Type;
      case 'Image': return ImageIcon;
      case 'Gallery': return Images;
      case 'Countdown': return Clock;
      case 'Timeline': return CalendarDays;
      case 'Map': return MapPin;
      case 'Music': return Music;
      case 'QR': return QrCode;
      case 'Video': return Video;
      case 'Divider': return Minus;
      case 'Spacer': return Maximize2;
      default: return Type;
    }
  };

  const startRenaming = (comp: UnifiedComponentInstance, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCompId(comp.id);
    setEditingName(comp.name || comp.layout?.layer?.name || comp.type);
  };

  const submitRenaming = (sectionId: string, compId: string) => {
    if (editingName.trim() && onRenameComponent) {
      onRenameComponent(sectionId, compId, editingName.trim());
    }
    setEditingCompId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto p-3 space-y-2 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-1 border-b border-slate-800 pb-2">
        <span className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Layer Tree</span>
        </span>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          {sections.length} Sections
        </span>
      </div>

      {/* Layer Tree List */}
      <div className="space-y-1.5 flex-1">
        {sections.map((section, sIdx) => {
          const isSectionSelected = selectedSectionId === section.id && !selectedComponentId;
          const isExpanded = expandedSectionIds[section.id] ?? true;
          const containers = getSectionContainers(section);
          const components = getSectionComponents(section);

          // SORT COMPONENTS BY LAYER ORDER ASCENDING FOR LAYER TREE RENDERING
          const sortedComponents = [...components].sort((a, b) => {
            const orderA = a.layout?.layer?.order ?? 1;
            const orderB = b.layout?.layer?.order ?? 1;
            return orderA - orderB;
          });

          return (
            <div key={section.id} className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all">
              {/* SECTION TREE ROW */}
              <div
                onClick={() => onSelectSection && onSelectSection(section)}
                className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-all ${
                  isSectionSelected
                    ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-amber-500'
                    : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleExpand(section.id, e)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  <FolderTree className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">{section.name || `Section #${sIdx + 1}`}</span>
                  <span className="text-[9px] font-mono text-slate-400">({components.length})</span>
                </div>

                {/* Section Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                  {onMoveSectionUp && sIdx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSectionUp(sIdx);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {onMoveSectionDown && sIdx < sections.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSectionDown(sIdx);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* NESTED CONTAINERS & LAYERS TREE */}
              {isExpanded && (
                <div className="pl-4 pr-1 py-1 space-y-1 bg-slate-950/90 border-t border-slate-800/80">
                  {containers.map((container) => (
                    <div key={container.id} className="space-y-1">
                      {/* Container Header Badge if multiple containers exist */}
                      {containers.length > 1 && (
                        <div className="text-[9px] font-mono text-amber-400/80 px-2 py-0.5 bg-amber-500/5 rounded border border-amber-500/10 uppercase">
                          Container: {container.type}
                        </div>
                      )}

                      {sortedComponents.length === 0 ? (
                        <div className="text-[10px] font-mono text-slate-500 py-1 pl-2">
                          (Trống - Chưa có Layer)
                        </div>
                      ) : (
                        sortedComponents.map((comp, compIdx) => {
                          const isCompSelected = selectedComponentId === comp.id;
                          const Icon = getComponentIcon(comp.type);
                          const zIndexVal = comp.layout?.layer?.order ?? (compIdx + 1);
                          const isHidden = comp.layout?.layer?.hidden ?? false;
                          const isLocked = comp.layout?.layer?.locked ?? false;
                          const layerName = comp.name || comp.layout?.layer?.name || comp.type;

                          return (
                            <div
                              key={comp.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectComponent) onSelectComponent(comp);
                              }}
                              className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                isCompSelected
                                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40 shadow-sm'
                                  : isHidden
                                  ? 'text-slate-600 opacity-60 hover:bg-slate-900/60'
                                  : 'text-slate-300 hover:bg-slate-900'
                              }`}
                            >
                              {/* Left Layer Info */}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0" />
                                <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />

                                {editingCompId === comp.id ? (
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => submitRenaming(section.id, comp.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') submitRenaming(section.id, comp.id);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500 text-amber-300 text-xs font-semibold focus:outline-none w-full"
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={(e) => startRenaming(comp, e)}
                                    className="truncate font-medium text-[11px]"
                                    title="Double click to rename Layer"
                                  >
                                    {layerName}
                                  </span>
                                )}

                                <span className="text-[9px] font-mono text-slate-400 shrink-0">
                                  z:{zIndexVal}
                                </span>
                              </div>

                              {/* Right Layer Actions (Show/Hide, Lock/Unlock, Bring Front, Back, Duplicate, Delete) */}
                              <div className="flex items-center gap-0.5">
                                {/* Visibility Toggle */}
                                {onToggleComponentVisibility && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleComponentVisibility(section.id, comp.id);
                                    }}
                                    className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                                      isHidden ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                                    }`}
                                    title={isHidden ? 'Show Layer' : 'Hide Layer'}
                                  >
                                    {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                )}

                                {/* Lock Toggle */}
                                {onToggleComponentLock && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleComponentLock(section.id, comp.id);
                                    }}
                                    className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                                      isLocked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                                    }`}
                                    title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
                                  >
                                    {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                  </button>
                                )}

                                {/* Bring to Front */}
                                {onBringComponentToFront && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onBringComponentToFront(section.id, comp.id);
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer hidden group-hover:block"
                                    title="Bring to Front (Top Z-Index)"
                                  >
                                    <ChevronsUp className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Move Up / Bring Forward */}
                                {onMoveComponentUp && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMoveComponentUp(section.id, compIdx);
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 cursor-pointer hidden group-hover:block"
                                    title="Bring Forward"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Move Down / Send Backward */}
                                {onMoveComponentDown && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMoveComponentDown(section.id, compIdx);
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 cursor-pointer hidden group-hover:block"
                                    title="Send Backward"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Send to Back */}
                                {onSendComponentToBack && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSendComponentToBack(section.id, comp.id);
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer hidden group-hover:block"
                                    title="Send to Back (Bottom Z-Index)"
                                  >
                                    <ChevronsDown className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Rename */}
                                <button
                                  onClick={(e) => startRenaming(comp, e)}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer hidden group-hover:block"
                                  title="Rename Layer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {/* Duplicate */}
                                {onDuplicateComponent && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateComponent(section.id, comp);
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer hidden group-hover:block"
                                    title="Duplicate Layer"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Delete */}
                                {onDeleteComponent && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteComponent(section.id, comp.id);
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                                    title="Delete Layer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
