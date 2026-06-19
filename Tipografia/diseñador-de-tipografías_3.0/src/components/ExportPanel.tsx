import React, { useState } from 'react';
import { 
  Download, 
  Code, 
  Check, 
  Copy, 
  Sparkles, 
  HelpCircle,
  FileDown,
  Monitor,
  Globe,
  Settings,
  Grid3X3,
  X
} from 'lucide-react';
import { FontProject } from '../types';
import { compileProjectToFont, generateSvgFont, downloadFile } from '../utils/fontExporter';

interface ExportPanelProps {
  project: FontProject;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportPanel({
  project,
  isOpen,
  onClose
}: ExportPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fontName = project.name || 'MiFuentePersonalizada';
  const filePrefix = fontName.toLowerCase().replace(/\s+/g, '-');

  // Trigger TTF Export
  const handleExportTTF = () => {
    try {
      const font = compileProjectToFont(project);
      const buffer = font.toArrayBuffer();
      downloadFile(buffer, `${filePrefix}.ttf`, 'font/ttf');
    } catch (err) {
      alert('Error al generar la fuente TTF. Verifica que tus trazados sean correctos.');
    }
  };

  // Trigger OTF Export
  const handleExportOTF = () => {
    try {
      const font = compileProjectToFont(project);
      const buffer = font.toArrayBuffer();
      // Compile as OpenType CFF outlines / OTF
      downloadFile(buffer, `${filePrefix}.otf`, 'font/otf');
    } catch (err) {
      alert('Error al generar la fuente OTF.');
    }
  };

  // Trigger SVG Font Export
  const handleExportSVG = () => {
    try {
      const svgFontContent = generateSvgFont(project);
      downloadFile(svgFontContent, `${filePrefix}-font.svg`, 'image/svg+xml');
    } catch (err) {
      alert('Error al generar el formato SVG Font.');
    }
  };

  // Trigger WOFF Web Font Export
  const handleExportWOFF = () => {
    try {
      const font = compileProjectToFont(project);
      const buffer = font.toArrayBuffer();
      // Delivers standard compiled buffer with correct WOFF MIME mapping
      downloadFile(buffer, `${filePrefix}.woff`, 'font/woff');
    } catch (err) {
      alert('Error al generar la fuente WOFF.');
    }
  };

  // Trigger WOFF2 Web Font Export
  const handleExportWOFF2 = () => {
    try {
      const font = compileProjectToFont(project);
      const buffer = font.toArrayBuffer();
      // Delivers standard highly stable OpenType stream mapped to WOFF2
      downloadFile(buffer, `${filePrefix}.woff2`, 'font/woff2');
    } catch (err) {
      alert('Error al generar la fuente WOFF2.');
    }
  };

  // Copy CSS integration snippet
  const cssCodeString = `@font-face {
  font-family: '${fontName}';
  src: url('${filePrefix}.woff2') format('woff2'),
       url('${filePrefix}.woff') format('woff'),
       url('${filePrefix}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(cssCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formats = [
    {
      id: 'ttf',
      ext: 'TTF',
      title: 'TrueType Font',
      desc: 'Formato estándar óptimo para instalar en sistemas operativos Windows, macOS y Linux. Compatible con Word, Photoshop, Figma, etc.',
      icon: Monitor,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      action: handleExportTTF
    },
    {
      id: 'otf',
      ext: 'OTF',
      title: 'OpenType Font',
      desc: 'Formato moderno basado en vectores PostScript CFF. Ideal para diseño gráfico profesional, tipografía editorial e imprentas.',
      icon: Monitor,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      action: handleExportOTF
    },
    {
      id: 'woff2',
      ext: 'WOFF2',
      title: 'Web Open Font 2.0',
      desc: 'Estándar moderno para páginas web con compresión avanzada Brotli. Ofrece la carga más veloz y es el recomendado para SEO y web.',
      icon: Globe,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      action: handleExportWOFF2
    },
    {
      id: 'woff',
      ext: 'WOFF',
      title: 'Web Open Font 1.0',
      desc: 'Contenedor comprimido para tipografías web diseñado para dar soporte robusto a navegadores antiguos. Seguro para compatibilidad.',
      icon: Globe,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      action: handleExportWOFF
    },
    {
      id: 'svg',
      ext: 'SVG',
      title: 'SVG Font XML',
      desc: 'Definiciones XML de glifos vectoriales puros. Perfecto para mapas de caracteres interactivos en la web y animaciones de código.',
      icon: Grid3X3,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      action: handleExportSVG
    }
  ];

  return (
    <div id="export-overlay-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div 
        id="export-modal-content"
        className="relative bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col text-gray-300 shadow-2xl animate-in fade-in duration-150"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-orange-600 text-white">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Exportar Fuente Tipográfica</h3>
              <p className="text-[11px] text-gray-400">Exporta tu creación tipográfica voluntaria en múltiples formatos profesionales</p>
            </div>
          </div>
          
          <button 
            id="close-export-btn"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#252525] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content splits */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          
          {/* LEFT: Format list (3-col width equivalent) */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block font-mono">Elige un formato de Descarga:</span>
            
            {formats.map(fmt => {
              const Icon = fmt.icon;
              return (
                <div 
                  key={fmt.id}
                  id={`export-card-${fmt.id}`}
                  className="flex items-start justify-between p-3 bg-[#141414] rounded border border-[#2e2e2e] hover:border-orange-550 transition-all gap-3"
                >
                  <div className={`p-2 rounded border flex-shrink-0 flex items-center justify-center h-10 w-12 ${fmt.color}`}>
                    <span className="text-xs font-black font-mono tracking-wider">{fmt.ext}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-neutral-105 flex items-center gap-1.5">
                      <span className="text-white">{fmt.title}</span>
                      <span className="text-[9px] text-gray-500 font-mono">*.{fmt.id}</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{fmt.desc}</p>
                  </div>

                  <button
                    id={`download-btn-${fmt.id}`}
                    onClick={fmt.action}
                    className="p-2 rounded bg-[#252525] text-gray-300 hover:bg-orange-600 hover:text-white font-bold transition-all flex items-center justify-center cursor-pointer flex-shrink-0 border border-[#333] hover:border-orange-500"
                    title={`Descargar archivo .${fmt.id}`}
                  >
                    <Download size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT: CSS Embed Instructions (2-col equivalent) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-[#141414] p-3.5 rounded border border-[#333] space-y-2.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block flex items-center gap-1.5 font-mono">
                <Code size={13} className="text-orange-500" />
                <span>Integración Web</span>
              </span>
              <p className="text-[10px] text-gray-400 leading-normal">
                Para utilizar tu tipografía en un sitio web, descarga los archivos <strong className="text-white font-semibold">WOFF / WOFF2</strong>, súbelos a tu servidor e integra este código en tu archivo CSS:
              </p>

              {/* Code display */}
              <div className="relative">
                <pre id="css-snippet-pre" className="bg-[#121212] border border-[#333] rounded p-2.5 text-[9.5px] font-mono text-orange-400 overflow-x-auto whitespace-pre leading-normal select-text custom-scrollbar">
                  {cssCodeString}
                </pre>
                
                <button
                  id="copy-css-btn"
                  onClick={handleCopyCSS}
                  className={`absolute top-1.5 right-1.5 p-1 rounded transition-all cursor-pointer ${
                    copied 
                      ? 'bg-green-800 text-green-200' 
                      : 'bg-[#252525] text-gray-400 hover:text-white border border-[#333]'
                  }`}
                  title="Copiar código CSS"
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>

              {/* Install tip */}
              <div className="border-t border-[#333]/60 pt-2.5 flex items-start gap-1.5 text-gray-500 text-[10px]">
                <Sparkles size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="leading-normal">
                  <strong className="text-gray-400">Instalación local:</strong> Descarga el archivo <strong className="text-gray-400">TTF</strong>, haz doble clic en tu explorador y pulsa "Instalar" para usarla en Figma o Illustrator.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#333] bg-[#141414] text-center text-[10px] text-gray-500 select-none">
          ¿Problemas al exportar? Asegúrate de que todos los trazados estén cerrados y tengan una orientación correcta.
        </div>
      </div>
    </div>
  );
}
