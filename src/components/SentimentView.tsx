/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InterviewDocument, SentimentPoint } from '../types/qda';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SentimentViewProps {
  documents: InterviewDocument[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
}

export const SentimentView: React.FC<SentimentViewProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
}) => {
  const [viewMode, setViewMode] = useState<'single' | 'comparative'>('single');
  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const points: SentimentPoint[] = currentDoc?.sentimentTrajectory || [
    { paragraphIndex: 2, score: 0.5, label: 'Zufriedenheit / Begeisterung', topic: 'Inspirationsphase' },
    { paragraphIndex: 4, score: 0.1, label: 'Neutral / Sachlich', topic: 'Recherche' },
    { paragraphIndex: 6, score: -0.7, label: 'Frustration / Barriere', topic: 'Medienbruch / Barriere' },
    { paragraphIndex: 8, score: 0.6, label: 'Zufriedenheit / Begeisterung', topic: 'Lösungsansatz' },
  ];

  // Compute sentiment KPI metrics
  const positivePoints = points.filter((p) => p.score > 0.2);
  const negativePoints = points.filter((p) => p.score < -0.2);
  const neutralPoints = points.filter((p) => p.score >= -0.2 && p.score <= 0.2);

  const avgSentiment = points.length
    ? points.reduce((acc, p) => acc + p.score, 0) / points.length
    : 0;

  // Chart dimensions
  const svgWidth = 850;
  const svgHeight = 280;
  const paddingX = 60;
  const paddingY = 40;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Scale functions
  const getY = (score: number) => {
    // score ranges from +1 (top) to -1 (bottom)
    const normalized = (1 - score) / 2; // 0 at +1, 1 at -1
    return paddingY + normalized * chartHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (total - 1)) * chartWidth;
  };

  // Generate smooth cubic bezier SVG curve path
  const generatePath = (pts: SentimentPoint[]) => {
    if (pts.length === 0) return '';
    const coords = pts.map((p, i) => ({
      x: getX(i, pts.length),
      y: getY(p.score),
    }));

    if (coords.length === 1) {
      return `M ${coords[0].x} ${coords[0].y}`;
    }

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const [hoveredPoint, setHoveredPoint] = useState<SentimentPoint | null>(null);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-y-auto">
      {/* View Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Sentiment-Verlaufskurve (Emotionale Customer Journey)</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Erkennt emotionale Wendepunkte, Frustrationsmomente und Begeisterungsanker im Gesprächsverlauf.
          </p>
        </div>

        {/* Proband Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
          {documents.map((doc) => {
            const isSelected = doc.id === currentDoc.id;
            return (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {doc.respondentInfo.code}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Netto-Stimmung (Durchschnitt)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono tabular-nums ${avgSentiment >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {avgSentiment > 0 ? `+${avgSentiment.toFixed(2)}` : avgSentiment.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400">
                {avgSentiment >= 0.2 ? 'Überwiegend positiv' : avgSentiment <= -0.2 ? 'Kritisch / unzufrieden' : 'Ausgeglichen'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-emerald-500" />
              <span>Begeisterung & Peaks</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {positivePoints.length} Passagen
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Frown className="w-3.5 h-3.5 text-rose-500" />
              <span>Kritische Schmerzpunkte</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {negativePoints.length} Barrieren
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Meh className="w-3.5 h-3.5 text-zinc-400" />
              <span>Neutrale Recherche</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
              {neutralPoints.length} Passagen
            </div>
          </div>
        </div>

        {/* The Sentiment Trajectory Chart */}
        <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Verlaufskurve: {currentDoc.title} ({currentDoc.respondentInfo.code})
              </h3>
              <p className="text-[11px] text-zinc-500">
                {currentDoc.respondentInfo.keyCharacteristic} · Dauer: {currentDoc.respondentInfo.duration}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Zufriedenheit (+1.0)
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                Neutral (0.0)
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Frustration / Abbruch (-1.0)
              </span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              className="w-full h-72 select-none"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#71717a" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Lines */}
              {/* Positive Line */}
              <line
                x1={paddingX}
                y1={getY(1.0)}
                x2={svgWidth - paddingX}
                y2={getY(1.0)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />
              <text x={paddingX - 8} y={getY(1.0) + 4} textAnchor="end" fontSize="9" fill="#10b981" className="font-mono">
                +1.0
              </text>

              {/* Neutral Zero Line */}
              <line
                x1={paddingX}
                y1={getY(0.0)}
                x2={svgWidth - paddingX}
                y2={getY(0.0)}
                stroke="#71717a"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
              <text x={paddingX - 8} y={getY(0.0) + 4} textAnchor="end" fontSize="9" fill="#71717a" className="font-mono">
                0.0
              </text>

              {/* Negative Line */}
              <line
                x1={paddingX}
                y1={getY(-1.0)}
                x2={svgWidth - paddingX}
                y2={getY(-1.0)}
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />
              <text x={paddingX - 8} y={getY(-1.0) + 4} textAnchor="end" fontSize="9" fill="#f43f5e" className="font-mono">
                -1.0
              </text>

              {/* Trajectory Path Line */}
              <path
                d={generatePath(points)}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                className="transition-all"
              />

              {/* Interactive Data Points */}
              {points.map((pt, i) => {
                const cx = getX(i, points.length);
                const cy = getY(pt.score);
                const isHovered = hoveredPoint?.paragraphIndex === pt.paragraphIndex;
                const pointColor = pt.score > 0.2 ? '#10b981' : pt.score < -0.2 ? '#f43f5e' : '#a1a1aa';

                return (
                  <g
                    key={pt.paragraphIndex}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {isHovered && (
                      <circle cx={cx} cy={cy} r="10" fill={pointColor} opacity="0.3" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 5}
                      fill={pointColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    {/* Paragraph X Label */}
                    <text
                      x={cx}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#71717a"
                      className="font-mono font-medium"
                    >
                      P{pt.paragraphIndex.toString().padStart(2, '0')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hovered Point Card */}
          {hoveredPoint && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    hoveredPoint.score > 0.2
                      ? 'bg-emerald-500'
                      : hoveredPoint.score < -0.2
                      ? 'bg-rose-500'
                      : 'bg-zinc-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    Absatz P{hoveredPoint.paragraphIndex}: {hoveredPoint.topic}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Kategorie: {hoveredPoint.label}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                  Score: {hoveredPoint.score > 0 ? `+${hoveredPoint.score}` : hoveredPoint.score}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Narrative Flow Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Chronologischer Phasenverlauf im Interview ({points.length} Schlüsselstellen)
          </h3>

          <div className="space-y-2">
            {points.map((pt) => {
              const para = currentDoc.paragraphs.find((p) => p.index === pt.paragraphIndex);
              const isPositive = pt.score > 0.2;
              const isNegative = pt.score < -0.2;

              return (
                <div
                  key={pt.paragraphIndex}
                  className={`p-3.5 rounded-xl border text-xs transition-colors flex items-start gap-3 ${
                    isNegative
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
                      : isPositive
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="font-mono text-xs tabular-nums text-zinc-400 shrink-0 pt-0.5">
                    P{pt.paragraphIndex.toString().padStart(2, '0')}
                  </span>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {pt.topic}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isNegative
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isPositive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {pt.label} ({pt.score > 0 ? `+${pt.score}` : pt.score})
                      </span>
                    </div>

                    {para && (
                      <p className="text-zinc-600 dark:text-zinc-300 italic text-[11px] leading-relaxed">
                        "{para.text}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
