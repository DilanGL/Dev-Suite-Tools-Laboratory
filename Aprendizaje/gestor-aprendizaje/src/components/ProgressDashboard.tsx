import React, { useState } from "react";
import { Subject, Milestone } from "../types";
import { 
  Trophy, Flame, Clock, Award, Star, BookOpen, 
  Sparkles, CheckCircle2, ChevronRight, Play, Square, Timer
} from "lucide-react";

interface ProgressDashboardProps {
  subject: Subject | null;
  milestones: Milestone[];
  onToggleMilestone: (title: string) => void;
  onUpdateSubjectHours: (subId: string, hours: number) => void;
}

export default function ProgressDashboard({
  subject,
  milestones,
  onToggleMilestone,
  onUpdateSubjectHours
}: ProgressDashboardProps) {
  const [isStudyTimerActive, setIsStudyTimerActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<any>(null);

  // Toggle internal mock study clock
  const toggleStudyTimer = () => {
    if (isStudyTimerActive) {
      // Pause/Stop
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
      setIsStudyTimerActive(false);

      if (subject && secondsElapsed > 0) {
        // Convert to fractional hours
        const addedHours = Number((secondsElapsed / 3600).toFixed(4));
        onUpdateSubjectHours(subject.id, addedHours);
        setSecondsElapsed(0);
      }
    } else {
      // Start study timer
      setIsStudyTimerActive(true);
      const interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      setTimerIntervalId(interval);
    }
  };

  // Format digital clock
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!subject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-400">
        <Trophy size={36} className="text-slate-700 animate-bounce-slow mb-2" />
        <p className="text-sm">Selecciona una asignatura para visualizar tus objetivos de estudio e indicadores de dominio.</p>
      </div>
    );
  }

  const completedCount = subject.completedMilestones ? subject.completedMilestones.length : 0;
  const totalMilestonesCount = milestones.length || 5; // default scale
  const masteryPercentage = Math.min(
    100, 
    Math.round((completedCount / (totalMilestonesCount || 1)) * 100)
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-slate-950 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Title Dash */}
        <div className="border-b border-slate-900 pb-4">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">INDICADORES DE LOGRO</span>
          <h3 className="text-lg font-bold text-slate-100 mt-0.5">Control de Fluidez Cognitiva</h3>
        </div>

        {/* Top metrics bar (Bento-inspired Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Mastery Circle */}
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">DOMINIO TOTAL</span>
              <h4 className="text-2xl font-black text-slate-100 tracking-tight font-sans">
                {masteryPercentage}%
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">
                {completedCount} de {totalMilestonesCount} hitos validados
              </p>
            </div>
            {/* Visual ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="#3b82f6" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="175.9"
                  strokeDashoffset={175.9 - (175.9 * masteryPercentage) / 100}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy size={16} className={`${masteryPercentage > 50 ? "text-blue-400" : "text-slate-600"}`} />
              </div>
            </div>
          </div>

          {/* 2. Timer Pomodoro Focus Clock */}
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-5 flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">RELOJ DE ENFOQUE</span>
              <Timer size={14} className={isStudyTimerActive ? "text-emerald-400 animate-spin-slow" : "text-slate-500"} />
            </div>

            <div className="flex items-center justify-between mt-1">
              <div>
                <span className="text-xl font-mono text-slate-200 tracking-wider">
                  {isStudyTimerActive ? formatTime(secondsElapsed) : formatTime(0)}
                </span>
                <span className="text-[9px] block text-slate-500 mt-0.5">Suma tiempo de estudio real</span>
              </div>

              <button
                onClick={toggleStudyTimer}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                  isStudyTimerActive 
                    ? "bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-900/30" 
                    : "bg-emerald-950/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/30 animate-pulse-slow"
                }`}
                title={isStudyTimerActive ? "Cerrar y reportar estudio en horas" : "Encender Cronómetro"}
              >
                {isStudyTimerActive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
            </div>
          </div>

          {/* 3. Study Hours Stat */}
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">TIEMPO INVERTIDO</span>
              <h4 className="text-2xl font-black text-slate-100 tracking-tight font-sans">
                {subject.studyTimeHours ? subject.studyTimeHours.toFixed(2) : "0.00"} h
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">
                Promueve el repaso diario de fuentes estimables.
              </p>
            </div>
            <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
              <Flame size={18} className="animate-pulse-slow" />
            </div>
          </div>
        </div>

        {/* Progress Chart/Milestones Check-list integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Chart block using direct elegant Tailwind bars representing subject mastery phases */}
          <div className="bg-slate-900/20 rounded-2xl border border-slate-900/60 p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Distribución de Estudio</h4>
              <p className="text-[10px] text-slate-500 leading-snug">Esquema estimado sobre el total estudiado de la materia</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                  <span>CONCEPTOS TEÓRICOS</span>
                  <span>{Math.min(100, Math.round(masteryPercentage * 1.1))}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, masteryPercentage * 1.1)}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                  <span>METODOLOGÍA Y HITOS</span>
                  <span>{masteryPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${masteryPercentage}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                  <span>FLUJO DE MAPAS MENTALES</span>
                  <span>{Math.round(masteryPercentage * 0.8)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.round(masteryPercentage * 0.8)}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 bg-slate-900/50 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              ⭐ <strong>¿Cómo subir tu nota de dominio?</strong> Repasa tus apuntes, genera mapas interactivos en la pestaña "Mapa Mental", resuelve dudas con la consola "Tutor IA" y marca ítems completados en la pestaña "Línea de Tiempo".
            </div>
          </div>

          {/* Quick task checker */}
          <div className="bg-slate-900/20 rounded-2xl border border-slate-900/60 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200">Hitos de Asignatura para Examen</h4>
            
            {milestones.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-900 rounded-xl">
                <BookOpen size={18} className="text-slate-700 mx-auto mb-1" />
                <span className="text-[11px] text-slate-500">No hay hitos generados aún</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                {milestones.map((milestone, i) => {
                  const isCompleted = subject.completedMilestones?.includes(milestone.title);
                  return (
                    <button
                      key={i}
                      onClick={() => onToggleMilestone(milestone.title)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/85 text-left border border-slate-900 hover:border-slate-800 text-xs transition-all"
                    >
                      <div className="flex items-center gap-2 overflow-hidden truncate">
                        <CheckCircle2 size={13} className={isCompleted ? "text-emerald-400" : "text-slate-600"} />
                        <span className={`truncate font-medium ${isCompleted ? "line-through text-slate-500" : "text-slate-300"}`}>
                          {milestone.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{milestone.date}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
