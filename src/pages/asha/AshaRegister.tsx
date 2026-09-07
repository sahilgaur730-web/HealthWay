import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowLeft, 
  CheckCircle2, 
  Activity, 
  HeartPulse, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  User, 
  Printer, 
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AshaRegister() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    nameMr: '',
    nameEn: '',
    aadhaar4: '',
    age: '',
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '',
    village: 'वडगाव',
    bp: '120/80',
    sugar: '95',
    hb: '11.5',
    weight: '55',
    isPregnant: false,
    isHypertensive: false,
    isDiabetic: false,
    isTbSuspect: false,
  });

  const [registeredAbha, setRegisteredAbha] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const abha = `MH-PN-24-0000${Math.floor(1000 + Math.random() * 9000)}`;
    setRegisteredAbha(abha);
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
            {lang === 'mr' ? 'आयुष्मान भारत डिजिटल मिशन (ABHA)' : 'ABDM Compliant Registration'}
          </span>
        </div>

        {!registeredAbha ? (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm overflow-hidden">
            
            <div className="p-6 bg-[#1A4B8C] text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {lang === 'mr' ? 'नवीन ग्रामीण रुग्ण नोंदणी' : 'New Rural Patient Registration'}
                </h1>
                <p className="text-xs text-blue-100 mt-0.5">
                  {lang === 'mr' 
                    ? 'नागरिकाची आधार आधारित ABHA आरोग्य ओळख तयार करा आणि मूलभूत नोंदी भरा' 
                    : 'Generate digital ABHA identity card and log baseline health metrics'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              
              {/* Section 1: Demographics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
                  {lang === 'mr' ? '१. वैयक्तिक माहिती (Personal Details)' : '1. Personal Demographics'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'रुग्णाचे पूर्ण नाव (मराठीत) *' : 'Patient Full Name (Marathi) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameMr}
                      onChange={(e) => setFormData({ ...formData, nameMr: e.target.value })}
                      placeholder="उदा. मंदाबाई सुरेश गायकवाड"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'पूर्ण नाव (इंग्रजीत) *' : 'Patient Full Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Mandabai Suresh Gaikwad"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'आधार कार्ड शेवटचे ४ अंक *' : 'Aadhaar Last 4 Digits *'}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={formData.aadhaar4}
                      onChange={(e) => setFormData({ ...formData, aadhaar4: e.target.value })}
                      placeholder="उदा. 4912"
                      className="w-full px-3 py-2 text-xs font-mono border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'मोबाईल नंबर *' : 'Mobile Phone *'}
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="उदा. 9822123456"
                      className="w-full px-3 py-2 text-xs font-mono border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                        {lang === 'mr' ? 'वय *' : 'Age *'}
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="26"
                        className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                        {lang === 'mr' ? 'लिंग' : 'Gender'}
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-2 py-2 text-xs border border-[#CFD8DC] rounded-xl bg-white"
                      >
                        <option value="Female">{lang === 'mr' ? 'स्त्री' : 'Female'}</option>
                        <option value="Male">{lang === 'mr' ? 'पुरुष' : 'Male'}</option>
                        <option value="Other">{lang === 'mr' ? 'इतर' : 'Other'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                        {lang === 'mr' ? 'रक्तगट' : 'Blood'}
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-2 py-2 text-xs border border-[#CFD8DC] rounded-xl bg-white"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'गाव / वस्ती *' : 'Village / Wasti *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baseline Vitals */}
              <div className="space-y-4 pt-2 border-t border-[#CFD8DC]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
                  {lang === 'mr' ? '२. प्राथमिक शारीरिक तपासणी (Baseline Vitals)' : '2. Baseline Health Vitals'}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'रक्तदाब (BP)' : 'Blood Pressure'}
                    </label>
                    <input
                      type="text"
                      value={formData.bp}
                      onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                      placeholder="120/80"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'रक्तातील साखर (Sugar)' : 'Blood Sugar (mg/dL)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sugar}
                      onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                      placeholder="95"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'हिमोग्लोबिन (Hb g/dL)' : 'Hemoglobin (g/dL)'}
                    </label>
                    <input
                      type="text"
                      value={formData.hb}
                      onChange={(e) => setFormData({ ...formData, hb: e.target.value })}
                      placeholder="11.5"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1C2B3A] mb-1">
                      {lang === 'mr' ? 'वजन (Weight kg)' : 'Weight (kg)'}
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="55"
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: High Risk Screening Flags */}
              <div className="space-y-3 pt-2 border-t border-[#CFD8DC]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
                  {lang === 'mr' ? '३. जोखीम मूल्यमापन (High-Risk Screening)' : '3. Risk Category Flags'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-3 rounded-xl border border-[#CFD8DC] bg-slate-50/50 flex items-center gap-3 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={formData.isPregnant}
                      onChange={(e) => setFormData({ ...formData, isPregnant: e.target.checked })}
                      className="rounded border-[#CFD8DC] text-[#1A4B8C]"
                    />
                    <span className="text-xs font-semibold text-[#1C2B3A]">
                      {lang === 'mr' ? 'गरोदर माता (Maternal / ANC Cohort)' : 'Maternal / Pregnant Mother'}
                    </span>
                  </label>

                  <label className="p-3 rounded-xl border border-[#CFD8DC] bg-slate-50/50 flex items-center gap-3 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={formData.isHypertensive}
                      onChange={(e) => setFormData({ ...formData, isHypertensive: e.target.checked })}
                      className="rounded border-[#CFD8DC] text-[#1A4B8C]"
                    />
                    <span className="text-xs font-semibold text-[#1C2B3A]">
                      {lang === 'mr' ? 'उच्च रक्तदाब संशय (Hypertension)' : 'Hypertension Screening'}
                    </span>
                  </label>

                  <label className="p-3 rounded-xl border border-[#CFD8DC] bg-slate-50/50 flex items-center gap-3 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={formData.isDiabetic}
                      onChange={(e) => setFormData({ ...formData, isDiabetic: e.target.checked })}
                      className="rounded border-[#CFD8DC] text-[#1A4B8C]"
                    />
                    <span className="text-xs font-semibold text-[#1C2B3A]">
                      {lang === 'mr' ? 'मधुमेह संशय (Diabetes Mellitus)' : 'Diabetes Screening'}
                    </span>
                  </label>

                  <label className="p-3 rounded-xl border border-[#CFD8DC] bg-slate-50/50 flex items-center gap-3 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={formData.isTbSuspect}
                      onChange={(e) => setFormData({ ...formData, isTbSuspect: e.target.checked })}
                      className="rounded border-[#CFD8DC] text-[#1A4B8C]"
                    />
                    <span className="text-xs font-semibold text-[#1C2B3A]">
                      {lang === 'mr' ? 'क्षयरोग संशय (TB / Cough > 2 Weeks)' : 'TB Suspect Protocol'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
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
                  <ShieldCheck className="w-4 h-4" />
                  {lang === 'mr' ? 'ABHA कार्ड तयार करा व नोंदणी करा' : 'Generate ABHA & Complete Registration'}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Registration Success Modal & ABHA Card */
          <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2 pb-4 border-b border-[#CFD8DC]">
              <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto border border-green-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'रुग्ण नोंदणी यशस्वी!' : 'Patient Successfully Registered!'}
              </h2>
              <p className="text-xs text-[#546E7A]">
                {lang === 'mr' 
                  ? 'आयुष्मान भारत डिजिटल मिशन (ABHA) अंतर्गत डिजिटल आरोग्य ओळखपत्र जारी केले आहे.' 
                  : 'ABHA Health ID card successfully provisioned under Ayushman Bharat Digital Mission.'}
              </p>
            </div>

            {/* Generated ABHA Card Preview */}
            <div className="bg-[#1A4B8C] rounded-2xl p-6 text-white max-w-md mx-auto shadow-md relative overflow-hidden">
              <div className="flex items-start justify-between border-b border-white/20 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                    {lang === 'mr' ? 'महाराष्ट्र शासन · ABHA डिजिटल आरोग्य कार्ड' : 'Govt of Maharashtra · ABHA Health Card'}
                  </div>
                  <h3 className="text-base font-bold mt-0.5">{formData.nameMr || 'रुग्ण नाव'}</h3>
                  <div className="text-xs text-blue-200">{formData.nameEn || 'Patient Name'}</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                <div>
                  <span className="text-blue-200 text-[10px] block">ABHA ID</span>
                  <span className="font-mono font-bold tracking-wider">{registeredAbha}</span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] block">{lang === 'mr' ? 'लिंग / वय' : 'Gender / Age'}</span>
                  <span className="font-bold">{formData.gender}, {formData.age} वर्षे</span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] block">{lang === 'mr' ? 'रक्तगट' : 'Blood Group'}</span>
                  <span className="font-bold">{formData.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] block">{lang === 'mr' ? 'गाव' : 'Village'}</span>
                  <span className="font-bold">{formData.village}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-blue-200">
                <span>नोंदणी: आशा सुमन ताई पाटील</span>
                <span className="font-mono">VALID: ABDM-MH</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#CFD8DC] rounded-xl text-xs font-bold text-[#1C2B3A] hover:bg-slate-50 transition"
              >
                <Printer className="w-4 h-4 text-[#546E7A]" />
                {lang === 'mr' ? 'कार्ड प्रिंट करा' : 'Print ABHA Card'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setRegisteredAbha(null);
                    setFormData({
                      nameMr: '',
                      nameEn: '',
                      aadhaar4: '',
                      age: '',
                      gender: 'Female',
                      bloodGroup: 'B+',
                      phone: '',
                      village: 'वडगाव',
                      bp: '120/80',
                      sugar: '95',
                      hb: '11.5',
                      weight: '55',
                      isPregnant: false,
                      isHypertensive: false,
                      isDiabetic: false,
                      isTbSuspect: false,
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#546E7A] hover:text-[#1C2B3A]"
                >
                  {lang === 'mr' ? 'आणखी रुग्ण जोडा' : 'Add Another Patient'}
                </button>
                <button
                  onClick={() => navigate('/asha/patients')}
                  className="px-5 py-2.5 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#0D3470] transition"
                >
                  {lang === 'mr' ? 'रुग्ण यादीवर जा' : 'Go to Registry'}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
