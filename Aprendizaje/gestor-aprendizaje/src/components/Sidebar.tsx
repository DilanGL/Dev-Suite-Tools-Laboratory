import React, { useState, useRef } from "react";
import { 
  Plus, Trash2, BookOpen, FileText, UploadCloud, 
  Sparkles, Check, ChevronLeft, ChevronRight, GraduationCap, Eye
} from "lucide-react";
import { Subject, Source } from "../types";

interface SidebarProps {
  subjects: Subject[];
  activeSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
  onCreateSubject: (name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddSource: (title: string, content: string) => void;
  onDeleteSource: (sourceId: string) => void;
  isBackendLive: boolean;
  onPreviewSource: (source: Source) => void;
}

const PALETTE = [
  { name: "Azul Eléctrico", class: "from-blue-600 to-indigo-600", text: "text-blue-400 animate-pulse-slow" },
  { name: "Verde Esmeralda", class: "from-emerald-600 to-teal-600", text: "text-emerald-400" },
  { name: "Violeta Cuántico", class: "from-purple-600 to-violet-600", text: "text-purple-400" },
  { name: "Ambar Solar", class: "from-amber-500 to-orange-500", text: "text-amber-400" }
];

export default function Sidebar({
  subjects,
  activeSubject,
  onSelectSubject,
  onCreateSubject,
  onDeleteSubject,
  onAddSource,
  onDeleteSource,
  isBackendLive,
  onPreviewSource
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PALETTE[0].class);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  // New source inputs
  const [newSourceTitle, setNewSourceTitle] = useState("");
  const [newSourceContent, setNewSourceContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onCreateSubject(newSubjectName.trim(), selectedColor);
    setNewSubjectName("");
    setShowAddSubject(false);
  };

  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceTitle.trim() || !newSourceContent.trim()) return;
    onAddSource(newSourceTitle.trim(), newSourceContent.trim());
    setNewSourceTitle("");
    setNewSourceContent("");
    setShowAddSourceForm(false);
  };

  // Simulating document uploading-text extraction
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const baseTitle = file.name.replace(/\.[^/.]+$/, "");
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    try {
      // 1. Prepare Form Data
      const formData = new FormData();
      formData.append("file", file);

      // 2. Fetch real parsed text from the server
      const response = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Error al intentar descifrar el documento.";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const result = await response.json();
      onAddSource(result.title || baseTitle, result.content);
    } catch (serverErr: any) {
      console.warn("Server-side parsing failed or bypassed, trying offline client-side reading fallback:", serverErr);

      // Offline read fallbacks for non-binary files
      if ([".txt", ".md", ".json", ".csv"].includes(extension)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = (event.target?.result as string || "").trim();
          if (text.length > 5) {
            onAddSource(baseTitle, text);
          } else {
            setUploadError("El archivo de texto está vacío.");
          }
        };
        reader.onerror = () => {
          setUploadError("Error de lectura local del archivo de texto.");
        };
        reader.readAsText(file);
      } else {
        // For PDFs or DOCX where the server threw a detailed error
        setUploadError(serverErr.message || "No se pudo procesar este tipo de archivo. Asegúrese de que no esté corrupto.");
      }
    } finally {
      setIsUploading(false);
      // Clean error after timeout
      setTimeout(() => {
        setUploadError((curr) => curr ? null : null);
      }, 7000);
    }
  };

  const loadSubjectPreset = () => {
    if (!activeSubject) return;
    const nameLower = activeSubject.name.toLowerCase();
    
    if (nameLower.includes("matem") || nameLower.includes("calcul") || nameLower.includes("algeb") || nameLower.includes("fisic")) {
      onAddSource(
        "Resumen de Cálculo Avanzado",
        `El Cálculo Infinitesimal se ramifica tradicionalmente en Cálculo Diferencial y Cálculo Integral. 
La derivada mide la pendiente instantánea de una curva, mientras que la integral acumula el área comprendida bajo la misma curva sobre un dominio continuo.
Ambas disciplinas se unifican bajo el Teorema Fundamental del Cálculo (formulado por Newton y Leibniz en el siglo XVII), estableciendo que la derivada y la integral definida son contrarias exactas.
Por otra parte, Augustin-Louis Cauchy cimentó el concepto moderno del límite empleando desigualdades de precisión épsilon y delta para desterrar los antiguos y vagos números infinitesimales.`
      );
      onAddSource(
        "Álgebra y Ecuaciones Cuadráticas",
        `Las ecuaciones cuadráticas son de segundo grado y adoptan la apariencia polinómica general: ax^2 + bx + c = 0 (donde a no es igual a cero).
La solución matemática para estas ecuaciones está dada por la célebre fórmula de Bhaskara: x = [-b ± sqrt(b^2 - 4ac)] / 2a.
El término ubicado dentro de la raíz cuadrada, b^2 - 4ac, se denomina discriminante (denotado por la letra griega Delta: Δ).
Este discriminante determina la naturaleza tridimensional de las raíces: si es estrictamente positivo, la ecuación cuadrática interseca al eje cartesiano X en dos puntos reales independientes. Si es cero, existe una raíz real repetida (que coincide exactamente con el vértice de la parábola proyectada). Si es estrictamente negativo, la ecuación no interseca el eje real, dando origen a un par ordenado de soluciones complejas conjugadas.`
      );
    } else if (nameLower.includes("histor") || nameLower.includes("social") || nameLower.includes("filosof") || nameLower.includes("humanidad")) {
      onAddSource(
        "El Apogeo del Imperio Romano",
        `El Imperio Romano representó uno de los periodos de mayor unificación territorial y jurídica en la cuenca del Mediterráneo. 
Iniciado formalmente por Augusto en el año 27 a.C. tras el colapso de la República, el Imperio consolidó la pax romana, un periodo de estabilidad interna que facilitó el comercio, la construcción de calzadas monumentales y la difusión del derecho romano.
Sin embargo, desafíos fiscales, presiones migratorias de tribus germánicas y la división administrativa en Imperio de Occidente e Imperio de Oriente terminaron por precipitar la caída de Roma en el año 476 d.C., marcando el umbral de la Edad Media.`
      );
      onAddSource(
        "La Primera Revolución Industrial",
        `La Revolución Industrial comenzó en la segunda mitad del siglo XVIII en Gran Bretaña, transformando las economías agrarias tradicionales en sistemas mecanizados de producción en masa.
La adopción de la máquina de vapor, patentada y perfeccionada por James Watt, revolucionó la minería del carbón, la manufactura textil y el transporte ferroviario.
Esta transformación tecnológica provocó éxodos rurales masivos hacia las grandes metrópolis urbanas, reestructuró la pirámide de clases sociales (promoviendo la polaridad entre la burguesía industrial y el proletariado) y modificó de manera irreversible el equilibrio geopolítico y ambiental global.`
      );
    } else if (nameLower.includes("cienc") || nameLower.includes("biolog") || nameLower.includes("quimic") || nameLower.includes("medicin")) {
      onAddSource(
        "Fundamentos de Genética Médica",
        `El ácido desoxirribonucleico (ADN) es la molécula polimérica de doble hélice que encripta la información de herencia biológica de los organismos.
Descubierto estructuralmente por Rosalind Franklin, Watson y Crick en 1953, el ADN organiza sus nucleótidos en cuatro bases nitrogenadas tradicionales: Adenina, Timina, Citosina y Guanina (A, T, C, G).
La transcripción celular copia secuencias de nucleótidos de ADN en ARN mensajero, el cual posteriormente es traducido por los ribosomas en cadenas de aminoácidos para sintetizar proteínas fundamentales para la viabilidad del organismo.`
      );
      onAddSource(
        "La Teoría de la Evolución Natural",
        `Formulada científicamente por Charles Darwin en 'El origen de las especies' (1859), la evolución por selección natural establece que las especies biológicas mutan adaptativamente con el paso de las generaciones.
Los organismos con genotipos que proveen características favorables para la supervivencia y reproducción local tienen mayor probabilidad de transmitir sus alelos a la siguiente generación.
Esto da origen a un mecanismo continuo de diversificación filogenética que unifica a todo ser vivo del planeta bajo un único ancestro común universal.`
      );
    } else {
      onAddSource(
        "Método Feynman de Aprendizaje",
        `El Método Feynman de aprendizaje es un marco cognitivo diseñado por el Nobel de Física Richard Feynman para dominar de raíz cualquier concepto técnico.
Consta de cuatro fases fundamentales: primero, elige un concepto de estudio y escríbelo en un cuaderno papel limpio. Segundo, explica el concepto en términos sumamente sencillos, como si se lo estuvieras transmitiendo a un niño de 10 años, evitando usar lenguaje tecnicista o jerga repetitiva.
Tercero, identifica las fallas cognitivas o vacíos de tu explicación releyendo el material origen. Cuarto, simplifica todavía más tus explicaciones usando metáforas y analogías directas.`
      );
      onAddSource(
        "La Curva del Olvido y Repaso Espaciado",
        `Planteada por el psicólogo Hermann Ebbinghaus en 1885, la curva del olvido ilustra la velocidad exponencial con la que el cerebro humano deshecha información no repasada en las horas posteriores al aprendizaje.
Para contrarrestar esta pérdida natural, la técnica de repaso espaciado (Spaced Repetiton) distribuye las sesiones de estudio en intervalos crecientes de tiempo (por ejemplo: a las 24 horas, a los 3 días, a la semana, al mes).
Esto reactiva la memoria en el punto crítico de decaimiento cognitivo, fortaleciendo la consolidación sináptica a largo plazo en lugar de memorizaciones masivas ineficientes antes de los exámenes.`
      );
    }
  };

  if (collapsed) {
    return (
      <div className="w-16 h-full bg-slate-950 flex flex-col items-center py-4 border-r border-slate-800 transition-all duration-300">
        <button 
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-blue-400 mb-8"
          title="Expandir Panel"
        >
          <ChevronRight size={18} />
        </button>
        <div className="flex flex-col gap-6 items-center flex-1 w-full">
          {subjects.map((sub) => {
            const isSelected = activeSubject?.id === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg relative group transition-all duration-200 ${
                  isSelected ? "bg-slate-800 border-2 border-blue-500 scale-105" : "bg-slate-900 border border-slate-800 hover:scale-105"
                }`}
                title={sub.name}
              >
                <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md ${
                  sub.color.includes("blue") ? "bg-blue-500" :
                  sub.color.includes("emerald") ? "bg-emerald-500" :
                  sub.color.includes("purple") ? "bg-purple-500" : "bg-amber-500"
                }`} />
                <span className="text-slate-200">{sub.name[0].toUpperCase()}</span>
                {/* Micro tooltip */}
                <span className="absolute left-14 bg-slate-900 text-slate-200 border border-slate-700 text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50">
                  {sub.name} ({sub.sources.length} fuentes)
                </span>
              </button>
            );
          })}
          
          <button 
            onClick={() => { setCollapsed(false); setShowAddSubject(true); }}
            className="w-10 h-10 rounded-xl border border-dashed border-slate-700 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            title="Crear Asignatura"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-slate-950 flex flex-col border-r border-slate-800/80 tall:text-sm text-xs select-none transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/20 animate-pulse-slow">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 id="omni-app-logo" className="font-sans font-bold text-lg text-slate-100 tracking-wider">OMNIBRAIN</h1>
            <p className="text-[10px] text-slate-500 tracking-wide uppercase font-mono">🧠 Estructurador Cognitivo</p>
          </div>
        </div>
        <button 
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-lg bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-400"
          title="Colapsar Panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Subjects Section */}
      <div className="p-4 border-b border-slate-800/60 max-h-[40%] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">ASIGNATURAS</span>
          <button
            onClick={() => setShowAddSubject(!showAddSubject)}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] px-2 font-mono"
          >
            <Plus size={10} /> CREAR
          </button>
        </div>

        {showAddSubject && (
          <form onSubmit={handleCreateSubject} className="mb-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <input
              type="text"
              placeholder="Ej: Matemáticas"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-blue-500 mb-2 font-sans"
              maxLength={22}
            />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Acento</span>
              <div className="flex gap-1.5">
                {PALETTE.map((pal) => (
                  <button
                    key={pal.class}
                    type="button"
                    onClick={() => setSelectedColor(pal.class)}
                    className={`w-5 h-5 rounded-full bg-gradient-to-tr ${pal.class} flex items-center justify-center transition-transform hover:scale-110`}
                  >
                    {selectedColor === pal.class && <Check size={10} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddSubject(false)}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[11px] rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
              >
                Agregar
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {subjects.map((sub) => {
            const isSelected = activeSubject?.id === sub.id;
            return (
              <div
                key={sub.id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-slate-850 border border-blue-500/30 text-white shadow-[0_0_12px_rgba(59,130,246,0.05)]" 
                    : "bg-slate-900/30 border border-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => onSelectSubject(sub)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${sub.color}`} />
                  <span className="font-semibold truncate text-[13px]">{sub.name}</span>
                  <span className="text-[10px] font-mono bg-slate-900/80 text-slate-500 px-1 py-0.2 rounded border border-slate-850">
                    {sub.sources.length}f
                  </span>
                </div>
                {deletingSubjectId === sub.id ? (
                  <div className="flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubject(sub.id);
                        setDeletingSubjectId(null);
                      }}
                      className="px-1.5 py-0.5 bg-red-900/80 hover:bg-red-800 border border-red-500/30 rounded text-red-200 text-[9px] font-mono"
                      title="Confirmar"
                    >
                      Sí
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingSubjectId(null);
                      }}
                      className="px-1.5 py-0.5 bg-slate-850 hover:bg-slate-700 rounded text-slate-300 text-[9px] font-mono"
                      title="Cancelar"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingSubjectId(sub.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-950/40 rounded text-slate-500 hover:text-red-400 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sources Section */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        {activeSubject ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">FUENTES DE ESTUDIO</span>
                <span className="text-[9px] text-slate-500 font-sans truncate max-w-[150px]">En: {activeSubject.name}</span>
              </div>
              <button
                onClick={() => setShowAddSourceForm(!showAddSourceForm)}
                className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[10px] px-2 font-mono"
              >
                <Plus size={10} /> APUNTE
              </button>
            </div>

            {/* Quick Seed Option */}
            {activeSubject.sources.length === 0 && (
              <button
                onClick={loadSubjectPreset}
                className="mb-3 w-full text-[10px] bg-violet-950/30 text-violet-300 border border-violet-800/40 hover:bg-violet-900/40 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer font-semibold shadow-sm"
              >
                <Sparkles size={11} className="text-violet-400 animate-pulse" />
                Cargar Apuntes de Ejemplo para "{activeSubject.name}"
              </button>
            )}

            {showAddSourceForm && (
              <form onSubmit={handleAddSourceSubmit} className="mb-4 p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Título del apunte"
                  value={newSourceTitle}
                  onChange={(e) => setNewSourceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 font-sans"
                  required
                />
                <textarea
                  placeholder="Escribe o pega aquí tus apuntes, párrafos, notas académicas o fórmulas..."
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500 font-sans resize-none scrollbar-thin"
                  required
                />
                <div className="flex justify-end gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSourceForm(false)}
                    className="px-2 py-0.5 text-[10px] rounded bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-[10px] rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95"
                    id="save-smart-notes-btn"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* Drag & Drop simulated area */}
            <div
              className={`mb-3 p-3 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden ${
                isUploading
                  ? "border-amber-500 bg-amber-950/10 pointer-events-none"
                  : isDragging
                  ? "border-emerald-500 bg-emerald-950/20"
                  : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/30 text-slate-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-1.5" />
                  <p className="text-[10px] font-sans font-semibold text-amber-400">Analizando y extrayendo contenido...</p>
                  <p className="text-[8px] font-mono text-slate-500">Mapeando estructura textual en la nube</p>
                </>
              ) : (
                <>
                  <UploadCloud size={20} className={isDragging ? "text-emerald-400 animate-bounce" : "text-slate-500"} />
                  <p className="mt-1 text-[10px] font-sans font-medium text-slate-300">Arrastra archivos aquí o haz clic</p>
                  <p className="text-[8px] font-mono text-slate-500">Admite PDF, Word (DOCX), TXT o MD</p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.md,.pdf,.docx,.json"
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Error notifications */}
            {uploadError && (
              <div className="mb-3 p-2.5 bg-red-950/40 border border-red-900/60 rounded-lg text-[10px] text-red-300 font-sans leading-relaxed animate-fade-in flex items-start gap-1.5">
                <span className="text-red-400 font-bold font-mono">⚠️</span>
                <span>{uploadError}</span>
              </div>
            )}

            {/* Sources List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {activeSubject.sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-600 border border-dashed border-slate-900 rounded-lg p-2">
                  <BookOpen size={24} className="mb-1 text-slate-700" />
                  <p className="text-[11px] font-medium text-slate-500">Sin fuentes todavía</p>
                  <p className="text-[9px] font-mono mt-0.5">Sube apuntes para estructurar con el cerebro IA.</p>
                </div>
              ) : (
                activeSubject.sources.map((src) => {
                  return (
                    <div
                      key={src.id}
                      onClick={() => onPreviewSource(src)}
                      className="group/item bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 hover:border-slate-800 rounded-lg p-2.5 transition-all text-xs flex flex-col gap-1 relative overflow-hidden cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5 max-w-[80%]">
                          <FileText size={13} className="text-blue-400 flex-shrink-0" />
                          <h4 className="font-bold text-slate-300 truncate tracking-wide font-sans">{src.title}</h4>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewSource(src);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-violet-400 transition-opacity"
                            title="Previsualizar contenido"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSource(src.id);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-opacity"
                            title="Eliminar apunte"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 line-clamp-2 text-[10px] font-sans pl-4 leading-relaxed pr-1">
                        {src.content}
                      </p>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pl-4 mt-0.5">
                        <span>{src.wordCount} palabras</span>
                        <span>{src.addedAt}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <GraduationCap size={32} className="text-slate-700 animate-pulse mb-2" />
            <p className="text-xs font-semibold text-slate-400">Selecciona o crea una asignatura</p>
            <p className="text-[10px] font-mono text-slate-600 mt-1">Comienza tu viaje de cognición estructurada.</p>
          </div>
        )}
      </div>

      {/* Backend Status indicator at base */}
      <div className="p-3 bg-slate-950 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isBackendLive ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-blue-400 shadow-[0_0_8px_#3b82f6]"}`} />
          <span className="text-slate-400 uppercase tracking-wide">
            {isBackendLive ? "Gemini Live API" : "OmniBrain Offline"}
          </span>
        </div>
        <span className="text-slate-600 text-[9px] font-bold">V1.5 FLASH+PRO</span>
      </div>
    </div>
  );
}
