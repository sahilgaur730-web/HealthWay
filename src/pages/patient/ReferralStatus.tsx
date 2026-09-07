import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Hospital, 
  FlaskConical, 
  Clock, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { referralService, ReferralItem } from '../../services/referralService';
import { diagnosticService } from '../../services/diagnosticService';
import PatientReferralView from '../../components/referral/PatientReferralView';
import TestOrderTracker from '../../components/diagnostic/TestOrderTracker';

export default function ReferralStatus() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [activeView, setActiveView] = useState<'REFERRAL' | 'DIAGNOSTICS'>('REFERRAL');
  const [tokenSearch, setTokenSearch] = useState('');

  // Load patient referrals
  const [patientReferrals, setPatientReferrals] = useState<ReferralItem[]>(() => 
    referralService.getReferralsByPatientId('PT-001')
  );
  const [selectedReferralId, setSelectedReferralId] = useState<string>(() =>
    patientReferrals.length > 0 ? patientReferrals[0].id : ''
  );

  const searchedReferral = tokenSearch.trim() ? referralService.getReferralById(tokenSearch.trim().toUpperCase()) : null;

  const currentReferral = 
    searchedReferral ||
    referralService.getReferralById(selectedReferralId) || 
    patientReferrals[0] || 
    referralService.getAllReferrals()[0];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'mr' ? 'डॅशबोर्डवर परत' : 'Back to Dashboard'}</span>
          </button>

          {/* Tab Switcher: Referral vs Diagnostic Orders */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('REFERRAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'REFERRAL'
                  ? 'bg-white text-[#1A4B8C] shadow-xs'
                  : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              <Hospital className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'रेफरल स्थिती (Pipeline)' : 'Referral Pipeline'}</span>
            </button>

            <button
              onClick={() => setActiveView('DIAGNOSTICS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'DIAGNOSTICS'
                  ? 'bg-white text-[#1A4B8C] shadow-xs'
                  : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'निदान तपासण्या (Lab Tests)' : 'Lab Orders & Results'}</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeView === 'REFERRAL' ? (
          <div className="space-y-4">
            {/* Quick Token Search & Referral Switcher Bar */}
            <div className="bg-white p-3 rounded-2xl border border-[#CFD8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="font-bold text-slate-700 shrink-0">{lang === 'mr' ? 'माझे रेफरल्स:' : 'My Referrals:'}</span>
                {patientReferrals.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReferralId(r.id);
                      setTokenSearch('');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      currentReferral?.id === r.id 
                        ? 'bg-[#1A4B8C] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r.id} · {lang === 'mr' ? r.departmentMr.split(' (')[0] : r.departmentEn.split(' (')[0]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'टोकन शोधा (REF-...)' : 'Find Token (REF-...)'}
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono w-full sm:w-48"
                />
              </div>
            </div>

            {currentReferral ? (
              <PatientReferralView referral={currentReferral} />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                {lang === 'mr' ? 'कोणताही सक्रिय संदर्भ आढळला नाही.' : 'No active referral records found.'}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#CFD8DC] shadow-xs">
              <h3 className="text-sm font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'माझ्या लॅब तपासण्या व डिजिटल अहवाल' : 'My Diagnostic Test Orders & Verified Reports'}
              </h3>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr'
                  ? 'प्राथमिक आरोग्य केंद्रात किंवा जिल्हा लॅबमध्ये केलेल्या तपासण्यांची सद्यस्थिती'
                  : 'Track sample collection, testing progress and view ABHA uploaded reports'}
              </p>
            </div>

            <TestOrderTracker allowOrdering={false} />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
