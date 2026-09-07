/**
 * Authoritative Patient Portal Seed Data & Fixtures
 * HealthWay Native Mobile Platform - Complies with F21-F24 specifications and ABDM standards
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
