/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { EngineMode } from './PrivacyModal';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onFinished: () => void;
  engineMode?: EngineMode;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  onFinished,
  engineMode = 'local',
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const engineLabel =
    engineMode === 'local'
      ? '100% Lokale Offline-Engine (Zero-Cloud)'
      : engineMode === 'ollama'
      ? 'Lokales LLM via Ollama (localhost:11434)'
      : 'Cloud-KI (Gemini)';

  const steps = [
    {
      num: 1,
      title: 'Textsegmentierung & Sprechertrennung',
      desc: 'Extrahieren von Interviewer-Fragen und Probanden-Antworten mit Paragraphen-Indizierung.',
    },
    {
      num: 2,
      title: `Stufe 1: Induktives offenes Codieren (${engineLabel})`,
      desc: 'Semantische Mustererkennung, Identifikation empirischer Codes und Zitatextraktion ohne Datenabfluss.',
    },
    {
      num: 3,
      title: 'Stufe 2: Axiales Codieren & Überkategorien-Reduktion',
      desc: 'Thematische Verdichtung auf 4 analytische Hauptdimensionen mit Farbcodierung.',
    },
    {
      num: 4,
      title: 'Synthese & Matrix-Generierung (MAXMaps & Matrix)',
      desc: 'Berechnung der Häufigkeitsverteilung im Code-Matrix-Browser und Sentiment-Zuordnung.',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      return;
    }

    const t1 = setTimeout(() => setCurrentStep(2), 600);
    const t2 = setTimeout(() => setCurrentStep(3), 1600);
    const t3 = setTimeout(() => setCurrentStep(4), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Automatisierte AMK Qualitative Inhaltsanalyse</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                100% Lokal
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Zweistufige Analyse nach Philipp Mayring (2015) & Grounded Theory
            </p>
          </div>
        </div>

        <div className="py-5 space-y-3.5">
          {steps.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-transparent'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[9px] text-zinc-500">
                      {s.num}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isDone
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400 dark:text-zinc-600'
                    }`}
                  >
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Kein Datenabfluss: Verarbeitet Primärdaten geschützt auf deiner Maschine.</span>
        </div>
      </div>
    </div>
  );
};
