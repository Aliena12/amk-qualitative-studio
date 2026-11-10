/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QdaProject } from '../types/qda';
import { downloadFile } from './exportHelpers';

/**
 * Generates and downloads a rich Microsoft Word document (.docx compatible)
 * containing executive summary, codebook, quotations, and code matrix.
 */
export function exportToWordDocument(project: QdaProject) {
  const catMap = new Map(project.categories.map((c) => [c.id, c]));
  const codeMap = new Map(project.codes.map((c) => [c.id, c]));
  const docMap = new Map(project.documents.map((d) => [d.id, d]));

  // Build matrix rows
  const matrixRowsHtml = project.codes.map((code) => {
    const cat = catMap.get(code.categoryId);
    const counts = project.documents.map((doc) => {
      return project.codedSegments.filter((s) => s.codeId === code.id && s.documentId === doc.id).length;
    });
    const total = counts.reduce((a, b) => a + b, 0);

    return `
      <tr>
        <td style="padding: 6px; border: 1px solid #d4d4d8; font-size: 10pt;">${cat?.name || ''}</td>
        <td style="padding: 6px; border: 1px solid #d4d4d8; font-size: 10pt; font-weight: bold;">${code.name}</td>
        ${counts.map((c) => `<td style="padding: 6px; border: 1px solid #d4d4d8; text-align: center; font-size: 10pt;">${c || '-'}</td>`).join('')}
        <td style="padding: 6px; border: 1px solid #d4d4d8; text-align: center; font-weight: bold; background-color: #f4f4f5; font-size: 10pt;">${total}</td>
      </tr>
    `;
  }).join('');

  // Build insights & quotes
  const insightsHtml = (project.synthesisReport?.keyInsights || []).map((ins, i) => `
    <h3 style="color: #0f172a; margin-top: 18px; font-size: 13pt;">2.${i + 1} ${ins.categoryName}</h3>
    <p style="font-size: 11pt; line-height: 1.5; color: #334155;">${ins.takeaway}</p>
    <div style="margin-left: 15px; border-left: 3px solid #10b981; padding-left: 10px; margin-top: 8px;">
      ${ins.quotes.map((q) => `<p style="font-style: italic; font-size: 10pt; color: #475569; margin: 4px 0;">"${q}"</p>`).join('')}
    </div>
  `).join('');

  // Complete Word Document HTML Wrapper
  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${project.name}</title>
      <style>
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          color: #1e293b;
          margin: 40px;
        }
        h1 { font-size: 20pt; color: #09090b; margin-bottom: 4px; }
        h2 { font-size: 15pt; color: #047857; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        .meta { color: #64748b; font-size: 10pt; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 12px; }
        th { background-color: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; font-size: 10pt; text-align: left; }
      </style>
    </head>
    <body>
      <div style="font-size: 11pt; color: #059669; font-weight: bold; text-transform: uppercase;">${project.courseModule}</div>
      <h1>${project.name}</h1>
      <div class="meta">
        Erstellt mit AMK Qualitative Studio (MAXQDA AI Edition) · Datum: ${new Date().toLocaleDateString('de-DE')} · Datengrundlage: ${project.documents.length} Interviews (${project.documents.map((d) => d.respondentInfo.code).join(', ')})
      </div>

      <h2>1. Executive Summary (Mayring-Zusammenfassung)</h2>
      <p style="font-size: 11pt; line-height: 1.6;">${project.synthesisReport?.summary || ''}</p>

      <h2>2. Kernaussagen & empirische Belegstellen nach Hauptdimensionen</h2>
      ${insightsHtml}

      <h2>3. Code-Matrix-Häufigkeitstabelle (Interviews × Codes)</h2>
      <table>
        <thead>
          <tr>
            <th>Überkategorie</th>
            <th>Code-Bezeichnung</th>
            ${project.documents.map((d) => `<th>${d.respondentInfo.code}</th>`).join('')}
            <th>Gesamthäufigkeit</th>
          </tr>
        </thead>
        <tbody>
          ${matrixRowsHtml}
        </tbody>
      </table>

      <h2>4. Methodischer Anhang & Gütekriterien</h2>
      <p style="font-size: 10pt; color: #475569; line-height: 1.5;">${project.synthesisReport?.methodologyNotes || ''}</p>
    </body>
    </html>
  `;

  downloadFile('amk_qualitativer_bericht.doc', wordContent, 'application/msword');
}
