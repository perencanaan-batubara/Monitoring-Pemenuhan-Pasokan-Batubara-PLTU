import React from 'react';
import type { OverallKPIs } from '../types/coal.ts';

interface DonutConfirmationChartProps {
  kpis: OverallKPIs;
  onClick?: () => void;
}

export const DonutConfirmationChart: React.FC<DonutConfirmationChartProps> = ({
  kpis,
  onClick,
}) => {
  // Percentage of confirmation vs demand
  const percent = kpis.persentaseKonfirmasiVsKebutuhan || 122.3;
  
  // Circumference for SVG circle (r = 54)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Cap visual stroke at 100% or loop
  const strokeDashoffset = circumference - Math.min(1, percent / 100) * circumference;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <h3 className="text-center font-bold text-xs sm:text-sm text-[#004e7c] tracking-tight uppercase px-2 leading-snug">
          KONFIRMASI PENUGASAN DITJEN MINERBA TERHADAP KEBUTUHAN TAHUN 2026
        </h3>
        <p className="text-[11px] text-slate-400 text-center mt-1">
          Rasio konfirmasi tambang terhadap total baseline kebutuhan nasional
        </p>
      </div>

      {/* Donut representation matching Image 1 */}
      <div className="relative flex items-center justify-center my-6">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 130 130">
          {/* Background circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="20"
            fill="transparent"
          />
          {/* Foreground colored arc */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="#0a5375"
            strokeWidth="20"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-[#0a5375] tracking-tight">
            {percent.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Terpenuhi
          </span>
        </div>
      </div>

      {/* Legend matching image 1 */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#0a5375]"></span>
          <span className="text-slate-700 font-semibold text-[11px]">Konfirmasi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#e2e8f0]"></span>
          <span className="text-slate-500 text-[11px]">Selisih Konfirmasi Terhadap Kebutuhan</span>
        </div>
      </div>
    </div>
  );
};
