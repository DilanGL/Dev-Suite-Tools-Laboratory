/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NoteCategory = 'General' | 'Código' | 'Tareas' | 'Claves' | 'Markdown';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  category: NoteCategory;
  pinned: boolean;
  images?: Record<string, string>;
}

export type EditorFontSize = 'sm' | 'md' | 'lg' | 'xl';
export type SaveStatus = 'synchronized' | 'saving' | 'error';
