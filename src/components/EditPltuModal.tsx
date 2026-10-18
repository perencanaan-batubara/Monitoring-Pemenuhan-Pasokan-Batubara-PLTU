import React, { useState, useEffect } from 'react';
import type { PltuData, PengelolaAset } from '../types/coal.ts';
import { updatePltuCalculatedFields } from '../utils/coalCalculations.ts';
import { X, Save, Building2, Trash2 } from 'lucide-react';

interface EditPltuModalProps {
  isOpen: boolean;
  onClose: () => void;
  pltuToEdit: PltuData | null;
  onSave: (updatedPltu: PltuData) => void;
  onDelete?: (pltuId: string) => void;
}

export const EditPltuModal: React.FC<EditPltuModalProps> = ({
  isOpen,
  onClose,
  pltuToEdit,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<PltuData>({
    id: '',
    name: '',
    aset: 'PLN IP',
    tahun: 2026,
    sumberTambangCount: 1,
    kebutuhanMt: 1000000,
    penugasanMt: 1200000,
    konfirmasiMt: 1000000,
    kekuranganMt: 0,
    surplusMt: 0,
    kekuranganPerSpecMt: 0,
    pemenuhanPercent: 100,
    status: 'Terpenuhi',
    specKebutuhan: { hrcMt: 0, mrcMt: 1000000, lrcMt: 0 },
    specKonfirmasi: { hrcMt: 0, mrcMt: 1000000, lrcMt: 0 },
  });

  useEffect(() => {
    if (pltuToEdit) {
      setFormData(pltuToEdit);
    } else {
      const newId = `pltu-${Date.now()}`;
      setFormData({
        id: newId,
        name: '',
        aset: 'PLN IP',
        tahun: 2026,
        sumberTambangCount: 1,
        kebutuhanMt: 1000000,
        penugasanMt: 1200000,
        konfirmasiMt: 1000000,
        kekuranganMt: 0,
        surplusMt: 0,
        kekuranganPerSpecMt: 0,
        pemenuhanPercent: 100,
        status: 'Terpenuhi',
        specKebutuhan: { hrcMt: 0, mrcMt: 1000000, lrcMt: 0 },
        specKonfirmasi: { hrcMt: 0, mrcMt: 1000000, lrcMt: 0 },
      });
    }
  }, [pltuToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const recalculated = updatePltuCalculatedFields(formData);
    onSave(recalculated);
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
            <div className="p-2 rounded-lg bg-sky-100 text-[#0070BA]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {pltuToEdit ? 'Edit Data Alokasi PLTU' : 'Tambah Unit PLTU Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Data akan langsung memperbarui kalkulasi grafik waterfall &amp; pemenuhan
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
            <label className="block font-bold text-slate-700 mb-1">Nama PLTU</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              placeholder="Contoh: PLTU SURALAYA 8"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pengelola Aset</label>
              <select
                value={formData.aset}
                onChange={(e) => setFormData({ ...formData, aset: e.target.value as PengelolaAset })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              >
                <option value="PLN">PLN</option>
                <option value="PLN IP">PLN IP</option>
                <option value="PLN NP">PLN NP</option>
                <option value="IPP Tanggung Jawab PLN">IPP Tanggung Jawab PLN</option>
                <option value="IPP">IPP</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Sumber Tambang</label>
              <input
                type="number"
                min="1"
                value={formData.sumberTambangCount}
                onChange={(e) => setFormData({ ...formData, sumberTambangCount: Number(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          {/* Volume Inputs */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kebutuhan (MT)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.kebutuhanMt}
                onChange={(e) => setFormData({ ...formData, kebutuhanMt: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Penugasan (MT)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.penugasanMt}
                onChange={(e) => setFormData({ ...formData, penugasanMt: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Konfirmasi (MT)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.konfirmasiMt}
                onChange={(e) => setFormData({ ...formData, konfirmasiMt: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          {/* Breakdown Spesifikasi */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              Alokasi Kebutuhan &amp; Konfirmasi per Spesifikasi (MT)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold">HRC (Kebutuhan / Konf.)</span>
                <input
                  type="number"
                  placeholder="Kebutuhan HRC"
                  value={formData.specKebutuhan.hrcMt}
                  onChange={(e) => setFormData({
                    ...formData,
                    specKebutuhan: { ...formData.specKebutuhan, hrcMt: Number(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono mb-1 bg-white"
                />
                <input
                  type="number"
                  placeholder="Konfirmasi HRC"
                  value={formData.specKonfirmasi.hrcMt}
                  onChange={(e) => setFormData({
                    ...formData,
                    specKonfirmasi: { ...formData.specKonfirmasi, hrcMt: Number(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono bg-white text-emerald-700 font-bold"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold">MRC (Kebutuhan / Konf.)</span>
                <input
                  type="number"
                  placeholder="Kebutuhan MRC"
                  value={formData.specKebutuhan.mrcMt}
                  onChange={(e) => setFormData({
                    ...formData,
                    specKebutuhan: { ...formData.specKebutuhan, mrcMt: Number(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono mb-1 bg-white"
                />
                <input
                  type="number"
                  placeholder="Konfirmasi MRC"
                  value={formData.specKonfirmasi.mrcMt}
                  onChange={(e) => setFormData({
                    ...formData,
                    specKonfirmasi: { ...formData.specKonfirmasi, mrcMt: Number(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono bg-white text-emerald-700 font-bold"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold">LRC (Kebutuhan / Konf.)</span>
                <input
                  type="number"
                  placeholder="Kebutuhan LRC"
                  value={formData.specKebutuhan.lrcMt}
                  onChange={(e) => setFormData({
                    ...formData,
                    specKebutuhan: { ...formData.specKebutuhan, lrcMt: Number(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono mb-1 bg-white"
                />
                <input
                  type="number"
                  placeholder="Konfirmasi LRC"
                  value={formData.specKonfirmasi.lrcMt}
                  onChange={(e) => setFormData({
                    ...formData,
                    specKonfirmasi: { ...formData.specKonfirmasi, lrcMt: Number(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono bg-white text-emerald-700 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {pltuToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus data ${formData.name}?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus PLTU</span>
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
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
