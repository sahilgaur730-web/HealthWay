import React, { useState } from 'react';
import { 
  FileCheck2, 
  Stethoscope, 
  Hospital, 
  CheckCircle2, 
  X, 
  Send, 
  Calendar, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ReferralItem, DoctorFeedbackData, referralService } from '../../services/referralService';

interface DoctorFeedbackProps {
  referral: ReferralItem;
  isOpen?: boolean;
  onClose: () => void;
  onFeedbackSaved: (updatedReferral: ReferralItem) => void;
}

export default function DoctorFeedback({
  referral,
  isOpen = true,
  onClose,
  onFeedbackSaved
}: DoctorFeedbackProps) {
  const { lang } = useLanguage();

  const [receivingDoctorName, setReceivingDoctorName] = useState(
    referral.feedback?.receivingDoctorName || (lang === 'mr' ? 'डॉ. अनिता जोशी (MD, DGO)' : 'Dr. Anita Joshi (MD, DGO)')
  );
  const [receivingHospital, setReceivingHospital] = useState(
    referral.feedback?.receivingHospital || (lang === 'mr' ? referral.targetHospitalNameMr : referral.targetHospitalNameEn)
  );
  const [specialty, setSpecialty] = useState(
    referral.feedback?.specialty || (lang === 'mr' ? referral.departmentMr : referral.departmentEn)
  );
  const [outcomeStatus, setOutcomeStatus] = useState<DoctorFeedbackData['outcomeStatus']>(
    referral.feedback?.outcomeStatus || 'OPD_TREATED'
  );
  const [finalDiagnosisMr, setFinalDiagnosisMr] = useState(
    referral.feedback?.finalDiagnosisMr || ''
  );
  const [finalDiagnosisEn, setFinalDiagnosisEn] = useState(
    referral.feedback?.finalDiagnosisEn || ''
  );
  const [treatmentSummaryMr, setTreatmentSummaryMr] = useState(
    referral.feedback?.treatmentSummaryMr || ''
  );
  const [treatmentSummaryEn, setTreatmentSummaryEn] = useState(
    referral.feedback?.treatmentSummaryEn || ''
  );
  const [counterReferralAdviceMr, setCounterReferralAdviceMr] = useState(
    referral.feedback?.counterReferralAdviceMr || ''
  );
  const [counterReferralAdviceEn, setCounterReferralAdviceEn] = useState(
    referral.feedback?.counterReferralAdviceEn || ''
  );
  const [followUpDate, setFollowUpDate] = useState(
    referral.feedback?.followUpDate || (lang === 'mr' ? '१५ दिवसांनी (After 15 Days)' : 'In 15 Days (Bi-weekly check)')
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dMr = finalDiagnosisMr.trim() || finalDiagnosisEn.trim() || 'तपासणी पूर्ण, प्रकृती स्थिर';
    const dEn = finalDiagnosisEn.trim() || finalDiagnosisMr.trim() || 'Investigation completed, patient hemodynamically stable.';
    const tMr = treatmentSummaryMr.trim() || treatmentSummaryEn.trim() || 'तज्ञ डॉक्टरांद्वारे तपासणी व औषधोपचार सल्ला दिला गेला.';
    const tEn = treatmentSummaryEn.trim() || treatmentSummaryMr.trim() || 'Specialist consultation completed and prescription calibrated.';
    const cMr = counterReferralAdviceMr.trim() || counterReferralAdviceEn.trim() || 'PHC मध्ये नियमित फॉलो-अप सुरू ठेवावा.';
    const cEn = counterReferralAdviceEn.trim() || counterReferralAdviceMr.trim() || 'Continue regular antenatal/medical follow-up at primary health centre.';

    const updated = referralService.addDoctorFeedback(referral.id, {
      receivingDoctorName,
      receivingHospital,
      specialty,
      outcomeStatus,
      finalDiagnosisMr: dMr,
      finalDiagnosisEn: dEn,
      treatmentSummaryMr: tMr,
      treatmentSummaryEn: tEn,
      counterReferralAdviceMr: cMr,
      counterReferralAdviceEn: cEn,
      followUpDate,
    });

    if (updated) {
      onFeedbackSaved(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#CFD8DC] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1C2B3A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {lang === 'mr' ? 'तज्ञ डॉक्टर फीडबॅक व काऊंटर-रेफरल' : 'Receiving Doctor Feedback & Counter-Referral'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'mr' ? `रेफरल टोकन: ${referral.id}` : `Referral Case ID: ${referral.id}`}
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

        {/* Case Context Pill */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-[#CFD8DC] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#1C2B3A]">
          <div>
            <span className="text-[#546E7A]">{lang === 'mr' ? 'रुग्ण:' : 'Patient:'} </span>
            <strong>{lang === 'mr' ? referral.patientNameMr : referral.patientNameEn}</strong> (ABHA: {referral.abhaId})
          </div>
          <div className="text-[11px] text-[#546E7A]">
            <span>{lang === 'mr' ? 'रेफर करणारे केंद्र:' : 'Origin:'} </span>
            <span className="font-semibold text-[#1A4B8C]">{lang === 'mr' ? referral.referringFacilityMr : referral.referringFacilityEn}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#1C2B3A] mb-1">
                {lang === 'mr' ? 'तपासणी करणारे डॉक्टर (Specialist)' : 'Receiving Doctor Name'}
              </label>
              <input
                type="text"
                required
                value={receivingDoctorName}
                onChange={(e) => setReceivingDoctorName(e.target.value)}
                className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1C2B3A] mb-1">
                {lang === 'mr' ? 'उपचार स्थिती (Outcome Status)' : 'Clinical Outcome Status'}
              </label>
              <select
                value={outcomeStatus}
                onChange={(e) => setOutcomeStatus(e.target.value as any)}
                className="w-full p-2.5 border border-[#CFD8DC] rounded-xl bg-white text-xs font-semibold"
              >
                <option value="OPD_TREATED">ओपीडी तपासणी पूर्ण (OPD Treated & Advised)</option>
                <option value="ADMITTED">रुग्णालयात दाखल (Admitted to In-Patient)</option>
                <option value="DISCHARGED">उपचारानंतर डिस्चार्ज (Discharged Stabilized)</option>
                <option value="TRANSFERRED">पुढील केंद्रात वर्ग (Higher Tertiary Transfer)</option>
              </select>
            </div>
          </div>

          {/* Final Diagnosis */}
          <div>
            <label className="block font-bold text-[#1C2B3A] mb-1">
              {lang === 'mr' ? 'अंतिम क्लिनिकल निदान (Final Specialist Diagnosis) *' : 'Final Specialist Diagnosis *'}
            </label>
            <input
              type="text"
              required
              value={lang === 'mr' ? finalDiagnosisMr : (finalDiagnosisEn || finalDiagnosisMr)}
              onChange={(e) => {
                if (lang === 'mr') {
                  setFinalDiagnosisMr(e.target.value);
                } else {
                  setFinalDiagnosisEn(e.target.value);
                }
              }}
              placeholder={lang === 'mr' ? 'उदा. Moderate Anemia / Mild Fetal Growth Restriction (FGR Type 1)' : 'e.g., Moderate Anemia / Mild Fetal Growth Restriction (FGR Type 1)'}
              className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs"
            />
          </div>

          {/* Treatment Summary */}
          <div>
            <label className="block font-bold text-[#1C2B3A] mb-1">
              {lang === 'mr' ? 'केलेले उपचार व चाचण्यांचा तपशील (Treatment & Procedures)' : 'Treatment & Interventions Performed'}
            </label>
            <textarea
              rows={2}
              value={lang === 'mr' ? treatmentSummaryMr : (treatmentSummaryEn || treatmentSummaryMr)}
              onChange={(e) => {
                if (lang === 'mr') {
                  setTreatmentSummaryMr(e.target.value);
                } else {
                  setTreatmentSummaryEn(e.target.value);
                }
              }}
              placeholder={lang === 'mr' ? 'उदा. डॉपलर सोनोग्राफी करण्यात आली (सामान्य रक्तप्रवाह). १ युनिट IV Iron Sucrose देण्यात आला...' : 'e.g., Doppler ultrasound completed (normal umbilical flow). 1 unit IV Iron Sucrose administered...'}
              className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs"
            />
          </div>

          {/* Counter-referral Advice */}
          <div>
            <label className="block font-bold text-[#1C2B3A] mb-1">
              {lang === 'mr' ? 'प्राथमिक केंद्राच्या डॉक्टरांसाठी सल्ला (Counter-Referral Advice)' : 'Counter-Referral Advice to PHC Doctor'}
            </label>
            <textarea
              rows={2}
              value={lang === 'mr' ? counterReferralAdviceMr : (counterReferralAdviceEn || counterReferralAdviceMr)}
              onChange={(e) => {
                if (lang === 'mr') {
                  setCounterReferralAdviceMr(e.target.value);
                } else {
                  setCounterReferralAdviceEn(e.target.value);
                }
              }}
              placeholder={lang === 'mr' ? 'उदा. PHC मध्ये दर आठवड्याला वजन व बीपी तपासावे. पुढील सोनोग्राफी ३२व्या आठवड्यात आवश्यक.' : 'e.g., Weekly weight and BP check at PHC Shirur. Repeat anomaly USG at 32 weeks.'}
              className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs"
            />
          </div>

          {/* Follow-up timeline */}
          <div>
            <label className="block font-bold text-[#1C2B3A] mb-1">
              {lang === 'mr' ? 'पुढील तपासणी तारीख / कालावधी (Follow-up Target)' : 'Next Follow-up Timeline'}
            </label>
            <input
              type="text"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs"
            />
          </div>

          {/* Closed-loop Assurance */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {lang === 'mr' ? 'क्लोज्ड-लूप समन्वय (Closed-Loop EHR Synchronization)' : 'Closed-Loop Care Coordination'}
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                {lang === 'mr'
                  ? 'हा फीडबॅक त्वरित PHC शिरूरच्या डॉक्टरांच्या डॅशबोर्डवर दिसेल आणि रुग्णाच्या ABHA प्रोफाईलमध्ये सुरक्षित केला जाईल.'
                  : 'This clinical feedback directly synchronizes back to the originating PHC doctor and patient ABHA record.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#CFD8DC] text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'फीडबॅक जतन करा व केस पूर्ण करा' : 'Submit Counter-Referral'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
