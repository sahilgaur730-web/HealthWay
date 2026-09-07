import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Video, 
  Clock, 
  AlertTriangle, 
  User, 
  Hospital, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  Users, 
  Activity, 
  ChevronRight, 
  PhoneCall,
  Search,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { INITIAL_CONSULT_REQUESTS, ConsultRequest } from '../../data/mockData';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [queue, setQueue] = useState<ConsultRequest[]>(INITIAL_CONSULT_REQUESTS);
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');

  const urgentCount = queue.filter(c => c.urgency === 'urgent').length;

  const filteredQueue = queue.filter(c => {
    if (filter === 'urgent') return c.urgency === 'urgent';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Doctor Header Banner */}
        <div className="bg-[#1A4B8C] rounded-2xl p-6 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    {lang === 'mr' ? 'डॉ. मीरा देशमुख' : lang === 'hi' ? 'डॉ. मीरा देशमुख' : 'Dr. Meera Deshmukh'}
                  </h1>
                  <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {lang === 'mr' ? 'कर्तव्यावर उपस्थित (Active)' : lang === 'hi' ? 'ड्यूटी पर उपस्थित (Active)' : 'On Duty'}
                  </span>
                </div>
                <p className="text-blue-100 text-xs font-medium mt-0.5">
                  {lang === 'mr' 
                    ? 'वैद्यकीय अधिकारी (Medical Officer) · प्राथमिक आरोग्य केंद्र शिरूर' 
                    : lang === 'hi'
                      ? 'चिकित्सा अधिकारी (Medical Officer) · प्राथमिक स्वास्थ्य केंद्र शिरूर'
                      : 'Medical Officer (MBBS, DGO) · Primary Health Centre Shirur'}
                </p>
                <div className="flex items-center gap-3 text-xs text-blue-200 mt-2">
                  <span>Reg No: <strong className="font-mono text-white">MMC-2016-08492</strong></span>
                  <span>·</span>
                  <span>{lang === 'mr' ? 'OPD कक्ष:' : lang === 'hi' ? 'OPD कक्ष:' : 'OPD Room:'} <strong className="text-white">०२</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 self-stretch sm:self-auto">
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-black font-mono">{queue.length}</div>
                <div className="text-[10px] text-blue-200 uppercase font-semibold">
                  {lang === 'mr' ? 'टेलीकन्सल्ट प्रतीक्षा' : lang === 'hi' ? 'टेलीकंसल्ट प्रतीक्षा' : 'Teleconsult Queue'}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-black font-mono text-amber-300">{urgentCount}</div>
                <div className="text-[10px] text-blue-200 uppercase font-semibold">
                  {lang === 'mr' ? 'तातडीच्या केसेस' : lang === 'hi' ? 'आपातकालीन मामले' : 'Urgent Cases'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/doctor/call')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'व्हिडिओ कन्सल्ट रूम' : lang === 'hi' ? 'वीडियो कंसल्ट रूम' : 'Teleconsult Room'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? 'थेट सल्ला व प्रिस्क्रिप्शन' : lang === 'hi' ? 'सीधा परामर्श व डिजिटल पर्चा' : 'Live video & Rx writer'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>

          <button
            onClick={() => navigate('/doctor/patients')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'PHC रुग्ण रेकॉर्ड्स' : lang === 'hi' ? 'PHC मरीज़ रिकॉर्ड्स' : 'Patient EHR Archive'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? 'मागील इतिहास व अहवाल' : lang === 'hi' ? 'पिछला इतिहास व रिपोर्ट' : 'Medical history & labs'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>

          <button
            onClick={() => navigate('/doctor/referrals')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'तज्ञ रेफरल ट्रॅकर' : lang === 'hi' ? 'विशेषज्ञ रेफरल ट्रैकर' : 'Specialist Referrals'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? 'जिल्हा रुग्णालयात रेफर' : lang === 'hi' ? 'जिला अस्पताल में रेफर' : 'District hospital transfers'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>
        </div>

        {/* Teleconsultation Live Queue */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CFD8DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'थेट टेलीकन्सल्टेशन प्रतीक्षा यादी (Live Queue)' : lang === 'hi' ? 'लाइव टेलीकंसल्टेशन प्रतीक्षा सूची (Live Queue)' : 'Incoming Teleconsultation Queue'}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1A4B8C] border border-blue-200">
                  {queue.length} {lang === 'mr' ? 'रुग्ण प्रतीक्षेत' : lang === 'hi' ? 'मरीज़ प्रतीक्षारत' : 'Waiting'}
                </span>
              </div>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' 
                  ? 'उपकेंद्रे आणि आशा कार्यकर्त्यांकडून आलेले तात्काळ सल्ला विनंती कॉल्स' 
                  : lang === 'hi'
                    ? 'उपकेंद्र और आशा कार्यकर्ताओं द्वारा भेजे गए तत्काल परामर्श अनुरोध'
                    : 'Real-time consultation requests dispatched by frontline ASHA workers and Sub-Centres'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === 'all' ? 'bg-[#1A4B8C] text-white' : 'text-[#546E7A] hover:bg-slate-100'
                }`}
              >
                {lang === 'mr' ? 'सर्व कॉल्स' : lang === 'hi' ? 'सभी कॉल्स' : 'All Calls'}
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === 'urgent' ? 'bg-red-600 text-white' : 'text-[#546E7A] hover:bg-slate-100'
                }`}
              >
                {lang === 'mr' ? `तातडीचे (${urgentCount})` : lang === 'hi' ? `आपातकालीन (${urgentCount})` : `Urgent (${urgentCount})`}
              </button>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-4">
            {filteredQueue.map((req) => {
              const isUrgent = req.urgency === 'urgent';
              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition space-y-4 ${
                    isUrgent 
                      ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200' 
                      : 'bg-white border-[#CFD8DC] hover:border-[#1A4B8C]/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CFD8DC]/60 pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUrgent ? 'bg-red-600 text-white' : 'bg-[#E8F0FE] text-[#1A4B8C]'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1C2B3A]">{req.patientName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-[#1A4B8C]'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-[#546E7A] mt-0.5">
                          {req.patientGender === 'Female' ? (lang === 'mr' ? 'स्त्री' : lang === 'hi' ? 'महिला' : 'Female') : (lang === 'mr' ? 'पुरुष' : lang === 'hi' ? 'पुरुष' : 'Male')}, {req.patientAge} {lang === 'mr' ? 'वर्षे' : lang === 'hi' ? 'वर्ष' : 'Yrs'} · ABHA: <span className="font-mono">{req.abhaId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#546E7A] flex items-center gap-1 sm:justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{req.requestTime}</span>
                      </div>
                      <div className="text-[11px] text-[#546E7A]">
                        {lang === 'mr' ? 'आशा:' : lang === 'hi' ? 'आशा:' : 'ASHA:'} <strong>{req.ashaName}</strong> ({req.village})
                      </div>
                    </div>
                  </div>

                  {/* Complaint & Vitals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 p-3 bg-white rounded-xl border border-[#CFD8DC]/70">
                      <span className="text-[10px] font-bold uppercase text-[#546E7A] block mb-1">
                        {lang === 'mr' ? 'तक्रार / लक्षणे:' : lang === 'hi' ? 'शिकायत / लक्षण:' : 'Chief Complaint:'}
                      </span>
                      <p className="text-[#1C2B3A] font-medium leading-relaxed">
                        {req.reason}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-[#CFD8DC]/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#546E7A] block mb-1">
                        {lang === 'mr' ? 'व्हायटल्स (Field):' : lang === 'hi' ? 'महत्वपूर्ण संकेत (Field):' : 'Logged Vitals:'}
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-[#546E7A]">
                        <div>BP: <strong className="text-[#1C2B3A] font-mono">{req.vitals.bp}</strong></div>
                        <div>Sugar: <strong className="text-[#1C2B3A] font-mono">{req.vitals.sugar}</strong></div>
                        <div>Pulse: <strong className="text-[#1C2B3A] font-mono">{req.vitals.pulse}</strong></div>
                        <div>SpO2: <strong className="text-[#1C2B3A] font-mono">{req.vitals.spO2}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => navigate('/doctor/call')}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-sm ${
                        isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1A4B8C] hover:bg-[#0D3470]'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      {lang === 'mr' ? 'टेलीकन्सल्टेशन सुरू करा' : lang === 'hi' ? 'टेलीकंसल्टेशन शुरू करें' : 'Start Video Consult'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
