import React from 'react';
import type { SpecBreakdownResult } from '../utils/coalCalculations.ts';
import { Layers, AlertTriangle, CheckCircle } from 'lucide-react';

interface SpecBreakdownChartProps {
  specData: SpecBreakdownResult;
  onSelectSpec?: (specCategory: 'MRC_HRC' | 'LRC') => void;
}

export const SpecBreakdownChart: React.FC<SpecBreakdownChartProps> = ({
  specData,
  onSelectSpec,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs sm:text-sm text-[#004e7c] tracking-tight uppercase leading-snug">
            HASIL PEMENUHAN KEBUTUHAN BATUBARA SESUAI SPESIFIKASI
          </h3>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            MT
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Disparitas pemenuhan kalori tinggi/menengah (MRC &amp; HRC) vs kalori rendah (LRC)
        </p>
      </div>

      {/* Chart representation matching Image 1 */}
      <div className="grid grid-cols-2 gap-6 my-4 px-2">
        {/* Column 1: MRC & HRC */}
        <div 
          onClick={() => onSelectSpec && onSelectSpec('MRC_HRC')}
          className="flex flex-col items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {/* Top header stats */}
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-slate-800 block">
              {specData.mrcHrc.kebutuhanJtMt.toLocaleString('id-ID')} jt MT
            </span>
            <span className="text-[10px] text-sky-700 font-semibold">
              Konfirmasi: {specData.mrcHrc.konfirmasiJtMt.toLocaleString('id-ID')} jt MT
            </span>
          </div>

          {/* Graphical container: Kebutuhan border box with Konfirmasi fill */}
          <div className="w-28 h-40 border-2 border-[#125875] rounded-t-md relative flex flex-col justify-end bg-sky-50/30 overflow-hidden shadow-2xs group-hover:border-[#0070BA] transition-colors">
            {/* Fill level representing 72% */}
            <div 
              className="w-full bg-[#bde0f2] border-t-2 border-[#79b4d6] transition-all duration-500 flex items-center justify-center relative"
              style={{ height: `${Math.min(100, specData.mrcHrc.pemenuhanPercent)}%` }}
            >
              <span className="text-xl sm:text-2xl font-black text-[#0f4b63]">
                {specData.mrcHrc.pemenuhanPercent}%
              </span>
            </div>
          </div>

          {/* Category label */}
          <div className="mt-3 text-center">
            <span className="font-extrabold text-xs text-slate-800 tracking-wide block">
              MRC &amp; HRC
            </span>
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <AlertTriangle className="w-3 h-3" />
              <span>Defisit -{Math.abs(specData.mrcHrc.selisihJtMt).toLocaleString('id-ID')} jt MT</span>
            </div>
          </div>
        </div>

        {/* Column 2: LRC */}
        <div 
          onClick={() => onSelectSpec && onSelectSpec('LRC')}
          className="flex flex-col items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {/* Top header stats */}
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-slate-800 block">
              {specData.lrc.kebutuhanJtMt.toLocaleString('id-ID')} jt MT
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Konfirmasi: {specData.lrc.konfirmasiJtMt.toLocaleString('id-ID')} jt MT
            </span>
          </div>

          {/* Graphical container for LRC (Surplus 203%) */}
          <div className="w-28 h-40 border-2 border-[#125875] rounded-t-md relative flex flex-col justify-end bg-emerald-50/40 overflow-hidden shadow-2xs group-hover:border-emerald-600 transition-colors">
            {/* Fill full because > 100% */}
            <div 
              className="w-full bg-[#a7e4ca] border-t-2 border-emerald-500 h-full flex items-center justify-center relative"
            >
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-900 block">
                  {specData.lrc.pemenuhanPercent}%
                </span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Surplus
                </span>
              </div>
            </div>
          </div>

          {/* Category label */}
          <div className="mt-3 text-center">
            <span className="font-extrabold text-xs text-slate-800 tracking-wide block">
              LRC
            </span>
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              <span>Surplus +{specData.lrc.selisihJtMt.toLocaleString('id-ID')} jt MT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend footer matching image 1 */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-[#125875] bg-transparent inline-block rounded-2xs"></span>
          <span className="text-[11px] font-medium">Kebutuhan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-[#bde0f2] inline-block rounded-2xs"></span>
          <span className="text-[11px] font-medium">Konfirmasi</span>
        </div>
      </div>
    </div>
  );
};
