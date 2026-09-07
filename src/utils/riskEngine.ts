// Risk Engine & High-Risk Patient Tracking Utility — Rural Healthcare Access Platform
// Zero unicode emojis: pure Lucide icon identifiers and Maharashtra NHM clinical rules

export interface RiskCategoryConfig {
  id: string;
  label: string;
  labelMr: string;
  color: string;
  bgColor: string;
  iconName: string;
  followUpIntervalDays: number;
  criticalVitals: string[];
}

export const RISK_CATEGORIES: Record<string, RiskCategoryConfig> = {
  PREGNANT: {
    id: 'PREGNANT',
    label: 'High-Risk Pregnancy (ANC)',
    labelMr: 'उच्च जोखीम गरोदरपण (ANC)',
    color: '#BE185D',
    bgColor: '#FCE7F3',
    iconName: 'HeartPulse',
    followUpIntervalDays: 7,
    criticalVitals: ['BP', 'Hb', 'Fetal Movement', 'Pedal Edema']
  },
  NEWBORN: {
    id: 'NEWBORN',
    label: 'High-Risk Infant / LBW',
    labelMr: 'कमी वजन बालक व नवजात (LBW)',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    iconName: 'Baby',
    followUpIntervalDays: 7,
    criticalVitals: ['Weight', 'Temperature', 'Suckling Reflex', 'Immunization']
  },
  DIABETES: {
    id: 'DIABETES',
    label: 'Uncontrolled Diabetes',
    labelMr: 'अनियंत्रित मधुमेह (Type 2)',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    iconName: 'Activity',
    followUpIntervalDays: 14,
    criticalVitals: ['Fasting Glucose', 'PP Glucose', 'Foot Inspection', 'BP']
  },
  HYPERTENSION: {
    id: 'HYPERTENSION',
    label: 'Severe Hypertension',
    labelMr: 'तीव्र उच्च रक्तदाब',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    iconName: 'HeartPulse',
    followUpIntervalDays: 14,
    criticalVitals: ['Systolic BP', 'Diastolic BP', 'Chest Symptoms', 'Pulse']
  },
  TUBERCULOSIS: {
    id: 'TUBERCULOSIS',
    label: 'Tuberculosis (TB DOTS)',
    labelMr: 'क्षयरोग (TB DOTS)',
    color: '#059669',
    bgColor: '#ECFDF5',
    iconName: 'ShieldAlert',
    followUpIntervalDays: 3,
    criticalVitals: ['Dose Compliance', 'Cough Severity', 'Weight', 'Sputum Status']
  },
  MENTAL_HEALTH: {
    id: 'MENTAL_HEALTH',
    label: 'Mental Health & Epilepsy',
    labelMr: 'मानसोपचार व फेफरे',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    iconName: 'Activity',
    followUpIntervalDays: 14,
    criticalVitals: ['Seizure Frequency', 'Sleep Pattern', 'Medication Compliance']
  },
  MALNUTRITION: {
    id: 'MALNUTRITION',
    label: 'Pediatric SAM / MAM',
    labelMr: 'अति-तीव्र बाल कुपोषण',
    color: '#D97706',
    bgColor: '#FEF3C7',
    iconName: 'AlertTriangle',
    followUpIntervalDays: 7,
    criticalVitals: ['MUAC (mm)', 'Weight-for-Height', 'Bilateral Edema', 'Appetite Test']
  }
};

export interface UrgencyLevelConfig {
  id: string;
  label: string;
  labelMr: string;
  color: string;
  bgColor: string;
  priorityRank: number;
}

export const URGENCY_LEVELS: Record<string, UrgencyLevelConfig> = {
  OVERDUE: {
    id: 'OVERDUE',
    label: 'Overdue',
    labelMr: 'थकीत',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    priorityRank: 1
  },
  DUE_TODAY: {
    id: 'DUE_TODAY',
    label: 'Due Today',
    labelMr: 'आज देय',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    priorityRank: 2
  },
  DUE_SOON: {
    id: 'DUE_SOON',
    label: 'Due Soon (1-3 Days)',
    labelMr: 'लवकर (१-३ दिवस)',
    color: '#D97706',
    bgColor: '#FEF3C7',
    priorityRank: 3
  },
  DUE_WEEK: {
    id: 'DUE_WEEK',
    label: 'Due This Week',
    labelMr: 'या आठवड्यात देय',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    priorityRank: 4
  },
  ON_TRACK: {
    id: 'ON_TRACK',
    label: 'On Track',
    labelMr: 'वेळापत्रकानुसार',
    color: '#16A34A',
    bgColor: '#D1FAE5',
    priorityRank: 5
  }
};

export const ESCALATION_RULES = [
  {
    day: 1,
    titleEn: 'Day 1 Overdue — ASHA Worker Push Alert',
    titleMr: '१ दिवस थकीत — आशा कार्यकर्तीला एसएमएस अलर्ट',
    actionEn: 'Automated SMS and mobile notification dispatched to assigned ASHA worker to conduct immediate home visit.',
    actionMr: 'आशा कार्यकर्तीच्या मोबाईलवर तात्काळ गृहभेट घेण्याचा संदेश पाठवला जातो.'
  },
  {
    day: 3,
    titleEn: 'Day 3 Overdue — PHC Medical Officer Escalation',
    titleMr: '३ दिवस थकीत — प्राथमिक आरोग्य केंद्र वैद्यकीय अधिकारी अलर्ट',
    actionEn: 'Alert escalates to PHC Medical Officer to mobilize Health Supervisor and initiate telephonic tracking.',
    actionMr: 'वैद्यकीय अधिकाऱ्यांकडे अलर्ट जातो; आरोग्य सहाय्यकास प्रत्यक्ष चौकशीसाठी पाठवले जाते.'
  },
  {
    day: 7,
    titleEn: 'Day 7 Overdue — District Health Officer Critical Action',
    titleMr: '७ दिवस थकीत — जिल्हा शल्यचिकित्सक / १०८ तातडीचा आदेश',
    actionEn: 'Red-flag critical intervention: Mobile medical unit or 108 ambulance outreach team dispatched.',
    actionMr: '१०८ रुग्णवाहिका किंवा विशेष पथक पाठवून रुग्णास शोधून रुग्णालयात दाखल केले जाते.'
  }
];

export const getFollowUpUrgency = (nextFollowUpDateStr: string): { level: UrgencyLevelConfig; daysOverdue: number } => {
  const targetDate = new Date(nextFollowUpDateStr);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { level: URGENCY_LEVELS.OVERDUE, daysOverdue: Math.abs(diffDays) };
  } else if (diffDays === 0) {
    return { level: URGENCY_LEVELS.DUE_TODAY, daysOverdue: 0 };
  } else if (diffDays <= 3) {
    return { level: URGENCY_LEVELS.DUE_SOON, daysOverdue: 0 };
  } else if (diffDays <= 7) {
    return { level: URGENCY_LEVELS.DUE_WEEK, daysOverdue: 0 };
  } else {
    return { level: URGENCY_LEVELS.ON_TRACK, daysOverdue: 0 };
  }
};
