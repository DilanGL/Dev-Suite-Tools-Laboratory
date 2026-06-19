import { FontProject, Glyph, Shape, PathNode } from '../types';

export const DEFAULT_CHAR_LIST = [
  // Uppercase
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'Á', 'É', 'Í', 'Ó', 'Ú',
  // Lowercase
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'á', 'é', 'í', 'ó', 'ú',
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // Symbols
  '!', '?', '.', ',', ';', ':', '-', '_', '+', '=', '*', '/', '(', ')', '[', ']', '{', '}', '&', '@', '$', '%', '#'
];

// Generate simple unique IDs for preset pieces
function genId(prefix: string = 'pre'): string {
  return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

// Helper to create a rect shape compatible with our schema
function makeRectShape(name: string, x: number, y: number, w: number, h: number): Shape {
  const sId = genId('shape');
  const nodes: PathNode[] = [
    { id: genId('node'), x, y: y + h, handleIn: null, handleOut: null, type: 'corner' },
    { id: genId('node'), x: x + w, y: y + h, handleIn: null, handleOut: null, type: 'corner' },
    { id: genId('node'), x: x + w, y, handleIn: null, handleOut: null, type: 'corner' },
    { id: genId('node'), x, y, handleIn: null, handleOut: null, type: 'corner' }
  ];
  return {
    id: sId,
    name,
    type: 'rectangle',
    nodes,
    closed: true,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}

// Helper to create a circle shape with bezier anchors
function makeCircleShape(name: string, cx: number, cy: number, r: number, reverseWinding = false): Shape {
  const sId = genId('shape');
  const KAPPA = 0.552284749831;
  const handleLen = r * KAPPA;
  const nodes: PathNode[] = [
    {
      id: genId('node'),
      x: cx,
      y: cy + r,
      handleIn: { x: -handleLen, y: 0 },
      handleOut: { x: handleLen, y: 0 },
      type: 'smooth'
    },
    {
      id: genId('node'),
      x: cx + r,
      y: cy,
      handleIn: { x: 0, y: handleLen },
      handleOut: { x: 0, y: -handleLen },
      type: 'smooth'
    },
    {
      id: genId('node'),
      x: cx,
      y: cy - r,
      handleIn: { x: handleLen, y: 0 },
      handleOut: { x: -handleLen, y: 0 },
      type: 'smooth'
    },
    {
      id: genId('node'),
      x: cx - r,
      y: cy,
      handleIn: { x: 0, y: -handleLen },
      handleOut: { x: 0, y: handleLen },
      type: 'smooth'
    }
  ];
  return {
    id: sId,
    name,
    type: 'circle',
    nodes,
    closed: true,
    reverseWinding,
    visible: true,
    locked: false
  };
}

// Helper to create a single lines path
function makeLineShape(name: string, x1: number, y1: number, x2: number, y2: number): Shape {
  const sId = genId('shape');
  const nodes: PathNode[] = [
    { id: genId('node'), x: x1, y: y1, handleIn: null, handleOut: null, type: 'corner' },
    { id: genId('node'), x: x2, y: y2, handleIn: null, handleOut: null, type: 'corner' }
  ];
  return {
    id: sId,
    name,
    type: 'line',
    nodes,
    closed: false,
    reverseWinding: false,
    visible: true,
    locked: false
  };
}

// Creates basic blank font project
export function createDefaultProject(name: string = 'Nueva Tipografía'): FontProject {
  const glyphs: { [char: string]: Glyph } = {};

  DEFAULT_CHAR_LIST.forEach(char => {
    glyphs[char] = {
      char,
      unicode: char.charCodeAt(0),
      advanceWidth: char === 'I' || char === 'i' || char === 'l' || char === '!' || char === '.' ? 400 : 
                    char === 'M' || char === 'W' || char === 'm' || char === 'w' ? 850 : 650,
      shapes: []
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

// Loaded presets collection
export const PREMADE_FONTS = [
  { id: 'geometric', name: '🎛️ Moderna Geométrica', desc: 'Contornos construidos con círculos elegantes, rectángulos técnicos y proporciones limpias.' },
  { id: 'blocky', name: '👾 Retro Blocky (Pixel)', desc: 'Tipografía nostálgica al estilo 8-bit creada a base de bloques de alta densidad.' },
  { id: 'stencil', name: '📐 Boceto Constructivista', desc: 'Wireframe con líneas trazadas rectas estilo arquitectónico sin relleno cerrado.' }
];

// Generates high quality preset glyph layouts dynamically
export function createPremadeProject(presetId: string): FontProject {
  const proj = createDefaultProject(
    presetId === 'geometric' ? 'Moderna Geometria' : 
    presetId === 'blocky' ? 'Retro Blocky Pixel' : 'Boceto Constructivista'
  );

  const g = proj.glyphs;

  if (presetId === 'geometric') {
    // A: custom three-member clean outline blocks scale
    g['A'].shapes = [
      {
        id: genId('shape'), name: 'Tallo Izq', type: 'path', closed: true, reverseWinding: false, visible: true, locked: false,
        nodes: [
          { id: genId('node'), x: 100, y: 0, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 280, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 360, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 180, y: 0, handleIn: null, handleOut: null, type: 'corner' }
        ]
      },
      {
        id: genId('shape'), name: 'Tallo Der', type: 'path', closed: true, reverseWinding: false, visible: true, locked: false,
        nodes: [
          { id: genId('node'), x: 300, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 480, y: 0, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 400, y: 0, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 220, y: 680, handleIn: null, handleOut: null, type: 'corner' }
        ]
      },
      makeRectShape('Travesaño', 180, 180, 220, 60)
    ];

    // E: simple straight lines block
    g['E'].shapes = [
      makeRectShape('Columna', 100, 0, 75, 680),
      makeRectShape('Brazo Base', 175, 0, 320, 75),
      makeRectShape('Brazo Medio', 175, 300, 240, 75),
      makeRectShape('Brazo Superior', 175, 605, 320, 75)
    ];

    // F: similar to E
    g['F'].shapes = [
      makeRectShape('Columna', 100, 0, 75, 680),
      makeRectShape('Brazo Medio', 175, 305, 240, 75),
      makeRectShape('Brazo Superior', 175, 605, 320, 75)
    ];

    // H:
    g['H'].shapes = [
      makeRectShape('Poste Izq', 100, 0, 75, 680),
      makeRectShape('Poste Der', 450, 0, 75, 680),
      makeRectShape('Barra Media', 175, 300, 275, 75)
    ];

    // I:
    g['I'].shapes = [
      makeRectShape('Fuste Central', 260, 0, 80, 680)
    ];

    // L:
    g['L'].shapes = [
      makeRectShape('Fuste', 150, 0, 75, 680),
      makeRectShape('Base', 225, 0, 275, 75)
    ];

    // O: beautiful circle mask cutout
    g['O'].shapes = [
      makeCircleShape('Aro Exterior', 320, 340, 280, false),
      makeCircleShape('Corte Interior', 320, 340, 180, true)
    ];

    // T:
    g['T'].shapes = [
      makeRectShape('Cabezal', 120, 605, 360, 75),
      makeRectShape('Fuste', 260, 0, 80, 605)
    ];

    // o: lowercase
    g['o'].shapes = [
      makeCircleShape('Aro Ext Min', 300, 240, 210, false),
      makeCircleShape('Corte Int Min', 300, 240, 130, true)
    ];

    // x: diagonal crosses
    g['X'].shapes = [
      {
        id: genId('shape'), name: 'Diana 1', type: 'path', closed: true, reverseWinding: false, visible: true, locked: false,
        nodes: [
          { id: genId('node'), x: 100, y: 0, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 420, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 480, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 160, y: 0, handleIn: null, handleOut: null, type: 'corner' }
        ]
      },
      {
        id: genId('shape'), name: 'Diana 2', type: 'path', closed: true, reverseWinding: false, visible: true, locked: false,
        nodes: [
          { id: genId('node'), x: 420, y: 0, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 100, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 160, y: 680, handleIn: null, handleOut: null, type: 'corner' },
          { id: genId('node'), x: 480, y: 0, handleIn: null, handleOut: null, type: 'corner' }
        ]
      }
    ];

  } else if (presetId === 'blocky') {
    // Chunkier video-game bricks block styles
    // I:
    g['I'].shapes = [makeRectShape('Brick Stem', 240, 0, 110, 680)];
    
    // H:
    g['H'].shapes = [
      makeRectShape('Brick Left', 100, 0, 110, 680),
      makeRectShape('Brick Right', 420, 0, 110, 680),
      makeRectShape('Brick Crossbar', 210, 280, 210, 110)
    ];

    // O: Chunky hollow box
    g['O'].shapes = [
      makeRectShape('Box Outer', 100, 0, 420, 680),
      makeRectShape('Box Inner', 210, 110, 200, 460) // make sure reverse winding is true
    ];
    g['O'].shapes[1].reverseWinding = true;

    // E:
    g['E'].shapes = [
      makeRectShape('Stem', 100, 0, 110, 680),
      makeRectShape('Top', 210, 570, 310, 110),
      makeRectShape('Mid', 210, 285, 230, 110),
      makeRectShape('Bot', 210, 0, 310, 110)
    ];

    // L:
    g['L'].shapes = [
      makeRectShape('Stem', 100, 0, 110, 680),
      makeRectShape('Bot', 210, 0, 310, 110)
    ];

    // T:
    g['T'].shapes = [
      makeRectShape('Top Bar', 100, 570, 420, 110),
      makeRectShape('Col Stem', 255, 0, 110, 570)
    ];

    // A:
    g['A'].shapes = [
      makeRectShape('Stem Left', 100, 0, 110, 570),
      makeRectShape('Stem Right', 420, 0, 110, 570),
      makeRectShape('Top Bar', 100, 570, 430, 110),
      makeRectShape('Mid Bar', 210, 280, 210, 110)
    ];

  } else if (presetId === 'stencil') {
    // Constructivist style purely based on light, minimal single-lines
    g['I'].shapes = [makeLineShape('Línea stem', 300, 0, 300, 680)];
    g['H'].shapes = [
      makeLineShape('Línea Izq', 150, 0, 150, 680),
      makeLineShape('Línea Der', 450, 0, 450, 680),
      makeLineShape('Barra Cruce', 150, 340, 450, 340)
    ];
    g['T'].shapes = [
      makeLineShape('Línea Sombrero', 130, 680, 490, 680),
      makeLineShape('Línea Fuste', 310, 0, 310, 680)
    ];
    g['L'].shapes = [
      makeLineShape('Línea Fuste', 180, 680, 180, 0),
      makeLineShape('Línea Base', 180, 0, 450, 0)
    ];
    g['E'].shapes = [
      makeLineShape('Línea Fuste', 180, 680, 180, 0),
      makeLineShape('Línea Tejado', 180, 680, 460, 680),
      makeLineShape('Línea Corazón', 180, 340, 380, 340),
      makeLineShape('Línea Suelo', 180, 0, 460, 0)
    ];
    g['O'].shapes = [
      makeLineShape('Marco Izq', 160, 80, 160, 600),
      makeLineShape('Marco Sup', 160, 600, 450, 600),
      makeLineShape('Marco Der', 450, 600, 450, 80),
      makeLineShape('Marco Inf', 450, 80, 160, 80)
    ];
    g['X'].shapes = [
      makeLineShape('Diagonal 1', 150, 0, 455, 680),
      makeLineShape('Diagonal 2', 455, 0, 150, 680)
    ];
  }

  // All presets have updated times
  proj.updatedAt = Date.now();
  return proj;
}
