/**
 * HealthWay - Emergency Escalation One-Tap / Hold SOS Button (Demand 12)
 * Government of Maharashtra - Integrated Rural Health Platform
 * 2-Second Press & Hold with Animated SVG Progress Ring, Vibration Telemetry,
 * and 108 Central Ambulance ERSS Dispatch.
 * Strictly zero unicode emojis.
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  Shield, 
  Flame, 
  HeartHandshake, 
  Baby, 
  LifeBuoy, 
  MapPin, 
  Navigation, 
  Hospital, 
  Clock, 
  AlertTriangle,
  Radio,
  CheckCircle2,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  triggerEmergency,
  EMERGENCY_SERVICES,
  NEARBY_HOSPITALS,
  formatLocationForSharing,
  EmergencyDispatchResult
} from '../../services/emergencyService';
import EmergencyAlert from './EmergencyAlert';

const HOLD_DURATION = 2000; // 2 seconds

interface EmergencyButtonProps {
  patientData?: any;
  compact?: boolean;
}

export default function EmergencyButton({ patientData, compact = false }: EmergencyButtonProps) {
  const { t, language } = useLanguage();
  const [phase, setPhase] = useState<'idle' | 'holding' | 'activating' | 'active' | 'cancelled'>('idle');
  const [holdProgress, setHoldProgress] = useState(0);
  const [emergencyData, setEmergencyData] = useState<EmergencyDispatchResult | null>(null);
  const [showFullAlert, setShowFullAlert] = useState(false);

  const holdTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const activateEmergency = useCallback(async () => {
    setPhase('activating');

    // Trigger Device Vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    const result = await triggerEmergency(patientData);
    setEmergencyData(result);
    setPhase('active');
    setShowFullAlert(true);
  }, [patientData]);

  const startHold = useCallback(() => {
    if (phase === 'active' || phase === 'activating') return;
    setPhase('holding');
    startTimeRef.current = Date.now();

    // Progress animation tick (every 50ms)
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 50);

    // Trigger activation after exactly HOLD_DURATION
    holdTimerRef.current = setTimeout(() => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setHoldProgress(100);
      activateEmergency();
    }, HOLD_DURATION);
  }, [phase, activateEmergency]);

  const cancelHold = useCallback(() => {
    if (phase !== 'holding') return;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setPhase('idle');
    setHoldProgress(0);
  }, [phase]);

  const cancelEmergencySession = () => {
    if (typeof window !== 'undefined' && window.confirm(t('emergency.confirmCancel'))) {
      setPhase('cancelled');
      setHoldProgress(0);
      setEmergencyData(null);
      setShowFullAlert(false);
      setTimeout(() => setPhase('idle'), 2000);
    }
  };

  if (showFullAlert && emergencyData) {
    return (
      <EmergencyAlert
        emergencyData={emergencyData}
        patientData={patientData}
        onCancel={() => {
          setShowFullAlert(false);
          cancelEmergencySession();
        }}
      />
    );
  }

  if (compact) {
    return (
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onTouchStart={(e) => { e.preventDefault(); startHold(); }}
        onTouchEnd={cancelHold}
        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
        title={t('emergency.buttonSubtext')}
      >
        <AlertOctagon className="w-3.5 h-3.5 fill-white/20" />
        <span>108 SOS</span>
      </button>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 flex flex-col items-center font-sans text-slate-800">
      
      {/* Background Pulse for Active Phase */}
      {phase === 'active' && (
        <div className="fixed inset-0 bg-rose-600/10 pointer-events-none animate-pulse z-0" />
      )}

      {/* Main Hold-to-Activate Button Container */}
      <div className="flex flex-col items-center gap-3 w-full py-4">
        <div className="relative flex items-center justify-center">
          
          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onTouchStart={(e) => { e.preventDefault(); startHold(); }}
            onTouchEnd={cancelHold}
            onMouseLeave={cancelHold}
            disabled={phase === 'activating'}
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 relative select-none cursor-pointer ${
              phase === 'active'
                ? 'bg-gradient-to-br from-rose-900 to-rose-700 shadow-2xl shadow-rose-900/50'
                : phase === 'holding'
                ? 'bg-gradient-to-br from-rose-700 to-rose-600 scale-95 shadow-2xl ring-12 ring-rose-500/20'
                : 'bg-gradient-to-br from-rose-600 to-red-700 hover:to-rose-600 shadow-xl shadow-rose-600/40 ring-4 ring-rose-600/10'
            }`}
          >
            {/* SVG Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>

            {/* Button Inner Content */}
            <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
              {phase === 'activating' ? (
                <>
                  <div className="w-8 h-8 rounded-full border-3 border-white border-t-transparent animate-spin mb-1" />
                  <span className="text-xs font-black tracking-wider uppercase">
                    {t('emergency.activating')}
                  </span>
                </>
              ) : phase === 'active' ? (
                <>
                  <CheckCircle2 className="w-10 h-10" />
                  <span className="text-sm font-black tracking-wider uppercase">
                    {t('emergency.alertSent')}
                  </span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-11 h-11 stroke-[2.2]" />
                  <span className="text-base font-black tracking-wider uppercase">
                    {t('emergency.buttonText')}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Hold Instructions Feedback */}
        {phase === 'idle' && (
          <p className="text-xs font-semibold text-[#546E7A] text-center max-w-xs">
            {t('emergency.buttonSubtext')}
          </p>
        )}

        {phase === 'holding' && (
          <p className="text-lg font-black font-mono text-rose-600 animate-pulse">
            {Math.max(1, Math.ceil((HOLD_DURATION - (holdProgress / 100) * HOLD_DURATION) / 1000))}s...
          </p>
        )}
      </div>

      {/* Quick Direct-Call Row */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <a
          href="tel:108"
          className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition"
        >
          <PhoneCall className="w-4 h-4" />
          <span>108 Ambulance</span>
        </a>

        <a
          href="tel:100"
          className="p-4 bg-[#1C2B3A] hover:bg-slate-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Shield className="w-4 h-4" />
          <span>100 Police</span>
        </a>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
            {t('emergency.emergencyContacts')}
          </h4>
          <span className="text-[10px] text-slate-400">Maharashtra Toll-Free</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { number: '108', label: t('emergency.ambulance'), icon: Hospital },
            { number: '100', label: t('emergency.police'), icon: Shield },
            { number: '101', label: t('emergency.fireStation'), icon: Flame },
            { number: '181', label: t('emergency.womenHelpline'), icon: HeartHandshake },
            { number: '1098', label: t('emergency.childHelpline'), icon: Baby },
            { number: '1077', label: 'Disaster / आपत्ती', icon: LifeBuoy }
          ].map((srv) => {
            const Icon = srv.icon;
            return (
              <a
                key={srv.number}
                href={`tel:${srv.number}`}
                className="p-3 bg-white border border-[#CFD8DC] rounded-xl hover:bg-slate-50 transition flex flex-col items-center text-center gap-1 shadow-xs"
              >
                <Icon className="w-4 h-4 text-rose-600" />
                <span className="text-[10px] font-semibold text-[#546E7A] truncate w-full">
                  {srv.label}
                </span>
                <span className="text-xs font-black font-mono text-rose-700">
                  {srv.number}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Nearest Hospital Card */}
      <div className="w-full bg-white border border-[#CFD8DC] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-[#1A4B8C]" />
            <span className="text-xs font-bold text-[#1C2B3A]">
              {t('emergency.nearestHospital')}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Emergency Ready
          </span>
        </div>

        <div>
          <h4 className="font-extrabold text-sm text-[#1C2B3A]">
            {language === 'mr' ? NEARBY_HOSPITALS[0].nameMr : language === 'hi' ? NEARBY_HOSPITALS[0].nameHi : NEARBY_HOSPITALS[0].name}
          </h4>
          <p className="text-xs text-[#546E7A] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-rose-600" />
            <span>{NEARBY_HOSPITALS[0].distance} km away · {NEARBY_HOSPITALS[0].address}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <a
            href={`tel:${NEARBY_HOSPITALS[0].phone}`}
            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
          >
            <PhoneCall className="w-3 h-3 text-emerald-600" />
            <span>Call Desk</span>
          </a>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(NEARBY_HOSPITALS[0].address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1A4B8C] border border-blue-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
          >
            <Navigation className="w-3 h-3" />
            <span>Directions</span>
          </a>
        </div>
      </div>

    </div>
  );
}

