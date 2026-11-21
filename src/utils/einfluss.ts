/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodedSegment } from '../types/qda';

// Kennzahlen je Code für das Kausalmodell „Begebenheit → Wirkung auf Zugehörigkeit“.
// Schwere = Summe der Stärken (1–3); Stellen ohne Stärke zählen mit 1, neutrale mit 0.
export interface Einfluss {
  n: number; // alle Textstellen
  staerkt: number;
  schwaecht: number;
  ambivalent: number;
  neutral: number;
  ohne: number; // ohne Wirkungsbewertung
  ungeprueft: number;
  plus: number; // Schwere der stärkenden Stellen
  minus: number; // Schwere der schwächenden Stellen
  ambi: number; // Schwere der ambivalenten Stellen
  schwere: number; // Gesamtschwere = plus + minus + ambi
  netto: number; // plus − minus
}

export const gewicht = (s: CodedSegment) => (!s.wirkung || s.wirkung === 'neutral' ? 0 : s.staerke ?? 1);

export function einfluss(segs: CodedSegment[]): Einfluss {
  const e: Einfluss = { n: segs.length, staerkt: 0, schwaecht: 0, ambivalent: 0, neutral: 0, ohne: 0, ungeprueft: 0, plus: 0, minus: 0, ambi: 0, schwere: 0, netto: 0 };
  for (const s of segs) {
    if (s.geprueft === false) e.ungeprueft++;
    const g = gewicht(s);
    if (s.wirkung === 'staerkt') (e.staerkt++, (e.plus += g));
    else if (s.wirkung === 'schwaecht') (e.schwaecht++, (e.minus += g));
    else if (s.wirkung === 'ambivalent') (e.ambivalent++, (e.ambi += g));
    else if (s.wirkung === 'neutral') e.neutral++;
    else e.ohne++;
  }
  e.schwere = e.plus + e.minus + e.ambi;
  e.netto = e.plus - e.minus;
  return e;
}

// Kurzform für Tabellen, z. B. "+5 / −3"
export const kurz = (e: Einfluss) => (e.schwere === 0 ? '–' : `+${e.plus} / −${e.minus}${e.ambi ? ` / ±${e.ambi}` : ''}`);
