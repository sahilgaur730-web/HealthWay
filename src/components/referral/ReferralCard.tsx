import React from 'react';
import { 
  Hospital, 
  Clock, 
  MapPin, 
  User, 
  Printer, 
  Truck, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Send, 
  PhoneCall, 
  Stethoscope, 
  ExternalLink 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ReferralItem, ReferralStage, STAGES_ORDER, STAGE_CONFIGS } from '../../services/referralService';
import { getUrgencyBadge, getStageBadge } from '../../utils/notificationUtils';

interface ReferralCardProps {
  referral: ReferralItem;
  onSelect?: (referral: ReferralItem) => void;
  onUpdateStage?: (referral: ReferralItem, nextStage: ReferralStage) => void;
  onOpenFeedback?: (referral: ReferralItem) => void;
  onAlertAsha?: (referral: ReferralItem) => void;
  showActions?: boolean;
}

export default function ReferralCard({
  referral,
  onSelect,
  onUpdateStage,
  onOpenFeedback,
  onAlertAsha,
  showActions = true
}: ReferralCardProps) {
  const { lang } = useLanguage();

  const urgencyBadge = getUrgencyBadge(referral.urgency, lang);
  const stageBadge = getStageBadge(referral.stage, lang);

  const currentStageIdx = STAGES_ORDER.indexOf(referral.stage);
  const nextStage = currentStageIdx >= 0 && currentStageIdx < STAGES_ORDER.length - 1 
    ? STAGES_ORDER[currentStageIdx + 1] 
    : null;

  return (
    <div className={`p-5 rounded-2xl border transition bg-white space-y-4 shadow-xs hover:shadow-md ${
      referral.isOverdue && referral.stage !== 'COMPLETED'
        ? 'border-red-300 ring-1 ring-red-200' 
        : 'border-[#CFD8DC] hover:border-[#1A4B8C]'
    }`}>
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center shrink-0">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#1C2B3A]">
                {lang === 'mr' ? referral.patientNameMr : referral.patientNameEn}
              </h4>
              <span className="font-mono text-xs font-semibold text-[#1A4B8C] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {referral.id}
              </span>
            </div>
            <p className="text-[11px] text-[#546E7A] mt-0.5">
              ABHA: <span className="font-mono">{referral.abhaId}</span> · {referral.patientVillage} · {referral.patientAge}y/{referral.patientGender}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* Urgency Badge */}
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyBadge.className}`}>
            {urgencyBadge.label}
          </span>

          {/* Overdue Badge */}
          {referral.isOverdue && referral.stage !== 'COMPLETED' && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>{lang === 'mr' ? `मुदत उलटली (${referral.overdueHours || 1}h+)` : `Overdue (${referral.overdueHours || 1}h+)`}</span>
            </span>
          )}

          {/* Status Badge */}
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${stageBadge.className}`}>
            {stageBadge.label}
          </span>
        </div>
      </div>

      {/* Origin vs Target Facilities Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-[#CFD8DC]/70 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
            {lang === 'mr' ? 'रेफर करणारे केंद्र (Origin):' : 'Referring Facility:'}
          </span>
          <strong className="text-[#1C2B3A]">{lang === 'mr' ? referral.referringFacilityMr : referral.referringFacilityEn}</strong>
          <p className="text-[11px] text-[#546E7A]">{lang === 'mr' ? referral.referringDoctorMr : referral.referringDoctorEn}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
            {lang === 'mr' ? 'रेफर केलेले रुग्णालय व विभाग (Destination):' : 'Target Hospital & Department:'}
          </span>
          <strong className="text-[#1A4B8C]">{lang === 'mr' ? referral.targetHospitalNameMr : referral.targetHospitalNameEn}</strong>
          <p className="text-[11px] text-[#1A4B8C] font-semibold">{lang === 'mr' ? referral.departmentMr : referral.departmentEn}</p>
        </div>
      </div>

      {/* Clinical Indication & Reason */}
      <div className="text-xs space-y-1">
        <span className="text-[10px] font-bold uppercase text-[#546E7A]">
          {lang === 'mr' ? 'क्लिनिकल इंडिकेशन व कारण:' : 'Clinical Indication:'}
        </span>
        <p className="text-[#1C2B3A] font-medium leading-relaxed">
          {lang === 'mr' ? referral.primaryReasonMr : referral.primaryReasonEn}
        </p>
        {referral.provisionalDiagnosis && (
          <span className="inline-block text-[11px] text-[#546E7A] bg-slate-100 px-2 py-0.5 rounded font-mono">
            ICD: {referral.provisionalDiagnosis}
          </span>
        )}
      </div>

      {/* Vitals & Transport Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span>BP: <strong className="text-slate-800">{referral.vitalsSummary.bp}</strong></span>
          <span>Pulse: <strong className="text-slate-800">{referral.vitalsSummary.pulse}</strong></span>
          <span>SpO2: <strong className="text-slate-800">{referral.vitalsSummary.spO2}</strong></span>
          {referral.vitalsSummary.sugar && (
            <span>Sugar: <strong className="text-slate-800">{referral.vitalsSummary.sugar}</strong></span>
          )}
        </div>

        {/* Transport Tag */}
        {referral.transportNeeded && referral.transportStatus && (
          <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            <Truck className="w-3.5 h-3.5" />
            <span className="font-semibold">{referral.transportStatus.vehicleNumber}</span>
            <span>({referral.transportStatus.etaMinutes}m ETA)</span>
          </div>
        )}
      </div>

      {/* Doctor Feedback Summary if complete */}
      {referral.feedback && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
          <div className="flex items-center justify-between font-bold text-[11px] text-emerald-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'mr' ? 'तज्ञ डॉक्टरांचा अभिप्राय व काऊंटर-रेफरल:' : 'Specialist Counter-Referral Summary:'}</span>
            </span>
            <span>{referral.feedback.receivingDoctorName}</span>
          </div>
          <p className="text-[11px] text-emerald-900">
            <strong>{lang === 'mr' ? 'निदान:' : 'Diagnosis:'}</strong> {lang === 'mr' ? referral.feedback.finalDiagnosisMr : referral.feedback.finalDiagnosisEn}
          </p>
          <p className="text-[11px] text-emerald-800">
            <strong>{lang === 'mr' ? 'सल्ला:' : 'Advice:'}</strong> {lang === 'mr' ? referral.feedback.counterReferralAdviceMr : referral.feedback.counterReferralAdviceEn}
          </p>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      {showActions && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-lg border border-[#CFD8DC] text-slate-700 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'mr' ? 'स्लिप प्रिंट करा' : 'Print Slip'}</span>
            </button>

            {onSelect && (
              <button
                type="button"
                onClick={() => onSelect(referral)}
                className="px-2.5 py-1.5 rounded-lg border border-blue-200 text-[#1A4B8C] hover:bg-blue-50 text-[11px] font-bold flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'सविस्तर पहा' : 'View Pipeline'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Overdue alert quick action: Call Patient */}
            {referral.isOverdue && referral.stage !== 'COMPLETED' && (
              <a
                href={`tel:${referral.patientPhone}`}
                className="px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                title={lang === 'mr' ? `रुग्णास कॉल करा (${referral.patientPhone})` : `Call Patient (${referral.patientPhone})`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'रुग्णास कॉल' : 'Call Patient'}</span>
              </a>
            )}

            {/* Overdue alert quick action: Alert ASHA */}
            {referral.isOverdue && referral.stage !== 'COMPLETED' && onAlertAsha && (
              <button
                type="button"
                onClick={() => onAlertAsha(referral)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'आशा अलर्ट पाठवा' : 'Alert ASHA'}</span>
              </button>
            )}

            {/* Advance Stage button */}
            {nextStage && onUpdateStage && (
              <button
                type="button"
                onClick={() => onUpdateStage(referral, nextStage)}
                className="px-3 py-1.5 rounded-lg bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <span>{lang === 'mr' ? `टप्पा पुढे: ${STAGE_CONFIGS[nextStage]?.labelMr.split(' (')[0]}` : `Advance to: ${STAGE_CONFIGS[nextStage]?.labelEn}`}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Receiving Doctor Feedback button */}
            {onOpenFeedback && (
              <button
                type="button"
                onClick={() => onOpenFeedback(referral)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{referral.feedback ? (lang === 'mr' ? 'फीडबॅक संपादित करा' : 'Edit Feedback') : (lang === 'mr' ? 'तज्ञ फीडबॅक नोंदवा' : 'Doctor Feedback')}</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
