import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to handle pasted document text or images
app.use(express.json({ limit: "20mb" }));

const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = !!apiKey && apiKey !== "MY_GEMINI_API_KEY";

let ai: GoogleGenAI | null = null;
if (isApiKeyConfigured) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
}

// Robust wrapper for generateContent that implements exponential retries and fallback models
async function generateContentWithRetry(params: any, options: { maxRetries?: number; initialDelayMs?: number } = {}): Promise<any> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1000;
  
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

  let lastError: any = null;

  for (const modelAttempt of modelsToTry) {
    let delay = initialDelayMs;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Attempting Gemini generation using model: ${modelAttempt} (Attempt ${attempt + 1}/${maxRetries})`);
        const attemptParams = {
          ...params,
          model: modelAttempt
        };
        const response = await ai!.models.generateContent(attemptParams);
        return response;
      } catch (err: any) {
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
        // Non-transient errors or last attempt of this model: break out of retry loop to try the next model
        break;
      }
    }
    console.log(`Model ${modelAttempt} failed after retries. Trying fallback model...`);
  }

  throw lastError || new Error("Gemini generation failed on all models and retries.");
}

// ---------------------------------------------------------
// MOCK DATA GENERATORS (Perfect simulation for Mathematics & general)
// ---------------------------------------------------------
const MATH_MOCK_DATA = {
  summarize: {
    summary: `# Resumen Ejecutivo: Fundamentos de Cálculo y Álgebra

Este documento organiza los principios fundacionales que conectan el álgebra polinómica con el cálculo infinitesimal. El análisis se divide en la resolución estructural de ecuaciones polinómicas de segundo grado, la conceptualización límite de Cauchy y la mecánica diferencial/integral unificada por Newton y Leibniz.

## Objetivos de Aprendizaje
1. Comprender la correspondencia entre factores algebraicos y raíces reales o complejas.
2. Conceptualizar la derivada no solo como un límite abstracto de secuencias de pendientes, sino como la tasa instantánea de cambio aplicable a leyes físicas.
3. Interpretar la integral como la acumulación infinitésima de áreas y su relación recíproca con la derivada a través del teorema fundamental.
`,
    keyConcepts: [
      {
        term: "Teorema Fundamental del Cálculo (TFC)",
        description: "Establece la relación inversa entre diferenciación e integración.",
        expandableContent: "Este principio supremo dictamina que si una función f es continua sobre el intervalo [a, b], entonces su integral definida acumuladora es diferenciable y su derivada matemática corresponde precisamente a la función original f. Permite calcular áreas complejas empleando simples antiderivadas algebraicas en lugar de sumas infinitas de Riemann."
      },
      {
        term: "El Concepto de Límite (Formalismo Cauchy)",
        description: "Fundamento riguroso para definir la continuidad y las derivadas.",
        expandableContent: "Formalizado por Augustin-Louis Cauchy mediante desigualdades épsilon-delta (ε-δ). Define el comportamiento local de una función matemática certeramente cerca de un valor particular, evitando dividir estrictamente por cero (0/0) al calcular diferenciales analíticos."
      },
      {
        term: "Fórmula de Resolución Cuadrática (Bhas-Khara)",
        description: "Fórmula general para resolver la ecuación ax² + bx + c = 0.",
        expandableContent: "Dado por x = [-b ± √(b² - 4ac)] / 2a. El discriminante Δ = b² - 4ac define la naturaleza geométrica de las raíces algebraicas si interceptan en dos puntos (Δ > 0), rozan de manera tangente en el vértice (Δ = 0) o permanecen flotando sin intercepción real (Δ < 0, raíces complejas conjugadas)."
      },
      {
        term: "Pendiente Tangente vs Tasa de Cambio",
        description: "Comprensión física y geométrica de la derivada ordinaria.",
        expandableContent: "Geométricamente, la derivada representa la recta tangente exacta a una curva funcional local. Físicamente, personifica la tasa de cambio instantáneo de una variable respecto a la otra (por ejemplo, la derivada de la posición con respecto al tiempo resulta ser la velocidad física exacta)."
      }
    ]
  },
  timeline: {
    milestones: [
      {
        title: "Escuela Pitagórica",
        date: "500 a.C.",
        type: "concept",
        description: "Descubrimiento de magnitudes inconmensurables y números irracionales que rompen el paradigma numérico entero.",
        importance: "Alta"
      },
      {
        title: "L'Kitab al-Jabr wa-l-Muqabala de Al-Khwarizmi",
        date: "820 d.C.",
        type: "milestone",
        description: "Nace formalmente el Álgebra, introduciendo operaciones sistemáticas de reducción y equilibrio para resolver polinomios.",
        importance: "Crítica"
      },
      {
        title: "Descubrimiento de la Fórmula General Cuadrática",
        date: "1114 d.C.",
        type: "formula",
        description: "Bhaskara II publica la resolución sistemática de la ecuación cuadrática usando métodos modernos de radicación.",
        importance: "Media"
      },
      {
        title: "Invención Coincidente del Cálculo Infinitesimal",
        date: "1687 d.C.",
        type: "milestone",
        description: "Isaac Newton (Método de Fluxiones) y Gottfried Leibniz (Cálculo de Diferenciales) publican independientemente sus teorías unificadoras.",
        importance: "Crítica"
      },
      {
        title: "Teorema Fundamental del Cálculo",
        date: "1693 d.C.",
        type: "formula",
        description: "Leibniz formaliza la relación inversa entre integrar áreas y diferenciar pendientes algebraicamente.",
        importance: "Crítica"
      },
      {
        title: "Establecimiento del Límite Riguroso",
        date: "1821 d.C.",
        type: "concept",
        description: "Agustín-Louis Cauchy formula el análisis moderno basando todo el cálculo en la noción lógica del límite matemático.",
        importance: "Alta"
      }
    ]
  },
  mindmap: {
    nodes: [
      { id: "root", label: "Sistema OmniBrain: Matemáticas", category: "root" },
      { id: "algebra", label: "Álgebra Polinómica", category: "main" },
      { id: "calculo", label: "Cálculo Infinitesimal", category: "main" },
      { id: "historia", label: "Hitos Históricos", category: "main" },
      { id: "formula_cuad", label: "Ecuaciones Cuadráticas", category: "sub" },
      { id: "dicriminant", label: "Análisis del Discriminante (Δ)", category: "sub" },
      { id: "limite", label: "Mecánica del Límite (Cauchy)", category: "sub" },
      { id: "derivada", label: "Derivada (Pendiente Tangente)", category: "sub" },
      { id: "integral", label: "Integral (Área Riemann)", category: "sub" },
      { id: "tfc", label: "Teorema Fundamental del Cálculo", category: "sub" },
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

const GENERIC_MOCK_DATA = (subject: string) => ({
  summarize: {
    summary: `# Estructura Sintetizada: ${subject}

Este módulo representa el procesamiento inteligente de la asignatura **${subject}**. La información recopilada en tus fuentes de estudio ha sido categorizada en nodos jerárquicos independientes, que facilitan el aprendizaje activo.

## Resumen de Integración
Las fuentes provistas discuten conceptos esenciales en interconexión secuencializada. Hemos optimizado este material para acelerar tu proceso cognitivo, vinculando terminologías, eventos y dinámicas específicas del tema de estudio.
`,
    keyConcepts: [
      {
        term: "Fundamentos Sistémicos de: " + subject,
        description: "El pilar central de información recogido de tus documentos activos.",
        expandableContent: "Este concepto resume la tesis fundamental planteada en tus fuentes. Se conecta estrechamente con teorías aplicadas y permite resolver las preguntas comunes en evaluaciones formativas."
      },
      {
        term: "Estructuras Dinámicas",
        description: "Interacciones detectadas a través del análisis automático sobre el texto cargado.",
        expandableContent: "Análisis pormenorizado del flujo de causas y efectos que gobierna esta asignatura. Al estudiar este punto, presta atención a cómo interactúa este nodo con las raíces históricas y leyes derivadas."
      }
    ]
  },
  timeline: {
    milestones: [
      {
        title: "Inicio y Postulados Iniciales",
        date: "Fase 1",
        type: "milestone",
        description: "Surgimiento histórico de las bases teóricas de " + subject + " y primeras interpretaciones.",
        importance: "Alta"
      },
      {
        title: "Descubrimiento de la Fórmula Crítica",
        date: "Fase 2",
        type: "formula",
        description: "Formulación de reglas, ecuaciones o teoremas de aplicación universal en esta disciplina.",
        importance: "Crítica"
      },
      {
        title: "Formalización Estándar",
        date: "Fase 3",
        type: "concept",
        description: "Consolidación científica y empírica del tema con publicaciones académicas de vanguardia.",
        importance: "Media"
      }
    ]
  },
  mindmap: {
    nodes: [
      { id: "root", label: subject, category: "root" },
      { id: "main1", label: "Estructura Teórica", category: "main" },
      { id: "main2", label: "Aplicaciones Prácticas", category: "main" },
      { id: "sub1", label: "Conceptos Fundamentales", category: "sub" },
      { id: "sub2", label: "Metodología", category: "sub" },
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

// ---------------------------------------------------------
// SERVER ENDPOINTS
// ---------------------------------------------------------

// Check if Gemini API is live
app.get("/api/status", (req, res) => {
  res.json({
    live: isApiKeyConfigured,
    modelFlash: "gemini-3.5-flash",
    modelPro: "gemini-3.1-pro-preview",
  });
});

// Configure Multer for File Uploads (15MB limit)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Real Document Parsing Endpoint (supporting PDF, DOCX, TXT, MD, JSON)
app.post("/api/parse-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Sube un archivo válido por favor." });
    }

    const { originalname, buffer } = req.file;
    const extension = path.extname(originalname).toLowerCase();
    let extractedText = "";

    console.log(`Parsing file: ${originalname} (${extension}), size: ${buffer.length} bytes`);

    if (extension === ".pdf") {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse(new Uint8Array(buffer));
        const data = await parser.getText();
        extractedText = data.text || "";
      } catch (pdfErr: any) {
        console.error("Error parsing PDF dynamic library:", pdfErr);
        return res.status(400).json({ error: "No se pudo extraer el texto de este archivo PDF. Verifique que no esté protegido o escaneado como imagen pura." });
      }
    } else if (extension === ".docx") {
      try {
        const { extractRawText } = await import("mammoth");
        const result = await extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxErr: any) {
        console.error("Error parsing Word document dynamic library:", docxErr);
        return res.status(400).json({ error: "No se pudo extraer texto del archivo de Word (DOCX)." });
      }
    } else if ([".txt", ".md", ".json", ".csv", ".xml", ".html", ".js", ".ts"].includes(extension)) {
      extractedText = buffer.toString("utf-8");
    } else {
      // General broad text decode fallback
      extractedText = buffer.toString("utf-8");
    }

    const cleanText = extractedText.trim();
    if (!cleanText || cleanText.length < 5) {
      return res.status(400).json({ 
        error: "El archivo no contiene suficiente texto legible extraído. Asegúrese de que no esté vacío o que no sea puramente una imagen escaneada." 
      });
    }

    res.json({
      title: originalname.replace(/\.[^/.]+$/, ""), // Strip extension for clean title
      content: cleanText
    });
  } catch (err: any) {
    console.error("General error processing file upload:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar y parsear el documento." });
  }
});

// AI Processing API Point (Actions: summarize, timeline, mindmap)
app.post("/api/ai/structure", async (req, res) => {
  const { action, sources, subject, usePro } = req.body;

  // Identify fallback to mock
  const hasValidSources = Array.isArray(sources) && sources.length > 0;
  const isMath = !subject || subject.toLowerCase().includes("matem");

  // If no Gemini API is configured or they represent math with no sources/mock requested, provide Mock Data immediately
  if (!isApiKeyConfigured || !hasValidSources) {
    const dataResponse = isMath ? MATH_MOCK_DATA : GENERIC_MOCK_DATA(subject || "Nueva Asignatura");
    
    // Simulating slight IA network processing latency for beautiful feel
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (action === "summarize") return res.json(dataResponse.summarize);
    if (action === "timeline") return res.json(dataResponse.timeline);
    if (action === "mindmap") return res.json(dataResponse.mindmap);
    return res.status(400).json({ error: "Acción no admitida en mock." });
  }

  // Live Gemini Analysis API
  try {
    const concatenatedSources = sources
      .map((s: any) => `[[FUENTE: ${s.title}]]\n${s.content}`)
      .join("\n\n---\n\n");

    const requestedModel = usePro ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

    if (action === "summarize") {
      const prompt = `Actúa como un profesor experto y especialista en estructuración educativa.
Analiza la siguiente materia: "${subject}" basándote EXCLUSIVAMENTE en estas fuentes provistas:
${concatenatedSources}

Crea un informe estructurado que conste de:
1. Un resumen ejecutivo detallado e inspirador en formato Markdown enfocado en la materia.
2. Un desglose de CONCEPTOS CLAVE de estudio en formato JSON que podamos mapear a un componente interactivo de tipo acordeón (Toggle Lists).

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "summary": "Texto detallado en formato Markdown, usando títulos #, ##, negritas, fórmulas matemáticas sencillas envueltas en backticks o texto tabulado.",
  "keyConcepts": [
    {
      "term": "Nombre del término o concepto clave",
      "description": "Una frase corta que sintetiza el concepto",
      "expandableContent": "Explicación detallada ampliada que se despliega al expandir el concepto para estudiarlo a fondo."
    }
  ]
}`;

      const response = await generateContentWithRetry({
        model: requestedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              keyConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    description: { type: Type.STRING },
                    expandableContent: { type: Type.STRING },
                  },
                  required: ["term", "description", "expandableContent"],
                },
              },
            },
            required: ["summary", "keyConcepts"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }

    if (action === "timeline") {
      const prompt = `Actúa como un profesor de metodología de estudio.
Analiza la asignatura "${subject}" basándote en estas fuentes:
${concatenatedSources}

Crea una secuencia cronológica o lógica paso a paso (Línea de Tiempo) de hitos que guie el aprendizaje de la información de forma secuencial.
Clasifica cada hito en tipo: 'milestone' (un hito fundamental o evento), 'formula' (una ley, ecuación o fórmula analítica crucial), o 'concept' (un postulado filosófico, base de datos o hipótesis).

Responde ÚNICAMENTE con este formato JSON:
{
  "milestones": [
    {
      "title": "Título del hito/fase/fórmula",
      "date": "Fecha histórica aproximada o número de paso/secuencia (Ej. '500 a.C.', 'Fase 1', 'Paso 1')",
      "type": "milestone" o "formula" o "concept",
      "description": "Descripción clara de en qué consiste este hito, su relevancia y el aporte esencial de las fuentes.",
      "importance": "Crítica" o "Alta" o "Media"
    }
  ]
}`;

      const response = await generateContentWithRetry({
        model: requestedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    date: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    importance: { type: Type.STRING },
                  },
                  required: ["title", "date", "type", "description", "importance"],
                },
              },
            },
            required: ["milestones"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }

    if (action === "mindmap") {
      const prompt = `Actúa como un visualizador pedagógico experto.
Construye un Mapa Mental relacional de nodos interconectados para la asignatura pública: "${subject}" basado en la información de estas fuentes:
${concatenatedSources}

Genera nodos y las conexiones ('edges') sutiles entre ellos. Sigue la jerarquía:
- 'root': El nodo central, la materia. Debe haber exactamente uno.
- 'main': Ramas principales de la materia analizada (al menos 2-3).
- 'sub': Subconceptos que se desprenden de las ramas principales o de otros subconceptos.

Debes responder ÚNICAMENTE con una estructura JSON con este formato:
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
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ["id", "label", "category"],
                },
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                  },
                  required: ["source", "target"],
                },
              },
            },
            required: ["nodes", "edges"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }

    return res.status(400).json({ error: "Acción no reconocida." });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      error: "Error procesando con Gemini AI. Intente más tarde o use el Mock Mode.",
      details: error.message,
    });
  }
});

// Chat Direct with context
app.post("/api/ai/chat", async (req, res) => {
  const { subject, query, history, sources } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Se requiere un mensaje para el chat." });
  }

  // If no API Key configured, fallback to Mock Chat immediately
  if (!isApiKeyConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isMath = !subject || subject.toLowerCase().includes("matem");
    let responseText = `Como tu tutor personal inteligente OmniBrain, he procesado tu duda en Mock Mode sobre *${subject || "Matemáticas"}*. 

`;
    if (isMath) {
      if (query.toLowerCase().includes("derivada") || query.toLowerCase().includes("integral") || query.toLowerCase().includes("tfc")) {
        responseText += `El **Teorema Fundamental del Cálculo** conecta directamente la derivada con la integral. Geométricamente, si tienes una curva, calcular la recta tangente en un punto infinitesimal es equivalente a derivar. Si quieres calcular el área total que cubre esa curva, integras. El Teorema Fundamental del Cálculo demuestra matemáticamente que ambas operaciones son reversibles y recíprocas: la derivada deshace la integral y viceversa.
        
¿Te gustaría que te plantee un ejercicio matemático guiado de derivadas o integrales para poner en práctica este concepto?`;
      } else if (query.toLowerCase().includes("formula") || query.toLowerCase().includes("cuadrat")) {
        responseText += `Las ecuaciones cuadráticas representan parábolas de la forma $ax^2 + bx + c = 0$. La solución se halla con la fórmula clásica $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.
Un punto clave es el **discriminante** $\\Delta = b^2 - 4ac$:
- Si $\\Delta > 0$, hay dos soluciones reales distintas.
- Si $\\Delta = 0$, hay exactamente una solución real (el vértice toca el eje X).
- Si $\\Delta < 0$, las soluciones son complejas combinadas con la unidad imaginaria $i$.`;
      } else {
        responseText += `Has consultado sobre el temario de matemáticas. Recuerda que bajo nuestras fuentes cargadas, los temas principales son:
1. **Álgebra Cuadrática** (raíces de polinomios, factorización y discriminantes).
2. **Cálculo Diferencial e Integral** (límites elementales de Cauchy y el Teorema Fundamental).

¿Qué parte específica de estos dos módulos te gustaría repasar o que te prepare para tus exámenes?`;
      }
    } else {
      responseText += `He analizado tu pregunta sobre **${subject}**. Basándome en la estructura sintética recopilada de los apuntes:
        
Asegúrate de repasar los principios de causalidad explicados en tus resúmenes. ¿Deseas que profundicemos en algún término técnico o que creemos una autoevaluación rápida con preguntas de opción múltiple?`;
    }

    return res.json({
      message: responseText,
      citations: sources && sources.length > 0 ? [sources[0].title] : [],
    });
  }

  // Live Chat API with Gemini
  try {
    const contextText = sources && sources.length > 0
      ? `Fuentes de estudio adjuntas:\n` + sources.map((s: any) => `[[FUENTE: ${s.title}]]\n${s.content}`).join("\n\n")
      : "No hay fuentes de estudio cargadas actualmente. Responde con tus amplios conocimientos generales.";

    const formattedHistory = history ? history.slice(-10).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })) : [];

    const systemInstruction = `Actúa como "OmniBrain Mentor", un asistente de aprendizaje interactivo y tutor personal súper inteligente y motivador. El usuario te hará consultas basadas en su materia de estudio actual: "${subject}".
Usa la siguiente información de contexto recopilada de los apuntes del alumno para responder constructivamente:
---
${contextText}
---

Instrucciones:
- Responde de forma clara y concisa utilizando formato Markdown elegante, listas y negritas.
- Integra las fórmulas matemáticas usando fórmulas de texto legible o notación matemática elegante si aplica.
- Si la pregunta no se puede responder con el contexto provisto, responde de igual forma usando tu conocimiento general pedagógico pero advierte amablemente al usuario que no provino directamente de sus fuentes.
- Sé alentador y pedagógico. Al final de tu explicación, sugiere una pregunta o un pequeño ejercicio para mantener el estudio dinámico.`;

    // Try different models with exponential retry backoff in case of transient 503/high demand errors
    let lastError: any = null;
    const chatModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
    let response: any = null;
    let success = false;
    
    for (const chatModel of chatModels) {
      let delay = 1000;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          console.log(`Attempting Gemini Chat using model: ${chatModel} (Attempt ${attempt + 1}/3)`);
          const chat = ai!.chats.create({
            model: chatModel,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
            history: formattedHistory,
          });

          response = await chat.sendMessage({
            message: query,
          });
          success = true;
          break;
        } catch (err: any) {
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
          citations: sources && sources.length > 0 ? sources.slice(0, 2).map((s: any) => s.title) : [],
        });
      }
    }

    throw lastError || new Error("Gemini chat failed on all models and retries.");
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: "Error al conversar con el tutor Gemini. Intente nuevamente en unos instantes o use el Chat Offline.",
      details: error.message,
    });
  }
});

// Configure Vite or Static Assets handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OmniBrain Backend] Running smoothly on port ${PORT}`);
  });
}

startServer();
