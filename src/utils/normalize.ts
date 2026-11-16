/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodedSegment, InterviewDocument, QdaProject } from '../types/qda';
import { analyzeTranscript, buildParagraphs, defaultRoles } from './transcript';

// Hält die redundanten Felder konsistent: subCodeIds je Überkategorie und frequency je Code
export const syncProject = (p: QdaProject): QdaProject => ({
  ...p,
  categories: p.categories.map((c) => ({ ...c, subCodeIds: p.codes.filter((x) => x.categoryId === c.id).map((x) => x.id) })),
  codes: p.codes.map((c) => ({ ...c, frequency: p.codedSegments.filter((s) => s.codeId === c.id).length })),
});

// Altes Transkript (Sprecher/Zeitstempel noch im Text) auf den neuen Stand bringen.
// Absatznummern bleiben unverändert; die Positionen der Codierungen werden neu bestimmt.
// Passt irgendetwas nicht exakt, wird das Dokument NICHT angefasst (Rückgabe null).
function migrateDocument(doc: InterviewDocument, segs: CodedSegment[]): { doc: InterviewDocument; segs: CodedSegment[] } | null {
  if (!doc.rawText) return null;
  const an = analyzeTranscript(doc.rawText);
  const fresh = buildParagraphs(an, defaultRoles(an));
  const old = doc.paragraphs;
  if (fresh.length !== old.length) return null;
  for (let i = 0; i < old.length; i++) {
    if (fresh[i].index !== old[i].index || !old[i].text.includes(fresh[i].text)) return null;
  }
  const mine = segs.filter((s) => s.documentId === doc.id);
  const moved = new Map<string, CodedSegment>();
  for (const s of mine) {
    const pos = fresh.find((p) => p.index === s.paragraphIndex)?.text.indexOf(s.exactQuote) ?? -1;
    if (pos < 0) return null;
    moved.set(s.id, { ...s, startIndex: pos, endIndex: pos + s.exactQuote.length });
  }

  // Platzhalter, die das Tool früher automatisch eingetragen hat (nicht vom Nutzer), entfernen
  const ri = { ...doc.respondentInfo };
  if (ri.fieldOfStudy === 'Wirtschaftswissenschaften / Marketing') ri.fieldOfStudy = '';
  if (ri.keyCharacteristic === 'AMK Befragter') ri.keyCharacteristic = '';
  if (ri.duration === `${Math.max(20, Math.round(old.length * 1.5))} Min.`) ri.duration = an.meta.duration || '';
  if (ri.interviewDate && ri.interviewDate === new Date(doc.createdAt).toLocaleDateString('de-DE')) ri.interviewDate = '';

  return {
    doc: { ...doc, paragraphs: fresh, respondentInfo: ri, transcriptVersion: 2 },
    segs: segs.map((s) => moved.get(s.id) ?? s),
  };
}

// Prüft einen geladenen Projektstand, ergänzt fehlende Felder (ältere Stände) und migriert alte Transkripte.
// Gibt null zurück, wenn der Stand nicht als Projekt erkennbar ist (dann wird er nie überschrieben).
export function normalizeProject(raw: any): { project: QdaProject; changed: boolean } | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!['documents', 'categories', 'codes', 'codedSegments'].every((k) => Array.isArray(raw[k]))) return null;
  if (!raw.documents.every((d: any) => d && typeof d.id === 'string' && Array.isArray(d.paragraphs))) return null;

  const before = JSON.stringify(raw);
  const { synthesisReport, ...rest } = raw; // automatisch erzeugte Synthese der alten Version entfällt
  let p: QdaProject = {
    ...rest,
    name: raw.name || 'Neues Projekt',
    description: raw.description || '',
    courseModule: raw.courseModule || '',
    memos: Array.isArray(raw.memos) ? raw.memos : [],
    hypotheses: Array.isArray(raw.hypotheses) ? raw.hypotheses : [],
    documents: raw.documents.map((d: any) => ({
      ...d,
      title: d.title || d.respondentInfo?.code || 'Interview',
      respondentInfo: { code: '?', fieldOfStudy: '', interviewDate: '', duration: '', ...d.respondentInfo },
    })),
  };

  // Transkripte der alten Version (Sprecher und Zeitstempel im Text) migrieren
  for (const d of [...p.documents]) {
    if (d.transcriptVersion === 2) continue;
    const r = migrateDocument(d, p.codedSegments);
    if (r) p = { ...p, documents: p.documents.map((x) => (x.id === d.id ? r.doc : x)), codedSegments: r.segs };
  }
  // Automatischer Platzhalter-Kommentar "Händisch codiert" ist keine eigene Notiz
  p = { ...p, codedSegments: p.codedSegments.map((s) => (s.comment === 'Händisch codiert' ? { ...s, comment: '' } : s)) };

  p = syncProject(p);
  return { project: p, changed: JSON.stringify(p) !== before };
}
