import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useLanguage } from '../../context/LanguageContext';
import SyncManager from './SyncManager';

export default function OfflineIndicator() {
  const { lang } = useLanguage();
  const {
    isOnline,
    connectionQuality,
    pendingCount,
    isSyncing,
    lastSyncTime,
    forceSync
  } = useOffline();

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await forceSync();
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 3000);
  };

  // Connection configurations (Strictly zero unicode emojis)
  const config = {
    excellent: {
      labelEn: 'Online · 4G Fast',
      labelMr: 'ऑनलाइन · ४G हाय-स्पीड',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500'
    },
    good: {
      labelEn: 'Online · 3G/4G Stable',
      labelMr: 'ऑनलाइन · ३G/४G स्थिर',
      badgeBg: 'bg-blue-50 text-[#1A4B8C] border-blue-200',
      dot: 'bg-[#1A4B8C]'
    },
    poor: {
      labelEn: 'Weak Signal · 2G Low Bandwidth',
      labelMr: 'कमकुवत नेटवर्क · २G मोड',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500'
    },
    'very-poor': {
      labelEn: 'Degraded Link · Slow 2G',
      labelMr: 'अत्यंत संथ नेटवर्क · २G',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
      dot: 'bg-orange-500'
    },
    offline: {
      labelEn: 'Offline · Local IndexedDB Mode',
      labelMr: 'ऑफलाइन · स्थानिक सुरक्षित मोड',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-600'
    },
    unknown: {
      labelEn: 'Checking Telemetry Link...',
      labelMr: 'नेटवर्क तपासत आहे...',
      badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
      dot: 'bg-slate-400'
    }
  }[connectionQuality] || {
    labelEn: isOnline ? 'Connected' : 'Offline',
    labelMr: isOnline ? 'ऑनलाइन' : 'ऑफलाइन',
    badgeBg: isOnline ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200',
    dot: isOnline ? 'bg-emerald-500' : 'bg-rose-600'
  };

  return (
    <>
      <aside 
        role="status"
        aria-label="Network Status Bar"
        className="w-full bg-white border-b border-[#CFD8DC] px-4 py-1.5 sm:py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs z-30 relative"
      >
        {/* Left: Connection Status Badge */}
        <div 
          onClick={() => setIsManagerOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer group"
          title={lang === 'mr' ? 'सिंक व्यवस्थापक उघडा' : 'Click to open Sync & Storage Manager'}
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${config.dot} ${isSyncing ? 'animate-ping' : ''}`} />
            <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${config.badgeBg}`}>
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span>{lang === 'mr' ? config.labelMr : config.labelEn}</span>
            </div>
          </div>

          {!isOnline && (
            <span className="hidden sm:inline text-[11px] text-rose-700 font-semibold">
              {lang === 'mr' ? '(डेटा स्थानिक पातळीवर सेव्ह होईल)' : '(Data preserved locally)'}
            </span>
          )}
        </div>

        {/* Right: Actions, Pending Queue Pill, Sync Now */}
        <div className="flex items-center gap-2">
          {/* Pending records count badge */}
          {pendingCount > 0 && (
            <div 
              onClick={() => setIsManagerOpen(true)}
              className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-amber-200 transition"
            >
              <Database className="w-3 h-3 text-amber-700" />
              <span>
                {pendingCount} {lang === 'mr' ? 'प्रलंबित' : 'queued'}
              </span>
            </div>
          )}

          {justSynced && pendingCount === 0 && (
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'सर्व नोंदी अद्ययावत!' : 'Synced!'}</span>
            </span>
          )}

          {/* Sync Now Button */}
          {isOnline && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-[#1A4B8C] hover:bg-blue-800 text-white font-bold text-[11px] transition flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (lang === 'mr' ? 'सिंक सुरू...' : 'Syncing...') : (lang === 'mr' ? 'सिंक करा' : 'Sync Now')}</span>
            </button>
          )}

          {/* Open Manager Modal Button */}
          <button
            onClick={() => setIsManagerOpen(true)}
            className="p-1 rounded-lg text-[#546E7A] hover:text-[#1A4B8C] hover:bg-slate-100 transition"
            aria-label={lang === 'mr' ? 'तपशील' : 'Storage & Sync Details'}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Sync Manager Modal */}
      <SyncManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </>
  );
}
