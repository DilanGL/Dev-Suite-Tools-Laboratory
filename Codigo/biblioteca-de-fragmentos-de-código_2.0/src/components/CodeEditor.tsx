import React, { useRef, useEffect, useState } from 'react';
import { Play, Eye, Code2, Search, X, ArrowUpDown, Sliders, Type } from 'lucide-react';
import { EditorTheme } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  theme: EditorTheme;
}

const THEME_STYLES: Record<EditorTheme, {
  container: string;
  lineGutter: string;
  textarea: string;
  lineActive: string;
}> = {
  'dark-slate': {
    container: 'bg-[#0F1115] text-[#D1D5DB] border border-[#2A2D35]',
    lineGutter: 'bg-[#0F1115] text-[#3A3F4B] border-r border-[#2A2D35]',
    textarea: 'text-[#D1D5DB] caret-blue-500 bg-transparent',
    lineActive: 'bg-[#16181D]/60',
  },
  'light-studio': {
    container: 'bg-[#fafafa] text-[#1c1917] border border-[#e7e5e4]',
    lineGutter: 'bg-[#f5f5f4] text-[#78716c] border-r border-[#e7e5e4]',
    textarea: 'text-[#1c1917] caret-violet-600 bg-transparent',
    lineActive: 'bg-[#f5f5f4]',
  },
  'github-dark': {
    container: 'bg-[#0d1117] text-[#c9d1d9] border border-[#30363d]',
    lineGutter: 'bg-[#161b22] text-[#484f58] border-r border-[#30363d]',
    textarea: 'text-[#c9d1d9] caret-[#58a6ff] bg-transparent',
    lineActive: 'bg-[#161b22]/50',
  },
  'monokai': {
    container: 'bg-[#272822] text-[#f8f8f2] border border-[#3e3d32]',
    lineGutter: 'bg-[#1e1f1c] text-[#75715e] border-r border-[#3e3d32]',
    textarea: 'text-[#f8f8f2] caret-[#f92672] bg-transparent',
    lineActive: 'bg-[#1e1f1c]/40',
  }
};

export default function CodeEditor({ code, onChange, language, theme }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = useState<number>(14);
  const wordWrap = false; // Parche permanente: desactiva el wrapped vertical para prevenir desfases de líneas
  
  // Direct scroll listening for perfect line number synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    if (!textarea || !gutter) return;

    const handleScrollSync = () => {
      gutter.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', handleScrollSync, { passive: true });
    // Run sync on load/mount too to lock positioning
    handleScrollSync();

    return () => {
      textarea.removeEventListener('scroll', handleScrollSync);
    };
  }, [code, fontSize]);
  
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchResultsCount, setSearchResultsCount] = useState<number | null>(null);

  const lines = code.split('\n');

  // Intercept scroll to sync line numbers gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Intercept Tab presses for formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      onChange(newValue);
      
      // Restore cursor position post-render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Handle word count & metrics
  const charCount = code.length;
  const wordCount = code.trim().split(/\s+/).filter(Boolean).length;
  const byteCount = new Blob([code]).size;

  const styleConfig = THEME_STYLES[theme] || THEME_STYLES['dark-slate'];

  // Search inside code
  useEffect(() => {
    if (!searchQuery) {
      setSearchResultsCount(null);
      return;
    }
    try {
      const regex = new RegExp(searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const matches = code.match(regex);
      setSearchResultsCount(matches ? matches.length : 0);
    } catch (err) {
      setSearchResultsCount(0);
    }
  }, [searchQuery, code]);

  const handleReplace = () => {
    if (!searchQuery) return;
    try {
      const regex = new RegExp(searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const nextCode = code.replace(regex, replaceQuery);
      onChange(nextCode);
    } catch (err) {
      // Quiet fail
    }
  };

  // Safe proportional spacing calculations
  const cellLineHeight = '24px';
  const pyPaddingValue = '16px'; // Matches exactly

  return (
    <div className={`relative flex flex-col h-full rounded-xl overflow-hidden font-mono text-sm transition-all duration-200 border border-neutral-200/10 ${styleConfig.container}`} id="code-editor-root">
      {/* Search HUD */}
      {searchOpen && (
        <div className="absolute top-12 right-4 z-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg shadow-xl flex flex-col gap-2 max-w-sm w-full font-sans transition-all" id="search-hud">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
              <Search className="w-3.5 h-3.5" /> Buscar e Ir
            </span>
            <button 
              onClick={() => { setSearchOpen(false); setSearchQuery(''); setReplaceQuery(''); }}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-violet-500 text-neutral-800 dark:text-neutral-100"
            />
            {searchResultsCount !== null && (
              <span className="text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 px-1.5 py-1 rounded text-neutral-500">
                {searchResultsCount}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Reemplazar con..." 
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-violet-500 text-neutral-800 dark:text-neutral-100"
            />
            <button 
              onClick={handleReplace}
              disabled={!searchQuery}
              className="text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-md font-medium transition cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Editor Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2D35] bg-[#1A1D23] font-sans" id="editor-controls-bar">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-[#9CA3AF] capitalize">
            {language === 'html' ? 'HTML5 Sandbox' : language}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Size Adjust */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Type className="w-3.5 h-3.5" />
            <button 
              onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
              disabled={fontSize <= 12}
              className="px-1.5 py-0.5 rounded border border-[#2A2D35] bg-[#1F2229] hover:bg-[#2D3139] disabled:opacity-40 cursor-pointer text-[#E0E0E0]"
              title="Reducir fuente"
            >
              -
            </button>
            <span className="min-w-6 text-center text-[11px] text-[#9CA3AF]">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              disabled={fontSize >= 22}
              className="px-1.5 py-0.5 rounded border border-[#2A2D35] bg-[#1F2229] hover:bg-[#2D3139] disabled:opacity-40 cursor-pointer text-[#E0E0E0]"
              title="Aumentar fuente"
            >
              +
            </button>
          </div>

          <div className="h-4 w-px bg-[#2A2D35]" />

          {/* Search Toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className={`p-1 rounded cursor-pointer transition ${searchOpen ? 'text-blue-400 bg-[#2563eb]/20' : 'text-[#6B7280] hover:text-[#E0E0E0] hover:bg-[#1F2229]'}`}
            title="Buscar en código (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Code Gutter & Workspace Area */}
      <div className="relative flex flex-1 overflow-hidden" style={{ minHeight: '260px' }}>
        {/* Line Numbers Column */}
        <div 
          ref={gutterRef}
          className={`w-12 select-none text-right pr-3 overflow-hidden ${styleConfig.lineGutter}`}
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: cellLineHeight,
            paddingTop: pyPaddingValue,
            paddingBottom: pyPaddingValue
          }}
          id="editor-gutter"
        >
          {lines.map((_, i) => (
            <div 
              key={i} 
              style={{ height: cellLineHeight, lineHeight: cellLineHeight }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={`flex-1 px-4 outline-none border-0 overflow-auto ${styleConfig.textarea} ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: cellLineHeight,
            paddingTop: pyPaddingValue,
            paddingBottom: pyPaddingValue,
            fontFamily: '"JetBrains Mono", "Fira Code", Courier, monospace',
            resize: 'none'
          }}
          placeholder="Escribe tu código aquí..."
          id="editor-textarea-trigger"
        />
      </div>

      {/* Code Editor Status Specs */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#2A2D35] bg-[#16181D] font-sans text-[10px] text-[#4B5563] uppercase tracking-widest font-bold select-none" id="editor-status-specs">
        <div className="flex gap-4">
          <span>Líneas: <strong className="text-[#9CA3AF]">{lines.length}</strong></span>
          <span>Caracteres: <strong className="text-[#9CA3AF]">{charCount}</strong></span>
          <span>Palabras: <strong className="text-[#9CA3AF] font-bold">{wordCount}</strong></span>
        </div>
        <div>
          <span>Tamaño: <strong className="text-[#9CA3AF]">{byteCount < 1024 ? `${byteCount} B` : `${(byteCount / 1024).toFixed(1)} KB`}</strong></span>
        </div>
      </div>
    </div>
  );
}
