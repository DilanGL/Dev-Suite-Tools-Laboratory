import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Copy, Trash2, Code, Eye, 
  Layers, Check, Calendar, FileCode, Hash, 
  ChevronRight, Sparkles, FolderCode, Tag, 
  Menu, X, HelpCircle, ArrowUpRight, Play,
  CopyCheck, Sliders, RefreshCw, FileDown, 
  FileUp, BookMarked, Code2
} from 'lucide-react';
import { Snippet, EditorTheme } from './types';
import { DEFAULT_SNIPPETS } from './defaultSnippets';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';

const AVAILABLE_LANGUAGES = [
  { value: 'todos', label: 'Todos los lenguajes' },
  { value: 'html', label: 'HTML5 Sandbox' },
  { value: 'css', label: 'CSS Stylesheet' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' }
];

export default function App() {
  // Main snippets database state
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeSnippet, setActiveSnippet] = useState<Snippet | null>(null);

  // Search & Filtering configurations
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('todos');
  const [selectedTag, setSelectedTag] = useState('todos');

  // Interactive View modes for right panel:
  // - 'split': Code & Preview side-by-side
  // - 'code': Pure Code Editor layout
  // - 'preview': Pure Sandbox visual layout
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split');
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('dark-slate');

  // Collapsible Left Panel sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Pagination setups (max 5 saved code entities per view)
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Draggable Split Workspace width settings: slider percentage size
  const [splitWidth, setSplitWidth] = useState<number>(50); // percentage for code part
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // UX Feedback actions
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load database on mount
  useEffect(() => {
    const database = localStorage.getItem('code_snippets');
    if (database) {
      try {
        const parsed = JSON.parse(database) as Snippet[];
        setSnippets(parsed);
        if (parsed.length > 0) {
          setActiveSnippet(parsed[0]);
        }
      } catch (e) {
        console.error("Corrupted snippets storage. Appending defaults.");
        setSnippets(DEFAULT_SNIPPETS);
        setActiveSnippet(DEFAULT_SNIPPETS[0]);
      }
    } else {
      setSnippets(DEFAULT_SNIPPETS);
      setActiveSnippet(DEFAULT_SNIPPETS[0]);
      localStorage.setItem('code_snippets', JSON.stringify(DEFAULT_SNIPPETS));
    }
  }, []);

  // Save database to localStorage whenever any snippet changes
  const saveToLocalStorage = (updatedList: Snippet[]) => {
    setSnippets(updatedList);
    localStorage.setItem('code_snippets', JSON.stringify(updatedList));
  };

  // Toast dispatch helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Drag logic for split screen resizer pane
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('main-editor-preview-frame');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      // Clamp between 20% and 80% to keep things clean and visible
      const percentage = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
      setSplitWidth(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle auto-reset pagination whenever search terms or filters are mutated
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLanguage, selectedTag]);

  // Create a new fresh snippet with an elegant default HTML5 standard container boilerplate skeleton
  const handleCreateSnippet = () => {
    const newSnippet: Snippet = {
      id: `snip-${Date.now()}`,
      title: 'Nuevo fragmento HTML5',
      description: 'Estructura semántica básica e impecable por defecto.',
      code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Sandbox HTLM5</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: radial-gradient(circle at 50% 50%, #151a30 0%, #0b0d19 100%);
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      color: #ffffff;
      overflow: hidden;
    }
    
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    h1 {
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 12px;
      background: linear-gradient(to right, #3b82f6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>¡Esqueleto HTML5 Listo!</h1>
    <p>Este es un fragmento con la estructura básica requerida (html, head, body, style). Edita el editor para ver cambios en vivo.</p>
  </div>
</body>
</html>`,
      language: 'html',
      tags: ['Básico'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextSnippets = [newSnippet, ...snippets];
    saveToLocalStorage(nextSnippets);
    setActiveSnippet(newSnippet);
    showToast('✨ Fragmento creado con éxito');
    setMobileSidebarOpen(false);
  };

  // Edit / update details of the currently active snippet
  const handleUpdateSnippet = (updatedFields: Partial<Snippet>) => {
    if (!activeSnippet) return;

    const updated = {
      ...activeSnippet,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    setActiveSnippet(updated);

    const nextSnippets = snippets.map(item => 
      item.id === updated.id ? updated : item
    );
    saveToLocalStorage(nextSnippets);
  };

  // Duplicate a selected code snippet
  const handleDuplicateSnippet = (target: Snippet, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering parent item clicks in list

    const duplicated: Snippet = {
      ...target,
      id: `snip-${Date.now()}`,
      title: `${target.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextSnippets = [duplicated, ...snippets];
    saveToLocalStorage(nextSnippets);
    setActiveSnippet(duplicated);
    showToast('📂 Fragmento duplicado');
  };

  // Delete a snippet safely
  const handleDeleteSnippet = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este fragmento de tu biblioteca?');
    if (!confirmed) return;

    const remaining = snippets.filter(item => item.id !== idToDelete);
    saveToLocalStorage(remaining);

    if (activeSnippet?.id === idToDelete) {
      setActiveSnippet(remaining.length > 0 ? remaining[0] : null);
    }
    showToast('🗑️ Fragmento eliminado');
  };

  // Copy code directly to clipboard (combines modern & legacy fallback approaches)
  const handleCopyCode = async (text: string) => {
    if (!activeSnippet) return;
    
    let ok = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      // Quiet fail to fallback
    }

    if (!ok) {
      const copyArea = document.createElement("textarea");
      copyArea.value = text;
      copyArea.style.position = "fixed";
      document.body.appendChild(copyArea);
      copyArea.focus();
      copyArea.select();
      try {
        document.execCommand('copy');
        ok = true;
      } catch {
        ok = false;
      }
      document.body.removeChild(copyArea);
    }

    if (ok) {
      setCopiedId(activeSnippet.id);
      showToast('📋 Código copiado al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      showToast('❌ Error al copiar');
    }
  };

  // Extract unique tags across the entire user catalog
  const availableTags = Array.from(
    new Set(snippets.flatMap(snip => snip.tags || []))
  ).filter(Boolean);

  // Filter snippets list
  const filteredSnippets = snippets.filter(snip => {
    const matchesSearch = 
      snip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (snip.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLanguage = 
      selectedLanguage === 'todos' || 
      snip.language.toLowerCase() === selectedLanguage.toLowerCase();

    const matchesTag = 
      selectedTag === 'todos' || 
      (snip.tags || []).includes(selectedTag);

    return matchesSearch && matchesLanguage && matchesTag;
  });

  // Handle adding custom tags
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSnippet || !tagInput.trim()) return;

    const refinedTag = tagInput.trim();
    const currentTags = activeSnippet.tags || [];

    if (currentTags.includes(refinedTag)) {
      setTagInput('');
      return;
    }

    handleUpdateSnippet({
      tags: [...currentTags, refinedTag]
    });
    setTagInput('');
    showToast(`🏷️ Etiqueta '${refinedTag}' añadida`);
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeSnippet) return;
    const currentTags = activeSnippet.tags || [];
    handleUpdateSnippet({
      tags: currentTags.filter(t => t !== tagToRemove)
    });
    showToast(`Etiqueta removida`);
  };

  // Format datetimes elegantly in Spanish
  const formatDate = (isoStr: string) => {
    if (!isoStr) return '--';
    const date = new Date(isoStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Backup catalog as JSON to trigger browser downloads
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `copia-biblioteca-codigo-${new Date().toISOString().substring(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 Backup exportado con éxito');
    } catch {
      showToast('❌ Error al exportar');
    }
  };

  // Import backup file from JSON and merge
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as Snippet[];
        if (!Array.isArray(parsed)) throw new Error();
        
        // Merge without duplicates based on title/code
        const existingIdentifiers = snippets.map(s => s.code.substring(0, 40));
        const filteredNew = parsed.filter(newS => !existingIdentifiers.includes(newS.code.substring(0, 40)));

        const merged = [...filteredNew, ...snippets];
        saveToLocalStorage(merged);
        if (merged.length > 0) {
          setActiveSnippet(merged[0]);
        }
        showToast(`📁 Importados ${filteredNew.length} fragmentos nuevos`);
      } catch {
        showToast('❌ Archivo de backup inválido');
      }
    };
    fileReader.readAsText(file);
  };

  // Pagination bounds arithmetic
  const totalPages = Math.ceil(filteredSnippets.length / ITEMS_PER_PAGE);
  const paginatedSnippets = filteredSnippets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E0E0E0] flex flex-col font-sans" id="app-root-main">
      {/* Toast Alert Prompt */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#16181D] text-white text-xs font-semibold px-4 py-2.5 rounded border border-[#2A2D35] shadow-2xl flex items-center gap-2 select-none"
            id="toast-notification"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Navigation Header - Centered Typography Branding and Empty of buttons */}
      <header className="bg-[#16181D] border-b border-[#2A2D35] px-4 py-3 shrink-0" id="main-header">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center select-none">
          <div className="flex items-center gap-2">
            <div className="w-5.5 h-5.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded flex items-center justify-center shadow-md shadow-blue-500/10">
              <Code className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-bold tracking-wider text-white uppercase leading-none">
              SnippetForge
            </h1>
          </div>
          <p className="text-[10px] text-[#4B5563] font-bold font-mono uppercase tracking-widest mt-1">
            Estación de Trabajo de Código
          </p>
        </div>
      </header>

      {/* Floating Restore Button for Collapsed Sidebar - Abajo a la izquierda */}
      {(!sidebarVisible || (typeof window !== "undefined" && window.innerWidth < 1024 && !mobileSidebarOpen)) && (
        <button
          onClick={() => {
            setSidebarVisible(true);
            setMobileSidebarOpen(true);
          }}
          className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 hover:bg-blue-500 border border-blue-400/20 rounded-full text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition flex items-center justify-center"
          title="Descolapsar panel lateral"
          id="restore-sidebar-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Main Workspace Frame container */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex overflow-hidden min-h-0" id="main-workspace">
        
        {/* PANEL IZQUIERDO: Biblioteca de Fragmentos */}
        <aside className={`
          fixed lg:static inset-y-16 lg:inset-y-0 left-0 bg-[#16181D] z-30 flex flex-col shrink-0 transform transition-all duration-300 ease-in-out border-r border-[#2A2D35]
          ${sidebarVisible ? 'w-80 lg:w-85' : 'w-0 lg:w-0 overflow-hidden border-r-transparent'}
          ${mobileSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0'}
        `} id="left-snippets-panel">
          
          {/* Header Search & Filtering */}
          <div className="p-4 border-b border-[#2A2D35] flex flex-col gap-3 shrink-0 bg-[#0F1115]/40">
            
            {/* Header top row with collapse button inside list */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider font-mono">Búsqueda y Filtros</span>
              <button
                onClick={() => {
                  setSidebarVisible(false);
                  setMobileSidebarOpen(false);
                }}
                className="p-1 px-2 hover:bg-[#1F2229] border border-[#2A2D35]/50 hover:border-red-500/30 rounded text-[#9CA3AF] hover:text-red-400 transition cursor-pointer text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
                title="Colapsar panel lateral"
                id="collapse-sidebar-inner-btn"
              >
                <span>Colapsar</span>
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#4B5563] w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título o nota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2 border border-[#2A2D35] rounded-md bg-[#1F2229] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-white transition placeholder-[#4B5563]"
                id="snippet-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-[#2D3139] text-[#6B7280] hover:text-white outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Language Selection Filter */}
            <div className="space-y-1.5" id="language-filter-block">
              <label className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest block font-mono">Filtrar por Lenguaje</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#2A2D35] bg-[#1F2229] text-[#D1D5DB] focus:border-blue-500 select-none outline-none transition cursor-pointer"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Tag Filter dropdown list */}
            <div className="space-y-1.5" id="tags-filter-block">
              <label className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest block font-mono">Filtrar por Etiqueta</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#2A2D35] bg-[#1F2229] text-[#D1D5DB] focus:border-blue-500 select-none outline-none transition cursor-pointer"
              >
                <option value="todos">Todas las etiquetas</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Loaded Snippets (DENSITY SLIGHTLY LOWER: Spacing improved & paddings expanded) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0F1115]/20" id="snippets-viewport-list">
            <div className="flex items-center justify-between px-1 py-1 select-none text-[10px] font-bold text-[#4B5563] uppercase tracking-wider font-mono">
              <span>Códigos guardados</span>
              <span className="bg-[#1F2229] border border-[#2A2D35] text-[#9CA3AF] px-1.5 py-0.5 rounded text-[10px] font-bold">
                {filteredSnippets.length}
              </span>
            </div>

            {paginatedSnippets.length === 0 ? (
              <div className="py-20 text-center px-4 animate-fade-in" id="empty-state-list">
                <BookMarked className="w-8 h-8 text-[#2D3139] mx-auto mb-3" />
                <p className="text-[#9CA3AF] text-xs font-semibold">No se encontraron fragmentos</p>
                <p className="text-[#4B5563] text-[10px] mt-1 leading-normal">Prueba a reajustar los filtros de búsqueda o crea uno nuevo.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {paginatedSnippets.map((snippet) => {
                  const isActive = activeSnippet?.id === snippet.id;
                  const normalizedLang = snippet.language.toUpperCase();

                  return (
                    <motion.div
                      key={snippet.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      onClick={() => {
                        setActiveSnippet(snippet);
                        setMobileSidebarOpen(false);
                      }}
                      className={`
                        relative p-4 rounded-lg border transition-all cursor-pointer group flex flex-col gap-2 select-none
                        ${isActive 
                          ? 'bg-[#1F2229] border-blue-500/80 shadow-md shadow-blue-500/5' 
                          : 'bg-transparent border-[#2A2D35]/30 hover:bg-[#1A1D23] border-b'
                        }
                      `}
                      id={`snippet-item-card-${snippet.id}`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r" />
                      )}

                      {/* Snippet Card Header (Title & Action Buttons) */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-[#D1D5DB]'}`}>
                            {snippet.title}
                          </h3>
                          <span className="font-mono text-[9px] text-[#3B82F6] font-bold mt-1 inline-block uppercase tracking-wider bg-[#3B82F6]/10 px-1.5 py-0.5 rounded">
                            {normalizedLang}
                          </span>
                        </div>

                        {/* Action triggers hover layout */}
                        <div className="flex items-center gap-1.5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDuplicateSnippet(snippet, e)}
                            className="p-1 bg-[#1F2229] hover:bg-[#2D3139] border border-[#2A2D35] rounded text-[#9CA3AF] hover:text-white transition cursor-pointer"
                            title="Duplicar fragmento de código"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSnippet(snippet.id, e)}
                            className="p-1 bg-rose-950/40 hover:bg-rose-950 border border-rose-900/40 rounded text-rose-400 hover:text-white transition cursor-pointer"
                            title="Eliminar fragmento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Small Description Snippet block */}
                      {snippet.description && (
                        <p className="text-[11px] text-[#9CA3AF] line-clamp-1 px-0.5 leading-relaxed mt-0.5">
                          {snippet.description}
                        </p>
                      )}

                      {/* Small details footer */}
                      <div className="flex flex-wrap gap-1 items-center justify-between mt-1 pt-2 border-t border-[#2A2D35]/30">
                        <div className="flex flex-wrap gap-1 max-w-[70%]">
                          {(snippet.tags || []).slice(0, 2).map((t) => (
                            <span 
                              key={t}
                              className="bg-[#1A1D23] text-[#9CA3AF] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#2A2D35]/40"
                            >
                              #{t}
                            </span>
                          ))}
                          {(snippet.tags || []).length > 2 && (
                            <span className="text-[9px] text-[#4B5563] font-bold">
                              +{(snippet.tags || []).length - 2}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-[9px] text-[#4B5563] font-mono">
                          {formatDate(snippet.updatedAt).substring(0, 11)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#2A2D35] bg-[#0F1115] select-none text-xs shrink-0" id="snippets-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2 py-1 bg-[#1F2229] border border-[#2A2D35] hover:border-blue-500/50 hover:bg-[#2D3139] disabled:opacity-40 rounded text-white text-[10px] font-bold uppercase transition disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-[#9CA3AF] text-[10px] font-mono select-none">
                Pág. <strong>{currentPage}</strong> de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2 py-1 bg-[#1F2229] border border-[#2A2D35] hover:border-blue-500/50 hover:bg-[#2D3139] disabled:opacity-40 rounded text-white text-[10px] font-bold uppercase transition disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}

          <div className="p-3 border-t border-[#2A2D35] text-center shrink-0 bg-[#0F1115] text-[10px] text-[#4B5563] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 font-mono select-none">
            <span>Actualización:</span>
            <strong>{new Date().toISOString().substring(0, 10)}</strong>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* PANEL DERECHO: Editor, Preview, y Metadatos del fragmento */}
        <main className="flex-1 flex flex-col bg-[#0F1115] min-w-0" id="right-workspace-panel">
          
          {activeSnippet ? (
            <div className="flex-1 flex flex-col min-h-0" id="active-snippet-editor-view">
              
              {/* Panel de Control Principal del Workspace (Dividido en 2 Partes) */}
              <div className="shrink-0 bg-[#16181D] border-b border-[#2A2D35] flex flex-col divide-y divide-[#2A2D35]" id="workspace-control-panel">
                
                {/* PARTE 1: Elementos Básicos (Acciones del Sistema) */}
                <div className="p-3 bg-[#111317] flex flex-wrap items-center justify-between gap-3 text-xs" id="control-panel-part-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botón Nuevo Código */}
                    <button
                      onClick={handleCreateSnippet}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition cursor-pointer"
                      id="control-create-snippet-btn"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>NUEVO CÓDIGO</span>
                    </button>

                    {/* Exportar */}
                    <button 
                      onClick={handleExportBackup}
                      className="px-3 py-1.5 border border-[#2A2D35] bg-[#1F2229] hover:bg-[#2D3139] hover:border-blue-500/40 rounded-md text-[#9CA3AF] hover:text-white text-[11px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
                      title="Exportar biblioteca de fragmentos"
                      id="control-export-btn"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Exportar</span>
                    </button>
                    
                    {/* Importar */}
                    <label 
                      className="px-3 py-1.5 border border-[#2A2D35] bg-[#1F2229] hover:bg-[#2D3139] hover:border-blue-500/40 rounded-md text-[#9CA3AF] hover:text-white text-[11px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
                      title="Importar biblioteca (.json)"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Importar</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportBackup} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Acciones específicas del código activo (Copiar, Duplicar, Eliminar) */}
                  <div className="flex items-center gap-2">
                    {/* Copiar Código */}
                    <button
                      onClick={() => handleCopyCode(activeSnippet.code)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer whitespace-nowrap ${
                        copiedId === activeSnippet.id
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-[#1F2229] hover:bg-blue-600 border border-[#2A2D35] hover:border-blue-500 text-white'
                      }`}
                      id="control-copy-btn"
                    >
                      {copiedId === activeSnippet.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-300 animate-bounce" />
                          <span>¡COPIADO!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-200" />
                          <span>COPIAR CÓDIGO</span>
                        </>
                      )}
                    </button>

                    {/* Duplicar */}
                    <button
                      onClick={(e) => handleDuplicateSnippet(activeSnippet, e)}
                      className="p-1.5 border border-[#2A2D35] bg-[#1F2229] hover:border-blue-500/50 hover:bg-[#2D3139] rounded-md text-[#9CA3AF] hover:text-white cursor-pointer transition select-none"
                      title="Duplicar este fragmento"
                      id="control-duplicate-btn"
                    >
                      <CopyCheck className="w-4 h-4" />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={(e) => handleDeleteSnippet(activeSnippet.id, e)}
                      className="p-1.5 border border-[#2A2D35] bg-[#1F2229] hover:border-[#EF4444]/50 hover:bg-rose-950/40 rounded-md text-[#9CA3AF] hover:text-red-400 cursor-pointer transition select-none"
                      title="Eliminar este fragmento"
                      id="control-delete-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PARTE 2: Lo que tiene que ver con el código (Título, Descripción, Lenguaje, Etiquetas) */}
                <div className="p-4 bg-[#16181D] flex flex-col gap-3" id="control-panel-part-2">
                  {/* Fila superior: Título e inputs de texto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest block font-mono">Título del Fragmento</label>
                      <input
                        type="text"
                        value={activeSnippet.title}
                        onChange={(e) => handleUpdateSnippet({ title: e.target.value })}
                        placeholder="Introduce el título..."
                        className="w-full text-xs font-bold text-white bg-[#1F2229] border border-[#2A2D35] focus:border-blue-500 px-3 py-1.5 rounded-md outline-none transition"
                        id="control-title-input"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest block font-mono">Descripción o Notas</label>
                      <input
                        type="text"
                        value={activeSnippet.description}
                        onChange={(e) => handleUpdateSnippet({ description: e.target.value })}
                        placeholder="Añade notas acerca del comportamiento del código..."
                        className="w-full text-xs text-[#9CA3AF] bg-[#1F2229] border border-[#2A2D35] focus:border-blue-500 px-3 py-1.5 rounded-md outline-none transition"
                        id="control-desc-input"
                      />
                    </div>
                  </div>

                  {/* Fila inferior: Lenguaje y Etiquetas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2 border-t border-[#2A2D35]/30">
                    {/* Selección de Lenguaje */}
                    <div className="flex items-center gap-2 md:col-span-1">
                      <span className="text-[10px] font-bold font-mono text-[#4B5563] uppercase tracking-wider whitespace-nowrap">Lenguaje:</span>
                      <select
                        value={activeSnippet.language}
                        onChange={(e) => handleUpdateSnippet({ language: e.target.value })}
                        className="w-full text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition cursor-pointer"
                        id="control-language-picker"
                      >
                        {AVAILABLE_LANGUAGES.filter(la => la.value !== 'todos').map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Editor de Etiquetas */}
                    <div className="flex items-center gap-2 md:col-span-2">
                      <span className="text-[10px] font-bold font-mono text-[#4B5563] uppercase tracking-wider whitespace-nowrap">Etiquetas:</span>
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 select-none">
                        {/* Current tag badges */}
                        {(activeSnippet.tags || []).map(tag => (
                          <span 
                            key={tag}
                            className="inline-flex items-center bg-[#1F2229]/60 border border-[#2A2D35] text-[#9CA3AF] text-[10px] font-semibold px-2 py-0.5 rounded pl-2 pr-1.5 group transition"
                          >
                            #{tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="bg-transparent hover:bg-[#2D3139] ml-1 rounded-full p-0.5 text-[#6B7280] hover:text-red-400 cursor-pointer outline-none"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}

                        {/* Append tags form micro inline element */}
                        <form onSubmit={handleAddTag} className="inline-flex items-center ml-1">
                          <input
                            type="text"
                            placeholder="+ Añadir"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            maxLength={16}
                            className="bg-transparent font-medium border-dashed border border-[#2A2D35] text-[#6B7280] placeholder-[#4B5563] text-[10px] px-2 py-0.5 rounded w-16 focus:w-24 focus:border-blue-500 outline-none transition"
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Selector Controls for Workspace Layout: Code, Split or Preview */}
              <div className="shrink-0 bg-[#0F1115] px-4 py-2 border-b border-[#2A2D35] flex flex-col md:flex-row md:items-center justify-between gap-2.5 select-none" id="workspace-layout-controls">
                
                {/* Mode Selector pills */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider mr-2">Distribución:</span>
                  <div className="bg-[#16181D] p-0.5 rounded border border-[#2A2D35] flex">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition ${viewMode === 'code' ? 'bg-blue-600 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Editor</span>
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition ${viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Dividido</span>
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Vista Previa</span>
                    </button>
                  </div>
                </div>

                {/* Editor Dark/Light Skin Theme configuration selecting */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Estilo de Editor:</span>
                  <div className="flex gap-1 bg-[#16181D] p-0.5 rounded border border-[#2A2D35]">
                    {(['dark-slate', 'light-studio', 'github-dark', 'monokai'] as EditorTheme[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setEditorTheme(t)}
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded cursor-pointer transition ${editorTheme === t ? 'bg-blue-600 text-white' : 'text-[#4B5563] hover:text-[#9CA3AF]'}`}
                      >
                        {t.replace('-',' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main functional workspace blocks - Support for Drag Resizing */}
              <div className="flex-1 min-h-0 p-4 bg-[#0F1115] relative" id="main-editor-preview-frame">
                
                {viewMode === 'code' && (
                  <CodeEditor
                    code={activeSnippet.code}
                    onChange={(nextCode) => handleUpdateSnippet({ code: nextCode })}
                    language={activeSnippet.language}
                    theme={editorTheme}
                  />
                )}

                {viewMode === 'preview' && (
                  <LivePreview
                    code={activeSnippet.code}
                    language={activeSnippet.language}
                  />
                )}

                {viewMode === 'split' && (
                  <div className="flex flex-row w-full h-full gap-3 relative min-h-0" id="split-workspace-double">
                    {/* Editor Pane (Width defined by splitWidth state, full horizontally side by side) */}
                    <div 
                      style={{ width: `${splitWidth}%` }} 
                      className="h-full min-w-0 flex flex-col"
                    >
                      <CodeEditor
                        code={activeSnippet.code}
                        onChange={(nextCode) => handleUpdateSnippet({ code: nextCode })}
                        language={activeSnippet.language}
                        theme={editorTheme}
                      />
                    </div>
                    
                    {/* Draggable Divider (Always visible and strictly horizontal resizing) */}
                    <div 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      className={`w-1 hover:w-2 bg-[#2A2D35] hover:bg-blue-500 cursor-col-resize transition-all h-full self-stretch shrink-0 rounded relative z-40 ${isDragging ? 'bg-blue-500 w-1.5' : ''}`}
                      title="Arrastra para ajustar tamaños"
                    />

                    {/* Preview Pane */}
                    <div 
                      style={{ width: `${100 - splitWidth}%` }} 
                      className="h-full min-w-0 flex flex-col"
                    >
                      <LivePreview
                        code={activeSnippet.code}
                        language={activeSnippet.language}
                      />
                    </div>

                    {/* Invisible protection mask to block preview frame mouse pointer ingestion while dragging */}
                    {isDragging && (
                      <div className="absolute inset-0 z-50 cursor-col-resize bg-transparent" />
                    )}
                  </div>
                )}
              </div>

              {/* Footer specs metadata (creation and modifying moments for the active one) */}
              <footer className="shrink-0 bg-[#16181D] border-t border-[#2A2D35] p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-[#4B5563] font-mono gap-1.5 uppercase tracking-widest font-bold select-none" id="active-footer-metadata">
                <div className="flex flex-col sm:flex-row sm:gap-6">
                  <span>Creado: <strong className="text-[#9CA3AF] font-bold">{formatDate(activeSnippet.createdAt)}</strong></span>
                  <span className="hidden sm:inline">|</span>
                  <span>Modificado: <strong className="text-[#9CA3AF] font-bold">{formatDate(activeSnippet.updatedAt)}</strong></span>
                </div>
                <div className="text-right flex items-center gap-1 text-[#4B5563]">
                  <FolderCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>ID: <strong className="text-[#9CA3AF]">{activeSnippet.id}</strong></span>
                </div>
              </footer>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" id="empty-state-full-workspace">
              <div className="w-16 h-16 bg-[#16181D] border border-[#2A2D35] rounded-xl flex items-center justify-center text-blue-400 mb-4 animate-pulse">
                <Code2 className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">No hay fragmentos en tu colección</h2>
              <p className="text-[#9CA3AF] text-xs mt-1.5 max-w-sm leading-normal">Crea tu primer fragmento o importa una copia de seguridad para empezar a organizar tu código.</p>
              
              <button
                onClick={handleCreateSnippet}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-widest transition cursor-pointer"
              >
                Crear Fragmento
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
