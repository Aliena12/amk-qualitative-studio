/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Memo, InterviewDocument, Code } from '../types/qda';
import { BookOpen, Plus, Trash2, Calendar, User, Tag, FileText } from 'lucide-react';

interface MemosPanelProps {
  memos: Memo[];
  documents: InterviewDocument[];
  codes: Code[];
  onAddMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => void;
  onDeleteMemo: (memoId: string) => void;
}

export const MemosPanel: React.FC<MemosPanelProps> = ({
  memos,
  documents,
  codes,
  onAddMemo,
  onDeleteMemo,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'theoretical' | 'methodological' | 'case_summary'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'theoretical' | 'methodological' | 'case_summary'>('theoretical');
  const [newAuthor, setNewAuthor] = useState('AMK Forscher');

  const filteredMemos = memos.filter((m) => activeFilter === 'all' || m.type === activeFilter);

  const handleCreateMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddMemo({
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      author: newAuthor.trim() || 'AMK Forscher',
    });

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const typeLabels = {
    theoretical: { label: 'Theoretisches Memo', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    methodological: { label: 'Methodische Reflexion', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    case_summary: { label: 'Fallzusammenfassung', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Memos Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Forschungs-Memos & Reflexionsjournal</span>
            <span className="text-[10px] font-mono tabular-nums bg-zinc-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded-xs text-zinc-500 dark:text-zinc-400">
              {memos.length} Memos
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Dokumentation von Theoriehypothesen, methodischen Entscheidungen und Audit Trails nach Grounded Theory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs border border-zinc-200/50 dark:border-zinc-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Alle ({memos.length})
            </button>
            <button
              onClick={() => setActiveFilter('theoretical')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'theoretical'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Theorie
            </button>
            <button
              onClick={() => setActiveFilter('methodological')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'methodological'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Methodik
            </button>
            <button
              onClick={() => setActiveFilter('case_summary')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'case_summary'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Fallprofile
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Neues Memo</span>
          </button>
        </div>
      </div>

      {/* Memos Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {filteredMemos.map((memo) => {
            const typeConfig = typeLabels[memo.type];

            return (
              <div
                key={memo.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>

                    <button
                      onClick={() => {
                        if (confirm('Dieses Memo unwiderruflich löschen?')) {
                          onDeleteMemo(memo.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Memo löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {memo.title}
                  </h3>

                  <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {memo.content}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{memo.author}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(memo.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMemos.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400">
            Keine Memos in dieser Kategorie vorhanden.
          </div>
        )}
      </div>

      {/* Add Memo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Neues Reflexions-Memo verfassen
            </h3>

            <form onSubmit={handleCreateMemo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Memo-Typ
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="theoretical">Theoretisches Memo (Grounded Theory Hypothese)</option>
                  <option value="methodological">Methodische Reflexion (Audit Trail / Validität)</option>
                  <option value="case_summary">Fallzusammenfassung (Probandenprofil)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Diskrepanz zwischen Nachhaltigkeitsbekenntnis und Kaufabbruch"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inhalt & Gedanken
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Beschreibe deine analytischen Beobachtungen, Theoriemuster oder methodische Fragen..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Autor / Bearbeiter
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Memo speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
