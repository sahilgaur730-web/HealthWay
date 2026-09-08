/**
 * HealthWay Unified Authentication Portal (Login & Sign-Up)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Supports IndexedDB user registration, pre-seeded accounts, and 1-click hackathon judge evaluation.
 * Strictly zero unicode emojis, 100% Lucide React icons.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Users,
  Stethoscope,
  HeartPulse,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Phone,
  MapPin,
  Hospital,
  Check,
  Loader2,
  Sparkles,
  Info,
  BadgeCheck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../services/offlineDB';
import authService, { DemoAccount } from '../../services/authService';

interface AuthPortalProps {
  initialMode?: 'login' | 'signup';
  initialRole?: UserRole;
}

export default function AuthPortal({ initialMode = 'login', initialRole = 'asha' }: AuthPortalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, setLang } = useLanguage();
  const { login, signUp, quickLogin, demoAccounts, user: currentUser, isAuthenticated } = useAuth();

  // Mode: login vs signup
  const [mode, setMode] = useState<'login' | 'signup'>(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode === 'signup' || queryMode === 'register') return 'signup';
    return initialMode;
  });

  // Selected Role
  const [role, setRole] = useState<UserRole>(() => {
    const queryRole = searchParams.get('role');
    if (queryRole === 'asha' || queryRole === 'doctor' || queryRole === 'admin' || queryRole === 'patient') {
      return queryRole as UserRole;
    }
    return initialRole;
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [fullNameMr, setFullNameMr] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [subCentre, setSubCentre] = useState('');
  const [facility, setFacility] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [regNo, setRegNo] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Role Meta
  const roleMeta: Record<
    UserRole,
    {
      titleEn: string;
      titleMr: string;
      subtitleEn: string;
      subtitleMr: string;
      badge: string;
      color: string;
      bgLight: string;
      borderColor: string;
      icon: React.ElementType;
      dashboardPath: string;
    }
  > = {
    asha: {
      titleEn: 'ASHA Field Worker Portal',
      titleMr: 'आशा कार्यकर्ती पोर्टल',
      subtitleEn: 'Maternal care, village surveys & frontline screening',
      subtitleMr: 'मातृ-बाल संगोपन, गाव सर्वेक्षण व आरोग्य तपासणी',
      badge: 'NHM ASHA',
      color: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-600',
      icon: Stethoscope,
      dashboardPath: '/asha'
    },
    patient: {
      titleEn: 'Citizen & Patient Portal',
      titleMr: 'नागरिक व रुग्ण पोर्टल',
      subtitleEn: 'ABHA records, e-prescriptions & specialist consults',
      subtitleMr: 'आभा आरोग्य नोंदी, औषध उपलब्धता व तपासणी',
      badge: 'Ayushman Bharat',
      color: 'text-[#1A4B8C]',
      bgLight: 'bg-[#E8F0FE]',
      borderColor: 'border-[#1A4B8C]',
      icon: Users,
      dashboardPath: '/patient'
    },
    doctor: {
      titleEn: 'Doctor Teleconsultation Portal',
      titleMr: 'वैद्यकीय अधिकारी पोर्टल',
      subtitleEn: 'Rural clinical teleconsults & digital prescriptions',
      subtitleMr: 'दूरध्वनी सल्लामसलत, ई-प्रिस्क्रिप्शन व रेफरल व्यवस्था',
      badge: 'MMC Medical Officer',
      color: 'text-[#1A4B8C]',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-700',
      icon: HeartPulse,
      dashboardPath: '/doctor'
    },
    admin: {
      titleEn: 'District Health Administration',
      titleMr: 'जिल्हा आरोग्य प्रशासन',
      subtitleEn: '36 facility metrics, supply chains & epidemic surveillance',
      subtitleMr: '३६ केंद्रांचे संचलन, औषध साठा व साथरोग नियंत्रण',
      badge: 'Zilla Parishad',
      color: 'text-slate-800',
      bgLight: 'bg-slate-100',
      borderColor: 'border-slate-800',
      icon: Building2,
      dashboardPath: '/admin'
    }
  };

  const currentRoleInfo = roleMeta[role];

  // Auto-check username availability on debounce
  useEffect(() => {
    if (mode !== 'signup' || !signupUsername.trim() || signupUsername.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const avail = await authService.checkUsernameAvailable(signupUsername.trim());
        setUsernameAvailable(avail);
      } catch {
        setUsernameAvailable(true);
      } finally {
        setCheckingUsername(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [signupUsername, mode]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!signupPassword) return { score: 0, textEn: 'None', textMr: 'नाही', color: 'bg-gray-200' };
    let score = 0;
    if (signupPassword.length >= 6) score += 1;
    if (signupPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(signupPassword)) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;

    if (score <= 2) return { score: 1, textEn: 'Weak', textMr: 'कमकुवत', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, textEn: 'Moderate', textMr: 'मध्यम', color: 'bg-amber-500' };
    return { score: 3, textEn: 'Strong', textMr: 'मजबूत', color: 'bg-emerald-600' };
  }, [signupPassword]);

  // Handle Quick Demo Select
  const handleSelectDemo = (demo: DemoAccount) => {
    setError('');
    setRole(demo.role);
    setMode('login');
    setLoginUsername(demo.username);
    setLoginPassword(demo.password);
  };

  // Handle One-Click Quick Login
  const handleQuickLoginNow = async (demo: DemoAccount) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await login(demo.username, demo.password);
      if (res.success) {
        setSuccessMsg(
          lang === 'mr'
            ? `${demo.nameMr} म्हणून यशस्वीरित्या प्रवेश झाला!`
            : `Logged in successfully as ${demo.name}!`
        );
        setTimeout(() => {
          navigate(roleMeta[demo.role].dashboardPath);
        }, 600);
      } else {
        setError(res.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginUsername.trim()) {
      setError(lang === 'mr' ? 'कृपया वापरकर्ता नाव (Username) टाका' : 'Please enter your username');
      return;
    }
    if (!loginPassword.trim()) {
      setError(lang === 'mr' ? 'कृपया पासवर्ड टाका' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(loginUsername.trim(), loginPassword.trim());
      if (res.success) {
        setSuccessMsg(
          lang === 'mr' ? 'प्रवेश यशस्वी! डॅशबोर्ड उघडत आहे...' : 'Login successful! Opening dashboard...'
        );
        setTimeout(() => {
          navigate(currentRoleInfo.dashboardPath);
        }, 500);
      } else {
        setError(
          res.error ||
            (lang === 'mr'
              ? 'अवैध वापरकर्ता नाव किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा.'
              : 'Invalid username or password. Please verify credentials.')
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during authentication');
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setError(lang === 'mr' ? 'कृपया तुमचे पूर्ण नाव टाका' : 'Please enter your full name');
      return;
    }
    if (!signupUsername.trim() || signupUsername.trim().length < 3) {
      setError(lang === 'mr' ? 'वापरकर्ता नाव किमान ३ अक्षरांचे असावे' : 'Username must be at least 3 characters');
      return;
    }
    if (usernameAvailable === false) {
      setError(
        lang === 'mr'
          ? 'हे वापरकर्ता नाव आधीच अस्तित्वात आहे. दुसरे नाव निवडा.'
          : 'Username is already taken. Please choose another.'
      );
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError(lang === 'mr' ? 'पासवर्ड किमान ६ अक्षरांचा असावा' : 'Password must be at least 6 characters');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError(lang === 'mr' ? 'पासवर्ड जुळत नाहीत' : 'Passwords do not match');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      setError(lang === 'mr' ? 'कृपया वैध १० अंकी मोबाइल नंबर टाका' : 'Please enter valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp({
        username: signupUsername.trim(),
        password: signupPassword.trim(),
        name: fullName.trim(),
        nameMr: fullNameMr.trim() || fullName.trim(),
        role,
        phone: phone.trim(),
        village: village.trim() || (role === 'asha' ? 'Wagholi' : 'Vadgaon'),
        villageMr: village.trim() || (role === 'asha' ? 'वाघोली' : 'वडगाव'),
        subCentre: subCentre.trim() || (role === 'asha' ? `${village || 'Wagholi'} SC` : undefined),
        facility: facility.trim() || (role === 'doctor' ? 'PHC Shirur' : undefined),
        abhaId: abhaId.trim() || (role === 'patient' ? `MH-PN-26-${Date.now().toString().slice(-8)}` : undefined),
        registrationNo: regNo.trim() || (role === 'doctor' ? 'MMC-2024-1189' : undefined)
      });

      if (res.success) {
        setSuccessMsg(
          lang === 'mr'
            ? 'नवीन खाते यशस्वीरित्या तयार झाले! डॅशबोर्ड उघडत आहे...'
            : 'Account registered successfully in database! Launching portal...'
        );
        setTimeout(() => {
          navigate(currentRoleInfo.dashboardPath);
        }, 700);
      } else {
        setError(res.error || 'Registration failed');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      {/* Top Government Ribbon */}
      <div className="bg-[#1A4B8C] text-white px-4 sm:px-6 py-3.5 border-b border-blue-900 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="h-9 w-9 rounded-xl bg-white text-[#1A4B8C] flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
              HW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">HealthWay</span>
                <span className="bg-[#F57C00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DB Portal
                </span>
              </div>
              <span className="text-xs text-blue-200 block leading-none">
                {lang === 'mr'
                  ? 'महाराष्ट्र शासन · एकात्मिक आरोग्य प्रवेश प्रणाली'
                  : 'Govt of Maharashtra · Integrated Rural Health Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Multilingual Switcher */}
            <div className="flex items-center bg-[#0D3470] rounded-xl border border-blue-800 p-0.5 text-xs">
              <button
                onClick={() => setLang('mr')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                  lang === 'mr' ? 'bg-[#1A4B8C] text-white shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                  lang === 'hi' ? 'bg-[#1A4B8C] text-white shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#1A4B8C] text-white shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="text-xs text-blue-100 hover:text-white bg-blue-900/60 hover:bg-blue-900 px-3 py-1.5 rounded-xl border border-blue-700/50 transition cursor-pointer hidden sm:flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'मुख्यपृष्ठ' : 'Home'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#1A4B8C] via-[#F57C00] to-[#2E7D32]" />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-center">
        
        {/* ONE-CLICK HACKATHON EVALUATOR / JUDGE DEMO BANNER */}
        <div className="mb-6 bg-gradient-to-r from-blue-950 via-[#0B2545] to-[#1A4B8C] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F57C00] flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  {lang === 'mr'
                    ? 'त्वरित चाचणी खाती (परीक्षक व ज्यूरी १-क्लिक मूल्यांकन)'
                    : '1-Click Hackathon Evaluator Credentials & Pre-Seeded Accounts'}
                </h3>
                <p className="text-[11px] text-blue-200">
                  {lang === 'mr'
                    ? 'कोणत्याही खात्यावर क्लिक करा — वापरकर्ता नाव व पासवर्ड आपोआप भरून त्वरित लॉगिन करा'
                    : 'Click any pre-seeded profile below to instant-fill or 1-click log in to IndexedDB database'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-2.5 py-1 rounded-lg">
                IndexedDB: Active v4
              </span>
            </div>
          </div>

          {/* Quick Demo Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-3">
            {demoAccounts.map((demo) => {
              const isAsha = demo.role === 'asha';
              const isDoc = demo.role === 'doctor';
              const isAdm = demo.role === 'admin';

              return (
                <div
                  key={demo.username}
                  className="bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl p-2.5 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                          isAsha
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                            : isDoc
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40'
                            : isAdm
                            ? 'bg-slate-500/30 text-slate-200 border border-slate-400/40'
                            : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                        }`}
                      >
                        {demo.role}
                      </span>
                      <span className="text-[10px] text-blue-200/70 font-mono truncate max-w-[70px]">
                        {demo.location.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate group-hover:text-blue-200">
                      {lang === 'mr' ? demo.nameMr : demo.name}
                    </p>
                    <p className="text-[10px] font-mono text-blue-200/80 truncate">
                      {demo.username}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectDemo(demo)}
                      className="flex-1 py-1 px-1.5 rounded bg-white/10 hover:bg-white/25 text-[10px] font-semibold text-center text-blue-100 transition"
                      title={`Fill ${demo.username}`}
                    >
                      {lang === 'mr' ? 'भरा' : 'Fill'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLoginNow(demo)}
                      className="py-1 px-2 rounded bg-[#F57C00] hover:bg-[#E65100] text-white text-[10px] font-bold transition flex items-center justify-center gap-0.5 shadow-xs"
                      title={`Instant Login as ${demo.username}`}
                    >
                      <ArrowRight className="w-2.5 h-2.5" />
                      <span>{lang === 'mr' ? 'थेट' : 'Go'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Auth Container */}
        <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left / Sidebar Column: Role Switcher & Overview */}
          <div className="lg:col-span-4 bg-slate-50 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#CFD8DC] flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#546E7A] block mb-1">
                  {lang === 'mr' ? 'आरोग्य भूमिका निवडा' : 'Select Portal Role'}
                </span>
                <h2 className="text-xl font-black text-[#1C2B3A] tracking-tight">
                  {lang === 'mr' ? 'प्रवेश व नोंदणी' : 'Authentication'}
                </h2>
                <p className="text-xs text-[#546E7A] mt-1 leading-relaxed">
                  {lang === 'mr'
                    ? 'स्थानिक डेटाबेस (IndexedDB) सह सुरक्षित ऑफलाइन व ऑनलाइन प्रवेश'
                    : 'Secure offline & online authentication backed by IndexedDB storage'}
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="space-y-2.5">
                {(['asha', 'patient', 'doctor', 'admin'] as UserRole[]).map((r) => {
                  const info = roleMeta[r];
                  const Icon = info.icon;
                  const isSelected = role === r;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setError('');
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? `${info.borderColor} ${info.bgLight} shadow-sm scale-[1.01]`
                          : 'border-transparent bg-white hover:bg-slate-100/80 text-[#546E7A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-white shadow-xs'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? info.color : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1C2B3A]">
                              {lang === 'mr' ? info.titleMr : info.titleEn}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#546E7A] line-clamp-1">
                            {lang === 'mr' ? info.subtitleMr : info.subtitleEn}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className={`w-4 h-4 ${info.color}`} />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Security Assurance */}
            <div className="mt-8 pt-4 border-t border-[#CFD8DC] space-y-2 text-[11px] text-[#546E7A]">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {lang === 'mr' ? 'ABDM व DPDP कायदा २०२३ नियमावलीनुसार' : 'ABDM & Digital Data Protection Compliant'}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                {lang === 'mr'
                  ? 'सर्व वापरकर्त्यांचा डेटा ब्राउझरच्या स्थानिक सुरक्षित डेटाबेसमध्ये कूटबद्ध साठवला जातो.'
                  : 'Zero third-party trackers. All login credentials and sessions persist in client-side IndexedDB.'}
              </p>
            </div>
          </div>

          {/* Right Column: Form Container (Login or Sign-Up) */}
          <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            
            <div>
              {/* Login vs Sign-Up Segmented Switch */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-[#CFD8DC]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-[#1A4B8C] text-white shadow-xs'
                        : 'text-[#546E7A] hover:text-[#1C2B3A]'
                    }`}
                  >
                    {lang === 'mr' ? 'लॉग इन (Sign In)' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      mode === 'signup'
                        ? 'bg-[#1A4B8C] text-white shadow-xs'
                        : 'text-[#546E7A] hover:text-[#1C2B3A]'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'नवीन नोंदणी (Sign Up)' : 'New Registration'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${currentRoleInfo.bgLight} ${currentRoleInfo.color} border border-current/20`}
                  >
                    {currentRoleInfo.badge}
                  </span>
                </div>
              </div>

              {/* Status Notifications */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}

              {/* ========================================================= */}
              {/* MODE 1: LOGIN FORM */}
              {/* ========================================================= */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                      {lang === 'mr' ? 'वापरकर्ता नाव किंवा आयडी' : 'Username or User ID'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder={
                          role === 'asha'
                            ? 'prachi-ashaworker / rohit-ashaworker'
                            : role === 'doctor'
                            ? 'dr.shinde'
                            : role === 'admin'
                            ? 'dho.pune'
                            : 'sunita.patil'
                        }
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-[#CFD8DC] rounded-xl focus:border-[#1A4B8C] outline-none text-sm font-mono text-[#1C2B3A] transition"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#1C2B3A] uppercase tracking-wide">
                        {lang === 'mr' ? 'पासवर्ड' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const demo = demoAccounts.find((d) => d.role === role);
                          if (demo) {
                            setLoginUsername(demo.username);
                            setLoginPassword(demo.password);
                          }
                        }}
                        className="text-[11px] text-[#1A4B8C] font-semibold hover:underline cursor-pointer"
                      >
                        {lang === 'mr' ? 'पासवर्ड आठवत नाही? (डेमो भरा)' : 'Auto-fill Demo Password'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 border-2 border-[#CFD8DC] rounded-xl focus:border-[#1A4B8C] outline-none text-sm font-mono text-[#1C2B3A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#546E7A]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-[#1A4B8C] focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>{lang === 'mr' ? 'माझे सत्र लक्षात ठेवा' : 'Remember my session'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#1A4B8C] font-bold hover:underline cursor-pointer"
                    >
                      {lang === 'mr' ? 'नवीन खाते तयार करा' : 'Create new account'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1A4B8C] hover:bg-[#0D3470] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'mr' ? 'प्रवेश तपासत आहे...' : 'Authenticating...'}</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>
                          {lang === 'mr'
                            ? `${currentRoleInfo.titleMr} मध्ये प्रवेश करा`
                            : `Sign In to ${currentRoleInfo.titleEn}`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ========================================================= */}
              {/* MODE 2: SIGN UP / REGISTRATION FORM */}
              {/* ========================================================= */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                        {lang === 'mr' ? 'पूर्ण नाव (इंग्रजी)' : 'Full Name (English)'} *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Prachi Patil"
                        className="w-full px-3.5 py-2.5 border-2 border-[#CFD8DC] rounded-xl focus:border-[#1A4B8C] outline-none text-xs sm:text-sm text-[#1C2B3A]"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                        {lang === 'mr' ? 'पूर्ण नाव (मराठीत)' : 'Full Name (Marathi)'}
                      </label>
                      <input
                        type="text"
                        value={fullNameMr}
                        onChange={(e) => setFullNameMr(e.target.value)}
                        placeholder="उदा. प्राची पाटील"
                        className="w-full px-3.5 py-2.5 border-2 border-[#CFD8DC] rounded-xl focus:border-[#1A4B8C] outline-none text-xs sm:text-sm text-[#1C2B3A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                        {lang === 'mr' ? 'वापरकर्ता नाव (Username)' : 'Username'} *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={signupUsername}
                          onChange={(e) =>
                            setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
                          }
                          placeholder={
                            role === 'asha'
                              ? 'e.g. prachi-ashaworker'
                              : role === 'doctor'
                              ? 'e.g. dr.shinde'
                              : 'e.g. sunita.patil'
                          }
                          className={`w-full px-3.5 py-2.5 pr-8 border-2 rounded-xl outline-none text-xs sm:text-sm font-mono ${
                            usernameAvailable === true
                              ? 'border-emerald-500 bg-emerald-50/20'
                              : usernameAvailable === false
                              ? 'border-red-500 bg-red-50/20'
                              : 'border-[#CFD8DC] focus:border-[#1A4B8C]'
                          }`}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                          {checkingUsername ? (
                            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                          ) : usernameAvailable === true ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : usernameAvailable === false ? (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          ) : null}
                        </div>
                      </div>
                      {usernameAvailable === false && (
                        <p className="text-[10px] text-red-600 mt-0.5">
                          {lang === 'mr' ? 'नाव आधीच वापरात आहे' : 'Username already exists'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                        {lang === 'mr' ? '१०-अंकी मोबाइल नंबर' : 'Mobile Number'} *
                      </label>
                      <div className="flex gap-1.5">
                        <div className="flex items-center justify-center border-2 border-[#CFD8DC] rounded-xl px-2.5 bg-gray-50 text-xs font-bold text-[#546E7A]">
                          +91
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9822101001"
                          className="flex-1 border-2 border-[#CFD8DC] rounded-xl px-3 py-2 focus:border-[#1A4B8C] outline-none text-xs sm:text-sm font-mono text-[#1C2B3A]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirmation with Strength Meter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                        {lang === 'mr' ? 'पासवर्ड (किमान ६ अक्षरे)' : 'Password (min 6 chars)'} *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Asha@2026"
                          className="w-full px-3.5 py-2.5 pr-8 border-2 border-[#CFD8DC] rounded-xl focus:border-[#1A4B8C] outline-none text-xs sm:text-sm font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {signupPassword && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                            <div
                              className={`h-full transition-all ${
                                passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                              }`}
                              style={{ width: '33%' }}
                            />
                            <div
                              className={`h-full transition-all ${
                                passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                              }`}
                              style={{ width: '33%' }}
                            />
                            <div
                              className={`h-full transition-all ${
                                passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                              }`}
                              style={{ width: '34%' }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600">
                            {lang === 'mr' ? passwordStrength.textMr : passwordStrength.textEn}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                        {lang === 'mr' ? 'पासवर्ड पुन्हा टाका' : 'Confirm Password'} *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-3.5 py-2.5 border-2 rounded-xl outline-none text-xs sm:text-sm font-mono ${
                          confirmPassword && confirmPassword === signupPassword
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : confirmPassword && confirmPassword !== signupPassword
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-[#CFD8DC] focus:border-[#1A4B8C]'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Role Specific Dynamic Fields */}
                  {role === 'asha' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                      <div>
                        <label className="block text-xs font-bold text-emerald-900 mb-1">
                          {lang === 'mr' ? 'कार्यक्षेत्र गाव (Village)' : 'Assigned Village'}
                        </label>
                        <input
                          type="text"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="Wagholi / Kharadi / Lohegaon"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-emerald-900 mb-1">
                          {lang === 'mr' ? 'उपकेंद्र (Sub-Centre SC)' : 'Assigned Sub-Centre'}
                        </label>
                        <input
                          type="text"
                          value={subCentre}
                          onChange={(e) => setSubCentre(e.target.value)}
                          placeholder="e.g. Wagholi SC"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {role === 'doctor' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200">
                      <div>
                        <label className="block text-xs font-bold text-blue-900 mb-1">
                          {lang === 'mr' ? 'MMC नोंदणी क्रमांक (Reg No)' : 'Medical Council Reg No'}
                        </label>
                        <input
                          type="text"
                          value={regNo}
                          onChange={(e) => setRegNo(e.target.value)}
                          placeholder="MMC-2024-XXXXX"
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 mb-1">
                          {lang === 'mr' ? 'प्राथमिक आरोग्य केंद्र (PHC Facility)' : 'Primary Health Facility'}
                        </label>
                        <input
                          type="text"
                          value={facility}
                          onChange={(e) => setFacility(e.target.value)}
                          placeholder="e.g. PHC Shirur / RH Khed"
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {role === 'patient' && (
                    <div className="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-200 space-y-2">
                      <label className="block text-xs font-bold text-blue-900">
                        {lang === 'mr' ? 'ABHA आयडी किंवा १४-अंकी क्रमांक (पर्यायी)' : 'ABHA Number / ID (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={abhaId}
                        onChange={(e) => setAbhaId(e.target.value)}
                        placeholder="MH-PN-26-XXXXXXXX or user@abdm"
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || usernameAvailable === false}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'mr' ? 'डेटाबेसमध्ये नोंदणी होत आहे...' : 'Writing to IndexedDB...'}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>
                          {lang === 'mr' ? 'नोंदणी करा व थेट पोर्टल उघडा' : 'Register & Enter Healthcare Portal'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#546E7A] pt-1">
                    {lang === 'mr' ? 'आधीच खाते आहे?' : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#1A4B8C] font-bold hover:underline cursor-pointer"
                    >
                      {lang === 'mr' ? 'येथे लॉग इन करा' : 'Sign in here'}
                    </button>
                  </p>
                </form>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#CFD8DC] flex items-center justify-between text-[11px] text-[#546E7A] flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-700" />
                <span>HealthWay v2.4 · Offline IndexedDB DB Ready</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/patient/login')}
                className="text-[#1A4B8C] hover:underline font-semibold"
              >
                {lang === 'mr' ? 'नागरिक OTP / ABHA लॉगिन' : 'Citizen Mobile OTP / ABHA Gateway'}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#CFD8DC] py-3.5 text-center text-xs text-[#546E7A]">
        © 2026 Government of Maharashtra · Public Health Department · Integrated Rural Telemedicine Network
      </footer>
    </div>
  );
}
