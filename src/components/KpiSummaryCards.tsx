import React from 'react';
import type { OverallKPIs } from '../types/coal.ts';
import { 
  Building2, 
  Pickaxe, 
  TrendingUp, 
  Scale, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface KpiSummaryCardsProps {
  kpis: OverallKPIs;
  onFilterSurat?: (surat: string) => void;
  onOpenTambangList?: () => void;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  kpis,
  onOpenTambangList,
}) => {
  return (
    <div className="space-y-4">
      {/* Top 2 Standard Metric Tables matching Image 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Table 1: Jumlah PLTU */}
        <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-50 text-[#0070BA]">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Data Pemetaan Unit PLTU
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Total {kpis.jumlahTotalPltu} PLTU
            </span>
          </div>
          
          <div className="mt-3 divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="font-bold text-slate-800 tracking-wide uppercase">
                JUMLAH PLTU PLN GROUP
              </span>
              <span className="font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-md min-w-12 text-center">
                {kpis.jumlahPltuPlnGroup}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-bold text-slate-800 tracking-wide uppercase">
                JUMLAH PLTU IPP TANGGUNG JAWAB PLN
              </span>
              <span className="font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-md min-w-12 text-center">
                {kpis.jumlahPltuIpp}
              </span>
            </div>
          </div>
        </div>

        {/* Table 2: Jumlah Sumber Tambang */}
        <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Pickaxe className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Sumber Tambang Batubara (Ditjen Minerba)
              </span>
            </div>
            {onOpenTambangList && (
              <button
                type="button"
                onClick={onOpenTambangList}
                className="text-[11px] font-semibold text-[#0070BA] hover:underline cursor-pointer"
              >
                Lihat Semua Daftar Tambang &rarr;
              </button>
            )}
          </div>
          
          <div className="mt-3 divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="font-bold text-slate-800 tracking-wide uppercase">
                JUMLAH SUMBER TAMBANG PENUGASAN
              </span>
              <span className="font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-md min-w-12 text-center">
                {kpis.jumlahTambangPenugasan}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-bold text-slate-800 tracking-wide uppercase">
                JUMLAH SUMBER TAMBANG KONFIRMASI
              </span>
              <span className="font-black text-sm text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md min-w-12 text-center border border-emerald-200">
                {kpis.jumlahTambangKonfirmasi}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Volume Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Kebutuhan */}
        <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium">Total Kebutuhan</span>
            <span className="text-[10px] uppercase tracking-wider bg-slate-700/80 px-2 py-0.5 rounded text-slate-200">2026 MT</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
            {kpis.totalKebutuhanJtMt.toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-300">jt MT</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Baseline kebutuhan 41 PLTU se-Indonesia
          </div>
        </div>

        {/* Penugasan */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-[#0070BA] transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Total Penugasan Minerba</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              {kpis.persentasePenugasanVsKebutuhan}% Kebutuhan
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {kpis.totalPenugasanJtMt.toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500">jt MT</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Dari 4 Surat Penugasan ESDM</span>
          </div>
        </div>

        {/* Konfirmasi */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Total Konfirmasi Tambang</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {kpis.persentaseKonfirmasiVsKebutuhan}% Kebutuhan
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {kpis.totalKonfirmasiJtMt.toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500">jt MT</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kepatuhan 73.5% dari penugasan</span>
          </div>
        </div>

        {/* Selisih */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-amber-500 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Selisih Konfirmasi</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              kpis.selisihKonfirmasiJtMt >= 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {kpis.selisihKonfirmasiJtMt >= 0 ? '+ Surplus Agregat' : '- Defisit Agregat'}
            </span>
          </div>
          <div className={`mt-2 text-2xl sm:text-3xl font-black tracking-tight ${
            kpis.selisihKonfirmasiJtMt >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {kpis.selisihKonfirmasiJtMt > 0 ? `+${kpis.selisihKonfirmasiJtMt.toLocaleString('id-ID')}` : kpis.selisihKonfirmasiJtMt.toLocaleString('id-ID')}
            <span className="text-sm font-semibold text-slate-500 ml-1">jt MT</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>Terdapat disparitas defisit per spesifikasi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
