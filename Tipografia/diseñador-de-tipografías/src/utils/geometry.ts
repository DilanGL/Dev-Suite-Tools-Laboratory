import { Point2D, PathNode, Shape, FontMetrics, SnapConfig } from '../types';

// Constants
export const KAPPA = 4 * (Math.sqrt(2) - 1) / 3; // Approx 0.5522847

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Coordinate mapping: Font Units to Screen Points
export interface CoordinatesContext {
  width: number;
  height: number;
  pan: Point2D;
  zoom: number;
  metrics: FontMetrics;
}

export function fontToScreen(
  fontPt: Point2D,
  ctx: CoordinatesContext
): Point2D {
  const scale = (ctx.height * 0.6) / ctx.metrics.unitsPerEm * ctx.zoom;
  const centerX = ctx.width / 2 + ctx.pan.x;
  const baselineY = ctx.height * 0.65 + ctx.pan.y; // Sit baseline slightly lower than half height

  return {
    x: Math.round(centerX + fontPt.x * scale),
    y: Math.round(baselineY - fontPt.y * scale) // Font Y increases UPWARD, Screen Y increases DOWNWARD
  };
}

export function screenToFont(
  screenPt: Point2D,
  ctx: CoordinatesContext
): Point2D {
  const scale = (ctx.height * 0.6) / ctx.metrics.unitsPerEm * ctx.zoom;
  const centerX = ctx.width / 2 + ctx.pan.x;
  const baselineY = ctx.height * 0.65 + ctx.pan.y;

  return {
    x: (screenPt.x - centerX) / scale,
    y: (baselineY - screenPt.y) / scale
  };
}

// Distance helper
export function distance(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// Smart Snapping Logic
export function findSnapPoint(
  rawFontPt: Point2D,
  ctx: CoordinatesContext,
  snapConfig: SnapConfig,
  currentGlyphNodes: Point2D[],
  activeNodeId: string | null = null
): { point: Point2D; snappedX: boolean; snappedY: boolean; snapType: string | null } {
  const scale = (ctx.height * 0.6) / ctx.metrics.unitsPerEm * ctx.zoom;
  const threshold = 8 / scale; // 8 screen pixels threshold converted to font units

  let result = { ...rawFontPt };
  let snappedX = false;
  let snappedY = false;
  let snapType: string | null = null;

  // 1. Snap to Guidelines (Y-axis vertical alignments and X-axis horizontal start/metrics)
  if (snapConfig.guidelines) {
    const guides = [
      { name: 'Cap Height', value: ctx.metrics.capHeight, axis: 'y' },
      { name: 'X-Height', value: ctx.metrics.xHeight, axis: 'y' },
      { name: 'Línea Base', value: ctx.metrics.baseline, axis: 'y' },
      { name: 'Descendente', value: ctx.metrics.descender, axis: 'y' },
      { name: 'Ascendente', value: ctx.metrics.ascender, axis: 'y' },
      { name: 'Origen', value: 0, axis: 'x' }
    ];

    for (const guide of guides) {
      if (guide.axis === 'y' && !snappedY) {
        if (Math.abs(rawFontPt.y - guide.value) < threshold) {
          result.y = guide.value;
          snappedY = true;
          snapType = guide.name;
        }
      } else if (guide.axis === 'x' && !snappedX) {
        if (Math.abs(rawFontPt.x - guide.value) < threshold) {
          result.x = guide.value;
          snappedX = true;
          snapType = guide.name;
        }
      }
    }
  }

  // 2. Snap to existing nodes (X and Y alignments)
  if (snapConfig.nodes && currentGlyphNodes.length > 0) {
    for (const node of currentGlyphNodes) {
      // Avoid snapping self in node edit mode
      if (Math.abs(node.x - rawFontPt.x) < 0.001 && Math.abs(node.y - rawFontPt.y) < 0.001) continue;

      if (!snappedX && Math.abs(rawFontPt.x - node.x) < threshold) {
        result.x = node.x;
        snappedX = true;
        snapType = 'Nodo (Alineado)';
      }
      if (!snappedY && Math.abs(rawFontPt.y - node.y) < threshold) {
        result.y = node.y;
        snappedY = true;
        snapType = 'Nodo (Alineado)';
      }

      // Perfect snap on both if very close to absolute node point
      if (distance(rawFontPt, node) < threshold) {
        result.x = node.x;
        result.y = node.y;
        snappedX = true;
        snappedY = true;
        snapType = 'Punto de Nodo';
        break;
      }
    }
  }

  // 3. Snap to Grid (if not snapped to higher-priority guidelines/nodes)
  if (snapConfig.grid && snapConfig.gridSize > 0) {
    if (!snappedX) {
      result.x = Math.round(result.x / snapConfig.gridSize) * snapConfig.gridSize;
      snappedX = true;
      if (!snapType) snapType = 'Cuadrícula';
    }
    if (!snappedY) {
      result.y = Math.round(result.y / snapConfig.gridSize) * snapConfig.gridSize;
      snappedY = true;
      if (!snapType) snapType = 'Cuadrícula';
    }
  }

  return { point: result, snappedX, snappedY, snapType };
}

// Shape Creators
export function createRectangle(x: number, y: number, w: number, h: number): Shape {
  const nodes: PathNode[] = [
    { id: generateId(), x, y: y + h, handleIn: null, handleOut: null, type: 'corner' },
    { id: generateId(), x: x + w, y: y + h, handleIn: null, handleOut: null, type: 'corner' },
    { id: generateId(), x: x + w, y, handleIn: null, handleOut: null, type: 'corner' },
    { id: generateId(), x, y, handleIn: null, handleOut: null, type: 'corner' }
  ];

  return {
    id: generateId(),
    name: 'Rectángulo',
    type: 'rectangle',
    nodes,
    closed: true,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}

export function createCircle(cx: number, cy: number, r: number): Shape {
  const handleLen = r * KAPPA;

  const nodes: PathNode[] = [
    { // Top
      id: generateId(),
      x: cx,
      y: cy + r,
      handleIn: { x: -handleLen, y: 0 },
      handleOut: { x: handleLen, y: 0 },
      type: 'smooth'
    },
    { // Right
      id: generateId(),
      x: cx + r,
      y: cy,
      handleIn: { x: 0, y: handleLen },
      handleOut: { x: 0, y: -handleLen },
      type: 'smooth'
    },
    { // Bottom
      id: generateId(),
      x: cx,
      y: cy - r,
      handleIn: { x: handleLen, y: 0 },
      handleOut: { x: -handleLen, y: 0 },
      type: 'smooth'
    },
    { // Left
      id: generateId(),
      x: cx - r,
      y: cy,
      handleIn: { x: 0, y: -handleLen },
      handleOut: { x: 0, y: handleLen },
      type: 'smooth'
    }
  ];

  return {
    id: generateId(),
    name: 'Círculo',
    type: 'circle',
    nodes,
    closed: true,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}

export function createPolygon(cx: number, cy: number, r: number, sides: number): Shape {
  const nodes: PathNode[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
    nodes.push({
      id: generateId(),
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      handleIn: null,
      handleOut: null,
      type: 'corner'
    });
  }

  return {
    id: generateId(),
    name: `Polígono (${sides} lados)`,
    type: 'polygon',
    nodes,
    closed: true,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}

export function createLine(p1: Point2D, p2: Point2D): Shape {
  const nodes: PathNode[] = [
    { id: generateId(), x: p1.x, y: p1.y, handleIn: null, handleOut: null, type: 'corner' },
    { id: generateId(), x: p2.x, y: p2.y, handleIn: null, handleOut: null, type: 'corner' }
  ];

  return {
    id: generateId(),
    name: 'Línea',
    type: 'line',
    nodes,
    closed: false,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}

// Transformation Helpers
export function getShapeBoundingBox(shape: Shape): { x: number; y: number; w: number; h: number } {
  if (shape.nodes.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  shape.nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
    // Include Bezier Handles to be fully accurate
    if (node.handleIn) {
      minX = Math.min(minX, node.x + node.handleIn.x);
      maxX = Math.max(maxX, node.x + node.handleIn.x);
      minY = Math.min(minY, node.y + node.handleIn.y);
      maxY = Math.max(maxY, node.y + node.handleIn.y);
    }
    if (node.handleOut) {
      minX = Math.min(minX, node.x + node.handleOut.x);
      maxX = Math.max(maxX, node.x + node.handleOut.x);
      minY = Math.min(minY, node.y + node.handleOut.y);
      maxY = Math.max(maxY, node.y + node.handleOut.y);
    }
  });

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY
  };
}

export function getShapesCenter(shapes: Shape[]): Point2D {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  shapes.forEach(shape => {
    shape.nodes.forEach(node => {
      sumX += node.x;
      sumY += node.y;
      count++;
    });
  });

  if (count === 0) return { x: 0, y: 0 };
  return { x: sumX / count, y: sumY / count };
}

export function translateShape(shape: Shape, dx: number, dy: number): Shape {
  return {
    ...shape,
    nodes: shape.nodes.map(node => ({
      ...node,
      x: node.x + dx,
      y: node.y + dy
    }))
  };
}

export function scaleShape(shape: Shape, scaleX: number, scaleY: number, center: Point2D): Shape {
  return {
    ...shape,
    nodes: shape.nodes.map(node => {
      const px = node.x - center.x;
      const py = node.y - center.y;
      return {
        ...node,
        x: center.x + px * scaleX,
        y: center.y + py * scaleY,
        // Scale Bezier Handles relative to anchor
        handleIn: node.handleIn ? { x: node.handleIn.x * scaleX, y: node.handleIn.y * scaleY } : null,
        handleOut: node.handleOut ? { x: node.handleOut.x * scaleX, y: node.handleOut.y * scaleY } : null
      };
    })
  };
}

export function rotateShape(shape: Shape, angleRad: number, center: Point2D): Shape {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  return {
    ...shape,
    nodes: shape.nodes.map(node => {
      const px = node.x - center.x;
      const py = node.y - center.y;

      const rx = px * cos - py * sin;
      const ry = px * sin + py * cos;

      // Rotate handle vectors
      const hIn = node.handleIn;
      const rHIn = hIn ? {
        x: hIn.x * cos - hIn.y * sin,
        y: hIn.x * sin + hIn.y * cos
      } : null;

      const hOut = node.handleOut;
      const rHOut = hOut ? {
        x: hOut.x * cos - hOut.y * sin,
        y: hOut.x * sin + hOut.y * cos
      } : null;

      return {
        ...node,
        x: center.x + rx,
        y: center.y + ry,
        handleIn: rHIn,
        handleOut: rHOut
      };
    })
  };
}

export function mirrorShape(shape: Shape, type: 'h' | 'v', center: Point2D): Shape {
  return {
    ...shape,
    nodes: shape.nodes.map(node => {
      const hIn = node.handleIn;
      const hOut = node.handleOut;

      if (type === 'h') {
        const px = node.x - center.x;
        // Reversing bezier handles horizontally swaps their left/right nature as well (or flips directions)
        return {
          ...node,
          x: center.x - px,
          handleIn: hIn ? { x: -hIn.x, y: hIn.y } : null,
          handleOut: hOut ? { x: -hOut.x, y: hOut.y } : null
        };
      } else {
        const py = node.y - center.y;
        return {
          ...node,
          y: center.y - py,
          handleIn: hIn ? { x: hIn.x, y: -hIn.y } : null,
          handleOut: hOut ? { x: hOut.x, y: -hOut.y } : null
        };
      }
    })
  };
}

// Convert Shape to SVG Path string for canvas/preview rendering
export function shapeToSvgString(shape: Shape): string {
  if (shape.nodes.length === 0) return '';
  const parts: string[] = [];
  const nodes = shape.nodes;

  const startPt = nodes[0];
  parts.push(`M ${startPt.x} ${startPt.y}`);

  for (let i = 0; i < nodes.length; i++) {
    if (i === nodes.length - 1 && !shape.closed) break;

    const curr = nodes[i];
    const next = nodes[(i + 1) % nodes.length];

    if (curr.handleOut || next.handleIn) {
      const cp1x = curr.x + (curr.handleOut?.x ?? 0);
      const cp1y = curr.y + (curr.handleOut?.y ?? 0);
      const cp2x = next.x + (next.handleIn?.x ?? 0);
      const cp2y = next.y + (next.handleIn?.y ?? 0);
      parts.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
    } else {
      parts.push(`L ${next.x} ${next.y}`);
    }
  }

  if (shape.closed) {
    parts.push('Z');
  }

  return parts.join(' ');
}

// AUTO-CORRECTION: Converts rough hand-drawn strokes into perfect geometry.
// Points are in Font Units.
export function fitShapeFromStroke(stroke: Point2D[]): Shape | null {
  if (stroke.length < 5) return null;

  // Let's analyze the stroke bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let avgX = 0;
  let avgY = 0;

  stroke.forEach(pt => {
    minX = Math.min(minX, pt.x);
    maxX = Math.max(maxX, pt.x);
    minY = Math.min(minY, pt.y);
    maxY = Math.max(maxY, pt.y);
    avgX += pt.x;
    avgY += pt.y;
  });

  avgX /= stroke.length;
  avgY /= stroke.length;

  const w = maxX - minX;
  const h = maxY - minY;
  const maxDim = Math.max(w, h);
  const minDim = Math.min(w, h);
  const startPt = stroke[0];
  const endPt = stroke[stroke.length - 1];

  // If the stroke starts and ends very far from each other, it's likely an OPEN stroke (like a LINE)
  const gap = distance(startPt, endPt);
  const strokePathLength = stroke.reduce((acc, pt, idx) => {
    if (idx === 0) return 0;
    return acc + distance(stroke[idx - 1], pt);
  }, 0);

  // 1. Is it a Straight Line?
  // If the gap is close to the stroke length and starting/ending points represent the path
  if (gap > strokePathLength * 0.85) {
    return createLine(startPt, endPt);
  }

  // 2. Is it a Closed-ish Shape? (Gap is relatively small compared to dimensions)
  if (gap < maxDim * 0.5) {
    // Check if it's circular/elliptical
    // In a circle/ellipse, the distance from each point to the center is relatively uniform
    const radii: number[] = [];
    stroke.forEach(pt => {
      // Calculate normalized radius based on aspect ratio of bounding box
      const normX = (pt.x - avgX) / (w / 2 || 1);
      const normY = (pt.y - avgY) / (h / 2 || 1);
      radii.push(Math.hypot(normX, normY));
    });

    const avgRadiusRatio = radii.reduce((s, r) => s + r, 0) / radii.length;
    let radiusVariance = 0;
    radii.forEach(r => {
      radiusVariance += Math.pow(r - avgRadiusRatio, 2);
    });
    radiusVariance /= radii.length;

    // A very low variance in radial distance means it's a circle or ellipse
    if (radiusVariance < 0.05) {
      if (Math.abs(w - h) < maxDim * 0.25) {
        // Perfect circle
        const r = (w + h) / 4;
        return createCircle(avgX, avgY, r);
      } else {
        // Ellipse approximated by circle handles scaled
        const cx = avgX;
        const cy = avgY;
        const rx = w / 2;
        const ry = h / 2;
        
        const shape = createCircle(cx, cy, 100);
        return scaleShape(shape, rx / 100, ry / 100, { x: cx, y: cy });
      }
    }

    // 3. Is it a Rectangle?
    // Check if points align closely to a bounding box
    let devRect = 0;
    stroke.forEach(pt => {
      const toLeft = Math.abs(pt.x - minX);
      const toRight = Math.abs(pt.x - maxX);
      const toBottom = Math.abs(pt.y - minY);
      const toTop = Math.abs(pt.y - maxY);
      // Min distance to any of the 4 bounding box sides
      devRect += Math.min(toLeft, toRight, toBottom, toTop);
    });
    devRect /= stroke.length;

    // Low deviation from any of the edges indicates a rectangular gesture
    if (devRect < maxDim * 0.12) {
      return createRectangle(minX, minY, w, h);
    }

    // 4. Fallback: Polygon / Smooth freehand path
    // Let's simplify the stroke to fit a 5-sided polygon or keep as simplified path node chain
    const step = Math.max(1, Math.floor(stroke.length / 8));
    const nodes: PathNode[] = [];
    for (let i = 0; i < stroke.length; i += step) {
      nodes.push({
        id: generateId(),
        x: Math.round(stroke[i].x),
        y: Math.round(stroke[i].y),
        handleIn: null,
        handleOut: null,
        type: 'corner'
      });
    }

    return {
      id: generateId(),
      name: 'Trazado Libre Bocetado',
      type: 'freehand',
      nodes,
      closed: true,
      reverseWinding: false,
      visible: true,
      locked: false
    };
  }

  // Fallback: Simplest simplified open path
  const nodes: PathNode[] = [];
  const step = Math.max(1, Math.floor(stroke.length / 6));
  for (let i = 0; i < stroke.length; i += step) {
    nodes.push({
      id: generateId(),
      x: Math.round(stroke[i].x),
      y: Math.round(stroke[i].y),
      handleIn: null,
      handleOut: null,
      type: 'corner'
    });
  }
  // Ensure we add the last point
  if (nodes[nodes.length - 1].x !== stroke[stroke.length - 1].x) {
    nodes.push({
      id: generateId(),
      x: Math.round(stroke[stroke.length - 1].x),
      y: Math.round(stroke[stroke.length - 1].y),
      handleIn: null,
      handleOut: null,
      type: 'corner'
    });
  }

  return {
    id: generateId(),
    name: 'Curva Libre Abierta',
    type: 'freehand',
    nodes,
    closed: false,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}
