import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  UserPlus, 
  MapPin, 
  PhoneCall, 
  Calendar, 
  Activity, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { VILLAGE_PATIENTS_REGISTRY, PatientProfile } from '../../data/mockData';

export default function AshaPatients() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'all' | 'high' | 'moderate' | 'normal'>('all');
  const [patients, setPatients] = useState<PatientProfile[]>(VILLAGE_PATIENTS_REGISTRY);

  const filteredPatients = patients.filter((pt) => {
    const matchesSearch = 
      pt.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.abhaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.phone.includes(searchQuery);
    
    const matchesRisk = selectedRisk === 'all' || pt.riskLevel === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/asha')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'mr' ? 'आशा डॅशबोर्डवर परत' : 'Back to ASHA Dashboard'}
            </button>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {lang === 'mr' ? 'गाव रुग्ण नोंदवही (वडगाव कार्यक्षेत्र)' : 'Village Patient Registry (Vadgaon)'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'आशा कार्यकर्ती सुमन ताई पाटील यांच्या कार्यक्षेत्रातील १२७ नोंदणीकृत नागरिक' 
                : '127 registered community members under ASHA Suman Tai Patil'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/asha/register')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A4B8C] text-white rounded-xl text-xs font-bold hover:bg-[#0D3470] transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              {lang === 'mr' ? 'नवीन रुग्ण जोडा' : 'Register New Patient'}
            </button>
          </div>
        </div>

        {/* Search and Risk Filters Bar */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'नाव, ABHA ID किंवा फोन नंबरने शोधा...' : 'Search by name, ABHA ID, or phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap">{lang === 'mr' ? 'जोखीम स्तर:' : 'Risk Level:'}</span>
            {[
              { id: 'all', mr: 'सर्व', en: 'All' },
              { id: 'high', mr: 'उच्च जोखीम (High)', en: 'High Risk' },
              { id: 'moderate', mr: 'मध्यम (Moderate)', en: 'Moderate' },
              { id: 'normal', mr: 'सामान्य (Normal)', en: 'Normal' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRisk(r.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedRisk === r.id 
                    ? 'bg-[#1A4B8C] text-white' 
                    : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
                }`}
              >
                {lang === 'mr' ? r.mr : r.en}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((pt) => {
            const isHigh = pt.riskLevel === 'high';
            const isMod = pt.riskLevel === 'moderate';
            return (
              <div 
                key={pt.id}
                className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm hover:border-[#1A4B8C]/50 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1C2B3A]">{pt.nameMr}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isHigh 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : isMod 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {pt.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#546E7A] mt-0.5">{pt.nameEn}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#546E7A] mt-1 font-mono">
                      <span>ABHA: {pt.abhaId}</span>
                      <span>·</span>
                      <span>{pt.gender === 'Female' ? 'स्त्री' : 'पुरुष'}, वय {pt.age} वर्षे</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-[#1C2B3A]">
                      {pt.bloodGroup}
                    </span>
                  </div>
                </div>

                {/* Conditions Tags */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#546E7A]">
                    {lang === 'mr' ? 'आरोग्य स्थिती / निदान' : 'Conditions'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pt.conditions.map((c, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#F5F7FA] text-[#1C2B3A] border border-[#CFD8DC]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Follow up & actions */}
                <div className="border-t border-[#CFD8DC] pt-3 flex items-center justify-between text-xs text-[#546E7A]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#546E7A] block">{lang === 'mr' ? 'पुढील भेट:' : 'Follow-up:'}</span>
                    <span className="font-semibold text-[#1C2B3A]">{pt.nextFollowUp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${pt.phone}`}
                      className="p-2 rounded-lg bg-slate-50 border border-[#CFD8DC] text-[#1C2B3A] hover:bg-slate-100 transition"
                      title={lang === 'mr' ? 'कॉल करा' : 'Call'}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => navigate('/asha/triage')}
                      className="px-3 py-1.5 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] font-bold hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'तपासा' : 'Examine'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
