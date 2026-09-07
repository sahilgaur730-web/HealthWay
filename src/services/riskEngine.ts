// Risk Engine & High-Risk Patient Tracking Service — Rural Health Surveillance
// Implements clinical protocols for Maternal ANC, Neonates, NCDs, TB DOTS, Malnutrition, and Mental Health

export type ClinicalRiskCategory = 
  | 'PREGNANT'
  | 'NEWBORN'
  | 'DIABETES'
  | 'HYPERTENSION'
  | 'TUBERCULOSIS'
  | 'MENTAL_HEALTH'
  | 'MALNUTRITION';

export type RiskUrgencyTier = 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'DUE_WEEK' | 'ON_TRACK';

export type EscalationLevel = 'NONE' | 'ASHA_ALERT' | 'MO_ALERT' | 'DHO_CRITICAL';

export interface HomeVisitLog {
  id: string;
  visitDate: string;
  visitedBy: string;
  role: 'ASHA' | 'ANM' | 'Medical Officer';
  vitals: {
    bp?: string;
    bloodGlucose?: string;
    weightKg?: number;
    hbGdl?: number;
    muacMm?: number;
    spo2?: number;
    tempF?: number;
  };
  medicineAdherence: 'FULL' | 'PARTIAL' | 'MISSED';
  dangerSignsObserved: string[];
  clinicalObservationsEn: string;
  clinicalObservationsMr: string;
  actionTakenEn: string;
  actionTakenMr: string;
  nextScheduledVisit: string;
}

export interface HighRiskPatient {
  id: string;
  abhaId: string;
  nameEn: string;
  nameMr: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  village: string;
  block: string;
  district: string;
  category: ClinicalRiskCategory;
  categoryLabelEn: string;
  categoryLabelMr: string;
  severity: 'MODERATE' | 'HIGH' | 'CRITICAL';
  clinicalRiskFactorsEn: string[];
  clinicalRiskFactorsMr: string[];
  dangerSignsEn: string[];
  dangerSignsMr: string[];
  assignedAshaName: string;
  assignedAshaPhone: string;
  assignedPhcName: string;
  assignedPhcNameMr: string;
  assignedDoctorName: string;
  registrationDate: string;
  lastVisitDate: string;
  nextFollowUpDate: string;
  daysOverdue: number;
  urgency: RiskUrgencyTier;
  escalationLevel: EscalationLevel;
  adherencePercentage: number;
  status: 'ACTIVE' | 'STABILIZED' | 'TRANSFERRED' | 'DELIVERED';
  vitalsSnapshot: {
    bp?: string;
    bloodSugar?: string;
    hb?: string;
    weight?: string;
    muacMm?: number;
    gestationalAgeWeeks?: number;
    eddDate?: string;
    spo2?: number;
  };
  visitsHistory: HomeVisitLog[];
  escalationNotes?: string;
}

// Calculate days difference and urgency tier
export function evaluateUrgencyTier(nextFollowUpDateStr: string): { urgency: RiskUrgencyTier; daysOverdue: number } {
  const [year, month, day] = nextFollowUpDateStr.split('-').map(Number);
  if (!year || !month) return { urgency: 'ON_TRACK', daysOverdue: 0 };
  
  const targetDate = new Date(year, month - 1, day || 1);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { urgency: 'OVERDUE', daysOverdue: Math.abs(diffDays) };
  } else if (diffDays === 0) {
    return { urgency: 'DUE_TODAY', daysOverdue: 0 };
  } else if (diffDays <= 3) {
    return { urgency: 'DUE_SOON', daysOverdue: 0 };
  } else if (diffDays <= 7) {
    return { urgency: 'DUE_WEEK', daysOverdue: 0 };
  } else {
    return { urgency: 'ON_TRACK', daysOverdue: 0 };
  }
}

// Evaluate automated escalation level based on overdue days
export function evaluateEscalationLevel(daysOverdue: number, severity: 'MODERATE' | 'HIGH' | 'CRITICAL'): EscalationLevel {
  if (daysOverdue <= 0) return 'NONE';
  if (severity === 'CRITICAL' || daysOverdue >= 7) return 'DHO_CRITICAL';
  if (daysOverdue >= 3) return 'MO_ALERT';
  return 'ASHA_ALERT';
}

export const INITIAL_HIGH_RISK_REGISTRY: HighRiskPatient[] = [
  {
    id: 'HRP-001',
    abhaId: 'MH-PN-24-00000001',
    nameEn: 'Sunita Ramchandra Jadhav',
    nameMr: 'सुनीता रामचंद्र जाधव',
    age: 28,
    gender: 'Female',
    phone: '9822304912',
    village: 'वडगाव रासाई (Vadgaon)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'PREGNANT',
    categoryLabelEn: 'High-Risk Pregnancy (ANC)',
    categoryLabelMr: 'उच्च जोखीम गरोदरपण (ANC)',
    severity: 'HIGH',
    clinicalRiskFactorsEn: [
      'Gestational Age: 29 Weeks (7th Month)',
      'Moderate Nutritional Anemia (Hb 10.2 g/dL)',
      'Previous Cesarean Delivery in 2021',
      'Borderline Blood Pressure 132/86 mmHg'
    ],
    clinicalRiskFactorsMr: [
      'गर्भधारणा २९ आठवडे (७वा महिना)',
      'मध्यम स्वरूपाचा ॲनिमिया (हिमोग्लोबिन १०.२ ग्रॅम)',
      '२०२१ मधील पूर्वीची सिझेरियन प्रसूती',
      'रक्तदाब वाढीचा कल १३२/८६ mmHg'
    ],
    dangerSignsEn: ['Headache or visual blurring', 'Decreased fetal movement', 'Pedal edema'],
    dangerSignsMr: ['डोकेदुखी किंवा अंधुक दिसणे', 'गर्भाची हालचाल मंदावणे', 'पायांवर सूज'],
    assignedAshaName: 'सुमन ताई पाटील (Suman Tai)',
    assignedAshaPhone: '9423180912',
    assignedPhcName: 'PHC Shirur',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    assignedDoctorName: 'डॉ. मीरा देशमुख (MO)',
    registrationDate: '2024-01-10',
    lastVisitDate: '2024-06-02',
    nextFollowUpDate: '2024-06-19', // Due tomorrow / today depending on mock
    daysOverdue: 0,
    urgency: 'DUE_SOON',
    escalationLevel: 'NONE',
    adherencePercentage: 88,
    status: 'ACTIVE',
    vitalsSnapshot: {
      bp: '130/84 mmHg',
      hb: '10.2 g/dL',
      weight: '58.5 kg',
      gestationalAgeWeeks: 29,
      eddDate: '2024-08-30'
    },
    visitsHistory: [
      {
        id: 'VST-101',
        visitDate: '2024-06-02',
        visitedBy: 'सुमन ताई पाटील',
        role: 'ASHA',
        vitals: { bp: '130/84', weightKg: 58.5, hbGdl: 10.2 },
        medicineAdherence: 'FULL',
        dangerSignsObserved: [],
        clinicalObservationsEn: 'Fetal heart sound regular (142 bpm). IFA tablets consumed daily with lemon water.',
        clinicalObservationsMr: 'गर्भाचे ठोके नियमित (१४२ ठोके/मिनिट). दररोज लिंबू सरबतासोबत लोह गोळ्या नियमित चालू.',
        actionTakenEn: 'Reinforced diet: green leafy vegetables, jaggery and groundnuts. Scheduled USG at RH Khed.',
        actionTakenMr: 'आहारात गूळ, शेंगदाणे व पालेभाज्या वाढवण्याचा सल्ला दिला. खेड येथे सोनोग्राफी निश्चित केली.',
        nextScheduledVisit: '2024-06-19'
      }
    ]
  },
  {
    id: 'HRP-002',
    abhaId: 'MH-PN-24-00000002',
    nameEn: 'Mahadev Vitthal Patil',
    nameMr: 'महादेव विठ्ठल पाटील',
    age: 58,
    gender: 'Male',
    phone: '9822450119',
    village: 'वडगाव रासाई (Vadgaon)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'DIABETES',
    categoryLabelEn: 'Uncontrolled Type 2 Diabetes & HTN',
    categoryLabelMr: 'अनियंत्रित मधुमेह व उच्च रक्तदाब',
    severity: 'CRITICAL',
    clinicalRiskFactorsEn: [
      'Random Blood Sugar 380 mg/dL (Severely elevated)',
      'Grade 2 Essential Hypertension (158/98 mmHg)',
      'Early Diabetic Neuropathy with numbness in right foot',
      'Irregular medication compliance over past 3 weeks'
    ],
    clinicalRiskFactorsMr: [
      'रक्तातील साखर ३८० mg/dL (अति-उच्च पातळी)',
      'तीव्र उच्च रक्तदाब १५८/९८ mmHg',
      'उजव्या पायात बधिरता (डायबेटिक न्यूरोपॅथी सुरुवातीची लक्षणे)',
      'मागील ३ आठवड्यांत औषध घेण्यामध्ये अनियमितता'
    ],
    dangerSignsEn: ['Fasting sugar > 250 mg/dL', 'Foot wound or blister', 'Chest discomfort'],
    dangerSignsMr: ['उपाशीपोटी साखर २५० पेक्षा जास्त', 'पायावर जखम किंवा फोड', 'छातीत अस्वस्थता'],
    assignedAshaName: 'सुमन ताई पाटील (Suman Tai)',
    assignedAshaPhone: '9423180912',
    assignedPhcName: 'PHC Shirur',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    assignedDoctorName: 'डॉ. मीरा देशमुख (MO)',
    registrationDate: '2023-11-15',
    lastVisitDate: '2024-05-20',
    nextFollowUpDate: '2024-06-10', // Overdue by multiple days
    daysOverdue: 8,
    urgency: 'OVERDUE',
    escalationLevel: 'DHO_CRITICAL',
    adherencePercentage: 45,
    status: 'ACTIVE',
    vitalsSnapshot: {
      bp: '158/98 mmHg',
      bloodSugar: '380 mg/dL',
      weight: '74 kg'
    },
    visitsHistory: [
      {
        id: 'VST-102',
        visitDate: '2024-05-20',
        visitedBy: 'सुमन ताई पाटील',
        role: 'ASHA',
        vitals: { bp: '158/98', bloodGlucose: '380', weightKg: 74 },
        medicineAdherence: 'PARTIAL',
        dangerSignsObserved: ['पायामध्ये मुंग्या येणे'],
        clinicalObservationsEn: 'Patient missed 10 doses of Metformin. Complaining of thirst and frequent urination.',
        clinicalObservationsMr: 'मेटफॉर्मिनच्या १० गोळ्या चुकवल्या. खूप तहान लागणे व वारंवार लघवीची तक्रार.',
        actionTakenEn: 'Advised immediate doctor visit. Re-issued 7-day pill organizer box.',
        actionTakenMr: 'तातडीने डॉक्टरांकडे जाण्याचा सल्ला दिला. ७ दिवसांचा पिल बॉक्स भरून दिला.',
        nextScheduledVisit: '2024-06-10'
      }
    ],
    escalationNotes: 'Day 8 Overdue: Escalated to Taluka Medical Officer Dr. Thorat. Urgent home visit team dispatched.'
  },
  {
    id: 'HRP-003',
    abhaId: 'MH-PN-24-00000003',
    nameEn: 'Rukmini Baban Shinde',
    nameMr: 'रुक्मिणी बबन शिंदे',
    age: 42,
    gender: 'Female',
    phone: '9822661820',
    village: 'वडगाव रासाई (Vadgaon)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'TUBERCULOSIS',
    categoryLabelEn: 'Pulmonary TB (DOTS Category 1)',
    categoryLabelMr: 'फुफ्फुसाचा क्षयरोग (TB DOTS)',
    severity: 'HIGH',
    clinicalRiskFactorsEn: [
      'Microbiologically confirmed Pulmonary TB (CBNAAT Positive)',
      'Intensive Phase Month 2',
      'Weight loss of 4 kg over last month (current weight 41 kg)',
      'Requires daily direct-observed therapy'
    ],
    clinicalRiskFactorsMr: [
      'सीबी-नॅट तपासणीत क्षयरोग पॉझिटिव्ह',
      'उपचाराचा अति-दक्षता पहिला टप्पा (महिना २)',
      'एका महिन्यात ४ किलो वजन घट (सध्या ४१ किलो)',
      'दररोज प्रत्यक्ष देखरेखीखाली औषध डोस देणे आवश्यक'
    ],
    dangerSignsEn: ['Hemoptysis (blood in cough)', 'Persistent high fever', 'Jaundice / yellow eyes'],
    dangerSignsMr: ['खोव्यातून रक्त येणे', 'सलग तीव्र ताप', 'डोळे पिवळे पडणे / कावीळ'],
    assignedAshaName: 'सुमन ताई पाटील (Suman Tai)',
    assignedAshaPhone: '9423180912',
    assignedPhcName: 'PHC Shirur',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    assignedDoctorName: 'डॉ. विकास थोरात (TB Officer)',
    registrationDate: '2024-04-05',
    lastVisitDate: '2024-06-16',
    nextFollowUpDate: '2024-06-18', // Today
    daysOverdue: 0,
    urgency: 'DUE_TODAY',
    escalationLevel: 'NONE',
    adherencePercentage: 96,
    status: 'ACTIVE',
    vitalsSnapshot: {
      bp: '112/72 mmHg',
      weight: '41 kg',
      spo2: 97
    },
    visitsHistory: [
      {
        id: 'VST-103',
        visitDate: '2024-06-16',
        visitedBy: 'सुमन ताई पाटील',
        role: 'ASHA',
        vitals: { bp: '112/72', weightKg: 41, spo2: 97 },
        medicineAdherence: 'FULL',
        dangerSignsObserved: [],
        clinicalObservationsEn: 'Consumed 4-FDC blister under direct observation. Appetite slightly improved.',
        clinicalObservationsMr: 'प्रत्यक्ष देखरेखीखाली ४ औषधांची एकत्रित गोळी घेतली. जेवणाची इच्छा सुधारली आहे.',
        actionTakenEn: 'Nikshay Poshan Yojana ₹500 nutritional incentive verified in bank account.',
        actionTakenMr: 'निक्षय पोषण योजनेचे ₹५०० खात्यात जमा झाल्याची पडताळणी केली.',
        nextScheduledVisit: '2024-06-18'
      }
    ]
  },
  {
    id: 'HRP-004',
    abhaId: 'MH-PN-24-00000004',
    nameEn: 'Sharda Dattatray Pawar',
    nameMr: 'शारदा दत्तात्रय पवार',
    age: 23,
    gender: 'Female',
    phone: '9822774901',
    village: 'टाकळी हाजी (Takli)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'PREGNANT',
    categoryLabelEn: 'Severe Pre-Eclampsia in Primigravida',
    categoryLabelMr: 'गरोदरपणातील अति-तीव्र रक्तदाब (Pre-eclampsia)',
    severity: 'CRITICAL',
    clinicalRiskFactorsEn: [
      'Primigravida 34 Weeks gestation',
      'Blood pressure severely high at 154/102 mmHg',
      'Urine Albumin: 2+ (Significant proteinuria)',
      'Marked bilateral pedal and facial edema'
    ],
    clinicalRiskFactorsMr: [
      'पहिली गर्भधारणा ३४ आठवडे',
      'रक्तदाब धोकादायक पातळीवर १५४/१०२ mmHg',
      'लघवीमध्ये अल्ब्युमिन प्रथिने (२+ पॉझिटिव्ह)',
      'दोन्ही पायांवर आणि चेहऱ्यावर स्पष्ट सूज'
    ],
    dangerSignsEn: ['Severe epigastric pain', 'Persistent frontal headache', 'Visual flashes / scotoma'],
    dangerSignsMr: ['पोटाच्या वरच्या भागात तीव्र कळ', 'कपाळात सलग तीव्र वेदना', 'डोळ्यासमोर चमक दिसणे'],
    assignedAshaName: 'छाया शिंदे (Chhaya Shinde)',
    assignedAshaPhone: '9423991200',
    assignedPhcName: 'Sub-Centre Takli',
    assignedPhcNameMr: 'उपकेंद्र टाकळी',
    assignedDoctorName: 'डॉ. संजय काळे (Gynecologist)',
    registrationDate: '2024-02-12',
    lastVisitDate: '2024-06-14',
    nextFollowUpDate: '2024-06-17', // Overdue by 1 day
    daysOverdue: 2,
    urgency: 'OVERDUE',
    escalationLevel: 'ASHA_ALERT',
    adherencePercentage: 70,
    status: 'ACTIVE',
    vitalsSnapshot: {
      bp: '154/102 mmHg',
      weight: '62 kg',
      gestationalAgeWeeks: 34,
      eddDate: '2024-07-28'
    },
    visitsHistory: [
      {
        id: 'VST-104',
        visitDate: '2024-06-14',
        visitedBy: 'छाया शिंदे',
        role: 'ANM',
        vitals: { bp: '154/102', weightKg: 62 },
        medicineAdherence: 'PARTIAL',
        dangerSignsObserved: ['पायांवर सूज', 'डोकेदुखी'],
        clinicalObservationsEn: 'High BP recorded on two separate readings 4 hours apart. Facial puffiness present.',
        clinicalObservationsMr: '४ तासांच्या अंतराने दोनदा मोजलेला रक्तदाब १५४/१०२ आढळला. चेहऱ्यावर सूज.',
        actionTakenEn: 'Labetalol 100mg given. Emergency referral token generated for District Hospital Pune.',
        actionTakenMr: 'लॅबेटेलॉल १०० मि.ग्रॅ. दिली. जिल्हा रुग्णालयात पाठवण्यासाठी तातडीचा संदर्भ टोकन दिला.',
        nextScheduledVisit: '2024-06-17'
      }
    ],
    escalationNotes: 'Day 2 Overdue: ASHA Chhaya instructed to escort patient via 108 ambulance to District Hospital.'
  },
  {
    id: 'HRP-005',
    abhaId: 'MH-PN-24-00000005',
    nameEn: 'Aniket Nilesh Bhosale (Infant)',
    nameMr: 'अनिकेत निलेश भोसले (बाळ)',
    age: 1,
    gender: 'Male',
    phone: '9822883311',
    village: 'वडगाव रासाई (Vadgaon)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'NEWBORN',
    categoryLabelEn: 'Low Birth Weight & Immunization Defaulter',
    categoryLabelMr: 'कमी जन्मतारीख वजन व लसीकरण थकीत',
    severity: 'HIGH',
    clinicalRiskFactorsEn: [
      'Age: 10 Months',
      'Birth weight: 1.9 kg (Severe LBW)',
      'Missed Pentavalent 3 and MR 1st dose by 45 days',
      'Weight for age below -2 SD (Moderate underweight)'
    ],
    clinicalRiskFactorsMr: [
      'वय: १० महिने',
      'जन्म वजन: १.९ किलो (खूप कमी वजन)',
      'पेंटाव्हॅलेंट ३ व गोवर-रुबेला १ली लस ४५ दिवस थकीत',
      'वयानुसार वजन -२ SD पेक्षा कमी (मध्यम कमी वजन)'
    ],
    dangerSignsEn: ['Inability to feed/breastfeed', 'Chest indrawing during breathing', 'Lethargy'],
    dangerSignsMr: ['दूध पिण्यास असमर्थता', 'श्वास घेताना बरगड्या आत ओढणे', 'अतिशय सुस्त पडणे'],
    assignedAshaName: 'सुमन ताई पाटील (Suman Tai)',
    assignedAshaPhone: '9423180912',
    assignedPhcName: 'PHC Shirur',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    assignedDoctorName: 'डॉ. मीरा देशमुख (MO)',
    registrationDate: '2023-08-20',
    lastVisitDate: '2024-05-28',
    nextFollowUpDate: '2024-06-12', // Overdue
    daysOverdue: 6,
    urgency: 'OVERDUE',
    escalationLevel: 'MO_ALERT',
    adherencePercentage: 60,
    status: 'ACTIVE',
    vitalsSnapshot: {
      weight: '6.8 kg',
      muacMm: 122
    },
    visitsHistory: [
      {
        id: 'VST-105',
        visitDate: '2024-05-28',
        visitedBy: 'सुमन ताई पाटील',
        role: 'ASHA',
        vitals: { weightKg: 6.8, muacMm: 122 },
        medicineAdherence: 'PARTIAL',
        dangerSignsObserved: [],
        clinicalObservationsEn: 'Child is playful but pale. Family migrated temporarily to sugarcane fields causing missed vaccines.',
        clinicalObservationsMr: 'बाळ खेळते आहे पण फिकट दिसते. ऊसतोड मजुरीसाठी स्थलांतरामुळे लसीकरण चुकले.',
        actionTakenEn: 'Counselled mother to attend Wednesday VHND session for catch-up immunization.',
        actionTakenMr: 'बुधवारच्या ग्राम आरोग्य स्वच्छता व पोषण दिवशी (VHND) लसीकरण करून घेण्यास सांगितले.',
        nextScheduledVisit: '2024-06-12'
      }
    ],
    escalationNotes: 'Day 6 Overdue: Medical Officer alert issued to track mother at local brick kiln settlement.'
  },
  {
    id: 'HRP-006',
    abhaId: 'MH-PN-24-00000006',
    nameEn: 'Shantabai Pandurang Gawli',
    nameMr: 'शांताबाई पांडुरंग गवळी',
    age: 65,
    gender: 'Female',
    phone: '9822995544',
    village: 'मांडवगण फराटा (Mandavgan)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'HYPERTENSION',
    categoryLabelEn: 'Cardiovascular Disease & Severe HTN',
    categoryLabelMr: 'हृदयविकार व तीव्र उच्च रक्तदाब',
    severity: 'MODERATE',
    clinicalRiskFactorsEn: [
      'Hypertensive Heart Disease for 8 years',
      'History of Angina pectoris in 2022',
      'Current BP: 148/92 mmHg on Amlodipine + Atenolol',
      'High salt intake in rural diet'
    ],
    clinicalRiskFactorsMr: [
      '८ वर्षांपासून उच्च रक्तदाब व हृदयविकार',
      '२०२२ मध्ये अँजायना छातीत दुखण्याचा इतिहास',
      'सध्याचा रक्तदाब १४८/९२ mmHg',
      'आहारात मिठाचे प्रमाण जास्त'
    ],
    dangerSignsEn: ['Sudden chest heaviness radiating to left arm', 'Severe shortness of breath', 'Syncope'],
    dangerSignsMr: ['डाव्या हातात जाणारी छातीत तीव्र कळ', 'दम लागणे व धाप लागणे', 'चक्कर येऊन पडणे'],
    assignedAshaName: 'रेखा शिंदे (Rekha Shinde)',
    assignedAshaPhone: '9423554411',
    assignedPhcName: 'PHC Mandavgan',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र मांडवगण',
    assignedDoctorName: 'डॉ. मीरा देशमुख (MO)',
    registrationDate: '2023-05-18',
    lastVisitDate: '2024-06-05',
    nextFollowUpDate: '2024-06-25', // Due in 7 days
    daysOverdue: 0,
    urgency: 'DUE_WEEK',
    escalationLevel: 'NONE',
    adherencePercentage: 92,
    status: 'ACTIVE',
    vitalsSnapshot: {
      bp: '148/92 mmHg',
      weight: '64 kg'
    },
    visitsHistory: [
      {
        id: 'VST-106',
        visitDate: '2024-06-05',
        visitedBy: 'रेखा शिंदे',
        role: 'ASHA',
        vitals: { bp: '148/92', weightKg: 64 },
        medicineAdherence: 'FULL',
        dangerSignsObserved: [],
        clinicalObservationsEn: 'Regular with Amlodipine 5mg morning dose. Advised reducing pickle and papad.',
        clinicalObservationsMr: 'दररोज सकाळी ॲम्लोडिपिन ५ मि.ग्रॅ. नियमित चालू. लोणचे-पापड बंद करण्याचा सल्ला दिला.',
        actionTakenEn: 'Refilled 30-day supply from PHC Mandavgan drug counter.',
        actionTakenMr: 'मांडवगण प्राथमिक आरोग्य केंद्रातून ३० दिवसांचा औषध साठा भरून दिला.',
        nextScheduledVisit: '2024-06-25'
      }
    ]
  },
  {
    id: 'HRP-007',
    abhaId: 'MH-PN-24-00000007',
    nameEn: 'Vitthal Tukaram More',
    nameMr: 'विठ्ठल तुकाराम मोरे',
    age: 49,
    gender: 'Male',
    phone: '9822119933',
    village: 'रांजणगाव गणपती (Ranjangaon)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'MENTAL_HEALTH',
    categoryLabelEn: 'Severe Depressive Disorder & Epilepsy',
    categoryLabelMr: 'तीव्र नैराश्य व फेफरे (Epilepsy)',
    severity: 'HIGH',
    clinicalRiskFactorsEn: [
      'Generalized tonic-clonic seizures since 2018',
      'On Sodium Valproate 300mg BD',
      'High risk of seizure recurrence if medicine defaulted',
      'Severe depressive mood episodes with insomnia'
    ],
    clinicalRiskFactorsMr: [
      '२०१८ पासून आकडी व फेफरे येण्याचा त्रास',
      'सोडियम व्हॅल्पोएट ३०० मि.ग्रॅ. चालू',
      'गोळ्या चुकवल्यास पुन्हा तीव्र आकडी येण्याचा धोका',
      'झोप न येणे व तीव्र नैराश्याची लक्षणे'
    ],
    dangerSignsEn: ['Cluster seizures (>2 in 24 hours)', 'Status epilepticus', 'Suicidal ideation'],
    dangerSignsMr: ['२४ तासांत २ पेक्षा जास्त वेळा आकडी येणे', 'सलग बेशुद्धी', 'आत्मघाती विचार'],
    assignedAshaName: 'अनिता गाडे (Anita Gade)',
    assignedAshaPhone: '9423887722',
    assignedPhcName: 'PHC Ranjangaon',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र रांजणगाव',
    assignedDoctorName: 'डॉ. संजय काळे (Psychiatrist Tele-link)',
    registrationDate: '2023-09-10',
    lastVisitDate: '2024-06-08',
    nextFollowUpDate: '2024-06-22', // Due in 4 days
    daysOverdue: 0,
    urgency: 'DUE_WEEK',
    escalationLevel: 'NONE',
    adherencePercentage: 85,
    status: 'ACTIVE',
    vitalsSnapshot: {
      bp: '124/80 mmHg',
      weight: '68 kg'
    },
    visitsHistory: [
      {
        id: 'VST-107',
        visitDate: '2024-06-08',
        visitedBy: 'अनिता गाडे',
        role: 'ASHA',
        vitals: { bp: '124/80', weightKg: 68 },
        medicineAdherence: 'FULL',
        dangerSignsObserved: [],
        clinicalObservationsEn: 'No seizure episode in last 45 days. Sleep cycle improved to 6 hours.',
        clinicalObservationsMr: 'मागील ४५ दिवसांत एकदाही आकडी आलेली नाही. झोपेचे प्रमाण ६ तास सुधारले.',
        actionTakenEn: 'Tele-consultation review completed with District Psychiatrist Dr. Sanjay Kale.',
        actionTakenMr: 'जिल्हा मानसोपचार तज्ञ डॉ. संजय काळे यांच्याशी टेलिकन्सल्टेशन तपासणी पूर्ण केली.',
        nextScheduledVisit: '2024-06-22'
      }
    ]
  },
  {
    id: 'HRP-008',
    abhaId: 'MH-PN-24-00000008',
    nameEn: 'Meena Laxman Waghmare (Toddler)',
    nameMr: 'मीना लक्ष्मण वाघमारे (चिमुकली)',
    age: 2,
    gender: 'Female',
    phone: '9822332211',
    village: 'वडगाव रासाई (Vadgaon)',
    block: 'शिरूर (Shirur)',
    district: 'पुणे (Pune)',
    category: 'MALNUTRITION',
    categoryLabelEn: 'Severe Acute Malnutrition (Pediatric SAM)',
    categoryLabelMr: 'अति-तीव्र कुपोषण (बालक SAM)',
    severity: 'CRITICAL',
    clinicalRiskFactorsEn: [
      'Age: 22 Months',
      'Mid-Upper Arm Circumference (MUAC): 112 mm (Red Zone < 115mm)',
      'Bilateral pitting pedal edema present',
      'Weight-for-Height Z-score < -3 SD'
    ],
    clinicalRiskFactorsMr: [
      'वय: २२ महिने',
      'दंडाचा घेर (MUAC): ११२ मिमी (लाल धोक्याचा पट्टा)',
      'दोन्ही पायांवर खड्डा पडणारी सूज',
      'उंचीनुसार वजन -३ SD पेक्षा खूप कमी'
    ],
    dangerSignsEn: ['Loss of appetite', 'Severe watery diarrhea', 'Hypothermia / Cold extremities'],
    dangerSignsMr: ['खाणे पूर्णपणे बंद होणे', 'तीव्र पातळ जुलाब', 'हातपाय गार पडणे'],
    assignedAshaName: 'सुमन ताई पाटील (Suman Tai)',
    assignedAshaPhone: '9423180912',
    assignedPhcName: 'PHC Shirur',
    assignedPhcNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    assignedDoctorName: 'डॉ. मीरा देशमुख (MO / NRC Link)',
    registrationDate: '2024-03-01',
    lastVisitDate: '2024-06-11',
    nextFollowUpDate: '2024-06-18', // Today
    daysOverdue: 0,
    urgency: 'DUE_TODAY',
    escalationLevel: 'NONE',
    adherencePercentage: 90,
    status: 'ACTIVE',
    vitalsSnapshot: {
      weight: '7.1 kg',
      muacMm: 112
    },
    visitsHistory: [
      {
        id: 'VST-108',
        visitDate: '2024-06-11',
        visitedBy: 'सुमन ताई पाटील',
        role: 'ASHA',
        vitals: { weightKg: 7.1, muacMm: 112 },
        medicineAdherence: 'FULL',
        dangerSignsObserved: ['पायावर किंचित सूज'],
        clinicalObservationsEn: 'Child tolerating Therapeutic Nutrition Paste (RUTF). Mother administering 3 packets daily.',
        clinicalObservationsMr: 'उपचारात्मक पोषण आहार (RUTF) घेत आहे. आई दररोज ३ पाकिटे नियमित भरवत आहे.',
        actionTakenEn: 'Scheduled 14-day Nutrition Rehabilitation Center (NRC) admission at RH Khed.',
        actionTakenMr: 'ग्रामीण रुग्णालय खेड येथील बाल पोषण पुनर्वसन केंद्रात (NRC) दाखल करण्याचे नियोजन केले.',
        nextScheduledVisit: '2024-06-18'
      }
    ]
  }
];

const HIGH_RISK_STORAGE_KEY = 'healthway_highrisk_patients_v2';

export const RiskEngineService = {
  getPatients(): HighRiskPatient[] {
    try {
      const stored = localStorage.getItem(HIGH_RISK_STORAGE_KEY);
      if (stored) {
        const parsed: HighRiskPatient[] = JSON.parse(stored);
        // Refresh urgency tiers dynamically based on today
        return parsed.map(p => {
          const { urgency, daysOverdue } = evaluateUrgencyTier(p.nextFollowUpDate);
          const escalation = evaluateEscalationLevel(daysOverdue, p.severity);
          return {
            ...p,
            urgency,
            daysOverdue,
            escalationLevel: escalation
          };
        });
      }
    } catch {
      // ignore
    }
    const fresh = INITIAL_HIGH_RISK_REGISTRY.map(p => {
      const { urgency, daysOverdue } = evaluateUrgencyTier(p.nextFollowUpDate);
      const escalation = evaluateEscalationLevel(daysOverdue, p.severity);
      return { ...p, urgency, daysOverdue, escalationLevel: escalation };
    });
    this.savePatients(fresh);
    return fresh;
  },

  savePatients(patients: HighRiskPatient[]) {
    try {
      localStorage.setItem(HIGH_RISK_STORAGE_KEY, JSON.stringify(patients));
    } catch {
      // ignore
    }
  },

  getPatientById(id: string): HighRiskPatient | undefined {
    return this.getPatients().find(p => p.id === id || p.abhaId === id);
  },

  // Log a home visit by ASHA / ANM
  logHomeVisit(
    patientId: string, 
    visitData: {
      visitedBy: string;
      role: 'ASHA' | 'ANM' | 'Medical Officer';
      vitals: HomeVisitLog['vitals'];
      medicineAdherence: 'FULL' | 'PARTIAL' | 'MISSED';
      dangerSignsObserved: string[];
      observationsEn: string;
      observationsMr: string;
      actionTakenEn: string;
      actionTakenMr: string;
      nextScheduledDate: string;
    }
  ): HighRiskPatient | null {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === patientId);
    if (index === -1) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: HomeVisitLog = {
      id: `VST-${Date.now().toString().slice(-4)}`,
      visitDate: todayStr,
      visitedBy: visitData.visitedBy,
      role: visitData.role,
      vitals: visitData.vitals,
      medicineAdherence: visitData.medicineAdherence,
      dangerSignsObserved: visitData.dangerSignsObserved,
      clinicalObservationsEn: visitData.observationsEn,
      clinicalObservationsMr: visitData.observationsMr,
      actionTakenEn: visitData.actionTakenEn,
      actionTakenMr: visitData.actionTakenMr,
      nextScheduledVisit: visitData.nextScheduledDate
    };

    const target = patients[index];
    const updatedVisits = [newLog, ...(target.visitsHistory || [])];

    // Compute updated adherence
    const fullCount = updatedVisits.filter(v => v.medicineAdherence === 'FULL').length;
    const newAdherence = Math.round((fullCount / updatedVisits.length) * 100);

    const { urgency, daysOverdue } = evaluateUrgencyTier(visitData.nextScheduledDate);

    target.visitsHistory = updatedVisits;
    target.lastVisitDate = todayStr;
    target.nextFollowUpDate = visitData.nextScheduledDate;
    target.adherencePercentage = newAdherence;
    target.daysOverdue = daysOverdue;
    target.urgency = urgency;
    target.escalationLevel = evaluateEscalationLevel(daysOverdue, target.severity);

    // Update vitals snapshot
    if (visitData.vitals.bp) target.vitalsSnapshot.bp = `${visitData.vitals.bp} mmHg`;
    if (visitData.vitals.bloodGlucose) target.vitalsSnapshot.bloodSugar = `${visitData.vitals.bloodGlucose} mg/dL`;
    if (visitData.vitals.weightKg) target.vitalsSnapshot.weight = `${visitData.vitals.weightKg} kg`;
    if (visitData.vitals.muacMm) target.vitalsSnapshot.muacMm = visitData.vitals.muacMm;
    if (visitData.vitals.hbGdl) target.vitalsSnapshot.hb = `${visitData.vitals.hbGdl} g/dL`;

    patients[index] = target;
    this.savePatients(patients);
    return target;
  },

  // Doctor / ANM flags a new high-risk patient
  flagNewPatient(newPatientData: Omit<HighRiskPatient, 'id' | 'daysOverdue' | 'urgency' | 'escalationLevel' | 'visitsHistory'>): HighRiskPatient {
    const patients = this.getPatients();
    const newId = `HRP-${(patients.length + 1).toString().padStart(3, '0')}`;
    const { urgency, daysOverdue } = evaluateUrgencyTier(newPatientData.nextFollowUpDate);
    const escalation = evaluateEscalationLevel(daysOverdue, newPatientData.severity);

    const fullPatient: HighRiskPatient = {
      ...newPatientData,
      id: newId,
      daysOverdue,
      urgency,
      escalationLevel: escalation,
      visitsHistory: []
    };

    patients.unshift(fullPatient);
    this.savePatients(patients);
    return fullPatient;
  },

  // Manual or automatic escalation trigger
  escalatePatient(patientId: string, level: EscalationLevel, notes: string): HighRiskPatient | null {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === patientId);
    if (index === -1) return null;

    patients[index].escalationLevel = level;
    patients[index].escalationNotes = notes;
    this.savePatients(patients);
    return patients[index];
  },

  // Analytics summary for dashboards
  getAnalytics() {
    const patients = this.getPatients();
    const total = patients.length;
    const overdue = patients.filter(p => p.urgency === 'OVERDUE').length;
    const dueToday = patients.filter(p => p.urgency === 'DUE_TODAY').length;
    const critical = patients.filter(p => p.severity === 'CRITICAL').length;
    const avgAdherence = Math.round(patients.reduce((acc, p) => acc + p.adherencePercentage, 0) / (total || 1));

    const categoryCounts: Record<ClinicalRiskCategory, number> = {
      PREGNANT: 0,
      NEWBORN: 0,
      DIABETES: 0,
      HYPERTENSION: 0,
      TUBERCULOSIS: 0,
      MENTAL_HEALTH: 0,
      MALNUTRITION: 0
    };

    patients.forEach(p => {
      if (categoryCounts[p.category] !== undefined) {
        categoryCounts[p.category]++;
      }
    });

    return {
      total,
      overdue,
      dueToday,
      critical,
      avgAdherence,
      categoryCounts
    };
  }
};
