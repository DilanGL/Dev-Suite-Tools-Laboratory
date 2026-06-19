/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Attempts to parse and beautifully format JSON content.
 * Returns formatted string or throws an error.
 */
export function formatJSONString(content: string): string {
  try {
    const parsed = JSON.parse(content.trim());
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error('El contenido no es un JSON válido. Compruebe la sintaxis.');
  }
}

/**
 * Calculates character, word, and line statistics from text content.
 */
export interface TextStats {
  characters: number;
  words: number;
  lines: number;
}

export function getTextStats(content: string): TextStats {
  const characters = content.length;
  const lines = content.split('\n').length;
  const words = content.trim() === '' 
    ? 0 
    : content.trim().split(/\s+/).filter(w => w.length > 0).length;

  return { characters, words, lines };
}
