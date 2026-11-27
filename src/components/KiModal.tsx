/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Category, Code, CodedSegment, InterviewDocument, Memo } from '../types/qda';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { auswerten, codeListe, einheiten, KI_FORMAT, KI_PROMPT, KI_SYSTEM } from '../utils/ki';

interface Props {
  doc: InterviewDocument;
  codes: Code[];
  categories: Category[];
  codedSegments: CodedSegment[];
  forschungsfrage: string;
  onClose: () => void;
  onAddSegments: (segs: Omit<CodedSegment, 'id'>[]) => void;
  onAddMemo: (m: Omit<Memo, 'id' | 'createdAt'>) => void;
}

// KI-Codevorschläge für ein Interview über lokales Ollama (z. B. llama3)
export const KiModal: React.FC<Props> = ({ doc, codes, categories, codedSegments, forschungsfrage, onClose, onAddSegments, onAddMemo }) => {
  const [status, setStatus] = useState<{ ok: boolean; models: string[] } | null>(null);
  const [model, setModel] = useState('');
  const [skipCoded, setSkipCoded] = useState(true);
  const [lauf, setLauf] = useState<{ i: number; n: number } | null>(null);
  const [ergebnis, setErgebnis] = useState<{ neu: number; leer: number; verworfen: { grund: string; zitat: string }[]; fehler?: string; abgebrochen?: boolean; roh: string[] } | null>(null);
  const stop = useRef(false);

  const pruefen = () => {
    setStatus(null);
    fetch('/api/ki/status')
      .then((r) => r.json())
      .then((s) => {
        setStatus(s);
        setModel((m) => m || s.models.find((x: string) => x.startsWith('llama3')) || s.models[0] || '');
      })
      .catch(() => setStatus({ ok: false, models: [] }));
  };
  useEffect(pruefen, []);

  const ohneDef = codes.filter((c) => !c.description.trim()).length;
  const codiert = new Set(codedSegments.filter((s) => s.documentId === doc.id).map((s) => s.paragraphIndex));
  const skip = skipCoded ? codiert : new Set<number>();
  const teile = einheiten(doc, skip);

  const starten = async () => {
    stop.current = false;
    const system = KI_SYSTEM(forschungsfrage, codeListe(codes, categories));
    let neu = 0;
    let leer = 0; // Antworten ohne passenden Code
    const verworfen: { grund: string; zitat: string }[] = [];
    const roh: string[] = []; // Rohantworten zur Fehlersuche
    let fehler: string | undefined;
    let bisher = [...codedSegments];
    let i = 0;
    for (; i < teile.length && !stop.current; i++) {
      setLauf({ i: i + 1, n: teile.length });
      try {
        const r = await fetch('/api/ki/vorschlaege', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, system, prompt: KI_PROMPT(teile[i]), format: KI_FORMAT }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `Status ${r.status}`);
        if (roh.length < 5) roh.push(`P${teile[i].absatz.index}: ${String(data.content)}`);
        const e = auswerten(data.content, doc, teile[i], codes, categories, bisher);
        if (e.segmente.length) onAddSegments(e.segmente); // sofort übernehmen, damit Teilergebnisse erhalten bleiben
        bisher = [...bisher, ...(e.segmente as CodedSegment[])];
        neu += e.segmente.length;
        if (e.leer) leer++;
        verworfen.push(...e.verworfen);
      } catch (err: any) {
        fehler = err?.message || String(err);
        break;
      }
    }
    setLauf(null);
    setErgebnis({ neu, leer, verworfen, fehler, abgebrochen: stop.current, roh });
    // Lauf automatisch dokumentieren (Pflicht: KI-Dokumentation)
    if (i > 0)
      onAddMemo({
        type: 'ki_documentation',
        title: `KI-Codevorschläge ${doc.respondentInfo.code} (${model})`,
        author: '',
        documentId: doc.id,
        content:
          `Tool / Modell: Ollama lokal, Modell ${model}\n` +
          `Zweck: Vorschläge für Codierungen in Interview ${doc.respondentInfo.code} (deduktiv mit dem eigenen Codesystem)\n` +
          `Umfang: ${i} von ${teile.length} Antwort(en) der befragten Person${skipCoded ? ', bereits codierte Absätze übersprungen' : ''}${stop.current ? ', manuell abgebrochen' : ''}${fehler ? `, abgebrochen wegen Fehler: ${fehler}` : ''}\n` +
          `Ergebnis: ${neu} Vorschlag/Vorschläge übernommen (als „KI“ und „zu prüfen“ markiert), ${leer} Antwort(en) ohne passenden Code, ${verworfen.length} automatisch verworfen (unbekannter Code o. Ä.)\n` +
          `Prompt (System):\n${system}\n\n` +
          `Prompt (je Antwort): Frage der Interviewer:innen + Antwort der befragten Person\n` +
          `Eigene Prüfung und Korrektur: [vom Team ausfüllen – wie viele Vorschläge bestätigt, geändert, gelöscht und warum]\n` +
          `Reflexion: [vom Team ausfüllen]`,
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            KI-Codevorschläge für {doc.respondentInfo.code}
          </h3>
          <button onClick={() => { stop.current = true; onClose(); }} className="text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="pt-3 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
          <p>
            Ein lokales Sprachmodell (Ollama) geht jede Antwort einzeln durch und schlägt Codes aus eurem Codesystem vor. Vorschläge erscheinen
            <b> gestrichelt mit „KI ?“</b> und zählen erst nach „Prüfen & bestätigen“ als eure Codierung. Jeder Lauf wird in der KI-Dokumentation festgehalten.
          </p>

          {status === null && <p className="text-zinc-400 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Prüfe Ollama …</p>}

          {status && !status.ok && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
              <p className="font-semibold">Ollama ist nicht erreichbar.</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Ollama installieren (ollama.com) und die App starten</li>
                <li>Im Terminal einmalig: <code className="font-mono">ollama pull llama3</code></li>
                <li>Dann hier „Erneut prüfen“</li>
              </ol>
              <button onClick={pruefen} className="mt-1 px-2.5 py-1 rounded-md bg-amber-600 text-white font-semibold cursor-pointer">Erneut prüfen</button>
            </div>
          )}

          {status?.ok && status.models.length === 0 && (
            <p className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">Ollama läuft, aber es ist kein Modell installiert. Im Terminal: <code className="font-mono">ollama pull llama3</code></p>
          )}

          {status?.ok && status.models.length > 0 && !lauf && !ergebnis && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11px] font-semibold mb-1">Modell</span>
                  <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {status.models.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-1.5 cursor-pointer">
                  <input type="checkbox" checked={skipCoded} onChange={(e) => setSkipCoded(e.target.checked)} />
                  <span>bereits codierte Absätze überspringen</span>
                </label>
              </div>
              <p className="text-zinc-500">{teile.length} Antwort(en) werden einzeln geprüft (kurze Antworten wie „Ja.“ werden übersprungen). Je nach Rechner 5–60 Sekunden pro Antwort.</p>
              {ohneDef > 0 && <p className="text-amber-600">{ohneDef} Code(s) ohne Definition – das Modell orientiert sich an den Definitionen, ohne sie werden Vorschläge ungenauer.</p>}
              <div className="flex justify-end">
                <button disabled={!model || teile.length === 0} onClick={starten} className="px-3.5 py-1.5 font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-lg cursor-pointer">
                  Vorschläge erzeugen
                </button>
              </div>
            </>
          )}

          {lauf && (
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />Antwort {lauf.i} von {lauf.n} …</div>
              <div className="h-1.5 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-violet-500 transition-all" style={{ width: `${((lauf.i - 1) / lauf.n) * 100}%` }} />
              </div>
              <div className="flex justify-end">
                <button onClick={() => (stop.current = true)} className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer">Anhalten</button>
              </div>
            </div>
          )}

          {ergebnis && (
            <div className="space-y-2">
              <p className="font-semibold">
                {ergebnis.neu} Vorschlag/Vorschläge übernommen{ergebnis.abgebrochen ? ' (angehalten)' : ''}, {ergebnis.leer} Antwort(en) ohne passenden Code.
                {ergebnis.neu > 0 && ' Über „zu prüfen“ oben im Transkript gehst du sie durch.'}
              </p>
              {ergebnis.fehler && <p className="text-rose-600">Fehler: {ergebnis.fehler}</p>}
              {ergebnis.verworfen.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-zinc-500">{ergebnis.verworfen.length} automatisch verworfen</summary>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-zinc-500 max-h-40 overflow-y-auto">
                    {ergebnis.verworfen.map((v, k) => <li key={k}>{v.grund}{v.zitat ? `: „${v.zitat.slice(0, 70)}“` : ''}</li>)}
                  </ul>
                </details>
              )}
              {ergebnis.roh.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-zinc-500">Rohantworten des Modells (zur Fehlersuche)</summary>
                  <pre className="mt-1 text-[10px] whitespace-pre-wrap break-words max-h-48 overflow-y-auto p-2 rounded bg-zinc-100 dark:bg-zinc-800">{ergebnis.roh.join('\n\n---\n\n')}</pre>
                </details>
              )}
              <div className="flex justify-end">
                <button onClick={onClose} className="px-3.5 py-1.5 font-semibold text-white bg-emerald-600 rounded-lg cursor-pointer">Schließen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
