/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { QdaProject } from '../types/qda';
import { FileText, Table, FileCode, Download, X, FileDown, Upload, Trash2 } from 'lucide-react';
import { generateCodedSegmentsCSV, generateCodeMatrixCSV, downloadFile } from '../utils/exportHelpers';
import { downloadReportPdf } from '../utils/reportPdf';

interface ExportModalProps {
  project: QdaProject;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReport: () => void;
  onRestore: (raw: unknown) => string | null; // Fehlermeldung oder null
  onReset: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const ExportModal: React.FC<ExportModalProps> = ({ project, isOpen, onClose, onNavigateToReport, onRestore, onReset }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!isOpen) return null;

  const close = () => {
    setMsg(null);
    setConfirmReset(false);
    onClose();
  };

  const handlePdf = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await downloadReportPdf(project);
    } catch (e: any) {
      setMsg({ ok: false, text: `PDF konnte nicht erstellt werden: ${e?.message || e}` });
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const err = onRestore(JSON.parse(await f.text()));
      if (err) setMsg({ ok: false, text: err });
      else close();
    } catch (e2) {
      setMsg({ ok: false, text: 'Die Datei ist kein lesbares JSON.' });
    }
  };

  const Row = ({ icon, color, title, text, onClick, trailing }: { icon: React.ReactNode; color: string; title: string; text: string; onClick: () => void; trailing?: React.ReactNode }) => (
    <div onClick={onClick} className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{title}</h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{text}</p>
        </div>
      </div>
      {trailing ?? <Download className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500" />}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Export & Archiv</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Alles wird lokal im Browser erzeugt, nichts wird hochgeladen.</p>
          </div>
          <button onClick={close} className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="py-4 space-y-2.5">
          {msg && <div className={`p-2.5 rounded-lg text-xs ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'}`}>{msg.text}</div>}

          <Row
            icon={<FileDown className="w-4 h-4" />}
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
            title={busy ? 'Erstelle PDF …' : 'Ergebnisbericht als PDF'}
            text="Der Inhalt der Vorschau im Tab „Ergebnisbericht“ als PDF-Datei."
            onClick={() => !busy && handlePdf()}
          />
          <div className="text-right -mt-1">
            <button onClick={() => { close(); onNavigateToReport(); }} className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">Vorschau ansehen →</button>
          </div>

          <Row
            icon={<FileText className="w-4 h-4" />}
            color="bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
            title="Codierte Textstellen (CSV / Excel)"
            text={`Alle ${project.codedSegments.length} markierten Passagen mit Interview, Absatz, Zeitstempel und Code.`}
            onClick={() => downloadFile(`amk_codierte_textstellen_${today()}.csv`, generateCodedSegmentsCSV(project.documents, project.categories, project.codes, project.codedSegments), 'text/csv')}
          />
          <Row
            icon={<Table className="w-4 h-4" />}
            color="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
            title="Code-Matrix (CSV)"
            text="Häufigkeiten je Interview und Code (Kreuztabelle)."
            onClick={() => downloadFile(`amk_code_matrix_${today()}.csv`, generateCodeMatrixCSV(project.documents, project.categories, project.codes, project.codedSegments), 'text/csv')}
          />
          <Row
            icon={<FileCode className="w-4 h-4" />}
            color="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
            title="Projektarchiv sichern (JSON)"
            text="Vollständige Kopie inkl. Transkripte – nur für dich/dein Team, enthält vertrauliche Daten."
            onClick={() => downloadFile(`amk_projektarchiv_${today()}.json`, JSON.stringify(project, null, 2), 'application/json')}
          />
          <Row
            icon={<Upload className="w-4 h-4" />}
            color="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
            title="Projektarchiv einspielen (JSON)"
            text="Ersetzt den aktuellen Stand. Der bisherige Stand wird vorher automatisch in data/backups gesichert."
            onClick={() => fileRef.current?.click()}
            trailing={<span className="text-xs text-zinc-400">Datei wählen</span>}
          />
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleRestore} className="hidden" />
        </div>

        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300"><Trash2 className="w-3.5 h-3.5" />Gefahrenzone</div>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="text-xs text-rose-600 hover:underline cursor-pointer">Projekt komplett leeren …</button>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">Alle Interviews, Codes, Hypothesen und Memos werden aus dem Projekt entfernt. Vorher wird eine Sicherung in data/backups angelegt.</p>
              <div className="flex gap-2">
                <button onClick={() => { onReset(); close(); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer">Ja, leeren</button>
                <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Abbrechen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
