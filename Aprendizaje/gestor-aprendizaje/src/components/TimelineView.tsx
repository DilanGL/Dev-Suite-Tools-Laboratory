import React, { useState } from "react";
import { Milestone, Subject, Source, ThematicTopic } from "../types";
import { 
  Sparkles, Check, Clock, Award, Hammer, BookOpen, 
  Layers, Compass, ArrowRight, HelpCircle, Lightbulb, Calendar,
  Edit2, Trash2, Plus, FileText, X, Eye
} from "lucide-react";

interface TimelineViewProps {
  milestones: Milestone[];
  subject: Subject | null;
  isLoading: boolean;
  onGenerate: () => void;
  onToggleCompleteMilestone: (title: string) => void;
  thematicTimeline: ThematicTopic[];
  onUpdateThematicTimeline: (updatedTimeline: ThematicTopic[]) => void;
  onPreviewSource: (source: Source) => void;
}

export default function TimelineView({
  milestones,
  subject,
  isLoading,
  onGenerate,
  onToggleCompleteMilestone,
  thematicTimeline,
  onUpdateThematicTimeline,
  onPreviewSource
}: TimelineViewProps) {
  const [timelineMode, setTimelineMode] = useState<"history" | "thematic">("thematic");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Editable forms state
  const [editTitle, setEditTitle] = useState("");
  const [editTimeframe, setEditTimeframe] = useState("");
  const [editLearned, setEditLearned] = useState("");
  const [editFoundation, setEditFoundation] = useState("");
  const [editNecessity, setEditNecessity] = useState("");
  const [editInfluence, setEditInfluence] = useState("");
  const [editImportance, setEditImportance] = useState<"Crítica" | "Alta" | "Media">("Alta");
  const [editSourceIds, setEditSourceIds] = useState<string[]>([]);

  // Measurable list of items checked off
  const completedSet = new Set(subject?.completedMilestones || []);
  const sources = subject?.sources || [];

  const startEditing = (topic: ThematicTopic) => {
    setEditingTopicId(topic.id);
    setEditTitle(topic.title);
    setEditTimeframe(topic.timeframe);
    setEditLearned(topic.learned);
    setEditFoundation(topic.foundation);
    setEditNecessity(topic.necessity);
    setEditInfluence(topic.influence);
    setEditImportance(topic.importance);
    setEditSourceIds(topic.sourceIds || []);
  };

  const handleSaveEdit = (topicId: string) => {
    if (!editTitle.trim() || !editTimeframe.trim()) return;
    
    const updated = thematicTimeline.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          title: editTitle.trim(),
          timeframe: editTimeframe.trim(),
          learned: editLearned.trim() || "N/A",
          foundation: editFoundation.trim() || "N/A",
          necessity: editNecessity.trim() || "N/A",
          influence: editInfluence.trim() || "N/A",
          importance: editImportance,
          sourceIds: editSourceIds
        };
      }
      return topic;
    });

    onUpdateThematicTimeline(updated);
    setEditingTopicId(null);
  };

  const handleDeleteTopic = (topicId: string) => {
    const updated = thematicTimeline.filter(topic => topic.id !== topicId);
    onUpdateThematicTimeline(updated);
    if (editingTopicId === topicId) {
      setEditingTopicId(null);
    }
  };

  const handleAddCustomTopic = () => {
    const newId = "topic-custom-" + Math.random().toString(36).substr(2, 9);
    const newTopic: ThematicTopic = {
      id: newId,
      title: "Nuevo Bloque Temático",
      timeframe: "Por definir",
      learned: "Detalla aquí los conceptos y materias específicas que aprenderás.",
      foundation: "Nombra las bases primarias recomendadas preparatorias.",
      necessity: "Explica la aplicación práctica para responder exámenes o resolver problemas.",
      influence: "Detalla cómo apoya el aprendizaje del siguiente paso en la ruta.",
      importance: "Media",
      sourceIds: []
    };

    onUpdateThematicTimeline([...thematicTimeline, newTopic]);
    startEditing(newTopic);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="text-emerald-400 animate-pulse" size={24} />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-200 tracking-wide font-sans">Secuenciando Hitos Educativos...</h3>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Mapeando líneas de tiempo, teoremas y dependencias curriculares
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 select-none overflow-hidden">
      
      {/* Mode Switches Header Selector Grid */}
      <div className="bg-slate-900/40 p-3.5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">Configuración de Visualización</span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200">Tipo de Línea de Tiempo</h3>
        </div>
        
        <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-850 self-start sm:self-auto">
          <button
            onClick={() => setTimelineMode("thematic")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              timelineMode === "thematic"
                ? "bg-violet-600 text-white shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Layers size={11} /> Planificación Temática
          </button>
          <button
            onClick={() => setTimelineMode("history")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              timelineMode === "history"
                ? "bg-blue-600 text-white shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Compass size={11} /> Evolución Histórica
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">

        {/* 1. HISTORY MODE (Milestones loaded from IA) */}
        {timelineMode === "history" && (
          milestones.length === 0 ? (
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-8 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse-slow">
                <Compass size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight font-sans">Evolución de Descubrimientos</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed font-sans">
                Genera una ruta cronológica crítica que ordene históricamente los descubrimientos, teóricos de vanguardia y leyes relativas a tus apuntes activos.
              </p>

              <button
                onClick={onGenerate}
                className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:opacity-95 flex items-center gap-2 tracking-wide transition-all cursor-pointer font-sans"
                id="generate-timeline-btn"
              >
                <Sparkles size={14} /> Trazar Hitos Históricos
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Timeline Header summary metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Hitos & Cronología</span>
                  <h3 className="text-xs font-bold text-slate-200 mt-0.5 font-sans">Evolución de Descubrimientos Históricos</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Progreso</span>
                    <p className="text-xs font-bold text-emerald-400 font-mono">
                      {completedSet.size} / {milestones.length} Estudiados
                    </p>
                  </div>
                  <button
                    onClick={onGenerate}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono hover:underline cursor-pointer"
                  >
                    <Sparkles size={11} /> Regenerar Ruta
                  </button>
                </div>
              </div>

              {/* Interactive Timeline Graph */}
              <div className="relative pl-6 sm:pl-32 space-y-8">
                {/* Thread line */}
                <div className="absolute left-10 sm:left-36 top-2 bottom-2 w-[1.5px] bg-gradient-to-b from-blue-600 via-emerald-600 to-slate-900" />

                {milestones.map((milestone, idx) => {
                  const isCompleted = completedSet.has(milestone.title);
                  
                  const typeConfig = {
                    milestone: {
                      icon: <Award size={13} />,
                      label: "Hito Histórico",
                      color: "border-blue-500 text-blue-400 bg-blue-950/40"
                    },
                    formula: {
                      icon: <Hammer size={13} />,
                      label: "Fórmula / Ley",
                      color: "border-amber-500 text-amber-400 bg-amber-950/40"
                    },
                    concept: {
                      icon: <BookOpen size={13} />,
                      label: "Concepto Clave",
                      color: "border-purple-500 text-purple-400 bg-purple-950/40"
                    }
                  }[milestone.type] || {
                    icon: <Award size={13} />,
                    label: "Hito",
                    color: "border-slate-500 text-slate-400 bg-slate-900"
                  };

                  const badgeSelector = {
                    "Crítica": "bg-red-500/10 text-red-400 border-red-500/20",
                    "Alta": "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    "Media": "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }[milestone.importance] || "bg-slate-850 text-slate-400 border-slate-800";

                  return (
                    <div 
                      key={idx} 
                      className={`relative flex flex-col sm:flex-row items-start gap-2 sm:gap-6 group/milestone transition-all duration-300 ${isCompleted ? "opacity-75" : ""}`}
                    >
                      {/* Left Side: Time Marker */}
                      <div className="absolute -left-6 sm:static w-24 text-left sm:text-right font-mono flex-shrink-0 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                          {milestone.date}
                        </span>
                      </div>

                      {/* Bubble Bullet */}
                      <button
                        onClick={() => onToggleCompleteMilestone(milestone.title)}
                        className={`absolute left-4 sm:absolute sm:left-32 -translate-x-[9.5px] w-5 h-5 rounded-full border flex items-center justify-center transition-all z-20 cursor-pointer ${
                          isCompleted 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            : "bg-slate-950 border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-400"
                        }`}
                        title={isCompleted ? "Hito Completado" : "Marcar como Completado"}
                      >
                        {isCompleted ? <Check size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/milestone:bg-emerald-400" />}
                      </button>

                      {/* Main Content Box */}
                      <div 
                        onClick={() => onToggleCompleteMilestone(milestone.title)}
                        className={`flex-1 p-4 rounded-xl border transition-all cursor-pointer select-none relative overflow-hidden text-left ${
                          isCompleted 
                            ? "bg-emerald-950/5 border-emerald-900/40" 
                            : "bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.01] to-transparent pointer-events-none" />
                        
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <div className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded border ${typeConfig.color}`}>
                            {typeConfig.icon}
                            <span>{typeConfig.label}</span>
                          </div>
                          
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${badgeSelector}`}>
                            {milestone.importance}
                          </span>
                        </div>

                        <h4 className={`text-[12px] sm:text-[13px] font-bold tracking-wide font-sans ${isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {milestone.title}
                        </h4>

                        <p className="text-[11px] leading-relaxed text-slate-400 mt-1 font-sans">
                          {milestone.description}
                        </p>

                        <div className="mt-2.5 flex items-center gap-1 text-[9px] font-mono text-slate-500">
                          <span>{isCompleted ? "✓ Completado" : "⚡ Click para marcar estudiado"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* 2. THEMATIC SYLLABUS PROGRESSION MODE */}
        {timelineMode === "thematic" && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Guide & Description of Curriculum Map */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl shrink-0">
                  <Layers size={20} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Plan de Avance Temático y Prerrequisitos</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                    Esta ruta secuencial permite programar las etapas académicas de tu asignatura. Para cada tramo, puedes elegir la <strong>fecha o período</strong>, así como vincular las <strong>fuentes/apuntes académicos</strong> asociados. Haz clic en el ícono de edición para modificar.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                      {thematicTimeline.filter(t => completedSet.has(topicTitle(t))).length} / {thematicTimeline.length} Completados
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-sans">
                      • Haz clic en la cabecera para completar o cambiar fuentes asignadas.
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Custom Tramo Trigger */}
              <button
                onClick={handleAddCustomTopic}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold uppercase rounded-lg hover:opacity-95 shadow-lg shadow-violet-950/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <Plus size={13} /> Agregar Tramo
              </button>
            </div>

            {/* Empty view for thematic timeline */}
            {thematicTimeline.length === 0 && (
              <div className="py-20 text-center border border-dashed border-slate-900 rounded-2xl">
                <Layers size={32} className="text-slate-800 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-500 font-sans">No hay tramos configurados todavía.</p>
                <button
                  onClick={handleAddCustomTopic}
                  className="mt-4 text-[10px] uppercase font-bold text-violet-400 hover:text-violet-300 font-mono underline"
                >
                  Generar primer tramo personalizado
                </button>
              </div>
            )}

            {/* Vertical Cards Progression of Themen */}
            <div className="relative pl-6 sm:pl-32 space-y-8 mt-10">
              
              {/* Connecting logical track lines */}
              <div className="absolute left-10 sm:left-36 top-2 bottom-5 w-[1.5px] bg-gradient-to-b from-violet-600 via-indigo-600 to-slate-900 pointer-events-none" />

              {thematicTimeline.map((topic, index) => {
                const isEditing = editingTopicId === topic.id;
                const isCompleted = completedSet.has(topicTitle(topic));
                
                // Color configuration of importance badges
                const importanceBadge = {
                  "Crítica": "bg-red-500/10 text-red-400 border-red-500/20",
                  "Alta": "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  "Media": "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }[topic.importance] || "bg-slate-850 text-slate-400 border-slate-800";

                return (
                  <div
                    key={topic.id || index}
                    className={`relative flex flex-col sm:flex-row items-start gap-2 sm:gap-6 group/topic transition-all duration-300 ${isCompleted && !isEditing ? "opacity-75" : ""}`}
                  >
                    {/* Left Timeline Tag with Calendar Icon */}
                    <div className="absolute -left-6 sm:static w-24 text-left sm:text-right font-mono flex-shrink-0 pt-1.5 flex items-center sm:justify-end gap-1.5 text-slate-400">
                      <Calendar size={11} className="text-violet-500" />
                      <span className="text-[10px] font-bold tracking-wider">{topic.timeframe}</span>
                    </div>

                    {/* Left Center Check Circle */}
                    <button
                      onClick={() => onToggleCompleteMilestone(topicTitle(topic))}
                      className={`absolute left-4 sm:absolute sm:left-32 -translate-x-[9.5px] w-5 h-5 rounded-full border flex items-center justify-center transition-all z-20 cursor-pointer ${
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-105" 
                          : "bg-slate-950 border-slate-700 text-slate-500 hover:border-violet-500 hover:text-violet-400"
                      }`}
                      title={isCompleted ? "Tema estudiado y dominado" : "Marcar como estudiado"}
                    >
                      {isCompleted ? <Check size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-750 group-hover/topic:bg-violet-400" />}
                    </button>

                    {/* Core Cards Component with form or content view */}
                    <div
                      className={`flex-1 rounded-2xl border p-4 sm:p-5 select-none relative overflow-hidden transition-all text-left ${
                        isEditing
                          ? "bg-slate-900/90 border-violet-500/50 shadow-violet-950/10"
                          : isCompleted
                            ? "bg-emerald-950/5 border-emerald-900/30"
                            : "bg-slate-900/35 border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 shadow-lg shadow-black/20"
                      }`}
                    >
                      {/* Form Template for Dynamic Customization */}
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h5 className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest">Configurador del Tramo</h5>
                            <button
                              onClick={() => setEditingTopicId(null)}
                              className="text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Flex grids for header specifications */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Nombre del Bloque Académico:</label>
                              <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-750 rounded p-1.5 text-xs text-white uppercase tracking-tight focus:border-violet-500 outline-none"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="La Revolución Francesa, Álgebra Básica..."
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Fecha o Plazo:</label>
                              <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-755 rounded p-1.5 text-xs text-white focus:border-violet-500 outline-none font-mono"
                                value={editTimeframe}
                                onChange={(e) => setEditTimeframe(e.target.value)}
                                placeholder="Hoy, En 2 semanas, 24/09..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">¿Qué se aprende?</label>
                              <textarea
                                className="w-full h-16 bg-slate-950 border border-slate-750 rounded p-1.5 text-xs text-slate-300 focus:border-violet-500 outline-none resize-none scrollbar-thin"
                                value={editLearned}
                                onChange={(e) => setEditLearned(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Base / Prerrequisitos:</label>
                              <textarea
                                className="w-full h-16 bg-slate-950 border border-slate-750 rounded p-1.5 text-xs text-slate-300 focus:border-violet-500 outline-none resize-none scrollbar-thin"
                                value={editFoundation}
                                onChange={(e) => setEditFoundation(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">¿Por qué es necesario?</label>
                              <textarea
                                className="w-full h-16 bg-slate-950 border border-slate-750 rounded p-1.5 text-xs text-slate-300 focus:border-violet-500 outline-none resize-none scrollbar-thin"
                                value={editNecessity}
                                onChange={(e) => setEditNecessity(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Influencia en el siguiente:</label>
                              <textarea
                                className="w-full h-16 bg-slate-950 border border-slate-750 rounded p-1.5 text-xs text-slate-300 focus:border-violet-500 outline-none resize-none scrollbar-thin"
                                value={editInfluence}
                                onChange={(e) => setEditInfluence(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Importance Levels */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Importancia:</label>
                              <select
                                className="bg-slate-950 border border-slate-750 text-xs text-slate-300 p-1.5 rounded focus:border-violet-500 outline-none cursor-pointer"
                                value={editImportance}
                                onChange={(e) => setEditImportance(e.target.value as any)}
                              >
                                <option value="Crítica">🚨 Crítica</option>
                                <option value="Alta">⚡ Alta</option>
                                <option value="Media">📘 Media</option>
                              </select>
                            </div>

                            {/* Linked files checkbox array */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Fuentes Asociadas a este Tramo:</label>
                              
                              {sources.length === 0 ? (
                                <p className="text-[9px] text-slate-500 italic pl-1">No hay apuntes disponibles en la asignatura.</p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {sources.map(src => {
                                    const linked = editSourceIds.includes(src.id);
                                    return (
                                      <button
                                        key={src.id}
                                        type="button"
                                        onClick={() => {
                                          if (linked) {
                                            setEditSourceIds(editSourceIds.filter(id => id !== src.id));
                                          } else {
                                            setEditSourceIds([...editSourceIds, src.id]);
                                          }
                                        }}
                                        className={`px-2 py-0.5 rounded border text-[9px] font-sans flex items-center gap-1 cursor-pointer transition-colors ${
                                          linked 
                                            ? "bg-violet-950/40 border-violet-500/80 text-violet-300" 
                                            : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
                                        }`}
                                      >
                                        <FileText size={8} /> <span className="max-w-[100px] truncate">{src.title}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Submit Trigger Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="px-2.5 py-1 text-[10px] bg-red-950/20 text-red-400 border border-red-900/30 font-bold hover:bg-red-900/30 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 size={11} /> Eliminar Tramo
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingTopicId(null)}
                                className="px-3 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px] hover:bg-slate-900 font-bold cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(topic.id)}
                                className="px-4 py-1.5 rounded bg-violet-600 text-white font-bold text-[10px] hover:bg-violet-500 flex items-center gap-1 cursor-pointer transition-transform"
                              >
                                <Check size={11} /> Guardar Tramo
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Read-only normal card view */
                        <>
                          {/* Top ribbon banner indicator */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-900/30 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">TEMA {index + 1}</span>
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${importanceBadge}`}>{topic.importance}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditing(topic)}
                                className="p-1 rounded bg-slate-950 text-slate-400 hover:text-violet-400 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                                title="Editar fecha y asignación de apuntes"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="p-1 rounded bg-slate-950 text-slate-500 hover:text-red-400 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                                title="Eliminar Tramo"
                              >
                                <Trash2 size={11} />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleCompleteMilestone(topicTitle(topic));
                                }}
                                className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all border ${
                                  isCompleted
                                    ? "bg-emerald-950 text-emerald-400 border-emerald-900 hover:opacity-90"
                                    : "bg-slate-950/65 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                                }`}
                              >
                                {isCompleted ? "✓ Estudiado" : "⚡ Marcar Hecho"}
                              </button>
                            </div>
                          </div>

                          <h4 
                            onClick={() => onToggleCompleteMilestone(topicTitle(topic))}
                            className={`text-[13px] sm:text-[14px] font-extrabold tracking-tight font-sans transition-all cursor-pointer ${
                              isCompleted ? "line-through text-slate-500" : "text-white"
                            }`}
                          >
                            {topic.title}
                          </h4>

                          {/* 4 descriptive boxes for complete compliance with user features */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3 border-t border-slate-900">
                            
                            {/* 1. ¿Qué se aprendió? */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wide">
                                <Lightbulb size={11} className="text-amber-400" />
                                <span>¿Qué se aprende?</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed pl-4 border-l border-slate-850/60 font-sans">
                                {topic.learned}
                              </p>
                            </div>

                            {/* 2. Base / Prerrequisito */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wide">
                                <Compass size={11} className="text-blue-400" />
                                <span>Base / Prerrequisito</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed pl-4 border-l border-slate-850/60 font-sans">
                                {topic.foundation}
                              </p>
                            </div>

                            {/* 3. ¿Para qué es necesario? */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wide">
                                <HelpCircle size={11} className="text-emerald-400" />
                                <span>¿Para qué es necesario?</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed pl-4 border-l border-slate-850/60 font-sans">
                                {topic.necessity}
                              </p>
                            </div>

                            {/* 4. Influencia en el siguiente */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wide">
                                <ArrowRight size={11} className="text-violet-400" />
                                <span>Influencia en el siguiente</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed pl-4 border-l border-slate-850/60 font-sans">
                                {topic.influence}
                              </p>
                            </div>
                          </div>

                          {/* Linked Sources preview row */}
                          <div className="mt-4 pt-3 border-t border-slate-900/60 flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-mono font-semibold tracking-wider text-slate-500 uppercase">Fuentes en este tramo:</span>
                            {renderLinkedSources(topic)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

      </div>
    </div>
  );

  // Helper helper to return topic title
  function topicTitle(t: ThematicTopic): string {
    return t.title || "";
  }

  // Inner renderer for linked source badges
  function renderLinkedSources(topic: ThematicTopic) {
    const ids = topic.sourceIds || [];
    const linked = ids.map(id => sources.find(src => src.id === id)).filter((s): s is Source => !!s);

    if (linked.length === 0) {
      return (
        <span className="text-[9px] font-mono text-slate-600 italic">Ninguna fuente asignada a esta planificación.</span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {linked.map(src => (
          <button
            key={src.id}
            onClick={(e) => {
              e.stopPropagation();
              onPreviewSource(src);
            }}
            className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 flex items-center gap-1.5 hover:text-white hover:bg-slate-900 transition-all font-sans cursor-pointer"
            title={`Clic para Ver: "${src.title}"`}
          >
            <FileText size={10} className="text-blue-400 flex-shrink-0" />
            <span className="max-w-[150px] truncate">{src.title}</span>
            <Eye size={10} className="text-slate-500 group-hover:text-slate-300 ml-0.5" />
          </button>
        ))}
      </div>
    );
  }
}
