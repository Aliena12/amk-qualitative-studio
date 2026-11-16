/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Code, CodedSegment } from '../types/qda';
import { ChevronRight, ChevronDown, Plus, Search, Trash2, Edit2, FolderPlus, Pencil } from 'lucide-react';

interface CodeSystemProps {
  categories: Category[];
  codes: Code[];
  codedSegments: CodedSegment[];
  activeCodeFilter: string | null;
  onSelectCodeFilter: (codeId: string | null) => void;
  onAddCode: (code: Partial<Code>) => string;
  onEditCode: (code: Code) => void;
  onDeleteCode: (codeId: string) => void;
  onMergeCode: (fromId: string, intoId: string) => void;
  onAddCategory: (c: Pick<Category, 'name' | 'description' | 'color'>) => void;
  onEditCategory: (c: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const inputCls =
  'w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
const labelCls = 'block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1';
const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#ec4899', '#84cc16'];

export const CodeSystem: React.FC<CodeSystemProps> = ({
  categories, codes, codedSegments, activeCodeFilter, onSelectCodeFilter,
  onAddCode, onEditCode, onDeleteCode, onMergeCode, onAddCategory, onEditCategory, onDeleteCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Code-Dialog
  const [showCode, setShowCode] = useState(false);
  const [editingCode, setEditingCode] = useState<Code | null>(null);
  const [codeName, setCodeName] = useState('');
  const [codeDesc, setCodeDesc] = useState('');
  const [codeCatId, setCodeCatId] = useState('');
  const [codeColor, setCodeColor] = useState('#10b981');
  const [mergeInto, setMergeInto] = useState('');

  // Kategorie-Dialog
  const [showCat, setShowCat] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catColor, setCatColor] = useState('#10b981');

  const countOf = (codeId: string) => codedSegments.filter((s) => s.codeId === codeId).length;

  const openAddCode = (catId?: string) => {
    setEditingCode(null);
    setCodeName('');
    setCodeDesc('');
    const cid = catId || categories[0]?.id || '';
    setCodeCatId(cid);
    setCodeColor(categories.find((c) => c.id === cid)?.color || '#10b981');
    setMergeInto('');
    setShowCode(true);
  };
  const openEditCode = (code: Code, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCode(code);
    setCodeName(code.name);
    setCodeDesc(code.description);
    setCodeCatId(code.categoryId);
    setCodeColor(code.color);
    setMergeInto('');
    setShowCode(true);
  };
  const saveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim()) return;
    const data = { name: codeName.trim(), description: codeDesc.trim(), categoryId: codeCatId, color: codeColor };
    if (editingCode) onEditCode({ ...editingCode, ...data });
    else onAddCode(data);
    setShowCode(false);
  };
  const doMerge = () => {
    if (!editingCode || !mergeInto) return;
    const target = codes.find((c) => c.id === mergeInto);
    if (confirm(`Code „${editingCode.name}“ in „${target?.name}“ zusammenführen?\nAlle ${countOf(editingCode.id)} Textstellen wandern zu „${target?.name}“, „${editingCode.name}“ wird entfernt.`)) {
      onMergeCode(editingCode.id, mergeInto);
      setShowCode(false);
    }
  };

  const openAddCat = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setCatColor(PALETTE[categories.length % PALETTE.length]);
    setShowCat(true);
  };
  const openEditCat = (c: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCat(c);
    setCatName(c.name);
    setCatDesc(c.description);
    setCatColor(c.color);
    setShowCat(true);
  };
  const saveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const data = { name: catName.trim(), description: catDesc.trim(), color: catColor };
    if (editingCat) onEditCategory({ ...editingCat, ...data });
    else onAddCategory(data);
    setShowCat(false);
  };

  const q = searchQuery.trim().toLowerCase();

  return (
    <div className="flex flex-col h-full bg-zinc-50/40 dark:bg-zinc-950/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Codesystem</span>
          <span className="text-[10px] font-mono tabular-nums text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded-xs">{codes.length}</span>
        </div>
        <div className="flex items-center">
          <button onClick={openAddCat} className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded cursor-pointer" title="Neue Überkategorie anlegen">
            <FolderPlus className="w-3 h-3" />
          </button>
          <button
            onClick={() => openAddCode()}
            disabled={categories.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-40 rounded cursor-pointer"
            title={categories.length === 0 ? 'Lege zuerst eine Überkategorie an' : 'Neuen Code definieren'}
          >
            <Plus className="w-3 h-3" />
            <span>Code</span>
          </button>
        </div>
      </div>

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
            <span className="truncate">Filter aktiv: {codes.find((c) => c.id === activeCodeFilter)?.name}</span>
            <button onClick={() => onSelectCodeFilter(null)} className="text-xs font-bold hover:text-emerald-800 cursor-pointer ml-1">×</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
        {categories.length === 0 && <p className="text-[11px] text-zinc-400 text-center py-6">Noch keine Überkategorien. Mit dem Ordner-Symbol oben anlegen.</p>}
        {categories.map((category) => {
          const isCollapsed = collapsed[category.id];
          const catCodes = codes.filter((c) => c.categoryId === category.id);
          const childCodes = catCodes.filter((c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
          if (q && childCodes.length === 0) return null;
          const total = codedSegments.filter((s) => catCodes.some((c) => c.id === s.codeId)).length;

          return (
            <div key={category.id} className="rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 overflow-hidden">
              <div
                onClick={() => setCollapsed((p) => ({ ...p, [category.id]: !p[category.id] }))}
                className="group flex items-center justify-between p-1.5 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 cursor-pointer select-none"
                title={category.description}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isCollapsed ? <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />}
                  <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: category.color }} />
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{category.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openAddCode(category.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-emerald-600" title="Code in dieser Überkategorie anlegen">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => openEditCat(category, e)} className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" title="Überkategorie bearbeiten">
                    <Pencil className="w-3 h-3" />
                  </button>
                  {catCodes.length === 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm(`Überkategorie „${category.name}“ löschen?`)) onDeleteCategory(category.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-rose-500"
                      title="Leere Überkategorie löschen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-[10px] font-mono tabular-nums text-zinc-400 ml-1">{total}</span>
                </div>
              </div>

              {!isCollapsed && (
                <div className="pl-3.5 pr-1 pb-1 space-y-0.5">
                  {childCodes.length === 0 && <p className="text-[10px] text-zinc-400 py-1 pl-1">Noch keine Codes.</p>}
                  {childCodes.map((code) => {
                    const isFiltered = activeCodeFilter === code.id;
                    return (
                      <div
                        key={code.id}
                        onClick={() => onSelectCodeFilter(isFiltered ? null : code.id)}
                        className={`group flex items-center justify-between p-1.5 rounded-md text-[11px] cursor-pointer ${
                          isFiltered ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300'
                        }`}
                        title={code.description || 'Noch keine Definition – über den Stift ergänzen'}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: code.color }} />
                          <span className="truncate">{code.name}</span>
                          {!code.description.trim() && <span className="text-[9px] text-amber-500 shrink-0" title="Definition fehlt">!</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono tabular-nums text-zinc-400">{countOf(code.id)}</span>
                          <button onClick={(e) => openEditCode(code, e)} className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" title="Code bearbeiten, verschieben oder zusammenführen">
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const n = countOf(code.id);
                              if (confirm(n > 0 ? `Code „${code.name}“ löschen?\nDabei werden auch ${n} codierte Textstelle(n) gelöscht. Zum Behalten lieber mit einem anderen Code zusammenführen.` : `Code „${code.name}“ löschen?`)) onDeleteCode(code.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-rose-500"
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

      {showCode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">{editingCode ? 'Code bearbeiten' : 'Neuen Code anlegen'}</h3>
            <form onSubmit={saveCode} className="space-y-3">
              <div>
                <label className={labelCls}>Code-Name</label>
                <input autoFocus required value={codeName} onChange={(e) => setCodeName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Überkategorie</label>
                <select value={codeCatId} onChange={(e) => setCodeCatId(e.target.value)} className={inputCls}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Definition / Codieranweisung</label>
                <textarea rows={3} value={codeDesc} onChange={(e) => setCodeDesc(e.target.value)} placeholder="Wann wird dieser Code vergeben? Was gehört nicht dazu?" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Markierungsfarbe</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={codeColor} onChange={(e) => setCodeColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700 p-0" />
                  <span className="text-xs font-mono text-zinc-400">{codeColor}</span>
                </div>
              </div>

              {editingCode && codes.length > 1 && (
                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <label className={labelCls}>Mit anderem Code zusammenführen</label>
                  <div className="flex gap-2">
                    <select value={mergeInto} onChange={(e) => setMergeInto(e.target.value)} className={inputCls}>
                      <option value="">– Ziel-Code wählen –</option>
                      {codes.filter((c) => c.id !== editingCode.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" disabled={!mergeInto} onClick={doMerge} className="px-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded-lg cursor-pointer shrink-0">
                      Zusammenführen
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400">Alle Textstellen und Hypothesen-Verknüpfungen wandern zum Ziel-Code.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCode(false)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Abbrechen</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">{editingCat ? 'Überkategorie bearbeiten' : 'Neue Überkategorie'}</h3>
            <form onSubmit={saveCat} className="space-y-3">
              <div>
                <label className={labelCls}>Name</label>
                <input autoFocus required value={catName} onChange={(e) => setCatName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Beschreibung</label>
                <textarea rows={2} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={catColor} onChange={(e) => setCatColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700 p-0" />
                <span className="text-xs font-mono text-zinc-400">{catColor}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCat(false)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Abbrechen</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
