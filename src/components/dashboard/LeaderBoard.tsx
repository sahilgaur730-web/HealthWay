import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Building2,
  Medal,
  ShieldCheck
} from 'lucide-react';
import { Facility, FACILITY_TYPES } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';

interface LeaderBoardProps {
  facilities: Facility[];
  onSelectFacility: (facility: Facility) => void;
}

export default function LeaderBoard({ facilities, onSelectFacility }: LeaderBoardProps) {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<'top' | 'needs_improvement'>('top');

  // Sorted by score
  const sorted = [...facilities].sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));
  const topPerformers = sorted.slice(0, 4);
  const bottomPerformers = [...sorted].reverse().slice(0, 4);

  const displayList = tab === 'top' ? topPerformers : bottomPerformers;

  return (
    <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F57C00] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'आरोग्य केंद्र क्रमवारी व कामगिरी फलक' : 'Facility Performance Leaderboard'}
            </h3>
          </div>
          <p className="text-xs text-[#546E7A] mt-1">
            {lang === 'mr' 
              ? '६ निकषांवर आधारित अधिकृत मानांकन' 
              : 'Weighted compliance & delivery rankings across district'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTab('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'top'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'सर्वोत्कृष्ट केंद्रे' : 'Top Performers'}</span>
          </button>

          <button
            onClick={() => setTab('needs_improvement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'needs_improvement'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'सुधारणा आवश्यक' : 'Needs Attention'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {displayList.map((fac, idx) => {
          const typeConf = FACILITY_TYPES[fac.type];
          const rank = tab === 'top' ? idx + 1 : sorted.length - idx;
          const score = fac.calculatedScore || 0;
          const isTop3 = tab === 'top' && idx < 3;

          return (
            <div
              key={fac.id}
              onClick={() => onSelectFacility(fac)}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-[#1A4B8C] bg-slate-50/60 hover:bg-white transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  isTop3 && idx === 0 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : isTop3 && idx === 1
                      ? 'bg-slate-200 text-slate-800 border border-slate-300'
                      : isTop3 && idx === 2
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-white text-[#546E7A] border border-slate-200'
                }`}>
                  #{rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#1C2B3A] group-hover:text-[#1A4B8C] transition">
                      {lang === 'mr' ? fac.nameMr : fac.name}
                    </h4>
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{ backgroundColor: typeConf?.badgeBg, color: typeConf?.color }}
                    >
                      {fac.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#546E7A] mt-0.5">
                    {lang === 'mr' ? `तालुका: ${fac.blockMr}` : `Block: ${fac.block}`} · {fac.inCharge}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Trend */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[11px] font-semibold">
                    {fac.performance.trend.startsWith('+') ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {fac.performance.trend}
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        {fac.performance.trend}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'mr' ? 'मागील महिना' : 'vs last mo.'}
                  </span>
                </div>

                {/* Score & Grade */}
                <div className="flex items-center gap-1.5">
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-[#1C2B3A]">
                      {score}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Score
                    </span>
                  </div>

                  <span 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono border"
                    style={{
                      backgroundColor: fac.grade?.bgColor,
                      color: fac.grade?.color,
                      borderColor: fac.grade?.borderColor
                    }}
                  >
                    {fac.grade?.grade}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1A4B8C] group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
