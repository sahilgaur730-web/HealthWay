import React from 'react';
import { WifiOff, Signal, Database, ShieldCheck } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useLanguage } from '../../context/LanguageContext';

interface OfflineNoticeProps {
  formName?: string;
  formNameMr?: string;
}

export default function OfflineNotice({ formName = 'Record', formNameMr = 'नोंद' }: OfflineNoticeProps) {
  const { lang } = useLanguage();
  const { isOnline, connectionQuality } = useOffline();

  if (isOnline && connectionQuality !== 'poor' && connectionQuality !== 'very-poor') {
    return null;
  }

  const isDegraded = isOnline && (connectionQuality === 'poor' || connectionQuality === 'very-poor');

  return (
    <div className={`p-4 rounded-2xl border mb-4 flex items-start gap-3.5 text-xs ${
      isDegraded
        ? 'bg-amber-50 border-amber-200 text-amber-900'
        : 'bg-rose-50 border-rose-200 text-rose-900'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        isDegraded ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
      }`}>
        {isDegraded ? <Signal className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs uppercase tracking-wider">
            {isDegraded 
              ? (lang === 'mr' ? 'कमी बँडविड्थ नेटवर्क' : 'Low-Bandwidth Connection')
              : (lang === 'mr' ? 'ऑफलाइन कार्य मोड' : 'Offline Operations Active')}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 border border-current">
            IndexedDB Mode
          </span>
        </div>

        <p className="mt-1 text-[11px] leading-relaxed">
          {isDegraded ? (
            lang === 'mr' 
              ? 'नेटवर्क संथ आहे. डेटा सुरक्षित स्थानिक पातळीवर संकलित केला जात आहे आणि कनेक्शन सुधारताच पार्श्वभूमीत आपोआप सिंक होईल.'
              : 'Connection is degraded. Form inputs are compressed and buffered in local IndexedDB for background sync.'
          ) : (
            lang === 'mr'
              ? `सध्या इंटरनेट उपलब्ध नाही. आपण ${formNameMr} निर्धोकपणे भरू शकता — सर्व माहिती स्थानिक प्रणालीत जतन होईल आणि ऑनलाइन येताच आपोआप मुख्य सर्व्हरवर अपलोड होईल.`
              : `You are currently offline. You can safely complete and submit this ${formName} — records are preserved locally and will sync as soon as you reconnect.`
          )}
        </p>
      </div>
    </div>
  );
}
