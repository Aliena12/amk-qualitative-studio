/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LabelStat } from '../utils/transcript';
import { Speaker } from '../types/qda';

interface SpeakerTableProps {
  labels: LabelStat[];
  roles: Record<string, Speaker>;
  onChange: (label: string, role: Speaker) => void;
}

// Zuordnung der Sprecherkürzel im Transkript (z. B. "F", "R", "Interviewte Person") zu den Rollen
export const SpeakerTable: React.FC<SpeakerTableProps> = ({ labels, roles, onChange }) => {
  if (labels.length === 0) {
    return <p className="text-[11px] text-zinc-400">Keine Sprecherkürzel erkannt – der Text wird komplett als Aussage der befragten Person behandelt.</p>;
  }
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full text-[11px]">
        <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          <tr>
            <th className="text-left p-1.5">Kürzel</th>
            <th className="text-right p-1.5">Beiträge</th>
            <th className="text-left p-1.5">Beispiel</th>
            <th className="text-left p-1.5">Rolle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {labels.map((l) => (
            <tr key={l.label}>
              <td className="p-1.5 font-mono font-bold">{l.label}</td>
              <td className="p-1.5 text-right font-mono tabular-nums">{l.count}</td>
              <td className="p-1.5 text-zinc-400 max-w-[200px] truncate" title={l.sample}>{l.sample || '–'}</td>
              <td className="p-1.5">
                <select
                  value={roles[l.label] ?? l.role}
                  onChange={(e) => onChange(l.label, e.target.value as Speaker)}
                  className="px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  <option value="Befragter">Befragte Person</option>
                  <option value="Interviewer">Interviewer:in</option>
                  <option value="System">Metadaten (nicht codierbar)</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
