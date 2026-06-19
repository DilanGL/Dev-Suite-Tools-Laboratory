/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskPriority } from '../types';
import { PlusCircle, Edit3, X, AlertOctagon, AlertTriangle, Check, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskFormProps {
  onSubmit: (asunto: string, concepto: string, prioridad: TaskPriority) => void;
  editingTask: Task | null;
  onCancelEdit: () => void;
}

export default function TaskForm({ onSubmit, editingTask, onCancelEdit }: TaskFormProps) {
  const [asunto, setAsunto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [prioridad, setPrioridad] = useState<TaskPriority>('media');
  const [error, setError] = useState('');

  // When editingTask changes, prefill fields
  useEffect(() => {
    if (editingTask) {
      setAsunto(editingTask.asunto);
      setConcepto(editingTask.concepto);
      setPrioridad(editingTask.prioridad);
      setError('');
    } else {
      setAsunto('');
      setConcepto('');
      setPrioridad('media');
      setError('');
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim()) {
      setError('Por favor, ingresa el asunto de la tarea.');
      return;
    }
    if (!concepto.trim()) {
      setError('Por favor, ingresa un concepto o descripción breve.');
      return;
    }
    onSubmit(asunto.trim(), concepto.trim(), prioridad);
    
    // Clear form if not editing
    if (!editingTask) {
      setAsunto('');
      setConcepto('');
      setPrioridad('media');
    }
    setError('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-lime-400 p-5 md:p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-lime-100 pb-3">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
          {editingTask ? (
            <>
              <Edit3 className="w-6 h-6 text-indigo-500 animate-pulse" />
              <span>Editar Tarea</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-6 h-6 text-lime-600" />
              <span>Crear Nueva Tarea</span>
            </>
          )}
        </h2>
        
        {editingTask && (
          <button
            id="cancel-edit-btn"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-rose-500 bg-gray-100 hover:bg-rose-50 px-3 py-1.5 rounded-full border-2 border-gray-200 hover:border-rose-200 transition-all cursor-pointer"
            title="Cancelar edición"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="task-submission-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asunto Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="task-asunto" className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-lime-600" />
              Asunto <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-asunto"
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej. Comprar víveres, Estudiar react..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-lime-300 focus:border-lime-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all shadow-inner"
              maxLength={80}
            />
          </div>

          {/* Concepto Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="task-concepto" className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-lime-600" />
              Concepto <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-concepto"
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej. Leche, huevos, tortillas y frutas frescas..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-lime-300 focus:border-lime-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all shadow-inner"
              maxLength={200}
            />
          </div>
        </div>

        {/* Priority Selector & Submit Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 pt-1">
          {/* Selector de Prioridad */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-lime-600" />
              Prioridad de la Tarea <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2.5" id="priority-options">
              {/* Opción Menor (Verde) */}
              <button
                type="button"
                id="priority-menor-btn"
                onClick={() => setPrioridad('menor')}
                className={`py-2 px-3 rounded-2xl border-3 flex items-center justify-center gap-1 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  prioridad === 'menor'
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-md scale-[1.03]'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${prioridad === 'menor' ? 'bg-white' : 'bg-emerald-500'} shrink-0`} />
                <span>Menor</span>
                {prioridad === 'menor' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              {/* Opción Media (Amarillo) */}
              <button
                type="button"
                id="priority-media-btn"
                onClick={() => setPrioridad('media')}
                className={`py-2 px-3 rounded-2xl border-3 flex items-center justify-center gap-1 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  prioridad === 'media'
                    ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md scale-[1.03]'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${prioridad === 'media' ? 'bg-amber-950' : 'bg-amber-500'} shrink-0`} />
                <span>Media</span>
                {prioridad === 'media' && <Check className="w-3 h-3 stroke-[3] text-amber-950" />}
              </button>

              {/* Opción Urgente (Rojo) */}
              <button
                type="button"
                id="priority-urgente-btn"
                onClick={() => setPrioridad('urgente')}
                className={`py-2 px-3 rounded-2xl border-3 flex items-center justify-center gap-1 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  prioridad === 'urgente'
                    ? 'bg-rose-600 border-rose-700 text-white shadow-md scale-[1.03]'
                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${prioridad === 'urgente' ? 'bg-white' : 'bg-rose-500'} shrink-0`} />
                <span>Urgente</span>
                {prioridad === 'urgente' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="shrink-0 flex items-end">
            <button
              type="submit"
              id="submit-task-btn"
              className={`w-full md:w-auto px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 text-white transition-all cursor-pointer ${
                editingTask
                  ? 'bg-indigo-600 hover:bg-indigo-700 border-b-4 border-indigo-800'
                  : 'bg-lime-600 hover:bg-lime-700 border-b-4 border-lime-800'
              }`}
            >
              {editingTask ? (
                <>
                  <Edit3 className="w-4 h-4 text-white" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Añadir Tarea</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 bg-rose-50 border-2 border-rose-250 text-rose-800 p-3 rounded-xl text-xs font-bold"
            >
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
