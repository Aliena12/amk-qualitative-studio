/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QdaProject } from '../types/qda';
import { X } from 'lucide-react';

interface Props {
  project: QdaProject;
  onClose: () => void;
  onSave: (info: Pick<QdaProject, 'name' | 'description' | 'courseModule' | 'authors'>) => void;
}

const inputCls =
  'w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
const labelCls = 'block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1';

// Kopfdaten des Berichts: Titel, Forschungsfrage, Modul, Autor:innen
export const ProjectInfoModal: React.FC<Props> = ({ project, onClose, onSave }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [courseModule, setCourseModule] = useState(project.courseModule);
  const [authors, setAuthors] = useState(project.authors || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Projektdaten (Kopf des Berichts)</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3 pt-3">
          <div>
            <label className={labelCls}>Projekttitel</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Forschungsfrage / Thema</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Modul</label>
            <input value={courseModule} onChange={(e) => setCourseModule(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Gruppe / Autor:innen</label>
            <input value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="z. B. Lin, Name 2, Name 3" className={inputCls} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
            Abbrechen
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => {
              onSave({ name: name.trim(), description: description.trim(), courseModule: courseModule.trim(), authors: authors.trim() });
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg cursor-pointer"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
