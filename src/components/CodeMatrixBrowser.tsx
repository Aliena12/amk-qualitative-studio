/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Code, CodedSegment, InterviewDocument } from '../types/qda';
import { Download, X } from 'lucide-react';
import { generateCodeMatrixCSV, downloadFile } from '../utils/exportHelpers';
import { einfluss } from '../utils/einfluss';

interface CodeMatrixBrowserProps {
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  documents: InterviewDocument[];
}


const Umschalter = <T extends string>({ wert, optionen, onChange }: { wert: T; optionen: [T, string][]; onChange: (v: T) => void }) => (
  <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs border border-zinc-200/50 dark:border-zinc-800">
    {optionen.map(([v, label]) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
          wert === v ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export const CodeMatrixBrowser: React.FC<CodeMatrixBrowserProps> = ({ categories, codes, codedSegments, documents }) => {
  const [zahlen, setZahlen] = useState(false);
  const [nurGeprueft, setNurGeprueft] = useState(false);
  const [sortieren, setSortieren] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ code: Code; doc?: InterviewDocument } | null>(null);

  const docMap = new Map(documents.map((d) => [d.id, d]));
  const istZiel = (c: Code) => categories.find((k) => k.id === c.categoryId)?.rolle === 'ziel';

  const segs = codedSegments.filter((s) => !nurGeprueft || s.geprueft !== false);
  const zelle = (codeId: string, docId?: string) => segs.filter((s) => s.codeId === codeId && (!docId || s.documentId === docId));
  // Kreisgröße = Schwere = Anzahl der Nennungen
  const wert = (_code: Code, ss: CodedSegment[]) => ss.length;

  let max = 1;
  for (const c of codes) for (const d of documents) max = Math.max(max, wert(c, zelle(c.id, d.id)));

  const kreis = (code: Code, ss: CodedSegment[]) => {
    const v = wert(code, ss);
    const ring = false;
    const col = code.color;
    if (v === 0) return <span className="text-zinc-300 dark:text-zinc-700 font-mono">{ss.length ? '0' : '·'}</span>;
    if (zahlen)
      return (
        <span className="font-mono tabular-nums font-semibold">{v}</span>
      );
    // Fläche proportional zum Wert
    const size = Math.round(10 + Math.sqrt(v / max) * 22);
    return (
      <div className="flex items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{
            width: size,
            height: size,
            backgroundColor: ring ? 'transparent' : col,
            border: ring ? `2px solid ${col}` : undefined,
            opacity: 0.9,
          }}
        >
          {v > 1 && <span className={`text-[9px] font-bold font-mono ${ring ? 'text-zinc-500' : 'text-white'}`}>{v}</span>}
        </div>
      </div>
    );
  };

  const tooltip = (code: Code, ss: CodedSegment[], wo: string) => {
    const e = einfluss(ss);
    return `${code.name} · ${wo}: Schwere ${e.schwere} (Nennungen)${istZiel(code) ? ' · Zielgröße' : ''}${e.ungeprueft ? ` · ${e.ungeprueft} ungeprüft` : ''}`;
  };

  const handleExportCSV = () => downloadFile('amk_code_matrix.csv', generateCodeMatrixCSV(documents, categories, codes, codedSegments), 'text/csv');

  const detail = selectedCell ? zelle(selectedCell.code.id, selectedCell.doc?.id) : [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Code-Matrix</span>
            <span className="text-[10px] font-mono tabular-nums bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-xs text-zinc-600 dark:text-zinc-400">
              {codes.length} Codes × {documents.length} Interviews
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kreisgröße = Schwere (Anzahl der Nennungen).
            Klicke auf eine Zelle für die Zitate.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Umschalter wert={zahlen ? 'z' : 'k'} onChange={(v) => setZahlen(v === 'z')} optionen={[['k', 'Kreise'], ['z', 'Zahlen']]} />
          <label className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-300 cursor-pointer ml-1">
            <input type="checkbox" checked={nurGeprueft} onChange={(e) => setNurGeprueft(e.target.checked)} />
            nur geprüfte
          </label>
          <label className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={sortieren} onChange={(e) => setSortieren(e.target.checked)} />
            nach Gesamtwert sortieren
          </label>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Matrix CSV</span>
          </button>
        </div>
      </div>


      <div className="flex-1 overflow-auto p-6">
        <div className="inline-block min-w-full align-middle border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-900 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-zinc-700 dark:text-zinc-300 w-80">Überkategorien & Codes</th>
                {documents.map((doc) => (
                  <th key={doc.id} className="px-3 py-3 text-center font-bold text-zinc-900 dark:text-zinc-100 min-w-[72px]">
                    {doc.respondentInfo.code}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200/50 dark:bg-zinc-800/60 min-w-[110px]">
                  Gesamt (Schwere)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
              {categories.map((category) => {
                let catCodes = codes.filter((c) => c.categoryId === category.id);
                if (sortieren) catCodes = [...catCodes].sort((a, b) => wert(b, zelle(b.id)) - wert(a, zelle(a.id)));
                return (
                  <React.Fragment key={category.id}>
                    <tr className="bg-zinc-50/70 dark:bg-zinc-900/30">
                      <td colSpan={documents.length + 2} className="px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: category.color }} />
                          <span>{category.name}</span>
                          {category.rolle === 'ziel' && <span className="text-[9px] text-emerald-600 dark:text-emerald-400">ZIELGRÖSSE</span>}
                        </div>
                      </td>
                    </tr>
                    {catCodes.map((code) => {
                      const alle = zelle(code.id);
                      const ziel = istZiel(code);
                      return (
                        <tr key={code.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 pl-8">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: code.color }} />
                              <span className="truncate max-w-[240px]" title={code.description}>{code.name}</span>
                            </div>
                          </td>
                          {documents.map((doc) => {
                            const ss = zelle(code.id, doc.id);
                            return (
                              <td
                                key={doc.id}
                                onClick={() => ss.length > 0 && setSelectedCell({ code, doc })}
                                className={`px-2 py-2 text-center align-middle ${ss.length > 0 ? 'cursor-pointer hover:bg-emerald-500/10' : ''}`}
                                title={ss.length ? tooltip(code, ss, doc.respondentInfo.code) : undefined}
                              >
                                {kreis(code, ss)}
                              </td>
                            );
                          })}
                          <td
                            onClick={() => alle.length > 0 && setSelectedCell({ code })}
                            className="px-3 py-2 text-center font-mono tabular-nums font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50/40 dark:bg-zinc-900/20 cursor-pointer hover:bg-emerald-500/10 whitespace-nowrap"
                            title={alle.length ? tooltip(code, alle, 'gesamt') : undefined}
                          >
                            {alle.length}
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

      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCell.code.color }} />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{selectedCell.code.name}</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {selectedCell.doc ? `Interview ${selectedCell.doc.respondentInfo.code}` : 'Alle Interviews'} · {detail.length} Stelle(n)
                </p>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {detail.map((seg) => (
                <div key={seg.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Interview {docMap.get(seg.documentId)?.respondentInfo.code} · P{String(seg.paragraphIndex).padStart(2, '0')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {seg.quelle === 'ki' && <span className="text-violet-500 font-bold">KI</span>}
                      {seg.staerke && <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-semibold">Schwere {seg.staerke}</span>}
                      {seg.geprueft === false && <span className="text-amber-500 font-semibold">ungeprüft</span>}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-200 italic border-l-2 pl-2.5 leading-relaxed" style={{ borderColor: selectedCell.code.color }}>
                    „{seg.exactQuote}“
                  </p>
                  {seg.comment && <div className="text-[11px] text-zinc-500">Kontext: {seg.comment}</div>}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button onClick={() => setSelectedCell(null)} className="px-4 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer">Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
