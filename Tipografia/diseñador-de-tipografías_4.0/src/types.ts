export interface Point2D {
  x: number;
  y: number;
}

export interface PathNode {
  id: string;
  x: number; // Anchor X coordinate (in Font Units, e.g., 0 to 1000)
  y: number; // Anchor Y coordinate (in Font Units, e.g., -200 to 800)
  handleIn: Point2D | null;  // Relative offset vector for incoming Bezier control point
  handleOut: Point2D | null; // Relative offset vector for outgoing Bezier control point
  type: 'corner' | 'smooth'; // Nodes can be sharp corners or smooth curves
}

export interface Shape {
  id: string;
  name: string;
  type: 'path' | 'rectangle' | 'circle' | 'polygon' | 'line' | 'freehand';
  nodes: PathNode[];
  closed: boolean;
  reverseWinding: boolean; // If true, contour is drawn in opposite direction to create a cut out/hole (e.g. inside of O)
  visible: boolean;
  locked: boolean;
}

export interface Glyph {
  char: string;       // E.g., 'A'
  unicode: number;    // E.g., 65
  advanceWidth: number; // Horizontal advance width (default e.g. 600)
  shapes: Shape[];    // List of active contours/paths
}

export interface FontMetrics {
  unitsPerEm: number;   // Usually 1000
  ascender: number;     // e.g., 800
  capHeight: number;    // e.g., 700
  xHeight: number;      // e.g., 480
  baseline: number;     // e.g., 0
  descender: number;    // e.g., -200
}

export interface FontProject {
  id: string;
  name: string;
  metrics: FontMetrics;
  glyphs: { [char: string]: Glyph }; // Maps character (e.g., 'A') to its Glyph data
  createdAt: number;
  updatedAt: number;
  kerning: { [pair: string]: number }; // Maps a pair of characters, e.g. "AV" to -50 Units
  isImported?: boolean;               // Flags if project was initialized from a binary TTF file
}

export interface EditorState {
  project: FontProject;
  activeChar: string;
  activeTool: ToolType;
  selectedShapeIds: string[];
  selectedNodeId: string | null;
  selectedHandleType: 'in' | 'out' | null; // Determines if editing handleIn or handleOut
  history: FontProject[];
  historyIndex: number;
  zoom: number;
  pan: Point2D;
  snapConfig: SnapConfig;
  autoCorrect: boolean;
}

export type ToolType = 
  | 'select'     // Move, rotate, scale complete shapes
  | 'node'       // Edit, add, delete nodes and control handles
  | 'freehand'   // Natural pen/mouse drawings
  | 'line'       // Point-to-point straight line
  | 'rectangle'  // Generates 4-node closed path
  | 'circle'     // Generates 4-node bezier closed path
  | 'polygon'    // Generates N-node closed path
  | 'bezier';    // Pen tool for plotting curve nodes

export interface SnapConfig {
  grid: boolean;
  nodes: boolean;
  guidelines: boolean;
  gridSize: number;
}
