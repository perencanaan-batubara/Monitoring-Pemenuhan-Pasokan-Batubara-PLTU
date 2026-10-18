import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOverallKPIs,
  calculateWaterfallData,
  calculateSpecBreakdown,
  calculateComplianceBySurat,
  calculateProcurementStagesCount,
  updatePltuCalculatedFields,
} from './coalCalculations.ts';
import type { PltuData, TambangAssignment, ProcurementPackage } from '../types/coal.ts';

const mockPltus: PltuData[] = [
  {
    id: 'suralaya',
    name: 'PLTU SURALAYA 1-7',
    aset: 'PLN IP',
    tahun: 2026,
    sumberTambangCount: 30,
    kebutuhanMt: 12537536,
    penugasanMt: 13945273,
    konfirmasiMt: 9800131,
    kekuranganMt: 2737405,
    surplusMt: 0,
    kekuranganPerSpecMt: 3456710,
    pemenuhanPercent: 78.17,
    status: 'Belum terpenuhi',
    specKebutuhan: { hrcMt: 2000000, mrcMt: 8000000, lrcMt: 2537536 },
    specKonfirmasi: { hrcMt: 1500000, mrcMt: 5043421, lrcMt: 3256710 },
  },
  {
    id: 'jawa910',
    name: 'PLTU IPP JAWA 9-10',
    aset: 'IPP Tanggung Jawab PLN',
    tahun: 2026,
    sumberTambangCount: 19,
    kebutuhanMt: 6669274,
    penugasanMt: 6463586,
    konfirmasiMt: 4527586,
    kekuranganMt: 2141688,
    surplusMt: 0,
    kekuranganPerSpecMt: 2149188,
    pemenuhanPercent: 67.89,
    status: 'Belum terpenuhi',
    specKebutuhan: { hrcMt: 0, mrcMt: 6669274, lrcMt: 0 },
    specKonfirmasi: { hrcMt: 0, mrcMt: 4527586, lrcMt: 0 },
  },
];

const mockTambangs: TambangAssignment[] = [
  {
    id: 't-1',
    namaTambang: 'PT Bukit Asam Tbk - Tanjung Enim',
    namaPerusahaan: 'PT Bukit Asam Tbk',
    nomorIUP: 'IUP-001/BA',
    pltuTujuanId: 'suralaya',
    pltuTujuanName: 'PLTU SURALAYA 1-7',
    suratPenugasan: 'B-755',
    spec: 'MRC',
    kaloriKcal: 4800,
    volumePenugasanMt: 5000000,
    volumeKonfirmasiMt: 4000000,
    akumulasiStatus: 'Terkontrak dapat dialokasikan',
    tahapPengadaan: 'Kontrak',
  },
  {
    id: 't-2',
    namaTambang: 'PT Kaltim Prima Coal - Sangatta',
    namaPerusahaan: 'PT KPC',
    nomorIUP: 'IUP-002/KPC',
    pltuTujuanId: 'suralaya',
    pltuTujuanName: 'PLTU SURALAYA 1-7',
    suratPenugasan: 'B-905',
    spec: 'HRC',
    kaloriKcal: 5800,
    volumePenugasanMt: 3000000,
    volumeKonfirmasiMt: 2500000,
    akumulasiStatus: 'Dalam proses kontrak',
    tahapPengadaan: 'Pelaksanaan',
  },
  {
    id: 't-3',
    namaTambang: 'PT Berau Coal - Lati',
    namaPerusahaan: 'PT Berau Coal',
    nomorIUP: 'IUP-003/BC',
    pltuTujuanId: 'jawa910',
    pltuTujuanName: 'PLTU IPP JAWA 9-10',
    suratPenugasan: 'B-1839 & B-334',
    spec: 'LRC',
    kaloriKcal: 4200,
    volumePenugasanMt: 2000000,
    volumeKonfirmasiMt: 1200000,
    akumulasiStatus: 'Belum dapat diproses',
    tahapPengadaan: 'Penyusunan RKS dan HPE',
  },
  {
    id: 't-4',
    namaTambang: 'PT Borneo Indobara',
    namaPerusahaan: 'PT BIB',
    nomorIUP: 'IUP-004/BIB',
    pltuTujuanId: 'suralaya',
    pltuTujuanName: 'PLTU SURALAYA 1-7',
    suratPenugasan: 'B-1282',
    spec: 'LRC',
    kaloriKcal: 3800,
    volumePenugasanMt: 500000,
    volumeKonfirmasiMt: 0,
    akumulasiStatus: 'Tidak dapat diproses',
    tahapPengadaan: 'Pengadaan gagal',
  },
];

test('calculateOverallKPIs correctly aggregates PLN group vs IPP and total volumes', () => {
  const kpis = calculateOverallKPIs(mockPltus, mockTambangs);
  assert.equal(kpis.jumlahPltuPlnGroup, 1);
  assert.equal(kpis.jumlahPltuIpp, 1);
  assert.equal(kpis.jumlahTotalPltu, 2);
  assert.equal(kpis.jumlahTambangPenugasan, 4);
  assert.equal(kpis.jumlahTambangKonfirmasi, 3);
  // Total kebutuhan: 12537536 + 6669274 = 19206810 = 19.21 jt MT
  assert.equal(kpis.totalKebutuhanJtMt, 19.21);
});

test('calculateWaterfallData produces 7 stages with accurate accumulation', () => {
  const waterfall = calculateWaterfallData(mockPltus, mockTambangs);
  assert.equal(waterfall.length, 7);
  assert.equal(waterfall[0].name, 'Kebutuhan');
  assert.equal(waterfall[1].name, 'Penugasan');
  assert.equal(waterfall[2].name, 'Konfirmasi');
  assert.equal(waterfall[3].name, 'Terkontrak dapat dialokasikan');
  assert.equal(waterfall[4].name, 'Dalam proses kontrak');
  assert.equal(waterfall[5].name, 'Belum dapat diproses');
  assert.equal(waterfall[6].name, 'Tidak dapat diproses');

  // Terkontrak: 4.0 jt MT (base 0 -> top 4.0)
  assert.equal(waterfall[3].volumeJtMt, 4.0);
  assert.equal(waterfall[3].baseJtMt, 0);
  assert.equal(waterfall[3].topJtMt, 4.0);

  // Dalam proses: 2.5 jt MT (base 4.0 -> top 6.5)
  assert.equal(waterfall[4].volumeJtMt, 2.5);
  assert.equal(waterfall[4].baseJtMt, 4.0);
  assert.equal(waterfall[4].topJtMt, 6.5);

  // Belum dapat: 1.2 jt MT (base 6.5 -> top 7.7)
  assert.equal(waterfall[5].volumeJtMt, 1.2);
  assert.equal(waterfall[5].baseJtMt, 6.5);
  assert.equal(waterfall[5].topJtMt, 7.7);

  // Tidak dapat: 0.0 jt MT (base 7.7 -> top 7.7)
  assert.equal(waterfall[6].volumeJtMt, 0.0);
  assert.equal(waterfall[6].baseJtMt, 7.7);
  assert.equal(waterfall[6].topJtMt, 7.7);
});

test('calculateComplianceBySurat groups and calculates percentage accurately', () => {
  const compliance = calculateComplianceBySurat(mockTambangs);
  assert.ok(compliance.length >= 3);
  const b755 = compliance.find((c) => c.surat === 'B-755');
  assert.ok(b755);
  assert.equal(b755.penugasanJtMt, 5.0);
  assert.equal(b755.konfirmasiJtMt, 4.0);
  assert.equal(b755.kepatuhanPercent, 80);

  const b1282 = compliance.find((c) => c.surat === 'B-1282');
  assert.ok(b1282);
  assert.equal(b1282.kepatuhanPercent, 0);
});

test('calculateProcurementStagesCount counts stages correctly', () => {
  const mockPackages: ProcurementPackage[] = [
    {
      id: 'p-1',
      nomorPaket: 'PKT-01',
      namaPaket: 'Pengadaan Batubara PLTU Suralaya Tahap 1',
      pltuList: ['PLTU SURALAYA 1-7'],
      totalVolumeMt: 1000000,
      tahap: 'Pelaksanaan',
      dokumenTerakhir: 'Undangan Penawaran',
      tanggalMulai: '2026-01-10',
      estimasiSelesai: '2026-03-31',
      pic: 'Budi Santoso',
      keterangan: 'Lancar',
    },
    {
      id: 'p-2',
      nomorPaket: 'PKT-02',
      namaPaket: 'Pengadaan Batubara PLTU Paiton',
      pltuList: ['PLTU PAITON 1-2'],
      totalVolumeMt: 500000,
      tahap: 'Pelaksanaan',
      dokumenTerakhir: 'Evaluasi Dokumen Teknis',
      tanggalMulai: '2026-01-15',
      estimasiSelesai: '2026-04-15',
      pic: 'Rahmat Hidayat',
      keterangan: 'Evaluasi vendor',
    },
    {
      id: 'p-3',
      nomorPaket: 'PKT-03',
      namaPaket: 'Penyusunan RKS Rembang',
      pltuList: ['PLTU REMBANG'],
      totalVolumeMt: 300000,
      tahap: 'Penyusunan RKS dan HPE',
      dokumenTerakhir: 'Draft HPE Final',
      tanggalMulai: '2026-02-01',
      estimasiSelesai: '2026-03-15',
      pic: 'Dewi Lestari',
      keterangan: 'Review harga pasar',
    },
  ];

  const counts = calculateProcurementStagesCount(mockPackages);
  const pelaksanaan = counts.find((c) => c.tahap === 'Pelaksanaan');
  assert.ok(pelaksanaan);
  assert.equal(pelaksanaan.count, 2);

  const rks = counts.find((c) => c.tahap === 'Penyusunan RKS dan HPE');
  assert.ok(rks);
  assert.equal(rks.count, 1);
});

test('updatePltuCalculatedFields calculates deficit and surplus correctly', () => {
  const testPltu: PltuData = {
    id: 'test',
    name: 'PLTU Test',
    aset: 'PLN IP',
    tahun: 2026,
    sumberTambangCount: 5,
    kebutuhanMt: 1000000,
    penugasanMt: 1200000,
    konfirmasiMt: 800000,
    kekuranganMt: 0,
    surplusMt: 0,
    kekuranganPerSpecMt: 0,
    pemenuhanPercent: 0,
    status: 'Belum terpenuhi',
    specKebutuhan: { hrcMt: 500000, mrcMt: 500000, lrcMt: 0 },
    specKonfirmasi: { hrcMt: 400000, mrcMt: 400000, lrcMt: 0 },
  };

  const updated = updatePltuCalculatedFields(testPltu);
  assert.equal(updated.kekuranganMt, 200000);
  assert.equal(updated.surplusMt, 0);
  assert.equal(updated.pemenuhanPercent, 80);
  assert.equal(updated.status, 'Belum terpenuhi');
  assert.equal(updated.kekuranganPerSpecMt, 200000);
});
