import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API config details
  app.get("/api/config", (req, res) => {
    res.json({
      hasEnvClientId: !!process.env.GOOGLE_CLIENT_ID,
      envClientId: process.env.GOOGLE_CLIENT_ID || "",
      appUrl: process.env.APP_URL || "http://localhost:3000"
    });
  });

  // Get active user profile from Google using the access token
  app.get("/api/gcp/user", async (req, res) => {
    const accessToken = req.query.accessToken as string || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Falta token de acceso de Google (AccessToken)" });
    }

    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: "Error de Google UserInfo API", details: errText });
      }

      const userData = await response.json();
      res.json(userData);
    } catch (err: any) {
      res.status(500).json({ error: "Error en servidor al obtener perfil del usuario", details: err.message });
    }
  });

  // Fetch list of projects belonging to the authorized user account
  app.get("/api/gcp/projects", async (req, res) => {
    const accessToken = req.query.accessToken as string || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Falta token de acceso de Google (AccessToken)" });
    }

    try {
      // Fetch v1 projects
      const response = await fetch("https://cloudresourcemanager.googleapis.com/v1/projects", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ 
          error: "Error al listar proyectos de GCP. Puede ser necesario habilitar Cloud Resource Manager API en el panel.", 
          details: errText 
        });
      }

      const data: any = await response.json();
      res.json(data.projects || []);
    } catch (err: any) {
      res.status(500).json({ error: "Error en servidor al listar proyectos", details: err.message });
    }
  });

  // Fetch real Google Cloud Quotas for a specific project and service
  app.get("/api/gcp/quotas", async (req, res) => {
    const accessToken = req.query.accessToken as string || req.headers.authorization?.split(" ")[1];
    const projectId = req.query.projectId as string;
    const servicesStr = req.query.services as string || "compute.googleapis.com,storage.googleapis.com,aiplatform.googleapis.com,bigquery.googleapis.com";

    if (!accessToken) {
      return res.status(401).json({ error: "Token de acceso ausente" });
    }
    if (!projectId) {
      return res.status(400).json({ error: "ID del Proyecto GCP es obligatorio (projectId)" });
    }

    const services = servicesStr.split(",").map(s => s.trim()).filter(Boolean);
    const results: any[] = [];
    const errors: any[] = [];

    // 1. Fetch Cloud Quotas API information for each requested service
    await Promise.all(
      services.map(async (serviceId) => {
        try {
          const url = `https://cloudquotas.googleapis.com/v1/projects/${projectId}/locations/global/services/${serviceId}/quotaInfos`;
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            const errText = await response.text();
            let msg = `No se pudieron cargar cuotas para ${serviceId}`;
            try {
              const parsed = JSON.parse(errText);
              if (parsed.error?.message) msg = parsed.error.message;
            } catch (_) {}
            errors.push({ serviceId, status: response.status, error: msg });
            return;
          }

          const data: any = await response.json();
          if (data.quotaInfos) {
            data.quotaInfos.forEach((info: any) => {
              results.push({
                id: info.quotaId,
                serviceName: serviceId,
                metricName: info.metric || info.quotaId,
                quotaInfo: info
              });
            });
          }
        } catch (err: any) {
          errors.push({ serviceId, error: err.message });
        }
      })
    );

    // 2. Fetch current allocation usage metrics from Google Cloud Monitoring API
    let monitoringTimeSeries: any[] = [];
    try {
      const now = new Date();
      const endTime = now.toISOString();
      const startTime = new Date(now.getTime() - 3600000 * 24).toISOString(); // 24hr lookback

      const gcmUrl = `https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries?filter=metric.type%3D%22serviceruntime.googleapis.com%2Fquota%2Fallocation%2Fusage%22&interval.startTime=${encodeURIComponent(startTime)}&interval.endTime=${encodeURIComponent(endTime)}`;
      
      const gcmResponse = await fetch(gcmUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (gcmResponse.ok) {
        const gcmData: any = await gcmResponse.json();
        monitoringTimeSeries = gcmData.timeSeries || [];
      }
    } catch (_) {
      // Gracefully continue without monitoring if it fails (e.g. API disabled)
    }

    // Return combined result
    res.json({
      success: true,
      projectId,
      quotasCount: results.length,
      quotas: results,
      monitoringTimeSeries,
      errors: errors.length > 0 ? errors : undefined
    });
  });

  // Custom callback handling for Google OAuth Code Exchange
  app.post("/api/auth/google/exchange", async (req, res) => {
    const { code, clientId, clientSecret, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Falta código de autenticación (code)" });
    }

    const cId = clientId || process.env.GOOGLE_CLIENT_ID;
    const cSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (!cId || !cSecret) {
      return res.status(400).json({ error: "Faltan credenciales de Google OAuth (Client ID / Client Secret)" });
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: cId,
          client_secret: cSecret,
          redirect_uri: redirectUri || `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`,
          grant_type: "authorization_code"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: "Error al intercambiar código oauth", details: errText });
      }

      const tokenData = await response.json();
      res.json(tokenData);
    } catch (err: any) {
      res.status(500).json({ error: "Error interno en intercambio de OAuth", details: err.message });
    }
  });

  // Serves dynamic callback page for auth redirect popups
  app.get("/api/auth/google/callback", (req, res) => {
    const { code, error } = req.query;
    
    // Serve high fidelity visual callback that sends auth message to parent tab
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Google Cloud Auth Callback</title>
        <style>
          body {
            background-color: #020617;
            color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            overflow: hidden;
          }
          .card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid #1e293b;
            border-radius: 1.5rem;
            padding: 2.5rem;
            max-width: 400px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
          }
          h2 { color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.25rem; }
          p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
          .spinner {
            border: 3px solid rgba(255,255,255,0.05);
            border-radius: 50%;
            border-top: 3px solid #3b82f6;
            width: 28px;
            height: 28px;
            animation: spin 1s linear infinite;
            margin: 1.5rem auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>procesando Autorización de GCP</h2>
          <div class="spinner"></div>
          <p>Sincronizando sus cuotas en tiempo real... Esta ventana se cerrará automáticamente.</p>
        </div>
        <script>
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const error = urlParams.get('error');

          if (code) {
            window.opener.postMessage({ type: 'GCP_AUTH_CODE', code }, window.location.origin);
          } else if (error) {
            window.opener.postMessage({ type: 'GCP_AUTH_ERROR', error }, window.location.origin);
          }
          
          // Fallback close just in case
          setTimeout(() => {
            window.close();
          }, 3000);
        </script>
      </body>
      </html>
    `);
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
