import * as opentype from 'opentype.js';
import { FontProject, Glyph } from '../types';

// Convert our internal Shape structure to an opentype.Path
function glyphToOpentypePath(g: Glyph): opentype.Path {
  const path = new opentype.Path();

  g.shapes.forEach(shape => {
    if (!shape.visible) return;
    if (shape.nodes.length === 0) return;

    const nodes = [...shape.nodes];
    // If the contour winding is reversed, we reverse the nodes array
    if (shape.reverseWinding) {
      nodes.reverse();
    }

    const startNode = nodes[0];
    path.moveTo(startNode.x, startNode.y);

    for (let i = 0; i < nodes.length; i++) {
      if (i === nodes.length - 1 && !shape.closed) {
        break;
      }
      const curr = nodes[i];
      const next = nodes[(i + 1) % nodes.length];

      // Calculate absolute handle positions
      const cp1x = curr.x + (curr.handleOut?.x ?? 0);
      const cp1y = curr.y + (curr.handleOut?.y ?? 0);
      const cp2x = next.x + (next.handleIn?.x ?? 0);
      const cp2y = next.y + (next.handleIn?.y ?? 0);

      if (curr.handleOut || next.handleIn) {
        path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      } else {
        path.lineTo(next.x, next.y);
      }
    }

    if (shape.closed) {
      path.close();
    }
  });

  return path;
}

// Compiles a FontProject to an opentype.Font instance
export function compileProjectToFont(project: FontProject): opentype.Font {
  const glyphs: opentype.Glyph[] = [];

  // 1. First glyph MUST be the .notdef glyph (required by TrueType/OpenType standards)
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(50, 0);
  notdefPath.lineTo(450, 0);
  notdefPath.lineTo(450, 700);
  notdefPath.lineTo(50, 700);
  notdefPath.lineTo(50, 0);
  notdefPath.close();

  // Hollow inner box
  notdefPath.moveTo(100, 50);
  notdefPath.lineTo(100, 650);
  notdefPath.lineTo(400, 650);
  notdefPath.lineTo(400, 50);
  notdefPath.lineTo(100, 50);
  notdefPath.close();

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 500,
    path: notdefPath
  });
  glyphs.push(notdefGlyph);

  // 2. Map all designed glyphs of the FontProject
  Object.values(project.glyphs).forEach(g => {
    // Only compile glyphs that have shapes drawn or modified, to keep font light
    // If a glyph has no visible shapes, we omit it from this font so it falls back to the system font (e.g. Inter) in preview.
    const hasDrawnShapes = g.shapes.some(s => s.visible && s.nodes.length > 0);
    if (!hasDrawnShapes) return;

    const path = glyphToOpentypePath(g);
    
    const glyph = new opentype.Glyph({
      name: g.char,
      unicode: g.unicode,
      advanceWidth: g.advanceWidth,
      path: path
    });
    glyphs.push(glyph);
  });

  // 3. Create Font instance
  const font = new opentype.Font({
    familyName: project.name || 'MiFuentePersonalizada',
    styleName: 'Regular',
    unitsPerEm: project.metrics.unitsPerEm,
    ascender: project.metrics.ascender,
    descender: project.metrics.descender,
    glyphs: glyphs
  });

  return font;
}

// Convert Shape to SVG path description string (using Y flipped for font coordinate systems)
function shapeToSvgPathData(g: Glyph): string {
  const parts: string[] = [];

  g.shapes.forEach(shape => {
    if (!shape.visible || shape.nodes.length === 0) return;
    const nodes = [...shape.nodes];
    if (shape.reverseWinding) {
      nodes.reverse();
    }

    const start = nodes[0];
    parts.push(`M ${start.x} ${start.y}`);

    for (let i = 0; i < nodes.length; i++) {
      if (i === nodes.length - 1 && !shape.closed) break;
      const curr = nodes[i];
      const next = nodes[(i + 1) % nodes.length];

      const cp1x = curr.x + (curr.handleOut?.x ?? 0);
      const cp1y = curr.y + (curr.handleOut?.y ?? 0);
      const cp2x = next.x + (next.handleIn?.x ?? 0);
      const cp2y = next.y + (next.handleIn?.y ?? 0);

      if (curr.handleOut || next.handleIn) {
        parts.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
      } else {
        parts.push(`L ${next.x} ${next.y}`);
      }
    }

    if (shape.closed) {
      parts.push('Z');
    }
  });

  return parts.join(' ');
}

// Generates an SVG Font file (pure XML)
export function generateSvgFont(project: FontProject): string {
  const familyName = project.name || 'MiFuentePersonalizada';
  const metrics = project.metrics;

  let glyphsMarkup = '';
  Object.values(project.glyphs).forEach(g => {
    const d = shapeToSvgPathData(g);
    // Escape XML characters if needed
    const unicodeHex = `&#x${g.unicode.toString(16).toUpperCase()};`;
    const safeChar = g.char === '"' ? '&quot;' : g.char === '&' ? '&amp;' : g.char;
    glyphsMarkup += `    <glyph unicode="${safeChar}" glyph-name="${g.char}" horiz-adv-x="${g.advanceWidth}" d="${d}" />\n`;
  });

  return `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <metadata>Diseñado con el Editor de Tipografías Web Customizado</metadata>
  <defs>
    <font id="${familyName.replace(/\s+/g, '-')}" horiz-adv-x="600">
      <font-face 
        font-family="${familyName}" 
        units-per-em="${metrics.unitsPerEm}" 
        ascender="${metrics.ascender}" 
        descender="${metrics.descender}" 
        cap-height="${metrics.capHeight}"
        x-height="${metrics.xHeight}"
      />
      <missing-glyph horiz-adv-x="500" d="M 50 0 L 450 0 L 450 700 L 50 700 Z M 100 50 L 100 650 L 400 650 L 400 50 Z" />
${glyphsMarkup}    </font>
  </defs>
</svg>`;
}

// Triggers native browser download for specific buffers/strings
export function downloadFile(content: ArrayBuffer | string, filename: string, mimeType: string) {
  const blob = content instanceof ArrayBuffer 
    ? new Blob([content], { type: mimeType }) 
    : new Blob([content], { type: `${mimeType};charset=utf-8` });
    
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
