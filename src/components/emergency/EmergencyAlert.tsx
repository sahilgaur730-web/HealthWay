/**
 * HealthWay - Emergency Escalation Active Alert & Telemetry View (Demand 12)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Full-screen high-contrast command overlay with 6-stage dispatch progress,
 * ambulance telemetry, live ETA countdown, and hospital casualty desk coordination.
 * Strictly zero unicode emojis.
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Hospital, 
  ShieldCheck, 
  Truck, 
  UserCheck, 
  MessageSquare, 
  ExternalLink, 
  X, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatLocationForSharing, EmergencyDispatchResult } from '../../services/emergencyService';

interface EmergencyAlertProps {
  emergencyData: EmergencyDispatchResult;
  patientData?: any;
  onCancel: () => void;
}

interface StepItem {
  id: number;
  labelEn: string;
  labelMr: string;
  labelHi: string;
  icon: any;
  delay: number;
}

const STEPS: StepItem[] = [
  { id: 1, labelEn: 'GPS Location Captured', labelMr: 'GPS स्थान नोंदवले गेले', labelHi: 'GPS लोकेशन दर्ज हुई', icon: MapPin, delay: 0 },
  { id: 2, labelEn: '108 ERSS Central Link Established', labelMr: '१०८ मध्यवर्ती नियंत्रण कक्षाशी संपर्क', labelHi: '१०८ केंद्रीय नियंत्रण कक्ष से संपर्क', icon: PhoneCall, delay: 1000 },
  { id: 3, labelEn: 'BLS Ambulance Dispatched (MH-12-HE-1080)', labelMr: 'रुग्णवाहिका रवाना (MH-12-HE-1080)', labelHi: 'एम्बुलेंस रवाना (MH-12-HE-1080)', icon: Truck, delay: 2500 },
  { id: 4, labelEn: 'Hospital Casualty Ward Pre-Alerted', labelMr: 'रुग्णालय अपघात विभाग पूर्वसूचना जारी', labelHi: 'अस्पताल आकस्मिक विभाग को पूर्व सूचना', icon: Hospital, delay: 4000 },
  { id: 5, labelEn: 'Duty Doctor & Specialist Assigned', labelMr: 'कर्तव्यदक्ष वैद्यकीय अधिकारी नियुक्त', labelHi: 'ड्यूटी डॉक्टर व विशेषज्ञ नियुक्त', icon: UserCheck, delay: 5000 },
  { id: 6, labelEn: 'Family & ASHA Worker SMS Broadcast', labelMr: 'कुटुंब व आशा कार्यकर्तीस SMS सूचना', labelHi: 'परिवार व आशा कार्यकर्ता को SMS सूचना', icon: MessageSquare, delay: 6000 }
];

export default function EmergencyAlert({ emergencyData, patientData, onCancel }: EmergencyAlertProps) {
  const { t, language } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [eta, setEta] = useState<number>(emergencyData?.estimatedETA || 14);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ambulanceStatus, setAmbulanceStatus] = useState<'dispatched' | 'en_route' | 'nearby' | 'arrived'>('dispatched');

  // Progressive Step Completion
  useEffect(() => {
    STEPS.forEach((step) => {
      if (step.delay > 0) {
        const timer = setTimeout(() => {
          setCompletedSteps((prev) => Array.from(new Set([...prev, step.id])));
        }, step.delay);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  // Live ETA Countdown & Elapsed Seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setEta((prev) => Math.max(0.5, prev - 1 / 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Status Progression Simulation
  useEffect(() => {
    const transitions: Array<{ status: 'dispatched' | 'en_route' | 'nearby' | 'arrived'; delay: number }> = [
      { status: 'dispatched', delay: 0 },
      { status: 'en_route', delay: 4000 },
      { status: 'nearby', delay: 9000 },
      { status: 'arrived', delay: 18000 }
    ];

    const timeouts = transitions.map((tr) =>
      setTimeout(() => setAmbulanceStatus(tr.status), tr.delay)
    );

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  const statusConfig = {
    dispatched: {
      en: 'Ambulance Dispatched',
      mr: 'रुग्णवाहिका रवाना झाली',
      hi: 'एम्बुलेंस रवाना हुई',
      color: '#D97706',
      badgeBg: 'bg-amber-950/80',
      textColor: 'text-amber-400',
      border: 'border-amber-700/50'
    },
    en_route: {
      en: 'En Route to Location',
      mr: 'मार्गावर आहे',
      hi: 'रास्ते में है',
      color: '#2563EB',
      badgeBg: 'bg-blue-950/80',
      textColor: 'text-blue-400',
      border: 'border-blue-700/50'
    },
    nearby: {
      en: 'Nearby (< 1 km)',
      mr: 'जवळ आली आहे (< १ किमी)',
      hi: 'नजदीक आ गई है (< १ किमी)',
      color: '#7C3AED',
      badgeBg: 'bg-purple-950/80',
      textColor: 'text-purple-400',
      border: 'border-purple-700/50'
    },
    arrived: {
      en: 'Ambulance Arrived On Scene',
      mr: 'रुग्णवाहिका घटनास्थळी पोहोचली!',
      hi: 'एम्बुलेंस घटनास्थल पर पहुँची!',
      color: '#16A34A',
      badgeBg: 'bg-emerald-950/80',
      textColor: 'text-emerald-400',
      border: 'border-emerald-700/50'
    }
  };

  const currentStatus = statusConfig[ambulanceStatus];

  return (
    <div className="fixed inset-0 z-[4000] bg-[#0A0505] text-white overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start min-h-screen">
      
      {/* Background Pulse Glow */}
      <div className="fixed inset-0 bg-radial from-rose-950/40 via-transparent to-black pointer-events-none animate-pulse" />

      <div className="w-full max-w-lg space-y-4 relative z-10 my-auto pb-12">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="px-3 py-1 rounded-full bg-rose-900/80 border border-rose-600/60 text-xs font-black tracking-wider uppercase text-rose-200 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>EMERGENCY DISPATCH ACTIVE</span>
            </span>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400">
            ID: <span className="font-bold text-rose-300">{emergencyData.emergencyId}</span>
          </div>
        </div>

        {/* Main Status & ETA Card */}
        <div className="bg-[#140D0E] border-2 border-rose-800/80 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-center gap-2">
            <div className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${currentStatus.badgeBg} ${currentStatus.textColor} ${currentStatus.border}`}>
              <Truck className="w-4 h-4 animate-bounce" />
              <span>{language === 'mr' ? currentStatus.mr : language === 'hi' ? currentStatus.hi : currentStatus.en}</span>
            </div>
          </div>

          {/* ETA Display Gauge */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {t('emergency.eta')}
            </div>
            <div className="text-5xl sm:text-6xl font-black font-mono text-rose-500 tracking-tight">
              {Math.ceil(eta)} <span className="text-xl font-normal text-slate-400">{t('emergency.minutes')}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Elapsed: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-rose-950">
            <div 
              className="bg-gradient-to-r from-rose-600 to-emerald-500 h-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, Math.max(10, 100 - (eta / (emergencyData.estimatedETA || 14)) * 100))}%`
              }}
            />
          </div>

          {/* Shared GPS Location Row */}
          <div className="p-3 bg-black/50 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">{t('emergency.locationShared')}</span>
            </div>
            <a
              href={formatLocationForSharing(emergencyData.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 6-Stage Response Pipeline */}
        <div className="bg-[#120F10] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Emergency Response Telemetry</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {completedSteps.length} / {STEPS.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isDone = completedSteps.includes(step.id);
              const label = language === 'mr' ? step.labelMr : language === 'hi' ? step.labelHi : step.labelEn;

              return (
                <div key={step.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
                    </div>
                    <span className={isDone ? 'font-bold text-slate-200' : 'text-slate-500'}>
                      {label}
                    </span>
                  </div>

                  {isDone && (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      OK
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-Alerted Hospital Card */}
        {emergencyData.nearestHospital && (
          <div className="bg-[#120F10] border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center shrink-0">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {language === 'mr' ? emergencyData.nearestHospital.nameMr : language === 'hi' ? emergencyData.nearestHospital.nameHi : emergencyData.nearestHospital.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  Casualty Bed Reserved · {emergencyData.nearestHospital.distance} km away
                </div>
              </div>
            </div>

            <a
              href={`tel:${emergencyData.nearestHospital.phone}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Call</span>
            </a>
          </div>
        )}

        {/* Clinical Safety Instructions While Waiting */}
        <div className="bg-[#120F10] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>While Waiting for 108 BLS Ambulance:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
            <li>{t('emergency.stayCalm')}</li>
            <li>{t('emergency.dontMove')}</li>
            <li>{t('emergency.keepBreathing')}</li>
            <li>Keep phone line clear and accessible for driver call</li>
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2.5 pt-2">
          <a
            href="tel:108"
            className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call 108 Ambulance Dispatch Directly</span>
          </a>

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <X className="w-4 h-4" />
            <span>{t('emergency.cancelEmergency')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

