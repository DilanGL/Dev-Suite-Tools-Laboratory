/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Task, TaskPriority } from './types';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Sparkles, CheckCircle2, ListTodo, Trash2, ArrowUpCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'gestor_de_tareas_applet_tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch {
      return [];
    }
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Sync tasks state to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

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
    // Scroll form into view gently
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

  // Order of sorting: creation date, most recent to oldest (our array appends new items to the top,
  // but explicitly sorting handles any timestamp updates or custom scenarios cleanly).
  const sortedTasks = [...tasks].sort((a, b) => b.fechaCreacion - a.fechaCreacion);

  // Statistics calculation for the header/footer
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completada).length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;

  return (
    <div className="min-h-screen bg-lime-50/40 text-slate-800 transition-colors duration-200">
      
      {/* Pinned/Sticky Top Zone containing Form */}
      <div className="sticky top-0 z-40 bg-lime-100/90 backdrop-blur-md border-b-4 border-lime-300/80 shadow-md transition-all">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            {/* Title Block */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-lime-400 rounded-2xl shadow-md rotate-[-3deg] border-2 border-slate-800">
                <ListTodo className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  Mis Tareas
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-pulse" />
                </h1>
                <p className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition">
                  ¡Haz que las cosas sucedan hoy! 🚀
                </p>
              </div>
            </div>

            {/* Micro Stats Banner */}
            {totalTasksCount > 0 && (
              <div className="bg-white border-2 border-slate-800 px-4 py-1.5 rounded-2xl shadow-sm text-xs font-black flex items-center gap-3.5 rotate-[1deg]">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Total: {totalTasksCount}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hecho: {completedTasksCount}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1 text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-450 animate-ping opacity-75" />
                  <span>Pendientes: {pendingTasksCount}</span>
                </div>
              </div>
            )}
          </header>

          {/* Injecting TaskForm into Top Sticky Container */}
          <TaskForm
            onSubmit={handleAddOrUpdateTask}
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
          />
        </div>
      </div>

      {/* Main content body containing Task Cards List */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            /* Empty State Container */
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center p-10 md:p-14 bg-white/70 border-4 border-dashed border-lime-300 rounded-3xl mt-2 select-none"
              id="empty-state-container"
            >
              <div className="p-5 bg-lime-100 rounded-full mb-4 animate-bounce duration-1000">
                <Smile className="w-12 h-12 text-lime-600" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-850 mb-1">
                ¡Todo despejado! No hay tareas registradas
              </h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                Usa el formulario de arriba con prioridad para programar tus tareas y mantenerte organizado. ¡Que tengas un día productivo! 😊
              </p>
            </motion.div>
          ) : (
            /* List of Tasks Container */
            <div className="space-y-6">
              {/* Responsive Layout Grid - up to 2 columns on desktop, 1 on mobile */}
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
                id="tasks-responsive-grid"
              >
                <AnimatePresence mode="popLayout">
                  {sortedTasks.map((task) => (
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

              {/* List Actions Footer - Clear All button */}
              <motion.div
                layout
                className="flex items-center justify-center pt-4"
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
                        className="flex-1 sm:flex-initial px-4 py-1.5 bg-slate-350 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl border border-slate-300 transition cursor-pointer"
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
      </main>

      {/* Back to top helper link if scrolled down */}
      <footer className="py-12 text-center text-xs font-extrabold text-slate-400 font-mono">
        <p>Gestor de Tareas &bull; LocalStorage Activo</p>
      </footer>
    </div>
  );
}
