import React, { useRef, useEffect, useState } from 'react';
import { 
  Point2D, 
  PathNode, 
  Shape, 
  Glyph, 
  FontMetrics, 
  ToolType, 
  SnapConfig 
} from '../types';
import { 
  fontToScreen, 
  screenToFont, 
  distance, 
  findSnapPoint, 
  createRectangle, 
  createCircle, 
  createPolygon, 
  createLine, 
  getShapesCenter, 
  translateShape, 
  scaleShape, 
  rotateShape, 
  mirrorShape, 
  generateId,
  fitShapeFromStroke
} from '../utils/geometry';

interface CanvasEditorProps {
  glyph: Glyph;
  metrics: FontMetrics;
  activeTool: ToolType;
  selectedShapeIds: string[];
  onSelectShapes: (ids: string[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onChangeGlyph: (glyph: Glyph) => void;
  zoom: number;
  pan: Point2D;
  onPan: (delta: Point2D) => void;
  snapConfig: SnapConfig;
  autoCorrect: boolean;
  stencilFont: 'sans-serif' | 'serif';
}

export default function CanvasEditor({
  glyph,
  metrics,
  activeTool,
  selectedShapeIds,
  onSelectShapes,
  selectedNodeId,
  onSelectNode,
  onChangeGlyph,
  zoom,
  pan,
  onPan,
  snapConfig,
  autoCorrect,
  stencilFont
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layout toggles
  const [isTipExpanded, setIsTipExpanded] = useState<boolean>(true);

  // Drag states
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDownScreenPt, setMouseDownScreenPt] = useState<Point2D>({ x: 0, y: 0 });
  const [mouseDownFontPt, setMouseDownFontPt] = useState<Point2D>({ x: 0, y: 0 });
  const [mouseCurrentFontPt, setMouseCurrentFontPt] = useState<Point2D>({ x: 0, y: 0 });

  const [dragAction, setDragAction] = useState<'pan' | 'select' | 'moveShape' | 'moveNode' | 'moveHandleIn' | 'moveHandleOut' | 'drawShape' | 'freehand' | 'adjustWidth' | null>(null);
  
  // Freehand points collected during active pen sketch
  const [freehandPoints, setFreehandPoints] = useState<Point2D[]>([]);
  
  // Custom cursor for different tools
  const [cursor, setCursor] = useState<string>('default');

  // Snapping UI feedback
  const [snapFeedback, setSnapFeedback] = useState<{ point: Point2D | null; type: string | null }>({ point: null, type: null });

  // Storing intermediate state during transformations
  const [shapeInitialStates, setShapeInitialStates] = useState<Shape[]>([]);
  const [nodeInitialState, setNodeInitialState] = useState<PathNode | null>(null);
  const [initialWidth, setInitialWidth] = useState<number>(0);

  // Resize observer to handle container scaling and maintain sharp canvas coordinates
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 800, height: height || 600 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const coordsContext = {
    width: dimensions.width,
    height: dimensions.height,
    pan,
    zoom,
    metrics
  };

  // Extract all points for snapping
  const getAllGlyphPoints = (): Point2D[] => {
    const list: Point2D[] = [];
    glyph.shapes.forEach(sh => {
      sh.nodes.forEach(no => {
        list.push({ x: no.x, y: no.y });
      });
    });
    return list;
  };

  // Drawing to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support sharp render on high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#121212'; // High Density Dark
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // 1. DRAW CUADRÍCULA (Grid)
    if (snapConfig.grid && snapConfig.gridSize > 0) {
      ctx.strokeStyle = '#222222'; // Subtle grid lines
      ctx.lineWidth = 1;

      // Draw grid aligned to layout
      const gridSpacing = snapConfig.gridSize;
      
      // Determine viewport bounding box in font units
      const topLeft = screenToFont({ x: 0, y: 0 }, coordsContext);
      const bottomRight = screenToFont({ x: dimensions.width, y: dimensions.height }, coordsContext);

      const startX = Math.floor(topLeft.x / gridSpacing) * gridSpacing;
      const endX = Math.ceil(bottomRight.x / gridSpacing) * gridSpacing;
      const startY = Math.floor(bottomRight.y / gridSpacing) * gridSpacing;
      const endY = Math.ceil(topLeft.y / gridSpacing) * gridSpacing;

      for (let x = startX; x <= endX; x += gridSpacing) {
        const pStart = fontToScreen({ x, y: startY }, coordsContext);
        const pEnd = fontToScreen({ x, y: endY }, coordsContext);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }

      for (let y = startY; y <= endY; y += gridSpacing) {
        const pStart = fontToScreen({ x: startX, y }, coordsContext);
        const pEnd = fontToScreen({ x: endX, y }, coordsContext);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }
    }

    // 2. DRAW STENCIL / PLANTILLA SEMITRANSPARENTE (Faint background template)
    ctx.save();
    const templatePt = fontToScreen({ x: 80, y: 0 }, coordsContext);
    const emScale = (dimensions.height * 0.6) / metrics.unitsPerEm * zoom;
    const fontSize = metrics.unitsPerEm * emScale; // Matches Em square precisely

    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.font = `${fontSize}px ${stencilFont === 'sans-serif' ? '"Inter", sans-serif' : '"Playfair Display", "Georgia", serif'}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(glyph.char, templatePt.x, templatePt.y);
    ctx.restore();

    // 3. DRAW GUIDELINES (Líneas guía profesionales)
    const guides = [
      { name: 'Ascendente', value: metrics.ascender, color: '#f87171', dashed: true },
      { name: 'Mayúsculas', value: metrics.capHeight, color: '#fb923c', dashed: true },
      { name: 'Altura x', value: metrics.xHeight, color: '#fbbf24', dashed: true },
      { name: 'Línea Base', value: metrics.baseline, color: '#3b82f6', dashed: false },
      { name: 'Descendente', value: metrics.descender, color: '#f87171', dashed: true }
    ];

    guides.forEach(guide => {
      const pLeft = fontToScreen({ x: -10000, y: guide.value }, coordsContext);
      const pRight = fontToScreen({ x: 10000, y: guide.value }, coordsContext);

      ctx.beginPath();
      ctx.strokeStyle = guide.color;
      ctx.lineWidth = guide.name === 'Línea Base' ? 1.5 : 1;
      if (guide.dashed) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Guide label on screen left margin
      ctx.fillStyle = guide.color;
      ctx.font = '9px monospace';
      ctx.fillText(guide.name, 10, pLeft.y - 4);
    });

    // Vertical origin (x = 0) and spacing lines (x = advanceWidth)
    const originStart = fontToScreen({ x: 0, y: -2000 }, coordsContext);
    const originEnd = fontToScreen({ x: 0, y: 2000 }, coordsContext);
    
    ctx.beginPath();
    ctx.strokeStyle = '#a3a3a3'; // Light grey for origin
    ctx.lineWidth = 1.2;
    ctx.moveTo(originStart.x, originStart.y);
    ctx.lineTo(originEnd.x, originEnd.y);
    ctx.stroke();

    const widthStart = fontToScreen({ x: glyph.advanceWidth, y: -2000 }, coordsContext);
    const widthEnd = fontToScreen({ x: glyph.advanceWidth, y: 2000 }, coordsContext);

    ctx.beginPath();
    ctx.strokeStyle = '#ff6b00'; // Orange for character width boundary
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.moveTo(widthStart.x, widthStart.y);
    ctx.lineTo(widthEnd.x, widthEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Character advance width banner handle
    const widthLabelPt = fontToScreen({ x: glyph.advanceWidth, y: metrics.ascender + 40 }, coordsContext);
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(widthLabelPt.x - 55, widthLabelPt.y - 12, 110, 20);
    ctx.fillStyle = '#121212';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ANCHO: ${Math.round(glyph.advanceWidth)}`, widthLabelPt.x, widthLabelPt.y + 1);
    ctx.textAlign = 'left';

    // 4. DRAW SYSTEM SHAPES
    glyph.shapes.forEach((shape) => {
      if (!shape.visible) return;

      const isShapeSelected = selectedShapeIds.includes(shape.id);
      ctx.beginPath();
      
      const pNodes = shape.nodes.map(node => fontToScreen(node, coordsContext));
      if (pNodes.length === 0) return;

      // Draw vector contour with bezier paths
      ctx.moveTo(pNodes[0].x, pNodes[0].y);

      // Create SVG path string visually on canvas
      for (let i = 0; i < shape.nodes.length; i++) {
        if (i === shape.nodes.length - 1 && !shape.closed) break;
        const currNode = shape.nodes[i];
        const nextNode = shape.nodes[(i + 1) % shape.nodes.length];

        const currScr = pNodes[i];
        const nextScr = pNodes[(i + 1) % pNodes.length];

        if (currNode.handleOut || nextNode.handleIn) {
          const cp1 = fontToScreen({ 
            x: currNode.x + (currNode.handleOut?.x ?? 0), 
            y: currNode.y + (currNode.handleOut?.y ?? 0) 
          }, coordsContext);
          
          const cp2 = fontToScreen({ 
            x: nextNode.x + (nextNode.handleIn?.x ?? 0), 
            y: nextNode.y + (nextNode.handleIn?.y ?? 0) 
          }, coordsContext);

          ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, nextScr.x, nextScr.y);
        } else {
          ctx.lineTo(nextScr.x, nextScr.y);
        }
      }

      if (shape.closed) {
        ctx.closePath();
      }

      // Fill style depending on winding order
      // Overlapping contours or holes
      if (shape.reverseWinding) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)'; // Red-ish hole indicator overlay
      } else {
        ctx.fillStyle = isShapeSelected ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 107, 0, 0.05)';
      }
      ctx.fill();

      // Stroke style
      ctx.strokeStyle = isShapeSelected ? '#ff6b00' : shape.reverseWinding ? '#ef4444' : '#e5e5e5';
      ctx.lineWidth = isShapeSelected ? 2.5 : 1.5;
      ctx.stroke();

      // IF editing nodes or selected, draw shape anchors
      if (isShapeSelected || activeTool === 'node') {
        shape.nodes.forEach(node => {
          const scrPt = fontToScreen(node, coordsContext);
          const isSelectedNode = selectedNodeId === node.id;

          // Draw handles first (underlay)
          if (isSelectedNode) {
            if (node.handleIn) {
              const hInScr = fontToScreen({ x: node.x + node.handleIn.x, y: node.y + node.handleIn.y }, coordsContext);
              ctx.beginPath();
              ctx.strokeStyle = '#c084fc'; // Purple handles
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]);
              ctx.moveTo(scrPt.x, scrPt.y);
              ctx.lineTo(hInScr.x, hInScr.y);
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.beginPath();
              ctx.fillStyle = '#c084fc';
              ctx.arc(hInScr.x, hInScr.y, 4, 0, 2 * Math.PI);
              ctx.fill();
            }

            if (node.handleOut) {
              const hOutScr = fontToScreen({ x: node.x + node.handleOut.x, y: node.y + node.handleOut.y }, coordsContext);
              ctx.beginPath();
              ctx.strokeStyle = '#818cf8'; // Indigo handles
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]);
              ctx.moveTo(scrPt.x, scrPt.y);
              ctx.lineTo(hOutScr.x, hOutScr.y);
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.beginPath();
              ctx.fillStyle = '#818cf8';
              ctx.arc(hOutScr.x, hOutScr.y, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
          }

          // Anchor points on top
          ctx.beginPath();
          ctx.fillStyle = isSelectedNode ? '#ff6b00' : '#3b82f6'; // Blue nodes, orange when selected
          if (node.type === 'smooth') {
            ctx.arc(scrPt.x, scrPt.y, 5, 0, 2 * Math.PI);
          } else {
            // Corner node is square-shaped
            ctx.fillRect(scrPt.x - 4, scrPt.y - 4, 8, 8);
          }
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    });

    // 5. DRAW ACTIVE CREATION feedback (temporary outlines while drawing)
    if (isMouseDown && dragAction === 'drawShape') {
      const pStart = fontToScreen(mouseDownFontPt, coordsContext);
      const pCurrent = fontToScreen(mouseCurrentFontPt, coordsContext);

      ctx.save();
      ctx.strokeStyle = '#ff6b00';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pCurrent.x, pCurrent.y);
        ctx.stroke();
      } else if (activeTool === 'rectangle') {
        ctx.strokeRect(pStart.x, pStart.y, pCurrent.x - pStart.x, pCurrent.y - pStart.y);
      } else if (activeTool === 'circle') {
        const radius = distance(mouseDownFontPt, mouseCurrentFontPt);
        const radiusScr = radius * ((dimensions.height * 0.6) / metrics.unitsPerEm * zoom);
        ctx.beginPath();
        ctx.arc(pStart.x, pStart.y, radiusScr, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'polygon') {
        const radius = distance(mouseDownFontPt, mouseCurrentFontPt);
        const radiusScr = radius * ((dimensions.height * 0.6) / metrics.unitsPerEm * zoom);
        // Draw 5-sided temp polygon
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = pStart.x + radiusScr * Math.cos(angle);
          const py = pStart.y + radiusScr * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Freehand drawing points
    if (freehandPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7'; // Purple freehand stroke
      ctx.lineWidth = 2.5;
      for (let i = 0; i < freehandPoints.length; i++) {
        const scrPt = fontToScreen(freehandPoints[i], coordsContext);
        if (i === 0) ctx.moveTo(scrPt.x, scrPt.y);
        else ctx.lineTo(scrPt.x, scrPt.y);
      }
      ctx.stroke();
    }

    // 6. DRAW SNAP indicator feedback (faint rings on grids/lines)
    if (snapFeedback.point && snapFeedback.type) {
      const pSnap = fontToScreen(snapFeedback.point, coordsContext);
      ctx.beginPath();
      ctx.strokeStyle = '#34d399'; // Emerald snap
      ctx.lineWidth = 1;
      ctx.arc(pSnap.x, pSnap.y, 8, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.fillStyle = '#34d399';
      ctx.font = '10px monospace';
      ctx.fillText(snapFeedback.type, pSnap.x + 12, pSnap.y + 4);
    }

    // 7. Render dynamic text instructions
    ctx.fillStyle = '#525252';
    ctx.font = '10px monospace';
    ctx.fillText(`Lienzo: Zoom ${Math.round(zoom * 100)}% | Pan (${Math.round(pan.x)}, ${Math.round(pan.y)})`, dimensions.width - 200, dimensions.height - 15);

  }, [glyph, metrics, activeTool, selectedShapeIds, selectedNodeId, zoom, pan, snapConfig, stencilFont, dimensions, dragAction, isMouseDown, mouseDownFontPt, mouseCurrentFontPt, freehandPoints, snapFeedback]);

  // Adjust cursor on tool hover
  useEffect(() => {
    if (activeTool === 'select') setCursor('default');
    else if (activeTool === 'node') setCursor('crosshair');
    else if (activeTool === 'freehand') setCursor('pencil');
    else if (activeTool === 'bezier') setCursor('crosshair');
    else setCursor('crosshair');
  }, [activeTool]);

  // General Mouse Down Events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const screenPt = { x: screenX, y: screenY };

    const fontPt = screenToFont(screenPt, coordsContext);

    setIsMouseDown(true);
    setMouseDownScreenPt(screenPt);
    setMouseDownFontPt(fontPt);
    setMouseCurrentFontPt(fontPt);

    // Mid-button or Space-key drag or holding Cmd/Ctrl triggers workspace PAN
    if (e.button === 1 || e.shiftKey) {
      setDragAction('pan');
      return;
    }

    // 1. Dragging CHARACTER WIDTH boundary line (x = advanceWidth)
    const emScale = (dimensions.height * 0.6) / metrics.unitsPerEm * zoom;
    const thresholdScreen = 12; // pixels
    const boundaryXScr = fontToScreen({ x: glyph.advanceWidth, y: 0 }, coordsContext).x;
    if (Math.abs(screenX - boundaryXScr) < thresholdScreen) {
      setDragAction('adjustWidth');
      setInitialWidth(glyph.advanceWidth);
      return;
    }

    // 2. Node Selection & Editing Mode
    if (activeTool === 'node') {
      let foundNode = false;
      let foundHandle = false;

      // Check if clicking near active Selected Node handles (these are priority hits!)
      if (selectedNodeId) {
        // Find the node
        let activeNode: PathNode | null = null;
        let parentShape: Shape | null = null;
        glyph.shapes.forEach(sh => {
          const matching = sh.nodes.find(n => n.id === selectedNodeId);
          if (matching) {
            activeNode = matching;
            parentShape = sh;
          }
        });

        if (activeNode && parentShape) {
          const anchorScr = fontToScreen(activeNode, coordsContext);
          
          if (activeNode.handleIn) {
            const hInAbs = { x: activeNode.x + activeNode.handleIn.x, y: activeNode.y + activeNode.handleIn.y };
            const hInScr = fontToScreen(hInAbs, coordsContext);
            if (distance(screenPt, hInScr) < 8) {
              setDragAction('moveHandleIn');
              setNodeInitialState({ ...activeNode });
              foundHandle = true;
            }
          }

          if (!foundHandle && activeNode.handleOut) {
            const hOutAbs = { x: activeNode.x + activeNode.handleOut.x, y: activeNode.y + activeNode.handleOut.y };
            const hOutScr = fontToScreen(hOutAbs, coordsContext);
            if (distance(screenPt, hOutScr) < 8) {
              setDragAction('moveHandleOut');
              setNodeInitialState({ ...activeNode });
              foundHandle = true;
            }
          }
        }
      }

      if (foundHandle) return;

      // Look for a node anchor
      for (const sh of glyph.shapes) {
        if (!sh.visible || sh.locked) continue;
        for (const node of sh.nodes) {
          const nodeScr = fontToScreen(node, coordsContext);
          if (distance(screenPt, nodeScr) < 10) {
            onSelectNode(node.id);
            onSelectShapes([sh.id]); // Parent shape selected
            setNodeInitialState({ ...node });
            setDragAction('moveNode');
            foundNode = true;
            break;
          }
        }
        if (foundNode) break;
      }

      if (foundNode) return;

      // Clicked on empty space: clear selected node
      onSelectNode(null);
      setDragAction('select');
      return;
    }

    // 3. Classical Vector Selection Tool
    if (activeTool === 'select') {
      // Find if clicking inside bounding box of any shape
      let clickedShapeId: string | null = null;
      for (let i = glyph.shapes.length - 1; i >= 0; i--) {
        const sh = glyph.shapes[i];
        if (!sh.visible || sh.locked) continue;

        // Simple box check
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        sh.nodes.forEach(n => {
          minX = Math.min(minX, n.x);
          maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y);
          maxY = Math.max(maxY, n.y);
        });

        const pad = 12 / emScale; // buffer
        if (fontPt.x >= minX - pad && fontPt.x <= maxX + pad && fontPt.y >= minY - pad && fontPt.y <= maxY + pad) {
          clickedShapeId = sh.id;
          break;
        }
      }

      if (clickedShapeId) {
        if (e.shiftKey) {
          // Toggle selection
          const current = [...selectedShapeIds];
          if (current.includes(clickedShapeId)) {
            onSelectShapes(current.filter(id => id !== clickedShapeId));
          } else {
            onSelectShapes([...current, clickedShapeId]);
          }
        } else {
          // Normal select
          if (!selectedShapeIds.includes(clickedShapeId)) {
            onSelectShapes([clickedShapeId]);
          }
        }
        
        // Setup initial transformation states
        const selectedShapes = glyph.shapes.filter(s => selectedShapeIds.includes(s.id) || s.id === clickedShapeId);
        setShapeInitialStates(JSON.parse(JSON.stringify(selectedShapes))); // Deep copy
        setDragAction('moveShape');
      } else {
        // Clicking on blank space
        if (!e.shiftKey) {
          onSelectShapes([]);
        }
        setDragAction('select');
      }
      return;
    }

    // 4. Bezier Pen Plotting Mode
    if (activeTool === 'bezier') {
      // Find if we are continuing or starting a bezier path
      // Let's check if we click near the FIRST node of the active selected shape to CLOSE it
      let activeShape = glyph.shapes.find(s => selectedShapeIds.includes(s.id) && s.type === 'path');

      if (activeShape && activeShape.nodes.length > 0) {
        const firstNode = activeShape.nodes[0];
        const firstNodeScr = fontToScreen(firstNode, coordsContext);

        if (distance(screenPt, firstNodeScr) < 12) {
          // Close active path!
          const updatedShapes = glyph.shapes.map(s => {
            if (s.id === activeShape!.id) {
              return { ...s, closed: true };
            }
            return s;
          });
          onChangeGlyph({ ...glyph, shapes: updatedShapes });
          onSelectNode(null);
          return;
        }
      }

      // Add a node
      let snapTargetPt = fontPt;
      let snapType: string | null = null;
      if (snapConfig.grid || snapConfig.nodes || snapConfig.guidelines) {
        const snap = findSnapPoint(fontPt, coordsContext, snapConfig, getAllGlyphPoints());
        snapTargetPt = snap.point;
        snapType = snap.snapType;
      }

      const newNode: PathNode = {
        id: generateId(),
        x: Math.round(snapTargetPt.x),
        y: Math.round(snapTargetPt.y),
        handleIn: { x: -40, y: 0 },  // standard default curve handles for next line drags
        handleOut: { x: 40, y: 0 },
        type: 'corner'
      };

      if (activeShape && !activeShape.closed) {
        // Appending node to open path
        const updatedShapes = glyph.shapes.map(s => {
          if (s.id === activeShape!.id) {
            return {
              ...s,
              nodes: [...s.nodes, newNode]
            };
          }
          return s;
        });
        onChangeGlyph({ ...glyph, shapes: updatedShapes });
        onSelectNode(newNode.id);
      } else {
        // Creating a new open shape
        const newShape: Shape = {
          id: generateId(),
          name: `Curva Bézier ${glyph.shapes.length + 1}`,
          type: 'path',
          nodes: [{ ...newNode, handleIn: null, handleOut: null }], // first node doesn't need handles until dragged
          closed: false,
          reverseWinding: false,
          visible: true,
          locked: false
        };
        onChangeGlyph({ ...glyph, shapes: [...glyph.shapes, newShape] });
        onSelectShapes([newShape.id]);
        onSelectNode(newNode.id);
      }
      return;
    }

    // 5. Freehand Sketching Pen
    if (activeTool === 'freehand') {
      setDragAction('freehand');
      setFreehandPoints([fontPt]);
      return;
    }

    // 6. Geometric Drag-Creation Tools
    if (['rectangle', 'circle', 'polygon', 'line'].includes(activeTool)) {
      setDragAction('drawShape');
      return;
    }
  };

  // Dragging & Mouse Move Events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const screenPt = { x: screenX, y: screenY };

    let fontPt = screenToFont(screenPt, coordsContext);
    setMouseCurrentFontPt(fontPt);

    // Apply Smart Snapping Live on Mouse Move
    let snapResultPt = { ...fontPt };
    let didSnapX = false;
    let didSnapY = false;
    let snapLabel: string | null = null;

    if (isMouseDown && dragAction !== 'pan' && dragAction !== 'adjustWidth') {
      if (snapConfig.grid || snapConfig.nodes || snapConfig.guidelines) {
        const snap = findSnapPoint(fontPt, coordsContext, snapConfig, getAllGlyphPoints(), selectedNodeId);
        snapResultPt = snap.point;
        didSnapX = snap.snappedX;
        didSnapY = snap.snappedY;
        snapLabel = snap.snapType;
      }
    }

    // Update snap visual feedback state
    if (snapLabel) {
      setSnapFeedback({ point: snapResultPt, type: snapLabel });
    } else {
      setSnapFeedback({ point: null, type: null });
    }

    if (!isMouseDown) return;

    // Execute active dragging action
    if (dragAction === 'pan') {
      const dx = screenPt.x - mouseDownScreenPt.x;
      const dy = screenPt.y - mouseDownScreenPt.y;
      onPan({ x: pan.x + dx, y: pan.y + dy });
      setMouseDownScreenPt(screenPt);
      return;
    }

    // Adjust Glyph Advance Width limit
    if (dragAction === 'adjustWidth') {
      const deltaX = fontPt.x - mouseDownFontPt.x;
      const newWidth = Math.max(100, Math.round(initialWidth + deltaX));
      onChangeGlyph({
        ...glyph,
        advanceWidth: newWidth
      });
      return;
    }

    // Translating whole Vector Shapes
    if (dragAction === 'moveShape' && shapeInitialStates.length > 0) {
      const dx = Math.round(fontPt.x - mouseDownFontPt.x);
      const dy = Math.round(fontPt.y - mouseDownFontPt.y);

      const modifiedShapes = glyph.shapes.map(s => {
        const initial = shapeInitialStates.find(init => init.id === s.id);
        if (initial) {
          return translateShape(initial, dx, dy);
        }
        return s;
      });

      onChangeGlyph({ ...glyph, shapes: modifiedShapes });
      return;
    }

    // Moving single anchor Node
    if (dragAction === 'moveNode' && selectedNodeId && nodeInitialState) {
      const targetX = Math.round(snapResultPt.x);
      const targetY = Math.round(snapResultPt.y);

      const modifiedShapes = glyph.shapes.map(s => {
        if (s.nodes.some(n => n.id === selectedNodeId)) {
          return {
            ...s,
            nodes: s.nodes.map(n => {
              if (n.id === selectedNodeId) {
                return {
                  ...n,
                  x: targetX,
                  y: targetY
                };
              }
              return n;
            })
          };
        }
        return s;
      });

      onChangeGlyph({ ...glyph, shapes: modifiedShapes });
      return;
    }

    // Adjusting Node bezier handles
    if ((dragAction === 'moveHandleIn' || dragAction === 'moveHandleOut') && selectedNodeId && nodeInitialState) {
      const anchorNode = nodeInitialState;
      
      // Calculate handle coordinate relative to anchor node position
      const rx = snapResultPt.x - anchorNode.x;
      const ry = snapResultPt.y - anchorNode.y;

      const modifiedShapes = glyph.shapes.map(s => {
        if (s.nodes.some(n => n.id === selectedNodeId)) {
          return {
            ...s,
            nodes: s.nodes.map(n => {
              if (n.id === selectedNodeId) {
                if (dragAction === 'moveHandleIn') {
                  return {
                    ...n,
                    handleIn: { x: rx, y: ry },
                    // If symmetric or smooth layout, keep handleOut mirrored!
                    handleOut: n.type === 'smooth' ? { x: -rx, y: -ry } : n.handleOut
                  };
                } else {
                  return {
                    ...n,
                    handleOut: { x: rx, y: ry },
                    handleIn: n.type === 'smooth' ? { x: -rx, y: -ry } : n.handleIn
                  };
                }
              }
              return n;
            })
          };
        }
        return s;
      });

      onChangeGlyph({ ...glyph, shapes: modifiedShapes });
      return;
    }

    // Collecting raw point sketches for freehand tool
    if (dragAction === 'freehand') {
      setFreehandPoints([...freehandPoints, fontPt]);
      return;
    }
  };

  // Mouse Up End Event
  const handleMouseUp = () => {
    setIsMouseDown(false);
    setSnapFeedback({ point: null, type: null });

    if (dragAction === 'drawShape') {
      const x1 = Math.round(mouseDownFontPt.x);
      const y1 = Math.round(mouseDownFontPt.y);
      const x2 = Math.round(mouseCurrentFontPt.x);
      const y2 = Math.round(mouseCurrentFontPt.y);

      const dx = x2 - x1;
      const dy = y2 - y1;

      if (Math.hypot(dx, dy) > 10) {
        let newShape: Shape | null = null;

        if (activeTool === 'rectangle') {
          // Bottom-left and dimensions
          const rx = Math.min(x1, x2);
          const ry = Math.min(y1, y2);
          const rw = Math.abs(dx);
          const rh = Math.abs(dy);
          newShape = createRectangle(rx, ry, rw, rh);
        } else if (activeTool === 'circle') {
          const r = Math.round(Math.hypot(dx, dy));
          newShape = createCircle(x1, y1, r);
        } else if (activeTool === 'polygon') {
          const r = Math.round(Math.hypot(dx, dy));
          newShape = createPolygon(x1, y1, r, 5); // Default pentagon
        } else if (activeTool === 'line') {
          newShape = createLine(mouseDownFontPt, mouseCurrentFontPt);
        }

        if (newShape) {
          onChangeGlyph({
            ...glyph,
            shapes: [...glyph.shapes, newShape]
          });
          onSelectShapes([newShape.id]);
        }
      }
    }

    // Freehand stroke conversion with optional Smart auto-corrections!
    if (dragAction === 'freehand' && freehandPoints.length > 3) {
      let createdShape: Shape | null = null;
      
      if (autoCorrect) {
        // Run curve-fitting auto-correction
        createdShape = fitShapeFromStroke(freehandPoints);
      } else {
        // Just create simpler polyline
        const nodes: PathNode[] = freehandPoints.filter((_, idx) => idx % 3 === 0).map(pt => ({
          id: generateId(),
          x: Math.round(pt.x),
          y: Math.round(pt.y),
          handleIn: null,
          handleOut: null,
          type: 'corner'
        }));

        if (nodes.length > 1) {
          createdShape = {
            id: generateId(),
            name: `Trazado Libre ${glyph.shapes.length + 1}`,
            type: 'path',
            nodes,
            closed: false,
            reverseWinding: false,
            visible: true,
            locked: false
          };
        }
      }

      if (createdShape) {
        onChangeGlyph({
          ...glyph,
          shapes: [...glyph.shapes, createdShape]
        });
        onSelectShapes([createdShape.id]);
      }

      setFreehandPoints([]);
    }

    setDragAction(null);
  };

  // Keyboard shortcut actions for speedy typography design
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete shape or node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          // Delete single node
          const updated = glyph.shapes.map(sh => {
            if (sh.nodes.some(n => n.id === selectedNodeId)) {
              return {
                ...sh,
                nodes: sh.nodes.filter(n => n.id !== selectedNodeId)
              };
            }
            return sh;
          }).filter(sh => sh.nodes.length > 0); // Clear clean if fully empty

          onChangeGlyph({ ...glyph, shapes: updated });
          onSelectNode(null);
        } else if (selectedShapeIds.length > 0) {
          // Delete selected shapes
          const updated = glyph.shapes.filter(sh => !selectedShapeIds.includes(sh.id));
          onChangeGlyph({ ...glyph, shapes: updated });
          onSelectShapes([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [glyph, selectedShapeIds, selectedNodeId]);

  return (
    <div 
      ref={containerRef}
      id="editor-workspace"
      className="relative flex-1 h-full w-full select-none overflow-hidden bg-[#121212] focus:outline-none"
    >
      <canvas
        ref={canvasRef}
        id="vector-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor }}
        className="block h-full w-full"
      />

      {/* Touchpad / keyboard design shortcut helper card */}
      {isTipExpanded ? (
        <div className="absolute bottom-4 left-4 max-w-xs bg-[#1a1a1a]/95 backdrop-blur p-3 rounded border border-[#333] text-[11px] text-gray-400 shadow-xl select-none">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-white uppercase tracking-wide flex items-center gap-1">
              <span>Consejo de Diseño</span>
            </h4>
            <button 
              onClick={() => setIsTipExpanded(false)}
              className="text-gray-500 hover:text-white transition px-1 py-0.5 rounded hover:bg-[#252525] cursor-pointer"
              title="Colapsar panel"
            >
              <span className="text-[9px] font-black font-mono">╳</span>
            </button>
          </div>
          <p className="leading-relaxed mb-2 text-gray-300">
            Arrastra la línea naranja de la derecha para ajustar el <strong className="text-orange-500">espacio horizontal</strong> de la letra.
          </p>
          <div className="border-t border-[#333]/65 pt-2 grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div><kbd className="bg-[#252525] px-1 rounded text-gray-300">Shift+Arr.</kbd> Mover lienzo</div>
            <div><kbd className="bg-[#252525] px-1 rounded text-gray-300">Supr</kbd> Borrar figura</div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsTipExpanded(true)}
          className="absolute bottom-4 left-4 py-1.5 px-2.5 bg-[#1a1a1a]/95 hover:bg-[#222] border border-[#333] hover:border-orange-500/50 text-orange-400 rounded text-[10.5px] font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
          title="Ver consejo de diseño"
        >
          <span>💡</span>
          <span className="hover:underline">Consejo de Diseño</span>
        </button>
      )}
    </div>
  );
}
