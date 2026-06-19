/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Task, TaskPriority } from './types';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smile,
  Sparkles,
  CheckCircle2,
  ListTodo,
  Trash2,
  Layout,
  Columns,
  Grid,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Maximize2
} from 'lucide-react';

const LOCAL_STORAGE_KEY_TASKS = 'gestor_de_tareas_applet_tasks';
const LOCAL_STORAGE_KEY_LAYOUT = 'gestor_de_tareas_applet_layout';
const LOCAL_STORAGE_KEY_PRESET = 'gestor_de_tareas_applet_preset';
const LOCAL_STORAGE_KEY_COLS = 'gestor_de_tareas_applet_cols';

export default function App() {
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch {
      return [];
    }
  });

  // Layout Preference state ('horizontal' or 'vertical')
  const [layoutType, setLayoutType] = useState<'horizontal' | 'vertical'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LAYOUT);
    return saved === 'vertical' ? 'vertical' : 'horizontal';
  });

  // Grid structure preset state ('free' | '2x4' | '3x3' | '4x2')
  const [gridPreset, setGridPreset] = useState<'free' | '2x4' | '3x3' | '4x2'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRESET);
    if (saved === '2x4' || saved === '3x3' || saved === '4x2') {
      return saved;
    }
    return 'free';
  });

  // Custom columns for 'free' mode (1 | 2 | 3 | 4)
  const [customColumns, setCustomColumns] = useState<1 | 2 | 3 | 4>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COLS);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val === 1 || val === 2 || val === 3 || val === 4) return val as 1 | 2 | 3 | 4;
      }
    } catch {}
    return 2;
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LAYOUT, layoutType);
  }, [layoutType]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PRESET, gridPreset);
    setCurrentPage(1); // Reset page on preset change
  }, [gridPreset]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_COLS, customColumns.toString());
  }, [customColumns]);

  // Reset page if tasks length changes below boundaries
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length]);

  // Handle addition or updates to tasks
  const handleAddOrUpdateTask = (asunto: string, concepto: string, prioridad: TaskPriority) => {
    if (editingTask) {
      // Editing Mode
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, asunto, concepto, prioridad } : t
        )
      );
      setEditingTask(null);
    } else {
      // Adding Mode
      const newTask: Task = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        asunto,
        concepto,
        prioridad,
        completada: false,
        fechaCreacion: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // Enable editing mode
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    // Scroll smoothly to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle completion status
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
    );
  };

  // Delete a task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingTask?.id === id) {
      setEditingTask(null);
    }
  };

  // Clear all tasks
  const handleClearAllTasks = () => {
    setTasks([]);
    setEditingTask(null);
    setShowConfirmClear(false);
  };

  // Order of sorting: creation date, most recent to oldest
  const sortedTasks = [...tasks].sort((a, b) => b.fechaCreacion - a.fechaCreacion);

  // Grid Configuration Resolver
  const getGridConfig = () => {
    switch (gridPreset) {
      case '2x4':
        return { colsClasses: 'grid-cols-1 md:grid-cols-2', limitCount: 8, label: 'Cuadrícula 2x4 (8 Tareas)' };
      case '3x3':
        return { colsClasses: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3', limitCount: 9, label: 'Cuadrícula 3x3 (9 Tareas)' };
      case '4x2':
        return { colsClasses: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4', limitCount: 8, label: 'Cuadrícula 4x2 (8 Tareas)' };
      case 'free':
      default:
        const mappings = {
          1: 'grid-cols-1',
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        };
        return { colsClasses: mappings[customColumns], limitCount: null, label: `Libre (${customColumns} Columna${customColumns > 1 ? 's' : ''})` };
    }
  };

  const gridConfig = getGridConfig();

  // Slicing for Pagination
  const totalTasksCount = tasks.length;
  const itemsPerPage = gridConfig.limitCount;
  const totalPages = itemsPerPage ? Math.ceil(totalTasksCount / itemsPerPage) : 1;
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  
  const paginatedTasks = itemsPerPage
    ? sortedTasks.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
    : sortedTasks;

  const completedTasksCount = tasks.filter((t) => t.completada).length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;

  return (
    <div className="min-h-screen bg-lime-50/40 text-slate-800 transition-all duration-300 pb-16">
      
      {/* Top Main Toolbar: Header & Global Controls */}
      <div className="bg-lime-100/95 backdrop-blur-md border-b-4 border-lime-300 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Title & Interactive Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-lime-400 rounded-2xl shadow-md rotate-[-3deg] border-2 border-slate-900 shrink-0">
                <ListTodo className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                  Gestor de Tareas
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-pulse shrink-0" />
                </h1>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  ¡Diseño interactivo con persistencia local! 🚀
                </p>
              </div>
            </div>

            {/* Middle Stats Badges */}
            {totalTasksCount > 0 && (
              <div className="bg-white border-2 border-slate-800 px-4 py-1.5 rounded-2xl shadow-sm text-xs font-black flex items-center justify-between md:justify-start gap-4 self-center md:self-auto w-full md:w-auto">
                <div className="flex items-center gap-1 text-slate-650">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>Total: {totalTasksCount}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 hidden md:block" />
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Hecho: {completedTasksCount}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 hidden md:block" />
                <div className="flex items-center gap-1 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-450 animate-ping opacity-75 shrink-0" />
                  <span>Pendientes: {pendingTasksCount}</span>
                </div>
              </div>
            )}
          </header>

          {/* Selector de Controles de Grid y Visualización */}
          <div className="mt-4 pt-4 border-t-2 border-dashed border-lime-200 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            
            {/* Control 1: Cambiar de Orientación (Horizontal vs Vertical) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-lime-600 shrink-0" />
                Diseño Visual:
              </span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center bg-lime-200/50 p-1 rounded-2xl border-2 border-lime-200">
                <button
                  id="layout-horizontal-btn"
                  onClick={() => setLayoutType('horizontal')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 px-4 cursor-pointer transition-all ${
                    layoutType === 'horizontal'
                      ? 'bg-white text-slate-900 shadow-md border border-lime-305'
                      : 'text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5 text-lime-600" />
                  <span>Dividido Horizontal</span>
                </button>
                <button
                  id="layout-vertical-btn"
                  onClick={() => setLayoutType('vertical')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 px-4 cursor-pointer transition-all ${
                    layoutType === 'vertical'
                      ? 'bg-white text-slate-900 shadow-md border border-lime-305'
                      : 'text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dividido Vertical</span>
                </button>
              </div>
            </div>

            {/* Control 2: Estructura de Cuadrícula */}
            <div className="flex flex-col sm:flex-row sm:items-center lg:justify-end gap-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-emerald-605 shrink-0" />
                Estructura:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 bg-lime-200/50 p-1 rounded-2xl border-2 border-lime-200">
                
                {/* Free dynamic mode */}
                <button
                  id="preset-free-btn"
                  onClick={() => setGridPreset('free')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    gridPreset === 'free'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  Libre
                </button>

                {/* Preset 2x4 */}
                <button
                  id="preset-2x4-btn"
                  onClick={() => setGridPreset('2x4')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                    gridPreset === '2x4'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-650 hover:bg-slate-100'
                  }`}
                  title="Cuadrícula elegante 2x4 (máx 8)"
                >
                  <span>2x4</span>
                </button>

                {/* Preset 3x3 */}
                <button
                  id="preset-3x3-btn"
                  onClick={() => setGridPreset('3x3')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                    gridPreset === '3x3'
                      ? 'bg-amber-500 text-amber-955 shadow-md'
                      : 'text-slate-650 hover:bg-slate-100'
                  }`}
                  title="Cuadrícula balanceada 3x3 (máx 9)"
                >
                  <span>3x3</span>
                </button>

                {/* Preset 4x2 */}
                <button
                  id="preset-4x2-btn"
                  onClick={() => setGridPreset('4x2')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                    gridPreset === '4x2'
                      ? 'bg-rose-550 text-white shadow-md'
                      : 'text-slate-650 hover:bg-slate-100'
                  }`}
                  title="Cuadrícula compacta 4x2 (máx 8)"
                >
                  <span>4x2</span>
                </button>
              </div>

              {/* Individual columns toggles if FREE mode */}
              {gridPreset === 'free' && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl">
                  {[1, 2, 3, 4].map((col) => (
                    <button
                      key={col}
                      id={`column-opt-${col}`}
                      onClick={() => setCustomColumns(col as 1 | 2 | 3 | 4)}
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                        customColumns === col
                          ? 'bg-lime-500 text-slate-900 border-2 border-lime-600'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-slate-400 ml-1">Cols</span>
                </div>
              )}
            </div>
            
          </div>

        </div>
      </div>

      {/* Main Content Areas Layout Renderer */}
      <div className={`mx-auto px-4 py-6 md:py-8 ${layoutType === 'vertical' ? 'max-w-7xl' : 'max-w-4xl'}`}>
        
        {layoutType === 'horizontal' ? (
          
          /* LAYOUT A: Unified Horizontal Layout (Form on Top, Tasks List below) */
          <div className="space-y-6">
            <div className="mb-2">
              <TaskForm
                onSubmit={handleAddOrUpdateTask}
                editingTask={editingTask}
                onCancelEdit={() => setEditingTask(null)}
                isSidebar={false}
              />
            </div>

            <div className="pt-2">
              {/* Grid header details */}
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 bg-lime-400 rounded-full border border-slate-600" />
                  Lista de Tareas ({gridConfig.label})
                </span>
                {gridPreset !== 'free' && (
                  <span className="text-xs font-bold text-slate-500">
                    Mostrando página {activePage} de {totalPages}
                  </span>
                )}
              </div>
              
              {renderTasksListBlock()}
            </div>
          </div>

        ) : (
          
          /* LAYOUT B: Divided Vertical Split Layout (Left: Form Column, Right: Tasks Column on Desktop) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Sticky Pane for the Task Form */}
            <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 md:sticky md:top-48 z-35 space-y-4">
              <div className="bg-lime-200/40 p-4 border-2 border-lime-200 rounded-3xl flex items-center gap-2.5 shadow-inner">
                <Maximize2 className="w-4 h-4 text-lime-700 shrink-0 animate-pulse" />
                <p className="text-xs font-bold text-lime-900 leading-tight">
                  Formulario fijo al lateral para un rápido registro de tareas.
                </p>
              </div>
              
              <TaskForm
                onSubmit={handleAddOrUpdateTask}
                editingTask={editingTask}
                onCancelEdit={() => setEditingTask(null)}
                isSidebar={true}
              />
            </div>

            {/* Right Pane for Tasks Grid List */}
            <div className="md:col-span-8 lg:col-span-8 xl:col-span-9 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 pb-2">
                <span className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-400 rounded-full border border-slate-600" />
                  Lista de Tareas • {gridConfig.label}
                </span>
                {gridPreset !== 'free' && (
                  <span className="text-xs font-bold text-slate-500 bg-white border px-2 py-1 rounded-lg">
                    Página {activePage} de {totalPages} ({totalTasksCount} en total)
                  </span>
                )}
              </div>

              {renderTasksListBlock()}
            </div>

          </div>
        )
        }

      </div>

      {/* Back to top helper link if scrolled down */}
      <footer className="py-12 text-center text-xs font-extrabold text-slate-400 font-mono">
        <p>Gestor de Tareas &bull; LocalStorage Activo &bull; Diseños y Cuadrículas Dinámicas</p>
      </footer>
    </div>
  );

  // Helper template function to render the task grid, empty state, and footer actions
  function renderTasksListBlock() {
    return (
      <AnimatePresence mode="popLayout">
        {totalTasksCount === 0 ? (
          /* Empty State Container */
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center text-center p-10 md:p-14 bg-white border-4 border-dashed border-lime-300 rounded-3xl select-none"
            id="empty-state-container"
          >
            <div className="p-4 bg-lime-100 rounded-full mb-3.5 animate-bounce">
              <Smile className="w-10 h-10 text-lime-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-850 mb-1">
              ¡No hay tareas todavía!
            </h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              Ingresa los datos arriba y elige la prioridad para agrupar e interactuar con tus actividades diarias.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            
            {/* Custom Grid Wrapper */}
            <motion.div
              layout
              className={`grid gap-4 lg:gap-5 ${gridConfig.colsClasses}`}
              id="tasks-responsive-grid"
            >
              <AnimatePresence mode="popLayout">
                {paginatedTasks.map((task) => (
                  <div key={task.id} className="h-full">
                    <TaskCard
                      task={task}
                      onEdit={handleEditTask}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      isBeingEdited={editingTask?.id === task.id}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Paginator Controls Component */}
            {gridPreset !== 'free' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 bg-white border-2 border-lime-200 py-3 px-5 rounded-2xl shadow-sm max-w-sm mx-auto">
                <button
                  id="prev-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={activePage === 1}
                  className={`p-2 rounded-xl border border-slate-200 transition-all ${
                    activePage === 1
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : 'hover:bg-slate-100 text-slate-800 cursor-pointer active:scale-95'
                  }`}
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-xs font-black text-slate-700 min-w-[100px] text-center">
                  Pág. {activePage} de {totalPages}
                </span>

                <button
                  id="next-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={activePage === totalPages}
                  className={`p-2 rounded-xl border border-slate-200 transition-all ${
                    activePage === totalPages
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : 'hover:bg-slate-100 text-slate-800 cursor-pointer active:scale-95'
                  }`}
                  title="Siguiente Página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* List Actions Footer - Clear All button */}
            <motion.div
              layout
              className="flex items-center justify-center pt-2"
              id="tasks-footer-actions"
            >
              {!showConfirmClear ? (
                <button
                  id="clear-all-btn"
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-sm rounded-2xl border-2 border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Borrar todas las tareas</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-rose-50 border-3 border-rose-300 p-4 rounded-2xl shadow-md">
                  <span className="text-xs font-black text-rose-900 text-center">
                    ¿Seguro que deseas eliminar {totalTasksCount} tareas permanentemente?
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      id="confirm-clear-yes"
                      onClick={handleClearAllTasks}
                      className="flex-1 sm:flex-initial px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      Sí, Borrar Todo
                    </button>
                    <button
                      id="confirm-clear-no"
                      onClick={() => setShowConfirmClear(false)}
                      className="flex-1 sm:flex-initial px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl border border-slate-300 transition cursor-pointer"
                    >
                      No, Cancelar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
