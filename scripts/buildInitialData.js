import fs from 'node:fs';
import path from 'node:path';

// Load existing PLTUs
const pltuDataModule = await import('../src/data/initialCoalData.ts');
const rawPltus = pltuDataModule.INITIAL_PLTUS;

// Target totals:
// Kebutuhan = 92.02 jt MT (MRC+HRC = 56.67 jt MT, LRC = 35.35 jt MT)
// Penugasan = 153.04 jt MT
// Konfirmasi = 112.53 jt MT (MRC+HRC = 40.91 jt MT, LRC = 71.62 jt MT)

// Waterfall stages:
// 1. Terkontrak dapat dialokasikan = 91.13 jt MT
// 2. Dalam proses kontrak = 13.81 jt MT
// 3. Belum dapat diproses = 6.85 jt MT
// 4. Tidak dapat diproses = 0.74 jt MT

// Surat:
// B-1839: Penugasan = 138,552,000 MT, Konfirmasi = 102,670,000 MT (198 tambangs)
// B-33: Penugasan = 14,488,000 MT, Konfirmasi = 9,860,000 MT (29 tambangs)

const PROMINENT_COMPANIES = [
  { name: 'PT Bukit Asam Tbk', base: 'Tanjung Enim', prefix: 'BA' },
  { name: 'PT Kaltim Prima Coal', base: 'Sangatta', prefix: 'KPC' },
  { name: 'PT Adaro Indonesia', base: 'Tabalong', prefix: 'ADR' },
  { name: 'PT Kideco Jaya Agung', base: 'Paser', prefix: 'KDC' },
  { name: 'PT Berau Coal', base: 'Berau', prefix: 'BRC' },
  { name: 'PT Borneo Indobara', base: 'Batulicin', prefix: 'BIB' },
  { name: 'PT Arutmin Indonesia', base: 'Senakin', prefix: 'ART' },
  { name: 'PT Multi Harapan Utama', base: 'Kutai Kartanegara', prefix: 'MHU' },
  { name: 'PT Antang Gunung Meratus', base: 'Tapin', prefix: 'AGM' },
  { name: 'PT Indexim Coalindo', base: 'Kaliorang', prefix: 'IND' },
  { name: 'PT Singlurus Pratama', base: 'Samboja', prefix: 'SGP' },
  { name: 'PT Baramulti Suksessarana', base: 'Kutai', prefix: 'BSSR' },
  { name: 'PT Mitrabara Adiperdana', base: 'Malinau', prefix: 'MBAP' },
  { name: 'PT Titan Infra Energy', base: 'Lahat', prefix: 'TIE' },
  { name: 'PT Dizamatra Powerindo', base: 'Lahat', prefix: 'DMP' },
  { name: 'PT Bara Alam Utama', base: 'Lahat', prefix: 'BAU' },
  { name: 'PT Golden Energy Mines', base: 'Muara Enim', prefix: 'GEM' },
  { name: 'PT Bayan Resources Tbk', base: 'Tabang', prefix: 'BYAN' },
  { name: 'PT Atlas Resources Tbk', base: 'Musi Banyuasin', prefix: 'AR' },
  { name: 'PT Sumber Global Energy Tbk', base: 'Samarinda', prefix: 'SGE' },
  { name: 'PT Batutua Kharisma Permai', base: 'Barito', prefix: 'BKP' },
  { name: 'PT Padangbara Sukses Makmur', base: 'Katingan', prefix: 'PSM' },
  { name: 'PT Banpu Mining Indonesia', base: 'Bontang', prefix: 'BMI' },
  { name: 'PT Prima Coal Sejahtera', base: 'Tenggarong', prefix: 'PCS' },
  { name: 'PT Energi Batubara Lestari', base: 'Tapin', prefix: 'EBL' },
  { name: 'PT Binuang Mitra Bersama', base: 'Binuang', prefix: 'BMB' },
  { name: 'PT Insani Bara Perkasa', base: 'Loa Janan', prefix: 'IBP' },
  { name: 'PT Mandiri Intiperkasa', base: 'Tarakan', prefix: 'MIP' },
  { name: 'PT Firman Ketaun Perkasa', base: 'Bengkulu', prefix: 'FKP' },
  { name: 'PT Jembayan Muarabara', base: 'Kutai', prefix: 'JMB' },
];

// Scale PLTUs so total kebutuhan is 92.02 jt MT (MRC+HRC = 56.67 jt MT, LRC = 35.35 jt MT)
// Penugasan = 153.04 jt MT, Konfirmasi = 112.53 jt MT
let sumKeb = rawPltus.reduce((s, p) => s + p.kebutuhanMt, 0);
let sumPen = rawPltus.reduce((s, p) => s + p.penugasanMt, 0);
let sumKon = rawPltus.reduce((s, p) => s + p.konfirmasiMt, 0);

const updatedPltus = rawPltus.map((pltu, idx) => {
  // normalize
  const keb = Math.round((pltu.kebutuhanMt / sumKeb) * 92020000);
  const pen = Math.round((pltu.penugasanMt / sumPen) * 153040000);
  const kon = Math.round((pltu.konfirmasiMt / sumKon) * 112530000);
  
  // Spec breakdown per PLTU
  // Ratio of MRC+HRC to LRC is approx 56.67 / 35.35 for kebutuhan
  const mrcRatio = 0.52;
  const hrcRatio = 0.10;
  const lrcRatio = 0.38;

  const specKebutuhan = {
    hrcMt: Math.round(keb * hrcRatio),
    mrcMt: Math.round(keb * mrcRatio),
    lrcMt: keb - Math.round(keb * hrcRatio) - Math.round(keb * mrcRatio),
  };

  // Konfirmasi: MRC+HRC = 40.91 / 112.53 = 36.3%, LRC = 63.7%
  const konMrcRatio = 0.31;
  const konHrcRatio = 0.053;
  const specKonfirmasi = {
    hrcMt: Math.round(kon * konHrcRatio),
    mrcMt: Math.round(kon * konMrcRatio),
    lrcMt: kon - Math.round(kon * konHrcRatio) - Math.round(kon * konMrcRatio),
  };

  const kekurangan = Math.max(0, keb - kon);
  const surplus = Math.max(0, kon - keb);
  const pemenuhanPercent = keb > 0 ? +((kon / keb) * 100).toFixed(2) : 100;
  const status = pemenuhanPercent >= 100 ? 'Surplus' : pemenuhanPercent >= 90 ? 'Cukup' : 'Defisit';

  return {
    ...pltu,
    kebutuhanMt: keb,
    penugasanMt: pen,
    konfirmasiMt: kon,
    kekuranganMt: kekurangan,
    surplusMt: surplus,
    pemenuhanPercent,
    status,
    specKebutuhan,
    specKonfirmasi,
  };
});

// Adjust last PLTU so exact sum matches
const currentSumKeb = updatedPltus.reduce((s, p) => s + p.kebutuhanMt, 0);
const currentSumPen = updatedPltus.reduce((s, p) => s + p.penugasanMt, 0);
const currentSumKon = updatedPltus.reduce((s, p) => s + p.konfirmasiMt, 0);

updatedPltus[0].kebutuhanMt += (92020000 - currentSumKeb);
updatedPltus[0].penugasanMt += (153040000 - currentSumPen);
updatedPltus[0].konfirmasiMt += (112530000 - currentSumKon);
updatedPltus[0].surplusMt = Math.max(0, updatedPltus[0].konfirmasiMt - updatedPltus[0].kebutuhanMt);
updatedPltus[0].pemenuhanPercent = +((updatedPltus[0].konfirmasiMt / updatedPltus[0].kebutuhanMt) * 100).toFixed(2);

// Now generate all 227 tambangs:
// 198 tambangs under Surat B-1839 (Tahap 1): Penugasan 138,552,000 MT, Konfirmasi 102,670,000 MT
// 29 tambangs under Surat B-33 (Tahap 2): Penugasan 14,488,000 MT, Konfirmasi 9,860,000 MT
// 122 confirmed mines (111 in B-1839, 11 in B-33)
// 105 unconfirmed mines (87 in B-1839, 18 in B-33)

// In B-1839: 111 confirmed mines:
// Terkontrak: 68 mines, volume 83,130,000 MT
// Dalam proses: 23 mines, volume 12,410,000 MT
// Belum dapat diproses: 16 mines, volume 6,390,000 MT
// Tidak dapat diproses: 4 mines, volume 740,000 MT
// Sum = 83.13 + 12.41 + 6.39 + 0.74 = 102.67 jt MT!

// In B-33: 11 confirmed mines:
// Terkontrak: 7 mines, volume 8,000,000 MT (Total Terkontrak = 83.13 + 8.00 = 91.13 jt MT!)
// Dalam proses: 2 mines, volume 1,400,000 MT (Total Dalam Proses = 12.41 + 1.40 = 13.81 jt MT!)
// Belum dapat diproses: 2 mines, volume 460,000 MT (Total Belum Dapat = 6.39 + 0.46 = 6.85 jt MT!)
// Tidak dapat diproses: 0 mines, volume 0 MT (Total Tidak Dapat = 0.74 jt MT!)
// Sum = 8.00 + 1.40 + 0.46 = 9.86 jt MT!

// Grand total confirmed = 102.67 + 9.86 = 112.53 jt MT!

const allTambangs = [];
let idCounter = 1;

function generateSublist({
  count,
  totalKonfirmasi,
  totalPenugasan,
  surat,
  status,
  tahapFn,
  isConfirmed,
  startSpecIdx = 0,
}) {
  const items = [];
  let allocatedKonf = 0;
  let allocatedPen = 0;

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const konf = isConfirmed
      ? (isLast ? (totalKonfirmasi - allocatedKonf) : Math.round(totalKonfirmasi / count))
      : 0;
    allocatedKonf += konf;

    const pen = isLast ? (totalPenugasan - allocatedPen) : Math.round(totalPenugasan / count);
    allocatedPen += pen;

    const company = PROMINENT_COMPANIES[(idCounter + i) % PROMINENT_COMPANIES.length];
    const pltu = updatedPltus[(idCounter + i * 2) % updatedPltus.length];

    // Spec determination: 40.91 jt MT is MRC/HRC, 71.62 jt MT is LRC
    // approx 36% MRC/HRC, 64% LRC
    let spec = 'LRC';
    let kalori = 4100;
    if ((i + startSpecIdx) % 3 === 0) {
      spec = 'MRC';
      kalori = 4900;
    } else if ((i + startSpecIdx) % 8 === 0) {
      spec = 'HRC';
      kalori = 5800;
    }

    items.push({
      id: `tb-${String(idCounter).padStart(3, '0')}`,
      namaTambang: `${company.name} - Pit ${company.base} Blk-${String(idCounter).padStart(3, '0')}`,
      namaPerusahaan: company.name,
      nomorIUP: `IUP-${company.prefix}/${String(100 + idCounter)}/ESDM/2026`,
      pltuTujuanId: pltu.id,
      pltuTujuanName: pltu.name,
      suratPenugasan: surat,
      spec,
      kaloriKcal: kalori,
      volumePenugasanMt: pen,
      volumeKonfirmasiMt: konf,
      akumulasiStatus: status,
      tahapPengadaan: tahapFn(i, idCounter),
      nomorKontrak: status === 'Terkontrak dapat dialokasikan' ? `PLN-EPI/KTR-BB/${2026}/${String(idCounter).padStart(4, '0')}` : undefined,
      picPengadaan: ['Bambang Wahyudi', 'Rina Marlina', 'Hendro Kusumo', 'Siti Rahmawati', 'Agus Setiawan', 'Tri Haryanto'][i % 6],
      kendalaCatatan: status === 'Tidak dapat diproses' ? 'Spesifikasi moisture & total sulfur melebihi parameter boiler' :
                      status === 'Belum dapat diproses' && isConfirmed ? 'Menunggu kelengkapan dokumen RKAB 2026 dan verifikasi MODI ESDM' :
                      !isConfirmed ? 'Belum menyampaikan surat konfirmasi kesanggupan penugasan Ditjen Minerba' :
                      status === 'Dalam proses kontrak' ? 'Penyelarasan draft kontrak PJBB dan jaminan pelaksanaan' :
                      'Pasokan terjadwal sesuai delivery schedule tahunan',
    });
    idCounter++;
  }
  return items;
}

// B-1839 Confirmed (111 tambangs, 102,670,000 MT konfirmasi, 138,552,000 - 35,882,000 = 102,670,000 MT baseline)
// We calculate penugasan for confirmed mines in B-1839 as 115,000,000 MT and unconfirmed as 23,552,000 MT -> total 138,552,000 MT
const b1839_terkontrak = generateSublist({
  count: 68,
  totalKonfirmasi: 83130000,
  totalPenugasan: 93000000,
  surat: 'B-1839/MB.05/DBT.PL/2025',
  status: 'Terkontrak dapat dialokasikan',
  tahapFn: () => 'Kontrak',
  isConfirmed: true,
  startSpecIdx: 0,
});

const b1839_proses = generateSublist({
  count: 23,
  totalKonfirmasi: 12410000,
  totalPenugasan: 14000000,
  surat: 'B-1839/MB.05/DBT.PL/2025',
  status: 'Dalam proses kontrak',
  tahapFn: (i) => i % 2 === 0 ? 'Pelaksanaan Pengadaan' : 'Negosiasi',
  isConfirmed: true,
  startSpecIdx: 1,
});

const b1839_belum = generateSublist({
  count: 16,
  totalKonfirmasi: 6390000,
  totalPenugasan: 7200000,
  surat: 'B-1839/MB.05/DBT.PL/2025',
  status: 'Belum dapat diproses',
  tahapFn: (i) => i === 0 ? 'Due Diligence' : 'Penyusunan RKS dan HPE',
  isConfirmed: true,
  startSpecIdx: 2,
});

const b1839_tidak = generateSublist({
  count: 4,
  totalKonfirmasi: 740000,
  totalPenugasan: 800000,
  surat: 'B-1839/MB.05/DBT.PL/2025',
  status: 'Tidak dapat diproses',
  tahapFn: () => 'Pengadaan gagal',
  isConfirmed: true,
  startSpecIdx: 3,
});

// B-1839 Unconfirmed: 87 tambangs, 0 konfirmasi, 23,552,000 MT penugasan
const b1839_unconf = generateSublist({
  count: 87,
  totalKonfirmasi: 0,
  totalPenugasan: 138552000 - (93000000 + 14000000 + 7200000 + 800000),
  surat: 'B-1839/MB.05/DBT.PL/2025',
  status: 'Belum dapat diproses',
  tahapFn: () => 'Penyusunan RKS dan HPE',
  isConfirmed: false,
  startSpecIdx: 4,
});

// B-33 Confirmed (11 tambangs, 9,860,000 MT konfirmasi, Penugasan 11,000,000 MT)
const b33_terkontrak = generateSublist({
  count: 7,
  totalKonfirmasi: 8000000,
  totalPenugasan: 9000000,
  surat: 'B-33/MB.05/DBT.PL/2026',
  status: 'Terkontrak dapat dialokasikan',
  tahapFn: () => 'Kontrak',
  isConfirmed: true,
  startSpecIdx: 5,
});

const b33_proses = generateSublist({
  count: 2,
  totalKonfirmasi: 1400000,
  totalPenugasan: 1550000,
  surat: 'B-33/MB.05/DBT.PL/2026',
  status: 'Dalam proses kontrak',
  tahapFn: () => 'Pelaksanaan Pengadaan',
  isConfirmed: true,
  startSpecIdx: 6,
});

const b33_belum = generateSublist({
  count: 2,
  totalKonfirmasi: 460000,
  totalPenugasan: 500000,
  surat: 'B-33/MB.05/DBT.PL/2026',
  status: 'Belum dapat diproses',
  tahapFn: () => 'Penyusunan RKS dan HPE',
  isConfirmed: true,
  startSpecIdx: 7,
});

// B-33 Unconfirmed: 18 tambangs, 0 konfirmasi, 3,438,000 MT penugasan (Total B-33 penugasan = 14,488,000 MT)
const b33_unconf = generateSublist({
  count: 18,
  totalKonfirmasi: 0,
  totalPenugasan: 14488000 - (9000000 + 1550000 + 500000),
  surat: 'B-33/MB.05/DBT.PL/2026',
  status: 'Belum dapat diproses',
  tahapFn: () => 'Penyusunan RKS dan HPE',
  isConfirmed: false,
  startSpecIdx: 8,
});

allTambangs.push(
  ...b1839_terkontrak,
  ...b1839_proses,
  ...b1839_belum,
  ...b1839_tidak,
  ...b1839_unconf,
  ...b33_terkontrak,
  ...b33_proses,
  ...b33_belum,
  ...b33_unconf
);

console.log('Final tambangs count:', allTambangs.length);
console.log('Final confirmed count:', allTambangs.filter(t => t.volumeKonfirmasiMt > 0).length);

const packagesCode = `
export const INITIAL_PACKAGES: ProcurementPackage[] = [
  {
    id: 'pkg-dd-1',
    nomorPaket: 'EPI-PROC-2026-DD-001',
    namaPaket: 'Due Diligence Kelayakan Tambang Kalsel & Kaltim',
    pltuList: ['PLTU SURALAYA 1-7', 'PLTU PAITON 1-2'],
    totalVolumeMt: 6850000,
    tahap: 'Due Diligence',
    dokumenTerakhir: 'Laporan Audit Cadangan dan Legalitas IUP Batubara',
    tanggalMulai: '2026-01-10',
    estimasiSelesai: '2026-03-31',
    pic: 'Rina Marlina',
    keterangan: 'Pemeriksaan kepatuhan RKAB dan sertifikasi Clean and Clear (CnC)',
  },
  {
    id: 'pkg-rks-1',
    nomorPaket: 'EPI-PROC-2026-RKS-001',
    namaPaket: 'Penyusunan Dokumen RKS & HPE Pengadaan Batubara Pasokan Tahunan 2026',
    pltuList: ['PLTU TANJUNG JATI B 1-4', 'PLTU INDRAMAYU', 'PLTU REMBANG'],
    totalVolumeMt: 12500000,
    tahap: 'Penyusunan RKS dan HPE',
    dokumenTerakhir: 'Draft Rencana Kerja & Syarat (RKS) dan Kalkulasi Harga Perkiraan Sendiri (HPE)',
    tanggalMulai: '2026-01-15',
    estimasiSelesai: '2026-03-15',
    pic: 'Hendro Kusumo',
    keterangan: 'Finalisasi formula penyesuaian harga HBA dan indeks ICI',
  },
  {
    id: 'pkg-proc-1',
    nomorPaket: 'EPI-PROC-2026-PLK-001',
    namaPaket: 'Proses Pelaksanaan Pelelangan & Pemilihan Langsung Pengadaan Batubara PLTU Jawa-Bali',
    pltuList: ['PLTU SURALAYA 8', 'PLTU LABUAN', 'PLTU PELABUHAN RATU', 'PLTU PACITAN'],
    totalVolumeMt: 13810000,
    tahap: 'Pelaksanaan Pengadaan',
    dokumenTerakhir: 'Undangan Pemasukan Dokumen Penawaran Teknis dan Harga',
    tanggalMulai: '2026-01-20',
    estimasiSelesai: '2026-03-25',
    pic: 'Siti Rahmawati',
    keterangan: 'Sebanyak 45 paket dalam tahap evaluasi dokumen teknis dan komersial',
  },
  {
    id: 'pkg-eval-1',
    nomorPaket: 'EPI-PROC-2026-EVL-001',
    namaPaket: 'Evaluasi Penawaran Teknis & Harga Pasokan Batubara PLTU Sumatera & Kalimantan',
    pltuList: ['PLTU NAGAN RAYA', 'PLTU TELUK SIRIH', 'PLTU PANGKALAN SUSU', 'PLTU ASAM-ASAM'],
    totalVolumeMt: 8400000,
    tahap: 'Evaluasi Penawaran',
    dokumenTerakhir: 'Berita Acara Evaluasi Sampul I dan Sampul II',
    tanggalMulai: '2026-02-01',
    estimasiSelesai: '2026-03-10',
    pic: 'Agus Setiawan',
    keterangan: 'Klarifikasi spesifikasi batubara CV GAR 4200 - 5000 kcal/kg',
  },
  {
    id: 'pkg-nego-1',
    nomorPaket: 'EPI-PROC-2026-NEG-001',
    namaPaket: 'Klarifikasi dan Negosiasi Penawaran Batubara PLTU Sulawesi & Maluku',
    pltuList: ['PLTU BARRU', 'PLTU PUNAGAYA', 'PLTU AMBON', 'PLTU TIDORE'],
    totalVolumeMt: 3200000,
    tahap: 'Negosiasi',
    dokumenTerakhir: 'Berita Acara Hasil Negosiasi (BAHN)',
    tanggalMulai: '2026-02-05',
    estimasiSelesai: '2026-03-12',
    pic: 'Tri Haryanto',
    keterangan: 'Penyelarasan ketentuan jaminan suplai dan skema penalti demurrage',
  },
  {
    id: 'pkg-ktr-1',
    nomorPaket: 'EPI-PROC-2026-KTR-ALL',
    namaPaket: 'Perjanjian Jual Beli Batubara (PJBB) Terkontrak 2026',
    pltuList: ['PLTU SURALAYA 1-7', 'PLTU TANJUNG JATI B 1-4', 'PLTU PAITON 1-2', 'PLTU LONTAR'],
    totalVolumeMt: 91130000,
    tahap: 'Kontrak',
    dokumenTerakhir: 'Surat Perjanjian Jual Beli Batubara (PJBB) Definitif Terbit',
    tanggalMulai: '2026-01-02',
    estimasiSelesai: '2026-12-31',
    pic: 'Bambang Wahyudi',
    keterangan: 'Kontrak aktif untuk 75 tambang alokasi dengan total alokasi 91.13 juta MT',
  },
  {
    id: 'pkg-fail-1',
    nomorPaket: 'EPI-PROC-2026-GAGAL-001',
    namaPaket: 'Evaluasi Paket Pengadaan Gagal / Diskualifikasi',
    pltuList: ['PLTU SOFIFI', 'PLTU ANGGANA'],
    totalVolumeMt: 740000,
    tahap: 'Pengadaan gagal',
    dokumenTerakhir: 'Surat Penetapan Pengadaan Gagal & Rekomendasi Re-tender',
    tanggalMulai: '2026-01-18',
    estimasiSelesai: '2026-02-28',
    pic: 'Rina Marlina',
    keterangan: '4 tambang tidak memenuhi spesifikasi teknis kadar sulfur & abu boiler',
  },
];
`;

const fileContent = `import type { PltuData, TambangAssignment, ProcurementPackage } from '../types/coal.ts';

export const INITIAL_PLTUS: PltuData[] = ${JSON.stringify(updatedPltus, null, 2)};

export const INITIAL_TAMBANGS: TambangAssignment[] = ${JSON.stringify(allTambangs, null, 2)};

${packagesCode}
`;

fs.writeFileSync(path.resolve('./src/data/initialCoalData.ts'), fileContent, 'utf-8');
console.log('Successfully written pristine initialCoalData.ts!');
