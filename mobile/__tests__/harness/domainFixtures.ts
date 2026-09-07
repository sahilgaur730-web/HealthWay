/**
 * HealthWay Domain Fixtures and Clinical Reference Oracle
 * Grounded in authoritative specifications from ORIGINAL_REQUEST.md, PROJECT.md, and web services.
 */

export const THEME_TOKENS = {
  colors: {
    primaryNavy: '#1A4B8C',
    primarySaffron: '#F57C00',
    darkSlate: '#1C2B3A',
    neutralGray: '#546E7A',
    emergencyRed: '#DC2626',
    warningOrange: '#EA580C',
    cautionYellow: '#D97706',
    successGreen: '#16A34A',
    backgroundLight: '#F8FAFC',
    cardWhite: '#FFFFFF',
  },
  typography: {
    fontFamilyHeading: 'System',
    fontFamilyBody: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export type LanguageCode = 'en' | 'mr' | 'hi';

export const I18N_DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {
    app_title: 'HealthWay Mobile',
    role_patient: 'Patient',
    role_asha: 'ASHA Worker',
    role_doctor: 'Doctor',
    role_admin: 'District Admin',
    emergency_sos: 'Emergency 1-Tap SOS',
    book_appointment: 'Book Appointment',
    vitals_tracker: 'Vitals Tracker',
    symptom_triage: 'AI Symptom Triage',
    medicine_checker: 'Medicine Availability',
    diagnostic_hub: 'Diagnostics Hub',
    referral_hub: 'Referral Pipeline',
    queue_tokens: 'Queue & Token Management',
  },
  mr: {
    app_title: 'हेल्थवे मोबाईल',
    role_patient: 'रुग्ण',
    role_asha: 'आशा कार्यकर्ती',
    role_doctor: 'डॉक्टर',
    role_admin: 'जिल्हा प्रशासन',
    emergency_sos: 'तातडीची आणीबाणी एसओएस',
    book_appointment: 'नोंदणी करा',
    vitals_tracker: 'महत्त्वाचे निर्देशक',
    symptom_triage: 'लक्षण तपासणी',
    medicine_checker: 'औषध उपलब्धता',
    diagnostic_hub: 'निदान केंद्र',
    referral_hub: 'रुग्ण संदर्भ सेवा',
    queue_tokens: 'ओपीडी रांग व टोकन',
  },
  hi: {
    app_title: 'हेल्थवे मोबाइल',
    role_patient: 'मरीज',
    role_asha: 'आशा कार्यकर्ता',
    role_doctor: 'डॉक्टर',
    role_admin: 'जिला प्रशासन',
    emergency_sos: 'आपातकालीन एसओएस',
    book_appointment: 'अपॉइंटमेंट बुक करें',
    vitals_tracker: 'वाइटल्स ट्रैकर',
    symptom_triage: 'लक्षण ट्राइएज',
    medicine_checker: 'दवा उपलब्धता',
    diagnostic_hub: 'जांच केंद्र',
    referral_hub: 'रेफरल पाइपलाइन',
    queue_tokens: 'कतार प्रबंधन',
  },
};

export interface DistrictFacility {
  id: string;
  code: string;
  name: string;
  nameMr: string;
  type: 'District Hospital' | 'Rural Hospital' | 'CHC' | 'PHC' | 'Sub-Centre';
  block: string;
  beds: number;
  doctorInCharge: string;
  phone: string;
}

export const DISTRICT_FACILITIES: DistrictFacility[] = [
  { id: 'FAC001', code: 'DH-STR', name: 'District Hospital Satara', nameMr: 'जिल्हा रुग्णालय सातारा', type: 'District Hospital', block: 'Satara', beds: 350, doctorInCharge: 'Dr. V. M. Kulkarni', phone: '+91 2162 234100' },
  { id: 'FAC002', code: 'SDH-KRD', name: 'Sub-District Hospital Karad', nameMr: 'उपजिल्हा रुग्णालय कराड', type: 'Rural Hospital', block: 'Karad', beds: 100, doctorInCharge: 'Dr. S. P. Patil', phone: '+91 2164 222150' },
  { id: 'FAC003', code: 'CHC-WAI', name: 'Community Health Centre Wai', nameMr: 'ग्रामीण रुग्णालय वाई', type: 'CHC', block: 'Wai', beds: 30, doctorInCharge: 'Dr. A. R. Deshmukh', phone: '+91 2167 220033' },
  { id: 'FAC004', code: 'CHC-KOR', name: 'Community Health Centre Koregaon', nameMr: 'ग्रामीण रुग्णालय कोरेगाव', type: 'CHC', block: 'Koregaon', beds: 30, doctorInCharge: 'Dr. N. G. Shinde', phone: '+91 2163 220144' },
  { id: 'FAC005', code: 'PHC-MHB', name: 'Primary Health Centre Mahabaleshwar', nameMr: 'प्राथमिक आरोग्य केंद्र महाबळेश्वर', type: 'PHC', block: 'Mahabaleshwar', beds: 10, doctorInCharge: 'Dr. P. T. More', phone: '+91 2168 260233' },
  { id: 'FAC006', code: 'PHC-MDH', name: 'Primary Health Centre Medha', nameMr: 'प्राथमिक आरोग्य केंद्र मेढा', type: 'PHC', block: 'Jawali', beds: 10, doctorInCharge: 'Dr. R. B. Chavan', phone: '+91 2160 224422' },
  { id: 'FAC007', code: 'SC-TPL', name: 'Sub-Centre Tapola', nameMr: 'आरोग्य उपकेंद्र तापोळा', type: 'Sub-Centre', block: 'Mahabaleshwar', beds: 2, doctorInCharge: 'Sister Anandi Gaikwad (ANM)', phone: '+91 2168 290111' },
];

export interface EdlMedicine {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: string;
  activeSalt: string;
  form: 'Tablet' | 'Syrup' | 'Injection' | 'Sachet' | 'Drops';
  strength: string;
  minBuffer: number;
  stockLevel: number;
  unit: string;
  status: 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  genericSubstitutes: string[];
}

export const EDL_MEDICINE_CATALOG: EdlMedicine[] = [
  { id: 'MED001', code: 'EDL-01', name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic / Antipyretic', activeSalt: 'Acetaminophen 500mg', form: 'Tablet', strength: '500mg', minBuffer: 500, stockLevel: 1200, unit: 'Tablets', status: 'ADEQUATE', genericSubstitutes: ['Crocin 500mg', 'Calpol 500mg', 'Dolo 500mg'] },
  { id: 'MED002', code: 'EDL-02', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', activeSalt: 'Amoxicillin 500mg', form: 'Tablet', strength: '500mg', minBuffer: 250, stockLevel: 320, unit: 'Capsules', status: 'ADEQUATE', genericSubstitutes: ['Novamox 500mg', 'Mox 500mg'] },
  { id: 'MED003', code: 'EDL-03', name: 'Metformin 500mg', genericName: 'Metformin Hydrochloride', category: 'Antidiabetic', activeSalt: 'Metformin HCl 500mg', form: 'Tablet', strength: '500mg', minBuffer: 400, stockLevel: 150, unit: 'Tablets', status: 'LOW', genericSubstitutes: ['Glyciphage 500mg', 'Gluformin 500mg'] },
  { id: 'MED004', code: 'EDL-04', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', activeSalt: 'Amlodipine 5mg', form: 'Tablet', strength: '5mg', minBuffer: 300, stockLevel: 45, unit: 'Tablets', status: 'CRITICAL', genericSubstitutes: ['Amlong 5mg', 'Stamlo 5mg'] },
  { id: 'MED005', code: 'EDL-05', name: 'Oral Rehydration Salts (ORS)', genericName: 'WHO ORS Formula', category: 'Electrolyte Replenisher', activeSalt: 'NaCl + KCl + Na Citrate + Glucose', form: 'Sachet', strength: '20.5g', minBuffer: 200, stockLevel: 800, unit: 'Sachets', status: 'ADEQUATE', genericSubstitutes: ['Electral Sachet', 'Walyte Sachet'] },
  { id: 'MED006', code: 'EDL-06', name: 'Iron & Folic Acid (IFA)', genericName: 'Ferrous Sulfate + Folic Acid', category: 'Maternal Nutrition', activeSalt: 'Elemental Iron 100mg + Folic Acid 0.5mg', form: 'Tablet', strength: '100mg+0.5mg', minBuffer: 600, stockLevel: 0, unit: 'Tablets', status: 'OUT_OF_STOCK', genericSubstitutes: ['Autrin', 'Fefol Z'] },
  { id: 'MED007', code: 'EDL-07', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin Hydrochloride', category: 'Antibiotic', activeSalt: 'Ciprofloxacin 500mg', form: 'Tablet', strength: '500mg', minBuffer: 200, stockLevel: 450, unit: 'Tablets', status: 'ADEQUATE', genericSubstitutes: ['Ciplox 500mg', 'Cifran 500mg'] },
  { id: 'MED008', code: 'EDL-08', name: 'Azithromycin 500mg', genericName: 'Azithromycin Dihydrate', category: 'Macrolide Antibiotic', activeSalt: 'Azithromycin 500mg', form: 'Tablet', strength: '500mg', minBuffer: 150, stockLevel: 300, unit: 'Tablets', status: 'ADEQUATE', genericSubstitutes: ['Azee 500mg', 'Azithral 500mg'] },
  { id: 'MED009', code: 'EDL-09', name: 'Cetirizine 10mg', genericName: 'Cetirizine Hydrochloride', category: 'Antihistamine', activeSalt: 'Cetirizine 10mg', form: 'Tablet', strength: '10mg', minBuffer: 300, stockLevel: 900, unit: 'Tablets', status: 'ADEQUATE', genericSubstitutes: ['Cetzine 10mg', 'Alerid 10mg'] },
  { id: 'MED010', code: 'EDL-10', name: 'Omeprazole 20mg', genericName: 'Omeprazole Magnesium', category: 'Antacid / PPI', activeSalt: 'Omeprazole 20mg', form: 'Tablet', strength: '20mg', minBuffer: 300, stockLevel: 550, unit: 'Capsules', status: 'ADEQUATE', genericSubstitutes: ['Omez 20mg', 'Ocid 20mg'] },
  { id: 'MED011', code: 'EDL-11', name: 'Albendazole 400mg', genericName: 'Albendazole', category: 'Anthelmintic', activeSalt: 'Albendazole 400mg', form: 'Tablet', strength: '400mg', minBuffer: 100, stockLevel: 280, unit: 'Tablets', status: 'ADEQUATE', genericSubstitutes: ['Zentel 400mg', 'Bandey 400mg'] },
  { id: 'MED012', code: 'EDL-12', name: 'Zinc Sulfate 20mg', genericName: 'Zinc Sulfate Dispersible', category: 'Pediatric Supplement', activeSalt: 'Elemental Zinc 20mg', form: 'Tablet', strength: '20mg', minBuffer: 200, stockLevel: 420, unit: 'Tablets', status: 'ADEQUATE', genericSubstitutes: ['Zinconia 20mg', 'Z&D 20mg'] },
  { id: 'MED013', code: 'EDL-13', name: 'Oxytocin Injection 10 IU', genericName: 'Oxytocin', category: 'Obstetric Emergency', activeSalt: 'Oxytocin 10 IU/ml', form: 'Injection', strength: '10 IU', minBuffer: 50, stockLevel: 120, unit: 'Ampoules', status: 'ADEQUATE', genericSubstitutes: ['Syntocinon 10 IU', 'Pitocin 10 IU'] },
  { id: 'MED014', code: 'EDL-14', name: 'Magnesium Sulfate 50%', genericName: 'Magnesium Sulfate Heptahydrate', category: 'Obstetric Emergency', activeSalt: 'MgSO4 50% w/v', form: 'Injection', strength: '500mg/ml', minBuffer: 40, stockLevel: 85, unit: 'Vials', status: 'ADEQUATE', genericSubstitutes: ['MgSO4 Injection'] },
  { id: 'MED015', code: 'EDL-15', name: 'Adrenaline Injection 1:1000', genericName: 'Epinephrine Hydrochloride', category: 'Anaphylaxis / CPR', activeSalt: 'Epinephrine 1mg/ml', form: 'Injection', strength: '1mg/ml', minBuffer: 20, stockLevel: 60, unit: 'Ampoules', status: 'ADEQUATE', genericSubstitutes: ['Vasocon 1mg', 'Adrenaline Inj'] },
  { id: 'MED016', code: 'EDL-16', name: 'Atropine Sulfate 0.6mg', genericName: 'Atropine Sulfate', category: 'Anticholinergic', activeSalt: 'Atropine 0.6mg/ml', form: 'Injection', strength: '0.6mg/ml', minBuffer: 25, stockLevel: 70, unit: 'Ampoules', status: 'ADEQUATE', genericSubstitutes: ['Atropine Inj'] },
  { id: 'MED017', code: 'EDL-17', name: 'Salbutamol Inhaler 100mcg', genericName: 'Salbutamol Sulfate', category: 'Bronchodilator', activeSalt: 'Salbutamol 100mcg/actuation', form: 'Drops', strength: '100mcg', minBuffer: 30, stockLevel: 90, unit: 'Canisters', status: 'ADEQUATE', genericSubstitutes: ['Asthalin Inhaler', 'Ventorlin'] },
  { id: 'MED018', code: 'EDL-18', name: 'Tetanus Toxoid (TT) Vaccine', genericName: 'Tetanus Toxoid Adsorbed', category: 'Immunization', activeSalt: 'Tetanus Toxoid >=40 IU', form: 'Injection', strength: '0.5ml', minBuffer: 80, stockLevel: 190, unit: 'Vials', status: 'ADEQUATE', genericSubstitutes: ['Tetvac', 'Betatetanus'] },
];

export interface DiagnosticCatalogTest {
  code: string;
  name: string;
  category: 'Hematology' | 'Biochemistry' | 'Urine' | 'Microbiology' | 'Radiology';
  sampleType: string;
  tatHours: number;
  fasting: boolean;
  normalRange: string;
}

export const DIAGNOSTIC_CATALOG: DiagnosticCatalogTest[] = [
  { code: 'HEM-01', name: 'Complete Blood Count (CBC)', category: 'Hematology', sampleType: 'Whole Blood EDTA', tatHours: 4, fasting: false, normalRange: 'Hb: 12-16 g/dL, WBC: 4000-11000/mcL' },
  { code: 'HEM-02', name: 'Hemoglobin (Hb) Rapid Test', category: 'Hematology', sampleType: 'Capillary Blood', tatHours: 1, fasting: false, normalRange: '12.0 - 16.0 g/dL' },
  { code: 'HEM-03', name: 'Blood Grouping & Rh Typing', category: 'Hematology', sampleType: 'Whole Blood EDTA', tatHours: 2, fasting: false, normalRange: 'A/B/AB/O, Rh Pos/Neg' },
  { code: 'HEM-04', name: 'Peripheral Blood Smear (Malaria)', category: 'Hematology', sampleType: 'Blood Smear', tatHours: 3, fasting: false, normalRange: 'Negative for MP' },
  { code: 'HEM-05', name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Hematology', sampleType: 'Whole Blood Citrate', tatHours: 3, fasting: false, normalRange: '0 - 20 mm/hr' },
  { code: 'HEM-06', name: 'Platelet Count', category: 'Hematology', sampleType: 'Whole Blood EDTA', tatHours: 3, fasting: false, normalRange: '150,000 - 450,000 /mcL' },
  { code: 'BIO-01', name: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', sampleType: 'Fluoride Plasma', tatHours: 2, fasting: true, normalRange: '70 - 100 mg/dL' },
  { code: 'BIO-02', name: 'Postprandial Blood Sugar (PPBS)', category: 'Biochemistry', sampleType: 'Fluoride Plasma', tatHours: 2, fasting: false, normalRange: '< 140 mg/dL' },
  { code: 'BIO-03', name: 'Random Blood Sugar (RBS)', category: 'Biochemistry', sampleType: 'Serum / Capillary', tatHours: 1, fasting: false, normalRange: '70 - 140 mg/dL' },
  { code: 'BIO-04', name: 'HbA1c Glycated Hemoglobin', category: 'Biochemistry', sampleType: 'Whole Blood EDTA', tatHours: 6, fasting: false, normalRange: '< 5.7%' },
  { code: 'BIO-05', name: 'Liver Function Test (LFT)', category: 'Biochemistry', sampleType: 'Serum Clot', tatHours: 6, fasting: false, normalRange: 'Bilirubin: 0.2-1.2 mg/dL, SGPT: 7-56 U/L' },
  { code: 'BIO-06', name: 'Kidney Function Test (KFT/RFT)', category: 'Biochemistry', sampleType: 'Serum Clot', tatHours: 6, fasting: false, normalRange: 'Urea: 15-40 mg/dL, Creatinine: 0.6-1.2 mg/dL' },
  { code: 'BIO-07', name: 'Serum Electrolytes (Na, K, Cl)', category: 'Biochemistry', sampleType: 'Serum Clot', tatHours: 4, fasting: false, normalRange: 'Na: 135-145, K: 3.5-5.0 mEq/L' },
  { code: 'BIO-08', name: 'Lipid Profile', category: 'Biochemistry', sampleType: 'Serum Clot', tatHours: 8, fasting: true, normalRange: 'Cholesterol: <200 mg/dL, Triglycerides: <150' },
  { code: 'URI-01', name: 'Urine Routine & Microscopy', category: 'Urine', sampleType: 'Fresh Midstream Urine', tatHours: 2, fasting: false, normalRange: 'Protein: Nil, Sugar: Nil, Pus cells: 0-4/hpf' },
  { code: 'URI-02', name: 'Urine Pregnancy Test (UPT)', category: 'Urine', sampleType: 'Morning Urine', tatHours: 1, fasting: false, normalRange: 'Negative / Positive' },
  { code: 'MIC-01', name: 'Sputum for AFB (Tuberculosis)', category: 'Microbiology', sampleType: 'Morning Sputum', tatHours: 24, fasting: false, normalRange: 'Negative for Acid Fast Bacilli' },
  { code: 'MIC-02', name: 'Widal Agglutination (Typhoid)', category: 'Microbiology', sampleType: 'Serum', tatHours: 6, fasting: false, normalRange: 'TO < 1:80, TH < 1:80' },
  { code: 'MIC-03', name: 'Dengue NS1 Antigen & IgM', category: 'Microbiology', sampleType: 'Serum', tatHours: 4, fasting: false, normalRange: 'Non-Reactive' },
  { code: 'RAD-01', name: 'Chest X-Ray PA View', category: 'Radiology', sampleType: 'Radiological Imaging', tatHours: 3, fasting: false, normalRange: 'Normal lung fields & cardiothoracic ratio' },
];

export const QUEUE_PRIORITY_WEIGHTS = {
  EMERGENCY: 100,
  ANTENATAL: 80,
  SENIOR: 60,
  GENERAL: 40,
};

export const REFERRAL_SLAS = {
  IMMEDIATE: 60,     // 1 hr
  URGENT: 360,       // 6 hrs
  PRIORITY: 1440,    // 24 hrs
  ROUTINE: 4320,     // 72 hrs
};

export const REFERRAL_STAGES = [
  'CREATED',
  'NOTIFIED',
  'ACCEPTED',
  'IN_TRANSIT',
  'REACHED',
  'ADMITTED',
  'COMPLETED',
] as const;

export interface VitalsReading {
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spo2: number;
  bloodSugarRandom: number;
  temperatureF: number;
}

export function evaluateVitalsAlert(vitals: VitalsReading): {
  isCritical: boolean;
  warnings: string[];
  color: 'GREEN' | 'YELLOW' | 'RED';
} {
  const warnings: string[] = [];
  let isCritical = false;

  if (vitals.systolicBp >= 160 || vitals.diastolicBp >= 100 || vitals.systolicBp <= 85 || vitals.diastolicBp <= 50) {
    warnings.push(`Critical Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
    isCritical = true;
  } else if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) {
    warnings.push(`Elevated Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
  }

  if (vitals.spo2 < 90) {
    warnings.push(`Critical Hypoxia: SpO2 ${vitals.spo2}%`);
    isCritical = true;
  } else if (vitals.spo2 < 95) {
    warnings.push(`Low Oxygen Saturation: SpO2 ${vitals.spo2}%`);
  }

  if (vitals.bloodSugarRandom > 250 || vitals.bloodSugarRandom < 60) {
    warnings.push(`Critical Glycemia: ${vitals.bloodSugarRandom} mg/dL`);
    isCritical = true;
  } else if (vitals.bloodSugarRandom > 140) {
    warnings.push(`Elevated Blood Sugar: ${vitals.bloodSugarRandom} mg/dL`);
  }

  if (vitals.temperatureF > 102.5) {
    warnings.push(`High Grade Fever: ${vitals.temperatureF}°F`);
    if (vitals.temperatureF >= 104) isCritical = true;
  }

  if (vitals.heartRate > 120 || vitals.heartRate < 50) {
    warnings.push(`Abnormal Heart Rate: ${vitals.heartRate} bpm`);
    if (vitals.heartRate > 140 || vitals.heartRate < 40) isCritical = true;
  }

  const color = isCritical ? 'RED' : warnings.length > 0 ? 'YELLOW' : 'GREEN';
  return { isCritical, warnings, color };
}

export function evaluateTriageLevel(symptomKey: string, severityLevel: number, vitals?: VitalsReading): {
  level: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  actionEn: string;
} {
  if (vitals) {
    const vitalsResult = evaluateVitalsAlert(vitals);
    if (vitalsResult.isCritical) {
      return {
        level: 'RED',
        actionEn: 'Call 108 emergency ambulance immediately or proceed to Emergency Room',
      };
    }
  }

  if (severityLevel >= 4 || symptomKey === 'CHEST_PAIN_SEVERE' || symptomKey === 'RESPIRATORY_ARREST') {
    return {
      level: 'RED',
      actionEn: 'Call 108 emergency ambulance immediately or proceed to Emergency Room',
    };
  }
  if (severityLevel === 3) {
    return {
      level: 'ORANGE',
      actionEn: 'Proceed to nearest PHC/Hospital OPD immediately & alert duty nurse',
    };
  }
  if (severityLevel === 2) {
    return {
      level: 'YELLOW',
      actionEn: 'Register in OPD queue and await doctor consultation today',
    };
  }
  return {
    level: 'GREEN',
    actionEn: 'Can be managed with primary home care advice or routine appointment',
  };
}

export const ABDM_SYSTEMS_MONITOR = [
  { id: 'ABDM', name: 'Ayushman Bharat Digital Mission', status: 'ONLINE', latencyMs: 42, complianceLevel: 'M1/M2/M3' },
  { id: 'NHM', name: 'National Health Mission Gateway', status: 'ONLINE', latencyMs: 88, complianceLevel: 'v3.2' },
  { id: 'HMIS', name: 'Health Management Information System', status: 'ONLINE', latencyMs: 110, complianceLevel: 'Form 1-12' },
  { id: 'MCTS', name: 'Mother & Child Tracking System', status: 'ONLINE', latencyMs: 95, complianceLevel: 'RCH-2' },
  { id: 'NIKSHAY', name: 'Direct TB Elimination System', status: 'ONLINE', latencyMs: 75, complianceLevel: 'NTEP-Direct' },
  { id: 'COWIN', name: 'Universal Immunization Portal', status: 'ONLINE', latencyMs: 50, complianceLevel: 'UIP-API' },
  { id: 'NCD', name: 'NPCDCS Non-Communicable Disease Portal', status: 'ONLINE', latencyMs: 120, complianceLevel: 'CPHC-NCD' },
];
