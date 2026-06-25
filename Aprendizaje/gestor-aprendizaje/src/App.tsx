import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SummaryView from "./components/SummaryView";
import TimelineView from "./components/TimelineView";
import MindMapView from "./components/MindMapView";
import ProgressDashboard from "./components/ProgressDashboard";
import AIChatView from "./components/AIChatView";
import { Subject, Source, SummaryData, TimelineData, MindMapData, ChatMessage, ThematicTopic } from "./types";
import { 
  Sparkles, Brain, Cpu, BookOpen, Clock, Activity, 
  HelpCircle, ChevronRight, GraduationCap, AlertCircle, RefreshCw,
  Copy, X, FileText
} from "lucide-react";

const DEFAULT_IADATA: {
  [subjectId: string]: {
    summary: SummaryData | null;
    timeline: TimelineData | null;
    mindmap: MindMapData | null;
  }
} = {
  "sub-math": {
    mindmap: {
      nodes: [
        { id: "math-root", label: "Cálculo y Álgebra", category: "root" },
        { id: "math-m1", label: "Cálculo Infinitesimal", category: "main" },
        { id: "math-m2", label: "Ecuaciones Cuadráticas", category: "main" },
        { id: "math-s1", label: "Derivadas (Pendiente)", category: "sub" },
        { id: "math-s2", label: "Integrales (Área en curva)", category: "sub" },
        { id: "math-s3", label: "Teorema Fundamental", category: "sub" },
        { id: "math-s4", label: "Fórmula de Bhaskara", category: "sub" },
        { id: "math-s5", label: "Discriminante (Δ)", category: "sub" },
        { id: "math-s6", label: "Límites Épsilon-Delta", category: "sub" }
      ],
      edges: [
        { source: "math-root", target: "math-m1" },
        { source: "math-root", target: "math-m2" },
        { source: "math-m1", target: "math-s1" },
        { source: "math-m1", target: "math-s2" },
        { source: "math-m1", target: "math-s3" },
        { source: "math-m1", target: "math-s6" },
        { source: "math-m2", target: "math-s4" },
        { source: "math-m2", target: "math-s5" }
      ]
    },
    summary: {
      summary: "El Cálculo Infinitesimal y el Álgebra de segundo grado constituyen la base del análisis cuantitativo clásico. Mientras que el Cálculo unifica los cambios instantáneos (derivada) y la acumulación de áreas bajo la curva (integral) a través de límites rigurosos, el álgebra cuadrática resuelve parábolas determinando intersecciones reales o soluciones imaginarias conjugadas mediante el discriminante.",
      keyConcepts: [
        {
          term: "Teorema Fundamental",
          description: "Relación inversa directa entre diferenciación e integración elemental.",
          expandableContent: "Establecido por Newton y Leibniz. Demuestra que para evaluar la integral de una función continua basta con encontrar una antiderivada, abriendo de manera inmediata el cálculo rápido de trayectorias, fuerzas y leyes de la física clásica sin recurrir a sumas infinitesales manuales."
        },
        {
          term: "Discriminante (Δ)",
          description: "La expresión sub-radical (b² - 4ac) que rige las soluciones cuadráticas.",
          expandableContent: "Rige la cantidad y el tipo de intersecciones de una ecuación cuadrática en el eje cartesiano: positiva (dos puntos continuos en el eje real); cero (un único vértice tangente); negativa (el plano complejo con soluciones conjugadas)."
        },
        {
          term: "Límite Épsilon-Delta",
          description: "La definición moderna y rigurosa de continuidad hecha por Cauchy.",
          expandableContent: "Propuesta formalmente por Augustin-Louis Cauchy. Reemplazó la conceptualización intuitiva de infinitesimales infinitesimales indeterminados de Newton, otorgando el máximo rigor riguroso contemporáneo demostrado en el cálculo."
        }
      ]
    },
    timeline: {
      milestones: [
        {
          title: "Fórmula de Bhaskara",
          date: "Siglo XII",
          type: "formula",
          description: "Resolución generalizada y sistemática de ecuaciones de segundo grado en India de manera explícita por matemáticos orientales.",
          importance: "Alta"
        },
        {
          title: "Lanzamiento del Cálculo",
          date: "1687",
          type: "milestone",
          description: "Isaac Newton y Gottfried Leibniz establecen de manera independiente sus respectivos métodos del cálculo infinitesimal e integral.",
          importance: "Crítica"
        },
        {
          title: "Formalización del Límite",
          date: "1821",
          type: "concept",
          description: "Augustin-Louis Cauchy publica su monumentalCours d'Analyse detallando límites con épsilon y delta de manera rigurosa.",
          importance: "Crítica"
        }
      ]
    }
  }
};

const DEFAULT_CHATS: { [subjectId: string]: ChatMessage[] } = {
  "sub-math": [
    {
      id: "msg-bot-welcome",
      role: "model",
      text: "¡Hola! Bienvenido a OmniBrain. He examinado el material de 'Resumen de Cálculo Avanzado' y 'Álgebra Cuadrática'. ¿Qué te gustaría que repasáramos de tus fuentes hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ["Resumen de Cálculo Avanzado", "Álgebra y Ecuaciones Cuadráticas"]
    }
  ]
};

const SYSTEM_DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "sub-math",
    name: "Matemáticas",
    color: "from-blue-600 to-indigo-600",
    sources: [
      {
        id: "src-math-calc",
        title: "Resumen de Cálculo Avanzado",
        content: `El Cálculo Infinitesimal se ramifica tradicionalmente en Cálculo Diferencial y Cálculo Integral. 
La derivada mide la pendiente instantánea de una curva, mientras que la integral acumula el área comprendida bajo la misma curva sobre un dominio continuo.
Ambas disciplinas se unifican bajo el Teorema Fundamental del Cálculo (formulado por Newton y Leibniz en el siglo XVII), estableciendo que la derivada y la integral definida son contrarias exactas.
Por otra parte, Augustin-Louis Cauchy cimentó el concepto moderno del límite empleando desigualdades de precisión épsilon y delta para desterrar los antiguos y vagos números infinitesimales.`,
        addedAt: "Hace 2 horas",
        wordCount: 88
      },
      {
        id: "src-math-alg",
        title: "Álgebra y Ecuaciones Cuadráticas",
        content: `Las ecuaciones cuadráticas son de segundo grado y adoptan la apariencia polinómica general: ax^2 + bx + c = 0 (donde a no es igual a cero).
La solución matemática para estas ecuaciones está dada por la célebre fórmula de Bhaskara: x = [-b ± sqrt(b^2 - 4ac)] / 2a.
El término ubicado dentro de la raíz cuadrada, b^2 - 4ac, se denomina discriminante (denotado por la letra griega Delta: Δ).
Este discriminante determina la naturaleza tridimensional de las raíces: si es estrictamente positivo, la ecuación cuadrática interseca al eje cartesiano X en dos puntos reales independientes. Si es cero, existe una raíz real repetida (que coincide exactamente con el vértice de la parábola proyectada). Si es estrictamente negativo, la ecuación no interseca el eje real, dando origen a un par ordenado de soluciones complejas conjugadas.`,
        addedAt: "Hace 5 minutos",
        wordCount: 142
      }
    ],
    progress: 40,
    studyTimeHours: 1.2,
    completedMilestones: ["Escuela Pitagórica", "Descubrimiento de la Fórmula General Cuadrática"]
  }
];

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>(SYSTEM_DEFAULT_SUBJECTS);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>("sub-math");
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "mindmap" | "progress">("mindmap");
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [isLiveChecking, setIsLiveChecking] = useState(true);

  // Previsualizador status
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const [copied, setCopied] = useState(false);

  // IA Generation States (separated by subject and action type)
  const [iaData, setIaData] = useState<{
    [subjectId: string]: {
      summary: SummaryData | null;
      timeline: TimelineData | null;
      mindmap: MindMapData | null;
    }
  }>(DEFAULT_IADATA);

  const [loadingStates, setLoadingStates] = useState<{
    [subjectId: string]: {
      summary: boolean;
      timeline: boolean;
      mindmap: boolean;
    }
  }>({});

  // Chat conversation state grouped by subject
  const [chats, setChats] = useState<{ [subjectId: string]: ChatMessage[] }>(DEFAULT_CHATS);
  const [isChatSending, setIsChatSending] = useState(false);

  // Initialize and load saved state from localStorage
  useEffect(() => {
    checkBackendStatus();

    const savedSubjects = localStorage.getItem("omnibrain_subjects");
    const savedIAData = localStorage.getItem("omnibrain_iadata");
    const savedChats = localStorage.getItem("omnibrain_chats");

    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubjects(parsed);
          setActiveSubjectId(parsed[0].id);
        } else {
          setSubjects(SYSTEM_DEFAULT_SUBJECTS);
          setActiveSubjectId(SYSTEM_DEFAULT_SUBJECTS[0].id);
        }
      } catch (e) {
        setSubjects(SYSTEM_DEFAULT_SUBJECTS);
        setActiveSubjectId(SYSTEM_DEFAULT_SUBJECTS[0].id);
      }
    } else {
      setSubjects(SYSTEM_DEFAULT_SUBJECTS);
      setActiveSubjectId(SYSTEM_DEFAULT_SUBJECTS[0].id);
    }

    if (savedIAData) {
      try {
        const parsed = JSON.parse(savedIAData);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setIaData(parsed);
        } else {
          setIaData(DEFAULT_IADATA);
        }
      } catch (e) {
        setIaData(DEFAULT_IADATA);
      }
    } else {
      setIaData(DEFAULT_IADATA);
    }

    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setChats(parsed);
        } else {
          setChats(DEFAULT_CHATS);
        }
      } catch (e) {
        setChats(DEFAULT_CHATS);
      }
    } else {
      setChats(DEFAULT_CHATS);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem("omnibrain_subjects", JSON.stringify(subjects));
    }
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("omnibrain_iadata", JSON.stringify(iaData));
  }, [iaData]);

  useEffect(() => {
    localStorage.setItem("omnibrain_chats", JSON.stringify(chats));
  }, [chats]);

  const checkBackendStatus = async () => {
    setIsLiveChecking(true);
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setIsBackendLive(!!data.live);
    } catch (e) {
      setIsBackendLive(false);
    } finally {
      setIsLiveChecking(false);
    }
  };

  const getActiveSubject = (): Subject | null => {
    return subjects.find((s) => s.id === activeSubjectId) || null;
  };

  const handleSelectSubject = (subject: Subject) => {
    setActiveSubjectId(subject.id);
  };

  const handleCreateSubject = (name: string, color: string) => {
    const newSub: Subject = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      name,
      color,
      sources: [],
      progress: 0,
      studyTimeHours: 0,
      completedMilestones: []
    };
    setSubjects((prev) => [...prev, newSub]);
    setActiveSubjectId(newSub.id);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSubjectId === id) {
        setActiveSubjectId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    // Clean sub caches
    const newIaData = { ...iaData };
    delete newIaData[id];
    setIaData(newIaData);

    const newChats = { ...chats };
    delete newChats[id];
    setChats(newChats);
  };

  const handleAddSource = (title: string, content: string) => {
    if (!activeSubjectId) return;

    const sourceCount = content.trim().split(/\s+/).filter(Boolean).length;
    const newSource: Source = {
      id: "src-" + Math.random().toString(36).substr(2, 9),
      title,
      content,
      addedAt: "Reciente",
      wordCount: sourceCount
    };

    setSubjects((prev) => {
      return prev.map((s) => {
        if (s.id === activeSubjectId) {
          const updatedSources = [...s.sources, newSource];
          return { ...s, sources: updatedSources };
        }
        return s;
      });
    });
  };

  const handleDeleteSource = (sourceId: string) => {
    if (!activeSubjectId) return;

    setSubjects((prev) => {
      return prev.map((s) => {
        if (s.id === activeSubjectId) {
          const updatedSources = s.sources.filter((src) => src.id !== sourceId);
          return { ...s, sources: updatedSources };
        }
        return s;
      });
    });
  };

  const handleUpdateSubjectHours = (subId: string, hours: number) => {
    setSubjects((prev) => {
      return prev.map((s) => {
        if (s.id === subId) {
          const currentHours = s.studyTimeHours || 0;
          return { ...s, studyTimeHours: Number((currentHours + hours).toFixed(2)) };
        }
        return s;
      });
    });
  };

  const handleToggleCompleteMilestone = (milestoneTitle: string) => {
    if (!activeSubjectId) return;
    setSubjects((prev) => {
      return prev.map((s) => {
        if (s.id === activeSubjectId) {
          const current = s.completedMilestones || [];
          const updated = current.includes(milestoneTitle)
            ? current.filter((m) => m !== milestoneTitle)
            : [...current, milestoneTitle];
          return { ...s, completedMilestones: updated };
        }
        return s;
      });
    });
  };

  // IA actions: generate or request structure
  const handleGenerateAIStructure = async (action: "summarize" | "timeline" | "mindmap", proMode = false) => {
    if (!activeSubjectId) return;
    const sub = getActiveSubject();
    if (!sub) return;

    // Set loading
    setLoadingStates((prev) => ({
      ...prev,
      [activeSubjectId]: {
        ...(prev[activeSubjectId] || { summary: false, timeline: false, mindmap: false }),
        [action]: true
      }
    }));

    try {
      const response = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          sources: sub.sources,
          subject: sub.name,
          usePro: proMode
        })
      });

      if (!response.ok) {
        throw new Error("Respuesta no satisfactoria del servidor backend");
      }

      const payload = await response.json();

      setIaData((prev) => ({
        ...prev,
        [activeSubjectId]: {
          ...(prev[activeSubjectId] || { summary: null, timeline: null, mindmap: null }),
          [action]: payload
        }
      }));
    } catch (err: any) {
      console.error("AI execution error:", err);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [activeSubjectId]: {
          ...(prev[activeSubjectId] || { summary: false, timeline: false, mindmap: false }),
          [action]: false
        }
      }));
    }
  };

  // AI Chat message sender
  const handleSendQuery = async (query: string) => {
    if (!activeSubjectId || !query.trim()) return;
    const sub = getActiveSubject();
    if (!sub) return;

    const userMsg: ChatMessage = {
      id: "msg-user-" + Date.now(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = chats[activeSubjectId] || [];
    const updatedHistoryWithUser = [...currentHistory, userMsg];

    setChats((prev) => ({
      ...prev,
      [activeSubjectId]: updatedHistoryWithUser
    }));

    setIsChatSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sub.name,
          query,
          history: updatedHistoryWithUser.map((h) => ({ role: h.role, text: h.text })),
          sources: sub.sources
        })
      });

      if (!response.ok) {
        throw new Error("Fallo al conectar con el servidor chat");
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: "msg-bot-" + Date.now(),
        role: "model",
        text: data.message,
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats((prev) => ({
        ...prev,
        [activeSubjectId]: [...updatedHistoryWithUser, botMsg]
      }));
    } catch (err: any) {
      console.error("Chat sending error:", err);
      const errorMsg: ChatMessage = {
        id: "msg-bot-err-" + Date.now(),
        role: "model",
        text: `⚠️ No logramos recibir respuesta del Tutor Inteligente. Asegúrate de que el servidor esté activo. Detalle: ${err.message || "Conexión interrumpida"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats((prev) => ({
        ...prev,
        [activeSubjectId]: [...updatedHistoryWithUser, errorMsg]
      }));
    } finally {
      setIsChatSending(false);
    }
  };

  const handleClearChatHistory = () => {
    if (!activeSubjectId) return;
    setChats((prev) => ({
      ...prev,
      [activeSubjectId]: []
    }));
  };

  // Helper selectors for active cache
  const activeSubject = getActiveSubject();
  const currentSubjectIaStats = activeSubjectId ? iaData[activeSubjectId] || null : null;
  const currentSubjectLoading = activeSubjectId 
    ? loadingStates[activeSubjectId] || { summary: false, timeline: false, mindmap: false } 
    : { summary: false, timeline: false, mindmap: false };
  const currentSubjectMessages = activeSubjectId ? chats[activeSubjectId] || [] : [];

  const currentThematicTimeline = activeSubject?.thematicTimeline || [];

  const handleUpdateThematicTimeline = (updated: ThematicTopic[]) => {
    if (!activeSubjectId) return;
    setSubjects((prev) =>
      prev.map((s) => (s.id === activeSubjectId ? { ...s, thematicTimeline: updated } : s))
    );
  };

  // Maintain and auto-initialize thematic timeline if empty on active subject change
  useEffect(() => {
    if (activeSubject && !activeSubject.thematicTimeline) {
      const initial = getInitialThematicTimeline(activeSubject.name, activeSubject.sources);
      setSubjects((prev) =>
        prev.map((s) => (s.id === activeSubject.id ? { ...s, thematicTimeline: initial } : s))
      );
    }
  }, [activeSubjectId, activeSubject?.thematicTimeline]);

  // Helper to guide Node Click to Mentor Chat
  const handleQueryFromNode = (nodeLabel: string) => {
    const prompt = `Cuéntame sobre la relevancia de: "${nodeLabel}" en la materia y cómo se conecta con mis fuentes de estudio actuales.`;
    handleSendQuery(prompt);
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-900 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <div className="w-4 h-4 bg-white rounded-full mix-blend-overlay"></div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            OmniBrain
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <div className={`w-2 h-2 rounded-full ${isBackendLive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"}`}></div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {isBackendLive ? "Gemini Live Activo" : "Simulador Inteligente"}
            </span>
          </div>
          
          <button
            onClick={checkBackendStatus}
            className="p-1 rounded bg-slate-900/40 hover:bg-slate-800 text-slate-400"
            title="Sincronizar API Status"
          >
            <RefreshCw size={12} className={isLiveChecking ? "animate-spin" : ""} />
          </button>

          <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs text-white font-bold tracking-wide font-mono hover:scale-105 transition-transform" title="Perfil de Estudiante">
            OB
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel 1: Left Navigation & Sources (Collapsible) */}
        <Sidebar
          subjects={subjects}
          activeSubject={activeSubject}
          onSelectSubject={handleSelectSubject}
          onCreateSubject={handleCreateSubject}
          onDeleteSubject={handleDeleteSubject}
          onAddSource={handleAddSource}
          onDeleteSource={handleDeleteSource}
          isBackendLive={isBackendLive}
          onPreviewSource={setPreviewSource}
        />

        {/* Panel 2: Center - Smart Interactive Workspace */}
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden border-r border-slate-900">
          
          {/* Tabs header */}
          <div className="h-12 border-b border-slate-900 flex items-center px-4 gap-6 bg-slate-900/20 shrink-0">
            <button
              onClick={() => setActiveTab("mindmap")}
              className={`h-full flex items-center border-b-2 text-[10px] font-bold uppercase tracking-wider transition-all px-1.5 focus:outline-none ${
                activeTab === "mindmap"
                  ? "border-violet-500 text-violet-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Mapa Mental
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`h-full flex items-center border-b-2 text-[10px] font-bold uppercase tracking-wider transition-all px-1.5 focus:outline-none ${
                activeTab === "summary"
                  ? "border-violet-500 text-violet-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Resúmenes & Conceptos
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`h-full flex items-center border-b-2 text-[10px] font-bold uppercase tracking-wider transition-all px-1.5 focus:outline-none ${
                activeTab === "timeline"
                  ? "border-violet-500 text-violet-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Línea de Tiempo
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`h-full flex items-center border-b-2 text-[10px] font-bold uppercase tracking-wider transition-all px-1.5 focus:outline-none ${
                activeTab === "progress"
                  ? "border-violet-500 text-violet-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Indicadores & Dashboard
            </button>
          </div>

          {/* Active View Renderer */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeSubject ? (
              <>
                {activeTab === "mindmap" && (
                  <MindMapView
                    data={currentSubjectIaStats?.mindmap || null}
                    isLoading={currentSubjectLoading.mindmap}
                    onGenerate={() => handleGenerateAIStructure("mindmap")}
                    onNodeClickToChat={handleQueryFromNode}
                  />
                )}

                {activeTab === "summary" && (
                  <SummaryView
                    data={currentSubjectIaStats?.summary || null}
                    isLoading={currentSubjectLoading.summary}
                    onGenerate={(pro) => handleGenerateAIStructure("summarize", pro)}
                    hasSources={activeSubject.sources.length > 0}
                    isBackendLive={isBackendLive}
                  />
                )}

                {activeTab === "timeline" && (
                  <TimelineView
                    milestones={currentSubjectIaStats?.timeline?.milestones || []}
                    subject={activeSubject}
                    isLoading={currentSubjectLoading.timeline}
                    onGenerate={() => handleGenerateAIStructure("timeline")}
                    onToggleCompleteMilestone={handleToggleCompleteMilestone}
                    thematicTimeline={currentThematicTimeline}
                    onUpdateThematicTimeline={handleUpdateThematicTimeline}
                    onPreviewSource={setPreviewSource}
                  />
                )}

                {activeTab === "progress" && (
                  <ProgressDashboard
                    subject={activeSubject}
                    milestones={currentSubjectIaStats?.timeline?.milestones || []}
                    onToggleMilestone={handleToggleCompleteMilestone}
                    onUpdateSubjectHours={handleUpdateSubjectHours}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Brain size={48} className="text-slate-700 animate-pulse mb-3" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">OmniBrain</h3>
                <p className="text-xs text-slate-500 max-w-sm">No has seleccionado ninguna asignatura. Genera o haz clic sobre una en el panel de navegación izquierdo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Right Panel - Context Aware AI Tutor Chat */}
        <AIChatView
          chatHistory={currentSubjectMessages}
          onSendMessage={handleSendQuery}
          onClearHistory={handleClearChatHistory}
          activeSubject={activeSubject}
          isSending={isChatSending}
          isBackendLive={isBackendLive}
        />

      </div>

      {/* Footer Status Bar with mock-telemmetry to enrich look and precision */}
      <footer className="h-7 border-t border-slate-900 bg-slate-950 px-6 flex items-center justify-between text-[9px] text-slate-600 shrink-0 font-mono select-none">
        <div className="flex gap-4">
          <span>MEMORIA COGNITIVA: {128 * (subjects.length || 1)} MB</span>
          <span>ESTADO: ONLINE</span>
          <span>LATENCIA: {isBackendLive ? "45ms" : "Offline Simulator"}</span>
        </div>
        <div className="text-slate-500">
          OmniBrain v2.4.0 • Desarrollado para Aprendizaje Dinámico
        </div>
      </footer>

      {/* 4. GORGEOUS PREVISUALIZADOR MODAL */}
      {previewSource && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-text">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest block">PREVISUALIZADOR DE FUENTE</span>
                  <h3 className="text-sm font-bold text-slate-200 mt-0.5 truncate max-w-[320px] sm:max-w-[450px]">
                    {previewSource.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewSource.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase rounded border border-slate-750 bg-slate-950 hover:bg-slate-900 text-slate-100 hover:text-white flex items-center gap-1.5 cursor-pointer select-none font-mono"
                >
                  <CheckCircleOrCopy isCopied={copied} />
                  <span>{copied ? "¡Copiado!" : "Copiar Texto"}</span>
                </button>

                <button
                  onClick={() => setPreviewSource(null)}
                  className="p-1.5 rounded-lg border border-slate-850 bg-slate-950 text-slate-450 hover:text-slate-200 hover:bg-slate-900 cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-950/40 text-xs text-slate-350 leading-relaxed space-y-4 scrollbar-thin select-text">
              <div className="whitespace-pre-line border-l-2 border-violet-600/30 pl-4 py-1 text-slate-300 font-sans select-text">
                {previewSource.content}
              </div>
            </div>

            {/* Footer metrics info */}
            <div className="p-3 bg-slate-950 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500 select-none">
              <span>{previewSource.wordCount} palabras registradas</span>
              <span>Subido: {previewSource.addedAt}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inner helper icon to handle copies beautifully
function CheckCircleOrCopy({ isCopied }: { isCopied: boolean }) {
  if (isCopied) {
    return <span className="text-emerald-400 font-bold">✓</span>;
  }
  return <Copy size={11} />;
}

// Helper engine to assemble high-fidelity syllabus planning nodes per subject
export function getInitialThematicTimeline(subjectName: string, sources: Source[] = []): ThematicTopic[] {
  const nameLower = subjectName.toLowerCase();
  
  if (nameLower.includes("matem") || nameLower.includes("calculo") || nameLower.includes("algebra") || nameLower.includes("trigono")) {
    return [
      {
        id: "topic-math-1",
        title: "Trigonometría Fundamental",
        timeframe: "Hoy",
        learned: "Estudio analítico de razones trigonométricas, identidades recíprocas (seno, coseno, tangente) y resolución geométrica de triángulos rectángulos y oblicuángulos en el plano bidimensional.",
        foundation: "Fundamentos de geometría euclidiana, proporciones de escala y el Teorema de Pitágoras clásico.",
        necessity: "Es indispensable para descomponer vectores de fuerzas cinéticas en física, analizar oscilaciones periódicas armónicas y modelar señales de audio/onda.",
        influence: "Sirve de soporte absolute para extender las razones geométricas trigonométricas elementales hacia la teoría general de funciones circulares continuas y análisis de frecuencias periódicas.",
        importance: "Alta",
        sourceIds: sources.length > 0 ? [sources[0].id] : []
      },
      {
        id: "topic-math-2",
        title: "Teoría General y Estructura de Funciones",
        timeframe: "En 1 mes",
        learned: "Evaluación formal de dominios numéricos, codominios/recorridos, traslaciones lineales y no lineales sobre gráficos de coordenadas, y criterios de inyectividad, sobreyectividad e inversión de funciones.",
        foundation: "Operaciones algebraicas aritméticas y mapeos primitivos de pares ordenados.",
        necessity: "Es crucial para formular, codificar o simular matemáticamente cualquier dinámica real observable en ingeniería, finanzas o física donde un parámetro varíe en dependencia analítica de otro.",
        influence: "Permite conceptualizar el comportamiento límite local de funciones complejas, aportando el andamiaje formal de desigualdades requerido para el Cálculo de límites infinitesimales de Cauchy.",
        importance: "Crítica",
        sourceIds: sources.length > 0 ? [sources[0].id] : []
      },
      {
        id: "topic-math-3",
        title: "Álgebra Polinómica e Identidades Avanzadas",
        timeframe: "En 3 meses",
        learned: "Factorización profunda de polinomios reales mediante Teorema del Residuo, resolución analítica de raíces cuadráticas a través del discriminante clásico, sistemas de desigualdades y logaritmos.",
        foundation: "Propiedades algebraicas distributivas complejas, leyes elementales de radicales y exponentes fraccionarios.",
        necessity: "Permite simplificar de manera limpia y ágil expresiones algebraicas racionales complejas previas a ser operadas en procesos rigurosos de diferenciación diferencial.",
        influence: "La destreza logarítmica y polinómica es el motor del cálculo integral avanzado, posibilitando la deconstrucción de fracciones en términos lineales más sencillos para su integración.",
        importance: "Media",
        sourceIds: sources.length > 1 ? [sources[1].id] : []
      },
      {
        id: "topic-math-4",
        title: "Cálculo Diferencial ordinario, Límites e Infinitesimales",
        timeframe: "En 6 meses",
        learned: "Concepto analítico de continuidad formalizado por épsilon-delta de Cauchy, derivación de funciones elementales mediante límites y optimización de curvas críticas en ingeniería.",
        foundation: "Estructuras de funciones compuestas, pendientes geométricas clásicas y límites de indeterminación matemática (0/0).",
        necessity: "Habilita la estimación exacta de tasas de cambio instantáneas, crucial para optimizar recursos escasos (minimizar costos de manufactura o maximizar la velocidad de transferencia).",
        influence: "Representa el núcleo inverso que conecta los procesos acumulativos de áreas (Cálculo Integral) mediante la joya de la corona de la física matemática: el Teorema Fundamental del Cálculo (TFC).",
        importance: "Crítica",
        sourceIds: sources.length > 0 ? [sources[0].id] : []
      }
    ];
  }

  if (nameLower.includes("histor") || nameLower.includes("roma") || nameLower.includes("social") || nameLower.includes("politica")) {
    return [
      {
        id: "topic-hist-1",
        title: "Derechos y deconstrucción de Instituciones Clásicas de Roma",
        timeframe: "Hoy",
        learned: "Leyes estandarizadas escritas (Doce Tablas), el rol institucionalizador de fiscalización del Senado republicano y la transición del poder centralizado autocrático promovido por Augusto.",
        foundation: "Modelos generales de ciudades-estado griegas basadas en democracia directa e imperios absolutistas del oriente.",
        necessity: "Es el cimiento supremo que estructuró la jurisprudencia civil, la estructuración parlamentaria bicameral y los códigos legales de casi la totalidad de repúblicas occidentales modernas.",
        influence: "Establece los límites territoriales, las legislaciones locales y los sistemas de gobernanza que persistieron tras la fragmentación administrativa en el ala occidental del imperio.",
        importance: "Crítica",
        sourceIds: sources.length > 0 ? [sources[0].id] : []
      },
      {
        id: "topic-hist-2",
        title: "Fragmentación de Occidente e Instituciones Feudales (Edad Media)",
        timeframe: "En 1 mes",
        learned: "Sistemas de vasallaje mutuo señorial, descentralización feudal del poder agrario, el rol integrador teocrático de la Iglesia y el surgimiento del bajo clero y comerciantes.",
        foundation: "La caída de la soberanía unificada de la Pax Romana e invasiones germánicas periféricas territoriales.",
        necessity: "Es crucial para entender de dónde provienen las actuales demarcaciones geográficas europeas y la evolución del cobro tributario aduanero regional.",
        influence: "Las concentraciones pecuniarias de corporaciones y gremios libres sentaron las bases comerciales para financiar la cartografía de exploración transatlántica de ultramar.",
        importance: "Alta",
        sourceIds: sources.length > 0 ? [sources[0].id] : []
      },
      {
        id: "topic-hist-3",
        title: "Revolución Científica y Filosofía Ilustrada",
        timeframe: "En 3 meses",
        learned: "Transición del dogma cosmológico teocéntrico al método empírico comprobable (Galileo, Newton), y formulación de teorías contractualistas (Locke, Montesquieu, Rousseau).",
        foundation: "El redescubrimiento renacentista humanista clásico asistido por el catalizador informático de la imprenta de tipos móviles.",
        necessity: "Sustituye la legitimación hereditaria absolutista monárquica por la noción de soberanía popular, libertad individual de imprenta y asambleas ciudadanas.",
        influence: "La primacía y confianza ciega en la deconstrucción y control físico racional del entorno habilita el diseño de los primeros sistemas térmicos automatizados.",
        importance: "Crítica",
        sourceIds: sources.length > 1 ? [sources[1].id] : []
      },
      {
        id: "topic-hist-4",
        title: "Sistemas de Mecanización y la Era de Grandes Revoluciones Industriales",
        timeframe: "En 6 meses",
        learned: "Sustitución de fuerza de tracción animal por combustión de vapor y carbón, reestructuración demográfica polarizada del proletariado, y doctrinas de distribución del capital.",
        foundation: "Redes comerciales internacionales, teorías de termodinámica e invenciones y patentes mecánicas.",
        necessity: "Presenta las claves estructurales para comprender la economía de consumo masivo, las luchas obreras organizadas y las tensiones ecológicas globales contemporáneas.",
        influence: "Explica los desafíos actuales de transición ecológica, ciber-automatización robótica e inteligencia artificial generalizada.",
        importance: "Alta",
        sourceIds: sources.length > 1 ? [sources[1].id] : []
      }
    ];
  }

  // default/fallback
  return [
    {
      id: "topic-gen-1",
      title: "Técnica Feynman de Aprendizaje Profundo",
      timeframe: "Hoy",
      learned: "Estrategia de deconstrucción para desmenuzar explicaciones en analogías simples del habla ordinaria como si se explicara a un niño de 10 años.",
      foundation: "Mente abierta, capacidad autocrítica rigurosa y rechazo voluntario al lenguaje rebuscado memorístico.",
      necessity: "Deshace en instantes la 'ilusión del conocimiento': una anomalía psicológica común donde el estudiante confunde memorizar palabras raras con comprender realmente el fenómeno físico.",
      influence: "Garantiza un entendimiento sólido y veraz, despejando el material de distorsiones conceptuales antes de programar su retención en intervalos espaciados.",
      importance: "Crítica",
      sourceIds: sources.map(s => s.id)
    },
    {
      id: "topic-gen-2",
      title: "Programación de Repaso Espaciado y Curva del Olvido de Ebbinghaus",
      timeframe: "En 1 mes",
      learned: "Uso de intervalos de tiempo calculados geométricamente crecientes para invocar el recuerdo justo en el punto de inflexión del decaimiento retentivo.",
      foundation: "Técnica Feynman preliminar para asegurar que la información calendarizada sea verídicamente entendida sin errores de raíz.",
      necessity: "Multiplica la eficiencia del estudio disminuyendo drácticamente el índice de horas semanales dedicadas a 'releer' de urgencia antes de exámenes de alto promedio.",
      influence: "Estabiliza una autopista de acceso rápido neural en la corteza cerebral, creando la agilidad y soltura indispensable para resolver ejercicios de recuperación activa estimulante.",
      importance: "Alta",
      sourceIds: []
    }
  ];
}
