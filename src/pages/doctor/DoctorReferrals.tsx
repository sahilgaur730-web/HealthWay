import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Hospital, 
  FlaskConical, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import ReferralTracker from '../../components/referral/ReferralTracker';
import DiagnosticDashboard from '../../components/diagnostic/DiagnosticDashboard';

export default function DoctorReferrals() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'REFERRALS' | 'DIAGNOSTICS'>('REFERRALS');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/doctor')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'mr' ? 'डॉक्टर डॅशबोर्डवर परत' : 'Back to Doctor Dashboard'}</span>
            </button>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {lang === 'mr' ? 'तज्ञ संदर्भ व लॅब समन्वय केंद्र' : 'Care Coordination & Referral Network'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'प्राथमिक आरोग्य केंद्र शिरूर ते जिल्हा रुग्णालय समन्वय, रुग्णवाहिका पाठपुरावा व निदान चाचण्या' 
                : 'Manage tertiary hospital transfers, ambulance dispatch, 7-stage SLAs and digital lab orders'}
            </p>
          </div>

          {/* Unified Hub Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('REFERRALS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'REFERRALS'
                  ? 'bg-white text-[#1A4B8C] shadow-xs'
                  : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              <Hospital className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'रेफरल पाइपलाइन (Demand 5)' : 'Referrals (Demand 5)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('DIAGNOSTICS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'DIAGNOSTICS'
                  ? 'bg-white text-[#1A4B8C] shadow-xs'
                  : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'डिजिटल लॅब समन्वय (Demand 6)' : 'Diagnostics (Demand 6)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'REFERRALS' ? (
          <ReferralTracker />
        ) : (
          <DiagnosticDashboard allowOrdering={true} />
        )}

      </div>
    </DashboardLayout>
  );
}
