/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InterviewDocument, CodedSegment } from '../types/qda';
import { FileText, Upload, Trash2, Plus } from 'lucide-react';

interface DocumentSystemProps {
  documents: InterviewDocument[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onDeleteDoc: (id: string) => void;
  codedSegments: CodedSegment[];
}

export const DocumentSystem: React.FC<DocumentSystemProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenUpload,
  onDeleteDoc,
  codedSegments,
}) => {
  return (
    <div className="flex flex-col h-full bg-zinc-50/40 dark:bg-zinc-950/60 overflow-hidden">
      {/* Minimalist Pane Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Transkripte
          </span>
          <span className="text-[10px] font-mono tabular-nums text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded-xs">
            {documents.length}
          </span>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
          title="Interview-Transkript hinzufügen"
        >
          <Plus className="w-3 h-3" />
          <span>Upload</span>
        </button>
      </div>

      {/* Clean Document List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {documents.map((doc) => {
          const isSelected = doc.id === selectedDocId;
          const count = codedSegments.filter((s) => s.documentId === doc.id).length;

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`group flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {doc.respondentInfo.code}
                </span>
                <div className="truncate">
                  <div className="truncate text-[11px]">{doc.title}</div>
                  <div className="text-[10px] text-zinc-400 font-normal truncate">
                    {doc.respondentInfo.duration}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-xs bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500">
                  {count}
                </span>

                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Interview ${doc.respondentInfo.code} entfernen?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-rose-500 transition-opacity"
                    title="Dokument löschen"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
