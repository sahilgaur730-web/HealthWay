import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  ArrowLeft,
  Activity,
  HeartPulse,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  User,
  Hospital,
  Clock,
  Video,
  Wifi,
  ShieldAlert,
  Send
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { VILLAGE_PATIENTS_REGISTRY } from '../../data/mockData';
import {
  calculateTriage,
  saveTriageEntry,
  TRIAGE_LEVELS,
  TriageResult
} from '../../services/triageEngine';

export default function AshaTriage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(VILLAGE_PATIENTS_REGISTRY[0].id);
  const [complaint, setComplaint] = useState('');
  const [duration, setDuration] = useState<'sudden' | 'hours' | 'day' | 'days'>('hours');
  const [hasEmergencySign, setHasEmergencySign] = useState(false);
  const [vitals, setVitals] = useState({
    bp: '130/85',
    sugar: '98',
    pulse: '82',
    temp: '99.2',
    spO2: '97',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const currentPatient = VILLAGE_PATIENTS_REGISTRY.find(p => p.id === selectedPatientId) || VILLAGE_PATIENTS_REGISTRY[0];

  const handleDispatchConsult = (e: React.FormEvent) => {
    e.preventDefault();

    // Map ASHA input to clinical triage engine
    const symptoms: string[] = [];
    if (hasEmergencySign) symptoms.push('pregnancy_emergency');
    if (Number(vitals.temp) >= 101) symptoms.push('high_fever');
    else if (Number(vitals.temp) >= 99.5) symptoms.push('moderate_fever');

    if (complaint.toLowerCase().includes('chest') || complaint.toLowerCase().includes('छाती')) symptoms.push('chest_pain');
    if (complaint.toLowerCase().includes('breath') || complaint.toLowerCase().includes('श्वास')) symptoms.push('difficulty_breathing');
    if (complaint.toLowerCase().includes('bleed') || complaint.toLowerCase().includes('रक्त')) symptoms.push('heavy_bleeding');
    if (complaint.toLowerCase().includes('vomit') || complaint.toLowerCase().includes('उलटी')) symptoms.push('persistent_vomiting');
    if (complaint.toLowerCase().includes('pain') || complaint.toLowerCase().includes('कळ')) symptoms.push('severe_abdominal');

    if (symptoms.length === 0) symptoms.push('mild_headache');

    const result = calculateTriage({
      patientName: currentPatient.nameEn,
      age: currentPatient.age,
      gender: currentPatient.gender.toLowerCase() as any,
      isPregnant: currentPatient.gender === 'Female' && currentPatient.age <= 35,
      duration,
      symptoms,
      vitalSigns: {
        bloodPressure: vitals.bp,
        heartRate: vitals.pulse,
        temperature: vitals.temp,
        spo2: vitals.spO2.replace('%', ''),
      },
      existingConditions: currentPatient.conditions.map(c => c.toLowerCase()),
      abhaId: currentPatient.abhaId,
      phone: currentPatient.phone,
      notes: complaint,
    });

    saveTriageEntry(result, 'PHC Shirur Emergency Bay');
    setTriageResult(result);
    setIsSubmitted(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/asha')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'mr' ? 'आशा डॅशबोर्डवर परत' : 'Back to ASHA Dashboard'}
          </button>
          <span className="text-xs font-bold px-3 py-1 bg-[#E8F0FE] text-[#1A4B8C] rounded-full">
            {lang === 'mr' ? 'टेलीकन्सल्टेशन सिस्टीम' : 'PHC Teleconsultation Gateway'}
          </span>
        </div>

        {!isSubmitted ? (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm overflow-hidden">
            <div className="p-6 bg-[#1A4B8C] text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {lang === 'mr' ? 'फील्ड ट्रायज व डॉक्टर थेट सल्ला (Teleconsult)' : 'Field Triage & Doctor Teleconsult'}
                </h1>
                <p className="text-xs text-blue-100 mt-0.5">
                  {lang === 'mr'
                    ? 'गावात प्रत्यक्ष रुग्णाचे व्हायटल्स तपासा आणि प्राथमिक आरोग्य केंद्रातील डॉक्टरांशी संपर्क जोडा'
                    : 'Record field vitals and initiate video teleconsultation with PHC Medical Officer'}
                </p>
              </div>
            </div>

            <form onSubmit={handleDispatchConsult} className="p-6 sm:p-8 space-y-6">
              {/* 1. Patient Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#546E7A] mb-2">
                  {lang === 'mr' ? '१. रुग्ण निवडा' : '1. Select Patient from Registry'}
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold border border-[#CFD8DC] rounded-xl text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  {VILLAGE_PATIENTS_REGISTRY.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.nameMr} ({pt.nameEn}) — ABHA: {pt.abhaId} — वय: {pt.age} वर्षे
                    </option>
                  ))}
                </select>

                {/* Patient preview pill */}
                <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-[#CFD8DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#1C2B3A]">{currentPatient.nameMr}</span>
                    <span className="text-[#546E7A] ml-2">
                      ({currentPatient.gender === 'Female' ? 'स्त्री' : 'पुरुष'}, वय {currentPatient.age})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#546E7A]">
                    {currentPatient.conditions.join(', ')}
                  </div>
                </div>
              </div>

              {/* 2. Record Field Vitals */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#546E7A]">
                  {lang === 'mr' ? '२. प्रत्यक्ष मोजलेले व्हायटल्स (Field Vitals)' : '2. Real-Time Measured Vitals'}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#1C2B3A] block mb-1">रक्तदाब (BP)</span>
                    <input
                      type="text"
                      required
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      placeholder="120/80"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#1C2B3A] block mb-1">साखर (Blood Sugar)</span>
                    <input
                      type="text"
                      required
                      value={vitals.sugar}
                      onChange={(e) => setVitals({ ...vitals, sugar: e.target.value })}
                      placeholder="98"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#1C2B3A] block mb-1">नाडी (Pulse bpm)</span>
                    <input
                      type="text"
                      required
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="76"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#1C2B3A] block mb-1">तापमान (Temp °F)</span>
                    <input
                      type="text"
                      required
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      placeholder="98.4"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#1C2B3A] block mb-1">ऑक्सिजन (SpO2 %)</span>
                    <input
                      type="text"
                      required
                      value={vitals.spO2}
                      onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                      placeholder="99%"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#1C2B3A] block mb-1">कालावधी (Duration)</span>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl bg-white"
                    >
                      <option value="sudden">अचानक (&lt; १ तास)</option>
                      <option value="hours">१ ते १२ तास</option>
                      <option value="day">कालपासून</option>
                      <option value="days">२ ते ३ दिवस</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Danger Sign Toggle */}
              <div className="p-3.5 rounded-xl border border-[#FDBA74] bg-[#FFF7ED]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEmergencySign}
                    onChange={(e) => setHasEmergencySign(e.target.checked)}
                    className="w-4 h-4 text-[#DC2626] rounded border-[#EA580C] focus:ring-[#DC2626]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#9A3412]">
                      {lang === 'mr' ? 'धोक्याची लक्षणे (कळ, तीव्र रक्तस्त्राव, धाप किंवा चक्कर)' : 'High Risk Danger Signs (Bleeding, severe pain, breathing distress)'}
                    </div>
                    <div className="text-[11px] text-[#C2410C]">
                      {lang === 'mr' ? 'तातडीने लाल (RED) किंवा नारंगी (ORANGE) प्राधान्य दिले जाईल' : 'Instantly fast-tracks priority triage in PHC duty queue'}
                    </div>
                  </div>
                </label>
              </div>

              {/* 3. Clinical observations */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#546E7A] mb-2">
                  {lang === 'mr' ? '३. मुख्य तक्रार / डॉक्टरांसाठी शेरा' : '3. Chief Complaint & Symptoms'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. दोन दिवसांपासून ताप व पोटात कळ येत आहे...' : 'Describe patient symptoms e.g. acute fever, severe headache, abdominal pain...'}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#CFD8DC] focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/asha')}
                  className="px-5 py-2.5 text-xs font-bold text-[#546E7A] hover:text-[#1C2B3A]"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#0D3470] transition shadow-sm flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  {lang === 'mr' ? 'ट्रायज नोंदवा व डॉक्टरांशी जोडा' : 'Process Triage & Connect'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* RESULT CONFIRMATION CARD */
          <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-black shadow-md"
                style={{ backgroundColor: triageResult?.triageLevel.color || '#1A4B8C' }}
              >
                {triageResult?.triageLevel.level === 'RED' ? (
                  <AlertOctagon className="w-8 h-8" />
                ) : triageResult?.triageLevel.level === 'ORANGE' ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )}
              </div>
              <h2 className="text-xl font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'फील्ड ट्रायज यशस्वीरीत्या नोंदवले' : 'Field Triage Successfully Dispatched'}
              </h2>
              <div className="text-xs font-mono font-bold text-[#1A4B8C]">
                {triageResult?.referenceId}
              </div>
            </div>

            {/* Severity Card */}
            <div
              className="p-4 rounded-xl border space-y-2"
              style={{
                backgroundColor: triageResult?.triageLevel.bgColor,
                borderColor: triageResult?.triageLevel.borderColor,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-black"
                  style={{ color: triageResult?.triageLevel.color }}
                >
                  {triageResult?.triageLevel.level} PRIORITY ({triageResult?.triageLevel.waitTimeEn})
                </span>
                <span className="text-xs font-bold text-[#1C2B3A]">
                  Score: {triageResult?.score} / 30
                </span>
              </div>
              <p className="text-xs text-[#334155]">
                {lang === 'mr' ? triageResult?.urgencyAdviceMr : triageResult?.urgencyAdviceEn}
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {triageResult?.triageLevel.level === 'RED' && (
                <a
                  href="tel:108"
                  className="col-span-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#DC2626] text-white text-xs font-black shadow hover:bg-[#B91C1C]"
                >
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  {lang === 'mr' ? '१०८ रुग्णवाहिकेला तात्काळ कॉल करा' : 'Call 108 Emergency Ambulance'}
                </a>
              )}

              <button
                onClick={() => navigate('/consultation')}
                className="py-2.5 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#153D70] flex items-center justify-center gap-2 shadow-sm"
              >
                <Video className="w-4 h-4" />
                {lang === 'mr' ? 'थेट व्हिडिओ कॉल सुरू करा' : 'Start Video Call'}
              </button>

              <button
                onClick={() => navigate('/health-center/queue')}
                className="py-2.5 rounded-xl border border-[#BED7F7] bg-[#E8F0FE] text-[#1A4B8C] text-xs font-bold hover:bg-[#D2E3FC] flex items-center justify-center gap-2"
              >
                <Hospital className="w-4 h-4" />
                {lang === 'mr' ? 'आरोग्य केंद्र रांग पहा' : 'View PHC Queue'}
              </button>

              <button
                onClick={() => setIsSubmitted(false)}
                className="py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] text-xs font-bold hover:bg-[#F8FAFC]"
              >
                {lang === 'mr' ? 'नवीन रुग्ण ट्रायज करा' : 'Next Patient'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
