import React from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Download,
  Building2,
  Layers
} from 'lucide-react';

interface HeaderNavbarProps {
  onOpenExcelSync: () => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  onResetData: () => void;
  onAddNewPltu: () => void;
  onAddNewTambang: () => void;
  lastUpdatedTime: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onOpenExcelSync,
  onExportExcel,
  onDownloadTemplate,
  onResetData,
  onAddNewPltu,
  onAddNewTambang,
  lastUpdatedTime,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center gap-2.5">
              {/* PLN Logo representation */}
              <div className="w-10 h-10 rounded-lg bg-[#0070BA] flex items-center justify-center shadow-xs text-white font-black text-xl tracking-tighter">
                <span className="text-amber-300">⚡</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#0070BA] tracking-wider text-base sm:text-lg">PLN</span>
                  <span className="text-slate-400 font-medium text-xs">|</span>
                  <span className="text-slate-800 font-bold text-xs sm:text-sm tracking-tight">Energi Primer Indonesia</span>
                </div>
                <div className="hidden sm:block text-[11px] text-slate-500 font-medium">
                  Divisi Perencanaan Pengadaan Batubara &bull; Tahun 2026
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center pl-4 border-l border-slate-200">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sinkron Web &amp; Excel Aktif
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Excel Sync Actions */}
            <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={onOpenExcelSync}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0070BA] hover:bg-white rounded-md transition-all shadow-xs cursor-pointer"
                title="Unggah dan sinkronkan data dari file Excel"
              >
                <Upload className="w-3.5 h-3.5 text-[#0070BA]" />
                <span className="hidden md:inline">Impor / Sinkron Excel</span>
                <span className="md:hidden">Impor</span>
              </button>

              <button
                type="button"
                onClick={onExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-white rounded-md transition-all shadow-xs cursor-pointer"
                title="Ekspor seluruh data ke format Excel .xlsx"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Ekspor Excel</span>
                <span className="md:hidden">Ekspor</span>
              </button>

              <button
                type="button"
                onClick={onDownloadTemplate}
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition-all cursor-pointer"
                title="Unduh format template Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>Template</span>
              </button>
            </div>

            {/* Add Record Actions */}
            <div className="relative group">
              <button
                type="button"
                onClick={onAddNewPltu}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0070BA] hover:bg-[#005a96] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tambah PLTU / Tambang</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            </div>

            {/* Reset data */}
            <button
              type="button"
              onClick={onResetData}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
              title="Reset ke data baseline PLN 2026"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subheader info bar */}
        <div className="flex items-center justify-between py-1.5 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <span className="flex items-center gap-1 font-medium text-slate-700 truncate">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">Sistem Monitoring Perencanaan Pasokan &amp; Pengadaan Batubara Terpadu</span>
              <span className="sm:hidden font-semibold">Monitoring Batubara Terpadu</span>
            </span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span className="hidden md:inline text-slate-500">
              Penugasan Ditjen Minerba &amp; e-Procurement
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] sm:text-[11px]">
            <span className="hidden sm:inline">Terakhir sinkron:</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{lastUpdatedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
