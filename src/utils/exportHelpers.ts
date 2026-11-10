/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Code, Category, CodedSegment, InterviewDocument, QdaProject } from '../types/qda';

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
    'Dokument ID',
    'Dokument Titel',
    'Proband Code',
    'Absatz Index',
    'Überkategorie',
    'Code Name',
    'Exaktes Zitat',
    'Kommentar / Memo',
  ];

  const rows = segments.map((seg) => {
    const doc = docMap.get(seg.documentId);
    const code = codeMap.get(seg.codeId);
    const cat = code ? catMap.get(code.categoryId) : undefined;

    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    return [
      escape(seg.id),
      escape(seg.documentId),
      escape(doc?.title),
      escape(doc?.respondentInfo.code),
      seg.paragraphIndex.toString(),
      escape(cat?.name),
      escape(code?.name),
      escape(seg.exactQuote),
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
    ...documents.map((d) => `"Proband ${d.respondentInfo.code}"`),
    'Gesamthäufigkeit aller Interviews',
  ];

  const rows = codes.map((code) => {
    const cat = catMap.get(code.categoryId);
    const counts = documents.map((doc) => {
      return segments.filter((s) => s.codeId === code.id && s.documentId === doc.id).length;
    });
    const total = counts.reduce((sum, n) => sum + n, 0);

    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      escape(cat?.name),
      escape(code.name),
      ...counts.map((c) => c.toString()),
      total.toString(),
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
