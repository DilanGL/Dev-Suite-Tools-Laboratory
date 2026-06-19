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

  // Create a new fresh snippet
  const handleCreateSnippet = () => {
    const newSnippet: Snippet = {
      id: `snip-${Date.now()}`,
      title: 'Nuevo fragmento',
      description: 'Mi pequeña descripción / notas sobre el fragmento...',
      code: `<!-- Nuevo componente HTML -->\n<div class="test-card">\n  <h2>¡Hola Mundo!</h2>\n  <p>Edita este código para verlo renderizado.</p>\n</div>\n\n<style>\n  .test-card {\n    padding: 20px;\n    border-radius: 12px;\n    background: linear-gradient(to right, #8b5cf6, #3b82f6);\n    color: white;\n    text-align: center;\n    font-family: sans-serif;\n  }\n</style>`,
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

      {/* Main App Navigation Header */}
      <header className="bg-[#16181D] border-b border-[#2A2D35] sticky top-0 z-40 px-4 py-2.5 shrink-0" id="main-header">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 hover:bg-[#1F2229] rounded text-[#9CA3AF] cursor-pointer"
              aria-label="Abrir menú"
              id="mobile-sidebar-toggle"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded flex items-center justify-center shadow-md shadow-blue-500/10">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold font-display tracking-wider text-white uppercase leading-none">
                  SnippetForge
                </h1>
                <p className="text-[9px] text-[#4B5563] font-bold font-mono uppercase tracking-widest mt-0.5">
                  Estación de Trabajo de Código
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backup Operations */}
            <div className="flex items-center gap-1.5 border border-[#2A2D35] bg-[#0F1115] rounded p-0.5" id="backup-actions">
              <button 
                onClick={handleExportBackup}
                className="p-1 px-2 hover:bg-[#16181D] rounded text-[#9CA3AF] hover:text-white text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                title="Exportar biblioteca de fragmentos"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              
              <label 
                className="p-1 px-2 hover:bg-[#16181D] rounded text-[#9CA3AF] hover:text-white text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                title="Importar biblioteca de fragmentos (.json)"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Importar</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Main Creative CTA Trigger */}
            <button
               onClick={handleCreateSnippet}
               className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-98 transition cursor-pointer"
               id="header-create-snippet-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NUEVO CÓDIGO</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex overflow-hidden min-h-0" id="main-workspace">
        
        {/* PANEL IZQUIERDO: Biblioteca de Fragmentos */}
        <aside className={`
          fixed lg:static inset-y-16 lg:inset-y-0 left-0 w-80 lg:w-85 border-r border-[#2A2D35] bg-[#16181D] z-30 flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} id="left-snippets-panel">
          
          {/* Header Search & Filtering */}
          <div className="p-4 border-b border-[#2A2D35] flex flex-col gap-3 shrink-0 bg-[#0F1115]/40">
            
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
              <label className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest block">Filtrar por Lenguaje</label>
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

            {/* Dynamic Tag Filter Badge slider */}
            <div className="space-y-1.5" id="tags-filter-block">
              <label className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest block">Filtrar por Etiqueta</label>
              <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                <button
                  onClick={() => setSelectedTag('todos')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition shrink-0 cursor-pointer ${
                    selectedTag === 'todos' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#1F2229] text-[#9CA3AF] hover:bg-[#2D3139] border border-[#2A2D35]'
                  }`}
                >
                  Todos
                </button>
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition shrink-0 cursor-pointer ${
                      selectedTag === tag 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-[#1F2229] text-[#9CA3AF] hover:bg-[#2D3139] border border-[#2A2D35]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Loaded Snippets */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0F1115]/20" id="snippets-viewport-list">
            <div className="flex items-center justify-between px-2 py-1 select-none text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">
              <span>Códigos guardados</span>
              <span className="bg-[#1F2229] border border-[#2A2D35] text-[#9CA3AF] px-1.5 py-0.5 rounded text-[10px]">
                {filteredSnippets.length}
              </span>
            </div>

            {filteredSnippets.length === 0 ? (
              <div className="py-20 text-center px-4" id="empty-state-list">
                <BookMarked className="w-8 h-8 text-[#2D3139] mx-auto mb-3" />
                <p className="text-[#9CA3AF] text-xs font-semibold">No se encontraron fragmentos</p>
                <p className="text-[#4B5563] text-[10px] mt-1 leading-normal">Prueba a reajustar los filtros de búsqueda o crea uno nuevo.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredSnippets.map((snippet) => {
                  const isActive = activeSnippet?.id === snippet.id;
                  const normalizedLang = snippet.language.toUpperCase();

                  return (
                    <motion.div
                      key={snippet.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => {
                        setActiveSnippet(snippet);
                        setMobileSidebarOpen(false);
                      }}
                      className={`
                        relative p-3 rounded border transition-all cursor-pointer group flex flex-col gap-2 select-none
                        ${isActive 
                          ? 'bg-[#1F2229] border-[#3B82F6] shadow-md shadow-[#3B82F6]/5' 
                          : 'bg-transparent border-transparent hover:bg-[#1A1D23] border-b border-[#2A2D35]/30'
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
                          <span className="font-mono text-[9px] text-[#3B82F6] font-bold mt-0.5 inline-block uppercase tracking-wider bg-[#3B82F6]/10 px-1 rounded">
                            {normalizedLang}
                          </span>
                        </div>

                        {/* Action triggers hover layout */}
                        <div className="flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDuplicateSnippet(snippet, e)}
                            className="p-1 bg-[#1F2229] hover:bg-[#2D3139] border border-[#2A2D35] rounded text-[#9CA3AF] hover:text-white transition cursor-pointer"
                            title="Duplicar fragmento de código"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSnippet(snippet.id, e)}
                            className="p-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 rounded text-rose-400 hover:text-white transition cursor-pointer"
                            title="Eliminar fragmento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Small Description Snippet block */}
                      {snippet.description && (
                        <p className="text-[11px] text-[#9CA3AF] line-clamp-1 px-0.5 leading-normal">
                          {snippet.description}
                        </p>
                      )}

                      {/* Small details footer */}
                      <div className="flex flex-wrap gap-1 items-center justify-between mt-1 pt-1.5 border-t border-[#2A2D35]/30">
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

          <div className="p-4 border-t border-[#2A2D35] text-center shrink-0 bg-[#0F1115] text-[10px] text-[#4B5563] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 font-mono select-none">
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
              
              {/* Header con nombre editable, notas, y botón de copiar */}
              <div className="shrink-0 bg-[#16181D] border-b border-[#2A2D35] p-4 flex flex-col gap-3 shadow-xs" id="active-header-settings">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Title & Metadata inputs */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <input
                      type="text"
                      value={activeSnippet.title}
                      onChange={(e) => handleUpdateSnippet({ title: e.target.value })}
                      placeholder="Nombre del fragmento vacío"
                      className="w-full text-md sm:text-lg font-bold font-display text-white bg-transparent py-0.5 rounded outline-none border-b border-transparent focus:border-blue-500/50 focus:bg-[#1A1D23] transition px-1"
                      id="input-snippet-title-trigger"
                    />
                    
                    <input
                      type="text"
                      value={activeSnippet.description}
                      onChange={(e) => handleUpdateSnippet({ description: e.target.value })}
                      placeholder="Añade una descripción sobre cómo o cuándo usar este fragmento..."
                      className="w-full text-xs text-[#9CA3AF] bg-transparent py-0.5 rounded outline-none border-b border-transparent focus:border-blue-500/50 focus:bg-[#1A1D23] transition px-1"
                      id="input-snippet-desc-trigger"
                    />
                  </div>

                  {/* Copy, Duplicate, Delete triggers for active item */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0" id="active-header-triggers">
                    
                    {/* Copy Code Action trigger */}
                    <button
                      onClick={() => handleCopyCode(activeSnippet.code)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer whitespace-nowrap"
                      id="copy-to-clipboard-trigger"
                    >
                      {copiedId === activeSnippet.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-300" />
                          <span>¡COPIADO!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-200" />
                          <span>COPIAR CÓDIGO</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDuplicateSnippet(activeSnippet, e)}
                      className="p-2 border border-[#2A2D35] bg-[#1F2229] hover:border-blue-500/50 hover:bg-[#2D3139] rounded text-[#9CA3AF] hover:text-white cursor-pointer transition select-none"
                      title="Duplicar este fragmento"
                    >
                      <CopyCheck className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteSnippet(activeSnippet.id, e)}
                      className="p-2 border border-[#2A2D35] bg-[#1F2229] hover:border-red-500/50 hover:bg-rose-950/40 rounded text-[#9CA3AF] hover:text-red-400 cursor-pointer transition select-none"
                      title="Eliminar este fragmento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub row with Language choice & Tag editing pills */}
                <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-[#2A2D35]/30">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Lenguaje:</span>
                    <select
                      value={activeSnippet.language}
                      onChange={(e) => handleUpdateSnippet({ language: e.target.value })}
                      className="text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded px-2.5 py-1 focus:ring-1 focus:ring-blue-500 outline-none transition cursor-pointer"
                      id="snippets-active-language-picker"
                    >
                      {AVAILABLE_LANGUAGES.filter(la => la.value !== 'todos').map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Interactive Tags input and lists */}
                  <div className="flex items-center gap-2 flex-1 max-w-full md:max-w-xl">
                    <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Etiquetas:</span>
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 select-none">
                      {/* Current tag badges */}
                      {(activeSnippet.tags || []).map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center bg-[#1F2229] border border-[#2A2D35] text-[#9CA3AF] text-[10px] font-semibold px-2 py-0.5 rounded pl-2 pr-1.5 group transition"
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
                          className="bg-transparent font-medium border-dashed border border-[#2A2D35] text-[#6B7280] placeholder-[#4B5563] text-[10px] px-2 py-0.5 rounded w-20 focus:w-28 focus:border-blue-500 outline-none transition"
                        />
                      </form>
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

              {/* Main functional workspace blocks */}
              <div className="flex-1 min-h-0 p-4 bg-[#0F1115]" id="main-editor-preview-frame">
                
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full" id="split-workspace-double">
                    <div className="h-full min-h-0">
                      <CodeEditor
                        code={activeSnippet.code}
                        onChange={(nextCode) => handleUpdateSnippet({ code: nextCode })}
                        language={activeSnippet.language}
                        theme={editorTheme}
                      />
                    </div>
                    <div className="h-full min-h-0">
                      <LivePreview
                        code={activeSnippet.code}
                        language={activeSnippet.language}
                      />
                    </div>
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
