/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Note } from './types';

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: '🔑 Llaves de Acceso & API Config',
    content: `# CONFIGURACIÓN DE CONEXIÓN LOCAL
# Guardar temporalmente para pruebas locales de desarrollo.
# ¡No subir en commits de Git!

VITE_APP_ENV="development"
VITE_API_ENDPOINT="https://api.dev.suite.internal/v1"
VITE_JWT_SECRET_KEY="amF2YXNjcmlwdC1leHBlcnQtY29kZXI="

# Llaves de Sandbox para APIs de Terceros:
STRIPE_SANDBOX_ID="pk_test_51NxB80Jy7R8A0hGz"
FIREBASE_SENDER_ID="482019385012"
COMPILER_SERVICE_TIMEOUT=15000`,
    updatedAt: Date.now() - 60000 * 5, // 5 minutes ago
    category: 'Claves',
    pinned: true,
  },
  {
    id: 'note-2',
    title: '💡 Ideas Rápidas para la UI',
    content: `## Ideas para Mejorar el Bloc de Notas

- [ ] Agregar soporte para exportar en formato JSON y TXT
- [ ] Implementar un mini-compilador de código aislado
- [ ] Diseñar atajos de teclado (Keyboard Shortcuts)
  - Ctrl + S: Guardar (aunque ya sea auto-save, da tranquilidad)
  - Ctrl + N: Nueva Nota
  - Ctrl + D: Cambiar modo de visualización
- [ ] Integrar un resolvedor de expresiones matemáticas rápida en la barra de utilidades`,
    updatedAt: Date.now() - 3600000, // 1 hour ago
    category: 'Markdown',
    pinned: false,
  },
  {
    id: 'note-3',
    title: '📝 Tareas Pendientes Sprint 4',
    content: `LISTA DE TAREAS PENDIENTES — DEVSITE
=====================================

[✓] Ajustar colores oscuros en #0b0d19 y #151a30.
[✓] Escuchar eventos 'input' en tiempo real.
[✓] Implementar estado de guardado (Gris #64748b -> Violeta #a855f7).
[✓] Esperar 400ms tras tecleo para reajustar visualizador.
[ ] Crear botón para formatear estructuras de datos JSON.
[ ] Añadir buscador o filtro rápido por título de notas.`,
    updatedAt: Date.now() - 3600000 * 4, // 4 hours ago
    category: 'Tareas',
    pinned: false,
  },
  {
    id: 'note-4',
    title: '☕ Algoritmo de Ordenamiento Rápido',
    content: `/**
 * Implementación de Quicksort en TypeScript
 * Categoria: Código / Optimización
 */
function quicksort<T>(arr: T[]): T[] {
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quicksort(left), ...middle, ...quicksort(right)];
}

const unsorted = [34, 7, 23, 32, 5, 62];
console.log("Resultado:", quicksort(unsorted));`,
    updatedAt: Date.now() - 3600000 * 12, // 12 hours ago
    category: 'Código',
    pinned: false,
  }
];
