import * as opentype from 'opentype.js';
import { FontProject, Glyph, Shape, PathNode } from '../types';
import { DEFAULT_CHAR_LIST } from './defaults';

// Reconstruct internal Shape contours from opentype.Path
export function parseGlyphPathToShapes(path: opentype.Path): Shape[] {
  const commands = path.commands;
  const shapes: Shape[] = [];
  let currentNodes: PathNode[] = [];
  let currentClosed = false;

  const createId = (prefix: string = 'node') => 
    prefix + '_' + Math.random().toString(36).substr(2, 9);

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    if (cmd.type === 'M') {
      // If we have previous nodes accumulated, package it into a shape first
      if (currentNodes.length > 0) {
        shapes.push({
          id: createId('shape'),
          name: `Contorno ${shapes.length + 1}`,
          type: 'path',
          nodes: currentNodes,
          closed: currentClosed,
          reverseWinding: false,
          visible: true,
          locked: false
        });
      }
      currentNodes = [{
        id: createId('node'),
        x: Math.round(cmd.x),
        y: Math.round(cmd.y),
        handleIn: null,
        handleOut: null,
        type: 'corner'
      }];
      currentClosed = false;
    } 
    else {
      if (cmd.type === 'Z') {
        currentClosed = true;
      } else {
        const c = cmd as any;
        // Check if this command returns back to the first node of this contour
        const startNode = currentNodes[0];
        const isBackToStart = startNode && 
                              Math.abs(startNode.x - c.x) < 1.0 && 
                              Math.abs(startNode.y - c.y) < 1.0;

        if (isBackToStart) {
          if (c.type === 'C') {
            const prevIdx = currentNodes.length - 1;
            if (prevIdx >= 0) {
              currentNodes[prevIdx].handleOut = { 
                x: Math.round(c.x1 - currentNodes[prevIdx].x), 
                y: Math.round(c.y1 - currentNodes[prevIdx].y) 
              };
              currentNodes[prevIdx].type = 'smooth';
            }
            startNode.handleIn = { 
              x: Math.round(c.x2 - startNode.x), 
              y: Math.round(c.y2 - startNode.y) 
            };
            startNode.type = 'smooth';
          } else if (c.type === 'Q') {
            const prevIdx = currentNodes.length - 1;
            if (prevIdx >= 0) {
              currentNodes[prevIdx].handleOut = { 
                x: Math.round((2 / 3) * (c.x1 - currentNodes[prevIdx].x)), 
                y: Math.round((2 / 3) * (c.y1 - currentNodes[prevIdx].y)) 
              };
              currentNodes[prevIdx].type = 'smooth';
            }
            startNode.handleIn = { 
              x: Math.round((2 / 3) * (c.x1 - startNode.x)), 
              y: Math.round((2 / 3) * (c.y1 - startNode.y)) 
            };
            startNode.type = 'smooth';
          }
          currentClosed = true;
        } else {
          if (c.type === 'L') {
            currentNodes.push({
              id: createId('node'),
              x: Math.round(c.x),
              y: Math.round(c.y),
              handleIn: null,
              handleOut: null,
              type: 'corner'
            });
          } 
          else if (c.type === 'C') {
            const prevIdx = currentNodes.length - 1;
            if (prevIdx >= 0) {
              currentNodes[prevIdx].handleOut = { 
                x: Math.round(c.x1 - currentNodes[prevIdx].x), 
                y: Math.round(c.y1 - currentNodes[prevIdx].y) 
              };
              currentNodes[prevIdx].type = 'smooth';
            }
            currentNodes.push({
              id: createId('node'),
              x: Math.round(c.x),
              y: Math.round(c.y),
              handleIn: { 
                x: Math.round(c.x2 - c.x), 
                y: Math.round(c.y2 - c.y) 
              },
              handleOut: null,
              type: 'smooth'
            });
          } 
          else if (c.type === 'Q') {
            const prevIdx = currentNodes.length - 1;
            if (prevIdx >= 0) {
              currentNodes[prevIdx].handleOut = { 
                x: Math.round((2 / 3) * (c.x1 - currentNodes[prevIdx].x)), 
                y: Math.round((2 / 3) * (c.y1 - currentNodes[prevIdx].y)) 
              };
              currentNodes[prevIdx].type = 'smooth';
            }
            currentNodes.push({
              id: createId('node'),
              x: Math.round(c.x),
              y: Math.round(c.y),
              handleIn: { 
                x: Math.round((2 / 3) * (c.x1 - c.x)), 
                y: Math.round((2 / 3) * (c.y1 - c.y)) 
              },
              handleOut: null,
              type: 'smooth'
            });
          } 
        }
      }
    }
  }

  // Push final remaining subpath
  if (currentNodes.length > 0) {
    shapes.push({
      id: createId('shape'),
      name: `Contorno ${shapes.length + 1}`,
      type: 'path',
      nodes: currentNodes,
      closed: currentClosed,
      reverseWinding: false,
      visible: true,
      locked: false
    });
  }

  return shapes;
}

// Convert a parsed opentype.Font to our internal FontProject
export function fontToFontProject(font: opentype.Font, filename: string): FontProject {
  const unitsPerEm = font.unitsPerEm ?? 1000;
  const ascender = font.ascender ?? 800;
  const descender = font.descender ?? -220;
  
  // Clean names
  const cleanName = filename
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[^a-zA-Z0-9\s-_]/g, ""); // strip weird symbols

  const glyphs: { [char: string]: Glyph } = {};

  // Build metrics
  const metrics = {
    unitsPerEm: unitsPerEm,
    ascender: ascender,
    capHeight: font.tables.os2?.sCapHeight ?? Math.round(ascender * 0.85),
    xHeight: font.tables.os2?.sxHeight ?? Math.round(ascender * 0.6),
    baseline: 0,
    descender: descender
  };

  // Convert default characters support
  DEFAULT_CHAR_LIST.forEach(char => {
    const unicode = char.charCodeAt(0);
    const otGlyph = font.charToGlyph(char);

    let shapes: Shape[] = [];
    let advanceWidth = char === 'I' || char === 'i' || char === 'l' ? 400 : 650;

    if (otGlyph) {
      if (typeof otGlyph.advanceWidth === 'number') {
        advanceWidth = otGlyph.advanceWidth;
      }
      
      // Parse glyph path to shapes
      if (otGlyph.path && otGlyph.path.commands && otGlyph.path.commands.length > 0) {
        shapes = parseGlyphPathToShapes(otGlyph.path);
        
        // If we extracted contours but shapes is empty, try raw bounding box
        if (shapes.length === 0) {
          const bbox = otGlyph.getMetrics();
          if (bbox && (bbox.xMax - bbox.xMin > 0)) {
            // Put a simple placeholder rectangle if bounds exist but path parse failed
            shapes = [{
              id: 'shape_' + Math.random().toString(36).substr(2, 9),
              name: 'Contorno Automático',
              type: 'path',
              closed: true,
              reverseWinding: false,
              visible: true,
              locked: false,
              nodes: [
                { id: 'node_' + Math.random().toString(36).substr(2, 9), x: bbox.xMin, y: bbox.yMin, handleIn: null, handleOut: null, type: 'corner' },
                { id: 'node_' + Math.random().toString(36).substr(2, 9), x: bbox.xMax, y: bbox.yMin, handleIn: null, handleOut: null, type: 'corner' },
                { id: 'node_' + Math.random().toString(36).substr(2, 9), x: bbox.xMax, y: bbox.yMax, handleIn: null, handleOut: null, type: 'corner' },
                { id: 'node_' + Math.random().toString(36).substr(2, 9), x: bbox.xMin, y: bbox.yMax, handleIn: null, handleOut: null, type: 'corner' }
              ]
            }];
          }
        }
      }
    }

    glyphs[char] = {
      char,
      unicode,
      advanceWidth,
      shapes
    };
  });

  // Extract kerning if present in GPK/kern table
  const kerning: { [pair: string]: number } = {};
  
  // Try to read some common kerning pairs from DEFAULT_CHAR_LIST
  // In many fonts, opentype.js can fetch kerning for specific indexes
  for (let i = 0; i < DEFAULT_CHAR_LIST.length; i++) {
    for (let j = 0; j < DEFAULT_CHAR_LIST.length; j++) {
      const leftChar = DEFAULT_CHAR_LIST[i];
      const rightChar = DEFAULT_CHAR_LIST[j];
      const pair = leftChar + rightChar;

      const leftGlyph = font.charToGlyph(leftChar);
      const rightGlyph = font.charToGlyph(rightChar);

      if (leftGlyph && rightGlyph) {
        const value = font.getKerningValue(leftGlyph, rightGlyph);
        if (value && value !== 0) {
          kerning[pair] = value;
        }
      }
    }
  }

  // Fallback defaults if no kerning extracted
  if (Object.keys(kerning).length === 0) {
    kerning['AV'] = -60;
    kerning['VA'] = -60;
    kerning['Te'] = -40;
    kerning['To'] = -40;
  }

  return {
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    name: cleanName,
    metrics,
    glyphs,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    kerning,
    isImported: true
  };
}
