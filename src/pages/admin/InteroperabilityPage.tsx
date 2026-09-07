import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import InteropDashboard from '../../components/interop/InteropDashboard';

export default function InteroperabilityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  // Determine initial tab based on path if applicable
  const getInitialTab = (): 'abdm' | 'consent' | 'fhir' | 'systems' | 'export' | 'standards' => {
    if (location.pathname.includes('/abdm')) return 'abdm';
    if (location.pathname.includes('/fhir')) return 'fhir';
    if (location.pathname.includes('/hmis')) return 'export';
    return 'abdm';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb / Header bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CFD8DC] bg-white hover:bg-slate-50 text-xs font-bold text-[#1C2B3A] transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'mr' ? 'प्रशासन डॅशबोर्डकडे परत' : 'Back to Admin Overview'}</span>
          </button>
        </div>

        {/* Master Interoperability Dashboard */}
        <InteropDashboard initialTab={getInitialTab()} />
      </div>
    </DashboardLayout>
  );
}
