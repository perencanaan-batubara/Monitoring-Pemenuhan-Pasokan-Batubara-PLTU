import React from 'react';
import type { SuratComplianceResult } from '../utils/coalCalculations.ts';
import { Mail, CheckCircle2, AlertOctagon } from 'lucide-react';

interface ComplianceSuratChartProps {
  complianceData: SuratComplianceResult[];
  selectedSurat: string | null;
  onSelectSurat: (surat: string | null) => void;
}

export const ComplianceSuratChart: React.FC<ComplianceSuratChartProps> = ({
  complianceData,
  selectedSurat,
  onSelectSurat,
}) => {
  // Max scale for y-axis
  const maxVolume = 75; // jt MT

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0a5375]">
            Kepatuhan Sumber Tambang Penugasan 2026 (MT)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tingkat pemenuhan konfirmasi terhadap surat penugasan resmi Ditjen Minerba Kementerian ESDM
          </p>
        </div>

        {/* Legend matching Image 2 */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#1a5b78]"></span>
            <span className="text-slate-700">Penugasan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#e46c2b]"></span>
            <span className="text-slate-700">Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 relative overflow-x-auto pb-4">
        <div className="min-w-[560px] h-[280px] flex items-end justify-around px-4 border-b border-slate-200">
          {complianceData.map((item) => {
            const isSelected = selectedSurat === item.surat;
            const penugasanHeight = Math.min(100, (item.penugasanJtMt / maxVolume) * 100);
            const konfirmasiHeight = Math.min(100, (item.konfirmasiJtMt / maxVolume) * 100);

            return (
              <div
                key={item.surat}
                onClick={() => onSelectSurat(isSelected ? null : item.surat)}
                className={`flex flex-col items-center cursor-pointer group px-3 py-2 rounded-lg transition-all ${
                  isSelected ? 'bg-sky-50 ring-2 ring-[#0070BA]' : 'hover:bg-slate-50'
                }`}
              >
                {/* Ratio Label above bar matching image 2: e.g. 50,69 / 68,80 jt MT */}
                <div className="text-center mb-2">
                  <span className="text-xs font-black text-slate-800 tracking-tight">
                    {item.konfirmasiJtMt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {' / '}
                    {item.penugasanJtMt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} jt MT
                  </span>
                </div>

                {/* Stacked / Overlay Bar representation matching Image 2 */}
                <div className="w-24 h-48 relative flex items-end justify-center">
                  {/* Penugasan bar (Dark teal background / top) */}
                  <div
                    className="w-20 rounded-t-sm bg-[#1a5b78] absolute bottom-0 transition-all duration-300 group-hover:brightness-110 flex flex-col justify-start items-center pt-2"
                    style={{ height: `${penugasanHeight}%` }}
                  >
                    {/* Konfirmasi overlay bar (Orange front fill) */}
                    <div
                      className="w-full rounded-t-sm bg-[#e46c2b] absolute bottom-0 transition-all duration-500 group-hover:brightness-105 flex items-center justify-center shadow-inner"
                      style={{ height: `${(konfirmasiHeight / penugasanHeight) * 100}%` }}
                    >
                      {/* Percentage inside orange block */}
                      {item.kepatuhanPercent > 0 && (
                        <span className="text-lg sm:text-xl font-black text-white drop-shadow-xs">
                          {item.kepatuhanPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 0% indicator if konfirmasi is 0 */}
                  {item.kepatuhanPercent === 0 && (
                    <div className="absolute bottom-2 inset-x-0 text-center z-10">
                      <span className="text-base font-black text-rose-300">
                        0%
                      </span>
                    </div>
                  )}
                </div>

                {/* Surat Label */}
                <div className="mt-3 text-center">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                    {item.surat}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.countTambang} sumber tambang
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter notification / guidance */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-[#0070BA]" />
          <span>
            {selectedSurat 
              ? `Menampilkan filter surat ${selectedSurat}. Klik kembali untuk reset filter.`
              : 'Klik surat penugasan di atas untuk memfilter daftar tambang dan PLTU terkait.'}
          </span>
        </div>
        {selectedSurat && (
          <button
            type="button"
            onClick={() => onSelectSurat(null)}
            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Hapus Filter
          </button>
        )}
      </div>
    </div>
  );
};
