import React, { useMemo } from 'react';
import { Calendar, Clock, User, CheckCircle2, AlertTriangle, PhoneCall, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { RiskEngineService, HighRiskPatient } from '../../services/riskEngine';

interface FollowUpScheduleProps {
  onSelectPatient?: (patient: HighRiskPatient) => void;
}

export default function FollowUpSchedule({ onSelectPatient }: FollowUpScheduleProps) {
  const { lang } = useLanguage();
  const patients = useMemo(() => RiskEngineService.getPatients(), []);

  // Group patients by urgency/date
  const groupedSchedule = useMemo(() => {
    const overdue = patients.filter(p => p.urgency === 'OVERDUE');
    const dueToday = patients.filter(p => p.urgency === 'DUE_TODAY');
    const dueSoon = patients.filter(p => p.urgency === 'DUE_SOON');
    const dueWeek = patients.filter(p => p.urgency === 'DUE_WEEK');
    const onTrack = patients.filter(p => p.urgency === 'ON_TRACK');
    return { overdue, dueToday, dueSoon, dueWeek, onTrack };
  }, [patients]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'उच्च जोखीम रुग्ण पाठपुरावा दिनदर्शिका' : 'High-Risk Follow-Up Master Schedule'}
            </h3>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr'
                ? 'प्राधान्यक्रमानुसार दैनंदिन व साप्ताहिक गृहभेटींचे नियोजन'
                : 'Chronological home visits and clinic appointments organized by clinical urgency'}
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Section */}
      {groupedSchedule.overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
              {lang === 'mr' ? `थकीत भेटी (${groupedSchedule.overdue.length})` : `Overdue Follow-Ups (${groupedSchedule.overdue.length})`}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedSchedule.overdue.map(pt => (
              <div 
                key={pt.id}
                onClick={() => onSelectPatient && onSelectPatient(pt)}
                className="p-4 rounded-xl border border-red-200 bg-red-50/20 hover:border-red-400 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#1C2B3A]">{lang === 'mr' ? pt.nameMr : pt.nameEn}</strong>
                  <span className="font-mono text-xs font-bold text-red-700">
                    {pt.daysOverdue} {lang === 'mr' ? 'दिवस थकीत' : 'days overdue'}
                  </span>
                </div>
                <div className="text-[11px] text-[#546E7A] flex items-center justify-between">
                  <span>{lang === 'mr' ? pt.categoryLabelMr : pt.categoryLabelEn}</span>
                  <span>{pt.village} · {pt.assignedAshaName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      {groupedSchedule.dueToday.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">
              {lang === 'mr' ? `आजच्या नियोजित भेटी (${groupedSchedule.dueToday.length})` : `Due Today (${groupedSchedule.dueToday.length})`}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedSchedule.dueToday.map(pt => (
              <div 
                key={pt.id}
                onClick={() => onSelectPatient && onSelectPatient(pt)}
                className="p-4 rounded-xl border border-orange-200 bg-orange-50/20 hover:border-orange-400 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#1C2B3A]">{lang === 'mr' ? pt.nameMr : pt.nameEn}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 uppercase">
                    {lang === 'mr' ? 'आज देय' : 'Today'}
                  </span>
                </div>
                <div className="text-[11px] text-[#546E7A] flex items-center justify-between">
                  <span>{lang === 'mr' ? pt.categoryLabelMr : pt.categoryLabelEn}</span>
                  <span>{pt.village} · {pt.assignedAshaName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Soon (1-3 days) & Due This Week */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <h4 className="text-xs font-bold text-[#1A4B8C] uppercase tracking-wider">
            {lang === 'mr' ? 'पुढील ७ दिवसांतील नियोजित भेटी' : 'Upcoming Follow-Ups (Next 7 Days)'}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...groupedSchedule.dueSoon, ...groupedSchedule.dueWeek].map(pt => (
            <div 
              key={pt.id}
              onClick={() => onSelectPatient && onSelectPatient(pt)}
              className="p-4 rounded-xl border border-[#CFD8DC] bg-white hover:border-[#1A4B8C]/50 transition cursor-pointer space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <strong className="text-xs text-[#1C2B3A]">{lang === 'mr' ? pt.nameMr : pt.nameEn}</strong>
                <span className="font-mono text-xs text-[#1A4B8C] font-bold">
                  {pt.nextFollowUpDate}
                </span>
              </div>
              <div className="text-[11px] text-[#546E7A] flex items-center justify-between">
                <span>{lang === 'mr' ? pt.categoryLabelMr : pt.categoryLabelEn}</span>
                <span>{pt.village} · {pt.assignedAshaName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
