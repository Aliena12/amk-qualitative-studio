/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { InterviewDocument, Speaker } from '../types/qda';
import { X } from 'lucide-react';
import { SpeakerTable } from './SpeakerTable';
import { LabelStat } from '../utils/transcript';

interface Props {
  doc: InterviewDocument;
  otherCodes: string[]; // Kürzel der anderen Interviews (Duplikate verhindern)
  onClose: () => void;
  onSave: (updated: InterviewDocument) => void;
}

const inputCls =
  'w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
const labelCls = 'block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1';

// Stammdaten eines Interviews bearbeiten und Sprecher neu zuordnen (Absatznummern und Codierungen bleiben unverändert)
export const InterviewDetailsModal: React.FC<Props> = ({ doc, otherCodes, onClose, onSave }) => {
  const ri = doc.respondentInfo;
  const [code, setCode] = useState(ri.code);
  const [title, setTitle] = useState(doc.title);
  const [role, setRole] = useState(ri.fieldOfStudy);
  const [date, setDate] = useState(ri.interviewDate);
  const [duration, setDuration] = useState(ri.duration);
  const [note, setNote] = useState(ri.keyCharacteristic || '');

  // Sprecherkürzel aus den Absätzen sammeln
  const labels = useMemo<LabelStat[]>(() => {
    const m = new Map<string, LabelStat>();
    for (const p of doc.paragraphs) {
      if (!p.speakerLabel) continue;
      const s = m.get(p.speakerLabel) || { label: p.speakerLabel, count: 0, words: 0, sample: '', role: p.speaker };
      s.count++;
      if (!s.sample && p.text.length > 15) s.sample = p.text.slice(0, 80);
      m.set(p.speakerLabel, s);
    }
    return [...m.values()];
  }, [doc]);
  const [roles, setRoles] = useState<Record<string, Speaker>>(Object.fromEntries(labels.map((l) => [l.label, l.role])));

  const taken = otherCodes.includes(code.trim());

  const save = () => {
    onSave({
      ...doc,
      title: title.trim() || doc.title,
      respondentInfo: { ...ri, code: code.trim(), fieldOfStudy: role.trim(), interviewDate: date.trim(), duration: duration.trim(), keyCharacteristic: note.trim() },
      paragraphs: doc.paragraphs.map((p) => (p.speakerLabel && roles[p.speakerLabel] ? { ...p, speaker: roles[p.speakerLabel] } : p)),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Interview bearbeiten</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <div>
            <label className={labelCls}>Kürzel / Pseudonym</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />
            {taken && <p className="text-[10px] text-rose-500 mt-0.5">Dieses Kürzel ist schon vergeben.</p>}
          </div>
          <div>
            <label className={labelCls}>Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Rolle / Studiengang</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="z. B. Studentin, 5. Semester" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Interviewdatum</label>
              <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="TT.MM.JJJJ" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Dauer</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Notiz zum Interview</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="pt-4">
          <label className={labelCls}>Sprecher im Transkript</label>
          <SpeakerTable labels={labels} roles={roles} onChange={(l, r) => setRoles({ ...roles, [l]: r })} />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
            Abbrechen
          </button>
          <button
            disabled={!code.trim() || taken}
            onClick={save}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg cursor-pointer"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
