export interface UIComponent {
  id: string;
  name: string;
  description: string;
  category: 'cards' | 'buttons' | 'links' | 'grids';
  html: string;
}

export const INITIAL_COMPONENTS: UIComponent[] = [
  // ==================== CARDS (20 items) ====================
  {
    id: "card-neon-glass",
    name: "Tarjeta de Vidrio de Neón",
    description: "Una tarjeta ultra moderna con efecto esmerilado (glassmorphism), borde brillante interactivo y brillo de neón cian al pasar el cursor.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between">
  <div class="absolute -top-10 -right-10 -z-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/20"></div>
  <div>
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30">
      <span class="text-xl font-bold">★</span>
    </div>
    <h3 class="font-sans text-lg font-semibold text-slate-100 transition-colors duration-300 group-hover:text-cyan-400">Procesamiento Neural</h3>
    <p class="mt-2 text-sm leading-relaxed text-slate-400">Núcleos cuánticos integrados listos para análisis heurístico en tiempo real con latencia menor a 1ms.</p>
  </div>
  <div class="mt-6 flex items-center justify-between border-t border-slate-900 pt-4">
    <span class="font-mono text-[10px] text-cyan-500 bg-cyan-500/5 px-2.5 py-1 rounded-full border border-cyan-500/10">v2.5 Active</span>
    <span class="text-xs font-semibold text-slate-300 group-hover:text-cyan-400 cursor-pointer">Monitorear →</span>
  </div>
</div>`
  },
  {
    id: "card-hologram-stats",
    name: "Tarjeta de Estadísticas Holográficas",
    description: "Perfecta para dashboards analíticos. Cuenta con porcentajes destacados en gradiente violeta y elementos de datos alineados con precisión mono.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-500 hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.1)]">
  <div class="flex items-start justify-between">
    <div>
      <p class="font-mono text-xs uppercase tracking-wider text-slate-500">Recurso de Red</p>
      <h3 class="font-sans mt-1 text-2xl font-bold text-slate-100 group-hover:text-violet-400">Ancho de Banda</h3>
    </div>
    <span class="text-xl text-violet-400 bg-violet-400/10 p-2 rounded-lg">📊</span>
  </div>
  <div class="my-6">
    <div class="flex items-baseline gap-2">
      <span class="text-3xl font-extrabold text-white">94.8</span>
      <span class="text-sm font-semibold text-violet-400">GB/s</span>
    </div>
    <div class="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
      <div class="h-full w-4/5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 group-hover:w-[94.8%]"></div>
    </div>
  </div>
  <div class="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 font-mono text-xs">
    <div>
      <span class="text-slate-500 block">Eficiencia</span>
      <span class="text-emerald-400 mt-0.5 block font-medium">▲ +12.4%</span>
    </div>
    <div>
      <span class="text-slate-500 block">Estado</span>
      <span class="text-slate-300 mt-0.5 block font-medium">ÓPTIMO</span>
    </div>
  </div>
</div>`
  },
  {
    id: "card-nft-glowing",
    name: "Tarjeta de Coleccionable Futurista",
    description: "Una tarjeta con imagen de fondo conceptualizada, precio en criptomonedas, indicador de oferta viva y botón moderno de compra.",
    category: "cards",
    html: `<div class="group w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 p-4 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]">
  <div class="relative h-44 w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-[#13112b] to-[#121c2c] flex items-center justify-center border border-slate-850">
    <div class="absolute inset-0 bg-radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)"></div>
    <span class="text-4xl group-hover:scale-110 transition-transform">💎</span>
    <div class="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
      ● Oferta Activa
    </div>
  </div>
  <div class="mt-4 px-1">
    <div class="flex items-center justify-between text-xs text-slate-500 font-mono">
      <span>Colección Cypher</span>
      <span>#0959</span>
    </div>
    <h3 class="font-sans font-semibold text-white mt-1 text-base group-hover:text-amber-400 transition-colors">Neo-Lumen Fractal Shell</h3>
    <div class="flex items-center justify-between bg-slate-900/60 rounded-xl p-3 mt-4 border border-slate-800/40">
      <div>
        <span class="text-[10px] text-slate-500 font-mono block">Precio Actual</span>
        <span class="text-sm font-bold text-slate-200">1.84 ETH</span>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-slate-500 font-mono block">Límite</span>
        <span class="text-xs font-semibold text-slate-200">02h 14m</span>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "card-profile-cyber",
    name: "Perfil Profesional Encriptado",
    description: "Una tarjeta personal de perfil con indicadores de estado en línea de color neon violeta, detalles de rango y contador de logros.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900/60 p-6 transition-all duration-500 hover:border-violet-500/40">
  <div class="flex items-center gap-4">
    <div class="relative">
      <div class="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 p-[2px]">
        <div class="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-slate-300 font-bold">
          AM
        </div>
      </div>
      <span class="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
    </div>
    <div>
      <h3 class="font-sans text-base font-bold text-white">Alex Morgan</h3>
      <p class="text-xs text-violet-400 font-mono">@system_architect</p>
      <span class="inline-block mt-1 text-[9px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 rounded">LEVEL L5</span>
    </div>
  </div>
  <p class="text-xs text-slate-400 mt-4 leading-relaxed">
    Especialista principal en infraestructuras distribuidas y orquestación masiva redundante en Cloud Run y bases de datos relacionales.
  </p>
</div>`
  },
  {
    id: "card-pricing-premium",
    name: "Tarjeta de Cobro Cloud Pro",
    description: "Ideal para listas de precios elegantes. Bordes definidos, listas de características y botones modernos con efectos interactivos.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-3xl border border-blue-500/35 bg-slate-950 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
  <div>
    <span class="font-mono text-[10px] text-blue-400 font-bold">PLAN EMPRESARIAL</span>
    <div class="flex items-baseline gap-1 mt-3">
      <span class="text-4xl font-extrabold text-white tracking-tight">$89</span>
      <span class="text-xs font-mono text-slate-500">/ mes</span>
    </div>
    <ul class="mt-6 space-y-3 text-xs text-slate-300">
      <li class="flex items-center gap-2">✓ <span class="text-slate-400">Ancho de banda infinito (Red CDN)</span></li>
      <li class="flex items-center gap-2">✓ <span class="text-slate-400">99.99% Garantía de tiempo en línea</span></li>
      <li class="flex items-center gap-2">✓ <span class="text-slate-400">Acceso prioritario a soporte L3</span></li>
    </ul>
  </div>
  <button class="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
    Suscribirse
  </button>
</div>`
  },
  {
    id: "card-weather-dynamic",
    name: "Tarjeta Atmosférica",
    description: "Elegante visualización de condiciones climáticas y ambientales extremas ideal para entornos industriales o de ciencia ficción.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-amber-500/35 transition-all">
  <div class="flex items-center justify-between">
    <span class="font-mono text-[10px] text-slate-400">Estación Gliese VI</span>
    <span class="text-[9px] text-emerald-400 font-mono bg-emerald-500/5 px-1.5 rounded">ONLINE</span>
  </div>
  <div class="my-4">
    <span class="text-4xl font-light text-white">-42.5°C</span>
    <p class="text-xs text-slate-400 mt-1">Tormenta Sílice Ligera</p>
  </div>
  <div class="grid grid-cols-2 gap-2 border-t border-slate-850 pt-3 text-center font-mono text-[10px] text-slate-500">
    <div>Atmósfera: <span class="text-slate-300">940 hPa</span></div>
    <div>Radiación: <span class="text-rose-400">1.2 Sv/h</span></div>
  </div>
</div>`
  },
  {
    id: "card-modern-music",
    name: "Reproductor de Audio Sónico",
    description: "Sleek reproductor minimalista con cover, información de canción y simulación de barra de progreso interactiva.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-5 transition-all duration-300 hover:border-emerald-500/20">
  <div class="flex gap-4 items-center">
    <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
      ♫
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-sm font-bold text-white truncate">Atmosphere Waves</h3>
      <p class="text-xs text-slate-500 truncate mt-0.5">Quantum Ambient Loop</p>
    </div>
  </div>
  <div class="mt-4">
    <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div class="h-full w-1/3 bg-emerald-400 rounded-full"></div>
    </div>
    <div class="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
      <span>01:14</span>
      <span>03:45</span>
    </div>
  </div>
  <div class="flex justify-center gap-4 mt-2 text-slate-400">
    <button class="hover:text-white">◀◀</button>
    <button class="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white flex items-center justify-center text-xs">▶</button>
    <button class="hover:text-white">▶▶</button>
  </div>
</div>`
  },
  {
    id: "card-bento-blog",
    name: "Tarjeta de Blog Bento",
    description: "Un bloque estructurado para artículos o blogs con etiquetas fluorescentes, autor y tiempos de lectura.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900/40 p-5 transition-all hover:border-slate-700/50">
  <span class="inline-block bg-teal-500/10 text-teal-400 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-500/20 font-semibold mb-3">TENDENCIAS UI</span>
  <h4 class="text-base font-bold text-slate-100 group-hover:text-teal-400 transition-colors">Maquetación Bento Grid: El diseño que está redefiniendo la web</h4>
  <p class="text-xs text-slate-400 mt-2 leading-relaxed">Cómo combinar divs asimétricos con Tailwind CSS y flexboxes fluidos para crear interfaces espectaculares.</p>
  <div class="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500 font-mono">
    <span>Lectura: 4 min</span>
    <span>Julio 2026</span>
  </div>
</div>`
  },
  {
    id: "card-crypto-wallet",
    name: "Balance de Cartera Críptica",
    description: "Mapea carteras de DeFi con Sparklines dinámicas de valores de subida y estimación total en dólares.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-5 hover:border-orange-500/30 transition-all">
  <div class="flex justify-between items-start">
    <span class="text-xs text-slate-500 font-mono">Dapp Wallet Balance</span>
    <span class="text-xs font-semibold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">+8.2%</span>
  </div>
  <div class="my-4">
    <span class="text-3xl font-bold text-white font-mono">$12,840.45</span>
    <span class="text-xs text-slate-400 block mt-1">0.342 BTC · 4.88 ETH</span>
  </div>
  <div class="h-8 w-full bg-slate-900/45 rounded-lg flex items-center justify-between px-3 text-xs border border-slate-850">
    <span class="text-slate-500 font-mono">Última Tx:</span>
    <span class="text-slate-300 font-semibold truncate">+0.04 BTC • Completado</span>
  </div>
</div>`
  },
  {
    id: "card-task-progress",
    name: "Ficha de Progreso de Tareas",
    description: "Muestra listado de checklists con porcentajes de cumplimiento circulares y layouts limpios.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900/50 p-5 hover:border-violet-500/20 transition-all">
  <div class="flex justify-between items-center mb-4">
    <h4 class="text-sm font-bold text-white">Objetivos de Sprint</h4>
    <span class="text-[10px] bg-violet-500/10 text-violet-400 font-mono px-2 py-0.5 rounded font-semibold">Semana 12</span>
  </div>
  <div class="space-y-2 text-xs text-slate-300">
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked disabled class="accent-violet-500">
      <span class="line-through text-slate-500">Corregir Middleware de Postgres</span>
    </label>
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked disabled class="accent-violet-500">
      <span class="line-through text-slate-500">Subir 20 ejemplos de cada componente</span>
    </label>
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" disabled class="accent-violet-500">
      <span>Actualizar librerías de Lucide-React</span>
    </label>
  </div>
  <div class="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs font-mono text-slate-500">
    <span>Completado: 66%</span>
    <span class="text-violet-400">Sprint Activo</span>
  </div>
</div>`
  },
  {
    id: "card-ecom-product",
    name: "Ficha de Producto de Tienda",
    description: "Una tarjeta limpia para e-commerce que presenta imágenes estilizadas, valoraciones y botones integrados.",
    category: "cards",
    html: `<div class="group w-full max-w-sm rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-all">
  <div class="h-40 w-full rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center relative">
    <span class="text-4xl group-hover:scale-105 transition-transform">🎧</span>
    <span class="absolute top-2 right-2 bg-rose-500 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold">15% OFF</span>
  </div>
  <div class="mt-3">
    <h3 class="text-sm font-bold text-white">Auriculares Hi-Fi Wireless</h3>
    <p class="text-xs text-slate-500 mt-1">Cancelación de ruido adaptativa, drivers de grafeno.</p>
    <div class="flex items-center justify-between mt-4">
      <span class="text-base font-bold text-white font-mono">$189.00</span>
      <button class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors">Añadir</button>
    </div>
  </div>
</div>`
  },
  {
    id: "card-server-health",
    name: "Estado de Servidor Crítico",
    description: "Con códigos de advertencia visuales, KPIs del núcleo de servidores y destellos de radar repetitivos.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 hover:border-rose-500/40 transition-all">
  <div class="flex items-center justify-between">
    <span class="font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider">Servidor N-01 EXTREMO</span>
    <span class="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
  </div>
  <div class="my-4">
    <span class="text-3xl font-extrabold text-rose-300 font-mono">98°C</span>
    <p class="text-xs text-slate-400 mt-1">Urgente: Temperatura del Core excede límites seguros.</p>
  </div>
  <div class="mt-4 pt-3 border-t border-rose-950/45 flex items-center justify-between text-[11px] text-slate-500 font-mono">
    <span>Carga actual: 95.8%</span>
    <button class="text-rose-400 font-bold hover:underline">Apagar Nodo ✓</button>
  </div>
</div>`
  },
  {
    id: "card-analytics-pie",
    name: "Indicador Circular de Rendimiento",
    description: "Representación pura CSS de un donut de progresión radial con leyendas y métricas.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900/40 p-5 hover:border-cyan-500/20 transition-all">
  <div class="flex justify-between items-center mb-3">
    <span class="text-xs text-slate-400 font-mono">Métricas de Almacenamiento</span>
    <span class="text-xs text-cyan-400 font-semibold font-mono">SSD</span>
  </div>
  <div class="flex items-center gap-6 my-2">
    <div class="relative h-16 w-16 rounded-full border-4 border-slate-850 flex items-center justify-center">
      <div class="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin-slow"></div>
      <span class="text-xs font-bold text-white font-mono">75%</span>
    </div>
    <div class="text-xs space-y-1">
      <div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-cyan-400"></span> <span class="text-slate-300">Espacio Usado</span></div>
      <div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-slate-700"></span> <span class="text-slate-500">Disponible: 250GB</span></div>
    </div>
  </div>
</div>`
  },
  {
    id: "card-feedback-rating",
    name: "Tarjeta de Calificación de Servicio",
    description: "Bloque elegante de feedback del cliente con selector interactivo de estrellas doradas.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-xl border border-slate-850 bg-slate-950 p-5 hover:shadow-lg transition-all">
  <h4 class="text-sm font-bold text-white mb-2">Evalúa la generación de IA</h4>
  <p class="text-xs text-slate-500 leading-relaxed">Tu feedback alimenta directamente nuestra red de entrenamiento neuronal en tiempo real.</p>
  <div class="flex gap-2 my-4 text-xl text-amber-500">
    <span class="cursor-pointer hover:scale-125 transition-transform">★</span>
    <span class="cursor-pointer hover:scale-125 transition-transform">★</span>
    <span class="cursor-pointer hover:scale-125 transition-transform">★</span>
    <span class="cursor-pointer hover:scale-125 transition-transform">★</span>
    <span class="cursor-pointer hover:scale-125 transition-transform text-slate-800">★</span>
  </div>
  <button class="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold">Enviar Valoración</button>
</div>`
  },
  {
    id: "card-flight-ticket",
    name: "Pase de Abordaje Tecnológico",
    description: "Representación física/virtual con líneas de corte marcadas, barcode, hora de embarque y salidas.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between">
  <div class="p-5">
    <div class="flex justify-between items-center text-xs font-mono text-slate-500">
      <span>Orbital Flight</span>
      <span>Vuelo OR-12</span>
    </div>
    <div class="flex justify-between items-center my-4">
      <div>
        <span class="text-2xl font-bold text-white font-mono">MAD</span>
        <span class="text-[10px] text-slate-500 block">Madrid</span>
      </div>
      <span class="text-sm text-cyan-400">✈</span>
      <div class="text-right">
        <span class="text-2xl font-bold text-white font-mono">TKO</span>
        <span class="text-[10px] text-slate-500 block">Tokyo</span>
      </div>
    </div>
  </div>
  <div class="border-t border-dashed border-slate-800 my-1 relative">
    <div class="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-950 border border-slate-800"></div>
    <div class="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-950 border border-slate-800"></div>
  </div>
  <div class="p-5 bg-slate-900/40">
    <div class="flex justify-between items-center font-mono text-xs text-slate-400">
      <span>Asiento: 14A</span>
      <span>Embarque: 12:45</span>
    </div>
    <div class="mt-4 h-6 bg-slate-900 flex items-center justify-around gap-1 px-1 rounded border border-slate-800">
      <span class="w-1 h-full bg-slate-400"></span><span class="w-2 h-full bg-slate-400"></span><span class="w-0.5 h-full bg-slate-400"></span><span class="w-2.5 h-full bg-slate-400"></span>
      <span class="w-1 h-full bg-slate-400"></span><span class="w-2 h-full bg-slate-400"></span><span class="w-0.5 h-full bg-slate-400"></span><span class="w-2.5 h-full bg-slate-400"></span>
    </div>
  </div>
</div>`
  },
  {
    id: "card-interactive-menu",
    name: "Menú Rápido de Configuración",
    description: "Tarjeta de preferencias adaptada para toggles, alertas de sonido, seguridad y redes.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900/60 p-5 hover:border-slate-800 transition-all">
  <h4 class="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4">AJUSTES DE SISTEMA</h4>
  <div class="space-y-3">
    <div class="flex items-center justify-between text-xs text-slate-200">
      <span class="flex items-center gap-2">☀️ Modo Oscuro Autónomo</span>
      <div class="h-5 w-9 rounded-full bg-cyan-400 p-0.5 cursor-pointer flex justify-end items-center transition-colors"><div class="h-4 w-4 rounded-full bg-slate-950"></div></div>
    </div>
    <div class="flex items-center justify-between text-xs text-slate-200">
      <span class="flex items-center gap-2">🔔 Efectos de Sonido Stereo</span>
      <div class="h-5 w-9 rounded-full bg-slate-800 p-0.5 cursor-pointer flex justify-start items-center transition-colors"><div class="h-4 w-4 rounded-full bg-slate-500"></div></div>
    </div>
  </div>
</div>`
  },
  {
    id: "card-notification-toast",
    name: "Mensaje de Respuesta Integrada",
    description: "Sleek card de notificación con imágenes de avatar, botones de archivar y marcar como leídos.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4 flex gap-3 transition-all hover:border-emerald-500/30">
  <span class="text-xl">📩</span>
  <div class="flex-1 min-w-0">
    <h5 class="text-xs font-bold text-white">Base de datos sincronizada</h5>
    <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">El backup programado para Cloud SQL PostgreSQL se ha completado sin errores en la red.</p>
    <div class="flex gap-3 mt-3 text-[10px] uppercase font-mono font-bold">
      <button class="text-emerald-400 hover:underline">Ver Log</button>
      <button class="text-slate-500 hover:text-white">Descartar</button>
    </div>
  </div>
</div>`
  },
  {
    id: "card-user-invite",
    name: "Ficha de Invitación a Equipo",
    description: "Permite gestionar accesos rápidos a colaboradores por medio de listas jerarquizadas.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900/30 p-5 hover:border-slate-850 transition-all">
  <span class="text-[10px] text-slate-500 font-mono block">GESTIÓN DE ACCESOS</span>
  <h4 class="text-sm font-bold text-white mt-1 mb-4">Colaborador Externo</h4>
  <div class="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/50">
    <div class="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">JD</div>
    <div class="flex-1 min-w-0 text-xs">
      <p class="text-slate-200 font-semibold truncate">Juan Delgado</p>
      <p class="text-slate-500 font-mono truncate text-[10px]">juan@postgres.dev</p>
    </div>
  </div>
  <button class="w-full mt-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold py-2 rounded-xl">Otorgar Permiso Directo</button>
</div>`
  },
  {
    id: "card-activity-feed",
    name: "Timeline de Commits de Git",
    description: "Muestra de forma modular los timelines y feeds de actividad de código en repositorios.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-950 p-5 hover:border-slate-800 transition-all">
  <span class="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-4">ACTIVIDAD RECIENTE</span>
  <div class="space-y-4">
    <div class="flex gap-3 items-start relative before:absolute before:left-2 before:top-4 before:bottom-0 before:w-[1px] before:bg-slate-800">
      <span class="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">✓</span>
      <div>
        <p class="text-xs text-slate-300 font-semibold">Integración de pasarela de pago</p>
        <span class="text-[9px] text-slate-500 font-mono">hace 12 min · por @dilgonza</span>
      </div>
    </div>
    <div class="flex gap-3 items-start">
      <span class="h-4 w-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center font-bold">🔧</span>
      <div>
        <p class="text-xs text-slate-300 font-semibold">Nueva configuración en tailwind.config</p>
        <span class="text-[9px] text-slate-500 font-mono">hace 1 hora · por @alexmorgan</span>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "card-payment-form",
    name: "Tarjeta de Crédito Holográfica",
    description: "Una simulación de plástico de cobros con gradientes premium, chip, y efectos de luz esmerilada.",
    category: "cards",
    html: `<div class="group relative w-full max-w-sm rounded-2xl bg-gradient-to-tr from-indigo-900 via-slate-950 to-purple-900 border border-white/15 p-6 shadow-2xl overflow-hidden">
  <div class="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-violet-400/10 blur-3xl pointer-events-none"></div>
  <div class="flex justify-between items-start">
    <div class="text-xs font-mono uppercase text-slate-400">CREDIT CARD TOKEN</div>
    <span class="font-bold text-slate-300">VISA</span>
  </div>
  <div class="my-6">
    <div class="w-10 h-7 rounded bg-amber-500/25 border border-amber-500/40 mb-3"></div>
    <div class="text-xl font-mono text-slate-200 tracking-widest gap-2">••••  ••••  ••••  4892</div>
  </div>
  <div class="flex justify-between items-center text-xs font-mono text-slate-400">
    <div>
      <span class="text-[9px] text-slate-500 block">PROPIETARIO</span>
      <span class="text-slate-300 mt-0.5 block">DILAN GONZALES</span>
    </div>
    <div class="text-right">
      <span class="text-[9px] text-slate-500 block">VENCE</span>
      <span class="text-slate-300 mt-0.5 block">08/29</span>
    </div>
  </div>
</div>`
  },

  // ==================== BUTTONS (20 items) ====================
  {
    id: "button-magnetic-gradient",
    name: "Botón Magnético Fluido",
    description: "Un botón estilizado con un fondo interactivo de gradiente cromado que se expande.",
    category: "buttons",
    html: `<button class="group relative overflow-hidden rounded-xl bg-slate-950 px-6 py-3 text-xs font-bold text-white transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(236,72,153,0.15)] cursor-pointer">
  <span class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity"></span>
  <span class="absolute inset-[1.5px] rounded-[10.5px] bg-slate-950"></span>
  <span class="relative z-10 bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent group-hover:text-white transition-all">
    Iniciar Experiencia →
  </span>
</button>`
  },
  {
    id: "button-cyberpunk-bracket",
    name: "Botón Cyberpunk Técnico",
    description: "Botón de fuerte caracter técnico militar con recuadros angulares y parpadeos en color esmeralda.",
    category: "buttons",
    html: `<button class="group relative border-l-4 border-emerald-500 bg-slate-900 px-5 py-2.5 text-left font-mono transition-all hover:ring-1 hover:ring-emerald-500/50 w-52 cursor-pointer">
  <div class="text-[8px] uppercase tracking-widest text-emerald-500">Confirmar Enlace</div>
  <div class="text-xs font-bold text-slate-100 tracking-wider">CONFIGURAR NODO</div>
</button>`
  },
  {
    id: "button-glass-glow",
    name: "Botón Esmerilado de Doble Resplandor",
    description: "Retro glass styling con un gradiente interior azul y efectos esmerilados limpios.",
    category: "buttons",
    html: `<button class="group relative px-5 py-2.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all text-xs font-semibold cursor-pointer">
  ✦ Localizar Sonda
</button>`
  },
  {
    id: "button-shimmer-gold",
    name: "Botón Dorado Shimmer",
    description: "Con reflejos dorados y gradientes ámbar elegantes para suscripciones VIP.",
    category: "buttons",
    html: `<button class="group relative overflow-hidden px-5 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold tracking-widest uppercase hover:border-amber-400 transition-all cursor-pointer">
  ⚡ Acceso Diamante
</button>`
  },
  {
    id: "button-retro-3d",
    name: "Botón de Comando 3D Arcade",
    description: "Una simulación de botón físico retro que se hunde al hacer clic y tiene sombra rígida.",
    category: "buttons",
    html: `<button class="group relative bg-[#1c223c] border-2 border-slate-700 text-slate-100 font-mono text-xs px-4 py-2.5 rounded-lg active:translate-y-1 transition-all shadow-[0_4px_0_#0f1322] active:shadow-none font-bold uppercase cursor-pointer">
  🎮 Comenzar Ronda
</button>`
  },
  {
    id: "button-pulse-radar",
    name: "Botón Alerta Radar Pulsante",
    description: "Un botón estilizado circular compuesto de radar rojo para acciones de detención.",
    category: "buttons",
    html: `<button class="group relative h-10 w-10 rounded-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-400 flex items-center justify-center transition-all cursor-pointer">
  <span class="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"></span>
  ✖
</button>`
  },
  {
    id: "button-nebula-loading",
    name: "Botón de Descarga Nebulosa",
    description: "Gradiente fucsia y violeta interactivo que emula barra de progreso.",
    category: "buttons",
    html: `<button class="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] transition-all cursor-pointer">
  📥 Descargar Archivo (64 MB)
</button>`
  },
  {
    id: "button-liquid-hover",
    name: "Botón Efecto Líquido",
    description: "Espande ondas de color menta desde su centro al pasar el ratón.",
    category: "buttons",
    html: `<button class="group relative overflow-hidden px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold uppercase transition-all hover:text-slate-950 hover:bg-emerald-400 cursor-pointer">
  Iniciar Transmisión
</button>`
  },
  {
    id: "button-icon-expand",
    name: "Botón Expandible de Perfil",
    description: "Pequeño botón icon que despliega un campo de texto con transiciones cuidadas.",
    category: "buttons",
    html: `<button class="group relative inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full p-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
  👤 <span class="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out">Ver Perfil Alex</span>
</button>`
  },
  {
    id: "button-neomorphism",
    name: "Botón Neomórfico Clásico",
    description: "Relieve suave biselado con sombras dobles que marcan estados de pulsación física.",
    category: "buttons",
    html: `<button class="group px-6 py-3 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold shadow-[4px_4px_10px_#05070f,-4px_-4px_10px_#1d213a] active:shadow-[inset_2px_2px_5px_#05070f,inset_-2px_-2px_5px_#1d213a] transition-all cursor-pointer">
  Pulsador Neumático
</button>`
  },
  {
    id: "button-double-border",
    name: "Botón de Doble Borde Técnico",
    description: "Doble delineado preciso para interfaces de control de redes o seguridad.",
    category: "buttons",
    html: `<button class="group relative px-6 py-2 rounded border border-cyan-500/20 text-cyan-400 bg-slate-950 font-mono text-xs uppercase hover:bg-cyan-500/5 hover:border-cyan-400 transition-all cursor-pointer">
  <span class="absolute inset-[2px] border border-cyan-500/10 pointer-events-none"></span>
  Ver Seguridad v4
</button>`
  },
  {
    id: "button-swipe-background",
    name: "Botón Barrido de Color",
    description: "Saturación esmerilada que viaja de izquierda a derecha en hover.",
    category: "buttons",
    html: `<button class="group relative overflow-hidden px-5 py-2.5 rounded-lg border border-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer">
  <span class="absolute inset-0 bg-violet-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
  <span class="relative z-10 group-hover:text-white">Generar Tokens XML</span>
</button>`
  },
  {
    id: "button-tag-selector",
    name: "Insignia de Activación Rápida",
    description: "Filtro compacto con check integrado dinámicamente en hover.",
    category: "buttons",
    html: `<button class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium cursor-pointer">
  ● <span class="text-slate-400">PostgreSQL</span>
</button>`
  },
  {
    id: "button-success-checkmark",
    name: "Botón Sólido de Competición",
    description: "Color verde vibrante con sombras para canjes de cupones exitosos.",
    category: "buttons",
    html: `<button class="group px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wider hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
  ✔ Canjear Código Gratuito
</button>`
  },
  {
    id: "button-skew-action",
    name: "Botón de Acción Inclinado",
    description: "Estética deportiva con división angular en inclinación de rombo.",
    category: "buttons",
    html: `<button class="group relative -skew-x-12 overflow-hidden border border-cyan-500 bg-cyan-950/20 text-cyan-400 px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 hover:text-slate-950 transition-all cursor-pointer">
  <span class="skew-x-12 block">Conectar Sonda Espacial</span>
</button>`
  },
  {
    id: "button-glowing-neon-strip",
    name: "Botón con Anillo Periférico",
    description: "Luz de filamento activo que circula por la coordenada final del componente.",
    category: "buttons",
    html: `<button class="group relative px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500 text-slate-300 text-xs font-bold tracking-wide hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all cursor-pointer">
  Cerrar Todos Los Puertos
</button>`
  },
  {
    id: "button-pill-outline",
    name: "Botón Píldora Gradiente",
    description: "Píldora minimalista de alta gama que posee gradiente de texto.",
    category: "buttons",
    html: `<button class="group rounded-full border border-violet-500/40 hover:border-violet-400 p-[1px] bg-slate-950 cursor-pointer">
  <div class="rounded-full bg-slate-950 px-5 py-2 text-xs font-bold text-violet-400 hover:text-white transition-colors">
    Ver Pipeline AI
  </div>
</button>`
  },
  {
    id: "button-mac-window",
    name: "Control Tríada de Cabecera",
    description: "Grupo de mini-botones de ventana estilo MacOS con hover interactivo.",
    category: "buttons",
    html: `<div class="flex gap-1.5">
  <span class="h-3 w-3 rounded-full bg-rose-500 cursor-pointer hover:bg-rose-400" title="Cerrar"></span>
  <span class="h-3 w-3 rounded-full bg-amber-500 cursor-pointer hover:bg-amber-400" title="Minimizar"></span>
  <span class="h-3 w-3 rounded-full bg-emerald-500 cursor-pointer hover:bg-emerald-400" title="Maximizar"></span>
</div>`
  },
  {
    id: "button-matrix-binary",
    name: "Botón de Matriz Binaria",
    description: "Letras de terminal verde cayendo en el fondo de un botón táctico.",
    category: "buttons",
    html: `<button class="group relative px-5 py-2.5 bg-slate-950 border border-emerald-500/30 font-mono text-emerald-400 text-xs uppercase hover:bg-emerald-950/20 transition-colors cursor-pointer">
  10110 COMMITS DE DATOS
</button>`
  },
  {
    id: "button-retro-cyber-yellow",
    name: "Botón de Advertencia de Red",
    description: "Botón de acción pesado con barras de peligro negro y amarillo.",
    category: "buttons",
    html: `<button class="group relative overflow-hidden bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase px-6 py-3 border border-slate-900 transition-all duration-300 hover:scale-[1.03] cursor-pointer">
  ⚠️ ACCEDER BAJO TU RIESGO
</button>`
  },

  // ==================== LINKS (20 items) ====================
  {
    id: "link-glow-bar",
    name: "Enlace con Barra de Resplandor",
    description: "Un enlace interactivo minimalista que incluye subrayado expansivo elástico.",
    category: "links",
    html: `<a href="#" class="group relative inline-flex items-center gap-2 py-1 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-mono">
  <span>Explorar Red de Datos</span>
  <span class="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-cyan-400 transition-all group-hover:w-full shadow-[0_0_8px_#22d3ee]"></span>
</a>`
  },
  {
    id: "link-arrow-spacing",
    name: "Enlace con Tracking de Flecha",
    description: "Estilo elegante que altera el tracking del texto al aproximar el puntero.",
    category: "links",
    html: `<a href="#" class="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-white transition-all">
  <span>DOCUMENTACIÓN CENTRAL</span>
  <span class="text-slate-500 group-hover:translate-x-2 transition-transform">→</span>
</a>`
  },
  {
    id: "link-under-wave",
    name: "Enlace con Indicador Deslizante",
    description: "Posee una esfera de estado fucsia que viaja de izquierda a derecha.",
    category: "links",
    html: `<a href="#" class="group relative inline-flex items-center gap-2 py-1 text-slate-400 hover:text-fuchsia-400 transition-colors text-xs uppercase tracking-widest font-mono">
  <span class="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-fuchsia-500 transition-colors"></span>
  <span>Consultar API</span>
</a>`
  },
  {
    id: "link-matrix-style",
    name: "Enlace Encriptado de Brackets",
    description: "Muestra corchetes de terminal Linux en hover sobre el texto central.",
    category: "links",
    html: `<a href="#" class="group font-mono text-xs text-emerald-500 hover:text-emerald-400 transition-all flex items-center gap-0.5">
  <span class="text-emerald-600 group-hover:-translate-x-1 transition-transform">[</span>
  <span class="font-semibold text-slate-300 text-[11px]">COMPILAR FUENTE</span>
  <span class="text-emerald-600 group-hover:translate-x-1 transition-transform">]</span>
</a>`
  },
  {
    id: "link-social-float",
    name: "Enlace de Perfil Social",
    description: "Un enlace circular compacto para accesos directos de redes externas.",
    category: "links",
    html: `<a href="#" class="group inline-flex h-8 items-center gap-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]">
  <span>🐱 GitHub repositorio</span>
</a>`
  },
  {
    id: "link-telemetry-status",
    name: "Enlace de Telemetría",
    description: "Enlace horizontal para logs con de puntos reflectores del estado del sistema.",
    category: "links",
    html: `<a href="#" class="group flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
  <div class="h-1.5 w-1.5 rounded-full bg-cyan-500/20 group-hover:bg-cyan-400 transition-all"></div>
  <span>Descargar Registros en formato JSON</span>
</a>`
  },
  {
    id: "link-double-underline",
    name: "Enlace Doble Subrayado Cruzado",
    description: "Efecto geométrico con dos finas líneas que entran de forma alternada.",
    category: "links",
    html: `<a href="#" class="group relative py-1 text-xs text-slate-300 hover:text-violet-400 transition-colors">
  <span class="absolute top-0 right-0 h-[1px] w-0 bg-violet-400 transition-all group-hover:w-full"></span>
  <span>Consultar Servidores Redundantes</span>
  <span class="absolute bottom-0 left-0 h-[1px] w-0 bg-violet-400 transition-all group-hover:w-full"></span>
</a>`
  },
  {
    id: "link-reveal-icon",
    name: "Enlace de Revelado de Icono",
    description: "Pequeño hashtag que entra en escena empujando delicadamente las palabras.",
    category: "links",
    html: `<a href="#" class="group flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100 transition-all">
  <span class="text-fuchsia-500 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all text-[10px]">#</span>
  <span>Integrar Firestore CDN</span>
</a>`
  },
  {
    id: "link-slash-divider",
    name: "Enlace Separado Diagonal",
    description: "Sección modular con barras de corte transversales para listados de menú.",
    category: "links",
    html: `<div class="flex items-center gap-2 text-xs text-slate-500 font-mono">
  <a href="#" class="text-indigo-400 hover:underline">Base</a>
  <span>/</span>
  <a href="#" class="text-slate-300 hover:text-slate-100">Configuración</a>
</div>`
  },
  {
    id: "link-text-shimmer",
    name: "Enlace Dorado de Seda",
    description: "Texto que emite un reflejo plateado o ámbar de forma continua.",
    category: "links",
    html: `<a href="#" class="group text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-300 transition-all decoration-amber-500/30 underline underline-offset-4">
  ★ Canjear Cuenta Premium
</a>`
  },
  {
    id: "link-glow-pill",
    name: "Acceso Íntimo Tipo Píldora",
    description: "Píldora delgada indicadora de actualizaciones críticas.",
    category: "links",
    html: `<a href="#" class="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 hover:border-violet-400 font-mono text-[10px] text-violet-300 transition-all">
  Deploy Disponible v4.2.1
</a>`
  },
  {
    id: "link-breadcrumb",
    name: "Navegación Migas de Pan",
    description: "Histórico de carpetas del explorador con estados activos bien definidos.",
    category: "links",
    html: `<div class="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
  <a href="#" class="hover:text-slate-300">workspace</a>
  <span>›</span>
  <a href="#" class="hover:text-slate-300">src</a>
  <span>›</span>
  <span class="text-cyan-400">initialComponents.ts</span>
</div>`
  },
  {
    id: "link-vertical-tab",
    name: "Ficha de Enlace de Menú Lateral",
    description: "Línea lateral que viaja indicando el apartado activo de configuración.",
    category: "links",
    html: `<a href="#" class="group flex items-center gap-3 border-l-2 border-cyan-400 pl-3 py-1 text-slate-100 hover:text-white text-xs font-semibold">
  <span>Monitorear Clústers</span>
</a>`
  },
  {
    id: "link-sound-feedback",
    name: "Enlace Audiofrecuencial",
    description: "Lleva barras animadas que simulan reproducción de loops melódicos.",
    category: "links",
    html: `<a href="#" class="group flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
  <span>♫ Escuchar Preview de Voz</span>
  <div class="flex gap-0.5 items-end h-3">
    <span class="w-[1.5px] h-2 bg-slate-600 group-hover:h-3 transition-all duration-300"></span>
    <span class="w-[1.5px] h-3 bg-slate-600 group-hover:h-1 transition-all duration-300"></span>
    <span class="w-[1.5px] h-1.5 bg-slate-600 group-hover:h-2.5 transition-all duration-300"></span>
  </div>
</a>`
  },
  {
    id: "link-external-globe",
    name: "Enlace Encriptado de Servidores",
    description: "Emula redirección IP para acceso directo a bases de datos relacionales.",
    category: "links",
    html: `<a href="#" class="group text-xs text-slate-400 hover:text-cyan-300 transition-all font-mono">
  🌐 Acceder Servidor Oregon: <span class="underline text-slate-500 group-hover:text-cyan-400">192.168.1.1</span>
</a>`
  },
  {
    id: "link-cyber-terminal-alert",
    name: "Enlace Cursor Intermitente",
    description: "Posee una barra baja de cursor de comandos de terminal Linux.",
    category: "links",
    html: `<a href="#" class="font-mono text-xs text-emerald-400 hover:text-emerald-300">
  $ cat env.example <span class="animate-pulse font-black">_</span>
</a>`
  },
  {
    id: "link-blurred-hover",
    name: "Enlace Desenfoque Dinámico",
    description: "Comienza blurreado, pero adquiere total nitidez en hover.",
    category: "links",
    html: `<a href="#" class="text-xs text-slate-400 blur-[1px] hover:blur-none transition-all duration-300">
  Ver contraseña encriptada SHA256
</a>`
  },
  {
    id: "link-flip-text",
    name: "Enlace de Texto Pivot",
    description: "Efecto hover que inclina levemente la estructura tipográfica de la frase.",
    category: "links",
    html: `<a href="#" class="group font-sans text-xs font-bold text-slate-400 hover:text-white transition-all inline-block hover:-rotate-1">
  Girar Parámetros Cognitivos
</a>`
  },
  {
    id: "link-bubble-indicator",
    name: "Enlace con Contador de Mensajes",
    description: "Insignia compacta de globos para chats o notificaciones pendientes.",
    category: "links",
    html: `<a href="#" class="group flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100">
  <span>Soporte Técnico Especializado</span>
  <span class="bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 rounded-full select-none">3</span>
</a>`
  },
  {
    id: "link-neon-strikeout",
    name: "Enlace con Tachado Activo",
    description: "Carga una línea central que anula ítems temporales en listas.",
    category: "links",
    html: `<a href="#" class="group relative text-xs text-slate-400 hover:text-slate-500 transition-colors">
  <span>Middleware deprecado (v3.0)</span>
  <span class="absolute left-0 top-1/2 w-0 h-[1.5px] bg-rose-500 transition-all group-hover:w-full"></span>
</a>`
  },

  // ==================== GRIDS (20 items) ====================
  {
    id: "grid-bento-dashboard",
    name: "Cuadrícula Bento Dashboard",
    description: "Elegante sistema modular Bento Grid compuesto por tres tarjetas complementarias.",
    category: "grids",
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
  <div class="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
    <span class="text-[9px] text-cyan-400 font-mono">Nivel de Rendimiento</span>
    <h4 class="text-sm font-bold text-slate-200 mt-1">Consola de Estado General</h4>
    <div class="h-2 w-full bg-slate-800 rounded-full mt-4 overflow-hidden"><div class="h-full w-4/5 bg-cyan-400 rounded-full"></div></div>
  </div>
  <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
    <span class="text-[9px] text-rose-400 font-mono">Alertas</span>
    <p class="text-xs font-bold text-slate-200 mt-2">12 Puertos Inseguros</p>
    <span class="text-[9px] text-slate-500 block mt-4">Urgente</span>
  </div>
</div>`
  },
  {
    id: "grid-feature-split",
    name: "Sección de Canales de Integración",
    description: "Sección asimétrica limpia para describir paso a paso procesos secuenciales de bases de datos.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/40 flex gap-3">
    <span class="font-mono text-cyan-400 text-sm font-bold">01</span>
    <div>
      <h5 class="text-xs font-bold text-white">Declarar Variables</h5>
      <p class="text-[11px] text-slate-400 mt-1">Inserta los tokens dentro de .env.example.</p>
    </div>
  </div>
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/40 flex gap-3">
    <span class="font-mono text-cyan-400 text-sm font-bold">02</span>
    <div>
      <h5 class="text-xs font-bold text-white">Llamar Modelos</h5>
      <p class="text-[11px] text-slate-400 mt-1">Ejecuta peticiones seguras server-side.</p>
    </div>
  </div>
</div>`
  },
  {
    id: "grid-stats-trio",
    name: "Bloque de Estado Tríada",
    description: "Muestra de forma compacta y veloz tres indicadores claves para servidores en la nube.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
  <div class="p-3 rounded-lg border border-slate-850 bg-slate-950 text-center">
    <span class="text-[9px] text-slate-500 block">CPU</span>
    <span class="text-sm font-bold text-white mt-1 block">42.2%</span>
  </div>
  <div class="p-3 rounded-lg border border-slate-850 bg-slate-950 text-center">
    <span class="text-[9px] text-slate-500 block">LATENCIA</span>
    <span class="text-sm font-bold text-emerald-400 mt-1 block">14 ms</span>
  </div>
  <div class="p-3 rounded-lg border border-slate-850 bg-slate-950 text-center">
    <span class="text-[9px] text-slate-500 block">TRAFFIC</span>
    <span class="text-sm font-bold text-white mt-1 block">4.2k/s</span>
  </div>
</div>`
  },
  {
    id: "grid-bento-pricing",
    name: "Tablero Bento de Suscripciones",
    description: "Organiza planes de negocio y opciones de compra o precios en la nube.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/20">
    <h5 class="text-xs font-mono text-slate-400">Gratuito</h5>
    <p class="text-lg font-bold text-white mt-2">$0</p>
  </div>
  <div class="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10">
    <h5 class="text-xs font-mono text-indigo-400">Developer</h5>
    <p class="text-lg font-bold text-white mt-2">$19</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/20">
    <h5 class="text-xs font-mono text-slate-400">Empresa</h5>
    <p class="text-lg font-bold text-white mt-2">$89</p>
  </div>
</div>`
  },
  {
    id: "grid-database-tabs",
    name: "Estado de Nodos de Bases de Datos",
    description: "Sincronizador visual de bases de datos relacionales SQL con PostgreSQL y Redis cache.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
  <div class="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-950/5 flex items-center justify-between">
    <span class="text-xs font-mono text-slate-200">POSTGRESQL_PRIMARY</span>
    <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
  </div>
  <div class="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
    <span class="text-xs font-mono text-slate-400">REDIS_TEMPORAL</span>
    <span class="h-2 w-2 rounded-full bg-yellow-500"></span>
  </div>
</div>`
  },
  {
    id: "grid-gallery-hover",
    name: "Galería de Medios Asimétrica",
    description: "Ideal para portafolios interactivos con imágenes representadas en gradientes de color.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
  <div class="h-24 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-950 hover:opacity-80 transition-opacity"></div>
  <div class="h-24 rounded-lg bg-gradient-to-tr from-slate-900 to-fuchsia-950 hover:opacity-80 transition-opacity"></div>
  <div class="h-24 rounded-lg bg-gradient-to-tr from-slate-900 to-emerald-950 hover:opacity-80 transition-opacity"></div>
</div>`
  },
  {
    id: "grid-bento-devices",
    name: "Tablero de Dispositivos Conectados",
    description: "Tablero de control para monitorizar laptops, smart TVs, y móviles autenticados.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
  <div class="p-3 rounded-xl border border-slate-850 bg-slate-900/50 flex justify-between items-center text-xs">
    <span>💻 MacBook Pro Alex</span>
    <span class="text-[10px] text-cyan-400 font-mono">Activo</span>
  </div>
  <div class="p-3 rounded-xl border border-slate-850 bg-slate-900/50 flex justify-between items-center text-xs">
    <span>📱 iPhone 15 Smart</span>
    <span class="text-[10px] text-slate-500 font-mono">Suspendido</span>
  </div>
</div>`
  },
  {
    id: "grid-team-members",
    name: "Cuadrícula de Equipo Profesional",
    description: "Asigna avatares y funciones de manera limpia para perfiles colaboracionales.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
  <div class="p-3 rounded-xl border border-slate-850 bg-slate-950 flex items-center gap-3">
    <div class="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center font-bold">AM</div>
    <div>
      <h5 class="text-xs font-bold text-white">Alex Morgan</h5>
      <span class="text-[9px] text-slate-500">Backend L5</span>
    </div>
  </div>
  <div class="p-3 rounded-xl border border-slate-850 bg-slate-950 flex items-center gap-3">
    <div class="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">DG</div>
    <div>
      <h5 class="text-xs font-bold text-white">Dilan G.</h5>
      <span class="text-[9px] text-slate-500">Frontend Dev</span>
    </div>
  </div>
</div>`
  },
  {
    id: "grid-kanban-board",
    name: "Organizador Kanban Compacto",
    description: "Cuadrícula secuencial To-Do, In Progress y Done de arrastre simulado.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
  <div class="p-3 rounded-xl bg-slate-900/30 border border-slate-850">
    <span class="text-[10px] font-mono text-slate-500">PENDIENTES (1)</span>
    <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-900 text-xs text-slate-300 mt-2">Revisar schemas Postgres</div>
  </div>
  <div class="p-3 rounded-xl bg-slate-900/30 border border-slate-850">
    <span class="text-[10px] font-mono text-indigo-400">EN PROGRESO</span>
    <div class="p-2.5 rounded-lg bg-slate-950 border border-indigo-500/10 text-xs text-slate-300 mt-2">Subir 20 ejemplos UI</div>
  </div>
  <div class="p-3 rounded-xl bg-slate-900/30 border border-slate-850">
    <span class="text-[10px] font-mono text-emerald-400">COMPLETADO</span>
    <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-900 text-xs text-slate-500 line-through mt-2">Instalar npm tailwind</div>
  </div>
</div>`
  },
  {
    id: "grid-bento-calendar",
    name: "Calendario Bento Semanal",
    description: "Listado de citas ordenadas de acuerdo al huso horario de operaciones.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
  <div class="p-3 rounded bg-slate-950 border border-slate-850 text-center">
    <span class="text-[9px] text-slate-500 block font-mono">LUN</span>
    <span class="text-xs font-bold text-cyan-400">Sincronizar</span>
  </div>
  <div class="p-3 rounded bg-slate-950 border border-slate-850 text-center">
    <span class="text-[9px] text-slate-500 block font-mono">MAR</span>
    <span class="text-xs font-bold text-slate-600">Libre</span>
  </div>
  <div class="p-3 rounded bg-slate-950 border border-slate-850 text-center">
    <span class="text-[9px] text-slate-500 block font-mono">MIÉ</span>
    <span class="text-xs font-bold text-violet-400">Sprint MVP</span>
  </div>
  <div class="p-3 rounded bg-slate-950 border border-slate-850 text-center">
    <span class="text-[9px] text-slate-500 block font-mono">JUE</span>
    <span class="text-xs font-bold text-slate-600">Libre</span>
  </div>
</div>`
  },
  {
    id: "grid-saas-features",
    name: "Características de Alta Tecnología",
    description: "3 paneles elegantes para detallar beneficios, APIs o infraestructura del software.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/10">
    <span class="text-xl">🚀</span>
    <h5 class="text-xs font-bold text-white mt-1">Velocidad Extrema</h5>
    <p class="text-[10px] text-slate-500 mt-1">HMR apagado por estabilidad y build unificado.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/10">
    <span class="text-xl">🔒</span>
    <h5 class="text-xs font-bold text-white mt-1">Seguridad Integrada</h5>
    <p class="text-[10px] text-slate-500 mt-1">Pila server-side con Google Gemini API seguro.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-850 bg-slate-900/10">
    <span class="text-xl">📊</span>
    <h5 class="text-xs font-bold text-white mt-1">Consola Remota</h5>
    <p class="text-[10px] text-slate-500 mt-1">Métricas y logs con exportación limpia local.</p>
  </div>
</div>`
  },
  {
    id: "grid-bento-music",
    name: "Módulo Bento de Álbumes de Audio",
    description: "Perfecto para catalogar pistas de audio o playlists con visuales de alta resolución.",
    category: "grids",
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
  <div class="md:col-span-2 h-20 rounded-xl bg-gradient-to-r from-[#1c123c] to-indigo-950 border border-slate-800 p-4 flex items-center justify-between">
    <div>
      <h5 class="text-xs font-bold text-white">Quantum Synth Chill</h5>
      <span class="text-[10px] text-slate-400">12 Canciones · Loops infinitos</span>
    </div>
    <span class="text-xl">📻</span>
  </div>
  <div class="h-20 rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-center text-xs">
    ★ Favoritos
  </div>
</div>`
  },
  {
    id: "grid-metrics-comparison",
    name: "Matriz Comparativa de Servidores",
    description: "Tabla estructurada para comparar parámetros, hardware y límites en Cloud Run.",
    category: "grids",
    html: `<div class="grid grid-cols-3 gap-2 w-full text-center text-[10px] font-mono text-slate-400">
  <div class="p-2 border-b border-slate-800">Parámetro</div>
  <div class="p-2 border-b border-slate-800 text-cyan-400">Standard</div>
  <div class="p-2 border-b border-slate-800 text-violet-400">Ultra Pro</div>
  
  <div class="p-2 border-b border-slate-900">vCPU Cores</div>
  <div class="p-2 border-b border-slate-900">1 Core</div>
  <div class="p-2 border-b border-slate-900 text-white font-bold">4 Cores</div>
</div>`
  },
  {
    id: "grid-timeline-horizontal",
    name: "Timeline Horizontal de Lanzamientos",
    description: "Ideal para planificar y estructurar fechas claves de entregas de productos.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full relative before:absolute before:left-0 before:right-0 before:top-1/2 before:h-[1px] before:bg-slate-800 before:hidden sm:before:block">
  <div class="p-3 bg-slate-950 border border-slate-900 rounded-lg relative z-10">
    <span class="text-[10px] text-cyan-400 font-mono">Q1 2026</span>
    <h6 class="text-xs font-bold text-white mt-0.5">Diseño de Playground</h6>
  </div>
  <div class="p-3 bg-slate-950 border border-slate-900 rounded-lg relative z-10">
    <span class="text-[10px] text-cyan-400 font-mono">Q2 2026</span>
    <h6 class="text-xs font-bold text-white mt-0.5">Soporte Tailwind v4.0</h6>
  </div>
  <div class="p-3 bg-slate-950 border border-slate-900 rounded-lg relative z-10">
    <span class="text-[10px] text-emerald-400 font-mono">Q3 2026</span>
    <h6 class="text-xs font-bold text-white mt-0.5">Lanzamiento Estable</h6>
  </div>
</div>`
  },
  {
    id: "grid-bento-newsletter",
    name: "Bento Formulario de Suscripción",
    description: "Módulo para newsletter y contactos dividido en tres contenedores adaptativos.",
    category: "grids",
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
  <div class="md:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
    <h5 class="text-xs font-bold text-white">Suscríbete a Boletines UI</h5>
    <input type="email" placeholder="email@postgres.dev" class="w-full bg-slate-950 border border-slate-850 p-2 text-xs rounded-lg text-slate-200 focus:outline-none mt-2">
  </div>
  <div class="p-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-slate-950 font-sans font-bold text-xs flex items-center justify-center cursor-pointer transition-colors text-center text-white">
    Suscribirse Ahora
  </div>
</div>`
  },
  {
    id: "grid-file-explorer",
    name: "Vista previa de Archivos",
    description: "Emula un administrador de carpetas distribuidas para estructurar proyectos.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full font-mono text-xs">
  <div class="p-2.5 rounded bg-slate-900/50 hover:bg-slate-900 flex items-center justify-between cursor-pointer">
    <span>📂 src / db / schemas</span>
    <span class="text-[10px] text-slate-500">Folder</span>
  </div>
  <div class="p-2.5 rounded bg-slate-905/50 hover:bg-slate-900 flex items-center justify-between cursor-pointer border border-dashed border-slate-850">
    <span>📄 env.example</span>
    <span class="text-[10px] text-cyan-400 font-bold">240 B</span>
  </div>
</div>`
  },
  {
    id: "grid-bento-weather-cities",
    name: "Climatología Regional",
    description: "Muestra de un vistazo las temperaturas operativas de tres ciudades.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
  <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-850">
    <span class="text-[9px] text-slate-500 font-mono">NEW YORK</span>
    <span class="text-base font-bold text-white block mt-1">14°C</span>
  </div>
  <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-850">
    <span class="text-[9px] text-slate-500 font-mono">MADRID</span>
    <span class="text-base font-bold text-amber-400 block mt-1">28°C</span>
  </div>
  <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-850">
    <span class="text-[9px] text-slate-500 font-mono">TOKYO</span>
    <span class="text-base font-bold text-white block mt-1">19°C</span>
  </div>
</div>`
  },
  {
    id: "grid-shopping-cart",
    name: "Resumen de Carrito",
    description: "Estructura simplificada para checkout, listado de compras y sumatorio total.",
    category: "grids",
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
  <div class="md:col-span-2 p-4 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
    <span>🎧 Auriculares Hi-Fi Wireless x1</span>
    <span class="font-bold text-white">$189.00</span>
  </div>
  <div class="p-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-mono text-center rounded-xl flex flex-col justify-center">
    <span class="text-[9px] text-slate-400">Total Checkout</span>
    <span class="text-base font-bold text-white">$189.00</span>
  </div>
</div>`
  },
  {
    id: "grid-bento-security",
    name: "Auditoría de Red Redundante",
    description: "Un panel de control para cortafuegos activos, monitor de IP y SSL.",
    category: "grids",
    html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-xs">
  <div class="p-3 rounded border border-slate-850 bg-slate-900/20 flex flex-col justify-between">
    <span class="text-[9px] text-slate-500 block">FIREWALL</span>
    <span class="text-emerald-400 font-bold block mt-2">ACTIVO</span>
  </div>
  <div class="p-3 rounded border border-slate-850 bg-slate-900/20 flex flex-col justify-between">
    <span class="text-[9px] text-slate-500 block">IP BLOCKER</span>
    <span class="text-rose-400 font-bold block mt-2">8 BLOQUEADOS</span>
  </div>
  <div class="p-3 rounded border border-slate-850 bg-slate-900/20 flex flex-col justify-between">
    <span class="text-[9px] text-slate-500 block">CREDENTIALS</span>
    <span class="text-slate-300 font-mono block mt-2">SSL ACTIVO</span>
  </div>
</div>`
  },
  {
    id: "grid-server-clusters",
    name: "Clúster Distribuido",
    description: "Muestra la topología de núcleos en la nube con indicadores cromáticos directos.",
    category: "grids",
    html: `<div class="grid grid-cols-4 gap-2 w-full text-center">
  <div class="p-2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">CO-01</div>
  <div class="p-2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">CO-02</div>
  <div class="p-2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">CO-03</div>
  <div class="p-2 rounded bg-red-500/15 text-red-400 border border-red-500/20 text-[10px] font-mono">N-FAIL</div>
</div>`
  }
];
