import React, { useState } from 'react';
import { 
  Hospital, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  User, 
  MapPin, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  ShieldCheck, 
  Search, 
  Phone 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  referralService, 
  UrgencyLevel, 
  URGENCY_CONFIGS, 
  HOSPITALS_DIRECTORY, 
  HospitalFacility, 
  ReferralItem 
} from '../../services/referralService';
import { smsService } from '../../services/smsService';
import { VILLAGE_PATIENTS_REGISTRY, PatientProfile } from '../../data/mockData';

interface CreateReferralProps {
  onClose: () => void;
  onSuccess: (newReferral: ReferralItem) => void;
  preselectedPatientId?: string;
}

export default function CreateReferral({ onClose, onSuccess, preselectedPatientId }: CreateReferralProps) {
  const { lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Patient & Urgency
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatientId || VILLAGE_PATIENTS_REGISTRY[0].id
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>('URGENT');
  const [primaryReason, setPrimaryReason] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');

  // Step 2: Hospital & Department Selection
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(HOSPITALS_DIRECTORY[0].id);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('स्त्रीरोग व प्रसूती (OBGYN)');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('ALL');
  const [filterAmbulanceOnly, setFilterAmbulanceOnly] = useState(false);

  // Step 3: Clinical Notes, Vitals & Transport
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('76');
  const [spO2, setSpO2] = useState('98');
  const [sugar, setSugar] = useState('110');
  const [transportNeeded, setTransportNeeded] = useState(true);
  const [transportType, setTransportType] = useState<'108_AMBULANCE' | '102_JANANI' | 'OWN_VEHICLE'>('102_JANANI');
  const [ashaEscortAssigned, setAshaEscortAssigned] = useState(true);
  const [ashaName, setAshaName] = useState('सुमन ताई पाटील (Suman Tai Patil)');
  const [ashaPhone, setAshaPhone] = useState('9423180912');
  const [sendSmsToPatient, setSendSmsToPatient] = useState(true);
  const [sendSmsToAsha, setSendSmsToAsha] = useState(true);

  // Filter hospitals directory
  const filteredHospitals = HOSPITALS_DIRECTORY.filter(h => {
    const matchesSearch = 
      h.nameMr.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.nameEn.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.specialties.some(s => s.toLowerCase().includes(hospitalSearch.toLowerCase()));

    const matchesSpecialty = filterSpecialty === 'ALL' || h.specialties.some(s => s.includes(filterSpecialty));
    const matchesAmbulance = !filterAmbulanceOnly || h.ambulanceAvailable;

    return matchesSearch && matchesSpecialty && matchesAmbulance;
  });

  const selectedPatient = VILLAGE_PATIENTS_REGISTRY.find(p => p.id === selectedPatientId) || VILLAGE_PATIENTS_REGISTRY[0];
  const selectedHospital = HOSPITALS_DIRECTORY.find(h => h.id === selectedHospitalId) || HOSPITALS_DIRECTORY[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createdRef = referralService.createReferral({
      patientId: selectedPatient.id,
      patientNameMr: selectedPatient.nameMr,
      patientNameEn: selectedPatient.nameEn,
      patientPhone: selectedPatient.phone,
      patientVillage: `${selectedPatient.village}, ${selectedPatient.block}`,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      abhaId: selectedPatient.abhaId,

      referringFacilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
      referringFacilityEn: 'Primary Health Centre Shirur',
      referringDoctorMr: 'डॉ. मीरा देशमुख (वैद्यकीय अधिकारी)',
      referringDoctorEn: 'Dr. Meera Deshmukh (Medical Officer)',

      targetHospitalId: selectedHospital.id,
      targetHospitalNameMr: selectedHospital.nameMr,
      targetHospitalNameEn: selectedHospital.nameEn,
      departmentMr: selectedDepartment,
      departmentEn: selectedDepartment,

      urgency,
      primaryReasonMr: primaryReason || 'तज्ञ तपासणी व उपचारांसाठी शिफारस',
      primaryReasonEn: primaryReason || 'Referral for tertiary clinical evaluation and specialist intervention.',
      provisionalDiagnosis: provisionalDiagnosis || 'Clinical Investigation Pending',
      vitalsSummary: {
        bp: `${bp} mmHg`,
        pulse: `${pulse} bpm`,
        spO2: `${spO2}%`,
        sugar: sugar ? `${sugar} mg/dL` : undefined,
      },

      transportNeeded,
      transportType: transportNeeded ? transportType : undefined,
      transportStatus: transportNeeded ? {
        vehicleNumber: transportType === '108_AMBULANCE' ? 'MH-12-EM-1088' : 'MH-12-AH-8419',
        driverName: transportType === '108_AMBULANCE' ? 'सचिन गायकवाड (108 ALS)' : 'गजानन शिंदे (102 Janani)',
        driverPhone: '9890123450',
        etaMinutes: 20,
        liveStatusMr: 'रुग्णवाहिका पाठवली आहे, लवकरच गावात पोहोचेल.',
        liveStatusEn: 'Ambulance vehicle dispatched, ETA 20 mins.',
      } : undefined,

      ashaEscortAssigned,
      ashaName: ashaEscortAssigned ? ashaName : undefined,
      ashaPhone: ashaEscortAssigned ? ashaPhone : undefined,
      stage: 'CREATED',
    });

    // Simulate SMS dispatches
    if (sendSmsToPatient) {
      smsService.sendReferralSms(
        selectedPatient.phone,
        selectedPatient.nameMr,
        createdRef.id,
        selectedHospital.nameMr,
        transportNeeded ? (transportType === '108_AMBULANCE' ? '108 ALS रुग्णवाहिका' : '102 जननी एक्सप्रेस') : undefined,
        lang === 'mr' ? 'mr' : 'en'
      );
    }

    if (sendSmsToAsha && ashaEscortAssigned) {
      smsService.sendAshaAlert(
        ashaPhone,
        ashaName,
        selectedPatient.nameMr,
        createdRef.id,
        urgency,
        lang === 'mr' ? 'mr' : 'en'
      );
    }

    onSuccess(createdRef);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#CFD8DC] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Top Ribbon */}
        <div className="p-4 sm:p-5 bg-[#1A4B8C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Hospital className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {lang === 'mr' ? 'नवीन तज्ञ रेफरल नोंदणी (४ टप्पे)' : 'Create Specialist Referral (4-Step Wizard)'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {lang === 'mr' ? 'शासकीय आंतररुग्णालय रेफरल ट्रॅकिंग प्रणाली' : 'Government Inter-Facility Referral Pipeline'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-[#CFD8DC] flex items-center justify-between text-xs font-bold text-slate-600 shrink-0">
          <div className={`flex items-center gap-1.5 ${currentStep === 1 ? 'text-[#1A4B8C]' : currentStep > 1 ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-[#1A4B8C] text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>
              {currentStep > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className="hidden sm:inline">{lang === 'mr' ? '१. रुग्ण व निकड' : '1. Urgency & Reason'}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className={`flex items-center gap-1.5 ${currentStep === 2 ? 'text-[#1A4B8C]' : currentStep > 2 ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-[#1A4B8C] text-white' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>
              {currentStep > 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span className="hidden sm:inline">{lang === 'mr' ? '२. रुग्णालय निवड' : '2. Hospital Select'}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className={`flex items-center gap-1.5 ${currentStep === 3 ? 'text-[#1A4B8C]' : currentStep > 3 ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-[#1A4B8C] text-white' : currentStep > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>
              {currentStep > 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '3'}
            </span>
            <span className="hidden sm:inline">{lang === 'mr' ? '३. वाहतूक व आशा' : '3. Vitals & Transport'}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className={`flex items-center gap-1.5 ${currentStep === 4 ? 'text-[#1A4B8C]' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 4 ? 'bg-[#1A4B8C] text-white' : 'bg-slate-300'}`}>
              4
            </span>
            <span className="hidden sm:inline">{lang === 'mr' ? '४. पडताळणी' : '4. Review & Dispatch'}</span>
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* ================= STEP 1 ================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-bold text-[#1C2B3A] mb-1">
                  {lang === 'mr' ? 'रेफरलसाठी रुग्ण निवडा (Select Patient)' : 'Select Patient from Registry'}
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 border border-[#CFD8DC] rounded-xl bg-white font-semibold text-xs text-[#1C2B3A] focus:ring-2 focus:ring-[#1A4B8C]"
                >
                  {VILLAGE_PATIENTS_REGISTRY.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameMr} ({p.nameEn}) · ABHA: {p.abhaId} · {p.village}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-[11px] text-[#546E7A] flex items-center gap-2">
                  <span>वय: {selectedPatient.age} वर्षे</span> ·
                  <span>लिंग: {selectedPatient.gender}</span> ·
                  <span>फोन: {selectedPatient.phone}</span>
                </div>
              </div>

              {/* Urgency Level Selector */}
              <div>
                <label className="block font-bold text-[#1C2B3A] mb-1.5">
                  {lang === 'mr' ? 'रेफरलची निकड / निकड स्तर (Urgency Level)' : 'Clinical Urgency & Target SLA'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['EMERGENCY', 'URGENT', 'ROUTINE', 'ELECTIVE'] as UrgencyLevel[]).map((lvl) => {
                    const cfg = URGENCY_CONFIGS[lvl];
                    const isSel = urgency === lvl;
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setUrgency(lvl)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSel 
                            ? 'border-[#1A4B8C] bg-blue-50/70 ring-2 ring-[#1A4B8C]' 
                            : 'border-[#CFD8DC] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5 self-start ${cfg.badgeClass}`}>
                          {cfg.level}
                        </span>
                        <span className="font-bold text-[#1C2B3A] text-xs">
                          {lang === 'mr' ? cfg.labelMr.split(' (')[0] : cfg.labelEn.split(' (')[0]}
                        </span>
                        <span className="text-[10px] text-[#546E7A] mt-1 font-mono">
                          {'<='} {cfg.maxHours} {lang === 'mr' ? 'तास' : 'hours'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Clinical Reason */}
              <div>
                <label className="block font-bold text-[#1C2B3A] mb-1">
                  {lang === 'mr' ? 'रेफरलचे मुख्य कारण व क्लिनिकल इंडिकेशन *' : 'Primary Clinical Indication *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={primaryReason}
                  onChange={(e) => setPrimaryReason(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. ७वा महिना उच्च जोखीम गरोदरपण, गर्भाची असामान्य वाढ किंवा तीव्र छातीत कळ...' : 'e.g., Severe pre-eclampsia with Doppler anomaly scan required...'}
                  className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs focus:ring-2 focus:ring-[#1A4B8C]"
                />
              </div>

              {/* Provisional Diagnosis */}
              <div>
                <label className="block font-bold text-[#1C2B3A] mb-1">
                  {lang === 'mr' ? 'तात्पुरते निदान / संशयित आजार (Provisional Diagnosis)' : 'Provisional Diagnosis / ICD Code'}
                </label>
                <input
                  type="text"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  placeholder="उदा. High-Risk Pregnancy (O36.5) / Acute Coronary Syndrome"
                  className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs focus:ring-2 focus:ring-[#1A4B8C]"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? 'संदर्भ रुग्णालय निवडा' : 'Select Destination Hospital'}
                  </h4>
                  <p className="text-[11px] text-[#546E7A]">
                    {lang === 'mr' ? 'अंतर, खाटांची उपलब्धता व विशेष सेवांनुसार क्रमवारी' : 'Sorted by distance, bed availability & ambulance access'}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={lang === 'mr' ? 'रुग्णालय किंवा विभाग शोधा...' : 'Search facility...'}
                      value={hospitalSearch}
                      onChange={(e) => setHospitalSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-[#CFD8DC] text-xs w-48"
                    />
                  </div>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterAmbulanceOnly(!filterAmbulanceOnly)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                    filterAmbulanceOnly ? 'bg-blue-100 text-[#1A4B8C] border-blue-300' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Truck className="w-3 h-3" />
                  <span>{lang === 'mr' ? 'रुग्णवाहिका' : 'Ambulance'}</span>
                </button>

                {[
                  { key: 'ALL', labelMr: 'सर्व', labelEn: 'All' },
                  { key: 'स्त्रीरोग', labelMr: 'स्त्रीरोग', labelEn: 'OBGYN' },
                  { key: 'हृदयरोग', labelMr: 'हृदयरोग', labelEn: 'Cardio' },
                  { key: 'बालरोग', labelMr: 'बालरोग', labelEn: 'Pediatrics' },
                  { key: 'सर्जरी', labelMr: 'सर्जरी', labelEn: 'Surgery' },
                  { key: 'क्षयरोग', labelMr: 'श्वसनरोग', labelEn: 'Pulmo' },
                ].map(spec => (
                  <button
                    type="button"
                    key={spec.key}
                    onClick={() => setFilterSpecialty(spec.key)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                      filterSpecialty === spec.key 
                        ? 'bg-[#1A4B8C] text-white border-[#1A4B8C]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lang === 'mr' ? spec.labelMr : spec.labelEn}
                  </button>
                ))}
              </div>

              {/* Hospital Cards Directory */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {filteredHospitals.map(hosp => {
                  const isSel = selectedHospitalId === hosp.id;
                  return (
                    <div
                      key={hosp.id}
                      onClick={() => setSelectedHospitalId(hosp.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                        isSel 
                          ? 'border-[#1A4B8C] bg-blue-50/60 ring-2 ring-[#1A4B8C]' 
                          : 'border-[#CFD8DC] bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-[#1C2B3A]">
                            {lang === 'mr' ? hosp.nameMr : hosp.nameEn}
                          </h5>
                          <span className="text-[10px] text-[#546E7A] block">
                            {lang === 'mr' ? hosp.typeMr : hosp.typeEn} · {hosp.address}
                          </span>
                        </div>
                        <span className="font-bold text-[11px] text-[#1A4B8C] bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0">
                          {hosp.distanceKm} km
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap pt-1">
                        <span className="font-semibold text-emerald-700">
                          {lang === 'mr' ? `ICU खाटा: ${hosp.icuBedsAvailable}` : `ICU Beds: ${hosp.icuBedsAvailable}`}
                        </span>
                        <span>·</span>
                        <span>{lang === 'mr' ? `जनरल खाटा: ${hosp.generalBedsAvailable}` : `Gen Beds: ${hosp.generalBedsAvailable}`}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-[#1A4B8C]">
                          <Truck className="w-3 h-3" />
                          <span>{hosp.ambulanceType}</span>
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-0.5">
                        <strong className="text-slate-700">{lang === 'mr' ? 'विभाग:' : 'Specialties:'}</strong> {hosp.specialties.slice(0, 3).join(', ')}...
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Department Input */}
              <div>
                <label className="block font-bold text-[#1C2B3A] mb-1">
                  {lang === 'mr' ? 'विशिष्ट विभाग / स्पेशालिटी (Target Specialty)' : 'Target Clinical Specialty / OPD Desk'}
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-2.5 border border-[#CFD8DC] rounded-xl bg-white font-semibold text-xs"
                >
                  <option value="स्त्रीरोग व प्रसूती (OBGYN)">स्त्रीरोग व प्रसूती (Obstetrics & Gynecology - High Risk)</option>
                  <option value="हृदयरोग विभाग (Cardiology & ICCU)">हृदयरोग विभाग (Cardiology & Emergency ICCU)</option>
                  <option value="बालरोग व नवजात अतिदक्षता (Pediatrics & SNCU)">बालरोग व नवजात अतिदक्षता (Pediatrics & SNCU)</option>
                  <option value="जनरल सर्जरी (General Surgery)">जनरल सर्जरी (General Surgery)</option>
                  <option value="अस्थिव्यंग विभाग (Orthopedics)">अस्थिव्यंग विभाग (Orthopedics)</option>
                  <option value="श्वसनरोग व क्षयरोग केंद्र (Pulmonology)">श्वसनरोग व क्षयरोग केंद्र (Pulmonology & DOTS)</option>
                  <option value="नेत्ररोग विभाग (Ophthalmology)">नेत्ररोग विभाग (Ophthalmology)</option>
                </select>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Vitals Snapshot */}
              <div>
                <label className="block font-bold text-[#1C2B3A] mb-1.5">
                  {lang === 'mr' ? 'सद्य जीवनचिन्हे (Patient Vitals Snapshot)' : 'Current Vitals Snapshot'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">BP (mmHg)</span>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full p-2 border border-[#CFD8DC] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Pulse (bpm)</span>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full p-2 border border-[#CFD8DC] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">SpO2 (%)</span>
                    <input
                      type="text"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                      className="w-full p-2 border border-[#CFD8DC] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Blood Sugar (mg/dL)</span>
                    <input
                      type="text"
                      value={sugar}
                      onChange={(e) => setSugar(e.target.value)}
                      className="w-full p-2 border border-[#CFD8DC] rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Transport Assistance Box */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1C2B3A]">
                  <input
                    type="checkbox"
                    checked={transportNeeded}
                    onChange={(e) => setTransportNeeded(e.target.checked)}
                    className="rounded text-[#1A4B8C]"
                  />
                  <span>
                    {lang === 'mr' ? 'शासकीय रुग्णवाहिका सहाय्य आवश्यक (102 / 108 Emergency Transport)' : 'Government Transport Assistance Required'}
                  </span>
                </label>

                {transportNeeded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                      transportType === '102_JANANI' ? 'border-[#1A4B8C] bg-white font-bold' : 'border-slate-200 bg-white/60'
                    }`}>
                      <input
                        type="radio"
                        name="transportType"
                        checked={transportType === '102_JANANI'}
                        onChange={() => setTransportType('102_JANANI')}
                        className="text-[#1A4B8C]"
                      />
                      <div>
                        <div className="text-xs">१०२ जननी एक्सप्रेस (JSSK Free)</div>
                        <div className="text-[10px] text-[#546E7A] font-normal">गरोदर माता व बालकांसाठी मोफत</div>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                      transportType === '108_AMBULANCE' ? 'border-[#1A4B8C] bg-white font-bold' : 'border-slate-200 bg-white/60'
                    }`}>
                      <input
                        type="radio"
                        name="transportType"
                        checked={transportType === '108_AMBULANCE'}
                        onChange={() => setTransportType('108_AMBULANCE')}
                        className="text-[#1A4B8C]"
                      />
                      <div>
                        <div className="text-xs">१०८ आपत्कालीन रुग्णवाहिका (ALS)</div>
                        <div className="text-[10px] text-[#546E7A] font-normal">जीवनरक्षक व्हेंटिलेटर व डॉक्टरसह</div>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* ASHA Escort Assignment */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1C2B3A]">
                  <input
                    type="checkbox"
                    checked={ashaEscortAssigned}
                    onChange={(e) => setAshaEscortAssigned(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span>
                    {lang === 'mr' ? 'स्थानिक आशा कार्यकर्ती सोबत जाण्यासाठी नियुक्त (ASHA Escort Assigned)' : 'Assign ASHA Worker Escort'}
                  </span>
                </label>

                {ashaEscortAssigned && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">आशा कार्यकर्ती नाव</span>
                      <input
                        type="text"
                        value={ashaName}
                        onChange={(e) => setAshaName(e.target.value)}
                        className="w-full p-2 border border-emerald-300 rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">आशा मोबाईल क्रमांक</span>
                      <input
                        type="text"
                        value={ashaPhone}
                        onChange={(e) => setAshaPhone(e.target.value)}
                        className="w-full p-2 border border-emerald-300 rounded-xl bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Automated SMS notification toggles */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendSmsToPatient}
                    onChange={(e) => setSendSmsToPatient(e.target.checked)}
                    className="rounded text-[#1A4B8C]"
                  />
                  <span>{lang === 'mr' ? 'रुग्णास डिजिटल रेफरल टोकन व रुग्णवाहिका माहिती एसएमएसने पाठवा' : 'Send SMS with token and transport tracking to patient phone'}</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendSmsToAsha}
                    onChange={(e) => setSendSmsToAsha(e.target.checked)}
                    className="rounded text-[#1A4B8C]"
                  />
                  <span>{lang === 'mr' ? 'आशा कार्यकर्तीस तात्काळ रेफरल अलर्ट एसएमएस पाठवा' : 'Send high-priority escort dispatch SMS to ASHA worker'}</span>
                </label>
              </div>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 p-4 rounded-xl border border-[#CFD8DC] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#546E7A]">
                      {lang === 'mr' ? 'रेफरल टोकन पूर्वदृष्य' : 'Referral Token Preview'}
                    </span>
                    <h4 className="font-mono text-base font-bold text-[#1A4B8C]">
                      REF-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-XXXX
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${URGENCY_CONFIGS[urgency].badgeClass}`}>
                    {urgency} (Max {URGENCY_CONFIGS[urgency].maxHours}h)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">{lang === 'mr' ? 'रुग्ण:' : 'Patient:'}</span>
                    <strong className="text-sm text-[#1C2B3A]">{lang === 'mr' ? selectedPatient.nameMr : selectedPatient.nameEn}</strong>
                    <div className="text-[11px] text-slate-600">ABHA: {selectedPatient.abhaId}</div>
                    <div className="text-[11px] text-slate-600">{lang === 'mr' ? 'गाव:' : 'Village:'} {selectedPatient.village} · {lang === 'mr' ? 'फोन:' : 'Phone:'} {selectedPatient.phone}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">{lang === 'mr' ? 'रेफर केलेले रुग्णालय:' : 'Destination Hospital:'}</span>
                    <strong className="text-sm text-[#1A4B8C]">{lang === 'mr' ? selectedHospital.nameMr : selectedHospital.nameEn}</strong>
                    <div className="text-[11px] font-semibold text-slate-700">{selectedDepartment}</div>
                    <div className="text-[11px] text-slate-500">{lang === 'mr' ? `अंतर: ${selectedHospital.distanceKm} किमी` : `Distance: ${selectedHospital.distanceKm} km`}</div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">{lang === 'mr' ? 'क्लिनिकल इंडिकेशन व कारण:' : 'Clinical Indication:'}</span>
                  <p className="text-slate-800 font-medium">{primaryReason || (lang === 'mr' ? 'विशेषज्ञ तपासणी व पुढील उपचारांसाठी शिफारस' : 'Referral for specialist evaluation and intervention.')}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                  <div><span className="text-slate-500">BP:</span> <strong>{bp}</strong></div>
                  <div><span className="text-slate-500">Pulse:</span> <strong>{pulse} bpm</strong></div>
                  <div><span className="text-slate-500">SpO2:</span> <strong>{spO2}%</strong></div>
                  <div><span className="text-slate-500">Sugar:</span> <strong>{sugar || '—'}</strong></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>
                    {lang === 'mr' ? 'वाहतूक सहाय्य: ' : 'Transport: '}
                    {transportNeeded 
                      ? (transportType === '108_AMBULANCE' 
                          ? (lang === 'mr' ? '१०८ रुग्णवाहिका (ALS)' : '108 Ambulance (ALS)') 
                          : (lang === 'mr' ? '१०२ जननी एक्सप्रेस' : '102 Janani Express')) 
                      : (lang === 'mr' ? 'नाही (स्वतःचे वाहन)' : 'None (Own vehicle)')}
                  </span>
                  <span>
                    {lang === 'mr' ? 'आशा सोबत: ' : 'ASHA Escort: '}
                    {ashaEscortAssigned ? ashaName : (lang === 'mr' ? 'नाही' : 'None')}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'mr' 
                    ? 'पुष्टी केल्यानंतर डिजिटल टोकन जारी होईल आणि रुग्णालय डॅशबोर्डवर तात्काळ अलर्ट जाईल.' 
                    : 'Upon dispatch, the digital token is created, patient/ASHA receive instant SMS, and receiving hospital is alerted.'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-[#CFD8DC] flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2 rounded-xl border border-[#CFD8DC] bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'मागील टप्पा' : 'Previous Step'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              className="px-5 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>{lang === 'mr' ? 'पुढील टप्पा' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'रेफरल पाठवा व टोकन जारी करा' : 'Confirm & Dispatch Referral'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
