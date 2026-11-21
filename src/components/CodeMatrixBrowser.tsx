/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Code, CodedSegment, InterviewDocument, WIRKUNG_LABEL } from '../types/qda';
import { Download, X } from 'lucide-react';
import { generateCodeMatrixCSV, downloadFile } from '../utils/exportHelpers';
import { einfluss, Einfluss } from '../utils/einfluss';
import { WIRKUNG_FARBE } from './WirkungPicker';

interface CodeMatrixBrowserProps {
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  documents: InterviewDocument[];
}

type Groesse = 'haeufigkeit' | 'schwere';
type Farbe = 'code' | 'wirkung';

// Farbe nach Nettowirkung: überwiegend stärkend grün, schwächend rot, ausgeglichen orange
const nettoFarbe = (e: Einfluss) =>
  e.schwere === 0 ? '#a1a1aa' : e.netto > 0 ? WIRKUNG_FARBE.staerkt : e.netto < 0 ? WIRKUNG_FARBE.schwaecht : WIRKUNG_FARBE.ambivalent;

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
  const [groesse, setGroesse] = useState<Groesse>('haeufigkeit');
  const [farbe, setFarbe] = useState<Farbe>('code');
  const [zahlen, setZahlen] = useState(false);
  const [nurGeprueft, setNurGeprueft] = useState(false);
  const [sortieren, setSortieren] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ code: Code; doc?: InterviewDocument } | null>(null);

  const docMap = new Map(documents.map((d) => [d.id, d]));
  const istZiel = (c: Code) => categories.find((k) => k.id === c.categoryId)?.rolle === 'ziel';

  const segs = codedSegments.filter((s) => !nurGeprueft || s.geprueft !== false);
  const zelle = (codeId: string, docId?: string) => segs.filter((s) => s.codeId === codeId && (!docId || s.documentId === docId));
  // Wert, nach dem die Kreisgröße skaliert: Anzahl Stellen oder Summe der Stärken
  const wert = (code: Code, ss: CodedSegment[]) => (groesse === 'haeufigkeit' || istZiel(code) ? ss.length : einfluss(ss).schwere);

  let max = 1;
  for (const c of codes) for (const d of documents) max = Math.max(max, wert(c, zelle(c.id, d.id)));

  const kreis = (code: Code, ss: CodedSegment[]) => {
    const v = wert(code, ss);
    const e = einfluss(ss);
    const ziel = istZiel(code);
    // in der Schwere-Ansicht haben Codes der Zielgröße keine Schwere: als Ring nach Häufigkeit
    const ring = groesse === 'schwere' && ziel;
    const col = farbe === 'wirkung' && !ziel ? nettoFarbe(e) : code.color;
    if (v === 0) return <span className="text-zinc-300 dark:text-zinc-700 font-mono">{ss.length ? '0' : '·'}</span>;
    if (zahlen)
      return (
        <span className="font-mono tabular-nums font-semibold" style={farbe === 'wirkung' && !ziel ? { color: col } : undefined}>
          {groesse === 'schwere' && !ziel ? `${e.netto > 0 ? '+' : ''}${e.netto} (${v})` : v}
        </span>
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
    return `${code.name} · ${wo}: ${ss.length} Stelle(n)${
      istZiel(code) ? ' (Zielgröße)' : ` · Schwere ${e.schwere} (stärkend ${e.plus}, schwächend ${e.minus}${e.ambi ? `, ambivalent ${e.ambi}` : ''})`
    }${e.ungeprueft ? ` · ${e.ungeprueft} ungeprüft` : ''}`;
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
            {groesse === 'haeufigkeit'
              ? 'Kreisgröße = Anzahl codierter Stellen.'
              : 'Kreisgröße = Schwere (Summe der Stärken 1–3). Zielgröße als Ring nach Häufigkeit.'}{' '}
            Klicke auf eine Zelle für die Zitate.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-zinc-500">Größe</span>
          <Umschalter wert={groesse} onChange={setGroesse} optionen={[['haeufigkeit', 'Häufigkeit'], ['schwere', 'Schwere']]} />
          <span className="text-[11px] text-zinc-500 ml-1">Farbe</span>
          <Umschalter wert={farbe} onChange={setFarbe} optionen={[['code', 'Code'], ['wirkung', 'Wirkung']]} />
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

      {farbe === 'wirkung' && (
        <div className="px-6 pt-3 flex items-center gap-4 text-[11px] text-zinc-500">
          {(['staerkt', 'schwaecht', 'ambivalent'] as const).map((w) => (
            <span key={w} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: WIRKUNG_FARBE[w] }} />
              überwiegend {w === 'ambivalent' ? 'ausgeglichen' : WIRKUNG_LABEL[w]}
            </span>
          ))}
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />ohne Bewertung</span>
        </div>
      )}

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
                  Gesamt {groesse === 'schwere' ? '(Schwere, netto)' : '(Stellen)'}
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
                      const e = einfluss(alle);
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
                            {groesse === 'schwere' && !ziel ? (
                              <>
                                {e.schwere}{' '}
                                <span style={{ color: nettoFarbe(e) }} className="font-normal">
                                  ({e.netto > 0 ? '+' : ''}{e.netto})
                                </span>
                              </>
                            ) : (
                              alle.length
                            )}
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
                      {seg.wirkung && (
                        <span className="px-1.5 py-0.5 rounded text-white font-semibold" style={{ backgroundColor: WIRKUNG_FARBE[seg.wirkung] }}>
                          {WIRKUNG_LABEL[seg.wirkung]}{seg.staerke && seg.wirkung !== 'neutral' ? ` · ${seg.staerke}` : ''}
                        </span>
                      )}
                      {seg.geprueft === false && <span className="text-amber-500 font-semibold">ungeprüft</span>}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-200 italic border-l-2 pl-2.5 leading-relaxed" style={{ borderColor: selectedCell.code.color }}>
                    „{seg.exactQuote}“
                  </p>
                  {seg.comment && <div className="text-[11px] text-zinc-400">{seg.comment}</div>}
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
