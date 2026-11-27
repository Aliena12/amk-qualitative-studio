/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodedSegment, Memo, QdaProject } from '../types/qda';
import { einfluss } from './einfluss';

// Gemeinsame Datengrundlage für die Bildschirm-Vorschau (SynthesisReport) und den PDF-Export (reportPdf),
// damit beide immer denselben Inhalt zeigen.

export interface ReportQuote {
  doc: string; // Interview-Kürzel
  para: number;
  time?: string; // Zeitstempel im Audio
  text: string;
  comment?: string;
}

export interface ReportModel {
  title: string;
  module: string;
  description: string;
  authors: string;
  date: string;
  interviews: { code: string; title: string; role: string; date: string; duration: string; segments: number }[];
  schema: {
    name: string;
    color: string;
    description: string;
    ziel: boolean; // Zielgröße des Kausalmodells
    codes: { name: string; color: string; definition: string; segments: number; interviews: number }[];
  }[];
  // Begebenheiten nach Schwere (= Anzahl der Nennungen)
  einfluss: {
    category: string;
    code: string;
    color: string;
    schwere: number;
    interviews: number;
  }[];
  ungeprueft: number;
  evidence: { category: string; code: string; color: string; quotes: ReportQuote[] }[];
  hypotheses: {
    label: string;
    statement: string;
    reasoning: string;
    wirktAuf: string;
    codes: { name: string; color: string; count: number }[];
    segments: number;
    interviews: number;
  }[];
  memoSections: { title: string; items: { title: string; content: string; author: string; date: string }[] }[];
  warnings: string[]; // Hinweise nur für die Bildschirmansicht, stehen nicht im PDF
}

const MEMO_SECTIONS: { type: Memo['type']; title: string }[] = [
  { type: 'methodological', title: 'Methodische Entscheidungen' },
  { type: 'case_summary', title: 'Fallprofile' },
  { type: 'theoretical', title: 'Analytische Notizen' },
  { type: 'ki_documentation', title: 'KI-Dokumentation (Auswertungsphase)' },
];

export function buildReport(p: QdaProject): ReportModel {
  const docOrder = new Map(p.documents.map((d, i) => [d.id, i]));
  const docById = new Map(p.documents.map((d) => [d.id, d]));
  const codeById = new Map(p.codes.map((c) => [c.id, c]));

  // Codierungen in Lesereihenfolge: Interview, Absatz, Position
  const segsOf = (codeId: string) =>
    p.codedSegments
      .filter((s) => s.codeId === codeId)
      .sort(
        (a, b) =>
          (docOrder.get(a.documentId) ?? 0) - (docOrder.get(b.documentId) ?? 0) ||
          a.paragraphIndex - b.paragraphIndex ||
          a.startIndex - b.startIndex
      );
  const nDocs = (segs: CodedSegment[]) => new Set(segs.map((s) => s.documentId)).size;
  const quote = (s: CodedSegment): ReportQuote => {
    const d = docById.get(s.documentId);
    return {
      doc: d?.respondentInfo.code ?? '?',
      para: s.paragraphIndex,
      time: d?.paragraphs.find((x) => x.index === s.paragraphIndex)?.time,
      text: s.exactQuote,
      // KI-Begründungen sind kein Kontext und erscheinen nicht im Bericht
      comment: s.comment && !s.comment.startsWith('KI') ? s.comment : undefined,
    };
  };
  const interviews = p.documents.map((d) => ({
    code: d.respondentInfo.code,
    title: d.title,
    role: d.respondentInfo.fieldOfStudy,
    date: d.respondentInfo.interviewDate,
    duration: d.respondentInfo.duration,
    segments: p.codedSegments.filter((s) => s.documentId === d.id).length,
  }));

  const schema = p.categories.map((cat) => ({
    name: cat.name,
    color: cat.color,
    description: cat.description,
    ziel: cat.rolle === 'ziel',
    codes: p.codes
      .filter((c) => c.categoryId === cat.id)
      .map((c) => {
        const segs = segsOf(c.id);
        return { name: c.name, color: c.color, definition: c.description, segments: segs.length, interviews: nDocs(segs) };
      }),
  }));

  const catById = new Map(p.categories.map((c) => [c.id, c]));
  const einflussTab = p.codes
    .filter((c) => catById.get(c.categoryId)?.rolle !== 'ziel')
    .map((c) => {
      const segs = segsOf(c.id);
      const e = einfluss(segs);
      return {
        category: catById.get(c.categoryId)?.name ?? '',
        code: c.name,
        color: c.color,
        schwere: e.schwere,
        interviews: e.interviews,
      };
    })
    .filter((r) => r.schwere > 0)
    .sort((a, b) => b.schwere - a.schwere || b.interviews - a.interviews);
  const ungeprueft = p.codedSegments.filter((s) => s.geprueft === false).length;

  const evidence = p.categories.flatMap((cat) =>
    p.codes
      .filter((c) => c.categoryId === cat.id && segsOf(c.id).length > 0)
      .map((c) => ({ category: cat.name, code: c.name, color: c.color, quotes: segsOf(c.id).map(quote) }))
  );

  const hypotheses = p.hypotheses.map((h) => {
    const codes = h.codeIds.map((id) => codeById.get(id)).filter(Boolean) as typeof p.codes;
    const segs = codes.flatMap((c) => segsOf(c.id));
    return {
      label: h.label,
      statement: h.statement,
      reasoning: h.reasoning,
      wirktAuf: h.wirktAuf || '',
      codes: codes.map((c) => ({ name: c.name, color: c.color, count: segsOf(c.id).length })),
      segments: segs.length,
      interviews: nDocs(segs),
    };
  });

  const memoSections = MEMO_SECTIONS.map(({ type, title }) => ({
    title,
    items: p.memos
      .filter((m) => m.type === type)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((m) => ({ title: m.title, content: m.content, author: m.author, date: new Date(m.createdAt).toLocaleDateString('de-DE') })),
  })).filter((s) => s.items.length > 0);

  // Hinweise für die Qualitätssicherung vor dem Export
  const warnings: string[] = [];
  const names = (a: string[]) => (a.length > 4 ? `${a.slice(0, 4).join(', ')} …` : a.join(', '));
  if (p.documents.length < 4) warnings.push(`Bisher ${p.documents.length} Interview(s) – laut Modalitäten sind 4–6 Experteninterviews vorgesehen.`);
  const noDate = p.documents.filter((d) => !d.respondentInfo.interviewDate).map((d) => d.respondentInfo.code);
  if (noDate.length) warnings.push(`Interviewdatum fehlt bei: ${names(noDate)} (Realitätsbezug belegen; im Tab „Dokumente“ über den Stift ergänzbar).`);
  const noDef = p.codes.filter((c) => !c.description.trim()).map((c) => c.name);
  if (noDef.length) warnings.push(`${noDef.length} Code(s) ohne Definition/Codieranweisung: ${names(noDef)}.`);
  const unused = p.codes.filter((c) => segsOf(c.id).length === 0).map((c) => c.name);
  if (unused.length) warnings.push(`Codes ohne Belegstelle (erscheinen nicht unter 4.): ${names(unused)}.`);
  const emptyCats = p.categories.filter((c) => !p.codes.some((x) => x.categoryId === c.id)).map((c) => c.name);
  if (emptyCats.length) warnings.push(`Überkategorien ohne Codes: ${names(emptyCats)}.`);
  const seen = new Set<string>();
  const dup = p.codes.map((c) => c.name.trim().toLowerCase()).filter((n) => seen.has(n) || !seen.add(n));
  if (dup.length) warnings.push(`Doppelt vergebene Code-Namen (Trennschärfe prüfen): ${names(dup)}.`);
  if (ungeprueft) warnings.push(`${ungeprueft} KI-Vorschlag/Vorschläge sind noch nicht geprüft – im Tab „Codieren“ über „zu prüfen“.`);
  if (p.hypotheses.length === 0) warnings.push('Noch keine Hypothesen angelegt (Tab „Hypothesen“).');
  const loose = p.hypotheses.filter((h) => h.codeIds.length === 0).map((h) => h.label);
  if (loose.length) warnings.push(`Hypothese(n) ohne verknüpfte Codes: ${names(loose)} – die Kette Interview → Kategorie → Hypothese ist unterbrochen.`);

  return {
    title: p.name,
    module: p.courseModule,
    description: p.description,
    authors: p.authors || '',
    date: new Date().toLocaleDateString('de-DE'),
    interviews,
    schema,
    einfluss: einflussTab,
    ungeprueft,
    evidence,
    hypotheses,
    memoSections,
    warnings,
  };
}
