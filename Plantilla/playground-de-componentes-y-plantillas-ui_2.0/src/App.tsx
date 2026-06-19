import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Copy, 
  Code, 
  Check, 
  Eye, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  RotateCcw, 
  Info, 
  Search, 
  Code2, 
  ArrowRight,
  Flame,
  LayoutGrid,
  Laptop,
  Cpu,
  Moon,
  Zap,
  Globe,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Columns2,
  LayoutList,
  Grid,
  Layout,
  Key,
  EyeOff
} from "lucide-react";
import { INITIAL_COMPONENTS, UIComponent } from "./data/initialComponents";

interface ThemeConfig {
  id: string;
  name: string;
  bgApp: string;
  bgPanel: string;
  bgInner: string;
  borderPanel: string;
  activeTabGlow: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  glowColor: "cyan" | "violet" | "emerald" | "amber";
  blurGlows: string[];
}

const THEMES: ThemeConfig[] = [
  {
    id: "studio-dark",
    name: "Estudio Oscuro",
    bgApp: "bg-[#0b0d19]",
    bgPanel: "bg-[#151a30]",
    bgInner: "bg-[#0b0d19]/40",
    borderPanel: "border-[#20294a]/60",
    activeTabGlow: "from-cyan-600 to-indigo-600",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    accentBorder: "border-cyan-500/20",
    glowColor: "cyan",
    blurGlows: ["bg-cyan-600/5", "bg-violet-600/5"]
  },
  {
    id: "cyberpunk",
    name: "Terminal Táctico",
    bgApp: "bg-[#05060b]",
    bgPanel: "bg-[#0d1222]",
    bgInner: "bg-[#030408]",
    borderPanel: "border-emerald-500/20",
    activeTabGlow: "from-emerald-600 to-teal-600",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/20",
    glowColor: "emerald",
    blurGlows: ["bg-emerald-600/5", "bg-lime-600/5"]
  },
  {
    id: "eclipse",
    name: "Eclipse Místico",
    bgApp: "bg-[#070514]",
    bgPanel: "bg-[#110d24]",
    bgInner: "bg-[#04020a]",
    borderPanel: "border-purple-500/20",
    activeTabGlow: "from-purple-600 to-pink-600",
    accentText: "text-fuchsia-400",
    accentBg: "bg-purple-500/10",
    accentBorder: "border-purple-500/20",
    glowColor: "violet",
    blurGlows: ["bg-purple-600/5", "bg-pink-600/5"]
  },
  {
    id: "amber",
    name: "Ámbar Cósmico",
    bgApp: "bg-[#110b07]",
    bgPanel: "bg-[#1f150e]",
    bgInner: "bg-[#0a0603]",
    borderPanel: "border-amber-600/20",
    activeTabGlow: "from-amber-600 to-orange-600",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/20",
    glowColor: "amber",
    blurGlows: ["bg-amber-600/5", "bg-rose-600/5"]
  }
];

export default function App() {
  const [components, setComponents] = useState<UIComponent[]>(() => {
    const saved = localStorage.getItem("ui_playground_components");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UIComponent[];
        // Auto-merge missing INITIAL_COMPONENTS so that any new pre-designed elements are added automatically
        const parsedIds = new Set(parsed.map(c => c.id));
        const missingFromInitial = INITIAL_COMPONENTS.filter(comp => !parsedIds.has(comp.id));
        if (missingFromInitial.length > 0) {
          const merged = [...parsed, ...missingFromInitial];
          localStorage.setItem("ui_playground_components", JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_COMPONENTS;
  });

  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem("ui_playground_theme_id") || "studio-dark";
  });

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cards' | 'buttons' | 'links' | 'grids'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Estructura & Responsive Layout States
  const [globalPreviewWidth, setGlobalPreviewWidth] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('full');
  const [appLayoutMode, setAppLayoutMode] = useState<'split' | 'dashboard' | 'compact'>('split');
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  // User Gemini API Key States
  const [userGeminiKey, setUserGeminiKey] = useState<string>(() => {
    return localStorage.getItem("user_gemini_key") || ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || "";
  });
  const [tempKey, setTempKey] = useState<string>(() => {
    return localStorage.getItem("user_gemini_key") || ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || "";
  });
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(() => {
    const hasStored = localStorage.getItem("user_gemini_key");
    const hasEnv = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    return !hasStored && !hasEnv;
  });
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [preferredModel, setPreferredModel] = useState<string>(() => localStorage.getItem("preferred_gemini_model") || "gemini-3.5-flash");

  // Live edits state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [liveHtml, setLiveHtml] = useState<{ [id: string]: string }>({});
  
  // Interaction response state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPreviewInfo, setShowPreviewInfo] = useState(true);

  // Active theme helper
  const activeTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  const handleSetTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    localStorage.setItem("ui_playground_theme_id", themeId);
  };

  // Helper to persist components list
  const saveComponents = (newComponents: UIComponent[]) => {
    setComponents(newComponents);
    localStorage.setItem("ui_playground_components", JSON.stringify(newComponents));
  };

  // Predefined prompts for rapid inspiration
  const SUGGESTED_PROMPTS = [
    { label: "Formulario Neón", query: "Un formulario flotante de login con efecto de cristal esmerilado y sombras neón violeta." },
    { label: "Bioluminiscencia CSS", query: "Un botón redondo con halo de carga animada que late en color ámbar y cian." },
    { label: "Bento Grid de Precios", query: "Una tabla de suscripciones bento con tres planes destacando el plan preferido con bordes dinámicos." },
    { label: "Alerta Atómica", query: "Una barra flotante de notificación/alerta crítica con microanimaciones elegantes para error del sistema." }
  ];

  // Direct client-side Gemini generation helper with retries and falling back to alternative models
  const generateWithRetryAndFallbackClient = async (
    apiKey: string,
    preferred: string,
    prompt: string
  ) => {
    // Priority order of fallback models
    const defaultModelsList = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
    const modelsToTry = [preferred];
    for (const m of defaultModelsList) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }

    const SYSTEM_INSTRUCTION = `Eres un experto Ingeniero de Software Frontend y Arquitecto de Sistemas UI, especializado en diseñar componentes HTML ultra modernos, elegantes e interactivos que emplean exclusivamente clases de Tailwind CSS v4 y opcionalmente iconos de FontAwesome v6 (clases fas, far, fab, etc.).

Tu tarea es generar un componente de interfaz de usuario de alta calidad de acuerdo con la petición del usuario.
El componente debe ser independiente, autocontenido y lucir espectacular. Debe utilizar la estética de desarrollo oscura premium (fondo del contenedor oscuro, contrastes de color vibrantes como cian, violeta o esmeralda, efectos de cristal, sombras, brillos hover, transiciones fluidas de transición/duración, etc.).

IMPORTANTE: El HTML generado debe utilizar clases existentes en Tailwind CSS. No incluyas scripts externos ni etiquetas de script en tu HTML. Si deseas microcomportamientos dinámicos, puedes usar trucos de Tailwind o selectores de estados (como peer, group, hover, focus, active, etc.) o asumir que el usuario interactuará con el HTML directamente. El código debe caber dentro de una etiqueta contenedora principal (div). El código debe ser limpio y visualmente impactante.
Para iconos, utiliza iconos de FontAwesome v6 (ej: <i class="fa-solid fa-bolt"></i>).

Debes responder estrictamente en formato JSON utilizando el esquema proporcionado. No agregues etiquetas de markdown como \`\`\`json al inicio o al final del texto JSON.`;

    let lastError: any = null;

    for (const model of modelsToTry) {
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Client Gemini] Intentando generación con modelo: ${model} (Intento ${attempt}/${maxRetries})`);
          
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          
          const payload = {
            contents: [
              {
                parts: [
                  {
                    text: `Diseña este componente UI: ${prompt}`
                  }
                ]
              }
            ],
            systemInstruction: {
              parts: [
                {
                  text: SYSTEM_INSTRUCTION
                }
              ]
            },
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  name: {
                    type: "STRING",
                    description: "Nombre descriptivo del componente (ej: Tarjeta Holográfica Premium, Botón con Destello de Neón)."
                  },
                  description: {
                    type: "STRING",
                    description: "Una breve explicación de qué hace el componente y sus características de diseño."
                  },
                  category: {
                    type: "STRING",
                    description: "Categoría del componente. Debe ser una de estas: 'cards', 'buttons', 'links', 'grids'."
                  },
                  html: {
                    type: "STRING",
                    description: "Código HTML completo y resuelto con clases de Tailwind CSS e iconos de FontAwesome. Debe ser autocompletado y listo para ser inyectado."
                  }
                },
                required: ["name", "description", "category", "html"]
              }
            }
          };

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errJSON: any;
            try { errJSON = JSON.parse(errorText); } catch(e) {}
            const errMsg = errJSON?.error?.message || errorText || "Error desconocido";
            const errCode = errJSON?.error?.code || response.status;
            throw { message: errMsg, code: errCode };
          }

          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            console.log(`[Client Gemini] Éxito absoluto usando modelo: ${model} en intento ${attempt}`);
            return {
              text: text,
              modelUsed: model,
              attempts: attempt
            };
          }
          throw new Error("Respuesta de contenido vacía recibida de Gemini.");

        } catch (error: any) {
          lastError = error;
          
          const errorMsg = error.message || String(error);
          const errorStatus = error.code || null;
          
          const isUnavailable = 
            errorStatus === 503 ||
            String(errorStatus).includes("503") ||
            errorMsg.toUpperCase().includes("UNAVAILABLE") ||
            errorMsg.toLowerCase().includes("high demand") ||
            errorMsg.toLowerCase().includes("overloaded") ||
            errorMsg.toLowerCase().includes("temporary") ||
            errorMsg.toLowerCase().includes("resource exhausted");

          console.warn(`[Client Gemini] Advertencia: Fallo en intento ${attempt} con modelo ${model}:`, errorMsg);
          
          if (isUnavailable && attempt < maxRetries) {
            const delay = attempt * 1200;
            console.warn(`[Client Gemini] El modelo ${model} está experimentando alta demanda (503). Reintentando en ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            // Unrecoverable or max retries hit, move to next model
            break;
          }
        }
      }
    }

    throw lastError || new Error("No se pudo completar la generación del componente con los modelos de Gemini ni con las estrategias de respaldo.");
  };

  // AI Generation Handler (100% Client-Side)
  const handleGenerateWithAI = async (promptText: string) => {
    if (!promptText.trim()) return;

    if (!userGeminiKey.trim()) {
      setServerError("Se requiere una API Key de Gemini. Por favor, ingrésala en la ventana de configuración.");
      setShowKeyConfig(true);
      return;
    }
    
    setIsGenerating(true);
    setServerError(null);
    setLoadingStep("Inicializando conexión directa con el núcleo Gemini (Client-Side)...");

    try {
      // Simulate design system loading checkpoints
      const steps = [
        "Analizando patrones del prompt y estructuras de diseño...",
        "Componiendo utilidades de flex/grid de Tailwind CSS...",
        "Inyectando estilos con FontAwesome v6...",
        "Completando el empaquetado de componentes interactivos con efectos hover..."
      ];
      
      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          setLoadingStep(steps[stepIdx]);
          stepIdx++;
        } else {
          clearInterval(interval);
        }
      }, 1000);

      const result = await generateWithRetryAndFallbackClient(userGeminiKey, preferredModel, promptText);

      clearInterval(interval);

      const newCompData = JSON.parse(result.text.trim());
      
      // Assemble new unique component
      const generatedComponent: UIComponent = {
        id: `ai-${Date.now()}`,
        name: newCompData.name || "Componente Generado por IA",
        description: newCompData.description || "Componente personalizado diseñado mediante procesamiento cognitivo.",
        category: (newCompData.category as any) || "cards",
        html: newCompData.html || "<div>No HTML returned</div>"
      };

      const updated = [generatedComponent, ...components];
      saveComponents(updated);
      setAiPrompt("");
      setEditingId(generatedComponent.id); // Open editor immediately to encourage live customization!
      
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || "Error al conectar con la API de diseño inteligente.");
    } finally {
      setIsGenerating(false);
      setLoadingStep("");
    }
  };

  // Helper to copy code to Clipboard
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Reset to default library template list
  const handleResetDefaults = () => {
    if (window.confirm("¿Seguro que deseas restablecer los componentes predefinidos de fábrica? Esto borrará tus creaciones locales.")) {
      saveComponents(INITIAL_COMPONENTS);
      setLiveHtml({});
      setEditingId(null);
    }
  };

  // Manual component creator
  const handleCreateEmptyComponent = () => {
    const freshId = `custom-${Date.now()}`;
    const freshComp: UIComponent = {
      id: freshId,
      name: "Nuevo Componente Personalizado",
      description: "Edita el código HTML a continuación para dar vida a este fragmento.",
      category: "cards",
      html: `<div class="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-sm">
  <h4 class="text-white text-base font-semibold">Mi Componente</h4>
  <p class="text-slate-400 text-xs mt-1">¡Comienza a escribir clases de Tailwind aquí!</p>
</div>`
    };
    saveComponents([freshComp, ...components]);
    setEditingId(freshId);
  };

  // Delete component from catalog
  const handleDeleteComponent = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este componente del catálogo local?")) {
      const updated = components.filter(c => c.id !== id);
      saveComponents(updated);
      if (editingId === id) setEditingId(null);
    }
  };

  // Update component content from Live editor
  const handleSaveLiveEdit = (id: string, updatedHtml: string) => {
    const updated = components.map(comp => {
      if (comp.id === id) {
        return { ...comp, html: updatedHtml };
      }
      return comp;
    });
    saveComponents(updated);
  };

  // Update component metadata fields
  const handleUpdateMetadata = (id: string, fields: Partial<UIComponent>) => {
    const updated = components.map(comp => {
      if (comp.id === id) {
        return { ...comp, ...fields };
      }
      return comp;
    });
    saveComponents(updated);
  };

  // Quick Layout Wrap helper to modify HTML structure dynamically
  const handleWrapStructure = (id: string, styleType: 'flex-center' | 'grid-grid' | 'bento-box' | 'glass-card') => {
    const originalComponent = components.find(c => c.id === id);
    const currentCode = liveHtml[id] !== undefined ? liveHtml[id] : (originalComponent?.html || "");
    let wrappedCode = currentCode;

    if (styleType === 'flex-center') {
      wrappedCode = `<div class="flex flex-col items-center justify-center p-8 bg-slate-950/40 rounded-2xl border border-slate-800/30 w-full min-h-[220px]">
  ${currentCode.trim().replace(/\n/g, '\n  ')}
</div>`;
    } else if (styleType === 'grid-grid') {
      wrappedCode = `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-slate-950/20 rounded-2xl border border-slate-800/20 w-full">
  ${currentCode.trim().replace(/\n/g, '\n  ')}
  <div class="p-6 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-center text-slate-500 text-xs">Tarjeta Duplicada 1</div>
  <div class="p-6 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-center text-slate-500 text-xs">Tarjeta Duplicada 2</div>
</div>`;
    } else if (styleType === 'bento-box') {
      wrappedCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-950/50 rounded-3xl border border-slate-850 w-full">
  <div class="md:col-span-2">
    ${currentCode.trim().replace(/\n/g, '\n    ')}
  </div>
  <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between min-h-[140px]">
    <span class="text-xs text-slate-500 uppercase font-mono tracking-wider">Métrica Bento</span>
    <span class="text-2xl font-bold text-emerald-400">99.9% Up</span>
  </div>
</div>`;
    } else if (styleType === 'glass-card') {
      wrappedCode = `<div class="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden max-w-md mx-auto w-full">
  <div class="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
  ${currentCode.trim().replace(/\n/g, '\n  ')}
</div>`;
    }

    setLiveHtml(prev => ({ ...prev, [id]: wrappedCode }));
    handleSaveLiveEdit(id, wrappedCode);
  };

  // Filter list matching selections
  const filteredComponents = components.filter(comp => {
    const matchesCategory = selectedCategory === "all" || comp.category === selectedCategory;
    const currentCode = liveHtml[comp.id] ?? comp.html;
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          currentCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get theme representation icon
  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case "studio-dark": return <Laptop className="size-3.5" />;
      case "cyberpunk": return <Cpu className="size-3.5" />;
      case "eclipse": return <Moon className="size-3.5" />;
      case "amber": return <Flame className="size-3.5" />;
      default: return <Laptop className="size-3.5" />;
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bgApp} text-slate-100 flex flex-col font-sans transition-colors duration-500 selection:bg-cyan-500/30 selection:text-cyan-200`}>
      
      {/* Visual background gradient accents dynamically bound to themes */}
      <div className={`absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full ${activeTheme.blurGlows[0]} blur-[120px] transition-all duration-700`}></div>
      <div className={`absolute bottom-1/4 right-1/4 -z-10 h-[600px] w-[600px] rounded-full ${activeTheme.blurGlows[1]} blur-[150px] transition-all duration-700`}></div>

      {/* Elegant minimalist header */}
      <header className={`border-b ${activeTheme.borderPanel} ${activeTheme.bgPanel}/30 backdrop-blur-md px-6 py-4 sticky top-0 z-40 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${activeTheme.activeTabGlow} p-[1px] flex items-center justify-center shadow-lg`}>
              <div className={`h-full w-full ${activeTheme.bgApp} rounded-[11px] flex items-center justify-center ${activeTheme.accentText} font-bold transition-colors duration-500`}>
                <LayoutGrid className="size-5" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Sandbox de Componentes <span className={`text-xs ${activeTheme.accentBg} ${activeTheme.accentText} border ${activeTheme.accentBorder} px-2 py-0.5 rounded-full font-mono transition-colors duration-500`}>v1.2</span>
              </h1>
              <p className="text-xs text-slate-400">Constructor de componentes visuales adaptado con Tailwind CSS v4</p>
            </div>
          </div>

          {/* Controls Bar & Theme Selectors */}
          <div className="flex flex-wrap items-center gap-3 justify-center">
            
            {/* Elegant App Theme Picker */}
            <div className={`flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border ${activeTheme.borderPanel} transition-colors duration-500`}>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-2 flex items-center gap-1">
                <Settings className="size-3 animate-spin-[spin_10s_linear_infinite]" />
                <span className="hidden lg:inline">Estilo:</span>
              </span>
              <div className="flex gap-0.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSetTheme(t.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                      currentThemeId === t.id
                        ? `bg-slate-800 text-white shadow-sm font-bold border border-slate-700/60`
                        : `text-slate-400 hover:text-slate-200 hover:bg-slate-900/40`
                    }`}
                    title={`Cambiar interfaz a: ${t.name}`}
                  >
                    {getThemeIcon(t.id)}
                    <span className="text-[11px] tracking-wide">{t.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTempKey(userGeminiKey);
                  setShowKeyConfig(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                  userGeminiKey 
                    ? "bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border-slate-700" 
                    : "bg-amber-600/10 hover:bg-amber-600/20 text-yellow-400 border-amber-500/30 animate-pulse"
                }`}
                title="Configurar tu API Key personal de Gemini"
              >
                <Key className="size-3.5" />
                <span>{userGeminiKey ? "Gemini Activo" : "Configurar API Key"}</span>
              </button>

              <button
                onClick={handleCreateEmptyComponent}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${activeTheme.accentBg} hover:bg-opacity-20 ${activeTheme.accentText} border ${activeTheme.accentBorder} text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-[1.01]`}
              >
                <PlusCircle className="size-3.5" />
                <span>Nuevo Fragmento</span>
              </button>
              
              <button
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-705 text-slate-300 hover:text-white text-xs font-medium transition-all duration-305"
                title="Restablecer valores iniciales de fábrica"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Restablecer</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-500">
        
        {/* Left/Middle Column block - Controls, search & Catalog */}
        <section className={`${appLayoutMode === 'split' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-500 min-w-0`}>
          
          {/* Controlling & Structural Customization Hub */}
          <div className={`${activeTheme.bgPanel} border ${activeTheme.borderPanel} rounded-2xl p-4 space-y-4 transition-all duration-500`}>
            
            {/* First Row: Search and Tabs block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search field */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                <input
                  type="text"
                  placeholder="Filtrar por nombre, descripción o propiedad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all font-sans`}
                />
              </div>

              {/* Premium Interactive Tabs */}
              <div className={`flex flex-wrap items-center gap-1 ${activeTheme.bgApp} p-1 rounded-xl border ${activeTheme.borderPanel} transition-all duration-500`}>
                {(['all', 'cards', 'buttons', 'links', 'grids'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-300 ${
                      selectedCategory === category 
                        ? `bg-gradient-to-r ${activeTheme.activeTabGlow} text-white shadow-md shadow-slate-900/20` 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {category === "all" ? "Todos" : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Second Row: Layout structure and viewport structure controls */}
            <div className="pt-3 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
              
              {/* Responsive simulation width structure */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Laptop className="size-3 text-cyan-400" />
                  <span>Ancho Render:</span>
                </span>
                <div className="flex bg-slate-950/40 p-0.5 rounded-lg border border-slate-800/80">
                  <button
                    onClick={() => setGlobalPreviewWidth('full')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      globalPreviewWidth === 'full' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Ancho completo normal"
                  >
                    <Maximize2 className="size-2.5" />
                    <span>Fluido</span>
                  </button>
                  <button
                    onClick={() => setGlobalPreviewWidth('desktop')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      globalPreviewWidth === 'desktop' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Ancho Laptop (max 1024px)"
                  >
                    <Monitor className="size-2.5" />
                    <span>Laptop</span>
                  </button>
                  <button
                    onClick={() => setGlobalPreviewWidth('tablet')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      globalPreviewWidth === 'tablet' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Ancho Tablet (max 768px)"
                  >
                    <Tablet className="size-2.5" />
                    <span>Tablet</span>
                  </button>
                  <button
                    onClick={() => setGlobalPreviewWidth('mobile')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      globalPreviewWidth === 'mobile' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Ancho Móvil (max 380px)"
                  >
                    <Smartphone className="size-2.5" />
                    <span>Móvil</span>
                  </button>
                </div>
              </div>

              {/* General Sandbox layout mode structure control */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Layout className="size-3 text-violet-400" />
                  <span>Estructura Sandbox:</span>
                </span>
                <div className="flex bg-slate-950/40 p-0.5 rounded-lg border border-slate-800/80">
                  <button
                    onClick={() => setAppLayoutMode('split')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      appLayoutMode === 'split' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Layout Lateral Dividido standard"
                  >
                    <Columns2 className="size-2.5" />
                    <span>Lateral (Dividido)</span>
                  </button>
                  <button
                    onClick={() => setAppLayoutMode('dashboard')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      appLayoutMode === 'dashboard' ? 'bg-slate-800 text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Vista de grilla para comparar múltiples códigos"
                  >
                    <LayoutList className="size-2.5" />
                    <span>Grilla de Comparación</span>
                  </button>
                  <button
                    onClick={() => setAppLayoutMode('compact')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      appLayoutMode === 'compact' ? 'bg-slate-800 text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Vista enfocada pura a pantalla completa"
                  >
                    <Grid className="size-2.5" />
                    <span>Foco Enfoque (Sin Lateral)</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Quick Notice Banner */}
          {showPreviewInfo && (
            <div className={`${activeTheme.bgPanel}/40 border ${activeTheme.borderPanel} rounded-xl p-3.5 flex items-start gap-3 relative transition-all duration-500`}>
              <Info className={`size-4.5 ${activeTheme.accentText} mt-0.5 flex-shrink-0`} />
              <div className="text-xs text-slate-400 leading-relaxed pr-6">
                Todos los componentes a continuación se renderizan en tiempo real dentro de un contenedor esmerilado que emula layouts premium. Puedes pulsar <span className={`${activeTheme.accentText} font-semibold font-mono`}>Editar en vivo</span> para alterar las clases Tailwind y ver los resultados de forma dinámica.
              </div>
              <button 
                onClick={() => setShowPreviewInfo(false)}
                className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-800"
              >
                &times;
              </button>
            </div>
          )}

          {/* Catalog grid */}
          <div className={`transition-all duration-500 grid gap-6 ${
            appLayoutMode === 'split' 
              ? 'grid-cols-1 xl:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            <AnimatePresence mode="popLayout">
              {filteredComponents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`${activeTheme.bgPanel}/50 border ${activeTheme.borderPanel} rounded-2xl p-12 text-center transition-all duration-500`}
                >
                  <Code className="size-12 text-slate-600 mx-auto mb-4 stroke-[1.2]" />
                  <h3 className="text-base font-semibold text-slate-300">No se encontraron componentes</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Prueba a ajustar tus filtros de búsqueda o pídele al asistente inteligente de diseño que elabore un componente nuevo con IA.
                  </p>
                </motion.div>
              ) : (
                filteredComponents.map((comp) => {
                  const currentHtml = liveHtml[comp.id] !== undefined ? liveHtml[comp.id] : comp.html;
                  
                  return (
                    <motion.div
                      key={comp.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`${activeTheme.bgPanel} border ${activeTheme.borderPanel} rounded-2xl overflow-hidden shadow-xl transition-colors duration-500`}
                    >
                      {/* Component Card Header */}
                      <div className={`px-5 py-4 border-b ${activeTheme.borderPanel} flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/20`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white tracking-wide">{comp.name}</h3>
                            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${activeTheme.bgApp} text-gray-400 border ${activeTheme.borderPanel} transition-all duration-500`}>
                              {comp.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">{comp.description}</p>
                        </div>

                        {/* Interactive actions for each component */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => handleCopyCode(comp.id, currentHtml)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                              copiedId === comp.id
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : `${activeTheme.bgApp} hover:bg-slate-850 text-slate-300 border ${activeTheme.borderPanel}`
                            }`}
                          >
                            {copiedId === comp.id ? (
                              <>
                                <Check className="size-3.5" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" />
                                <span>Copiar HTML</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              if (editingId === comp.id) {
                                setEditingId(null);
                              } else {
                                setEditingId(comp.id);
                                // Initialize live code state if empty
                                if (liveHtml[comp.id] === undefined) {
                                  setLiveHtml(prev => ({ ...prev, [comp.id]: comp.html }));
                                }
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              editingId === comp.id
                                ? `bg-violet-500/20 text-violet-300 border border-violet-500/30`
                                : `${activeTheme.bgApp} hover:bg-slate-850 text-slate-400 hover:text-slate-200 border ${activeTheme.borderPanel}`
                            }`}
                          >
                            <Edit3 className="size-3.5" />
                            <span>Controles</span>
                          </button>

                          <button
                            onClick={() => handleDeleteComponent(comp.id)}
                            className="p-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                            title="Eliminar este componente"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* LIVE RENDER PREVIEW ZONE */}
                      <div className={`${appLayoutMode === 'split' ? 'p-4 sm:p-5' : 'p-6 md:p-8'} ${activeTheme.bgInner} border-b ${activeTheme.borderPanel} flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden transition-all duration-500`}>
                        {/* Elegant background checkerboard/dot pattern inside container */}
                        <div className="absolute inset-0 bg-[radial-gradient(#20294a_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>
                        
                        {/* Show dynamic viewport dimensions header inside container if active Preview Width is not full */}
                        {globalPreviewWidth !== 'full' && (
                          <div className="relative z-20 mb-3 bg-slate-900/90 text-[10px] font-mono border border-slate-700/60 text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow select-none animate-fade-in">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            {globalPreviewWidth === 'mobile' && "Vista Móvil (sm) • max-w-sm • 380px"}
                            {globalPreviewWidth === 'tablet' && "Vista Tablet (md) • max-w-2xl • 680px"}
                            {globalPreviewWidth === 'desktop' && "Vista Laptop (lg) • max-w-5xl • 1024px"}
                          </div>
                        )}

                        <div className={`relative z-10 w-full flex items-center justify-center transition-all duration-500 min-w-0 ${
                          globalPreviewWidth === 'mobile' ? 'max-w-sm bg-slate-950/20 border-2 border-dashed border-slate-700/50 p-4 rounded-2xl shadow-inner' :
                          globalPreviewWidth === 'tablet' ? 'max-w-2xl bg-slate-950/10 border border-dashed border-slate-700/40 p-4 rounded-xl' :
                          globalPreviewWidth === 'desktop' ? 'max-w-5xl p-2' : 'w-full'
                        }`}>
                          {/* We parse the edited live HTML code with an outer horizontal scroll safeguard */}
                          <div className="w-full overflow-x-auto min-w-0 select-text scrollbar-thin scrollbar-thumb-slate-800/80 scrollbar-track-transparent py-1 flex justify-center">
                            <div 
                              className="w-full max-w-full flex-shrink-0 flex items-center justify-center animate-fade-in"
                              dangerouslySetInnerHTML={{ __html: currentHtml }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* COLLAPSIBLE LIVE HTML EDITOR */}
                      <AnimatePresence>
                        {editingId === comp.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className={`overflow-hidden border-t ${activeTheme.borderPanel}`}
                          >
                            <div className="p-4 bg-slate-950/35 space-y-4">
                              
                              {/* Metadata editor selectors */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Nombre</label>
                                  <input 
                                    type="text" 
                                    value={comp.name} 
                                    onChange={(e) => handleUpdateMetadata(comp.id, { name: e.target.value })}
                                    className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Categoría</label>
                                  <select 
                                    value={comp.category}
                                    onChange={(e) => handleUpdateMetadata(comp.id, { category: e.target.value as any })}
                                    className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50`}
                                  >
                                    <option value="cards">Cards (Tarjetas)</option>
                                    <option value="buttons">Buttons (Botones)</option>
                                    <option value="links">Links (Enlaces)</option>
                                    <option value="grids">Grids (Cuadrículas)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Descripción</label>
                                  <input 
                                    type="text" 
                                    value={comp.description} 
                                    onChange={(e) => handleUpdateMetadata(comp.id, { description: e.target.value })}
                                    className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50`}
                                  />
                                </div>
                              </div>

                              {/* Quick structural container wraps */}
                              <div className="space-y-1.5 pb-3 border-b border-slate-800/50">
                                <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-500">Transformar de forma Rápida la Estructura HTML</span>
                                <div className="flex flex-wrap gap-2 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => handleWrapStructure(comp.id, 'flex-center')}
                                    className={`px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white border ${activeTheme.borderPanel} hover:border-[#151a30] transition-colors`}
                                    title="Envuelve el código HTML actual en un contenedor Centrado con flexbox"
                                  >
                                    ⚡ Centrar Elemento (Flex Center)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleWrapStructure(comp.id, 'grid-grid')}
                                    className={`px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white border ${activeTheme.borderPanel} hover:border-[#151a30] transition-colors`}
                                    title="Envuelve en una cuadrícula de 3 columnas de comparación"
                                  >
                                    ⚡ Crear Rejilla Comparativa (Grid)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleWrapStructure(comp.id, 'bento-box')}
                                    className={`px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white border ${activeTheme.borderPanel} hover:border-[#151a30] transition-colors`}
                                    title="Une el código de tu tarjeta en una distribución Bento adaptativa con métricas"
                                  >
                                    ⚡ Maquetar en Bento Box
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleWrapStructure(comp.id, 'glass-card')}
                                    className={`px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white border ${activeTheme.borderPanel} hover:border-[#151a30] transition-colors`}
                                    title="Envuelve el código en una tarjeta con fondo de cristal y desenfoque (backdrop blur)"
                                  >
                                    ⚡ Envolver en Tarjeta Cristal (Glassmorphism)
                                  </button>
                                </div>
                              </div>

                              {/* Interactive Textarea Code Editor */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-slate-400">
                                    <Code2 className={`size-3.5 ${activeTheme.accentText}`} />
                                    <span>Editor HTML + Tailwind CSS v4</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">Reactivo al instante</span>
                                </div>
                                
                                <textarea
                                  rows={8}
                                  value={currentHtml}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setLiveHtml(prev => ({ ...prev, [comp.id]: value }));
                                    handleSaveLiveEdit(comp.id, value);
                                  }}
                                  className={`w-full bg-slate-950/60 border ${activeTheme.borderPanel} rounded-xl p-3 text-xs font-mono text-emerald-400 leading-relaxed focus:outline-none focus:border-cyan-500/70`}
                                  style={{ fontStyle: 'normal' }}
                                />
                              </div>

                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Flame className="size-3 text-amber-500" />
                                <span>Sugerencia: Cualquier cambio en este editor se guarda de manera automática y persistirá localmente en el archivo del proyecto.</span>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

        </section>

        {/* Right Column Block - Asistente de IA Inteligente */}
        {appLayoutMode === 'split' ? (
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 min-w-0">
            
            <div className={`${activeTheme.bgPanel} border ${activeTheme.borderPanel} rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-colors duration-500`}>
              
              {/* Visual accent circles in card boundaries */}
              <div className={`absolute top-0 right-0 h-16 w-16 ${activeTheme.blurGlows[0]} pointer-events-none rounded-full`}></div>
              <div className={`absolute bottom-0 left-0 h-20 w-20 ${activeTheme.blurGlows[1]} pointer-events-none rounded-full`}></div>

              {/* Title section */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${activeTheme.activeTabGlow} text-white`}>
                  <Sparkles className="size-4 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold text-white tracking-wide">Asistente UI Inteligente</h2>
                  <span className={`text-[10px] ${activeTheme.accentText} font-mono`}>Powered by Google Gemini 3.5</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Describe un componente de interfaz con tus propias palabras y la inteligencia artificial compilará el código completo utilizando Tailwind CSS v4 para inyectarlo en el playground de forma automática.
              </p>

              {/* API Key Status Check banner */}
              {!userGeminiKey ? (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-400">
                    <Key className="size-3.5 animate-bounce" />
                    <span>API Key de Gemini Requerida</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Para activar la generación por IA, ingresa tu propia clave API. Se almacena localmente de forma 100% segura.
                  </p>
                  <button
                    onClick={() => {
                      setTempKey(userGeminiKey);
                      setShowKeyConfig(true);
                    }}
                    className="w-full py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/20 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Ingresar API Key →
                  </button>
                </div>
              ) : (
                <div className="mb-4 flex items-center justify-between bg-slate-100/5 hover:bg-slate-100/10 border border-slate-800 p-2.5 rounded-xl text-xs transition-all">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Gemini API Activa
                  </span>
                  <button
                    onClick={() => {
                      setTempKey(userGeminiKey);
                      setShowKeyConfig(true);
                    }}
                    className="text-[10px] text-cyan-400 hover:underline hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                  >
                    Gestionar Clave
                  </button>
                </div>
              )}

              {/* Input prompts Area */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5">
                    ¿Qué componente te gustaría diseñar hoy?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ej: Un formulario de login interactivo con fondos de cristal y botones de gradiente..."
                    rows={4}
                    className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 transition-all font-sans resize-none`}
                    disabled={isGenerating}
                  />
                </div>

                {/* Server-side Error Display */}
                {serverError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-400 leading-relaxed space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Error al Generar
                    </div>
                    <div>{serverError}</div>
                  </div>
                )}

                {/* Generate Trigger Button */}
                <button
                  onClick={() => handleGenerateWithAI(aiPrompt)}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 tracking-wide ${
                    isGenerating 
                      ? "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed" 
                      : `bg-gradient-to-r ${activeTheme.activeTabGlow} hover:opacity-90 text-white shadow-lg cursor-pointer shadow-violet-950/40 hover:scale-[1.01]`
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Compilando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      <span>Generar con IA</span>
                    </>
                  )}
                </button>

                {/* Progress feedback and quotes */}
                {isGenerating && (
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse text-center space-y-2">
                    <div className={`text-[10px] font-mono ${activeTheme.accentText} tracking-wider font-semibold`}>Cargando Heurísticas UI</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed font-sans">{loadingStep}</div>
                  </div>
                )}

                {/* Predefined prompt helpers */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-500 mb-2">IDEAS DE INSPIRACIÓN</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiPrompt(item.query)}
                        disabled={isGenerating}
                        className={`p-2 rounded-xl ${activeTheme.bgApp} border ${activeTheme.borderPanel} hover:border-violet-500/40 text-left text-[10px] text-slate-400 hover:text-slate-200 transition-all font-sans leading-snug space-y-1`}
                      >
                        <div className="font-bold text-[10px] text-slate-300 flex items-center gap-1">
                          <ArrowRight className={`size-2 ${activeTheme.accentText}`} />
                          {item.label}
                        </div>
                        <div className="line-clamp-2 text-[9px] text-slate-500">{item.query}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            <div className={`${activeTheme.bgPanel}/60 border ${activeTheme.borderPanel} rounded-2xl p-4 space-y-3 transition-all duration-500`}>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Detalles del Sistema</h3>
              <div className="space-y-2 font-mono text-[10px] text-slate-400 leading-relaxed">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span>Tailwind Engine:</span>
                  <span className={`text-cyan-400 font-semibold bg-cyan-950/20 px-1.5 rounded`}>v4.0 Alpha-Vite</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span>Tema Activo:</span>
                  <span className={`${activeTheme.accentText}`}>{activeTheme.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caché local:</span>
                  <span className="text-emerald-400 text-right">Guardado Persistente</span>
                </div>
              </div>
            </div>

          </aside>
        ) : (
          /* Floating dynamic shortcut to easily re-open split sidebar or trigger AI prompt without leaving focus mode */
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setAppLayoutMode('split')}
              className={`p-4 rounded-full bg-gradient-to-tr ${activeTheme.activeTabGlow} text-white shadow-2xl flex items-center gap-2 hover:scale-[1.08] active:scale-[0.95] transition-all duration-300 font-bold border border-slate-850 bg-slate-950`}
              title="Volver a abrir el Asistente AI Lateral"
            >
              <Sparkles className="size-4 animate-pulse text-cyan-200" />
              <span className="text-[11px] font-semibold">Usar Asistente AI</span>
            </button>
          </div>
        )}

      </main>

      {/* Modern footer */}
      <footer className={`mt-12 border-t ${activeTheme.borderPanel} ${activeTheme.bgPanel}/10 py-6 text-center text-xs text-slate-500 space-y-1 transition-all duration-500`}>
        <div>Playground de Plantillas UI &bull; Diseñado con ingeniería Frontend de alto rendimiento</div>
        <div className="font-mono text-[10px] text-slate-600">Google AI Studio Build &bull; 2026</div>
      </footer>

      {/* Dynamic API Key Config Modal */}
      <AnimatePresence>
        {showKeyConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl border ${activeTheme.borderPanel} ${activeTheme.bgPanel} p-6 shadow-2xl relative overflow-hidden`}
            >
              {/* Glow accents */}
              <div className={`absolute -top-12 -right-12 h-24 w-24 rounded-full ${activeTheme.blurGlows[0]} blur-2xl pointer-events-none`}></div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${activeTheme.activeTabGlow} text-white`}>
                  <Key className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white tracking-wide">Configurar Clave Gemini API</h3>
                  <p className="text-xs text-slate-400">Personaliza la conexión con el motor de generación</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para poder utilizar las herramientas inteligentes del Asistente UI de IA, debes proporcionar tu propia API Key de <strong className="text-cyan-400 font-semibold">Google Gemini</strong>. 
                  Esta clave se guardará localmente en tu navegador de forma segura (<code className="text-[10px] font-mono text-slate-400">localStorage</code>) y nunca será compartida.
                </p>

                <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Info className="size-3 text-cyan-400" />
                    ¿No tienes tu API Key de Gemini?
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Puedes obtener una clave gratuita en segundos en Google AI Studio:
                  </p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors underline font-medium"
                  >
                    Obtener API Key Gratis en Google AI Studio ↗
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Ingresar API Key de Gemini
                  </label>
                  <div className="relative">
                    <input
                      type={showKeyText ? "text" : "password"}
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/80 transition-all font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyText(!showKeyText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showKeyText ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Modelo de Generación Preferido
                  </label>
                  <select
                    value={preferredModel}
                    onChange={(e) => {
                      setPreferredModel(e.target.value);
                      localStorage.setItem("preferred_gemini_model", e.target.value);
                    }}
                    className={`w-full ${activeTheme.bgApp} border ${activeTheme.borderPanel} rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-all cursor-pointer`}
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recomendado, Rápido)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complejo, Altamente Inteligente)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Bajo consumo, Latencia mínima)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    * Si un modelo experimenta alta demanda temporal (con error 503), el sistema del cliente (100% local) reintentará automáticamente con tiempos de espera progresivos y fallbacks para asegurar tu generación.
                  </p>
                </div>

                {/* Confirm / Save Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      const trimmed = tempKey.trim();
                      setUserGeminiKey(trimmed);
                      localStorage.setItem("user_gemini_key", trimmed);
                      setShowKeyConfig(false);
                      setServerError(null);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 bg-gradient-to-r ${activeTheme.activeTabGlow} hover:opacity-90 text-white flex items-center justify-center gap-1 cursor-pointer`}
                  >
                    <Check className="size-3.5" />
                    <span>Guardar Clave</span>
                  </button>
                  <button
                    onClick={() => {
                      setTempKey(userGeminiKey);
                      setShowKeyConfig(false);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-705 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer hover:bg-slate-700"
                  >
                    Cerrar
                  </button>
                </div>

                {userGeminiKey && (
                  <div className="text-center pt-1 border-t border-slate-800/80 pt-3">
                    <button
                      onClick={() => {
                        if (confirm("¿Estás seguro de que deseas eliminar la API Key actual? El generador inteligente dejará de funcionar.")) {
                          setUserGeminiKey("");
                          setTempKey("");
                          localStorage.removeItem("user_gemini_key");
                          setServerError("Se eliminó la API Key con éxito.");
                        }
                      }}
                      className="text-[10px] text-rose-400/80 hover:text-rose-400 transition-colors font-semibold cursor-pointer"
                    >
                      Restablecer / Eliminar Clave Guardada
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
