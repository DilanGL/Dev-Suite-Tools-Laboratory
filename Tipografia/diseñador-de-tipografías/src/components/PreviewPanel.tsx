import React, { useEffect, useState } from 'react';
import { 
  Play, 
  HelpCircle, 
  RefreshCw, 
  SlidersHorizontal, 
  Layers, 
  FileOutput,
  Type,
  Plus,
  Trash2,
  Sparkles,
  Smile
} from 'lucide-react';
import { FontProject } from '../types';
import { compileProjectToFont } from '../utils/fontExporter';

interface PreviewPanelProps {
  project: FontProject;
  onChangeProject: (proj: FontProject) => void;
}

export default function PreviewPanel({
  project,
  onChangeProject
}: PreviewPanelProps) {
  // Preview text content
  const [previewText, setPreviewText] = useState<string>(
    'El veloz murciélago hindú comía feliz cardillo y escabeche.\nABCDEFGHIJKLMNÑOPQRSTUVWXYZ\nabcdefghijklmnñopqrstuvwxyz\n0123456789!?.,;:-+='
  );

  // Formatting configurations
  const [letterSpacing, setLetterSpacing] = useState<number>(2); // px
  const [lineHeight, setLineHeight] = useState<number>(1.4); // em
  const [fontSize, setFontSize] = useState<number>(44); // px

  // Object URL for dynamic @font-face
  const [fontFaceUrl, setFontFaceUrl] = useState<string>('');
  const [compileStatus, setCompileStatus] = useState<'success' | 'compiling' | 'error'>('success');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Kerning Pairs Editing State
  const [newKernLeft, setNewKernLeft] = useState<string>('');
  const [newKernRight, setNewKernRight] = useState<string>('');
  const [newKernValue, setNewKernValue] = useState<number>(-40);

  // Compile the font arrayBuffer in client memory and update DOM font-face
  const triggerFontCompilation = () => {
    setCompileStatus('compiling');
    try {
      const font = compileProjectToFont(project);
      
      // Compile GPOS or kern table if defined
      // We can apply kerning inside opentype.js by injecting to font.kerningPairs or glyphs
      // Actually, since we want opentype.js to store kerning, we can inject kern table pairs!
      // In opentype.js:
      font.kerningPairs = {};
      Object.entries(project.kerning).forEach(([pair, offset]) => {
        const leftChar = pair[0];
        const rightChar = pair[1];
        
        // Find glyph indexes in opentype font
        const leftGlyph = font.charToGlyph(leftChar);
        const rightGlyph = font.charToGlyph(rightChar);
        
        if (leftGlyph && rightGlyph) {
          const leftIdx = leftGlyph.index;
          const rightIdx = rightGlyph.index;
          if (typeof leftIdx === 'number' && typeof rightIdx === 'number') {
            // opentype.js key structure is `leftIdx,rightIdx`
            font.kerningPairs[`${leftIdx},${rightIdx}`] = offset;
          }
        }
      });

      const buffer = font.toArrayBuffer();
      const blob = new Blob([buffer], { type: 'font/ttf' });
      const url = URL.createObjectURL(blob);

      // Clean up previous Object URL to prevent memory leaks
      if (fontFaceUrl) {
        URL.revokeObjectURL(fontFaceUrl);
      }

      setFontFaceUrl(url);
      setCompileStatus('success');
    } catch (err: any) {
      console.error('Font Compilation Error:', err);
      setCompileStatus('error');
      setErrorMessage(err?.message || 'Error compiling OpenType outlines.');
    }
  };

  // Keep font compiled as project updates, with a subtle debouncer
  useEffect(() => {
    const debouncer = setTimeout(() => {
      triggerFontCompilation();
    }, 600); // Debounce compilation for smooth vector dragging

    return () => {
      clearTimeout(debouncer);
    };
  }, [project]);

  // Inject dynamic @font-face style rule in the document head
  useEffect(() => {
    if (!fontFaceUrl) return;

    const styleId = 'dynamic-custom-font-style';
    let style = document.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.innerHTML = `
      @font-face {
        font-family: 'MiFuenteDisenada';
        src: url('${fontFaceUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `;
  }, [fontFaceUrl]);

  // Add a new Kerning Pair mapping
  const handleAddKerningPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKernLeft || !newKernRight) return;

    const pair = `${newKernLeft.charAt(0)}${newKernRight.charAt(0)}`;
    const updatedKerning = {
      ...project.kerning,
      [pair]: newKernValue
    };

    onChangeProject({
      ...project,
      kerning: updatedKerning,
      updatedAt: Date.now()
    });

    setNewKernLeft('');
    setNewKernRight('');
  };

  // Remove a Kerning Pair
  const handleRemoveKerningPair = (pair: string) => {
    const updatedKerning = { ...project.kerning };
    delete updatedKerning[pair];

    onChangeProject({
      ...project,
      kerning: updatedKerning,
      updatedAt: Date.now()
    });
  };

  // Preset Pangrams to test
  const pangrams = [
    { label: 'Español (Veloz Murciélago)', text: 'El veloz murciélago hindú comía feliz cardillo y escabeche.' },
    { label: 'English (Quick Brown Fox)', text: 'The quick brown fox jumps over the lazy dog.' },
    { label: 'Mayúsculas', text: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' },
    { label: 'Números', text: '0 1 2 3 4 5 6 7 8 9' }
  ];

  return (
    <div id="preview-playground-panel" className="bg-[#1a1a1a] border-t border-[#333] flex flex-col xl:flex-row h-72 text-gray-300">
      {/* LEFT: Live testing typing area */}
      <div className="flex-grow flex flex-col p-3 border-b xl:border-b-0 xl:border-r border-[#333] min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Arena de Pruebas (Test Arena)</span>
            {compileStatus === 'compiling' && (
              <span className="text-[9px] bg-orange-950/45 text-orange-400 border border-orange-900/30 px-2 py-0.5 rounded animate-pulse">Compilando...</span>
            )}
            {compileStatus === 'success' && (
              <span className="text-[9px] bg-green-950/40 text-green-400 border border-green-900/30 px-2 py-0.5 rounded font-bold">✓ Listo</span>
            )}
            {compileStatus === 'error' && (
              <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/30 px-2 py-0.5 rounded" title={errorMessage}>Error</span>
            )}
          </div>

          <div className="flex gap-1">
            {pangrams.map((p, idx) => (
              <button
                key={idx}
                id={`pangram-preset-btn-${idx}`}
                onClick={() => setPreviewText(p.text)}
                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#252525] text-gray-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-[#444]"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Styled Test Output */}
        <textarea
          id="font-preview-textarea"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          style={{
            fontFamily: fontFaceUrl ? "'MiFuenteDisenada', 'Inter', sans-serif" : "'Inter', sans-serif",
            letterSpacing: `${letterSpacing}px`,
            lineHeight: lineHeight,
            fontSize: `${fontSize}px`
          }}
          className="flex-grow w-full bg-[#121212] border border-[#333] rounded p-3 text-white resize-none focus:outline-none focus:border-orange-500/50 font-normal shadow-inner custom-scrollbar whitespace-pre-wrap leading-normal"
          placeholder="Escribe algo aquí para probar tu fuente tipográfica en tiempo real..."
        />
      </div>

      {/* RIGHT: Layout & Kerning controllers */}
      <div className="w-full xl:w-80 flex flex-col p-3 overflow-y-auto custom-scrollbar gap-3 shrink-0 border-t xl:border-t-0 border-[#333]">
        {/* Sliders Container */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Arena de Ajustes</span>
          
          {/* FontSize Slider */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Tamaño de Letra</span>
              <span className="font-mono text-orange-500 font-bold">{fontSize}px</span>
            </div>
            <input
              id="slider-font-size"
              type="range"
              min={14}
              max={150}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Letter Spacing (Tracking) slider */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span title="Ancho de separación horizontal promedio">Espaciado (Tracking)</span>
              <span className="font-mono text-orange-500 font-bold">{letterSpacing}px</span>
            </div>
            <input
              id="slider-letter-spacing"
              type="range"
              min={-5}
              max={30}
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
              className="w-full h-1 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Line Height slider */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Altura de Línea</span>
              <span className="font-mono text-orange-500 font-bold">{lineHeight}em</span>
            </div>
            <input
              id="slider-line-height"
              type="range"
              min={0.8}
              max={2.5}
              step={0.1}
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>

        {/* Kerning Builder Section */}
        <div className="border-t border-[#333]/70 pt-2 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono" title="Ajuste fino de par de letras específicas (ej. AV)">Espaciado de Pares (Kerning)</span>
          
          <form onSubmit={handleAddKerningPair} className="flex gap-1">
            <input
              id="input-kern-left"
              type="text"
              maxLength={1}
              value={newKernLeft}
              onChange={(e) => setNewKernLeft(e.target.value)}
              placeholder="Izq"
              className="bg-[#121212] border border-[#333] rounded w-12 text-center text-[11px] py-1 text-white font-bold placeholder-neutral-700 focus:outline-none focus:border-orange-500/50"
            />
            <input
              id="input-kern-right"
              type="text"
              maxLength={1}
              value={newKernRight}
              onChange={(e) => setNewKernRight(e.target.value)}
              placeholder="Der"
              className="bg-[#121212] border border-[#333] rounded w-12 text-center text-[11px] py-1 text-white font-bold placeholder-neutral-700 focus:outline-none focus:border-orange-500/50"
            />
            <input
              id="input-kern-val"
              type="number"
              value={newKernValue}
              onChange={(e) => setNewKernValue(parseInt(e.target.value) || 0)}
              className="bg-[#121212] border border-[#333] rounded flex-1 text-center text-[11px] py-1 text-orange-550 font-bold focus:outline-none focus:border-orange-500/50"
              placeholder="-40"
              title="Ajuste en unidades de em"
            />
            <button
              id="btn-add-kern"
              type="submit"
              className="bg-orange-600 text-white hover:bg-orange-500 p-1.5 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              title="Añadir ajuste de kerning"
            >
              <Plus size={12} />
            </button>
          </form>

          {/* Kerning pairs list view */}
          {Object.keys(project.kerning).length === 0 ? (
            <span className="text-[10px] text-gray-500 block italic">Sin kerning personalizado asignado.</span>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
              {Object.entries(project.kerning).map(([pair, val]) => (
                <div 
                  key={pair}
                  className="bg-[#121212] border border-[#333] rounded px-1.5 py-0.5 text-[9px] flex items-center gap-1 text-gray-300 hover:border-gray-500 transition"
                >
                  <span className="font-bold">{pair[0]}{pair[1]}</span>
                  <span className="text-orange-500 font-mono font-bold">{val}u</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKerningPair(pair)}
                    className="text-gray-500 hover:text-red-400 p-0.5 transition"
                    title="Eliminar par"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
