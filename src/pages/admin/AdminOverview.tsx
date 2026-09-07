import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Activity, 
  Hospital, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  Pill, 
  ShieldCheck,
  BarChart3,
  Download,
  Printer
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import AbdmInteroperabilityModal from '../../components/common/AbdmInteroperabilityModal';
import DistrictDashboard from '../../components/dashboard/DistrictDashboard';
import { ADMIN_TREND_DATA, ADMIN_FACILITIES_METRICS } from '../../data/mockData';

export default function AdminOverview() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [isAbdmModalOpen, setIsAbdmModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'command_dashboard'>('overview');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* District Admin Header */}
        <div className="bg-[#1A4B8C] rounded-2xl p-6 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    {lang === 'mr' ? 'जिल्हा आरोग्य प्रशासन डॅशबोर्ड' : lang === 'hi' ? 'जिला स्वास्थ्य प्रशासन डैशबोर्ड' : 'District Health Administration'}
                  </h1>
                  <span className="bg-[#F57C00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Pune District
                  </span>
                </div>
                <p className="text-blue-100 text-xs font-medium mt-0.5">
                  {lang === 'mr' 
                    ? 'सार्वजनिक आरोग्य विभाग · राष्ट्रीय आरोग्य अभियान (NHM) महाराष्ट्र' 
                    : lang === 'hi'
                      ? 'सार्वजनिक स्वास्थ्य विभाग · राष्ट्रीय स्वास्थ्य मिशन (NHM) महाराष्ट्र'
                      : 'Directorate of Health Services · Government of Maharashtra'}
                </p>
                <div className="flex items-center gap-3 text-xs text-blue-200 mt-2">
                  <span>{lang === 'mr' ? 'तालुका:' : lang === 'hi' ? 'ब्लॉक:' : 'Block:'} <strong>{lang === 'mr' ? 'शिरूर / खेड / हवेली' : lang === 'hi' ? 'शिरूर / खेड / हवेली' : 'Shirur / Khed / Haveli'}</strong></span>
                  <span>·</span>
                  <span>{lang === 'mr' ? 'नोडल अधिकारी:' : lang === 'hi' ? 'नोडल अधिकारी:' : 'Nodal Officer:'} <strong>{lang === 'mr' ? 'डॉ. भगवान पवार (DHO)' : lang === 'hi' ? 'डॉ. भगवान पवार (DHO)' : 'Dr. Bhagwan Pawar (DHO)'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => setIsAbdmModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ABDM & HMIS Gateway</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'अहवाल प्रिंट करा' : lang === 'hi' ? 'रिपोर्ट प्रिंट करें' : 'Export Report'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* District Admin View Switcher: HMIS Overview vs Facility Command Dashboard (Demand 9) */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-[#CFD8DC]">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              viewMode === 'overview'
                ? 'bg-white text-[#1A4B8C] shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'mr' ? 'प्रशासकीय आढावा व कल' : lang === 'hi' ? 'प्रशासनिक समीक्षा व रुझान' : 'Executive Overview & HMIS Trends'}</span>
          </button>

          <button
            onClick={() => setViewMode('command_dashboard')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              viewMode === 'command_dashboard'
                ? 'bg-[#1A4B8C] text-white shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'mr' ? 'जिल्हा आरोग्य केंद्र नियंत्रण कक्ष (Demand 9)' : lang === 'hi' ? 'जिला स्वास्थ्य केंद्र नियंत्रण कक्ष (Demand 9)' : 'District Facility Command Center (Demand 9)'}</span>
          </button>
        </div>

        {viewMode === 'command_dashboard' ? (
          <DistrictDashboard onExportReport={() => window.print()} />
        ) : (
          <>
            {/* 4 Core District KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#546E7A]">
              <span className="text-xs font-bold uppercase">{lang === 'mr' ? 'कार्यरत केंद्रे' : lang === 'hi' ? 'सक्रिय केंद्र' : 'Active Facilities'}</span>
              <Hospital className="w-4 h-4 text-[#1A4B8C]" />
            </div>
            <div className="text-3xl font-black text-[#1C2B3A] font-mono">{lang === 'mr' ? '३६' : lang === 'hi' ? '३६' : '36'}</div>
            <p className="text-[11px] text-green-700 font-medium">
              {lang === 'mr' ? '१००% डिजिटल प्रणालीशी जोडलेली' : lang === 'hi' ? '१००% डिजिटल प्रणाली से जुड़े' : '100% digitally connected'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#546E7A]">
              <span className="text-xs font-bold uppercase">{lang === 'mr' ? 'आजच्या एकूण तपासण्या' : lang === 'hi' ? 'आज के कुल परामर्श' : "Today's Consults"}</span>
              <Users className="w-4 h-4 text-[#1A4B8C]" />
            </div>
            <div className="text-3xl font-black text-[#1C2B3A] font-mono">{lang === 'mr' ? '१,२४८' : lang === 'hi' ? '१,२४८' : '1,248'}</div>
            <p className="text-[11px] text-blue-700 font-medium">
              {lang === 'mr' ? '३४२ थेट टेलीकन्सल्टेशन्स समाविष्ट' : lang === 'hi' ? '३४२ लाइव टेलीकंसल्टेशन शामिल' : '342 live teleconsults included'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#546E7A]">
              <span className="text-xs font-bold uppercase">{lang === 'mr' ? 'सक्रिय रेफरल्स' : lang === 'hi' ? 'सक्रिय रेफरल' : 'Active Referrals'}</span>
              <Activity className="w-4 h-4 text-[#F57C00]" />
            </div>
            <div className="text-3xl font-black text-[#F57C00] font-mono">{lang === 'mr' ? '४१' : lang === 'hi' ? '४१' : '41'}</div>
            <p className="text-[11px] text-[#546E7A]">
              {lang === 'mr' ? '३४ रुग्णवाहिका वाहतूक पूर्ण' : lang === 'hi' ? '३४ एम्बुलेंस परिवहन पूर्ण' : '34 ambulance transits completed'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#546E7A]">
              <span className="text-xs font-bold uppercase">{lang === 'mr' ? 'औषध उपलब्धता' : lang === 'hi' ? 'दवा उपलब्धता' : 'Drug Availability'}</span>
              <Pill className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-black text-green-700 font-mono">94.6%</div>
            <p className="text-[11px] text-[#546E7A]">
              {lang === 'mr' ? '३ केंद्रांमध्ये साठ्याची तातडीची मागणी' : lang === 'hi' ? '३ केंद्रों में स्टॉक मांग चिह्नित' : '3 facilities flagged for indent'}
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setViewMode('command_dashboard')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'जिल्हा नियंत्रण कक्ष' : lang === 'hi' ? 'जिला नियंत्रण कक्ष' : 'District Command'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? '८४७ केंद्रे थेट मॉनिटरिंग' : lang === 'hi' ? '८४७ केंद्र लाइव मॉनिटरिंग' : '847 Facilities & KPIs'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>

          <button
            onClick={() => navigate('/admin/facilities')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'आरोग्य केंद्र संचलन मॅट्रिक्स' : lang === 'hi' ? 'स्वास्थ्य केंद्र संचालन मैट्रिक्स' : 'Facility Matrix'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? '३६ PHC व उपकेंद्रांची स्थिती' : lang === 'hi' ? '३६ PHC व उपकेंद्रों की स्थिति' : 'Staff attendance & beds'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>

          <button
            onClick={() => navigate('/admin/medicines')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'जिल्हा औषध पुरवठा साखळी' : lang === 'hi' ? 'जिला दवा आपूर्ति श्रृंखला' : 'Medicine Supply Chain'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? 'साठा संपण्याच्या सूचना' : lang === 'hi' ? 'स्टॉक समाप्ति पूर्व चेतावनी' : 'Stockout early warnings'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>

          <button
            onClick={() => navigate('/admin/high-risk')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#F57C00] flex items-center justify-center group-hover:bg-[#F57C00] group-hover:text-white transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'उच्च जोखीम रुग्ण ट्रॅकर' : lang === 'hi' ? 'उच्च जोखिम मरीज़ ट्रैकर' : 'High-Risk Cohort'}
                </h4>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? 'मातृत्व व जुनाट आजार ट्रॅकिंग' : lang === 'hi' ? 'मातृत्व व दीर्घकालिक रोग ट्रैकिंग' : 'Maternal & chronic disease'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C] transition" />
          </button>
        </div>

        {/* Recharts Analytics: Weekly Trends AreaChart */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CFD8DC] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'आठवडी बाह्यरुग्ण व टेलीकन्सल्टेशन कल (Weekly Trends)' : lang === 'hi' ? 'साप्ताहिक ओपीडी व टेलीकंसल्टेशन रुझान (Weekly Trends)' : 'Weekly Consultations & Teleconsult Trends'}
              </h3>
              <p className="text-xs text-[#546E7A]">
                {lang === 'mr' 
                  ? 'शिरूर तालुक्यातील प्राथमिक केंद्रे व उपकेंद्रांचे विश्लेषण' 
                  : lang === 'hi'
                    ? 'शिरूर ब्लॉक के प्राथमिक स्वास्थ्य केंद्र व उपकेंद्रों का विश्लेषण'
                    : 'OPD volume comparison: In-person visits vs Teleconsultations'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1A4B8C]" />
                <span className="text-[#1C2B3A]">{lang === 'mr' ? 'एकूण तपासण्या' : lang === 'hi' ? 'कुल परामर्श' : 'Total Consults'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F57C00]" />
                <span className="text-[#1C2B3A]">{lang === 'mr' ? 'टेलीकन्सल्टेशन' : lang === 'hi' ? 'टेलीकंसल्टेशन' : 'Teleconsults'}</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ADMIN_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A4B8C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1A4B8C" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorTele" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F57C00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F57C00" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#546E7A' }} />
                <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #CFD8DC', fontSize: '12px' }} />
                <Area type="monotone" dataKey="consultations" stroke="#1A4B8C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConsults)" />
                <Area type="monotone" dataKey="teleconsult" stroke="#F57C00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTele)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Operational Matrix Table */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm overflow-hidden">
          <div className="p-5 bg-[#F5F7FA] border-b border-[#CFD8DC] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'आरोग्य केंद्र प्रत्यक्ष कामगिरी (Operational Matrix)' : lang === 'hi' ? 'स्वास्थ्य केंद्र प्रत्यक्ष प्रदर्शन (Operational Matrix)' : 'PHC & Sub-Centre Operational Status'}
              </h3>
              <p className="text-[11px] text-[#546E7A]">
                {lang === 'mr' ? 'कर्मचारी उपस्थिती, औषध स्थिती व प्रलंबित रेफरल्स' : lang === 'hi' ? 'कर्मचारी उपस्थिति, दवा स्टॉक स्थिति व लंबित रेफरल' : 'Staff attendance, medicine stock index, and pending transfers'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('command_dashboard')}
                className="text-xs font-bold text-white bg-[#1A4B8C] hover:bg-[#153e75] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'लाईव्ह कमांड केंद्र उघडा' : lang === 'hi' ? 'लाइव कमांड सेंटर खोलें' : 'Launch Command Center'}</span>
              </button>
              <button
                onClick={() => navigate('/admin/facilities')}
                className="text-xs font-bold text-[#1A4B8C] hover:underline flex items-center gap-1"
              >
                <span>{lang === 'mr' ? 'सर्व ३६ केंद्रे पहा' : lang === 'hi' ? 'सभी ३६ केंद्र देखें' : 'View All 36 Facilities'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#CFD8DC] text-[#546E7A] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{lang === 'mr' ? 'आरोग्य केंद्राचे नाव' : lang === 'hi' ? 'स्वास्थ्य केंद्र का नाम' : 'Facility Name'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'प्रकार' : lang === 'hi' ? 'प्रकार' : 'Type'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'आजचे रुग्ण' : lang === 'hi' ? 'आज के मरीज़' : 'Patients Seen'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'टेलीकन्सल्ट' : lang === 'hi' ? 'टेलीकंसल्ट' : 'Teleconsults'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'कर्मचारी उपस्थिती' : lang === 'hi' ? 'कर्मचारी उपस्थिति' : 'Staff Attendance'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'औषध साठा स्थिती' : lang === 'hi' ? 'दवा स्टॉक स्थिति' : 'Medicine Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CFD8DC] text-[#1C2B3A]">
                {ADMIN_FACILITIES_METRICS.map((fac, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold">{fac.name}</td>
                    <td className="py-3.5 px-4 text-[#546E7A]">{fac.type}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{fac.patients}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1A4B8C]">{fac.consults}</td>
                    <td className="py-3.5 px-4 font-mono">{fac.staffPresent}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        fac.medicineStatus === 'adequate' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : fac.medicineStatus === 'low'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {fac.medicineStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* ABDM & HMIS Gateway Modal (Demand 13) */}
        <AbdmInteroperabilityModal
          isOpen={isAbdmModalOpen}
          onClose={() => setIsAbdmModalOpen(false)}
        />

      </div>
    </DashboardLayout>
  );
}
