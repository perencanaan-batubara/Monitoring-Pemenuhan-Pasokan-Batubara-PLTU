import React, { useState, useMemo } from 'react';
import type { PltuData, PengelolaAset } from '../types/coal.ts';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  ArrowUpDown,
  Building
} from 'lucide-react';

interface PltuMonitoringTableProps {
  pltus: PltuData[];
  onSelectPltu: (pltu: PltuData) => void;
  onEditPltu: (pltu: PltuData) => void;
  onAddNewPltu: () => void;
}

export const PltuMonitoringTable: React.FC<PltuMonitoringTableProps> = ({
  pltus,
  onSelectPltu,
  onEditPltu,
  onAddNewPltu,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAset, setFilterAset] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof PltuData>('kebutuhanMt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return pltus
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.aset.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAset = filterAset === 'ALL' || p.aset === filterAset;
        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesAset && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortDirection === 'asc'
          ? (Number(valA) || 0) - (Number(valB) || 0)
          : (Number(valB) || 0) - (Number(valA) || 0);
      });
  }, [pltus, searchTerm, filterAset, filterStatus, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSort = (field: keyof PltuData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Header matching Image 4 */}
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Monitoring pemenuhan per PLTU
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Realisasi pemenuhan alokasi batubara, deviasi kuota, dan kepatuhan spesifikasi boiler tiap pembangkit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {pltus.length} PLTU &bull; LRC + MRC + HRC
            </span>
            <button
              type="button"
              onClick={onAddNewPltu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0070BA] hover:bg-[#005a96] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah PLTU</span>
            </button>
          </div>
        </div>

        {/* Filters and search toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari PLTU berdasarkan nama..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070BA] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Filter Aset */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 font-medium text-[11px]">Aset:</span>
              <select
                value={filterAset}
                onChange={(e) => {
                  setFilterAset(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Pengelola</option>
                <option value="PLN">PLN</option>
                <option value="PLN IP">PLN IP</option>
                <option value="PLN NP">PLN NP</option>
                <option value="IPP Tanggung Jawab PLN">IPP Tanggung Jawab PLN</option>
                <option value="IPP">IPP</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 font-medium text-[11px]">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Belum terpenuhi">Belum terpenuhi</option>
                <option value="Terpenuhi">Terpenuhi</option>
                <option value="Surplus">Surplus</option>
              </select>
            </div>

            <span className="text-slate-400 text-xs">
              Ditemukan: <strong className="text-slate-700">{filteredData.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>PLTU</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">ASET</th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('kebutuhanMt')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>KEBUTUHAN (MT)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('penugasanMt')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>PENUGASAN (MT)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('konfirmasiMt')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>KONFIRMASI (MT)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('kekuranganMt')}
              >
                <div className="flex items-center justify-end gap-1 text-amber-700">
                  <span>KEKURANGAN (MT)</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">SURPLUS (MT)</th>
              <th className="py-3 px-3 text-right text-amber-700">KEKURANGAN PER SPEC (MT)</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors min-w-[140px]"
                onClick={() => handleSort('pemenuhanPercent')}
              >
                <div className="flex items-center gap-1">
                  <span>PEMENUHAN</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">STATUS</th>
              <th className="py-3 px-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((pltu) => {
              const hasDeficit = pltu.kekuranganMt > 0;
              const hasSpecDeficit = pltu.kekuranganPerSpecMt > 0;
              
              // Badge color for Aset
              const asetBadgeClass = 
                pltu.aset === 'PLN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                pltu.aset === 'PLN IP' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                pltu.aset === 'PLN NP' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                pltu.aset === 'IPP Tanggung Jawab PLN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-amber-50 text-amber-800 border-amber-200';

              return (
                <tr 
                  key={pltu.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* PLTU Name & meta matching Image 4 */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{pltu.name}</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                      {pltu.tahun} &bull; {pltu.sumberTambangCount} sumber tambang
                    </div>
                  </td>

                  {/* ASET */}
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${asetBadgeClass}`}>
                      {pltu.aset}
                    </span>
                  </td>

                  {/* Kebutuhan */}
                  <td className="py-3 px-3 text-right font-medium text-slate-800 font-mono">
                    {pltu.kebutuhanMt.toLocaleString('id-ID')}
                  </td>

                  {/* Penugasan */}
                  <td className="py-3 px-3 text-right font-medium text-slate-800 font-mono">
                    {pltu.penugasanMt.toLocaleString('id-ID')}
                  </td>

                  {/* Konfirmasi */}
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 font-mono">
                    {pltu.konfirmasiMt.toLocaleString('id-ID')}
                  </td>

                  {/* Kekurangan */}
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {hasDeficit ? (
                      <span className="text-amber-700">
                        {pltu.kekuranganMt.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Surplus */}
                  <td className="py-3 px-3 text-right font-mono">
                    {pltu.surplusMt > 0 ? (
                      <span className="text-emerald-700 font-semibold">
                        {pltu.surplusMt.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Kekurangan Per Spec */}
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {hasSpecDeficit ? (
                      <span className="text-amber-700">
                        {pltu.kekuranganPerSpecMt.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Pemenuhan with bar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pltu.pemenuhanPercent >= 100 
                              ? 'bg-emerald-500' 
                              : pltu.pemenuhanPercent >= 70 
                              ? 'bg-amber-500' 
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, pltu.pemenuhanPercent)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 min-w-[48px]">
                        {pltu.pemenuhanPercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* Status badge matching Image 4 */}
                  <td className="py-3 px-3 text-center">
                    {pltu.status === 'Belum terpenuhi' ? (
                      <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50/80 border border-amber-200 rounded-md">
                        Belum terpenuhi
                      </span>
                    ) : pltu.status === 'Surplus' ? (
                      <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
                        Surplus
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-md">
                        Terpenuhi
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectPltu(pltu)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-[#0070BA] transition-colors shadow-2xs cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditPltu(pltu)}
                        className="p-1 text-slate-400 hover:text-[#0070BA] hover:bg-sky-50 rounded transition-colors cursor-pointer"
                        title="Edit data PLTU langsung di web"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  Tidak ada data PLTU yang cocok dengan filter atau kata kunci pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Menampilkan {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} hingga{' '}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} entri
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Sebelumnya
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && pageNum - prev > 1;

              return (
                <React.Fragment key={pageNum}>
                  {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#0070BA] text-white'
                        : 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
};
