import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  ArrowLeft, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import MedicineSearch from '../../components/medicine/MedicineSearch';

export default function MedicineCheck() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/patient')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'mr' ? 'डॅशबोर्डवर परत' : 'Back to Dashboard'}
            </button>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {lang === 'mr' ? 'आरोग्य केंद्र औषध साठा व फार्मसी उपलब्धता' : 'Medicine Availability & Pharmacy Search'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'परिसरातील सर्व प्राथमिक आरोग्य केंद्रे, उपकेंद्रे आणि ग्रामीण रुग्णालयांमधील मोफत औषधांची थेट उपलब्धता तपासा' 
                : 'Real-time essential drug inventory across local Sub-Centres, PHCs, and Rural Hospitals with SMS alerts'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#546E7A] bg-white border border-[#CFD8DC] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#1A4B8C]" />
              {lang === 'mr' ? 'थेट डिजिटल साठा प्रणाली' : 'Live Inventory Sync Active'}
            </span>
          </div>
        </div>

        {/* Integrated Medicine Search Component */}
        <MedicineSearch />

      </div>
    </DashboardLayout>
  );
}
