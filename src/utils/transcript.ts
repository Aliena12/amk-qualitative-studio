/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Paragraph, Speaker } from '../types/qda';

// Erkennt Transkripte im Format "Sprecher: [00:02:12] Text" (z. B. tiroScribe/Whisper) sowie "I:"/"B:"-Transkripte.

export interface ParsedLine {
  label?: string;
  time?: string;
  text: string;
}

export interface LabelStat {
  label: string;
  count: number; // Anzahl Beiträge
  words: number;
  sample: string;
  role: Speaker;
}

export interface TranscriptAnalysis {
  lines: ParsedLine[];
  firstContent: number; // erste Zeile mit Sprecher oder Zeitstempel; alles davor ist Metadaten-Kopf
  labels: LabelStat[];
  meta: { duration?: string; audio?: string };
}

const TIME = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*/;
const LABEL = /^([^:\[\]\n]{1,30}?):\s*/;
const BEFRAGTE = /^(interviewte|befragt|proband|teilnehmer|interviewee|respondent|antwort|b$|p$)/i;

// Standardzuordnung: Kürzel, die nach "interviewte Person" klingen, sind die Befragten, alle anderen Interviewer:innen
export const roleOfLabel = (label: string): Speaker => (BEFRAGTE.test(label.trim()) ? 'Befragter' : 'Interviewer');

// Ein Kürzel gilt nur, wenn direkt danach ein Zeitstempel steht oder es mindestens 3-mal vorkommt
// (sonst würde "Duration: 00:35:08" oder "Genau: das war so" als Sprecher erkannt)
function detectLabels(lines: string[]): Set<string> {
  const stat = new Map<string, { n: number; timed: boolean }>();
  for (const l of lines) {
    const m = l.match(LABEL);
    if (!m) continue;
    const key = m[1].trim();
    const s = stat.get(key) || { n: 0, timed: false };
    s.n++;
    if (TIME.test(l.slice(m[0].length))) s.timed = true;
    stat.set(key, s);
  }
  return new Set([...stat].filter(([, s]) => s.timed || s.n >= 3).map(([k]) => k));
}

function parseLine(line: string, accepted: Set<string>): ParsedLine {
  let rest = line;
  let label: string | undefined;
  const m = rest.match(LABEL);
  if (m && accepted.has(m[1].trim())) {
    label = m[1].trim();
    rest = rest.slice(m[0].length);
  }
  let time: string | undefined;
  const t = rest.match(TIME);
  if (t) {
    time = t[1];
    rest = rest.slice(t[0].length);
  }
  return { label, time, text: rest.trim() };
}

const toMin = (h: number, m: number, s: number) => `${h * 60 + m + (s >= 30 ? 1 : 0)} Min.`;

export function analyzeTranscript(raw: string): TranscriptAnalysis {
  const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const accepted = detectLabels(rawLines);
  const lines = rawLines.map((l) => parseLine(l, accepted));
  let firstContent = lines.findIndex((l) => l.label || l.time);
  if (firstContent < 0) firstContent = 0; // reiner Fließtext: nichts ist Metadaten

  // Statistik je Sprecherkürzel
  const stats = new Map<string, LabelStat>();
  for (const l of lines.slice(firstContent)) {
    if (!l.label) continue;
    const s = stats.get(l.label) || { label: l.label, count: 0, words: 0, sample: '', role: roleOfLabel(l.label) };
    s.count++;
    s.words += l.text.split(/\s+/).filter(Boolean).length;
    if (!s.sample && l.text.length > 15) s.sample = l.text.slice(0, 80);
    stats.set(l.label, s);
  }
  const labels = [...stats.values()];
  // Kein Kürzel nach "interviewte Person" benannt (z. B. nur "A:" und "B:")? Wer am meisten spricht, ist der/die Befragte.
  if (labels.length > 0 && !labels.some((s) => s.role === 'Befragter')) {
    [...labels].sort((a, b) => b.words - a.words)[0].role = 'Befragter';
  }

  // Metadaten aus dem Kopf: Dateiname und Dauer
  const head = lines.slice(0, firstContent).map((l) => l.text);
  const meta: TranscriptAnalysis['meta'] = {};
  meta.audio = head.find((t) => /\.(m4a|mp3|wav|mp4|ogg|flac|aac)$/i.test(t));
  const d = head.map((t) => t.match(/^duration:\s*(\d{1,2}):(\d{2}):(\d{2})/i)).find(Boolean);
  if (d) meta.duration = toMin(+d[1], +d[2], +d[3]);
  else {
    const last = [...lines].reverse().find((l) => l.time)?.time?.split(':').map(Number);
    if (last) meta.duration = last.length === 3 ? toMin(last[0], last[1], last[2]) : toMin(0, last[0], last[1]);
  }
  return { lines, firstContent, labels, meta };
}

export const defaultRoles = (an: TranscriptAnalysis): Record<string, Speaker> =>
  Object.fromEntries(an.labels.map((l) => [l.label, l.role]));

// Baut die Absätze; Zeilen ohne Kürzel gehören zum zuletzt sprechenden Kürzel
export function buildParagraphs(an: TranscriptAnalysis, roles: Record<string, Speaker>): Paragraph[] {
  const out: Paragraph[] = [];
  let current: string | undefined;
  an.lines.forEach((l, i) => {
    if (!l.text) return;
    let speaker: Speaker = 'Befragter';
    if (i < an.firstContent) speaker = 'System';
    else {
      if (l.label) current = l.label;
      if (current) speaker = roles[current] ?? roleOfLabel(current);
    }
    const p: Paragraph = { index: out.length + 1, speaker, text: l.text };
    if (i >= an.firstContent && current) p.speakerLabel = current;
    if (l.time) p.time = l.time;
    out.push(p);
  });
  return out;
}

// Nächstes freies Interview-Kürzel im Stil der vorhandenen (S1, S2 → S3)
export const nextCode = (existing: string[]): string => {
  const m = existing.map((c) => c.match(/^([A-Za-zÄÖÜäöü]+)(\d+)$/)).filter(Boolean) as RegExpMatchArray[];
  const prefix = m[0]?.[1] || 'S';
  const max = Math.max(0, ...m.filter((x) => x[1] === prefix).map((x) => +x[2]));
  return `${prefix}${max + 1}`;
};
