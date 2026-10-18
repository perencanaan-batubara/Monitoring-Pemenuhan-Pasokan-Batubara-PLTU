import React from 'react';
import type { PltuData, TambangAssignment, ProcurementPackage } from '../types/coal.ts';
import { 
  X, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Scale, 
  ExternalLink,
  ShieldAlert,
  Pickaxe,
  Edit3
} from 'lucide-react';

export type ModalType = 
  | { kind: 'waterfall'; stageId: string; title: string; volumeJtMt: number; percentage?: number }
  | { kind: 'pltu'; pltu: PltuData }
  | { kind: 'procurement'; stageName: string }
  | { kind: 'surat'; suratName: string }
  | { kind: 'spec'; specType: 'MRC_HRC' | 'LRC' };

interface DetailModalProps {
  modalData: ModalType | null;
  onClose: () => void;
  tambangs: TambangAssignment[];
  packages: ProcurementPackage[];
  pltus: PltuData[];
  onEditPltu?: (pltu: PltuData) => void;
  onEditTambang?: (tambang: TambangAssignment) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  modalData,
  onClose,
  tambangs,
  packages,
  pltus,
  onEditPltu,
  onEditTambang,
}) => {
  if (!modalData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 text-[#0070BA]">
              {modalData.kind === 'waterfall' && <Layers className="w-5 h-5" />}
              {modalData.kind === 'pltu' && <Building2 className="w-5 h-5" />}
              {modalData.kind === 'procurement' && <FileText className="w-5 h-5" />}
              {modalData.kind === 'surat' && <Pickaxe className="w-5 h-5" />}
              {modalData.kind === 'spec' && <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {modalData.kind === 'waterfall' && 'Rincian Waterfall Pengadaan'}
                  {modalData.kind === 'pltu' && 'Profil Pemenuhan PLTU'}
                  {modalData.kind === 'procurement' && 'Daftar Paket Pengadaan'}
                  {modalData.kind === 'surat' && 'Surat Penugasan Minerba'}
                  {modalData.kind === 'spec' && 'Rincian Spesifikasi Batubara'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {modalData.kind === 'waterfall' && modalData.title}
                {modalData.kind === 'pltu' && modalData.pltu.name}
                {modalData.kind === 'procurement' && `Tahap Pengadaan: ${modalData.stageName}`}
                {modalData.kind === 'surat' && `Surat Penugasan Minerba: ${modalData.suratName}`}
                {modalData.kind === 'spec' && (modalData.specType === 'MRC_HRC' ? 'Spesifikasi Medium & High Rank Coal (MRC & HRC)' : 'Spesifikasi Low Rank Coal (LRC)')}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {modalData.kind === 'pltu' && onEditPltu && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditPltu(modalData.pltu);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0070BA] hover:bg-[#005a96] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit PLTU</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* ================= 1. WATERFALL STAGE CONTENT ================= */}
          {modalData.kind === 'waterfall' && (() => {
            let filteredTambangs: TambangAssignment[] = [];
            let headerNotice = '';
            
            if (modalData.stageId === 'terkontrak') {
              filteredTambangs = tambangs.filter((t) => t.akumulasiStatus === 'Terkontrak dapat dialokasikan');
              headerNotice = 'Sumber tambang telah berkontrak aktif dengan PLN dan siap memasok ke PLTU tujuan.';
            } else if (modalData.stageId === 'dalam_proses') {
              filteredTambangs = tambangs.filter((t) => t.akumulasiStatus === 'Dalam proses kontrak');
              headerNotice = 'Dalam proses penyusunan dan penandatanganan PJBB (Perjanjian Jual Beli Batubara).';
            } else if (modalData.stageId === 'belum_dapat') {
              filteredTambangs = tambangs.filter((t) => t.akumulasiStatus === 'Belum dapat diproses');
              headerNotice = 'Masih terkendala verifikasi teknis, harga patokan HPE, atau perizinan MODI/MOMS.';
            } else if (modalData.stageId === 'tidak_dapat') {
              filteredTambangs = tambangs.filter((t) => t.akumulasiStatus === 'Tidak dapat diproses');
              headerNotice = 'Tidak memenuhi syarat mutu boiler PLTU atau izin tambang dibekukan kementerian.';
            } else {
              filteredTambangs = tambangs;
              headerNotice = `Total volume akumulasi: ${modalData.volumeJtMt} juta MT.`;
            }

            return (
              <div className="space-y-4">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#0070BA] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {headerNotice}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Volume: <strong>{modalData.volumeJtMt} jt MT</strong>
                      {modalData.percentage !== undefined && ` (${modalData.percentage}% dari total konfirmasi)`}
                      {' • '} Jumlah sumber tambang: <strong>{filteredTambangs.length} tambang</strong>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-[11px] text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Nama Tambang / Perusahaan</th>
                        <th className="py-2.5 px-3">PLTU Tujuan</th>
                        <th className="py-2.5 px-2">Spec</th>
                        <th className="py-2.5 px-3 text-right">Penugasan (MT)</th>
                        <th className="py-2.5 px-3 text-right">Konfirmasi (MT)</th>
                        <th className="py-2.5 px-3">Tahap</th>
                        <th className="py-2.5 px-3">Catatan / Kendala</th>
                        {onEditTambang && <th className="py-2.5 px-3 text-center">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTambangs.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{t.namaTambang}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{t.nomorIUP} &bull; {t.suratPenugasan}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{t.pltuTujuanName}</td>
                          <td className="py-2.5 px-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {t.spec}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">{t.volumePenugasanMt.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{t.volumeKonfirmasiMt.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">
                              {t.tahapPengadaan}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-[200px]">
                            {t.kendalaCatatan || '-'}
                          </td>
                          {onEditTambang && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onEditTambang(t);
                                }}
                                title="Edit Tambang"
                                className="p-1 rounded text-slate-400 hover:text-[#0070BA] hover:bg-sky-50 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ================= 2. PLTU DETAIL CONTENT ================= */}
          {modalData.kind === 'pltu' && (() => {
            const p = modalData.pltu;
            const assignedMines = tambangs.filter(
              (t) => t.pltuTujuanName === p.name || t.pltuTujuanId === p.id
            );

            return (
              <div className="space-y-5">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">Kebutuhan Tahunan</span>
                    <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                      {p.kebutuhanMt.toLocaleString('id-ID')} <span className="text-xs">MT</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">Penugasan Minerba</span>
                    <div className="text-base font-bold text-sky-800 mt-1 font-mono">
                      {p.penugasanMt.toLocaleString('id-ID')} <span className="text-xs">MT</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">Konfirmasi Tambang</span>
                    <div className="text-base font-bold text-emerald-700 mt-1 font-mono">
                      {p.konfirmasiMt.toLocaleString('id-ID')} <span className="text-xs">MT</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${p.kekuranganMt > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {p.kekuranganMt > 0 ? 'Kekurangan (MT)' : 'Surplus (MT)'}
                    </span>
                    <div className={`text-base font-bold mt-1 font-mono ${p.kekuranganMt > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {p.kekuranganMt > 0 ? p.kekuranganMt.toLocaleString('id-ID') : p.surplusMt.toLocaleString('id-ID')} <span className="text-xs">MT</span>
                    </div>
                  </div>
                </div>

                {/* Spesifikasi Breakdown for this PLTU */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-700 mb-3 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#0070BA]" />
                    Pemenuhan Kebutuhan Spesifikasi Batubara PLTU
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                        <span>High Rank (HRC)</span>
                        <span className="text-slate-500">{p.specKebutuhan.hrcMt > 0 ? 'Dibutuhkan' : 'Tidak Butuh'}</span>
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kebutuhan:</span>
                          <span className="font-mono font-medium">{p.specKebutuhan.hrcMt.toLocaleString('id-ID')} MT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Konfirmasi:</span>
                          <span className="font-mono font-bold text-emerald-700">{p.specKonfirmasi.hrcMt.toLocaleString('id-ID')} MT</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                        <span>Medium Rank (MRC)</span>
                        <span className="text-slate-500">{p.specKebutuhan.mrcMt > 0 ? 'Dibutuhkan' : 'Tidak Butuh'}</span>
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kebutuhan:</span>
                          <span className="font-mono font-medium">{p.specKebutuhan.mrcMt.toLocaleString('id-ID')} MT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Konfirmasi:</span>
                          <span className="font-mono font-bold text-emerald-700">{p.specKonfirmasi.mrcMt.toLocaleString('id-ID')} MT</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                        <span>Low Rank (LRC)</span>
                        <span className="text-slate-500">{p.specKebutuhan.lrcMt > 0 ? 'Dibutuhkan' : 'Tidak Butuh'}</span>
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kebutuhan:</span>
                          <span className="font-mono font-medium">{p.specKebutuhan.lrcMt.toLocaleString('id-ID')} MT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Konfirmasi:</span>
                          <span className="font-mono font-bold text-emerald-700">{p.specKonfirmasi.lrcMt.toLocaleString('id-ID')} MT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List of Mines for this PLTU */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-700 mb-2 flex items-center justify-between">
                    <span>Daftar Sumber Tambang Terkait ({assignedMines.length})</span>
                    <span className="text-[11px] font-normal text-slate-500">Penugasan Minerba</span>
                  </h4>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100 text-[11px] text-slate-700 font-bold uppercase">
                        <tr>
                          <th className="py-2 px-3">Nama Tambang</th>
                          <th className="py-2 px-2">Surat</th>
                          <th className="py-2 px-2">Spec</th>
                          <th className="py-2 px-3 text-right">Penugasan (MT)</th>
                          <th className="py-2 px-3 text-right">Konfirmasi (MT)</th>
                          <th className="py-2 px-3">Akumulasi Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignedMines.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-medium text-slate-900">{m.namaTambang}</td>
                            <td className="py-2 px-2 text-[11px] text-slate-600">{m.suratPenugasan}</td>
                            <td className="py-2 px-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {m.spec}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{m.volumePenugasanMt.toLocaleString('id-ID')}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{m.volumeKonfirmasiMt.toLocaleString('id-ID')}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">
                                {m.akumulasiStatus}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {assignedMines.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-400">
                              Belum ada pemetaan sumber tambang spesifik untuk unit ini dalam database saat ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= 3. PROCUREMENT STAGE PACKAGES ================= */}
          {modalData.kind === 'procurement' && (() => {
            const pkgs = packages.filter((p) => p.tahap === modalData.stageName);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">
                    Total {pkgs.length} paket pengadaan pada tahap {modalData.stageName}
                  </span>
                  <span className="text-xs font-mono text-slate-600">
                    Volume: {pkgs.reduce((s, p) => s + p.totalVolumeMt, 0).toLocaleString('id-ID')} MT
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-[11px] text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Nomor &amp; Nama Paket</th>
                        <th className="py-2.5 px-3">PLTU Tujuan</th>
                        <th className="py-2.5 px-3 text-right">Volume (MT)</th>
                        <th className="py-2.5 px-3">Dokumen Terakhir</th>
                        <th className="py-2.5 px-3">PIC</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pkgs.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{pkg.namaPaket}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{pkg.nomorPaket}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{pkg.pltuList.join(', ')}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium">{pkg.totalVolumeMt.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3 font-medium text-[#0070BA]">{pkg.dokumenTerakhir}</td>
                          <td className="py-2.5 px-3 text-slate-600">{pkg.pic}</td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{pkg.keterangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ================= 4. SURAT PENUGASAN MINERBA ================= */}
          {modalData.kind === 'surat' && (() => {
            const mines = tambangs.filter((t) => t.suratPenugasan === modalData.suratName);
            const totalPenugasan = mines.reduce((s, t) => s + t.volumePenugasanMt, 0);
            const totalKonfirmasi = mines.reduce((s, t) => s + t.volumeKonfirmasiMt, 0);
            const ratio = totalPenugasan > 0 ? ((totalKonfirmasi / totalPenugasan) * 100).toFixed(1) : '0';

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total Penugasan Minerba</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                      {totalPenugasan.toLocaleString('id-ID')} MT
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Realisasi Konfirmasi</span>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5 font-mono">
                      {totalKonfirmasi.toLocaleString('id-ID')} MT
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Kepatuhan (%)</span>
                    <div className="font-bold text-sky-800 text-sm mt-0.5">
                      {ratio}%
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-[11px] text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Nama Tambang / Perusahaan</th>
                        <th className="py-2.5 px-3">PLTU Tujuan</th>
                        <th className="py-2.5 px-2">Spec</th>
                        <th className="py-2.5 px-3 text-right">Penugasan (MT)</th>
                        <th className="py-2.5 px-3 text-right">Konfirmasi (MT)</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mines.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{m.namaTambang}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.nomorIUP}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">{m.pltuTujuanName}</td>
                          <td className="py-2.5 px-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {m.spec}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">{m.volumePenugasanMt.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{m.volumeKonfirmasiMt.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">
                              {m.akumulasiStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ================= 5. SPEC DETAIL ================= */}
          {modalData.kind === 'spec' && (() => {
            const isMrcHrc = modalData.specType === 'MRC_HRC';
            const targetSpecs = isMrcHrc ? ['HRC', 'MRC'] : ['LRC'];
            const specTambangs = tambangs.filter((t) => targetSpecs.includes(t.spec));

            return (
              <div className="space-y-4">
                <div className={`p-3 rounded-xl border ${isMrcHrc ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="font-bold text-xs text-slate-900">
                    {isMrcHrc 
                      ? 'Spesifikasi Medium Rank (4.200 - 5.000 kcal) & High Rank Coal (> 5.000 kcal)' 
                      : 'Spesifikasi Low Rank Coal (< 4.200 kcal)'}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    {isMrcHrc 
                      ? 'Perlu percepatan pengadaan karena defisit pasokan sebesar 15,76 jt MT.' 
                      : 'Pasokan surplus melimpah hingga 203% terhadap baseline kebutuhan.'}
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-[11px] text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Nama Tambang</th>
                        <th className="py-2.5 px-2">Kalori (kcal)</th>
                        <th className="py-2.5 px-3">PLTU Tujuan</th>
                        <th className="py-2.5 px-3 text-right">Konfirmasi (MT)</th>
                        <th className="py-2.5 px-3">Akumulasi Status</th>
                        <th className="py-2.5 px-3">Tahap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {specTambangs.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{t.namaTambang}</td>
                          <td className="py-2.5 px-2 font-mono">{t.kaloriKcal}</td>
                          <td className="py-2.5 px-3 text-slate-800">{t.pltuTujuanName}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{t.volumeKonfirmasiMt.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">
                              {t.akumulasiStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{t.tahapPengadaan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
