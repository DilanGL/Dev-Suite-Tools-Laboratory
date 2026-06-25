import React, { useState, useEffect, useRef } from "react";
import { MindMapData, MindMapNode } from "../types";
import { Sparkles, Brain, Hand } from "lucide-react";

interface MindMapViewProps {
  data: MindMapData | null;
  isLoading: boolean;
  onGenerate: () => void;
  onNodeClickToChat?: (nodeLabel: string) => void;
}

export default function MindMapView({
  data,
  isLoading,
  onGenerate,
  onNodeClickToChat
}: MindMapViewProps) {
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 480 });
  const [nodePositions, setNodePositions] = useState<{ [nodeId: string]: { x: number; y: number } }>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Measure container safely and dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 700,
          height: containerRef.current.clientHeight || 480,
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute neat non-overlapping positions for nodes when data or dimensions shift
  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      setNodePositions({});
      return;
    }

    const rootNode = data.nodes.find((n) => n.category === "root") || data.nodes[0];
    const mainNodes = data.nodes.filter((n) => n.category === "main" && n.id !== rootNode.id);
    const subNodes = data.nodes.filter((n) => n.category === "sub" && n.id !== rootNode.id);

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2 - 20;

    const positionedList: (MindMapNode & { x: number; y: number })[] = [];

    // 1. Root at center
    positionedList.push({
      ...rootNode,
      x: centerX,
      y: centerY,
    });

    // 2. Mains spaced evenly in an inner orbit
    const mainRadius = Math.min(dimensions.width, dimensions.height) * 0.25;
    mainNodes.forEach((node, idx) => {
      const angle = (idx / mainNodes.length) * 2 * Math.PI - Math.PI / 2; // start top facing
      const x = centerX + Math.cos(angle) * mainRadius;
      const y = centerY + Math.sin(angle) * mainRadius;
      positionedList.push({ ...node, x, y });
    });

    // 3. Subs in outer orbit, grouped near their connected main node
    const subRadius = Math.min(dimensions.width, dimensions.height) * 0.42;
    subNodes.forEach((node, idx) => {
      const connection = data.edges.find((e) => e.target === node.id || e.source === node.id);
      let baseAngle = (idx / subNodes.length) * 2 * Math.PI;

      if (connection) {
        const parentId = connection.source === node.id ? connection.target : connection.source;
        const parent = positionedList.find((p) => p.id === parentId);
        if (parent) {
          baseAngle = Math.atan2(parent.y - centerY, parent.x - centerX) + (idx % 2 === 0 ? 0.35 : -0.35);
        }
      }

      const x = centerX + Math.cos(baseAngle) * (subRadius + (idx % 2 === 0 ? 15 : -15));
      const y = centerY + Math.sin(baseAngle) * (subRadius + (idx % 2 === 0 ? -15 : 15));
      positionedList.push({ ...node, x, y });
    });

    // 4. Collision resolution / relaxation loop to prevent overlapping
    // Nodes are roughly 160px wide and 55px tall
    const minDistanceX = 160; 
    const minDistanceY = 55;  
    const iterations = 120;

    for (let iter = 0; iter < iterations; iter++) {
      let isAdjusted = false;
      for (let i = 0; i < positionedList.length; i++) {
        for (let j = 0; j < positionedList.length; j++) {
          if (i === j) continue;
          const nodeA = positionedList[i];
          const nodeB = positionedList[j];

          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < minDistanceX && absDy < minDistanceY) {
            isAdjusted = true;
            // Calculate overlapping bounds
            const overlapX = minDistanceX - absDx;
            const overlapY = minDistanceY - absDy;

            // Compute push direction vector
            const pushX = (dx === 0 ? (Math.random() - 0.5 || 1) : Math.sign(dx)) * overlapX * 0.5;
            const pushY = (dy === 0 ? (Math.random() - 0.5 || 1) : Math.sign(dy)) * overlapY * 0.5;

            // Root node tends to stay steady or move less
            if (nodeA.category !== "root") {
              nodeA.x += pushX;
              nodeA.y += pushY;
            }
            if (nodeB.category !== "root") {
              nodeB.x -= pushX;
              nodeB.y -= pushY;
            }

            // Keep within boundary padding
            const padding = 70;
            nodeA.x = Math.max(padding, Math.min(dimensions.width - padding, nodeA.x));
            nodeA.y = Math.max(padding, Math.min(dimensions.height - padding, nodeA.y));
            nodeB.x = Math.max(padding, Math.min(dimensions.width - padding, nodeB.x));
            nodeB.y = Math.max(padding, Math.min(dimensions.height - padding, nodeB.y));
          }
        }
      }
      if (!isAdjusted) break; // Quit early when perfectly settled
    }

    // Convert list to mapped node state
    const parsedPos: { [nodeId: string]: { x: number; y: number } } = {};
    positionedList.forEach((n) => {
      parsedPos[n.id] = { x: n.x, y: n.y };
    });
    setNodePositions(parsedPos);
  }, [data, dimensions]);

  // Drag interaction handlers
  const handleDragStart = (nodeId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // keep in bounds with padding
    const padding = 40;
    const boundedX = Math.max(padding, Math.min(dimensions.width - padding, x));
    const boundedY = Math.max(padding, Math.min(dimensions.height - padding, y));

    setNodePositions((prev) => ({
      ...prev,
      [draggedNodeId]: { x: boundedX, y: boundedY },
    }));
  };

  const handleDragEnd = () => {
    setDraggedNodeId(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="text-blue-400 animate-pulse" size={24} />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-200 tracking-wide">Trazando Red de Nodos Cognitivos...</h3>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Diferenciando conceptos raíz, temas clave y relaciones cruzadas
        </p>
      </div>
    );
  }

  // Generate node rendering nodes
  const mapNodes = data?.nodes || [];

  return (
    <div 
      className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden select-none touch-none" 
      ref={containerRef}
      onMouseMove={handleDragMove}
      onTouchMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* SVG Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.02)_0%,transparent_80%)]" />

      {(!data || mapNodes.length === 0) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 w-full h-full">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 animate-pulse-slow">
            <Brain size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-100 tracking-tight">Mapa Mental Conceptual</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            Genera un mapa esquematizado dinámico generado por la IA de Gemini, conectando ideas complejas visualmente en nodos interactivos.
          </p>

          <button
            onClick={onGenerate}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:opacity-95 flex items-center gap-2 tracking-wide transition-all"
            id="generate-mindmap-btn"
          >
            <Sparkles size={14} /> Construir Mapa Mental
          </button>
        </div>
      ) : (
        <>
          {/* Legend indicator */}
          <div className="absolute top-4 left-4 z-40 bg-slate-900/60 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-400/50 block animate-pulse" />
              <span className="text-slate-300">Tema Central</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-400/50 block" />
              <span className="text-slate-300">Módulos Examen</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-400/50 block" />
              <span className="text-slate-300">Concepto Clave</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[9px] text-slate-400 border-l border-slate-800 pl-3">
              <Hand size={11} className="text-amber-400" />
              <span>Arrástrame para ordenar</span>
            </div>
          </div>

          {/* SVG Connector Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.30" />
              </linearGradient>
            </defs>
            {data.edges && data.edges.map((edge, idx) => {
              const srcPos = nodePositions[edge.source];
              const tgtPos = nodePositions[edge.target];

              if (!srcPos || !tgtPos) return null;

              return (
                <line
                  key={idx}
                  x1={srcPos.x}
                  y1={srcPos.y}
                  x2={tgtPos.x}
                  y2={tgtPos.y}
                  stroke="url(#edge-gradient)"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="animate-pulse-slow"
                />
              );
            })}
          </svg>

          {/* Nodes absolute container */}
          <div className="relative w-full h-full z-10">
            {mapNodes.map((node) => {
              const pos = nodePositions[node.id];
              // Skip render if position is not initialized
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              
              // Styles based on node category
              const catStyles = {
                root: "bg-blue-950/95 border-blue-500 text-blue-300 text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(59,130,246,0.35)] px-4 py-2.5 rounded-2xl",
                main: "bg-emerald-950/90 border-emerald-500 text-emerald-300 text-[11px] sm:text-xs font-bold px-3 py-2 rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]",
                sub: "bg-slate-900 border-slate-800 hover:border-slate-500 text-slate-300 text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm"
              }[node.category] || "bg-slate-900 border-slate-700 text-slate-300 text-[11px]";

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleDragStart(node.id, e)}
                  onTouchStart={(e) => handleDragStart(node.id, e)}
                  onClick={() => setSelectedNode(node)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 border transition-shadow cursor-grab active:cursor-grabbing font-sans select-none flex flex-col items-center ${catStyles} ${
                    isSelected ? "ring-2 ring-violet-400 scale-105 !border-violet-400 z-30" : "hover:scale-102 z-20"
                  }`}
                  style={{ left: pos.x, top: pos.y }}
                >
                  <span className="text-center font-medium leading-none">{node.label}</span>
                </div>
              );
            })}

            {/* Bottom Insight Overlay or Selection Action panel */}
            {selectedNode ? (
              <div id="mindmap-node-inspector" className="absolute bottom-4 left-4 right-4 z-40 bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl select-none animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Brain size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold tracking-wider">Nodo Seleccionado ({selectedNode.category})</span>
                    <h4 className="text-xs font-bold text-slate-100">{selectedNode.label}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onNodeClickToChat && (
                    <button
                      onClick={() => onNodeClickToChat(selectedNode.label)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 tracking-wide shadow-lg shadow-blue-900/40 font-mono transition-all cursor-pointer"
                    >
                      💡 Consultar en Consola Mentor
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-[10px] hover:bg-slate-750 text-slate-300 font-semibold transition-all cursor-pointer"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-4 left-4 right-4 z-30 bg-slate-900/30 backdrop-blur-xs border border-slate-900 rounded-xl p-3 text-center text-slate-500 text-[10px] sm:text-xs">
                💡 Haz clic y arrastra cualquier nodo para reorganizar tu ideas. Presiónalo para abrir el inspector rápido.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
