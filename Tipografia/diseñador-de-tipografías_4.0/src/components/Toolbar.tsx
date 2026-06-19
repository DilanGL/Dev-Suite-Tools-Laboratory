import React from 'react';
import { 
  MousePointer, 
  PenTool, 
  Circle, 
  Square, 
  Triangle, 
  CornerUpLeft, 
  CornerUpRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Trash2, 
  Copy, 
  RotateCcw, 
  RotateCw,
  Sparkles, 
  Compass, 
  Plus, 
  Minus,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  HelpCircle,
  FileCheck,
  Clipboard
} from 'lucide-react';
import { ToolType, SnapConfig } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onChangeTool: (tool: ToolType) => void;
  onNewProject: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  autoCorrect: boolean;
  onChangeAutoCorrect: (val: boolean) => void;
  snapConfig: SnapConfig;
  onChangeSnapConfig: (config: SnapConfig) => void;
  onDuplicateSelectedShape: () => void;
  onDeleteSelectedShape: () => void;
  onToggleWinding: () => void;
  hasSelectedShapes: boolean;
  onCopySelectedShape: () => void;
  onPasteShape: () => void;
  canPaste: boolean;
  polygonSides: number;
  onChangePolygonSides: (val: number) => void;
  onRotateSelectedShapes: (degrees: number) => void;
}

export default function Toolbar({
  activeTool,
  onChangeTool,
  onNewProject,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  autoCorrect,
  onChangeAutoCorrect,
  snapConfig,
  onChangeSnapConfig,
  onDuplicateSelectedShape,
  onDeleteSelectedShape,
  onToggleWinding,
  hasSelectedShapes,
  onCopySelectedShape,
  onPasteShape,
  canPaste,
  polygonSides,
  onChangePolygonSides,
  onRotateSelectedShapes
}: ToolbarProps) {
  const tools = [
    { id: 'select', label: 'Seleccionar (V)', icon: MousePointer, desc: 'Mueve, escala y rota figuras enteras' },
    { id: 'node', label: 'Editar Nodos (A)', icon: Compass, desc: 'Modifica puntos de ancla y manejadores Bézier' },
    { id: 'bezier', label: 'Pluma Bézier (P)', icon: PenTool, desc: 'Dibuja curvas nodo por nodo' },
    { id: 'freehand', label: 'Lápiz Libre (D)', icon: Sparkles, desc: 'Boceto libre. Autocorrige a formas limpias si se desea' },
    { id: 'line', label: 'Línea (L)', icon: Minus, desc: 'Crea un segmento de línea recta' },
    { id: 'rectangle', label: 'Rectángulo (R)', icon: Square, desc: 'Crea un rectángulo de 4 nodos' },
    { id: 'circle', label: 'Círculo / Elipse (O)', icon: Circle, desc: 'Crea un círculo perfecto de 4 nodos Bézier' },
    { id: 'polygon', label: 'Polígono (Y)', icon: Triangle, desc: 'Crea una forma regular de n lados' }
  ];

  return (
    <div id="toolbar-panel" className="flex flex-wrap items-center justify-between gap-2 bg-[#1a1a1a] border-b border-[#333] px-3 py-1.5 text-gray-300">
      {/* 1. Herramientas de Dibujo */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1.5 select-none font-mono">Herramientas:</span>
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              id={`tool-btn-${tool.id}`}
              onClick={() => onChangeTool(tool.id as ToolType)}
              className={`h-7 px-2 rounded flex items-center gap-1.5 transition-all text-[11px] font-medium cursor-pointer ${
                isActive 
                  ? 'bg-orange-600/20 text-orange-500 font-bold border border-orange-500/30' 
                  : 'hover:bg-[#252525] text-gray-400 hover:text-gray-200'
              }`}
              title={`${tool.label}: ${tool.desc}`}
            >
              <Icon size={13} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
              <span className="hidden leading-none lg:inline">{tool.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Dynamic polygon sides selection */}
        {activeTool === 'polygon' && (
          <div className="flex items-center gap-1 bg-[#121212] px-2 py-0.5 rounded border border-[#333] text-[11px] h-7 ml-1">
            <span className="text-[10px] text-gray-400 font-mono">Lados:</span>
            <input
              type="number"
              min={3}
              max={24}
              value={polygonSides}
              onChange={(e) => onChangePolygonSides(Math.min(24, Math.max(3, parseInt(e.target.value) || 5)))}
              className="w-8 h-5 bg-transparent text-center text-white font-mono font-bold focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 2. Acciones Vectoriales */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1 select-none font-mono">Acción:</span>
        
        {/* Toggle Winding (Making holes) */}
        <button
          id="op-btn-winding"
          disabled={!hasSelectedShapes}
          onClick={onToggleWinding}
          className={`h-7 px-2 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
            hasSelectedShapes 
              ? 'hover:bg-[#252525] text-orange-500 border border-[#444] bg-[#252525]/40 font-medium cursor-pointer' 
              : 'text-gray-600 border border-[#333] cursor-not-allowed opacity-30 select-none'
          }`}
          title="Invierte la dirección del trazado (sentido horario / antihorario). Sirve para crear HUECOS (efecto máscara) al superponer figuras, p.ej. en letras como O, B, A"
        >
          <RefreshCw size={12} />
          <span className="hidden sm:inline">Hueco / Invertir</span>
        </button>

        {/* Copy Shape */}
        <button
          id="op-btn-copy"
          disabled={!hasSelectedShapes}
          onClick={onCopySelectedShape}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-all ${
            hasSelectedShapes 
              ? 'hover:bg-[#252525] border-[#444] text-orange-400 hover:text-orange-300 cursor-pointer' 
              : 'border-[#333] text-gray-600 cursor-not-allowed opacity-30 select-none'
          }`}
          title="Copiar Selección (Ctrl+C)"
        >
          <Copy size={12} />
        </button>

        {/* Paste Shape */}
        <button
          id="op-btn-paste"
          disabled={!canPaste}
          onClick={onPasteShape}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-all ${
            canPaste 
              ? 'hover:bg-orange-950/20 border-orange-500/40 text-orange-400 cursor-pointer bg-orange-600/5 animate-pulse-subtle' 
              : 'border-[#333] text-gray-600 cursor-not-allowed opacity-30 select-none'
          }`}
          title="Pegar Selección en carácter activo (Ctrl+V)"
        >
          <Clipboard size={12} />
        </button>

        {/* Duplicate Shape */}
        <button
          id="op-btn-duplicate"
          disabled={!hasSelectedShapes}
          onClick={onDuplicateSelectedShape}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-all ${
            hasSelectedShapes 
              ? 'hover:bg-[#252525] border-[#444] text-gray-300 cursor-pointer' 
              : 'border-[#333] text-gray-600 cursor-not-allowed opacity-30 select-none'
          }`}
          title="Duplicar Figura"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </button>

        {/* Rotate Shape button (45 degrees) */}
        <button
          id="op-btn-rotate"
          disabled={!hasSelectedShapes}
          onClick={() => onRotateSelectedShapes(45)}
          className={`h-7 px-2 rounded border transition-all text-[11px] leading-none flex items-center gap-1 ${
            hasSelectedShapes 
              ? 'hover:bg-[#252525] border-[#444] text-orange-400 cursor-pointer bg-[#252525]/10 font-medium' 
              : 'border-[#333] text-gray-600 cursor-not-allowed opacity-30 select-none'
          }`}
          title="Girar elementos seleccionados 45° en sentido horario"
        >
          <RotateCw size={12} />
          <span>Girar 45°</span>
        </button>

        {/* Delete Shape */}
        <button
          id="op-btn-delete"
          disabled={!hasSelectedShapes}
          onClick={onDeleteSelectedShape}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-all ${
            hasSelectedShapes 
              ? 'hover:bg-red-950/20 border-red-900/35 text-red-400 hover:text-red-300 cursor-pointer' 
              : 'border-[#333] text-gray-600 cursor-not-allowed opacity-30 select-none'
          }`}
          title="Eliminar Selección"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* 3. Ajustes de Guiado, Deshacer y Zoom (ALL OF THESE MOVED AND ALIGNED TOGETHER ON THE RIGHT!) */}
      <div className="flex items-center gap-2">
        {/* Autocorrect */}
        <button
          id="toggle-autocorrect-btn"
          onClick={() => onChangeAutoCorrect(!autoCorrect)}
          className={`h-7 px-2 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            autoCorrect 
              ? 'bg-orange-600/15 text-orange-400 border border-orange-500/20' 
              : 'bg-transparent text-gray-500 border border-[#333] hover:text-gray-300'
          }`}
          title="Auto-corrector Inteligente: Convierte bocetos rápidos a mano alzada en figuras vectoriales perfectas"
        >
          <Sparkles size={11} className={autoCorrect ? 'animate-pulse text-orange-500' : ''} />
          <span className="hidden md:inline">Auto-corrección</span>
        </button>

        {/* Snapping controls */}
        <div className="flex items-center gap-0.5 bg-[#121212] rounded p-0.5 border border-[#333]">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1.5 select-none font-mono">Ajuste:</span>
          
          <button
            id="snap-btn-grid"
            onClick={() => onChangeSnapConfig({ ...snapConfig, grid: !snapConfig.grid })}
            className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
              snapConfig.grid 
                ? 'bg-[#252525] text-orange-500 font-extrabold' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title="Ajustar a cuadrícula"
          >
            GRID
          </button>

          <button
            id="snap-btn-nodes"
            onClick={() => onChangeSnapConfig({ ...snapConfig, nodes: !snapConfig.nodes })}
            className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
              snapConfig.nodes 
                ? 'bg-[#252525] text-orange-500 font-extrabold' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title="Ajustar a otros nodos de trazado"
          >
            NODOS
          </button>

          <button
            id="snap-btn-guides"
            onClick={() => onChangeSnapConfig({ ...snapConfig, guidelines: !snapConfig.guidelines })}
            className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
              snapConfig.guidelines 
                ? 'bg-[#252525] text-orange-500 font-extrabold' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title="Ajustar a líneas guía profesionales"
          >
            GUÍAS
          </button>
        </div>

        {/* Nuevo, deshacer, rehacer buttons placed neatly with grid snap, nodes and guide */}
        <div className="flex items-center gap-0.5 bg-[#121212] rounded p-0.5 border border-[#333]">
          <button
            id="new-btn"
            onClick={onNewProject}
            className="p-1 px-2 hover:bg-[#252525] hover:text-white rounded transition-all cursor-pointer text-gray-400 flex items-center gap-0.5"
            title="Nuevo Proyecto (Limpiar todo)"
          >
            <Plus size={11} className="text-orange-500" />
            <span className="text-[9.5px] font-mono font-bold leading-none uppercase">Nuevo</span>
          </button>
          
          <span className="text-gray-700 select-none">|</span>

          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded transition-all ${
              canUndo ? 'text-gray-300 hover:bg-[#252525] hover:text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-30 select-none'
            }`}
            title="Deshacer (Ctrl+Z)"
          >
            <CornerUpLeft size={11} />
          </button>
          <button
            id="redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1 rounded transition-all ${
              canRedo ? 'text-gray-300 hover:bg-[#252525] hover:text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-30 select-none'
            }`}
            title="Rehacer (Ctrl+Y)"
          >
            <CornerUpRight size={11} />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-[#121212] px-1 py-0.5 rounded border border-[#333] text-[11px]">
          <button
            id="zoom-out-btn"
            onClick={onZoomOut}
            className="p-1 hover:bg-[#252525] rounded text-gray-400 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          
          <button
            id="zoom-reset-btn"
            onClick={onResetZoom}
            className="px-1.5 font-mono text-[10px] hover:text-orange-500 text-gray-400 font-bold cursor-pointer"
            title="Reiniciar Zoom y Centrar Vista"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            id="zoom-in-btn"
            onClick={onZoomIn}
            className="p-1 hover:bg-[#252525] rounded text-gray-400 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
