export interface PatientProfile {
  id: string;
  nameMr: string;
  nameEn: string;
  abhaId: string;
  aadhaarLast4: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  village: string;
  block: string;
  district: string;
  bloodGroup: string;
  phone: string;
  conditions: string[];
  riskLevel: 'normal' | 'moderate' | 'high';
  lastVisit: string;
  nextFollowUp: string;
}

export interface VisitRecord {
  id: string;
  date: string;
  facility: string;
  facilityType: 'PHC' | 'Sub-Centre' | 'District Hospital' | 'Rural Hospital';
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  vitals: {
    bp: string;
    pulse: string;
    sugar: string;
    weight: string;
  };
}

export interface MedicineItem {
  id: string;
  name: string;
  generic: string;
  category: string;
  status: 'available' | 'low' | 'out';
  qty: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
}

export interface Facility {
  id: string;
  name: string;
  nameMr: string;
  type: 'PHC' | 'Sub-Centre' | 'Rural Hospital' | 'District Hospital';
  distance: string;
  updatedAt: string;
  beds: number;
  doctorInCharge: string;
  phone: string;
  medicines: MedicineItem[];
}

export interface AshaTask {
  id: string;
  patientName: string;
  patientId: string;
  taskMr: string;
  taskEn: string;
  priority: 'high' | 'medium' | 'normal';
  time: string;
  condition: 'pregnant' | 'diabetic' | 'tb' | 'hypertensive' | 'newborn';
  done: boolean;
}

export interface ConsultRequest {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;
  ashaName: string;
  village: string;
  requestTime: string;
  condition: 'pregnant' | 'diabetic' | 'hypertension' | 'fever' | 'pediatric';
  urgency: 'urgent' | 'normal';
  reason: string;
  vitals: {
    bp: string;
    sugar: string;
    pulse: string;
    temp: string;
    spO2: string;
  };
}

export const CURRENT_PATIENT: PatientProfile = {
  id: 'PT-001',
  nameMr: 'सुनीता रामचंद्र जाधव',
  nameEn: 'Sunita Ramchandra Jadhav',
  abhaId: 'MH-PN-24-00000001',
  aadhaarLast4: '4821',
  age: 28,
  gender: 'Female',
  village: 'वडगाव',
  block: 'शिरूर',
  district: 'पुणे',
  bloodGroup: 'B+',
  phone: '9822304912',
  conditions: ['गर्भवती - ७वा महिना (Antenatal 7th Month)', 'किंचित अशक्तपणा (Mild Anemia Hb 10.2)'],
  riskLevel: 'moderate',
  lastVisit: '१५ जून २०२४',
  nextFollowUp: 'उद्या, १०:३० सकाळी (PHC शिरूर)',
};

export const PAST_VISITS: VisitRecord[] = [
  {
    id: 'VISIT-101',
    date: '१५ जून २०२४',
    facility: 'PHC शिरूर',
    facilityType: 'PHC',
    doctor: 'डॉ. मीरा देशमुख (Medical Officer)',
    diagnosis: 'प्रसूतीपूर्व तपासणी (ANC 3) — गर्भाची वाढ समाधानकारक',
    prescription: 'Iron Folic Acid (100mg) OD, Calcium Carbonate (500mg) BD',
    notes: 'रक्तदाब स्थिर आहे. आहारात हिरव्या पालेभाज्या आणि फळे वाढवण्याचा सल्ला दिला.',
    vitals: {
      bp: '११८/७६ mmHg',
      pulse: '७६ bpm',
      sugar: '९४ mg/dL (Random)',
      weight: '५८ किलो'
    }
  },
  {
    id: 'VISIT-102',
    date: '२ जून २०२४',
    facility: 'उपकेंद्र वडगाव',
    facilityType: 'Sub-Centre',
    doctor: 'सुनंदा पाटील (ANM)',
    diagnosis: 'नियमित बीपी आणि वजन तपासणी',
    prescription: 'नियमित लोह गोळ्या सुरू ठेवा',
    notes: 'कॅल्शियम गोळ्यांचा पुढील आठवड्यात साठा उपलब्ध झाल्यावर देण्याचे सांगितले.',
    vitals: {
      bp: '१२०/८० mmHg',
      pulse: '७४ bpm',
      sugar: '—',
      weight: '५७ किलो'
    }
  },
  {
    id: 'VISIT-103',
    date: '१० मे २०२४',
    facility: 'जिल्हा रुग्णालय पुणे',
    facilityType: 'District Hospital',
    doctor: 'डॉ. संजय काळे (सोनोलॉजिस्ट)',
    diagnosis: 'अल्ट्रासाऊंड स्कॅन — सामान्य एकल गर्भ',
    prescription: 'अल्ट्रासाऊंड अहवाल सामान्य — PHC मध्ये नियमित तपासणी सुरू ठेवा',
    notes: 'नाळ आणि गर्भाशयाची स्थिती सामान्य.',
    vitals: {
      bp: '११६/७४ mmHg',
      pulse: '७२ bpm',
      sugar: '९० mg/dL',
      weight: '५६ किलो'
    }
  }
];

export const FACILITIES_DATA: Facility[] = [
  {
    id: 'FAC-01',
    name: 'PHC Shirur',
    nameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    type: 'PHC',
    distance: '२.३ किमी',
    updatedAt: '३० मिनिटांपूर्वी',
    beds: 6,
    doctorInCharge: 'डॉ. मीरा देशमुख',
    phone: '02138-222340',
    medicines: [
      { id: 'M-01', name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Antipyretic', status: 'available', qty: 450, unit: 'गोळ्या', batchNo: 'PCM-2024-91', expiryDate: '12/2026' },
      { id: 'M-02', name: 'Iron Folic Acid', generic: 'Ferrous Salt + Folate', category: 'Maternal Nutrition', status: 'available', qty: 120, unit: 'गोळ्या', batchNo: 'IFA-9842', expiryDate: '08/2026' },
      { id: 'M-03', name: 'ORS Sachet', generic: 'Oral Rehydration Salts', category: 'Hydration', status: 'low', qty: 18, unit: 'पाकिटे', batchNo: 'ORS-5412', expiryDate: '05/2027' },
      { id: 'M-04', name: 'Amoxicillin 250mg', generic: 'Amoxicillin Trihydrate', category: 'Antibiotic', status: 'out', qty: 0, unit: 'कॅप्सूल', batchNo: 'AMX-001', expiryDate: 'Expired' },
      { id: 'M-05', name: 'Metformin 500mg', generic: 'Metformin Hydrochloride', category: 'Antidiabetic', status: 'available', qty: 260, unit: 'गोळ्या', batchNo: 'MET-8840', expiryDate: '11/2026' },
      { id: 'M-06', name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', category: 'Antihypertensive', status: 'available', qty: 310, unit: 'गोळ्या', batchNo: 'AML-3321', expiryDate: '04/2027' },
      { id: 'M-07', name: 'Tetanus Toxoid (TT)', generic: 'Tetanus Vaccine', category: 'Immunization', status: 'available', qty: 45, unit: 'व्हाईल', batchNo: 'TT-7711', expiryDate: '09/2025' },
    ]
  },
  {
    id: 'FAC-02',
    name: 'Sub-Centre Vadgaon',
    nameMr: 'उपकेंद्र वडगाव',
    type: 'Sub-Centre',
    distance: '०.५ किमी',
    updatedAt: '२ तासांपूर्वी',
    beds: 2,
    doctorInCharge: 'सुनंदा पाटील (ANM)',
    phone: '02138-289011',
    medicines: [
      { id: 'M-11', name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Antipyretic', status: 'available', qty: 85, unit: 'गोळ्या', batchNo: 'PCM-1102', expiryDate: '12/2026' },
      { id: 'M-12', name: 'Iron Folic Acid', generic: 'Ferrous Salt + Folate', category: 'Maternal Nutrition', status: 'low', qty: 22, unit: 'गोळ्या', batchNo: 'IFA-9911', expiryDate: '08/2026' },
      { id: 'M-13', name: 'ORS Sachet', generic: 'Oral Rehydration Salts', category: 'Hydration', status: 'available', qty: 65, unit: 'पाकिटे', batchNo: 'ORS-9002', expiryDate: '05/2027' },
      { id: 'M-14', name: 'Albendazole 400mg', generic: 'Albendazole', category: 'Deworming', status: 'available', qty: 40, unit: 'गोळ्या', batchNo: 'ALB-3100', expiryDate: '02/2027' }
    ]
  },
  {
    id: 'FAC-03',
    name: 'Rural Hospital Khed',
    nameMr: 'ग्रामीण रुग्णालय खेड',
    type: 'Rural Hospital',
    distance: '१४ किमी',
    updatedAt: '१ तासापूर्वी',
    beds: 30,
    doctorInCharge: 'डॉ. विकास थोरात (Chief Medical Officer)',
    phone: '02135-244100',
    medicines: [
      { id: 'M-21', name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Antipyretic', status: 'available', qty: 1200, unit: 'गोळ्या', batchNo: 'PCM-9912', expiryDate: '01/2027' },
      { id: 'M-22', name: 'Amoxicillin 250mg', generic: 'Amoxicillin', category: 'Antibiotic', status: 'available', qty: 420, unit: 'कॅप्सूल', batchNo: 'AMX-4420', expiryDate: '09/2026' },
      { id: 'M-23', name: 'Metformin 500mg', generic: 'Metformin', category: 'Antidiabetic', status: 'available', qty: 650, unit: 'गोळ्या', batchNo: 'MET-7721', expiryDate: '03/2027' },
      { id: 'M-24', name: 'Insulin Regular 40IU', generic: 'Human Insulin', category: 'Antidiabetic', status: 'available', qty: 35, unit: 'व्हाईल', batchNo: 'INS-1090', expiryDate: '11/2025' }
    ]
  },
  {
    id: 'FAC-04',
    name: 'Sub-Centre Takli',
    nameMr: 'उपकेंद्र टाकळी',
    type: 'Sub-Centre',
    distance: '५.१ किमी',
    updatedAt: '४ तासांपूर्वी',
    beds: 2,
    doctorInCharge: 'छाया शिंदे (ANM)',
    phone: '02138-290401',
    medicines: [
      { id: 'M-31', name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Antipyretic', status: 'low', qty: 12, unit: 'गोळ्या', batchNo: 'PCM-8812', expiryDate: '10/2026' },
      { id: 'M-32', name: 'Iron Folic Acid', generic: 'Ferrous Salt + Folate', category: 'Maternal Nutrition', status: 'out', qty: 0, unit: 'गोळ्या', batchNo: '—', expiryDate: '—' },
      { id: 'M-33', name: 'ORS Sachet', generic: 'Oral Rehydration Salts', category: 'Hydration', status: 'available', qty: 25, unit: 'पाकिटे', batchNo: 'ORS-3319', expiryDate: '06/2027' }
    ]
  }
];

export const ASHA_USER = {
  name: 'सुमन ताई पाटील',
  nameEn: 'Suman Tai Patil',
  village: 'वडगाव',
  block: 'शिरूर',
  district: 'पुणे',
  ashaId: 'ASHA-PN-2024-0847',
  patientsCount: 127,
  highRiskCount: 14,
  phone: '9423180912',
  joinedYear: '२०१८'
};

export const INITIAL_ASHA_TASKS: AshaTask[] = [
  {
    id: 'TASK-1',
    patientName: 'सुनीता जाधव',
    patientId: 'PT-001',
    taskMr: 'प्रसूतीपूर्व तपासणी — ७वा महिना (ANC 3) वजन आणि बीपी नोंद',
    taskEn: 'Antenatal check — 7th month (ANC 3) weight and BP log',
    priority: 'high',
    time: 'सकाळी १०:००',
    condition: 'pregnant',
    done: false
  },
  {
    id: 'TASK-2',
    patientName: 'महादेव पाटील',
    patientId: 'PT-002',
    taskMr: 'मधुमेह फॉलो-अप · रक्तातील साखर तपासणी आणि HbA1c थकीत',
    taskEn: 'Diabetes follow-up · Blood glucose test and HbA1c pending',
    priority: 'medium',
    time: 'दुपारी ०२:००',
    condition: 'diabetic',
    done: false
  },
  {
    id: 'TASK-3',
    patientName: 'रुक्मिणी शिंदे',
    patientId: 'PT-003',
    taskMr: 'DOTS — क्षयरोग (TB) औषध डोस प्रत्यक्ष देणे आणि लक्षणे नोंदवणे',
    taskEn: 'DOTS — TB direct observation dose and symptom logging',
    priority: 'high',
    time: 'सकाळी ०८:००',
    condition: 'tb',
    done: true
  },
  {
    id: 'TASK-4',
    patientName: 'राधाबाई कदम',
    patientId: 'PT-004',
    taskMr: 'उच्च रक्तदाब तपासणी आणि औषध गोळ्यांचा साठा शिल्लक तपासणे',
    taskEn: 'Hypertension check and pill count verification',
    priority: 'medium',
    time: 'संध्याकाळी ०४:००',
    condition: 'hypertensive',
    done: false
  },
  {
    id: 'TASK-5',
    patientName: 'अनिकेत भोसले (बाळ)',
    patientId: 'PT-005',
    taskMr: 'बाल लसीकरण — पेंटाव्हॅलेंट ३ आणि रोटाव्हायरस डोस',
    taskEn: 'Child Immunization — Pentavalent 3 and Rotavirus dose',
    priority: 'high',
    time: 'सकाळी ११:३०',
    condition: 'newborn',
    done: false
  }
];

export const VILLAGE_PATIENTS_REGISTRY: PatientProfile[] = [
  CURRENT_PATIENT,
  {
    id: 'PT-002',
    nameMr: 'महादेव विठ्ठल पाटील',
    nameEn: 'Mahadev Vitthal Patil',
    abhaId: 'MH-PN-24-00000002',
    aadhaarLast4: '3310',
    age: 58,
    gender: 'Male',
    village: 'वडगाव',
    block: 'शिरूर',
    district: 'पुणे',
    bloodGroup: 'O+',
    phone: '9822451001',
    conditions: ['मधुमेह प्रकार २ (Type 2 Diabetes)', 'उच्च रक्तदाब (Hypertension)'],
    riskLevel: 'high',
    lastVisit: '५ जून २०२४',
    nextFollowUp: 'आज दुपारी ०२:००'
  },
  {
    id: 'PT-003',
    nameMr: 'रुक्मिणी बबन शिंदे',
    nameEn: 'Rukmini Baban Shinde',
    abhaId: 'MH-PN-24-00000003',
    aadhaarLast4: '9012',
    age: 42,
    gender: 'Female',
    village: 'वडगाव',
    block: 'शिरूर',
    district: 'पुणे',
    bloodGroup: 'A+',
    phone: '9822890043',
    conditions: ['क्षयरोग (Pulmonary TB - DOTS Category 1)'],
    riskLevel: 'high',
    lastVisit: '१ जून २०२४',
    nextFollowUp: 'दररोज DOTS डोस'
  },
  {
    id: 'PT-004',
    nameMr: 'राधाबाई नामदेव कदम',
    nameEn: 'Radhabai Namdev Kadam',
    abhaId: 'MH-PN-24-00000004',
    aadhaarLast4: '1109',
    age: 64,
    gender: 'Female',
    village: 'वडगाव',
    block: 'शिरूर',
    district: 'पुणे',
    bloodGroup: 'B+',
    phone: '9420112890',
    conditions: ['उच्च रक्तदाब (Hypertension Stage 2)'],
    riskLevel: 'moderate',
    lastVisit: '२८ मे २०२४',
    nextFollowUp: 'आज संध्याकाळी ०४:००'
  },
  {
    id: 'PT-005',
    nameMr: 'अनिकेत राहुल भोसले',
    nameEn: 'Aniket Rahul Bhosale',
    abhaId: 'MH-PN-24-00000005',
    aadhaarLast4: '8820',
    age: 1,
    gender: 'Male',
    village: 'वडगाव',
    block: 'शिरूर',
    district: 'पुणे',
    bloodGroup: 'O+',
    phone: '9850123901',
    conditions: ['शिशू लसीकरण (Immunization Tracking)'],
    riskLevel: 'normal',
    lastVisit: '१२ मे २०२४',
    nextFollowUp: 'आज सकाळी ११:३०'
  }
];

export const INITIAL_CONSULT_REQUESTS: ConsultRequest[] = [
  {
    id: 'RC-001',
    patientName: 'सुनीता जाधव',
    patientAge: 28,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000001',
    ashaName: 'सुमन ताई पाटील',
    village: 'वडगाव',
    requestTime: '२ मिनिटांपूर्वी',
    condition: 'pregnant',
    urgency: 'normal',
    reason: 'पोटात हलके दुखत आहे आणि थकवा वाटतो — ७वा महिना प्रसूतीपूर्व सल्ला',
    vitals: {
      bp: '११८/७६',
      sugar: '९४',
      pulse: '७६',
      temp: '९८.४°F',
      spO2: '९९%'
    }
  },
  {
    id: 'RC-002',
    patientName: 'महादेव पाटील',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: 'MH-PN-24-00000002',
    ashaName: 'सुमन ताई पाटील',
    village: 'वडगाव',
    requestTime: '८ मिनिटांपूर्वी',
    condition: 'diabetic',
    urgency: 'urgent',
    reason: 'रक्तातील साखर खूप जास्त (फास्टिंग ३८० mg/dL) आणि तीव्र डोकेदुखी',
    vitals: {
      bp: '१५०/९८',
      sugar: '३८०',
      pulse: '९२',
      temp: '९८.६°F',
      spO2: '९७%'
    }
  },
  {
    id: 'RC-003',
    patientName: 'मारुती शिंदे',
    patientAge: 62,
    patientGender: 'Male',
    abhaId: 'MH-PN-24-00000019',
    ashaName: 'छाया शिंदे',
    village: 'टाकळी',
    requestTime: '१५ मिनिटांपूर्वी',
    condition: 'fever',
    urgency: 'normal',
    reason: '३ दिवसांपासून अंगदुखी आणि १०२°F ताप, मलेरिया संशय',
    vitals: {
      bp: '१२४/८२',
      sugar: '११०',
      pulse: '८८',
      temp: '१०२.१°F',
      spO2: '९६%'
    }
  }
];

export const ADMIN_TREND_DATA = [
  { day: 'सोम (Mon)', consultations: 145, teleconsult: 32 },
  { day: 'मंगळ (Tue)', consultations: 162, teleconsult: 45 },
  { day: 'बुध (Wed)', consultations: 158, teleconsult: 41 },
  { day: 'गुरु (Thu)', consultations: 191, teleconsult: 58 },
  { day: 'शुक्र (Fri)', consultations: 184, teleconsult: 62 },
  { day: 'शनि (Sat)', consultations: 203, teleconsult: 71 },
  { day: 'रवि (Sun)', consultations: 147, teleconsult: 38 },
];

export const ADMIN_FACILITIES_METRICS = [
  {
    name: 'PHC शिरूर',
    type: 'PHC',
    patients: 284,
    consults: 47,
    referrals: 8,
    pendingReferrals: 3,
    medicineStatus: 'adequate',
    staffPresent: '४/५',
  },
  {
    name: 'PHC वडगाव',
    type: 'PHC',
    patients: 196,
    consults: 31,
    referrals: 5,
    pendingReferrals: 5,
    medicineStatus: 'low',
    staffPresent: '३/५',
  },
  {
    name: 'ग्रामीण रुग्णालय खेड',
    type: 'Rural Hospital',
    patients: 412,
    consults: 89,
    referrals: 21,
    pendingReferrals: 7,
    medicineStatus: 'adequate',
    staffPresent: '८/१०',
  },
  {
    name: 'उपकेंद्र टाकळी',
    type: 'Sub-Centre',
    patients: 84,
    consults: 12,
    referrals: 2,
    pendingReferrals: 2,
    medicineStatus: 'critical',
    staffPresent: '१/२',
  },
  {
    name: 'PHC मांडवगण',
    type: 'PHC',
    patients: 172,
    consults: 28,
    referrals: 4,
    pendingReferrals: 1,
    medicineStatus: 'adequate',
    staffPresent: '४/४',
  }
];

export const MARQUEE_BIOMARKERS = [
  { name: 'Hemoglobin (Hb)', value: '11.2', unit: 'g/dL', status: 'optimal', labelMr: 'हिमोग्लोबिन', desc: 'Maternal anemia index across rural PHCs' },
  { name: 'Blood Glucose (Fasting)', value: '96', unit: 'mg/dL', status: 'optimal', labelMr: 'रक्तातील साखर', desc: 'Screened at NCD door-to-door visits' },
  { name: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'optimal', labelMr: 'रक्तदाब', desc: 'Standard adult screening profile' },
  { name: 'SpO2 Oxygen', value: '99', unit: '%', status: 'optimal', labelMr: 'ऑक्सिजन पातळी', desc: 'Pulse oximeter field reading' },
  { name: 'Fetal Heart Rate', value: '144', unit: 'bpm', status: 'optimal', labelMr: 'गर्भाचे ठोके', desc: 'Fetal Doppler monitor at Sub-Centre' },
  { name: 'Maternal Ferritin', value: '48', unit: 'ng/mL', status: 'optimal', labelMr: 'सीरम फेरिटिन', desc: 'Iron reserves supporting pregnancy' },
  { name: 'Vitamin D3', value: '34', unit: 'ng/mL', status: 'optimal', labelMr: 'व्हिटॅमिन डी३', desc: 'Bone density and pediatric health' },
  { name: 'Immunization Rate', value: '94.8', unit: '%', status: 'optimal', labelMr: 'लसीकरण प्रमाण', desc: 'District Mission Indradhanush goal' },
];
