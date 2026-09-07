# Architecture & Implementation Blueprint: Clinical Hubs & Mock Datasets (Milestone 2)

**Author:** M2 Clinical Hubs Explorer (`m2_explorer_2`)  
**Assigned Role:** Teamwork Preview Explorer — Clinical Hubs Investigation  
**Working Directory:** `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_2\`  
**Target Output Files for Worker:**
- `mobile/src/data/diagnosticCatalog.ts`
- `mobile/src/data/edlMedicines.ts`
- `mobile/src/data/referralsData.ts`
- `mobile/src/data/facilitiesData.ts`
- `mobile/src/data/index.ts`
- `mobile/src/screens/hubs/DiagnosticsHubScreen.tsx`
- `mobile/src/screens/hubs/ReferralsHubScreen.tsx`
- `mobile/src/screens/hubs/MedicineHubScreen.tsx`

---

## 1. Executive Summary & System Context

HealthWay's clinical backbone is comprised of three cross-cutting operational hubs that serve all four actor roles (Patient, ASHA Worker, Doctor, and District Admin):
1. **Diagnostics Hub**: Provides a 48-test clinical test directory across 5 specialties, 4-stage barcode-tracked sample telemetry (`MH-LAB-XXXXXX`), and an interactive NABL-compliant lab report viewer with automated PDF generation and native sharing (`expo-print` & `expo-sharing`).
2. **Referrals Hub**: Manages a 7-stage inter-facility transfer pipeline (`CREATED` through `COMPLETED`), enforces statutory clinical SLAs (`IMMEDIATE`, `URGENT`, `PRIORITY`, `ROUTINE`) with real-time countdown badges and overdue alerts, and presents closed-loop counter-referral specialist feedback.
3. **Medicine Availability Hub**: Implements an 18+ Essential Drug List (EDL) catalog with multi-tier stock tracking across 7 Satara district facilities (`FAC001` to `FAC007`), an active salt generic substitution recommendation engine, and an auto-indent warehouse reorder requisition system.

All designs strictly conform to:
- Zero Unicode emojis (all icons use `@expo/vector-icons` via `mobile/src/theme/icons.tsx`).
- Maharashtra Government Design System (Navy `#1A4B8C`, Saffron `#F57C00`, Dark Slate `#1C2B3A`, Gray `#546E7A`).
- Trilingual localization (`en`, `mr`, `hi`) via `useLanguage()`.
- Offline persistence via `mobile/src/storage/` (`storageEngine.saveItem`, `storageEngine.getItem`).
- Zero modification to any web/backend codebase files outside `mobile/`.

---

## 2. Blueprint 1: Authoritative Mock Datasets (`mobile/src/data/`)

### 2.1 `mobile/src/data/diagnosticCatalog.ts`
This file delivers the complete 48-test diagnostic directory matching `src/services/diagnosticService.ts` and `domainFixtures.ts`.

```typescript
/**
 * Authoritative 48-Test Diagnostic Directory & Initial Sample Orders
 * Complies with Features 10-12, Tier 1, and Tier 2 boundary requirements.
 */

import { LabTest, ParameterResult } from '../types/diagnostics';

export type DiagnosticCategory =
  | 'Hematology'
  | 'Biochemistry'
  | 'Microbiology'
  | 'Radiology'
  | 'Pathology';

export interface DiagnosticCatalogItem {
  id: string;
  code: string;
  name: string;
  nameMr: string;
  category: DiagnosticCategory;
  categoryLabelMr: string;
  sampleType: string;
  fastingRequired: boolean;
  tatHours: number;
  isEmpanelledGovt: boolean;
  normalRange: string;
  defaultParameters?: ParameterResult[];
}

export const DIAGNOSTIC_CATEGORIES: DiagnosticCategory[] = [
  'Hematology',
  'Biochemistry',
  'Pathology',
  'Microbiology',
  'Radiology',
];

export const DIAGNOSTIC_CATALOG_48: DiagnosticCatalogItem[] = [
  // ==================== 1. HEMATOLOGY (12 Tests) ====================
  {
    id: 'TEST-HEM-01',
    code: 'HEM-01',
    name: 'Complete Blood Count (CBC)',
    nameMr: 'संपूर्ण रक्त तपासणी (CBC + Platelets)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'Hb: 12-16 g/dL, WBC: 4000-11000/mcL, Platelets: 1.5-4.5L',
    defaultParameters: [
      { parameterId: 'p1', name: 'Hemoglobin (Hb)', nameMr: 'हिमोग्लोबिन', value: '13.5', unit: 'g/dL', referenceRange: '12.0 - 16.0', flag: 'NORMAL' },
      { parameterId: 'p2', name: 'Total Leucocyte Count (WBC)', nameMr: 'पांढऱ्या पेशी', value: '7,200', unit: '/cu.mm', referenceRange: '4,000 - 11,000', flag: 'NORMAL' },
      { parameterId: 'p3', name: 'Platelet Count', nameMr: 'प्लेटलेट्स', value: '2.4', unit: 'Lakh/cu.mm', referenceRange: '1.5 - 4.5', flag: 'NORMAL' },
      { parameterId: 'p4', name: 'RBC Count', nameMr: 'तांबड्या पेशी', value: '4.5', unit: 'mil/cu.mm', referenceRange: '3.8 - 5.2', flag: 'NORMAL' },
      { parameterId: 'p5', name: 'ESR (Westergren)', nameMr: 'इएसआर', value: '14', unit: 'mm/1st hr', referenceRange: '0 - 20', flag: 'NORMAL' },
    ],
  },
  {
    id: 'TEST-HEM-02',
    code: 'HEM-02',
    name: 'Hemoglobin (Hb) Rapid Test',
    nameMr: 'हिमोग्लोबिन त्वरित चाचणी (PoCT)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Capillary Blood',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: '12.0 - 16.0 g/dL',
  },
  {
    id: 'TEST-HEM-03',
    code: 'HEM-03',
    name: 'Blood Grouping & Rh Typing',
    nameMr: 'रक्तगट व आरएच फॅक्टर',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'A/B/AB/O, Rh Positive/Negative',
  },
  {
    id: 'TEST-HEM-04',
    code: 'HEM-04',
    name: 'Peripheral Blood Smear (Malaria)',
    nameMr: 'पेरिफेरल ब्लड स्मीअर (मलेरिया)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Blood Smear',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
    normalRange: 'Negative for Malaria Parasite',
  },
  {
    id: 'TEST-HEM-05',
    code: 'HEM-05',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    nameMr: 'इएसआर तपासणी',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood Citrate',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
    normalRange: '0 - 20 mm/hr',
  },
  {
    id: 'TEST-HEM-06',
    code: 'HEM-06',
    name: 'Platelet Count Manual & Automated',
    nameMr: 'प्लेटलेट्स मोजणी',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
    normalRange: '150,000 - 450,000 /mcL',
  },
  {
    id: 'TEST-HEM-07',
    code: 'HEM-07',
    name: 'Sickle Cell Solubility & HPLC',
    nameMr: 'सिकल सेल चाचणी व एचपीएलसी',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 12,
    isEmpanelledGovt: true,
    normalRange: 'Negative / Normal HbA pattern',
  },
  {
    id: 'TEST-HEM-08',
    code: 'HEM-08',
    name: 'Prothrombin Time & INR (PT-INR)',
    nameMr: 'प्रोथ्रोम्बिन टाईम (PT / INR)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Citrated Plasma',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
    normalRange: 'INR: 0.8 - 1.2',
  },
  {
    id: 'TEST-HEM-09',
    code: 'HEM-09',
    name: 'Reticulocyte Count',
    nameMr: 'रेटिक्युलोसाईट संख्या',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: '0.5% - 2.5%',
  },
  {
    id: 'TEST-HEM-10',
    code: 'HEM-10',
    name: 'Bleeding & Clotting Time (BT/CT)',
    nameMr: 'रक्तस्राव व गोठण वेळ',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Capillary Blood',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: 'BT: 1-4 mins, CT: 3-8 mins',
  },
  {
    id: 'TEST-HEM-11',
    code: 'HEM-11',
    name: 'Direct & Indirect Coombs Test',
    nameMr: 'कुम्ब्स चाचणी (Rh इनकॉम्पॅटिबिलिटी)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
    normalRange: 'Negative',
  },
  {
    id: 'TEST-HEM-12',
    code: 'HEM-12',
    name: 'Serum Ferritin & Iron TIBC Profile',
    nameMr: 'सिरम फेरिटिन व आयर्न प्रोफाईल',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी',
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 12,
    isEmpanelledGovt: true,
    normalRange: 'Ferritin: 15-200 ng/mL, Iron: 60-170 mcg/dL',
  },

  // ==================== 2. BIOCHEMISTRY (12 Tests) ====================
  {
    id: 'TEST-BIO-01',
    code: 'BIO-01',
    name: 'Fasting Blood Sugar (FBS)',
    nameMr: 'उपाशीपोटी रक्तातील साखर',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Fluoride Plasma',
    fastingRequired: true,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: '70 - 100 mg/dL',
    defaultParameters: [
      { parameterId: 'bp1', name: 'Fasting Blood Sugar', nameMr: 'उपाशीपोटी साखर', value: '92', unit: 'mg/dL', referenceRange: '70 - 100', flag: 'NORMAL' },
    ],
  },
  {
    id: 'TEST-BIO-02',
    code: 'BIO-02',
    name: 'Postprandial Blood Sugar (PPBS)',
    nameMr: 'जेवणानंतर २ तास साखर',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Fluoride Plasma',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: '< 140 mg/dL',
  },
  {
    id: 'TEST-BIO-03',
    code: 'BIO-03',
    name: 'Random Blood Sugar (RBS)',
    nameMr: 'रक्तातील साखर (Emergency PoCT)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum / Capillary',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: '70 - 140 mg/dL',
  },
  {
    id: 'TEST-BIO-04',
    code: 'BIO-04',
    name: 'HbA1c Glycated Hemoglobin',
    nameMr: 'ग्लायकेटेड हिमोग्लोबिन (HbA1c)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
    normalRange: '< 5.7% (Normal), 5.7-6.4% (Pre-diabetic)',
  },
  {
    id: 'TEST-BIO-05',
    code: 'BIO-05',
    name: 'Liver Function Test (LFT)',
    nameMr: 'यकृत कार्यक्षमता चाचणी (LFT)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: true,
    tatHours: 6,
    isEmpanelledGovt: true,
    normalRange: 'Bilirubin: 0.2-1.2 mg/dL, SGPT: 7-56 U/L, SGOT: 5-40 U/L',
  },
  {
    id: 'TEST-BIO-06',
    code: 'BIO-06',
    name: 'Kidney Function Test (KFT/RFT)',
    nameMr: 'मूत्रपिंड कार्यक्षमता चाचणी (KFT/RFT)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
    normalRange: 'Urea: 15-40 mg/dL, Creatinine: 0.6-1.2 mg/dL, Uric Acid: 3.5-7.2 mg/dL',
  },
  {
    id: 'TEST-BIO-07',
    code: 'BIO-07',
    name: 'Serum Electrolytes (Na, K, Cl)',
    nameMr: 'सिरम इलेक्ट्रोलाइट्स',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'Na: 135-145 mEq/L, K: 3.5-5.0 mEq/L, Cl: 96-106 mEq/L',
  },
  {
    id: 'TEST-BIO-08',
    code: 'BIO-08',
    name: 'Lipid Profile',
    nameMr: 'लिपिड प्रोफाईल (कोलेस्टेरॉल)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: true,
    tatHours: 8,
    isEmpanelledGovt: true,
    normalRange: 'Total Cholesterol: <200 mg/dL, Triglycerides: <150 mg/dL, HDL: >40 mg/dL',
  },
  {
    id: 'TEST-BIO-09',
    code: 'BIO-09',
    name: 'High-Sensitivity Cardiac Troponin I (hs-cTnI)',
    nameMr: 'कार्डियाक ट्रॉपोनिन I (तातडीचे)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: '< 19.8 pg/mL',
  },
  {
    id: 'TEST-BIO-10',
    code: 'BIO-10',
    name: 'Thyroid Profile (TSH, FT3, FT4)',
    nameMr: 'थायरॉईड प्रोफाईल',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 8,
    isEmpanelledGovt: true,
    normalRange: 'TSH: 0.4 - 4.2 mcIU/mL',
  },
  {
    id: 'TEST-BIO-11',
    code: 'BIO-11',
    name: 'Serum Calcium & Phosphorus',
    nameMr: 'कॅल्शियम व फॉस्फरस',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'Calcium: 8.5-10.5 mg/dL, Phosphorus: 2.5-4.5 mg/dL',
  },
  {
    id: 'TEST-BIO-12',
    code: 'BIO-12',
    name: 'Quantitative hs-CRP (C-Reactive Protein)',
    nameMr: 'सी-रिॲक्टिव्ह प्रोटीन (hs-CRP)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: '< 3.0 mg/L',
  },

  // ==================== 3. PATHOLOGY / URINE (8 Tests) ====================
  {
    id: 'TEST-PTH-01',
    code: 'URI-01',
    name: 'Urine Routine & Microscopic Examination',
    nameMr: 'लघवी रुटीन व मायक्रोस्कोपी',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Fresh Midstream Urine',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Protein: Nil, Sugar: Nil, Pus cells: 0-4/hpf, RBC: Nil',
  },
  {
    id: 'TEST-PTH-02',
    code: 'URI-02',
    name: 'Rapid Urine Pregnancy Test (UPT)',
    nameMr: 'त्वरित गर्भधारणा चाचणी (UPT)',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Early Morning Urine',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: 'Negative / Positive',
  },
  {
    id: 'TEST-PTH-03',
    code: 'URI-03',
    name: 'Urine Albumin & Sugar (Dipstick Strip)',
    nameMr: 'युरिन अल्ब्युमिन व शुगर स्ट्रीप',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Random Urine',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: 'Nil / Negative',
  },
  {
    id: 'TEST-PTH-04',
    code: 'URI-04',
    name: 'Urine Albumin-to-Creatinine Ratio (UACR)',
    nameMr: 'युरिन अल्ब्युमिन-क्रिएटिनिन गुणोत्तर',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Spot Urine',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
    normalRange: '< 30 mg/g',
  },
  {
    id: 'TEST-PTH-05',
    code: 'URI-05',
    name: '24-Hour Urinary Protein Excretion',
    nameMr: '२४ तास युरिन प्रोटीन',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: '24-Hour Urine Collection',
    fastingRequired: false,
    tatHours: 24,
    isEmpanelledGovt: true,
    normalRange: '< 150 mg/24 hr',
  },
  {
    id: 'TEST-PTH-06',
    code: 'URI-06',
    name: 'Stool Routine, Parasites & Occult Blood (FOBT)',
    nameMr: 'शौचाची तपासणी व गुप्त रक्त',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Stool Specimen',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'No Ova/Cysts, FOBT Negative',
  },
  {
    id: 'TEST-PTH-07',
    code: 'URI-07',
    name: 'Urine Bile Salts & Bile Pigments',
    nameMr: 'युरिन बाईल सॉल्ट्स व पिगमेंट',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Fresh Urine',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Negative (Hay\'s & Fouchet\'s test)',
  },
  {
    id: 'TEST-PTH-08',
    code: 'URI-08',
    name: 'Bence Jones Protein Heat Test',
    nameMr: 'बेन्स जोन्स प्रोटीन तपासणी',
    category: 'Pathology',
    categoryLabelMr: 'पॅथॉलॉजी व युरिन',
    sampleType: 'Early Morning Urine',
    fastingRequired: false,
    tatHours: 8,
    isEmpanelledGovt: true,
    normalRange: 'Negative',
  },

  // ==================== 4. MICROBIOLOGY & SEROLOGY (8 Tests) ====================
  {
    id: 'TEST-MIC-01',
    code: 'MIC-01',
    name: 'GeneXpert MTB/RIF Sputum CBNAAT',
    nameMr: 'क्षयरोग जिन-एक्स्पर्ट (CBNAAT)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Early Morning Sputum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'MTB Not Detected',
  },
  {
    id: 'TEST-MIC-02',
    code: 'MIC-02',
    name: 'Sputum Acid-Fast Bacilli (AFB) Smear',
    nameMr: 'थुंकी मायक्रोस्कोपी (AFB ZN Staining)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Sputum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Negative for Acid Fast Bacilli',
  },
  {
    id: 'TEST-MIC-03',
    code: 'MIC-03',
    name: 'Widal Agglutination Reaction (Typhoid)',
    nameMr: 'विडल चाचणी (टायफॉईड)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
    normalRange: 'TO < 1:80, TH < 1:80',
  },
  {
    id: 'TEST-MIC-04',
    code: 'MIC-04',
    name: 'Dengue NS1 Antigen & IgM/IgG Antibody',
    nameMr: 'डेंग्यू NS1 व अँटीबॉडी चाचणी',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Non-Reactive',
  },
  {
    id: 'TEST-MIC-05',
    code: 'MIC-05',
    name: 'HIV 1 & 2 Rapid Antibody Screen (NACO)',
    nameMr: 'एचआयव्ही १ व २ चाचणी (NACO)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Serum / Whole Blood',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Non-Reactive',
  },
  {
    id: 'TEST-MIC-06',
    code: 'MIC-06',
    name: 'Hepatitis B Surface Antigen (HBsAg Rapid)',
    nameMr: 'हिपॅटायटीस बी पृष्ठभाग अँटीजेन',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Non-Reactive',
  },
  {
    id: 'TEST-MIC-07',
    code: 'MIC-07',
    name: 'Syphilis VDRL / RPR Flocculation',
    nameMr: 'सिफिलीस व्हीडीआरएल / आरपीआर चाचणी',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'Non-Reactive',
  },
  {
    id: 'TEST-MIC-08',
    code: 'MIC-08',
    name: 'Urine Bacterial Culture & Antibiotic Sensitivity',
    nameMr: 'लघवी कल्चर व अँटिबायोटिक संवेदनशीलता',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी',
    sampleType: 'Midstream Sterile Urine',
    fastingRequired: false,
    tatHours: 48,
    isEmpanelledGovt: true,
    normalRange: 'No Growth / Sterile after 48 hrs',
  },

  // ==================== 5. RADIOLOGY & IMAGING (8 Tests) ====================
  {
    id: 'TEST-RAD-01',
    code: 'RAD-01',
    name: 'Digital Chest X-Ray (PA View)',
    nameMr: 'डिजिटल छातीचा क्ष-किरण (PA View)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Radiological Imaging',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Normal lung fields, normal cardiothoracic ratio',
  },
  {
    id: 'TEST-RAD-02',
    code: 'RAD-02',
    name: 'Obstetric Level-II Anomaly Scan (18-22 Wks)',
    nameMr: 'प्रसूतीपूर्व ॲनोमली स्कॅन (१८-२२ आठवडे)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Ultrasound Imaging',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Single live fetus, appropriate gestational age, no gross anomalies',
  },
  {
    id: 'TEST-RAD-03',
    code: 'RAD-03',
    name: 'Obstetric Color Doppler (Feto-Maternal)',
    nameMr: 'प्रसूतीपूर्व कलर डॉपलर स्कॅन',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Doppler Ultrasound',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
    normalRange: 'Normal Umbilical & Middle Cerebral Artery Doppler flow indices',
  },
  {
    id: 'TEST-RAD-04',
    code: 'RAD-04',
    name: 'Ultrasound Whole Abdomen & Pelvis',
    nameMr: 'पोट व ओटीपोटाची सोनोग्राफी (USG)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Ultrasound Imaging',
    fastingRequired: true,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'Normal liver, kidneys, gallbladder, spleen, urinary bladder',
  },
  {
    id: 'TEST-RAD-05',
    code: 'RAD-05',
    name: '12-Lead Electrocardiogram (ECG with AI Tele-ECG)',
    nameMr: '१२-लीड डिजिटल ईसीजी (ECG)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Electrocardiogram Tracing',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
    normalRange: 'Normal sinus rhythm, normal axis, no ST-T ischemic changes',
  },
  {
    id: 'TEST-RAD-06',
    code: 'RAD-06',
    name: 'Transthoracic 2D Echocardiography',
    nameMr: '२डी इकोकार्डिओग्राफी व डॉपलर',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Cardiovascular Imaging',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    normalRange: 'LVEF: 55-65%, no regional wall motion abnormalities',
  },
  {
    id: 'TEST-RAD-07',
    code: 'RAD-07',
    name: 'Non-Contrast CT Brain Emergency (Head NCCT)',
    nameMr: 'मेंदूचा सीटी स्कॅन (Head NCCT)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Multi-slice CT Scan',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
    normalRange: 'No intracranial hemorrhage, midline shift, or acute territorial infarct',
  },
  {
    id: 'TEST-RAD-08',
    code: 'RAD-08',
    name: 'Digital Bilateral Screening Mammography',
    nameMr: 'डिजिटल मॅमोग्राफी',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग',
    sampleType: 'Digital Mammogram',
    fastingRequired: false,
    tatHours: 12,
    isEmpanelledGovt: true,
    normalRange: 'BI-RADS Category 1 (Negative)',
  },
];

// Initial mock orders demonstrating the 4-stage tracking workflow
export const INITIAL_LAB_ORDERS: LabTest[] = [
  {
    id: 'ORD-001',
    orderId: 'ORD-20240616-8812',
    patientId: 'PT-001',
    patientName: 'Sunita Ramchandra Jadhav',
    abhaId: '14-4821-9876-5432',
    testCode: 'HEM-01',
    testName: 'Complete Blood Count (CBC)',
    testNameMr: 'संपूर्ण रक्त तपासणी (CBC)',
    category: 'Hematology',
    priority: 'ROUTINE',
    status: 'RESULT_READY',
    barcode: 'MH-LAB-849201',
    prescribedByDoctor: 'Dr. Meera Deshmukh (MO, PHC Shirur)',
    facilityName: 'Primary Health Centre Shirur',
    targetLabName: 'PHC Shirur Clinical Pathology Lab',
    orderedAt: '16 Jun 2024, 08:30 AM',
    collectedAt: '16 Jun 2024, 09:15 AM',
    processingAt: '16 Jun 2024, 10:00 AM',
    completedAt: '16 Jun 2024, 12:30 PM',
    sampleType: 'Whole Blood EDTA',
    fastingRequired: false,
    tatHours: 4,
    hasCriticalValue: false,
    overallImpression: 'Mild nutritional anemia (Hb 10.2 g/dL). White cell and platelet counts are within normal physiological range. Continuation of Iron & Folic Acid tablets recommended.',
    normalRange: 'Hb: 12.0-16.0 g/dL, WBC: 4000-11000/mcL',
    verifiedByPathologist: 'Dr. Sanjay Kale (MD Pathology, MMC: 48921)',
    results: [
      { parameterId: 'p1', name: 'Hemoglobin (Hb)', nameMr: 'हिमोग्लोबिन', value: '10.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'BORDERLINE', criticalReason: 'Mild anemia, continuation of IFA advised' },
      { parameterId: 'p2', name: 'Total Leucocyte Count (WBC)', nameMr: 'पांढऱ्या पेशी', value: '8,200', unit: '/cu.mm', referenceRange: '4,000 - 11,000', flag: 'NORMAL' },
      { parameterId: 'p3', name: 'Platelet Count', nameMr: 'प्लेटलेट्स', value: '2.4', unit: 'Lakh/cu.mm', referenceRange: '1.5 - 4.5', flag: 'NORMAL' },
      { parameterId: 'p4', name: 'RBC Count', nameMr: 'तांबड्या पेशी', value: '3.9', unit: 'mil/cu.mm', referenceRange: '3.8 - 5.2', flag: 'NORMAL' },
      { parameterId: 'p5', name: 'ESR (Westergren)', nameMr: 'इएसआर', value: '16', unit: 'mm/1st hr', referenceRange: '0 - 20', flag: 'NORMAL' },
    ],
  },
  {
    id: 'ORD-002',
    orderId: 'ORD-20240616-9934',
    patientId: 'PT-002',
    patientName: 'Mahadev Vitthal Patil',
    abhaId: '14-1122-3344-5566',
    testCode: 'BIO-09',
    testName: 'High-Sensitivity Cardiac Troponin I',
    testNameMr: 'कार्डियाक ट्रॉपोनिन I (तातडीचे)',
    category: 'Biochemistry',
    priority: 'CRITICAL',
    status: 'RESULT_READY',
    barcode: 'MH-LAB-992014',
    prescribedByDoctor: 'Dr. V. M. Kulkarni (Civil Surgeon, DH Satara)',
    facilityName: 'District Hospital Satara',
    targetLabName: 'DH Satara Central Emergency Biochemistry Lab',
    orderedAt: '16 Jun 2024, 09:00 AM',
    collectedAt: '16 Jun 2024, 09:10 AM',
    processingAt: '16 Jun 2024, 09:20 AM',
    completedAt: '16 Jun 2024, 09:50 AM',
    sampleType: 'Serum Clot',
    fastingRequired: false,
    tatHours: 1,
    hasCriticalValue: true,
    overallImpression: 'CRITICAL VALUE ALERT: Markedly elevated high-sensitivity Cardiac Troponin I (148.5 pg/mL) in conjunction with Random Blood Sugar of 382 mg/dL. Confirms Acute Coronary Syndrome. Immediate ICCU admission and cardiology consultation required.',
    verifiedByPathologist: 'Dr. Aniruddha Kulkarni (Chief Pathologist, MMC: 31089)',
    results: [
      { parameterId: 'cp1', name: 'Cardiac Troponin I (hs-cTnI)', nameMr: 'कार्डियाक ट्रॉपोनिन I', value: '148.5', unit: 'pg/mL', referenceRange: '< 19.8', flag: 'CRITICAL', criticalReason: 'CRITICAL ALERT: Markedly elevated troponin indicates acute myocardial injury' },
      { parameterId: 'cp2', name: 'Random Blood Glucose', nameMr: 'रक्तातील साखर', value: '382', unit: 'mg/dL', referenceRange: '70 - 140', flag: 'CRITICAL', criticalReason: 'CRITICAL ALERT: Severe hyperglycemia, risk of ketoacidosis' },
      { parameterId: 'cp3', name: 'Serum Creatinine', nameMr: 'सिरम क्रिएटिनिन', value: '1.3', unit: 'mg/dL', referenceRange: '0.7 - 1.2', flag: 'BORDERLINE', criticalReason: 'Mild renal elevation under acute stress' },
    ],
  },
  {
    id: 'ORD-003',
    orderId: 'ORD-20240616-5521',
    patientId: 'PT-003',
    patientName: 'Rukmini Baban Shinde',
    abhaId: '14-9988-7766-5544',
    testCode: 'MIC-01',
    testName: 'GeneXpert MTB/RIF CBNAAT',
    testNameMr: 'क्षयरोग जिन-एक्स्पर्ट (CBNAAT)',
    category: 'Microbiology',
    priority: 'URGENT',
    status: 'ANALYZING',
    barcode: 'MH-LAB-110293',
    prescribedByDoctor: 'Dr. A. R. Deshmukh (MO, CHC Wai)',
    facilityName: 'Community Health Centre Wai',
    targetLabName: 'District Tuberculosis Center & Molecular Lab',
    orderedAt: '16 Jun 2024, 07:30 AM',
    collectedAt: '16 Jun 2024, 08:30 AM',
    processingAt: '16 Jun 2024, 10:15 AM',
    sampleType: 'Morning Sputum',
    fastingRequired: false,
    tatHours: 4,
    hasCriticalValue: false,
  },
  {
    id: 'ORD-004',
    orderId: 'ORD-20240616-2241',
    patientId: 'PT-001',
    patientName: 'Sunita Ramchandra Jadhav',
    abhaId: '14-4821-9876-5432',
    testCode: 'RAD-03',
    testName: 'Obstetric Color Doppler (Feto-Maternal)',
    testNameMr: 'प्रसूतीपूर्व कलर डॉपलर स्कॅन',
    category: 'Radiology',
    priority: 'URGENT',
    status: 'SAMPLE_COLLECTED',
    barcode: 'MH-LAB-394012',
    prescribedByDoctor: 'Dr. Meera Deshmukh',
    facilityName: 'Sub-Centre Tapola',
    targetLabName: 'District Hospital Satara Ultrasound Room',
    orderedAt: '16 Jun 2024, 10:00 AM',
    collectedAt: '16 Jun 2024, 11:30 AM',
    sampleType: 'Doppler Ultrasound',
    fastingRequired: false,
    tatHours: 3,
    hasCriticalValue: false,
  },
  {
    id: 'ORD-005',
    orderId: 'ORD-20240616-1005',
    patientId: 'PT-004',
    patientName: 'Ramesh Ananda Gaikwad',
    abhaId: '14-5544-3322-1100',
    testCode: 'BIO-08',
    testName: 'Lipid Profile',
    testNameMr: 'लिपिड प्रोफाईल',
    category: 'Biochemistry',
    priority: 'ROUTINE',
    status: 'ORDERED',
    barcode: 'MH-LAB-502194',
    prescribedByDoctor: 'Dr. P. T. More (PHC Mahabaleshwar)',
    facilityName: 'Primary Health Centre Mahabaleshwar',
    targetLabName: 'CHC Wai Laboratory',
    orderedAt: '16 Jun 2024, 11:00 AM',
    sampleType: 'Serum Clot',
    fastingRequired: true,
    tatHours: 8,
    hasCriticalValue: false,
  },
];
```

---

### 2.2 `mobile/src/data/edlMedicines.ts`
Authoritative 18 Essential Drug List master data with multi-center facility stock distribution and substitution equivalence.

```typescript
/**
 * Authoritative Maharashtra NHM Essential Drug List (EDL) Catalog
 * Includes Active Salt generic mapping, multi-facility stock tiers, and buffer thresholds.
 */

import { Medicine, StockStatus } from '../types/medicine';

export interface ExtendedEdlMedicine extends Medicine {
  activeSalt: string;
  genericSubstitutesList: Array<{
    name: string;
    generic: string;
    form: string;
    strength: string;
    stockLevel: number;
    status: StockStatus;
  }>;
  facilityStock: Record<string, {
    stockLevel: number;
    minBuffer: number;
    status: StockStatus;
  }>;
}

export function computeStockTier(stockLevel: number, minBuffer: number): StockStatus {
  if (stockLevel <= 0) return 'OUT_OF_STOCK';
  if (stockLevel <= Math.floor(minBuffer * 0.25)) return 'CRITICAL';
  if (stockLevel <= minBuffer) return 'LOW';
  return 'ADEQUATE';
}

export function calculateReorderQuantity(currentStock: number, minBuffer: number): number {
  return currentStock < minBuffer ? minBuffer * 2 - currentStock : 0;
}

export const AUTHORITATIVE_EDL_CATALOG: ExtendedEdlMedicine[] = [
  {
    id: 'MED001',
    code: 'EDL-01',
    name: 'Paracetamol 500mg',
    nameMr: 'पॅरासिटामॉल ५०० मि.ग्रॅ.',
    generic: 'Paracetamol IP 500mg',
    activeSalt: 'Acetaminophen 500mg',
    category: 'ESSENTIAL',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '500mg',
    stockLevel: 1200,
    minBuffer: 500,
    status: 'ADEQUATE',
    batchNo: 'PCM-2024-88',
    expiryDate: '2027-05-31',
    facilityId: 'FAC001',
    useFor: ['Fever', 'Mild Pain', 'Headache'],
    useForMr: ['ताप', 'अंगदुखी', 'डोकेदुखी'],
    genericSubstitutes: [
      { id: 'SUB01', name: 'Crocin 500mg', generic: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', stockLevel: 800, status: 'ADEQUATE' },
      { id: 'SUB02', name: 'Dolo 500mg', generic: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', stockLevel: 650, status: 'ADEQUATE' },
      { id: 'SUB03', name: 'Calpol 500mg', generic: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', stockLevel: 400, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Crocin 500mg', generic: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', stockLevel: 800, status: 'ADEQUATE' },
      { name: 'Dolo 500mg', generic: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', stockLevel: 650, status: 'ADEQUATE' },
      { name: 'Calpol 500mg', generic: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', stockLevel: 400, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 1200, minBuffer: 500, status: 'ADEQUATE' },
      FAC003: { stockLevel: 600, minBuffer: 250, status: 'ADEQUATE' },
      FAC005: { stockLevel: 420, minBuffer: 200, status: 'ADEQUATE' },
      FAC007: { stockLevel: 120, minBuffer: 100, status: 'ADEQUATE' },
    },
  },
  {
    id: 'MED002',
    code: 'EDL-02',
    name: 'Amoxicillin 500mg',
    nameMr: 'अमोक्सिसिलिन ५०० मि.ग्रॅ.',
    generic: 'Amoxicillin Trihydrate IP 500mg',
    activeSalt: 'Amoxicillin 500mg',
    category: 'ANTIBIOTIC',
    unit: 'Capsules',
    form: 'Tablet',
    strength: '500mg',
    stockLevel: 320,
    minBuffer: 250,
    status: 'ADEQUATE',
    batchNo: 'AMX-2024-12',
    expiryDate: '2026-11-30',
    facilityId: 'FAC001',
    useFor: ['Bacterial Infections', 'Respiratory Tract Infection'],
    genericSubstitutes: [
      { id: 'SUB04', name: 'Novamox 500mg', generic: 'Amoxicillin 500mg', form: 'Capsule', strength: '500mg', stockLevel: 280, status: 'ADEQUATE' },
      { id: 'SUB05', name: 'Mox 500mg', generic: 'Amoxicillin 500mg', form: 'Capsule', strength: '500mg', stockLevel: 150, status: 'LOW' },
    ],
    genericSubstitutesList: [
      { name: 'Novamox 500mg', generic: 'Amoxicillin 500mg', form: 'Capsule', strength: '500mg', stockLevel: 280, status: 'ADEQUATE' },
      { name: 'Mox 500mg', generic: 'Amoxicillin 500mg', form: 'Capsule', strength: '500mg', stockLevel: 150, status: 'LOW' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 320, minBuffer: 250, status: 'ADEQUATE' },
      FAC003: { stockLevel: 110, minBuffer: 150, status: 'LOW' },
      FAC005: { stockLevel: 40, minBuffer: 100, status: 'LOW' },
      FAC007: { stockLevel: 10, minBuffer: 50, status: 'CRITICAL' },
    },
  },
  {
    id: 'MED003',
    code: 'EDL-03',
    name: 'Metformin 500mg',
    nameMr: 'मेटफॉर्मिन ५०० मि.ग्रॅ.',
    generic: 'Metformin Hydrochloride IP 500mg',
    activeSalt: 'Metformin HCl 500mg',
    category: 'CHRONIC',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '500mg',
    stockLevel: 150,
    minBuffer: 400,
    status: 'LOW',
    batchNo: 'MET-2024-04',
    expiryDate: '2027-02-28',
    facilityId: 'FAC001',
    useFor: ['Type 2 Diabetes', 'Glycemic Control'],
    genericSubstitutes: [
      { id: 'SUB06', name: 'Glyciphage 500mg', generic: 'Metformin HCl 500mg', form: 'Tablet', strength: '500mg', stockLevel: 500, status: 'ADEQUATE' },
      { id: 'SUB07', name: 'Gluformin 500mg', generic: 'Metformin HCl 500mg', form: 'Tablet', strength: '500mg', stockLevel: 300, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Glyciphage 500mg', generic: 'Metformin HCl 500mg', form: 'Tablet', strength: '500mg', stockLevel: 500, status: 'ADEQUATE' },
      { name: 'Gluformin 500mg', generic: 'Metformin HCl 500mg', form: 'Tablet', strength: '500mg', stockLevel: 300, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 150, minBuffer: 400, status: 'LOW' },
      FAC003: { stockLevel: 80, minBuffer: 200, status: 'LOW' },
      FAC005: { stockLevel: 25, minBuffer: 150, status: 'CRITICAL' },
      FAC007: { stockLevel: 0, minBuffer: 50, status: 'OUT_OF_STOCK' },
    },
  },
  {
    id: 'MED004',
    code: 'EDL-04',
    name: 'Amlodipine 5mg',
    nameMr: 'अम्लोडिपिन ५ मि.ग्रॅ.',
    generic: 'Amlodipine Besylate IP 5mg',
    activeSalt: 'Amlodipine 5mg',
    category: 'CHRONIC',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '5mg',
    stockLevel: 45,
    minBuffer: 300,
    status: 'CRITICAL',
    batchNo: 'AML-2024-91',
    expiryDate: '2026-10-15',
    facilityId: 'FAC001',
    useFor: ['Hypertension', 'Blood Pressure Control'],
    genericSubstitutes: [
      { id: 'SUB08', name: 'Amlong 5mg', generic: 'Amlodipine 5mg', form: 'Tablet', strength: '5mg', stockLevel: 420, status: 'ADEQUATE' },
      { id: 'SUB09', name: 'Stamlo 5mg', generic: 'Amlodipine 5mg', form: 'Tablet', strength: '5mg', stockLevel: 310, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Amlong 5mg', generic: 'Amlodipine 5mg', form: 'Tablet', strength: '5mg', stockLevel: 420, status: 'ADEQUATE' },
      { name: 'Stamlo 5mg', generic: 'Amlodipine 5mg', form: 'Tablet', strength: '5mg', stockLevel: 310, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 45, minBuffer: 300, status: 'CRITICAL' },
      FAC003: { stockLevel: 20, minBuffer: 150, status: 'CRITICAL' },
      FAC005: { stockLevel: 10, minBuffer: 100, status: 'CRITICAL' },
      FAC007: { stockLevel: 0, minBuffer: 40, status: 'OUT_OF_STOCK' },
    },
  },
  {
    id: 'MED005',
    code: 'EDL-05',
    name: 'Oral Rehydration Salts (ORS)',
    nameMr: 'ओआरएस पाकीट (ORS Sachet)',
    generic: 'WHO Formula ORS 20.5g',
    activeSalt: 'NaCl + KCl + Na Citrate + Glucose',
    category: 'ESSENTIAL',
    unit: 'Sachets',
    form: 'Sachet',
    strength: '20.5g',
    stockLevel: 800,
    minBuffer: 200,
    status: 'ADEQUATE',
    batchNo: 'ORS-2024-03',
    expiryDate: '2027-08-31',
    facilityId: 'FAC001',
    useFor: ['Dehydration', 'Diarrhea', 'Electrolyte Replenishment'],
    genericSubstitutes: [
      { id: 'SUB10', name: 'Electral Sachet', generic: 'WHO ORS Formula', form: 'Sachet', strength: '21.8g', stockLevel: 600, status: 'ADEQUATE' },
      { id: 'SUB11', name: 'Walyte Sachet', generic: 'WHO ORS Formula', form: 'Sachet', strength: '20.5g', stockLevel: 450, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Electral Sachet', generic: 'WHO ORS Formula', form: 'Sachet', strength: '21.8g', stockLevel: 600, status: 'ADEQUATE' },
      { name: 'Walyte Sachet', generic: 'WHO ORS Formula', form: 'Sachet', strength: '20.5g', stockLevel: 450, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 800, minBuffer: 200, status: 'ADEQUATE' },
      FAC003: { stockLevel: 450, minBuffer: 150, status: 'ADEQUATE' },
      FAC005: { stockLevel: 280, minBuffer: 100, status: 'ADEQUATE' },
      FAC007: { stockLevel: 150, minBuffer: 80, status: 'ADEQUATE' },
    },
  },
  {
    id: 'MED006',
    code: 'EDL-06',
    name: 'Iron & Folic Acid (IFA)',
    nameMr: 'लोह आणि फॉलिक ॲसिड गोळ्या (लाल)',
    generic: 'Ferrous Sulfate 100mg + Folic Acid 0.5mg',
    activeSalt: 'Elemental Iron 100mg + Folic Acid 0.5mg',
    category: 'MATERNAL',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '100mg+0.5mg',
    stockLevel: 0,
    minBuffer: 600,
    status: 'OUT_OF_STOCK',
    batchNo: 'IFA-2023-77',
    expiryDate: '2026-09-30',
    facilityId: 'FAC001',
    useFor: ['Nutritional Anemia', 'Pregnancy Antenatal Care'],
    genericSubstitutes: [
      { id: 'SUB12', name: 'Autrin', generic: 'Ferrous Fumarate + Folic Acid', form: 'Capsule', strength: '100mg+0.5mg', stockLevel: 420, status: 'ADEQUATE' },
      { id: 'SUB13', name: 'Fefol Z', generic: 'Dried Ferrous Sulfate + Folic Acid', form: 'Capsule', strength: '100mg+0.5mg', stockLevel: 350, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Autrin', generic: 'Ferrous Fumarate + Folic Acid', form: 'Capsule', strength: '100mg+0.5mg', stockLevel: 420, status: 'ADEQUATE' },
      { name: 'Fefol Z', generic: 'Dried Ferrous Sulfate + Folic Acid', form: 'Capsule', strength: '100mg+0.5mg', stockLevel: 350, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 0, minBuffer: 600, status: 'OUT_OF_STOCK' },
      FAC003: { stockLevel: 120, minBuffer: 400, status: 'LOW' },
      FAC005: { stockLevel: 0, minBuffer: 300, status: 'OUT_OF_STOCK' },
      FAC007: { stockLevel: 0, minBuffer: 150, status: 'OUT_OF_STOCK' },
    },
  },
  {
    id: 'MED007',
    code: 'EDL-07',
    name: 'Ciprofloxacin 500mg',
    nameMr: 'सिप्रोफ्लोक्सासिन ५०० मि.ग्रॅ.',
    generic: 'Ciprofloxacin Hydrochloride IP 500mg',
    activeSalt: 'Ciprofloxacin 500mg',
    category: 'ANTIBIOTIC',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '500mg',
    stockLevel: 450,
    minBuffer: 200,
    status: 'ADEQUATE',
    batchNo: 'CIP-2024-55',
    expiryDate: '2027-01-31',
    facilityId: 'FAC001',
    useFor: ['Urinary Tract Infection', 'Gastroenteritis'],
    genericSubstitutes: [
      { id: 'SUB14', name: 'Ciplox 500mg', generic: 'Ciprofloxacin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 400, status: 'ADEQUATE' },
      { id: 'SUB15', name: 'Cifran 500mg', generic: 'Ciprofloxacin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 250, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Ciplox 500mg', generic: 'Ciprofloxacin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 400, status: 'ADEQUATE' },
      { name: 'Cifran 500mg', generic: 'Ciprofloxacin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 250, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 450, minBuffer: 200, status: 'ADEQUATE' },
      FAC003: { stockLevel: 180, minBuffer: 150, status: 'ADEQUATE' },
      FAC005: { stockLevel: 90, minBuffer: 100, status: 'LOW' },
      FAC007: { stockLevel: 30, minBuffer: 50, status: 'LOW' },
    },
  },
  {
    id: 'MED008',
    code: 'EDL-08',
    name: 'Azithromycin 500mg',
    nameMr: 'अझिथ्रोमायसिन ५०० मि.ग्रॅ.',
    generic: 'Azithromycin Dihydrate IP 500mg',
    activeSalt: 'Azithromycin 500mg',
    category: 'ANTIBIOTIC',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '500mg',
    stockLevel: 300,
    minBuffer: 150,
    status: 'ADEQUATE',
    batchNo: 'AZI-2024-22',
    expiryDate: '2026-12-31',
    facilityId: 'FAC001',
    useFor: ['Upper Respiratory Infection', 'Typhoid'],
    genericSubstitutes: [
      { id: 'SUB16', name: 'Azee 500mg', generic: 'Azithromycin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 350, status: 'ADEQUATE' },
      { id: 'SUB17', name: 'Azithral 500mg', generic: 'Azithromycin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 280, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Azee 500mg', generic: 'Azithromycin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 350, status: 'ADEQUATE' },
      { name: 'Azithral 500mg', generic: 'Azithromycin 500mg', form: 'Tablet', strength: '500mg', stockLevel: 280, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 300, minBuffer: 150, status: 'ADEQUATE' },
      FAC003: { stockLevel: 140, minBuffer: 100, status: 'ADEQUATE' },
      FAC005: { stockLevel: 60, minBuffer: 80, status: 'LOW' },
      FAC007: { stockLevel: 15, minBuffer: 40, status: 'LOW' },
    },
  },
  {
    id: 'MED009',
    code: 'EDL-09',
    name: 'Cetirizine 10mg',
    nameMr: 'सेटिरीझिन १० मि.ग्रॅ.',
    generic: 'Cetirizine Hydrochloride IP 10mg',
    activeSalt: 'Cetirizine 10mg',
    category: 'ESSENTIAL',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '10mg',
    stockLevel: 900,
    minBuffer: 300,
    status: 'ADEQUATE',
    batchNo: 'CET-2024-11',
    expiryDate: '2027-06-30',
    facilityId: 'FAC001',
    useFor: ['Allergic Rhinitis', 'Urticaria', 'Skin Itching'],
    genericSubstitutes: [
      { id: 'SUB18', name: 'Cetzine 10mg', generic: 'Cetirizine 10mg', form: 'Tablet', strength: '10mg', stockLevel: 600, status: 'ADEQUATE' },
      { id: 'SUB19', name: 'Alerid 10mg', generic: 'Cetirizine 10mg', form: 'Tablet', strength: '10mg', stockLevel: 450, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Cetzine 10mg', generic: 'Cetirizine 10mg', form: 'Tablet', strength: '10mg', stockLevel: 600, status: 'ADEQUATE' },
      { name: 'Alerid 10mg', generic: 'Cetirizine 10mg', form: 'Tablet', strength: '10mg', stockLevel: 450, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 900, minBuffer: 300, status: 'ADEQUATE' },
      FAC003: { stockLevel: 500, minBuffer: 200, status: 'ADEQUATE' },
      FAC005: { stockLevel: 250, minBuffer: 150, status: 'ADEQUATE' },
      FAC007: { stockLevel: 110, minBuffer: 80, status: 'ADEQUATE' },
    },
  },
  {
    id: 'MED010',
    code: 'EDL-10',
    name: 'Omeprazole 20mg',
    nameMr: 'ओमेप्राझोल २० मि.ग्रॅ.',
    generic: 'Omeprazole Magnesium IP 20mg',
    activeSalt: 'Omeprazole 20mg',
    category: 'ESSENTIAL',
    unit: 'Capsules',
    form: 'Tablet',
    strength: '20mg',
    stockLevel: 550,
    minBuffer: 300,
    status: 'ADEQUATE',
    batchNo: 'OME-2024-81',
    expiryDate: '2027-04-30',
    facilityId: 'FAC001',
    useFor: ['Acidity', 'Peptic Ulcer', 'Gastritis'],
    genericSubstitutes: [
      { id: 'SUB20', name: 'Omez 20mg', generic: 'Omeprazole 20mg', form: 'Capsule', strength: '20mg', stockLevel: 500, status: 'ADEQUATE' },
      { id: 'SUB21', name: 'Ocid 20mg', generic: 'Omeprazole 20mg', form: 'Capsule', strength: '20mg', stockLevel: 380, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Omez 20mg', generic: 'Omeprazole 20mg', form: 'Capsule', strength: '20mg', stockLevel: 500, status: 'ADEQUATE' },
      { name: 'Ocid 20mg', generic: 'Omeprazole 20mg', form: 'Capsule', strength: '20mg', stockLevel: 380, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 550, minBuffer: 300, status: 'ADEQUATE' },
      FAC003: { stockLevel: 320, minBuffer: 200, status: 'ADEQUATE' },
      FAC005: { stockLevel: 140, minBuffer: 150, status: 'LOW' },
      FAC007: { stockLevel: 50, minBuffer: 80, status: 'LOW' },
    },
  },
  {
    id: 'MED011',
    code: 'EDL-11',
    name: 'Albendazole 400mg',
    nameMr: 'अल्बेंडाझोल ४०० मि.ग्रॅ.',
    generic: 'Albendazole Chewable IP 400mg',
    activeSalt: 'Albendazole 400mg',
    category: 'ESSENTIAL',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '400mg',
    stockLevel: 280,
    minBuffer: 100,
    status: 'ADEQUATE',
    batchNo: 'ALB-2024-33',
    expiryDate: '2027-03-31',
    facilityId: 'FAC001',
    useFor: ['Deworming', 'Helminthiasis'],
    genericSubstitutes: [
      { id: 'SUB22', name: 'Zentel 400mg', generic: 'Albendazole 400mg', form: 'Tablet', strength: '400mg', stockLevel: 300, status: 'ADEQUATE' },
      { id: 'SUB23', name: 'Bandey 400mg', generic: 'Albendazole 400mg', form: 'Tablet', strength: '400mg', stockLevel: 180, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Zentel 400mg', generic: 'Albendazole 400mg', form: 'Tablet', strength: '400mg', stockLevel: 300, status: 'ADEQUATE' },
      { name: 'Bandey 400mg', generic: 'Albendazole 400mg', form: 'Tablet', strength: '400mg', stockLevel: 180, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 280, minBuffer: 100, status: 'ADEQUATE' },
      FAC003: { stockLevel: 150, minBuffer: 80, status: 'ADEQUATE' },
      FAC005: { stockLevel: 90, minBuffer: 60, status: 'ADEQUATE' },
      FAC007: { stockLevel: 40, minBuffer: 40, status: 'LOW' },
    },
  },
  {
    id: 'MED012',
    code: 'EDL-12',
    name: 'Zinc Sulfate 20mg',
    nameMr: 'झिंक सल्फेट २० मि.ग्रॅ.',
    generic: 'Zinc Sulfate Dispersible IP 20mg',
    activeSalt: 'Elemental Zinc 20mg',
    category: 'MATERNAL',
    unit: 'Tablets',
    form: 'Tablet',
    strength: '20mg',
    stockLevel: 420,
    minBuffer: 200,
    status: 'ADEQUATE',
    batchNo: 'ZNC-2024-42',
    expiryDate: '2026-12-31',
    facilityId: 'FAC001',
    useFor: ['Childhood Diarrhea Adjunct', 'Immunity'],
    genericSubstitutes: [
      { id: 'SUB24', name: 'Zinconia 20mg', generic: 'Zinc Sulfate 20mg', form: 'Tablet', strength: '20mg', stockLevel: 300, status: 'ADEQUATE' },
      { id: 'SUB25', name: 'Z&D 20mg', generic: 'Zinc Sulfate 20mg', form: 'Tablet', strength: '20mg', stockLevel: 200, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Zinconia 20mg', generic: 'Zinc Sulfate 20mg', form: 'Tablet', strength: '20mg', stockLevel: 300, status: 'ADEQUATE' },
      { name: 'Z&D 20mg', generic: 'Zinc Sulfate 20mg', form: 'Tablet', strength: '20mg', stockLevel: 200, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 420, minBuffer: 200, status: 'ADEQUATE' },
      FAC003: { stockLevel: 210, minBuffer: 150, status: 'ADEQUATE' },
      FAC005: { stockLevel: 95, minBuffer: 100, status: 'LOW' },
      FAC007: { stockLevel: 35, minBuffer: 60, status: 'LOW' },
    },
  },
  {
    id: 'MED013',
    code: 'EDL-13',
    name: 'Oxytocin Injection 10 IU',
    nameMr: 'ऑक्सिटोसिन इंजेक्शन १० आय.यू.',
    generic: 'Oxytocin Injection IP 10 IU/ml',
    activeSalt: 'Oxytocin 10 IU/ml',
    category: 'EMERGENCY',
    unit: 'Ampoules',
    form: 'Injection',
    strength: '10 IU',
    stockLevel: 120,
    minBuffer: 50,
    status: 'ADEQUATE',
    batchNo: 'OXY-2024-19',
    expiryDate: '2026-08-31',
    facilityId: 'FAC001',
    useFor: ['Postpartum Hemorrhage Prevention', 'Labor Management'],
    genericSubstitutes: [
      { id: 'SUB26', name: 'Syntocinon 10 IU', generic: 'Oxytocin 10 IU', form: 'Injection', strength: '10 IU/ml', stockLevel: 90, status: 'ADEQUATE' },
      { id: 'SUB27', name: 'Pitocin 10 IU', generic: 'Oxytocin 10 IU', form: 'Injection', strength: '10 IU/ml', stockLevel: 60, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Syntocinon 10 IU', generic: 'Oxytocin 10 IU', form: 'Injection', strength: '10 IU/ml', stockLevel: 90, status: 'ADEQUATE' },
      { name: 'Pitocin 10 IU', generic: 'Oxytocin 10 IU', form: 'Injection', strength: '10 IU/ml', stockLevel: 60, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 120, minBuffer: 50, status: 'ADEQUATE' },
      FAC003: { stockLevel: 65, minBuffer: 40, status: 'ADEQUATE' },
      FAC005: { stockLevel: 20, minBuffer: 25, status: 'LOW' },
      FAC007: { stockLevel: 5, minBuffer: 15, status: 'CRITICAL' },
    },
  },
  {
    id: 'MED014',
    code: 'EDL-14',
    name: 'Magnesium Sulfate 50%',
    nameMr: 'मॅग्नेशियम सल्फेट ५०% इंजेक्शन',
    generic: 'Magnesium Sulfate Heptahydrate 50% w/v',
    activeSalt: 'MgSO4 50% w/v',
    category: 'EMERGENCY',
    unit: 'Vials',
    form: 'Injection',
    strength: '500mg/ml',
    stockLevel: 85,
    minBuffer: 40,
    status: 'ADEQUATE',
    batchNo: 'MGS-2024-08',
    expiryDate: '2026-10-31',
    facilityId: 'FAC001',
    useFor: ['Severe Preeclampsia', 'Eclampsia Seizure Control'],
    genericSubstitutes: [
      { id: 'SUB28', name: 'MgSO4 Injection', generic: 'Magnesium Sulfate 50%', form: 'Injection', strength: '500mg/ml', stockLevel: 70, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'MgSO4 Injection', generic: 'Magnesium Sulfate 50%', form: 'Injection', strength: '500mg/ml', stockLevel: 70, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 85, minBuffer: 40, status: 'ADEQUATE' },
      FAC003: { stockLevel: 45, minBuffer: 30, status: 'ADEQUATE' },
      FAC005: { stockLevel: 15, minBuffer: 20, status: 'LOW' },
      FAC007: { stockLevel: 4, minBuffer: 10, status: 'CRITICAL' },
    },
  },
  {
    id: 'MED015',
    code: 'EDL-15',
    name: 'Adrenaline Injection 1:1000',
    nameMr: 'ॲड्रेनालिन इंजेक्शन १:१०००',
    generic: 'Epinephrine Hydrochloride IP 1mg/ml',
    activeSalt: 'Epinephrine 1mg/ml',
    category: 'EMERGENCY',
    unit: 'Ampoules',
    form: 'Injection',
    strength: '1mg/ml',
    stockLevel: 60,
    minBuffer: 20,
    status: 'ADEQUATE',
    batchNo: 'ADR-2024-15',
    expiryDate: '2026-07-31',
    facilityId: 'FAC001',
    useFor: ['Anaphylactic Shock', 'Cardiopulmonary Resuscitation CPR'],
    genericSubstitutes: [
      { id: 'SUB29', name: 'Vasocon 1mg', generic: 'Epinephrine 1mg/ml', form: 'Injection', strength: '1mg/ml', stockLevel: 50, status: 'ADEQUATE' },
      { id: 'SUB30', name: 'Adrenaline Inj', generic: 'Epinephrine 1mg/ml', form: 'Injection', strength: '1mg/ml', stockLevel: 40, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Vasocon 1mg', generic: 'Epinephrine 1mg/ml', form: 'Injection', strength: '1mg/ml', stockLevel: 50, status: 'ADEQUATE' },
      { name: 'Adrenaline Inj', generic: 'Epinephrine 1mg/ml', form: 'Injection', strength: '1mg/ml', stockLevel: 40, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 60, minBuffer: 20, status: 'ADEQUATE' },
      FAC003: { stockLevel: 25, minBuffer: 15, status: 'ADEQUATE' },
      FAC005: { stockLevel: 10, minBuffer: 10, status: 'LOW' },
      FAC007: { stockLevel: 2, minBuffer: 5, status: 'CRITICAL' },
    },
  },
  {
    id: 'MED016',
    code: 'EDL-16',
    name: 'Atropine Sulfate 0.6mg',
    nameMr: 'ॲट्रोपिन सल्फेट ०.६ मि.ग्रॅ.',
    generic: 'Atropine Sulfate IP 0.6mg/ml',
    activeSalt: 'Atropine 0.6mg/ml',
    category: 'EMERGENCY',
    unit: 'Ampoules',
    form: 'Injection',
    strength: '0.6mg/ml',
    stockLevel: 70,
    minBuffer: 25,
    status: 'ADEQUATE',
    batchNo: 'ATR-2024-31',
    expiryDate: '2027-01-31',
    facilityId: 'FAC001',
    useFor: ['Organophosphate Poisoning', 'Severe Bradycardia'],
    genericSubstitutes: [
      { id: 'SUB31', name: 'Atropine Inj', generic: 'Atropine Sulfate 0.6mg/ml', form: 'Injection', strength: '0.6mg/ml', stockLevel: 60, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Atropine Inj', generic: 'Atropine Sulfate 0.6mg/ml', form: 'Injection', strength: '0.6mg/ml', stockLevel: 60, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 70, minBuffer: 25, status: 'ADEQUATE' },
      FAC003: { stockLevel: 30, minBuffer: 20, status: 'ADEQUATE' },
      FAC005: { stockLevel: 12, minBuffer: 15, status: 'LOW' },
      FAC007: { stockLevel: 3, minBuffer: 8, status: 'CRITICAL' },
    },
  },
  {
    id: 'MED017',
    code: 'EDL-17',
    name: 'Salbutamol Inhaler 100mcg',
    nameMr: 'साल्ब्युटामॉल इनहेलर १०० मायक्रोग्रॅम',
    generic: 'Salbutamol Sulfate Inhaler 100mcg/actuation',
    activeSalt: 'Salbutamol 100mcg/actuation',
    category: 'ESSENTIAL',
    unit: 'Canisters',
    form: 'Drops',
    strength: '100mcg',
    stockLevel: 90,
    minBuffer: 30,
    status: 'ADEQUATE',
    batchNo: 'SLB-2024-60',
    expiryDate: '2026-11-30',
    facilityId: 'FAC001',
    useFor: ['Bronchial Asthma', 'COPD Bronchospasm'],
    genericSubstitutes: [
      { id: 'SUB32', name: 'Asthalin Inhaler', generic: 'Salbutamol 100mcg', form: 'Inhaler', strength: '100mcg', stockLevel: 80, status: 'ADEQUATE' },
      { id: 'SUB33', name: 'Ventorlin', generic: 'Salbutamol 100mcg', form: 'Inhaler', strength: '100mcg', stockLevel: 50, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Asthalin Inhaler', generic: 'Salbutamol 100mcg', form: 'Inhaler', strength: '100mcg', stockLevel: 80, status: 'ADEQUATE' },
      { name: 'Ventorlin', generic: 'Salbutamol 100mcg', form: 'Inhaler', strength: '100mcg', stockLevel: 50, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 90, minBuffer: 30, status: 'ADEQUATE' },
      FAC003: { stockLevel: 45, minBuffer: 25, status: 'ADEQUATE' },
      FAC005: { stockLevel: 18, minBuffer: 20, status: 'LOW' },
      FAC007: { stockLevel: 4, minBuffer: 10, status: 'CRITICAL' },
    },
  },
  {
    id: 'MED018',
    code: 'EDL-18',
    name: 'Tetanus Toxoid (TT) Vaccine',
    nameMr: 'धनुर्वात लस (TT Vaccine)',
    generic: 'Tetanus Toxoid Adsorbed Vaccine IP',
    activeSalt: 'Tetanus Toxoid >=40 IU',
    category: 'MATERNAL',
    unit: 'Vials',
    form: 'Injection',
    strength: '0.5ml',
    stockLevel: 190,
    minBuffer: 80,
    status: 'ADEQUATE',
    batchNo: 'TT-2024-95',
    expiryDate: '2026-12-31',
    facilityId: 'FAC001',
    useFor: ['Tetanus Prophylaxis', 'Maternal Immunization'],
    genericSubstitutes: [
      { id: 'SUB34', name: 'Tetvac', generic: 'Tetanus Toxoid >=40 IU', form: 'Injection', strength: '0.5ml', stockLevel: 120, status: 'ADEQUATE' },
      { id: 'SUB35', name: 'Betatetanus', generic: 'Tetanus Toxoid >=40 IU', form: 'Injection', strength: '0.5ml', stockLevel: 100, status: 'ADEQUATE' },
    ],
    genericSubstitutesList: [
      { name: 'Tetvac', generic: 'Tetanus Toxoid >=40 IU', form: 'Injection', strength: '0.5ml', stockLevel: 120, status: 'ADEQUATE' },
      { name: 'Betatetanus', generic: 'Tetanus Toxoid >=40 IU', form: 'Injection', strength: '0.5ml', stockLevel: 100, status: 'ADEQUATE' },
    ],
    facilityStock: {
      FAC001: { stockLevel: 190, minBuffer: 80, status: 'ADEQUATE' },
      FAC003: { stockLevel: 95, minBuffer: 50, status: 'ADEQUATE' },
      FAC005: { stockLevel: 40, minBuffer: 40, status: 'LOW' },
      FAC007: { stockLevel: 10, minBuffer: 20, status: 'CRITICAL' },
    },
  },
];
```

---

### 2.3 `mobile/src/data/referralsData.ts`
Authoritative 7-stage referral pipeline cases, SLA deadline calculators, and closed-loop counter-referral feedback records.

```typescript
/**
 * Authoritative 7-Stage Inter-Facility Referral Pipeline Data & SLAs
 * Complies with Features 13-14, Tier 1, and Tier 4 requirements.
 */

import { Referral, ReferralStage, ReferralUrgency } from '../types/referral';

export const REFERRAL_STAGES_LIST: ReferralStage[] = [
  'CREATED',
  'NOTIFIED',
  'ACCEPTED',
  'IN_TRANSIT',
  'REACHED',
  'ADMITTED',
  'COMPLETED',
];

export const REFERRAL_SLAS_MINUTES: Record<ReferralUrgency, number> = {
  IMMEDIATE: 60,     // 1 hr (<= 2h max)
  URGENT: 360,       // 6 hrs (<= 24h max)
  PRIORITY: 1440,    // 24 hrs (<= 72h max)
  ROUTINE: 4320,     // 72 hrs (<= 7d max)
};

export function computeReferralSla(createdAtIso: string, urgency: ReferralUrgency): {
  remainingMinutes: number;
  isOverdue: boolean;
  overdueByMinutes: number;
  formattedRemaining: string;
} {
  const createdTime = new Date(createdAtIso).getTime();
  const slaMins = REFERRAL_SLAS_MINUTES[urgency];
  const elapsedMins = (Date.now() - createdTime) / (60 * 1000);
  const remainingMins = Math.round(slaMins - elapsedMins);
  const isOverdue = remainingMins <= 0;
  const overdueByMinutes = isOverdue ? Math.abs(remainingMins) : 0;

  let formattedRemaining = '';
  if (isOverdue) {
    const hours = Math.floor(overdueByMinutes / 60);
    const mins = overdueByMinutes % 60;
    formattedRemaining = hours > 0 ? `Overdue by ${hours}h ${mins}m` : `Overdue by ${mins}m`;
  } else {
    const hours = Math.floor(remainingMins / 60);
    const mins = remainingMins % 60;
    formattedRemaining = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  }

  return { remainingMinutes: remainingMins, isOverdue, overdueByMinutes, formattedRemaining };
}

export const INITIAL_REFERRALS_DATA: Referral[] = [
  {
    id: 'REF-20240615-9102',
    patientId: 'PT-001',
    patientName: 'Sunita Ramchandra Jadhav',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    patientPhone: '+91 98223 04912',
    patientVillage: 'Tapola, Mahabaleshwar',
    patientAge: 28,
    patientGender: 'Female',
    abhaId: '14-4821-9876-5432',
    fromFacilityId: 'FAC007',
    fromFacilityName: 'Sub-Centre Tapola',
    fromDoctorName: 'Sister Anandi Gaikwad (ANM)',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Obstetrics & Gynecology (OBGYN)',
    urgency: 'URGENT',
    primaryReason: 'High-risk antenatal in 34th week with fetal growth lag, requiring tertiary Doppler USG.',
    provisionalDiagnosis: 'High-Risk Pregnancy (O36.5) / Mild Nutritional Anemia',
    vitalsSummary: { bp: '118/76 mmHg', pulse: '76 bpm', spO2: '99%', sugar: '94 mg/dL' },
    transportNeeded: true,
    transportType: '102_JANANI',
    transportStatus: {
      vehicleNumber: 'MH-12-AH-8419',
      driverName: 'Gajanan Shinde',
      driverPhone: '+91 98901 23450',
      etaMinutes: 18,
      liveStatus: '102 Janani Ambulance en route to Satara District Hospital',
    },
    ashaEscortAssigned: true,
    ashaName: 'Suman Tai Patil',
    ashaPhone: '+91 94231 80912',
    stage: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '15 Jun, 10:00 AM', note: 'Referral initiated by ANM Anandi Gaikwad for Doppler review.', updatedBy: 'Sister Anandi Gaikwad' },
      { stage: 'NOTIFIED', timestamp: '15 Jun, 10:05 AM', note: 'Automated SMS sent to patient and ASHA escort.', updatedBy: 'System Gateway' },
      { stage: 'ACCEPTED', timestamp: '15 Jun, 10:45 AM', note: 'Accepted by Duty Medical Officer, District Hospital Satara.', updatedBy: 'Dr. V. M. Kulkarni' },
      { stage: 'IN_TRANSIT', timestamp: '15 Jun, 01:15 PM', note: 'Patient boarded 102 Janani Express accompanied by ASHA escort.', updatedBy: 'Driver Gajanan Shinde' },
    ],
  },
  {
    id: 'REF-20240616-0081',
    patientId: 'PT-ANC-POOJA',
    patientName: 'Pooja Sachin Jadhav',
    patientNameMr: 'पूजा सचिन जाधव',
    patientPhone: '+91 98224 51009',
    patientVillage: 'Vadgaon, Shirur',
    patientAge: 24,
    patientGender: 'Female',
    abhaId: '14-8899-7766-5544',
    fromFacilityId: 'FAC007',
    fromFacilityName: 'Sub-Centre Tapola',
    fromDoctorName: 'Sister Anandi Gaikwad (ANM)',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Obstetric High-Risk ICU',
    urgency: 'IMMEDIATE',
    primaryReason: 'Impending Eclampsia: BP 168/108, severe headache, epigastric pain, visual blurriness.',
    provisionalDiagnosis: 'Severe Preeclampsia in 34th Week with Impending Eclampsia',
    vitalsSummary: { bp: '168/108 mmHg', pulse: '98 bpm', spO2: '96%', sugar: '120 mg/dL' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    transportStatus: {
      vehicleNumber: 'MH-12-1080',
      driverName: 'Sachin Gaikwad',
      driverPhone: '+91 98221 19988',
      etaMinutes: 12,
      liveStatus: '108 ALS Ambulance siren active, pre-arrival CASUALTY alert signaled',
    },
    ashaEscortAssigned: true,
    ashaName: 'Anandi Gaikwad',
    ashaPhone: '+91 94220 01122',
    stage: 'ACCEPTED',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 09:30 AM', note: 'Emergency referral generated with Magnesium Sulfate loading.', updatedBy: 'Sister Anandi Gaikwad' },
      { stage: 'NOTIFIED', timestamp: '16 Jun, 09:32 AM', note: '108 Control Room alerted, ALS dispatched.', updatedBy: '108 Dispatcher' },
      { stage: 'ACCEPTED', timestamp: '16 Jun, 09:40 AM', note: 'Accepted by Dr. V. M. Kulkarni; Obstetric ICU bed reserved.', updatedBy: 'Dr. V. M. Kulkarni' },
    ],
  },
  {
    id: 'REF-20240612-8840',
    patientId: 'PT-002',
    patientName: 'Mahadev Vitthal Patil',
    patientNameMr: 'महादेव विठ्ठल पाटील',
    patientPhone: '+91 98224 51001',
    patientVillage: 'Medha, Jawali',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: '14-1122-3344-5566',
    fromFacilityId: 'FAC006',
    fromFacilityName: 'Primary Health Centre Medha',
    fromDoctorName: 'Dr. R. B. Chavan',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Cardiology & Intensive Coronary Care (ICCU)',
    urgency: 'IMMEDIATE',
    primaryReason: 'Acute Coronary Syndrome with elevated Troponin I (148.5 pg/mL) and severe hyperglycaemia (382 mg/dL).',
    provisionalDiagnosis: 'Acute Coronary Syndrome (STEMI/NSTEMI) / Uncontrolled Type 2 Diabetes',
    vitalsSummary: { bp: '150/98 mmHg', pulse: '92 bpm', spO2: '97%', sugar: '382 mg/dL' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    ashaEscortAssigned: false,
    stage: 'COMPLETED',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 71 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '12 Jun, 08:30 AM', note: 'Emergency referral generated with STAT ECG alert.', updatedBy: 'Dr. R. B. Chavan' },
      { stage: 'NOTIFIED', timestamp: '12 Jun, 08:32 AM', note: '108 Command Room dispatched ALS unit.', updatedBy: '108 Dispatcher' },
      { stage: 'ACCEPTED', timestamp: '12 Jun, 08:40 AM', note: 'ICCU Trauma Team mobilized at DH Satara.', updatedBy: 'Dr. V. M. Kulkarni' },
      { stage: 'IN_TRANSIT', timestamp: '12 Jun, 08:50 AM', note: 'Ambulance transit with oxygen & continuous cardiac telemetry.', updatedBy: 'Paramedic Shinde' },
      { stage: 'REACHED', timestamp: '12 Jun, 09:55 AM', note: 'Arrived at Satara District Hospital emergency casualty.', updatedBy: 'Casualty MO' },
      { stage: 'ADMITTED', timestamp: '12 Jun, 10:10 AM', note: 'Admitted to ICCU Bed 4; Coronary angiography performed.', updatedBy: 'Dr. Avinash Sawant' },
      { stage: 'COMPLETED', timestamp: '14 Jun, 04:00 PM', note: 'Patient stabilized, medically optimized, discharged with counter-referral to PHC Medha.', updatedBy: 'Dr. Avinash Sawant' },
    ],
    feedback: {
      doctorName: 'Dr. Avinash Sawant (MD, DM Cardiology)',
      hospitalName: 'District Hospital Satara Apex Cardiac Unit',
      date: '14 Jun 2024',
      counterReferralNotes: 'Patient underwent coronary angiography revealing 70% proximal LAD stenosis managed medically with Dual Antiplatelets (Aspirin + Clopidogrel), Atorvastatin 40mg, and Metformin titration. Glycemia stabilized to 128 mg/dL.',
      treatmentGiven: '1. Tab Aspirin 75mg + Clopidogrel 75mg OD\n2. Tab Atorvastatin 40mg HS\n3. Tab Metformin 500mg BD after meals\n4. Inj. Regular Insulin during acute phase, converted to oral agents.',
      dischargeAdvice: 'Weekly BP check and 12-lead ECG review at PHC Medha. Fasting blood sugar monitoring every 14 days by ASHA. Follow-up in Cardiology OPD on 28 Jun 2024.',
    },
  },
  {
    id: 'REF-20240616-0044',
    patientId: 'PT-005',
    patientName: 'Aniket Dattatray Shinde',
    patientNameMr: 'अनिकेत दत्तात्रय शिंदे',
    patientPhone: '+91 98229 44332',
    patientVillage: 'Kusgaon, Wai',
    patientAge: 19,
    patientGender: 'Male',
    abhaId: '14-3322-1100-9988',
    fromFacilityId: 'FAC006',
    fromFacilityName: 'Primary Health Centre Medha',
    fromDoctorName: 'Dr. R. B. Chavan',
    toFacilityId: 'FAC003',
    toFacilityName: 'Community Health Centre Wai',
    department: 'Orthopedics & Digital X-Ray',
    urgency: 'PRIORITY',
    primaryReason: 'Right lower limb trauma following farm equipment injury. Severe swelling, inability to bear weight.',
    provisionalDiagnosis: 'Suspected Right Tibia-Fibula Fracture',
    vitalsSummary: { bp: '124/82 mmHg', pulse: '84 bpm', spO2: '98%', sugar: '102 mg/dL' },
    transportNeeded: false,
    transportType: 'OWN_VEHICLE',
    ashaEscortAssigned: false,
    stage: 'CREATED',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 11:00 AM', note: 'Priority referral created with limb immobilization splint applied.', updatedBy: 'Dr. R. B. Chavan' },
    ],
  },
  {
    id: 'REF-20240614-7721',
    patientId: 'PT-006',
    patientName: 'Dnyaneshwar Vitthal Rao',
    patientNameMr: 'ज्ञानेश्वर विठ्ठल राव',
    patientPhone: '+91 98226 77112',
    patientVillage: 'Pratapgad, Mahabaleshwar',
    patientAge: 46,
    patientGender: 'Male',
    abhaId: '14-4455-6677-8899',
    fromFacilityId: 'FAC005',
    fromFacilityName: 'Primary Health Centre Mahabaleshwar',
    fromDoctorName: 'Dr. P. T. More',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Emergency Medicine & Toxicology',
    urgency: 'IMMEDIATE',
    primaryReason: 'Russell\'s Viper Snakebite with hemotoxic signs (local swelling, whole blood clotting time >20 mins).',
    provisionalDiagnosis: 'Viperid Snake Envenomation (T63.0)',
    vitalsSummary: { bp: '100/60 mmHg', pulse: '110 bpm', spO2: '95%' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    transportStatus: {
      vehicleNumber: 'MH-12-EM-1088',
      driverName: 'Vinod Pawar',
      driverPhone: '+91 98225 66778',
      etaMinutes: 0,
      liveStatus: 'Admitted to Satara District Hospital Trauma Bay',
    },
    ashaEscortAssigned: true,
    ashaName: 'Meena Tai Bhosale',
    stage: 'ADMITTED',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 06:00 AM', note: '10 vials Polyvalent ASV reconstituted and IV started.', updatedBy: 'Dr. P. T. More' },
      { stage: 'NOTIFIED', timestamp: '16 Jun, 06:05 AM', note: 'Emergency 108 dispatched.', updatedBy: '108 Control' },
      { stage: 'ACCEPTED', timestamp: '16 Jun, 06:15 AM', note: 'Accepted by Satara Casualty In-charge.', updatedBy: 'Casualty MO' },
      { stage: 'IN_TRANSIT', timestamp: '16 Jun, 06:30 AM', note: 'Patient in transit with vitals monitoring.', updatedBy: 'Paramedic' },
      { stage: 'REACHED', timestamp: '16 Jun, 07:45 AM', note: 'Arrived at Satara Casualty gate.', updatedBy: 'Triage Nurse' },
      { stage: 'ADMITTED', timestamp: '16 Jun, 08:00 AM', note: 'Patient in ICU; 2nd dose ASV administered, urine output monitored.', updatedBy: 'Dr. Kulkarni' },
    ],
  },
  {
    id: 'REF-20240610-1123',
    patientId: 'PT-007',
    patientName: 'Kisanrao Bapu Shinde',
    patientNameMr: 'किसनराव बापू शिंदे',
    patientPhone: '+91 98221 00998',
    patientVillage: 'Koregaon Rural',
    patientAge: 65,
    patientGender: 'Male',
    abhaId: '14-7766-5544-3322',
    fromFacilityId: 'FAC004',
    fromFacilityName: 'Community Health Centre Koregaon',
    fromDoctorName: 'Dr. N. G. Shinde',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'General Surgery & Ophthalmology',
    urgency: 'IMMEDIATE',
    primaryReason: 'Acute glaucoma attack with severe ocular pain and vision loss.',
    provisionalDiagnosis: 'Acute Angle-Closure Glaucoma',
    vitalsSummary: { bp: '160/95 mmHg', pulse: '88 bpm', spO2: '98%' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    ashaEscortAssigned: false,
    stage: 'OVERDUE',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isOverdue: true,
    overdueHours: 4,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 07:00 AM', note: 'Immediate referral issued. Mannitol IV infused.', updatedBy: 'Dr. N. G. Shinde' },
      { stage: 'OVERDUE', timestamp: '16 Jun, 09:00 AM', note: 'ALERT: SLA expired without receiving hospital admission confirmation.', updatedBy: 'System Monitor' },
    ],
  },
];
```

---

### 2.4 `mobile/src/data/facilitiesData.ts` & `mobile/src/data/index.ts`
Exporting the 7 district health facilities, emergency helplines, and single entry point.

```typescript
// mobile/src/data/facilitiesData.ts
export interface FacilityInfo {
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

export const DISTRICT_FACILITIES: FacilityInfo[] = [
  { id: 'FAC001', code: 'DH-STR', name: 'District Hospital Satara', nameMr: 'जिल्हा रुग्णालय सातारा', type: 'District Hospital', block: 'Satara', beds: 350, doctorInCharge: 'Dr. V. M. Kulkarni', phone: '+91 2162 234100' },
  { id: 'FAC002', code: 'SDH-KRD', name: 'Sub-District Hospital Karad', nameMr: 'उपजिल्हा रुग्णालय कराड', type: 'Rural Hospital', block: 'Karad', beds: 100, doctorInCharge: 'Dr. S. P. Patil', phone: '+91 2164 222150' },
  { id: 'FAC003', code: 'CHC-WAI', name: 'Community Health Centre Wai', nameMr: 'ग्रामीण रुग्णालय वाई', type: 'CHC', block: 'Wai', beds: 30, doctorInCharge: 'Dr. A. R. Deshmukh', phone: '+91 2167 220033' },
  { id: 'FAC004', code: 'CHC-KOR', name: 'Community Health Centre Koregaon', nameMr: 'ग्रामीण रुग्णालय कोरेगाव', type: 'CHC', block: 'Koregaon', beds: 30, doctorInCharge: 'Dr. N. G. Shinde', phone: '+91 2163 220144' },
  { id: 'FAC005', code: 'PHC-MHB', name: 'Primary Health Centre Mahabaleshwar', nameMr: 'प्राथमिक आरोग्य केंद्र महाबळेश्वर', type: 'PHC', block: 'Mahabaleshwar', beds: 10, doctorInCharge: 'Dr. P. T. More', phone: '+91 2168 260233' },
  { id: 'FAC006', code: 'PHC-MDH', name: 'Primary Health Centre Medha', nameMr: 'प्राथमिक आरोग्य केंद्र मेढा', type: 'PHC', block: 'Jawali', beds: 10, doctorInCharge: 'Dr. R. B. Chavan', phone: '+91 2160 224422' },
  { id: 'FAC007', code: 'SC-TPL', name: 'Sub-Centre Tapola', nameMr: 'आरोग्य उपकेंद्र तापोळा', type: 'Sub-Centre', block: 'Mahabaleshwar', beds: 2, doctorInCharge: 'Sister Anandi Gaikwad (ANM)', phone: '+91 2168 290111' },
];

export const EMERGENCY_HELPLINES = [
  { service: 'National Ambulance', number: '108', desc: 'Free ALS/BLS Emergency Transport' },
  { service: 'Janani Shishu Suraksha', number: '102', desc: 'Pregnant Women & Sick Infants Transport' },
  { service: 'Health Advice Helpline', number: '104', desc: 'Medical & Tele-triage Advice' },
  { service: 'Women Helpline', number: '1091', desc: 'Emergency Protection & Support' },
];
```

---

## 3. Blueprint 2: `mobile/src/screens/hubs/DiagnosticsHubScreen.tsx`

### 3.1 Functional Requirements & Component Structure
1. **Header & Mode Switcher**:
   - `Header`: institutional title, role badge, language selector, SOS button.
   - Dual-tab mode switcher:
     - `DIRECTORY` (48-Test Searchable Directory)
     - `TRACKER` (4-Stage Sample Tracker & Barcodes)
2. **Directory Mode**:
   - **Category Filter Tabs**: Horizontal scrollable pills: `All (48)`, `Hematology (12)`, `Biochemistry (12)`, `Pathology (8)`, `Microbiology (8)`, `Radiology (8)`.
   - **Search Input**: Live filtering on test name (English & Marathi) and code (e.g. `CBC`, `BIO-01`, `Troponin`).
   - **Fasting Filter Toggle**: Chip toggle to show fasting-required tests only.
   - **Test Card**:
     - Test Name (En & Mr), Code chip, Category badge.
     - Sample requirements (e.g., `Whole Blood EDTA`, `Serum Clot`, `Morning Sputum`).
     - Prerequisite badges: Amber badge `Fasting: 8-10h` or neutral `No Fasting`.
     - Turnaround time badge: `TAT: X hrs`.
     - Reference range preview.
     - Action: `Order Test` button with feedback alert.
3. **Sample Tracker Mode**:
   - **Barcode Search Field**: Input with barcode icon for looking up `MH-LAB-XXXXXX`.
   - **Quick Stage Filter**: `All`, `Ordered`, `Collected`, `Analyzing`, `Result Ready`.
   - **4-Stage Pipeline Stepper Card**:
     - Order ID & `MH-LAB-XXXXXX` barcode in high-contrast monospace.
     - Patient Name, ABHA ID, Doctor, Facility.
     - Priority chip (`CRITICAL` / `URGENT` / `ROUTINE`).
     - Visual 4-Step Stepper:
       `ORDERED` -> `COLLECTED` -> `ANALYZING` -> `RESULT_READY`
       - Step circles with checkmarks for past stages, glowing highlight for active stage.
       - Stage timestamps.
     - Action Controls:
       - If status < `RESULT_READY`: `Advance Stage` button (evaluator/clinician demo capability).
       - If status === `RESULT_READY`: `View Lab Report` primary button.
4. **Interactive Lab Report Modal & PDF Generation**:
   - Built on `mobile/src/components/Modal.tsx`.
   - Government of Maharashtra & HealthWay diagnostic header.
   - Patient details block with ABHA ID, age/gender, order ID, barcode.
   - Referring Physician & Lab Facility NABL accreditation info.
   - **Parameter Results Table**:
     - Columns: Parameter, Observed Value, Reference Range, Flag.
     - Parameter rows rendered with bilingual names.
     - Flag Badges:
       - `NORMAL`: Success green badge.
       - `BORDERLINE`: Amber caution badge.
       - `CRITICAL`: Red danger badge with critical warning banner detailing clinical reason.
   - Pathologist Overall Impression & Signoff (Dr. Sanjay Kale / Dr. Aniruddha Kulkarni).
   - **PDF Generation & Native Share Action**:
     - `handleDownloadPdf`:
       ```typescript
       const html = generateReportHtml(currentReport);
       const { uri } = await Print.printToFileAsync({ html });
       ```
     - `handleSharePdf`:
       ```typescript
       if (await Sharing.isAvailableAsync()) {
         await Sharing.shareAsync(uri, {
           mimeType: 'application/pdf',
           dialogTitle: `Diagnostic Report - ${currentReport.orderId}`,
           UTI: 'com.adobe.pdf',
         });
       }
       ```

### 3.2 Report HTML Template Generator for `expo-print`
```typescript
function generateReportHtml(test: LabTest): string {
  const resultRows = (test.results || [])
    .map(
      r => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 10px 8px; font-weight: 600; color: #1C2B3A;">
        ${r.name}<br/><span style="font-size: 11px; color: #64748B;">${r.nameMr || ''}</span>
      </td>
      <td style="padding: 10px 8px; font-weight: 700; color: ${r.flag === 'CRITICAL' ? '#DC2626' : '#1C2B3A'};">
        ${r.value} ${r.unit}
      </td>
      <td style="padding: 10px 8px; color: #64748B;">${r.referenceRange}</td>
      <td style="padding: 10px 8px;">
        <span style="
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          background-color: ${r.flag === 'CRITICAL' ? '#FEE2E2' : r.flag === 'BORDERLINE' ? '#FEF3C7' : '#DCFCE7'};
          color: ${r.flag === 'CRITICAL' ? '#DC2626' : r.flag === 'BORDERLINE' ? '#D97706' : '#16A34A'};
        ">
          ${r.flag}
        </span>
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>HealthWay Lab Report - ${test.barcode}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #1C2B3A; }
        .header { border-bottom: 2px solid #1A4B8C; padding-bottom: 12px; margin-bottom: 18px; }
        .gov-title { font-size: 18px; font-weight: 800; color: #1A4B8C; text-transform: uppercase; }
        .sub-title { font-size: 12px; color: #546E7A; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th { text-align: left; padding: 8px; background: #F1F5F9; color: #475569; font-weight: 700; }
        .impression { margin-top: 20px; padding: 12px; background: #EFF6FF; border-left: 4px solid #1A4B8C; border-radius: 4px; font-size: 12px; }
        .critical-box { margin-top: 12px; padding: 10px; background: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 4px; color: #991B1B; font-weight: 700; }
        .footer { margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="gov-title">Government of Maharashtra • Public Health Department</div>
        <div class="sub-title">HealthWay Integrated Rural Laboratory Diagnostic Network (NABL Empanelled)</div>
      </div>
      <div class="meta-grid">
        <div><strong>Patient Name:</strong> ${test.patientName}</div>
        <div><strong>ABHA ID:</strong> ${test.abhaId || 'N/A'}</div>
        <div><strong>Barcode:</strong> ${test.barcode}</div>
        <div><strong>Order ID:</strong> ${test.orderId}</div>
        <div><strong>Facility:</strong> ${test.facilityName}</div>
        <div><strong>Referring Doctor:</strong> ${test.prescribedByDoctor}</div>
        <div><strong>Sample Type:</strong> ${test.sampleType}</div>
        <div><strong>Reported Date:</strong> ${test.completedAt || new Date().toLocaleDateString()}</div>
      </div>
      ${test.hasCriticalValue ? '<div class="critical-box">CRITICAL PARAMETER ALERT: Immediate physician consultation required.</div>' : ''}
      <table>
        <thead>
          <tr>
            <th>Investigation Parameter</th>
            <th>Observed Value</th>
            <th>Reference Range</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          ${resultRows}
        </tbody>
      </table>
      <div class="impression">
        <strong>Clinical Impression:</strong><br/>
        ${test.overallImpression || 'Parameters analyzed according to standard clinical laboratory protocols.'}
      </div>
      <div class="footer">
        <div>Verified Pathologist: ${test.verifiedByPathologist || 'Chief Pathologist, NABL'}</div>
        <div>Authorized System Generated Report • HealthWay Mobile Portal</div>
      </div>
    </body>
    </html>
  `;
}
```

---

## 4. Blueprint 3: `mobile/src/screens/hubs/ReferralsHubScreen.tsx`

### 4.1 Functional Requirements & Component Structure
1. **Header & Operational Summary**:
   - `Header`: institutional title, role badge, language switcher, emergency SOS button.
   - Quick Metric Strip:
     - Total Transfers Active
     - Urgent/Immediate SLA countdowns
     - Overdue Cases alert banner (highlighted red when `overdueCount > 0`)
     - Completed / Counter-Referrals count
2. **Filters & Search**:
   - Search input: by Patient Name, ID, or `REF-YYYYMMDD-XXXX`.
   - Stage Filter Pills: `All`, `In Transit`, `Accepted`, `Completed`, `Overdue`.
   - Urgency Filter Pills: `All`, `Immediate (<=2h)`, `Urgent (<=24h)`, `Priority (<=72h)`, `Routine (<=7d)`.
3. **7-Stage Referral Tracking Card**:
   - Referral ID pill (`REF-20240615-9102`), Urgency badge (`IMMEDIATE`, `URGENT`, `PRIORITY`, `ROUTINE`), Stage badge (`IN_TRANSIT`, etc.).
   - Patient Info: Sunita Jadhav (28F), ABHA ID, Village: Tapola.
   - **Inter-Facility Routing Section**:
     - From Facility: Sub-Centre Tapola (`FAC007`) — Sister Anandi Gaikwad (ANM).
     - Arrow Indicator with transport badge (`102 Janani Express` / `108 ALS Ambulance` / `Own Vehicle`).
     - To Facility: District Hospital Satara (`FAC001`) — Department of OBGYN.
   - **SLA Urgency Countdown Engine**:
     - Calls `computeReferralSla(referral.createdAt, referral.urgency)`.
     - If `stage !== 'COMPLETED'`:
       - If `isOverdue === false`: Green/Amber countdown badge with clock icon, e.g. `SLA: 2h 45m remaining`.
       - If `isOverdue === true`: Flashing Red Alert Badge `OVERDUE by 1h 15m` with warning icon and escalation alert.
     - If `stage === 'COMPLETED'`:
       - Success green badge `Completed within SLA`.
   - **7-Stage Visual Progress Timeline**:
     - Visual track showing the sequential progression:
       `CREATED` -> `NOTIFIED` -> `ACCEPTED` -> `IN_TRANSIT` -> `REACHED` -> `ADMITTED` -> `COMPLETED`.
     - Step icon indicators with active checkmarks and current stage highlight.
   - **Transport & Escort Telemetry**:
     - Vehicle number (e.g. `MH-12-AH-8419`), Driver name, Driver phone with direct 1-tap call button.
     - Assigned ASHA Escort name, phone with 1-tap call button.
   - **Action Bar**:
     - `Advance Stage` button (for clinic staff / evaluator simulation): increments stage through the 7-step sequence and persists to `storageEngine` (store: `referral_drafts`).
     - `View Counter-Referral Feedback` button (active on `COMPLETED` or `ADMITTED` cases).
4. **Closed-Loop Counter-Referral Feedback Sheet**:
   - Triggered via `Modal.tsx`.
   - Feedback Details:
     - Receiving Specialist Doctor Name, Qualifications, and Hospital (e.g., Dr. Avinash Sawant, MD, DM Cardiology, District Hospital Satara).
     - Clinical Discharge Summary & Final Diagnosis.
     - Treatment Given Breakdown (medications loaded, procedures performed).
     - Post-Discharge Follow-up Plan for referring Sub-Centre / PHC doctor & village ASHA (e.g., daily BP monitoring, iron supplementation, 14-day checkup).
     - Routing Status: `Feedback Delivered to ASHA Suman Patil (Tapola)`.

---

## 5. Blueprint 4: `mobile/src/screens/hubs/MedicineHubScreen.tsx`

### 5.1 Functional Requirements & Component Structure
1. **Header & District Facility Selector**:
   - `Header`: institutional title, role badge, language selector, SOS button.
   - Facility Selector dropdown/horizontal pill strip:
     - `All Facilities`
     - `District Hospital Satara (FAC001)`
     - `CHC Wai (FAC003)`
     - `PHC Mahabaleshwar (FAC005)`
     - `Sub-Centre Tapola (FAC007)`
2. **Real-Time Stock Inventory Metric Bar**:
   - 4-Tier Stock Summary Badges:
     - `ADEQUATE`: Green count (stock > buffer)
     - `LOW`: Yellow count (25% < stock <= buffer)
     - `CRITICAL`: Orange count (0 < stock <= 25%)
     - `OUT OF STOCK`: Red count (stock === 0)
3. **Search & Category Filtering**:
   - Real-time search by Brand Name, Generic Chemical Name, Active Salt, or Therapeutic Indication.
   - Category Pills: `All (18)`, `Essential`, `Antibiotic`, `Maternal & Child`, `Chronic NCD`, `Emergency`.
   - Low/Out of Stock quick filter chip.
4. **EDL Medicine Inventory Card**:
   - Top Header: Medicine Name (En & Mr), Code (`EDL-01`), Dosage Form & Strength (`Tablet 500mg`).
   - Active Chemical Salt highlighted badge: `Active Salt: Acetaminophen 500mg`.
   - Current Stock Status Badge:
     - `ADEQUATE`: Green badge (`ADEQUATE • 1,200 Tablets`)
     - `LOW`: Yellow badge (`LOW STOCK • 150 Tablets`)
     - `CRITICAL`: Orange badge (`CRITICAL BUFFER BREACH • 45 Tablets`)
     - `OUT_OF_STOCK`: Red badge (`OUT OF STOCK • 0 Tablets`)
   - Visual Stock Level Meter:
     - Progress bar showing current stock level relative to `minBuffer * 2`.
     - Minimum Buffer threshold marker (`Min Buffer: 500`).
   - Batch & Expiry Tag: Batch Number (`PCM-2024-88`), Expiry Date with Expiring-Soon warning if <= 90 days.
5. **Active Salt Generic Substitution Engine**:
   - When a medicine is `OUT_OF_STOCK` or `CRITICAL`, the Generic Substitution Card automatically expands:
     - Banner: `Primary EDL item low or out of stock. Equivalent chemical salt alternatives in stock:`
     - Lists mapped generic substitutes matching dosage form and strength (e.g., for Paracetamol: `Crocin 500mg`, `Dolo 500mg`, `Calpol 500mg`; for IFA: `Autrin`, `Fefol Z`; for Amlodipine: `Amlong 5mg`, `Stamlo 5mg`).
     - Displays substitute current stock level and status badge.
     - `Select Substitute` action button: updates prescription or order draft.
6. **Auto-Indent Warehouse Reorder Modal Form**:
   - Triggered when tapping `Create Reorder Indent` on any medicine or low-stock warning.
   - Auto-calculates required requisition quantity:
     `requisitionQty = Math.max(minBuffer * 2 - currentStock, minBuffer)` (matches Tier 1 F18-3 and Tier 2 SS10 formulas).
   - Form Fields:
     - Target Facility (pre-filled or selector).
     - Target Warehouse: `Satara District Central Medical Store (NHM Warehouse)`.
     - Medicine Name, Code, and Active Salt (read-only).
     - Current Stock & Minimum Buffer (read-only).
     - Reorder Quantity Input: editable numeric input pre-filled with calculated quantity.
     - Urgency Selector: `ROUTINE` (if stock > 0), `URGENT` (if LOW), `CRITICAL_EMERGENCY` (if OUT_OF_STOCK).
     - Requisition Justification Notes (multiline `FormInput`).
   - Reorder Submission Action:
     - Enqueues sync payload to `sync_queue` store via `storageEngine.enqueueSync('/api/v1/indents', 'POST', indentPayload)`.
     - Saves updated medicine record to `medicine_stock`.
     - Displays instant confirmation with Indent Reference ID (`IND-2026-XXXX`).

---

## 6. Integration Architecture

### 6.1 State Management & Offline Persistence Flow
```
User Action (Order / Advance / Indent)
  │
  ├──► 1. Local Component React State Update (Instant UI feedback)
  │
  ├──► 2. StorageEngine.saveItem (SQLite / AsyncStorage persistence)
  │       Stores: 'medicine_stock', 'referral_drafts', 'sync_queue'
  │
  └──► 3. StorageEngine.enqueueSync (Outbox pattern for cloud reconciliation)
          Endpoint: '/api/v1/referrals', '/api/v1/indents', '/api/v1/lab-orders'
```

### 6.2 Navigation & Role Access Matrix
All three hubs are cross-cutting resources registered in the top-level navigation structure and accessible across all 4 actor roles:

| Route Name | Target Screen File | Allowed Roles | Header Navigation |
|---|---|---|---|
| `DiagnosticsHub` | `mobile/src/screens/hubs/DiagnosticsHubScreen.tsx` | `patient`, `asha`, `doctor`, `admin` | Title: "Diagnostics Hub", Back button, SOS |
| `ReferralsHub` | `mobile/src/screens/hubs/ReferralsHubScreen.tsx` | `patient`, `asha`, `doctor`, `admin` | Title: "Referral Pipeline", Back button, SOS |
| `MedicineHub` | `mobile/src/screens/hubs/MedicineHubScreen.tsx` | `patient`, `asha`, `doctor`, `admin` | Title: "Medicine Availability", Back button, SOS |

---

## 7. Worker Implementation Checklist

The implementation worker should execute the changes in the following sequence:

1. **Step 1: Create Authoritative Mock Datasets in `mobile/src/data/`**:
   - `mobile/src/data/diagnosticCatalog.ts`: 48 tests across 5 categories + 5 initial sample orders.
   - `mobile/src/data/edlMedicines.ts`: 18+ EDL medicines + multi-facility stock + substitution mappings.
   - `mobile/src/data/referralsData.ts`: 6 initial referrals spanning 7 stages + SLA countdown calculator.
   - `mobile/src/data/facilitiesData.ts`: 7 district facilities (`FAC001` to `FAC007`) + helplines.
   - `mobile/src/data/index.ts`: Barrel exports.

2. **Step 2: Implement `DiagnosticsHubScreen.tsx`**:
   - Location: `mobile/src/screens/hubs/DiagnosticsHubScreen.tsx`.
   - Features: 48-test searchable directory, category tabs, 4-stage sample tracker with `MH-LAB-XXXXXX` barcodes, lab report viewer modal with critical/normal parameter flags, and `expo-print`/`expo-sharing` PDF generation.

3. **Step 3: Implement `ReferralsHubScreen.tsx`**:
   - Location: `mobile/src/screens/hubs/ReferralsHubScreen.tsx`.
   - Features: 7-stage pipeline tracking (`CREATED` to `COMPLETED`), SLA urgency tiers with countdown badges and overdue alerts, inter-facility routing cards (108/102 transport), and closed-loop counter-referral feedback cards.

4. **Step 4: Implement `MedicineHubScreen.tsx`**:
   - Location: `mobile/src/screens/hubs/MedicineHubScreen.tsx`.
   - Features: 18+ EDL catalog search, real-time stock levels across PHCs/CHCs, 4 stock status tiers (`ADEQUATE`, `LOW`, `CRITICAL`, `OUT_OF_STOCK`), active salt generic substitution engine, and warehouse reorder indent form (`minBuffer * 2 - currentStock`).

5. **Step 5: Verification & Quality Assurance**:
   - Run `npx tsc --noEmit` in `mobile/` -> must pass with 0 errors.
   - Run `npm test` in `mobile/` -> all 18 test suites and 469 tests must continue to pass cleanly.
