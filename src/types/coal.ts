export type SpecType = 'HRC' | 'MRC' | 'LRC';

export type PengelolaAset = 
  | 'PLN' 
  | 'PLN IP' 
  | 'PLN NP' 
  | 'IPP Tanggung Jawab PLN' 
  | 'IPP';

export type AkumulasiStatus = 
  | 'Terkontrak dapat dialokasikan'
  | 'Dalam proses kontrak'
  | 'Belum dapat diproses'
  | 'Tidak dapat diproses';

export type TahapPengadaan = 
  | 'Due diligence'
  | 'Due Diligence'
  | 'Penyusunan RKS dan HPE'
  | 'Pelaksanaan'
  | 'Pelaksanaan Pengadaan'
  | 'Evaluasi Penawaran'
  | 'Aanwijzing'
  | 'Negosiasi'
  | 'Pengadaan gagal'
  | 'Pengadaan Gagal'
  | 'Kontrak';

export interface PltuData {
  id: string;
  name: string;
  aset: PengelolaAset;
  tahun: number;
  sumberTambangCount: number;
  kebutuhanMt: number; // in Metric Ton (e.g. 12537536)
  penugasanMt: number;
  konfirmasiMt: number;
  kekuranganMt: number;
  surplusMt: number;
  kekuranganPerSpecMt: number;
  pemenuhanPercent: number;
  status: 'Belum terpenuhi' | 'Terpenuhi' | 'Surplus' | 'Defisit' | 'Cukup';
  specKebutuhan: {
    hrcMt: number;
    mrcMt: number;
    lrcMt: number;
  };
  specKonfirmasi: {
    hrcMt: number;
    mrcMt: number;
    lrcMt: number;
  };
}

export interface TambangAssignment {
  id: string;
  namaTambang: string;
  namaPerusahaan: string;
  nomorIUP: string;
  pltuTujuanId: string;
  pltuTujuanName: string;
  suratPenugasan: 'B-1839 & B-334' | 'B-755' | 'B-905' | 'B-1282' | string;
  spec: SpecType;
  kaloriKcal: number;
  volumePenugasanMt: number; // in Metric Ton
  volumeKonfirmasiMt: number;
  akumulasiStatus: AkumulasiStatus;
  tahapPengadaan: TahapPengadaan;
  nomorKontrak?: string;
  kendalaCatatan?: string;
  picPengadaan?: string;
  terakhirDiperbarui?: string;
}

export interface ProcurementPackage {
  id: string;
  nomorPaket: string;
  namaPaket: string;
  pltuList: string[];
  totalVolumeMt: number;
  tahap: TahapPengadaan;
  dokumenTerakhir: string;
  tanggalMulai: string;
  estimasiSelesai: string;
  pic: string;
  keterangan: string;
}

export interface OverallKPIs {
  jumlahPltuPlnGroup: number;
  jumlahPltuIpp: number;
  jumlahTotalPltu: number;
  jumlahTambangPenugasan: number;
  jumlahTambangKonfirmasi: number;
  totalKebutuhanJtMt: number;
  totalPenugasanJtMt: number;
  totalKonfirmasiJtMt: number;
  selisihKonfirmasiJtMt: number;
  persentaseKonfirmasiVsKebutuhan: number;
  persentasePenugasanVsKebutuhan: number;
}
