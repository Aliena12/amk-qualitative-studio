/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Code, CodedSegment, InterviewDocument, Paragraph } from '../types/qda';

// Codevorschläge über lokales Ollama. Das Modell bekommt EINE Antwort der befragten Person (mit der Frage davor)
// und entscheidet nur, welche Codes passen. Kleine Modelle wie llama3 kommen damit viel besser zurecht als mit langen Abschnitten.

// Systemanweisung inkl. Codesystem: bleibt für alle Anfragen gleich (Ollama kann sie zwischenspeichern)
export const KI_SYSTEM = (frage: string, liste: string) => `Du hilfst beim Codieren von Interviews mit Studierenden (qualitative Inhaltsanalyse).
Thema: ${frage || 'Was stärkt oder schwächt die Zugehörigkeit der Studierenden zu ihrer Fakultät?'}

Du bekommst eine Frage und die ANTWORT einer befragten Person. Prüfe, welche Codes aus der Liste auf die ANTWORT passen.

Codesystem (Nummer | Name [Kategorie]: Definition):
${liste}

Regeln:
- Nur Codes aus der Liste, angegeben mit ihrer Nummer, z. B. "C4". Höchstens 2 Codes.
- "zitat": der passende Satz aus der Antwort, wörtlich abgeschrieben.
- "begruendung": ein kurzer Satz.
- Wenn kein Code passt (z. B. Smalltalk, Organisatorisches): leere Liste.

Beispiel für eine Antwort im richtigen Format:
{"codes":[{"code":"C4","zitat":"Wir waren nur 20 Leute, da war es einfach, Kontakte zu knüpfen.","begruendung":"Kleine Gruppe erleichtert Kontakt."}]}
Ohne Treffer: {"codes":[]}`;

// JSON-Schema: zwingt das Modell (Ollama ab Version 0.5) in genau diese Struktur
export const KI_FORMAT = {
  type: 'object',
  properties: {
    codes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          zitat: { type: 'string' },
          begruendung: { type: 'string' },
        },
        required: ['code', 'zitat'],
      },
    },
  },
  required: ['codes'],
};

export function codeListe(codes: Code[], categories: Category[]) {
  const cat = new Map(categories.map((c) => [c.id, c]));
  return codes
    .map((c, i) => {
      const k = cat.get(c.categoryId);
      return `C${i + 1} | ${c.name} [${k?.name ?? '?'}]: ${c.description || 'ohne Definition'}`;
    })
    .join('\n');
}

// Eine Einheit = eine Antwort der befragten Person + die letzte Frage davor als Kontext
export interface Einheit {
  absatz: Paragraph;
  frage?: Paragraph;
}

export function einheiten(doc: InterviewDocument, ueberspringen: Set<number>, minWoerter = 8): Einheit[] {
  const out: Einheit[] = [];
  let frage: Paragraph | undefined;
  for (const p of doc.paragraphs) {
    if (p.speaker === 'Interviewer') frage = p;
    if (p.speaker !== 'Befragter' || ueberspringen.has(p.index)) continue;
    if (p.text.split(/\s+/).length < minWoerter) continue; // „Ja.“, „Genau.“ usw. überspringen
    out.push({ absatz: p, frage });
  }
  return out;
}

export const KI_PROMPT = (e: Einheit) =>
  `${e.frage ? `FRAGE: ${e.frage.text}\n\n` : ''}ANTWORT (Absatz P${e.absatz.index}): ${e.absatz.text}`;

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
  // Pausen-Markierungen wie „(.)“ oder „(..)“ sind kein Satzende; gleich lang ersetzen, damit die Positionen stimmen
  const ohnePausen = text.replace(/\((\.+)\)/g, (x) => '(' + '·'.repeat(x.length - 2) + ')');
  while ((m = re.exec(ohnePausen))) if (m[0].trim()) saetze.push({ start: m.index, end: m.index + m[0].length });
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
  leer: boolean; // Modell hat keinen Code vergeben
}

// Antwort des Modells für EINEN Absatz prüfen und in ungeprüfte Textstellen übersetzen
export function auswerten(
  antwort: string,
  doc: InterviewDocument,
  e: Einheit,
  codes: Code[],
  categories: Category[],
  vorhanden: CodedSegment[]
): KiErgebnis {
  const res: KiErgebnis = { segmente: [], verworfen: [], leer: false };
  let data: any;
  try {
    data = JSON.parse(antwort);
  } catch {
    res.verworfen.push({ grund: 'Antwort war kein gültiges JSON', zitat: antwort.slice(0, 80) });
    return res;
  }
  // Das Modell benennt die Liste manchmal anders: erstes Array in der Antwort nehmen
  const liste: any[] = Array.isArray(data?.codes)
    ? data.codes
    : Array.isArray(data)
      ? data
      : (Object.values(data || {}).find(Array.isArray) as any[]) || (data?.code ? [data] : []);
  if (liste.length === 0) res.leer = true;

  const zielCats = new Set(categories.filter((c) => c.rolle === 'ziel').map((c) => c.id));
  const para = e.absatz;
  for (const v of liste.slice(0, 3)) {
    const zitat = String(v?.zitat ?? v?.quote ?? v?.text ?? '');
    const code = findeCode(v?.code ?? v?.name, codes);
    if (!code) {
      res.verworfen.push({ grund: `unbekannter Code „${v?.code}“`, zitat });
      continue;
    }
    // Zitat im Absatz suchen: wörtlich, dann ähnlichster Satz, sonst ganzer Absatz (das Modell hat den Absatz ja als passend erkannt)
    let pos: { start: number; end: number } | null = findeZitat(para.text, zitat);
    let hinweis = '';
    if (!pos) {
      pos = aehnlicheStelle(para.text, zitat);
      if (pos) hinweis = ' (Zitat auf Transkriptsatz angepasst)';
    }
    if (!pos) {
      pos = { start: 0, end: para.text.length };
      hinweis = ' (ganzer Absatz markiert – bitte zuschneiden)';
    }
    const exact = para.text.slice(pos.start, pos.end).trim();
    const start = para.text.indexOf(exact, pos.start);
    const end = start + exact.length;
    const doppelt = [...vorhanden, ...res.segmente].some(
      (s) => s.documentId === doc.id && s.paragraphIndex === para.index && s.codeId === code.id && s.startIndex < end && start < s.endIndex
    );
    if (doppelt) continue;
    res.segmente.push({
      documentId: doc.id,
      codeId: code.id,
      paragraphIndex: para.index,
      exactQuote: exact,
      startIndex: start,
      endIndex: end,
      comment: `KI${hinweis}: ${String(v?.begruendung ?? '').slice(0, 200)}`.replace(/: $/, ''),
      quelle: 'ki',
      geprueft: false,
    });
  }
  return res;
}
