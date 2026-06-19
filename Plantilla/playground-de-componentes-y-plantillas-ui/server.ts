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

// API endpoint for generating components
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, geminiKey } = req.body;
    const headerKey = req.headers["x-gemini-key"];
    const keyToUse = ((geminiKey || headerKey || "") as string).trim();

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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    if (!text) {
      throw new Error("No se obtuvo respuesta del modelo Gemini.");
    }

    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error al generar componente con Gemini:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor." });
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
