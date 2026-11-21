/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { QdaProject } from '../types/qda';
import { FileDown, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { buildReport, ReportQuote } from '../utils/report';
import { downloadReportPdf } from '../utils/reportPdf';

interface Props {
  project: QdaProject;
  onOpenInfo: () => void;
}

const Quote: React.FC<{ q: ReportQuote; color: string }> = ({ q, color }) => (
  <blockquote className="text-xs text-zinc-700 dark:text-zinc-300 border-l-2 pl-3 py-0.5 break-inside-avoid" style={{ borderColor: color }}>
    <span className="italic">„{q.text}“</span>
    <span className="block text-[10px] font-mono text-zinc-400 mt-0.5">
      {q.doc} · Absatz P{String(q.para).padStart(2, '0')}
      {q.time ? ` · Audio ${q.time}` : ''}
      {q.wirkung ? ` · Wirkung: ${q.wirkung}` : ''}
      {q.comment ? ` · ${q.comment}` : ''}
    </span>
  </blockquote>
);

export const SynthesisReport: React.FC<Props> = ({ project, onOpenInfo }) => {
  const r = useMemo(() => buildReport(project), [project]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handlePdf = async () => {
    setBusy(true);
    setError('');
    try {
      await downloadReportPdf(project);
    } catch (e: any) {
      console.error(e);
      setError(`PDF konnte nicht erstellt werden: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  const title = (num: string, text: string, color: string) => (
    <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
      <span className={`w-1.5 h-5 rounded-full ${color}`} />
      {num}. {text}
    </h2>
  );

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Ergebnisbericht</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Diese Vorschau ist der Inhalt des PDFs: Datengrundlage, Kategorienschema, Kausalmodell, Belegstellen, Hypothesen, Memos.</p>
        </div>
        <button
          onClick={handlePdf}
          disabled={busy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 rounded-lg shadow-xs cursor-pointer"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          <span>{busy ? 'Erstelle PDF …' : 'PDF herunterladen'}</span>
        </button>
      </div>

      <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full space-y-4">
        {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">{error}</div>}

        {r.warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="w-4 h-4" />Vor der Abgabe prüfen (steht nicht im PDF)</div>
            <ul className="list-disc pl-5 space-y-0.5">{r.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        )}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Es werden keine Texte automatisch erzeugt. Nutzt du für Codierung, Verdichtung oder Hypothesen eine KI, dokumentiere das im Tab „Memos & KI-Doku“ (Pflicht laut Modalitäten, erscheint im PDF).</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 rounded-2xl shadow-xs text-zinc-900 dark:text-zinc-100 space-y-8">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">{r.module}</div>
            <h1 className="text-2xl font-extrabold tracking-tight">{r.title}</h1>
            {r.description ? <p className="text-sm text-zinc-600 dark:text-zinc-300">{r.description}</p> : (
              <button onClick={onOpenInfo} className="text-xs text-amber-600 underline cursor-pointer">Forschungsfrage ergänzen</button>
            )}
            <p className="text-[11px] text-zinc-400">{r.authors ? `${r.authors} · ` : ''}Stand {r.date}</p>
          </div>

          <div className="space-y-3">
            {title('1', 'Datengrundlage', 'bg-emerald-600')}
            {r.interviews.length === 0 ? <p className="text-xs italic text-zinc-400">Noch keine Interviews importiert.</p> : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                    <tr><th className="p-3">Interview</th><th className="p-3">Rolle / Studiengang</th><th className="p-3">Datum</th><th className="p-3">Dauer</th><th className="p-3 text-right">Passagen</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {r.interviews.map((i) => (
                      <tr key={i.code}>
                        <td className="p-3 font-mono font-bold">{i.code}</td>
                        <td className="p-3">{i.role || '–'}</td>
                        <td className="p-3">{i.date || '–'}</td>
                        <td className="p-3">{i.duration || '–'}</td>
                        <td className="p-3 text-right font-mono tabular-nums">{i.segments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {title('2', 'Kategorienschema', 'bg-blue-600')}
            {r.schema.map((cat, ci) => (
              <div key={cat.name + ci} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 break-inside-avoid space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: cat.color }} />
                  <h3 className="text-sm font-bold">2.{ci + 1} {cat.name}</h3>
                  {cat.ziel && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">Zielgröße</span>}
                </div>
                {cat.description && <p className="text-xs text-zinc-600 dark:text-zinc-400">{cat.description}</p>}
                {cat.codes.length === 0 ? <p className="text-xs italic text-zinc-400">Noch keine Codes in dieser Überkategorie.</p> : (
                  <table className="w-full text-xs text-left">
                    <thead className="text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                      <tr><th className="py-2 pr-3">Code</th><th className="py-2 pr-3">Definition / Codieranweisung</th><th className="py-2 pr-3 text-right">Stellen</th><th className="py-2 pr-3 text-right">Interviews</th>{!cat.ziel && <th className="py-2 text-right" title="Schwere stärkend / schwächend / ambivalent">Wirkung</th>}</tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {cat.codes.map((c) => (
                        <tr key={c.name}>
                          <td className="py-2 pr-3 font-semibold align-top">{c.name}</td>
                          <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300 align-top">{c.definition || '–'}</td>
                          <td className="py-2 pr-3 text-right font-mono tabular-nums align-top">{c.segments}</td>
                          <td className="py-2 pr-3 text-right font-mono tabular-nums align-top">{c.interviews} / {r.interviews.length}</td>
                          {!cat.ziel && <td className="py-2 text-right font-mono tabular-nums align-top whitespace-nowrap">{c.wirkung}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {title('3', 'Einflussfaktoren auf die Zugehörigkeit (Kausalmodell)', 'bg-rose-600')}
            <p className="text-[11px] text-zinc-400">
              Begebenheiten → Wirkung auf Zugehörigkeit/Identifikation mit Fakultät und Studiengang. Schwere = Summe der Stärken (1–3) der bewerteten Textstellen, sortiert nach Gesamtschwere.
              {r.ungeprueft > 0 && ` ${r.ungeprueft} Bewertung(en) sind noch ungeprüfte Vorschläge.`}
            </p>
            {r.einfluss.length === 0 ? <p className="text-xs italic text-zinc-400">Noch keine Textstellen mit Wirkungsbewertung.</p> : (
              <table className="w-full text-xs text-left">
                <thead className="text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr><th className="py-2 pr-3">Begebenheit (Code)</th><th className="py-2 pr-3 text-right">stärkt</th><th className="py-2 pr-3 text-right">schwächt</th><th className="py-2 pr-3 text-right">±</th><th className="py-2 pr-3 text-right">Schwere</th><th className="py-2 pr-3 text-right">Netto</th><th className="py-2 text-right">Interviews</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {r.einfluss.map((e) => (
                    <tr key={e.category + e.code}>
                      <td className="py-1.5 pr-3"><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: e.color }} /><b>{e.code}</b> <span className="text-zinc-400">· {e.category}</span></td>
                      <td className="py-1.5 pr-3 text-right whitespace-nowrap font-mono text-emerald-600">{e.staerkt ? `${e.staerkt} (${e.plus})` : '–'}</td>
                      <td className="py-1.5 pr-3 text-right whitespace-nowrap font-mono text-rose-600">{e.schwaecht ? `${e.schwaecht} (${e.minus})` : '–'}</td>
                      <td className="py-1.5 pr-3 text-right whitespace-nowrap font-mono text-amber-600">{e.ambivalent || '–'}</td>
                      <td className="py-1.5 pr-3 text-right whitespace-nowrap font-mono font-bold">{e.schwere}</td>
                      <td className={`py-1.5 pr-3 text-right font-mono ${e.netto > 0 ? 'text-emerald-600' : e.netto < 0 ? 'text-rose-600' : ''}`}>{e.netto > 0 ? `+${e.netto}` : e.netto}</td>
                      <td className="py-1.5 text-right font-mono">{e.interviews} / {r.interviews.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-[10px] text-zinc-400">stärkt/schwächt: Anzahl Stellen (Schwere). Netto = Schwere stärkend − schwächend.</p>
          </div>

          <div className="space-y-4">
            {title('4', 'Belegstellen (Transkript-Auszüge)', 'bg-amber-600')}
            <p className="text-[11px] text-zinc-400">Wörtliche Auszüge. Angabe je Zitat: Interview · Absatz im Transkript · Zeitstempel in der Audioaufnahme.</p>
            {r.evidence.length === 0 && <p className="text-xs italic text-zinc-400">Noch keine Textstellen codiert.</p>}
            {r.evidence.map((e) => (
              <div key={e.category + e.code} className="space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />{e.category} → {e.code}</h3>
                {e.quotes.map((q, i) => <Quote key={i} q={q} color={e.color} />)}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {title('5', 'Abgeleitete Hypothesen', 'bg-purple-600')}
            {r.hypotheses.length === 0 && <p className="text-xs italic text-zinc-400">Noch keine Hypothesen erfasst (Tab „Hypothesen“).</p>}
            {r.hypotheses.map((h) => (
              <div key={h.label} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 break-inside-avoid space-y-1.5">
                <p className="text-sm"><b className="text-emerald-600 dark:text-emerald-400">{h.label}</b> <b>{h.statement}</b></p>
                {h.reasoning && <p className="text-xs"><b>Herleitung: </b>{h.reasoning}</p>}
                {h.variables && <p className="text-xs"><b>Variablen / Konstrukte: </b>{h.variables}</p>}
                <p className="text-xs"><b>Zugrunde liegende Codes: </b>{h.codes.length ? h.codes.map((c) => `${c.name} (${c.count})`).join(', ') : 'keine verknüpft'}</p>
                <p className="text-[11px] text-zinc-400">Belege: {h.segments} Textstelle(n) aus {h.interviews} von {r.interviews.length} Interview(s)</p>
                {h.quotes.map((q, i) => <Quote key={i} q={q} color="#047857" />)}
              </div>
            ))}
          </div>

          {r.memoSections.map((s, si) => (
            <div key={s.title} className="space-y-3">
              {title(String(6 + si), s.title, 'bg-indigo-600')}
              {s.items.map((m, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 break-inside-avoid space-y-1">
                  <h3 className="text-sm font-bold">{m.title}</h3>
                  <p className="text-[10px] text-zinc-400">{m.author ? `${m.author} · ` : ''}{m.date}</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
