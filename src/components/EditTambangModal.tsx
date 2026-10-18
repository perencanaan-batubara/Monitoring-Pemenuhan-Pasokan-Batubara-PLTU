import React, { useState, useEffect } from 'react';
import type { TambangAssignment, PltuData, SpecType, AkumulasiStatus, TahapPengadaan } from '../types/coal.ts';
import { X, Save, Pickaxe, Trash2 } from 'lucide-react';

interface EditTambangModalProps {
  isOpen: boolean;
  onClose: () => void;
  tambangToEdit: TambangAssignment | null;
  pltus: PltuData[];
  onSave: (updatedTambang: TambangAssignment) => void;
  onDelete?: (tambangId: string) => void;
}

export const EditTambangModal: React.FC<EditTambangModalProps> = ({
  isOpen,
  onClose,
  tambangToEdit,
  pltus,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<TambangAssignment>({
    id: '',
    namaTambang: '',
    namaPerusahaan: '',
    nomorIUP: '',
    pltuTujuanId: '',
    pltuTujuanName: '',
    suratPenugasan: 'B-905',
    spec: 'MRC',
    kaloriKcal: 4800,
    volumePenugasanMt: 1000000,
    volumeKonfirmasiMt: 800000,
    akumulasiStatus: 'Terkontrak dapat dialokasikan',
    tahapPengadaan: 'Pelaksanaan',
    kendalaCatatan: '',
    picPengadaan: '',
  });

  useEffect(() => {
    if (tambangToEdit) {
      setFormData(tambangToEdit);
    } else {
      const firstPltu = pltus[0];
      setFormData({
        id: `t-${Date.now()}`,
        namaTambang: '',
        namaPerusahaan: '',
        nomorIUP: '',
        pltuTujuanId: firstPltu?.id || '',
        pltuTujuanName: firstPltu?.name || '',
        suratPenugasan: 'B-905',
        spec: 'MRC',
        kaloriKcal: 4800,
        volumePenugasanMt: 1000000,
        volumeKonfirmasiMt: 800000,
        akumulasiStatus: 'Terkontrak dapat dialokasikan',
        tahapPengadaan: 'Pelaksanaan',
        kendalaCatatan: '',
        picPengadaan: '',
      });
    }
  }, [tambangToEdit, isOpen, pltus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaTambang.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Pickaxe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {tambangToEdit ? 'Edit Sumber Tambang' : 'Tambah Sumber Tambang Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Penugasan Ditjen Minerba &amp; status pengadaan batubara
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Tambang</label>
            <input
              type="text"
              required
              value={formData.namaTambang}
              onChange={(e) => setFormData({ ...formData, namaTambang: e.target.value })}
              placeholder="Contoh: PT Bukit Asam Tbk - Unit Tanjung Enim"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Perusahaan / Pemegang IUP</label>
              <input
                type="text"
                value={formData.namaPerusahaan}
                onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
                placeholder="PT Bukit Asam Tbk"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor IUP / PKP2B</label>
              <input
                type="text"
                value={formData.nomorIUP}
                onChange={(e) => setFormData({ ...formData, nomorIUP: e.target.value })}
                placeholder="IUP-001/ESDM/2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PLTU Tujuan</label>
              <select
                value={formData.pltuTujuanName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const foundPltu = pltus.find((p) => p.name === selectedName);
                  setFormData({
                    ...formData,
                    pltuTujuanName: selectedName,
                    pltuTujuanId: foundPltu?.id || '',
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              >
                {pltus.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Surat Penugasan Minerba</label>
              <select
                value={formData.suratPenugasan}
                onChange={(e) => setFormData({ ...formData, suratPenugasan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              >
                <option value="B-755">Surat B-755</option>
                <option value="B-905">Surat B-905</option>
                <option value="B-1839 & B-334">Surat B-1839 &amp; B-334</option>
                <option value="B-1282">Surat B-1282</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Spesifikasi</label>
              <select
                value={formData.spec}
                onChange={(e) => setFormData({ ...formData, spec: e.target.value as SpecType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              >
                <option value="HRC">HRC (&gt; 5.000 kcal)</option>
                <option value="MRC">MRC (4.200 - 5.000 kcal)</option>
                <option value="LRC">LRC (&lt; 4.200 kcal)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nilai Kalori (kcal/kg)</label>
              <input
                type="number"
                value={formData.kaloriKcal}
                onChange={(e) => setFormData({ ...formData, kaloriKcal: Number(e.target.value) || 4500 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PIC Pengadaan</label>
              <input
                type="text"
                value={formData.picPengadaan || ''}
                onChange={(e) => setFormData({ ...formData, picPengadaan: e.target.value })}
                placeholder="Nama Staf"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          {/* Volume Penugasan vs Konfirmasi */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Volume Penugasan (MT)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.volumePenugasanMt}
                onChange={(e) => setFormData({ ...formData, volumePenugasanMt: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Volume Konfirmasi (MT)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.volumeKonfirmasiMt}
                onChange={(e) => setFormData({ ...formData, volumeKonfirmasiMt: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          {/* Status and Tahapan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Akumulasi Status Waterfall</label>
              <select
                value={formData.akumulasiStatus}
                onChange={(e) => setFormData({ ...formData, akumulasiStatus: e.target.value as AkumulasiStatus })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              >
                <option value="Terkontrak dapat dialokasikan">Terkontrak dapat dialokasikan</option>
                <option value="Dalam proses kontrak">Dalam proses kontrak</option>
                <option value="Belum dapat diproses">Belum dapat diproses</option>
                <option value="Tidak dapat diproses">Tidak dapat diproses</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahap Pengadaan</label>
              <select
                value={formData.tahapPengadaan}
                onChange={(e) => setFormData({ ...formData, tahapPengadaan: e.target.value as TahapPengadaan })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              >
                <option value="Pelaksanaan">Pelaksanaan</option>
                <option value="Penyusunan RKS dan HPE">Penyusunan RKS dan HPE</option>
                <option value="Due diligence">Due diligence</option>
                <option value="Aanwijzing">Aanwijzing</option>
                <option value="Negosiasi">Negosiasi</option>
                <option value="Kontrak">Kontrak</option>
                <option value="Pengadaan gagal">Pengadaan gagal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan / Kendala Pasokan</label>
            <textarea
              rows={2}
              value={formData.kendalaCatatan || ''}
              onChange={(e) => setFormData({ ...formData, kendalaCatatan: e.target.value })}
              placeholder="Catatan verifikasi mutu batubara, kendala logistik, dsb."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {tambangToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus sumber tambang ${formData.namaTambang}?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Tambang</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0070BA] hover:bg-[#005a96] text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tambang</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
