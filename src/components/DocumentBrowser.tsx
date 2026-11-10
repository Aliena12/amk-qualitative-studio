/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { InterviewDocument, Code, Category, CodedSegment } from '../types/qda';
import {
  Search,
  Tag,
  Trash2,
  Edit2,
  ExternalLink,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Info,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface DocumentBrowserProps {
  document: InterviewDocument;
  codes: Code[];
  categories: Category[];
  codedSegments: CodedSegment[];
  activeCodeFilter: string | null;
  onSelectCodeFilter: (codeId: string | null) => void;
  onDeleteSegment: (segmentId: string) => void;
  onEditSegment: (updatedSegment: CodedSegment) => void;
  onAddManualSegment: (segment: Omit<CodedSegment, 'id'>) => void;
}

export const DocumentBrowser: React.FC<DocumentBrowserProps> = ({
  document,
  codes,
  categories,
  codedSegments,
  activeCodeFilter,
  onSelectCodeFilter,
  onDeleteSegment,
  onEditSegment,
  onAddManualSegment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  // Edit Segment Popover
  const [editingSegment, setEditingSegment] = useState<CodedSegment | null>(null);
  const [editCodeId, setEditCodeId] = useState<string>('');
  const [editQuote, setEditQuote] = useState<string>('');
  const [editComment, setEditComment] = useState<string>('');

  // Manual Selection State
  const [selectedTextData, setSelectedTextData] = useState<{
    text: string;
    paragraphIndex: number;
    startIndex: number;
    endIndex: number;
    rect: DOMRect | null;
  } | null>(null);
  const [manualCodeId, setManualCodeId] = useState<string>(codes[0]?.id || '');

  const codeMap = new Map(codes.map((c) => [c.id, c]));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Document Segments
  const docSegments = codedSegments.filter((s) => {
    if (s.documentId !== document.id) return false;
    if (activeCodeFilter && s.codeId !== activeCodeFilter) return false;
    return true;
  });

  // Extract all unique codes present in this interview for the clean legend
  const presentCodeIds = Array.from(new Set(docSegments.map((s) => s.codeId)));
  const presentCodes = presentCodeIds.map((id) => codeMap.get(id)).filter(Boolean) as Code[];

  // Handle Text Selection
  const handleMouseUp = (paragraphIndex: number) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedTextData(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 4) {
      setSelectedTextData(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const para = document.paragraphs.find((p) => p.index === paragraphIndex);
    if (!para) return;

    const startIndex = para.text.indexOf(selectedText);
    const endIndex = startIndex !== -1 ? startIndex + selectedText.length : selectedText.length;

    setSelectedTextData({
      text: selectedText,
      paragraphIndex,
      startIndex: startIndex !== -1 ? startIndex : 0,
      endIndex,
      rect,
    });
  };

  const handleApplyManualCode = () => {
    if (!selectedTextData || !manualCodeId) return;

    onAddManualSegment({
      documentId: document.id,
      codeId: manualCodeId,
      paragraphIndex: selectedTextData.paragraphIndex,
      exactQuote: selectedTextData.text,
      startIndex: selectedTextData.startIndex,
      endIndex: selectedTextData.endIndex,
      comment: 'Händisch codiert',
      confidence: 1.0,
    });

    window.getSelection()?.removeAllRanges();
    setSelectedTextData(null);
  };

  const handleOpenEdit = (seg: CodedSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSegment(seg);
    setEditCodeId(seg.codeId);
    setEditQuote(seg.exactQuote);
    setEditComment(seg.comment || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSegment) return;

    onEditSegment({
      ...editingSegment,
      codeId: editCodeId,
      exactQuote: editQuote.trim(),
      comment: editComment.trim(),
    });

    setEditingSegment(null);
  };

  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose',
  }[fontSize];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden relative">
      {/* Minimalist Top Header */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono text-xs flex items-center justify-center shrink-0">
            {document.respondentInfo.code}
          </span>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {document.title}
            </h2>
            <div className="text-[11px] text-zinc-400 truncate">
              {document.respondentInfo.fieldOfStudy} · Dauer: {document.respondentInfo.duration}
            </div>
          </div>
        </div>

        {/* Search & Font Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-zinc-400" />
            <input
              type="text"
              placeholder="Text durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48"
            />
          </div>

          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded font-medium ${fontSize === 'sm' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-400'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded font-medium ${fontSize === 'base' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-400'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded font-medium ${fontSize === 'lg' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-400'}`}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Document Reader & Side Legend */}
      <div className="flex-1 overflow-hidden flex divide-x divide-zinc-200 dark:divide-zinc-800">
        {/* Center: Clean Academic Transcript Reader */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-5 max-w-4xl mx-auto w-full">
          {document.paragraphs.map((para) => {
            const isInterviewer = para.speaker === 'Interviewer';
            const paraSegments = docSegments.filter((s) => s.paragraphIndex === para.index);

            // Render exact quote highlight with rich vivid colors
            const renderParagraphText = () => {
              if (paraSegments.length === 0) {
                return para.text;
              }

              // Highlight matching exact quote substrings
              const text = para.text;
              let parts: React.ReactNode[] = [];
              let lastIdx = 0;

              // Sort segments by their start index
              const sorted = [...paraSegments].sort((a, b) => {
                const idxA = text.indexOf(a.exactQuote);
                const idxB = text.indexOf(b.exactQuote);
                return idxA - idxB;
              });

              sorted.forEach((seg, sIdx) => {
                const quoteIdx = text.indexOf(seg.exactQuote, lastIdx);
                if (quoteIdx !== -1) {
                  // Add preceding text
                  if (quoteIdx > lastIdx) {
                    parts.push(text.substring(lastIdx, quoteIdx));
                  }

                  const code = codeMap.get(seg.codeId);
                  const isHovered = hoveredSegmentId === seg.id;

                  parts.push(
                    <mark
                      key={seg.id || sIdx}
                      onMouseEnter={() => setHoveredSegmentId(seg.id)}
                      onMouseLeave={() => setHoveredSegmentId(null)}
                      onClick={(e) => handleOpenEdit(seg, e)}
                      className={`cursor-pointer rounded-xs px-1 py-0.5 transition-all inline font-medium box-decoration-clone ${
                        isHovered ? 'ring-2 ring-emerald-500 shadow-xs' : ''
                      }`}
                      style={{
                        backgroundColor: code ? `${code.color}35` : '#10b98135',
                        borderBottom: `2.5px solid ${code?.color || '#10b981'}`,
                        color: 'inherit',
                      }}
                      title={`Code: ${code?.name} · Klicke zum Bearbeiten`}
                    >
                      {seg.exactQuote}
                    </mark>
                  );

                  lastIdx = quoteIdx + seg.exactQuote.length;
                }
              });

              if (lastIdx < text.length) {
                parts.push(text.substring(lastIdx));
              }

              return parts.length > 0 ? parts : text;
            };

            return (
              <div
                key={para.index}
                onMouseUp={() => handleMouseUp(para.index)}
                className={`flex items-start gap-4 p-2.5 rounded-xl transition-colors ${
                  isInterviewer
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/30 text-zinc-500'
                    : 'bg-transparent text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20'
                }`}
              >
                {/* Paragraph Number */}
                <span className="font-mono text-[11px] tabular-nums text-zinc-400 shrink-0 select-none pt-0.5 w-7 text-right">
                  P{para.index.toString().padStart(2, '0')}
                </span>

                {/* Speaker indicator */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 select-none ${
                    isInterviewer
                      ? 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isInterviewer ? 'I:' : `${document.respondentInfo.code}:`}
                </span>

                {/* Text body */}
                <div className={`flex-1 ${fontSizeClass} selection:bg-emerald-500/30`}>
                  {renderParagraphText()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Clean Code Legende & Margin Inspector */}
        <div className="w-64 shrink-0 bg-zinc-50/30 dark:bg-zinc-950/40 p-4 overflow-y-auto select-none space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Code-Legende (in {document.respondentInfo.code})
            </span>
            <span className="text-[10px] font-mono tabular-nums text-zinc-400">
              {docSegments.length} Zitate
            </span>
          </div>

          {/* Active Codes List in this Document */}
          <div className="space-y-1.5">
            {presentCodes.map((code) => {
              const segs = docSegments.filter((s) => s.codeId === code.id);
              const isFiltered = activeCodeFilter === code.id;

              return (
                <div
                  key={code.id}
                  onClick={() => onSelectCodeFilter(isFiltered ? null : code.id)}
                  className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                    isFiltered
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                      : 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                  }`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: code.color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate text-[11px]">{code.name}</span>
                    <span className="text-[10px] font-mono tabular-nums text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded-xs">
                      {segs.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {catMap.get(code.categoryId)?.name}
                  </div>
                </div>
              );
            })}

            {presentCodes.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-6">
                Noch keine Codierungen in diesem Transkript.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Manual Coder Widget on mouse selection */}
      {selectedTextData && (
        <div
          className="fixed z-50 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-300 dark:border-zinc-700 flex items-center gap-2"
          style={{
            top: `${Math.max(10, (selectedTextData.rect?.top || 100) - 45)}px`,
            left: `${Math.max(10, selectedTextData.rect?.left || 100)}px`,
          }}
        >
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Code zuweisen:
          </span>

          <select
            value={manualCodeId}
            onChange={(e) => setManualCodeId(e.target.value)}
            className="px-2 py-1 text-xs rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 max-w-[160px]"
          >
            {codes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleApplyManualCode}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md cursor-pointer"
          >
            Markieren
          </button>

          <button
            onClick={() => setSelectedTextData(null)}
            className="text-zinc-400 hover:text-zinc-600 text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Edit Coded Segment Modal (for retroactive changes) */}
      {editingSegment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" />
                <span>Markierung / Zitat anpassen</span>
              </h3>
              <button
                onClick={() => setEditingSegment(null)}
                className="text-zinc-400 hover:text-zinc-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Zugeordneter Code
                </label>
                <select
                  value={editCodeId}
                  onChange={(e) => setEditCodeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {codes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({catMap.get(c.categoryId)?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Exakter Zitat-Text
                </label>
                <textarea
                  rows={3}
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Analytisches Memo / Kommentar
                </label>
                <input
                  type="text"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Diese Markierung wirklich löschen?')) {
                      onDeleteSegment(editingSegment.id);
                      setEditingSegment(null);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Markierung löschen</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSegment(null)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                  >
                    Änderungen speichern
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
