/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Paragraph {
  index: number;
  speaker: 'Interviewer' | 'Befragter' | 'System';
  speakerLabel?: string;
  text: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number; // -1.0 to 1.0
}

export interface RespondentInfo {
  code: string; // e.g. "S1", "S2", "S3", "S4", "S5", "S6"
  fieldOfStudy: string; // e.g. "Wirtschaftswissenschaften / Marketing"
  interviewDate: string;
  duration: string;
  keyCharacteristic?: string;
}

export interface SentimentPoint {
  paragraphIndex: number;
  score: number; // -1 (frustrated/negative) to +1 (delighted/positive)
  label: 'Frustration / Barriere' | 'Neutral / Sachlich' | 'Zufriedenheit / Begeisterung';
  topic: string;
}

export interface InterviewDocument {
  id: string;
  title: string;
  filename?: string;
  respondentInfo: RespondentInfo;
  rawText: string;
  paragraphs: Paragraph[];
  sentimentTrajectory?: SentimentPoint[];
  memo?: string;
  createdAt: string;
}

export interface Code {
  id: string;
  name: string;
  description: string;
  categoryId: string; // Foreign key to Category
  color: string;
  frequency: number; // Computed across documents
}

export interface Category {
  id: string;
  name: string; // Überkategorie
  description: string;
  color: string;
  subCodeIds: string[];
}

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
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  type: 'theoretical' | 'methodological' | 'case_summary';
  documentId?: string;
  codeId?: string;
  createdAt: string;
  author: string;
}

export interface QdaProject {
  id: string;
  name: string;
  description: string;
  courseModule: string; // e.g. "AMK - Analyse von Markt- und Kundendaten"
  documents: InterviewDocument[];
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  memos: Memo[];
  synthesisReport?: {
    summary: string;
    keyInsights: Array<{
      categoryName: string;
      takeaway: string;
      quotes: string[];
    }>;
    methodologyNotes: string;
    generatedAt: string;
  };
}

export type ActiveTab = 'browser' | 'sentiment' | 'concept_map' | 'code_matrix' | 'memos' | 'synthesis';
