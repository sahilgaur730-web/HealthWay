/**
 * HealthWay Role-Based Permission Guard Component
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis, 100% Lucide React icons.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Building2,
  Stethoscope,
  HeartPulse,
  Users,
  KeyRound,
  Sparkles,
  Loader2,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../services/offlineDB';
import authService, { DemoAccount } from '../../services/authService';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  requiredPortalNameEn: string;
  requiredPortalNameMr: string;
  children: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  requiredPortalNameEn,
  requiredPortalNameMr,
  children
}: RoleGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [switching, setSwitching] = React.useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1A4B8C] mb-4">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-[#1C2B3A]">
          {lang === 'mr' ? 'प्रशासकीय ओळख पडताळणी सुरू आहे...' : 'Verifying Institutional Role Credentials...'}
        </h3>
        <p className="text-xs text-[#546E7A] mt-1">
          Government of Maharashtra · HealthWay Access Control Matrix
        </p>
      </div>
    );
  }

  // If user is admin, allow administrative oversight across all portals
  if (isAuthenticated && user && (user.role === 'admin' || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }

  // Get matching demo accounts for the required role
  const recommendedDemos = authService
    .getDemoAccounts()
    .filter((d) => allowedRoles.includes(d.role));

  const handleQuickSwitch = async (demo: DemoAccount) => {
    setSwitching(true);
    try {
      const res = await login(demo.username, demo.password);
      if (res.success) {
        // User logged in as authorized role, reload current location
        navigate(location.pathname, { replace: true });
      }
    } finally {
      setSwitching(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'asha':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'doctor':
        return <HeartPulse className="w-4 h-4 text-blue-600" />;
      case 'admin':
        return <Building2 className="w-4 h-4 text-slate-700" />;
      case 'patient':
      default:
        return <Users className="w-4 h-4 text-[#1A4B8C]" />;
    }
  };

  const getRoleHome = (roleName?: UserRole) => {
    switch (roleName) {
      case 'asha':
        return '/asha';
      case 'doctor':
        return '/doctor';
      case 'admin':
        return '/admin';
      case 'patient':
      default:
        return '/patient';
    }
  };

  // Case 1: Unauthenticated User
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F5F7FA]">
        <div className="max-w-xl w-full bg-white rounded-2xl border-2 border-[#CFD8DC] shadow-md p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                <ShieldAlert className="w-3 h-3" />
                <span>{lang === 'mr' ? 'सुरक्षित प्रशासकीय प्रवेश' : 'Institutional Access Required'}</span>
              </div>
              <h2 className="text-lg font-black text-[#1C2B3A] mt-1">
                {lang === 'mr' ? requiredPortalNameMr : requiredPortalNameEn}
              </h2>
            </div>
          </div>

          <div className="py-5 text-xs text-[#546E7A] leading-relaxed">
            {lang === 'mr'
              ? `या पोर्टलवर प्रवेश करण्यासाठी ${allowedRoles.join(' किंवा ')} खात्यासह अधिकृत लॉगिन आवश्यक आहे. कृपया आपले अधिकृत वापरकर्ता नाव आणि पासवर्ड वापरून लॉगिन करा.`
              : `Access to this healthcare portal requires verified credentials with one of the following roles: [${allowedRoles.join(', ')}]. Please sign in to proceed.`}
          </div>

          {/* Quick 1-Click Evaluation Credentials for Allowed Roles */}
          {recommendedDemos.length > 0 && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl mb-5">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A4B8C]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F57C00]" />
                  <span>
                    {lang === 'mr' ? 'परीक्षक / १-क्लिक चाचणी प्रवेश' : '1-Click Role-Verified Login (Evaluator)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  {allowedRoles.join(' / ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                {recommendedDemos.slice(0, 4).map((demo) => (
                  <div
                    key={demo.username}
                    className="bg-white p-2.5 rounded-lg border border-blue-200 flex items-center justify-between gap-2 hover:border-blue-400 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(demo.role)}
                        <span className="text-xs font-bold text-[#1C2B3A] truncate">
                          {lang === 'mr' ? demo.nameMr : demo.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">({demo.username})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{demo.location}</p>
                    </div>
                    <button
                      type="button"
                      disabled={switching}
                      onClick={() => handleQuickSwitch(demo)}
                      className="px-3 py-1.5 bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {switching ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <span>{lang === 'mr' ? 'प्रवेश करा' : 'Enter'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/login?role=${allowedRoles[0]}`)}
              className="flex-1 bg-[#1A4B8C] hover:bg-[#0D3470] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'लॉगिन पृष्ठावर जा' : 'Standard Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 border border-[#CFD8DC] hover:bg-gray-50 text-[#1C2B3A] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'मुख्यपृष्ठ' : 'Return Home'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated user with unauthorized role
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F5F7FA]">
      <div className="max-w-xl w-full bg-white rounded-2xl border-2 border-red-200 shadow-md p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 border-b border-red-100">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-300 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
              <Lock className="w-3 h-3" />
              <span>{lang === 'mr' ? 'परवानगी नाकारली' : 'Institutional Permission Notice'}</span>
            </div>
            <h2 className="text-lg font-black text-[#1C2B3A] mt-1">
              {lang === 'mr' ? requiredPortalNameMr : requiredPortalNameEn}
            </h2>
          </div>
        </div>

        {/* Current Active Account Card */}
        <div className="my-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {lang === 'mr' ? 'सध्याचे सक्रिय खाते' : 'Currently Active Session'}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-bold uppercase">
              {user.role}
            </span>
          </div>
          <p className="font-bold text-[#1C2B3A] text-sm">
            {lang === 'mr' ? user.nameMr || user.name : user.name}
          </p>
          <p className="text-[11px] text-gray-500 font-mono">{user.username}</p>
          <p className="text-[11px] text-gray-600 mt-1">
            {user.designation || user.facility || user.subCentre || 'Health Staff'}
          </p>
        </div>

        <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 mb-4 leading-relaxed">
          {lang === 'mr'
            ? `आपले सध्याचे खाते [${user.role.toUpperCase()}] म्हणून नोंदणीकृत आहे. या विभागात प्रवेश करण्यासाठी [${allowedRoles.join(', ').toUpperCase()}] परवानगी आवश्यक आहे.`
            : `Your current session role is [${user.role.toUpperCase()}]. Access to this clinical section is strictly restricted to [${allowedRoles.join(', ').toUpperCase()}] personnel.`}
        </p>

        {/* Quick Role Switcher */}
        {recommendedDemos.length > 0 && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-5">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'mr' ? 'त्वरित अधिकृत खात्यावर बदला' : 'Quick Switch to Authorized Account'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                1-Click Switch
              </span>
            </div>

            <div className="space-y-2">
              {recommendedDemos.slice(0, 4).map((demo) => (
                <div
                  key={demo.username}
                  className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between gap-2 hover:border-emerald-400 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {getRoleIcon(demo.role)}
                      <span className="text-xs font-bold text-[#1C2B3A] truncate">
                        {lang === 'mr' ? demo.nameMr : demo.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">({demo.username})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{demo.location}</p>
                  </div>
                  <button
                    type="button"
                    disabled={switching}
                    onClick={() => handleQuickSwitch(demo)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {switching ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <span>{lang === 'mr' ? 'बदला' : 'Switch'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(getRoleHome(user.role))}
            className="flex-1 bg-[#1A4B8C] hover:bg-[#0D3470] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {lang === 'mr' ? 'माझ्या अधिकृत डॅशबोर्डवर परत जा' : `Go to My ${user.role.toUpperCase()} Portal`}
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/login?role=${allowedRoles[0]}`)}
            className="px-4 py-2.5 border border-[#CFD8DC] hover:bg-gray-50 text-[#1C2B3A] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'दुसऱ्या खात्याने लॉगिन करा' : 'Sign in as Different User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
