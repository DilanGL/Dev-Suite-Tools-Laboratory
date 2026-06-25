var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_multer = __toESM(require("multer"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "20mb" }));
var apiKey = process.env.GEMINI_API_KEY;
var isApiKeyConfigured = !!apiKey && apiKey !== "MY_GEMINI_API_KEY";
var ai = null;
if (isApiKeyConfigured) {
  try {
    ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
}
async function generateContentWithRetry(params, options = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1e3;
  const modelFallbackOrder = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview"
  ];
  const currentModel = params.model;
  const modelsToTry = [currentModel];
  for (const m of modelFallbackOrder) {
    if (m !== currentModel) {
      modelsToTry.push(m);
    }
  }
  let lastError = null;
  for (const modelAttempt of modelsToTry) {
    let delay = initialDelayMs;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Attempting Gemini generation using model: ${modelAttempt} (Attempt ${attempt + 1}/${maxRetries})`);
        const attemptParams = {
          ...params,
          model: modelAttempt
        };
        const response = await ai.models.generateContent(attemptParams);
        return response;
      } catch (err) {
        lastError = err;
        console.error(`Error on model ${modelAttempt}, attempt ${attempt + 1}:`, err);
        const errStr = (err.message || "").toLowerCase() + " " + JSON.stringify(err).toLowerCase();
        const isTransient = errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("demand") || errStr.includes("resource_exhausted") || errStr.includes("rate limit") || errStr.includes("overloaded");
        if (isTransient) {
          if (attempt < maxRetries - 1) {
            console.log(`Transient error detected, waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
        }
        break;
      }
    }
    console.log(`Model ${modelAttempt} failed after retries. Trying fallback model...`);
  }
  throw lastError || new Error("Gemini generation failed on all models and retries.");
}
var MATH_MOCK_DATA = {
  summarize: {
    summary: `# Resumen Ejecutivo: Fundamentos de C\xE1lculo y \xC1lgebra

Este documento organiza los principios fundacionales que conectan el \xE1lgebra polin\xF3mica con el c\xE1lculo infinitesimal. El an\xE1lisis se divide en la resoluci\xF3n estructural de ecuaciones polin\xF3micas de segundo grado, la conceptualizaci\xF3n l\xEDmite de Cauchy y la mec\xE1nica diferencial/integral unificada por Newton y Leibniz.

## Objetivos de Aprendizaje
1. Comprender la correspondencia entre factores algebraicos y ra\xEDces reales o complejas.
2. Conceptualizar la derivada no solo como un l\xEDmite abstracto de secuencias de pendientes, sino como la tasa instant\xE1nea de cambio aplicable a leyes f\xEDsicas.
3. Interpretar la integral como la acumulaci\xF3n infinit\xE9sima de \xE1reas y su relaci\xF3n rec\xEDproca con la derivada a trav\xE9s del teorema fundamental.
`,
    keyConcepts: [
      {
        term: "Teorema Fundamental del C\xE1lculo (TFC)",
        description: "Establece la relaci\xF3n inversa entre diferenciaci\xF3n e integraci\xF3n.",
        expandableContent: "Este principio supremo dictamina que si una funci\xF3n f es continua sobre el intervalo [a, b], entonces su integral definida acumuladora es diferenciable y su derivada matem\xE1tica corresponde precisamente a la funci\xF3n original f. Permite calcular \xE1reas complejas empleando simples antiderivadas algebraicas en lugar de sumas infinitas de Riemann."
      },
      {
        term: "El Concepto de L\xEDmite (Formalismo Cauchy)",
        description: "Fundamento riguroso para definir la continuidad y las derivadas.",
        expandableContent: "Formalizado por Augustin-Louis Cauchy mediante desigualdades \xE9psilon-delta (\u03B5-\u03B4). Define el comportamiento local de una funci\xF3n matem\xE1tica certeramente cerca de un valor particular, evitando dividir estrictamente por cero (0/0) al calcular diferenciales anal\xEDticos."
      },
      {
        term: "F\xF3rmula de Resoluci\xF3n Cuadr\xE1tica (Bhas-Khara)",
        description: "F\xF3rmula general para resolver la ecuaci\xF3n ax\xB2 + bx + c = 0.",
        expandableContent: "Dado por x = [-b \xB1 \u221A(b\xB2 - 4ac)] / 2a. El discriminante \u0394 = b\xB2 - 4ac define la naturaleza geom\xE9trica de las ra\xEDces algebraicas si interceptan en dos puntos (\u0394 > 0), rozan de manera tangente en el v\xE9rtice (\u0394 = 0) o permanecen flotando sin intercepci\xF3n real (\u0394 < 0, ra\xEDces complejas conjugadas)."
      },
      {
        term: "Pendiente Tangente vs Tasa de Cambio",
        description: "Comprensi\xF3n f\xEDsica y geom\xE9trica de la derivada ordinaria.",
        expandableContent: "Geom\xE9tricamente, la derivada representa la recta tangente exacta a una curva funcional local. F\xEDsicamente, personifica la tasa de cambio instant\xE1neo de una variable respecto a la otra (por ejemplo, la derivada de la posici\xF3n con respecto al tiempo resulta ser la velocidad f\xEDsica exacta)."
      }
    ]
  },
  timeline: {
    milestones: [
      {
        title: "Escuela Pitag\xF3rica",
        date: "500 a.C.",
        type: "concept",
        description: "Descubrimiento de magnitudes inconmensurables y n\xFAmeros irracionales que rompen el paradigma num\xE9rico entero.",
        importance: "Alta"
      },
      {
        title: "L'Kitab al-Jabr wa-l-Muqabala de Al-Khwarizmi",
        date: "820 d.C.",
        type: "milestone",
        description: "Nace formalmente el \xC1lgebra, introduciendo operaciones sistem\xE1ticas de reducci\xF3n y equilibrio para resolver polinomios.",
        importance: "Cr\xEDtica"
      },
      {
        title: "Descubrimiento de la F\xF3rmula General Cuadr\xE1tica",
        date: "1114 d.C.",
        type: "formula",
        description: "Bhaskara II publica la resoluci\xF3n sistem\xE1tica de la ecuaci\xF3n cuadr\xE1tica usando m\xE9todos modernos de radicaci\xF3n.",
        importance: "Media"
      },
      {
        title: "Invenci\xF3n Coincidente del C\xE1lculo Infinitesimal",
        date: "1687 d.C.",
        type: "milestone",
        description: "Isaac Newton (M\xE9todo de Fluxiones) y Gottfried Leibniz (C\xE1lculo de Diferenciales) publican independientemente sus teor\xEDas unificadoras.",
        importance: "Cr\xEDtica"
      },
      {
        title: "Teorema Fundamental del C\xE1lculo",
        date: "1693 d.C.",
        type: "formula",
        description: "Leibniz formaliza la relaci\xF3n inversa entre integrar \xE1reas y diferenciar pendientes algebraicamente.",
        importance: "Cr\xEDtica"
      },
      {
        title: "Establecimiento del L\xEDmite Riguroso",
        date: "1821 d.C.",
        type: "concept",
        description: "Agust\xEDn-Louis Cauchy formula el an\xE1lisis moderno basando todo el c\xE1lculo en la noci\xF3n l\xF3gica del l\xEDmite matem\xE1tico.",
        importance: "Alta"
      }
    ]
  },
  mindmap: {
    nodes: [
      { id: "root", label: "Sistema OmniBrain: Matem\xE1ticas", category: "root" },
      { id: "algebra", label: "\xC1lgebra Polin\xF3mica", category: "main" },
      { id: "calculo", label: "C\xE1lculo Infinitesimal", category: "main" },
      { id: "historia", label: "Hitos Hist\xF3ricos", category: "main" },
      { id: "formula_cuad", label: "Ecuaciones Cuadr\xE1ticas", category: "sub" },
      { id: "dicriminant", label: "An\xE1lisis del Discriminante (\u0394)", category: "sub" },
      { id: "limite", label: "Mec\xE1nica del L\xEDmite (Cauchy)", category: "sub" },
      { id: "derivada", label: "Derivada (Pendiente Tangente)", category: "sub" },
      { id: "integral", label: "Integral (\xC1rea Riemann)", category: "sub" },
      { id: "tfc", label: "Teorema Fundamental del C\xE1lculo", category: "sub" },
      { id: "leibniz", label: "Isacc Newton & Leibniz", category: "sub" }
    ],
    edges: [
      { source: "root", target: "algebra" },
      { source: "root", target: "calculo" },
      { source: "root", target: "historia" },
      { source: "algebra", target: "formula_cuad" },
      { source: "formula_cuad", target: "dicriminant" },
      { source: "calculo", target: "limite" },
      { source: "calculo", target: "derivada" },
      { source: "calculo", target: "integral" },
      { source: "calculo", target: "tfc" },
      { source: "historia", target: "leibniz" },
      { source: "derivada", target: "tfc" },
      { source: "integral", target: "tfc" }
    ]
  }
};
var GENERIC_MOCK_DATA = (subject) => ({
  summarize: {
    summary: `# Estructura Sintetizada: ${subject}

Este m\xF3dulo representa el procesamiento inteligente de la asignatura **${subject}**. La informaci\xF3n recopilada en tus fuentes de estudio ha sido categorizada en nodos jer\xE1rquicos independientes, que facilitan el aprendizaje activo.

## Resumen de Integraci\xF3n
Las fuentes provistas discuten conceptos esenciales en interconexi\xF3n secuencializada. Hemos optimizado este material para acelerar tu proceso cognitivo, vinculando terminolog\xEDas, eventos y din\xE1micas espec\xEDficas del tema de estudio.
`,
    keyConcepts: [
      {
        term: "Fundamentos Sist\xE9micos de: " + subject,
        description: "El pilar central de informaci\xF3n recogido de tus documentos activos.",
        expandableContent: "Este concepto resume la tesis fundamental planteada en tus fuentes. Se conecta estrechamente con teor\xEDas aplicadas y permite resolver las preguntas comunes en evaluaciones formativas."
      },
      {
        term: "Estructuras Din\xE1micas",
        description: "Interacciones detectadas a trav\xE9s del an\xE1lisis autom\xE1tico sobre el texto cargado.",
        expandableContent: "An\xE1lisis pormenorizado del flujo de causas y efectos que gobierna esta asignatura. Al estudiar este punto, presta atenci\xF3n a c\xF3mo interact\xFAa este nodo con las ra\xEDces hist\xF3ricas y leyes derivadas."
      }
    ]
  },
  timeline: {
    milestones: [
      {
        title: "Inicio y Postulados Iniciales",
        date: "Fase 1",
        type: "milestone",
        description: "Surgimiento hist\xF3rico de las bases te\xF3ricas de " + subject + " y primeras interpretaciones.",
        importance: "Alta"
      },
      {
        title: "Descubrimiento de la F\xF3rmula Cr\xEDtica",
        date: "Fase 2",
        type: "formula",
        description: "Formulaci\xF3n de reglas, ecuaciones o teoremas de aplicaci\xF3n universal en esta disciplina.",
        importance: "Cr\xEDtica"
      },
      {
        title: "Formalizaci\xF3n Est\xE1ndar",
        date: "Fase 3",
        type: "concept",
        description: "Consolidaci\xF3n cient\xEDfica y emp\xEDrica del tema con publicaciones acad\xE9micas de vanguardia.",
        importance: "Media"
      }
    ]
  },
  mindmap: {
    nodes: [
      { id: "root", label: subject, category: "root" },
      { id: "main1", label: "Estructura Te\xF3rica", category: "main" },
      { id: "main2", label: "Aplicaciones Pr\xE1cticas", category: "main" },
      { id: "sub1", label: "Conceptos Fundamentales", category: "sub" },
      { id: "sub2", label: "Metodolog\xEDa", category: "sub" },
      { id: "sub3", label: "Caso de Estudio 1", category: "sub" },
      { id: "sub4", label: "Preguntas de Examen", category: "sub" }
    ],
    edges: [
      { source: "root", target: "main1" },
      { source: "root", target: "main2" },
      { source: "main1", target: "sub1" },
      { source: "main1", target: "sub2" },
      { source: "main2", target: "sub3" },
      { source: "main2", target: "sub4" }
    ]
  }
});
app.get("/api/status", (req, res) => {
  res.json({
    live: isApiKeyConfigured,
    modelFlash: "gemini-3.5-flash",
    modelPro: "gemini-3.1-pro-preview"
  });
});
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});
app.post("/api/parse-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Sube un archivo v\xE1lido por favor." });
    }
    const { originalname, buffer } = req.file;
    const extension = import_path.default.extname(originalname).toLowerCase();
    let extractedText = "";
    console.log(`Parsing file: ${originalname} (${extension}), size: ${buffer.length} bytes`);
    if (extension === ".pdf") {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse(new Uint8Array(buffer));
        const data = await parser.getText();
        extractedText = data.text || "";
      } catch (pdfErr) {
        console.error("Error parsing PDF dynamic library:", pdfErr);
        return res.status(400).json({ error: "No se pudo extraer el texto de este archivo PDF. Verifique que no est\xE9 protegido o escaneado como imagen pura." });
      }
    } else if (extension === ".docx") {
      try {
        const { extractRawText } = await import("mammoth");
        const result = await extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxErr) {
        console.error("Error parsing Word document dynamic library:", docxErr);
        return res.status(400).json({ error: "No se pudo extraer texto del archivo de Word (DOCX)." });
      }
    } else if ([".txt", ".md", ".json", ".csv", ".xml", ".html", ".js", ".ts"].includes(extension)) {
      extractedText = buffer.toString("utf-8");
    } else {
      extractedText = buffer.toString("utf-8");
    }
    const cleanText = extractedText.trim();
    if (!cleanText || cleanText.length < 5) {
      return res.status(400).json({
        error: "El archivo no contiene suficiente texto legible extra\xEDdo. Aseg\xFArese de que no est\xE9 vac\xEDo o que no sea puramente una imagen escaneada."
      });
    }
    res.json({
      title: originalname.replace(/\.[^/.]+$/, ""),
      // Strip extension for clean title
      content: cleanText
    });
  } catch (err) {
    console.error("General error processing file upload:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar y parsear el documento." });
  }
});
app.post("/api/ai/structure", async (req, res) => {
  const { action, sources, subject, usePro } = req.body;
  const hasValidSources = Array.isArray(sources) && sources.length > 0;
  const isMath = !subject || subject.toLowerCase().includes("matem");
  if (!isApiKeyConfigured || !hasValidSources) {
    const dataResponse = isMath ? MATH_MOCK_DATA : GENERIC_MOCK_DATA(subject || "Nueva Asignatura");
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    if (action === "summarize") return res.json(dataResponse.summarize);
    if (action === "timeline") return res.json(dataResponse.timeline);
    if (action === "mindmap") return res.json(dataResponse.mindmap);
    return res.status(400).json({ error: "Acci\xF3n no admitida en mock." });
  }
  try {
    const concatenatedSources = sources.map((s) => `[[FUENTE: ${s.title}]]
${s.content}`).join("\n\n---\n\n");
    const requestedModel = usePro ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";
    if (action === "summarize") {
      const prompt = `Act\xFAa como un profesor experto y especialista en estructuraci\xF3n educativa.
Analiza la siguiente materia: "${subject}" bas\xE1ndote EXCLUSIVAMENTE en estas fuentes provistas:
${concatenatedSources}

Crea un informe estructurado que conste de:
1. Un resumen ejecutivo detallado e inspirador en formato Markdown enfocado en la materia.
2. Un desglose de CONCEPTOS CLAVE de estudio en formato JSON que podamos mapear a un componente interactivo de tipo acorde\xF3n (Toggle Lists).

Debes responder \xDANICAMENTE con un objeto JSON v\xE1lido con la siguiente estructura exacta:
{
  "summary": "Texto detallado en formato Markdown, usando t\xEDtulos #, ##, negritas, f\xF3rmulas matem\xE1ticas sencillas envueltas en backticks o texto tabulado.",
  "keyConcepts": [
    {
      "term": "Nombre del t\xE9rmino o concepto clave",
      "description": "Una frase corta que sintetiza el concepto",
      "expandableContent": "Explicaci\xF3n detallada ampliada que se despliega al expandir el concepto para estudiarlo a fondo."
    }
  ]
}`;
      const response = await generateContentWithRetry({
        model: requestedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              summary: { type: import_genai.Type.STRING },
              keyConcepts: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    term: { type: import_genai.Type.STRING },
                    description: { type: import_genai.Type.STRING },
                    expandableContent: { type: import_genai.Type.STRING }
                  },
                  required: ["term", "description", "expandableContent"]
                }
              }
            },
            required: ["summary", "keyConcepts"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }
    if (action === "timeline") {
      const prompt = `Act\xFAa como un profesor de metodolog\xEDa de estudio.
Analiza la asignatura "${subject}" bas\xE1ndote en estas fuentes:
${concatenatedSources}

Crea una secuencia cronol\xF3gica o l\xF3gica paso a paso (L\xEDnea de Tiempo) de hitos que guie el aprendizaje de la informaci\xF3n de forma secuencial.
Clasifica cada hito en tipo: 'milestone' (un hito fundamental o evento), 'formula' (una ley, ecuaci\xF3n o f\xF3rmula anal\xEDtica crucial), o 'concept' (un postulado filos\xF3fico, base de datos o hip\xF3tesis).

Responde \xDANICAMENTE con este formato JSON:
{
  "milestones": [
    {
      "title": "T\xEDtulo del hito/fase/f\xF3rmula",
      "date": "Fecha hist\xF3rica aproximada o n\xFAmero de paso/secuencia (Ej. '500 a.C.', 'Fase 1', 'Paso 1')",
      "type": "milestone" o "formula" o "concept",
      "description": "Descripci\xF3n clara de en qu\xE9 consiste este hito, su relevancia y el aporte esencial de las fuentes.",
      "importance": "Cr\xEDtica" o "Alta" o "Media"
    }
  ]
}`;
      const response = await generateContentWithRetry({
        model: requestedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              milestones: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    title: { type: import_genai.Type.STRING },
                    date: { type: import_genai.Type.STRING },
                    type: { type: import_genai.Type.STRING },
                    description: { type: import_genai.Type.STRING },
                    importance: { type: import_genai.Type.STRING }
                  },
                  required: ["title", "date", "type", "description", "importance"]
                }
              }
            },
            required: ["milestones"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }
    if (action === "mindmap") {
      const prompt = `Act\xFAa como un visualizador pedag\xF3gico experto.
Construye un Mapa Mental relacional de nodos interconectados para la asignatura p\xFAblica: "${subject}" basado en la informaci\xF3n de estas fuentes:
${concatenatedSources}

Genera nodos y las conexiones ('edges') sutiles entre ellos. Sigue la jerarqu\xEDa:
- 'root': El nodo central, la materia. Debe haber exactamente uno.
- 'main': Ramas principales de la materia analizada (al menos 2-3).
- 'sub': Subconceptos que se desprenden de las ramas principales o de otros subconceptos.

Debes responder \xDANICAMENTE con una estructura JSON con este formato:
{
  "nodes": [
    { "id": "un_id_unico_corto", "label": "Etiqueta visible legible", "category": "root" | "main" | "sub" }
  ],
  "edges": [
    { "source": "id_del_nodo_padre", "target": "id_del_nodo_hijo" }
  ]
}

Asegura que todos los targets y sources en 'edges' correspondan exactamente a un ID existente en el arreglo 'nodes'.`;
      const response = await generateContentWithRetry({
        model: requestedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              nodes: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    label: { type: import_genai.Type.STRING },
                    category: { type: import_genai.Type.STRING }
                  },
                  required: ["id", "label", "category"]
                }
              },
              edges: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    source: { type: import_genai.Type.STRING },
                    target: { type: import_genai.Type.STRING }
                  },
                  required: ["source", "target"]
                }
              }
            },
            required: ["nodes", "edges"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }
    return res.status(400).json({ error: "Acci\xF3n no reconocida." });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      error: "Error procesando con Gemini AI. Intente m\xE1s tarde o use el Mock Mode.",
      details: error.message
    });
  }
});
app.post("/api/ai/chat", async (req, res) => {
  const { subject, query, history, sources } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Se requiere un mensaje para el chat." });
  }
  if (!isApiKeyConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const isMath = !subject || subject.toLowerCase().includes("matem");
    let responseText = `Como tu tutor personal inteligente OmniBrain, he procesado tu duda en Mock Mode sobre *${subject || "Matem\xE1ticas"}*. 

`;
    if (isMath) {
      if (query.toLowerCase().includes("derivada") || query.toLowerCase().includes("integral") || query.toLowerCase().includes("tfc")) {
        responseText += `El **Teorema Fundamental del C\xE1lculo** conecta directamente la derivada con la integral. Geom\xE9tricamente, si tienes una curva, calcular la recta tangente en un punto infinitesimal es equivalente a derivar. Si quieres calcular el \xE1rea total que cubre esa curva, integras. El Teorema Fundamental del C\xE1lculo demuestra matem\xE1ticamente que ambas operaciones son reversibles y rec\xEDprocas: la derivada deshace la integral y viceversa.
        
\xBFTe gustar\xEDa que te plantee un ejercicio matem\xE1tico guiado de derivadas o integrales para poner en pr\xE1ctica este concepto?`;
      } else if (query.toLowerCase().includes("formula") || query.toLowerCase().includes("cuadrat")) {
        responseText += `Las ecuaciones cuadr\xE1ticas representan par\xE1bolas de la forma $ax^2 + bx + c = 0$. La soluci\xF3n se halla con la f\xF3rmula cl\xE1sica $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.
Un punto clave es el **discriminante** $\\Delta = b^2 - 4ac$:
- Si $\\Delta > 0$, hay dos soluciones reales distintas.
- Si $\\Delta = 0$, hay exactamente una soluci\xF3n real (el v\xE9rtice toca el eje X).
- Si $\\Delta < 0$, las soluciones son complejas combinadas con la unidad imaginaria $i$.`;
      } else {
        responseText += `Has consultado sobre el temario de matem\xE1ticas. Recuerda que bajo nuestras fuentes cargadas, los temas principales son:
1. **\xC1lgebra Cuadr\xE1tica** (ra\xEDces de polinomios, factorizaci\xF3n y discriminantes).
2. **C\xE1lculo Diferencial e Integral** (l\xEDmites elementales de Cauchy y el Teorema Fundamental).

\xBFQu\xE9 parte espec\xEDfica de estos dos m\xF3dulos te gustar\xEDa repasar o que te prepare para tus ex\xE1menes?`;
      }
    } else {
      responseText += `He analizado tu pregunta sobre **${subject}**. Bas\xE1ndome en la estructura sint\xE9tica recopilada de los apuntes:
        
Aseg\xFArate de repasar los principios de causalidad explicados en tus res\xFAmenes. \xBFDeseas que profundicemos en alg\xFAn t\xE9rmino t\xE9cnico o que creemos una autoevaluaci\xF3n r\xE1pida con preguntas de opci\xF3n m\xFAltiple?`;
    }
    return res.json({
      message: responseText,
      citations: sources && sources.length > 0 ? [sources[0].title] : []
    });
  }
  try {
    const contextText = sources && sources.length > 0 ? `Fuentes de estudio adjuntas:
` + sources.map((s) => `[[FUENTE: ${s.title}]]
${s.content}`).join("\n\n") : "No hay fuentes de estudio cargadas actualmente. Responde con tus amplios conocimientos generales.";
    const formattedHistory = history ? history.slice(-10).map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    })) : [];
    const systemInstruction = `Act\xFAa como "OmniBrain Mentor", un asistente de aprendizaje interactivo y tutor personal s\xFAper inteligente y motivador. El usuario te har\xE1 consultas basadas en su materia de estudio actual: "${subject}".
Usa la siguiente informaci\xF3n de contexto recopilada de los apuntes del alumno para responder constructivamente:
---
${contextText}
---

Instrucciones:
- Responde de forma clara y concisa utilizando formato Markdown elegante, listas y negritas.
- Integra las f\xF3rmulas matem\xE1ticas usando f\xF3rmulas de texto legible o notaci\xF3n matem\xE1tica elegante si aplica.
- Si la pregunta no se puede responder con el contexto provisto, responde de igual forma usando tu conocimiento general pedag\xF3gico pero advierte amablemente al usuario que no provino directamente de sus fuentes.
- S\xE9 alentador y pedag\xF3gico. Al final de tu explicaci\xF3n, sugiere una pregunta o un peque\xF1o ejercicio para mantener el estudio din\xE1mico.`;
    let lastError = null;
    const chatModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
    let response = null;
    let success = false;
    for (const chatModel of chatModels) {
      let delay = 1e3;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          console.log(`Attempting Gemini Chat using model: ${chatModel} (Attempt ${attempt + 1}/3)`);
          const chat = ai.chats.create({
            model: chatModel,
            config: {
              systemInstruction,
              temperature: 0.7
            },
            history: formattedHistory
          });
          response = await chat.sendMessage({
            message: query
          });
          success = true;
          break;
        } catch (err) {
          lastError = err;
          console.error(`Error in Chat on model ${chatModel}, attempt ${attempt + 1}:`, err);
          const errStr = (err.message || "").toLowerCase() + " " + JSON.stringify(err).toLowerCase();
          const isTransient = errStr.includes("503") || errStr.includes("unavailable") || errStr.includes("demand") || errStr.includes("resource_exhausted") || errStr.includes("rate limit") || errStr.includes("overloaded");
          if (isTransient && attempt < 2) {
            console.log(`Transient chat error, retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            break;
          }
        }
      }
      if (success && response) {
        return res.json({
          message: response.text,
          citations: sources && sources.length > 0 ? sources.slice(0, 2).map((s) => s.title) : []
        });
      }
    }
    throw lastError || new Error("Gemini chat failed on all models and retries.");
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: "Error al conversar con el tutor Gemini. Intente nuevamente en unos instantes o use el Chat Offline.",
      details: error.message
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OmniBrain Backend] Running smoothly on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
