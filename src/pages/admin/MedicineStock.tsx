import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  ArrowLeft, 
  Truck,
  Building2,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import StockDashboard from '../../components/medicine/StockDashboard';

export default function MedicineStock() {
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
              {lang === 'mr' ? 'जिल्हा औषध पुरवठा साखळी व साठा व्यवस्थापन' : 'District Medicine Inventory & Supply Chain'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'प्राथमिक केंद्रे आणि उपकेंद्रांमधील जीवनरक्षक औषध साठ्याचे थेट नियंत्रण, कालबाह्यता ट्रॅकिंग व स्वयंचलित मागणीपत्रके' 
                : 'Centralized EDL repository, real-time consumption velocity, expiry surveillance, and warehouse indents'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#1A4B8C] bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <Truck className="w-4 h-4" />
              {lang === 'mr' ? 'राज्य वखार मध्यवर्ती प्रणाली' : 'State Central Warehouse Connected'}
            </span>
          </div>
        </div>

        {/* Integrated Stock Dashboard */}
        <StockDashboard />

      </div>
    </DashboardLayout>
  );
}
