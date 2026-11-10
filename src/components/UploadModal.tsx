/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InterviewDocument, Paragraph } from '../types/qda';
import { Upload, FileText, X, CheckCircle, AlertCircle, Plus } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocuments: (documents: InterviewDocument[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'paste'>('files');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedPseudonym, setPastedPseudonym] = useState('');
  const [pastedRole, setPastedRole] = useState('');
  const [pastedDuration, setPastedDuration] = useState('35 Min.');
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFilesList, setUploadedFilesList] = useState<Array<{ name: string; size: string }>>([]);

  if (!isOpen) return null;

  // Parses raw transcript text into paragraphs and speakers
  const parseRawTranscript = (text: string): Paragraph[] => {
    const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const paragraphs: Paragraph[] = [];
    let pIdx = 1;

    for (const line of rawLines) {
      let speaker: 'Interviewer' | 'Befragter' | 'System' = 'Befragter';
      let content = line;

      if (/^(i|interviewer|f|frage|forschende\/r):/i.test(line)) {
        speaker = 'Interviewer';
        content = line.replace(/^(i|interviewer|f|frage|forschende\/r):\s*/i, '');
      } else if (/^(b|befragte|befragter|proband|p|antwort):/i.test(line)) {
        speaker = 'Befragter';
        content = line.replace(/^(b|befragte|befragter|proband|p|antwort):\s*/i, '');
      } else if (line.startsWith('#') || line.startsWith('===')) {
        speaker = 'System';
      }

      if (content.length > 0) {
        paragraphs.push({
          index: pIdx++,
          speaker,
          text: content,
        });
      }
    }

    if (paragraphs.length === 0) {
      paragraphs.push({
        index: 1,
        speaker: 'Befragter',
        text,
      });
    }

    return paragraphs;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newDocs: InterviewDocument[] = [];
    const fileListInfo: Array<{ name: string; size: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      fileListInfo.push({ name: filename, size: sizeStr });

      try {
        const text = await file.text();

        // Check if JSON project file
        if (filename.endsWith('.json')) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.documents && Array.isArray(parsed.documents)) {
              onAddDocuments(parsed.documents);
              onClose();
              return;
            }
          } catch (jsonErr) {
            // Not a project JSON, treat as text
          }
        }

        const paragraphs = parseRawTranscript(text);
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

        newDocs.push({
          id: `doc-uploaded-${Date.now()}-${i + 1}`,
          title: `Interview: ${nameWithoutExt}`,
          filename,
          rawText: text,
          paragraphs,
          createdAt: new Date().toISOString(),
          respondentInfo: {
            code: `S${i + 1}`,
            fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
            interviewDate: new Date().toLocaleDateString('de-DE'),
            duration: `${Math.max(20, Math.round(paragraphs.length * 1.5))} Min.`,
            keyCharacteristic: 'AMK Befragter',
          },
        });
      } catch (err) {
        console.error(`Failed to read file ${filename}:`, err);
      }
    }

    setUploadedFilesList(fileListInfo);
    setIsProcessing(false);

    if (newDocs.length > 0) {
      onAddDocuments(newDocs);
      onClose();
    }
  };

  const handlePastedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const paragraphs = parseRawTranscript(pastedText);
    const code = pastedPseudonym.trim() || 'S_neu';
    const title = pastedTitle.trim() || `Interview Transkript ${code}`;

    const newDoc: InterviewDocument = {
      id: `doc-pasted-${Date.now()}`,
      title,
      rawText: pastedText,
      paragraphs,
      createdAt: new Date().toISOString(),
      respondentInfo: {
        code,
        fieldOfStudy: pastedRole.trim() || 'Wirtschaftswissenschaften / Marketing',
        interviewDate: new Date().toLocaleDateString('de-DE'),
        duration: pastedDuration || '30 Min.',
        keyCharacteristic: 'AMK Befragter',
      },
    };

    onAddDocuments([newDoc]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Interview-Transkripte importieren
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Einzeln nacheinander oder mehrere Dateien gleichzeitig (TXT, DOCX, PDF-Text, JSON).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Option Tabs */}
        <div className="flex items-center gap-2 pt-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2 px-1 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Datei-Upload (Einzeln & Batch)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2 px-1 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Transkript-Text direkt einfügen
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'files' && (
          <div className="py-6 space-y-4">
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Dateien hier ablegen oder durchsuchen
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Unterstützt .txt, .docx, .md, .pdf und .json. Du kannst ein einzelnes Interview oder alle 6 auf einmal auswählen.
              </span>
              <input
                type="file"
                multiple
                accept=".txt,.md,.json,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {isProcessing && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Transkripte werden segmentiert und eingelesen...</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Direct Paste */}
        {activeTab === 'paste' && (
          <form onSubmit={handlePastedSubmit} className="py-4 space-y-3 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Proband / Pseudonym
                </label>
                <input
                  type="text"
                  placeholder="z.B. Lukas P. (24 J.)"
                  value={pastedPseudonym}
                  onChange={(e) => setPastedPseudonym(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rolle / Zielgruppe
                </label>
                <input
                  type="text"
                  placeholder="z.B. Student, Gelegenheitskäufer"
                  value={pastedRole}
                  onChange={(e) => setPastedRole(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transkript-Text (mit Sprecherkürzeln I: und B:)
              </label>
              <textarea
                rows={8}
                required
                placeholder={`I: Beschreiben Sie uns Ihren Einkaufsprozess...\nB: Also wenn ich ein neues Produkt brauche, gehe ich zuerst auf Google...\nI: Haben Sie dabei Bedenken wegen Datenschutz?\nB: Ja, besonders bei Formularen...`}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Transkript hinzufügen
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
