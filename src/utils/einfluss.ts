/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodedSegment } from '../types/qda';

// Schwere je Code = Anzahl der Nennungen (codierte Textstellen); keine Abstufung, kein Durchschnitt
export interface Einfluss {
  schwere: number; // Anzahl Textstellen
  interviews: number; // in wie vielen Interviews genannt
  ungeprueft: number;
}

export function einfluss(segs: CodedSegment[]): Einfluss {
  return {
    schwere: segs.length,
    interviews: new Set(segs.map((s) => s.documentId)).size,
    ungeprueft: segs.filter((s) => s.geprueft === false).length,
  };
}
