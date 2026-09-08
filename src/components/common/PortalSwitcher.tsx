import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wifi, 
  WifiOff, 
  PhoneCall, 
  Building2, 
  Tv, 
  Hospital, 
  FlaskConical,
  Network
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import NotificationBell from '../shared/NotificationBell';
import LanguageSwitcher from '../language/LanguageSwitcher';

export default function PortalSwitcher() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { isOnline, setSimulatedOffline } = useOffline();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-[#0B2545] text-white border-b border-[#1A4B8C] text-xs select-none shadow-xs relative z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-x-2 gap-y-1.5 flex-wrap sm:flex-nowrap min-h-[38px]">
        
        {/* Left: Government Emblem & Dept Info */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 rounded-full bg-[#F57C00] flex items-center justify-center text-[9px] font-bold text-white shadow-xs shrink-0">
              MH
            </div>
            <span className="text-blue-200 font-semibold text-[10px] sm:text-[11px] tracking-tight truncate max-w-[140px] xs:max-w-[190px] sm:max-w-none">
              {lang === 'mr' ? 'महाराष्ट्र शासन · आरोग्य विभाग' : lang === 'hi' ? 'महाराष्ट्र शासन · स्वास्थ्य विभाग' : 'Govt of Maharashtra · Health Dept'}
            </span>
          </div>

          <span className="text-blue-400/40 hidden sm:inline">|</span>

          {/* Offline/Online toggle simulator (Demand 10) */}
          <button 
            onClick={() => setSimulatedOffline(isOnline)}
            title={isOnline ? 'Network Connected · Click to simulate offline mode' : 'Offline Mode Active · Click to restore online connection'}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition ${
              isOnline 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/80' 
                : 'bg-amber-950/80 text-amber-300 border border-amber-700/50 hover:bg-amber-900/80'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Wifi className="w-3 h-3 shrink-0" />
                <span className="hidden xs:inline">{lang === 'mr' ? 'ऑनलाइन' : lang === 'hi' ? 'ऑनलाइन' : 'Online'}</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <WifiOff className="w-3 h-3 shrink-0" />
                <span>{lang === 'mr' ? 'ऑफलाइन सिंक' : lang === 'hi' ? 'ऑफलाइन सिंक' : 'Offline Sync'}</span>
              </>
            )}
          </button>

          <span className="text-blue-400/40 hidden md:inline">|</span>

          {/* Operational Hub Shortcuts */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => navigate('/facility-dashboard')}
              className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-[11px] font-semibold text-emerald-300 transition flex items-center gap-1"
              title="Open Facility Command Dashboard (Demand 9)"
            >
              <Building2 className="w-3 h-3 text-emerald-300" />
              <span>{lang === 'mr' ? 'कमांड डॅशबोर्ड' : lang === 'hi' ? 'सुविधा मैट्रिक्स' : 'Facility Matrix'}</span>
            </button>
            <button
              onClick={() => navigate('/referrals')}
              className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-[11px] font-semibold text-blue-100 transition flex items-center gap-1"
              title="Open Referral Tracking Pipeline (Demand 5)"
            >
              <Hospital className="w-3 h-3 text-blue-300" />
              <span>{lang === 'mr' ? 'रेफरल सेतू' : lang === 'hi' ? 'रेफरल सेतु' : 'Referrals'}</span>
            </button>
            <button
              onClick={() => navigate('/diagnostics')}
              className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-[11px] font-semibold text-amber-300 transition flex items-center gap-1"
              title="Open Diagnostic Coordination Center (Demand 6)"
            >
              <FlaskConical className="w-3 h-3 text-amber-300" />
              <span>{lang === 'mr' ? 'निदान केंद्र' : lang === 'hi' ? 'जाँच केंद्र' : 'Diagnostics'}</span>
            </button>
            <button
              onClick={() => navigate('/interoperability')}
              className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-[11px] font-semibold text-sky-300 transition flex items-center gap-1"
              title="Open ABDM, FHIR & HMIS Standards (Demand 13)"
            >
              <Network className="w-3 h-3 text-sky-300" />
              <span>ABDM/FHIR</span>
            </button>
            <button
              onClick={() => window.open('/queue-display', '_blank')}
              className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-[11px] font-semibold text-blue-200 transition flex items-center gap-1"
              title="Open Clinic Waiting Room TV Screen"
            >
              <Tv className="w-3 h-3 text-blue-300" />
              <span>{lang === 'mr' ? 'रांग टीव्ही' : lang === 'hi' ? 'कतार टीवी' : 'Queue TV'}</span>
            </button>
          </div>
        </div>

        {/* Right: Notification Bell, Global Language Toggle & 108 Emergency Call */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          
          {/* Active Logged-In User Badge or Login Link */}
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => {
                const target = user.role === 'asha' ? '/asha' : user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/patient';
                navigate(target);
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-900/80 hover:bg-blue-800 border border-blue-400/50 text-[10px] text-blue-100 transition cursor-pointer"
              title={`Logged in as ${user.username} (${user.role}) · Click to open dashboard`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-bold truncate max-w-[90px]">{lang === 'mr' ? user.nameMr || user.name : user.name}</span>
              <span className="text-[9px] bg-white/20 px-1 rounded uppercase font-mono">{user.role}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-[10px] text-blue-200 transition cursor-pointer font-bold"
            >
              <span>{lang === 'mr' ? 'लॉगिन' : 'Login'}</span>
            </button>
          )}

          {/* Real-time Overdue & Critical Lab Notification Bell */}
          <NotificationBell />

          {/* Global Multilingual Switcher */}
          <LanguageSwitcher compact={true} />

          {/* 108 Emergency Ambulance Button (Demand 12) */}
          <button
            onClick={() => navigate('/patient/emergency')}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 sm:px-3 py-1 rounded text-[11px] font-bold transition shadow-xs active:scale-95"
            title={lang === 'mr' ? '१०८ आणीबाणी रुग्णवाहिका तात्काळ बोलवा' : lang === 'hi' ? '१०८ आपातकालीन एम्बुलेंस तुरंत बुलाएं' : '108 Emergency Ambulance SOS'}
          >
            <PhoneCall className="w-3 h-3" />
            <span>SOS 108</span>
          </button>
        </div>

      </div>
    </div>
  );
}
