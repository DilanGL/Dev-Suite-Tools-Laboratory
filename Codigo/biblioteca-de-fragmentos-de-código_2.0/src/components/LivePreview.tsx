import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Play, ShieldAlert, Terminal, Sparkles, AlertCircle } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  language: string;
}

interface ConsoleLog {
  type: 'log' | 'error' | 'warn';
  message: string;
  time: string;
}

export default function LivePreview({ code, language }: LivePreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [activeConsole, setActiveConsole] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Clear logs when code changes or preview refreshes
  const handleRefresh = () => {
    setConsoleLogs([]);
    setIframeKey(prev => prev + 1);
  };

  useEffect(() => {
    setConsoleLogs([]);
  }, [code, language]);

  // Listen for console outputs from iframe
  useEffect(() => {
    const receiveLogs = (event: MessageEvent) => {
      // Guard against non-iframe messages
      if (event.data && typeof event.data === 'object' && 'applet_log_event' in event.data) {
        const { type, message } = event.data;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        setConsoleLogs(prev => [
          ...prev, 
          { 
            type: type as 'log' | 'error' | 'warn', 
            message, 
            time: timeStr 
          }
        ].slice(-60)); // Keep last 60 logs
      }
    };

    window.addEventListener('message', receiveLogs);
    return () => window.removeEventListener('message', receiveLogs);
  }, []);

  // Generate source document for the sandboxed iframe based on the custom language
  const getSrcDoc = () => {
    // Shared instrumentation script to capture console logs and send back to parent
    const instrumentationScript = `
      <script>
        (function() {
          const sendLog = (type, args) => {
            const message = args.map(arg => {
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');

            window.parent.postMessage({ 
              applet_log_event: true, 
              type: type, 
              message: message 
            }, '*');
          };

          // Capture standard methods
          const _log = console.log;
          const _err = console.error;
          const _warn = console.warn;

          console.log = function(...args) {
            _log.apply(console, args);
            sendLog('log', args);
          };
          console.error = function(...args) {
            _err.apply(console, args);
            sendLog('error', args);
          };
          console.warn = function(...args) {
            _warn.apply(console, args);
            sendLog('warn', args);
          };

          // Capture globals runtime errors
          window.onerror = function(message, source, lineno, colno, error) {
            sendLog('error', [message + ' (Línea ' + lineno + ':' + colno + ')']);
            return false;
          };
        })();
      </script>
    `;

    const normalizedLang = language.toLowerCase();

    if (normalizedLang === 'html') {
      // Find where head/body lies, and inject instrumentation script at start
      if (code.includes('<head>')) {
        return code.replace('<head>', `<head>${instrumentationScript}`);
      }
      return `${instrumentationScript}\n${code}`;
    }

    if (normalizedLang === 'css') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          ${instrumentationScript}
          <style>
            ${code}
          </style>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 24px;
              color: #1e293b;
              background-color: #f8fafc;
              margin: 0;
            }
            .preview-container {
              max-width: 600px;
              margin: 0 auto;
            }
            .grid-test {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 16px;
              margin-top: 24px;
            }
            .styled-test-box {
              padding: 16px;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border: 1px solid #e2e8f0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Vista Previa de Estilos CSS</h2>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Esta página de prueba aplica tus estilos creados en tiempo real para verificar clases, variables e interacciones.</p>
            
            <!-- Target default items for user styled rules -->
            <button class="action-btn custom-btn btn primary-button hover-trigger" style="padding: 10px 20px; font-size: 14px; border-radius: 6px; cursor: pointer;">
              Botón de Prueba
            </button>
            
            <div class="card my-card custom-card styled-test-box" style="margin-top: 24px;">
              <h3 class="card-title" style="margin-top: 0; font-size: 16px;">Componente de Tarjeta</h3>
              <p class="card-desc" style="font-size: 13px; color: #475569;">Modifica tus selectores como <code>.card</code>, <code>.badge</code> o de lo contrario asigna nombres de clases personalizados para visualizarlos aquí.</p>
            </div>

            <div class="grid-test">
              <div class="badge primary-badge inline-block font-semibold px-2.5 py-1 text-xs rounded bg-blue-100 text-blue-800">
                Insignia Normal
              </div>
              <div class="badge secondary-badge inline-block font-semibold px-2.5 py-1 text-xs rounded bg-purple-100 text-purple-800">
                Insignia Púrpura
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    if (normalizedLang === 'javascript') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          ${instrumentationScript}
        </head>
        <body style="font-family: system-ui, sans-serif; padding: 24px; background: #fafafa; color: #334155;">
          <h3 style="font-size: 16px; font-weight: 600; margin-top: 0;">Ejecución de Fragmento JavaScript</h3>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">El código de script se ejecuta de forma aislada. Revisa los resultados y logs de depuración en la consola interactiva inferior.</p>
          <button id="run-trigger" style="padding: 8px 16px; background: #6b21a8; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 500;">
            Relanzar Script
          </button>
          
          <script>
            function executeUserScript() {
              console.log("--- Iniciando ejecución del fragmento ---");
              try {
                ${code}
                console.log("--- Ejecución finalizada con éxito ---");
              } catch (err) {
                console.error("Error de ejecución: " + err.message);
              }
            }

            document.getElementById('run-trigger').addEventListener('click', () => {
              window.parent.postMessage({ applet_log_event: true, type: 'log', message: 'Re-ejecutando script...' }, '*');
              executeUserScript();
            });

            // Auto run on load
            executeUserScript();
          </script>
        </body>
        </html>
      `;
    }

    // Default message fallback for non-sandbox-supported files (SQL, Python, etc.)
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 32px;
            color: #E0E0E0;
            background-color: #0F1115;
            line-height: 1.6;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 80vh;
            text-align: center;
            margin: 0;
          }
          .card {
            max-width: 420px;
            background: #16181D;
            padding: 32px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
            border: 1px solid #2A2D35;
          }
          .icon {
            font-size: 40px;
            margin-bottom: 16px;
          }
          .title {
            color: #FFFFFF;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          p {
            color: #9CA3AF;
            font-size: 12px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">📊</div>
          <div class="title">Modo Estático: ${language.toUpperCase()}</div>
          <p>Este lenguaje no requiere una renderización visual HTML activa. El fragmento de código es completamente editable, copiable y está guardado de forma segura.</p>
        </div>
      </body>
      </html>
    `;
  };

  const isRenderable = ['html', 'css', 'javascript'].includes(language.toLowerCase());

  return (
    <div className="flex flex-col h-full bg-[#0F1115] rounded-xl border border-[#2A2D35] overflow-hidden" id="live-preview-root">
      {/* Title bar controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2D35] bg-[#16181D]" id="preview-tab-controls">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-semibold text-[#9CA3AF] ml-2 select-none flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> 
            Vista Previa Activa
          </span>
        </div>

        <button 
          onClick={handleRefresh}
          className="p-1 px-2.5 rounded hover:bg-[#1F2229] text-[#E0E0E0] hover:text-white border border-[#3A3F4B] bg-[#12141A] font-sans text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="Recargar vista previa"
          id="preview-refresh-btn"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          Refrescar
        </button>
      </div>

      {/* Embedded Iframe Sandbox wrapper */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={`${language}-${iframeKey}`}
          ref={iframeRef}
          srcDoc={getSrcDoc()}
          sandbox="allow-scripts allow-modals"
          title="Visual sandbox preview frame"
          className="w-full h-full border-0 bg-white"
          referrerPolicy="no-referrer"
          id="live-sandbox-iframe"
        />
      </div>

      {/* Diagnostics / Console Output Panel */}
      {isRenderable && activeConsole && (
        <div className="border-t border-[#2A2D35] bg-[#0A0B0D] text-[#E0E0E0] font-mono text-[11px] h-36 flex flex-col" id="console-drawer">
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#16181D] border-b border-[#2A2D35] text-[#9CA3AF] select-none">
            <span className="flex items-center gap-1.5 font-sans font-bold uppercase tracking-wider text-[10px]">
              <Terminal className="w-3.5 h-3.5 text-blue-400" /> Consola de Salida
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setConsoleLogs([])}
                className="hover:text-white px-1.5 py-0.5 rounded hover:bg-[#1F2229] transition cursor-pointer font-sans font-medium"
              >
                Limpiar
              </button>
              <button 
                onClick={() => setActiveConsole(false)}
                className="hover:text-white px-1.5 py-0.5 rounded hover:bg-[#1F2229] transition cursor-pointer font-sans font-medium"
              >
                Ocultar
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-3 overflow-auto space-y-1 select-text scrollbar-thin">
            {consoleLogs.length === 0 ? (
              <div className="text-[#4B5563] italic flex items-center gap-1.5 p-1">
                No hay logs capturados. Escribe "console.log" o genera un error para ver diagnósticos.
              </div>
            ) : (
              consoleLogs.map((log, index) => (
                <div key={index} className={`flex gap-2 transition hover:bg-[#16181D] p-0.5 rounded ${
                  log.type === 'error' ? 'text-red-400 font-semibold' : log.type === 'warn' ? 'text-amber-400' : 'text-[#8E9CAE]'
                }`}>
                  <span className="text-[#4B5563] flex-shrink-0 select-none">[{log.time}]</span>
                  <span className="flex-shrink-0">
                    {log.type === 'error' ? '✖' : log.type === 'warn' ? '⚠' : '›'}
                  </span>
                  <span className="break-all whitespace-pre-wrap">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Console trigger indicator when console is closed */}
      {isRenderable && !activeConsole && (
        <button 
          onClick={() => setActiveConsole(true)}
          className="bg-[#16181D] border-t border-[#2A2D35] text-[#9CA3AF] hover:text-white px-4 py-1.5 text-left text-[11px] font-mono flex items-center gap-2 cursor-pointer transition"
          id="console-trigger-badge"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>Ver Consola depuradora ({consoleLogs.length} logs)</span>
        </button>
      )}
    </div>
  );
}
