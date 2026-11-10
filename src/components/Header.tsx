/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types/qda';
import {
  FileText,
  Activity,
  Network,
  Grid3X3,
  BookOpen,
  Sparkles,
  Download,
  Moon,
  Sun,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { EngineMode } from './PrivacyModal';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onOpenExport: () => void;
  onResetProject: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  engineMode: EngineMode;
  onOpenPrivacyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunAnalysis,
  isAnalyzing,
  onOpenExport,
  onResetProject,
  isDarkMode,
  onToggleDarkMode,
  engineMode,
  onOpenPrivacyModal,
}) => {
  const privacyLabels = {
    local: { label: '100% Lokal (Zero-Cloud)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    ollama: { label: 'Ollama Lokal (Port 11434)', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    cloud: { label: 'Cloud-Modus (Gemini)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  };

  const currentPrivacy = privacyLabels[engineMode] || privacyLabels.local;

  return (
    <header className="flex items-center justify-between gap-4 px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors shrink-0 z-30">
      {/* Zone 1: Brand Wordmark & Privacy Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
          AMK
        </div>
        <div className="min-w-0">
          <a
            href="/"
            className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap block leading-none"
          >
            AMK Qualitative Studio
          </a>
          <span className="text-[10px] text-zinc-400 block tracking-normal mt-0.5">
            MAXQDA AI Edition
          </span>
        </div>

        {/* Clickable Privacy Shield Badge */}
        <button
          onClick={onOpenPrivacyModal}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all hover:scale-105 cursor-pointer ${currentPrivacy.color}`}
          title="Datenschutz-Einstellungen & Lokale Offline-Engine konfigurieren"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{currentPrivacy.label}</span>
        </button>
      </div>

      {/* Zone 2: Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
        <button
          onClick={() => onTabChange('browser')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'browser'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span>Dokumente</span>
        </button>

        <button
          onClick={() => onTabChange('sentiment')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'sentiment'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-rose-500" />
          <span>Sentiment-Verlauf</span>
        </button>

        <button
          onClick={() => onTabChange('concept_map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'concept_map'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-blue-500" />
          <span>Konzept-Map</span>
        </button>

        <button
          onClick={() => onTabChange('code_matrix')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'code_matrix'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5 text-amber-500" />
          <span>Code-Matrix</span>
        </button>

        <button
          onClick={() => onTabChange('memos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'memos'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
          <span>Memos & Audit</span>
        </button>

        <button
          onClick={() => onTabChange('synthesis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'synthesis'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ergebnisbericht</span>
        </button>
      </nav>

      {/* Zone 3: Actions & Fully Visible KI Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          title="Automatisierte qualitative Inhaltsanalyse nach Mayring starten"
        >
          <Play className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analysiere...' : 'KI-Analyse starten'}</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-zinc-200/50 dark:border-zinc-800"
          title="Ergebnisse exportieren (Word / PDF / CSV / JSON)"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export</span>
        </button>

        <button
          onClick={onResetProject}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          title="S1–S6 Benchmark-Daten wiederherstellen"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
        </button>
      </div>
    </header>
  );
};
