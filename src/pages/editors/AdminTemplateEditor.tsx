import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Undo2, 
  Redo2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Sliders
} from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';
import { useHistoryEngine } from '../../hooks/useHistoryEngine';
import { useEditorStore } from '../../stores/EditorStore';
import { CanvasRenderer } from '../../renderer/CanvasRenderer';
import { PropertyPanel } from '../../components/editor/PropertyPanel';
import { CineloveToolboxSidebar } from '../../components/editor/CineloveToolboxSidebar';
import { type TemplateLayoutSchema, type TemplateSection, type SectionType, getPageSections, getSectionContainers, getSectionComponents } from '../../schema/TemplateSchema';
import { createComponentInstance } from '../../registry/ComponentRegistry';
import type { WidgetType, UnifiedComponentInstance } from '../../registry/ComponentRegistry';
import { InvitationRuntimeProvider } from '../../context/InvitationRuntimeContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { ThemeRepository } from '../../repositories/ThemeRepository';
import { DragProvider, type DropResult } from '../../context/DragContext';
import { DEFAULT_PREVIEW_INVITATION_DATA } from '../../types/invitationRuntime';
import { toast } from 'sonner';

export type DeviceMode = 'mobile' | 'tablet' | 'desktop';

export const AdminTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, refetchTemplates } = useTemplates();
  const template = templates.find((t) => t.id === id);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('sec-hero-1');

  // Device Viewport Mode (Default: 'mobile' 375px)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Responsive Sidebar & Property Panel Collapsible States
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState<boolean>(true);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState<boolean>(true);

  // Default initial layout with Sections (Default minHeight = 800px)
  const defaultInitialLayout: TemplateLayoutSchema = {
    id: template?.id || id || 'tpl-draft',
    name: template?.name || 'New Template Draft',
    version: '1.0.0',
    pages: [
      {
        id: 'page-1',
        name: 'Trang 1',
        sections: [
          {
            id: 'sec-hero-1',
            name: 'Section #1',
            type: 'Hero',
            style: {
              padding: 24,
              backgroundColor: '#ffffff',
              containerWidth: '100%',
              minHeight: '800px',
            },
            containers: [
              {
                id: 'cnt-sec-hero-1',
                type: 'vertical',
                components: [
                  {
                    id: 'comp-text-1',
                    name: 'Groom Name Text',
                    type: 'Text',
                    props: { text: 'Welcome to Wedding Invitation', binding: 'groom_name' },
                    style: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
                    layout: {
                      position: { x: 0, y: 0, width: '100%', height: 'auto', anchor: 'top-left' },
                      layer: { order: 1, locked: false, hidden: false, name: 'Groom Name Text' },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const initialLayout = template?.layout_json?.pages?.length 
    ? (template.layout_json as TemplateLayoutSchema)
    : defaultInitialLayout;

  // Integrated History Engine
  const {
    layoutJson,
    selectedComponentId,
    recordChange,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryEngine(initialLayout, 'comp-text-1');

  // Integrated Editor Store & Repository Layer
  const {
    templateName,
    isSaving,
    loadTemplateFromRepo,
    saveTemplateToRepo,
    getSaveStatus,
  } = useEditorStore(id || 'tpl-draft', initialLayout);

  // Initial Load from Repository & Sync History State
  useEffect(() => {
    let isMounted = true;
    loadTemplateFromRepo().then((loadedLayout) => {
      if (isMounted && loadedLayout) {
        const sections = getPageSections(loadedLayout.pages?.[0]);
        const firstSecId = sections[0]?.id || null;
        const firstComps = getSectionComponents(sections[0]);
        const firstCompId = firstComps[0]?.id || null;
        setSelectedSectionId(firstSecId);
        resetHistory(loadedLayout, firstCompId);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [loadTemplateFromRepo, resetHistory]);

  // Save Status
  const saveStatus = getSaveStatus(layoutJson);

  // Get active page sections and components
  const pageSections = getPageSections(layoutJson.pages?.[0]);
  const activeSectionIndex = pageSections.findIndex((s) => s.id === selectedSectionId);
  const activeSection = pageSections[activeSectionIndex >= 0 ? activeSectionIndex : 0] || pageSections[0] || null;
  const allComponents = pageSections.flatMap((s) => getSectionComponents(s));
  const selectedComp = allComponents.find((c) => c.id === selectedComponentId) || null;

  // Theme Persistence Change Handler
  const handleThemeChange = (updatedThemeSchema: unknown) => {
    const updatedLayout = ThemeRepository.saveTheme(layoutJson, updatedThemeSchema as Parameters<typeof ThemeRepository.saveTheme>[1]);
    recordChange(updatedLayout, selectedComponentId);
  };

  // UNIFIED DRAG COMPLETION CALLBACK
  const handleUnifiedDrop = (result: DropResult) => {
    if (result.type === 'component') {
      const { compId, sourceSectionId, targetSectionId, targetIndex } = result;

      const sourceSec = pageSections.find((s) => s.id === sourceSectionId);
      const targetSec = pageSections.find((s) => s.id === targetSectionId);
      if (!sourceSec || !targetSec) return;

      const sourceComps = getSectionComponents(sourceSec);
      const compToMove = sourceComps.find((c) => c.id === compId);
      if (!compToMove) return;

      const newSections = pageSections.map((s) => {
        const sContainers = getSectionContainers(s);
        const firstContainer = sContainers[0] || { id: `cnt-${s.id}`, type: 'vertical', components: [] };

        if (s.id === sourceSectionId) {
          const filtered = firstContainer.components.filter((c) => c.id !== compId);
          if (s.id === targetSectionId) {
            const list = [...filtered];
            const clampedIdx = Math.min(targetIndex, list.length);
            list.splice(clampedIdx, 0, compToMove);
            return {
              ...s,
              containers: [{ ...firstContainer, components: list }],
            };
          }
          return {
            ...s,
            containers: [{ ...firstContainer, components: filtered }],
          };
        }
        if (s.id === targetSectionId) {
          const list = [...firstContainer.components];
          const clampedIdx = Math.min(targetIndex, list.length);
          list.splice(clampedIdx, 0, compToMove);
          return {
            ...s,
            containers: [{ ...firstContainer, components: list }],
          };
        }
        return s;
      });

      const newLayout: TemplateLayoutSchema = {
        ...layoutJson,
        pages: [{ ...layoutJson.pages[0], sections: newSections }],
      };

      setSelectedSectionId(targetSectionId);
      recordChange(newLayout, compId);

      if (sourceSectionId === targetSectionId) {
        toast.success(`Di chuyển Component trong ${sourceSec.name}`);
      } else {
        toast.success(`Di chuyển Component: ${sourceSec.name} ➔ ${targetSec.name}`);
      }
    } else if (result.type === 'section') {
      const { sectionId, targetIndex } = result;
      const sIdx = pageSections.findIndex((s) => s.id === sectionId);
      if (sIdx < 0) return;

      const sectionToMove = pageSections[sIdx];
      const newSections = [...pageSections];
      newSections.splice(sIdx, 1);

      const clampedIndex = Math.min(targetIndex, newSections.length);
      newSections.splice(clampedIndex, 0, sectionToMove);

      const newLayout: TemplateLayoutSchema = {
        ...layoutJson,
        pages: [{ ...layoutJson.pages[0], sections: newSections }],
      };

      setSelectedSectionId(sectionId);
      recordChange(newLayout, null);
      toast.success(`Move Section: ${sectionToMove.name} ➔ Vị trí #${clampedIndex + 1}`);
    }
  };

  // 1. ADD NEW SECTION
  const handleAddSection = (type: SectionType = 'Custom') => {
    const secId = `sec-${type.toLowerCase()}-${Date.now()}`;
    const nextIndex = pageSections.length + 1;
    const newSection: TemplateSection = {
      id: secId,
      name: `Section #${nextIndex}`,
      type,
      style: {
        padding: 24,
        backgroundColor: '#ffffff',
        containerWidth: '100%',
        minHeight: '800px',
      },
      containers: [
        {
          id: `cnt-${secId}`,
          type: 'vertical',
          components: [],
        },
      ],
    };

    const newSections = [...pageSections, newSection];
    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [
        {
          id: layoutJson.pages?.[0]?.id || 'page-1',
          name: layoutJson.pages?.[0]?.name || 'Trang 1',
          sections: newSections,
        },
      ],
    };

    setSelectedSectionId(secId);
    recordChange(newLayout, null);
    toast.success(`Đã thêm Section #${nextIndex}`);
  };

  // 2. DUPLICATE SECTION
  const handleDuplicateSection = (section: TemplateSection) => {
    const dupSecId = `sec-${section.type.toLowerCase()}-${Date.now()}`;
    const containers = getSectionContainers(section);

    const duplicatedSection: TemplateSection = {
      ...section,
      id: dupSecId,
      name: `${section.name} (Bản sao)`,
      containers: JSON.parse(JSON.stringify(containers)),
      style: JSON.parse(JSON.stringify(section.style)),
    };

    const sIdx = pageSections.findIndex((s) => s.id === section.id);
    const newSections = [...pageSections];
    if (sIdx >= 0) {
      newSections.splice(sIdx + 1, 0, duplicatedSection);
    } else {
      newSections.push(duplicatedSection);
    }

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    setSelectedSectionId(dupSecId);
    recordChange(newLayout, null);
    toast.success(`Đã nhân bản ${section.name}`);
  };

  // 3. SELECT SECTION
  const handleSelectSection = (section: TemplateSection) => {
    setSelectedSectionId(section.id);
    recordChange(layoutJson, null);
  };

  // 4. UPDATE SECTION
  const handleUpdateSection = (updatedSection: TemplateSection) => {
    const newSections = pageSections.map((s) => (s.id === updatedSection.id ? updatedSection : s));
    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [
        {
          ...layoutJson.pages[0],
          sections: newSections,
        },
      ],
    };

    recordChange(newLayout, null);
  };

  // 5. RESIZE SECTION HEIGHT
  const handleResizeSectionHeight = (sectionId: string, newMinHeight: number) => {
    const newSections = pageSections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          style: {
            ...s.style,
            minHeight: `${newMinHeight}px`,
          },
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, selectedComponentId);
  };

  // 6. DELETE SECTION
  const handleDeleteSection = (sectionId: string) => {
    if (pageSections.length <= 1) {
      toast.error('Template phải có ít nhất 1 Section!');
      return;
    }

    const newSections = pageSections.filter((s) => s.id !== sectionId);
    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [
        {
          ...layoutJson.pages[0],
          sections: newSections,
        },
      ],
    };

    const nextSecId = newSections[0]?.id || null;
    setSelectedSectionId(nextSecId);
    recordChange(newLayout, null);
    toast.success('Đã xóa Section');
  };

  // 7. MOVE SECTION UP / DOWN
  const handleMoveSectionUp = (sIdx: number) => {
    if (sIdx <= 0) return;
    const newSections = [...pageSections];
    const temp = newSections[sIdx];
    newSections[sIdx] = newSections[sIdx - 1];
    newSections[sIdx - 1] = temp;

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, selectedComponentId);
  };

  const handleMoveSectionDown = (sIdx: number) => {
    if (sIdx >= pageSections.length - 1) return;
    const newSections = [...pageSections];
    const temp = newSections[sIdx];
    newSections[sIdx] = newSections[sIdx + 1];
    newSections[sIdx + 1] = temp;

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, selectedComponentId);
  };

  // 8. ADD COMPONENT TO TARGET SECTION CONTAINER
  const handleAddComponentToSection = (type: WidgetType) => {
    const targetSection = activeSection || pageSections[0];
    if (!targetSection) {
      toast.error('Vui lòng tạo Section trước khi thêm Component');
      return;
    }

    const currentComps = getSectionComponents(targetSection);
    const maxOrder = currentComps.reduce((max, c) => Math.max(max, c.layout?.layer?.order || 1), 0);
    const newComp = createComponentInstance(type, maxOrder + 1);

    const newSections = pageSections.map((s) => {
      if (s.id === targetSection.id) {
        const sContainers = getSectionContainers(s);
        const firstContainer = sContainers[0] || { id: `cnt-${s.id}`, type: 'vertical', components: [] };
        return {
          ...s,
          containers: [
            {
              ...firstContainer,
              components: [...firstContainer.components, newComp],
            },
          ],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, newComp.id);
    toast.success(`Đã thêm ${type} vào Section #${(activeSectionIndex >= 0 ? activeSectionIndex : 0) + 1}`);
  };

  // 9. DELETE COMPONENT FROM SECTION CONTAINER
  const handleDeleteComponentFromSection = (compId: string) => {
    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0];
      if (!firstContainer) return s;

      const hasComp = firstContainer.components.some((c) => c.id === compId);
      if (hasComp) {
        return {
          ...s,
          containers: [
            {
              ...firstContainer,
              components: firstContainer.components.filter((c) => c.id !== compId),
            },
          ],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    const nextSelectedId = selectedComponentId === compId ? null : selectedComponentId;
    recordChange(newLayout, nextSelectedId);
    toast.success('Đã xóa Layer');
  };

  // 10. DUPLICATE COMPONENT IN SECTION CONTAINER
  const handleDuplicateComponentInSection = (comp: UnifiedComponentInstance) => {
    const duplicateId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const currentOrder = comp.layout?.layer?.order ?? 1;

    const duplicatedComp: UnifiedComponentInstance = {
      ...comp,
      id: duplicateId,
      name: `${comp.name || comp.type} (Copy)`,
      props: JSON.parse(JSON.stringify(comp.props)),
      style: JSON.parse(JSON.stringify(comp.style)),
      layout: {
        ...comp.layout,
        layer: {
          ...comp.layout?.layer,
          order: currentOrder + 1,
          name: `${comp.name || comp.type} (Copy)`,
        },
      },
    };

    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0] || { id: `cnt-${s.id}`, type: 'vertical', components: [] };
      const idx = firstContainer.components.findIndex((c) => c.id === comp.id);

      if (idx >= 0) {
        const newList = [...firstContainer.components];
        newList.splice(idx + 1, 0, duplicatedComp);
        return {
          ...s,
          containers: [{ ...firstContainer, components: newList }],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, duplicateId);
    toast.success(`Đã nhân bản Layer "${comp.name || comp.type}"`);
  };

  // 11. LAYER ORDER MANAGEMENT (BRING TO FRONT, SEND TO BACK, MOVE UP, MOVE DOWN, LOCK)
  const handleBringComponentToFront = (compId?: string) => {
    const targetCompId = compId || selectedComponentId;
    if (!targetCompId) return;

    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0];
      if (!firstContainer) return s;

      const hasComp = firstContainer.components.some((c) => c.id === targetCompId);
      if (hasComp) {
        const maxOrder = firstContainer.components.reduce((max, c) => Math.max(max, c.layout?.layer?.order || 1), 0);
        const updatedComps = firstContainer.components.map((c) => {
          if (c.id === targetCompId) {
            return {
              ...c,
              layout: {
                ...c.layout,
                layer: {
                  ...c.layout?.layer,
                  order: maxOrder + 1,
                },
              },
            };
          }
          return c;
        });

        return {
          ...s,
          containers: [{ ...firstContainer, components: updatedComps }],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, targetCompId);
    toast.success('Bring to Front (Lên trên cùng)');
  };

  const handleSendComponentToBack = (compId?: string) => {
    const targetCompId = compId || selectedComponentId;
    if (!targetCompId) return;

    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0];
      if (!firstContainer) return s;

      const hasComp = firstContainer.components.some((c) => c.id === targetCompId);
      if (hasComp) {
        const updatedComps = firstContainer.components.map((c) => {
          if (c.id === targetCompId) {
            return {
              ...c,
              layout: {
                ...c.layout,
                layer: {
                  ...c.layout?.layer,
                  order: 1,
                },
              },
            };
          }
          return {
            ...c,
            layout: {
              ...c.layout,
              layer: {
                ...c.layout?.layer,
                order: (c.layout?.layer?.order ?? 1) + 1,
              },
            },
          };
        });

        return {
          ...s,
          containers: [{ ...firstContainer, components: updatedComps }],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, targetCompId);
    toast.success('Send to Back (Xuống dưới cùng)');
  };

  const handleMoveComponentUp = (compId?: string) => {
    const targetCompId = compId || selectedComponentId;
    if (!targetCompId) return;

    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0];
      if (!firstContainer) return s;

      const cIdx = firstContainer.components.findIndex((c) => c.id === targetCompId);
      if (cIdx > 0) {
        const newList = [...firstContainer.components];
        const temp = newList[cIdx];
        newList[cIdx] = newList[cIdx - 1];
        newList[cIdx - 1] = temp;

        return {
          ...s,
          containers: [{ ...firstContainer, components: newList }],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, targetCompId);
  };

  const handleMoveComponentDown = (compId?: string) => {
    const targetCompId = compId || selectedComponentId;
    if (!targetCompId) return;

    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0];
      if (!firstContainer) return s;

      const cIdx = firstContainer.components.findIndex((c) => c.id === targetCompId);
      if (cIdx >= 0 && cIdx < firstContainer.components.length - 1) {
        const newList = [...firstContainer.components];
        const temp = newList[cIdx];
        newList[cIdx] = newList[cIdx + 1];
        newList[cIdx + 1] = temp;

        return {
          ...s,
          containers: [{ ...firstContainer, components: newList }],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, targetCompId);
  };

  const handleToggleComponentLock = (compId: string) => {
    const newSections = pageSections.map((s) => {
      const sContainers = getSectionContainers(s);
      const firstContainer = sContainers[0];
      if (!firstContainer) return s;

      const hasComp = firstContainer.components.some((c) => c.id === compId);
      if (hasComp) {
        const updatedComps = firstContainer.components.map((c) => {
          if (c.id === compId) {
            const currentLocked = c.layout?.layer?.locked ?? false;
            return {
              ...c,
              layout: {
                ...c.layout,
                layer: {
                  order: c.layout?.layer?.order ?? 1,
                  ...c.layout?.layer,
                  locked: !currentLocked,
                },
              },
            };
          }
          return c;
        });

        return {
          ...s,
          containers: [{ ...firstContainer, components: updatedComps }],
        };
      }
      return s;
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, compId);
    toast.success('Đã cập nhật trạng thái Khóa/Mở Khóa Layer');
  };

  // Select component handler
  const handleSelectComponent = (comp: UnifiedComponentInstance) => {
    const parentSec = pageSections.find((s) => getSectionComponents(s).some((c) => c.id === comp.id));
    if (parentSec) {
      setSelectedSectionId(parentSec.id);
    }
    recordChange(layoutJson, comp.id);
  };

  const handleUpdateComponent = (updatedComp: UnifiedComponentInstance) => {
    const newSections = pageSections.map((section) => {
      const containers = getSectionContainers(section);
      return {
        ...section,
        containers: containers.map((container) => ({
          ...container,
          components: container.components.map((component) => (component.id === updatedComp.id ? updatedComp : component)),
        })),
      };
    });

    const newLayout: TemplateLayoutSchema = {
      ...layoutJson,
      pages: [{ ...layoutJson.pages[0], sections: newSections }],
    };

    recordChange(newLayout, updatedComp.id);
  };

  // Save template handler
  const handleSaveTemplate = async () => {
    const success = await saveTemplateToRepo(layoutJson);
    if (success) {
      refetchTemplates();
    }
  };

  return (
    <ThemeProvider initialLayout={layoutJson} onThemeChange={handleThemeChange}>
      <DragProvider onDropComplete={handleUnifiedDrop}>
        <InvitationRuntimeProvider data={DEFAULT_PREVIEW_INVITATION_DATA}>
          <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
            {/* 1. CINELOVE STYLE TOP TOOLBAR (HEIGHT 54PX) */}
            <header className="h-[54px] bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30 font-sans">
              {/* Left Logo / Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/templates')}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Back to Templates Manager"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-amber-400 tracking-wide">PUDWEDDING BUILDER</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {templateName || 'Template Draft'}
                  </span>

                  {saveStatus === 'unsaved-changes' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>Unsaved</span>
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>✓ Saved</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Center Controls: Undo/Redo | Device Mode | Zoom Controls */}
              <div className="flex items-center gap-3">
                {/* Undo / Redo */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    disabled={!canUndo}
                    onClick={undo}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-200 transition-all cursor-pointer"
                    title="Undo (Ctrl + Z)"
                  >
                    <Undo2 className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    disabled={!canRedo}
                    onClick={redo}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-200 transition-all cursor-pointer"
                    title="Redo (Ctrl + Y)"
                  >
                    <Redo2 className="w-4 h-4 text-amber-400" />
                  </button>
                </div>

                {/* Device Viewport Mode Switcher */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deviceMode === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>

                  <button
                    onClick={() => setDeviceMode('tablet')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deviceMode === 'tablet' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet</span>
                  </button>

                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deviceMode === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                    className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 font-bold text-amber-400">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                    className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Preview</span>
                </button>

                <button
                  disabled={isSaving}
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>

                <button
                  onClick={() => toast.success('Published Template')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              </div>
            </header>

            {/* 2. MAIN WORKSPACE: CINELOVE LEFT SIDEBAR | CANVAS | ACCORDION PROPERTY PANEL */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* LEFT SIDEBAR (TOOLBOX 280px) */}
              <div className="relative shrink-0 flex h-full z-20">
                {isLeftSidebarExpanded && (
                  <CineloveToolboxSidebar
                    activeSectionIndex={activeSectionIndex >= 0 ? activeSectionIndex : 0}
                    onAddComponent={handleAddComponentToSection}
                    onAddPresetBlock={(presetName) => handleAddSection(presetName as SectionType)}
                  />
                )}

                <button
                  onClick={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-5 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-r-lg flex items-center justify-center text-slate-300 shadow-xl cursor-pointer transition-colors"
                  title={isLeftSidebarExpanded ? 'Collapse Toolbox' : 'Expand Toolbox'}
                >
                  {isLeftSidebarExpanded ? <ChevronLeft className="w-3.5 h-3.5 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>

              {/* CENTER COLUMN: CANVAS WORKSPACE */}
              <main className="flex-1 bg-slate-950 flex flex-col items-center justify-start p-6 overflow-auto relative transition-all">
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className={`bg-slate-100 transition-all duration-300 flex flex-col overflow-visible relative ${
                    deviceMode === 'mobile'
                      ? 'w-[375px] min-h-[667px] shadow-2xl rounded-2xl border-4 border-slate-800 my-4 shrink-0'
                      : deviceMode === 'tablet'
                      ? 'w-[768px] min-h-[900px] shadow-2xl rounded-2xl border-4 border-slate-800 my-4 shrink-0'
                      : 'w-full max-w-5xl min-h-screen shadow-xl rounded-xl border border-slate-800 my-2'
                  }`}
                >
                  <CanvasRenderer
                    layoutJson={layoutJson}
                    selectedSectionId={selectedSectionId}
                    selectedComponentId={selectedComponentId}
                    renderMode="editor"
                    onSelectSection={handleSelectSection}
                    onSelectComponent={handleSelectComponent}
                    onAddSection={handleAddSection}
                    onResizeSectionHeight={handleResizeSectionHeight}
                    onChangeComponent={handleUpdateComponent}
                    onDuplicateComponent={handleDuplicateComponentInSection}
                    onDeleteComponent={handleDeleteComponentFromSection}
                    onBringComponentToFront={handleBringComponentToFront}
                    onSendComponentToBack={handleSendComponentToBack}
                    onMoveComponentUp={handleMoveComponentUp}
                    onMoveComponentDown={handleMoveComponentDown}
                    onToggleComponentLock={handleToggleComponentLock}
                  />
                </div>
              </main>

              {/* RIGHT COLUMN: CINELOVE ACCORDION PROPERTY PANEL (350px) WITH MOBILE FLOATING ICON */}
              <div className="relative shrink-0 flex h-full z-20">
                <button
                  onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-40 w-5 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-l-lg flex items-center justify-center text-slate-300 shadow-xl cursor-pointer transition-colors"
                  title={isPropertyPanelOpen ? 'Collapse Property Panel' : 'Expand Property Panel'}
                >
                  {isPropertyPanelOpen ? <ChevronRight className="w-3.5 h-3.5 text-amber-400" /> : <Sliders className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                {isPropertyPanelOpen && (
                  <PropertyPanel
                    selectedSection={selectedComp ? null : activeSection}
                    selectedSectionIndex={activeSectionIndex >= 0 ? activeSectionIndex : 0}
                    selectedComponent={selectedComp}
                    onChangeSection={handleUpdateSection}
                    onDuplicateSection={handleDuplicateSection}
                    onDeleteSection={handleDeleteSection}
                    onMoveSectionUp={handleMoveSectionUp}
                    onMoveSectionDown={handleMoveSectionDown}
                    onChangeComponent={handleUpdateComponent}
                    onDuplicateComponent={(comp) => handleDuplicateComponentInSection(comp)}
                    onDeleteComponent={(compId) => handleDeleteComponentFromSection(compId)}
                    onMoveComponentUp={() => handleMoveComponentUp()}
                    onMoveComponentDown={() => handleMoveComponentDown()}
                    onBringComponentToFront={() => handleBringComponentToFront()}
                    onSendComponentToBack={() => handleSendComponentToBack()}
                  />
                )}
              </div>
            </div>

            {/* PREVIEW MODE FULLSCREEN LANDING PAGE RENDERER */}
            {isPreviewOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans overflow-hidden">
                <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Live Landing Page Preview</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                        Published View (RenderMode.Preview)
                      </span>
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Exit Preview</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-950 flex justify-center p-6">
                  <div className="bg-white w-[375px] min-h-[667px] rounded-2xl border-4 border-slate-800 shadow-2xl">
                    <CanvasRenderer
                      layoutJson={layoutJson}
                      selectedSectionId={null}
                      selectedComponentId={null}
                      renderMode="preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </InvitationRuntimeProvider>
      </DragProvider>
    </ThemeProvider>
  );
};
