/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, QdaProject } from '../types/qda';

// Startzustand eines neuen Projekts: keine Interviews, die fünf Überkategorien zum Thema.
// Weitere Überkategorien und alle Codes legst du im Tool selbst an (Codesystem links).
const cat = (n: number, name: string, description: string, color: string): Category => ({
  id: `cat-${n}`,
  name,
  description,
  color,
  subCodeIds: [],
});

export const INITIAL_CATEGORIES: Category[] = [
  cat(1, 'Infrastruktur', 'Ästhetik des Campus, Lernräume, Strom- und Internetversorgung.', '#10b981'),
  cat(2, 'Kommunikationskanäle', 'Wie gelangen Studierende an Informationen?', '#3b82f6'),
  cat(3, 'Soziales', 'Kommilitonen, Lerngruppen, Dozierende und weitere soziale Kontakte.', '#f59e0b'),
  cat(4, 'Hochschulangebote', 'Events, Fachschaft, Mentoren-Programm und weitere Angebote.', '#a855f7'),
  cat(5, 'Persönliche Umstände', 'Pendeln, Arbeit neben dem Studium, Corona, Migration, Sprache usw.', '#ef4444'),
];

export const INITIAL_PROJECT: QdaProject = {
  id: 'amk-project-1',
  name: 'AMK Projekt: Zusammenhalt an der Fakultät',
  description: 'Qualitative Auswertung von Interviews zum Gemeinschaftsgefühl an der Fakultät.',
  courseModule: 'AMK – Analyse von Markt- und Kundendaten',
  authors: '',
  documents: [],
  categories: INITIAL_CATEGORIES,
  codes: [],
  codedSegments: [],
  memos: [],
  hypotheses: [],
};
