/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InterviewDocument, Speaker } from '../types/qda';
import { Upload, X } from 'lucide-react';
import { analyzeTranscript, buildParagraphs, defaultRoles, nextCode, TranscriptAnalysis } from '../utils/transcript';
import { SpeakerTable } from './SpeakerTable';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCodes: string[]; // vorhandene Interview-Kürzel, damit das nächste automatisch vorgeschlagen wird
  onAddDocuments: (documents: InterviewDocument[]) => void;
}

interface Draft {
  key: string;
  filename?: string;
  text: string;
  an: TranscriptAnalysis;
  roles: Record<string, Speaker>;
  code: string;
  title: string;
  role: string;
  date: string;
  duration: string;
}

const inputCls =
  'w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
const labelCls = 'block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, existingCodes, onAddDocuments }) => {
  const [tab, setTab] = useState<'files' | 'paste'>('files');
  const [pasted, setPasted] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);

  if (!isOpen) return null;

  const close = () => {
    setDrafts([]);
    setPasted('');
    onClose();
  };

  // Aus Rohtext einen Importentwurf bauen (Sprecher erkennen, Kürzel vorschlagen)
  const makeDrafts = (items: { filename?: string; text: string }[]) => {
    const used = [...existingCodes];
    const out = items.map((it, i) => {
      const an = analyzeTranscript(it.text);
      const code = nextCode(used);
      used.push(code);
      return {
        key: `${Date.now()}-${i}`,
        filename: it.filename,
        text: it.text,
        an,
        roles: defaultRoles(an),
        code,
        title: `Interview ${code}`,
        role: '',
        date: '',
        duration: an.meta.duration || '',
      } as Draft;
    });
    setDrafts(out);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    makeDrafts(await Promise.all(files.map(async (f) => ({ filename: f.name, text: await f.text() }))));
    e.target.value = '';
  };

  const patch = (key: string, p: Partial<Draft>) => setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...p } : d)));

  const codeTaken = (d: Draft) =>
    existingCodes.includes(d.code.trim()) || drafts.some((x) => x.key !== d.key && x.code.trim() === d.code.trim());

  const handleImport = () => {
    const docs: InterviewDocument[] = drafts.map((d, i) => ({
      id: `doc-uploaded-${Date.now()}-${i + 1}`,
      title: d.title.trim() || `Interview ${d.code}`,
      filename: d.filename,
      rawText: d.text,
      paragraphs: buildParagraphs(d.an, d.roles),
      transcriptVersion: 2,
      createdAt: new Date().toISOString(),
      respondentInfo: {
        code: d.code.trim(),
        fieldOfStudy: d.role.trim(),
        interviewDate: d.date.trim(),
        duration: d.duration.trim(),
        keyCharacteristic: '',
      },
    }));
    onAddDocuments(docs);
    close();
  };

  const canImport = drafts.length > 0 && drafts.every((d) => d.code.trim() && !codeTaken(d));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Interview-Transkripte importieren</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Textdateien (.txt, .md), z. B. aus tiroScribe/Whisper, oder Text einfügen. Sprecher und Zeitstempel werden erkannt.
            </p>
          </div>
          <button onClick={close} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {drafts.length === 0 ? (
          <>
            <div className="flex items-center gap-3 pt-3 border-b border-zinc-100 dark:border-zinc-800">
              {(['files', 'paste'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2 px-1 text-xs font-semibold border-b-2 cursor-pointer ${
                    tab === t ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-500'
                  }`}
                >
                  {t === 'files' ? 'Dateien auswählen' : 'Text einfügen'}
                </button>
              ))}
            </div>

            {tab === 'files' ? (
              <label className="my-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-800/30">
                <Upload className="w-9 h-9 text-emerald-600 dark:text-emerald-400 mb-2" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Transkript-Dateien durchsuchen</span>
                <span className="text-xs text-zinc-500 mt-1">.txt oder .md, mehrere Dateien gleichzeitig möglich</span>
                <input type="file" multiple accept=".txt,.md,text/plain" onChange={handleFiles} className="hidden" />
              </label>
            ) : (
              <div className="py-4 space-y-3">
                <textarea
                  rows={9}
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  placeholder={'F: [00:00:12] Erzähl mal, wie war dein Start an der Fakultät?\nInterviewte Person: [00:00:20] Ehrlich gesagt …'}
                  className={`${inputCls} font-mono`}
                />
                <div className="flex justify-end">
                  <button
                    disabled={!pasted.trim()}
                    onClick={() => makeDrafts([{ text: pasted }])}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg cursor-pointer"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {drafts.map((d) => (
                <div key={d.key} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="text-[11px] text-zinc-400 font-mono truncate">
                    {d.filename || 'eingefügter Text'} · {d.an.lines.length} Zeilen
                    {d.an.meta.audio ? ` · Audio: ${d.an.meta.audio}` : ''}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Kürzel / Pseudonym *</label>
                      <input value={d.code} onChange={(e) => patch(d.key, { code: e.target.value })} className={inputCls} />
                      {codeTaken(d) && <p className="text-[10px] text-rose-500 mt-0.5">Dieses Kürzel ist schon vergeben.</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Titel</label>
                      <input value={d.title} onChange={(e) => patch(d.key, { title: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Rolle / Studiengang</label>
                      <input value={d.role} onChange={(e) => patch(d.key, { role: e.target.value })} placeholder="z. B. Studentin, 5. Semester" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Interviewdatum</label>
                        <input value={d.date} onChange={(e) => patch(d.key, { date: e.target.value })} placeholder="TT.MM.JJJJ" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Dauer</label>
                        <input value={d.duration} onChange={(e) => patch(d.key, { duration: e.target.value })} className={inputCls} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Wer spricht? (Rolle je Sprecherkürzel)</label>
                    <SpeakerTable
                      labels={d.an.labels}
                      roles={d.roles}
                      onChange={(label, role) => patch(d.key, { roles: { ...d.roles, [label]: role } })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
              <button onClick={() => setDrafts([])} className="px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                Zurück
              </button>
              <button
                disabled={!canImport}
                onClick={handleImport}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg cursor-pointer"
              >
                {drafts.length} Transkript(e) importieren
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
