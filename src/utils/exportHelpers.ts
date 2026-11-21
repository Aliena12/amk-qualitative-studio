/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Code, Category, CodedSegment, InterviewDocument, QdaProject, WIRKUNG_LABEL } from '../types/qda';
import { einfluss } from './einfluss';

/**
 * Generates CSV string of all coded segments
 */
export function generateCodedSegmentsCSV(
  documents: InterviewDocument[],
  categories: Category[],
  codes: Code[],
  segments: CodedSegment[]
): string {
  const docMap = new Map(documents.map((d) => [d.id, d]));
  const codeMap = new Map(codes.map((c) => [c.id, c]));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const headers = [
    'Segment ID',
    'Interview',
    'Interview-Titel',
    'Absatz',
    'Audio-Zeitstempel',
    'Überkategorie',
    'Code Name',
    'Exaktes Zitat',
    'Wirkung auf Zugehörigkeit',
    'Stärke (1-3)',
    'Geprüft',
    'Quelle',
    'Kommentar / Memo',
  ];

  const rows = segments.map((seg) => {
    const doc = docMap.get(seg.documentId);
    const code = codeMap.get(seg.codeId);
    const cat = code ? catMap.get(code.categoryId) : undefined;

    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    return [
      escape(seg.id),
      escape(doc?.respondentInfo.code),
      escape(doc?.title),
      `P${String(seg.paragraphIndex).padStart(2, '0')}`,
      escape(doc?.paragraphs.find((p) => p.index === seg.paragraphIndex)?.time),
      escape(cat?.name),
      escape(code?.name),
      escape(seg.exactQuote),
      escape(seg.wirkung ? WIRKUNG_LABEL[seg.wirkung] : ''),
      seg.staerke ? String(seg.staerke) : '',
      seg.geprueft === false ? 'nein' : 'ja',
      seg.quelle === 'ki' ? 'KI-Vorschlag' : 'manuell',
      escape(seg.comment),
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
}

/**
 * Generates CSV string of the Code-Matrix-Browser (Documents x Codes)
 */
export function generateCodeMatrixCSV(
  documents: InterviewDocument[],
  categories: Category[],
  codes: Code[],
  segments: CodedSegment[]
): string {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const headers = [
    'Überkategorie',
    'Code Name',
    ...documents.map((d) => `"${d.respondentInfo.code}"`),
    'Gesamt (Stellen)',
    ...documents.map((d) => `"Schwere ${d.respondentInfo.code}"`),
    'Schwere gesamt',
    'Schwere stärkend',
    'Schwere schwächend',
    'Netto',
  ];

  const rows = codes.map((code) => {
    const cat = catMap.get(code.categoryId);
    const counts = documents.map((doc) => {
      return segments.filter((s) => s.codeId === code.id && s.documentId === doc.id).length;
    });
    const total = counts.reduce((sum, n) => sum + n, 0);
    const ziel = cat?.rolle === 'ziel';
    const schwere = documents.map((doc) => einfluss(segments.filter((s) => s.codeId === code.id && s.documentId === doc.id)).schwere);
    const e = einfluss(segments.filter((s) => s.codeId === code.id));

    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      escape(cat?.name),
      escape(code.name),
      ...counts.map((c) => c.toString()),
      total.toString(),
      ...(ziel ? documents.map(() => '') : schwere.map(String)),
      ...(ziel ? ['', '', '', ''] : [e.schwere, e.plus, e.minus, e.netto].map(String)),
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
}

/**
 * Triggers file download in browser
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
