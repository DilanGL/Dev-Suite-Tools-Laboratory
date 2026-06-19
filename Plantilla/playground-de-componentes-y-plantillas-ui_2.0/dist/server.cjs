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
var import_genai = require("@google/genai");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
function getGeminiClient(customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No se ha configurado ninguna API Key de Gemini. Por favor, a\xF1\xE1dela en la barra de configuraci\xF3n.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
async function generateWithRetryAndFallback(ai, preferredModel, systemInstruction, prompt) {
  const defaultModelsList = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
  const modelsToTry = [preferredModel];
  for (const m of defaultModelsList) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }
  let lastError = null;
  for (const model of modelsToTry) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[API Gemini] Intentando generaci\xF3n con modelo: ${model} (Intento ${attempt}/${maxRetries})`);
        const response = await ai.models.generateContent({
          model,
          contents: `Dise\xF1a este componente UI: ${prompt}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                name: {
                  type: import_genai.Type.STRING,
                  description: "Nombre descriptivo del componente (ej: Tarjeta Hologr\xE1fica Premium, Bot\xF3n con Destello de Ne\xF3n)."
                },
                description: {
                  type: import_genai.Type.STRING,
                  description: "Una breve explicaci\xF3n de qu\xE9 hace el componente y sus caracter\xEDsticas de dise\xF1o."
                },
                category: {
                  type: import_genai.Type.STRING,
                  description: "Categor\xEDa del componente. Debe ser una de estas: 'cards', 'buttons', 'links', 'grids'."
                },
                html: {
                  type: import_genai.Type.STRING,
                  description: "C\xF3digo HTML completo y resuelto con clases de Tailwind CSS e iconos de FontAwesome. Debe ser autocompletado y listo para ser inyectado."
                }
              },
              required: ["name", "description", "category", "html"]
            }
          }
        });
        const text = response.text;
        if (text) {
          console.log(`[API Gemini] \xC9xito absoluto usando modelo: ${model} en intento ${attempt}`);
          return {
            text,
            modelUsed: model,
            attempts: attempt
          };
        }
        throw new Error("Respuesta vac\xEDa o incompleta recibida del modelo Gemini.");
      } catch (error) {
        lastError = error;
        const errorMsg = error.message || "";
        const errorStatus = error.status || error.code || null;
        const isUnavailable = errorStatus === 503 || errorMsg.includes("503") || errorMsg.toUpperCase().includes("UNAVAILABLE") || errorMsg.toLowerCase().includes("high demand") || errorMsg.toLowerCase().includes("overloaded") || errorMsg.toLowerCase().includes("temporary") || errorMsg.toLowerCase().includes("resource exhausted");
        console.warn(`[API Gemini] Advertencia: Fallo en intento ${attempt} con modelo ${model}:`, errorMsg);
        if (isUnavailable && attempt < maxRetries) {
          const delay = attempt * 1200;
          console.warn(`[API Gemini] El modelo ${model} est\xE1 experimentando alta demanda (503). Reintentando en ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
  }
  throw lastError || new Error("No se pudo completar la generaci\xF3n del componente con los modelos de Gemini ni con las estrategias de respaldo.");
}
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, geminiKey, model } = req.body;
    const headerKey = req.headers["x-gemini-key"];
    const keyToUse = (geminiKey || headerKey || "").trim();
    const modelToUse = (model || "gemini-3.5-flash").trim();
    if (!prompt) {
      return res.status(400).json({ error: "El prompt es requerido." });
    }
    if (!keyToUse) {
      return res.status(400).json({ error: "No se proporcion\xF3 una API Key de Gemini. Ingr\xE9sala primero en la configuraci\xF3n." });
    }
    const ai = getGeminiClient(keyToUse);
    const systemInstruction = `Eres un experto Ingeniero de Software Frontend y Arquitecto de Sistemas UI, especializado en dise\xF1ar componentes HTML ultra modernos, elegantes e interactivos que emplean exclusivamente clases de Tailwind CSS v4 y opcionalmente iconos de FontAwesome v6 (clases fas, far, fab, etc.).
    
Tu tarea es generar un componente de interfaz de usuario de alta calidad de acuerdo con la petici\xF3n del usuario.
El componente debe ser independiente, autocontenido y lucir espectacular. Debe utilizar la est\xE9tica de desarrollo oscura premium (fondo del contenedor oscuro, contrastes de color vibrantes como cian, violeta o esmeralda, efectos de cristal, sombras, brillos hover, transiciones fluidas de transici\xF3n/duraci\xF3n, etc.).

IMPORTANTE: El HTML generado debe utilizar clases existentes en Tailwind CSS. No incluyas scripts externos ni etiquetas de script en tu HTML. Si deseas microcomportamientos din\xE1micos, puedes usar trucos de Tailwind o selectores de estados (como peer, group, hover, focus, active, etc.) o asumir que el usuario interactuar\xE1 con el HTML directamente. El c\xF3digo debe caber dentro de una etiqueta contenedora principal (div). El c\xF3digo debe ser limpio y visualmente impactante.
Para iconos, utiliza iconos de FontAwesome v6 (ej: <i class="fa-solid fa-bolt"></i>).

Debes responder estrictamente en formato JSON utilizando el esquema proporcionado. No agregues etiquetas de markdown como \`\`\`json al inicio o al final del texto JSON.`;
    const result = await generateWithRetryAndFallback(ai, modelToUse, systemInstruction, prompt);
    const parsedData = JSON.parse(result.text.trim());
    res.json({
      ...parsedData,
      _metadata: {
        modelUsed: result.modelUsed,
        attempts: result.attempts
      }
    });
  } catch (error) {
    console.error("Error al generar componente con Gemini:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor al procesar la solicitud con Gemini." });
  }
});
async function setupServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
