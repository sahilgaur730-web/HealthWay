import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Pill, 
  ArrowRight, 
  Bell, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Stethoscope, 
  PhoneCall, 
  Activity, 
  User, 
  Hospital,
  ChevronRight,
  ShieldCheck,
  Video,
  Tv
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { CURRENT_PATIENT, PAST_VISITS } from '../../data/mockData';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const referralSteps = [
    { labelMr: 'रेफर केले', labelHi: 'रेफर किया गया', labelEn: 'Referred', done: true },
    { labelMr: 'रुग्णालय पोहोचले', labelHi: 'अस्पताल पहुंचे', labelEn: 'Reached Hospital', done: true },
    { labelMr: 'तज्ञ सल्ला', labelHi: 'विशेषज्ञ परामर्श', labelEn: 'Specialist Consult', done: false },
    { labelMr: 'उपचार पूर्ण', labelHi: 'उपचार पूर्ण', labelEn: 'Treatment Complete', done: false },
  ];

  const patientDisplayName = user
    ? (lang === 'mr' ? user.nameMr || user.name : user.name)
    : (lang === 'mr' ? CURRENT_PATIENT.nameMr : lang === 'hi' ? 'सुनीता जाधव' : CURRENT_PATIENT.nameEn);

  const patientAbha = user?.abhaId || CURRENT_PATIENT.abhaId;
  const patientVillage = user?.village
    ? (lang === 'mr' ? user.villageMr || user.village : user.village)
    : CURRENT_PATIENT.village;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* 1. PATIENT IDENTITY CARD (Government ABHA Card Aesthetic) */}
        <div className="bg-[#1A4B8C] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* Left Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    {patientDisplayName}
                  </h2>
                  <span className="bg-[#F57C00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {lang === 'mr' ? 'सक्रिय' : lang === 'hi' ? 'सक्रिय' : 'Active'}
                  </span>
                </div>
                <p className="text-blue-200 text-xs font-medium mt-0.5">
                  {user ? user.name : CURRENT_PATIENT.nameEn}
                </p>

                <div className="flex flex-wrap gap-2 mt-2.5">
                  {CURRENT_PATIENT.conditions.map((c, i) => (
                    <span 
                      key={i} 
                      className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right ABHA Info */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3.5 sm:text-right min-w-[210px]">
              <div className="flex sm:justify-end items-center gap-1.5 text-blue-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ABHA DIGITAL HEALTH ID</span>
              </div>
              <p className="font-mono text-sm font-extrabold text-white mt-1">
                {patientAbha}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white/10 rounded-lg py-1.5 px-2">
                  <p className="text-blue-200 text-[10px] uppercase font-bold">{lang === 'mr' ? 'वय' : lang === 'hi' ? 'उम्र' : 'Age'}</p>
                  <p className="font-bold text-white">{CURRENT_PATIENT.age} {lang === 'mr' ? 'वर्षे' : lang === 'hi' ? 'वर्ष' : 'Yrs'}</p>
                </div>
                <div className="bg-white/10 rounded-lg py-1.5 px-2">
                  <p className="text-blue-200 text-[10px] uppercase font-bold">{lang === 'mr' ? 'रक्तगट' : lang === 'hi' ? 'रक्त समूह' : 'Blood'}</p>
                  <p className="font-bold text-white">{CURRENT_PATIENT.bloodGroup}</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-blue-100 gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-200" />
              <span>{patientVillage}, {CURRENT_PATIENT.block}, {CURRENT_PATIENT.district} {lang === 'mr' ? 'जिल्हा' : 'District'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-200" />
              <span>{lang === 'mr' ? 'शेवटची भेट:' : lang === 'hi' ? 'पिछली भेंट:' : 'Last Visit:'} {CURRENT_PATIENT.lastVisit}</span>
            </div>
          </div>
        </div>

        {/* 2. UPCOMING APPOINTMENT ALERT */}
        <div className="bg-[#FFF8E1] border border-[#F9A825] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 bg-[#F57C00] text-white rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F57C00] uppercase tracking-wide">
                  {lang === 'mr' ? 'उद्याची तपासणी अपॉइंटमेंट' : lang === 'hi' ? 'आगामी जाँच अपॉइंटमेंट' : 'Upcoming Appointment'}
                </span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  {lang === 'mr' ? 'नियोजित' : lang === 'hi' ? 'नियोजित' : 'Scheduled'}
                </span>
              </div>
              <h3 className="font-bold text-[#1C2B3A] text-sm sm:text-base mt-0.5">
                {lang === 'mr' ? 'PHC शिरूर — डॉ. मीरा देशमुख (प्रसूतीपूर्व तपासणी ANC 3)' : lang === 'hi' ? 'PHC शिरूर — डॉ. मीरा देशमुख (प्रसवपूर्व जाँच ANC 3)' : 'PHC Shirur — Dr. Meera Deshmukh (Antenatal ANC 3)'}
              </h3>
              <p className="text-xs text-[#546E7A] mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F57C00]" />
                <span>{lang === 'mr' ? 'उद्या सकाळी १०:३० वाजता · टोकन क्र. ०७' : lang === 'hi' ? 'कल सुबह १०:३० बजे · टोकन क्र. ०७' : 'Tomorrow at 10:30 AM · Token #07'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/patient/book')}
            className="text-xs bg-[#F57C00] hover:bg-[#E65100] text-white px-4 py-2 rounded-xl font-bold transition-colors shrink-0"
          >
            {lang === 'mr' ? 'तपशील पहा' : lang === 'hi' ? 'विवरण देखें' : 'View Details'}
          </button>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <div>
          <h3 className="text-sm font-bold text-[#1C2B3A] mb-3 uppercase tracking-wider">
            {lang === 'mr' ? 'त्वरित सेवा (Quick Services)' : lang === 'hi' ? 'त्वरित सेवाएँ (Quick Services)' : 'Quick Services'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            <button
              onClick={() => navigate('/patient/consultation')}
              className="bg-white border-2 border-blue-500/40 rounded-xl p-4 text-left hover:border-[#1A4B8C] hover:shadow-md transition-all group bg-gradient-to-b from-blue-50/50 to-white"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1A4B8C] text-white flex items-center justify-center mb-3 shadow-xs">
                <Video className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-[#1A4B8C]">
                {lang === 'mr' ? 'दूर सल्लामसलत' : lang === 'hi' ? 'दूर परामर्श (Teleconsult)' : 'Teleconsultation'}
              </p>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? 'थेट व्हिडिओ/ऑडिओ डॉक्टर' : lang === 'hi' ? 'लाइव वीडियो/ऑडियो डॉक्टर' : 'Live Doctor Call'}
              </p>
            </button>

            <button
              onClick={() => navigate('/patient/book')}
              className="bg-white border border-[#CFD8DC] rounded-xl p-4 text-left hover:border-[#1A4B8C] hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] group-hover:bg-[#1A4B8C] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-[#1C2B3A] group-hover:text-[#1A4B8C]">
                {lang === 'mr' ? 'अपॉइंटमेंट बुक करा' : lang === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'}
              </p>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? 'PHC किंवा जिल्हा रुग्णालय' : lang === 'hi' ? 'PHC या जिला अस्पताल' : 'PHC or District Hospital'}
              </p>
            </button>

            <button
              onClick={() => navigate('/queue-display')}
              className="bg-white border border-[#CFD8DC] rounded-xl p-4 text-left hover:border-amber-600 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <Tv className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-[#1C2B3A] group-hover:text-amber-700">
                {lang === 'mr' ? 'थेट रांग टीव्ही' : lang === 'hi' ? 'लाइव कतार टीवी' : 'Live Queue TV'}
              </p>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? 'चालू टोकन व प्रतीक्षा वेळ' : lang === 'hi' ? 'वर्तमान टोकन व प्रतीक्षा समय' : 'Now Serving & Wait Time'}
              </p>
            </button>

            <button
              onClick={() => navigate('/patient/records')}
              className="bg-white border border-[#CFD8DC] rounded-xl p-4 text-left hover:border-[#2E7D32] hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-[#1C2B3A] group-hover:text-[#2E7D32]">
                {lang === 'mr' ? 'आरोग्य नोंदी पहा' : lang === 'hi' ? 'स्वास्थ्य रिकॉर्ड देखें' : 'View Records'}
              </p>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? 'प्रिस्क्रिप्शन व लॅब अहवाल' : lang === 'hi' ? 'पर्चे और लैब रिपोर्ट' : 'Prescriptions & Lab Tests'}
              </p>
            </button>

            <button
              onClick={() => navigate('/patient/medicines')}
              className="bg-white border border-[#CFD8DC] rounded-xl p-4 text-left hover:border-[#F57C00] hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] text-[#F57C00] group-hover:bg-[#F57C00] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <Pill className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-[#1C2B3A] group-hover:text-[#F57C00]">
                {lang === 'mr' ? 'औषध उपलब्धता' : lang === 'hi' ? 'दवा उपलब्धता' : 'Medicine Stock'}
              </p>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? 'जवळच्या केंद्रातील साठा' : lang === 'hi' ? 'निकटतम केंद्र में स्टॉक' : 'Nearby PHC Inventories'}
              </p>
            </button>

            <button
              onClick={() => navigate('/patient/triage')}
              className="bg-white border border-[#CFD8DC] rounded-xl p-4 text-left hover:border-[#C62828] hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFEBEE] text-[#C62828] group-hover:bg-[#C62828] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-[#1C2B3A] group-hover:text-[#C62828]">
                {lang === 'mr' ? 'लक्षण तपासणी' : lang === 'hi' ? 'लक्षण जाँच (ट्रियाज)' : 'Symptom Triage'}
              </p>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? 'आजाराची तीव्रता जाणून घ्या' : lang === 'hi' ? 'गंभीरता का नैदानिक मूल्यांकन' : 'Clinical Severity Assessment'}
              </p>
            </button>

          </div>
        </div>

        {/* 4. LIVE REFERRAL STATUS TRACKER */}
        <div className="bg-white border border-[#CFD8DC] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A4B8C] uppercase tracking-wide">
                  {lang === 'mr' ? 'सक्रिय रेफरल केस' : lang === 'hi' ? 'सक्रिय रेफरल मामला' : 'Active Referral Case'}
                </span>
                <span className="bg-[#E8F0FE] text-[#1A4B8C] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  REF-MH-9941
                </span>
              </div>
              <h4 className="font-bold text-[#1C2B3A] text-base mt-0.5">
                {lang === 'mr' ? 'जिल्हा रुग्णालय पुणे — तज्ञ प्रसूती सल्ला' : lang === 'hi' ? 'जिला अस्पताल पुणे — विशेषज्ञ प्रसूति परामर्श' : 'District Hospital Pune — Specialist Obstetric Consultation'}
              </h4>
              <p className="text-xs text-[#546E7A]">
                {lang === 'mr' ? 'रेफर करणारे केंद्र: उपकेंद्र वडगाव (सुनंदा पाटील)' : lang === 'hi' ? 'रेफर करने वाला केंद्र: उपकेंद्र वडगांव (सुनंदा पाटिल, ANM)' : 'Referred by: Sub-Centre Vadgaon (Sunanda Patil, ANM)'}
              </p>
            </div>

            <button
              onClick={() => navigate('/patient/referral')}
              className="text-xs text-[#1A4B8C] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{lang === 'mr' ? 'संपूर्ण ट्रॅकर पहा' : lang === 'hi' ? 'पूरा रेफरल ट्रैकर' : 'Full Referral Tracker'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Visualizer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {referralSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                  step.done 
                    ? 'bg-[#2E7D32] text-white' 
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}>
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <p className={`text-xs font-bold ${step.done ? 'text-[#1C2B3A]' : 'text-gray-400'}`}>
                  {lang === 'mr' ? step.labelMr : lang === 'hi' ? step.labelHi : step.labelEn}
                </p>
                <span className="text-[10px] text-[#546E7A] mt-0.5">
                  {step.done ? (lang === 'mr' ? 'पूर्ण' : lang === 'hi' ? 'पूर्ण' : 'Completed') : (lang === 'mr' ? 'प्रलंबित' : lang === 'hi' ? 'लंबित' : 'Pending')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. PAST CLINICAL VISITS */}
        <div className="bg-white border border-[#CFD8DC] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-[#1C2B3A] text-base">
                {lang === 'mr' ? 'मागील तपासणी इतिहास' : lang === 'hi' ? 'नैदानिक भेंट इतिहास' : 'Clinical Visit History'}
              </h4>
              <p className="text-xs text-[#546E7A]">
                {lang === 'mr' ? 'प्राथमिक आरोग्य केंद्र व उपकेंद्रातील सर्व भेटी' : lang === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र व उपकेंद्र में दर्ज सभी परामर्श' : 'All consultations recorded in Maharashtra PHC network'}
              </p>
            </div>

            <button
              onClick={() => navigate('/patient/records')}
              className="text-xs text-[#1A4B8C] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{lang === 'mr' ? 'सर्व नोंदी पहा' : lang === 'hi' ? 'सभी रिकॉर्ड देखें' : 'View All Records'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {PAST_VISITS.map((visit) => (
              <div 
                key={visit.id}
                className="border border-[#CFD8DC] rounded-xl p-4 hover:border-[#1A4B8C] transition-colors bg-[#F5F7FA]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1A4B8C] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {visit.facilityType}
                    </span>
                    <span className="font-bold text-xs text-[#1C2B3A]">{visit.facility}</span>
                    <span className="text-xs text-[#546E7A]">· {visit.doctor}</span>
                  </div>
                  <span className="text-xs text-[#546E7A] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {visit.date}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#1C2B3A] mb-1">
                  {visit.diagnosis}
                </p>
                <p className="text-xs text-[#546E7A] mb-2 leading-relaxed">
                  {visit.notes}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                  <span className="bg-emerald-50 text-[#2E7D32] border border-emerald-200 px-2 py-0.5 rounded font-mono text-[11px] inline-flex items-center">
                    <Pill className="w-3 h-3 mr-1 shrink-0" />
                    <span>{visit.prescription}</span>
                  </span>
                  <span className="text-[11px] text-[#546E7A] ml-auto">
                    BP: {visit.vitals.bp} · {lang === 'mr' ? 'वजन:' : lang === 'hi' ? 'वजन:' : 'Weight:'} {visit.vitals.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
