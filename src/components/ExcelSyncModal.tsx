import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  FileCheck
} from 'lucide-react';
import type { PltuData, TambangAssignment, ProcurementPackage } from '../types/coal.ts';
import { importFromExcel, downloadTemplateExcel, exportToExcel } from '../utils/excelSync.ts';

interface ExcelSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  pltus: PltuData[];
  tambangs: TambangAssignment[];
  packages: ProcurementPackage[];
  onSyncSuccess: (
    newPltus: PltuData[],
    newTambangs: TambangAssignment[],
    newPackages: ProcurementPackage[],
    message: string
  ) => void;
}

export const ExcelSyncModal: React.FC<ExcelSyncModalProps> = ({
  isOpen,
  onClose,
  pltus,
  tambangs,
  packages,
  onSyncSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setStatusMessage({
        text: 'Format berkas tidak valid. Harap unggah file Microsoft Excel (.xlsx atau .xls).',
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const result = await importFromExcel(file, pltus, tambangs, packages);
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({ text: result.message, isError: false });
      onSyncSuccess(result.updatedPltus, result.updatedTambangs, result.updatedPackages, result.message);
    } else {
      setStatusMessage({ text: result.message, isError: true });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sinkronisasi Dua Arah Web &amp; Excel
              </h3>
              <p className="text-xs text-slate-500">
                Perbarui data lewat Excel dan sinkronkan seketika ke dalam dashboard monitoring
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                statusMessage.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="font-semibold">{statusMessage.text}</div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#0070BA] bg-sky-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-[#0070BA] bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls"
              className="hidden"
            />

            <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 text-[#0070BA] flex items-center justify-center mb-3">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#0070BA]" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              {isLoading ? 'Sedang Memproses Data Excel...' : 'Tarik & Lepaskan Berkas Excel di Sini'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              atau klik untuk memilih file dari komputer Anda (.xlsx, .xls)
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-2xs">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Auto-recalculate waterfall &amp; kepatuhan langsung
            </div>
          </div>

          {/* Action Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => exportToExcel(pltus, tambangs, packages)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Unduh Data Berjalan (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={downloadTemplateExcel}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-[#0070BA] hover:bg-sky-50/40 text-slate-700 hover:text-[#0070BA] font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0070BA]" />
              <span>Unduh Template Format Standar</span>
            </button>
          </div>

          {/* Format Explanation */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800">Petunjuk Format Lembar Kerja Excel:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><strong>Monitoring_PLTU:</strong> Kolom ID PLTU, Nama PLTU, Pengelola Aset, Kebutuhan (MT), Penugasan (MT), Konfirmasi (MT).</li>
              <li><strong>Sumber_Tambang_Penugasan:</strong> Nama Tambang, Nomor IUP, Surat Penugasan, Spesifikasi, Volume Penugasan, Volume Konfirmasi, Akumulasi Status.</li>
              <li>Data yang diupdate di Excel atau di web akan otomatis saling sinkron dan tersimpan di penyimpanan lokal aplikasi.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
