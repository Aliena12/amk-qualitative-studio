/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Memo, InterviewDocument } from '../types/qda';
import { Plus, Trash2, Calendar, User, Pencil } from 'lucide-react';

interface MemosPanelProps {
  memos: Memo[];
  documents: InterviewDocument[];
  defaultAuthor: string;
  onAddMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => void;
  onUpdateMemo: (memo: Memo) => void;
  onDeleteMemo: (memoId: string) => void;
}

type MemoType = Memo['type'];

const TYPES: Record<MemoType, { label: string; short: string; color: string; hint: string }> = {
  theoretical: { label: 'Analytische Notiz', short: 'Analyse', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', hint: 'Auffälligkeiten, Muster, Gedanken beim Codieren' },
  methodological: { label: 'Methodische Entscheidung', short: 'Methodik', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300', hint: 'z. B. warum ein Code zusammengelegt oder eine Kategorie geändert wurde' },
  case_summary: { label: 'Fallprofil', short: 'Fallprofile', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', hint: 'Kurzprofil eines Interviews' },
  ki_documentation: { label: 'KI-Dokumentation', short: 'KI-Doku', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', hint: 'Pflicht laut Modalitäten: Prompts, Ergebnis, eigene Korrektur, Reflexion' },
};

const KI_TEMPLATE = `Tool / Modell:
Zweck (z. B. Codevorschläge, Verdichtung, Hypothesen):
Prompt(s):
Ergebnis (Kurzfassung):
Eigene Prüfung und Korrektur (was übernommen, was verworfen, warum):
Reflexion (Grenzen, Verzerrungsrisiken):`;

const inputCls =
  'w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';

export const MemosPanel: React.FC<MemosPanelProps> = ({ memos, documents, defaultAuthor, onAddMemo, onUpdateMemo, onDeleteMemo }) => {
  const [filter, setFilter] = useState<'all' | MemoType>('all');
  const [editing, setEditing] = useState<{ id?: string; title: string; content: string; type: MemoType; author: string; documentId?: string; createdAt?: string; codeId?: string } | null>(null);

  const shown = memos.filter((m) => filter === 'all' || m.type === filter);
  const hasKi = memos.some((m) => m.type === 'ki_documentation');

  const openNew = (type: MemoType = 'theoretical') =>
    setEditing({ title: '', content: type === 'ki_documentation' ? KI_TEMPLATE : '', type, author: defaultAuthor });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title.trim() || !editing.content.trim()) return;
    const base = { title: editing.title.trim(), content: editing.content.trim(), type: editing.type, author: editing.author.trim(), documentId: editing.documentId, codeId: editing.codeId };
    if (editing.id) onUpdateMemo({ ...base, id: editing.id, createdAt: editing.createdAt || new Date().toISOString() });
    else onAddMemo(base);
    setEditing(null);
  };

  const changeType = (type: MemoType) =>
    setEditing((m) => (m ? { ...m, type, content: !m.id && (!m.content.trim() || m.content === KI_TEMPLATE) ? (type === 'ki_documentation' ? KI_TEMPLATE : '') : m.content } : m));

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Memos & KI-Dokumentation</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Analytische Notizen, methodische Entscheidungen, Fallprofile – und die Pflicht-Dokumentation zur KI-Nutzung. Alles erscheint im Bericht.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs border border-zinc-200/50 dark:border-zinc-800">
            {(['all', 'theoretical', 'methodological', 'case_summary', 'ki_documentation'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${filter === f ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              >
                {f === 'all' ? `Alle (${memos.length})` : TYPES[f].short}
              </button>
            ))}
          </div>
          <button onClick={() => openNew()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Neues Memo</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {!hasKi && (
          <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <span>Die KI-Dokumentation ist laut Modalitäten Pflicht. Noch kein Eintrag vorhanden – falls du KI nutzt, hier dokumentieren.</span>
            <button onClick={() => openNew('ki_documentation')} className="px-3 py-1 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer shrink-0">Vorlage anlegen</button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {shown.map((memo) => {
            const t = TYPES[memo.type] || TYPES.theoretical;
            const doc = documents.find((d) => d.id === memo.documentId);
            return (
              <div key={memo.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${t.color}`}>{t.label}</span>
                    <div className="flex items-center">
                      <button onClick={() => setEditing({ ...memo })} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer" title="Bearbeiten"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if (confirm('Dieses Memo unwiderruflich löschen?')) onDeleteMemo(memo.id); }} className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer" title="Löschen"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{memo.title}</h3>
                  {doc && <div className="text-[10px] text-zinc-400 mt-0.5">zu Interview {doc.respondentInfo.code}</div>}
                  <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{memo.content}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1">{memo.author && (<><User className="w-3 h-3" /><span>{memo.author}</span></>)}</div>
                  <div className="flex items-center gap-1 font-mono"><Calendar className="w-3 h-3" /><span>{new Date(memo.createdAt).toLocaleDateString('de-DE')}</span></div>
                </div>
              </div>
            );
          })}
        </div>
        {shown.length === 0 && <div className="text-center py-12 text-xs text-zinc-400">Keine Memos in dieser Ansicht.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">{editing.id ? 'Memo bearbeiten' : 'Neues Memo'}</h3>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Art</label>
                <select value={editing.type} onChange={(e) => changeType(e.target.value as MemoType)} className={inputCls}>
                  {(Object.keys(TYPES) as MemoType[]).map((k) => <option key={k} value={k}>{TYPES[k].label}</option>)}
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">{TYPES[editing.type].hint}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Titel</label>
                <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} />
              </div>
              {editing.type === 'case_summary' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Zu welchem Interview?</label>
                  <select value={editing.documentId || ''} onChange={(e) => setEditing({ ...editing, documentId: e.target.value || undefined })} className={inputCls}>
                    <option value="">– keins –</option>
                    {documents.map((d) => <option key={d.id} value={d.id}>{d.respondentInfo.code} – {d.title}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Inhalt</label>
                <textarea required rows={editing.type === 'ki_documentation' ? 10 : 7} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className={`${inputCls} leading-relaxed`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Autor:in</label>
                <input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className={inputCls} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Abbrechen</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
