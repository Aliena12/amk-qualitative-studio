/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types/qda';
import { FileText, Network, Grid3X3, BookOpen, Lightbulb, FileDown, Download, Moon, Sun, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenExport: () => void;
  onOpenInfo: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const TABS: { id: ActiveTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'browser', label: 'Codieren', icon: FileText, color: 'text-emerald-500' },
  { id: 'concept_map', label: 'Konzept-Map', icon: Network, color: 'text-blue-500' },
  { id: 'code_matrix', label: 'Code-Matrix', icon: Grid3X3, color: 'text-amber-500' },
  { id: 'hypotheses', label: 'Hypothesen', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'memos', label: 'Memos & KI-Doku', icon: BookOpen, color: 'text-purple-500' },
  { id: 'synthesis', label: 'Ergebnisbericht', icon: FileDown, color: 'text-indigo-400' },
];

export const Header: React.FC<HeaderProps> = ({ projectName, activeTab, onTabChange, onOpenExport, onOpenInfo, isDarkMode, onToggleDarkMode }) => (
  <header className="flex items-center justify-between gap-4 px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 z-30">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0">AMK</div>
      <button onClick={onOpenInfo} className="min-w-0 text-left cursor-pointer" title="Projekttitel, Forschungsfrage und Autor:innen bearbeiten">
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 block leading-none truncate max-w-[260px]">{projectName}</span>
        <span className="text-[10px] text-zinc-400 block mt-0.5">Interviewauswertung · Projektdaten bearbeiten</span>
      </button>
      <span
        className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shrink-0"
        title="Transkripte bleiben auf diesem Rechner (Ordner data/). Es werden keine Daten an externe Dienste gesendet."
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Nur lokal gespeichert
      </span>
    </div>

    <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
      {TABS.map(({ id, label, icon: Icon, color }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === id ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span>{label}</span>
        </button>
      ))}
    </nav>

    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onOpenExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-zinc-200/50 dark:border-zinc-800"
      >
        <Download className="w-3.5 h-3.5 text-zinc-500" />
        <span>Export & Archiv</span>
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
