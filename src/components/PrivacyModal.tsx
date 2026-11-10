/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Cpu, Cloud, Check, AlertCircle, X, HelpCircle } from 'lucide-react';

export type EngineMode = 'local' | 'ollama' | 'cloud';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineMode: EngineMode;
  onSelectEngineMode: (mode: EngineMode) => void;
  ollamaModel: string;
  onSelectOllamaModel: (model: string) => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  engineMode,
  onSelectEngineMode,
  ollamaModel,
  onSelectOllamaModel,
}) => {
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
  const [ollamaModels, setOllamaModels] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Check if Ollama is running locally on port 11434
      fetch('/api/qda/ollama-status')
        .then((res) => res.json())
        .then((data) => {
          setIsOllamaAvailable(data.available);
          if (data.models && data.models.length > 0) {
            setOllamaModels(data.models);
          }
        })
        .catch(() => setIsOllamaAvailable(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Datenschutz & Lokale Ausführung
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transkripte verbleiben geschützt auf deinem Rechner (DSGVO-Konformität).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="my-4 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Keine Cloud-Übertragung:</strong> Deine Interviewtranskripte (S1–S6) enthalten sensible Primärdaten aus eurer Marktforschung. Im Standardmodus läuft die gesamte Mustererkennung, Codierung und Matrixberechnung zu <strong>100% lokal auf deinem Computer</strong>.
          </p>
        </div>

        {/* Engine Modes */}
        <div className="space-y-3">
          {/* Mode 1: 100% Local Heuristic (Default) */}
          <div
            onClick={() => onSelectEngineMode('local')}
            className={`p-4 rounded-xl border text-xs transition-all cursor-pointer ${
              engineMode === 'local'
                ? 'bg-emerald-500/10 border-emerald-500 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'bg-zinc-50/60 dark:bg-zinc-850/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm">
                  100% Lokale semantische Engine (Zero-Cloud)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Empfohlen
                </span>
              </div>
              {engineMode === 'local' && (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
              )}
            </div>
            <p className="mt-1.5 text-zinc-500 dark:text-zinc-400 pl-6.5 leading-relaxed">
              Läuft direkt in Node.js / Browser auf deinem macOS oder Linux. Kein Byte verlässt deinen Rechner. Funktioniert selbst im Flugmodus ohne Internet.
            </p>
          </div>

          {/* Mode 2: Local LLM via Ollama */}
          <div
            onClick={() => onSelectEngineMode('ollama')}
            className={`p-4 rounded-xl border text-xs transition-all cursor-pointer ${
              engineMode === 'ollama'
                ? 'bg-blue-500/10 border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'bg-zinc-50/60 dark:bg-zinc-850/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-sm">
                  Lokales Open-Source-LLM (via Ollama)
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isOllamaAvailable ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  {isOllamaAvailable ? 'Ollama bereit' : 'Port 11434'}
                </span>
              </div>
              {engineMode === 'ollama' && (
                <Check className="w-4 h-4 text-blue-500 font-bold" />
              )}
            </div>
            <p className="mt-1.5 text-zinc-500 dark:text-zinc-400 pl-6.5 leading-relaxed">
              Verbindet sich mit deinem lokalen Ollama-Dienst (`localhost:11434`). Nutzt Modelle wie <em>Llama 3</em>, <em>Mistral</em> oder <em>DeepSeek</em> rein auf deiner eigenen Hardware (Apple Silicon M1-M4 oder Linux GPU).
            </p>

            {engineMode === 'ollama' && (
              <div className="mt-3 pl-6.5 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Modell:
                </span>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => onSelectOllamaModel(e.target.value)}
                  placeholder="llama3, mistral, deepseek-r1:8b"
                  className="px-2 py-1 text-xs rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* Mode 3: Cloud Gemini */}
          <div
            onClick={() => onSelectEngineMode('cloud')}
            className={`p-4 rounded-xl border text-xs transition-all cursor-pointer opacity-75 hover:opacity-100 ${
              engineMode === 'cloud'
                ? 'bg-purple-500/10 border-purple-500 text-zinc-900 dark:text-zinc-100'
                : 'bg-zinc-50/60 dark:bg-zinc-850/40 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm">
                  Cloud-KI (Google Gemini API)
                </span>
              </div>
              {engineMode === 'cloud' && (
                <Check className="w-4 h-4 text-purple-400 font-bold" />
              )}
            </div>
            <p className="mt-1.5 text-zinc-500 dark:text-zinc-400 pl-6.5 leading-relaxed">
              Nur empfohlen für synthetische Testinterviews, bei denen kein Datenschutz oder Vertraulichkeitsvertrag besteht.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
          >
            Auswahl übernehmen
          </button>
        </div>
      </div>
    </div>
  );
};
