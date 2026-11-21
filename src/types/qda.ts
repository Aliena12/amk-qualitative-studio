/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Speaker = 'Interviewer' | 'Befragter' | 'System';

export interface Paragraph {
  index: number; // Absatznummer (P01, P02, …) – bleibt stabil, damit Codierungen nicht verrutschen
  speaker: Speaker; // System = Metadaten-Kopf des Transkripts (nicht codierbar)
  speakerLabel?: string; // Sprecherkürzel im Transkript, z. B. "F", "R", "Interviewte Person"
  time?: string; // Zeitstempel im Audio, z. B. "00:02:12" (Audiobeleg)
  text: string;
}

export interface RespondentInfo {
  code: string; // Kürzel / Pseudonym des Interviews, z. B. "S1"
  fieldOfStudy: string; // Rolle / Studiengang der interviewten Person
  interviewDate: string;
  duration: string;
  keyCharacteristic?: string; // freie Notiz zum Interview
}

export interface InterviewDocument {
  id: string;
  title: string;
  filename?: string;
  respondentInfo: RespondentInfo;
  rawText: string;
  paragraphs: Paragraph[];
  transcriptVersion?: number; // 2 = Sprecher/Zeitstempel sauber getrennt
  createdAt: string;
}

export interface Code {
  id: string;
  name: string;
  description: string; // Definition / Codieranweisung
  categoryId: string;
  color: string;
  frequency: number; // wird aus den Codierungen berechnet
}

export interface Category {
  id: string;
  name: string; // Überkategorie
  description: string;
  color: string;
  subCodeIds: string[];
  // einfluss = Begebenheit (unabhängige Seite des Kausalmodells), ziel = Zugehörigkeit/Identifikation (Zielgröße)
  rolle?: 'einfluss' | 'ziel';
}

// Wirkung einer Begebenheit auf die Zugehörigkeit (je Textstelle)
export type Wirkung = 'staerkt' | 'schwaecht' | 'ambivalent' | 'neutral';
export const WIRKUNG_LABEL: Record<Wirkung, string> = {
  staerkt: 'stärkt',
  schwaecht: 'schwächt',
  ambivalent: 'ambivalent',
  neutral: 'kein Effekt',
};
export const WIRKUNG_ZEICHEN: Record<Wirkung, string> = { staerkt: '+', schwaecht: '−', ambivalent: '±', neutral: '0' };

export interface CodedSegment {
  id: string;
  documentId: string;
  codeId: string;
  paragraphIndex: number;
  exactQuote: string;
  startIndex: number;
  endIndex: number;
  comment?: string;
  confidence?: number;
  wirkung?: Wirkung; // Richtung des Einflusses auf die Zugehörigkeit
  staerke?: 1 | 2 | 3; // Schwere: 1 gering, 2 mittel, 3 stark
  geprueft?: boolean; // false = Vorschlag (z. B. von KI), noch nicht vom Team bestätigt
  quelle?: 'manuell' | 'ki'; // wer die Stelle codiert hat
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  // theoretical = analytische Notiz, methodological = methodische Entscheidung,
  // case_summary = Fallprofil, ki_documentation = KI-Dokumentation
  type: 'theoretical' | 'methodological' | 'case_summary' | 'ki_documentation';
  documentId?: string;
  codeId?: string;
  createdAt: string;
  author: string;
}

export interface Hypothesis {
  id: string;
  label: string; // z. B. "H1"
  statement: string; // die Hypothese selbst
  reasoning: string; // Herleitung aus dem Interviewmaterial
  variables: string; // Variablen / Konstrukte für die Operationalisierung
  codeIds: string[]; // zugrunde liegende Codes (Kette Interview → Kategorien → Hypothese)
  createdAt: string;
}

export interface QdaProject {
  id: string;
  name: string;
  description: string; // Thema / Forschungsfrage
  courseModule: string;
  authors?: string; // Gruppe / Autor:innen (erscheint im Bericht)
  documents: InterviewDocument[];
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  memos: Memo[];
  hypotheses: Hypothesis[];
}

export type ActiveTab = 'browser' | 'concept_map' | 'code_matrix' | 'hypotheses' | 'memos' | 'synthesis';
