import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  HeartPulse,
  Hospital,
  Info,
  Layers,
  PhoneCall,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  User,
  Users,
  Video,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  TRIAGE_LEVELS,
  SYMPTOM_DATABASE,
  CHRONIC_CONDITIONS,
  TriageFormData,
  TriageResult,
  SymptomItem,
  SymptomCategoryKey,
  calculateTriage,
  saveTriageEntry,
  getTriageQueue,
  TriageQueueEntry
} from '../../services/triageEngine';
import { ABHAService } from '../../services/abhaService';

export default function Triage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategoryKey | 'all'>('all');
  const [isCalculating, setIsCalculating] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isSentToQueue, setIsSentToQueue] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [queueList, setQueueList] = useState<TriageQueueEntry[]>(() => getTriageQueue());

  // Form State
  const [formData, setFormData] = useState<TriageFormData>({
    patientName: 'Sunita Ramesh Patil',
    age: 24,
    gender: 'female',
    isPregnant: true,
    duration: 'hours',
    symptoms: ['high_fever', 'severe_abdominal'],
    vitalSigns: {
      temperature: '101.5',
      heartRate: '92',
      spo2: '97',
      bloodPressure: '130/85',
    },
    existingConditions: ['diabetes'],
    abhaId: '43-5678-9012-3456',
    phone: '+91 98231 44520',
    notes: '',
  });

  const STEPS = [
    { id: 1, titleEn: 'Patient Info', titleMr: 'रुग्ण माहिती', icon: User },
    { id: 2, titleEn: 'Symptoms', titleMr: 'लक्षणे व कालावधी', icon: Activity },
    { id: 3, titleEn: 'Vital Signs', titleMr: 'महत्त्वाच्या तपासण्या (Vitals)', icon: HeartPulse },
    { id: 4, titleEn: 'Medical History', titleMr: 'वैद्यकीय इतिहास', icon: Stethoscope },
    { id: 5, titleEn: 'Triage Result', titleMr: 'ट्रायज निकाल', icon: ShieldCheck },
  ];

  const updateFormData = <K extends keyof TriageFormData>(field: K, value: TriageFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId],
    }));
  };

  const handleConditionToggle = (conditionId: string) => {
    setFormData(prev => {
      const existing = prev.existingConditions || [];
      return {
        ...prev,
        existingConditions: existing.includes(conditionId)
          ? existing.filter(c => c !== conditionId)
          : [...existing, conditionId],
      };
    });
  };

  const handleVitalChange = (vital: keyof NonNullable<TriageFormData['vitalSigns']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [vital]: value,
      },
    }));
  };

  // Pre-fill from connected ABHA
  const handlePrefillAbha = () => {
    const session = ABHAService.getConnectedSession();
    if (session) {
      setFormData(prev => ({
        ...prev,
        patientName: session.name,
        age: session.age,
        gender: session.gender.toLowerCase(),
        abhaId: session.abhaNumber,
        phone: session.mobile,
      }));
    }
  };

  // Run calculation
  const handleCalculateTriage = async () => {
    setIsCalculating(true);
    // Clinical evaluation simulation
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = calculateTriage(formData);
    setTriageResult(result);
    setIsCalculating(false);
    setCurrentStep(5);
  };

  // Dispatch to local clinic triage queue
  const handleDispatchQueue = () => {
    if (!triageResult) return;
    const entry = saveTriageEntry(triageResult, 'PHC Shirur Emergency');
    setIsSentToQueue(true);
    setQueueList(getTriageQueue());
  };

  // Filtered Symptoms
  const allSymptomList = useMemo(() => {
    const list: SymptomItem[] = [];
    if (selectedCategory === 'all' || selectedCategory === 'critical') list.push(...SYMPTOM_DATABASE.critical);
    if (selectedCategory === 'all' || selectedCategory === 'urgent') list.push(...SYMPTOM_DATABASE.urgent);
    if (selectedCategory === 'all' || selectedCategory === 'semiUrgent') list.push(...SYMPTOM_DATABASE.semiUrgent);
    if (selectedCategory === 'all' || selectedCategory === 'nonUrgent') list.push(...SYMPTOM_DATABASE.nonUrgent);

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(s =>
      s.labelEn.toLowerCase().includes(query) ||
      s.labelMr.toLowerCase().includes(query)
    );
  }, [selectedCategory, searchQuery]);

  const isStep1Valid = formData.patientName.trim() !== '' && Number(formData.age) > 0;
  const isStep2Valid = formData.symptoms.length > 0 && !!formData.duration;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Navigation Breadcrumb and Emergency Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'mr' ? 'रुग्ण डॅशबोर्डवर परत' : 'Back to Patient Dashboard'}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQueueDrawer(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E8F0FE] text-[#1A4B8C] hover:bg-[#D2E3FC] text-xs font-bold transition"
            >
              <Users className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'ओपीडी ट्रायज रांग पहा' : 'View Duty Nurse Queue'} ({queueList.length})
            </button>
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#DC2626] text-white hover:bg-[#B91C1C] text-xs font-bold shadow-sm transition"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              {lang === 'mr' ? 'तातडीची मदत: १०८ कॉल करा' : 'Emergency Help: Call 108'}
            </a>
          </div>
        </div>

        {/* Page Title Card */}
        <div className="bg-white rounded-xl p-6 border border-[#CFD8DC] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A4B8C] uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-[#1A4B8C]" />
              {lang === 'mr' ? 'महाराष्ट्र शासन • सार्वजनिक आरोग्य विभाग' : 'Govt of Maharashtra • Public Health Dept'}
            </div>
            <h1 className="text-2xl font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'डिजिटल क्लिनिकल ट्रायज प्रणाली' : 'Digital Clinical Triage System'}
            </h1>
            <p className="text-xs text-[#546E7A] mt-1">
              {lang === 'mr'
                ? 'लक्षणे आणि वैद्यकीय नोंदींवर आधारित तत्काळ प्राधान्य मूल्यांकन (WHO ETAT मानकांनुसार)'
                : 'Rapid severity prioritization & clinical emergency guidance based on WHO ETAT protocols'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-lg border border-[#E2E8F0]">
            <ShieldAlert className="w-5 h-5 text-[#D97706]" />
            <div className="text-xs">
              <div className="font-bold text-[#1C2B3A]">
                {lang === 'mr' ? '४-स्तरीय क्लिनिकल मॉडेल' : '4-Level Clinical CDSS'}
              </div>
              <div className="text-[#64748B]">
                {lang === 'mr' ? 'तातडीनुसार वर्गीकरण' : 'Red / Orange / Yellow / Green'}
              </div>
            </div>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white rounded-xl p-4 border border-[#CFD8DC] shadow-sm">
          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  disabled={step.id > currentStep && step.id !== 5}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition text-center sm:text-left ${
                    isActive
                      ? 'bg-[#1A4B8C] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-[#E8F0FE] text-[#1A4B8C] hover:bg-[#D2E3FC]'
                      : 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isActive
                        ? 'bg-white text-[#1A4B8C] font-black'
                        : isCompleted
                        ? 'bg-[#1A4B8C] text-white'
                        : 'bg-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="hidden sm:inline truncate">
                    {lang === 'mr' ? step.titleMr : step.titleEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Content Panels */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#CFD8DC] shadow-sm">
          {/* STEP 1: PATIENT INFO */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? 'पायरी १: रुग्णाची प्राथमिक माहिती' : 'Step 1: Patient Information'}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {lang === 'mr' ? 'वयानुसार आणि स्थितीनुसार जोखीम गुणांक लागू होतो' : 'Age and demographic profile determine risk multipliers'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrefillAbha}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E8F0FE] text-[#1A4B8C] hover:bg-[#D2E3FC] text-xs font-bold transition border border-[#BED7F7]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'आभा (ABHA) वरून माहिती भरा' : 'Load from ABHA'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {lang === 'mr' ? 'रुग्णाचे पूर्ण नाव *' : 'Patient Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={e => updateFormData('patientName', e.target.value)}
                    placeholder="e.g. Sunita Ramesh Patil"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {lang === 'mr' ? 'वय (वर्षे) *' : 'Age (Years) *'}
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => updateFormData('age', e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                  />
                  <span className="text-[11px] text-[#64748B] mt-0.5 block">
                    {lang === 'mr' ? '१ वर्षांखालील बाळ व ६५ वर्षांवरील ज्येष्ठांसाठी विशेष जोखीम' : 'Infants (<1) & elderly (65+) automatically receive risk weights'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {lang === 'mr' ? 'लिंग *' : 'Gender *'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'female', labelEn: 'Female', labelMr: 'स्त्री' },
                      { id: 'male', labelEn: 'Male', labelMr: 'पुरुष' },
                      { id: 'other', labelEn: 'Other', labelMr: 'इतर' },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateFormData('gender', g.id)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          formData.gender === g.id
                            ? 'bg-[#1A4B8C] text-white border-[#1A4B8C]'
                            : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {lang === 'mr' ? g.labelMr : g.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {lang === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => updateFormData('phone', e.target.value)}
                    placeholder="+91 98231 44520"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {lang === 'mr' ? 'आभा क्रमांक (ABHA ID)' : 'ABHA Health ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.abhaId || ''}
                    onChange={e => updateFormData('abhaId', e.target.value)}
                    placeholder="43-5678-9012-3456"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                  />
                </div>

                {formData.gender === 'female' && (
                  <div className="flex items-center sm:mt-6">
                    <label className="relative flex items-center gap-3 p-3 rounded-lg border border-[#FDBA74] bg-[#FFF7ED] cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={formData.isPregnant || false}
                        onChange={e => updateFormData('isPregnant', e.target.checked)}
                        className="w-4 h-4 text-[#EA580C] rounded border-[#F97316] focus:ring-[#EA580C]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#9A3412]">
                          {lang === 'mr' ? 'रुग्ण सध्या गरोदर आहे (Maternal / ANC)' : 'Patient is currently pregnant (Maternal ANC)'}
                        </div>
                        <div className="text-[11px] text-[#C2410C]">
                          {lang === 'mr' ? 'मॅटर्नल क्लिनिकल ट्रायज प्रोटोकॉल आपोआप लागू होईल' : 'Enables maternal obstetric escalation safeguards'}
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setCurrentStep(2)}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-sm ${
                    isStep1Valid
                      ? 'bg-[#1A4B8C] text-white hover:bg-[#153D70]'
                      : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed'
                  }`}
                >
                  {lang === 'mr' ? 'पुढील पायरी: लक्षणे निवडा' : 'Next: Select Symptoms'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SYMPTOMS & DURATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? 'पायरी २: लक्षणे आणि कालावधी' : 'Step 2: Symptoms & Onset Duration'}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {lang === 'mr' ? '३०+ वैद्यकीय लक्षणे आणि कालावधीनुसार अचूक वर्गीकरण' : 'Select all present symptoms across clinical categories'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0FE] text-[#1A4B8C] text-xs font-bold border border-[#C2D7FA]">
                  <Activity className="w-3.5 h-3.5" />
                  {formData.symptoms.length}{' '}
                  {lang === 'mr' ? 'लक्षणे निवडली' : 'Symptoms Selected'}
                </div>
              </div>

              {/* Duration Selector */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]">
                <label className="block text-xs font-bold text-[#1E293B] mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1A4B8C]" />
                  {lang === 'mr' ? 'त्रास कधीपासून सुरू झाला? (कालावधी) *' : 'How long have these symptoms lasted? *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'sudden', labelEn: 'Sudden (<1 hr)', labelMr: 'अचानक (< १ तास)', risk: 'High' },
                    { id: 'hours', labelEn: '1 - 12 Hours', labelMr: '१ - १२ तास', risk: 'Mod' },
                    { id: 'day', labelEn: 'Since Yesterday', labelMr: 'कालपासून', risk: 'Mod' },
                    { id: 'days', labelEn: '2 - 3 Days', labelMr: '२ ते ३ दिवस', risk: 'Std' },
                    { id: 'week', labelEn: 'About 1 Week', labelMr: 'सुमारे १ आठवडा', risk: 'Low' },
                    { id: 'weeks', labelEn: '> 2 Weeks', labelMr: '> २ आठवडे', risk: 'Low' },
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => updateFormData('duration', d.id as any)}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                        formData.duration === d.id
                          ? 'bg-[#1A4B8C] text-white border-[#1A4B8C] shadow-sm'
                          : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <span>{lang === 'mr' ? d.labelMr : d.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={lang === 'mr' ? 'लक्षण शोधा (उदा. ताप, खोकला, छातीत कळ)...' : 'Search symptoms (e.g. fever, breathing, chest)...'}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#475569]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pill Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', labelEn: 'All (32)', labelMr: 'सर्व' },
                    { id: 'critical', labelEn: 'Critical (Red)', labelMr: 'अति-गंभीर' },
                    { id: 'urgent', labelEn: 'Urgent (Orange)', labelMr: 'तातडीचे' },
                    { id: 'semiUrgent', labelEn: 'Semi-Urgent (Yellow)', labelMr: 'मध्यम' },
                    { id: 'nonUrgent', labelEn: 'Non-Urgent (Green)', labelMr: 'किरकोळ' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                        selectedCategory === cat.id
                          ? 'bg-[#1C2B3A] text-white'
                          : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {lang === 'mr' ? cat.labelMr : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {allSymptomList.map(symptom => {
                  const isChecked = formData.symptoms.includes(symptom.id);
                  const isRedCategory = symptom.category === 'critical';
                  const isOrangeCategory = symptom.category === 'urgent';
                  const isYellowCategory = symptom.category === 'semiUrgent';

                  return (
                    <div
                      key={symptom.id}
                      onClick={() => handleSymptomToggle(symptom.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-start justify-between gap-3 ${
                        isChecked
                          ? isRedCategory
                            ? 'bg-[#FEF2F2] border-[#DC2626] ring-1 ring-[#DC2626]'
                            : isOrangeCategory
                            ? 'bg-[#FFF7ED] border-[#EA580C] ring-1 ring-[#EA580C]'
                            : 'bg-[#E8F0FE] border-[#1A4B8C] ring-1 ring-[#1A4B8C]'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-[#1A4B8C] border-[#CBD5E1] focus:ring-[#1A4B8C]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#1E293B]">
                            {lang === 'mr' ? symptom.labelMr : symptom.labelEn}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {lang === 'mr' ? symptom.labelEn : symptom.labelMr}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isRedCategory && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
                            RED
                          </span>
                        )}
                        {isOrangeCategory && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]">
                            ORANGE
                          </span>
                        )}
                        {isYellowCategory && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                            YELLOW
                          </span>
                        )}
                        {symptom.category === 'nonUrgent' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                            GREEN
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'मागील' : 'Back'}
                </button>
                <button
                  type="button"
                  disabled={!isStep2Valid}
                  onClick={() => setCurrentStep(3)}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-sm ${
                    isStep2Valid
                      ? 'bg-[#1A4B8C] text-white hover:bg-[#153D70]'
                      : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed'
                  }`}
                >
                  {lang === 'mr' ? 'पुढील पायरी: व्हिटल्स नोंदणी' : 'Next: Record Vitals'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VITAL SIGNS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'पायरी ३: रुग्णाचे व्हिटल्स (Vital Signs)' : 'Step 3: Vital Signs Monitoring'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {lang === 'mr'
                    ? 'अचूक ट्रायज गुणांक काढण्यासाठी उपलब्ध उपकरणानुसार व्हिटल्स प्रविष्ट करा'
                    : 'Enter measured vital signs to refine priority risk scoring (Optional but recommended)'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* SpO2 */}
                <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#334155]">SpO2 (Pulse Oximeter)</span>
                    <HeartPulse className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.vitalSigns?.spo2 || ''}
                      onChange={e => handleVitalChange('spo2', e.target.value)}
                      placeholder="98"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] font-bold focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#94A3B8] font-bold">%</span>
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {lang === 'mr' ? 'सामान्य: ९५% - १००% (<९०% अतिगंभीर)' : 'Normal: 95-100% (<90% Critical)'}
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#334155]">Blood Pressure (BP)</span>
                    <Activity className="w-4 h-4 text-[#1A4B8C]" />
                  </div>
                  <input
                    type="text"
                    value={formData.vitalSigns?.bloodPressure || ''}
                    onChange={e => handleVitalChange('bloodPressure', e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] font-bold focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                  />
                  <div className="text-[11px] text-[#64748B]">
                    {lang === 'mr' ? 'सामान्य: १२०/८० mmHg (>१४० उच्च)' : 'Normal: 120/80 mmHg (>140 High)'}
                  </div>
                </div>

                {/* Pulse Rate */}
                <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#334155]">Pulse / Heart Rate</span>
                    <HeartPulse className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.vitalSigns?.heartRate || ''}
                      onChange={e => handleVitalChange('heartRate', e.target.value)}
                      placeholder="76"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] font-bold focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#94A3B8] font-bold">bpm</span>
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {lang === 'mr' ? 'सामान्य: ६० - १०० ठोके/मिनिट' : 'Normal: 60 - 100 bpm'}
                  </div>
                </div>

                {/* Body Temperature */}
                <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#334155]">Body Temperature</span>
                    <Thermometer className="w-4 h-4 text-[#EA580C]" />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vitalSigns?.temperature || ''}
                      onChange={e => handleVitalChange('temperature', e.target.value)}
                      placeholder="98.6"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm text-[#1E293B] font-bold focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#94A3B8] font-bold">°F</span>
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {lang === 'mr' ? 'सामान्य: ९८.६°F (>१०१°F ताप)' : 'Normal: 98.6°F (>101°F Fever)'}
                  </div>
                </div>
              </div>

              {/* Informational Guidance Box */}
              <div className="p-4 rounded-lg bg-[#E8F0FE] border border-[#BED7F7] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#1A4B8C] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1E3A8A]">
                  <strong>{lang === 'mr' ? 'आरोग्य सूचना:' : 'Clinical Note:'}</strong>{' '}
                  {lang === 'mr'
                    ? 'गावात डिजिटल उपकरण उपलब्ध नसल्यास ही पायरी वगळता येईल. क्लिनिकल गुणांक लक्षणांच्या आधारे मोजला जाईल.'
                    : 'If medical monitoring equipment is unavailable at village level, you may continue without vitals; symptom scoring will prioritize care.'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'मागील' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1A4B8C] text-white hover:bg-[#153D70] text-xs font-bold transition shadow-sm"
                >
                  {lang === 'mr' ? 'पुढील पायरी: वैद्यकीय इतिहास' : 'Next: Medical History'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MEDICAL HISTORY */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'पायरी ४: आधीचे आजार व वैद्यकीय इतिहास' : 'Step 4: Pre-Existing Chronic Conditions'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {lang === 'mr' ? 'दीर्घकालीन आजार असल्यास ट्रायज स्कोरमध्ये १.२५ पट वाढ होते' : 'Chronic comorbidities apply a clinical severity multiplier of 1.25x'}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#1E293B]">
                  {lang === 'mr' ? 'खालीलपैकी कोणतेही जुने आजार आहेत का?' : 'Select any known existing chronic conditions:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CHRONIC_CONDITIONS.map(condition => {
                    const isSelected = formData.existingConditions?.includes(condition.id);
                    return (
                      <div
                        key={condition.id}
                        onClick={() => handleConditionToggle(condition.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#E8F0FE] border-[#1A4B8C] text-[#1A4B8C] font-bold'
                            : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#1A4B8C] border-[#CBD5E1] focus:ring-[#1A4B8C]"
                        />
                        <div className="text-xs">
                          <div>{lang === 'mr' ? condition.labelMr : condition.labelEn}</div>
                          <div className="text-[10px] text-[#64748B]">
                            {lang === 'mr' ? condition.labelEn : condition.labelMr}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  {lang === 'mr' ? 'कोणत्या औषधांची ॲलर्जी किंवा इतर टिप्पणी' : 'Known Drug Allergies or Additional Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => updateFormData('notes', e.target.value)}
                  placeholder="e.g. Penicillin allergy, currently taking Metformin 500mg"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'मागील' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={handleCalculateTriage}
                  disabled={isCalculating}
                  className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-[#1A4B8C] text-white hover:bg-[#153D70] text-xs font-bold transition shadow-sm"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {lang === 'mr' ? 'मूल्यांकन सुरू आहे...' : 'Calculating Triage...'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {lang === 'mr' ? 'ट्रायज निकाल काढा' : 'Run Clinical Triage'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TRIAGE ASSESSMENT RESULT */}
          {currentStep === 5 && triageResult && (
            <div className="space-y-6">
              {/* Emergency Banner if RED */}
              {triageResult.triageLevel.level === 'RED' && (
                <div className="p-5 rounded-xl bg-[#FEF2F2] border-2 border-[#DC2626] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-8 h-8 text-[#DC2626] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-black text-[#991B1B]">
                        {lang === 'mr' ? 'तातडीची आणीबाणी (CRITICAL RED ALERT)' : 'CRITICAL EMERGENCY: IMMEDIATE MEDICAL ATTENTION REQUIRED'}
                      </h3>
                      <p className="text-xs text-[#B91C1C] mt-0.5">
                        {lang === 'mr'
                          ? 'रुग्णाला त्वरित रुग्णवाहिकेतून किंवा जवळच्या आपत्कालीन वॉर्डात हलवा. विलंब करू नका.'
                          : 'High risk to life detected. Do not delay. Keep patient stable and contact 108 immediately.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#DC2626] text-white text-sm font-black shadow-md hover:bg-[#B91C1C] transition shrink-0"
                  >
                    <PhoneCall className="w-5 h-5" />
                    {lang === 'mr' ? '१०८ रुग्णवाहिका कॉल करा' : 'Call 108 Ambulance'}
                  </a>
                </div>
              )}

              {/* Main Triage Result Card */}
              <div
                className="p-6 rounded-2xl border-2 space-y-5"
                style={{
                  backgroundColor: triageResult.triageLevel.bgColor,
                  borderColor: triageResult.triageLevel.borderColor,
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm"
                      style={{ backgroundColor: triageResult.triageLevel.color }}
                    >
                      {triageResult.triageLevel.level === 'RED' ? (
                        <AlertOctagon className="w-6 h-6" />
                      ) : triageResult.triageLevel.level === 'ORANGE' ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : triageResult.triageLevel.level === 'YELLOW' ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                        {lang === 'mr' ? 'ट्रायज वर्गीकरण' : 'Triage Classification'}
                      </div>
                      <h2
                        className="text-2xl font-black"
                        style={{ color: triageResult.triageLevel.color }}
                      >
                        {lang === 'mr' ? triageResult.triageLevel.labelMr : triageResult.triageLevel.labelEn}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/80 backdrop-blur px-3.5 py-2 rounded-lg border border-black/10 text-right">
                      <div className="text-[10px] uppercase font-bold text-[#64748B]">
                        {lang === 'mr' ? 'अपेक्षित प्रतीक्षा वेळ' : 'Max Wait Time'}
                      </div>
                      <div className="text-sm font-black text-[#1C2B3A]">
                        {lang === 'mr' ? triageResult.triageLevel.waitTimeMr : triageResult.triageLevel.waitTimeEn}
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur px-3.5 py-2 rounded-lg border border-black/10 text-right">
                      <div className="text-[10px] uppercase font-bold text-[#64748B]">
                        {lang === 'mr' ? 'क्लिनिकल स्कोर' : 'Triage Score'}
                      </div>
                      <div className="text-sm font-black text-[#1C2B3A]">
                        {triageResult.score} / 30
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Summary Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/70 backdrop-blur p-3.5 rounded-xl border border-black/5 text-xs">
                  <div>
                    <span className="text-[#64748B] block">{lang === 'mr' ? 'रुग्णाचे नाव' : 'Patient Name'}:</span>
                    <span className="font-bold text-[#1E293B]">{triageResult.patientSummary.name}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">{lang === 'mr' ? 'वय / लिंग' : 'Age / Gender'}:</span>
                    <span className="font-bold text-[#1E293B]">
                      {triageResult.patientSummary.age} yrs • {triageResult.patientSummary.gender}
                      {triageResult.patientSummary.isPregnant && ' (ANC)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">{lang === 'mr' ? 'संदर्भ क्रमांक' : 'Reference ID'}:</span>
                    <span className="font-mono font-bold text-[#1A4B8C]">{triageResult.referenceId}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">{lang === 'mr' ? 'तारीख व वेळ' : 'Date & Time'}:</span>
                    <span className="font-bold text-[#1E293B]">{new Date(triageResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Primary Action Notice */}
                <div className="bg-white p-4 rounded-xl border border-black/10 space-y-1">
                  <div className="text-xs font-bold uppercase text-[#475569] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#1A4B8C]" />
                    {lang === 'mr' ? 'तातडीने करावयाची कृती (Clinical Directive)' : 'Immediate Action Required:'}
                  </div>
                  <div className="text-sm font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? triageResult.urgencyAdviceMr : triageResult.urgencyAdviceEn}
                  </div>
                </div>

                {/* Symptoms & Vitals Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-black/10 space-y-2">
                    <div className="text-xs font-bold text-[#1C2B3A] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#1A4B8C]" />
                      {lang === 'mr' ? 'नोंदवलेली लक्षणे' : 'Reported Symptoms'} ({triageResult.symptomDetails.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {triageResult.symptomDetails.map(s => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]"
                        >
                          {lang === 'mr' ? s.labelMr : s.labelEn}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-black/10 space-y-2">
                    <div className="text-xs font-bold text-[#1C2B3A] flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-[#EA580C]" />
                      {lang === 'mr' ? 'व्हिटल्स फ्लॅग व निरीक्षणे' : 'Vitals Risk Observations'}
                    </div>
                    {triageResult.vitalFlags.length > 0 ? (
                      <div className="space-y-1">
                        {triageResult.vitalFlags.map((flag, idx) => (
                          <div key={idx} className="text-xs font-bold text-[#DC2626] flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {flag}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#64748B]">
                        {lang === 'mr' ? 'सर्व नोंदी सुरक्षित मर्यादेत आहेत.' : 'All recorded vital signs within standard range.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Recommendations Checklist */}
                <div className="bg-white p-5 rounded-xl border border-black/10 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1C2B3A] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#16A34A]" />
                    {lang === 'mr' ? 'वैद्यकीय सल्ला व काळजी मार्गदर्शक तत्त्वे' : 'Clinical Care Guidelines & Patient Advice:'}
                  </div>
                  <ul className="space-y-2">
                    {(lang === 'mr' ? triageResult.recommendationsMr : triageResult.recommendationsEn).map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#334155]">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1C2B3A] hover:bg-[#F8FAFC] text-xs font-bold transition shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#64748B]" />
                  {lang === 'mr' ? 'ट्रायज पावती प्रिंट करा' : 'Print Triage Slip'}
                </button>

                <button
                  type="button"
                  onClick={handleDispatchQueue}
                  disabled={isSentToQueue}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm ${
                    isSentToQueue
                      ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                      : 'bg-[#1A4B8C] text-white hover:bg-[#153D70]'
                  }`}
                >
                  {isSentToQueue ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === 'mr' ? 'रांगेत पाठवले आहे' : 'Dispatched to Queue'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {lang === 'mr' ? 'ओपीडी रांगेत पाठवा' : 'Send to Clinic Queue'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/consultation')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#BED7F7] bg-[#E8F0FE] text-[#1A4B8C] hover:bg-[#D2E3FC] text-xs font-bold transition shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  {lang === 'mr' ? 'डॉक्टर टेलिकन्सल्टेशन' : 'Teleconsult Doctor'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setIsSentToQueue(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] text-xs font-bold transition shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {lang === 'mr' ? 'पुन्हा ट्रायज करा' : 'Start New Triage'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DUTY NURSE / CLINIC TRIAGE QUEUE DRAWER */}
        {showQueueDrawer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1A4B8C]" />
                  <h3 className="font-bold text-sm text-[#1C2B3A]">
                    {lang === 'mr' ? 'आरोग्य केंद्र ट्रायज रांग' : 'Clinic Duty Nurse Triage Queue'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowQueueDrawer(false)}
                  className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="text-xs text-[#64748B] flex items-center justify-between">
                  <span>{lang === 'mr' ? 'सक्रिय रुग्ण संख्या:' : 'Active Triage Patients:'} {queueList.length}</span>
                  <span className="text-[11px] text-[#1A4B8C] font-bold">PHC Shirur Emergency</span>
                </div>

                {queueList.map((entry) => {
                  const isRed = entry.triageLevel === 'RED';
                  const isOrange = entry.triageLevel === 'ORANGE';
                  const isYellow = entry.triageLevel === 'YELLOW';

                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl border space-y-2 ${
                        isRed
                          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                          : isOrange
                          ? 'bg-[#FFF7ED] border-[#FDBA74]'
                          : isYellow
                          ? 'bg-[#FFFBEB] border-[#FDE68A]'
                          : 'bg-[#F0FDF4] border-[#86EFAC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#1C2B3A]">{entry.patientName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isRed
                              ? 'bg-[#DC2626] text-white'
                              : isOrange
                              ? 'bg-[#EA580C] text-white'
                              : isYellow
                              ? 'bg-[#D97706] text-white'
                              : 'bg-[#16A34A] text-white'
                          }`}
                        >
                          {entry.triageLevel} ({entry.waitTime})
                        </span>
                      </div>

                      <div className="text-[11px] text-[#475569]">
                        {lang === 'mr' ? entry.topSymptomMr : entry.topSymptomEn}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-black/5">
                        <span>{entry.referenceId}</span>
                        <span>Score: {entry.score} • Age: {entry.age}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <button
                  onClick={() => setShowQueueDrawer(false)}
                  className="w-full py-2 rounded-lg bg-[#1A4B8C] text-white text-xs font-bold"
                >
                  {lang === 'mr' ? 'बंद करा' : 'Close Queue Drawer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
