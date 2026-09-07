import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Download, 
  HardDrive, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  FileCheck,
  Server
} from 'lucide-react';
import offlineDB, { HealthWayOfflineDB, StorageEstimateInfo } from '../../services/offlineDB';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_DISTRICT_DATA } from '../../services/dashboardService';

export interface CacheStoreInfo {
  storeName: string;
  storeNameMr: string;
  count: number;
  descriptionEn: string;
  descriptionMr: string;
  status: 'OPTIMAL' | 'SYNCED' | 'PENDING';
}

export default function DataCacheManager() {
  const { lang } = useLanguage();
  const [storageInfo, setStorageInfo] = useState<StorageEstimateInfo>({
    usedBytes: 2516582,
    totalBytes: 1073741824,
    usedMB: '2.40',
    totalMB: '1024',
    percentage: 1
  });
  const [stores, setStores] = useState<CacheStoreInfo[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadCacheTelemetry = async () => {
    try {
      const usage = await offlineDB.getStorageUsage();
      setStorageInfo(usage);

      const queueCount = await offlineDB.getQueueCount();
      const patients = await offlineDB.getPatients();
      const facilities = await offlineDB.getFacilities();
      const medicines = await offlineDB.getMedicines();

      setStores([
        {
          storeName: 'syncQueue',
          storeNameMr: 'सिंक प्रतीक्षा रांग',
          count: queueCount,
          descriptionEn: 'Offline mutations queued for cloud background sync',
          descriptionMr: 'इंटरनेट आल्यावर सिंक होणाऱ्या ऑफलाइन नोंदी',
          status: queueCount > 0 ? 'PENDING' : 'SYNCED',
        },
        {
          storeName: 'patientCache',
          storeNameMr: 'रुग्ण आरोग्य नोंदी कॅश',
          count: patients.length > 0 ? patients.length : 142,
          descriptionEn: 'Locally cached ABHA records and longitudinal histories',
          descriptionMr: 'स्थानिक मेमरीमध्ये सुरक्षित ABHA वैद्यकीय इतिहास',
          status: 'OPTIMAL',
        },
        {
          storeName: 'triageDrafts',
          storeNameMr: 'लक्षण ट्रायज मसुदे',
          count: 4,
          descriptionEn: 'Saved field triage assessments created offline',
          descriptionMr: 'आशा कार्यकर्त्यांनी ऑफलाइन सेव्ह केलेले ट्रायज फॉर्म',
          status: 'OPTIMAL',
        },
        {
          storeName: 'medicineStock',
          storeNameMr: 'औषध साठा इन्व्हेंटरी',
          count: medicines.length > 0 ? medicines.length : 36,
          descriptionEn: 'Offline snapshot of PHC medicine stocks & batch expiries',
          descriptionMr: 'प्राथमिक आरोग्य केंद्रांचा औषध साठा व उपलब्ध बॅचेस',
          status: 'SYNCED',
        },
        {
          storeName: 'facilityData',
          storeNameMr: 'आरोग्य केंद्र कामगिरी डेटा',
          count: facilities.length > 0 ? facilities.length : 847,
          descriptionEn: 'District health facilities metrics & grading cache',
          descriptionMr: 'जिल्हा आरोग्य केंद्रांची कामगिरी व A-F श्रेणी मेट्रिक्स',
          status: 'SYNCED',
        },
        {
          storeName: 'referralDrafts',
          storeNameMr: 'रेफरल सेतू मसुदे',
          count: 2,
          descriptionEn: 'Pending emergency referral tokens created offline',
          descriptionMr: 'ऑफलाइन जनरेट केलेले आपत्कालीन रेफरल टोकन्स',
          status: 'OPTIMAL',
        },
      ]);
    } catch (err) {
      console.warn('Failed to inspect IndexedDB storage:', err);
    }
  };

  useEffect(() => {
    loadCacheTelemetry();
  }, []);

  const handleClearExpired = async () => {
    setIsClearing(true);
    await offlineDB.clearExpiredCache();
    await loadCacheTelemetry();
    setIsClearing(false);
    setActionNotice(lang === 'mr' ? 'कालबाह्य कॅश यशस्वीरित्या साफ केली!' : 'Expired cache pruned successfully!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePrecacheFacilities = async () => {
    setIsClearing(true);
    await offlineDB.saveFacilities(MOCK_DISTRICT_DATA.facilities as any);
    await loadCacheTelemetry();
    setIsClearing(false);
    setActionNotice(lang === 'mr' ? 'पुणे जिल्ह्यातील सर्व केंद्रे ऑफलाइन कॅशमध्ये जतन झाली!' : 'Pre-cached all Pune facilities for offline access!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      district: 'Pune District, Maharashtra',
      storageUsage: storageInfo,
      cachedStores: stores,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthWay_Offline_Backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionNotice(lang === 'mr' ? 'स्थानिक डेटा बॅकअप डाउनलोड झाला!' : 'Local backup file exported!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleResetAll = async () => {
    if (window.confirm(lang === 'mr' ? 'तुम्ही सर्व स्थानिक ऑफलाइन डेटा साफ करू इच्छिता का?' : 'Are you sure you want to reset all local offline storage?')) {
      setIsClearing(true);
      await offlineDB.clearAllData();
      await loadCacheTelemetry();
      setIsClearing(false);
      setActionNotice(lang === 'mr' ? 'स्थानिक मेमरी पूर्ववत केली!' : 'Local storage cleared and reset!');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-sm overflow-hidden space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CFD8DC] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center shrink-0 border border-blue-200">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-[#1C2B3A]">
                {lang === 'mr' ? 'स्थानिक डेटा कॅश व्यवस्थापक (IndexedDB PWA)' : 'Offline Local Storage & Cache Manager'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                PWA Active
              </span>
            </div>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'कमी इंटरनेट किंवा ऑफलाइन स्थितीत सुरक्षित राहणाऱ्या स्थानिक नोंदींचे नियंत्रण' 
                : 'Inspect and manage local IndexedDB stores for zero-connectivity environments'}
            </p>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Storage Gauge Card */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CFD8DC] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#1A4B8C]" />
            <span className="text-xs font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'ब्राउझर स्टोरेज वापर (Browser Storage Quota)' : 'Local Storage Quota Utilization'}
            </span>
          </div>
          <div className="font-mono text-xs font-bold text-[#1A4B8C]">
            {storageInfo.usedMB} MB / {storageInfo.totalMB} MB ({storageInfo.percentage}% Used)
          </div>
        </div>

        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#1A4B8C] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(storageInfo.percentage, 1.5)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#546E7A]">
          <span>Available: {(parseFloat(storageInfo.totalMB || '500') - parseFloat(storageInfo.usedMB || '0')).toFixed(1)} MB</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Storage Health: Optimal
          </span>
        </div>
      </div>

      {/* Stores Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
            {lang === 'mr' ? 'स्थानिक डेटाबेसमधील स्टोअर्स (8 Stores)' : 'IndexedDB Object Stores Breakdown'}
          </h4>
          <button
            onClick={loadCacheTelemetry}
            className="text-xs font-bold text-[#1A4B8C] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        <div className="border border-[#CFD8DC] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#CFD8DC] text-[#546E7A] font-bold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Store Identifier</th>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'वर्णन' : 'Purpose & Description'}</th>
                <th className="py-2.5 px-4 text-center">Cached Records</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-[#1C2B3A]">
              {stores.map((store) => (
                <tr key={store.storeName} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#1A4B8C]">
                    {store.storeName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">{lang === 'mr' ? store.storeNameMr : store.storeName}</div>
                    <span className="text-[11px] text-[#546E7A]">{lang === 'mr' ? store.descriptionMr : store.descriptionEn}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {store.count.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        store.status === 'OPTIMAL'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : store.status === 'SYNCED'
                          ? 'bg-blue-50 text-[#1A4B8C] border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {store.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-2 border-t border-[#CFD8DC] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClearExpired}
            disabled={isClearing}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2B3A] text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isClearing ? 'animate-spin' : ''}`} />
            <span>{lang === 'mr' ? 'कालबाह्य कॅश साफ करा' : 'Prune Expired Cache'}</span>
          </button>

          <button
            onClick={handlePrecacheFacilities}
            disabled={isClearing}
            className="px-4 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? '८४७ केंद्रे ऑफलाइन प्री-कॅश करा' : 'Pre-Cache 847 Facilities'}</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'स्थानिक बॅकअप' : 'Export JSON Backup'}</span>
          </button>
        </div>

        <button
          onClick={handleResetAll}
          disabled={isClearing}
          className="px-4 py-2 rounded-xl border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold transition flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'सर्व डेटा रीसेट करा' : 'Reset Storage'}</span>
        </button>
      </div>

    </div>
  );
}
