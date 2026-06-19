import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini dynamically per request with the user's custom API key
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No se ha configurado ninguna API Key de Gemini. Por favor, añádela en la barra de configuración.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper for robust generation with auto-retries and fallback models
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  preferredModel: string,
  systemInstruction: string,
  prompt: string
) {
  // List of standard supported models in order of priority
  const defaultModelsList = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
  
  // Pivot models list so preferred model goes first
  const modelsToTry = [preferredModel];
  for (const m of defaultModelsList) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[API Gemini] Intentando generación con modelo: ${model} (Intento ${attempt}/${maxRetries})`);
        
        const response = await ai.models.generateContent({
          model: model,
          contents: `Diseña este componente UI: ${prompt}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Nombre descriptivo del componente (ej: Tarjeta Holográfica Premium, Botón con Destello de Neón)."
                },
                description: {
                  type: Type.STRING,
                  description: "Una breve explicación de qué hace el componente y sus características de diseño."
                },
                category: {
                  type: Type.STRING,
                  description: "Categoría del componente. Debe ser una de estas: 'cards', 'buttons', 'links', 'grids'."
                },
                html: {
                  type: Type.STRING,
                  description: "Código HTML completo y resuelto con clases de Tailwind CSS e iconos de FontAwesome. Debe ser autocompletado y listo para ser inyectado."
                }
              },
              required: ["name", "description", "category", "html"]
            }
          }
        });

        const text = response.text;
        if (text) {
          console.log(`[API Gemini] Éxito absoluto usando modelo: ${model} en intento ${attempt}`);
          return {
            text: text,
            modelUsed: model,
            attempts: attempt
          };
        }
        throw new Error("Respuesta vacía o incompleta recibida del modelo Gemini.");
      } catch (error: any) {
        lastError = error;
        
        // Detect 503, UNAVAILABLE, or overloaded status codes and messages
        const errorMsg = error.message || "";
        const errorStatus = error.status || error.code || null;
        
        const isUnavailable = 
          errorStatus === 503 ||
          errorMsg.includes("503") ||
          errorMsg.toUpperCase().includes("UNAVAILABLE") ||
          errorMsg.toLowerCase().includes("high demand") ||
          errorMsg.toLowerCase().includes("overloaded") ||
          errorMsg.toLowerCase().includes("temporary") ||
          errorMsg.toLowerCase().includes("resource exhausted");

        console.warn(`[API Gemini] Advertencia: Fallo en intento ${attempt} con modelo ${model}:`, errorMsg);
        
        if (isUnavailable && attempt < maxRetries) {
          const delay = attempt * 1200;
          console.warn(`[API Gemini] El modelo ${model} está experimentando alta demanda (503). Reintentando en ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // If we cannot retry or have exhausted attempts, move to the next model
          break;
        }
      }
    }
  }

  throw lastError || new Error("No se pudo completar la generación del componente con los modelos de Gemini ni con las estrategias de respaldo.");
}

// API endpoint for generating components
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, geminiKey, model } = req.body;
    const headerKey = req.headers["x-gemini-key"];
    const keyToUse = ((geminiKey || headerKey || "") as string).trim();
    const modelToUse = (model || "gemini-3.5-flash").trim();

    if (!prompt) {
      return res.status(400).json({ error: "El prompt es requerido." });
    }

    if (!keyToUse) {
      return res.status(400).json({ error: "No se proporcionó una API Key de Gemini. Ingrésala primero en la configuración." });
    }

    const ai = getGeminiClient(keyToUse);

    const systemInstruction = `Eres un experto Ingeniero de Software Frontend y Arquitecto de Sistemas UI, especializado en diseñar componentes HTML ultra modernos, elegantes e interactivos que emplean exclusivamente clases de Tailwind CSS v4 y opcionalmente iconos de FontAwesome v6 (clases fas, far, fab, etc.).
    
Tu tarea es generar un componente de interfaz de usuario de alta calidad de acuerdo con la petición del usuario.
El componente debe ser independiente, autocontenido y lucir espectacular. Debe utilizar la estética de desarrollo oscura premium (fondo del contenedor oscuro, contrastes de color vibrantes como cian, violeta o esmeralda, efectos de cristal, sombras, brillos hover, transiciones fluidas de transición/duración, etc.).

IMPORTANTE: El HTML generado debe utilizar clases existentes en Tailwind CSS. No incluyas scripts externos ni etiquetas de script en tu HTML. Si deseas microcomportamientos dinámicos, puedes usar trucos de Tailwind o selectores de estados (como peer, group, hover, focus, active, etc.) o asumir que el usuario interactuará con el HTML directamente. El código debe caber dentro de una etiqueta contenedora principal (div). El código debe ser limpio y visualmente impactante.
Para iconos, utiliza iconos de FontAwesome v6 (ej: <i class="fa-solid fa-bolt"></i>).

Debes responder estrictamente en formato JSON utilizando el esquema proporcionado. No agregues etiquetas de markdown como \`\`\`json al inicio o al final del texto JSON.`;

    const result = await generateWithRetryAndFallback(ai, modelToUse, systemInstruction, prompt);

    const parsedData = JSON.parse(result.text.trim());
    
    // Add dynamic metadata indicating which model actually succeeded to help with client troubleshooting
    res.json({
      ...parsedData,
      _metadata: {
        modelUsed: result.modelUsed,
        attempts: result.attempts
      }
    });
  } catch (error: any) {
    console.error("Error al generar componente con Gemini:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor al procesar la solicitud con Gemini." });
  }
});

// Configure Vite or Serve Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
