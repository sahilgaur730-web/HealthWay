/**
 * HealthWay - Award-Winning Institutional Navigation Header
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis, 100% Lucide React icons.
 * Instant trilingual switcher (Marathi, Hindi, English).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight,
  Home,
  Users,
  Stethoscope,
  HeartPulse,
  Building2,
  Hospital,
  Languages,
  PhoneCall,
  FlaskConical,
  Tv,
  Network,
  ChevronDown,
  Layers,
  LogOut,
  User
} from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenModal?: () => void;
}

export default function Header({ onOpenModal }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hubsDropdownOpen, setHubsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const hubsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (hubsRef.current && !hubsRef.current.contains(e.target as Node)) {
        setHubsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navLinks = [
    { 
      labelMr: 'मुख्यपृष्ठ', 
      labelHi: 'होम', 
      labelEn: 'Home', 
      path: '/', 
      icon: Home 
    },
    { 
      labelMr: 'रुग्ण पोर्टल', 
      labelHi: 'मरीज़ पोर्टल', 
      labelEn: 'Patient', 
      path: '/patient', 
      icon: Users,
      badge: 'ABHA'
    },
    { 
      labelMr: 'आशा पोर्टल', 
      labelHi: 'आशा पोर्टल', 
      labelEn: 'ASHA Field', 
      path: '/asha', 
      icon: Stethoscope,
      badge: 'Field'
    },
    { 
      labelMr: 'डॉक्टर पोर्टल', 
      labelHi: 'डॉक्टर पोर्टल', 
      labelEn: 'Doctor', 
      path: '/doctor', 
      icon: HeartPulse,
      badge: '24/7'
    },
    { 
      labelMr: 'जिल्हा प्रशासन', 
      labelHi: 'जिला प्रशासन', 
      labelEn: 'Admin', 
      path: '/admin', 
      icon: Building2,
      badge: 'Live'
    },
  ];

  const operationalHubs = [
    {
      titleMr: 'रेफरल सेतू ट्रॅकर',
      titleHi: 'रेफरल सेतु ट्रैकर',
      titleEn: 'Referral Pipeline',
      descMr: 'रुग्णालय संदर्भ व १०८ रुग्णवाहिका ट्रॅकिंग',
      descHi: 'अस्पताल रेफरल व १०८ एम्बुलेंस ट्रैकिंग',
      descEn: 'Cross-facility hospital transfer tracking',
      path: '/referrals',
      icon: Hospital,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      titleMr: 'डिजिटल लॅब व निदान केंद्र',
      titleHi: 'डिजिटल लैब व जाँच केंद्र',
      titleEn: 'Diagnostic Lab Hub',
      descMr: '४०+ पॅथॉलॉजी चाचण्या व NABL रिपोर्ट सिंक',
      descHi: '४०+ पैथोलॉजी जाँच व NABL रिपोर्ट सिंक',
      descEn: '40+ blood/urine tests with automated sync',
      path: '/diagnostics',
      icon: FlaskConical,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      titleMr: 'क्लिनिक रांग टीव्ही स्क्रीन',
      titleHi: 'क्लिनिक कतार टीवी स्क्रीन',
      titleEn: 'Queue Display TV',
      descMr: 'प्रतीक्षा कक्षासाठी थेट टोकन ऑडिओ-व्हिडिओ',
      descHi: 'प्रतीक्षा कक्ष के लिए लाइव टोकन टीवी',
      descEn: 'OPD waiting room full-screen display',
      path: '/queue-display',
      icon: Tv,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      titleMr: 'ABDM / FHIR R4 मानके',
      titleHi: 'आभा / FHIR R4 मानक',
      titleEn: 'ABDM & FHIR Gateway',
      descMr: 'राष्ट्रीय आरोग्य अभियान व HMIS डेटा आंतरकार्यक्षमता',
      descHi: 'राष्ट्रीय स्वास्थ्य मिशन व HMIS डेटा इंटरऑपरेबिलिटी',
      descEn: 'National interoperability & health locker',
      path: '/interoperability',
      icon: Network,
      color: 'text-sky-600 bg-sky-50'
    }
  ];

  return (
    <header className="bg-white border-b border-[#CFD8DC] sticky top-0 z-40 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-2 sm:gap-4">
          
          {/* 1. Left: Institutional Emblem & Brand */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            title="HealthWay — Government of Maharashtra"
          >
            {/* Seal Badge */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#0B2545] via-[#1A4B8C] to-[#0D3470] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm ring-1 ring-blue-900/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              HW
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-[#1A4B8C] leading-none">
                  HealthWay
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E8F0FE] text-[#1A4B8C] border border-blue-200/80 leading-none">
                  GOV.IN
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#546E7A] font-semibold tracking-wide truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none mt-1">
                {lang === 'mr' ? 'महाराष्ट्र शासन · सार्वजनिक आरोग्य विभाग' : lang === 'hi' ? 'महाराष्ट्र शासन · सार्वजनिक स्वास्थ्य विभाग' : 'Govt of Maharashtra · Public Health Dept'}
              </p>
            </div>
          </div>

          {/* 2. Middle: Desktop Primary Navigation Tabs with Crisp Icons */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer relative ${
                    active 
                      ? 'text-[#1A4B8C] bg-[#E8F0FE] ring-1 ring-blue-300/60 shadow-xs' 
                      : 'text-[#475569] hover:text-[#1A4B8C] hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#1A4B8C]' : 'text-[#64748B]'}`} />
                  <span>{lang === 'mr' ? item.labelMr : lang === 'hi' ? item.labelHi : item.labelEn}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      active 
                        ? 'bg-[#1A4B8C] text-white' 
                        : 'bg-slate-200/70 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Operational Hubs Dropdown */}
            <div className="relative" ref={hubsRef}>
              <button
                onClick={() => setHubsDropdownOpen(!hubsDropdownOpen)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                  hubsDropdownOpen || ['/referrals', '/diagnostics', '/queue-display', '/interoperability'].some(p => location.pathname.startsWith(p))
                    ? 'text-[#1A4B8C] bg-[#E8F0FE]'
                    : 'text-[#475569] hover:text-[#1A4B8C] hover:bg-slate-100'
                }`}
                title="Operational Hubs: Referrals, Labs, Queue TV, Standards"
              >
                <Layers className="w-3.5 h-3.5 text-[#64748B]" />
                <span>{lang === 'mr' ? 'सेवा हब' : lang === 'hi' ? 'सेवा हब' : 'Hubs'}</span>
                <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform duration-200 ${hubsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {hubsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-[#CFD8DC] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-slate-100 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[#1A4B8C]" />
                    <span>{lang === 'mr' ? 'आरोग्य व्यवस्थापन केंद्र' : lang === 'hi' ? 'स्वास्थ्य प्रबंधन हब' : 'Operational Hubs'}</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {operationalHubs.map((hub) => {
                      const HubIcon = hub.icon;
                      return (
                        <button
                          key={hub.path}
                          onClick={() => {
                            setHubsDropdownOpen(false);
                            if (hub.path === '/queue-display') {
                              window.open('/queue-display', '_blank');
                            } else {
                              navigate(hub.path);
                            }
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-start gap-2.5 cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hub.color}`}>
                            <HubIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1C2B3A] group-hover:text-[#1A4B8C] flex items-center gap-1">
                              <span>{lang === 'mr' ? hub.titleMr : lang === 'hi' ? hub.titleHi : hub.titleEn}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">
                              {lang === 'mr' ? hub.descMr : lang === 'hi' ? hub.descHi : hub.descEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right: Utility Controls (Trilingual Switcher, SOS, Login) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Quick 1-Click Trilingual Segmented Pill Switcher */}
            <div className="flex items-center bg-slate-100 border border-[#CFD8DC] rounded-xl p-0.5 shadow-xs">
              <div className="px-1.5 text-slate-500 hidden sm:flex items-center" title="Multilingual Switcher">
                <Languages className="w-3.5 h-3.5 text-[#1A4B8C]" />
              </div>
              <div className="flex items-center gap-0.5">
                {[
                  { code: 'mr' as Language, label: 'मराठी' },
                  { code: 'hi' as Language, label: 'हिंदी' },
                  { code: 'en' as Language, label: 'EN' }
                ].map((item) => {
                  const isActive = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => setLang(item.code)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#1A4B8C] text-white shadow-xs scale-100'
                          : 'text-[#475569] hover:text-[#1C2B3A] hover:bg-slate-200/70'
                      }`}
                      title={`Switch to ${item.label}`}
                      aria-pressed={isActive}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 108 Emergency SOS Button */}
            <button
              onClick={() => navigate('/patient/emergency')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all duration-150 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title={lang === 'mr' ? '१०८ आणीबाणी रुग्णवाहिका तात्काळ बोलवा' : lang === 'hi' ? '१०८ आपातकालीन एम्बुलेंस तुरंत बुलाएं' : '108 Emergency Ambulance SOS'}
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span className="tracking-tight">108 SOS</span>
            </button>

            {/* User Profile Badge (when authenticated) OR Sign In CTA */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-blue-50 border border-blue-200 hover:border-[#1A4B8C] transition text-left cursor-pointer group shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A4B8C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.avatar || user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden md:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1C2B3A] line-clamp-1 max-w-[120px]">
                        {lang === 'mr' ? user.nameMr || user.name : user.name}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#1A4B8C] text-white rounded">
                        {user.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#546E7A] line-clamp-1 max-w-[130px]">
                      {user.village ? (lang === 'mr' ? user.villageMr || user.village : user.village) : (user.facility || user.designation || 'Maharashtra')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#1A4B8C] transition" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#CFD8DC] p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-200">
                      <p className="text-xs font-bold text-[#1C2B3A]">{lang === 'mr' ? user.nameMr || user.name : user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                      <div className="mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-semibold">
                        {user.subCentre || user.facility || user.village || 'Pune District'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        const targetPath = user.role === 'asha' ? '/asha' : user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/patient';
                        navigate(targetPath);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#1A4B8C] hover:bg-blue-50 rounded-lg transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{lang === 'mr' ? 'डॅशबोर्ड उघडा' : 'Open Dashboard'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-between cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'बाहेर पडा (Log Out)' : 'Log Out'}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer active:scale-95 shrink-0"
              >
                <Hospital className="w-3.5 h-3.5 text-blue-200" />
                <span>{lang === 'mr' ? 'लॉगिन / नोंदणी' : 'Sign In / Register'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#546E7A] hover:text-[#1C2B3A] hover:bg-slate-100 transition lg:hidden cursor-pointer"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#CFD8DC] bg-white px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
          
          {/* Quick Trilingual Segmented Switcher in Mobile Drawer */}
          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A4B8C]">
              <Languages className="w-4 h-4" />
              <span>{lang === 'mr' ? 'भाषा निवडा:' : lang === 'hi' ? 'भाषा चुनें:' : 'Select Language:'}</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { code: 'mr' as Language, label: 'मराठी' },
                { code: 'hi' as Language, label: 'हिंदी' },
                { code: 'en' as Language, label: 'English' }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    lang === item.code 
                      ? 'bg-[#1A4B8C] text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-2 py-1">
              {lang === 'mr' ? 'मुख्य आरोग्य पोर्टल्स' : lang === 'hi' ? 'मुख्य स्वास्थ्य पोर्टल' : 'Core Portals'}
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    active 
                      ? 'text-[#1A4B8C] bg-[#E8F0FE]' 
                      : 'text-[#1C2B3A] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#1A4B8C]' : 'text-[#64748B]'}`} />
                    <span>{lang === 'mr' ? item.labelMr : lang === 'hi' ? item.labelHi : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active ? 'bg-[#1A4B8C] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Operational Hubs Links */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-2 py-1">
              {lang === 'mr' ? 'विशिष्ट सेवा हब' : lang === 'hi' ? 'विशिष्ट सेवा हब' : 'Operational Hubs'}
            </div>
            {operationalHubs.map((hub) => {
              const HubIcon = hub.icon;
              return (
                <button
                  key={hub.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (hub.path === '/queue-display') {
                      window.open('/queue-display', '_blank');
                    } else {
                      navigate(hub.path);
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${hub.color}`}>
                      <HubIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>{lang === 'mr' ? hub.titleMr : lang === 'hi' ? hub.titleHi : hub.titleEn}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              );
            })}
          </div>

          {/* Mobile Bottom Actions */}
          <div className="pt-3 border-t border-[#CFD8DC] space-y-2">
            {isAuthenticated && user ? (
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1A4B8C] text-white flex items-center justify-center font-bold text-xs">
                    {user.avatar || user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1C2B3A]">{lang === 'mr' ? user.nameMr || user.name : user.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">@{user.username} · {user.role.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      const targetPath = user.role === 'asha' ? '/asha' : user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/patient';
                      navigate(targetPath);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold text-center"
                  >
                    {lang === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="py-2 px-3 rounded-xl bg-red-100 text-red-700 text-xs font-bold text-center flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'बाहेर' : 'Exit'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-3 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Hospital className="w-4 h-4" />
                <span>{lang === 'mr' ? 'लॉगिन / नोंदणी' : 'Sign In / Register'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/patient/emergency');
              }}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>{lang === 'mr' ? '१०८ आणीबाणी रुग्णवाहिका' : lang === 'hi' ? '१०८ आपातकालीन एम्बुलेंस' : '108 Emergency Ambulance'}</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
}
