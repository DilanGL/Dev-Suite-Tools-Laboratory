import { Snippet } from './types';

export const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: 'default-html-card',
    title: 'Tarjeta Holográfica Interactiva',
    description: 'Una tarjeta moderna con gradiente de cristal y efectos hover suaves usando HTML y CSS inline.',
    language: 'html',
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: radial-gradient(circle at 50% 50%, #151a30 0%, #0b0d19 100%);
      font-family: 'Inter', system-ui, sans-serif;
      overflow: hidden;
    }

    .card {
      position: relative;
      width: 320px;
      height: 420px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px;
      box-sizing: border-box;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 0;
    }

    .card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: rgba(168, 85, 247, 0.4);
      box-shadow: 0 40px 80px rgba(168, 85, 247, 0.15), 0 0 40px rgba(59, 130, 246, 0.1);
    }

    .card:hover::before {
      opacity: 1;
    }

    .card-header {
      position: relative;
      z-index: 1;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .card-title {
      font-size: 24px;
      color: #ffffff;
      margin: 0 0 10px 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .card-desc {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }

    .card-footer {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(to right, #a855f7, #3b82f6);
      border-radius: 50%;
    }

    .author-name {
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 500;
    }

    .action-btn {
      background: #ffffff;
      color: #0f172a;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #e2e8f0;
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <span class="badge">Estilo UI</span>
      <h2 class="card-title">Google Cloud</h2>
      <p class="card-desc">Crea componentes extraordinarios que combinan cristales brillantes y animaciones dinámicas optimizadas.</p>
    </div>
    <div class="card-footer">
      <div class="author">
        <div class="avatar"></div>
        <span class="author-name">Dilan Gonzales</span>
      </div>
      <button class="action-btn">Descubrir</button>
    </div>
  </div>
</body>
</html>`,
    tags: ['UI', 'Diseño', 'Cristalismo'],
    createdAt: new Date('2026-06-05T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-05T12:00:00Z').toISOString()
  },
  {
    id: 'default-ripple-btn',
    title: 'Efecto Ondas al Clic (Ripple)',
    description: 'Botón con efectos de ondas fluidas (ripple effect) al hacer clic, con HTML, CSS y JS vanilla.',
    language: 'javascript',
    code: `/*
* Botón interactivo con efecto de propagación (Ripple)
* Instrucciones: Añade esta clase a tus botones y vincula el script.
*/

// HTML de prueba:
// <button class="ripple-button">Hacer clic aquí</button>

// CSS requerido:
const style = document.createElement('style');
style.textContent = \`
  .ripple-button {
    position: relative;
    overflow: hidden;
    outline: none;
    cursor: pointer;
    background: #3b82f6;
    color: white;
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    padding: 14px 28px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
    transition: background 0.3s, transform 0.1s;
  }

  .ripple-button:active {
    transform: scale(0.98);
  }

  .ripple-circle {
    position: absolute;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
\`;
document.head.appendChild(style);

// Lógica de JavaScript:
document.querySelectorAll('.ripple-button').forEach(button => {
  button.addEventListener('click', function(e) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const circle = document.createElement('span');
    circle.classList.add('ripple-circle');
    circle.style.left = \`\${x}px\`;
    circle.style.top = \`\${y}px\`;

    // Ajustar el tamaño del círculo basado en las dimensiones del botón
    const diameter = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = \`\${diameter}px\`;
    circle.style.transform = 'translate(-50%, -50%) scale(0)';

    button.appendChild(circle);

    // Remover después de que termina la animación
    setTimeout(() => {
      circle.remove();
    }, 600);
  });
});
`,
    tags: ['Interactivo', 'DOM', 'Eventos'],
    createdAt: new Date('2026-06-06T15:30:00Z').toISOString(),
    updatedAt: new Date('2026-06-07T10:20:00Z').toISOString()
  },
  {
    id: 'default-tailwind-gradient',
    title: 'Utilidad CSS: Gradientes Especiales',
    description: 'Configuración y uso de gradientes de texto y animación infinita en CSS puro.',
    language: 'css',
    code: `/* Animación de gradiente en movimiento para fondos o textos */
@keyframes moving-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.text-gradient-animated {
  background: linear-gradient(-45deg, #ff3366, #ff6633, #33ccff, #33ff66);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: moving-gradient 10s ease infinite;
}

.card-glowing-glow {
  position: relative;
}

.card-glowing-glow::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(to right, #ff3366, #33ccff);
  border-radius: 12px;
  z-index: -1;
  filter: blur(10px);
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.card-glowing-glow:hover::after {
  opacity: 1;
}
`,
    tags: ['Animaciones', 'Efecto-Gradiente'],
    createdAt: new Date('2026-06-04T09:12:00Z').toISOString(),
    updatedAt: new Date('2026-06-04T09:12:00Z').toISOString()
  },
  {
    id: 'default-sql-queries',
    title: 'Esquema de Base de Datos y Queries',
    description: 'Definición de tablas SQL e instrucciones para estadísticas y agregaciones avanzadas.',
    language: 'sql',
    code: `-- Creación de la tabla de ventas
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity INT DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos semilla
INSERT INTO sales (product_name, category, quantity, unit_price) VALUES
('Portátil Pro 15', 'Electrónica', 2, 1299.99),
('Monitor Curvo 4K', 'Electrónica', 5, 349.99),
('Silla Ergonómica', 'Mobiliario', 10, 199.50),
('Teclado Mecánico', 'Accesorios', 15, 89.00);

-- Consulta de ventas acumuladas por categoría con filtros y ordenación
SELECT 
    category,
    COUNT(sale_id) AS total_ventas_realizadas,
    SUM(quantity) AS unidades_vendidas,
    SUM(quantity * unit_price) AS ingresos_totales,
    AVG(unit_price)::numeric(10,2) AS precio_promedio_unidad
FROM 
    sales
WHERE 
    sale_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 
    category
HAVING 
    SUM(quantity * unit_price) > 500
ORDER BY 
    ingresos_totales DESC;
`,
    tags: ['SQL', 'PostgreSQL', 'Analítica'],
    createdAt: new Date('2026-06-03T18:45:00Z').toISOString(),
    updatedAt: new Date('2026-06-03T18:45:00Z').toISOString()
  }
];
