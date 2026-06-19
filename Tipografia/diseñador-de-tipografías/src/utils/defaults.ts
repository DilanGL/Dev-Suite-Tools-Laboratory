import { FontProject, Glyph } from '../types';

export const DEFAULT_CHAR_LIST = [
  // Uppercase
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Lowercase
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // Symbols
  '!', '?', '.', ',', ';', ':', '-', '_', '+', '=', '*', '/', '(', ')', '[', ']', '{', '}', '&', '@', '$', '%', '#'
];

export function createDefaultProject(name: string = 'Nueva Tipografía'): FontProject {
  const glyphs: { [char: string]: Glyph } = {};

  DEFAULT_CHAR_LIST.forEach(char => {
    glyphs[char] = {
      char,
      unicode: char.charCodeAt(0),
      advanceWidth: char === 'I' || char === 'i' || char === 'l' || char === '!' || char === '.' ? 400 : 
                    char === 'M' || char === 'W' || char === 'm' || char === 'w' ? 850 : 650,
      shapes: [] // Empty shapes to trigger vector editor, showing transparent template of character on background
    };
  });

  return {
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    name,
    metrics: {
      unitsPerEm: 1000,
      ascender: 780,
      capHeight: 680,
      xHeight: 480,
      baseline: 0,
      descender: -220
    },
    glyphs,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    kerning: {
      'AV': -60,
      'VA': -60,
      'Te': -40,
      'To': -40,
      'Ve': -30,
      'Vo': -30
    }
  };
}
