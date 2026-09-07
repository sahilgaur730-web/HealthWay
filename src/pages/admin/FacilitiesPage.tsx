import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hospital, 
  ArrowLeft, 
  Search, 
  MapPin, 
  PhoneCall, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Activity, 
  Calendar,
  Truck,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FACILITIES_DATA } from '../../data/mockData';
import DistrictDashboard from '../../components/dashboard/DistrictDashboard';

export default function FacilitiesPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [viewMode, setViewMode] = useState<'command_dashboard' | 'directory'>('command_dashboard');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = FACILITIES_DATA.filter((fac) => {
    const matchesType = filterType === 'ALL' || fac.type === filterType;
    const matchesSearch = 
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.doctorInCharge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'mr' ? 'प्रशासन डॅशबोर्डवर परत' : 'Back to Admin Dashboard'}</span>
            </button>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {lang === 'mr' ? 'जिल्हा आरोग्य केंद्र संचलन व कामगिरी नियंत्रण कक्ष' : 'District Health Facilities Command Center'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'पुणे जिल्ह्यातील सर्व प्राथमिक आरोग्य केंद्रे, उपकेंद्रे आणि ग्रामीण रुग्णालयांचे थेट व्यवस्थापन (Demand 9)' 
                : 'Real-time operational matrix of Sub-Centres, PHCs, CHCs, and District Hospitals in Pune District'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 rounded-xl border border-[#CFD8DC] flex items-center gap-1">
              <button
                onClick={() => setViewMode('command_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'command_dashboard'
                    ? 'bg-[#1A4B8C] text-white shadow-xs'
                    : 'text-[#546E7A] hover:text-[#1C2B3A]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'कमांड डॅशबोर्ड' : 'Live Dashboard'}</span>
              </button>

              <button
                onClick={() => setViewMode('directory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'directory'
                    ? 'bg-[#1A4B8C] text-white shadow-xs'
                    : 'text-[#546E7A] hover:text-[#1C2B3A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'निर्देशिका सूची' : 'Directory View'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Full District Dashboard (Demand 9 & 10) */}
        {viewMode === 'command_dashboard' && (
          <DistrictDashboard onExportReport={() => window.print()} />
        )}

        {/* View 2: Traditional Directory List */}
        {viewMode === 'directory' && (
          <div className="space-y-4">
            {/* Filters and Search Bar */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'केंद्राचे नाव किंवा डॉक्टरांच्या नावाने शोधा...' : 'Search facility or in-charge doctor...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', mr: 'सर्व केंद्रे', en: 'All' },
                  { id: 'PHC', mr: 'प्राथमिक आरोग्य केंद्रे (PHC)', en: 'PHC' },
                  { id: 'Sub-Centre', mr: 'उपकेंद्रे (Sub-Centre)', en: 'Sub-Centre' },
                  { id: 'Rural Hospital', mr: 'ग्रामीण रुग्णालये (RH)', en: 'Rural Hospital' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      filterType === t.id 
                        ? 'bg-[#1A4B8C] text-white' 
                        : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
                    }`}
                  >
                    {lang === 'mr' ? t.mr : t.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((fac) => (
                <div 
                  key={fac.id}
                  className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-sm hover:border-[#1A4B8C]/50 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center shrink-0">
                        <Hospital className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#1C2B3A]">{fac.nameMr}</h3>
                        </div>
                        <p className="text-xs text-[#546E7A] mt-0.5">{fac.name} · <span className="font-semibold text-[#1A4B8C]">{fac.type}</span></p>
                        <div className="text-[11px] text-[#546E7A] mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{lang === 'mr' ? `तालुका शिरूर · अंतर: ${fac.distance}` : `Shirur Block · Distance: ${fac.distance}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-[#1C2B3A] block">
                        {fac.beds} {lang === 'mr' ? 'खाटा' : 'Beds'}
                      </span>
                      <span className="text-[10px] text-[#546E7A] mt-1 block font-mono">{fac.id}</span>
                    </div>
                  </div>

                  {/* In charge and Staff details */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-[#CFD8DC]/70 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#546E7A] text-[10px] uppercase font-bold block">{lang === 'mr' ? 'वैद्यकीय अधिकारी:' : 'In-Charge:'}</span>
                      <strong className="text-[#1C2B3A]">{fac.doctorInCharge}</strong>
                    </div>

                    <div>
                      <span className="text-[#546E7A] text-[10px] uppercase font-bold block">{lang === 'mr' ? 'संपर्क दूरध्वनी:' : 'Phone:'}</span>
                      <a href={`tel:${fac.phone}`} className="text-[#1A4B8C] font-mono font-bold hover:underline flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" />
                        <span>{fac.phone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Medicine stock count snippet */}
                  <div className="border-t border-[#CFD8DC] pt-3 flex items-center justify-between text-xs text-[#546E7A]">
                    <div>
                      <span>{lang === 'mr' ? 'औषध साठा प्रकार:' : 'Essential Drugs:'} <strong>{fac.medicines.length} नोंदणीकृत</strong></span>
                    </div>

                    <button
                      onClick={() => navigate('/admin/medicines')}
                      className="text-xs font-bold text-[#1A4B8C] hover:underline"
                    >
                      {lang === 'mr' ? 'साठा व्यवस्थापित करा' : 'Manage Inventory'}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
