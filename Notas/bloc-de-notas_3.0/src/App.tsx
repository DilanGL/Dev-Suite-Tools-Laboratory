import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  NotebookPen, 
  Search, 
  Plus, 
  Trash2, 
  Pin, 
  Code2, 
  FileText, 
  Layout, 
  Eye, 
  Copy, 
  Check, 
  FileJson, 
  Type, 
  Trash, 
  CheckSquare, 
  KeyRound, 
  Layers, 
  FileCode,
  Sparkles,
  SearchCode,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Minus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Image,
  Link2,
  Upload,
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, NoteCategory, EditorFontSize, SaveStatus } from './types';
import { initialNotes } from './initialNotes';
import { formatJSONString, getTextStats } from './utils';
import MarkdownPreview from './components/MarkdownPreview';

const SPECIAL_CHAR_GROUPS = [
  {
    name: 'Flechas',
    chars: ['←', '→', '↑', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '⇒', '⇔', '▲', '▼', '◀', '▶']
  },
  {
    name: 'Símbolos',
    chars: ['•', '▪', '★', '☆', '✦', '✧', '♥', '♦', '♣', '♠', '✓', '✗', '☠', '☣', '☮', '☯', '▫', '¤', '☼', '☽', '♀', '♂']
  },
  {
    name: 'Fórmulas / Mat',
    chars: ['≠', '≈', '±', '×', '÷', '≤', '≥', '∑', '∏', '√', '∞', 'π', 'Ω', 'Δ', 'μ', 'α', 'β', 'θ', 'λ', '∫', '‰', '½', '¼', '¾']
  },
  {
    name: 'General',
    chars: ['©', '®', '™', '°', '¶', '§', '€', '£', '¥', '¢', '¡', '¿', '«', '»', '…', '¦', '¬', 'ˆ', '˜', '¯', '´', '¨']
  },
  {
    name: 'Música / Div',
    chars: ['☺', '☻', '♪', '♫', '♬', '♩', 'シ', 'ツ', '⚡', '☕', '✿', '❀', '❄', '✪']
  }
];

export default function App() {
  // Persistence Loading State
  const [notes, setNotes] = useState<Note[]>(() => {
    const stored = localStorage.getItem('devspace_notes');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return initialNotes;
      }
    }
    return initialNotes;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    const stored = localStorage.getItem('devspace_notes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Note[];
        return parsed.length > 0 ? parsed[0].id : null;
      } catch (e) {
        return initialNotes.length > 0 ? initialNotes[0].id : null;
      }
    }
    return initialNotes.length > 0 ? initialNotes[0].id : null;
  });

  // UI state filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'Todas'>('Todas');
  const [editorFontSize, setEditorFontSize] = useState<EditorFontSize>('md');
  const [isSplitView, setIsSplitView] = useState<boolean>(true);

  // Expanded/Collapsed Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('devspace_sidebar_collapsed');
    return stored === 'true';
  });

  const handleSetSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('devspace_sidebar_collapsed', String(collapsed));
  };

  // Special Characters Selector States
  const [showSpecialCharsPopover, setShowSpecialCharsPopover] = useState(false);

  // Custom text sizing popover state
  const [showSizePopover, setShowSizePopover] = useState(false);
  
  // Textarea Ref for cursor manipulation
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Save sync feedback status & notification toasts
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('synchronized');
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Refs & states for uploads / image addition
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageUrlPopover, setShowImageUrlPopover] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Search filter transition
  const [, startTransition] = useTransition();
  const [deferredSearchTerm, setDeferredSearchTerm] = useState('');

  // Refs for debouncing auto-saves
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of input elements to control updates
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Sync Search state responsively
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    startTransition(() => {
      setDeferredSearchTerm(val);
    });
  };

  // Toast Helper
  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Save full notes to LocalStorage
  const saveToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem('devspace_notes', JSON.stringify(updatedNotes));
  };

  // Trigger Save with exactly 400ms debounce
  const triggerAutoSave = (updatedNotes: Note[]) => {
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(updatedNotes);
      setSaveStatus('synchronized');
    }, 400); // 400ms as requested
  };

  // Refs for Undo/Redo history tracking
  const noteHistoryRef = useRef<Record<string, { past: string[]; future: string[] }>>({});
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoggedContentRef = useRef<Record<string, string>>({});

  const recordManualHistorySnapshot = (noteId: string, currentContent: string) => {
    if (!noteHistoryRef.current[noteId]) {
      noteHistoryRef.current[noteId] = { past: [], future: [] };
    }
    const hist = noteHistoryRef.current[noteId];
    if (hist.past.length === 0 || hist.past[hist.past.length - 1] !== currentContent) {
      if (hist.past.length >= 100) {
        hist.past.shift();
      }
      hist.past.push(currentContent);
      hist.future = [];
    }
    lastLoggedContentRef.current[noteId] = currentContent;
  };

  // Setup keyboard shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.id === 'active-note-textarea' || target.tagName === 'TEXTAREA')) {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
        ) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeNote, notes]);

  const handleUndo = () => {
    if (!activeNote) return;
    const hist = noteHistoryRef.current[activeNote.id];
    if (!hist || hist.past.length === 0) {
      showToast('No hay más cambios para deshacer', true);
      return;
    }

    // Capture current state to push to future stack
    const current = activeNote.content;
    hist.future.push(current);

    // Get the previous state
    const previous = hist.past.pop()!;
    
    // Update local cache
    lastLoggedContentRef.current[activeNote.id] = previous;

    // Apply previous content
    const updatedNotes = notes.map((note) => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          content: previous,
          updatedAt: Date.now(),
        };
      }
      return note;
    });
    setNotes(updatedNotes);
    triggerAutoSave(updatedNotes);
    showToast('Cambio deshecho');
  };

  const handleRedo = () => {
    if (!activeNote) return;
    const hist = noteHistoryRef.current[activeNote.id];
    if (!hist || hist.future.length === 0) {
      showToast('No hay más cambios para rehacer', true);
      return;
    }

    // Capture current state to push to past stack
    const current = activeNote.content;
    hist.past.push(current);

    // Get next state
    const next = hist.future.pop()!;

    // Update local cache
    lastLoggedContentRef.current[activeNote.id] = next;

    // Apply next content
    const updatedNotes = notes.map((note) => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          content: next,
          updatedAt: Date.now(),
        };
      }
      return note;
    });
    setNotes(updatedNotes);
    triggerAutoSave(updatedNotes);
    showToast('Cambio rehecho');
  };

  // Handle Note Field Changes
  const handleNoteContentChange = (content: string) => {
    if (!activeNote) return;

    // Track state for history
    if (!lastLoggedContentRef.current[activeNote.id]) {
      lastLoggedContentRef.current[activeNote.id] = activeNote.content;
    }

    const previousStableContent = lastLoggedContentRef.current[activeNote.id];

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      if (activeNote) {
        if (!noteHistoryRef.current[activeNote.id]) {
          noteHistoryRef.current[activeNote.id] = { past: [], future: [] };
        }
        const hist = noteHistoryRef.current[activeNote.id];
        const lastPast = hist.past[hist.past.length - 1];

        if (previousStableContent !== content && lastPast !== previousStableContent) {
          if (hist.past.length >= 100) {
            hist.past.shift();
          }
          hist.past.push(previousStableContent);
          hist.future = [];
        }
        lastLoggedContentRef.current[activeNote.id] = content;
      }
    }, 800);

    const updatedNotes = notes.map((note) => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          content,
          updatedAt: Date.now(),
        };
      }
      return note;
    });

    setNotes(updatedNotes);
    triggerAutoSave(updatedNotes);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!activeNote) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Record state immediately before inserting
    recordManualHistorySnapshot(activeNote.id, activeNote.content);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const insertion = suffix 
      ? `${prefix}${selected || 'texto'}${suffix}` 
      : `${prefix}${selected}`;

    const newContent = before + insertion + after;
    
    // Sync the textarea DOM immediately so continuous insertions work instantly
    textarea.value = newContent;

    // Direct update to note content so state is perfectly synchronized
    const updatedNotes = notes.map((note) => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          content: newContent,
          updatedAt: Date.now(),
        };
      }
      return note;
    });

    setNotes(updatedNotes);
    triggerAutoSave(updatedNotes);

    // Save stable marker of content
    lastLoggedContentRef.current[activeNote.id] = newContent;

    const newCursorPos = start + insertion.length;
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file && activeNote) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const base64Data = event.target.result as string;
              const imageId = `img_${Math.floor(Math.random() * 10000)}_${Date.now()}`;
              
              // Record history before modifying
              recordManualHistorySnapshot(activeNote.id, activeNote.content);

              const updatedImages = { ...(activeNote.images || {}), [imageId]: base64Data };
              const insertion = `![${file.name || 'imagen_pegada'}](ref:${imageId})`;

              const updatedNotes = notes.map((note) => {
                if (note.id === activeNote.id) {
                  return {
                    ...note,
                    images: updatedImages,
                    updatedAt: Date.now(),
                  };
                }
                return note;
              });
              setNotes(updatedNotes);
              
              // Insert the short markdown tag
              insertMarkdown(insertion);
              showToast('Imagen cargada desde el portapapeles');
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeNote) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Data = event.target.result as string;
          const imageId = `img_${Math.floor(Math.random() * 10000)}_${Date.now()}`;

          // Record history before modifying
          recordManualHistorySnapshot(activeNote.id, activeNote.content);

          const updatedImages = { ...(activeNote.images || {}), [imageId]: base64Data };
          const insertion = `![${file.name || 'imagen'}](ref:${imageId})`;

          const updatedNotes = notes.map((note) => {
            if (note.id === activeNote.id) {
              return {
                ...note,
                images: updatedImages,
                updatedAt: Date.now(),
              };
            }
            return note;
          });
          setNotes(updatedNotes);

          insertMarkdown(insertion);
          showToast('Imagen importada con éxito');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrlInput.trim() && activeNote) {
      // Record history before modifying
      recordManualHistorySnapshot(activeNote.id, activeNote.content);
      
      insertMarkdown(`![imagen](${imageUrlInput.trim()})`);
      setImageUrlInput('');
      setShowImageUrlPopover(false);
      showToast('Imagen URL agregada');
    }
  };

  const handleNoteTitleChange = (title: string) => {
    if (!activeNote) return;

    const updatedNotes = notes.map((note) => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          title,
          updatedAt: Date.now(),
        };
      }
      return note;
    });

    setNotes(updatedNotes);
    triggerAutoSave(updatedNotes);
  };

  const handleNoteCategoryChange = (category: NoteCategory) => {
    if (!activeNote) return;

    const updatedNotes = notes.map((note) => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          category,
          updatedAt: Date.now(),
        };
      }
      return note;
    });

    setNotes(updatedNotes);
    triggerAutoSave(updatedNotes);
    showToast(`Categoría cambiada a "${category}"`);
  };

  const togglePinNote = (noteId: string) => {
    const updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          pinned: !note.pinned,
        };
      }
      return note;
    });
    setNotes(updatedNotes);
    saveToStorage(updatedNotes);
    showToast(
      updatedNotes.find((n) => n.id === noteId)?.pinned
        ? 'Nota fijada en la parte superior'
        : 'Nota desfijada'
    );
  };

  // Operations
  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Nueva Nota de Desarrollo',
      content: `// Escribe algo aquí...\n`,
      updatedAt: Date.now(),
      category: 'General',
      pinned: false,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    saveToStorage(updatedNotes);
    setIsSplitView(true);
    showToast('Nueva nota creada');
  };

  const handleDeleteNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const updated = notes.filter((note) => note.id !== noteId);
    setNotes(updated);
    saveToStorage(updated);
    showToast('Nota eliminada permanentemente');

    if (activeNoteId === noteId) {
      if (updated.length > 0) {
        setActiveNoteId(updated[0].id);
      } else {
        setActiveNoteId(null);
      }
    }
  };

  // Developer Fast Utils
  const handleFormatJSON = () => {
    if (!activeNote) return;

    try {
      const formatted = formatJSONString(activeNote.content);
      handleNoteContentChange(formatted);
      showToast('Estilo JSON formateado correctamente');
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  const handleCopyToClipboard = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    showToast('¡Contenido copiado al portapapeles!');
  };

  const handleUpperCase = () => {
    if (!activeNote) return;
    handleNoteContentChange(activeNote.content.toUpperCase());
    showToast('Texto convertido a MAYÚSCULAS');
  };

  const handleLowerCase = () => {
    if (!activeNote) return;
    handleNoteContentChange(activeNote.content.toLowerCase());
    showToast('Texto convertido a minúsculas');
  };

  const handleClearEditor = () => {
    if (!activeNote) return;
    if (confirm('¿Estás seguro de que deseas vaciar el bloque actual?')) {
      handleNoteContentChange('');
      showToast('Editor vaciado');
    }
  };

  // Clean memory up on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Filtered lists logic
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(deferredSearchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Separate pinned vs standard within the filtered
  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const regularNotes = filteredNotes.filter((n) => !n.pinned);
  const orderedNotes = [...pinnedNotes, ...regularNotes];

  // Stats calculation
  const stats = activeNote ? getTextStats(activeNote.content) : null;

  // Category Colors
  const getCategoryTheme = (category: NoteCategory) => {
    switch (category) {
      case 'Claves':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/20',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400',
          icon: KeyRound,
        };
      case 'Código':
        return {
          bg: 'bg-blue-500/10 hover:bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          dot: 'bg-blue-400',
          icon: FileCode,
        };
      case 'Tareas':
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: CheckSquare,
        };
      case 'Markdown':
        return {
          bg: 'bg-purple-500/10 hover:bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          dot: 'bg-purple-400',
          icon: NotebookPen,
        };
      default:
        return {
          bg: 'bg-zinc-500/10 hover:bg-zinc-500/20',
          text: 'text-zinc-300',
          border: 'border-zinc-700/50',
          dot: 'bg-zinc-400',
          icon: FileText,
        };
    }
  };

  const getFontSizeClass = (size: EditorFontSize) => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0d19] text-[#e2e8f0] overflow-hidden font-sans">      {/* SIDEBAR */}
      <aside className={`${isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none border-r-0' : 'w-80'} h-full bg-[#151a30] border-r border-[#1e293b] flex flex-col shrink-0 select-none transition-all duration-300 relative overflow-hidden`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2563eb] rounded-lg shadow-md shadow-blue-950/40">
              <NotebookPen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[12px] font-bold tracking-wider text-[#64748b] uppercase">Notas Recientes</h2>
              <p className="text-[9px] font-mono tracking-widest text-[#a855f7] uppercase font-bold">Dev Suite</p>
            </div>
          </div>
          
          <button 
            id="btn-create-note-header"
            onClick={handleCreateNote}
            className="p-1.5 bg-[#0b0d19] hover:bg-[#1e293b] border border-[#1e293b] rounded-lg text-purple-400 transition-all duration-200"
            title="Crear Nueva Nota"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              id="search-notes-input"
              type="text"
              placeholder="Buscar por título o código..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0b0d19] border border-[#1e293b] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-lg text-xs text-[#e2e8f0] placeholder:text-zinc-600 transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-5 pb-3 border-b border-[#1e293b]">
          <p className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Categorías
          </p>
          <div className="flex flex-wrap gap-1">
            {(['Todas', 'General', 'Código', 'Tareas', 'Claves', 'Markdown'] as const).map((cat) => (
              <button
                key={cat}
                id={`btn-filter-${cat}`}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 text-[11px] rounded transition-all duration-200 ${
                  categoryFilter === cat 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-medium' 
                    : 'bg-transparent text-[#64748b] hover:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes list wrapper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {orderedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-600 h-40">
              <SearchCode className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-xs">No se encontraron bloques</p>
              <p className="text-[10px] text-zinc-700 mt-1">Prueba otra búsqueda o categoría</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {orderedNotes.map((note) => {
                const theme = getCategoryTheme(note.category);
                const isActive = note.id === activeNoteId;
                
                return (
                  <motion.div
                    key={note.id}
                    id={`note-card-${note.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setActiveNoteId(note.id);
                    }}
                    className={`group relative flex flex-col p-3 rounded-lg cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-[#2563eb] text-white border-transparent shadow-lg shadow-blue-500/10' 
                        : 'bg-[#151a30]/20 hover:bg-[#1e293b] border-transparent'
                    }`}
                  >
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${isActive ? 'bg-white' : theme.dot}`} />
                        <span className={`font-mono text-[10px] uppercase font-bold tracking-wider shrink-0 ${isActive ? 'text-blue-100' : theme.text}`}>
                          {note.category}
                        </span>
                        
                        {note.pinned && (
                          <Pin className={`w-3 h-3 shrink-0 ${isActive ? 'text-white fill-white' : 'text-amber-400 fill-amber-400'}`} />
                        )}
                      </div>
                      
                      {/* Action buttons list */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-10">
                        <button
                          id={`btn-pin-note-card-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinNote(note.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isActive 
                              ? 'hover:bg-blue-600 text-blue-100 hover:text-white' 
                              : 'hover:bg-[#0b0d19] text-zinc-500 hover:text-amber-400'
                          }`}
                          title={note.pinned ? 'Desfijar Nota' : 'Fijar Nota'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        
                        <button
                          id={`btn-delete-note-card-${note.id}`}
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className={`p-1 rounded transition-colors ${
                            isActive 
                              ? 'hover:bg-blue-600 text-blue-100 hover:text-rose-200' 
                              : 'hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400'
                          }`}
                          title="Eliminar Nota"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-sm font-medium leading-snug truncate ${isActive ? 'text-white font-semibold' : 'text-zinc-300'}`}>
                      {note.title || 'Sin Título'}
                    </h3>

                    {/* Text preview */}
                    <p className={`text-xs mt-1 line-clamp-1 font-mono break-all opacity-80 ${isActive ? 'text-blue-100' : 'text-zinc-500'}`}>
                      {note.content ? note.content.replace(/[#*`[\]]/g, '').slice(0, 80) : 'Sin contenido...'}
                    </p>

                    {/* Date stamp */}
                    <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] font-mono ${isActive ? 'border-blue-600/50 text-blue-200' : 'border-[#1e293b]/30 text-zinc-600'}`}>
                      <span>{new Date(note.updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer info stats */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0b0d19]/40 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse inline-block shrink-0" />
            Entorno Activo
          </span>
          <div className="flex items-center gap-2">
            <span>v2.2</span>
            <button
              id="btn-collapse-sidebar"
              onClick={() => handleSetSidebarCollapsed(true)}
              className="p-1 hover:text-white hover:bg-[#1e293b] rounded transition-colors cursor-pointer text-zinc-400"
              title="Colapsar barra lateral"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Floating expand arrow button at the bottom left */}
      {isSidebarCollapsed && (
        <button
          id="btn-expand-sidebar"
          onClick={() => handleSetSidebarCollapsed(false)}
          className="fixed bottom-4 left-4 z-50 p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-xl hover:scale-105 border border-purple-500/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="Mostrar barra lateral"
        >
          <ChevronRight className="w-4 h-4 text-white animate-pulse" />
        </button>
      )}

      {/* MAIN WORKSPACE */}
      <main className="flex-1 h-full flex flex-col bg-[#0b0d19] overflow-hidden min-w-0">
        {activeNote ? (
          <div className="h-full flex flex-col min-w-0" id="active-note-workspace">
            
            {/* WORKSPACE HEADER */}
            <header className="px-8 h-16 bg-[#151a30] border-b border-[#1e293b] flex items-center justify-between gap-4 shrink-0">
              
              {/* Note Details (Responsive inputs) */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input 
                  id="active-note-title-input"
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleNoteTitleChange(e.target.value)}
                  placeholder="Título de la nota..."
                  className="bg-transparent text-lg font-bold text-white border-b border-transparent hover:border-zinc-800/40 focus:border-purple-500/50 focus:outline-none pb-0.5 transition-all min-w-0 flex-1"
                />
                
                {/* Category selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="tag text-xs font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#94a3b8]">dev-suite</span>
                  <select
                    id="active-note-category-select"
                    value={activeNote.category}
                    onChange={(e) => handleNoteCategoryChange(e.target.value as NoteCategory)}
                    className="bg-[#151a30] border border-[#1e293b] text-[#94a3b8] text-xs px-2.5 py-1 rounded-lg focus:ring-1 focus:ring-purple-500/50 focus:outline-none font-mono"
                  >
                    <option value="General">General</option>
                    <option value="Código">Código</option>
                    <option value="Tareas">Tareas</option>
                    <option value="Claves">Claves</option>
                    <option value="Markdown">Markdown</option>
                  </select>

                  <button
                    id="btn-pin-active-note"
                    onClick={() => togglePinNote(activeNote.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      activeNote.pinned 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-[#151a30] border-[#1e293b] text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={activeNote.pinned ? 'Desfijar de la parte superior' : 'Fijar nota'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SAVE STATUS INDICATOR (CRITICAL REQUIREMENT) */}
              <div className="flex items-center gap-2.5 shrink-0" id="sync-status-indicator">
                <AnimatePresence mode="wait">
                  {saveStatus === 'saving' ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="status-indicator status-syncing text-[#a855f7] font-semibold text-sm transition-all duration-200"
                    >
                      Guardando...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="synchronized"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="status-indicator status-synced text-[#64748b] font-semibold text-sm transition-all duration-200"
                    >
                      Sincronizado
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </header>

            {/* EDITOR CONTROLS & UTILITIES */}
            <div className="px-8 py-3 bg-[#151a30]/40 border-b border-[#1e293b] flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
              
              {/* Display View layout & Quick Formatting inserters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Column Split Toggle */}
                <button
                  id="btn-toggle-layout"
                  onClick={() => setIsSplitView(!isSplitView)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    isSplitView
                      ? 'bg-purple-600/10 border-purple-500/30 text-purple-300 font-medium'
                      : 'bg-[#151a30] text-[#64748b] border-[#1e293b] hover:text-zinc-300'
                  }`}
                  title={isSplitView ? "Modo Una Columna" : "Modo Dividido en Columnas"}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>{isSplitView ? 'Dos Columnas' : 'Una Columna'}</span>
                </button>

                {/* Undo / Redo Actions */}
                <div className="flex items-center bg-[#0b0d19] p-1 rounded-lg border border-[#1e293b] gap-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-2 font-bold select-none">Historial:</span>
                  <button
                    id="btn-undo"
                    onClick={handleUndo}
                    className="flex items-center gap-1 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 text-purple-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
                    title="Deshacer cambio (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Deshacer</span>
                  </button>
                  <button
                    id="btn-redo"
                    onClick={handleRedo}
                    className="flex items-center gap-1 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 text-purple-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
                    title="Rehacer cambio (Ctrl+Y o Ctrl+Shift+Z)"
                  >
                    <Redo2 className="w-3.5 h-3.5 text-indigo-450" />
                    <span>Rehacer</span>
                  </button>
                </div>

                {/* Insertion tools */}
                <div className="flex flex-wrap items-center bg-[#0b0d19] p-1 rounded-lg border border-[#1e293b] gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-2 font-bold select-none">Estructura:</span>
                  
                  <button
                    id="btn-insert-checkbox"
                    onClick={() => insertMarkdown('\n- [ ] ')}
                    className="flex items-center gap-1 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Insertar casilla / Checkbox"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>Caja</span>
                  </button>

                  <button
                    id="btn-insert-list"
                    onClick={() => insertMarkdown('\n- ')}
                    className="flex items-center gap-1 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Insertar viñeta / Lista"
                  >
                    <List className="w-3.5 h-3.5 text-blue-400" />
                    <span>Lista</span>
                  </button>

                  <button
                    id="btn-insert-list-ordered"
                    onClick={() => insertMarkdown('\n1. ')}
                    className="flex items-center gap-1 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Insertar lista numerada"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-[#a855f7]" />
                    <span>Num</span>
                  </button>

                  <button
                    id="btn-insert-h1"
                    onClick={() => insertMarkdown('\n# ')}
                    className="flex items-center gap-1 px-1.5 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Título principal H1"
                  >
                    <Heading1 className="w-3.5 h-3.5 text-emerald-400" />
                  </button>

                  <button
                    id="btn-insert-h2"
                    onClick={() => insertMarkdown('\n## ')}
                    className="flex items-center gap-1 px-1.5 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Título secundario H2"
                  >
                    <Heading2 className="w-3.5 h-3.5 text-emerald-500" />
                  </button>

                  <button
                    id="btn-insert-code"
                    onClick={() => insertMarkdown('\n```javascript\n', '\n```\n')}
                    className="flex items-center gap-1 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Insertar bloque de código"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Código</span>
                  </button>

                  <button
                    id="btn-insert-separator"
                    onClick={() => insertMarkdown('\n---\n')}
                    className="flex items-center gap-1 px-1.5 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 transition-colors"
                    title="Insertar divisor horizontal"
                  >
                    <Minus className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>

                {/* Typography / Inline styling tools */}
                <div className="flex flex-wrap items-center bg-[#0b0d19] p-1 rounded-lg border border-[#1e293b] gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-2 font-bold select-none">Estilo:</span>
                  
                  <button
                    id="btn-format-bold"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1 px-2 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white font-bold transition-all"
                    title="Negrita"
                  >
                    <Bold className="w-3.5 h-3.5 text-white" />
                  </button>

                  <button
                    id="btn-format-italic"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1 px-2 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white italic transition-all"
                    title="Cursiva"
                  >
                    <Italic className="w-3.5 h-3.5 text-purple-300" />
                  </button>

                  <button
                    id="btn-format-underline"
                    onClick={() => insertMarkdown('__', '__')}
                    className="p-1 px-2 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white underline transition-all"
                    title="Subrayado"
                  >
                    <Underline className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  <button
                    id="btn-format-strikethrough"
                    onClick={() => insertMarkdown('~~', '~~')}
                    className="p-1 px-2 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white line-through transition-all"
                    title="Tachado"
                  >
                    <Strikethrough className="w-3.5 h-3.5 text-rose-400" />
                  </button>

                  {/* Colors dots picker */}
                  <div className="h-4 w-px bg-zinc-800 mx-1.5" />
                  <Palette className="w-3.5 h-3.5 text-purple-400 mx-0.5 animate-pulse" />
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5">
                    {[
                      { name: 'Púrpura', color: '#c084fc', class: 'bg-[#c084fc]' },
                      { name: 'Azul', color: '#60a5fa', class: 'bg-[#60a5fa]' },
                      { name: 'Esmeralda', color: '#34d399', class: 'bg-[#34d399]' },
                      { name: 'Ámbar', color: '#fbbf24', class: 'bg-[#fbbf24]' },
                      { name: 'Rosa/Rojo', color: '#f43f5e', class: 'bg-[#f43f5e]' },
                      { name: 'Blanco', color: '#ffffff', class: 'bg-white' },
                    ].map((col) => (
                      <button
                        key={col.color}
                        onClick={() => insertMarkdown('[', `](color:${col.color})`)}
                        className={`w-3.5 h-3.5 rounded-full ${col.class} border border-zinc-950/60 hover:scale-125 transition-transform cursor-pointer`}
                        title={`Color de texto ${col.name}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Sizing and Alignment */}
                <div className="flex flex-wrap items-center bg-[#0b0d19] p-1 rounded-lg border border-[#1e293b] gap-1 relative">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-2 font-bold select-none font-sans">Alineación:</span>
                  
                  <button
                    id="btn-align-left"
                    onClick={() => insertMarkdown('[', '](align:left)')}
                    className="p-1 px-1.5 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white transition-all cursor-pointer"
                    title="Alinear a la Izquierda"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-align-center"
                    onClick={() => insertMarkdown('[', '](align:center)')}
                    className="p-1 px-1.5 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white transition-all cursor-pointer"
                    title="Centrar Texto"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-align-right"
                    onClick={() => insertMarkdown('[', '](align:right)')}
                    className="p-1 px-1.5 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white transition-all cursor-pointer"
                    title="Alinear a la Derecha"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-align-justify"
                    onClick={() => insertMarkdown('[', '](align:justify)')}
                    className="p-1 px-1.5 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white transition-all cursor-pointer"
                    title="Justificar Texto"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-zinc-800 mx-1" />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-1 font-bold select-none font-sans">Letra:</span>

                  <button
                    id="btn-toggle-size"
                    onClick={() => {
                      setShowSizePopover(!showSizePopover);
                      setShowSpecialCharsPopover(false);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      showSizePopover 
                        ? 'bg-purple-600 text-white font-bold' 
                        : 'bg-[#151a30]/50 hover:bg-purple-500/10 text-purple-300'
                    }`}
                    title="Seleccionar tamaño del texto insertado"
                  >
                    <Type className="w-3.5 h-3.5 text-blue-400 font-extrabold" />
                    <span>Tamaño</span>
                  </button>

                  <AnimatePresence>
                    {showSizePopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 z-50 w-44 bg-[#151a30] border border-[#1e293b] rounded-xl shadow-2xl p-2.5 flex flex-col gap-1.5"
                      >
                        <span className="text-[10px] font-mono font-bold text-purple-300 px-2 pb-1 border-b border-[#1e293b]/70">Tamaño de Letra</span>
                        {[
                          { name: 'Pequeño (12px)', value: '12px' },
                          { name: 'Normal (14px)', value: '14px' },
                          { name: 'Mediano (16px)', value: '16px' },
                          { name: 'Grande (18px)', value: '18px' },
                          { name: 'Título M (22px)', value: '22px' },
                          { name: 'Título G (28px)', value: '28px' },
                          { name: 'Gigante (36px)', value: '36px' },
                        ].map((sz) => (
                          <button
                            key={sz.value}
                            onClick={() => {
                              insertMarkdown('[', `](size:${sz.value})`);
                              setShowSizePopover(false);
                            }}
                            className="w-full text-left p-1.5 px-2 bg-transparent hover:bg-purple-600 rounded text-xs text-[#e2e8f0] hover:text-white hover:font-bold transition-all duration-150 cursor-pointer"
                          >
                            {sz.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Special Characters / Símbolos */}
                <div className="flex flex-wrap items-center bg-[#0b0d19] p-1 rounded-lg border border-[#1e293b] gap-1 relative">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-2 font-bold select-none font-sans">Símbolos:</span>
                  
                  <button
                    id="btn-toggle-special-chars"
                    onClick={() => {
                      setShowSpecialCharsPopover(!showSpecialCharsPopover);
                      setShowSizePopover(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      showSpecialCharsPopover 
                        ? 'bg-purple-600 text-white font-bold' 
                        : 'bg-[#151a30]/50 hover:bg-purple-500/10 text-purple-300 hover:text-white'
                    }`}
                    title="Insertar caracteres especiales y de Alt"
                  >
                    <Smile className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Alt + Símbolos</span>
                  </button>

                  <AnimatePresence>
                    {showSpecialCharsPopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 z-50 w-80 bg-[#151a30] border border-[#1e293b] rounded-xl shadow-2xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#1e293b]/70 pb-2">
                          <span className="text-xs font-mono font-bold text-purple-300">Caracteres Especiales</span>
                          <button
                            onClick={() => setShowSpecialCharsPopover(false)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          >
                            cerrar [x]
                          </button>
                        </div>

                        {/* Beautiful list grouped by tabs */}
                        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                          {SPECIAL_CHAR_GROUPS.map((grp) => (
                            <div key={grp.name} className="flex flex-col gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">{grp.name}</span>
                              <div className="grid grid-cols-6 gap-1">
                                {grp.chars.map((char) => (
                                  <button
                                    key={char}
                                    onClick={() => {
                                      insertMarkdown(char);
                                      setShowSpecialCharsPopover(false);
                                    }}
                                    className="p-1 px-1.5 text-sm bg-[#0b0d19] hover:bg-purple-600 text-[#e2e8f0] hover:text-white border border-[#1e293b] hover:border-purple-500 rounded font-mono transition-all duration-150 cursor-pointer text-center select-none"
                                    title={`Insertar ${char}`}
                                  >
                                    {char}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Image loader & Clipboard paste tools */}
                <div className="flex flex-wrap items-center bg-[#0b0d19] p-1 rounded-lg border border-[#1e293b] gap-1 relative">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono px-2 font-bold select-none">Imágenes:</span>
                  
                  {/* Invisible file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    id="btn-upload-image"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#151a30]/50 hover:bg-purple-500/10 rounded text-xs text-purple-300 hover:text-white transition-colors cursor-pointer"
                    title="Subir archivo de imagen local (.png, .jpg, etc)"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Subir</span>
                  </button>

                  <button
                    id="btn-url-image"
                    onClick={() => setShowImageUrlPopover(!showImageUrlPopover)}
                    className={`flex items-center gap-1.5 px-2 py-1 bg-[#151a30]/50 hover:bg-[#1e293b] rounded text-xs text-purple-300 hover:text-white transition-colors cursor-pointer ${showImageUrlPopover ? 'bg-purple-500/20 text-white border border-purple-500/20' : ''}`}
                    title="Traer imagen desde enlace URL"
                  >
                    <Link2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>URL</span>
                  </button>

                  <span className="text-[10px] text-[#64748b] font-mono px-1.5 hidden lg:inline">
                    Portapapeles con Ctrl+V ✓
                  </span>

                  {/* Absolute positioning of URL popover to float gracefully below button */}
                  <AnimatePresence>
                    {showImageUrlPopover && (
                      <motion.form
                        onSubmit={handleImageUrlInsert}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-9 left-0 mt-1 p-2.5 bg-[#111425] border border-purple-500/20 rounded-xl shadow-2xl z-50 flex items-center gap-2 min-w-[300px]"
                      >
                        <input
                          type="url"
                          required
                          placeholder="Pega la URL de la imagen aquí..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs bg-[#0b0d19] border border-[#1e293b]/70 rounded text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-[11px] font-bold rounded hover:opacity-90 transition-opacity font-mono text-white shrink-0"
                        >
                          Insertar
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Developer action buttons and font-size selector */}
              <div className="flex items-center flex-wrap gap-2">
                
                {/* Font selector */}
                <div className="flex items-center gap-1.5 bg-[#0b0d19] border border-[#1e293b] px-2 py-0.5 rounded-lg shrink-0">
                  <Type className="w-3.5 h-3.5 text-zinc-500" />
                  {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      id={`btn-fontsize-${sz}`}
                      onClick={() => setEditorFontSize(sz)}
                      className={`px-1.5 py-0.5 text-[10px] rounded font-mono uppercase tracking-wider ${
                        editorFontSize === sz
                           ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20 font-bold'
                           : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Developer Toolkit */}
                <div className="h-4 w-px bg-zinc-800" />

                {/* Formateador JSON */}
                <button
                  id="btn-format-json"
                  onClick={handleFormatJSON}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#151a30] hover:bg-purple-500/10 border border-[#1e293b] hover:border-purple-500/30 rounded-lg text-xs font-mono text-purple-400 transition-all duration-150"
                  title="Formatear código JSON con sangrado de 2 espacios"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Formato JSON</span>
                </button>

                <button
                  id="btn-copy-clipboard"
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#151a30] hover:bg-blue-500/10 border border-[#1e293b] hover:border-blue-500/30 rounded-lg text-xs font-mono text-blue-400 transition-all duration-150"
                  title="Copiar contenido de la nota para usar en tu IDE"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar Todo</span>
                </button>

                {/* Text case actions */}
                <div className="flex items-center bg-[#151a30] rounded-lg border border-[#1e293b]">
                  <button
                    id="btn-case-upper"
                    onClick={handleUpperCase}
                    className="px-2 py-1.5 text-xs font-mono text-zinc-400 hover:text-white border-r border-[#1e293b]"
                    title="Convertir todo el texto a MAYÚSCULAS"
                  >
                    A-Z
                  </button>
                  <button
                    id="btn-case-lower"
                    onClick={handleLowerCase}
                    className="px-2 py-1.5 text-xs font-mono text-zinc-400 hover:text-white"
                    title="Convertir todo el texto a minúsculas"
                  >
                    a-z
                  </button>
                </div>

                <button
                  id="btn-clear-editor"
                  onClick={handleClearEditor}
                  className="p-1.5 bg-[#151a30] hover:bg-rose-500/10 border border-[#1e293b] hover:border-rose-500/30 rounded-lg text-rose-400 transition-all duration-150"
                  title="Vaciar toda la nota"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

            {/* WORKSPACE WORK AREA */}
            <div className="flex-1 p-10 overflow-hidden relative flex flex-col min-h-0">
              <div className="w-full h-full flex-1 min-h-0">
                {isSplitView ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
                    <textarea
                      ref={textareaRef}
                      id="active-note-textarea"
                      value={activeNote.content}
                      onChange={(e) => handleNoteContentChange(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="// Escribe tus notas, código, listas o tareas aquí..."
                      className={`w-full h-full min-h-0 bg-transparent border-r border-[#1e293b]/50 focus:ring-0 p-0 pr-6 font-mono resize-none text-[#e2e8f0] focus:outline-none transition-all ${getFontSizeClass(editorFontSize)}`}
                      style={{ tabSize: 4, lineHeight: '1.8' }}
                    />
                    <div className="w-full h-full p-0 overflow-y-auto custom-scrollbar">
                      <MarkdownPreview content={activeNote.content} images={activeNote.images} />
                    </div>
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    id="active-note-textarea"
                    value={activeNote.content}
                    onChange={(e) => handleNoteContentChange(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="// Escribe tus notas, código, listas o tareas aquí..."
                    className={`w-full h-full min-h-0 bg-transparent border-0 focus:ring-0 p-0 font-mono resize-none text-[#e2e8f0] focus:outline-none transition-all ${getFontSizeClass(editorFontSize)}`}
                    style={{ tabSize: 4, lineHeight: '1.8' }}
                  />
                )}
              </div>
            </div>

            {/* LOWER STATUS FOOTER STATS */}
            {stats && (
              <footer className="px-6 py-3 bg-[#151a30]/30 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500 shrink-0 select-none">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Caracteres:</span> <strong className="text-zinc-300 font-semibold">{stats.characters}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Palabras:</span> <strong className="text-zinc-300 font-semibold">{stats.words}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Líneas:</span> <strong className="text-zinc-300 font-semibold">{stats.lines}</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] p-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded">
                    AUTO-SAVE ON
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span>Última edición: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
                </div>
              </footer>
            )}

          </div>
        ) : (
          /* PLACEHOLDER - NO NOTES ACTIVE */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0b0d19]" id="no-notes-placeholder">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-md p-8 rounded-2xl bg-[#151a30]/40 border border-[#1e293b]/60 shadow-xl relative overflow-hidden"
            >
              {/* Decorative radial blur gradient */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl w-fit mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              
              <h2 className="text-lg font-bold text-white mb-2">Comienza a documentar tus ideas</h2>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                No tienes notas creadas actualmente en esta suite. Crea una nueva nota para almacenar fragmentos de código, tokens, configuraciones confidenciales o recordatorios rápidos.
              </p>
              
              <button
                id="btn-create-first-note"
                onClick={handleCreateNote}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-900/30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primera Nota</span>
              </button>
            </motion.div>
          </div>
        )}
      </main>

      {/* FLOATABLE STATUS NOTICE/TOAST notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-xl font-mono text-xs
              ${toastMessage.isError 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-[#151a30] border-[#1e293b] text-purple-300'
              }`}
          >
            {toastMessage.isError ? (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

