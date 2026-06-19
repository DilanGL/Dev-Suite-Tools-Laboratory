/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskPriority = 'menor' | 'media' | 'urgente';

export interface Task {
  id: string;
  asunto: string;
  concepto: string;
  prioridad: TaskPriority;
  completada: boolean;
  fechaCreacion: number; // timestamp to order by
}
