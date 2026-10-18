import type { PltuData, TambangAssignment, OverallKPIs, ProcurementPackage } from '../types/coal.ts';

/**
 * Calculates overall high-level KPIs based on PLTUs and Tambangs.
 */
export function calculateOverallKPIs(
  pltus: PltuData[],
  tambangs: TambangAssignment[]
): OverallKPIs {
  const jumlahPltuPlnGroup = pltus.filter(
    (p) => p.aset === 'PLN' || p.aset === 'PLN IP' || p.aset === 'PLN NP'
  ).length;
  const jumlahPltuIpp = pltus.filter(
    (p) => p.aset === 'IPP Tanggung Jawab PLN' || p.aset === 'IPP'
  ).length;
  const jumlahTotalPltu = pltus.length;

  const tambangPenugasanSet = new Set(
    tambangs.filter((t) => t.volumePenugasanMt > 0).map((t) => t.namaTambang)
  );
  const tambangKonfirmasiSet = new Set(
    tambangs.filter((t) => t.volumeKonfirmasiMt > 0).map((t) => t.namaTambang)
  );

  const countTambangPenugasan = tambangs.length > 0
    ? tambangPenugasanSet.size
    : 227;

  const countTambangKonfirmasi = tambangs.length > 0
    ? tambangKonfirmasiSet.size
    : 122;

  const totalKebutuhanMt = pltus.reduce((sum, p) => sum + p.kebutuhanMt, 0);
  const totalPenugasanMt = pltus.reduce((sum, p) => sum + p.penugasanMt, 0);
  const totalKonfirmasiMt = pltus.reduce((sum, p) => sum + p.konfirmasiMt, 0);

  const totalKebutuhanJtMt = +(totalKebutuhanMt / 1_000_000).toFixed(2);
  const totalPenugasanJtMt = +(totalPenugasanMt / 1_000_000).toFixed(2);
  const totalKonfirmasiJtMt = +(totalKonfirmasiMt / 1_000_000).toFixed(2);

  const selisihKonfirmasiJtMt = +(
    totalKonfirmasiJtMt - totalKebutuhanJtMt
  ).toFixed(2);

  const persentaseKonfirmasiVsKebutuhan =
    totalKebutuhanMt > 0
      ? +((totalKonfirmasiMt / totalKebutuhanMt) * 100).toFixed(1)
      : 0;

  const persentasePenugasanVsKebutuhan =
    totalKebutuhanMt > 0
      ? +((totalPenugasanMt / totalKebutuhanMt) * 100).toFixed(1)
      : 0;

  return {
    jumlahPltuPlnGroup,
    jumlahPltuIpp,
    jumlahTotalPltu,
    jumlahTambangPenugasan: countTambangPenugasan,
    jumlahTambangKonfirmasi: countTambangKonfirmasi,
    totalKebutuhanJtMt,
    totalPenugasanJtMt,
    totalKonfirmasiJtMt,
    selisihKonfirmasiJtMt,
    persentaseKonfirmasiVsKebutuhan,
    persentasePenugasanVsKebutuhan,
  };
}

export interface WaterfallItem {
  id: string;
  name: string;
  volumeJtMt: number;
  percentageOfKonfirmasi?: number;
  color: string;
  isAccumulationStage?: boolean;
  baseJtMt?: number;
  topJtMt?: number;
}

/**
 * Calculates Waterfall chart data:
 * Kebutuhan, Penugasan, Konfirmasi,
 * then Akumulasi status pengadaan breakdown:
 * - Terkontrak dapat dialokasikan
 * - Dalam proses kontrak
 * - Belum dapat diproses
 * - Tidak dapat diproses
 */
export function calculateWaterfallData(
  pltus: PltuData[],
  tambangs: TambangAssignment[]
): WaterfallItem[] {
  const kpis = calculateOverallKPIs(pltus, tambangs);
  const totalKonfirmasiMt = tambangs.reduce(
    (sum, t) => sum + (t.volumeKonfirmasiMt || 0),
    0
  );

  let terkontrakMt = 0;
  let dalamProsesMt = 0;
  let belumDapatMt = 0;
  let tidakDapatMt = 0;

  for (const t of tambangs) {
    const vol = t.volumeKonfirmasiMt || 0;
    if (t.akumulasiStatus === 'Terkontrak dapat dialokasikan') {
      terkontrakMt += vol;
    } else if (t.akumulasiStatus === 'Dalam proses kontrak') {
      dalamProsesMt += vol;
    } else if (t.akumulasiStatus === 'Belum dapat diproses') {
      belumDapatMt += vol;
    } else if (t.akumulasiStatus === 'Tidak dapat diproses') {
      tidakDapatMt += vol;
    }
  }

  const terkontrakJtMt = +(terkontrakMt / 1_000_000).toFixed(2);
  const dalamProsesJtMt = +(dalamProsesMt / 1_000_000).toFixed(2);
  const belumDapatJtMt = +(belumDapatMt / 1_000_000).toFixed(2);
  const tidakDapatJtMt = +(tidakDapatMt / 1_000_000).toFixed(2);

  // Floating accumulation bases:
  // Step 1: Terkontrak (0 -> terkontrakJtMt)
  const acc1Base = 0;
  const acc1Top = terkontrakJtMt;

  // Step 2: Dalam proses (terkontrakJtMt -> terkontrakJtMt + dalamProsesJtMt)
  const acc2Base = acc1Top;
  const acc2Top = +(acc2Base + dalamProsesJtMt).toFixed(2);

  // Step 3: Belum dapat diproses
  const acc3Base = acc2Top;
  const acc3Top = +(acc3Base + belumDapatJtMt).toFixed(2);

  // Step 4: Tidak dapat diproses
  const acc4Base = acc3Top;
  const acc4Top = +(acc4Base + tidakDapatJtMt).toFixed(2);

  const getPercent = (volMt: number) =>
    totalKonfirmasiMt > 0
      ? +((volMt / totalKonfirmasiMt) * 100).toFixed(2)
      : 0;

  return [
    {
      id: 'kebutuhan',
      name: 'Kebutuhan',
      volumeJtMt: kpis.totalKebutuhanJtMt,
      baseJtMt: 0,
      topJtMt: kpis.totalKebutuhanJtMt,
      color: '#2b5070',
      isAccumulationStage: false,
    },
    {
      id: 'penugasan',
      name: 'Penugasan',
      volumeJtMt: kpis.totalPenugasanJtMt,
      baseJtMt: 0,
      topJtMt: kpis.totalPenugasanJtMt,
      color: '#3d728e',
      isAccumulationStage: false,
    },
    {
      id: 'konfirmasi',
      name: 'Konfirmasi',
      volumeJtMt: kpis.totalKonfirmasiJtMt,
      baseJtMt: 0,
      topJtMt: kpis.totalKonfirmasiJtMt,
      color: '#3d8377',
      isAccumulationStage: false,
    },
    {
      id: 'terkontrak',
      name: 'Terkontrak dapat dialokasikan',
      volumeJtMt: terkontrakJtMt,
      baseJtMt: acc1Base,
      topJtMt: acc1Top,
      percentageOfKonfirmasi: getPercent(terkontrakMt),
      color: '#498563',
      isAccumulationStage: true,
    },
    {
      id: 'dalam_proses',
      name: 'Dalam proses kontrak',
      volumeJtMt: dalamProsesJtMt,
      baseJtMt: acc2Base,
      topJtMt: acc2Top,
      percentageOfKonfirmasi: getPercent(dalamProsesMt),
      color: '#6594b2',
      isAccumulationStage: true,
    },
    {
      id: 'belum_dapat',
      name: 'Belum dapat diproses',
      volumeJtMt: belumDapatJtMt,
      baseJtMt: acc3Base,
      topJtMt: acc3Top,
      percentageOfKonfirmasi: getPercent(belumDapatMt),
      color: '#be9252',
      isAccumulationStage: true,
    },
    {
      id: 'tidak_dapat',
      name: 'Tidak dapat diproses',
      volumeJtMt: tidakDapatJtMt,
      baseJtMt: acc4Base,
      topJtMt: acc4Top,
      percentageOfKonfirmasi: getPercent(tidakDapatMt),
      color: '#b8544a',
      isAccumulationStage: true,
    },
  ];
}

export interface SpecBreakdownResult {
  mrcHrc: {
    kebutuhanJtMt: number;
    konfirmasiJtMt: number;
    pemenuhanPercent: number;
    selisihJtMt: number;
  };
  lrc: {
    kebutuhanJtMt: number;
    konfirmasiJtMt: number;
    pemenuhanPercent: number;
    selisihJtMt: number;
  };
}

/**
 * Calculates coal supply vs demand by specification (MRC & HRC vs LRC).
 */
export function calculateSpecBreakdown(
  pltus: PltuData[],
  tambangs: TambangAssignment[]
): SpecBreakdownResult {
  // Sum from PLTU specs
  let mrcHrcKebutuhanMt = 0;
  let lrcKebutuhanMt = 0;
  let mrcHrcKonfirmasiMt = 0;
  let lrcKonfirmasiMt = 0;

  for (const p of pltus) {
    mrcHrcKebutuhanMt += (p.specKebutuhan.hrcMt || 0) + (p.specKebutuhan.mrcMt || 0);
    lrcKebutuhanMt += p.specKebutuhan.lrcMt || 0;
    mrcHrcKonfirmasiMt += (p.specKonfirmasi?.hrcMt || 0) + (p.specKonfirmasi?.mrcMt || 0);
    lrcKonfirmasiMt += p.specKonfirmasi?.lrcMt || 0;
  }

  // If PLTU spec konfirmasi is not set, derive from tambangs
  if (mrcHrcKonfirmasiMt === 0 && lrcKonfirmasiMt === 0) {
    for (const t of tambangs) {
      const vol = t.volumeKonfirmasiMt || 0;
      if (t.spec === 'HRC' || t.spec === 'MRC') {
        mrcHrcKonfirmasiMt += vol;
      } else if (t.spec === 'LRC') {
        lrcKonfirmasiMt += vol;
      }
    }
  }

  const mrcHrcKebutuhanJt = +(mrcHrcKebutuhanMt / 1_000_000).toFixed(2);
  const mrcHrcKonfirmasiJt = +(mrcHrcKonfirmasiMt / 1_000_000).toFixed(2);
  const lrcKebutuhanJt = +(lrcKebutuhanMt / 1_000_000).toFixed(2);
  const lrcKonfirmasiJt = +(lrcKonfirmasiMt / 1_000_000).toFixed(2);

  const mrcHrcPercent =
    mrcHrcKebutuhanMt > 0
      ? Math.round((mrcHrcKonfirmasiMt / mrcHrcKebutuhanMt) * 100)
      : 0;

  const lrcPercent =
    lrcKebutuhanMt > 0
      ? Math.round((lrcKonfirmasiMt / lrcKebutuhanMt) * 100)
      : 0;

  return {
    mrcHrc: {
      kebutuhanJtMt: mrcHrcKebutuhanJt,
      konfirmasiJtMt: mrcHrcKonfirmasiJt,
      pemenuhanPercent: mrcHrcPercent,
      selisihJtMt: +(mrcHrcKonfirmasiJt - mrcHrcKebutuhanJt).toFixed(2),
    },
    lrc: {
      kebutuhanJtMt: lrcKebutuhanJt,
      konfirmasiJtMt: lrcKonfirmasiJt,
      pemenuhanPercent: lrcPercent,
      selisihJtMt: +(lrcKonfirmasiJt - lrcKebutuhanJt).toFixed(2),
    },
  };
}

export interface SuratComplianceResult {
  surat: string;
  penugasanJtMt: number;
  konfirmasiJtMt: number;
  kepatuhanPercent: number;
  countTambang: number;
}

/**
 * Calculates compliance per Ditjen Minerba Assignment Letter (Surat Penugasan).
 */
export function calculateComplianceBySurat(
  tambangs: TambangAssignment[]
): SuratComplianceResult[] {
  const map = new Map<
    string,
    { penugasanMt: number; konfirmasiMt: number; count: number }
  >();

  for (const t of tambangs) {
    const s = t.suratPenugasan || 'Lainnya';
    const entry = map.get(s) || { penugasanMt: 0, konfirmasiMt: 0, count: 0 };
    entry.penugasanMt += t.volumePenugasanMt || 0;
    entry.konfirmasiMt += t.volumeKonfirmasiMt || 0;
    entry.count += 1;
    map.set(s, entry);
  }

  // Pre-sort based on standard order
  const order = ['B-1839 & B-334', 'B-755', 'B-905', 'B-1282'];
  const keys = Array.from(map.keys()).sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return keys.map((surat) => {
    const data = map.get(surat)!;
    const penugasanJtMt = +(data.penugasanMt / 1_000_000).toFixed(2);
    const konfirmasiJtMt = +(data.konfirmasiMt / 1_000_000).toFixed(2);
    const kepatuhanPercent =
      data.penugasanMt > 0
        ? Math.round((data.konfirmasiMt / data.penugasanMt) * 100)
        : 0;

    return {
      surat,
      penugasanJtMt,
      konfirmasiJtMt,
      kepatuhanPercent,
      countTambang: data.count,
    };
  });
}

export interface ProcurementStageCount {
  tahap: string;
  count: number;
  totalVolumeJtMt: number;
}

/**
 * Counts packages per procurement stage based on packages or tambang assignments.
 */
export function calculateProcurementStagesCount(
  packages: ProcurementPackage[]
): ProcurementStageCount[] {
  const map = new Map<string, { count: number; volumeMt: number }>();

  for (const pkg of packages) {
    const entry = map.get(pkg.tahap) || { count: 0, volumeMt: 0 };
    entry.count += 1;
    entry.volumeMt += pkg.totalVolumeMt || 0;
    map.set(pkg.tahap, entry);
  }

  const standardOrder = [
    'Pelaksanaan',
    'Penyusunan RKS dan HPE',
    'Due diligence',
    'Pengadaan gagal',
    'Negosiasi',
    'Aanwijzing',
    'Kontrak',
  ];

  return standardOrder
    .filter((t) => map.has(t))
    .map((tahap) => {
      const data = map.get(tahap)!;
      return {
        tahap,
        count: data.count,
        totalVolumeJtMt: +(data.volumeMt / 1_000_000).toFixed(2),
      };
    });
}

/**
 * Re-computes dynamic deficit / surplus / status for a PLTU based on current inputs.
 */
export function updatePltuCalculatedFields(pltu: PltuData): PltuData {
  const kebutuhan = pltu.kebutuhanMt || 0;
  const konfirmasi = pltu.konfirmasiMt || 0;
  const selisih = konfirmasi - kebutuhan;

  const kekuranganMt = selisih < 0 ? Math.abs(selisih) : 0;
  const surplusMt = selisih > 0 ? selisih : 0;

  // Spec calculation
  const specKebutuhanHrcMrc =
    (pltu.specKebutuhan.hrcMt || 0) + (pltu.specKebutuhan.mrcMt || 0);
  const specKonfirmasiHrcMrc =
    (pltu.specKonfirmasi.hrcMt || 0) + (pltu.specKonfirmasi.mrcMt || 0);
  const diffHrcMrc = specKonfirmasiHrcMrc - specKebutuhanHrcMrc;

  const specKebutuhanLrc = pltu.specKebutuhan.lrcMt || 0;
  const specKonfirmasiLrc = pltu.specKonfirmasi.lrcMt || 0;
  const diffLrc = specKonfirmasiLrc - specKebutuhanLrc;

  let kekuranganPerSpecMt = 0;
  if (diffHrcMrc < 0) kekuranganPerSpecMt += Math.abs(diffHrcMrc);
  if (diffLrc < 0) kekuranganPerSpecMt += Math.abs(diffLrc);

  const pemenuhanPercent =
    kebutuhan > 0 ? +((konfirmasi / kebutuhan) * 100).toFixed(2) : 100;

  let status: 'Belum terpenuhi' | 'Terpenuhi' | 'Surplus' = 'Belum terpenuhi';
  if (pemenuhanPercent >= 100 && surplusMt > 0) {
    status = 'Surplus';
  } else if (pemenuhanPercent >= 100) {
    status = 'Terpenuhi';
  }

  return {
    ...pltu,
    kekuranganMt,
    surplusMt,
    kekuranganPerSpecMt,
    pemenuhanPercent,
    status,
  };
}
