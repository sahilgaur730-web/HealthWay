import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Tv, 
  Bell, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  SkipForward, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  UserPlus, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  QrCode, 
  Stethoscope, 
  Activity, 
  Eye
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  queueEngine, 
  SEED_HEALTH_CENTERS, 
  ClientQueueData, 
  AppointmentModel 
} from '../../services/queueEngine';
import { queueNotificationService } from '../../services/queueNotificationService';

export default function HealthCenterDashboard() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'queue' | 'appointments' | 'analytics' | 'display'>('queue');

  // Clinic & Department state
  const [selectedCenterId, setSelectedCenterId] = useState<string>('phc_baramati');
  const [currentDept, setCurrentDept] = useState<string>('General Medicine');
  const [queueData, setQueueData] = useState<ClientQueueData>(() => 
    queueEngine.getLiveQueueStatus('phc_baramati', 'General Medicine')
  );

  // Queue table filter & appointments list
  const [tableSearch, setTableSearch] = useState<string>('');
  const [appointments, setAppointments] = useState<AppointmentModel[]>(() => 
    queueEngine.getAppointments('phc_baramati')
  );
  const [aptStatusFilter, setAptStatusFilter] = useState<string>('all');

  // Walk-in form state
  const [walkinName, setWalkinName] = useState<string>('');
  const [walkinPhone, setWalkinPhone] = useState<string>('');
  const [walkinPriority, setWalkinPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [walkinAge, setWalkinAge] = useState<string>('35');
  const [walkinGender, setWalkinGender] = useState<'male' | 'female' | 'other'>('male');

  // Operational feedback toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeCenter = SEED_HEALTH_CENTERS.find(c => c._id === selectedCenterId) || SEED_HEALTH_CENTERS[0];

  // Subscribe to live queue changes
  useEffect(() => {
    const refresh = () => {
      const q = queueEngine.getLiveQueueStatus(selectedCenterId, currentDept);
      setQueueData(q);
      setAppointments(queueEngine.getAppointments(selectedCenterId));
    };

    refresh();
    const unsubscribe = queueEngine.subscribe(() => {
      refresh();
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCenterId, currentDept]);

  // Queue Operations
  const handleCallNext = () => {
    const result = queueEngine.callNextPatient(selectedCenterId, currentDept);
    if (result.success && result.calledPatient) {
      queueNotificationService.playCallChime();
      showToast(
        isMr 
          ? `टोकन #${result.calledPatient.tokenNumber} (${result.calledPatient.patientName}) बोलावण्यात आले!` 
          : `Token #${result.calledPatient.tokenNumber} (${result.calledPatient.patientName}) called to Room!`,
        'success'
      );
    } else {
      showToast(result.message || (isMr ? 'रांगेत कोणतेही रुग्ण नाहीत' : 'No patients waiting in queue'), 'info');
    }
  };

  const handleCompleteConsultation = () => {
    const res = queueEngine.completeConsultation(selectedCenterId, currentDept);
    if (res.success) {
      showToast(isMr ? 'सल्लामसलत यशस्वीरीत्या पूर्ण झाली!' : 'Consultation marked as completed!', 'success');
    } else {
      showToast(res.message || 'No active consultation', 'info');
    }
  };

  const handleSkipToken = (tokenNumber: number) => {
    const res = queueEngine.skipPatient(tokenNumber, selectedCenterId, currentDept, 'No show');
    if (res.success) {
      showToast(isMr ? `टोकन #${tokenNumber} वगळण्यात आले (अनुपस्थित)` : `Token #${tokenNumber} marked as skipped (No-show)`, 'warning');
    }
  };

  const handleTogglePause = () => {
    if (queueData.isPaused) {
      queueEngine.resumeQueue(selectedCenterId, currentDept);
      showToast(isMr ? 'कतार पुन्हा सुरू केली!' : 'Queue resumed successfully!', 'success');
    } else {
      const reason = window.prompt(
        isMr ? 'कतार तात्पुरती थांबवण्याचे कारण प्रविष्ट करा:' : 'Enter reason for pausing queue:',
        isMr ? 'वैद्यकीय अधिकारी आपत्कालीन रुग्णास तपासत आहेत' : 'Doctor attending emergency case'
      );
      if (reason !== null) {
        queueEngine.pauseQueue(selectedCenterId, currentDept, reason || 'Temporary break');
        showToast(isMr ? `कतार थांबवली: ${reason}` : `Queue paused: ${reason}`, 'warning');
      }
    }
  };

  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim() || walkinPhone.replace(/\D/g, '').length !== 10) {
      showToast(isMr ? 'कृपया रुग्णाचे नाव व १०-अंकी मोबाईल अचूक भरा' : 'Please enter patient name and valid 10-digit phone', 'error');
      return;
    }

    const res = queueEngine.addWalkInPatient(selectedCenterId, currentDept, {
      name: walkinName.trim(),
      phone: walkinPhone.trim(),
      priority: walkinPriority,
      age: parseInt(walkinAge) || 35,
      gender: walkinGender
    });

    if (res.success) {
      showToast(
        isMr 
          ? `थेट रुग्ण ${walkinName} रांगेत जोडले! टोकन #${res.tokenNumber}` 
          : `Walk-in patient ${walkinName} added! Token #${res.tokenNumber}`,
        'success'
      );
      setWalkinName('');
      setWalkinPhone('');
      setWalkinPriority('normal');
    }
  };

  const handleCheckInAppointment = (appointmentId: string) => {
    const res = queueEngine.checkInPatient(appointmentId, selectedCenterId, currentDept);
    if (res.success) {
      showToast(isMr ? `टोकन #${res.tokenNumber} देण्यात आला!` : `Token #${res.tokenNumber} issued to patient!`, 'success');
    } else {
      showToast(res.message || 'Check-in failed', 'warning');
    }
  };

  // Filtered waiting entries
  const filteredWaitingList = queueData.waitingList.filter(item => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return String(item.tokenNumber).includes(q) || 
      (item.patientName && item.patientName.toLowerCase().includes(q));
  });

  // Filtered Appointments
  const filteredAppointments = appointments.filter(apt => {
    if (aptStatusFilter === 'all') return true;
    return apt.status === aptStatusFilter;
  });

  // Analytics mock flow hours
  const FLOW_DATA = [
    { hour: '08 AM', count: 4 },
    { hour: '09 AM', count: 9 },
    { hour: '10 AM', count: 15 },
    { hour: '11 AM', count: 18 },
    { hour: '12 PM', count: 12 },
    { hour: '01 PM', count: 6 },
    { hour: '02 PM', count: 11 },
    { hour: '03 PM', count: 8 },
    { hour: '04 PM', count: 3 }
  ];
  const maxFlow = Math.max(...FLOW_DATA.map(d => d.count));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* ========================================================== */}
        {/* HEADER & FACILITY SELECTOR */}
        {/* ========================================================== */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0B2545] text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1C2B3A]">
                  {isMr ? 'आरोग्य केंद्र रांग व्यवस्थापन डॅशबोर्ड' : 'Health Center Queue Management'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isMr ? 'थेट सेवेत' : 'Live Clinic'}
                </span>
              </div>
              <p className="text-xs text-[#546E7A] mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-[#1A4B8C]">{activeCenter.name}</span>
                <span>·</span>
                <span>{activeCenter.location.village}, {activeCenter.location.district}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Facility Selector */}
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#CFD8DC] text-xs font-semibold text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
            >
              {SEED_HEALTH_CENTERS.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            {/* TV Screen Launcher */}
            <button
              onClick={() => window.open(`/queue-display?centerId=${selectedCenterId}&department=${encodeURIComponent(currentDept)}`, '_blank')}
              className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133E7C] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>{isMr ? 'टीव्ही स्क्रीन उघडा' : 'Open TV Screen'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* TOAST ALERT BANNER */}
        {/* ========================================================== */}
        {toastMessage && (
          <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
            toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
            toastMessage.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-800' :
            toastMessage.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {toastMessage.type === 'error' && <ShieldAlert className="w-4 h-4 text-rose-600" />}
              {toastMessage.type === 'info' && <Bell className="w-4 h-4 text-blue-600" />}
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-[10px] font-bold underline">Dismiss</button>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB NAVIGATION BAR */}
        {/* ========================================================== */}
        <div className="flex items-center border-b border-[#CFD8DC] gap-2 overflow-x-auto">
          {[
            { id: 'queue', labelMr: 'थेट रांग व्यवस्थापन', labelEn: 'Live Queue', icon: Users },
            { id: 'appointments', labelMr: 'आजच्या अपॉइंटमेंट्स', labelEn: "Today's Appointments", icon: CalendarIcon },
            { id: 'analytics', labelMr: 'रुग्ण प्रवाह व अहवाल', labelEn: 'Flow Analytics & Reports', icon: BarChart3 },
            { id: 'display', labelMr: 'प्रतीक्षा स्क्रीन व्यवस्था', labelEn: 'TV Display & Kiosk', icon: Tv }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  active 
                    ? 'border-[#1A4B8C] text-[#1A4B8C] bg-white' 
                    : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A] hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isMr ? tab.labelMr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* TAB 1: LIVE QUEUE MANAGEMENT */}
        {/* ========================================================== */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Action Bar & Department Filter */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#546E7A]">{isMr ? 'विभाग:' : 'Department:'}</span>
                <select
                  value={currentDept}
                  onChange={(e) => setCurrentDept(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#CFD8DC] text-xs font-bold text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="General Medicine">General Medicine / OPD</option>
                  <option value="Maternal & Antenatal">Maternal & Antenatal (ANC)</option>
                  <option value="Pediatrics & Immunization">Pediatrics & Immunization</option>
                  <option value="NCD Clinic">NCD Clinic</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCallNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>{isMr ? 'पुढील रुग्ण बोलवा (Call Next)' : 'Call Next Patient'}</span>
                </button>

                <button
                  onClick={handleTogglePause}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                    queueData.isPaused
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {queueData.isPaused ? <PlayCircle className="w-4 h-4 text-emerald-600" /> : <PauseCircle className="w-4 h-4 text-amber-600" />}
                  <span>{queueData.isPaused ? (isMr ? 'कतार सुरू करा' : 'Resume Queue') : (isMr ? 'कतार थांबवा' : 'Pause Queue')}</span>
                </button>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Waiting / प्रतीक्षा</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-blue-900 mt-2 tabular-nums">
                  {queueData.waitingCount}
                </div>
                <div className="text-[10px] text-[#546E7A] mt-1">In clinic waiting room</div>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed / पूर्ण</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-900 mt-2 tabular-nums">
                  {queueData.completedCount}
                </div>
                <div className="text-[10px] text-[#546E7A] mt-1">Consultations finished</div>
              </div>

              <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Avg Wait / वेळ</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-amber-900 mt-2 tabular-nums">
                  ~{queueData.avgWaitTime}m
                </div>
                <div className="text-[10px] text-[#546E7A] mt-1">Per patient consultation</div>
              </div>

              <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Emergency / गंभीर</span>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-3xl font-black text-rose-900 mt-2 tabular-nums">
                  {queueData.waitingList.filter(e => e.priority === 'emergency').length}
                </div>
                <div className="text-[10px] text-rose-600 font-bold mt-1">Triage top priority</div>
              </div>
            </div>

            {/* Now Serving Active Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-emerald-200 font-bold">CURRENT TOKEN</div>
                  <div className="text-4xl font-black text-amber-300 tabular-nums mt-0.5">
                    {queueData.currentToken ? `#${queueData.currentToken}` : '--'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
                    {isMr ? 'सध्या तपासणी सुरू असलेले रुग्ण:' : 'Patient In Consultation:'}
                  </div>
                  <div className="text-xl font-bold mt-0.5">
                    {queueData.currentPatient?.name || (isMr ? 'कोणताही रुग्ण तपासणीत नाही' : 'No patient currently inside')}
                  </div>
                  <div className="text-xs text-emerald-100/80 mt-0.5">
                    {currentDept} · Room #1 · {activeCenter.name}
                  </div>
                </div>
              </div>

              {queueData.currentPatient && (
                <button
                  onClick={handleCompleteConsultation}
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{isMr ? 'तपासणी पूर्ण झाली (Complete)' : 'Complete Consultation'}</span>
                </button>
              )}
            </div>

            {/* Walk-in Registration Section */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1C2B3A] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#1A4B8C]" />
                <span>{isMr ? 'थेट आलेल्या रुग्णाची नोंदणी करा (Add Walk-in Patient)' : 'Add Walk-in Patient to Live Queue'}</span>
              </h3>

              <form onSubmit={handleAddWalkIn} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder={isMr ? 'रुग्णाचे नाव' : 'Patient Full Name'}
                  className="px-3.5 py-2 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                  required
                />
                <input
                  type="tel"
                  maxLength={10}
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={isMr ? '१०-अंकी मोबाईल' : '10-digit Phone'}
                  className="px-3.5 py-2 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                  required
                />
                <select
                  value={walkinPriority}
                  onChange={(e) => setWalkinPriority(e.target.value as 'normal' | 'urgent' | 'emergency')}
                  className="px-3 py-2 rounded-xl border border-[#CFD8DC] text-xs font-semibold text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="normal">{isMr ? 'सामान्य प्राधान्य (Normal)' : 'Normal Priority'}</option>
                  <option value="urgent">{isMr ? 'तातडीचे (Urgent)' : 'Urgent (Top 3)'}</option>
                  <option value="emergency">{isMr ? 'गंभीर आपत्कालीन (Emergency)' : 'Emergency (Front of Queue)'}</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={walkinAge}
                    onChange={(e) => setWalkinAge(e.target.value)}
                    placeholder="Age"
                    className="w-16 px-2.5 py-2 rounded-xl border border-[#CFD8DC] text-xs font-medium"
                  />
                  <select
                    value={walkinGender}
                    onChange={(e) => setWalkinGender(e.target.value as 'male' | 'female' | 'other')}
                    className="flex-1 px-2 py-2 rounded-xl border border-[#CFD8DC] text-xs font-semibold bg-white"
                  >
                    <option value="male">M</option>
                    <option value="female">F</option>
                    <option value="other">O</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1A4B8C] text-white hover:bg-blue-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMr ? 'रांगेत जोडा' : 'Add to Queue'}</span>
                </button>
              </form>
            </div>

            {/* Waiting Queue Table */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] overflow-hidden shadow-xs space-y-3">
              <div className="p-4 border-b border-[#CFD8DC] flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#1C2B3A] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1A4B8C]" />
                  <span>{isMr ? 'प्रतीक्षा यादी (Waiting Patients)' : 'Live Waiting Queue'}</span>
                </h3>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#78909C] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder={isMr ? 'टोकन किंवा नाव शोधा...' : 'Search token or name...'}
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-[#CFD8DC] text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setQueueData(queueEngine.getLiveQueueStatus(selectedCenterId, currentDept))}
                    className="p-1.5 rounded-lg border border-[#CFD8DC] hover:bg-slate-50 text-[#546E7A]"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-[#CFD8DC] text-[#546E7A] font-bold">
                    <tr>
                      <th className="p-3">Pos</th>
                      <th className="p-3">Token</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Check-in Time</th>
                      <th className="p-3">Est. Wait</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWaitingList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#78909C]">
                          <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                          <p>{isMr ? 'या विभागात कोणतीही प्रतीक्षा नाही' : 'No patients currently waiting in queue'}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredWaitingList.map(item => {
                        const isEmergency = item.priority === 'emergency';
                        const isUrgent = item.priority === 'urgent';

                        return (
                          <tr key={item.tokenNumber} className={`hover:bg-slate-50/80 transition ${
                            isEmergency ? 'bg-rose-50/50' : isUrgent ? 'bg-amber-50/30' : ''
                          }`}>
                            <td className="p-3 font-bold text-[#1C2B3A]">#{item.position}</td>
                            <td className="p-3 font-black text-[#1A4B8C]">#{item.tokenNumber}</td>
                            <td className="p-3 font-semibold text-[#1C2B3A]">
                              {item.patientName || `Patient #${item.tokenNumber}`}
                            </td>
                            <td className="p-3">
                              {isEmergency && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit">
                                  <ShieldAlert className="w-3 h-3 text-rose-600" /> Emergency
                                </span>
                              )}
                              {isUrgent && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Urgent
                                </span>
                              )}
                              {!isEmergency && !isUrgent && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#546E7A]">
                                  Normal
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[#546E7A]">
                              {new Date(item.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 font-bold text-amber-700">~{item.estimatedWait} min</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                Waiting
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={handleCallNext}
                                className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                              >
                                Call
                              </button>
                              <button
                                onClick={() => handleSkipToken(item.tokenNumber)}
                                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[#546E7A] font-bold text-[11px] transition"
                              >
                                Skip
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: TODAY'S APPOINTMENTS */}
        {/* ========================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'booked', label: 'Booked' },
                  { id: 'waiting', label: 'Waiting in Queue' },
                  { id: 'in-consultation', label: 'In Consultation' },
                  { id: 'completed', label: 'Completed' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setAptStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      aptStatusFilter === f.id
                        ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white shadow-xs'
                        : 'bg-white border-[#CFD8DC] text-[#546E7A] hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-[#546E7A]">
                {filteredAppointments.length} Appointments Listed
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map(apt => {
                const isBooked = apt.status === 'booked';
                const isWaiting = apt.status === 'waiting';
                const isDone = apt.status === 'completed';

                return (
                  <div key={apt.appointmentId} className="bg-white rounded-xl border border-[#CFD8DC] p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#1A4B8C]">
                          {apt.appointmentId}
                        </span>
                        <h4 className="text-sm font-bold text-[#1C2B3A] mt-1">{apt.patient.name}</h4>
                        <p className="text-xs text-[#546E7A] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>+91 {apt.patient.phone}</span>
                          <span>·</span>
                          <span>{apt.patient.age} yrs, {apt.patient.gender}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isDone ? 'bg-emerald-100 text-emerald-800' :
                          isWaiting ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                        {apt.tokenNumber && (
                          <div className="text-xs font-bold text-[#1A4B8C] mt-1">Token #{apt.tokenNumber}</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#546E7A]">
                      <div>
                        <span className="font-semibold">{apt.department}</span> · {apt.timeSlot.startTime}
                      </div>

                      {isBooked && (
                        <button
                          onClick={() => handleCheckInAppointment(apt.appointmentId)}
                          className="px-3 py-1.5 rounded-lg bg-[#1A4B8C] hover:bg-blue-800 text-white font-bold text-xs transition"
                        >
                          Check-in to Queue
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: FLOW ANALYTICS */}
        {/* ========================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs">
                <div className="text-xs font-bold text-[#78909C] uppercase">Total Today</div>
                <div className="text-3xl font-black text-[#1C2B3A] mt-1">47</div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14% vs yesterday
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs">
                <div className="text-xs font-bold text-[#78909C] uppercase">Avg Wait Time</div>
                <div className="text-3xl font-black text-[#1C2B3A] mt-1">11 min</div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3.5 h-3.5" /> -4 min reduction
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs">
                <div className="text-xs font-bold text-[#78909C] uppercase">No-show Rate</div>
                <div className="text-3xl font-black text-[#1C2B3A] mt-1">6.2%</div>
                <div className="text-xs text-blue-600 font-bold mt-1">Below 10% target</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs">
                <div className="text-xs font-bold text-[#78909C] uppercase">Online / Advance</div>
                <div className="text-3xl font-black text-[#1C2B3A] mt-1">68%</div>
                <div className="text-xs text-emerald-600 font-bold mt-1">32% walk-in intake</div>
              </div>
            </div>

            {/* Flow Chart Bar Graph */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1C2B3A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1A4B8C]" />
                <span>Hourly Patient Flow (Today) / प्रति तास रुग्ण संख्या</span>
              </h3>

              <div className="h-44 flex items-end gap-3 pt-6 px-2 border-b border-slate-200">
                {FLOW_DATA.map((item, idx) => {
                  const heightPercent = (item.count / maxFlow) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-[#1A4B8C] opacity-0 group-hover:opacity-100 transition">
                        {item.count}
                      </span>
                      <div 
                        style={{ height: `${heightPercent}%` }} 
                        className="w-full bg-[#1A4B8C] hover:bg-blue-600 rounded-t-lg transition-all duration-300 shadow-xs" 
                      />
                      <span className="text-[10px] font-semibold text-[#546E7A] -mb-5 whitespace-nowrap">
                        {item.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: TV DISPLAY & KIOSK */}
        {/* ========================================================== */}
        {activeTab === 'display' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div 
              onClick={() => window.open(`/queue-display?centerId=${selectedCenterId}&department=${encodeURIComponent(currentDept)}`, '_blank')}
              className="bg-white rounded-2xl border-2 border-[#CFD8DC] hover:border-[#1A4B8C] p-6 shadow-xs cursor-pointer transition space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1C2B3A]">
                {isMr ? 'प्रतीक्षा कक्ष टीव्ही स्क्रीन (Waiting Room TV)' : 'Open Waiting Room TV Screen'}
              </h3>
              <p className="text-xs text-[#546E7A]">
                {isMr ? 'मोठ्या अक्षरात टोकन, ऑडिओ अलर्ट व पुढील यादी दाखवण्यासाठी नवीन विंडोमध्ये सुरू करा' : 'Launches full-screen TV view with chime sounds, jumbo golden token numbers, and live queue list.'}
              </p>
              <div className="text-xs font-bold text-[#1A4B8C] pt-2 flex items-center gap-1">
                <span>Launch TV View</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/patient/book')}
              className="bg-white rounded-2xl border-2 border-[#CFD8DC] hover:border-[#1A4B8C] p-6 shadow-xs cursor-pointer transition space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1C2B3A]">
                {isMr ? 'रुग्ण नोंदणी पोर्टल (Citizen Booking Wizard)' : 'Citizen Booking & Registration'}
              </h3>
              <p className="text-xs text-[#546E7A]">
                {isMr ? 'नागरिकांसाठी ४ टप्प्यांचे ऑनलाईन अपॉइंटमेंट बुकिंग व टोकन पावती पोर्टल' : 'Open the 4-step patient booking flow to schedule appointments and generate tickets.'}
              </p>
              <div className="text-xs font-bold text-[#1A4B8C] pt-2 flex items-center gap-1">
                <span>Go to Patient Booking</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
