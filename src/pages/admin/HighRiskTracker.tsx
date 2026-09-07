import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Clock,
  HeartPulse
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import HighRiskDashboard from '../../components/highrisk/HighRiskDashboard';

export default function HighRiskTracker() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'mr' ? 'प्रशासन डॅशबोर्डवर परत' : 'Back to Admin Dashboard'}
            </button>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {lang === 'mr' ? 'जिल्हा उच्च जोखीम रुग्ण दक्षता व पाठपुरावा ट्रॅकर' : 'High-Risk Clinical Surveillance & Follow-Up'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'गर्भवती माता (ANC), तीव्र मधुमेह, उच्च रक्तदाब, क्षयरोग (TB DOTS), व कुपोषण रुग्णांचे सक्रिय दैनंदिन निरीक्षण' 
                : 'Maternal high-risk cohort, severe chronic NCDs, infant LBW, and active TB DOTS surveillance with automated escalation'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3.5 py-1.5 bg-red-100 text-red-800 rounded-xl border border-red-200 flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              {lang === 'mr' ? '२४/७ सक्रिय क्लिनिकल अलर्ट्स' : 'Active Clinical Escalations Active'}
            </span>
          </div>
        </div>

        {/* Integrated High Risk Dashboard */}
        <HighRiskDashboard />

      </div>
    </DashboardLayout>
  );
}
