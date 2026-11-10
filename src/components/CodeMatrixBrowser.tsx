/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Code, CodedSegment, InterviewDocument } from '../types/qda';
import { Download, Table, Eye, X, Quote, Layers } from 'lucide-react';
import { generateCodeMatrixCSV, downloadFile } from '../utils/exportHelpers';

interface CodeMatrixBrowserProps {
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  documents: InterviewDocument[];
}

export const CodeMatrixBrowser: React.FC<CodeMatrixBrowserProps> = ({
  categories,
  codes,
  codedSegments,
  documents,
}) => {
  const [displayMode, setDisplayMode] = useState<'bubbles' | 'numbers'>('bubbles');
  const [selectedCell, setSelectedCell] = useState<{
    code: Code;
    doc?: InterviewDocument;
  } | null>(null);

  const docMap = new Map(documents.map((d) => [d.id, d]));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Calculate cell frequency
  const getCellCount = (codeId: string, docId: string) => {
    return codedSegments.filter((s) => s.codeId === codeId && s.documentId === docId).length;
  };

  const getCodeTotal = (codeId: string) => {
    return codedSegments.filter((s) => s.codeId === codeId).length;
  };

  // Find max frequency for proportional bubble scaling
  let maxFreq = 1;
  for (const c of codes) {
    for (const d of documents) {
      const cnt = getCellCount(c.id, d.id);
      if (cnt > maxFreq) maxFreq = cnt;
    }
  }

  // Get segments for modal inspection
  const getCellSegments = () => {
    if (!selectedCell) return [];
    if (selectedCell.doc) {
      return codedSegments.filter(
        (s) => s.codeId === selectedCell.code.id && s.documentId === selectedCell.doc?.id
      );
    }
    return codedSegments.filter((s) => s.codeId === selectedCell.code.id);
  };

  const handleExportCSV = () => {
    const csv = generateCodeMatrixCSV(documents, categories, codes, codedSegments);
    downloadFile('amk_code_matrix.csv', csv, 'text/csv');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Matrix Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Code-Matrix-Browser (Kreuztabelle)</span>
            <span className="text-[10px] font-mono tabular-nums bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-xs text-zinc-600 dark:text-zinc-400">
              {codes.length} Codes × {documents.length} Interviews
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Häufigkeitsverteilung der Themen über alle anonymisierten Probanden (S1–S6). Klicke auf eine Zelle für die Zitate.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Display Mode Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs border border-zinc-200/50 dark:border-zinc-800">
            <button
              onClick={() => setDisplayMode('bubbles')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                displayMode === 'bubbles'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Visuelle Kreise
            </button>
            <button
              onClick={() => setDisplayMode('numbers')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                displayMode === 'numbers'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Zahlenwerte
            </button>
          </div>

          {/* Export Matrix CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Matrix CSV</span>
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="inline-block min-w-full align-middle border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {/* Table Header with clean descriptive headers */}
            <thead className="bg-zinc-100 dark:bg-zinc-900 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-zinc-700 dark:text-zinc-300 w-80">
                  Überkategorien & thematische Codes
                </th>
                {documents.map((doc) => (
                  <th
                    key={doc.id}
                    className="px-3 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 min-w-[100px]"
                  >
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      Proband {doc.respondentInfo.code}
                    </div>
                    <div className="text-[10px] font-normal text-zinc-400">
                      AMK Erhebung
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200/50 dark:bg-zinc-800/60 min-w-[120px]">
                  Gesamthäufigkeit aller Interviews
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
              {categories.map((category) => {
                const catCodes = codes.filter((c) => c.categoryId === category.id);

                return (
                  <React.Fragment key={category.id}>
                    {/* Category Header Row */}
                    <tr className="bg-zinc-50/70 dark:bg-zinc-900/30">
                      <td
                        colSpan={documents.length + 2}
                        className="px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-xs"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Subcode Rows */}
                    {catCodes.map((code) => {
                      const totalCount = getCodeTotal(code.id);

                      return (
                        <tr
                          key={code.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          {/* Code Title Column */}
                          <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 pl-8">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: code.color }}
                              />
                              <span className="truncate max-w-[240px]" title={code.description}>
                                {code.name}
                              </span>
                            </div>
                          </td>

                          {/* Interview Matrix Cells */}
                          {documents.map((doc) => {
                            const count = getCellCount(code.id, doc.id);
                            const bubbleRatio = count / maxFreq;
                            const bubbleSize = Math.max(8, Math.min(24, 8 + bubbleRatio * 16));

                            return (
                              <td
                                key={doc.id}
                                onClick={() => count > 0 && setSelectedCell({ code, doc })}
                                className={`px-2 py-2 text-center align-middle transition-colors ${
                                  count > 0 ? 'cursor-pointer hover:bg-emerald-500/10' : ''
                                }`}
                                title={`${code.name} in ${doc.respondentInfo.code}: ${count} Passagen`}
                              >
                                {count > 0 ? (
                                  displayMode === 'bubbles' ? (
                                    <div className="flex items-center justify-center">
                                      <div
                                        className="rounded-full flex items-center justify-center transition-transform hover:scale-125"
                                        style={{
                                          width: `${bubbleSize}px`,
                                          height: `${bubbleSize}px`,
                                          backgroundColor: code.color,
                                          opacity: 0.9,
                                        }}
                                      >
                                        {count > 1 && (
                                          <span className="text-[9px] font-bold text-white font-mono">
                                            {count}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                                      {count}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-zinc-300 dark:text-zinc-700 font-mono">
                                    ·
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          {/* Total Column */}
                          <td
                            onClick={() => totalCount > 0 && setSelectedCell({ code })}
                            className="px-3 py-2 text-center font-mono tabular-nums font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50/40 dark:bg-zinc-900/20 cursor-pointer hover:bg-emerald-500/10"
                          >
                            {totalCount}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segment Retrieval Modal on cell click */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedCell.code.color }}
                  />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Segment Retrieval: {selectedCell.code.name}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {selectedCell.doc
                    ? `Interview: ${selectedCell.doc.title} (${selectedCell.doc.respondentInfo.code})`
                    : 'Alle Interviews aggregiert'}
                </p>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {getCellSegments().map((seg) => {
                const doc = docMap.get(seg.documentId);
                return (
                  <div
                    key={seg.id}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Proband {doc?.respondentInfo.code}
                      </span>
                      <span className="font-mono tabular-nums">Absatz P{seg.paragraphIndex}</span>
                    </div>

                    <p className="text-zinc-700 dark:text-zinc-200 italic border-l-2 pl-2.5 leading-relaxed" style={{ borderColor: selectedCell.code.color }}>
                      "{seg.exactQuote}"
                    </p>

                    {seg.comment && (
                      <div className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-300">Memo: </strong>
                        {seg.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
