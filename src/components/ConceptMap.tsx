/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Category, Code, CodedSegment, InterviewDocument } from '../types/qda';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Filter,
  X,
  Quote,
  Sparkles,
  Info,
} from 'lucide-react';

interface ConceptMapProps {
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  documents: InterviewDocument[];
  onSelectCodeFilter: (codeId: string | null) => void;
}

interface NodePosition {
  id: string;
  type: 'root' | 'category' | 'code';
  title: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  frequency: number;
  parentId?: string;
}

export const ConceptMap: React.FC<ConceptMapProps> = ({
  categories,
  codes,
  codedSegments,
  documents,
  onSelectCodeFilter,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<NodePosition | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [minFrequency, setMinFrequency] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);

  // Layout math: radial layout
  useEffect(() => {
    const width = 1000;
    const height = 750;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes: NodePosition[] = [];

    // Root Node
    nodes.push({
      id: 'root',
      type: 'root',
      title: 'AMK Kundenanalyse',
      color: '#0f172a',
      x: centerX,
      y: centerY,
      radius: 46,
      frequency: codedSegments.length,
    });

    const numCats = categories.length || 1;
    const catRadius = 220;

    categories.forEach((cat, cIdx) => {
      const catAngle = (cIdx / numCats) * 2 * Math.PI - Math.PI / 2;
      const catX = centerX + Math.cos(catAngle) * catRadius;
      const catY = centerY + Math.sin(catAngle) * catRadius;

      const catCodes = codes.filter((c) => c.categoryId === cat.id);
      const catFreq = codedSegments.filter((s) => catCodes.some((c) => c.id === s.codeId)).length;

      nodes.push({
        id: cat.id,
        type: 'category',
        title: cat.name,
        color: cat.color,
        x: catX,
        y: catY,
        radius: Math.max(34, Math.min(50, 30 + catFreq * 1.5)),
        frequency: catFreq,
        parentId: 'root',
      });

      // Subcodes around category node
      const subRadius = 140;
      const numSub = catCodes.length || 1;
      const spreadAngle = Math.PI * 0.75;
      const startAngle = catAngle - spreadAngle / 2;

      catCodes.forEach((code, sIdx) => {
        const subAngle = numSub === 1 ? catAngle : startAngle + (sIdx / (numSub - 1)) * spreadAngle;
        const subX = catX + Math.cos(subAngle) * subRadius;
        const subY = catY + Math.sin(subAngle) * subRadius;

        const codeFreq = codedSegments.filter((s) => s.codeId === code.id).length;

        nodes.push({
          id: code.id,
          type: 'code',
          title: code.name,
          color: code.color,
          x: subX,
          y: subY,
          radius: Math.max(24, Math.min(42, 20 + codeFreq * 2)),
          frequency: codeFreq,
          parentId: cat.id,
        });
      });
    });

    setNodePositions(nodes);
  }, [categories, codes, codedSegments]);

  // Handle Canvas Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'circle' || (e.target as HTMLElement).tagName === 'text') return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - pan.x) / zoom;
      const currentY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: currentX, y: currentY } : n))
      );
    } else if (isDraggingCanvas) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  // Filtered nodes
  const visibleNodes = nodePositions.filter(
    (n) => n.type === 'root' || n.type === 'category' || n.frequency >= minFrequency
  );
  const nodeMap = new Map(visibleNodes.map((n) => [n.id, n]));

  // Citations for selected node
  const getCitations = () => {
    if (!selectedNode) return [];
    if (selectedNode.type === 'code') {
      return codedSegments.filter((s) => s.codeId === selectedNode.id);
    }
    if (selectedNode.type === 'category') {
      const catCodes = codes.filter((c) => c.categoryId === selectedNode.id);
      return codedSegments.filter((s) => catCodes.some((c) => c.id === s.codeId));
    }
    return codedSegments.slice(0, 8);
  };

  const docMap = new Map(documents.map((d) => [d.id, d]));

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Vergrößern"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Verkleinern"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Ansicht zentrieren"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 px-2">
          <span>Min. Zitate:</span>
          <select
            value={minFrequency}
            onChange={(e) => setMinFrequency(Number(e.target.value))}
            className="text-xs bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 border border-slate-200 dark:border-slate-700"
          >
            <option value={0}>Alle anzeigen</option>
            <option value={2}>$\ge$ 2 Nennungen</option>
            <option value={5}>$\ge$ 5 Nennungen</option>
            <option value={8}>$\ge$ 8 Nennungen</option>
          </select>
        </div>
      </div>

      {/* Concept Map SVG Canvas */}
      <div
        className="flex-1 h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1000 750"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Draw Connecting Edges with Bezier curves */}
            {visibleNodes.map((node) => {
              if (!node.parentId) return null;
              const parent = nodeMap.get(node.parentId);
              if (!parent) return null;

              const isCatLink = parent.type === 'root';
              const strokeColor = node.type === 'code' ? node.color : parent.color;
              const strokeWidth = node.type === 'code' ? Math.max(1.5, Math.min(4, node.frequency * 0.4)) : 3;

              // Cubic bezier curve
              const dx = node.x - parent.x;
              const dy = node.y - parent.y;
              const cx1 = parent.x + dx * 0.4;
              const cy1 = parent.y + dy * 0.1;
              const cx2 = parent.x + dx * 0.6;
              const cy2 = parent.y + dy * 0.9;

              return (
                <path
                  key={`edge-${parent.id}-${node.id}`}
                  d={`M ${parent.x} ${parent.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${node.x} ${node.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeOpacity={isCatLink ? 0.45 : 0.65}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isCatLink ? '4 2' : undefined}
                />
              );
            })}

            {/* Draw Interactive Nodes */}
            {visibleNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isRoot = node.type === 'root';
              const isCat = node.type === 'category';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNodeId(node.id);
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      r={node.radius + 6}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={3}
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Main Node Body */}
                  <circle
                    r={node.radius}
                    fill={isRoot ? '#0f172a' : isCat ? node.color : '#ffffff'}
                    stroke={node.color}
                    strokeWidth={isCat ? 4 : 2.5}
                    className="transition-all hover:scale-105"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                  />

                  {/* Frequency badge badge inside node */}
                  {!isRoot && (
                    <circle
                      cx={node.radius * 0.7}
                      cy={-node.radius * 0.7}
                      r={11}
                      fill={isCat ? '#ffffff' : node.color}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  )}
                  {!isRoot && (
                    <text
                      x={node.radius * 0.7}
                      y={-node.radius * 0.7 + 3.5}
                      textAnchor="middle"
                      fill={isCat ? node.color : '#ffffff'}
                      fontSize="9"
                      fontWeight="bold"
                      className="font-mono tabular-nums pointer-events-none"
                    >
                      {node.frequency}
                    </text>
                  )}

                  {/* Node Title Text */}
                  <text
                    y={isRoot ? 4 : isCat ? 4 : 4}
                    textAnchor="middle"
                    fill={isRoot || isCat ? '#ffffff' : '#0f172a'}
                    fontSize={isRoot ? '12' : isCat ? '11' : '10'}
                    fontWeight={isRoot || isCat ? 'bold' : '600'}
                    className="pointer-events-none select-none max-w-[120px]"
                  >
                    {node.title.length > 18 ? `${node.title.slice(0, 16)}...` : node.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Right Drawer: Quote & Citation Inspector for clicked node */}
      {selectedNode && (
        <div className="w-80 md:w-96 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col z-30 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedNode.color }}
              />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {selectedNode.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
            <span>
              Typ: <strong className="text-slate-700 dark:text-slate-300 capitalize">{selectedNode.type}</strong>
            </span>
            <span>
              Häufigkeit: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{selectedNode.frequency} Passagen</strong>
            </span>
          </div>

          {/* Quotations List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verifizierte Textstellen ({getCitations().length})
            </h4>

            {getCitations().map((citation) => {
              const doc = docMap.get(citation.documentId);
              return (
                <div
                  key={citation.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      Proband {doc?.respondentInfo.code || citation.documentId}
                    </span>
                    <span className="font-mono tabular-nums">P{citation.paragraphIndex}</span>
                  </div>

                  <p className="text-zinc-700 dark:text-zinc-300 italic border-l-2 pl-2" style={{ borderColor: selectedNode.color }}>
                    "{citation.exactQuote}"
                  </p>

                  {citation.comment && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Memo: {citation.comment}
                    </div>
                  )}
                </div>
              );
            })}

            {getCitations().length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                Keine Zitate für diesen Knoten hinterlegt.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
