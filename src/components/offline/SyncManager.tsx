import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  RefreshCw, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  HardDrive, 
  X, 
  ShieldCheck, 
  AlertTriangle,
  Database,
  ArrowRight
} from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useSync } from '../../hooks/useSync';
import { useLanguage } from '../../context/LanguageContext';
import DataCacheManager from './DataCacheManager';

interface SyncManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncManager({ isOpen, onClose }: SyncManagerProps) {
  const { lang } = useLanguage();
  const [activeModalTab, setActiveModalTab] = React.useState<'queue' | 'cache'>('queue');
  const { isOnline, connectionQuality, pendingCount, isSyncing, lastSyncTime, forceSync } = useOffline();
  const { items, storageInfo, removeItem, clearCompleted, refresh } = useSync();

  if (!isOpen) return null;

  const qualityLabels = {
    excellent: { en: '4G / High Speed Broadband', mr: '४G / अतिवेगवान ब्रॉडबँड', color: '#16A34A', bg: '#DCFCE7' },
    good: { en: '3G / 4G Mobile Data', mr: '३G / ४G मोबाइल डेटा', color: '#1A4B8C', bg: '#DBEAFE' },
    poor: { en: '2G / Weak Signal', mr: '२G / कमकुवत नेटवर्क', color: '#D97706', bg: '#FEF3C7' },
    'very-poor': { en: 'Slow 2G / Degraded Latency', mr: 'अत्यंत संथ २G नेटवर्क', color: '#EA580C', bg: '#FFF7ED' },
    offline: { en: 'Disconnected / Offline Mode', mr: 'कनेक्शन नाही / ऑफलाइन मोड', color: '#DC2626', bg: '#FEE2E2' },
    unknown: { en: 'Diagnosing Link...', mr: 'नेटवर्क तपासत आहे...', color: '#64748B', bg: '#F1F5F9' }
  };

  const currentQ = qualityLabels[connectionQuality] || qualityLabels.unknown;

  const offlineFeatures = [
    { en: 'Digital Triage Assessment (Full SOP)', mr: 'डिजिटल ट्रायज व रुग्ण तपासणी (पूर्ण SOP)' },
    { en: 'Offline Patient Record Browsing (Cached)', mr: 'स्थानिक कॅशमधील रुग्ण नोंदी पाहणे' },
    { en: 'Essential Medicine Stock Verification', mr: 'अत्यावश्यक औषध साठा पडताळणी' },
    { en: 'Offline Referral & Indent Draft Queuing', mr: 'रेफरल व औषध मागणी अर्ज स्थानिक मसुदा' },
    { en: 'Immunization & ANC Session Offline Entry', mr: 'लसीकरण व ANC सत्र ऑफलाइन नोंदणी' },
    { en: 'IndexedDB Data Encryption & Instant Auto-Save', mr: 'स्थानिक डेटा एन्क्रिप्शन व स्वयंचलित संचयन' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#1A4B8C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {lang === 'mr' ? 'डेटा सिंक व ऑफलाइन व्यवस्थापक' : 'Data Synchronization & Offline Manager'}
              </h3>
              <p className="text-blue-100 text-xs">
                {lang === 'mr' ? 'स्थानिक कॅश, नेटवर्क गुणवत्ता व प्रलंबित नोंदी' : 'Local IndexedDB cache, connection metrics & upload queue'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex border-b border-[#CFD8DC] bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveModalTab('queue')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeModalTab === 'queue'
                ? 'border-[#1A4B8C] text-[#1A4B8C]'
                : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'सिंक रांग व नेटवर्क' : 'Sync Queue & Network'}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModalTab('cache')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeModalTab === 'cache'
                ? 'border-[#1A4B8C] text-[#1A4B8C]'
                : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'स्थानिक संचयन व कॅश व्यवस्थापक' : 'Storage & Cache Manager'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeModalTab === 'cache' ? (
            <DataCacheManager />
          ) : (
            <>
          {/* Connection Quality Card */}
          <div 
            className="p-4 rounded-2xl border flex items-center justify-between gap-4"
            style={{ backgroundColor: currentQ.bg, borderColor: `${currentQ.color}40` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'white', color: currentQ.color }}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: currentQ.color }}>
                    {lang === 'mr' ? currentQ.mr : currentQ.en}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                    {isOnline ? (lang === 'mr' ? 'ऑनलाइन' : 'Online') : (lang === 'mr' ? 'ऑफलाइन' : 'Offline')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isOnline
                    ? (lang === 'mr' ? 'सर्व्हरशी थेट संपर्क कार्यरत आहे' : 'Real-time telemetry link active with central state servers')
                    : (lang === 'mr' ? 'डेटा स्थानिक IndexedDB मध्ये सुरक्षित जतन केला जाईल' : 'Operating standalone; data buffered safely in IndexedDB')}
                </p>
              </div>
            </div>

            {isOnline && (
              <button
                onClick={() => forceSync()}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-[#1A4B8C] hover:bg-blue-800 text-white font-bold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? (lang === 'mr' ? 'सिंक सुरू...' : 'Syncing...') : (lang === 'mr' ? 'आत्ताच सिंक करा' : 'Sync Now')}</span>
              </button>
            )}
          </div>

          {/* Sync Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-[#CFD8DC] rounded-xl">
              <span className="text-[10px] uppercase font-bold text-[#546E7A] block">
                {lang === 'mr' ? 'प्रलंबित नोंदी' : 'Queued Records'}
              </span>
              <div className="text-xl font-black font-mono text-[#1C2B3A] mt-0.5">
                {pendingCount}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {lang === 'mr' ? 'अपलोडच्या प्रतीक्षेत' : 'Awaiting upload'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-[#CFD8DC] rounded-xl">
              <span className="text-[10px] uppercase font-bold text-[#546E7A] block">
                {lang === 'mr' ? 'शेवटचा सिंक वेळ' : 'Last Synced'}
              </span>
              <div className="text-xs font-bold font-mono text-[#1A4B8C] mt-1 truncate">
                {lastSyncTime ? lastSyncTime.toLocaleTimeString() : (lang === 'mr' ? 'अद्याप नाही' : 'Pending First Sync')}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {lastSyncTime ? lastSyncTime.toLocaleDateString() : 'Auto-sync active'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-[#CFD8DC] rounded-xl col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#546E7A]">
                <span>{lang === 'mr' ? 'स्थानिक संचयन (Storage)' : 'Storage Quota'}</span>
                <HardDrive className="w-3 h-3 text-[#1A4B8C]" />
              </div>
              <div className="text-sm font-black font-mono text-[#1C2B3A] mt-0.5">
                {storageInfo?.usedMB || '15.4'} MB <span className="text-xs font-normal text-slate-500">/ {storageInfo?.totalMB || '500'} MB</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-[#1A4B8C] rounded-full transition-all"
                  style={{ width: `${storageInfo?.percentage || 3}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pending Queue List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-[#1C2B3A] uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1A4B8C]" />
                <span>{lang === 'mr' ? 'सिंक रांगेतील नोंदी (Sync Queue)' : 'Queued Payloads'} ({items.length})</span>
              </h4>

              {items.length > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-rose-700 hover:underline font-bold"
                >
                  {lang === 'mr' ? 'पूर्ण झालेल्या नोंदी काढा' : 'Clear Synced'}
                </button>
              )}
            </div>

            <div className="border border-[#CFD8DC] rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-[#1C2B3A]">
                    {lang === 'mr' ? 'सिंक रांग रिकामी आहे' : 'Sync Queue is Empty'}
                  </p>
                  <p className="text-[11px] text-[#546E7A] mt-0.5">
                    {lang === 'mr' ? 'सर्व नोंदी राज्य सर्व्हरवर यशस्वीरित्या पाठवल्या गेल्या आहेत' : 'All transactions are synced with the central repository'}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : item.status === 'SYNCING' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.status}
                        </span>
                        <strong className="text-xs text-[#1C2B3A]">{item.type}</strong>
                        <span className="font-mono text-[10px] text-slate-400">{item.method}</span>
                      </div>
                      <p className="text-[11px] text-[#546E7A] mt-0.5 truncate max-w-sm">
                        {item.url} · {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                      {item.error && (
                        <p className="text-[10px] text-rose-600 mt-0.5 font-semibold">
                          {item.error} (Retries: {item.retries})
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => item.id && removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title={lang === 'mr' ? 'काढून टाका' : 'Remove item'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Offline Features Checklist */}
          <div>
            <h4 className="font-bold text-[#1C2B3A] uppercase text-xs tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'mr' ? 'ऑफलाइन कार्यरत असलेल्या शासकीय सुविधा' : 'Certified Offline Operations'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {offlineFeatures.map((feat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'mr' ? feat.mr : feat.en}</span>
                </div>
              ))}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#CFD8DC] flex items-center justify-between">
          <span className="text-xs text-[#546E7A]">
            {lang === 'mr' ? 'महाआरोग्य PWA v1.0 · स्थानिक एन्क्रिप्टेड डेटाबेस' : 'HealthWay PWA Service Engine · IndexedDB Tier'}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1C2B3A] text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close Manager'}
          </button>
        </div>

      </div>
    </div>
  );
}
