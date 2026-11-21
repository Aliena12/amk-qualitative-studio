/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wirkung, WIRKUNG_LABEL, WIRKUNG_ZEICHEN } from '../types/qda';

// Farbe je Wirkungsrichtung (auch in Matrix und Bericht verwendet)
export const WIRKUNG_FARBE: Record<Wirkung, string> = {
  staerkt: '#059669',
  schwaecht: '#e11d48',
  ambivalent: '#d97706',
  neutral: '#71717a',
};

interface Props {
  wirkung?: Wirkung;
  staerke?: 1 | 2 | 3;
  onChange: (w: Wirkung | undefined, s: 1 | 2 | 3 | undefined) => void;
  compact?: boolean; // kleine Variante für das Markier-Fenster
}

// Auswahl: Wie wirkt die Begebenheit auf die Zugehörigkeit (Richtung) und wie stark (Schwere 1–3)?
export const WirkungPicker: React.FC<Props> = ({ wirkung, staerke, onChange, compact }) => {
  const btn = 'px-1.5 py-0.5 rounded border text-[11px] font-semibold cursor-pointer transition-colors';
  const ohneStaerke = !wirkung || wirkung === 'neutral';
  return (
    <div className={`flex items-center gap-1 ${compact ? '' : 'flex-wrap'}`}>
      {(Object.keys(WIRKUNG_LABEL) as Wirkung[]).map((w) => {
        const on = wirkung === w;
        return (
          <button
            key={w}
            type="button"
            onClick={() => onChange(on ? undefined : w, on || w === 'neutral' ? undefined : staerke ?? 2)}
            className={`${btn} ${on ? 'text-white' : 'text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}
            style={on ? { backgroundColor: WIRKUNG_FARBE[w], borderColor: WIRKUNG_FARBE[w] } : undefined}
            title={`Wirkung auf Zugehörigkeit: ${WIRKUNG_LABEL[w]}`}
          >
            {compact ? WIRKUNG_ZEICHEN[w] : `${WIRKUNG_ZEICHEN[w]} ${WIRKUNG_LABEL[w]}`}
          </button>
        );
      })}
      <span className="mx-1 text-zinc-300 dark:text-zinc-700">|</span>
      {([1, 2, 3] as const).map((s) => (
        <button
          key={s}
          type="button"
          disabled={ohneStaerke}
          onClick={() => onChange(wirkung, s)}
          className={`${btn} disabled:opacity-30 ${
            staerke === s && !ohneStaerke
              ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
          }`}
          title={['', 'Stärke 1: geringer Einfluss', 'Stärke 2: mittlerer Einfluss', 'Stärke 3: starker Einfluss'][s]}
        >
          {s}
        </button>
      ))}
    </div>
  );
};
