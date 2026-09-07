# Milestone 3 — Patient Portal Architecture & Implementation Blueprint (F21–F25)

## Executive Summary
This document specifies the authoritative, complete technical blueprint for implementing Milestone 3 Patient Portal features (Features 21 through 25) in the HealthWay native mobile application (`mobile/src/`).
All designs, data structures, UI specifications, offline persistence integrations, clinical algorithms, and navigation structures strictly adhere to:
1. `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md` (Zero web modification, native cross-platform React Native + Expo)
2. `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md` (8-store SQLite/AsyncStorage engine, Government of Maharashtra design tokens, zero unicode emojis, trilingual i18n)
3. `c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier1_features\patient_asha.test.ts` (100% test contract compliance)

---

## 1. Feature Map & Target Files

| Feature | Screen / Module | Primary File | Supporting Services / Data |
|---|---|---|---|
| **F21** | Patient Portal: Main Dashboard | `mobile/src/screens/patient/PatientDashboardScreen.tsx` | `mobile/src/data/patientData.ts` |
| **F22** | Patient Portal: Vitals Tracker | `mobile/src/screens/patient/VitalsTrackerScreen.tsx` | `mobile/src/services/vitalsService.ts` |
| **F23** | Patient Portal: Appointment Booking | `mobile/src/screens/patient/AppointmentBookingScreen.tsx` | `mobile/src/data/facilitiesData.ts`, `patient_cache` |
| **F24** | Patient Portal: Digital PHR Locker | `mobile/src/screens/patient/PhrLockerScreen.tsx` | `expo-print`, `expo-sharing`, `patient_cache` |
| **F25** | Patient Portal: AI Symptom Triage | `mobile/src/screens/patient/SymptomTriageScreen.tsx` | `mobile/src/services/triageService.ts`, `triage_drafts` |
| **Nav** | Navigation Types & Patient Navigator | `mobile/src/types/navigation.ts`<br/>`mobile/src/navigation/PatientNavigator.tsx` | `@react-navigation/native-stack` |

---

## 2. Supporting Domain Services & Seed Data Specifications

To ensure modularity, high code reusability, and clean separation between UI and clinical business logic, three supporting modules are specified.

### 2.1 Clinical Vitals Service: `mobile/src/services/vitalsService.ts`
This service provides authoritative clinical range checks, BMI calculation, and color-coded alert categorization.

```typescript
/**
 * Clinical Vitals Evaluation & BMI Engine
 * Strict compliance with Tier 1 Feature 22 & WHO clinical guidelines
 */

export interface VitalsReading {
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spo2: number;
  bloodSugarRandom?: number;
  bloodSugarFasting?: number;
  bloodSugarPostPrandial?: number;
  temperatureF: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  recordedAt?: string;
  notes?: string;
}

export interface VitalsAlertResult {
  isCritical: boolean;
  warnings: string[];
  color: 'GREEN' | 'YELLOW' | 'RED';
}

/**
 * Calculates Body Mass Index (BMI) to 1 decimal place.
 * Formula: weight (kg) / [height (m)]^2
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

/**
 * Returns descriptive classification for BMI
 */
export function getBmiCategory(bmi: number): { labelEn: string; labelMr: string; color: string } {
  if (bmi <= 0) return { labelEn: 'N/A', labelMr: 'लागू नाही', color: '#546E7A' };
  if (bmi < 18.5) return { labelEn: 'Underweight', labelMr: 'कमी वजन', color: '#D97706' };
  if (bmi < 25) return { labelEn: 'Normal', labelMr: 'सामान्य वजन', color: '#16A34A' };
  if (bmi < 30) return { labelEn: 'Overweight', labelMr: 'जास्त वजन', color: '#EA580C' };
  return { labelEn: 'Obese', labelMr: 'लठ्ठपणा', color: '#DC2626' };
}

/**
 * Evaluates clinical vitals and returns status alert (GREEN, YELLOW, RED)
 * Tested against F22-1, F22-3, F22-4
 */
export function evaluateVitalsAlert(vitals: VitalsReading): VitalsAlertResult {
  const warnings: string[] = [];
  let isCritical = false;

  // 1. Blood Pressure Check
  if (
    vitals.systolicBp >= 160 ||
    vitals.diastolicBp >= 100 ||
    (vitals.systolicBp > 0 && vitals.systolicBp <= 85) ||
    (vitals.diastolicBp > 0 && vitals.diastolicBp <= 50)
  ) {
    warnings.push(`Critical Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
    isCritical = true;
  } else if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) {
    warnings.push(`Elevated Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
  }

  // 2. Oxygen Saturation (SpO2) Check
  if (vitals.spo2 > 0 && vitals.spo2 < 90) {
    warnings.push(`Critical Hypoxia: SpO2 ${vitals.spo2}%`);
    isCritical = true;
  } else if (vitals.spo2 > 0 && vitals.spo2 < 95) {
    warnings.push(`Low Oxygen Saturation: SpO2 ${vitals.spo2}%`);
  }

  // 3. Blood Sugar Check (Random, Fasting, or Post-Prandial)
  const sugarVal = vitals.bloodSugarRandom ?? vitals.bloodSugarPostPrandial ?? vitals.bloodSugarFasting ?? 0;
  if (sugarVal > 0) {
    if (sugarVal > 250 || sugarVal < 60) {
      warnings.push(`Critical Glycemia: ${sugarVal} mg/dL`);
      isCritical = true;
    } else if (sugarVal > 140) {
      warnings.push(`Elevated Blood Sugar: ${sugarVal} mg/dL`);
    }
  }

  // 4. Body Temperature Check
  if (vitals.temperatureF > 102.5) {
    warnings.push(`High Grade Fever: ${vitals.temperatureF}°F`);
    if (vitals.temperatureF >= 104) isCritical = true;
  }

  // 5. Heart Rate / Pulse Check
  if (vitals.heartRate > 0) {
    if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      warnings.push(`Abnormal Heart Rate: ${vitals.heartRate} bpm`);
      if (vitals.heartRate > 140 || vitals.heartRate < 40) isCritical = true;
    }
  }

  const color: 'GREEN' | 'YELLOW' | 'RED' = isCritical ? 'RED' : warnings.length > 0 ? 'YELLOW' : 'GREEN';
  return { isCritical, warnings, color };
}
```

---

### 2.2 Clinical Triage Service: `mobile/src/services/triageService.ts`
This service implements the 4 structured symptom pathways, CDSS urgency classification, and trilingual emergency escalation outputs matching F25-1 through F25-5.

```typescript
/**
 * Clinical Symptom Triage Engine
 * Strictly compliant with Tier 1 Feature 25 & WHO ETAT protocols
 */

import { VitalsReading, evaluateVitalsAlert } from './vitalsService';

export type TriageLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export type SymptomPathwayKey =
  | 'CHEST_PAIN'
  | 'HIGH_FEVER'
  | 'DYSPNEA'
  | 'ANTENATAL_COMPLICATIONS';

export interface SymptomOption {
  key: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  severityDefault: number;
  isRedFlag?: boolean;
}

export const SYMPTOM_PATHWAYS: Record<SymptomPathwayKey, {
  nameEn: string;
  nameMr: string;
  nameHi: string;
  icon: string;
  options: SymptomOption[];
}> = {
  CHEST_PAIN: {
    nameEn: 'Chest Pain / Cardiac',
    nameMr: 'छातीत कळ / हृदय विकार',
    nameHi: 'सीने में दर्द / हृदय',
    icon: 'heartPulse',
    options: [
      { key: 'CHEST_PAIN_SEVERE', nameEn: 'Severe crushing chest pain radiating to left arm/jaw', nameMr: 'डाव्या हाताकडे जाणारी तीव्र छातीत कळ', nameHi: 'बाएं हाथ में फैलता गंभीर सीने का दर्द', severityDefault: 5, isRedFlag: true },
      { key: 'CHEST_HEAVY', nameEn: 'Chest heaviness with sweating and cold clammy skin', nameMr: 'घाम व छातीवर प्रचंड जडपणा', nameHi: 'पसीने के साथ सीने में भारीपन', severityDefault: 4, isRedFlag: true },
      { key: 'CHEST_DISCOMFORT', nameEn: 'Mild chest discomfort worsening with deep breath', nameMr: 'श्वास घेताना हलकी कळ', nameHi: 'सांस लेने पर हल्का दर्द', severityDefault: 2 },
    ],
  },
  HIGH_FEVER: {
    nameEn: 'High Fever / Infection',
    nameMr: 'तीव्र ताप / संसर्ग',
    nameHi: 'तेज बुखार / संक्रमण',
    icon: 'thermometer',
    options: [
      { key: 'FEVER_SEVERE', nameEn: 'High grade fever (>103°F) with rigors, chills, or altered sensorium', nameMr: '१०३°F पेक्षा जास्त ताप व प्रचंड हुडहुडी', nameHi: '103°F से अधिक बुखार और कंपकंपी', severityDefault: 4, isRedFlag: true },
      { key: 'FEVER_MODERATE', nameEn: 'Fever lasting >3 days with severe headache and joint pain', nameMr: '३ दिवसांहून अधिक ताप, डोकेदुखी व सांधेदुखी', nameHi: '3 दिन से अधिक बुखार और जोड़ों में दर्द', severityDefault: 3 },
      { key: 'FEVER_MILD', nameEn: 'Mild low-grade fever with runny nose and mild fatigue', nameMr: 'हलका ताप, सर्दी व थकवा', nameHi: 'हल्का बुखार, जुकाम और थकान', severityDefault: 2 },
    ],
  },
  DYSPNEA: {
    nameEn: 'Breathing Difficulty / Respiratory',
    nameMr: 'श्वास घेण्यास त्रास / श्वसनविकार',
    nameHi: 'सांस लेने में तकलीफ',
    icon: 'lungs',
    options: [
      { key: 'RESPIRATORY_ARREST', nameEn: 'Severe respiratory distress, stridor, cyanosis (blue lips)', nameMr: 'श्वास घेण्यास तीव्र अडथळा व ओठ निळे पडणे', nameHi: 'गंभीर सांस की तकलीफ व होंठ नीले पड़ना', severityDefault: 5, isRedFlag: true },
      { key: 'DYSPNEA_MODERATE', nameEn: 'Shortness of breath on mild exertion or wheezing', nameMr: 'किंचित चालल्यावर दम भरणे किंवा घरघर', nameHi: 'हल्का चलने पर सांस फूलना', severityDefault: 3 },
      { key: 'COUGH_PRODUCTIVE', nameEn: 'Persistent productive cough for 2+ weeks (TB screening)', nameMr: '२ आठवड्यांहून अधिक खोकला व कफ', nameHi: '2 सप्ताह से अधिक खांसी व बलगम', severityDefault: 2 },
    ],
  },
  ANTENATAL_COMPLICATIONS: {
    nameEn: 'Antenatal & Maternal Complications',
    nameMr: 'प्रसूतीपूर्व व माता आरोग्य धोके',
    nameHi: 'प्रसवपूर्व और मातृ जटिलताएं',
    icon: 'patient',
    options: [
      { key: 'ANC_BLEEDING', nameEn: 'Vaginal bleeding or fluid leakage in pregnancy', nameMr: 'गर्भधारणेदरम्यान रक्तस्त्राव किंवा पाणी जाणे', nameHi: 'गर्भावस्था में रक्तस्राव या पानी आना', severityDefault: 5, isRedFlag: true },
      { key: 'ANC_SEIZURE', nameEn: 'Severe headache, blurred vision, or convulsions (Eclampsia)', nameMr: 'तीव्र डोकेदुखी, अंधुक दृष्टी किंवा झटके', nameHi: 'सिरदर्द, धुंधली दृष्टि या दौरे', severityDefault: 5, isRedFlag: true },
      { key: 'ANC_REDUCED_MOVEMENT', nameEn: 'Decreased fetal movements in 3rd trimester', nameMr: 'गर्भाची हालचाल कमी जाणवणे', nameHi: 'गर्भ में बच्चे की हलचल कम होना', severityDefault: 3 },
    ],
  },
};

export const TRIAGE_TRILINGUAL_GUIDANCE = {
  RED: {
    en: 'Call 108 emergency ambulance immediately or proceed to Emergency Room',
    mr: 'त्वरित १०८ रुग्णवाहिकेला कॉल करा किंवा आपत्कालीन विभागात जा',
    hi: 'तुरंत 108 एम्बुलेंस को कॉल करें या आपातकालीन वार्ड में जाएं',
  },
  ORANGE: {
    en: 'Proceed to nearest PHC/Hospital OPD immediately & alert duty nurse',
    mr: 'तातडीने आरोग्य केंद्रात जा आणि उपस्थित परिचारिकेला माहिती द्या',
    hi: 'तुरंत निकटतम प्राथमिक स्वास्थ्य केंद्र/अस्पताल जाएं',
  },
  YELLOW: {
    en: 'Register in OPD queue and await doctor consultation today',
    mr: 'ओपीडी रांगेत नोंदणी करा आणि आपल्या नंबरची वाट पहा',
    hi: 'ओपीडी कतार में पंजीकरण करें और डॉक्टर परामर्श की प्रतीक्षा करें',
  },
  GREEN: {
    en: 'Can be managed with primary home care advice or routine appointment',
    mr: 'प्राथमिक घरगुती काळजी किंवा नियमित तपासणीने व्यवस्थापित केले जाऊ शकते',
    hi: 'प्राथमिक घरेलू देखभाल सलाह या नियमित अपॉइंटमेंट से प्रबंधित किया जा सकता है',
  },
};

export interface TriageEvaluation {
  level: TriageLevel;
  actionEn: string;
  guidance: {
    en: string;
    mr: string;
    hi: string;
  };
  isVitalsOverride?: boolean;
}

/**
 * Clinical Triage Evaluation Algorithm
 * Evaluates symptom severity + vitals critical overrides
 */
export function evaluateTriageLevel(
  symptomKey: string,
  severityLevel: number,
  vitals?: VitalsReading
): TriageEvaluation {
  // Check critical vitals override first
  if (vitals) {
    const vitalsAlert = evaluateVitalsAlert(vitals);
    if (vitalsAlert.isCritical) {
      return {
        level: 'RED',
        actionEn: TRIAGE_TRILINGUAL_GUIDANCE.RED.en,
        guidance: TRIAGE_TRILINGUAL_GUIDANCE.RED,
        isVitalsOverride: true,
      };
    }
  }

  // Symptom severity grading
  if (
    severityLevel >= 4 ||
    symptomKey === 'CHEST_PAIN_SEVERE' ||
    symptomKey === 'RESPIRATORY_ARREST' ||
    symptomKey === 'ANC_BLEEDING' ||
    symptomKey === 'ANC_SEIZURE'
  ) {
    return {
      level: 'RED',
      actionEn: TRIAGE_TRILINGUAL_GUIDANCE.RED.en,
      guidance: TRIAGE_TRILINGUAL_GUIDANCE.RED,
    };
  }

  if (severityLevel === 3) {
    return {
      level: 'ORANGE',
      actionEn: TRIAGE_TRILINGUAL_GUIDANCE.ORANGE.en,
      guidance: TRIAGE_TRILINGUAL_GUIDANCE.ORANGE,
    };
  }

  if (severityLevel === 2) {
    return {
      level: 'YELLOW',
      actionEn: TRIAGE_TRILINGUAL_GUIDANCE.YELLOW.en,
      guidance: TRIAGE_TRILINGUAL_GUIDANCE.YELLOW,
    };
  }

  return {
    level: 'GREEN',
    actionEn: TRIAGE_TRILINGUAL_GUIDANCE.GREEN.en,
    guidance: TRIAGE_TRILINGUAL_GUIDANCE.GREEN,
  };
}
```

---

### 2.3 Patient Seed Datasets: `mobile/src/data/patientData.ts`
Matches exact fixture values expected in F21–F24 unit tests and workload tests.

```typescript
/**
 * Authoritative Patient Portal Seed Data
 * Complies with F21-F24 specifications and ABDM standards
 */

export interface PatientProfileModel {
  patientName: string;
  nameMr: string;
  abhaId: string;
  aadhaarLast4: string;
  dob: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  village: string;
  block: string;
  district: string;
  phone: string;
  conditions: string[];
  qrPayload: string;
}

export const DEFAULT_PATIENT_PROFILE: PatientProfileModel = {
  patientName: 'Sunita Ramchandra Jadhav',
  nameMr: 'सुनीता रामचंद्र जाधव',
  abhaId: '14-4821-9876-5432',
  aadhaarLast4: '4821',
  dob: '1992-05-14',
  age: 28,
  gender: 'Female',
  bloodGroup: 'B+',
  village: 'Tapola',
  block: 'Mahabaleshwar',
  district: 'Satara',
  phone: '+91 98220 12345',
  conditions: ['Antenatal 2nd Trimester', 'Mild Anemia'],
  qrPayload: 'https://healthway.gov.in/phr/14-4821-9876-5432',
};

export interface UpcomingAppointment {
  id: string;
  doctorName: string;
  doctorId: string;
  facilityName: string;
  facilityId: string;
  date: string;
  slot: string;
  tokenNumber: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  specialization: string;
}

export const INITIAL_UPCOMING_APPOINTMENTS: UpcomingAppointment[] = [
  {
    id: 'APT-01',
    doctorName: 'Dr. Deshmukh',
    doctorId: 'DOC-01',
    facilityName: 'CHC Wai',
    facilityId: 'FAC003',
    date: '2026-09-15',
    slot: '10:30 AM',
    tokenNumber: 'GEN-042',
    status: 'CONFIRMED',
    specialization: 'General Medicine',
  },
];

export interface ActivePrescription {
  id: string;
  medicineName: string;
  dosage: string;
  daysRemaining: number;
  doctorName: string;
  facility: string;
  prescribedDate: string;
}

export const INITIAL_ACTIVE_PRESCRIPTIONS: ActivePrescription[] = [
  {
    id: 'RX-01',
    medicineName: 'Paracetamol 500mg',
    dosage: '1 tablet thrice daily',
    daysRemaining: 3,
    doctorName: 'Dr. Deshmukh',
    facility: 'CHC Wai',
    prescribedDate: '2026-09-05',
  },
  {
    id: 'RX-02',
    medicineName: 'Amoxicillin 500mg',
    dosage: '1 capsule twice daily',
    daysRemaining: 5,
    doctorName: 'Dr. Deshmukh',
    facility: 'CHC Wai',
    prescribedDate: '2026-09-04',
  },
];

export interface VitalsHistoryRecord {
  id: string;
  date: string;
  systolicBp: number;
  diastolicBp: number;
  bpFormatted: string;
  bloodSugar: number;
  sugarType: 'FASTING' | 'RANDOM' | 'POST_PRANDIAL';
  spo2: number;
  heartRate: number;
  temperatureF: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  color: 'GREEN' | 'YELLOW' | 'RED';
}

export const INITIAL_VITALS_HISTORY: VitalsHistoryRecord[] = [
  {
    id: 'VIT-001',
    date: '2026-09-01',
    systolicBp: 130,
    diastolicBp: 84,
    bpFormatted: '130/84',
    bloodSugar: 105,
    sugarType: 'FASTING',
    spo2: 98,
    heartRate: 74,
    temperatureF: 98.4,
    weightKg: 65,
    heightCm: 170,
    bmi: 22.5,
    color: 'GREEN',
  },
  {
    id: 'VIT-002',
    date: '2026-09-04',
    systolicBp: 124,
    diastolicBp: 80,
    bpFormatted: '124/80',
    bloodSugar: 112,
    sugarType: 'RANDOM',
    spo2: 98,
    heartRate: 72,
    temperatureF: 98.6,
    weightKg: 65,
    heightCm: 170,
    bmi: 22.5,
    color: 'GREEN',
  },
  {
    id: 'VIT-003',
    date: '2026-09-07',
    systolicBp: 120,
    diastolicBp: 78,
    bpFormatted: '120/78',
    bloodSugar: 98,
    sugarType: 'FASTING',
    spo2: 99,
    heartRate: 70,
    temperatureF: 98.4,
    weightKg: 65,
    heightCm: 170,
    bmi: 22.5,
    color: 'GREEN',
  },
];

export type PhrCategory =
  | 'LAB_REPORT'
  | 'PRESCRIPTION'
  | 'DISCHARGE_SUMMARY'
  | 'IMMUNIZATION_RECORD';

export interface PhrDocumentRecord {
  id: string;
  title: string;
  titleMr: string;
  category: PhrCategory;
  date: string;
  year: number;
  facility: string;
  doctor: string;
  checksumSha256: string;
  signedBy: string;
  cachedLocally: boolean;
  contentSummary: string;
  parameters?: Array<{ name: string; value: string; normalRange: string; flag: 'NORMAL' | 'ABNORMAL' | 'CRITICAL' }>;
  medications?: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
}

export const INITIAL_PHR_DOCUMENTS: PhrDocumentRecord[] = [
  {
    id: 'REC-001',
    title: 'Discharge Summary - Normal Delivery',
    titleMr: 'डिस्चार्ज सारांश - सामान्य प्रसूती',
    category: 'DISCHARGE_SUMMARY',
    date: '2026-08-20',
    year: 2026,
    facility: 'District Hospital Satara',
    doctor: 'Dr. V. M. Kulkarni',
    checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signedBy: 'ABDM-M3-GATEWAY',
    cachedLocally: true,
    contentSummary: 'Uneventful institutional delivery. Healthy female infant 2.9kg. Mother and child discharged in stable condition with IFA and Calcium supplements.',
  },
  {
    id: 'DOC-ABDM-01',
    title: 'Complete Blood Count (CBC) & Hb Test',
    titleMr: 'रक्त तपासणी अहवाल (सीबीसी व हिमोग्लोबिन)',
    category: 'LAB_REPORT',
    date: '2026-09-02',
    year: 2026,
    facility: 'CHC Wai Laboratory',
    doctor: 'Dr. A. R. Deshmukh',
    checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signedBy: 'ABDM-M3-GATEWAY',
    cachedLocally: true,
    contentSummary: 'Hemoglobin slightly low at 10.8 g/dL (Mild Anemia). Platelets and WBC count within normal limits.',
    parameters: [
      { name: 'Hemoglobin (Hb)', value: '10.8 g/dL', normalRange: '12.0 - 16.0 g/dL', flag: 'ABNORMAL' },
      { name: 'WBC Count', value: '7,200 /mcL', normalRange: '4,000 - 11,000 /mcL', flag: 'NORMAL' },
      { name: 'Platelet Count', value: '240,000 /mcL', normalRange: '150,000 - 450,000 /mcL', flag: 'NORMAL' },
    ],
  },
  {
    id: 'PHR-DOC-001',
    title: 'Antenatal Care Digital Prescription',
    titleMr: 'प्रसूतीपूर्व तपासणी डिजिटल प्रिस्क्रिप्शन',
    category: 'PRESCRIPTION',
    date: '2026-09-05',
    year: 2026,
    facility: 'Sub-Centre Tapola',
    doctor: 'Dr. A. R. Deshmukh',
    checksumSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    signedBy: 'ABDM-M3-GATEWAY',
    cachedLocally: true,
    contentSummary: 'Prescribed Iron & Folic Acid, Calcium, and Paracetamol for intermittent antenatal headache.',
    medications: [
      { name: 'Iron & Folic Acid (IFA)', dosage: '100mg+0.5mg', frequency: '1 tablet daily after food', duration: '30 days' },
      { name: 'Paracetamol 500mg', dosage: '500mg', frequency: '1 tab SOS for headache', duration: '5 days' },
      { name: 'Calcium + Vit D3', dosage: '500mg', frequency: '1 tablet daily', duration: '30 days' },
    ],
  },
  {
    id: 'IMM-2026-01',
    title: 'Tetanus Toxoid (TT) & UIP Immunization Card',
    titleMr: 'धनुर्वात व राष्ट्रीय लसीकरण प्रमाणपत्र',
    category: 'IMMUNIZATION_RECORD',
    date: '2026-07-14',
    year: 2026,
    facility: 'Sub-Centre Tapola',
    doctor: 'Sister Anandi Gaikwad (ANM)',
    checksumSha256: 'f8e7d6c5b4a39281701928374650192837465019283746501928374650192837',
    signedBy: 'ABDM-M3-GATEWAY',
    cachedLocally: true,
    contentSummary: 'TT Booster administered (Batch #TT-9982). Pentavalent & BCG schedule confirmed for infant.',
  },
  {
    id: 'REC-2025-09',
    title: 'Antenatal Ultrasound Screening Report',
    titleMr: 'सोनोग्राफी तपासणी अहवाल (२०२५)',
    category: 'LAB_REPORT',
    date: '2025-11-10',
    year: 2025,
    facility: 'District Hospital Satara',
    doctor: 'Dr. S. P. Patil',
    checksumSha256: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    signedBy: 'ABDM-M3-GATEWAY',
    cachedLocally: false,
    contentSummary: 'Single intrauterine gestation with normal fetal cardiac activity. Amniotic fluid index normal.',
  },
];
```

---

## 3. Screen Blueprint: F21 — PatientDashboardScreen.tsx

### Architecture & UI Layout
File: `mobile/src/screens/patient/PatientDashboardScreen.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Header: HealthWay | Patient & Citizen Portal | SOS Button   │
├─────────────────────────────────────────────────────────────┤
│ 1. Digital ABHA Card (Navy Blue #1A4B8C)                    │
│   • Avatar circle & patientName: 'Sunita Ramchandra Jadhav' │
│   • ABHA ID: '14-4821-9876-5432' · Aadhaar: 4821 · Age/Sex  │
│   • Badges: [ABDM Linked (Green)] [Satara District]         │
│   • Visual QR Box: https://healthway.gov.in/phr/14-4821-... │
├─────────────────────────────────────────────────────────────┤
│ 2. Vitals Summary Card Widget (F21-4)                       │
│   • latestBp: 124/82 mmHg · latestSugar: 110 mg/dL          │
│   • latestSpo2: 98% · lastRecordedDate: 2026-09-06          │
│   • Status Badge: NORMAL (GREEN)                            │
│   • Button: "Track & Log Vitals" -> nav('VitalsTracker')    │
├─────────────────────────────────────────────────────────────┤
│ 3. Upcoming Consultations Widget (F21-2)                    │
│   • Dr. Deshmukh (General Medicine) @ CHC Wai               │
│   • Date: 2026-09-15 · Slot: 10:30 AM · Token: GEN-042      │
│   • Button: "Book / Manage" -> nav('AppointmentBooking')    │
├─────────────────────────────────────────────────────────────┤
│ 4. Active Prescriptions Widget (F21-3)                      │
│   • Paracetamol 500mg · 1 tab thrice daily (3 days left)    │
│   • Amoxicillin 500mg · 1 cap twice daily (5 days left)     │
│   • Button: "PHR Health Locker" -> nav('PhrLocker')         │
├─────────────────────────────────────────────────────────────┤
│ 5. Quick Action Shortcuts Grid (F21-5) (2x3 Grid)           │
│   [Emergency SOS]       [Book Appointment]                  │
│   [Track Vitals]        [PHR Locker]                        │
│   [AI Symptom Triage]   [OPD Live Queue]                    │
├─────────────────────────────────────────────────────────────┤
│ 6. Shared Healthcare Operational Hubs                       │
│   • Diagnostics Hub (48 Tests & Sample Tracker)             │
│   • Hospital Referrals (7-Stage Pipeline & Feedback)        │
│   • Medicine Availability (EDL Stock Checker)               │
└─────────────────────────────────────────────────────────────┘
```

### Key Implementation Details
- Connects to `useAuth()`: Reads user name and ABHA ID with fallback to `DEFAULT_PATIENT_PROFILE`.
- Connects to `storageEngine`: Loads dynamic cached vitals and appointments from `patient_cache` if available, falling back to seed data.
- Handles instant trilingual switching via `useLanguage()`.
- Uses `AppIcon` from `mobile/src/theme/icons.tsx` for all icons (zero emojis).

---

## 4. Screen Blueprint: F22 — VitalsTrackerScreen.tsx

### Architecture & UI Layout
File: `mobile/src/screens/patient/VitalsTrackerScreen.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Vitals Tracker | Health Status Monitor              │
├─────────────────────────────────────────────────────────────┤
│ 1. Alert Banner (Conditional: Normal / Elevated / Critical) │
│   • Critical Hypoxia / BP: Bright RED Banner + Emergency SOS│
│   • Borderline: Orange Warning Banner                       │
│   • Normal: Crisp Green Status Banner                       │
├─────────────────────────────────────────────────────────────┤
│ 2. Vitals Input Form                                        │
│   • Systolic & Diastolic Blood Pressure (mmHg)              │
│   • Blood Sugar (mg/dL) + Mode [Fasting / PPBS / Random]    │
│   • Oxygen Saturation SpO2 (%)                              │
│   • Heart Rate / Pulse (bpm)                                │
│   • Temperature (°F)                                        │
│   • Height (cm) & Weight (kg) -> Auto-Calculates BMI (F22-2)│
│   • "Evaluate & Log Reading" Button                         │
├─────────────────────────────────────────────────────────────┤
│ 3. Chronological History Log (F22-5)                        │
│   • List of logged vitals readings                          │
│   • Shows Date, BP, Sugar, SpO2, BMI badge, and status color│
│   • Persisted in `patient_cache` store                      │
└─────────────────────────────────────────────────────────────┘
```

### Clinical Evaluation Logic
1. **BP Stage-2 Hypertensive Check (F22-3)**:
   - If Systolic >= 160 or Diastolic >= 100 or Systolic <= 85 or Diastolic <= 50:
     - `isCritical = true`, `color = 'RED'`
     - Warning: `Critical Blood Pressure: ${systolic}/${diastolic} mmHg`
2. **Hypoxia Check (F22-4)**:
   - If SpO2 < 90%:
     - `isCritical = true`, `color = 'RED'`
     - Warning: `Critical Hypoxia: SpO2 ${spo2}%`
3. **BMI Formula (F22-2)**:
   - `calculateBmi(weightKg, heightCm) => +(weight / ((height/100)^2)).toFixed(1)`
   - 65kg, 170cm = 22.5 (Normal)
   - 85kg, 170cm = 29.4 (Overweight)
4. **Offline Persistence**:
   - `await storageEngine.saveItem('patient_cache', 'vitals_' + Date.now(), reading)`
   - `await storageEngine.enqueueSync('/api/v1/vitals', 'POST', reading)`

---

## 5. Screen Blueprint: F23 — AppointmentBookingScreen.tsx

### Architecture & UI Layout
File: `mobile/src/screens/patient/AppointmentBookingScreen.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Book Doctor Appointment | Satara District Network   │
├─────────────────────────────────────────────────────────────┤
│ Step 1: Center Selector (F23-1)                             │
│   • Facility Type Pills: [ALL] [Hospital] [CHC] [PHC]       │
│   • Search bar: Filter 7 District Facilities                │
│   • Cards: Facility name, type, beds, doctor in charge      │
├─────────────────────────────────────────────────────────────┤
│ Step 2: Doctor & Specialization Selector (F23-2)            │
│   • Specializations: [General Medicine] [OBGYN] [Pediatrics]│
│   • Doctor card: Name, MCI Reg, Qualification, Availability │
├─────────────────────────────────────────────────────────────┤
│ Step 3: Date & Slot Picker (F23-3)                          │
│   • Horizontal Date Bar (Today, Tomorrow, +7 Days)          │
│   • Time Slots Grid:                                        │
│     - 09:30 AM (Available)   - 10:00 AM (Booked / Disabled) │
│     - 10:30 AM (Available)   - 11:00 AM (Available)        │
│     - 02:00 PM (Available)   - 02:30 PM (Available)        │
├─────────────────────────────────────────────────────────────┤
│ Step 4: Patient Details & Confirmation (F23-4, F23-5)       │
│   • Patient Name (Sunita Jadhav), ABHA ID                   │
│   • "Confirm Appointment" Button -> Generates Token         │
│   • Modal Confirmation: Token `GEN-042`, Booking ID         │
│   • Actions: "Add to Calendar", "Cancel", "Reschedule"      │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Details
1. **Facility Directory (F23-1)**:
   - Direct integration with `DISTRICT_FACILITIES` (length 7).
2. **Specialization Filtering (F23-2)**:
   - Doctor list filtered by:
     - `General Medicine`: Dr. Deshmukh (DOC-01), Dr. V. M. Kulkarni
     - `Obstetrics & Gynecology`: Dr. Patil (DOC-02)
     - `Pediatrics`: Dr. Kulkarni (DOC-03)
     - `Orthopedics`: Dr. More
3. **Double-Booking Prevention (F23-3)**:
   - Slot objects maintain `booked: boolean`. Booked slots render as disabled with red/gray badge, preventing tap selection.
4. **Token Generation (F23-4)**:
   - Generates token e.g. `GEN-042` or `ANC-01` with status `'CONFIRMED'`.
5. **Status Workflow (F23-5)**:
   - Allows cancellation (`status = 'CANCELLED'`) or rescheduling (`status = 'RESCHEDULED'`).
6. **Offline Persistence**:
   - Saves booking to `patient_cache`.
   - Queues booking to `sync_queue`: `await storageEngine.enqueueSync('/api/v1/appointments', 'POST', booking)`.

---

## 6. Screen Blueprint: F24 — PhrLockerScreen.tsx

### Architecture & UI Layout
File: `mobile/src/screens/patient/PhrLockerScreen.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Digital Health Locker (PHR) | ABDM Certified        │
├─────────────────────────────────────────────────────────────┤
│ Category Tabs (F24-1)                                       │
│   [ALL (5)] [LAB REPORTS (2)] [PRESCRIPTIONS (1)]           │
│   [DISCHARGE SUMMARIES (1)]   [IMMUNIZATIONS (1)]           │
├─────────────────────────────────────────────────────────────┤
│ Search & Year Filter (F24-3)                                │
│   • Search: Search records by title, doctor, facility       │
│   • Year Filter: [All Years] [2026] [2025]                  │
├─────────────────────────────────────────────────────────────┤
│ Document List Items                                         │
│   • Document Title (e.g. Discharge Summary - Normal Deliv.) │
│   • Category Badge & Date (2026-08-20)                      │
│   • Offline Badge (F24-5): [Offline Ready] (Green check)    │
│   • ABDM Badge (F24-4): [ABDM Verified] (Blue shield)       │
│   • Action Buttons: [View Details] [Download / Share PDF]   │
├─────────────────────────────────────────────────────────────┤
│ Document Preview Modal (F24-4)                              │
│   • Full clinical breakdown & parameters                    │
│   • SHA-256 Checksum: `e3b0c44298fc1c14...` (64 chars)      │
│   • Signed By: `ABDM-M3-GATEWAY`                            │
├─────────────────────────────────────────────────────────────┤
│ Native PDF Export & Sharing                                 │
│   • Calls `expo-print`: `Print.printToFileAsync({ html })`  │
│   • Calls `expo-sharing`: `Sharing.shareAsync(uri, ...)`    │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Details
1. **Record Categories (F24-1)**:
   - `LAB_REPORT`, `PRESCRIPTION`, `DISCHARGE_SUMMARY`, `IMMUNIZATION_RECORD`.
2. **Offline Caching (F24-2)**:
   - Pre-seeds and loads from `patient_cache` store.
3. **Filtering & Slicing (F24-3)**:
   - Filterable simultaneously by category and year/date.
4. **ABDM Checksum & Signature (F24-4)**:
   - Verifies 64-character SHA-256 hash and signed gateway identity.
5. **Offline Indicator Badge (F24-5)**:
   - Renders "Offline Ready" badge when `cachedLocally === true`.
6. **PDF Generator HTML Template**:
   - Styled with Government of Maharashtra crest, watermarks, clinical metadata, and tabular findings.

---

## 7. Screen Blueprint: F25 — SymptomTriageScreen.tsx

### Architecture & UI Layout
File: `mobile/src/screens/patient/SymptomTriageScreen.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Header: AI Symptom Triage | Clinical Risk Assessment       │
├─────────────────────────────────────────────────────────────┤
│ 4 Step Assessment Stepper                                   │
│   [1. Pathway] -> [2. Symptoms] -> [3. Vitals] -> [4. Risk] │
├─────────────────────────────────────────────────────────────┤
│ Step 1: 4 Clinical Pathways (F25-1)                         │
│   [Chest Pain / Cardiac]     [High Fever / Infection]       │
│   [Breathing / Dyspnea]      [Antenatal Complications]      │
├─────────────────────────────────────────────────────────────┤
│ Step 2: Specific Symptoms & Severity Questionnaire          │
│   • Symptom checklist for selected pathway                  │
│   • Duration picker: Hours, 1-2 Days, 3-5 Days, 1+ Weeks    │
│   • Severity Slider/Selector: Level 1 (Mild) to 5 (Critical)│
├─────────────────────────────────────────────────────────────┤
│ Step 3: Optional Vitals Integration (F25-4)                 │
│   • BP Systolic / Diastolic, SpO2, Heart Rate, Sugar, Temp  │
│   • "Fetch Latest Logged Vitals" button                     │
├─────────────────────────────────────────────────────────────┤
│ Step 4: Urgency Risk Evaluation Result                      │
│   • RED Alert (F25-2): Critical Emergency (108 Required)    │
│     - Guidance (Trilingual F25-5): en, mr (१०८), hi (108)  │
│     - 1-Tap "Call 108" & "Dispatch Emergency SOS"           │
│   • ORANGE Alert: Urgent Priority (<30 min hospital consult)│
│   • YELLOW Alert (F25-3): Schedule OPD consult today        │
│     - 1-Tap "Book OPD Appointment"                          │
│   • GREEN Alert: Mild condition, home care protocol         │
│   • Vitals Override Indicator (F25-4)                       │
├─────────────────────────────────────────────────────────────┤
│ Offline Draft Storage: Saves to `triage_drafts` store       │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Details
1. **4 Structured Pathways (F25-1)**:
   - `CHEST_PAIN`, `HIGH_FEVER`, `DYSPNEA`, `ANTENATAL_COMPLICATIONS`.
2. **Critical Symptom Classification (F25-2)**:
   - `CHEST_PAIN_SEVERE`, `RESPIRATORY_ARREST`, or Severity >= 4 yields `level: 'RED'`.
   - `actionEn`: contains `'108 emergency ambulance'`.
3. **Moderate Symptom Classification (F25-3)**:
   - `FEVER_MILD` at severity 2 yields `level: 'YELLOW'`.
   - `actionEn`: contains `'OPD queue'`.
4. **Critical Vitals Override (F25-4)**:
   - If patient inputs critical vitals (e.g. BP 185/120, SpO2 86%, Sugar 290), triage level is automatically escalated to `RED` regardless of base symptom severity.
5. **Trilingual Output (F25-5)**:
   - Payload includes `guidance.en`, `guidance.mr` (containing `१०८`), and `guidance.hi` (containing `108`).
6. **Persistence**:
   - Saves triage assessment into `triage_drafts` store (`storageEngine.saveItem('triage_drafts', assessmentId, result)`).

---

## 8. Navigation Updates: Types & PatientNavigator

### 8.1 `mobile/src/types/navigation.ts`
Update `PatientStackParamList` to declare all 5 screens with `undefined` param types:

```typescript
export type PatientStackParamList = {
  PatientDashboard: undefined;
  VitalsTracker: undefined;
  AppointmentBooking: undefined;
  PhrLocker: undefined;
  SymptomTriage: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  QueueTV: undefined;
  MedicineHub: undefined;
  EmergencySOS: undefined;
};
```

### 8.2 `mobile/src/navigation/PatientNavigator.tsx`
Update to mount all 5 patient screens:

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../types/navigation';
import { PatientDashboardScreen } from '../screens/patient/PatientDashboardScreen';
import { VitalsTrackerScreen } from '../screens/patient/VitalsTrackerScreen';
import { AppointmentBookingScreen } from '../screens/patient/AppointmentBookingScreen';
import { PhrLockerScreen } from '../screens/patient/PhrLockerScreen';
import { SymptomTriageScreen } from '../screens/patient/SymptomTriageScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { QueueTVScreen } from '../screens/hubs/QueueTVScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PatientDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.slate.bg },
      }}
    >
      <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
      <Stack.Screen name="VitalsTracker" component={VitalsTrackerScreen} />
      <Stack.Screen name="AppointmentBooking" component={AppointmentBookingScreen} />
      <Stack.Screen name="PhrLocker" component={PhrLockerScreen} />
      <Stack.Screen name="SymptomTriage" component={SymptomTriageScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="QueueTV" component={QueueTVScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
```

---

## 9. Implementation Checklist for Worker Agent

When implementing Milestone 3 Patient Portal features:
- [ ] Create `mobile/src/services/vitalsService.ts` with `evaluateVitalsAlert`, `calculateBmi`.
- [ ] Create `mobile/src/services/triageService.ts` with `evaluateTriageLevel`, symptom pathways, trilingual guidance.
- [ ] Create `mobile/src/data/patientData.ts` with default profile, appointments, prescriptions, vitals history, and seed PHR documents.
- [ ] Implement `mobile/src/screens/patient/PatientDashboardScreen.tsx` with all 6 widgets & cards.
- [ ] Implement `mobile/src/screens/patient/VitalsTrackerScreen.tsx` with alert banner, logger, and history.
- [ ] Implement `mobile/src/screens/patient/AppointmentBookingScreen.tsx` with 4-step booking flow and token generation.
- [ ] Implement `mobile/src/screens/patient/PhrLockerScreen.tsx` with categorized tabs, ABDM verification, and PDF export.
- [ ] Implement `mobile/src/screens/patient/SymptomTriageScreen.tsx` with 4 pathways, vitals override, and trilingual recommendations.
- [ ] Update `mobile/src/types/navigation.ts` and `mobile/src/navigation/PatientNavigator.tsx`.
- [ ] Verify `npm run typecheck` (`tsc --noEmit`) passes with 0 errors.
- [ ] Verify `npx jest __tests__/tier1_features/patient_asha.test.ts` passes 100% of tests.
