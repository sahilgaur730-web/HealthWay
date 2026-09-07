import React, { useMemo } from 'react';
import { 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  HeartPulse, 
  Baby, 
  Clock, 
  Building2,
  TrendingUp,
  Award
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { RiskEngineService, ClinicalRiskCategory } from '../../services/riskEngine';

export default function RiskAnalytics() {
  const { lang } = useLanguage();
  const analytics = useMemo(() => RiskEngineService.getAnalytics(), []);
  const patients = useMemo(() => RiskEngineService.getPatients(), []);

  const cohortLabels: Record<ClinicalRiskCategory, { en: string; mr: string; color: string }> = {
    PREGNANT: { en: 'High-Risk ANC', mr: 'उच्च जोखीम गरोदरपण', color: 'bg-amber-500' },
    NEWBORN: { en: 'High-Risk Infant', mr: 'कमी वजन बालक (LBW)', color: 'bg-blue-500' },
    DIABETES: { en: 'Type 2 Diabetes', mr: 'अनियंत्रित मधुमेह', color: 'bg-red-500' },
    HYPERTENSION: { en: 'Severe HTN', mr: 'तीव्र उच्च रक्तदाब', color: 'bg-purple-500' },
    TUBERCULOSIS: { en: 'TB DOTS', mr: 'क्षयरोग (TB DOTS)', color: 'bg-emerald-600' },
    MENTAL_HEALTH: { en: 'Mental Health', mr: 'मानसोपचार व फेफरे', color: 'bg-indigo-500' },
    MALNUTRITION: { en: 'Pediatric SAM', mr: 'अति-तीव्र कुपोषण', color: 'bg-rose-600' }
  };

  return (
    <div className="space-y-6">

      {/* Top 4 Metric Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#CFD8DC] p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
            {lang === 'mr' ? 'सक्रिय दक्षता रुग्ण' : 'Total Monitored Cohort'}
          </span>
          <div className="text-2xl font-black text-[#1C2B3A] font-mono">{analytics.total}</div>
          <span className="text-[10px] text-[#78909C]">शिरूर ब्लॉक (Shirur)</span>
        </div>

        <div className="bg-white rounded-xl border border-[#CFD8DC] p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
            {lang === 'mr' ? 'सरासरी औषध नियमितता' : 'Avg Adherence Rate'}
          </span>
          <div className="text-2xl font-black text-green-700 font-mono">{analytics.avgAdherence}%</div>
          <span className="text-[10px] text-green-800">{lang === 'mr' ? 'लक्ष्य: > ८५%' : 'Target: > 85%'}</span>
        </div>

        <div className="bg-white rounded-xl border border-red-200 bg-red-50/20 p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-red-700 block">
            {lang === 'mr' ? 'थकीत भेटी (Overdue)' : 'Overdue Follow-ups'}
          </span>
          <div className="text-2xl font-black text-red-700 font-mono">{analytics.overdue}</div>
          <span className="text-[10px] text-red-800 font-medium">तातडीची ASHA भेट आवश्यक</span>
        </div>

        <div className="bg-white rounded-xl border border-orange-200 bg-orange-50/20 p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-orange-700 block">
            {lang === 'mr' ? 'अति-तीव्र केसेस' : 'Critical Severity Cases'}
          </span>
          <div className="text-2xl font-black text-orange-700 font-mono">{analytics.critical}</div>
          <span className="text-[10px] text-orange-800 font-medium">डॉक्टर देखरेख</span>
        </div>
      </div>

      {/* Cohort Breakdown & Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'क्लिनिकल जोखीम प्रवर्ग वर्गीकरण' : 'Clinical Risk Distribution'}
            </h4>
            <span className="text-xs text-[#546E7A]">{analytics.total} {lang === 'mr' ? 'रुग्ण' : 'patients'}</span>
          </div>

          <div className="space-y-3">
            {(Object.keys(analytics.categoryCounts) as ClinicalRiskCategory[]).map((cat) => {
              const count = analytics.categoryCounts[cat] || 0;
              const percent = Math.round((count / (analytics.total || 1)) * 100);
              const label = cohortLabels[cat];

              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C2B3A]">
                      {lang === 'mr' ? label.mr : label.en}
                    </span>
                    <span className="font-mono text-[#546E7A]">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${label.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escalation Rules & Village Coverage */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-[#1C2B3A]">
            {lang === 'mr' ? 'स्वयंचलित पाठपुरावा व अलर्ट प्रणाली' : 'Automated Escalation Protocol'}
          </h4>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-[#CFD8DC]/70 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1A4B8C] font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="text-xs">
                <strong className="text-[#1C2B3A] block">
                  {lang === 'mr' ? '१ दिवस थकीत — आशा कार्यकर्तीला एसएमएस' : 'Day 1 Overdue — ASHA Push Alert'}
                </strong>
                <span className="text-[#546E7A]">
                  {lang === 'mr' 
                    ? 'आशा कार्यकर्तीच्या मोबाईलवर रुग्णाचा पत्ता व तातडीची भेट नोंदवण्याची सूचना जाते.' 
                    : 'Instant notification dispatched to assigned ASHA worker to conduct priority home visit.'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="text-xs">
                <strong className="text-amber-900 block">
                  {lang === 'mr' ? '३ दिवस थकीत — प्राथमिक आरोग्य केंद्र वैद्यकीय अधिकारी' : 'Day 3 Overdue — PHC Medical Officer'}
                </strong>
                <span className="text-[#546E7A]">
                  {lang === 'mr'
                    ? 'वैद्यकीय अधिकारी डॉ. देशमुख यांना थेट अलर्ट; आरोग्य सहाय्यकास प्रत्यक्ष चौकशीसाठी पाठवले जाते.'
                    : 'Alert escalates to PHC Medical Officer to mobilize health supervisor and review case.'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                7
              </div>
              <div className="text-xs">
                <strong className="text-red-900 block">
                  {lang === 'mr' ? '७ दिवस थकीत — तालुका व जिल्हा शल्यचिकित्सक' : 'Day 7 Overdue — Taluka / District Admin'}
                </strong>
                <span className="text-[#546E7A]">
                  {lang === 'mr'
                    ? '१०८ रुग्णवाहिका किंवा विशेष पथक पाठवून रुग्णास रुग्णालयात दाखल करण्याचा आदेश निघतो.'
                    : 'Red-flag critical intervention: Mobilize 108 emergency vehicle or outreach team.'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
