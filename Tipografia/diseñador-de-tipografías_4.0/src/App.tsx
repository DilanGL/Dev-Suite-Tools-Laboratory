/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Layers, 
  ChevronRight, 
  BookOpen, 
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Type,
  FileCheck
} from 'lucide-react';

import { FontProject, Glyph, ToolType, SnapConfig, Shape } from './types';
import { createDefaultProject, DEFAULT_CHAR_LIST } from './utils/defaults';
import { getShapesCenter, scaleShape, rotateShape, mirrorShape } from './utils/geometry';

import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import CanvasEditor from './components/CanvasEditor';
import PreviewPanel from './components/PreviewPanel';
import ExportPanel from './components/ExportPanel';
import ConfirmModal from './components/ConfirmModal';

export default function App() {
  // 1. Initial State Load (from local storage or boot defaults)
  const [project, setProject] = useState<FontProject>(() => {
    const saved = localStorage.getItem('custom_typography_designer_project_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FontProject;
        if (parsed && parsed.glyphs) {
          // Sync default char list to make sure Ñ and accented vowels are present
          let modified = false;
          DEFAULT_CHAR_LIST.forEach(char => {
            if (!parsed.glyphs[char]) {
              parsed.glyphs[char] = {
                char,
                unicode: char.charCodeAt(0),
                advanceWidth: char === 'I' || char === 'i' || char === 'l' || char === '!' || char === '.' ? 400 : 
                              char === 'M' || char === 'W' || char === 'm' || char === 'w' ? 850 : 650,
                shapes: []
              };
              modified = true;
            }
          });
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved typography project:', e);
      }
    }
    return createDefaultProject();
  });

  // Undo/Redo tracking history
  const [history, setHistory] = useState<FontProject[]>([project]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Workspace settings
  const [activeChar, setActiveChar] = useState<string>('A');
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Canvas viewport mapping
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<React.ComponentState>({ x: 0, y: 0 });

  // Preview collapse state
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState<boolean>(false);

  // Background template project state
  const [backgroundProject, setBackgroundProject] = useState<FontProject | null>(null);

  // Polygon sides configurator
  const [polygonSides, setPolygonSides] = useState<number>(5);

  // Auxiliary configuration options
  const [snapConfig, setSnapConfig] = useState<SnapConfig>({
    grid: true,
    nodes: true,
    guidelines: true,
    gridSize: 50 // em grid units
  });
  const [autoCorrect, setAutoCorrect] = useState<boolean>(true);
  const [stencilFont, setStencilFont] = useState<'sans-serif' | 'serif'>('sans-serif');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState<boolean>(false);

  // Track project transformations and save automatically
  useEffect(() => {
    localStorage.setItem('custom_typography_designer_project_data', JSON.stringify(project));
  }, [project]);

  // Command Helper: Pushes newly mapped project configurations to history
  const commitProjectState = (updatedProject: FontProject) => {
    const freshHistory = history.slice(0, historyIndex + 1);
    setProject(updatedProject);
    setHistory([...freshHistory, updatedProject]);
    setHistoryIndex(freshHistory.length);
  };

  // Handles updating Glyph vectors for active project
  const handleGlyphChange = (updatedGlyph: Glyph) => {
    const updatedGlyphs = {
      ...project.glyphs,
      [activeChar]: updatedGlyph
    };

    commitProjectState({
      ...project,
      glyphs: updatedGlyphs,
      updatedAt: Date.now()
    });
  };

  const activeGlyph = project.glyphs[activeChar] || {
    char: activeChar,
    unicode: activeChar.charCodeAt(0),
    shapes: [],
    advanceWidth: 600
  };

  // Persistent clipboard state for copying/pasting vector shapes between glyphs
  const [glyphClipboard, setGlyphClipboard] = useState<Shape[] | null>(() => {
    const saved = localStorage.getItem('glyph_craft_clipboard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse clipboard:', e);
      }
    }
    return null;
  });

  const [clipboardSourceChar, setClipboardSourceChar] = useState<string | null>(() => {
    return localStorage.getItem('glyph_craft_clipboard_source');
  });

  const handleCopySelectedShape = () => {
    if (selectedShapeIds.length === 0) return;
    const shapesToCopy = activeGlyph.shapes.filter(s => selectedShapeIds.includes(s.id));
    if (shapesToCopy.length > 0) {
      const cloned = JSON.parse(JSON.stringify(shapesToCopy)) as Shape[];
      setGlyphClipboard(cloned);
      setClipboardSourceChar(activeChar);
      localStorage.setItem('glyph_craft_clipboard', JSON.stringify(cloned));
      localStorage.setItem('glyph_craft_clipboard_source', activeChar);
    }
  };

  const handlePasteShape = () => {
    if (!glyphClipboard || glyphClipboard.length === 0) return;

    // Smart alignment: if pasting on a DIFFERENT character, preserve exact design coordinates (offset = 0).
    // If pasting within the SAME character, apply a minor offset so the copy is visibly distinct.
    const isDifferentChar = clipboardSourceChar !== activeChar;
    const offset = isDifferentChar ? 0 : 35;

    const pastedShapes = glyphClipboard.map(s => {
      const newShapeId = 'shape_' + Math.random().toString(36).substr(2, 9);
      return {
        ...s,
        id: newShapeId,
        name: isDifferentChar ? s.name : `${s.name} (Pegado)`,
        nodes: s.nodes.map(n => ({
          ...n,
          id: 'node_' + Math.random().toString(36).substr(2, 9),
          x: n.x + offset,
          y: n.y - offset
        }))
      };
    });

    const updatedGlyph = {
      ...activeGlyph,
      shapes: [...activeGlyph.shapes, ...pastedShapes]
    };

    handleGlyphChange(updatedGlyph);
    // Set the newly pasted shapes as active selection for immediate vector modification
    setSelectedShapeIds(pastedShapes.map(s => s.id));
    setSelectedNodeId(null);
  };

  // Safe undo handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setProject(history[prevIndex]);
      setSelectedShapeIds([]);
      setSelectedNodeId(null);
    }
  };

  // Safe redo handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setProject(history[nextIndex]);
      setSelectedShapeIds([]);
      setSelectedNodeId(null);
    }
  };

  // Keyboard events coordinate shortcuts mapping (such as Ctrl+Z or V/A swappers)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      // Ignore shortcuts if the developer is typing inside textboxes/sliders
      if (activeTag === 'input' || activeTag === 'textarea') return;

      // Ctrl+Z & Ctrl+Y (or Command equivalent)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Ctrl+C (Copy Selection)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopySelectedShape();
      }

      // Ctrl+V (Paste Selection)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteShape();
      }

      // Tool shortcut hotkeys
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setActiveTool('select');
      }
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTool('node');
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setActiveTool('bezier');
      }
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setActiveTool('freehand');
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setActiveTool('rectangle');
      }
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setActiveTool('circle');
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [history, historyIndex, selectedShapeIds, activeGlyph, glyphClipboard, clipboardSourceChar, activeChar]);

  // Swapping active char resets selections
  const handleSelectChar = (char: string) => {
    setActiveChar(char);
    setSelectedShapeIds([]);
    setSelectedNodeId(null);
  };

  const handleSelectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  // Duplicating selected shape on canvas
  const handleDuplicateSelectedShape = () => {
    if (selectedShapeIds.length === 0) return;

    const shapesToClone = activeGlyph.shapes.filter(s => selectedShapeIds.includes(s.id));
    const clonedShapes = shapesToClone.map(s => {
      // Deep clone shape nodes with random ID shift
      return {
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        name: `${s.name} Copiar`,
        nodes: s.nodes.map(n => ({
          ...n,
          id: Math.random().toString(36).substr(2, 9),
          x: n.x + 40, // offset copy
          y: n.y - 40 // offset copy
        }))
      };
    });

    const updatedGlyph = {
      ...activeGlyph,
      shapes: [...activeGlyph.shapes, ...clonedShapes]
    };

    handleGlyphChange(updatedGlyph);
    setSelectedShapeIds(clonedShapes.map(s => s.id)); // select copy
    setSelectedNodeId(null);
  };

  // Deleting shape
  const handleDeleteSelectedShape = () => {
    if (selectedShapeIds.length === 0) return;

    const remainingShapes = activeGlyph.shapes.filter(s => !selectedShapeIds.includes(s.id));
    handleGlyphChange({
      ...activeGlyph,
      shapes: remainingShapes
    });
    setSelectedShapeIds([]);
    setSelectedNodeId(null);
  };

  // Reverse shape contour winding order (to toggle hollow MASKS / holes, e.g. O core cutout)
  const handleToggleWinding = () => {
    if (selectedShapeIds.length === 0) return;

    const updatedShapes = activeGlyph.shapes.map(s => {
      if (selectedShapeIds.includes(s.id)) {
        return {
          ...s,
          reverseWinding: !s.reverseWinding
        };
      }
      return s;
    });

    handleGlyphChange({
      ...activeGlyph,
      shapes: updatedShapes
    });
  };

  // Creating full reset options
  const handleNewProject = () => {
    setIsConfirmResetOpen(true);
  };

  const handleConfirmNewProject = () => {
    const defaultProj = createDefaultProject();
    setProject(defaultProj);
    setHistory([defaultProj]);
    setHistoryIndex(0);
    setActiveChar('A');
    setSelectedShapeIds([]);
    setSelectedNodeId(null);
    setPan({ x: 0, y: 0 });
    setZoom(1.2);
    setIsConfirmResetOpen(false); // Close the Warning reset prompt
  };

  // Rotating selected shapes
  const handleRotateSelectedShapes = (degrees: number = 45) => {
    if (selectedShapeIds.length === 0) return;
    const angleRad = (degrees * Math.PI) / 180;
    
    // Find common center of selected shapes
    const selectedShapes = activeGlyph.shapes.filter(s => selectedShapeIds.includes(s.id));
    if (selectedShapes.length === 0) return;
    const center = getShapesCenter(selectedShapes);
    
    const updatedShapes = activeGlyph.shapes.map(s => {
      if (selectedShapeIds.includes(s.id)) {
        return rotateShape(s, angleRad, center);
      }
      return s;
    });
    
    handleGlyphChange({
      ...activeGlyph,
      shapes: updatedShapes
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] font-sans text-gray-300 overflow-hidden select-none">
      {/* High Density Header / Menu Bar */}
      <header className="h-10 border-b border-[#333] flex items-center justify-between px-4 bg-[#1a1a1a] select-none shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-black font-bold text-xs">G</div>
            <span className="text-xs font-bold tracking-widest text-white">GLYPHCRAFT PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>AUTO-SAVED</span>
          </div>
          <div className="text-[10px] font-mono bg-[#252525] px-2 py-0.5 rounded border border-[#444] text-white">
            {Math.round(zoom * 100)}%
          </div>
          <button
            id="open-export-header-btn"
            onClick={() => setIsExportOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider transition-colors cursor-pointer"
          >
            Exportar Fuente
          </button>
        </div>
      </header>

      {/* Main Vector workspace panel split */}
      <div className="flex-grow flex flex-row overflow-hidden w-full relative min-h-0 bg-[#121212]">
        
        {/* Core Sidebar configurations */}
        <Sidebar
          project={project}
          activeChar={activeChar}
          onSelectChar={handleSelectChar}
          selectedShapeIds={selectedShapeIds}
          onSelectShapes={setSelectedShapeIds}
          onChangeProject={commitProjectState}
          stencilFont={stencilFont}
          onChangeStencilFont={setStencilFont}
          backgroundProject={backgroundProject}
          onChangeBackgroundProject={setBackgroundProject}
        />

        {/* Workspace board splits */}
        <div className="flex-grow flex flex-col h-full min-w-0">
          
          {/* Top drawing action Toolbar */}
          <Toolbar
            activeTool={activeTool}
            onChangeTool={setActiveTool}
            onNewProject={handleNewProject}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            zoom={zoom}
            onZoomIn={() => setZoom(z => Math.min(2.5, z + 0.15))}
            onZoomOut={() => setZoom(z => Math.max(0.3, z - 0.15))}
            onResetZoom={() => { setZoom(1.2); setPan({ x: 0, y: 0 }); }}
            autoCorrect={autoCorrect}
            onChangeAutoCorrect={setAutoCorrect}
            snapConfig={snapConfig}
            onChangeSnapConfig={setSnapConfig}
            onDuplicateSelectedShape={handleDuplicateSelectedShape}
            onDeleteSelectedShape={handleDeleteSelectedShape}
            onToggleWinding={handleToggleWinding}
            hasSelectedShapes={selectedShapeIds.length > 0}
            onCopySelectedShape={handleCopySelectedShape}
            onPasteShape={handlePasteShape}
            canPaste={!!glyphClipboard && glyphClipboard.length > 0}
            polygonSides={polygonSides}
            onChangePolygonSides={setPolygonSides}
            onRotateSelectedShapes={handleRotateSelectedShapes}
          />

          {/* Intersecting drawing vector Canvas board */}
          <CanvasEditor
            glyph={activeGlyph}
            metrics={project.metrics}
            activeTool={activeTool}
            selectedShapeIds={selectedShapeIds}
            onSelectShapes={setSelectedShapeIds}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            onChangeGlyph={handleGlyphChange}
            zoom={zoom}
            pan={pan}
            onPan={setPan}
            snapConfig={snapConfig}
            autoCorrect={autoCorrect}
            stencilFont={stencilFont}
            onChangeZoom={setZoom}
            backgroundProject={backgroundProject}
            polygonSides={polygonSides}
          />

          {/* Bottom real-time interactive Typing Sandbox Preview drawer */}
          {isPreviewCollapsed ? (
            <div id="collapsed-test-arena-bar" className="bg-[#141414]/95 border-t border-[#333] py-2 px-4 flex items-center justify-between text-gray-400 text-[11px] h-10 select-none backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                </span>
                <span className="font-bold text-gray-200 uppercase tracking-widest font-mono text-[9.5px]">Arena de Pruebas</span>
                <span className="text-gray-600 font-mono">|</span>
                <span className="text-[10px] text-gray-500">Vista compacta para maximizar el área de dibujo vectorial</span>
              </div>
              <button
                id="expand-preview-panel-btn"
                onClick={() => setIsPreviewCollapsed(false)}
                className="py-1 px-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded cursor-pointer transition text-[9px] uppercase tracking-widest flex items-center gap-1 shadow-md border border-orange-500/20"
              >
                <span>Mostrar Arena</span>
                <span className="font-mono">▲</span>
              </button>
            </div>
          ) : (
            <PreviewPanel
              project={project}
              onChangeProject={commitProjectState}
              onToggleCollapse={() => setIsPreviewCollapsed(true)}
            />
          )}

        </div>
      </div>

      {/* Export & Download Setup Publishing Wizard */}
      <ExportPanel
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Custom Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleConfirmNewProject}
        title="Crear Nuevo Proyecto"
        message="¿Seguro que deseas empezar un nuevo proyecto de letra? Esto vaciará todas tus letras y reemplazará la tipografía actual de forma permanente."
        confirmText="Empezar de Cero"
        cancelText="Volver al Dibujo"
        type="warning"
      />
    </div>
  );
}
