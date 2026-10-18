import React, { useState } from 'react';
import type { WaterfallItem } from '../utils/coalCalculations.ts';
import { Info, MousePointerClick, Equal, Plus } from 'lucide-react';

interface WaterfallProcurementChartProps {
  items: WaterfallItem[];
  onBarClick: (item: WaterfallItem) => void;
}

export const WaterfallProcurementChart: React.FC<WaterfallProcurementChartProps> = ({
  items,
  onBarClick,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Maximum value for scale
  const maxVal = 160;
  const plotHeight = 220; // height in px of plotting area from 0 to 160 jt MT
  const baselineBottom = 58; // px from bottom where 0 jt MT baseline sits
  const chartHeight = 340; // total px height of chart area

  // Compute Konfirmasi top level for horizontal equality guide line
  const konfirmasiItem = items.find((i) => i.id === 'konfirmasi');
  const konfirmasiVal = konfirmasiItem ? konfirmasiItem.volumeJtMt : 112.53;
  const konfirmasiTopPx = baselineBottom + (konfirmasiVal / maxVal) * plotHeight;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Perencanaan Pasokan &amp; Proses Pengadaan
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 tracking-wider uppercase">
              WATERFALL &bull; MT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-[#0070BA]" />
            Klik batang untuk membuka notifikasi rincian sumber tambang dan volume.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-block w-3 h-3 rounded-xs bg-[#2b5070]"></span>
          <span className="text-[11px]">Kebutuhan &amp; Alokasi</span>
          <span className="inline-block w-3 h-3 rounded-xs bg-[#498563] ml-2"></span>
          <span className="text-[11px]">Akumulasi Pengadaan</span>
        </div>
      </div>

      {/* 2. Waterfall Formula Highlight Banner */}
      <div className="mt-3 p-3 bg-linear-to-r from-slate-50 via-emerald-50/40 to-slate-50 border border-slate-200/90 rounded-lg flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#0070BA] text-white uppercase tracking-wider">
            Akumulasi Waterfall
          </span>
          <div className="flex items-center flex-wrap gap-1 sm:gap-1.5 text-xs font-semibold text-slate-800">
            <span className="text-[#326145] bg-[#488562]/15 px-1.5 sm:px-2 py-0.5 rounded border border-[#488562]/30 font-bold">
              Terkontrak: 91,13
            </span>
            <Plus className="w-3 h-3 text-slate-400 stroke-[3]" />
            <span className="text-[#3b637d] bg-[#6995b0]/15 px-1.5 sm:px-2 py-0.5 rounded border border-[#6995b0]/30 font-bold">
              Dalam Proses: 13,81
            </span>
            <Plus className="w-3 h-3 text-slate-400 stroke-[3]" />
            <span className="text-[#8c6729] bg-[#be9350]/15 px-1.5 sm:px-2 py-0.5 rounded border border-[#be9350]/30 font-bold">
              Belum Dapat: 6,85
            </span>
            <Plus className="w-3 h-3 text-slate-400 stroke-[3]" />
            <span className="text-[#8e3830] bg-[#b8544a]/15 px-1.5 sm:px-2 py-0.5 rounded border border-[#b8544a]/30 font-bold">
              Tidak Dapat: 0,74
            </span>
            <Equal className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span className="text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-extrabold shadow-2xs">
              Total Konfirmasi: 112,53 jt MT
            </span>
          </div>
        </div>
        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          &bull; 100% Terpetakan
        </span>
      </div>

      {/* 3. Chart container */}
      <div className="mt-3 relative overflow-x-auto pb-1">
        <div 
          className="w-full min-w-[640px] relative flex flex-col justify-end"
          style={{ height: `${chartHeight}px` }}
        >
          {/* Sibling 1: Background grid lines */}
          <div className="absolute inset-x-0 inset-y-0 pointer-events-none text-slate-300">
            {[160, 120, 80, 40, 0].map((val) => {
              const bottomVal = baselineBottom + (val / maxVal) * plotHeight;
              return (
                <div 
                  key={val} 
                  className="absolute inset-x-0 flex items-center gap-2"
                  style={{ bottom: `${bottomVal}px` }}
                >
                  <span className="text-[10px] text-slate-400 w-10 text-right font-mono font-medium">
                    {val === 160 ? '160 jt' : val}
                  </span>
                  <div className={`flex-1 border-b ${val === 0 ? 'border-slate-300' : 'border-slate-100'}`}></div>
                </div>
              );
            })}
          </div>

          {/* Sibling 2: Dividers & Precise Horizontal Waterfall Alignment Guide Line */}
          <div className="absolute inset-0 pointer-events-none z-5">
            {/* Vertical divider separating Kebutuhan/Penugasan/Konfirmasi vs Akumulasi Pengadaan */}
            <div 
              className="absolute left-[43%] border-r-2 border-dashed border-slate-300 flex flex-col items-center"
              style={{ bottom: `${baselineBottom}px`, top: '10px' }}
            >
              <span className="bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 rounded border border-slate-200 mt-1 whitespace-nowrap shadow-2xs">
                Akumulasi status pengadaan
              </span>
            </div>

            {/* Horizontal guide line: starts at top of Konfirmasi (112,53) and ends exactly at top of Tidak Dapat Diproses (0,74) */}
            <div 
              className="absolute border-t-2 border-dashed border-emerald-500"
              style={{
                bottom: `${konfirmasiTopPx}px`,
                left: 'calc(35.7% + 24px)',
                right: 'calc(100% - (92.8% + 24px))',
              }}
            />
          </div>

          {/* Sibling 3: Bar items container (Main 7 Columns) */}
          <div className="relative pl-11 pr-2 flex items-end justify-between h-full z-10 gap-1.5 sm:gap-2">
            {items.map((item, idx) => {
              const base = item.baseJtMt ?? 0;
              const isHovered = hoveredId === item.id;
              const isLastAccumulation = item.id === 'tidak_dapat';

              // Precise pixel calculations
              const rawHeightPx = (item.volumeJtMt / maxVal) * plotHeight;
              
              // For Tidak Dapat Diproses (0,74), anchor its top exactly to konfirmasiTopPx
              const heightPx = isLastAccumulation ? Math.max(5, rawHeightPx) : Math.max(8, rawHeightPx);
              const topPx = isLastAccumulation ? konfirmasiTopPx : (baselineBottom + ((base + item.volumeJtMt) / maxVal) * plotHeight);
              const bottomPx = isLastAccumulation ? (konfirmasiTopPx - heightPx) : (baselineBottom + (base / maxVal) * plotHeight);

              // Step connector level to next bar (idx 3 -> 4, 4 -> 5, 5 -> 6)
              const showStepBridge = item.isAccumulationStage && idx >= 3 && idx < items.length - 1;
              const nextStepLevelPx = bottomPx + (isLastAccumulation ? heightPx : rawHeightPx);

              // Custom colors based on official PLN reporting palette
              const barColor = 
                item.id === 'kebutuhan' ? '#3d566e' :
                item.id === 'penugasan' ? '#3e6f8a' :
                item.id === 'konfirmasi' ? '#3e8476' :
                item.id === 'terkontrak' ? '#488562' :
                item.id === 'dalam_proses' ? '#6995b0' :
                item.id === 'belum_dapat' ? '#be9350' :
                '#b8544a';

              return (
                <div
                  key={item.id}
                  className="flex-1 flex flex-col items-center px-0.5 sm:px-1 h-full relative cursor-pointer group"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onBarClick(item)}
                >
                  {/* Step bridge connector spanning only between current bar and next bar */}
                  {showStepBridge && (
                    <div 
                      className="absolute border-t-2 border-dotted border-slate-400 z-0 pointer-events-none flex items-center justify-center"
                      style={{
                        bottom: `${nextStepLevelPx}px`,
                        left: 'calc(50% + 22px)',
                        width: 'calc(100% - 40px)',
                      }}
                    >
                      <span className="bg-white text-slate-500 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-extrabold border border-slate-300 -mt-1.5 shadow-2xs">
                        +
                      </span>
                    </div>
                  )}

                  {/* Child 1: Top value badge (Dynamically floats to sit right above the bar) */}
                  <div 
                    className={`absolute left-0 right-0 text-center transition-all duration-200 pointer-events-none z-20 ${
                      isHovered ? 'scale-110 -translate-y-1' : ''
                    }`}
                    style={{ bottom: `${topPx + 3}px` }}
                  >
                    <span className="font-extrabold text-xs sm:text-[13px] text-slate-900 block tracking-tight leading-tight">
                      {item.volumeJtMt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {item.percentageOfKonfirmasi !== undefined && (
                      <span className="text-[10px] font-bold text-slate-500 block leading-tight">
                        {item.percentageOfKonfirmasi.toFixed(2)}%
                      </span>
                    )}
                  </div>

                  {/* Child 2: The Bar itself (Positioned up via floating bottom position) */}
                  <div
                    className="w-full max-w-[46px] sm:max-w-[54px] transition-all duration-300 absolute left-1/2 -translate-x-1/2 group-hover:brightness-110 group-hover:shadow-md z-10"
                    style={{
                      bottom: `${bottomPx}px`,
                      height: `${heightPx}px`,
                      backgroundColor: barColor,
                      borderRadius: base > 0 ? '4px' : '5px 5px 0 0',
                    }}
                  >
                    {/* Inner sheen effect */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/15 to-transparent rounded-xs pointer-events-none" />
                    
                    {/* Hover indicator pill */}
                    {isHovered && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                        Klik rincian &rarr;
                      </div>
                    )}
                  </div>

                  {/* Child 3: Bottom label */}
                  <div className="w-full text-center h-14 flex flex-col justify-start absolute bottom-0 left-0 px-0.5">
                    <span className={`text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2 transition-colors ${
                      isHovered ? 'text-[#0070BA]' : 'text-slate-700'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Summary Footer bar */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-slate-700">
            <strong className="text-emerald-700 font-bold">Total Konfirmasi:</strong> Terkontrak (91,13) + Dalam Proses (13,81) + Belum Dapat Diproses (6,85) + Tidak Dapat Diproses (0,74) = 
            <span className="ml-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
              112,53 jt MT
            </span>
          </span>
        </div>
        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] shadow-2xs">
          80,98% Siap Dialokasikan
        </span>
      </div>
    </div>
  );
};
