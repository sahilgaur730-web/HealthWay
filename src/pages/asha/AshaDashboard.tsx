import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  Users, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  UserPlus, 
  Stethoscope, 
  PhoneCall, 
  Calendar, 
  Activity, 
  ChevronRight, 
  MapPin, 
  ShieldCheck, 
  HeartPulse,
  Filter,
  Check,
  Video
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { ASHA_USER, INITIAL_ASHA_TASKS, AshaTask } from '../../data/mockData';

export default function AshaDashboard() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [isOnline, setIsOnline] = useState(true);
  const [tasks, setTasks] = useState<AshaTask[]>(INITIAL_ASHA_TASKS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'high'>('all');

  const completedCount = tasks.filter(t => t.done).length;
  const pendingCount = tasks.length - completedCount;

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'high') return t.priority === 'high';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Offline / Online Network Bar */}
        <div className={`rounded-xl p-3.5 border flex items-center justify-between transition ${
          isOnline 
            ? 'bg-green-50/70 border-green-200 text-green-800' 
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600 shrink-0" />
                <span>{lang === 'mr' ? 'ऑनलाइन — सर्व डेटा क्लाउड सर्व्हरशी थेट समक्रमित आहे' : lang === 'hi' ? 'ऑनलाइन — समस्त डेटा क्लाउड सर्वर से सीधे सिंक है' : 'Online Mode — Real-time synchronization active'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{lang === 'mr' ? 'ऑफलाइन मोड — डेटा स्थानिक पातळीवर सुरक्षित आहे; नेटवर्क आल्यावर सिंक होईल' : lang === 'hi' ? 'ऑफलाइन मोड — डेटा स्थानीय डिवाइस में सुरक्षित है; नेटवर्क आने पर सिंक होगा' : 'Offline Mode — Records saved locally; auto-sync upon connectivity'}</span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className="text-[11px] font-bold underline hover:opacity-80 transition"
          >
            {isOnline ? (lang === 'mr' ? 'ऑफलाइन सिम्युलेट करा' : lang === 'hi' ? 'ऑफलाइन सिमुलेट करें' : 'Simulate Offline') : (lang === 'mr' ? 'ऑनलाइन व्हा' : lang === 'hi' ? 'ऑनलाइन कनेक्ट करें' : 'Connect Online')}
          </button>
        </div>

        {/* ASHA Profile Card */}
        <div className="bg-[#1A4B8C] rounded-2xl p-6 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    {user
                      ? (lang === 'mr' ? user.nameMr || user.name : user.name)
                      : (lang === 'mr' ? ASHA_USER.name : lang === 'hi' ? 'सुमन कांबले' : ASHA_USER.nameEn)}
                  </h2>
                  <span className="bg-[#F57C00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    ASHA
                  </span>
                </div>
                <p className="text-blue-100 text-xs font-medium mt-0.5">
                  {user
                    ? (lang === 'mr' ? user.designationMr || user.designation : user.designation) || (lang === 'mr' ? 'राष्ट्रीय आरोग्य अभियान · मान्यताप्राप्त सामाजिक आरोग्य कार्यकर्ती' : 'National Health Mission · Accredited Social Health Activist')
                    : (lang === 'mr' ? 'राष्ट्रीय आरोग्य अभियान · मान्यताप्राप्त सामाजिक आरोग्य कार्यकर्ती' : lang === 'hi' ? 'राष्ट्रीय स्वास्थ्य मिशन · मान्यताप्राप्त सामाजिक स्वास्थ्य कार्यकर्ता' : 'National Health Mission · Accredited Social Health Activist')}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-200 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user?.village ? (lang === 'mr' ? user.villageMr || user.village : user.village) : ASHA_USER.village}
                    {user?.subCentre ? ` (${lang === 'mr' ? user.subCentreMr || user.subCentre : user.subCentre})` : ''}
                    , ता. {ASHA_USER.block}, जि. {ASHA_USER.district}
                  </span>
                  <span>ID: <strong className="font-mono text-white">{user?.username || ASHA_USER.ashaId}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 self-stretch sm:self-auto">
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-black font-mono">{ASHA_USER.patientsCount}</div>
                <div className="text-[10px] text-blue-200 uppercase font-semibold">
                  {lang === 'mr' ? 'नोंदणीकृत नागरिक' : lang === 'hi' ? 'ट्रैक किए गए मरीज़' : 'Patients Tracked'}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-black font-mono text-amber-300">{ASHA_USER.highRiskCount}</div>
                <div className="text-[10px] text-blue-200 uppercase font-semibold">
                  {lang === 'mr' ? 'उच्च जोखीम रुग्ण' : lang === 'hi' ? 'उच्च जोखिम मरीज़' : 'High-Risk Cases'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/asha/consultation')}
            className="p-4 rounded-xl bg-white border-2 border-emerald-500/40 hover:border-emerald-600 text-left transition shadow-sm space-y-2 group bg-gradient-to-b from-emerald-50/40 to-white"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center transition shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                {lang === 'mr' ? 'डॉक्टर टेलीकन्सल्ट' : lang === 'hi' ? 'डॉक्टर टेलीकंसल्ट' : 'Doctor Teleconsult'}
              </h4>
              <p className="text-[11px] text-emerald-700">
                {lang === 'mr' ? 'सहाय्यित व्हिडिओ कॉल' : lang === 'hi' ? 'सहाय्यित वीडियो कॉल' : 'Assisted Video/Audio'}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/asha/register')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'नवीन रुग्ण नोंदणी' : lang === 'hi' ? 'नया मरीज़ पंजीकरण' : 'Register Patient'}
              </h4>
              <p className="text-[11px] text-[#546E7A]">
                {lang === 'mr' ? 'ABHA कार्ड व माहिती' : lang === 'hi' ? 'आभा कार्ड व विवरण' : 'Generate ABHA ID'}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/asha/patients')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'गाव रुग्ण यादी' : lang === 'hi' ? 'गाँव मरीज़ सूची' : 'Village Registry'}
              </h4>
              <p className="text-[11px] text-[#546E7A]">
                {lang === 'mr' ? '१२७ नागरिकांच्या नोंदी' : lang === 'hi' ? '१२७ मरीज़ रिकॉर्ड' : '127 Patient Records'}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/asha/triage')}
            className="p-4 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-left transition shadow-sm space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center group-hover:bg-[#1A4B8C] group-hover:text-white transition">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'फील्ड ट्रायज व डॉक्टर' : lang === 'hi' ? 'फील्ड ट्रिआज व डॉक्टर' : 'Field Triage & Doctor'}
              </h4>
              <p className="text-[11px] text-[#546E7A]">
                {lang === 'mr' ? 'तातडीने टेलीकन्सल्ट' : lang === 'hi' ? 'त्वरित टेलीकंसल्ट' : 'Instant Teleconsult'}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/patient/emergency')}
            className="p-4 rounded-xl bg-red-50 border border-red-200 hover:border-red-400 text-left transition shadow-sm space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900">
                {lang === 'mr' ? '१०८ रुग्णवाहिका' : lang === 'hi' ? '१०८ एम्बुलेंस' : '108 Emergency'}
              </h4>
              <p className="text-[11px] text-red-700">
                {lang === 'mr' ? 'तातडीने कॉल करा' : lang === 'hi' ? '१-टैप SOS डिस्पैच' : '1-Tap SOS Dispatch'}
              </p>
            </div>
          </button>
        </div>

        {/* Daily Field Tasks Checklist */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CFD8DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'आजचे प्रत्यक्ष भेटीचे वेळापत्रक' : lang === 'hi' ? 'आज की प्रत्यक्ष भेंट कार्यसूची' : "Today's Field Visits Checklist"}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1A4B8C] border border-blue-200">
                  {completedCount} / {tasks.length} {lang === 'mr' ? 'पूर्ण' : lang === 'hi' ? 'पूर्ण' : 'Done'}
                </span>
              </div>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' 
                  ? 'घरोघरी जाऊन तपासणी पूर्ण झाल्यावर "पूर्ण झाले" खूण करा' 
                  : lang === 'hi'
                    ? 'घर-घर जाकर जाँच पूरी होने पर "पूर्ण" चिह्नित करें'
                    : 'Check off tasks as you complete home visits and record patient vitals'}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === 'all' ? 'bg-[#1A4B8C] text-white' : 'text-[#546E7A] hover:bg-slate-100'
                }`}
              >
                {lang === 'mr' ? 'सर्व' : lang === 'hi' ? 'सभी' : 'All'}
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === 'pending' ? 'bg-[#1A4B8C] text-white' : 'text-[#546E7A] hover:bg-slate-100'
                }`}
              >
                {lang === 'mr' ? `शिल्लक (${pendingCount})` : lang === 'hi' ? `लंबित (${pendingCount})` : `Pending (${pendingCount})`}
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === 'high' ? 'bg-[#1A4B8C] text-white' : 'text-[#546E7A] hover:bg-slate-100'
                }`}
              >
                {lang === 'mr' ? 'तातडीचे' : lang === 'hi' ? 'उच्च प्राथमिकता' : 'High Priority'}
              </button>
            </div>
          </div>

          {/* Task Items List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  task.done 
                    ? 'bg-slate-50/70 border-slate-200 opacity-60' 
                    : task.priority === 'high'
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-[#CFD8DC] hover:border-[#1A4B8C]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition ${
                    task.done 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-[#CFD8DC] bg-white'
                  }`}>
                    {task.done && <Check className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${task.done ? 'line-through text-slate-400' : 'text-[#1C2B3A]'}`}>
                        {task.patientName}
                      </span>
                      <span className="text-[10px] text-[#546E7A] font-mono">({task.patientId})</span>
                      {task.priority === 'high' && !task.done && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                          {lang === 'mr' ? 'तातडीचे' : lang === 'hi' ? 'उच्च' : 'High'}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${task.done ? 'line-through text-slate-400' : 'text-[#546E7A]'}`}>
                      {lang === 'mr' ? task.taskMr : lang === 'hi' ? task.taskMr : task.taskEn}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-[#546E7A] flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{task.time}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase mt-1 inline-block text-[#1A4B8C]">
                    {task.done ? (lang === 'mr' ? 'पूर्ण झाले' : lang === 'hi' ? 'पूर्ण' : 'Completed') : (lang === 'mr' ? 'नोंद करा' : lang === 'hi' ? 'चिह्नित करें' : 'Mark Done')}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* High-Risk Surveillance Alert Box */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F57C00] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {lang === 'mr' ? 'उच्च जोखीम माता दक्षता इशारा (High Risk ANC Alert)' : lang === 'hi' ? 'उच्च जोखिम माता निगरानी चेतावनी (High Risk ANC Alert)' : 'High-Risk Maternal Surveillance'}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lang === 'mr' 
                  ? 'सुनीता जाधव (७वा महिना, Hb १०.२) आणि इतर ३ मातांची तपासणी आठवड्याभरात प्राथमिक केंद्रात होणे अनिवार्य आहे.' 
                  : lang === 'hi'
                    ? 'सुनीता जाधव (७वाँ महीना, Hb १०.२) और ३ अन्य माताओं की जाँच इस सप्ताह प्राथमिक केंद्र में होना अनिवार्य है।'
                    : 'Sunita Jadhav (7th month, Hb 10.2) and 3 other patients are due for specialized PHC review this week.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/asha/patients')}
            className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition shrink-0"
          >
            {lang === 'mr' ? 'जोखीम यादी पहा' : lang === 'hi' ? 'जोखिम सूची देखें' : 'View Risk Cohort'}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
