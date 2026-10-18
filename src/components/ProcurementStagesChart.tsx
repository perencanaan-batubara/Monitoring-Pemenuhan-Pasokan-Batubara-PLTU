import React from 'react';
import type { ProcurementStageCount } from '../utils/coalCalculations.ts';
import { Briefcase, ChevronRight, FileText } from 'lucide-react';

interface ProcurementStagesChartProps {
  stages: ProcurementStageCount[];
  onSelectStage: (stageName: string) => void;
}

export const ProcurementStagesChart: React.FC<ProcurementStagesChartProps> = ({
  stages,
  onSelectStage,
}) => {
  // Max count for scale
  const maxCount = 45;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Tahapan Pengadaan
            </h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              e-Procurement PLN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Jumlah paket berdasarkan dokumen terakhir pada tabel pengadaan batubara
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Satuan: <strong className="text-slate-800">Paket Pengadaan</strong>
        </span>
      </div>

      {/* Horizontal bar representation matching Image 5 */}
      <div className="mt-6 space-y-4">
        {/* Top scale ticks matching image 5: 0, 11.25, 22.5, 33.75, 45 */}
        <div className="pl-36 pr-8 flex justify-between text-[10px] text-slate-400 font-mono border-b border-slate-100 pb-1">
          <span>0</span>
          <span>11,25</span>
          <span>22,5</span>
          <span>33,75</span>
          <span>45</span>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => {
            const widthPercent = Math.min(100, Math.max(3, (stage.count / maxCount) * 100));
            const isGagal = stage.tahap === 'Pengadaan gagal';

            return (
              <div
                key={stage.tahap}
                onClick={() => onSelectStage(stage.tahap)}
                className="group flex items-center cursor-pointer hover:bg-slate-50/80 p-1.5 rounded-lg transition-colors"
              >
                {/* Stage Label */}
                <div className="w-36 text-right pr-4 text-xs font-semibold text-slate-700 group-hover:text-[#0070BA] transition-colors truncate">
                  {stage.tahap}
                </div>

                {/* Bar */}
                <div className="flex-1 pr-6 flex items-center">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 group-hover:brightness-110 ${
                        isGagal
                          ? 'bg-rose-500'
                          : stage.tahap === 'Kontrak'
                          ? 'bg-emerald-600'
                          : 'bg-[#3b5d75]'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>

                {/* Count badge */}
                <div className="w-8 text-right font-extrabold text-xs text-slate-900 group-hover:text-[#0070BA]">
                  {stage.count}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0070BA] transition-colors ml-1" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Klik salah satu tahapan di atas untuk membuka daftar dokumen &amp; paket pengadaan</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          paket
        </span>
      </div>
    </div>
  );
};
