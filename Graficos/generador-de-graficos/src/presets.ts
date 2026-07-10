/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresetDataset } from './types';

export const COLOR_THEMES = [
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    primary: '#3b82f6',
    secondary: '#06b6d4',
    colors: ['#3b82f6', '#06b6d4', '#60a5fa', '#22d3ee', '#1d4ed8', '#0891b2'],
    gradient: ['from-blue-500', 'to-cyan-400'],
    shadow: 'shadow-blue-500/20',
  },
  {
    id: 'emerald-glow',
    name: 'Emerald Glow',
    primary: '#10b981',
    secondary: '#14b8a6',
    colors: ['#10b981', '#14b8a6', '#34d399', '#2dd4bf', '#047857', '#0f766e'],
    gradient: ['from-emerald-500', 'to-teal-400'],
    shadow: 'shadow-emerald-500/20',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    primary: '#ec4899',
    secondary: '#a855f7',
    colors: ['#ec4899', '#a855f7', '#f472b6', '#c084fc', '#db2777', '#9333ea', '#e11d48'],
    gradient: ['from-pink-500', 'to-purple-500'],
    shadow: 'shadow-pink-500/20',
  },
  {
    id: 'sunset-neon',
    name: 'Sunset Glow',
    primary: '#f97316',
    secondary: '#ef4444',
    colors: ['#f97316', '#ef4444', '#fb923c', '#f87171', '#c2410c', '#b91c1c', '#f59e0b'],
    gradient: ['from-orange-500', 'to-red-500'],
    shadow: 'shadow-orange-500/20',
  },
  {
    id: 'monochrome',
    name: 'Cosmic Slate',
    primary: '#94a3b8',
    secondary: '#475569',
    colors: ['#f1f5f9', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'],
    gradient: ['from-slate-300', 'to-slate-600'],
    shadow: 'shadow-slate-400/20',
  },
];

export const PRESETS: PresetDataset[] = [
  {
    name: '📊 Ventas de Consolas Q1',
    description: 'Datos simulados de ventas trimestrales para consolas de última generación.',
    type: 'bar',
    title: 'Venta de Consolas de Videojuegos (Millones)',
    xAxisTitle: 'Dispositivos',
    yAxisTitle: 'Unidades Vendidas (M)',
    labels: 'PlayStation 5, Nintendo Switch, Xbox Series X/S, Steam Deck, PC Handhelds',
    values: '22.4, 18.2, 11.5, 3.2, 1.8',
    colorTheme: 'electric-blue',
  },
  {
    name: '📈 Crecimiento de Usuarios Activos',
    description: 'Tendencia mensual de usuarios activos en la plataforma durante el semestre.',
    type: 'area',
    title: 'Usuarios Activos Mensuales (MAU)',
    xAxisTitle: 'Meses',
    yAxisTitle: 'Usuarios (Millones)',
    labels: 'Enero, Febrero, Marzo, Abril, Mayo, Junio',
    values: '4.2, 4.9, 5.8, 6.2, 7.5, 9.1',
    colorTheme: 'cyberpunk',
  },
  {
    name: '🍩 Cuota de Mercado de Navegadores',
    description: 'Distribución porcentual de los navegadores web más utilizados.',
    type: 'donut',
    title: 'Uso Global de Navegadores Web',
    xAxisTitle: 'Navegadores',
    yAxisTitle: 'Porcentaje (%)',
    labels: 'Chrome, Safari, Edge, Firefox, Opera, Otros',
    values: '64.2, 18.5, 5.2, 3.1, 2.2, 6.8',
    colorTheme: 'sunset-neon',
  },
  {
    name: '📉 Rendimiento Deportivo (Calorías)',
    description: 'Monitoreo diario del gasto calórico durante entrenamientos de la semana.',
    type: 'line',
    title: 'Calorías Quemadas por Día',
    xAxisTitle: 'Día de la Semana',
    yAxisTitle: 'Calorías (kcal)',
    labels: 'Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo',
    values: '450, 620, 380, 710, 520, 850, 300',
    colorTheme: 'emerald-glow',
  },
];
