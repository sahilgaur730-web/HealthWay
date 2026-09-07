import { UrgencyLevel, ReferralStage, URGENCY_CONFIGS, STAGE_CONFIGS } from '../services/referralService';
import { TestOrderStatus, TestPriority } from '../services/diagnosticService';

export function getUrgencyBadge(urgency: UrgencyLevel, lang: 'mr' | 'en' | 'hi' = 'en') {
  const cfg = URGENCY_CONFIGS[urgency] || URGENCY_CONFIGS.ROUTINE;
  return {
    label: lang === 'mr' ? cfg.labelMr : cfg.labelEn,
    className: cfg.badgeClass,
    maxHours: cfg.maxHours,
  };
}

export function getStageBadge(stage: ReferralStage, lang: 'mr' | 'en' | 'hi' = 'en') {
  const cfg = STAGE_CONFIGS[stage] || STAGE_CONFIGS.CREATED;
  let color = 'bg-slate-100 text-slate-700 border-slate-300';

  if (stage === 'COMPLETED') {
    color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (stage === 'IN_TRANSIT' || stage === 'REACHED' || stage === 'ADMITTED') {
    color = 'bg-blue-100 text-[#1A4B8C] border-blue-300';
  } else if (stage === 'OVERDUE') {
    color = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
  } else if (stage === 'ACCEPTED' || stage === 'NOTIFIED') {
    color = 'bg-purple-100 text-purple-800 border-purple-300';
  }

  return {
    label: lang === 'mr' ? cfg.labelMr : cfg.labelEn,
    stepNumber: cfg.stepNumber,
    className: color,
  };
}

export function getDiagnosticStatusBadge(status: TestOrderStatus, lang: 'mr' | 'en' | 'hi' = 'en') {
  switch (status) {
    case 'COMPLETED':
      return {
        label: lang === 'mr' ? 'अहवाल तयार व प्रमाणित' : lang === 'hi' ? 'रिपोर्ट तैयार व प्रमाणित' : 'Completed & NABL Verified',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'PROCESSING':
      return {
        label: lang === 'mr' ? 'लॅबमध्ये विश्लेषण सुरू' : lang === 'hi' ? 'लैब में विश्लेषण जारी' : 'Processing on Analyzer',
        className: 'bg-blue-100 text-[#1A4B8C] border-blue-300',
      };
    case 'IN_TRANSIT':
      return {
        label: lang === 'mr' ? 'नमुना लॅबकडे वाहतुकीत' : lang === 'hi' ? 'सैंपल लैब परिवहन में' : 'Sample In Transit (Cold Chain)',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      };
    case 'SAMPLE_COLLECTED':
      return {
        label: lang === 'mr' ? 'नमुना गोळा केला' : lang === 'hi' ? 'सैंपल एकत्र किया गया' : 'Sample Collected',
        className: 'bg-purple-100 text-purple-800 border-purple-300',
      };
    case 'ORDERED':
    default:
      return {
        label: lang === 'mr' ? 'ऑर्डर नोंदवली' : lang === 'hi' ? 'ऑर्डर दर्ज किया गया' : 'Order Requisitioned',
        className: 'bg-amber-100 text-amber-800 border-amber-300',
      };
  }
}

export function getPriorityBadge(priority: TestPriority, lang: 'mr' | 'en' | 'hi' = 'en') {
  switch (priority) {
    case 'STAT':
      return {
        label: lang === 'mr' ? 'तातडीचे (STAT <२ तास)' : lang === 'hi' ? 'अति आवश्यक (STAT <२ घंटे)' : 'STAT (<2h Immediate)',
        className: 'bg-red-100 text-red-800 border-red-300 font-bold',
      };
    case 'URGENT':
      return {
        label: lang === 'mr' ? 'प्राधान्य (Urgent <६ तास)' : lang === 'hi' ? 'प्राथमिकता (Urgent <६ घंटे)' : 'Urgent (<6h)',
        className: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      };
    case 'ROUTINE':
    default:
      return {
        label: lang === 'mr' ? 'नियमित (२४-४८ तास)' : lang === 'hi' ? 'सामान्य (२४-४८ घंटे)' : 'Routine (24-48h)',
        className: 'bg-blue-100 text-blue-800 border-blue-300',
      };
  }
}

export function formatRelativeHours(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHrs = Math.floor(diffMs / (3600 * 1000));
  const diffMins = Math.floor((diffMs % (3600 * 1000)) / 60000);

  if (diffHrs <= 0) {
    return `${diffMins} मिनिटांपूर्वी (${diffMins}m ago)`;
  }
  return `${diffHrs} तास ${diffMins} मि. पूर्वी (${diffHrs}h ${diffMins}m ago)`;
}
