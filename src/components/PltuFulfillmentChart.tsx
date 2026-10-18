import React, { useState, useMemo } from 'react';
import type { PltuData, PengelolaAset } from '../types/coal.ts';
import { 
  Building2, 
  BarChart3, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight,
  LayoutGrid,
  BarChart2,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface PltuFulfillmentChartProps {
  pltus: PltuData[];
  onSelectPltu: (pltu: PltuData) => void;
}

export const PltuFulfillmentChart: React.FC<PltuFulfillmentChartProps> = ({
  pltus,
  onSelectPltu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAset, setSelectedAset] = useState<'All' | PengelolaAset>('All');
  const [filterMode, setFilterMode] = useState<'all' | 'top10' | 'defisit' | 'surplus'>('top10');
  const [sortBy, setSortBy] = useState<'kebutuhan' | 'pemenuhan' | 'penugasan' | 'name'>('kebutuhan');
  const [viewStyle, setViewStyle] = useState<'bars' | 'cards'>('bars');

  // Filtered and sorted list
  const processedPltus = useMemo(() => {
    let result = [...pltus];

    // Filter by asset
    if (selectedAset !== 'All') {
      result = result.filter((p) => p.aset === selectedAset);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.aset.toLowerCase().includes(q)
      );
    }

    // Filter by mode
    if (filterMode === 'defisit') {
      result = result.filter((p) => p.status === 'Defisit' || p.pemenuhanPercent < 100);
    } else if (filterMode === 'surplus') {
      result = result.filter((p) => p.status === 'Surplus' || p.pemenuhanPercent >= 100);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'kebutuhan') return b.kebutuhanMt - a.kebutuhanMt;
      if (sortBy === 'penugasan') return b.penugasanMt - a.penugasanMt;
      if (sortBy === 'pemenuhan') return a.pemenuhanPercent - b.pemenuhanPercent; // lowest fulfillment first
      return a.name.localeCompare(b.name);
    });

    if (filterMode === 'top10') {
      result = result.slice(0, 10);
    }

    return result;
  }, [pltus, selectedAset, searchQuery, filterMode, sortBy]);

  // Max value for chart scale in current view
  const maxVolume = useMemo(() => {
    if (processedPltus.length === 0) return 1000000;
    return Math.max(
      ...processedPltus.map((p) => Math.max(p.kebutuhanMt, p.penugasanMt, p.konfirmasiMt))
    );
  }, [processedPltus]);

  const defisitCount = useMemo(() => {
    return pltus.filter((p) => p.status === 'Defisit' || p.pemenuhanPercent < 100).length;
  }, [pltus]);

  const surplusCount = useMemo(() => {
    return pltus.filter((p) => p.status === 'Surplus' || p.pemenuhanPercent >= 100).length;
  }, [pltus]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow">
      {/* Header with Title and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0070BA]" />
              Chart Pemenuhan Pasokan per PLTU
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              {pltus.length} Unit Pembangkit
            </span>
            {defisitCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {defisitCount} Defisit
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Semua Terpenuhi &gt; 100%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Klik pada batang atau kartu PLTU mana saja untuk menampilkan notifikasi rincian sumber tambang, spesifikasi, dan status kontrak.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#3b82f6]"></span>
            <span>Kebutuhan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0d9488]"></span>
            <span>Penugasan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#10b981]"></span>
            <span>Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
        {/* Quick View Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterMode('top10')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'top10'
                ? 'bg-[#0070BA] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Top 10 Kebutuhan
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#0070BA] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua ({pltus.length})
          </button>
          <button
            onClick={() => setFilterMode('defisit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'defisit'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            Defisit ({defisitCount})
          </button>
          <button
            onClick={() => setFilterMode('surplus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'surplus'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Surplus ({surplusCount})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Asset filter */}
          <select
            value={selectedAset}
            onChange={(e) => setSelectedAset(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-[#0070BA] outline-none"
          >
            <option value="All">Semua Pengelola</option>
            <option value="PLN">PLN</option>
            <option value="PLN IP">PLN IP</option>
            <option value="PLN NP">PLN NP</option>
            <option value="IPP Tanggung Jawab PLN">IPP Tanggung Jawab PLN</option>
            <option value="IPP">IPP</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-[#0070BA] outline-none"
          >
            <option value="kebutuhan">Kebutuhan Terbesar</option>
            <option value="penugasan">Penugasan Terbesar</option>
            <option value="pemenuhan">Pemenuhan Terendah</option>
            <option value="name">Nama PLTU (A-Z)</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari PLTU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-[#0070BA] outline-none w-36 sm:w-44"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden p-0.5">
            <button
              onClick={() => setViewStyle('bars')}
              title="Tampilan Grafik Bar"
              className={`p-1 rounded cursor-pointer ${viewStyle === 'bars' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewStyle('cards')}
              title="Tampilan Kartu Komparasi"
              className={`p-1 rounded cursor-pointer ${viewStyle === 'cards' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      {processedPltus.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Tidak ada PLTU yang cocok dengan filter yang dipilih.
        </div>
      ) : viewStyle === 'bars' ? (
        /* Horizontal Grouped Bars Chart */
        <div className="mt-5 space-y-4 max-h-[640px] overflow-y-auto pr-2">
          {processedPltus.map((pltu) => {
            const kebWidth = Math.max(2, (pltu.kebutuhanMt / maxVolume) * 100);
            const penWidth = Math.max(2, (pltu.penugasanMt / maxVolume) * 100);
            const konWidth = Math.max(2, (pltu.konfirmasiMt / maxVolume) * 100);
            const isDefisit = pltu.pemenuhanPercent < 100;

            return (
              <div
                key={pltu.id}
                onClick={() => onSelectPltu(pltu)}
                className="group p-3 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer bg-white"
              >
                {/* PLTU Info Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#0070BA] transition-colors">
                      {pltu.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pltu.aset === 'PLN' ? 'bg-blue-100 text-blue-800' :
                      pltu.aset === 'PLN IP' ? 'bg-sky-100 text-sky-800' :
                      pltu.aset === 'PLN NP' ? 'bg-indigo-100 text-indigo-800' :
                      pltu.aset === 'IPP Tanggung Jawab PLN' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {pltu.aset}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      ({pltu.sumberTambangCount} Sumber Tambang)
                    </span>
                  </div>

                  {/* Percentage & Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className={`font-extrabold text-xs sm:text-sm ${
                        isDefisit ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {pltu.pemenuhanPercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block leading-none">
                        pemenuhan
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDefisit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {pltu.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0070BA] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Triple Grouped Bars (Kebutuhan, Penugasan, Konfirmasi) */}
                <div className="space-y-1.5 pt-1">
                  {/* 1. Kebutuhan Bar */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 text-slate-500 text-right shrink-0 font-medium text-[10px]">
                      Kebutuhan
                    </span>
                    <div className="flex-1 bg-slate-100 h-3.5 rounded-xs overflow-hidden relative">
                      <div
                        className="bg-[#3b82f6] h-full rounded-xs transition-all duration-500"
                        style={{ width: `${kebWidth}%` }}
                      />
                    </div>
                    <span className="w-28 text-slate-700 font-mono text-[11px] text-right shrink-0">
                      {(pltu.kebutuhanMt / 1_000_000).toFixed(2)} jt MT
                    </span>
                  </div>

                  {/* 2. Penugasan Bar */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 text-teal-600 text-right shrink-0 font-medium text-[10px]">
                      Penugasan
                    </span>
                    <div className="flex-1 bg-slate-100 h-3.5 rounded-xs overflow-hidden relative">
                      <div
                        className="bg-[#0d9488] h-full rounded-xs transition-all duration-500"
                        style={{ width: `${penWidth}%` }}
                      />
                    </div>
                    <span className="w-28 text-slate-700 font-mono text-[11px] text-right shrink-0">
                      {(pltu.penugasanMt / 1_000_000).toFixed(2)} jt MT
                    </span>
                  </div>

                  {/* 3. Konfirmasi Bar */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 text-emerald-600 text-right shrink-0 font-bold text-[10px]">
                      Konfirmasi
                    </span>
                    <div className="flex-1 bg-slate-100 h-3.5 rounded-xs overflow-hidden relative">
                      <div
                        className={`h-full rounded-xs transition-all duration-500 ${
                          isDefisit ? 'bg-amber-500' : 'bg-[#10b981]'
                        }`}
                        style={{ width: `${konWidth}%` }}
                      />
                    </div>
                    <span className="w-28 font-mono text-[11px] font-bold text-right shrink-0 text-slate-900">
                      {(pltu.konfirmasiMt / 1_000_000).toFixed(2)} jt MT
                    </span>
                  </div>
                </div>

                {/* Subtext info on hover */}
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    Spesifikasi: MRC {(pltu.specKonfirmasi.mrcMt / 1000).toFixed(0)}k | LRC {(pltu.specKonfirmasi.lrcMt / 1000).toFixed(0)}k | HRC {(pltu.specKonfirmasi.hrcMt / 1000).toFixed(0)}k MT
                  </span>
                  <span className="text-[#0070BA] font-semibold group-hover:underline">
                    Rincian Tambang &amp; Kontrak &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Card Grid View */
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1">
          {processedPltus.map((pltu) => {
            const isDefisit = pltu.pemenuhanPercent < 100;

            return (
              <div
                key={pltu.id}
                onClick={() => onSelectPltu(pltu)}
                className="bg-white border border-slate-200 hover:border-[#0070BA] hover:shadow-md p-4 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-800 group-hover:text-[#0070BA] transition-colors line-clamp-1">
                      {pltu.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      pltu.aset === 'PLN' ? 'bg-blue-100 text-blue-800' :
                      pltu.aset === 'PLN IP' ? 'bg-sky-100 text-sky-800' :
                      pltu.aset === 'PLN NP' ? 'bg-indigo-100 text-indigo-800' :
                      pltu.aset === 'IPP Tanggung Jawab PLN' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {pltu.aset}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Kebutuhan</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {(pltu.kebutuhanMt / 1_000_000).toFixed(2)} jt
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Penugasan</span>
                      <span className="text-xs font-bold text-teal-700 font-mono">
                        {(pltu.penugasanMt / 1_000_000).toFixed(2)} jt
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Konfirmasi</span>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        {(pltu.konfirmasiMt / 1_000_000).toFixed(2)} jt
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">Pemenuhan</span>
                      <span className={`font-bold ${isDefisit ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {pltu.pemenuhanPercent.toFixed(1)}% ({pltu.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isDefisit ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pltu.pemenuhanPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{pltu.sumberTambangCount} Tambang Terhubung</span>
                  <span className="text-[#0070BA] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Rincian <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
