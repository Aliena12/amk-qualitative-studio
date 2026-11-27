/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hypothesis, Category, Code, CodedSegment, InterviewDocument } from '../types/qda';
import { Plus, Pencil, Trash2, Lightbulb } from 'lucide-react';

interface Props {
  hypotheses: Hypothesis[];
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  documents: InterviewDocument[];
  onSave: (h: Omit<Hypothesis, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

const inputCls =
  'w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
const labelCls = 'block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1';

// Hypothesen: Kette Interview → Kategorien/Codes → Hypothese → (später) Items
export const HypothesesPanel: React.FC<Props> = ({ hypotheses, categories, codes, codedSegments, documents, onSave, onDelete }) => {
  const [editing, setEditing] = useState<(Partial<Hypothesis> & { codeIds: string[] }) | null>(null);

  const codeById = new Map(codes.map((c) => [c.id, c]));
  const segsOf = (codeIds: string[]) => codedSegments.filter((s) => codeIds.includes(s.codeId));
  const nInterviews = (codeIds: string[]) => new Set(segsOf(codeIds).map((s) => s.documentId)).size;

  const openNew = () =>
    setEditing({ label: `H${hypotheses.length + 1}`, statement: '', reasoning: '', wirktAuf: '', codeIds: [] });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.statement?.trim()) return;
    onSave({
      id: editing.id,
      label: (editing.label || '').trim() || `H${hypotheses.length + 1}`,
      statement: editing.statement.trim(),
      reasoning: (editing.reasoning || '').trim(),
      wirktAuf: (editing.wirktAuf || '').trim(),
      codeIds: editing.codeIds,
    });
    setEditing(null);
  };

  const toggleCode = (id: string) =>
    setEditing((h) => (h ? { ...h, codeIds: h.codeIds.includes(id) ? h.codeIds.filter((x) => x !== id) : [...h.codeIds, id] } : h));

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Hypothesen</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Leite aus den codierten Interviews Hypothesen ab und verknüpfe sie mit den zugrunde liegenden Codes. Die Belege erscheinen automatisch im Bericht.
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>Neue Hypothese</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {hypotheses.length === 0 && (
            <div className="text-center py-16 text-xs text-zinc-400 space-y-2">
              <Lightbulb className="w-8 h-8 mx-auto text-zinc-300" />
              <p>Noch keine Hypothesen. Sobald du Muster in den Codierungen siehst, halte sie hier fest.</p>
            </div>
          )}
          {hypotheses.map((h) => {
            const hc = h.codeIds.map((id) => codeById.get(id)).filter(Boolean) as Code[];
            const nSeg = segsOf(h.codeIds).length;
            const nInt = nInterviews(h.codeIds);
            return (
              <div key={h.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs shrink-0">{h.label}</span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{h.statement}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditing(h)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer" title="Bearbeiten"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm(`Hypothese ${h.label} löschen?`)) onDelete(h.id); }} className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer" title="Löschen"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {h.reasoning && <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed"><b>Herleitung: </b>{h.reasoning}</p>}
                {h.wirktAuf && <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed"><b>Wirkt auf: </b>{h.wirktAuf}</p>}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {hc.map((c) => (
                    <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700" style={{ borderLeft: `3px solid ${c.color}` }}>{c.name}</span>
                  ))}
                  {hc.length === 0 && <span className="text-[11px] text-amber-600">Keine Codes verknüpft – die Herleitung aus den Interviews fehlt noch.</span>}
                </div>
                {hc.length > 0 && <p className="text-[11px] text-zinc-400">Belege: {nSeg} Textstelle(n) aus {nInt} von {documents.length} Interview(s)</p>}
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">{editing.id ? 'Hypothese bearbeiten' : 'Neue Hypothese'}</h3>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <div>
                  <label className={labelCls}>Nr.</label>
                  <input value={editing.label || ''} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Hypothese *</label>
                  <textarea autoFocus required rows={2} value={editing.statement || ''} onChange={(e) => setEditing({ ...editing, statement: e.target.value })} placeholder="z. B. Je mehr informelle Austauschmöglichkeiten, desto stärker das Zugehörigkeitsgefühl." className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Herleitung aus den Interviews</label>
                <textarea rows={3} value={editing.reasoning || ''} onChange={(e) => setEditing({ ...editing, reasoning: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Wirkt auf</label>
                <input
                  list="wirkt-auf-vorschlaege"
                  value={editing.wirktAuf || ''}
                  onChange={(e) => setEditing({ ...editing, wirktAuf: e.target.value })}
                  placeholder="z. B. Zugehörigkeit zur Fakultät, Präsenz vor Ort"
                  className={inputCls}
                />
                {/* Vorschläge: Codes und Kategorien der Zielgröße */}
                <datalist id="wirkt-auf-vorschlaege">
                  {categories.filter((k) => k.rolle === 'ziel').flatMap((k) => [k.name, ...codes.filter((c) => c.categoryId === k.id).map((c) => c.name)]).map((n) => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Zugrunde liegende Codes ({editing.codeIds.length} gewählt)</label>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-52 overflow-y-auto space-y-2">
                  {categories.map((cat) => {
                    const cc = codes.filter((c) => c.categoryId === cat.id);
                    if (cc.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-0.5">{cat.name}</div>
                        <div className="grid grid-cols-2 gap-x-3">
                          {cc.map((c) => (
                            <label key={c.id} className="flex items-center gap-1.5 text-[11px] py-0.5 cursor-pointer">
                              <input type="checkbox" checked={editing.codeIds.includes(c.id)} onChange={() => toggleCode(c.id)} />
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                              <span className="truncate">{c.name}</span>
                              <span className="text-zinc-400 font-mono">{codedSegments.filter((s) => s.codeId === c.id).length}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {codes.length === 0 && <p className="text-[11px] text-zinc-400">Noch keine Codes vorhanden.</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Abbrechen</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
