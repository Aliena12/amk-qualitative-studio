/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QdaProject } from '../types/qda';
import { buildReport, ReportQuote } from './report';

// Erzeugt den Ergebnisbericht als echtes PDF (Text bleibt durchsuchbar/kopierbar) und lädt ihn herunter.
// pdfmake wird erst beim Klick geladen, damit die App schnell startet.

const INK = '#18181b';
const MUTED = '#71717a';
const RULE = '#d4d4d8';
const ACCENT = '#047857';

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 50);

const dash = (s: string) => (s && s.trim() ? s : '–');

// Zitat mit farbigem Balken in der Farbe des Codes
const quoteBlock = (q: ReportQuote, color: string) => ({
  unbreakable: true,
  margin: [0, 0, 0, 6],
  table: {
    widths: [2.5, '*'],
    body: [
      [
        { text: '', fillColor: color },
        {
          margin: [7, 1, 0, 1],
          stack: [
            { text: `„${q.text}“`, italics: true },
            {
              text: `${q.doc} · Absatz P${String(q.para).padStart(2, '0')}${q.time ? ` · Audio ${q.time}` : ''}${q.wirkung ? ` · Wirkung: ${q.wirkung}` : ''}${q.comment ? ` · ${q.comment}` : ''}`,
              style: 'meta',
              margin: [0, 2, 0, 0],
            },
          ],
        },
      ],
    ],
  },
  layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
});

// Tabelle mit dünnen Linien: oben und unter der Kopfzeile kräftig, dazwischen hell
const grid = {
  hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.3),
  vLineWidth: () => 0,
  hLineColor: (i: number) => (i <= 1 ? MUTED : '#e4e4e7'),
  paddingTop: () => 4,
  paddingBottom: () => 4,
  paddingLeft: () => 4,
  paddingRight: () => 4,
};
const th = (t: string, alignment: string = 'left') => ({ text: t, style: 'th', alignment });

export async function downloadReportPdf(project: QdaProject): Promise<void> {
  const [pm, vfs] = await Promise.all([import('pdfmake/build/pdfmake'), import('pdfmake/build/vfs_fonts')]);
  const pdfMake: any = (pm as any).default ?? pm;
  pdfMake.addVirtualFileSystem((vfs as any).default ?? vfs);

  const r = buildReport(project);
  const h2 = (t: string) => ({ text: t, style: 'h2', headlineLevel: 1 });
  const none = (t: string) => ({ text: t, italics: true, color: MUTED, margin: [0, 0, 0, 8] });

  const content: any[] = [];

  // Kopf
  content.push({ text: r.module.toUpperCase(), style: 'kicker' });
  content.push({ text: r.title, style: 'h1' });
  if (r.description) content.push({ text: r.description, style: 'lead' });
  if (r.authors) content.push({ text: `Gruppe / Autor:innen: ${r.authors}`, style: 'meta' });
  content.push({
    text: `Stand: ${r.date} · ${r.interviews.length} Interview(s) · ${r.schema.reduce((n, c) => n + c.codes.length, 0)} Codes · ${r.interviews.reduce((n, i) => n + i.segments, 0)} codierte Textstellen`,
    style: 'meta',
    margin: [0, 2, 0, 0],
  });
  content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 0.8, lineColor: RULE }], margin: [0, 10, 0, 0] });

  // 1. Datengrundlage
  content.push(h2('1. Datengrundlage'));
  if (r.interviews.length === 0) content.push(none('Noch keine Interviews importiert.'));
  else
    content.push({
      table: {
        headerRows: 1,
        widths: [50, '*', 62, 48, 50],
        body: [
          [th('Interview'), th('Rolle / Studiengang'), th('Datum'), th('Dauer'), th('Passagen', 'right')],
          ...r.interviews.map((i) => [
            { text: i.code, bold: true },
            dash(i.role),
            dash(i.date),
            dash(i.duration),
            { text: String(i.segments), alignment: 'right' },
          ]),
        ],
      },
      layout: grid,
    });

  // 2. Kategorienschema
  content.push(h2('2. Kategorienschema'));
  r.schema.forEach((cat, ci) => {
    content.push({
      headlineLevel: 2,
      margin: [0, 8, 0, 3],
      columns: [
        { width: 9, canvas: [{ type: 'rect', x: 0, y: 2.5, w: 7, h: 7, color: cat.color }] },
        { width: '*', text: [`2.${ci + 1} ${cat.name}`, cat.ziel ? { text: '   Zielgröße', color: ACCENT, fontSize: 8 } : ''], style: 'h3' },
      ],
    });
    if (cat.description) content.push({ text: cat.description, style: 'meta', margin: [9, 0, 0, 4] });
    if (cat.codes.length === 0) content.push(none('Noch keine Codes in dieser Überkategorie.'));
    else
      content.push({
        table: {
          headerRows: 1,
          widths: cat.ziel ? [105, '*', 34, 48] : [95, '*', 30, 44, 52],
          body: [
            [th('Code'), th('Definition / Codieranweisung'), th('Stellen', 'right'), th('Interviews', 'right'), ...(cat.ziel ? [] : [th('Wirkung', 'right')])],
            ...cat.codes.map((c) => [
              { text: c.name, bold: true },
              dash(c.definition),
              { text: String(c.segments), alignment: 'right' },
              { text: `${c.interviews} / ${r.interviews.length}`, alignment: 'right' },
              ...(cat.ziel ? [] : [{ text: c.wirkung, alignment: 'right' }]),
            ]),
          ],
        },
        layout: grid,
      });
  });

  // 3. Kausalmodell
  content.push(h2('3. Einflussfaktoren auf die Zugehörigkeit (Kausalmodell)'));
  content.push({
    text: `Kausalmodell: Begebenheiten wirken auf die Zugehörigkeit bzw. Identifikation mit Fakultät und Studiengang. Schwere = Summe der Stärken (1–3) der bewerteten Textstellen; sortiert nach Gesamtschwere. stärkt/schwächt: Anzahl Stellen (Schwere). Netto = Schwere stärkend − schwächend.${r.ungeprueft ? ` Stand mit ${r.ungeprueft} noch ungeprüften Bewertung(en).` : ''}`,
    style: 'meta',
    margin: [0, 0, 0, 6],
  });
  if (r.einfluss.length === 0) content.push(none('Noch keine Textstellen mit Wirkungsbewertung.'));
  else
    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 44, 48, 22, 40, 36, 46],
        body: [
          [th('Begebenheit (Code) · Kategorie'), th('stärkt', 'right'), th('schwächt', 'right'), th('±', 'right'), th('Schwere', 'right'), th('Netto', 'right'), th('Interviews', 'right')],
          ...r.einfluss.map((e) => [
            { text: [{ text: e.code, bold: true }, { text: `  ${e.category}`, color: MUTED, fontSize: 8 }] },
            { text: e.staerkt ? `${e.staerkt} (${e.plus})` : '–', alignment: 'right', color: '#059669' },
            { text: e.schwaecht ? `${e.schwaecht} (${e.minus})` : '–', alignment: 'right', color: '#e11d48' },
            { text: e.ambivalent ? String(e.ambivalent) : '–', alignment: 'right' },
            { text: String(e.schwere), alignment: 'right', bold: true },
            { text: e.netto > 0 ? `+${e.netto}` : String(e.netto), alignment: 'right' },
            { text: `${e.interviews} / ${r.interviews.length}`, alignment: 'right' },
          ]),
        ],
      },
      layout: grid,
    });

  // 4. Belegstellen
  content.push(h2('4. Belegstellen (Transkript-Auszüge)'));
  content.push({
    text: 'Wörtliche Auszüge aus den Transkripten. Angabe je Zitat: Interview · Absatz im Transkript · Zeitstempel in der Audioaufnahme.',
    style: 'meta',
    margin: [0, 0, 0, 6],
  });
  if (r.evidence.length === 0) content.push(none('Noch keine Textstellen codiert.'));
  r.evidence.forEach((e) => {
    content.push({ text: `${e.category}  ›  ${e.code}`, style: 'h4', headlineLevel: 2, color: INK, margin: [0, 6, 0, 3] });
    e.quotes.forEach((q) => content.push(quoteBlock(q, e.color)));
  });

  // 4. Hypothesen
  content.push(h2('5. Abgeleitete Hypothesen'));
  if (r.hypotheses.length === 0) content.push(none('Noch keine Hypothesen erfasst.'));
  r.hypotheses.forEach((h) => {
    content.push({
      headlineLevel: 2,
      margin: [0, 6, 0, 2],
      text: [{ text: `${h.label}  `, bold: true, color: ACCENT }, { text: h.statement, bold: true }],
    });
    if (h.reasoning) content.push({ text: [{ text: 'Herleitung: ', bold: true }, h.reasoning], margin: [0, 0, 0, 2] });
    if (h.variables) content.push({ text: [{ text: 'Variablen / Konstrukte: ', bold: true }, h.variables], margin: [0, 0, 0, 2] });
    content.push({
      text: [
        { text: 'Zugrunde liegende Codes: ', bold: true },
        h.codes.length ? h.codes.map((c) => `${c.name} (${c.count})`).join(', ') : 'keine verknüpft',
      ],
      margin: [0, 0, 0, 2],
    });
    content.push({
      text: `Belege: ${h.segments} Textstelle(n) aus ${h.interviews} von ${r.interviews.length} Interview(s)`,
      style: 'meta',
      margin: [0, 0, 0, 4],
    });
    h.quotes.forEach((q) => content.push(quoteBlock(q, ACCENT)));
  });

  // 5.ff Memos (nur wenn vorhanden)
  r.memoSections.forEach((s, si) => {
    content.push(h2(`${6 + si}. ${s.title}`));
    s.items.forEach((m) => {
      content.push({ unbreakable: false, margin: [0, 4, 0, 6], stack: [
        { text: m.title, bold: true },
        { text: `${m.author ? `${m.author} · ` : ''}${m.date}`, style: 'meta' },
        { text: m.content, margin: [0, 2, 0, 0] },
      ] });
    });
  });

  // Zeichen, die die eingebettete Schrift (Roboto) nicht kennt, ersetzen (z. B. Pfeile aus Memos)
  const ersetzen = (x: any): any =>
    typeof x === 'string'
      ? x.replace(/[→⇒➔]/g, '->').replace(/[←⇐]/g, '<-')
      : Array.isArray(x)
        ? x.map(ersetzen)
        : x && typeof x === 'object'
          ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, typeof v === 'function' ? v : ersetzen(v)]))
          : x;
  content.splice(0, content.length, ...ersetzen(content));

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [50, 55, 50, 55],
    info: { title: r.title, author: r.authors || undefined, subject: 'Qualitative Auswertung', creator: 'AMK Interviewauswertung' },
    defaultStyle: { font: 'Roboto', fontSize: 9.5, lineHeight: 1.25, color: INK },
    styles: {
      kicker: { fontSize: 8.5, bold: true, color: ACCENT, characterSpacing: 1, margin: [0, 0, 0, 4] },
      h1: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
      lead: { fontSize: 11, color: '#3f3f46', margin: [0, 0, 0, 4] },
      h2: { fontSize: 13, bold: true, margin: [0, 16, 0, 6] },
      h3: { fontSize: 10.5, bold: true },
      h4: { fontSize: 9.5, bold: true },
      meta: { fontSize: 8.5, color: MUTED },
      th: { fontSize: 8, bold: true, color: MUTED },
    },
    footer: (page: number, pages: number) => ({
      margin: [50, 18, 50, 0],
      columns: [
        { text: r.title, fontSize: 8, color: '#a1a1aa' },
        { text: `Seite ${page} von ${pages}`, alignment: 'right', fontSize: 8, color: '#a1a1aa' },
      ],
    }),
    // Überschriften nicht allein am Seitenende stehen lassen
    pageBreakBefore: (node: any, following: any[]) => !!node.headlineLevel && following.length === 0,
    content,
  };

  const name = `AMK_Auswertung_${slug(r.title) || 'Projekt'}_${new Date().toISOString().slice(0, 10)}.pdf`;
  await new Promise<void>((resolve, reject) => {
    try {
      const out = pdfMake.createPdf(docDefinition).download(name, () => resolve());
      if (out && typeof out.then === 'function') out.then(() => resolve(), reject);
    } catch (e) {
      reject(e);
    }
  });
}
