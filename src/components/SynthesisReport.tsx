/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QdaProject } from '../types/qda';
import { Sparkles, Printer, Download, BookOpen, Quote, FileBox } from 'lucide-react';
import { exportToWordDocument } from '../utils/docxExport';

interface SynthesisReportProps {
  project: QdaProject;
  onRegenerateSynthesis?: () => void;
  isGenerating?: boolean;
}

export const SynthesisReport: React.FC<SynthesisReportProps> = ({
  project,
  onRegenerateSynthesis,
  isGenerating,
}) => {
  const synthesis = project.synthesisReport;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Report Header Bar */}
      <div className="no-print flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Qualitativer Ergebnisbericht (Mayring-Zusammenfassung)</span>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
              AMK Modulbericht
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Wissenschaftliche Synthese der induktiven Codierung und axialen Kategorienbildung für die Projektarbeit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRegenerateSynthesis && (
            <button
              onClick={onRegenerateSynthesis}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer border border-zinc-200/50 dark:border-zinc-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isGenerating ? 'Generiere...' : 'Synthese aktualisieren'}</span>
            </button>
          )}

          <button
            onClick={() => exportToWordDocument(project)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            title="Als Word-Dokument für die Seminararbeit herunterladen"
          >
            <FileBox className="w-3.5 h-3.5" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Bericht drucken / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 rounded-2xl shadow-xs text-zinc-900 dark:text-zinc-100 space-y-8 print:border-none print:shadow-none print:p-0 print:dark:text-black">
          {/* Document Header */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              {project.courseModule}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {project.name}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {project.description}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
              <span>Datengrundlage: {project.documents.length} Interviews ({project.documents.map((d) => d.respondentInfo.code).join(', ')})</span>
              <span>·</span>
              <span>Codierungen: {project.codedSegments.length} Textstellen</span>
              <span>·</span>
              <span>Überkategorien: {project.categories.length}</span>
              <span>·</span>
              <span>Datum: {new Date().toLocaleDateString('de-DE')}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-600 rounded-full" />
              1. Executive Management Summary
            </h2>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
              {synthesis?.summary || 'Keine Zusammenfassung vorhanden.'}
            </div>
          </div>

          {/* Key Insights per Category */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-600 rounded-full" />
              2. Kernaussagen & empirische Befunde nach Hauptdimensionen
            </h2>

            {synthesis?.keyInsights?.map((insight, idx) => (
              <div
                key={idx}
                className="space-y-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 break-inside-avoid"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    2.{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {insight.categoryName}
                  </h3>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {insight.takeaway}
                </p>

                {/* Grounded verbatim citations */}
                {insight.quotes && insight.quotes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Empirische Belegstellen (Zitate):
                    </span>
                    {insight.quotes.map((q, qIdx) => (
                      <blockquote
                        key={qIdx}
                        className="text-xs text-zinc-600 dark:text-zinc-300 italic border-l-2 border-emerald-500 pl-3 py-0.5"
                      >
                        {q}
                      </blockquote>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Code System Overview Table */}
          <div className="space-y-3 break-inside-avoid">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-600 rounded-full" />
              3. Strukturiertes Codesystem (Häufigkeitsverteilung)
            </h2>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold">
                  <tr>
                    <th className="p-3">Überkategorie</th>
                    <th className="p-3">Untergeordneter Code</th>
                    <th className="p-3 text-right">Codierte Passagen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {project.categories.map((cat) => {
                    const catCodes = project.codes.filter((c) => c.categoryId === cat.id);
                    return catCodes.map((code, cIdx) => (
                      <tr key={code.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        {cIdx === 0 && (
                          <td
                            rowSpan={catCodes.length}
                            className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 align-top border-r border-zinc-100 dark:border-zinc-800"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-xs"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span>{cat.name}</span>
                            </div>
                          </td>
                        )}
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">
                          {code.name}
                        </td>
                        <td className="p-3 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                          {project.codedSegments.filter((s) => s.codeId === code.id).length}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology Notes */}
          <div className="space-y-3 break-inside-avoid">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-purple-600 rounded-full" />
              4. Methodischer Anhang & Gütekriterien
            </h2>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {synthesis?.methodologyNotes ||
                'Die qualitative Inhaltsanalyse folgt den methodischen Schritten nach Mayring (2015).'}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>AMK – Analyse von Markt- und Kundendaten</span>
            <span>Erstellt mit AMK Qualitative Studio (MAXQDA AI Edition)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
