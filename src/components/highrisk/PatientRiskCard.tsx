import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  HeartPulse, 
  Baby, 
  Activity, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Clock, 
  User,
  Plus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { HighRiskPatient } from '../../services/riskEngine';

interface PatientRiskCardProps {
  patient: HighRiskPatient;
  onLogVisit?: (patient: HighRiskPatient) => void;
  onAlertAsha?: (patientId: string) => void;
  onViewHistory?: (patient: HighRiskPatient) => void;
  isNotified?: boolean;
}

export default function PatientRiskCard({
  patient,
  onLogVisit,
  onAlertAsha,
  onViewHistory,
  isNotified = false
}: PatientRiskCardProps) {
  const { lang } = useLanguage();
  const isOverdue = patient.urgency === 'OVERDUE';
  const isCritical = patient.severity === 'CRITICAL';

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
      isOverdue ? 'border-red-300 ring-1 ring-red-200' : 'border-[#CFD8DC] hover:border-[#1A4B8C]/40'
    }`}>
      {/* Card Header: Patient Identity & Status Badges */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#1C2B3A]">
              {lang === 'mr' ? patient.nameMr : patient.nameEn}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isOverdue 
                ? 'bg-red-100 text-red-700' 
                : patient.urgency === 'DUE_TODAY'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-[#1A4B8C]'
            }`}>
              {patient.urgency.replace('_', ' ')}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isCritical ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {patient.severity}
            </span>
          </div>
          <p className="text-xs text-[#546E7A] mt-0.5">
            {lang === 'mr' ? patient.categoryLabelMr : patient.categoryLabelEn} · वय: {patient.age} वर्षे
          </p>
        </div>

        <span className="font-mono text-xs text-[#78909C] bg-slate-100 px-2 py-0.5 rounded">
          {patient.id}
        </span>
      </div>

      {/* Clinical Risk Factors */}
      <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs text-red-950 font-medium space-y-1">
        <span className="text-[10px] uppercase font-bold text-red-800 block">
          {lang === 'mr' ? 'क्लिनिकल जोखीम घटक:' : 'Clinical Risk Factors:'}
        </span>
        <ul className="space-y-0.5">
          {(lang === 'mr' ? patient.clinicalRiskFactorsMr : patient.clinicalRiskFactorsEn).map((rf, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{rf}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Assigned Staff & Next Follow-Up */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-[#CFD8DC]/70">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#78909C] block">
            {lang === 'mr' ? 'आशा कार्यकर्ती:' : 'Assigned ASHA:'}
          </span>
          <strong className="text-[#1C2B3A]">{patient.assignedAshaName}</strong>
          <div className="text-[11px] text-[#546E7A]">{patient.village}</div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#78909C] block">
            {lang === 'mr' ? 'पुढील पाठपुरावा तारीख:' : 'Next Follow-Up:'}
          </span>
          <strong className={`font-mono ${isOverdue ? 'text-red-700' : 'text-[#1A4B8C]'}`}>
            {patient.nextFollowUpDate}
          </strong>
          <div className="text-[11px] text-[#546E7A]">
            {isOverdue 
              ? (lang === 'mr' ? `${patient.daysOverdue} दिवस थकीत!` : `${patient.daysOverdue} days overdue!`)
              : (lang === 'mr' ? 'शेड्यूलनुसार' : 'On Schedule')}
          </div>
        </div>
      </div>

      {/* Vitals Snapshot and Adherence */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#546E7A]">
            {lang === 'mr' ? 'औषध नियमितता:' : 'Compliance:'}
          </span>
          <span className={`font-mono font-bold ${
            patient.adherencePercentage < 60 ? 'text-red-700' : 'text-green-700'
          }`}>
            {patient.adherencePercentage}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onViewHistory && (
            <button
              onClick={() => onViewHistory(patient)}
              className="px-2.5 py-1 text-xs font-bold text-[#1A4B8C] hover:bg-blue-50 rounded-lg transition"
            >
              {lang === 'mr' ? 'इतिहास पहा' : 'View History'}
            </button>
          )}

          {onLogVisit && (
            <button
              onClick={() => onLogVisit(patient)}
              className="px-3 py-1.5 bg-[#1A4B8C] hover:bg-[#0D3470] text-white rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'भेट नोंदवा' : 'Log Visit'}</span>
            </button>
          )}

          {onAlertAsha && (
            <button
              onClick={() => onAlertAsha(patient.id)}
              className="px-3 py-1.5 bg-[#E8F0FE] hover:bg-blue-100 text-[#1A4B8C] font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isNotified 
                  ? (lang === 'mr' ? 'अलर्ट पाठवला!' : 'Alert Sent!') 
                  : (lang === 'mr' ? 'आशा अलर्ट' : 'Alert ASHA')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
