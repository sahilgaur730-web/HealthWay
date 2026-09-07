import React from 'react';
import { 
  Building2, 
  Hospital, 
  PhoneCall, 
  Users, 
  Pill, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Stethoscope,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { Facility, FACILITY_TYPES } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';

interface FacilityCardProps {
  facility: Facility;
  onSelect: (facility: Facility) => void;
}

export default function FacilityCard({ facility, onSelect }: FacilityCardProps) {
  const { lang } = useLanguage();

  const typeConfig = FACILITY_TYPES[facility.type] || FACILITY_TYPES.PHC;
  const grade = facility.grade;
  const score = facility.calculatedScore ?? facility.performance.score ?? 0;

  // Calculate sync age text
  const getSyncAge = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 5) return lang === 'mr' ? 'आत्ताच' : 'Just now';
    if (diffMins < 60) return lang === 'mr' ? `${diffMins} मि. पूर्वी` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return lang === 'mr' ? `${diffHours} तास पूर्वी` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return lang === 'mr' ? `${diffDays} दिवस पूर्वी` : `${diffDays}d ago`;
  };

  const consultTargetPct = Math.round(
    (facility.metrics.consultationsToday / (facility.metrics.consultationsTarget || 1)) * 100
  );

  const staffPct = Math.round(
    (facility.staffPresent / (facility.staffTotal || 1)) * 100
  );

  return (
    <div 
      onClick={() => onSelect(facility)}
      className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm hover:border-[#1A4B8C] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ 
                backgroundColor: typeConfig.badgeBg, 
                color: typeConfig.color,
                borderColor: `${typeConfig.color}33`
              }}
            >
              {facility.type === 'DH' || facility.type === 'SDH' ? (
                <Hospital className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#1C2B3A] group-hover:text-[#1A4B8C] transition">
                  {lang === 'mr' ? facility.nameMr : facility.name}
                </h3>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                  style={{ 
                    backgroundColor: typeConfig.badgeBg, 
                    color: typeConfig.color 
                  }}
                >
                  {facility.type}
                </span>
              </div>

              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' ? `तालुका: ${facility.blockMr}` : `Block: ${facility.block}`}
                <span className="mx-1.5 text-slate-300">|</span>
                <span className="font-mono text-[11px] text-slate-500">{facility.id}</span>
              </p>
            </div>
          </div>

          {/* Performance Grade and Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1.5">
              <span 
                className="text-xs font-black px-2 py-0.5 rounded-lg border font-mono shadow-xs"
                style={{
                  backgroundColor: grade?.bgColor || '#F1F5F9',
                  color: grade?.color || '#1C2B3A',
                  borderColor: grade?.borderColor || '#CFD8DC'
                }}
              >
                Grade {grade?.grade || 'N/A'}
              </span>
              <span className="text-sm font-black font-mono text-[#1C2B3A]">
                {score}
                <span className="text-[10px] font-normal text-[#546E7A]">/100</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-medium text-[#546E7A] mt-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{getSyncAge(facility.lastDataSync)}</span>
            </div>
          </div>
        </div>

        {/* In-Charge Details */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#546E7A]">
          <div className="truncate pr-2">
            <span className="text-[11px] text-slate-400 font-medium mr-1">
              {lang === 'mr' ? 'प्रभारी:' : 'In-Charge:'}
            </span>
            <span className="font-semibold text-[#1C2B3A]">
              {lang === 'mr' ? facility.inChargeMr : facility.inCharge}
            </span>
          </div>

          <a 
            href={`tel:${facility.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[#1A4B8C] font-mono font-medium hover:underline text-[11px] shrink-0"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{facility.phone}</span>
          </a>
        </div>

        {/* 4 Mini KPI Gauges */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          {/* Consultations */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-[#546E7A] text-[10px] uppercase font-bold">
              <span>{lang === 'mr' ? 'ओपीडी' : 'Consults'}</span>
              <Stethoscope className="w-3 h-3 text-[#1A4B8C]" />
            </div>
            <div className="text-sm font-black font-mono text-[#1C2B3A] mt-1">
              {facility.metrics.consultationsToday}
              <span className="text-[10px] font-normal text-[#546E7A]">/{facility.metrics.consultationsTarget}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  consultTargetPct >= 90 ? 'bg-emerald-600' : consultTargetPct >= 60 ? 'bg-blue-600' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(consultTargetPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Staff Attendance */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-[#546E7A] text-[10px] uppercase font-bold">
              <span>{lang === 'mr' ? 'कर्मचारी' : 'Staff'}</span>
              <Users className="w-3 h-3 text-[#1A4B8C]" />
            </div>
            <div className="text-sm font-black font-mono text-[#1C2B3A] mt-1">
              {facility.staffPresent}
              <span className="text-[10px] font-normal text-[#546E7A]">/{facility.staffTotal}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  staffPct >= 85 ? 'bg-emerald-600' : staffPct >= 70 ? 'bg-blue-600' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(staffPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Stock Out Alert */}
          <div className={`p-2.5 rounded-xl border ${
            facility.metrics.medicinesOutOfStock > 0 
              ? 'bg-rose-50/70 border-rose-100' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center justify-between text-[#546E7A] text-[10px] uppercase font-bold">
              <span>{lang === 'mr' ? 'साठा संपला' : 'Out of Stock'}</span>
              <Pill className={`w-3 h-3 ${facility.metrics.medicinesOutOfStock > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            </div>
            <div className={`text-sm font-black font-mono mt-1 ${
              facility.metrics.medicinesOutOfStock > 0 ? 'text-rose-700' : 'text-[#1C2B3A]'
            }`}>
              {facility.metrics.medicinesOutOfStock}
              <span className="text-[10px] font-normal text-[#546E7A]"> {lang === 'mr' ? 'औषधे' : 'items'}</span>
            </div>
            <div className="text-[10px] font-medium text-[#546E7A] mt-1.5 truncate">
              {facility.metrics.medicinesOutOfStock === 0 ? (
                <span className="text-emerald-700 font-semibold">{lang === 'mr' ? 'पूर्ण उपलब्ध' : 'Adequate'}</span>
              ) : (
                <span className="text-rose-700 font-semibold">{lang === 'mr' ? 'तुटवडा' : 'Deficit'}</span>
              )}
            </div>
          </div>

          {/* High Risk Overdue */}
          <div className={`p-2.5 rounded-xl border ${
            facility.metrics.overdueFollowUps > 0 
              ? 'bg-amber-50/70 border-amber-100' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center justify-between text-[#546E7A] text-[10px] uppercase font-bold">
              <span>{lang === 'mr' ? 'प्रलंबित' : 'Overdue HR'}</span>
              <AlertTriangle className={`w-3 h-3 ${facility.metrics.overdueFollowUps > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <div className={`text-sm font-black font-mono mt-1 ${
              facility.metrics.overdueFollowUps > 0 ? 'text-amber-700' : 'text-[#1C2B3A]'
            }`}>
              {facility.metrics.overdueFollowUps}
              <span className="text-[10px] font-normal text-[#546E7A]">/{facility.metrics.highRiskPatients}</span>
            </div>
            <div className="text-[10px] font-medium text-[#546E7A] mt-1.5 truncate">
              {facility.metrics.overdueFollowUps === 0 ? (
                <span className="text-emerald-700 font-semibold">{lang === 'mr' ? 'सर्व तपासणी पूर्ण' : 'Up to date'}</span>
              ) : (
                <span className="text-amber-800 font-semibold">{lang === 'mr' ? 'फॉलो-अप आवश्यक' : 'Action needed'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner if any */}
      {facility.alerts && facility.alerts.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span className="truncate font-semibold text-[11px]">
              {lang === 'mr' ? facility.alerts[0].messageMr : facility.alerts[0].messageEn}
            </span>
            {facility.alerts.length > 1 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-800 shrink-0">
                +{facility.alerts.length - 1}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Action Hint */}
      <div className="mt-3.5 flex items-center justify-between text-xs text-[#546E7A] pt-2 border-t border-slate-100">
        <span className="text-[11px] font-medium">
          {lang === 'mr' ? 'मासिक तपासण्या: ' : 'Monthly Total: '}
          <strong className="text-[#1C2B3A] font-mono">{facility.metrics.consultationsMonth.toLocaleString()}</strong>
        </span>

        <span className="text-[11px] font-bold text-[#1A4B8C] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>{lang === 'mr' ? 'तपशील पहा' : 'View Details'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
