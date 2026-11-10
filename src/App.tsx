/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  QdaProject,
  ActiveTab,
  InterviewDocument,
  Code,
  Category,
  CodedSegment,
  Memo,
} from './types/qda';
import { INITIAL_PROJECT } from './data/amkSampleInterviews';
import { Header } from './components/Header';
import { DocumentSystem } from './components/DocumentSystem';
import { CodeSystem } from './components/CodeSystem';
import { DocumentBrowser } from './components/DocumentBrowser';
import { SentimentView } from './components/SentimentView';
import { ConceptMap } from './components/ConceptMap';
import { CodeMatrixBrowser } from './components/CodeMatrixBrowser';
import { MemosPanel } from './components/MemosPanel';
import { SynthesisReport } from './components/SynthesisReport';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';
import { AnalysisProgressModal } from './components/AnalysisProgressModal';
import { PrivacyModal, EngineMode } from './components/PrivacyModal';
import { PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<QdaProject>(() => {
    const saved = localStorage.getItem('amk_qda_project_data_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PROJECT;
  });

  const [selectedDocId, setSelectedDocId] = useState<string>(
    project.documents[0]?.id || 'doc-1'
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('browser');
  const [activeCodeFilter, setActiveCodeFilter] = useState<string | null>(null);

  // Left Sidebar Collapse state (can be toggled open/closed)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dark Mode defaults to true
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('amk_theme');
    if (savedTheme) return savedTheme === 'dark';
    return true;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [engineMode, setEngineMode] = useState<EngineMode>('local');
  const [ollamaModel, setOllamaModel] = useState<string>('llama3');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('amk_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('amk_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist project changes
  useEffect(() => {
    localStorage.setItem('amk_qda_project_data_v2', JSON.stringify(project));
  }, [project]);

  // Ensure valid selectedDocId
  useEffect(() => {
    if (!project.documents.some((d) => d.id === selectedDocId) && project.documents.length > 0) {
      setSelectedDocId(project.documents[0].id);
    }
  }, [project.documents, selectedDocId]);

  // Run Automated AI Analysis
  const handleRunAnalysis = async () => {
    if (project.documents.length === 0) {
      alert('Bitte lade zuerst mindestens ein Interview-Transkript hoch.');
      return;
    }

    setIsAnalyzing(true);
    setIsProgressModalOpen(true);

    try {
      const response = await fetch('/api/qda/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: project.documents,
          currentCategories: project.categories,
          currentCodes: project.codes,
          engineMode,
          ollamaModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server antwortete mit Status ${response.status}`);
      }

      const data = await response.json();

      setProject((prev) => ({
        ...prev,
        categories: data.categories || prev.categories,
        codes: data.codes || prev.codes,
        codedSegments: data.codedSegments || prev.codedSegments,
        synthesisReport: data.synthesis || prev.synthesisReport,
      }));
    } catch (err: any) {
      console.error('Analysefehler:', err);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setIsProgressModalOpen(false), 800);
    }
  };

  // Add uploaded documents
  const handleAddDocuments = (newDocs: InterviewDocument[]) => {
    setProject((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newDocs],
    }));
    if (newDocs[0]) {
      setSelectedDocId(newDocs[0].id);
    }
  };

  // Delete an interview document
  const handleDeleteDoc = (docId: string) => {
    setProject((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
      codedSegments: prev.codedSegments.filter((s) => s.documentId !== docId),
      memos: prev.memos.filter((m) => m.documentId !== docId),
    }));
  };

  // Code System Handlers
  const handleAddCode = (newCodeData: Partial<Code>) => {
    const newCode: Code = {
      id: `code-user-${Date.now()}`,
      name: newCodeData.name || 'Neuer Code',
      description: newCodeData.description || '',
      categoryId: newCodeData.categoryId || project.categories[0]?.id || 'cat-1',
      color: newCodeData.color || '#10b981',
      frequency: 0,
    };

    setProject((prev) => ({
      ...prev,
      codes: [...prev.codes, newCode],
      categories: prev.categories.map((cat) =>
        cat.id === newCode.categoryId
          ? { ...cat, subCodeIds: [...cat.subCodeIds, newCode.id] }
          : cat
      ),
    }));
  };

  const handleEditCode = (updatedCode: Code) => {
    setProject((prev) => ({
      ...prev,
      codes: prev.codes.map((c) => (c.id === updatedCode.id ? updatedCode : c)),
      // If category changed, update category subCodeIds
      categories: prev.categories.map((cat) => {
        const hasCode = cat.subCodeIds.includes(updatedCode.id);
        if (cat.id === updatedCode.categoryId && !hasCode) {
          return { ...cat, subCodeIds: [...cat.subCodeIds, updatedCode.id] };
        }
        if (cat.id !== updatedCode.categoryId && hasCode) {
          return { ...cat, subCodeIds: cat.subCodeIds.filter((id) => id !== updatedCode.id) };
        }
        return cat;
      }),
    }));
  };

  const handleDeleteCode = (codeId: string) => {
    setProject((prev) => ({
      ...prev,
      codes: prev.codes.filter((c) => c.id !== codeId),
      codedSegments: prev.codedSegments.filter((s) => s.codeId !== codeId),
      categories: prev.categories.map((cat) => ({
        ...cat,
        subCodeIds: cat.subCodeIds.filter((id) => id !== codeId),
      })),
    }));
    if (activeCodeFilter === codeId) {
      setActiveCodeFilter(null);
    }
  };

  // Coded Segments Handlers (with retroactive editing)
  const handleDeleteSegment = (segmentId: string) => {
    setProject((prev) => {
      const segToDelete = prev.codedSegments.find((s) => s.id === segmentId);
      const updatedSegments = prev.codedSegments.filter((s) => s.id !== segmentId);
      const updatedCodes = prev.codes.map((c) => {
        if (segToDelete && c.id === segToDelete.codeId) {
          return { ...c, frequency: Math.max(0, c.frequency - 1) };
        }
        return c;
      });

      return {
        ...prev,
        codedSegments: updatedSegments,
        codes: updatedCodes,
      };
    });
  };

  const handleEditSegment = (updatedSeg: CodedSegment) => {
    setProject((prev) => {
      const updatedSegments = prev.codedSegments.map((s) =>
        s.id === updatedSeg.id ? updatedSeg : s
      );

      // Recalculate code frequencies
      const updatedCodes = prev.codes.map((c) => ({
        ...c,
        frequency: updatedSegments.filter((s) => s.codeId === c.id).length,
      }));

      return {
        ...prev,
        codedSegments: updatedSegments,
        codes: updatedCodes,
      };
    });
  };

  const handleAddManualSegment = (segmentData: Omit<CodedSegment, 'id'>) => {
    const newSegment: CodedSegment = {
      ...segmentData,
      id: `seg-manual-${Date.now()}`,
    };

    setProject((prev) => {
      const updatedSegments = [...prev.codedSegments, newSegment];
      const updatedCodes = prev.codes.map((c) =>
        c.id === newSegment.codeId ? { ...c, frequency: c.frequency + 1 } : c
      );

      return {
        ...prev,
        codedSegments: updatedSegments,
        codes: updatedCodes,
      };
    });
  };

  // Memos Handlers
  const handleAddMemo = (memoData: Omit<Memo, 'id' | 'createdAt'>) => {
    const newMemo: Memo = {
      ...memoData,
      id: `memo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setProject((prev) => ({
      ...prev,
      memos: [newMemo, ...prev.memos],
    }));
  };

  const handleDeleteMemo = (memoId: string) => {
    setProject((prev) => ({
      ...prev,
      memos: prev.memos.filter((m) => m.id !== memoId),
    }));
  };

  // Reset to initial AMK project
  const handleResetProject = () => {
    if (
      confirm(
        'Projekt auf die ursprünglichen 6 anonymisierten AMK-Interviews (S1–S6) zurücksetzen?'
      )
    ) {
      setProject(INITIAL_PROJECT);
      setSelectedDocId('doc-1');
      setActiveCodeFilter(null);
      localStorage.removeItem('amk_qda_project_data_v2');
    }
  };

  const currentDocument =
    project.documents.find((d) => d.id === selectedDocId) || project.documents[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased select-text">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunAnalysis={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
        onOpenExport={() => setIsExportOpen(true)}
        onResetProject={handleResetProject}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        engineMode={engineMode}
        onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
      />

      {/* Main Workbench Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Sidebar: Document System (top) & Code System (bottom) */}
        {activeTab === 'browser' && (
          <aside
            className={`no-print transition-all duration-300 ease-in-out shrink-0 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-10 ${
              isSidebarOpen ? 'w-64 md:w-72' : 'w-0 overflow-hidden border-r-0'
            }`}
          >
            {/* Top half: Document System */}
            <div className="h-1/2 overflow-hidden flex flex-col">
              <DocumentSystem
                documents={project.documents}
                selectedDocId={selectedDocId}
                onSelectDoc={setSelectedDocId}
                onOpenUpload={() => setIsUploadOpen(true)}
                onDeleteDoc={handleDeleteDoc}
                codedSegments={project.codedSegments}
              />
            </div>

            {/* Bottom half: Code System */}
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
              />
            </div>
          </aside>
        )}

        {/* Sidebar Collapse Toggle Button */}
        {activeTab === 'browser' && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="no-print absolute top-3 left-2 z-20 p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
            style={{ left: isSidebarOpen ? 'calc(16rem + 8px)' : '8px' }}
            title={isSidebarOpen ? 'Seitenleiste einklappen' : 'Seitenleiste ausklappen'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-500" />}
          </button>
        )}

        {/* Center / Viewport Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950">
          {activeTab === 'browser' && currentDocument && (
            <DocumentBrowser
              document={currentDocument}
              codes={project.codes}
              categories={project.categories}
              codedSegments={project.codedSegments}
              activeCodeFilter={activeCodeFilter}
              onSelectCodeFilter={setActiveCodeFilter}
              onDeleteSegment={handleDeleteSegment}
              onEditSegment={handleEditSegment}
              onAddManualSegment={handleAddManualSegment}
            />
          )}

          {activeTab === 'sentiment' && (
            <SentimentView
              documents={project.documents}
              selectedDocId={selectedDocId}
              onSelectDoc={setSelectedDocId}
            />
          )}

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
            <CodeMatrixBrowser
              categories={project.categories}
              codes={project.codes}
              codedSegments={project.codedSegments}
              documents={project.documents}
            />
          )}

          {activeTab === 'memos' && (
            <MemosPanel
              memos={project.memos}
              documents={project.documents}
              codes={project.codes}
              onAddMemo={handleAddMemo}
              onDeleteMemo={handleDeleteMemo}
            />
          )}

          {activeTab === 'synthesis' && (
            <SynthesisReport
              project={project}
              onRegenerateSynthesis={handleRunAnalysis}
              isGenerating={isAnalyzing}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onNavigateToReport={() => setActiveTab('synthesis')}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddDocuments={handleAddDocuments}
      />

      <AnalysisProgressModal
        isOpen={isProgressModalOpen}
        onFinished={() => setIsProgressModalOpen(false)}
        engineMode={engineMode}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        engineMode={engineMode}
        onSelectEngineMode={setEngineMode}
        ollamaModel={ollamaModel}
        onSelectOllamaModel={setOllamaModel}
      />
    </div>
  );
}
