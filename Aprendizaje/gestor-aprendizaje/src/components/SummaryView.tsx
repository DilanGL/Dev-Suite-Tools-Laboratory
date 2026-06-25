import React, { useState } from "react";
import { KeyConcept, SummaryData } from "../types";
import { Sparkles, ChevronDown, ChevronUp, BookOpen, AlertCircle, Cpu } from "lucide-react";

interface SummaryViewProps {
  data: SummaryData | null;
  isLoading: boolean;
  onGenerate: (proMode: boolean) => void;
  hasSources: boolean;
  isBackendLive: boolean;
}

export default function SummaryView({
  data,
  isLoading,
  onGenerate,
  hasSources,
  isBackendLive
}: SummaryViewProps) {
  const [expandedConceptIdx, setExpandedConceptIdx] = useState<number | null>(null);
  const [useProModel, setUseProModel] = useState(false);

  const toggleConcept = (idx: number) => {
    if (expandedConceptIdx === idx) {
      setExpandedConceptIdx(null);
    } else {
      setExpandedConceptIdx(idx);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu className="text-violet-400 animate-pulse" size={24} />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-200 tracking-wide">Estructurando Información con IA...</h3>
        <p className="text-xs text-slate-500 font-mono mt-1 max-w-md">
          {useProModel 
            ? "Gemini Pro está profundizando en la estructura semántica de tus apuntes" 
            : "Gemini Flash está codificando los conceptos clave en un desglose jerárquico"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-slate-950 select-none">
      {/* Generate Banner if no data */}
      {!data ? (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-8 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 animate-pulse-slow">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight">Generar Resumen Inteligente</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            Nuestra IA analizará todas las fuentes cargadas para desglosar un resumen ejecutivo y los términos clave con explicaciones dinámicas expandibles.
          </p>

          {!hasSources && (
            <div className="mt-4 p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 flex items-center gap-2 max-w-md text-left">
              <AlertCircle size={16} className="text-blue-400 flex-shrink-0" />
              <p className="text-[11px] text-blue-300 leading-snug">
                <strong>Consejo:</strong> No tienes fuentes agregadas. Al hacer clic se generará un resumen realista de demostración (matemáticas o general). Agrega apuntes en la izquierda para usar la IA interactiva.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setUseProModel(false)}
                className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all ${
                  !useProModel 
                    ? "bg-slate-800 text-slate-100 font-bold border border-slate-700" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Gemini Flash
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseProModel(true);
                }}
                className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all ${
                  useProModel 
                    ? "bg-violet-600 text-white font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)]" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Gemini Pro ⚡
              </button>
            </div>

            <button
              onClick={() => onGenerate(useProModel)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:opacity-95 flex items-center gap-2 tracking-wide transition-all"
              id="generate-structure-btn"
            >
              <Sparkles size={14} /> Estructurar Ahora
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Dashboard control to regenerate */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2.5 rounded-full bg-blue-950/40 text-blue-400 border border-blue-800/20 text-[10px] font-mono">
                {useProModel ? "GEMINI PRO EN ACCIÓN" : "SINTETIZADO POR GEMINI FLASH"}
              </div>
            </div>
            <button
              onClick={() => onGenerate(useProModel)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
            >
              <Sparkles size={12} /> Regenerar Análisis
            </button>
          </div>

          {/* Main Markdown Text View */}
          <div className="bg-slate-900/20 rounded-2xl border border-slate-900/60 p-6 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="prose prose-invert max-w-none text-slate-300 prose-sm focus:outline-none">
              <div className="space-y-4">
                {/* Formatting standard markdown elements carefully */}
                {data.summary.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return <h1 key={idx} className="text-xl font-bold font-sans text-slate-100 tracking-tight mt-2 pb-1 border-b border-slate-900">{line.replace("# ", "")}</h1>;
                  }
                  if (line.startsWith("## ")) {
                    return <h2 key={idx} className="text-base font-bold font-sans text-slate-200 mt-4">{line.replace("## ", "")}</h2>;
                  }
                  if (line.startsWith("### ")) {
                    return <h3 key={idx} className="text-sm font-bold font-sans text-slate-300 mt-3">{line.replace("### ", "")}</h3>;
                  }
                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    return (
                      <li key={idx} className="list-disc list-inside text-xs leading-relaxed text-slate-400 ml-2">
                        {line.replace(/^[-*]\s+/, "")}
                      </li>
                    );
                  }
                  if (/^\d+\.\s+/.test(line)) {
                    return (
                      <li key={idx} className="list-decimal list-inside text-xs leading-relaxed text-slate-400 ml-2">
                        {line.replace(/^\d+\.\s+/, "")}
                      </li>
                    );
                  }
                  if (line.trim() === "") return <div key={idx} className="h-2" />;
                  
                  return <p key={idx} className="text-xs leading-relaxed text-slate-400 font-sans">{line}</p>;
                })}
              </div>
            </div>
          </div>

          {/* Toggle Lists (Key Concepts) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-violet-400" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Conceptos de Aprendizaje Activo</h3>
            </div>

            <div className="space-y-2">
              {data.keyConcepts && data.keyConcepts.map((concept, idx) => {
                const isExpanded = expandedConceptIdx === idx;
                return (
                  <div 
                    key={idx} 
                    className={`rounded-xl border transition-all ${
                      isExpanded 
                        ? "border-violet-500/20 bg-slate-900/40 shadow-[0_0_20px_rgba(139,92,246,0.02)]" 
                        : "border-slate-900 bg-slate-900/10 hover:bg-slate-900/30"
                    }`}
                  >
                    <button
                      onClick={() => toggleConcept(idx)}
                      className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                    >
                      <div className="flex-1">
                        <h4 className="font-sans font-bold text-slate-200 text-sm">{concept.term}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{concept.description}</p>
                      </div>
                      <div className={`p-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-400 transition-transform ${isExpanded ? "rotate-180 text-violet-400 border-violet-500/20" : ""}`}>
                        <ChevronDown size={14} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-900">
                        <p className="text-xs leading-relaxed text-slate-400 font-sans">
                          {concept.expandableContent}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
