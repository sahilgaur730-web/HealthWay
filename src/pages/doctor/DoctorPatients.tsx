import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  Eye, 
  FileText, 
  Calendar, 
  Activity, 
  Stethoscope, 
  Clock, 
  X,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { VILLAGE_PATIENTS_REGISTRY, PatientProfile, PAST_VISITS } from '../../data/mockData';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);

  const filtered = VILLAGE_PATIENTS_REGISTRY.filter(p => 
    p.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abhaId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/doctor')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'mr' ? 'डॉक्टर डॅशबोर्डवर परत' : 'Back to Doctor Dashboard'}
            </button>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {lang === 'mr' ? 'PHC रुग्ण वैद्यकीय अभिलेख (EHR Archive)' : 'PHC Patient EHR Archive'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'प्राथमिक आरोग्य केंद्र शिरूर अंतर्गत नोंदणीकृत रुग्णांचा वैद्यकीय इतिहास' 
                : 'Complete electronic medical history and ABHA diagnostic records'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'नाव किंवा ABHA ID ने शोधा...' : 'Search by name or ABHA ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
            />
          </div>
        </div>

        {/* Patients Table / Grid */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F7FA] border-b border-[#CFD8DC] flex items-center justify-between text-xs text-[#546E7A] font-bold">
            <span>{lang === 'mr' ? `एकूण सापडलेले रुग्ण: ${filtered.length}` : `Showing ${filtered.length} Patients`}</span>
            <span>ABDM / ABHA Connected</span>
          </div>

          <div className="divide-y divide-[#CFD8DC]">
            {filtered.map((pt) => (
              <div 
                key={pt.id} 
                className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-[#1C2B3A]">{pt.nameMr}</h3>
                    <span className="text-xs text-[#546E7A]">({pt.nameEn})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      pt.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-[#1A4B8C]'
                    }`}>
                      {pt.riskLevel}
                    </span>
                  </div>

                  <div className="text-xs text-[#546E7A] flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>ABHA: <strong className="font-mono text-[#1C2B3A]">{pt.abhaId}</strong></span>
                    <span>·</span>
                    <span>{pt.gender === 'Female' ? 'स्त्री' : 'पुरुष'}, {pt.age} वर्षे</span>
                    <span>·</span>
                    <span>रक्तगट: <strong>{pt.bloodGroup}</strong></span>
                    <span>·</span>
                    <span>{pt.village}, शिरूर</span>
                  </div>

                  <div className="text-[11px] text-[#546E7A] pt-0.5">
                    {pt.conditions.join(' · ')}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right hidden sm:block text-xs">
                    <span className="text-[#546E7A] text-[11px] block">{lang === 'mr' ? 'शेवटची तपासणी:' : 'Last Visit:'}</span>
                    <span className="font-semibold text-[#1C2B3A]">{pt.lastVisit}</span>
                  </div>

                  <button
                    onClick={() => setSelectedPatient(pt)}
                    className="px-4 py-2 bg-[#E8F0FE] text-[#1A4B8C] hover:bg-blue-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'इतिहास पहा' : 'View EHR'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Full Patient Health History */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#CFD8DC] shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-5 bg-[#1A4B8C] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{selectedPatient.nameMr}</h3>
                  <p className="text-xs text-blue-100">ABHA: {selectedPatient.abhaId} · वय {selectedPatient.age} वर्षे</p>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#1C2B3A]">
                
                {/* Clinical Conditions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-[#546E7A]">निदान व चालू स्थिती</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-[#CFD8DC]">
                    {selectedPatient.conditions.join(', ')}
                  </div>
                </div>

                {/* Past Visits List */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase text-[#546E7A] block">मागील तपासण्या व भेटी</span>
                  {PAST_VISITS.map((v) => (
                    <div key={v.id} className="p-4 rounded-xl border border-[#CFD8DC] bg-white space-y-2">
                      <div className="flex items-center justify-between border-b border-[#CFD8DC] pb-2">
                        <strong className="text-xs text-[#1A4B8C]">{v.facility} · {v.doctor}</strong>
                        <span className="text-[#546E7A] text-[11px]">{v.date}</span>
                      </div>
                      <p className="text-xs text-[#1C2B3A]"><strong>निदान:</strong> {v.diagnosis}</p>
                      <p className="text-[11px] font-mono text-[#546E7A]"><strong>Rx:</strong> {v.prescription}</p>
                      <p className="text-[11px] text-[#546E7A]"><strong>शेरा:</strong> {v.notes}</p>
                    </div>
                  ))}
                </div>

              </div>

              <div className="p-4 border-t border-[#CFD8DC] bg-[#F5F7FA] flex justify-between items-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-[#CFD8DC] bg-white text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  {lang === 'mr' ? 'संपूर्ण इतिहास प्रिंट करा' : 'Print History'}
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-5 py-2 bg-[#1A4B8C] text-white text-xs font-bold rounded-lg hover:bg-[#0D3470]"
                >
                  {lang === 'mr' ? 'बंद करा' : 'Close'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
