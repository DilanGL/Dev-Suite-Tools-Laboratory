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
  Sparkles, 
  Compass, 
  Plus, 
  Minus,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { ToolType, SnapConfig } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onChangeTool: (tool: ToolType) => void;
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
}

export default function Toolbar({
  activeTool,
  onChangeTool,
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
  hasSelectedShapes
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
      {/* Tool selections */}
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
      </div>

      {/* Vector Operations & Formatting */}
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
          <Copy size={12} />
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

      {/* Smart Snapping & Autocorrect */}
      <div className="flex items-center gap-2">
        {/* Autocorrect sketch toggle */}
        <div className="flex items-center gap-1 border-l border-[#333] pl-2">
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
        </div>

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
      </div>

      {/* Undo/Redo & Zoom utilities */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#333]">
          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded transition-all ${
              canUndo ? 'text-gray-300 hover:bg-[#252525] hover:text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-30 select-none'
            }`}
            title="Deshacer (Ctrl+Z)"
          >
            <CornerUpLeft size={13} />
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
            <CornerUpRight size={13} />
          </button>
        </div>

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
