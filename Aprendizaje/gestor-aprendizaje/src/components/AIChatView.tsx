import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Subject } from "../types";
import { 
  Sparkles, Send, Brain, Bot, User, Trash2, Zap, AlertCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";

interface AIChatViewProps {
  chatHistory: ChatMessage[];
  onSendMessage: (query: string) => void;
  onClearHistory: () => void;
  activeSubject: Subject | null;
  isSending: boolean;
  isBackendLive: boolean;
}

export default function AIChatView({
  chatHistory,
  onSendMessage,
  onClearHistory,
  activeSubject,
  isSending,
  isBackendLive
}: AIChatViewProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isSending, collapsed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSending) return;
    onSendMessage(query.trim());
    setQuery("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (isSending) return;
    onSendMessage(prompt);
  };

  // Math-focused or generic suggested prompts for study ease
  const isMath = activeSubject?.name.toLowerCase().includes("matem");
  const suggestions = isMath 
    ? [
        "¿Cómo se relaciona la derivada con la integral?",
        "Explícame qué pasa si el discriminante (Δ) es negativo.",
        "Prepárame una pregunta corta examen de límites."
      ]
    : [
        "Hazme un resumen rápido de las fuentes actuales.",
        "Prepárame 3 conceptos clave de examen para este tema.",
        "¿Qué hitos cronológicos son los más críticos para estudiar?"
      ];

  // Render a sleek, narrow strip when collapsed
  if (collapsed) {
    return (
      <div className="w-14 h-full bg-slate-950 flex flex-col items-center py-4 border-l border-slate-900 transition-all duration-300 select-none shrink-0">
        <button 
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-violet-400 mb-8 cursor-pointer mt-1"
          title="Abrir Chat de IA"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex flex-col gap-6 items-center flex-1 w-full text-slate-500">
          <Bot size={18} className="text-violet-400 animate-pulse" />
          <div 
            className="text-[9px] font-mono tracking-widest uppercase font-extrabold text-slate-400 whitespace-nowrap origin-center select-none cursor-pointer hover:text-violet-400"
            style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
            onClick={() => setCollapsed(false)}
          >
            CHAT CON IA
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden shrink-0 select-none transition-all duration-300">
      {/* Console Header */}
      <div className="h-12 border-b border-slate-900 flex items-center justify-between px-4 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-violet-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mentor Inteligente</span>
        </div>
        <div className="flex items-center gap-1">
          {chatHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-slate-500 hover:text-slate-300 p-1 rounded"
              title="Limpiar Conversación"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded hover:bg-slate-900/60 transition-all cursor-pointer"
            title="Colapsar Chat"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin flex flex-col min-h-0">
        
        {/* Welcome message if empty */}
        {chatHistory.length === 0 ? (
          <div className="text-center py-6 space-y-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto animate-pulse">
              <Bot size={20} />
            </div>
            <div className="space-y-1 px-2">
              <h4 className="text-xs font-bold text-slate-200">¿Qué repasamos hoy?</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Pregúntame dudas sobre tus apuntes cargados ({activeSubject?.sources.length || 0} fuentes). Responderé basándome únicamente en tu material de estudio.
              </p>
            </div>

            {/* Quick Suggestions buttons */}
            <div className="pt-4 space-y-1.5 text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block pl-2 mb-1">PROMPT DE ESTUDIO SUGERIDO</span>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(sug)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 text-[10px] text-slate-300 transition-colors leading-snug"
                >
                  ⚡ &ldquo;{sug}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isBot = msg.role === "model";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[90%] ${
                  isBot ? "self-start" : "self-end"
                }`}
              >
                {/* Meta details */}
                <div className="flex items-center gap-1.5 mb-1 select-none">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wide">
                    {isBot ? "OmniBrain Tutor" : "Tú"} • {msg.timestamp}
                  </span>
                </div>

                {/* Bubble box */}
                <div
                  className={`rounded-xl p-3 text-xs leading-relaxed border ${
                    isBot
                      ? "bg-slate-900/45 border-slate-800 text-slate-200 shadow-sm"
                      : "bg-blue-600/10 border-blue-500/20 text-blue-200"
                  }`}
                >
                  {/* Parsing simple formatting for tutor replies manually or with lists */}
                  <div className="space-y-1.5 whitespace-pre-line font-sans break-words text-[11px]">
                    {msg.text}
                  </div>

                  {/* Citations block */}
                  {isBot && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center gap-1">
                      <span className="text-[8px] font-mono text-slate-500 uppercase">Fuentes Citadas:</span>
                      <div className="flex flex-wrap gap-1">
                        {msg.citations.map((cit, idx) => (
                          <span
                            key={idx}
                            className="text-[8px] font-sans bg-blue-950/40 text-blue-300 px-1.5 py-0.2 rounded border border-blue-900/30 truncate max-w-[120px]"
                            title={cit}
                          >
                            {cit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading placeholder when tutor thinking */}
        {isSending && (
          <div className="self-start max-w-[90%] flex flex-col gap-1.5 animate-pulse">
            <span className="text-[8px] font-mono text-slate-500 uppercase">Sintetizando Respuesta...</span>
            <div className="rounded-xl p-3.5 bg-slate-900/40 border border-slate-800 text-xs w-48 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested mini insight at bottom if and only if no input is sending to guide action */}
      {chatHistory.length > 0 && !isSending && (
        <div className="px-4 py-2 mt-auto">
          <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/80 flex items-start gap-2 select-none">
            <Zap size={11} className="text-violet-400 mt-0.5 flex-shrink-0 animate-pulse-slow" />
            <div>
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Respuesta Interactiva</span>
              <p className="text-[9px] text-slate-500 leading-snug">El tutor brinda sugerencias, ecuaciones y repasos alineados.</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Form Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/80 mt-auto bg-slate-950">
        <div className="relative flex items-center bg-slate-900/50 rounded-xl border border-slate-800 shadow-inner overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all p-1">
          <input
            type="text"
            placeholder={activeSubject ? `Preguntar a OmniBrain...` : `Selecciona asignatura...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!activeSubject || isSending}
            className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none font-sans disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!activeSubject || isSending || !query.trim()}
            className="p-1 px-2 text-blue-400 hover:text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg border border-blue-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Send size={12} />
          </button>
        </div>
      </form>
    </div>
  );
}
