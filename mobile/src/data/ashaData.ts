/**
 * Authoritative ASHA Community Module Data & Catalog
 * HealthWay Native Mobile Platform - Features 26-28
 */

export interface VillageBeatInfo {
  villageName: string;
  totalHouseholds: number;
  surveyedHouseholds: number;
  block: string;
  district: string;
  subCenterName: string;
  subCenterId: string;
}

export const TAPOLA_VILLAGE_BEAT: VillageBeatInfo = {
  villageName: 'Tapola',
  totalHouseholds: 142,
  surveyedHouseholds: 138,
  block: 'Mahabaleshwar',
  district: 'Satara',
  subCenterName: 'Sub-Centre Tapola',
  subCenterId: 'FAC007',
};

export interface PregnantBeneficiary {
  id: string;
  name: string;
  age: number;
  trimester: 1 | 2 | 3;
  gestationalAgeWeeks: number;
  gravida: string;
  phone: string;
  isHighRisk: boolean;
  dangerReason?: string;
  village: string;
  pada?: string;
  lastVisitDate: string;
  nextVisitDate: string;
  bpLatest?: string;
}

export const INITIAL_PREGNANT_ROSTER: PregnantBeneficiary[] = [
  {
    id: 'PT-ANC-KAVITA',
    name: 'Kavita Shinde',
    age: 24,
    trimester: 2,
    gestationalAgeWeeks: 20,
    gravida: 'G1P0',
    phone: '+91 98220 11223',
    isHighRisk: false,
    village: 'Tapola',
    pada: 'Bazaar Galli',
    lastVisitDate: '2026-08-28',
    nextVisitDate: '2026-09-18',
    bpLatest: '118/76',
  },
  {
    id: 'PT-ANC-POOJA',
    name: 'Pooja Jadhav',
    age: 26,
    trimester: 3,
    gestationalAgeWeeks: 34,
    gravida: 'G2P1',
    phone: '+91 98220 99887',
    isHighRisk: true,
    dangerReason: 'Severe PIH',
    village: 'Tapola',
    pada: 'Gaikwad Pada',
    lastVisitDate: '2026-09-04',
    nextVisitDate: '2026-09-11',
    bpLatest: '168/108',
  },
  {
    id: 'PT-ANC-SUNITA',
    name: 'Sunita Ramchandra Jadhav',
    age: 28,
    trimester: 2,
    gestationalAgeWeeks: 22,
    gravida: 'G2P1',
    phone: '+91 98220 12345',
    isHighRisk: false,
    village: 'Tapola',
    pada: 'Gaikwad Pada',
    lastVisitDate: '2026-09-05',
    nextVisitDate: '2026-09-19',
    bpLatest: '124/82',
  },
];

export interface ImmunizationDueItem {
  id: string;
  childName: string;
  motherName: string;
  age: string;
  vaccine: string;
  dueDate: string;
  status: 'OVERDUE' | 'UPCOMING' | 'COMPLETED';
}

export const INITIAL_IMMUNIZATION_DUE_LIST: ImmunizationDueItem[] = [
  {
    id: 'IMM-01',
    childName: 'Aarav Shinde',
    motherName: 'Kavita Shinde',
    age: '6 weeks',
    vaccine: 'Pentavalent 1',
    dueDate: '2026-08-15',
    status: 'OVERDUE',
  },
  {
    id: 'IMM-02',
    childName: 'Anaya Jadhav',
    motherName: 'Sunita Jadhav',
    age: 'At Birth',
    vaccine: 'BCG',
    dueDate: '2026-09-10',
    status: 'UPCOMING',
  },
  {
    id: 'IMM-03',
    childName: 'Rohan Gaikwad',
    motherName: 'Pooja Jadhav',
    age: '9 months',
    vaccine: 'Measles-Rubella (MR) 1',
    dueDate: '2026-09-18',
    status: 'UPCOMING',
  },
];

export interface DailyFieldTask {
  id: string;
  task: string;
  taskMr: string;
  completed: boolean;
  priority: 'HIGH' | 'NORMAL';
}

export const INITIAL_DAILY_TASKS: DailyFieldTask[] = [
  {
    id: 'T1',
    task: 'Visit Pooja Jadhav (ANC)',
    taskMr: 'पूजा जाधव यांची प्रसूतीपूर्व तपासणी गृहभेट',
    completed: true,
    priority: 'HIGH',
  },
  {
    id: 'T2',
    task: 'Distribute IFA tablets at Sub-Centre',
    taskMr: 'उपकेंद्रात आयएफए गोळ्या वाटप',
    completed: false,
    priority: 'NORMAL',
  },
  {
    id: 'T3',
    task: 'Survey 4 pending households in Gaikwad Pada',
    taskMr: 'गायकवाड पाड्यातील ४ प्रलंबित घरांचे सर्वेक्षण',
    completed: false,
    priority: 'HIGH',
  },
  {
    id: 'T4',
    task: 'Follow up on Aarav Shinde Pentavalent vaccination',
    taskMr: 'आरव शिंदेच्या पेंटाव्हॅलेंट लसीकरणाची पाठपुरावा भेट',
    completed: true,
    priority: 'HIGH',
  },
];

export interface PmsmaVisit {
  visitNo: number;
  idealWeeks: string;
  descriptionEn: string;
  descriptionMr: string;
}

export const PMSMA_SCHEDULE: PmsmaVisit[] = [
  {
    visitNo: 1,
    idealWeeks: 'Within 12 weeks',
    descriptionEn: 'First trimester baseline ANC, blood/urine profile, IFA start',
    descriptionMr: 'पहिल्या त्रैमासिकातील तपासणी, रक्त व लघवी चाचण्या',
  },
  {
    visitNo: 2,
    idealWeeks: '14 - 26 weeks',
    descriptionEn: 'Second trimester anomaly ultrasound, fetal heart rate, TT-1',
    descriptionMr: 'दुसऱ्या त्रैमासिकातील सोनोग्राफी, गर्भाची वाढ व टीटी-१',
  },
  {
    visitNo: 3,
    idealWeeks: '28 - 34 weeks',
    descriptionEn: 'Third trimester pre-eclampsia surveillance, TT-2, glucose challenge',
    descriptionMr: 'तिसऱ्या त्रैमासिकातील रक्तदाब तपासणी, टीटी-२ व साखर चाचणी',
  },
  {
    visitNo: 4,
    idealWeeks: '36 weeks till delivery',
    descriptionEn: 'Pre-delivery birth planning, institutional delivery readiness, Hb check',
    descriptionMr: 'प्रसूतीपूर्व पूर्वतयारी, संस्थात्मक प्रसूती व हिमोग्लोबिन तपासणी',
  },
];

export interface DangerSignInfo {
  id: string;
  labelEn: string;
  labelMr: string;
  guidanceEn: string;
  severity: 'HIGH' | 'CRITICAL';
}

export const DANGER_SIGNS_CATALOG: DangerSignInfo[] = [
  {
    id: 'DS-01',
    labelEn: 'Severe persistent headache',
    labelMr: 'तीव्र सतत डोकेदुखी',
    guidanceEn: 'Indicates severe pre-eclampsia or neurological complication',
    severity: 'CRITICAL',
  },
  {
    id: 'DS-02',
    labelEn: 'Visual blurriness',
    labelMr: 'अंधुक दृष्टी किंवा डोळ्यांसमोर चमकणे',
    guidanceEn: 'Impending eclampsia symptom requiring urgent stabilization',
    severity: 'CRITICAL',
  },
  {
    id: 'DS-03',
    labelEn: 'Epigastric pain',
    labelMr: 'पोटाच्या वरील भागात तीव्र कळ',
    guidanceEn: 'Subcapsular hepatic swelling / HELLP syndrome indicator',
    severity: 'CRITICAL',
  },
  {
    id: 'DS-04',
    labelEn: 'Vaginal bleeding or fluid leakage',
    labelMr: 'रक्तस्त्राव किंवा पाणी जाणे',
    guidanceEn: 'Placental abruption or premature membrane rupture',
    severity: 'CRITICAL',
  },
  {
    id: 'DS-05',
    labelEn: 'Convulsions or fainting fits',
    labelMr: 'झटके किंवा चक्कर येऊन बेशुद्ध पडणे',
    guidanceEn: 'Eclamptic seizure, immediate parenteral MgSO4 required',
    severity: 'CRITICAL',
  },
  {
    id: 'DS-06',
    labelEn: 'Decreased fetal movement in 3rd trimester',
    labelMr: 'गर्भाची हालचाल कमी जाणवणे',
    guidanceEn: 'Potential fetal distress, urgent NST/sonography needed',
    severity: 'HIGH',
  },
  {
    id: 'DS-07',
    labelEn: 'High grade fever with rigors',
    labelMr: 'थंडी वाजून तीव्र ताप',
    guidanceEn: 'Intrauterine or systemic sepsis risk',
    severity: 'HIGH',
  },
];

export const EMERGENCY_SPEED_DIALERS = [
  { number: '108', label: '108 Ambulance (ALS/BLS)', labelMr: '१०८ रुग्णवाहिका' },
  { number: '102', label: '102 Janani Shishu Transport', labelMr: '१०२ जननी शिशु' },
  { number: '104', label: '104 Health Helpline', labelMr: '१०४ आरोग्य सल्ला' },
  { number: '02168290111', label: 'Sub-Centre Medical Officer', labelMr: 'उपकेंद्र वैद्यकीय अधिकारी' },
];
