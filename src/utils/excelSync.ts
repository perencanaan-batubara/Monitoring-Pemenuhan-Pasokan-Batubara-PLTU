import * as XLSX from 'xlsx';
import type { PltuData, TambangAssignment, ProcurementPackage, PengelolaAset, SpecType, AkumulasiStatus, TahapPengadaan } from '../types/coal.ts';
import { updatePltuCalculatedFields } from './coalCalculations.ts';

export function exportToExcel(
  pltus: PltuData[],
  tambangs: TambangAssignment[],
  packages: ProcurementPackage[]
) {
  const wb = XLSX.utils.book_new();

  // 1. PLTU Sheet
  const pltuRows = pltus.map((p) => ({
    'ID PLTU': p.id,
    'Nama PLTU': p.name,
    'Pengelola Aset': p.aset,
    'Tahun Perencanaan': p.tahun,
    'Jumlah Tambang': p.sumberTambangCount,
    'Kebutuhan (MT)': p.kebutuhanMt,
    'Penugasan (MT)': p.penugasanMt,
    'Konfirmasi (MT)': p.konfirmasiMt,
    'Kekurangan (MT)': p.kekuranganMt,
    'Surplus (MT)': p.surplusMt,
    'Kekurangan Per Spec (MT)': p.kekuranganPerSpecMt,
    'Pemenuhan (%)': p.pemenuhanPercent,
    'Status Pemenuhan': p.status,
    'Kebutuhan HRC (MT)': p.specKebutuhan.hrcMt,
    'Kebutuhan MRC (MT)': p.specKebutuhan.mrcMt,
    'Kebutuhan LRC (MT)': p.specKebutuhan.lrcMt,
    'Konfirmasi HRC (MT)': p.specKonfirmasi.hrcMt,
    'Konfirmasi MRC (MT)': p.specKonfirmasi.mrcMt,
    'Konfirmasi LRC (MT)': p.specKonfirmasi.lrcMt,
  }));
  const wsPltu = XLSX.utils.json_to_sheet(pltuRows);
  XLSX.utils.book_append_sheet(wb, wsPltu, 'Monitoring_PLTU');

  // 2. Tambang Penugasan Sheet
  const tambangRows = tambangs.map((t) => ({
    'ID Tambang': t.id,
    'Nama Tambang': t.namaTambang,
    'Nama Perusahaan': t.namaPerusahaan,
    'Nomor IUP': t.nomorIUP,
    'PLTU Tujuan': t.pltuTujuanName,
    'Surat Penugasan Minerba': t.suratPenugasan,
    'Spesifikasi (HRC/MRC/LRC)': t.spec,
    'Kalori (kcal/kg)': t.kaloriKcal,
    'Volume Penugasan (MT)': t.volumePenugasanMt,
    'Volume Konfirmasi (MT)': t.volumeKonfirmasiMt,
    'Akumulasi Status Pengadaan': t.akumulasiStatus,
    'Tahap Pengadaan': t.tahapPengadaan,
    'Nomor Kontrak': t.nomorKontrak || '',
    'PIC Pengadaan': t.picPengadaan || '',
    'Catatan / Kendala': t.kendalaCatatan || '',
  }));
  const wsTambang = XLSX.utils.json_to_sheet(tambangRows);
  XLSX.utils.book_append_sheet(wb, wsTambang, 'Sumber_Tambang_Penugasan');

  // 3. Procurement Packages Sheet
  const packageRows = packages.map((pkg) => ({
    'ID Paket': pkg.id,
    'Nomor Paket': pkg.nomorPaket,
    'Nama Paket': pkg.namaPaket,
    'Daftar PLTU': pkg.pltuList.join(', '),
    'Total Volume (MT)': pkg.totalVolumeMt,
    'Tahap Pengadaan': pkg.tahap,
    'Dokumen Terakhir': pkg.dokumenTerakhir,
    'Tanggal Mulai': pkg.tanggalMulai,
    'Estimasi Selesai': pkg.estimasiSelesai,
    'PIC': pkg.pic,
    'Keterangan': pkg.keterangan,
  }));
  const wsPackages = XLSX.utils.json_to_sheet(packageRows);
  XLSX.utils.book_append_sheet(wb, wsPackages, 'Tahapan_Pengadaan');

  // Trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Monitoring_Perencanaan_Batubara_2026_${dateStr}.xlsx`);
}

export function downloadTemplateExcel() {
  const wb = XLSX.utils.book_new();

  const templatePltu = [
    {
      'ID PLTU': 'pltu-sample-1',
      'Nama PLTU': 'PLTU CONTOH 1',
      'Pengelola Aset': 'PLN IP',
      'Tahun Perencanaan': 2026,
      'Jumlah Tambang': 10,
      'Kebutuhan (MT)': 2500000,
      'Penugasan (MT)': 3000000,
      'Konfirmasi (MT)': 2200000,
      'Kebutuhan HRC (MT)': 500000,
      'Kebutuhan MRC (MT)': 1500000,
      'Kebutuhan LRC (MT)': 500000,
      'Konfirmasi HRC (MT)': 400000,
      'Konfirmasi MRC (MT)': 1300000,
      'Konfirmasi LRC (MT)': 500000,
    },
  ];
  const wsPltu = XLSX.utils.json_to_sheet(templatePltu);
  XLSX.utils.book_append_sheet(wb, wsPltu, 'Monitoring_PLTU');

  const templateTambang = [
    {
      'ID Tambang': 't-contoh-1',
      'Nama Tambang': 'PT Tambang Energi Nusantara',
      'Nama Perusahaan': 'PT TEN Tbk',
      'Nomor IUP': 'IUP-001/ESDM/2026',
      'PLTU Tujuan': 'PLTU CONTOH 1',
      'Surat Penugasan Minerba': 'B-755',
      'Spesifikasi (HRC/MRC/LRC)': 'MRC',
      'Kalori (kcal/kg)': 4800,
      'Volume Penugasan (MT)': 1000000,
      'Volume Konfirmasi (MT)': 800000,
      'Akumulasi Status Pengadaan': 'Terkontrak dapat dialokasikan',
      'Tahap Pengadaan': 'Kontrak',
      'Nomor Kontrak': 'KTR-TEN-001',
      'PIC Pengadaan': 'Staf Perencanaan',
      'Catatan / Kendala': 'Siap pasok',
    },
  ];
  const wsTambang = XLSX.utils.json_to_sheet(templateTambang);
  XLSX.utils.book_append_sheet(wb, wsTambang, 'Sumber_Tambang_Penugasan');

  XLSX.writeFile(wb, `Template_Monitoring_Batubara_2026.xlsx`);
}

export interface ImportResult {
  success: boolean;
  message: string;
  updatedPltus: PltuData[];
  updatedTambangs: TambangAssignment[];
  updatedPackages: ProcurementPackage[];
  pltusCount: number;
  tambangsCount: number;
}

export async function importFromExcel(
  file: File,
  currentPltus: PltuData[],
  currentTambangs: TambangAssignment[],
  currentPackages: ProcurementPackage[]
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        let updatedPltus = [...currentPltus];
        let updatedTambangs = [...currentTambangs];
        let updatedPackages = [...currentPackages];

        let pltuCount = 0;
        let tambangCount = 0;

        // 1. Process PLTU sheet
        const pltuSheetName = workbook.SheetNames.find(
          (name) =>
            name.toLowerCase().includes('pltu') ||
            name.toLowerCase().includes('monitoring')
        );

        if (pltuSheetName) {
          const ws = workbook.Sheets[pltuSheetName];
          const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

          if (rawRows.length > 0) {
            const parsedPltus: PltuData[] = rawRows.map((r, idx) => {
              const name = String(r['Nama PLTU'] || r['PLTU'] || `PLTU ${idx + 1}`);
              const id = String(r['ID PLTU'] || name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              const rawAset = String(r['Pengelola Aset'] || r['Pengelola'] || 'PLN IP').trim();
              let normalizedAset = rawAset;
              if (normalizedAset === 'IPP PLN') normalizedAset = 'IPP Tanggung Jawab PLN';
              if (normalizedAset === 'PLN EPI') normalizedAset = 'PLN';
              const validAsetList: PengelolaAset[] = ['PLN', 'PLN IP', 'PLN NP', 'IPP Tanggung Jawab PLN', 'IPP'];
              const aset = (validAsetList.includes(normalizedAset as PengelolaAset)
                ? normalizedAset
                : 'PLN') as PengelolaAset;

              const kebutuhanMt = Number(r['Kebutuhan (MT)'] || r['Kebutuhan'] || 0);
              const penugasanMt = Number(r['Penugasan (MT)'] || r['Penugasan'] || 0);
              const konfirmasiMt = Number(r['Konfirmasi (MT)'] || r['Konfirmasi'] || 0);

              const hrcKebutuhan = Number(r['Kebutuhan HRC (MT)'] || 0);
              const mrcKebutuhan = Number(r['Kebutuhan MRC (MT)'] || kebutuhanMt);
              const lrcKebutuhan = Number(r['Kebutuhan LRC (MT)'] || 0);

              const hrcKonfirmasi = Number(r['Konfirmasi HRC (MT)'] || 0);
              const mrcKonfirmasi = Number(r['Konfirmasi MRC (MT)'] || konfirmasiMt);
              const lrcKonfirmasi = Number(r['Konfirmasi LRC (MT)'] || 0);

              const rawPltu: PltuData = {
                id,
                name,
                aset,
                tahun: Number(r['Tahun Perencanaan'] || 2026),
                sumberTambangCount: Number(r['Jumlah Tambang'] || 1),
                kebutuhanMt,
                penugasanMt,
                konfirmasiMt,
                kekuranganMt: 0,
                surplusMt: 0,
                kekuranganPerSpecMt: 0,
                pemenuhanPercent: 0,
                status: 'Belum terpenuhi',
                specKebutuhan: {
                  hrcMt: hrcKebutuhan,
                  mrcMt: mrcKebutuhan,
                  lrcMt: lrcKebutuhan,
                },
                specKonfirmasi: {
                  hrcMt: hrcKonfirmasi,
                  mrcMt: mrcKonfirmasi,
                  lrcMt: lrcKonfirmasi,
                },
              };

              return updatePltuCalculatedFields(rawPltu);
            });

            updatedPltus = parsedPltus;
            pltuCount = parsedPltus.length;
          }
        }

        // 2. Process Tambang sheet
        const tambangSheetName = workbook.SheetNames.find(
          (name) =>
            name.toLowerCase().includes('tambang') ||
            name.toLowerCase().includes('sumber')
        );

        if (tambangSheetName) {
          const ws = workbook.Sheets[tambangSheetName];
          const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

          if (rawRows.length > 0) {
            const parsedTambangs: TambangAssignment[] = rawRows.map((r, idx) => {
              const id = String(r['ID Tambang'] || `t-import-${idx + 1}`);
              const namaTambang = String(r['Nama Tambang'] || `Tambang ${idx + 1}`);
              const specRaw = String(r['Spesifikasi (HRC/MRC/LRC)'] || r['Spesifikasi'] || 'MRC').toUpperCase();
              const spec: SpecType = ['HRC', 'MRC', 'LRC'].includes(specRaw)
                ? (specRaw as SpecType)
                : 'MRC';

              const statusRaw = String(r['Akumulasi Status Pengadaan'] || r['Akumulasi Status'] || 'Terkontrak dapat dialokasikan');
              const validStatus: AkumulasiStatus[] = [
                'Terkontrak dapat dialokasikan',
                'Dalam proses kontrak',
                'Belum dapat diproses',
                'Tidak dapat diproses',
              ];
              const akumulasiStatus: AkumulasiStatus = validStatus.includes(statusRaw as AkumulasiStatus)
                ? (statusRaw as AkumulasiStatus)
                : 'Terkontrak dapat dialokasikan';

              const tahapRaw = String(r['Tahap Pengadaan'] || 'Pelaksanaan');
              const validTahap: TahapPengadaan[] = [
                'Due diligence',
                'Penyusunan RKS dan HPE',
                'Pelaksanaan',
                'Aanwijzing',
                'Negosiasi',
                'Pengadaan gagal',
                'Kontrak',
              ];
              const tahapPengadaan: TahapPengadaan = validTahap.includes(tahapRaw as TahapPengadaan)
                ? (tahapRaw as TahapPengadaan)
                : 'Pelaksanaan';

              return {
                id,
                namaTambang,
                namaPerusahaan: String(r['Nama Perusahaan'] || namaTambang),
                nomorIUP: String(r['Nomor IUP'] || `IUP-${idx + 1}`),
                pltuTujuanId: '',
                pltuTujuanName: String(r['PLTU Tujuan'] || 'PLTU SURALAYA 1-7'),
                suratPenugasan: String(r['Surat Penugasan Minerba'] || 'B-905'),
                spec,
                kaloriKcal: Number(r['Kalori (kcal/kg)'] || 4500),
                volumePenugasanMt: Number(r['Volume Penugasan (MT)'] || 0),
                volumeKonfirmasiMt: Number(r['Volume Konfirmasi (MT)'] || 0),
                akumulasiStatus,
                tahapPengadaan,
                nomorKontrak: r['Nomor Kontrak'] ? String(r['Nomor Kontrak']) : undefined,
                picPengadaan: r['PIC Pengadaan'] ? String(r['PIC Pengadaan']) : undefined,
                kendalaCatatan: r['Catatan / Kendala'] ? String(r['Catatan / Kendala']) : undefined,
              };
            });

            updatedTambangs = parsedTambangs;
            tambangCount = parsedTambangs.length;
          }
        }

        resolve({
          success: true,
          message: `Berhasil sinkronisasi data Excel! ${pltuCount > 0 ? `${pltuCount} PLTU` : ''} ${tambangCount > 0 ? `dan ${tambangCount} Sumber Tambang` : ''} telah diperbarui.`,
          updatedPltus,
          updatedTambangs,
          updatedPackages,
          pltusCount: pltuCount,
          tambangsCount: tambangCount,
        });
      } catch (err: any) {
        resolve({
          success: false,
          message: `Gagal membaca file Excel: ${err?.message || 'Format tidak valid'}`,
          updatedPltus: currentPltus,
          updatedTambangs: currentTambangs,
          updatedPackages: currentPackages,
          pltusCount: 0,
          tambangsCount: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Gagal membaca berkas Excel yang diunggah.',
        updatedPltus: currentPltus,
        updatedTambangs: currentTambangs,
        updatedPackages: currentPackages,
        pltusCount: 0,
        tambangsCount: 0,
      });
    };

    reader.readAsArrayBuffer(file);
  });
}
