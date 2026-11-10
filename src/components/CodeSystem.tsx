/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Code, CodedSegment } from '../types/qda';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Edit2,
  FolderPlus,
} from 'lucide-react';

interface CodeSystemProps {
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  activeCodeFilter: string | null;
  onSelectCodeFilter: (codeId: string | null) => void;
  onAddCode: (code: Partial<Code>) => void;
  onEditCode: (code: Code) => void;
  onDeleteCode: (codeId: string) => void;
}

export const CodeSystem: React.FC<CodeSystemProps> = ({
  categories,
  codes,
  codedSegments,
  activeCodeFilter,
  onSelectCodeFilter,
  onAddCode,
  onEditCode,
  onDeleteCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<Code | null>(null);
  const [codeName, setCodeName] = useState('');
  const [codeDesc, setCodeDesc] = useState('');
  const [codeCatId, setCodeCatId] = useState(categories[0]?.id || '');
  const [codeColor, setCodeColor] = useState('#10b981');

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleOpenAdd = () => {
    setEditingCode(null);
    setCodeName('');
    setCodeDesc('');
    setCodeCatId(categories[0]?.id || '');
    setCodeColor('#10b981');
    setShowModal(true);
  };

  const handleOpenEdit = (code: Code, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCode(code);
    setCodeName(code.name);
    setCodeDesc(code.description);
    setCodeCatId(code.categoryId);
    setCodeColor(code.color);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim()) return;

    if (editingCode) {
      onEditCode({
        ...editingCode,
        name: codeName.trim(),
        description: codeDesc.trim(),
        categoryId: codeCatId,
        color: codeColor,
      });
    } else {
      onAddCode({
        name: codeName.trim(),
        description: codeDesc.trim(),
        categoryId: codeCatId,
        color: codeColor,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50/40 dark:bg-zinc-950/60 overflow-hidden">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Codesystem
          </span>
          <span className="text-[10px] font-mono tabular-nums text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded-xs">
            {codes.length}
          </span>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
          title="Neuen Code definieren"
        >
          <Plus className="w-3 h-3" />
          <span>Code</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-2 text-zinc-400" />
          <input
            type="text"
            placeholder="Codes filtern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {activeCodeFilter && (
          <div className="mt-1 flex items-center justify-between px-2 py-0.5 bg-emerald-500/10 rounded text-[10px] text-emerald-600 dark:text-emerald-400">
            <span className="truncate">
              Aktiv: {codes.find((c) => c.id === activeCodeFilter)?.name}
            </span>
            <button
              onClick={() => onSelectCodeFilter(null)}
              className="text-xs font-bold hover:text-emerald-800 cursor-pointer ml-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Code Tree */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
        {categories.map((category) => {
          const isCollapsed = collapsedCategories[category.id];
          const childCodes = codes.filter(
            (code) =>
              code.categoryId === category.id &&
              (searchQuery === '' ||
                code.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                code.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          if (searchQuery !== '' && childCodes.length === 0) return null;

          const totalCatSegments = codedSegments.filter((s) =>
            childCodes.some((c) => c.id === s.codeId)
          ).length;

          return (
            <div
              key={category.id}
              className="rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 overflow-hidden"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-between p-1.5 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                  )}
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {category.name}
                  </span>
                </div>

                <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                  {totalCatSegments}
                </span>
              </div>

              {/* Subcodes */}
              {!isCollapsed && (
                <div className="pl-3.5 pr-1 pb-1 space-y-0.5">
                  {childCodes.map((code) => {
                    const isFiltered = activeCodeFilter === code.id;
                    const segmentCount = codedSegments.filter((s) => s.codeId === code.id).length;

                    return (
                      <div
                        key={code.id}
                        onClick={() => onSelectCodeFilter(isFiltered ? null : code.id)}
                        className={`group flex items-center justify-between p-1.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                          isFiltered
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300'
                        }`}
                        title={code.description}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: code.color }}
                          />
                          <span className="truncate">{code.name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                            {segmentCount}
                          </span>
                          <button
                            onClick={(e) => handleOpenEdit(code, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-opacity"
                            title="Code bearbeiten & Überkategorie ändern"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Code "${code.name}" wirklich löschen?`)) {
                                onDeleteCode(code.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-rose-500 transition-opacity"
                            title="Code löschen"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              {editingCode ? 'Code & Zuordnung bearbeiten' : 'Neuen Code anlegen'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Code-Name
                </label>
                <input
                  type="text"
                  required
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Übergeordnete Kategorie (Cluster)
                </label>
                <select
                  value={codeCatId}
                  onChange={(e) => setCodeCatId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Markierungsfarbe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={codeColor}
                    onChange={(e) => setCodeColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700 p-0"
                  />
                  <span className="text-xs font-mono text-zinc-400">{codeColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Definition / Codieranweisung
                </label>
                <textarea
                  rows={2}
                  value={codeDesc}
                  onChange={(e) => setCodeDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
