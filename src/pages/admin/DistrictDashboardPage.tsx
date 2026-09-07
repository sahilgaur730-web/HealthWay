import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, ShieldCheck, Printer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import DistrictDashboard from '../../components/dashboard/DistrictDashboard';

export default function DistrictDashboardPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'mr' ? 'प्रशासन डॅशबोर्डवर परत' : 'Back to Admin Overview'}</span>
          </button>
        </div>

        {/* Main District Dashboard Component */}
        <DistrictDashboard onExportReport={() => window.print()} />
      </div>
    </DashboardLayout>
  );
}
