import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  HeartPulse,
  Hospital,
  Info,
  Layers,
  Lock,
  Microscope,
  PhoneCall,
  Pill,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Stethoscope,
  Tag,
  User,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  ABHAService,
  AbhaProfile,
  PatientLongitudinalData,
  VisitHistoryRecord,
  LabReportRecord,
  MedicationRecord,
  DocumentRecord
} from '../../services/abhaService';
import AbdmInteroperabilityModal from '../../components/common/AbdmInteroperabilityModal';

export default function MyRecords() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [recordsData] = useState<PatientLongitudinalData>(() => ABHAService.getPatientRecords());
  const [activeSession, setActiveSession] = useState<AbhaProfile | null>(() => ABHAService.getConnectedSession());
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'medications' | 'reports' | 'documents'>('overview');

  // Modals & Drawers
  const [isAbhaConnectOpen, setIsAbhaConnectOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAbdmModalOpen, setIsAbdmModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [selectedLabReport, setSelectedLabReport] = useState<LabReportRecord | null>(null);

  // Filters & Search
  const [timelineSearch, setTimelineSearch] = useState('');
  const [selectedFacilityLevel, setSelectedFacilityLevel] = useState<string>('all');
  const [medicationFilter, setMedicationFilter] = useState<'all' | 'active' | 'completed'>('active');

  // ABHA Connect Modal State
  const [abhaInput, setAbhaInput] = useState('43-5678-9012-3456');
  const [otpStep, setOtpStep] = useState<'input' | 'otp'>('input');
  const [otpValue, setOtpValue] = useState('432101');
  const [otpTxnId, setOtpTxnId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const patient = activeSession || recordsData.patient;

  const RECORD_TABS = [
    { id: 'overview', labelEn: 'Overview & Summary', labelMr: 'आरोग्य गोषवारा', icon: Activity },
    { id: 'timeline', labelEn: 'Visit History Timeline', labelMr: 'भेटींचा इतिहास (Timeline)', icon: Hospital },
    { id: 'medications', labelEn: 'Prescriptions', labelMr: 'औषधोपचार व गोळ्या', icon: Pill },
    { id: 'reports', labelEn: 'Diagnostic Labs', labelMr: 'प्रयोगशाळा अहवाल (Labs)', icon: Microscope },
    { id: 'documents', labelEn: 'Clinical Documents', labelMr: 'कागदपत्रे व स्कॅन', icon: FileText },
  ];

  // OTP Handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await ABHAService.generateOTP(abhaInput);
      setOtpTxnId(res.txnId);
      setOtpStep('otp');
    } catch {
      setOtpError('Failed to generate OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await ABHAService.verifyOTP(otpTxnId, otpValue);
      setActiveSession(res.profile);
      setIsAbhaConnectOpen(false);
      setOtpStep('input');
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDemoConnect = () => {
    const profile = ABHAService.connectDemoMode();
    setActiveSession(profile);
    setIsAbhaConnectOpen(false);
  };

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    return recordsData.visits.filter(v => {
      const matchesLevel = selectedFacilityLevel === 'all' || v.facilityLevel === selectedFacilityLevel;
      const query = timelineSearch.toLowerCase();
      const matchesSearch = !query ||
        v.facilityName.toLowerCase().includes(query) ||
        v.doctorName.toLowerCase().includes(query) ||
        v.diagnosisEn.toLowerCase().includes(query) ||
        v.diagnosisMr.toLowerCase().includes(query);
      return matchesLevel && matchesSearch;
    });
  }, [recordsData.visits, selectedFacilityLevel, timelineSearch]);

  // Filtered Medications
  const filteredMeds = useMemo(() => {
    return recordsData.medications.filter(m => {
      if (medicationFilter === 'active') return m.isActive;
      if (medicationFilter === 'completed') return !m.isActive;
      return true;
    });
  }, [recordsData.medications, medicationFilter]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'mr' ? 'रुग्ण डॅशबोर्डवर परत' : 'Back to Patient Dashboard'}
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1C2B3A] hover:bg-[#F8FAFC] text-xs font-bold transition shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-[#1A4B8C]" />
              {lang === 'mr' ? 'आभा क्यूआर कार्ड' : 'ABHA QR Card'}
            </button>
            <button
              onClick={() => setIsAbdmModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BED7F7] bg-[#E8F0FE] text-[#1A4B8C] hover:bg-[#D2E3FC] text-xs font-bold transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'ABDM संमती व देवाणघेवाण' : 'ABDM Consent & Share'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'प्रिंट' : 'Print EHR'}
            </button>
          </div>
        </div>

        {/* Master Patient ABHA Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#CFD8DC] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8F0FE]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A4B8C] to-[#153D70] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                {patient.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#1C2B3A]">
                    {lang === 'mr' ? patient.nameMr : patient.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <ShieldCheck className="w-3 h-3" />
                    ABDM Verified
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                  <span className="font-mono font-bold text-[#1A4B8C]">
                    ABHA: {patient.abhaNumber}
                  </span>
                  <span>•</span>
                  <span>{patient.abhaAddress}</span>
                  <span>•</span>
                  <span>
                    {lang === 'mr' ? 'वय:' : 'Age:'} {patient.age} yrs ({patient.gender})
                  </span>
                  <span>•</span>
                  <span className="font-bold text-[#DC2626]">{patient.bloodGroup}</span>
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  {patient.district}, {patient.state} • Health ID: {patient.healthIdNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsAbhaConnectOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9] text-xs font-bold transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#1A4B8C]" />
                {lang === 'mr' ? 'आभा खाते बदला' : 'Switch ABHA'}
              </button>
              <button
                onClick={() => navigate('/patient/triage')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A4B8C] text-white hover:bg-[#153D70] text-xs font-bold transition shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                {lang === 'mr' ? 'नवीन ट्रायज करा' : 'Start Triage'}
              </button>
            </div>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="bg-white rounded-xl p-1.5 border border-[#CFD8DC] shadow-sm flex items-center gap-1 overflow-x-auto">
          {RECORD_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex-1 justify-center ${
                  isActive
                    ? 'bg-[#1A4B8C] text-white shadow-sm'
                    : 'text-[#546E7A] hover:text-[#1A4B8C] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === 'mr' ? tab.labelMr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center font-bold">
                  <Hospital className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-[#64748B] font-bold uppercase">
                    {lang === 'mr' ? 'एकूण भेटी' : 'Total Visits'}
                  </div>
                  <div className="text-xl font-black text-[#1C2B3A]">
                    {recordsData.visits.length}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-[#64748B] font-bold uppercase">
                    {lang === 'mr' ? 'सक्रिय औषधे' : 'Active Meds'}
                  </div>
                  <div className="text-xl font-black text-[#1C2B3A]">
                    {recordsData.medications.filter(m => m.isActive).length}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-[#64748B] font-bold uppercase">
                    {lang === 'mr' ? 'लॅब अहवाल' : 'Lab Reports'}
                  </div>
                  <div className="text-xl font-black text-[#1C2B3A]">
                    {recordsData.labReports.length}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-[#64748B] font-bold uppercase">
                    {lang === 'mr' ? 'लसीकरण स्थिती' : 'Vaccination'}
                  </div>
                  <div className="text-sm font-black text-[#15803D]">
                    {recordsData.immunizations.filter(v => v.status === 'Completed').length} / {recordsData.immunizations.length} Done
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions & Allergies Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chronic & Maternal Conditions */}
              <div className="bg-white p-6 rounded-xl border border-[#CFD8DC] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#DC2626]" />
                    <h3 className="text-sm font-bold text-[#1C2B3A]">
                      {lang === 'mr' ? 'नोंदवलेले आजार व स्थिती' : 'Known Health Conditions & Status'}
                    </h3>
                  </div>
                  <span className="text-xs text-[#64748B]">{recordsData.conditions.length} Records</span>
                </div>

                <div className="space-y-3">
                  {recordsData.conditions.map(c => (
                    <div key={c.id} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1E293B]">
                          {lang === 'mr' ? c.conditionMr : c.conditionEn}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#1A4B8C] border border-[#C2D7FA]">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {lang === 'mr' ? c.notesMr : c.notesEn}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] flex items-center justify-between pt-1">
                        <span>Onset: {c.onsetDate}</span>
                        <span>{c.diagnosedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies & Recent Vitals */}
              <div className="space-y-6">
                {/* Allergies */}
                <div className="bg-white p-6 rounded-xl border border-[#CFD8DC] shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#EA580C]" />
                      <h3 className="text-sm font-bold text-[#1C2B3A]">
                        {lang === 'mr' ? 'औषध ॲलर्जी (Drug Allergies)' : 'Documented Drug Allergies'}
                      </h3>
                    </div>
                    <span className="text-xs text-[#DC2626] font-bold">Alert</span>
                  </div>

                  <div className="space-y-2">
                    {recordsData.allergies.map(a => (
                      <div key={a.id} className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#991B1B]">
                            {lang === 'mr' ? a.allergenMr : a.allergenEn}
                          </div>
                          <div className="text-[11px] text-[#B91C1C]">
                            {lang === 'mr' ? a.reactionMr : a.reactionEn}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#DC2626] text-white">
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Vitals Snapshot */}
                <div className="bg-white p-6 rounded-xl border border-[#CFD8DC] shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#1A4B8C]" />
                      <h3 className="text-sm font-bold text-[#1C2B3A]">
                        {lang === 'mr' ? 'शेवटचे व्हिटल्स (१५ जून २०२४)' : 'Latest Measured Vitals (15 Jun 2024)'}
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#64748B]">PHC Shirur</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-bold">BP</div>
                      <div className="text-xs font-black text-[#1E293B]">118/76</div>
                      <div className="text-[9px] text-[#16A34A] font-bold">Normal</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-bold">Pulse</div>
                      <div className="text-xs font-black text-[#1E293B]">74 bpm</div>
                      <div className="text-[9px] text-[#16A34A] font-bold">Stable</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-bold">SpO2</div>
                      <div className="text-xs font-black text-[#1E293B]">99%</div>
                      <div className="text-[9px] text-[#16A34A] font-bold">Optimal</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-bold">Sugar</div>
                      <div className="text-xs font-black text-[#1E293B]">96 mg/dL</div>
                      <div className="text-[9px] text-[#16A34A] font-bold">Normal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Immunization & ANC Care Tracker */}
            <div className="bg-white p-6 rounded-xl border border-[#CFD8DC] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                  <h3 className="text-sm font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? 'लसीकरण व प्रसूतीपूर्व तपासणी वेळापत्रक' : 'Immunization & Maternal ANC Schedule'}
                  </h3>
                </div>
                <span className="text-xs text-[#64748B]">National Immunization Schedule (NIS)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recordsData.immunizations.map(vac => (
                  <div
                    key={vac.id}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      vac.status === 'Completed'
                        ? 'bg-[#F0FDF4] border-[#86EFAC]'
                        : 'bg-[#FFFBEB] border-[#FDE68A]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E293B]">
                        {lang === 'mr' ? vac.vaccineMr : vac.vaccineEn}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          vac.status === 'Completed'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEF3C7] text-[#B45309]'
                        }`}
                      >
                        {vac.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">Dose: {vac.dose}</div>
                    <div className="text-[10px] text-[#94A3B8] flex items-center justify-between pt-1 border-t border-black/5">
                      <span>{vac.givenDate ? `Given: ${vac.givenDate}` : `Due: ${vac.dueDate}`}</span>
                      <span>{vac.facility}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISIT HISTORY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Timeline Controls */}
            <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={timelineSearch}
                  onChange={e => setTimelineSearch(e.target.value)}
                  placeholder={lang === 'mr' ? 'तपासणी, डॉक्टर किंवा केंद्र शोधा...' : 'Search visit, doctor, diagnosis, or facility...'}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#64748B]" />
                <select
                  value={selectedFacilityLevel}
                  onChange={e => setSelectedFacilityLevel(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                >
                  <option value="all">{lang === 'mr' ? 'सर्व आरोग्य केंद्रे (All Tiers)' : 'All Facility Levels'}</option>
                  <option value="Sub-Centre">{lang === 'mr' ? 'उपकेंद्र (Sub-Centre)' : 'Sub-Centre'}</option>
                  <option value="PHC">{lang === 'mr' ? 'प्राथमिक आरोग्य केंद्र (PHC)' : 'PHC'}</option>
                  <option value="District Hospital">{lang === 'mr' ? 'जिल्हा रुग्णालय (District Hosp)' : 'District Hospital'}</option>
                </select>
              </div>
            </div>

            {/* Chronological Longitudinal Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CBD5E1]">
              {filteredVisits.map((visit) => {
                const isDH = visit.facilityLevel === 'District Hospital';
                const isPHC = visit.facilityLevel === 'PHC';

                return (
                  <div key={visit.id} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm ${
                        isDH ? 'bg-[#7E22CE]' : isPHC ? 'bg-[#1A4B8C]' : 'bg-[#16A34A]'
                      }`}
                    >
                      <Hospital className="w-3.5 h-3.5" />
                    </div>

                    {/* Encounter Card */}
                    <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#CFD8DC] shadow-sm space-y-4 hover:border-[#94A3B8] transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                isDH
                                  ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#D8B4FE]'
                                  : isPHC
                                  ? 'bg-[#E8F0FE] text-[#1A4B8C] border border-[#BED7F7]'
                                  : 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                              }`}
                            >
                              {visit.facilityLevel}
                            </span>
                            <span className="text-xs font-mono text-[#94A3B8]">{visit.fhirEncounterId}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#1C2B3A] mt-1">
                            {visit.facilityName}
                          </h3>
                        </div>

                        <div className="text-xs sm:text-right">
                          <div className="font-bold text-[#1E293B] flex items-center sm:justify-end gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                            {visit.visitDate}
                          </div>
                          <div className="text-[#64748B] text-[11px]">{visit.doctorName}</div>
                        </div>
                      </div>

                      {/* Chief Complaint & Diagnosis */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-[#475569]">
                            {lang === 'mr' ? 'तक्रार / कारण:' : 'Chief Complaint:'}{' '}
                          </span>
                          <span className="text-[#1E293B]">
                            {lang === 'mr' ? visit.chiefComplaintMr : visit.chiefComplaintEn}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="font-bold text-[#1A4B8C] block mb-0.5">
                            {lang === 'mr' ? 'क्लिनिकल निदान (Clinical Diagnosis):' : 'Clinical Diagnosis:'}
                          </span>
                          <p className="text-[#334155]">
                            {lang === 'mr' ? visit.diagnosisMr : visit.diagnosisEn}
                          </p>
                        </div>
                      </div>

                      {/* Vitals Recorded */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-bold text-[#64748B]">
                          {lang === 'mr' ? 'भेटीवेळचे व्हिटल्स:' : 'Visit Vitals:'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]">
                          BP: {visit.vitals.bp}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]">
                          Pulse: {visit.vitals.pulse} bpm
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]">
                          SpO2: {visit.vitals.spo2}%
                        </span>
                      </div>

                      {/* Prescriptions & Advice */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0] text-xs">
                        <div>
                          <span className="font-bold text-[#334155] block mb-1">
                            {lang === 'mr' ? 'दिलेली औषधे:' : 'Prescriptions:'}
                          </span>
                          <ul className="space-y-1">
                            {visit.prescriptions.map((rx, idx) => (
                              <li key={idx} className="text-[#475569] flex items-center gap-1.5">
                                <Pill className="w-3 h-3 text-[#1A4B8C]" />
                                {rx}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-[#334155] block mb-1">
                            {lang === 'mr' ? 'डॉक्टरांचा सल्ला:' : 'Doctor Advice & Notes:'}
                          </span>
                          <p className="text-[#64748B]">
                            {lang === 'mr' ? visit.clinicalNotesMr : visit.clinicalNotesEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MEDICATIONS */}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#1A4B8C]" />
                <h3 className="text-sm font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'औषधोपचार व चालू गोळ्या' : 'Active Prescriptions & Regimens'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMedicationFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    medicationFilter === 'active'
                      ? 'bg-[#1A4B8C] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {lang === 'mr' ? 'चालू औषधे' : 'Active'}
                </button>
                <button
                  onClick={() => setMedicationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    medicationFilter === 'all'
                      ? 'bg-[#1A4B8C] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {lang === 'mr' ? 'सर्व औषधे' : 'All'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeds.map((med) => (
                <div
                  key={med.id}
                  className="bg-white rounded-xl p-5 border border-[#CFD8DC] shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1A4B8C]">{med.dosage}</span>
                      <h4 className="text-base font-bold text-[#1C2B3A]">{med.medicineName}</h4>
                      <span className="text-xs text-[#64748B]">{med.frequency}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        med.isActive
                          ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                          : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                      }`}
                    >
                      {med.isActive ? 'Active' : 'Completed'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                    <div>
                      <span className="font-bold text-[#475569]">
                        {lang === 'mr' ? 'वेळ व पद्धत:' : 'Instructions:'}{' '}
                      </span>
                      <span className="text-[#1E293B]">
                        {lang === 'mr' ? med.timingMr : med.timingEn}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[#475569]">
                        {lang === 'mr' ? 'कालावधी:' : 'Duration:'}{' '}
                      </span>
                      <span className="text-[#1E293B]">{med.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                    <span>{med.prescribedBy}</span>
                    <span className="font-bold text-[#15803D]">
                      {lang === 'mr' ? 'केंद्रात उपलब्ध' : med.refillStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DIAGNOSTIC LAB REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-[#1A4B8C]" />
                <h3 className="text-sm font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'तपासणी व पॅथॉलॉजी अहवाल' : 'Diagnostic Tests & Radiology Reports'}
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">{recordsData.labReports.length} Reports</span>
            </div>

            <div className="space-y-4">
              {recordsData.labReports.map((lab) => (
                <div
                  key={lab.id}
                  className="bg-white rounded-xl p-5 border border-[#CFD8DC] shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#1A4B8C]">
                          {lab.category}
                        </span>
                        <span className="text-xs font-mono text-[#94A3B8]">{lab.id}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#1C2B3A] mt-0.5">
                        {lang === 'mr' ? lab.testNameMr : lab.testNameEn}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs sm:text-right">
                        <div className="font-bold text-[#1E293B]">{lab.testDate}</div>
                        <div className="text-[#64748B] text-[11px]">{lab.facility}</div>
                      </div>
                      <button
                        onClick={() => setSelectedLabReport(lab)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-bold text-[#1A4B8C] hover:bg-[#E8F0FE]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {lang === 'mr' ? 'पहा' : 'View'}
                      </button>
                    </div>
                  </div>

                  {/* Parameters Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
                        <tr>
                          <th className="p-2.5">Parameter</th>
                          <th className="p-2.5">Observed Value</th>
                          <th className="p-2.5">Normal Range</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {lab.parameters.map((param, pIdx) => (
                          <tr key={pIdx} className={param.isAbnormal ? 'bg-[#FFFBEB]/60' : ''}>
                            <td className="p-2.5 font-bold text-[#1E293B]">{param.name}</td>
                            <td className="p-2.5 font-bold text-[#1C2B3A]">
                              {param.value} {param.unit}
                            </td>
                            <td className="p-2.5 text-[#64748B]">{param.normalRange}</td>
                            <td className="p-2.5 text-right">
                              {param.isAbnormal ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                                  <AlertCircle className="w-3 h-3" />
                                  Attention
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Interpretation & Signoff */}
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#334155]">
                        {lang === 'mr' ? 'निष्कर्ष:' : 'Interpretation:'}{' '}
                      </span>
                      <span className="text-[#475569]">
                        {lang === 'mr' ? lab.interpretationMr : lab.interpretationEn}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] shrink-0">
                      Signoff: {lab.verifiedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DOCUMENTS & SCANS */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-[#CFD8DC] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1A4B8C]" />
                <h3 className="text-sm font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'वैद्यकीय प्रमाणपत्रे व स्कॅन्स' : 'Health Documents, Scans & Discharge Slips'}
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">{recordsData.documents.length} Files</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recordsData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl p-5 border border-[#CFD8DC] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#94A3B8] transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#1A4B8C]">
                        {doc.docType}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{doc.fileSize}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#1C2B3A] line-clamp-2">
                      {lang === 'mr' ? doc.titleMr : doc.titleEn}
                    </h4>
                    <div className="text-[11px] text-[#64748B]">
                      {doc.facility} • {doc.date}
                    </div>
                    <div className="text-[10px] font-mono text-[#94A3B8]">
                      {doc.fhirBundleId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#1C2B3A] hover:bg-[#F8FAFC]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {lang === 'mr' ? 'पहा' : 'Preview'}
                    </button>
                    <button
                      onClick={() => alert(`Downloading verified FHIR bundle: ${doc.titleEn}`)}
                      className="p-2 rounded-lg border border-[#BED7F7] bg-[#E8F0FE] text-[#1A4B8C] hover:bg-[#D2E3FC]"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABHA CONNECT / SWITCH MODAL */}
        {isAbhaConnectOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-[#CFD8DC]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1A4B8C]" />
                  <h3 className="font-bold text-base text-[#1C2B3A]">
                    {lang === 'mr' ? 'आभा (ABHA) खाते जोडा' : 'Connect ABHA Digital Account'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAbhaConnectOpen(false)}
                  className="p-1 rounded text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {otpStep === 'input' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <p className="text-xs text-[#64748B]">
                    {lang === 'mr'
                      ? 'आपला १४-अंकी आभा क्रमांक किंवा नोंदणीकृत मोबाईल नंबर प्रविष्ट करा.'
                      : 'Enter your 14-digit ABHA Number or Aadhaar-linked mobile for OTP verification.'}
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      ABHA Number / Mobile *
                    </label>
                    <input
                      type="text"
                      value={abhaInput}
                      onChange={e => setAbhaInput(e.target.value)}
                      placeholder="43-5678-9012-3456"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] text-sm font-mono text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                    />
                  </div>

                  {otpError && (
                    <div className="text-xs text-[#DC2626] font-bold">{otpError}</div>
                  )}

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-2.5 rounded-lg bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#153D70] transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {otpLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        'Request 6-Digit OTP'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDemoConnect}
                      className="w-full py-2.5 rounded-lg border border-[#BED7F7] bg-[#E8F0FE] text-[#1A4B8C] text-xs font-bold hover:bg-[#D2E3FC] transition"
                    >
                      1-Click Instant Demo Patient (Sunita Patil)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-xs text-[#64748B]">
                    {lang === 'mr'
                      ? 'मोबाईलवर आलेला ६-अंकी OTP प्रविष्ट करा (चाचणीसाठी 432101 वापरा).'
                      : 'Enter the 6-digit OTP sent to your Aadhaar mobile (Demo code: 432101).'}
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1">
                      6-Digit Security OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] text-center text-lg font-mono tracking-widest text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                    />
                  </div>

                  {otpError && (
                    <div className="text-xs text-[#DC2626] font-bold">{otpError}</div>
                  )}

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-2.5 rounded-lg bg-[#15803D] text-white text-xs font-bold hover:bg-[#166534] transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {otpLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying ABDM Token...
                        </>
                      ) : (
                        'Verify & Fetch Health Records'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpStep('input')}
                      className="w-full py-2 text-xs font-bold text-[#64748B] hover:text-[#1E293B]"
                    >
                      Change Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* OFFICIAL ABHA QR CARD MODAL */}
        {isQrModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1] text-center relative">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="absolute right-4 top-4 p-1 text-[#64748B] hover:bg-[#F1F5F9] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 pb-2 border-b border-[#E2E8F0]">
                <ShieldCheck className="w-5 h-5 text-[#1A4B8C]" />
                <span className="text-xs font-black text-[#1C2B3A] tracking-wider uppercase">
                  National Health Authority (NHA)
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] border border-[#CBD5E1] space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#1A4B8C] text-white mx-auto flex items-center justify-center font-black text-xl shadow">
                  {patient.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-black text-base text-[#1C2B3A]">
                    {patient.name}
                  </h3>
                  <div className="text-xs font-mono font-bold text-[#1A4B8C] mt-0.5">
                    {patient.abhaNumber}
                  </div>
                </div>

                {/* Simulated QR Code Box */}
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-[#CBD5E1] shadow-inner flex flex-col items-center justify-center">
                  <QrCode className="w-28 h-28 text-[#1E293B]" />
                </div>

                <div className="text-[11px] text-[#64748B] space-y-0.5">
                  <div>DOB: {patient.dob} • Gender: {patient.gender}</div>
                  <div>Address: {patient.district}, {patient.state}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-lg bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#153D70]"
                >
                  Download ABHA Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAB REPORT PREVIEW MODAL */}
        {selectedLabReport && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#CFD8DC]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="font-bold text-sm text-[#1C2B3A]">
                  {selectedLabReport.testNameEn}
                </h3>
                <button
                  onClick={() => setSelectedLabReport(null)}
                  className="p-1 text-[#64748B] hover:bg-[#F1F5F9] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Facility: {selectedLabReport.facility}</span>
                  <span>Date: {selectedLabReport.testDate}</span>
                </div>

                <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC] font-bold text-[#475569]">
                      <tr>
                        <th className="p-2">Param</th>
                        <th className="p-2">Value</th>
                        <th className="p-2">Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {selectedLabReport.parameters.map((p, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold">{p.name}</td>
                          <td className="p-2 text-[#1A4B8C] font-bold">{p.value} {p.unit}</td>
                          <td className="p-2 text-[#64748B]">{p.normalRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg">
                  <strong>Conclusion:</strong> {selectedLabReport.interpretationEn}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLabReport(null)}
                  className="px-4 py-2 bg-[#1A4B8C] text-white text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW MODAL */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CFD8DC]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="font-bold text-sm text-[#1C2B3A]">
                  {selectedDocument.titleEn}
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-1 text-[#64748B] hover:bg-[#F1F5F9] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <div>Type: <strong>{selectedDocument.docType}</strong></div>
                <div>Facility: <strong>{selectedDocument.facility}</strong></div>
                <div>Date: <strong>{selectedDocument.date}</strong></div>
                <div>Doctor: <strong>{selectedDocument.doctor}</strong></div>
                <div className="font-mono text-[#94A3B8]">FHIR: {selectedDocument.fhirBundleId}</div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => alert('Document verified and digitally signed by Government Medical Officer.')}
                  className="flex-1 py-2 rounded-lg bg-[#1A4B8C] text-white text-xs font-bold"
                >
                  Verify Digital Signature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABDM Interoperability & Consent Modal */}
        <AbdmInteroperabilityModal
          isOpen={isAbdmModalOpen}
          onClose={() => setIsAbdmModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
