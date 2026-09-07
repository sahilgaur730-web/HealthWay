/**
 * HealthWay - Ambulance Tracker & Fleet Telemetry Component (Demand 12)
 * Government of Maharashtra - 108 Emergency Response Service
 * Strictly zero unicode emojis.
 */

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  PhoneCall, 
  Navigation, 
  MapPin, 
  Clock, 
  Activity, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  User,
  HeartPulse
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { AmbulanceDispatchUnit } from '../../services/emergencyService';

interface AmbulanceTrackerProps {
  emergencyId?: string;
  ambulance?: Partial<AmbulanceDispatchUnit>;
  compact?: boolean;
  onClose?: () => void;
}

export default function AmbulanceTracker({
  emergencyId = 'EMG-108-LIVE',
  ambulance,
  compact = false
}: AmbulanceTrackerProps) {
  const { t, language } = useLanguage();

  const [etaMinutes, setEtaMinutes] = useState(11);
  const [speedKmh, setSpeedKmh] = useState(58);
  const [currentStageIndex, setCurrentStageIndex] = useState(1);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<string>('Just now');

  const vehicleId = ambulance?.vehicleId || 'MH-12-HE-1080';
  const driverName = ambulance?.driverName || 'Santosh Vitthal Shinde (संतोष शिंदे)';
  const driverPhone = ambulance?.driverPhone || '+91 98220 10801';
  const paramedicName = ambulance?.paramedicName || 'Ramesh Patil (EMT Certified)';
  const vehicleType = ambulance?.vehicleType || 'Basic Life Support (BLS)';

  const stages = [
    { key: 'dispatched', labelEn: 'Dispatched from Base', labelMr: 'तळावरून रवाना', labelHi: 'बेस से रवाना' },
    { key: 'en_route', labelEn: 'En Route to Location', labelMr: 'घटनास्थळाकडे मार्गस्थ', labelHi: 'घटनास्थल की ओर' },
    { key: 'on_scene', labelEn: 'Arrived at Patient', labelMr: 'रुग्णाजवळ पोहोचले', labelHi: 'मरीज के पास पहुंचे' },
    { key: 'transporting', labelEn: 'Transporting to Hospital', labelMr: 'रुग्णालयात वाहतूक सुरू', labelHi: 'अस्पताल ले जाया जा रहा है' },
    { key: 'arrived', labelEn: 'Casualty Received at Hospital', labelMr: 'रुग्णालय अपघात विभागात दाखल', labelHi: 'अस्पताल में भर्ती' },
  ];

  // Dynamic telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedKmh(Math.floor(52 + Math.random() * 14));
      setLastTelemetryUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 4000);

    const etaInterval = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);

    return () => {
      clearInterval(interval);
      clearInterval(etaInterval);
    };
  }, []);

  if (compact) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center animate-pulse">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-red-400">{vehicleId}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {language === 'mr' ? stages[currentStageIndex].labelMr : language === 'hi' ? stages[currentStageIndex].labelHi : stages[currentStageIndex].labelEn}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-400 font-mono leading-none">
              ~{etaMinutes}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
              {language === 'mr' ? 'मिनिटे' : language === 'hi' ? 'मिनट' : 'MIN ETA'}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">{driverName.split('(')[0]}</span>
          <a
            href={`tel:${driverPhone.replace(/\s+/g, '')}`}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Driver</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1A4B8C] to-slate-900 text-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-red-300 font-mono">
                  108 DISPATCH ID: {emergencyId}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-200 border border-red-400/30">
                  <Radio className="w-3 h-3 animate-ping" />
                  TELEMETRY ACTIVE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {vehicleId} - {vehicleType}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/20">
            <Clock className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-200">
                {language === 'mr' ? 'अंदाजे वेळ (ETA)' : language === 'hi' ? 'अनुमानित समय (ETA)' : 'Estimated Arrival'}
              </div>
              <div className="text-xl font-black text-amber-300 font-mono leading-none">
                ~{etaMinutes} {language === 'mr' ? 'मिनिटे' : language === 'hi' ? 'मिनट' : 'Minutes'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50 border-b border-slate-200 text-center p-3">
        <div className="p-2">
          <div className="text-[11px] font-bold text-[#546E7A] uppercase">Vehicle Speed</div>
          <div className="text-base font-extrabold text-[#1C2B3A] font-mono mt-0.5 flex items-center justify-center gap-1">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{speedKmh} km/h</span>
          </div>
        </div>
        <div className="p-2">
          <div className="text-[11px] font-bold text-[#546E7A] uppercase">GPS Signal</div>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Locked (9.1m)</span>
          </div>
        </div>
        <div className="p-2">
          <div className="text-[11px] font-bold text-[#546E7A] uppercase">Current Sector</div>
          <div className="text-xs font-bold text-[#1C2B3A] mt-1 truncate px-2">
            Koregaon Bhima Bypass
          </div>
        </div>
        <div className="p-2">
          <div className="text-[11px] font-bold text-[#546E7A] uppercase">Last Ping</div>
          <div className="text-xs font-mono font-bold text-[#546E7A] mt-1">
            {lastTelemetryUpdate}
          </div>
        </div>
      </div>

      {/* Progression Stepper */}
      <div className="p-6 border-b border-slate-200">
        <div className="text-xs font-bold text-[#546E7A] uppercase tracking-wider mb-4">
          {language === 'mr' ? 'रुग्णवाहिका प्रवास प्रगती' : language === 'hi' ? 'एम्बुलेंस यात्रा प्रगति' : 'Ambulance Dispatch Journey'}
        </div>

        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div 
                key={stage.key}
                className={`flex items-center gap-3 p-3 rounded-xl transition ${
                  isCurrent 
                    ? 'bg-blue-50 border border-blue-200 text-[#1A4B8C]' 
                    : isDone 
                      ? 'bg-slate-50 text-slate-700' 
                      : 'text-slate-400 opacity-60'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isDone 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                      ? 'bg-[#1A4B8C] text-white animate-pulse' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-bold">
                    {language === 'mr' ? stage.labelMr : language === 'hi' ? stage.labelHi : stage.labelEn}
                  </div>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C] border border-blue-200">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Crew & Onboard Equipment Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        {/* Crew Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-[#546E7A] uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#1A4B8C]" />
            <span>{language === 'mr' ? 'नियुक्त कर्मचारी (Crew)' : language === 'hi' ? 'तैनात दल (Crew)' : 'Assigned Emergency Crew'}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#546E7A]">Pilot / Driver</div>
                <div className="text-sm font-bold text-[#1C2B3A]">{driverName}</div>
              </div>
              <a
                href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs text-[#546E7A]">EMT / Paramedic</div>
              <div className="text-sm font-bold text-[#1C2B3A] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>{paramedicName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Verification Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-[#546E7A] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#1A4B8C]" />
            <span>{language === 'mr' ? 'वाहनावरील वैद्यकीय उपकरणे' : language === 'hi' ? 'वाहन पर चिकित्सा उपकरण' : 'Onboard Emergency Equipment'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Oxygen Cylinder</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Defibrillator AED</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Delivery Kit</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-slate-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>BLS Vitals Monitor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Map Link Footer */}
      <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#546E7A]">
          <MapPin className="w-4 h-4 text-red-600" />
          <span>Live Coordinate: 18.6210° N, 74.1120° E (Shirur Taluka Route)</span>
        </div>

        <a
          href="https://maps.google.com/?q=18.6210,74.1120"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#1A4B8C] font-bold hover:underline"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

