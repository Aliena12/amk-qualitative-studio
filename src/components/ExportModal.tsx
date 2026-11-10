/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QdaProject } from '../types/qda';
import {
  FileText,
  Table,
  FileCode,
  Download,
  X,
  Printer,
  FileBox,
} from 'lucide-react';
import {
  generateCodedSegmentsCSV,
  generateCodeMatrixCSV,
  downloadFile,
} from '../utils/exportHelpers';
import { exportToWordDocument } from '../utils/docxExport';

interface ExportModalProps {
  project: QdaProject;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReport: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
  onNavigateToReport,
}) => {
  if (!isOpen) return null;

  const handleExportSegmentsCSV = () => {
    const csv = generateCodedSegmentsCSV(
      project.documents,
      project.categories,
      project.codes,
      project.codedSegments
    );
    downloadFile('amk_codierte_segmente.csv', csv, 'text/csv');
  };

  const handleExportMatrixCSV = () => {
    const csv = generateCodeMatrixCSV(
      project.documents,
      project.categories,
      project.codes,
      project.codedSegments
    );
    downloadFile('amk_code_matrix.csv', csv, 'text/csv');
  };

  const handleExportWordDoc = () => {
    exportToWordDocument(project);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    downloadFile('amk_qda_projekt_backup.json', jsonStr, 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ergebnisse exportieren
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Wähle das Format für deine AMK-Seminararbeit oder Präsentation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5">
          {/* Word (.docx / .doc) Export */}
          <div
            onClick={handleExportWordDoc}
            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                <FileBox className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Microsoft Word Dokument (.doc / .docx)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Vollständiger Bericht mit Tabellen und Zitaten, direkt editierbar in Word & Google Docs.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-blue-500" />
          </div>

          {/* PDF Report */}
          <div
            onClick={() => {
              onClose();
              onNavigateToReport();
            }}
            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Wissenschaftlicher PDF-Bericht (Mayring)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Druckfertiges Layout mit Executive Summary, Codesystem und empirischen Belegen.
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Öffnen →
            </span>
          </div>

          {/* Coded Segments CSV */}
          <div
            onClick={handleExportSegmentsCSV}
            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Codierte Zitate & Belegstellen (CSV / Excel)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tabelle aller {project.codedSegments.length} markierten Passagen mit Sprecher, Absatz und Code.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500" />
          </div>

          {/* Code Matrix CSV */}
          <div
            onClick={handleExportMatrixCSV}
            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <Table className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Code-Matrix Kreuztabelle (CSV)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Häufigkeitsmatrix (Interviews S1–S6 × Codes) für quantitative Kreuztabellen in Excel oder SPSS.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-amber-500" />
          </div>

          {/* Full JSON Backup */}
          <div
            onClick={handleExportJSON}
            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  AMK Projektarchiv (JSON)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Vollständiges Backup zum Teilen im Forschungsteam oder für Re-Imports.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-purple-500" />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
