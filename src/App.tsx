/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { QdaProject, ActiveTab, InterviewDocument, Code, Category, CodedSegment, Memo, Hypothesis } from './types/qda';
import { INITIAL_PROJECT } from './data/initialProject';
import { normalizeProject, syncProject } from './utils/normalize';
import { Header } from './components/Header';
import { DocumentSystem } from './components/DocumentSystem';
import { CodeSystem } from './components/CodeSystem';
import { DocumentBrowser } from './components/DocumentBrowser';
import { ConceptMap } from './components/ConceptMap';
import { CodeMatrixBrowser } from './components/CodeMatrixBrowser';
import { HypothesesPanel } from './components/HypothesesPanel';
import { MemosPanel } from './components/MemosPanel';
import { SynthesisReport } from './components/SynthesisReport';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';
import { InterviewDetailsModal } from './components/InterviewDetailsModal';
import { ProjectInfoModal } from './components/ProjectInfoModal';
import { KiModal } from './components/KiModal';
import { PanelLeftClose, PanelLeftOpen, Upload } from 'lucide-react';

const STORAGE_KEY = 'amk_qda_project_data_v2'; // nur Notfall-Kopie im Browser; maßgeblich ist data/projekt.json

export default function App() {
  const [project, setProject] = useState<QdaProject>(INITIAL_PROJECT);

  // Erst nach dem Laden aus der Projektdatei darf gespeichert werden.
  // saveBlocked: Datei war unlesbar/ungültig → es wird NIE überschrieben, bis der Nutzer eingreift.
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const forceBackupRef = useRef(false);

  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('browser');
  const [activeCodeFilter, setActiveCodeFilter] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const t = localStorage.getItem('amk_theme');
      if (t) return t === 'dark';
    } catch (e) {
      /* egal */
    }
    return true;
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [kiDocId, setKiDocId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('amk_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      /* egal */
    }
  }, [isDarkMode]);

  // Beim Start: Projektstand aus data/projekt.json laden (und ggf. sicher migrieren)
  useEffect(() => {
    let cancelled = false;
    const apply = (n: { project: QdaProject; changed: boolean }) => {
      if (cancelled) return;
      setProject(n.project);
      setSelectedDocId(n.project.documents[0]?.id || '');
      if (n.changed) forceBackupRef.current = true; // Stand vor der Migration als Backup sichern
    };
    (async () => {
      try {
        const res = await fetch('/api/qda/project');
        if (!res.ok) {
          if (!cancelled) setSaveBlocked(`Die Projektdatei data/projekt.json konnte nicht gelesen werden (Status ${res.status}). Es wird nichts überschrieben.`);
        } else {
          const data = await res.json();
          if (data.project == null) {
            // noch kein Projekt: leeres Projekt, erster Speichervorgang legt die Datei an
          } else {
            const n = normalizeProject(data.project);
            if (n) apply(n);
            else if (!cancelled) setSaveBlocked('Die Projektdatei hat ein unbekanntes Format. Sie wird nicht überschrieben – bitte eine Sicherung aus data/backups/ ansehen.');
          }
        }
      } catch (e) {
        // Server nicht erreichbar → Notfallkopie aus dem Browser anzeigen, aber nicht in die Datei schreiben
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const n = saved ? normalizeProject(JSON.parse(saved)) : null;
          if (n) apply(n);
        } catch (e2) {
          /* egal */
        }
        if (!cancelled) setSaveBlocked('Der Server ist nicht erreichbar – Änderungen werden nicht in die Projektdatei geschrieben.');
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Änderungen speichern: Datei (verzögert) + Browser-Kopie
  useEffect(() => {
    if (!isLoaded || saveBlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      /* Browser-Speicher voll: unkritisch */
    }
    const timer = setTimeout(() => {
      const force = forceBackupRef.current;
      fetch('/api/qda/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, forceBackup: force }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`Status ${r.status}`);
          if (force) forceBackupRef.current = false;
          setSaveStatus('saved');
        })
        .catch((e) => {
          console.error('Speichern fehlgeschlagen:', e);
          setSaveStatus('error');
        });
    }, 400);
    return () => clearTimeout(timer);
  }, [project, isLoaded, saveBlocked]);

  useEffect(() => {
    if (!project.documents.some((d) => d.id === selectedDocId)) setSelectedDocId(project.documents[0]?.id || '');
  }, [project.documents, selectedDocId]);

  // Alle Änderungen laufen über mutate, damit subCodeIds und Häufigkeiten immer stimmen
  const mutate = (fn: (p: QdaProject) => QdaProject) => setProject((prev) => syncProject(fn(prev)));

  // --- Interviews ---
  const handleAddDocuments = (docs: InterviewDocument[]) => {
    mutate((p) => ({ ...p, documents: [...p.documents, ...docs] }));
    if (docs[0]) setSelectedDocId(docs[0].id);
    setActiveTab('browser');
  };
  const handleUpdateDoc = (doc: InterviewDocument) => mutate((p) => ({ ...p, documents: p.documents.map((d) => (d.id === doc.id ? doc : d)) }));
  const handleDeleteDoc = (id: string) =>
    mutate((p) => ({
      ...p,
      documents: p.documents.filter((d) => d.id !== id),
      codedSegments: p.codedSegments.filter((s) => s.documentId !== id),
      memos: p.memos.filter((m) => m.documentId !== id),
    }));

  // --- Codes ---
  const handleAddCode = (d: Partial<Code>): string => {
    const id = `code-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    mutate((p) => ({
      ...p,
      codes: [
        ...p.codes,
        {
          id,
          name: d.name || 'Neuer Code',
          description: d.description || '',
          categoryId: d.categoryId || p.categories[0]?.id || '',
          color: d.color || '#10b981',
          frequency: 0,
        },
      ],
    }));
    return id;
  };
  const handleEditCode = (c: Code) => mutate((p) => ({ ...p, codes: p.codes.map((x) => (x.id === c.id ? c : x)) }));
  const handleDeleteCode = (id: string) => {
    mutate((p) => ({
      ...p,
      codes: p.codes.filter((c) => c.id !== id),
      codedSegments: p.codedSegments.filter((s) => s.codeId !== id),
      hypotheses: p.hypotheses.map((h) => ({ ...h, codeIds: h.codeIds.filter((x) => x !== id) })),
    }));
    if (activeCodeFilter === id) setActiveCodeFilter(null);
  };
  // Code "from" in Code "into" aufgehen lassen: alle Codierungen und Hypothesen-Verknüpfungen wandern mit
  const handleMergeCode = (fromId: string, intoId: string) => {
    mutate((p) => ({
      ...p,
      codes: p.codes.filter((c) => c.id !== fromId),
      codedSegments: p.codedSegments.map((s) => (s.codeId === fromId ? { ...s, codeId: intoId } : s)),
      hypotheses: p.hypotheses.map((h) => ({
        ...h,
        codeIds: Array.from(new Set(h.codeIds.map((x) => (x === fromId ? intoId : x)))),
      })),
    }));
    if (activeCodeFilter === fromId) setActiveCodeFilter(intoId);
  };

  // --- Überkategorien ---
  const handleAddCategory = (d: Pick<Category, 'name' | 'description' | 'color' | 'rolle'>) =>
    mutate((p) => ({ ...p, categories: [...p.categories, { id: `cat-user-${Date.now()}`, subCodeIds: [], ...d }] }));
  const handleEditCategory = (c: Category) => mutate((p) => ({ ...p, categories: p.categories.map((x) => (x.id === c.id ? c : x)) }));
  const handleDeleteCategory = (id: string) => mutate((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== id) }));

  // --- Codierte Textstellen ---
  const handleDeleteSegment = (id: string) => mutate((p) => ({ ...p, codedSegments: p.codedSegments.filter((s) => s.id !== id) }));
  const handleEditSegment = (seg: CodedSegment) => mutate((p) => ({ ...p, codedSegments: p.codedSegments.map((s) => (s.id === seg.id ? seg : s)) }));
  const handleAddSegment = (seg: Omit<CodedSegment, 'id'>) =>
    mutate((p) => ({ ...p, codedSegments: [...p.codedSegments, { ...seg, id: `seg-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}` }] }));

  // Mehrere Textstellen auf einmal (KI-Vorschläge)
  const handleAddSegments = (segs: Omit<CodedSegment, 'id'>[]) =>
    mutate((p) => ({
      ...p,
      codedSegments: [...p.codedSegments, ...segs.map((s, i) => ({ ...s, id: `seg-ki-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}` }))],
    }));

  // --- Memos ---
  const handleAddMemo = (m: Omit<Memo, 'id' | 'createdAt'>) =>
    mutate((p) => ({ ...p, memos: [{ ...m, id: `memo-${Date.now()}`, createdAt: new Date().toISOString() }, ...p.memos] }));
  const handleUpdateMemo = (m: Memo) => mutate((p) => ({ ...p, memos: p.memos.map((x) => (x.id === m.id ? m : x)) }));
  const handleDeleteMemo = (id: string) => mutate((p) => ({ ...p, memos: p.memos.filter((m) => m.id !== id) }));

  // --- Hypothesen ---
  const handleSaveHypothesis = (h: Omit<Hypothesis, 'id' | 'createdAt'> & { id?: string }) =>
    mutate((p) => {
      if (h.id && p.hypotheses.some((x) => x.id === h.id)) {
        return { ...p, hypotheses: p.hypotheses.map((x) => (x.id === h.id ? { ...x, ...h, id: x.id } : x)) };
      }
      return { ...p, hypotheses: [...p.hypotheses, { ...h, id: `hyp-${Date.now()}`, createdAt: new Date().toISOString() }] };
    });
  const handleDeleteHypothesis = (id: string) => mutate((p) => ({ ...p, hypotheses: p.hypotheses.filter((h) => h.id !== id) }));

  // --- Projekt ---
  const handleSaveInfo = (info: Pick<QdaProject, 'name' | 'description' | 'courseModule' | 'authors'>) => mutate((p) => ({ ...p, ...info }));

  // Projektarchiv (JSON) einspielen; liefert eine Fehlermeldung oder null
  const handleRestore = (raw: unknown): string | null => {
    const n = normalizeProject(raw);
    if (!n) return 'Die Datei ist kein gültiges Projektarchiv.';
    forceBackupRef.current = true; // aktuellen Stand vorher sichern
    setSaveBlocked(null);
    setProject(n.project);
    setSelectedDocId(n.project.documents[0]?.id || '');
    setActiveCodeFilter(null);
    return null;
  };
  const handleReset = () => {
    forceBackupRef.current = true;
    setSaveBlocked(null);
    setProject(INITIAL_PROJECT);
    setSelectedDocId('');
    setActiveCodeFilter(null);
  };

  const currentDocument = project.documents.find((d) => d.id === selectedDocId) || project.documents[0];
  const editingDoc = project.documents.find((d) => d.id === editingDocId);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950 text-xs text-zinc-500">
        Projekt wird geladen…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased select-text">
      {saveBlocked && (
        <div className="shrink-0 px-5 py-2 text-xs bg-rose-50 text-rose-800 border-b border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900">
          <b>Speichern pausiert:</b> {saveBlocked}
        </div>
      )}
      {!saveBlocked && saveStatus !== 'idle' && (
        <div
          className={`fixed bottom-2 right-3 z-40 text-[10px] px-2 py-1 rounded-md border ${
            saveStatus === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              : 'bg-white/80 text-zinc-500 border-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-800'
          }`}
        >
          {saveStatus === 'error' ? 'Speichern in data/projekt.json fehlgeschlagen – läuft der Server?' : 'Gespeichert in data/projekt.json'}
        </div>
      )}

      <Header
        projectName={project.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'browser' && (
          <aside
            className={`transition-all duration-300 ease-in-out shrink-0 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-10 ${
              isSidebarOpen ? 'w-64 md:w-72' : 'w-0 overflow-hidden border-r-0'
            }`}
          >
            <div className="h-1/2 overflow-hidden flex flex-col">
              <DocumentSystem
                documents={project.documents}
                selectedDocId={selectedDocId}
                onSelectDoc={setSelectedDocId}
                onOpenUpload={() => setIsUploadOpen(true)}
                onEditDoc={setEditingDocId}
                onDeleteDoc={handleDeleteDoc}
                codedSegments={project.codedSegments}
              />
            </div>
            <div className="h-1/2 overflow-hidden flex flex-col">
              <CodeSystem
                categories={project.categories}
                codes={project.codes}
                codedSegments={project.codedSegments}
                activeCodeFilter={activeCodeFilter}
                onSelectCodeFilter={setActiveCodeFilter}
                onAddCode={handleAddCode}
                onEditCode={handleEditCode}
                onDeleteCode={handleDeleteCode}
                onMergeCode={handleMergeCode}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          </aside>
        )}

        {activeTab === 'browser' && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-3 z-20 p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
            style={{ left: isSidebarOpen ? 'calc(16rem + 8px)' : '8px' }}
            title={isSidebarOpen ? 'Seitenleiste einklappen' : 'Seitenleiste ausklappen'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-500" />}
          </button>
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950">
          {activeTab === 'browser' &&
            (currentDocument ? (
              <DocumentBrowser
                document={currentDocument}
                codes={project.codes}
                categories={project.categories}
                codedSegments={project.codedSegments}
                activeCodeFilter={activeCodeFilter}
                onSelectCodeFilter={setActiveCodeFilter}
                onDeleteSegment={handleDeleteSegment}
                onEditSegment={handleEditSegment}
                onAddManualSegment={handleAddSegment}
                onAddCode={handleAddCode}
                onEditDocument={() => setEditingDocId(currentDocument.id)}
                onOpenKi={() => setKiDocId(currentDocument.id)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
                <Upload className="w-10 h-10 text-emerald-500" />
                <h2 className="text-base font-bold">Noch kein Interview im Projekt</h2>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Importiere dein erstes Transkript (z. B. aus tiroScribe). Sprecher und Zeitstempel werden erkannt, danach kannst du Textstellen markieren und codieren.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                >
                  Transkript importieren
                </button>
              </div>
            ))}

          {activeTab === 'concept_map' && (
            <ConceptMap
              categories={project.categories}
              codes={project.codes}
              codedSegments={project.codedSegments}
              documents={project.documents}
              onSelectCodeFilter={(codeId) => {
                setActiveCodeFilter(codeId);
                setActiveTab('browser');
              }}
            />
          )}

          {activeTab === 'code_matrix' && (
            <CodeMatrixBrowser categories={project.categories} codes={project.codes} codedSegments={project.codedSegments} documents={project.documents} />
          )}

          {activeTab === 'hypotheses' && (
            <HypothesesPanel
              hypotheses={project.hypotheses}
              categories={project.categories}
              codes={project.codes}
              codedSegments={project.codedSegments}
              documents={project.documents}
              onSave={handleSaveHypothesis}
              onDelete={handleDeleteHypothesis}
            />
          )}

          {activeTab === 'memos' && (
            <MemosPanel
              memos={project.memos}
              documents={project.documents}
              defaultAuthor={project.authors || ''}
              onAddMemo={handleAddMemo}
              onUpdateMemo={handleUpdateMemo}
              onDeleteMemo={handleDeleteMemo}
            />
          )}

          {activeTab === 'synthesis' && <SynthesisReport project={project} onOpenInfo={() => setIsInfoOpen(true)} />}
        </main>
      </div>

      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onNavigateToReport={() => setActiveTab('synthesis')}
        onRestore={handleRestore}
        onReset={handleReset}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        existingCodes={project.documents.map((d) => d.respondentInfo.code)}
        onAddDocuments={handleAddDocuments}
      />

      {editingDoc && (
        <InterviewDetailsModal
          doc={editingDoc}
          otherCodes={project.documents.filter((d) => d.id !== editingDoc.id).map((d) => d.respondentInfo.code)}
          onClose={() => setEditingDocId(null)}
          onSave={handleUpdateDoc}
        />
      )}

      {kiDocId && project.documents.some((d) => d.id === kiDocId) && (
        <KiModal
          doc={project.documents.find((d) => d.id === kiDocId)!}
          codes={project.codes}
          categories={project.categories}
          codedSegments={project.codedSegments}
          forschungsfrage={project.description}
          onClose={() => setKiDocId(null)}
          onAddSegments={handleAddSegments}
          onAddMemo={handleAddMemo}
        />
      )}

      {isInfoOpen && (
        <ProjectInfoModal
          project={project}
          onClose={() => setIsInfoOpen(false)}
          onSave={handleSaveInfo}
        />
      )}
    </div>
  );
}
