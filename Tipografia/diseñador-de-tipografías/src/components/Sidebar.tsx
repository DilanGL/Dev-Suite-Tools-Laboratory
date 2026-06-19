import React, { useState } from 'react';
import { 
  Type, 
  Layers, 
  Settings, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Folder,
  Sliders,
  ListCollapse,
  ChevronsUpDown
} from 'lucide-react';
import { FontProject, Glyph, Shape, FontMetrics } from '../types';

interface SidebarProps {
  project: FontProject;
  activeChar: string;
  onSelectChar: (char: string) => void;
  selectedShapeIds: string[];
  onSelectShapes: (ids: string[]) => void;
  onChangeProject: (proj: FontProject) => void;
  stencilFont: 'sans-serif' | 'serif';
  onChangeStencilFont: (font: 'sans-serif' | 'serif') => void;
}

type TabType = 'chars' | 'layers' | 'metrics';

export default function Sidebar({
  project,
  activeChar,
  onSelectChar,
  selectedShapeIds,
  onSelectShapes,
  onChangeProject,
  stencilFont,
  onChangeStencilFont
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chars');

  const glyph = project.glyphs[activeChar] || { char: activeChar, unicode: activeChar.charCodeAt(0), shapes: [], advanceWidth: 600 } as Glyph;

  // Set Global font metrics helper
  const handleMetricChange = (key: keyof FontMetrics, val: number) => {
    const updatedMetrics = { ...project.metrics, [key]: val };
    onChangeProject({
      ...project,
      metrics: updatedMetrics,
      updatedAt: Date.now()
    });
  };

  // Shape visibility layer helper
  const toggleShapeVisibility = (shId: string) => {
    const updatedGlyphs = { ...project.glyphs };
    const curGlyph = updatedGlyphs[activeChar];
    if (curGlyph) {
      curGlyph.shapes = curGlyph.shapes.map(s => {
        if (s.id === shId) return { ...s, visible: !s.visible };
        return s;
      });
      onChangeProject({
        ...project,
        glyphs: updatedGlyphs,
        updatedAt: Date.now()
      });
    }
  };

  // Shape lock toggle helper
  const toggleShapeLock = (shId: string) => {
    const updatedGlyphs = { ...project.glyphs };
    const curGlyph = updatedGlyphs[activeChar];
    if (curGlyph) {
      curGlyph.shapes = curGlyph.shapes.map(s => {
        if (s.id === shId) return { ...s, locked: !s.locked };
        return s;
      });
      onChangeProject({
        ...project,
        glyphs: updatedGlyphs,
        updatedAt: Date.now()
      });
    }
  };

  // Layer Reordering: Move Layer up or down in Z-index
  const moveShapeLayer = (shId: string, direction: 'up' | 'down') => {
    const updatedGlyphs = { ...project.glyphs };
    const curGlyph = updatedGlyphs[activeChar];
    if (curGlyph) {
      const idx = curGlyph.shapes.findIndex(s => s.id === shId);
      if (idx === -1) return;

      const newIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (newIdx < 0 || newIdx >= curGlyph.shapes.length) return;

      // Swap elements
      const list = [...curGlyph.shapes];
      const temp = list[idx];
      list[idx] = list[newIdx];
      list[newIdx] = temp;

      curGlyph.shapes = list;
      onChangeProject({
        ...project,
        glyphs: updatedGlyphs,
        updatedAt: Date.now()
      });
    }
  };

  // Group char lists for readable tab categories
  const uppercaseChars = Object.keys(project.glyphs).filter(c => c >= 'A' && c <= 'Z');
  const lowercaseChars = Object.keys(project.glyphs).filter(c => c >= 'a' && c <= 'z');
  const digitChars = Object.keys(project.glyphs).filter(c => c >= '0' && c <= '9');
  const symbolChars = Object.keys(project.glyphs).filter(c => !uppercaseChars.includes(c) && !lowercaseChars.includes(c) && !digitChars.includes(c));

  return (
    <div id="sidebar-panel" className="w-[280px] border-r border-[#333] bg-[#1a1a1a] flex flex-col h-full text-gray-300 select-none">
      {/* Font project branding title */}
      <div className="p-3 border-b border-[#333] bg-[#141414]">
        <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-0.5">Nombre de la Fuente</label>
        <input
          id="project-name-input"
          type="text"
          value={project.name}
          onChange={(e) => onChangeProject({ ...project, name: e.target.value, updatedAt: Date.now() })}
          className="bg-transparent text-xs font-bold text-white focus:outline-none focus:border-b focus:border-orange-500 pb-0.5 w-full border-b border-transparent placeholder-neutral-700 transition-all font-sans"
          placeholder="Nombre de la tipografía"
        />
      </div>

      {/* Internal Tabs Navigation Layout */}
      <div className="flex border-b border-[#333] text-[11px] text-center font-semibold bg-[#141414]">
        <button
          id="tab-btn-chars"
          onClick={() => setActiveTab('chars')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer border-r border-[#333] ${
            activeTab === 'chars' ? 'border-b-2 border-b-orange-500 text-orange-500 bg-[#1e1e1e] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Type size={12} />
          <span>Letras</span>
        </button>
        <button
          id="tab-btn-layers"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer border-r border-[#333] ${
            activeTab === 'layers' ? 'border-b-2 border-b-orange-500 text-orange-500 bg-[#1e1e1e] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers size={12} />
          <span>Capas ({glyph.shapes.length})</span>
        </button>
        <button
          id="tab-btn-metrics"
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'metrics' ? 'border-b-2 border-b-orange-500 text-orange-500 bg-[#1e1e1e] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sliders size={12} />
          <span>Ajustes</span>
        </button>
      </div>

      {/* Tabs Contents */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
        {/* TAB 1: CHARACTERS SELECTOR GRID */}
        {activeTab === 'chars' && (
          <div className="space-y-3">
            {/* Category: Uppercase */}
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 font-mono">Mayúsculas (A-Z)</span>
              <div className="grid grid-cols-5 gap-1">
                {uppercaseChars.map(char => {
                  const g = project.glyphs[char];
                  const hasShapes = g && g.shapes.length > 0;
                  const isActive = activeChar === char;
                  return (
                    <button
                      key={char}
                      id={`char-grid-btn-${char}`}
                      onClick={() => onSelectChar(char)}
                      className={`h-8 rounded flex flex-col items-center justify-center relative border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-orange-600/25 border-orange-500 text-white font-extrabold shadow' 
                          : hasShapes
                            ? 'bg-[#252525] border-transparent text-orange-400 hover:bg-[#333]'
                            : 'bg-[#181818] border-[#2e2e2e] text-gray-400 hover:bg-[#222]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{char}</span>
                      {hasShapes && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isActive ? 'bg-orange-500 animate-ping' : 'bg-orange-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: Lowercase */}
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 font-mono">Minúsculas (a-z)</span>
              <div className="grid grid-cols-5 gap-1">
                {lowercaseChars.map(char => {
                  const g = project.glyphs[char];
                  const hasShapes = g && g.shapes.length > 0;
                  const isActive = activeChar === char;
                  return (
                    <button
                      key={char}
                      id={`char-grid-btn-${char}`}
                      onClick={() => onSelectChar(char)}
                      className={`h-8 rounded flex flex-col items-center justify-center relative border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-orange-600/25 border-orange-500 text-white font-extrabold shadow animate-pulse-subtle' 
                          : hasShapes
                            ? 'bg-[#252525] border-transparent text-orange-400 hover:bg-[#333]'
                            : 'bg-[#181818] border-[#2e2e2e] text-gray-400 hover:bg-[#222]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{char}</span>
                      {hasShapes && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isActive ? 'bg-orange-500' : 'bg-orange-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: Digits */}
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 font-mono">Números (0-9)</span>
              <div className="grid grid-cols-5 gap-1">
                {digitChars.map(char => {
                  const g = project.glyphs[char];
                  const hasShapes = g && g.shapes.length > 0;
                  const isActive = activeChar === char;
                  return (
                    <button
                      key={char}
                      id={`char-grid-btn-${char}`}
                      onClick={() => onSelectChar(char)}
                      className={`h-8 rounded flex flex-col items-center justify-center relative border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-orange-600/25 border-orange-500 text-white font-extrabold shadow' 
                          : hasShapes
                            ? 'bg-[#252525] border-transparent text-orange-400 hover:bg-[#333]'
                            : 'bg-[#181818] border-[#2e2e2e] text-gray-400 hover:bg-[#222]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{char}</span>
                      {hasShapes && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isActive ? 'bg-orange-500' : 'bg-orange-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: Symbols */}
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 font-mono">Símbolos</span>
              <div className="grid grid-cols-5 gap-1 font-mono">
                {symbolChars.map(char => {
                  const g = project.glyphs[char];
                  const hasShapes = g && g.shapes.length > 0;
                  const isActive = activeChar === char;
                  return (
                    <button
                      key={char}
                      id={`char-grid-btn-${char}`}
                      onClick={() => onSelectChar(char)}
                      className={`h-8 rounded flex flex-col items-center justify-center relative border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-orange-600/25 border-orange-500 text-white font-extrabold shadow' 
                          : hasShapes
                            ? 'bg-[#252525] border-transparent text-orange-400 hover:bg-[#333]'
                            : 'bg-[#181818] border-[#2e2e2e] text-gray-400 hover:bg-[#222]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{char}</span>
                      {hasShapes && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isActive ? 'bg-orange-500' : 'bg-orange-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAYERS LIST FOR CURRENT CHARACTER */}
        {activeTab === 'layers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Capas de '{activeChar}'</span>
              <span className="bg-[#141414] text-gray-400 font-mono text-[9px] px-2 py-0.5 rounded border border-[#333]">{glyph.shapes.length} figuras</span>
            </div>

            {glyph.shapes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs bg-[#141414] rounded border border-dashed border-[#333]">
                <Layers className="mx-auto mb-2 text-gray-600" size={20} />
                <p>No hay figuras dibujadas todavía.</p>
                <p className="text-[9px] mt-1 text-gray-650">¡Usa herramientas o el lápiz para empezar!</p>
              </div>
            ) : (
              <div className="space-y-1 select-none">
                {[...glyph.shapes].reverse().map((shape, idx) => {
                  const originalIdx = glyph.shapes.findIndex(s => s.id === shape.id);
                  const isSelected = selectedShapeIds.includes(shape.id);

                  return (
                    <div
                       key={shape.id}
                       id={`layer-row-${shape.id}`}
                       className={`flex items-center justify-between px-2 py-1.5 rounded border text-xs gap-1.5 transition-all ${
                         isSelected 
                           ? 'bg-orange-950/15 border-orange-500/50 shadow-sm' 
                           : 'bg-[#252525] border-[#333] hover:bg-[#2e2e2e]'
                       }`}
                     >
                       <button
                         onClick={() => onSelectShapes([shape.id])}
                         className="flex-1 text-left font-medium select-none truncate hover:text-orange-400 cursor-pointer text-gray-300 text-[11px]"
                         title={shape.name}
                       >
                         <span className="text-[9px] text-gray-500 font-mono mr-1.5">#{originalIdx + 1}</span>
                         <span>{shape.name}</span>
                         {shape.reverseWinding && (
                           <span className="ml-1 px-1 bg-red-950/50 text-red-400 border border-red-900/40 rounded text-[7px] font-mono font-bold">HUECO</span>
                         )}
                       </button>

                       <div className="flex items-center gap-0.5">
                         <button
                           onClick={() => moveShapeLayer(shape.id, 'down')}
                           disabled={originalIdx === 0}
                           className={`p-0.5 rounded text-gray-400 hover:text-white transition-all ${originalIdx === 0 ? 'opacity-20 cursor-not-allowed font-medium' : 'cursor-pointer'}`}
                           title="Enviar atrás (capa inferior)"
                         >
                           <ChevronDown size={12} />
                         </button>

                         <button
                           onClick={() => moveShapeLayer(shape.id, 'up')}
                           disabled={originalIdx === glyph.shapes.length - 1}
                           className={`p-0.5 rounded text-gray-400 hover:text-white transition-all ${originalIdx === glyph.shapes.length - 1 ? 'opacity-20 cursor-not-allowed font-medium' : 'cursor-pointer'}`}
                           title="Traer al frente (capa superior)"
                         >
                           <ChevronUp size={12} />
                         </button>

                         <button
                           onClick={() => toggleShapeVisibility(shape.id)}
                           className="p-0.5 text-gray-400 hover:text-white rounded transition-all cursor-pointer"
                           title="Ocultar / Mostrar"
                         >
                           {shape.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-600" />}
                         </button>

                         <button
                           onClick={() => toggleShapeLock(shape.id)}
                           className="p-0.5 text-gray-400 hover:text-white rounded transition-all cursor-pointer"
                           title="Bloquear / Desbloquear"
                         >
                           {shape.locked ? <Lock size={12} className="text-orange-500" /> : <Unlock size={12} />}
                         </button>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GLOBAL METRICS & SETTINGS */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            {/* Template stencil options */}
            <div className="bg-[#141414] p-2.5 rounded border border-[#333]">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Plantilla de Fondo
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  id="stencil-sans-btn"
                  onClick={() => onChangeStencilFont('sans-serif')}
                  className={`py-1 px-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    stencilFont === 'sans-serif' 
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400' 
                      : 'border-[#333] text-gray-400 hover:bg-[#252525]'
                  }`}
                >
                  Sans-Serif (Inter)
                </button>
                <button
                  id="stencil-serif-btn"
                  onClick={() => onChangeStencilFont('serif')}
                  className={`py-1 px-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    stencilFont === 'serif' 
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400' 
                      : 'border-[#333] text-gray-400 hover:bg-[#252525]'
                  }`}
                >
                  Serif (Classics)
                </button>
              </div>
            </div>

            {/* Metrics form */}
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-mono">Métricas Tipográficas (UEM)</span>
              
              <div className="space-y-1.5 font-mono text-[11px]">
                {/* Units Per Em */}
                <div className="flex items-center justify-between bg-[#141414] px-2 py-1.5 rounded border border-[#333]">
                  <span className="text-gray-400 font-sans font-semibold">Medida Em (UEM)</span>
                  <input
                    id="metric-input-em"
                    type="number"
                    value={project.metrics.unitsPerEm}
                    onChange={(e) => handleMetricChange('unitsPerEm', parseInt(e.target.value) || 1000)}
                    className="w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-right font-medium text-orange-500 text-xs focus:ring-1 focus:ring-orange-500/50 focus:outline-none"
                    min={100}
                    max={5000}
                  />
                </div>

                {/* Ascender */}
                <div className="flex items-center justify-between bg-[#141414] px-2 py-1.5 rounded border border-[#333]">
                  <span className="text-gray-400 font-sans font-semibold">Línea Ascendente</span>
                  <input
                    id="metric-input-ascender"
                    type="number"
                    value={project.metrics.ascender}
                    onChange={(e) => handleMetricChange('ascender', parseInt(e.target.value) || 0)}
                    className="w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-right font-medium text-orange-500 text-xs focus:ring-1 focus:ring-orange-500/50 focus:outline-none"
                    min={0}
                    max={2000}
                  />
                </div>

                {/* Cap Height */}
                <div className="flex items-center justify-between bg-[#141414] px-2 py-1.5 rounded border border-[#333]">
                  <span className="text-gray-400 font-sans font-semibold">Altura Mayúsculas</span>
                  <input
                    id="metric-input-capheight"
                    type="number"
                    value={project.metrics.capHeight}
                    onChange={(e) => handleMetricChange('capHeight', parseInt(e.target.value) || 0)}
                    className="w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-right font-medium text-orange-500 text-xs focus:ring-1 focus:ring-orange-500/50 focus:outline-none"
                    min={0}
                    max={2000}
                  />
                </div>

                {/* x-Height */}
                <div className="flex items-center justify-between bg-[#141414] px-2 py-1.5 rounded border border-[#333]">
                  <span className="text-gray-400 font-sans font-semibold">Altura Letras 'x'</span>
                  <input
                    id="metric-input-xheight"
                    type="number"
                    value={project.metrics.xHeight}
                    onChange={(e) => handleMetricChange('xHeight', parseInt(e.target.value) || 0)}
                    className="w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-right font-medium text-orange-500 text-xs focus:ring-1 focus:ring-orange-500/50 focus:outline-none"
                    min={0}
                    max={2000}
                  />
                </div>

                {/* Baseline */}
                <div className="flex items-center justify-between bg-[#141414] px-2 py-1.5 rounded border border-[#333]">
                  <span className="text-gray-400 font-sans font-semibold">Línea Base Sit.</span>
                  <input
                    id="metric-input-baseline"
                    type="number"
                    value={project.metrics.baseline}
                    disabled
                    className="w-14 bg-[#141414] text-gray-600 border border-[#2e2e2e] rounded px-1 py-0.5 text-right font-medium text-xs cursor-not-allowed select-none"
                  />
                </div>

                {/* Descender */}
                <div className="flex items-center justify-between bg-[#141414] px-2 py-1.5 rounded border border-[#333]">
                  <span className="text-gray-400 font-sans font-semibold">Línea Descendente</span>
                  <input
                    id="metric-input-descender"
                    type="number"
                    value={project.metrics.descender}
                    onChange={(e) => handleMetricChange('descender', parseInt(e.target.value) || 0)}
                    className="w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-right font-medium text-orange-500 text-xs focus:ring-1 focus:ring-orange-500/50 focus:outline-none"
                    min={-2000}
                    max={0}
                  />
                </div>
              </div>
            </div>

            {/* Individual Character settings (width metrics) */}
            <div className="bg-[#141414] p-2.5 rounded border border-[#333] space-y-1.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Ajuste de Letra</span>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-gray-400 font-sans font-semibold">Ancho Letra '{activeChar}'</span>
                <input
                  id="metric-input-char-width"
                  type="number"
                  value={glyph.advanceWidth}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 600;
                    const updatedGlyphs = { ...project.glyphs };
                    updatedGlyphs[activeChar] = { ...glyph, advanceWidth: val };
                    onChangeProject({ ...project, glyphs: updatedGlyphs, updatedAt: Date.now() });
                  }}
                  className="w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-right font-medium text-orange-500 focus:ring-1 focus:ring-orange-500/50 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
