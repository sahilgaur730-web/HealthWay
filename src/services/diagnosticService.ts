export type DiagnosticCategory = 
  | 'Hematology' 
  | 'Biochemistry' 
  | 'Urine' 
  | 'Microbiology' 
  | 'Radiology';

export type TestPriority = 'STAT' | 'URGENT' | 'ROUTINE';

export type SampleCollectionMethod = 'VISIT_LAB' | 'HOME_COLLECTION' | 'AT_FACILITY';

export type TestOrderStatus = 
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'IN_TRANSIT'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ParameterResult {
  parameterId: string;
  name: string;
  nameMr: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'BORDERLINE' | 'CRITICAL';
  criticalReasonMr?: string;
  criticalReasonEn?: string;
}

export interface CatalogTestItem {
  id: string;
  code: string;
  nameMr: string;
  nameEn: string;
  category: DiagnosticCategory;
  categoryLabelMr: string;
  categoryLabelEn: string;
  sampleType: string;
  fastingRequired: boolean;
  tatHours: number;
  isEmpanelledGovt: boolean;
  defaultParameters?: ParameterResult[];
}

export interface DiagnosticLabFacility {
  id: string;
  nameMr: string;
  nameEn: string;
  typeMr: string;
  typeEn: string;
  distanceKm: number;
  operatingHours: string;
  isOpenNow: boolean;
  isEmpanelled: boolean;
  isGovtOnly: boolean;
  hasHomeCollection: boolean;
  accreditation: string; // e.g. "NABL Accredited", "Govt NHM Free"
  testsAvailableCount: number;
  turnaroundTimeLabel: string;
  phone: string;
  address: string;
}

export interface TestOrderItem {
  id: string; // Token format: ORD-YYYYMMDD-RANDOM
  patientId: string;
  patientNameMr: string;
  patientNameEn: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;

  prescribedByDoctorMr: string;
  prescribedByDoctorEn: string;
  facilityMr: string;
  facilityEn: string;

  targetLabId: string;
  targetLabNameMr: string;
  targetLabNameEn: string;

  tests: CatalogTestItem[];
  priority: TestPriority;
  collectionMethod: SampleCollectionMethod;
  clinicalNotes: string;

  status: TestOrderStatus;
  createdAt: string;
  updatedAt: string;
  barcode: string;

  sampleCollectedAt?: string;
  inTransitAt?: string;
  processingAt?: string;
  completedAt?: string;

  // Lab Results
  results?: ParameterResult[];
  overallImpressionMr?: string;
  overallImpressionEn?: string;
  hasCriticalValue: boolean;
  verifiedByPathologistMr?: string;
  verifiedByPathologistEn?: string;
  nablCertNumber?: string;
  abhaRecordSyncId?: string;
  pdfDownloadUrl?: string;
}

// 40+ Diagnostic Tests Directory across 5 categories
export const CATALOG_TESTS: CatalogTestItem[] = [
  // 1. Hematology (Blood) - 12 tests
  {
    id: 'TEST-HEM-01',
    code: 'CBC',
    nameMr: 'संपूर्ण रक्त तपासणी (CBC + ESR)',
    nameEn: 'Complete Blood Count with Platelets & ESR',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
    defaultParameters: [
      { parameterId: 'p1', name: 'Hemoglobin (Hb)', nameMr: 'हिमोग्लोबिन', value: '10.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'BORDERLINE', criticalReasonMr: 'सौम्य अशक्तपणा (Mild Anemia)', criticalReasonEn: 'Mild Anemia' },
      { parameterId: 'p2', name: 'Total Leucocyte Count (WBC)', nameMr: 'पांढऱ्या पेशी', value: '7,800', unit: '/cu.mm', referenceRange: '4,000 - 11,000', flag: 'NORMAL' },
      { parameterId: 'p3', name: 'Platelet Count', nameMr: 'प्लेटलेट्स', value: '2.1', unit: 'Lakh/cu.mm', referenceRange: '1.5 - 4.5', flag: 'NORMAL' },
      { parameterId: 'p4', name: 'RBC Count', nameMr: 'तांबड्या पेशी', value: '4.1', unit: 'mil/cu.mm', referenceRange: '3.8 - 5.2', flag: 'NORMAL' },
      { parameterId: 'p5', name: 'ESR (Westergren)', nameMr: 'इएसआर', value: '18', unit: 'mm/1st hr', referenceRange: '0 - 20', flag: 'NORMAL' },
    ],
  },
  {
    id: 'TEST-HEM-02',
    code: 'HB-STAT',
    nameMr: 'डिजिटल हिमोग्लोबिन (Digital Hb Point-of-Care)',
    nameEn: 'Hemoglobin Quick PoCT (Mission Poshan)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Capillary Blood',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-03',
    code: 'BG-RH',
    nameMr: 'रक्तगट व आरएच फॅक्टर (Blood Group & Rh Type)',
    nameEn: 'Blood Grouping & Rh Typing',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Whole Blood',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-04',
    code: 'PBS-MP',
    nameMr: 'पेरिफेरस ब्लड स्मीअर (मलेरिया जंतू तपासणी)',
    nameEn: 'Peripheral Blood Smear for Malaria Parasite',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Whole Blood Smear',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-05',
    code: 'HBA1C',
    nameMr: 'ग्लायकेटेड हिमोग्लोबिन (HbA1c - ३ महिन्यांची साखर)',
    nameEn: 'Glycated Hemoglobin (HbA1c Glycemic Index)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-06',
    code: 'SICKLE',
    nameMr: 'सिकल सेल सॉल्युबिलिटी व इलेक्ट्रोफोरेसीस',
    nameEn: 'Sickle Cell Solubility & HPLC Screening',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Whole Blood',
    fastingRequired: false,
    tatHours: 12,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-07',
    code: 'DENGUE-NS1',
    nameMr: 'डेंग्यू NS1 अँटीजेन व IgM/IgG रॅपिड',
    nameEn: 'Dengue NS1 Antigen & Duo Antibody Test',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-08',
    code: 'PT-INR',
    nameMr: 'प्रोथ्रोम्बिन टाईम (PT / INR कोॲग्युलेशन)',
    nameEn: 'Prothrombin Time with INR (Coagulation)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Citrated Plasma',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-09',
    code: 'RETIC',
    nameMr: 'रेटिक्युलोसाईट काउंट (Reticulocyte Count)',
    nameEn: 'Reticulocyte Count (Bone Marrow Activity)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Whole Blood',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-10',
    code: 'BT-CT',
    nameMr: 'रक्तस्राव व गोठण वेळ (Bleeding & Clotting Time)',
    nameEn: 'Bleeding Time (BT) & Clotting Time (CT)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Capillary Blood',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-11',
    code: 'COOMBS',
    nameMr: 'कुम्ब्स टेस्ट (Direct & Indirect Antiglobulin)',
    nameEn: 'Coombs Test (Rh Incompatibility Screening)',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'EDTA Blood',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-HEM-12',
    code: 'SERUM-FE',
    nameMr: 'सिरम फेरिटिन व आयर्न प्रोफाईल (Ferritin & TIBC)',
    nameEn: 'Serum Ferritin, Iron & TIBC Profile',
    category: 'Hematology',
    categoryLabelMr: 'रक्ततपासणी (Hematology)',
    categoryLabelEn: 'Hematology',
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 12,
    isEmpanelledGovt: true,
  },

  // 2. Biochemistry - 12 tests
  {
    id: 'TEST-BIO-01',
    code: 'FBS-PPBS',
    nameMr: 'रक्तातील साखर - उपाशीपोटी व जेवणानंतर (FBS & PPBS)',
    nameEn: 'Fasting & Post-Prandial Blood Sugar',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Fluoride Plasma',
    fastingRequired: true,
    tatHours: 2,
    isEmpanelledGovt: true,
    defaultParameters: [
      { parameterId: 'bp1', name: 'Fasting Blood Sugar (FBS)', nameMr: 'उपाशीपोटी साखर', value: '98', unit: 'mg/dL', referenceRange: '70 - 100', flag: 'NORMAL' },
      { parameterId: 'bp2', name: 'Post-Prandial Blood Sugar (PPBS)', nameMr: 'जेवणानंतर २ तास साखर', value: '136', unit: 'mg/dL', referenceRange: '< 140', flag: 'NORMAL' },
    ],
  },
  {
    id: 'TEST-BIO-02',
    code: 'RBS-STAT',
    nameMr: 'त्वरित ग्लुकोज चाचणी (Random Blood Sugar PoCT)',
    nameEn: 'Random Blood Sugar (PoCT Glucometer)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Capillary Whole Blood',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-03',
    code: 'LFT',
    nameMr: 'यकृत कार्यक्षमता तपासणी (Liver Function Test - LFT)',
    nameEn: 'Liver Function Test (Bilirubin, SGOT, SGPT, ALP, Proteins)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 6,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-04',
    code: 'KFT-RFT',
    nameMr: 'मूत्रपिंड कार्यक्षमता तपासणी (Kidney Function / RFT)',
    nameEn: 'Kidney Function Test (Creatinine, Urea, BUN, Uric Acid)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-05',
    code: 'LIPID',
    nameMr: 'लिपिड प्रोफाईल (Cholesterol, HDL, LDL, Triglycerides)',
    nameEn: 'Lipid Profile (Cardiovascular Risk Evaluation)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 6,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-06',
    code: 'THYROID-TSH',
    nameMr: 'थायरॉईड प्रोफाईल (TSH, Free T3, Free T4)',
    nameEn: 'Thyroid Function Profile (TSH, FT3, FT4)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 8,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-07',
    code: 'SERUM-ELECTRO',
    nameMr: 'सिरम इलेक्ट्रोलाइट्स (Sodium, Potassium, Chloride)',
    nameEn: 'Serum Electrolytes (Na+, K+, Cl-)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-08',
    code: 'SERUM-CALCIUM',
    nameMr: 'सिरम कॅल्शियम व फॉस्फरस (Calcium & Phosphorus)',
    nameEn: 'Serum Total Calcium & Phosphorus',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-09',
    code: 'TROP-I-STAT',
    nameMr: 'कार्डियाक ट्रॉपोनिन I (Cardiac Troponin I STAT)',
    nameEn: 'High-Sensitivity Cardiac Troponin I (MI Rule-out)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum / Whole Blood',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-10',
    code: 'SERUM-AMYLASE',
    nameMr: 'सिरम अमायलेज व लायपेज (Pancreatic Enzymes)',
    nameEn: 'Serum Amylase & Lipase',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-11',
    code: 'VIT-D3-B12',
    nameMr: 'व्हिटॅमिन D3 व व्हिटॅमिन B12 तपासणी',
    nameEn: 'Vitamin D3 (25-OH) & Vitamin B12 Immunoassay',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 24,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-BIO-12',
    code: 'CRP-HS',
    nameMr: 'सी-रिॲक्टिव्ह प्रोटीन (Quantitative hs-CRP)',
    nameEn: 'High-Sensitivity C-Reactive Protein (Infection/Inflammation)',
    category: 'Biochemistry',
    categoryLabelMr: 'बायोकेमिस्ट्री (Biochemistry)',
    categoryLabelEn: 'Biochemistry',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },

  // 3. Urine / Clinical Pathology - 8 tests
  {
    id: 'TEST-URN-01',
    code: 'URINE-RM',
    nameMr: 'युरिन रुटीन व मायक्रोस्कोपी (Urine Routine & Microscopic)',
    nameEn: 'Urine Routine & Microscopic Examination',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Clean Catch Midstream Urine',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-02',
    code: 'UPT-RAPID',
    nameMr: 'त्वरित गर्भधारणा चाचणी (Rapid Urine Pregnancy Test - UPT)',
    nameEn: 'Rapid Urine Pregnancy Card Test (hCG Detection)',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Early Morning Urine',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-03',
    code: 'URINE-ALB-SUGAR',
    nameMr: 'युरिन अल्ब्युमिन व शुगर (Dipstick Strip Test)',
    nameEn: 'Urine Albumin & Sugar (Frontline Strip Method)',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Random Urine',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-04',
    code: 'UACR',
    nameMr: 'युरिन मायक्रोअल्ब्युमिन / क्रिएटिनिन गुणोत्तर (UACR)',
    nameEn: 'Urine Albumin-to-Creatinine Ratio (Early Diabetic Nephropathy)',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Spot Urine',
    fastingRequired: false,
    tatHours: 6,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-05',
    code: '24HR-PROTEIN',
    nameMr: '२४ तास युरिन प्रोटीन (24-Hour Urinary Protein)',
    nameEn: '24-Hour Urinary Protein Excretion (Preeclampsia / Nephrotic)',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: '24-Hour Urine Collection',
    fastingRequired: false,
    tatHours: 24,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-06',
    code: 'STOOL-OCCULT',
    nameMr: 'शौचाची तपासणी व गुप्त रक्त (Stool Routine & Occult Blood)',
    nameEn: 'Stool Routine, Parasites & Occult Blood (FOBT)',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Stool Sample',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-07',
    code: 'URINE-BILE',
    nameMr: 'युरिन बाईल सॉल्ट्स व बाईल पिगमेंट (Bile Salts & Pigments)',
    nameEn: 'Urine Bile Salts (Hay\'s test) & Pigments (Fouchet\'s test)',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Fresh Urine',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-URN-08',
    code: 'URINE-BENCE-JONES',
    nameMr: 'बेन्स जोन्स प्रोटीन (Bence Jones Protein Test)',
    nameEn: 'Bence Jones Protein Heat Coagulation Test',
    category: 'Urine',
    categoryLabelMr: 'लघवी तपासणी (Urine & Pathology)',
    categoryLabelEn: 'Clinical Pathology',
    sampleType: 'Early Morning Urine',
    fastingRequired: false,
    tatHours: 8,
    isEmpanelledGovt: true,
  },

  // 4. Microbiology & Serology - 8 tests
  {
    id: 'TEST-MIC-01',
    code: 'CBNAAT-TB',
    nameMr: 'क्षयरोग थुंकी जिन-एक्स्पर्ट (CBNAAT for MTB/RIF)',
    nameEn: 'GeneXpert MTB/RIF Sputum Assay (NTEP Verified)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Early Morning Sputum (Sterile Container)',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-02',
    code: 'SPUTUM-AFB',
    nameMr: 'थुंकी मायक्रोस्कोपी (Sputum Smear for AFB - ZN Staining)',
    nameEn: 'Sputum Acid-Fast Bacilli (AFB) Smear Microscopy',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Sputum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-03',
    code: 'WIDAL-SLIDE',
    nameMr: 'विडल टेस्ट (Widal Slide & Tube for Typhoid)',
    nameEn: 'Widal Agglutination Reaction (Salmonella Typhi)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-04',
    code: 'HIV-SCREEN',
    nameMr: 'एचआयव्ही १ व २ अँटीबॉडी तपासणी (NACO Rapid Test)',
    nameEn: 'HIV 1 & 2 Rapid Triline Antibody (NACO Empanelled)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Serum / Whole Blood',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-05',
    code: 'HBSAG-RAPID',
    nameMr: 'हिपॅटायटीस बी पृष्ठभाग अँटीजेन (HBsAg Rapid)',
    nameEn: 'Hepatitis B Surface Antigen (HBsAg Screening)',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-06',
    code: 'HCV-RAPID',
    nameMr: 'हिपॅटायटीस सी अँटीबॉडी चाचणी (HCV Rapid Screen)',
    nameEn: 'Hepatitis C Virus (HCV) Antibody Rapid Card',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-07',
    code: 'VDRL-RPR',
    nameMr: 'सिफिलीस व्हीडीआरएल / आरपीआर चाचणी (VDRL / RPR)',
    nameEn: 'Syphilis VDRL / RPR Non-Treponemal Flocculation',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-MIC-08',
    code: 'URINE-CULTURE',
    nameMr: 'लघवी कल्चर व अँटिबायोटिक संवेदनशीलता (Culture & Sensitivity)',
    nameEn: 'Urine Bacterial Culture & Antibiotic Susceptibility',
    category: 'Microbiology',
    categoryLabelMr: 'मायक्रोबायोलॉजी (Microbiology & Serology)',
    categoryLabelEn: 'Microbiology & Serology',
    sampleType: 'Midstream Urine (Sterile)',
    fastingRequired: false,
    tatHours: 48,
    isEmpanelledGovt: true,
  },

  // 5. Radiology & Imaging - 8 tests
  {
    id: 'TEST-RAD-01',
    code: 'USG-ANC-SCAN',
    nameMr: 'प्रसूतीपूर्व ॲनोमली स्कॅन (Obstetric USG Anomaly 20-22 Wks)',
    nameEn: 'Obstetric Level-II Anomaly Scan (20-22 Wks)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Ultrasound Imaging',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-02',
    code: 'USG-DOPPLER',
    nameMr: 'प्रसूतीपूर्व कलर डॉपलर स्कॅन (Obstetric Color Doppler)',
    nameEn: 'Obstetric Feto-Maternal Color Doppler Study',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Doppler Ultrasound',
    fastingRequired: false,
    tatHours: 3,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-03',
    code: 'XRAY-CHEST-PA',
    nameMr: 'डिजिटल छातीचा क्ष-किरण (Digital Chest X-Ray PA View)',
    nameEn: 'Digital Chest Radiography (PA View)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Digital X-Ray Film',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-04',
    code: 'USG-ABD-PELVIS',
    nameMr: 'पोट व ओटीपोटाची सोनोग्राफी (USG Abdomen & Pelvis)',
    nameEn: 'Ultrasound Whole Abdomen & Pelvis',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Ultrasound Imaging',
    fastingRequired: true,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-05',
    code: 'ECG-12LEAD',
    nameMr: '१२-लीड डिजिटल ईसीजी (12-Lead Digital ECG with AI Analysis)',
    nameEn: '12-Lead Electrocardiogram with Automated Tele-ECG Analysis',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Electrocardiogram Tracing',
    fastingRequired: false,
    tatHours: 1,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-06',
    code: '2D-ECHO',
    nameMr: '२डी इकोकार्डिओग्राफी व कलर डॉपलर (2D Echocardiography)',
    nameEn: 'Transthoracic 2D Echocardiography with Color Flow',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Cardiovascular Imaging',
    fastingRequired: false,
    tatHours: 4,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-07',
    code: 'CT-HEAD-NCCT',
    nameMr: 'मेंदूचा सीटी स्कॅन (Non-Contrast CT Brain Emergency)',
    nameEn: 'Non-Contrast Computed Tomography of Brain (Head NCCT)',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Multi-slice CT Scan',
    fastingRequired: false,
    tatHours: 2,
    isEmpanelledGovt: true,
  },
  {
    id: 'TEST-RAD-08',
    code: 'MAMMOGRAPHY',
    nameMr: 'डिजिटल मॅमोग्राफी (Bilateral Screening Mammogram)',
    nameEn: 'Digital Bilateral Screening Mammography',
    category: 'Radiology',
    categoryLabelMr: 'रेडिओलॉजी व इमेजिंग (Radiology & Imaging)',
    categoryLabelEn: 'Radiology & Imaging',
    sampleType: 'Digital Mammogram',
    fastingRequired: false,
    tatHours: 12,
    isEmpanelledGovt: true,
  },
];

// Nearby Labs Directory with Filter Parameters
export const NEARBY_LABS: DiagnosticLabFacility[] = [
  {
    id: 'LAB-01',
    nameMr: 'प्राथमिक आरोग्य केंद्र शिरूर क्लिनिकल पॅथॉलॉजी लॅब',
    nameEn: 'PHC Shirur Clinical Pathology Laboratory',
    typeMr: 'शासकीय प्राथमिक आरोग्य केंद्र लॅब',
    typeEn: 'Government Primary Health Centre Laboratory',
    distanceKm: 2.3,
    operatingHours: 'स. ०८:०० ते दु. ०४:०० (Mon-Sat)',
    isOpenNow: true,
    isEmpanelled: true,
    isGovtOnly: true,
    hasHomeCollection: true,
    accreditation: 'NABL Certified & NHM Free Diagnostics',
    testsAvailableCount: 32,
    turnaroundTimeLabel: '२ ते ४ तास (Same Day)',
    phone: '+91 2138 222340',
    address: 'PHC संकुल, शिरूर - ४१२२१०',
  },
  {
    id: 'LAB-02',
    nameMr: 'जिल्हा रुग्णालय पुणे मध्यवर्ती निदान केंद्र (औंध)',
    nameEn: 'District Hospital Pune Central Diagnostics & Imaging Hub',
    typeMr: 'तृतीयक शासकीय संदर्भ लॅब व इमेजिंग केंद्र',
    typeEn: 'Apex Tertiary Government Diagnostic & Imaging Center',
    distanceKm: 42.0,
    operatingHours: '२४ तास उघडे (24x7 Emergency Services)',
    isOpenNow: true,
    isEmpanelled: true,
    isGovtOnly: true,
    hasHomeCollection: false,
    accreditation: 'NABL Accredited & AERB Approved Imaging',
    testsAvailableCount: 48,
    turnaroundTimeLabel: '१ ते ६ तास (STAT / Urgent)',
    phone: '+91 20 2727 3400',
    address: 'औंध छावणी, पुणे - ४११०२७',
  },
  {
    id: 'LAB-03',
    nameMr: 'उपकेंद्र वडगाव डिजिटल पॉईंट-ऑफ-केअर युनिट (PoCT)',
    nameEn: 'Sub-Centre Vadgaon Digital Point-of-Care Diagnostic Kit',
    typeMr: 'आशा / एएनएम संचालित गाव पातळी केंद्र',
    typeEn: 'Village Frontline PoCT Unit (ASHA / ANM Operated)',
    distanceKm: 0.5,
    operatingHours: 'स. ०८:०० ते सं. ०६:०० (Daily)',
    isOpenNow: true,
    isEmpanelled: true,
    isGovtOnly: true,
    hasHomeCollection: true,
    accreditation: 'Govt National Health Mission Frontline Kit',
    testsAvailableCount: 14,
    turnaroundTimeLabel: '१० ते १५ मिनिटे (Instant PoCT)',
    phone: '+91 2138 289011',
    address: 'ग्रामपंचायत शेजारी, वडगाव, शिरूर',
  },
  {
    id: 'LAB-04',
    nameMr: 'शिरूर तालुका सार्वजनिक आरोग्य लॅब (Public Health Lab)',
    nameEn: 'Shirur Taluka Public Health Laboratory',
    typeMr: 'तालुका संदर्भ प्रयोगशाळा',
    typeEn: 'Sub-District Public Health Reference Lab',
    distanceKm: 4.1,
    operatingHours: 'स. ०९:०० ते सं. ०५:०० (Mon-Sat)',
    isOpenNow: true,
    isEmpanelled: true,
    isGovtOnly: true,
    hasHomeCollection: true,
    accreditation: 'IDSP & NVBDCP Surveillance Accredited',
    testsAvailableCount: 28,
    turnaroundTimeLabel: '४ ते ८ तास',
    phone: '+91 2138 222108',
    address: 'उपजिल्हा रुग्णालय परिसर, शिरूर',
  },
  {
    id: 'LAB-05',
    nameMr: 'सह्याद्री शासकीय संलग्न डायग्नोस्टिक नेटवर्क, चाकण',
    nameEn: 'Sahyadri Empanelled Rural Diagnostic Center, Chakan',
    typeMr: 'शासकीय पॅनल खाजगी एनएबीएल लॅब (PPP Model)',
    typeEn: 'Govt Empanelled NABL Private Lab (PPP Initiative)',
    distanceKm: 18.5,
    operatingHours: 'स. ०७:०० ते रा. ०९:०० (All 7 Days)',
    isOpenNow: true,
    isEmpanelled: true,
    isGovtOnly: false,
    hasHomeCollection: true,
    accreditation: 'NABL ISO 15189:2022 Empanelled',
    testsAvailableCount: 46,
    turnaroundTimeLabel: '२ ते ६ तास',
    phone: '+91 2135 278900',
    address: 'चाकण-तळेगाव रस्ता, चाकण, पुणे - ४१०५०१',
  },
  {
    id: 'LAB-06',
    nameMr: 'मेट्रोपोलिस पॅथॉलॉजी संकलन केंद्र, शिरूर',
    nameEn: 'Metropolis Rural Sample Collection Center, Shirur',
    typeMr: 'खाजगी लॅब संकलन केंद्र (Private NABL)',
    typeEn: 'Private NABL Diagnostic Collection Desk',
    distanceKm: 3.8,
    operatingHours: 'स. ०७:३० ते दु. ०२:०० (Mon-Sat)',
    isOpenNow: false,
    isEmpanelled: false,
    isGovtOnly: false,
    hasHomeCollection: true,
    accreditation: 'CAP & NABL Accredited Private',
    testsAvailableCount: 42,
    turnaroundTimeLabel: '१२ ते २४ तास',
    phone: '+91 2138 224500',
    address: 'बाजार पेठ, शिरूर, पुणे',
  },
];

const STORAGE_ORDERS_KEY = 'hw_diagnostic_orders_v1';

const INITIAL_ORDERS: TestOrderItem[] = [
  {
    id: 'ORD-20240616-8812',
    patientId: 'PT-001',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    patientNameEn: 'Sunita Ramchandra Jadhav',
    patientPhone: '9822304912',
    patientAge: 28,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000001',

    prescribedByDoctorMr: 'डॉ. मीरा देशमुख (MO, PHC शिरूर)',
    prescribedByDoctorEn: 'Dr. Meera Deshmukh (MO, PHC Shirur)',
    facilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    facilityEn: 'PHC Shirur',

    targetLabId: 'LAB-01',
    targetLabNameMr: 'PHC शिरूर क्लिनिकल पॅथॉलॉजी लॅब',
    targetLabNameEn: 'PHC Shirur Clinical Pathology Laboratory',

    tests: [
      CATALOG_TESTS.find(t => t.code === 'CBC')!,
      CATALOG_TESTS.find(t => t.code === 'URINE-RM')!,
    ],
    priority: 'ROUTINE',
    collectionMethod: 'AT_FACILITY',
    clinicalNotes: 'ANC 3rd trimester routine workup. Checking Hb response to iron tablets.',

    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    barcode: 'MH-LAB-849201',

    sampleCollectedAt: '१६ जून, स. ०९:३०',
    inTransitAt: '१६ जून, स. ०९:४०',
    processingAt: '१६ जून, स. १०:१५',
    completedAt: '१६ जून, दु. १२:३०',

    hasCriticalValue: false,
    results: [
      {
        parameterId: 'p1',
        name: 'Hemoglobin (Hb)',
        nameMr: 'हिमोग्लोबिन',
        value: '10.2',
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5',
        flag: 'BORDERLINE',
        criticalReasonMr: 'सौम्य ॲनिमिया (सुधारणेची गरज)',
        criticalReasonEn: 'Mild anemia, continuation of IFA recommended',
      },
      {
        parameterId: 'p2',
        name: 'Total Leucocyte Count (WBC)',
        nameMr: 'पांढऱ्या पेशींची संख्या',
        value: '8,200',
        unit: '/cu.mm',
        referenceRange: '4,000 - 11,000',
        flag: 'NORMAL',
      },
      {
        parameterId: 'p3',
        name: 'Platelet Count',
        nameMr: 'प्लेटलेट्स संख्या',
        value: '2.4',
        unit: 'Lakh/cu.mm',
        referenceRange: '1.5 - 4.5',
        flag: 'NORMAL',
      },
      {
        parameterId: 'p4',
        name: 'Urine Albumin (Protein)',
        nameMr: 'लघवीतील अल्ब्युमिन',
        value: 'Nil',
        unit: 'Dipstick',
        referenceRange: 'Nil / Negative',
        flag: 'NORMAL',
      },
      {
        parameterId: 'p5',
        name: 'Urine Pus Cells',
        nameMr: 'लघवीतील पू पेशी',
        value: '1 - 2',
        unit: '/HPF',
        referenceRange: '0 - 5',
        flag: 'NORMAL',
      },
    ],
    overallImpressionMr: 'सौम्य अशक्तपणा (Hb 10.2). लघवीमध्ये अल्ब्युमिन नाही, प्रसूतीपूर्व तपासणी समाधानकारक.',
    overallImpressionEn: 'Mild nutritional anemia (Hb 10.2 g/dL). No proteinuria or infection detected.',
    verifiedByPathologistMr: 'डॉ. संजय काळे (MD Pathology)',
    verifiedByPathologistEn: 'Dr. Sanjay Kale (MD Pathology, MMC: 48921)',
    nablCertNumber: 'NABL-MC-28491-PUNE',
    abhaRecordSyncId: 'ABHA-FHIR-DIAG-2024-884920',
    pdfDownloadUrl: '/reports/DIAG-2024-8812.pdf',
  },
  {
    id: 'ORD-20240616-9934',
    patientId: 'PT-002',
    patientNameMr: 'महादेव विठ्ठल पाटील',
    patientNameEn: 'Mahadev Vitthal Patil',
    patientPhone: '9822451001',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: 'MH-PN-24-00000002',

    prescribedByDoctorMr: 'डॉ. मीरा देशमुख',
    prescribedByDoctorEn: 'Dr. Meera Deshmukh',
    facilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    facilityEn: 'PHC Shirur',

    targetLabId: 'LAB-02',
    targetLabNameMr: 'जिल्हा रुग्णालय पुणे मध्यवर्ती निदान केंद्र',
    targetLabNameEn: 'District Hospital Pune Central Diagnostics & Imaging Hub',

    tests: [
      CATALOG_TESTS.find(t => t.code === 'TROP-I-STAT')!,
      CATALOG_TESTS.find(t => t.code === 'RBS-STAT')!,
      CATALOG_TESTS.find(t => t.code === 'KFT-RFT')!,
    ],
    priority: 'STAT',
    collectionMethod: 'AT_FACILITY',
    clinicalNotes: 'Severe chest pain with diabetes. Emergency rule out myocardial infarction.',

    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    barcode: 'MH-LAB-992014',

    sampleCollectedAt: '१६ जून, स. ०८:४५',
    inTransitAt: '१६ जून, स. ०८:५०',
    processingAt: '१६ जून, स. ०९:००',
    completedAt: '१६ जून, स. ०९:४०',

    hasCriticalValue: true,
    results: [
      {
        parameterId: 'cp1',
        name: 'Cardiac Troponin I (hs-cTnI)',
        nameMr: 'कार्डियाक ट्रॉपोनिन I (तातडीचे)',
        value: '148.5',
        unit: 'pg/mL',
        referenceRange: '< 19.8 (99th percentile)',
        flag: 'CRITICAL',
        criticalReasonMr: 'अत्यंत गंभीर: मायोकार्डियल इन्फेक्शन (हार्ट अटॅक) दर्शक',
        criticalReasonEn: 'CRITICAL ALERT: Strongly indicates acute myocardial necrosis',
      },
      {
        parameterId: 'cp2',
        name: 'Random Blood Glucose',
        nameMr: 'रक्तातील साखर (Emergency)',
        value: '382',
        unit: 'mg/dL',
        referenceRange: '70 - 140',
        flag: 'CRITICAL',
        criticalReasonMr: 'अत्यंत गंभीर: अनियंत्रित उच्च रक्तशर्करा',
        criticalReasonEn: 'CRITICAL ALERT: Severe Hyperglycemia (Risk of DKA)',
      },
      {
        parameterId: 'cp3',
        name: 'Serum Creatinine',
        nameMr: 'सिरम क्रिएटिनिन',
        value: '1.4',
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.2',
        flag: 'BORDERLINE',
        criticalReasonMr: 'किंचित वाढलेले (सौम्य मूत्रपिंड ताण)',
        criticalReasonEn: 'Mild renal elevation',
      },
    ],
    overallImpressionMr: 'धोकादायक स्तर: ट्रॉपोनिन I (148.5 pg/mL) आणि साखर (382 mg/dL) अत्यंत उच्च. तात्काळ ICCU दाखल आवश्यक!',
    overallImpressionEn: 'CRITICAL FINDINGS: Elevated Troponin I (148.5 pg/mL) confirming Acute Coronary Syndrome. Severe hyperglycaemia. Immediate tertiary ICCU transfer required.',
    verifiedByPathologistMr: 'डॉ. अनिरुद्ध कुलकर्णी (Chief Pathologist, DH Pune)',
    verifiedByPathologistEn: 'Dr. Aniruddha Kulkarni (Chief Pathologist, DH Pune)',
    nablCertNumber: 'NABL-MC-99410-PUNE',
    abhaRecordSyncId: 'ABHA-FHIR-DIAG-2024-992014',
    pdfDownloadUrl: '/reports/DIAG-2024-9934.pdf',
  },
  {
    id: 'ORD-20240616-5521',
    patientId: 'PT-003',
    patientNameMr: 'रुक्मिणी बबन शिंदे',
    patientNameEn: 'Rukmini Baban Shinde',
    patientPhone: '9822890043',
    patientAge: 42,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000003',

    prescribedByDoctorMr: 'डॉ. मीरा देशमुख',
    prescribedByDoctorEn: 'Dr. Meera Deshmukh',
    facilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    facilityEn: 'PHC Shirur',

    targetLabId: 'LAB-02',
    targetLabNameMr: 'जिल्हा रुग्णालय पुणे मध्यवर्ती निदान केंद्र',
    targetLabNameEn: 'District Hospital Pune Central Diagnostics & Imaging Hub',

    tests: [
      CATALOG_TESTS.find(t => t.code === 'CBNAAT-TB')!,
      CATALOG_TESTS.find(t => t.code === 'LFT')!,
    ],
    priority: 'URGENT',
    collectionMethod: 'HOME_COLLECTION',
    clinicalNotes: 'TB DOTS follow-up. Sputum CBNAAT GeneXpert and monitoring anti-TB drug hepatotoxicity.',

    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    barcode: 'MH-LAB-110293',

    sampleCollectedAt: '१६ जून, स. ०७:३० (आशा कार्यकर्ती छाया शिंदे)',
    inTransitAt: '१६ जून, स. ०९:०० (Cold Chain Van)',
    processingAt: '१६ जून, दु. १२:०० (GeneXpert Run)',
    hasCriticalValue: false,
  },
  {
    id: 'ORD-20240616-2241',
    patientId: 'PT-001',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    patientNameEn: 'Sunita Ramchandra Jadhav',
    patientPhone: '9822304912',
    patientAge: 28,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000001',

    prescribedByDoctorMr: 'डॉ. मीरा देशमुख',
    prescribedByDoctorEn: 'Dr. Meera Deshmukh',
    facilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    facilityEn: 'PHC Shirur',

    targetLabId: 'LAB-02',
    targetLabNameMr: 'जिल्हा रुग्णालय पुणे मध्यवर्ती निदान केंद्र',
    targetLabNameEn: 'District Hospital Pune Central Diagnostics & Imaging Hub',

    tests: [
      CATALOG_TESTS.find(t => t.code === 'USG-DOPPLER')!,
    ],
    priority: 'URGENT',
    collectionMethod: 'VISIT_LAB',
    clinicalNotes: 'Obstetric Color Doppler for fetal growth restriction (FGR) and umbilical artery velocity waveform.',

    status: 'SAMPLE_COLLECTED',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    barcode: 'MH-RAD-394012',

    sampleCollectedAt: '१६ जून, स. ११:०० (नोंदणी पूर्ण)',
    hasCriticalValue: false,
  },
];

class DiagnosticService {
  private orders: TestOrderItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        this.orders = JSON.parse(stored);
      } else {
        this.orders = INITIAL_ORDERS;
        this.saveToStorage();
      }
    } catch {
      this.orders = INITIAL_ORDERS;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
    } catch {
      // storage fallback
    }
  }

  public getAllOrders(): TestOrderItem[] {
    return [...this.orders];
  }

  public getOrderById(id: string): TestOrderItem | undefined {
    return this.orders.find(o => o.id === id);
  }

  public getOrdersByPatientId(patientId: string): TestOrderItem[] {
    return this.orders.filter(o => o.patientId === patientId);
  }

  public getAvailableTests(): CatalogTestItem[] {
    return CATALOG_TESTS;
  }

  public getNearbyLabs(): DiagnosticLabFacility[] {
    return NEARBY_LABS;
  }

  public createTestOrder(
    data: Omit<TestOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'barcode' | 'status' | 'hasCriticalValue'>
  ): TestOrderItem {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${dateStr}-${rand}`;
    const barcode = `MH-LAB-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const newOrder: TestOrderItem = {
      ...data,
      id: orderId,
      barcode,
      status: 'ORDERED',
      createdAt: nowIso,
      updatedAt: nowIso,
      hasCriticalValue: false,
    };

    this.orders = [newOrder, ...this.orders];
    this.saveToStorage();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: TestOrderStatus): TestOrderItem | null {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'SAMPLE_COLLECTED' && !order.sampleCollectedAt) {
      order.sampleCollectedAt = 'आत्ता (Just now)';
    } else if (newStatus === 'IN_TRANSIT' && !order.inTransitAt) {
      order.inTransitAt = 'आत्ता (Just now)';
    } else if (newStatus === 'PROCESSING' && !order.processingAt) {
      order.processingAt = 'आत्ता (Just now)';
    } else if (newStatus === 'COMPLETED') {
      order.completedAt = 'आत्ता (Just now)';
      if (!order.results || order.results.length === 0) {
        // Generate default mock parameters if none exist
        order.results = [
          {
            parameterId: 'p-gen-1',
            name: `${order.tests[0]?.nameEn || 'Diagnostic Parameter'}`,
            nameMr: `${order.tests[0]?.nameMr || 'तपासणी निष्कर्ष'}`,
            value: 'Normal / Non-Reactive',
            unit: 'Index',
            referenceRange: 'Standard Normal Reference',
            flag: 'NORMAL',
          },
        ];
        order.overallImpressionMr = 'तपासणी अहवाल सामान्य व प्रमाणित आहे.';
        order.overallImpressionEn = 'Verified results within biological reference intervals.';
        order.verifiedByPathologistMr = 'डॉ. संजय काळे (MD Pathology)';
        order.verifiedByPathologistEn = 'Dr. Sanjay Kale (MD Pathology)';
        order.nablCertNumber = 'NABL-MC-28491-PUNE';
        order.abhaRecordSyncId = `ABHA-FHIR-DIAG-${Date.now()}`;
      }
    }

    this.saveToStorage();
    return order;
  }

  public uploadLabResult(
    orderId: string,
    results: ParameterResult[],
    impressionMr: string,
    impressionEn: string,
    verifiedByMr: string,
    verifiedByEn: string
  ): TestOrderItem | null {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;

    const hasCritical = results.some(r => r.flag === 'CRITICAL');

    order.status = 'COMPLETED';
    order.updatedAt = new Date().toISOString();
    order.completedAt = 'आज (Today)';
    order.results = results;
    order.hasCriticalValue = hasCritical;
    order.overallImpressionMr = impressionMr;
    order.overallImpressionEn = impressionEn;
    order.verifiedByPathologistMr = verifiedByMr;
    order.verifiedByPathologistEn = verifiedByEn;
    order.nablCertNumber = 'NABL-MC-28491-PUNE';
    order.abhaRecordSyncId = `ABHA-FHIR-DIAG-${Date.now()}`;
    order.pdfDownloadUrl = `/reports/${order.id}.pdf`;

    this.saveToStorage();
    return order;
  }

  public resetToDefaults(): void {
    this.orders = INITIAL_ORDERS;
    this.saveToStorage();
  }
}

export const diagnosticService = new DiagnosticService();
