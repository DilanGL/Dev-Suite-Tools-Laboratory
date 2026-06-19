/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from '../types';
import { motion } from 'motion/react';
import { Edit2, Trash2, CheckCircle, Undo, AlertCircle, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isBeingEdited: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onToggleComplete,
  onDelete,
  isBeingEdited,
}: TaskCardProps) {
  // Priority colors mapping for visual styling
  const priorityStyling = {
    menor: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-50/50',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-100 border-emerald-300',
      badgeText: 'text-emerald-700',
      pillColor: 'bg-emerald-500',
      label: 'Prioridad Menor',
    },
    media: {
      border: 'border-amber-400',
      bg: 'bg-amber-50/55',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 border-amber-300',
      badgeText: 'text-amber-800',
      pillColor: 'bg-amber-500',
      label: 'Prioridad Media',
    },
    urgente: {
      border: 'border-rose-400',
      bg: 'bg-rose-50/55',
      text: 'text-rose-900',
      badgeBg: 'bg-rose-100 border-rose-300',
      badgeText: 'text-rose-700',
      pillColor: 'bg-rose-500',
      label: 'Prioridad Urgente',
    },
  }[task.prioridad];

  // Friendly date formatting
  const formatFriendlyDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      animate={{ opacity: task.completada ? 0.6 : 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -15 }}
      transition={{ duration: 0.28, type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative flex flex-col justify-between rounded-3xl p-5 md:p-6 transition-all duration-300 h-full border-4 ${
        isBeingEdited
          ? 'border-indigo-500 ring-4 ring-indigo-250 ring-offset-2 animate-pulse bg-indigo-50/30'
          : `${priorityStyling.border} bg-white hover:shadow-lg hover:-translate-y-0.5`
      } ${task.completada ? 'shadow-inner' : 'shadow-md shadow-lime-900/5'}`}
      id={`task-card-${task.id}`}
    >
      {/* Priority Ribbon / Badge */}
      <div className="flex items-center justify-between mb-3.5">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed text-[10px] font-black tracking-wider uppercase ${priorityStyling.badgeBg} ${priorityStyling.badgeText}`}
        >
          <span className={`w-2 h-2 rounded-full ${priorityStyling.pillColor}`} />
          <span>{priorityStyling.label}</span>
        </div>

        {/* Date Indicator */}
        <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px] font-semibold">
          <Calendar className="w-3 h-3" />
          <span>{formatFriendlyDate(task.fechaCreacion)}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mb-4">
        {/* Asunto (Bold) */}
        <h3
          className={`font-black text-lg text-slate-800 break-words mb-1.5 transition-all leading-tight ${
            task.completada ? 'line-through text-slate-400 decoration-slate-400/50' : ''
          }`}
          id={`task-asunto-${task.id}`}
        >
          {task.asunto}
        </h3>

        {/* Concepto (Normal text) */}
        <p
          className={`text-sm text-slate-650 break-words font-medium transition-all ${
            task.completada ? 'text-slate-400 lines-through' : ''
          }`}
          id={`task-concepto-${task.id}`}
        >
          {task.concepto}
        </p>
      </div>

      {/* Completed Stamp / Ribbon */}
      {task.completada && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 z-10 pointer-events-none select-none">
          <div className="bg-emerald-600/90 hover:bg-emerald-600 text-white border-4 border-double border-white font-black text-xs px-4 py-1.5 rounded-2xl shadow-xl uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-white shrink-0 animate-ping absolute duration-1000" />
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span>Completada</span>
          </div>
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-100 mt-auto">
        <div className="flex gap-2">
          {/* Edit Button */}
          {!task.completada && (
            <button
              id={`edit-btn-${task.id}`}
              onClick={() => onEdit(task)}
              disabled={isBeingEdited}
              className={`p-2 rounded-xl text-indigo-600 hover:text-white hover:bg-indigo-600 active:bg-indigo-700 bg-indigo-50 border-2 border-indigo-200 transition-all cursor-pointer ${
                isBeingEdited ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Editar tarea"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          <button
            id={`delete-btn-${task.id}`}
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 active:bg-rose-700 bg-rose-50 border-2 border-rose-200 transition-all cursor-pointer"
            title="Eliminar tarea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Complete Toggle Button */}
        <button
          id={`complete-btn-${task.id}`}
          onClick={() => onToggleComplete(task.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black tracking-wide border-2 transition-all cursor-pointer shadow-sm ${
            task.completada
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
          }`}
        >
          {task.completada ? (
            <>
              <Undo className="w-3.5 h-3.5 stroke-[3]" />
              <span>Desmarcar</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
              <span>Completar</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
