import React, { useState, useEffect, useMemo } from 'react';
import type { PltuData, TambangAssignment, ProcurementPackage } from './types/coal.ts';
import { INITIAL_PLTUS, INITIAL_TAMBANGS, INITIAL_PACKAGES } from './data/initialCoalData.ts';
import { 
  calculateOverallKPIs, 
  calculateWaterfallData, 
  calculateSpecBreakdown, 
  calculateComplianceBySurat, 
  calculateProcurementStagesCount,
  updatePltuCalculatedFields,
  WaterfallItem
} from './utils/coalCalculations.ts';
import { exportToExcel, downloadTemplateExcel } from './utils/excelSync.ts';
import { HeaderNavbar } from './components/HeaderNavbar.tsx';
import { KpiSummaryCards } from './components/KpiSummaryCards.tsx';
import { WaterfallProcurementChart } from './components/WaterfallProcurementChart.tsx';
import { DonutConfirmationChart } from './components/DonutConfirmationChart.tsx';
import { SpecBreakdownChart } from './components/SpecBreakdownChart.tsx';
import { ComplianceSuratChart } from './components/ComplianceSuratChart.tsx';
import { ProcurementStagesChart } from './components/ProcurementStagesChart.tsx';
import { PltuMonitoringTable } from './components/PltuMonitoringTable.tsx';
import { PltuFulfillmentChart } from './components/PltuFulfillmentChart.tsx';
import { DetailModal, ModalType } from './components/DetailModal.tsx';
import { ExcelSyncModal } from './components/ExcelSyncModal.tsx';
import { EditPltuModal } from './components/EditPltuModal.tsx';
import { EditTambangModal } from './components/EditTambangModal.tsx';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const STORAGE_KEYS = {
  PLTUS: 'pln_coal_pltus_v5',
  TAMBANGS: 'pln_coal_tambangs_v5',
  PACKAGES: 'pln_coal_packages_v5',
  LAST_SYNC: 'pln_coal_last_sync_v5',
};

export default function App() {
  // Load data from localStorage with baseline fallback
  const [pltus, setPltus] = useState<PltuData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLTUS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PLTUS;
  });

  const [tambangs, setTambangs] = useState<TambangAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAMBANGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TAMBANGS;
  });

  const [packages, setPackages] = useState<ProcurementPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PACKAGES;
  });

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (saved) return saved;
    } catch {}
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  });

  // Modals & UI state
  const [detailModal, setDetailModal] = useState<ModalType | null>(null);
  const [isExcelSyncOpen, setIsExcelSyncOpen] = useState(false);
  const [pltuToEdit, setPltuToEdit] = useState<PltuData | null>(null);
  const [isEditPltuOpen, setIsEditPltuOpen] = useState(false);
  const [tambangToEdit, setTambangToEdit] = useState<TambangAssignment | null>(null);
  const [isEditTambangOpen, setIsEditTambangOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Persist to localStorage whenever state changes
  const persistData = (
    newPltus: PltuData[],
    newTambangs: TambangAssignment[],
    newPackages: ProcurementPackage[]
  ) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setLastUpdatedTime(timeStr);
    try {
      localStorage.setItem(STORAGE_KEYS.PLTUS, JSON.stringify(newPltus));
      localStorage.setItem(STORAGE_KEYS.TAMBANGS, JSON.stringify(newTambangs));
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(newPackages));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  };

  // Calculations
  const kpis = useMemo(() => calculateOverallKPIs(pltus, tambangs), [pltus, tambangs]);
  const waterfallItems = useMemo(() => calculateWaterfallData(pltus, tambangs), [pltus, tambangs]);
  const specData = useMemo(() => calculateSpecBreakdown(pltus, tambangs), [pltus, tambangs]);
  const complianceData = useMemo(() => calculateComplianceBySurat(tambangs), [tambangs]);
  const procurementStages = useMemo(() => calculateProcurementStagesCount(packages), [packages]);

  // Filter PLTU list if a Surat is selected
  const displayedPltus = useMemo(() => {
    if (!selectedSurat) return pltus;
    const matchingPltuNames = new Set(
      tambangs.filter((t) => t.suratPenugasan === selectedSurat).map((t) => t.pltuTujuanName)
    );
    return pltus.filter((p) => matchingPltuNames.has(p.name));
  }, [pltus, tambangs, selectedSurat]);

  // Handlers for PLTU edits
  const handleSavePltu = (savedPltu: PltuData) => {
    const existingIndex = pltus.findIndex((p) => p.id === savedPltu.id);
    let nextPltus: PltuData[];
    if (existingIndex >= 0) {
      nextPltus = [...pltus];
      nextPltus[existingIndex] = savedPltu;
    } else {
      nextPltus = [savedPltu, ...pltus];
    }
    setPltus(nextPltus);
    persistData(nextPltus, tambangs, packages);
    setToast({
      message: `Data PLTU "${savedPltu.name}" berhasil disimpan dan grafik telah diperbarui!`,
      type: 'success',
    });
  };

  const handleDeletePltu = (pltuId: string) => {
    const nextPltus = pltus.filter((p) => p.id !== pltuId);
    setPltus(nextPltus);
    persistData(nextPltus, tambangs, packages);
    setToast({
      message: 'Unit PLTU berhasil dihapus dari sistem.',
      type: 'info',
    });
  };

  // Handlers for Tambang edits
  const handleSaveTambang = (savedTambang: TambangAssignment) => {
    const existingIndex = tambangs.findIndex((t) => t.id === savedTambang.id);
    let nextTambangs: TambangAssignment[];
    if (existingIndex >= 0) {
      nextTambangs = [...tambangs];
      nextTambangs[existingIndex] = savedTambang;
    } else {
      nextTambangs = [savedTambang, ...tambangs];
    }
    setTambangs(nextTambangs);
    persistData(pltus, nextTambangs, packages);
    setToast({
      message: `Sumber tambang "${savedTambang.namaTambang}" berhasil disimpan!`,
      type: 'success',
    });
  };

  const handleDeleteTambang = (tambangId: string) => {
    const nextTambangs = tambangs.filter((t) => t.id !== tambangId);
    setTambangs(nextTambangs);
    persistData(pltus, nextTambangs, packages);
    setToast({
      message: 'Sumber tambang berhasil dihapus.',
      type: 'info',
    });
  };

  // Reset to initial baseline
  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke baseline resmi PLN 2026? Perubahan manual akan direset.')) {
      setPltus(INITIAL_PLTUS);
      setTambangs(INITIAL_TAMBANGS);
      setPackages(INITIAL_PACKAGES);
      persistData(INITIAL_PLTUS, INITIAL_TAMBANGS, INITIAL_PACKAGES);
      setToast({
        message: 'Data berhasil direset ke baseline resmi 2026.',
        type: 'info',
      });
    }
  };

  // Excel sync handler
  const handleExcelSyncSuccess = (
    newPltus: PltuData[],
    newTambangs: TambangAssignment[],
    newPackages: ProcurementPackage[],
    message: string
  ) => {
    setPltus(newPltus);
    setTambangs(newTambangs);
    setPackages(newPackages);
    persistData(newPltus, newTambangs, newPackages);
    setToast({
      message,
      type: 'success',
    });
  };

  // Waterfall bar click handler
  const handleWaterfallBarClick = (item: WaterfallItem) => {
    setDetailModal({
      kind: 'waterfall',
      stageId: item.id,
      title: item.name,
      volumeJtMt: item.volumeJtMt,
      percentage: item.percentageOfKonfirmasi,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 text-xs max-w-md ${
            toast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Info className="w-5 h-5 text-sky-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <HeaderNavbar
        onOpenExcelSync={() => setIsExcelSyncOpen(true)}
        onExportExcel={() => exportToExcel(pltus, tambangs, packages)}
        onDownloadTemplate={downloadTemplateExcel}
        onResetData={handleResetData}
        onAddNewPltu={() => {
          setPltuToEdit(null);
          setIsEditPltuOpen(true);
        }}
        onAddNewTambang={() => {
          setTambangToEdit(null);
          setIsEditTambangOpen(true);
        }}
        lastUpdatedTime={lastUpdatedTime}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Cards matching Image 1 top boxes */}
        <KpiSummaryCards
          kpis={kpis}
          onOpenTambangList={() => {
            setDetailModal({
              kind: 'waterfall',
              stageId: 'konfirmasi',
              title: 'Seluruh Sumber Tambang Terkonfirmasi',
              volumeJtMt: kpis.totalKonfirmasiJtMt,
            });
          }}
        />

        {/* First Main Row: Waterfall & Confirmation / Spec Charts matching Image 1 & 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Waterfall Perencanaan Pasokan & Proses Pengadaan (Image 3) */}
          <div className="lg:col-span-7">
            <WaterfallProcurementChart
              items={waterfallItems}
              onBarClick={handleWaterfallBarClick}
            />
          </div>

          {/* Right: Donut Konfirmasi Penugasan & Hasil Pemenuhan Spesifikasi (Image 1) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <DonutConfirmationChart
              kpis={kpis}
              onClick={() => {
                setDetailModal({
                  kind: 'waterfall',
                  stageId: 'konfirmasi',
                  title: 'Konfirmasi Penugasan Ditjen Minerba',
                  volumeJtMt: kpis.totalKonfirmasiJtMt,
                  percentage: kpis.persentaseKonfirmasiVsKebutuhan,
                });
              }}
            />

            <SpecBreakdownChart
              specData={specData}
              onSelectSpec={(category) => {
                setDetailModal({
                  kind: 'spec',
                  specType: category,
                });
              }}
            />
          </div>
        </div>

        {/* Second Main Row: Kepatuhan Surat Penugasan & Tahapan Pengadaan (Image 2 & 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Kepatuhan Sumber Tambang Penugasan 2026 (Image 2) */}
          <div className="lg:col-span-7">
            <ComplianceSuratChart
              complianceData={complianceData}
              selectedSurat={selectedSurat}
              onSelectSurat={(surat) => {
                setSelectedSurat(surat);
                if (surat) {
                  setDetailModal({
                    kind: 'surat',
                    suratName: surat,
                  });
                }
              }}
            />
          </div>

          {/* Right: Tahapan Pengadaan (Image 5) */}
          <div className="lg:col-span-5">
            <ProcurementStagesChart
              stages={procurementStages}
              onSelectStage={(stageName) => {
                setDetailModal({
                  kind: 'procurement',
                  stageName,
                });
              }}
            />
          </div>
        </div>

        {/* Third Main Row: Chart Pemenuhan per PLTU (Kebutuhan, Penugasan, Konfirmasi) */}
        <div>
          <PltuFulfillmentChart
            pltus={displayedPltus}
            onSelectPltu={(pltu) => {
              setDetailModal({
                kind: 'pltu',
                pltu,
              });
            }}
          />
        </div>

        {/* Fourth Main Row: Monitoring Pemenuhan per PLTU Table (Image 4) */}
        <div>
          <PltuMonitoringTable
            pltus={displayedPltus}
            onSelectPltu={(pltu) => {
              setDetailModal({
                kind: 'pltu',
                pltu,
              });
            }}
            onEditPltu={(pltu) => {
              setPltuToEdit(pltu);
              setIsEditPltuOpen(true);
            }}
            onAddNewPltu={() => {
              setPltuToEdit(null);
              setIsEditPltuOpen(true);
            }}
          />
        </div>
      </main>

      {/* Interactive Detail Modal for Waterfall stages, PLTUs, and Procurement packages */}
      <DetailModal
        modalData={detailModal}
        onClose={() => setDetailModal(null)}
        tambangs={tambangs}
        packages={packages}
        pltus={pltus}
        onEditPltu={(pltu) => {
          setPltuToEdit(pltu);
          setIsEditPltuOpen(true);
        }}
        onEditTambang={(tambang) => {
          setTambangToEdit(tambang);
          setIsEditTambangOpen(true);
        }}
      />

      {/* Two-Way Excel Sync Modal */}
      <ExcelSyncModal
        isOpen={isExcelSyncOpen}
        onClose={() => setIsExcelSyncOpen(false)}
        pltus={pltus}
        tambangs={tambangs}
        packages={packages}
        onSyncSuccess={handleExcelSyncSuccess}
      />

      {/* Add / Edit PLTU Modal */}
      <EditPltuModal
        isOpen={isEditPltuOpen}
        onClose={() => setIsEditPltuOpen(false)}
        pltuToEdit={pltuToEdit}
        onSave={handleSavePltu}
        onDelete={handleDeletePltu}
      />

      {/* Add / Edit Tambang Modal */}
      <EditTambangModal
        isOpen={isEditTambangOpen}
        onClose={() => setIsEditTambangOpen(false)}
        tambangToEdit={tambangToEdit}
        pltus={pltus}
        onSave={handleSaveTambang}
        onDelete={handleDeleteTambang}
      />
    </div>
  );
}
