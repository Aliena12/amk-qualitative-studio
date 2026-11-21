/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Code, CodedSegment, InterviewDocument, Paragraph, Wirkung } from '../types/qda';

// Codevorschläge über lokales Ollama: Prompt bauen, Antwort prüfen, in Textstellen umwandeln.

export const KI_SYSTEM = (frage: string) => `Du unterstützt eine qualitative Inhaltsanalyse (deduktives Codieren) von Interviews mit Studierenden.
Forschungsfrage: ${frage || 'Welche Begebenheiten stärken oder schwächen die Zugehörigkeit zur Fakultät?'}
Kausalmodell: Begebenheiten an Hochschule/Fakultät → Wirkung auf die Zugehörigkeit bzw. Identifikation mit Fakultät und Studiengang.

Regeln:
- Codiere NUR Absätze, die mit [B] (befragte Person) markiert sind. [I]-Absätze sind nur Kontext.
- "code": die Code-Nummer aus der Liste (z. B. "C3").
- "zitat" ist ein WÖRTLICHER, zusammenhängender Ausschnitt aus dem Absatz (ein bis drei Sätze), ohne Änderungen.
- "wirkung": wie die beschriebene Begebenheit auf die Zugehörigkeit wirkt: "staerkt", "schwaecht", "ambivalent" oder "neutral". Bei Codes der Zielgröße: null.
- "staerke": 1 (gering), 2 (mittel) oder 3 (stark); bei neutral oder Zielgröße: null.
- "begruendung": ein kurzer Satz, warum der Code passt.
- Lieber weniger, aber treffende Vorschläge. Wenn nichts passt: leere Liste.
Antworte ausschließlich mit JSON in dieser Form:
{"vorschlaege":[{"absatz":12,"zitat":"...","code":"C3","wirkung":"schwaecht","staerke":2,"begruendung":"..."}]}`;

export function codeListe(codes: Code[], categories: Category[]) {
  const cat = new Map(categories.map((c) => [c.id, c]));
  return codes
    .map((c, i) => {
      const k = cat.get(c.categoryId);
      return `C${i + 1} | ${c.name} [${k?.name ?? '?'}${k?.rolle === 'ziel' ? ', Zielgröße' : ''}]: ${c.description || 'ohne Definition'}`;
    })
    .join('\n');
}

export const KI_PROMPT = (liste: string, absaetze: Paragraph[]) =>
  `Codesystem:\n${liste}\n\nTranskript-Abschnitt:\n${absaetze
    .map((p) => `P${p.index} [${p.speaker === 'Befragter' ? 'B' : 'I'}]: ${p.text}`)
    .join('\n')}`;

// Abschnitte bilden: je ca. 8 Absätze der befragten Person, mit den Fragen davor als Kontext
export function abschnitte(doc: InterviewDocument, ueberspringen: Set<number>, groesse = 8): Paragraph[][] {
  const out: Paragraph[][] = [];
  let cur: Paragraph[] = [];
  let nB = 0;
  for (const p of doc.paragraphs) {
    if (p.speaker === 'System') continue;
    cur.push(p);
    if (p.speaker === 'Befragter' && !ueberspringen.has(p.index)) nB++;
    if (nB >= groesse && p.speaker === 'Befragter') {
      out.push(cur);
      cur = [];
      nB = 0;
    }
  }
  if (nB > 0) out.push(cur);
  // Abschnitte ohne codierbare Absätze entfallen
  return out.filter((a) => a.some((p) => p.speaker === 'Befragter' && !ueberspringen.has(p.index)));
}

// Zitat im Absatz finden: exakt, sonst tolerant gegenüber Leerzeichen, Anführungszeichen und Groß-/Kleinschreibung
export function findeZitat(text: string, zitat: string): { start: number; end: number } | null {
  const z = zitat.trim().replace(/^[„“"']+|[„“"']+$/g, '').replace(/\s*(\.\.\.|…)$/, '').trim();
  if (z.length < 8) return null;
  const i = text.indexOf(z);
  if (i >= 0) return { start: i, end: i + z.length };
  const muster = z
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  const m = new RegExp(muster, 'i').exec(text);
  return m ? { start: m.index, end: m.index + m[0].length } : null;
}

// Text vergleichbar machen: klein, ohne Akzente und Satzzeichen
const norm = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9äöüß]+/g, ' ').trim();
const woerter = (t: string) => norm(t).split(' ').filter((w) => w.length > 2);

// Code aus der Antwort finden: Nummer (C3), exakter Name oder ähnlichster Name
function findeCode(roh: unknown, codes: Code[]): Code | undefined {
  const t = String(roh ?? '').trim();
  const nr = /^c\s*(\d+)\b/i.exec(t);
  if (nr) return codes[Number(nr[1]) - 1];
  const n = norm(t.replace(/\[.*?\]/g, '').replace(/^c\d+\s*\|/i, ''));
  if (!n) return undefined;
  const genau = codes.find((c) => norm(c.name) === n) || codes.find((c) => n.includes(norm(c.name)) || norm(c.name).includes(n));
  if (genau) return genau;
  // Wortüberlappung als letzte Möglichkeit
  const w = new Set(woerter(n));
  let best: Code | undefined, score = 0;
  for (const c of codes) {
    const cw = woerter(c.name);
    const s = cw.filter((x) => w.has(x)).length / Math.max(1, cw.length);
    if (s > score) (best = c), (score = s);
  }
  return score >= 0.5 ? best : undefined;
}

// Abgewandeltes Zitat: ähnlichsten Satz (oder 2–3 Sätze) im Absatz finden; zurück kommt immer echter Transkripttext
function aehnlicheStelle(text: string, zitat: string): { start: number; end: number; score: number } | null {
  const zw = new Set(woerter(zitat));
  if (zw.size < 3) return null;
  const saetze: { start: number; end: number }[] = [];
  const re = /[^.!?]+[.!?]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) if (m[0].trim()) saetze.push({ start: m.index, end: m.index + m[0].length });
  let best: { start: number; end: number; score: number } | null = null;
  for (let i = 0; i < saetze.length; i++)
    for (let k = i; k < Math.min(saetze.length, i + 3); k++) {
      const teil = text.slice(saetze[i].start, saetze[k].end);
      const tw = woerter(teil);
      const treffer = [...zw].filter((x) => tw.includes(x)).length;
      // Anteil der Zitatwörter im Text, leicht abgewertet, wenn der Ausschnitt viel länger ist
      const score = (treffer / zw.size) * Math.min(1, (zw.size * 1.6) / Math.max(1, tw.length));
      if (!best || score > best.score) best = { start: saetze[i].start, end: saetze[k].end, score };
    }
  return best && best.score >= 0.55 ? best : null;
}

export interface KiErgebnis {
  segmente: Omit<CodedSegment, 'id'>[];
  verworfen: { grund: string; zitat: string }[];
}

const WIRKUNGEN: Wirkung[] = ['staerkt', 'schwaecht', 'ambivalent', 'neutral'];

// Antwort des Modells prüfen und in ungeprüfte Textstellen übersetzen
export function auswerten(
  antwort: string,
  doc: InterviewDocument,
  abschnitt: Paragraph[],
  codes: Code[],
  categories: Category[],
  vorhanden: CodedSegment[],
  ueberspringen: Set<number>
): KiErgebnis {
  const res: KiErgebnis = { segmente: [], verworfen: [] };
  let data: any;
  try {
    data = JSON.parse(antwort);
  } catch {
    res.verworfen.push({ grund: 'Antwort war kein gültiges JSON', zitat: antwort.slice(0, 80) });
    return res;
  }
  // Das Modell benennt die Liste manchmal anders: erstes Array in der Antwort nehmen
  const liste: any[] = Array.isArray(data?.vorschlaege)
    ? data.vorschlaege
    : Array.isArray(data)
      ? data
      : (Object.values(data || {}).find(Array.isArray) as any[]) || (data?.zitat ? [data] : []);
  const zielCats = new Set(categories.filter((c) => c.rolle === 'ziel').map((c) => c.id));
  const erlaubt = new Set(abschnitt.filter((p) => p.speaker === 'Befragter' && !ueberspringen.has(p.index)).map((p) => p.index));

  for (const v of liste) {
    const zitat = String(v?.zitat ?? v?.quote ?? v?.text ?? '');
    const angegeben = Number(String(v?.absatz ?? v?.paragraph ?? '').replace(/\D/g, ''));
    const code = findeCode(v?.code ?? v?.codename, codes);
    if (!code) {
      res.verworfen.push({ grund: `unbekannter Code „${v?.code}“`, zitat });
      continue;
    }
    // Zitat suchen: zuerst im angegebenen Absatz, dann in allen codierbaren Absätzen des Abschnitts
    const kandidaten = [angegeben, ...[...erlaubt].filter((x) => x !== angegeben)].filter((x) => erlaubt.has(x));
    let absatz = -1;
    let pos: { start: number; end: number } | null = null;
    let angepasst = false;
    for (const k of kandidaten) {
      pos = findeZitat(doc.paragraphs.find((p) => p.index === k)!.text, zitat);
      if (pos) {
        absatz = k;
        break;
      }
    }
    if (!pos) {
      let best: { start: number; end: number; score: number } | null = null;
      for (const k of kandidaten) {
        const t = aehnlicheStelle(doc.paragraphs.find((p) => p.index === k)!.text, zitat);
        if (t && (!best || t.score > best.score)) (best = t), (absatz = k);
      }
      if (best) (pos = best), (angepasst = true);
    }
    if (!pos) {
      res.verworfen.push({ grund: `Zitat nicht im Transkript gefunden (angegeben P${angegeben || '?'})`, zitat });
      continue;
    }
    const para = doc.paragraphs.find((p) => p.index === absatz)!;
    const exact = para.text.slice(pos.start, pos.end).trim();
    const start = para.text.indexOf(exact, pos.start);
    pos = { start, end: start + exact.length };
    const doppelt = [...vorhanden, ...res.segmente].some(
      (s) => s.documentId === doc.id && s.paragraphIndex === absatz && s.codeId === code.id && s.startIndex < pos.end && pos.start < s.endIndex
    );
    if (doppelt) continue;
    const ziel = zielCats.has(code.categoryId);
    const w: Wirkung | undefined = !ziel && WIRKUNGEN.includes(v?.wirkung) ? v.wirkung : undefined;
    const st = Number(v?.staerke);
    res.segmente.push({
      documentId: doc.id,
      codeId: code.id,
      paragraphIndex: absatz,
      exactQuote: exact,
      startIndex: pos.start,
      endIndex: pos.end,
      comment: `KI${angepasst ? ' (Zitat auf Transkriptsatz angepasst)' : ''}: ${String(v?.begruendung ?? '').slice(0, 200)}`.replace(/: $/, ''),
      quelle: 'ki',
      geprueft: false,
      ...(w ? { wirkung: w } : {}),
      ...(w && w !== 'neutral' && [1, 2, 3].includes(st) ? { staerke: st as 1 | 2 | 3 } : {}),
    });
  }
  return res;
}
