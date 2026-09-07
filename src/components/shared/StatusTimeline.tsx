import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Send, 
  Hospital, 
  Truck, 
  MapPin, 
  Bed, 
  FileCheck2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ReferralStage, StageHistoryItem, STAGES_ORDER, STAGE_CONFIGS } from '../../services/referralService';

interface StatusTimelineProps {
  currentStage: ReferralStage;
  stageHistory?: StageHistoryItem[];
  isOverdue?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'responsive';
}

export default function StatusTimeline({
  currentStage,
  stageHistory = [],
  isOverdue = false,
  orientation = 'responsive'
}: StatusTimelineProps) {
  const { lang } = useLanguage();

  const getStageIcon = (stage: ReferralStage, isCompleted: boolean, isActive: boolean) => {
    if (isCompleted) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (stage === 'OVERDUE') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (stage === 'CANCELLED') return <XCircle className="w-4 h-4 text-slate-500" />;

    switch (stage) {
      case 'CREATED':
        return <Clock className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      case 'NOTIFIED':
        return <Send className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      case 'ACCEPTED':
        return <Hospital className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      case 'IN_TRANSIT':
        return <Truck className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      case 'REACHED':
        return <MapPin className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      case 'ADMITTED':
        return <Bed className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      case 'COMPLETED':
        return <FileCheck2 className={`w-4 h-4 ${isActive ? 'text-[#1A4B8C]' : 'text-slate-400'}`} />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const currentStageIndex = STAGES_ORDER.indexOf(currentStage);

  return (
    <div className="w-full space-y-4">
      {/* Overdue Banner if overdue */}
      {isOverdue && currentStage !== 'COMPLETED' && currentStage !== 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 text-red-800 text-xs font-semibold animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold">
              {lang === 'mr' ? 'तातडीचा इशारा: रेफरल मुदत संपली आहे (Overdue)' : 'URGENT ALERT: Referral Threshold Overdue'}
            </p>
            <p className="text-[11px] text-red-700 font-normal">
              {lang === 'mr' 
                ? 'नियोजित वेळेत रुग्ण पोहोचला नाही किंवा स्वीकृती नोंदवली गेली नाही. तात्काळ संपर्क करा.' 
                : 'Elapsed hours exceeded urgency maxHours. ASHA alert & patient follow-up required.'}
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Pipeline View for Desktops */}
      <div className={`${orientation === 'vertical' ? 'hidden' : orientation === 'horizontal' ? 'block' : 'hidden lg:block'} bg-white p-5 rounded-2xl border border-[#CFD8DC] shadow-xs`}>
        <div className="relative flex items-center justify-between">
          {/* Connector Line Background */}
          <div className="absolute left-6 right-6 top-5 h-1 bg-slate-200 -z-0" />
          
          {/* Active Progress Connector */}
          <div 
            className="absolute left-6 top-5 h-1 bg-[#1A4B8C] transition-all duration-500 -z-0"
            style={{ 
              width: `${Math.max(0, Math.min(100, (currentStageIndex / (STAGES_ORDER.length - 1)) * 100))}%` 
            }}
          />

          {STAGES_ORDER.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isActive = currentStage === stage;
            const isFuture = currentStageIndex < idx;
            const cfg = STAGE_CONFIGS[stage];
            const historyItem = stageHistory.find(h => h.stage === stage);

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center group max-w-[110px] text-center">
                {/* Node Circle */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-xs ${
                    isCompleted 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                      : isActive 
                        ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white ring-4 ring-blue-100 scale-110' 
                        : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Stage Label */}
                <span className={`mt-2 text-[11px] font-bold leading-tight line-clamp-2 ${
                  isActive ? 'text-[#1A4B8C]' : isCompleted ? 'text-emerald-800' : 'text-slate-500'
                }`}>
                  {lang === 'mr' ? cfg.labelMr.split(' (')[0] : cfg.labelEn}
                </span>

                {/* Timestamp if logged */}
                {historyItem && (
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-none">
                    {historyItem.timestamp}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Timeline View for Mobile / Sidebars */}
      <div className={`${orientation === 'horizontal' ? 'hidden' : orientation === 'vertical' ? 'block' : 'block lg:hidden'} bg-white p-5 rounded-2xl border border-[#CFD8DC] shadow-xs`}>
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {STAGES_ORDER.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isActive = currentStage === stage;
            const cfg = STAGE_CONFIGS[stage];
            const historyItem = stageHistory.find(h => h.stage === stage);

            return (
              <div key={stage} className="relative">
                {/* Bullet */}
                <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white ${
                  isCompleted 
                    ? 'border-emerald-600 text-emerald-600' 
                    : isActive 
                      ? 'border-[#1A4B8C] text-[#1A4B8C] ring-4 ring-blue-50' 
                      : 'border-slate-300 text-slate-400'
                }`}>
                  {getStageIcon(stage, isCompleted, isActive)}
                </div>

                {/* Content */}
                <div className={`p-3 rounded-xl border text-xs ${
                  isActive 
                    ? 'bg-blue-50/60 border-blue-200' 
                    : isCompleted 
                      ? 'bg-slate-50/70 border-slate-200' 
                      : 'bg-slate-50/30 border-dashed border-slate-200 opacity-70'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold ${isActive ? 'text-[#1A4B8C]' : 'text-slate-800'}`}>
                      {idx + 1}. {lang === 'mr' ? cfg.labelMr : cfg.labelEn}
                    </span>
                    {historyItem && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {historyItem.timestamp}
                      </span>
                    )}
                  </div>
                  {historyItem && (
                    <p className="text-[11px] text-slate-600 mt-1">
                      {lang === 'mr' ? historyItem.notesMr : historyItem.notesEn}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
