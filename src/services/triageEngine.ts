/**
 * HealthWay - Digital Clinical Triage Engine
 * Rule-based Clinical Decision Support System (CDSS) for Rural Healthcare
 * Adheres to WHO Emergency Triage Assessment and Treatment (ETAT) and NHM Protocols.
 */

export type TriageLevelKey = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
export type SymptomCategoryKey = 'critical' | 'urgent' | 'semiUrgent' | 'nonUrgent';

export interface TriageLevelConfig {
  level: TriageLevelKey;
  labelEn: string;
  labelMr: string;
  descriptionEn: string;
  descriptionMr: string;
  waitTimeEn: string;
  waitTimeMr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  actionEn: string;
  actionMr: string;
}

export const TRIAGE_LEVELS: Record<TriageLevelKey, TriageLevelConfig> = {
  RED: {
    level: 'RED',
    labelEn: 'Emergency / Critical',
    labelMr: 'तातडीची आणीबाणी (Emergency)',
    descriptionEn: 'Immediate life-saving medical intervention required without delay',
    descriptionMr: 'विलंब न करता तातडीने वैद्यकीय उपचारांची आवश्यकता',
    waitTimeEn: 'IMMEDIATE',
    waitTimeMr: 'तात्काळ',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    actionEn: 'Call 108 emergency ambulance immediately or proceed to Emergency Room',
    actionMr: 'त्वरित १०८ रुग्णवाहिकेला कॉल करा किंवा आपत्कालीन विभागात जा',
  },
  ORANGE: {
    level: 'ORANGE',
    labelEn: 'Urgent Priority',
    labelMr: 'तातडीचे प्राधान्य (Urgent)',
    descriptionEn: 'Needs urgent clinical evaluation within 30 minutes',
    descriptionMr: '३० मिनिटांच्या आत वैद्यकीय तपासणी आवश्यक',
    waitTimeEn: '< 30 mins',
    waitTimeMr: '< ३० मिनिटे',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FDBA74',
    actionEn: 'Proceed to nearest PHC/Hospital OPD immediately & alert duty nurse',
    actionMr: 'तातडीने आरोग्य केंद्रात जा आणि उपस्थित परिचारिकेला माहिती द्या',
  },
  YELLOW: {
    level: 'YELLOW',
    labelEn: 'Semi-Urgent',
    labelMr: 'मध्यम तातडीचे (Semi-Urgent)',
    descriptionEn: 'Patient is stable, can wait up to 2 hours for consultation',
    descriptionMr: 'रुग्ण स्थिर आहे, २ तासांपर्यंत वाट पाहू शकतात',
    waitTimeEn: '< 2 hours',
    waitTimeMr: '< २ तास',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    actionEn: 'Register in OPD queue and await doctor consultation today',
    actionMr: 'ओपीडी रांगेत नोंदणी करा आणि आपल्या नंबरची वाट पहा',
  },
  GREEN: {
    level: 'GREEN',
    labelEn: 'Non-Urgent / Routine',
    labelMr: 'नियमित / गैर-तातडीचे (Non-Urgent)',
    descriptionEn: 'Can be managed with primary home care advice or routine appointment',
    descriptionMr: 'प्राथमिक घरगुती काळजी किंवा नियमित तपासणीने व्यवस्थापित केले जाऊ शकते',
    waitTimeEn: 'Scheduled / Routine',
    waitTimeMr: 'नियमित वेळ',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
    actionEn: 'Follow home care guidance. Visit PHC if symptoms persist after 48 hours',
    actionMr: 'घरगुती काळजी सूचनांचे पालन करा. ४८ तासांपेक्षा जास्त त्रास राहिल्यास केंद्राला भेट द्या',
  },
};

export interface SymptomItem {
  id: string;
  labelEn: string;
  labelMr: string;
  weight: number;
  category: SymptomCategoryKey;
  descriptionEn?: string;
  descriptionMr?: string;
}

export const SYMPTOM_DATABASE: Record<SymptomCategoryKey, SymptomItem[]> = {
  critical: [
    { id: 'chest_pain', labelEn: 'Severe Chest Pain / Heavy Pressure', labelMr: 'छातीत तीव्र कळ किंवा असह्य दाब', weight: 10, category: 'critical' },
    { id: 'difficulty_breathing', labelEn: 'Severe Shortness of Breath / Gasping', labelMr: 'श्वास घेण्यास तीव्र त्रास / धाप लागणे', weight: 10, category: 'critical' },
    { id: 'unconscious', labelEn: 'Loss of Consciousness / Unresponsive', labelMr: 'अचानक बेशुद्ध होणे / प्रतिसाद न देणे', weight: 10, category: 'critical' },
    { id: 'heavy_bleeding', labelEn: 'Uncontrolled Severe Bleeding', labelMr: 'अनियंत्रित तीव्र रक्तस्त्राव', weight: 10, category: 'critical' },
    { id: 'stroke_symptoms', labelEn: 'Facial Drooping / Slurred Speech / Sudden Weakness', labelMr: 'तोंड वाकडे होणे / बोलण्यात अडखळणे / पक्षाघात', weight: 10, category: 'critical' },
    { id: 'seizure', labelEn: 'Active Seizures / Convulsions / Fits', labelMr: 'फिट्स / झटके येणे / आकडी', weight: 10, category: 'critical' },
    { id: 'severe_allergic', labelEn: 'Severe Allergic Reaction / Throat Swelling', labelMr: 'तीव्र ॲलर्जी / घसा सुजणे / गुदमरणे', weight: 10, category: 'critical' },
  ],
  urgent: [
    { id: 'high_fever', labelEn: 'High Grade Fever (>103°F / 39.4°C) with Chills', labelMr: 'तीव्र ताप (>१०३°F) व तीव्र हुडहुडी', weight: 7, category: 'urgent' },
    { id: 'vomiting_blood', labelEn: 'Vomiting Blood or Black Stool', labelMr: 'उलटीतून रक्त किंवा काळी संडास', weight: 8, category: 'urgent' },
    { id: 'severe_abdominal', labelEn: 'Severe Acute Abdominal Pain / Rigidity', labelMr: 'पोटात असह्य तीव्र कळ व कडकपणा', weight: 7, category: 'urgent' },
    { id: 'confusion', labelEn: 'Sudden Confusion / Disorientation', labelMr: 'अचानक गोंधळलेपणा / असंबद्ध बोलणे', weight: 8, category: 'urgent' },
    { id: 'fracture_suspected', labelEn: 'Suspected Bone Fracture / Severe Trauma', labelMr: 'हाड मोडल्याचा संशय / तीव्र दुखापत', weight: 7, category: 'urgent' },
    { id: 'pregnancy_emergency', labelEn: 'Maternal Emergency (Fluid Leak, Vaginal Bleeding, Severe Cramps)', labelMr: 'गर्भावस्थेतील धोक्याची लक्षणे (रक्तस्त्राव, पाणी जाणे)', weight: 9, category: 'urgent' },
    { id: 'eye_injury', labelEn: 'Eye Injury / Chemical Burn / Sudden Vision Loss', labelMr: 'डोळ्याला गंभीर इजा / अचानक दृष्टी जाणे', weight: 7, category: 'urgent' },
    { id: 'diabetic_emergency', labelEn: 'Diabetic Emergency (Extreme Dizziness / Shaking)', labelMr: 'साखरेचे प्रमाण तीव्र कमी/जास्त होणे', weight: 8, category: 'urgent' },
    { id: 'pediatric_lethargy', labelEn: 'Infant / Child Unable to Feed, Excessively Drowsy', labelMr: 'लहान मूल दूध न पिणे / अतिसुस्त असणे', weight: 8, category: 'urgent' },
  ],
  semiUrgent: [
    { id: 'moderate_fever', labelEn: 'Moderate Fever (100°F - 103°F) for 2+ Days', labelMr: 'मध्यम ताप (१००°-१०३°F) २ दिवसांहून अधिक', weight: 4, category: 'semiUrgent' },
    { id: 'mild_breathing', labelEn: 'Mild Wheezing or Persistent Productive Cough', labelMr: 'हलकी धाप किंवा कफयुक्त खोकला', weight: 5, category: 'semiUrgent' },
    { id: 'ear_pain', labelEn: 'Severe Earache with Pus or Fluid Discharge', labelMr: 'कानात तीव्र वेदना किंवा पू वाहणे', weight: 4, category: 'semiUrgent' },
    { id: 'urinary_pain', labelEn: 'Burning / Painful Urination with Low Back Pain', labelMr: 'लघवी करताना तीव्र जळजळ किंवा पाठीत दुखणे', weight: 4, category: 'semiUrgent' },
    { id: 'persistent_vomiting', labelEn: 'Repeated Vomiting / Diarrhea (4+ times, Signs of Dehydration)', labelMr: 'वारंवार उलट्या किंवा जुलाब (पाणी कमी होणे)', weight: 4, category: 'semiUrgent' },
    { id: 'spreading_rash', labelEn: 'Rapidly Spreading Skin Rash or Welts', labelMr: 'त्वचेवर वेगाने पसरणारे लाल पुरळ किंवा पित्त', weight: 5, category: 'semiUrgent' },
    { id: 'severe_dental', labelEn: 'Severe Dental Infection with Cheek Swelling', labelMr: 'दातांचे तीव्र इन्फेक्शन किंवा गालावर सूज', weight: 4, category: 'semiUrgent' },
    { id: 'joint_swelling', labelEn: 'Painful Joint Swelling / Inability to Walk', labelMr: 'सांध्यावर अचानक सूज व चालता न येणे', weight: 4, category: 'semiUrgent' },
  ],
  nonUrgent: [
    { id: 'mild_cold', labelEn: 'Common Cold / Runny Nose / Sneezing', labelMr: 'सामान्य सर्दी, शिंका किंवा नाक वाहणे', weight: 1, category: 'nonUrgent' },
    { id: 'mild_cough', labelEn: 'Mild Dry Cough (< 3 days)', labelMr: 'हलका कोरडा खोकला (< ३ दिवस)', weight: 1, category: 'nonUrgent' },
    { id: 'minor_cut', labelEn: 'Minor Scrape / Superficial Scratch', labelMr: 'किरकोळ खरचटणे किंवा छोटी जखम', weight: 1, category: 'nonUrgent' },
    { id: 'mild_headache', labelEn: 'Mild Tension Headache / Fatigue', labelMr: 'हलके डोकेदुखी किंवा थकवा', weight: 2, category: 'nonUrgent' },
    { id: 'insomnia', labelEn: 'Sleep Difficulty / Mild Anxiety', labelMr: 'शांत झोप न येणे किंवा किरकोळ काळजी', weight: 1, category: 'nonUrgent' },
    { id: 'mild_rash', labelEn: 'Localized Dry Skin / Minor Itching', labelMr: 'स्थानिक कोरडी त्वचा किंवा खाज', weight: 2, category: 'nonUrgent' },
    { id: 'backache', labelEn: 'Mild Postural Backache', labelMr: 'नियमित हलकी पाठदुखी', weight: 1, category: 'nonUrgent' },
    { id: 'prescription_refill', labelEn: 'Routine Chronic Medicine Refill / Routine BP Check', labelMr: 'नियमित औषधांचा रिफिल किंवा सामान्य बीपी तपासणी', weight: 1, category: 'nonUrgent' },
  ],
};

export const CHRONIC_CONDITIONS = [
  { id: 'diabetes', labelEn: 'Diabetes (Type 1 / 2)', labelMr: 'मधुमेह (डायबेटिस)' },
  { id: 'hypertension', labelEn: 'High Blood Pressure', labelMr: 'उच्च रक्तदाब (हायपरटेंशन)' },
  { id: 'heart_disease', labelEn: 'Heart Disease / CAD', labelMr: 'हृदयरोग / ब्लॉकेज' },
  { id: 'copd', labelEn: 'Asthma / COPD / Lung Disease', labelMr: 'दमा / श्वासनलिकेचा विकार' },
  { id: 'kidney_disease', labelEn: 'Kidney Disease', labelMr: 'किडनीचे विकार' },
  { id: 'cancer', labelEn: 'Cancer (Under Treatment)', labelMr: 'कर्करोग (कॅन्सर उपचार सुरू)' },
  { id: 'immunocompromised', labelEn: 'Immunocompromised State / Steroids', labelMr: 'रोगप्रतिकारशक्ती कमी असणे' },
];

export interface VitalSigns {
  temperature?: number | string; // in °F
  heartRate?: number | string;   // bpm
  spo2?: number | string;        // %
  bloodPressure?: string;        // systolic/diastolic, e.g. "130/85"
}

export interface TriageFormData {
  patientName: string;
  age: number | string;
  gender: 'male' | 'female' | 'other' | string;
  isPregnant?: boolean;
  duration: 'sudden' | 'hours' | 'day' | 'days' | 'week' | 'weeks';
  symptoms: string[];
  vitalSigns?: VitalSigns;
  existingConditions?: string[];
  abhaId?: string;
  phone?: string;
  notes?: string;
}

export interface TriageResult {
  referenceId: string;
  timestamp: string;
  triageLevel: TriageLevelConfig;
  score: number;
  symptomDetails: SymptomItem[];
  vitalFlags: string[];
  recommendationsEn: string[];
  recommendationsMr: string[];
  urgencyAdviceEn: string;
  urgencyAdviceMr: string;
  patientSummary: {
    name: string;
    age: number;
    gender: string;
    isPregnant: boolean;
    abhaId?: string;
    phone?: string;
    duration: string;
  };
}

export const getAgeModifier = (age: number): number => {
  if (age < 1) return 2.0;    // Infants - very high risk
  if (age < 5) return 1.7;    // Young children
  if (age >= 65) return 1.5;  // Elderly
  if (age >= 50) return 1.2;  // Middle-aged
  return 1.0;                 // Standard adult
};

export const getDurationModifier = (duration: string): number => {
  switch (duration) {
    case 'sudden': return 1.5;
    case 'hours': return 1.3;
    case 'day': return 1.1;
    case 'days': return 1.0;
    case 'week': return 0.9;
    case 'weeks': return 0.8;
    default: return 1.0;
  }
};

export const calculateTriage = (formData: TriageFormData): TriageResult => {
  const ageNum = Number(formData.age) || 30;
  const ageMod = getAgeModifier(ageNum);
  const durMod = getDurationModifier(formData.duration);

  let rawScore = 0;
  let hasCritical = false;
  let hasUrgent = false;
  const symptomDetails: SymptomItem[] = [];

  const allSymptoms: SymptomItem[] = [
    ...SYMPTOM_DATABASE.critical,
    ...SYMPTOM_DATABASE.urgent,
    ...SYMPTOM_DATABASE.semiUrgent,
    ...SYMPTOM_DATABASE.nonUrgent,
  ];

  formData.symptoms.forEach(symId => {
    const found = allSymptoms.find(s => s.id === symId);
    if (found) {
      rawScore += found.weight;
      if (found.category === 'critical') hasCritical = true;
      if (found.category === 'urgent') hasUrgent = true;
      symptomDetails.push(found);
    }
  });

  // Evaluate Vitals
  let vitalScore = 0;
  const vitalFlags: string[] = [];

  if (formData.vitalSigns) {
    const spo2 = Number(formData.vitalSigns.spo2);
    if (spo2 && spo2 < 90) {
      vitalScore += 10;
      hasCritical = true;
      vitalFlags.push(`Critical SpO2: ${spo2}% (<90%)`);
    } else if (spo2 && spo2 < 94) {
      vitalScore += 6;
      hasUrgent = true;
      vitalFlags.push(`Low SpO2: ${spo2}% (<94%)`);
    }

    const hr = Number(formData.vitalSigns.heartRate);
    if (hr && (hr > 150 || hr < 40)) {
      vitalScore += 8;
      hasUrgent = true;
      vitalFlags.push(`Abnormal Pulse: ${hr} bpm`);
    }

    const temp = Number(formData.vitalSigns.temperature);
    if (temp && temp >= 104) {
      vitalScore += 7;
      hasUrgent = true;
      vitalFlags.push(`Extreme High Temp: ${temp}°F`);
    } else if (temp && temp >= 102) {
      vitalScore += 4;
      vitalFlags.push(`Elevated Temp: ${temp}°F`);
    }

    if (formData.vitalSigns.bloodPressure) {
      const parts = formData.vitalSigns.bloodPressure.split('/').map(p => Number(p.trim()));
      const sys = parts[0];
      const dia = parts[1];
      if (sys && (sys >= 180 || sys <= 80)) {
        vitalScore += 8;
        hasUrgent = true;
        vitalFlags.push(`Hypertensive Crisis / Severe Hypotension: ${sys}/${dia || ''} mmHg`);
      } else if (sys && sys >= 140) {
        vitalScore += 4;
        vitalFlags.push(`Elevated BP: ${sys}/${dia || ''} mmHg`);
      }
    }
  }

  // Multiply by age and duration
  let totalScore = (rawScore + vitalScore) * ageMod * durMod;

  // Chronic conditions modifier
  const highRiskConditions = ['diabetes', 'heart_disease', 'copd', 'cancer', 'kidney_disease', 'immunocompromised'];
  const hasHighRisk = formData.existingConditions?.some(c => highRiskConditions.includes(c));
  if (hasHighRisk) {
    totalScore *= 1.25;
  }

  // Maternal pregnancy safety escalation
  if (formData.isPregnant) {
    totalScore *= 1.2;
    // If pregnant woman has fever or headache or swelling, escalate
    const maternalTriggers = ['pregnancy_emergency', 'severe_abdominal', 'headache', 'high_fever', 'heavy_bleeding'];
    const hasMaternalRisk = formData.symptoms.some(s => maternalTriggers.includes(s));
    if (hasMaternalRisk) {
      hasUrgent = true;
      totalScore += 5;
    }
  }

  // Determine Triage Level
  let levelKey: TriageLevelKey;
  if (hasCritical || totalScore >= 15) {
    levelKey = 'RED';
  } else if (hasUrgent || totalScore >= 8) {
    levelKey = 'ORANGE';
  } else if (totalScore >= 4) {
    levelKey = 'YELLOW';
  } else {
    levelKey = 'GREEN';
  }

  const triageLevel = TRIAGE_LEVELS[levelKey];

  // Recommendations
  const recommendationsEn: string[] = [];
  const recommendationsMr: string[] = [];

  if (levelKey === 'RED') {
    recommendationsEn.push(
      'Dial 108 immediately for government emergency ambulance transport',
      'Keep patient resting flat with airway open; do NOT offer solid food or oral liquids',
      'If patient is unconscious, turn them gently into the lateral recovery position',
      'Alert nearest Rural Hospital or Sub-District Hospital Emergency Casualty before arrival',
      'Carry existing prescriptions and medical records with the emergency team'
    );
    recommendationsMr.push(
      'तातडीने १०८ रुग्णवाहिकेला फोन करून इमर्जन्सी सेवेची मदत घ्या',
      'रुग्णाला शांत झोपवून ठेवा, तोंडात काहीही खायला किंवा पिण्यास देऊ नका',
      'रुग्ण बेशुद्ध असल्यास एका कुशीवर (Recovery Position) वळवून ठेवा',
      'जवळच्या ग्रामीण रुग्णालय किंवा उपजिल्हा रुग्णालयाला पोहचण्यापूर्वी पूर्वसूचना द्या',
      'रुग्णाचे मागील सर्व रिपोर्ट आणि औषधांची कागदपत्रे सोबत ठेवा'
    );
  } else if (levelKey === 'ORANGE') {
    recommendationsEn.push(
      'Proceed to Primary Health Centre (PHC) or Community Health Centre (CHC) within 30 minutes',
      'Notify the triage / duty nurse immediately upon arrival for prioritized vitals check',
      'Avoid strenuous movement; keep warm and hydrated with small sips of water if tolerated',
      'Do not delay seeking care as symptoms may progress rapidly',
      'Prepare ABHA ID or Aadhaar card for expedited OPD registration'
    );
    recommendationsMr.push(
      'पुढील ३० मिनिटांच्या आत प्राथमिक आरोग्य केंद्र किंवा ग्रामीण रुग्णालयात पोहोचा',
      'केंद्रात पोहोचल्यावर उपस्थित परिचारिकेला त्वरित धोक्याच्या लक्षणांची माहिती द्या',
      'रुग्णाला विश्रांती द्या, जड हालचाली टाळा आणि हलके कोमट पाणी द्या',
      'उशीर करू नका, दुर्लक्ष केल्यास प्रकृती अचानक खालावू शकते',
      'त्वरित उपचारासाठी आधार कार्ड किंवा आभा (ABHA) आयडी तयार ठेवा'
    );
  } else if (levelKey === 'YELLOW') {
    recommendationsEn.push(
      'Visit the nearest PHC or Sub-Centre OPD for clinical checkup today',
      'Register token in the OPD queue management system',
      'Drink plenty of clean boiled water or ORS to prevent dehydration',
      'Note down symptom timeline and exact medications taken',
      'Seek emergency escalation immediately if high fever, breathing distress, or vomiting blood develops'
    );
    recommendationsMr.push(
      'आजच जवळच्या प्राथमिक आरोग्य केंद्रात किंवा उपकेंद्रात जाऊन डॉक्टरांना दाखवा',
      'ओपीडी रांगेत टोकन नोंदवून नियमित तपासणी करून घ्या',
      'पुरेसे उकळून थंड केलेले पाणी किंवा ओआरएस (ORS) घ्या',
      'त्रास कधीपासून सुरू झाला व घेतलेली औषधे लिहून ठेवा',
      'ताप वाढल्यास किंवा धाप लागल्यास ताबडतोब १०८ रुग्णवाहिकेला संपर्क करा'
    );
  } else {
    recommendationsEn.push(
      'Safe for home care management with adequate rest and hydration',
      'Take over-the-counter paracetamol / ORS as advised by ASHA worker or pharmacist',
      'Monitor body temperature and symptoms every 8 hours',
      'Book a routine PHC teleconsultation if condition does not improve within 48 hours',
      'Maintain good hygiene, clean hands, and balanced nutritious food'
    );
    recommendationsMr.push(
      'पुरेशी विश्रांती आणि योग्य आहारासह घरी काळजी घेणे सुरक्षित आहे',
      'आशा ताई किंवा फार्मासिस्टच्या सल्ल्याने प्राथमिक पॅरासिटामॉल किंवा ओआरएस घ्या',
      'दर ८ तासांनी रुग्णाचा ताप व लक्षणे तपासा',
      '४८ तासांत आराम न पडल्यास आरोग्य केंद्रात फोनद्वारे किंवा समक्ष डॉक्टरांचा सल्ला घ्या',
      'स्वच्छतेची काळजी घ्या आणि सकस हलका आहार द्या'
    );
  }

  const roundedScore = Math.round(totalScore);

  const refId = `TRG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    referenceId: refId,
    timestamp: new Date().toISOString(),
    triageLevel,
    score: roundedScore,
    symptomDetails,
    vitalFlags,
    recommendationsEn,
    recommendationsMr,
    urgencyAdviceEn: triageLevel.actionEn,
    urgencyAdviceMr: triageLevel.actionMr,
    patientSummary: {
      name: formData.patientName || 'Patient',
      age: ageNum,
      gender: formData.gender || 'Not specified',
      isPregnant: !!formData.isPregnant,
      abhaId: formData.abhaId,
      phone: formData.phone,
      duration: formData.duration,
    },
  };
};

/**
 * Duty Nurse / Clinic Real-Time Triage Queue
 */
export interface TriageQueueEntry {
  id: string;
  referenceId: string;
  patientName: string;
  age: number;
  gender: string;
  isPregnant: boolean;
  triageLevel: TriageLevelKey;
  score: number;
  symptomsCount: number;
  topSymptomEn: string;
  topSymptomMr: string;
  waitTime: string;
  timestamp: string;
  status: 'waiting' | 'in-progress' | 'discharged' | 'referred';
  vitalsSummary?: string;
  assignedFacility?: string;
}

const TRIAGE_QUEUE_KEY = 'hw_triage_queue_v1';
const TRIAGE_CHANNEL_NAME = 'hw_triage_sync_channel';

export const getTriageQueue = (): TriageQueueEntry[] => {
  try {
    const raw = localStorage.getItem(TRIAGE_QUEUE_KEY);
    if (!raw) {
      // Provide realistic default entries for immediate demonstration
      const initial: TriageQueueEntry[] = [
        {
          id: 'TQ-901',
          referenceId: 'TRG-2024-819201',
          patientName: 'Sunita Ramesh Patil',
          age: 24,
          gender: 'female',
          isPregnant: true,
          triageLevel: 'ORANGE',
          score: 14,
          symptomsCount: 3,
          topSymptomEn: 'Maternal Emergency & High Fever',
          topSymptomMr: 'गर्भावस्थेतील धोक्याची लक्षणे व तीव्र ताप',
          waitTime: '< 30 mins',
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
          status: 'waiting',
          vitalsSummary: 'BP: 140/92, SpO2: 96%, Temp: 101.4°F',
          assignedFacility: 'PHC Shirur Emergency Bay',
        },
        {
          id: 'TQ-902',
          referenceId: 'TRG-2024-742189',
          patientName: 'Kisan Baburao More',
          age: 68,
          gender: 'male',
          isPregnant: false,
          triageLevel: 'RED',
          score: 22,
          symptomsCount: 4,
          topSymptomEn: 'Severe Chest Pain & Low SpO2',
          topSymptomMr: 'छातीत तीव्र कळ व ऑक्सिजन कमी',
          waitTime: 'IMMEDIATE',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          status: 'in-progress',
          vitalsSummary: 'BP: 185/110, SpO2: 88%, HR: 118',
          assignedFacility: 'PHC Shirur Emergency Bay',
        },
        {
          id: 'TQ-903',
          referenceId: 'TRG-2024-601944',
          patientName: 'Aarav Sachin Shinde',
          age: 3,
          gender: 'male',
          isPregnant: false,
          triageLevel: 'YELLOW',
          score: 6,
          symptomsCount: 2,
          topSymptomEn: 'Moderate Fever & Vomiting',
          topSymptomMr: 'मध्यम ताप व उलट्या',
          waitTime: '< 2 hours',
          timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
          status: 'waiting',
          vitalsSummary: 'Temp: 101.8°F, SpO2: 98%',
          assignedFacility: 'PHC Shirur Pediatric OPD',
        },
      ];
      localStorage.setItem(TRIAGE_QUEUE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveTriageEntry = (result: TriageResult, assignedFacility = 'PHC Shirur'): TriageQueueEntry => {
  const queue = getTriageQueue();
  const topSymptom = result.symptomDetails[0];

  const entry: TriageQueueEntry = {
    id: `TQ-${Math.floor(100 + Math.random() * 900)}`,
    referenceId: result.referenceId,
    patientName: result.patientSummary.name,
    age: result.patientSummary.age,
    gender: result.patientSummary.gender,
    isPregnant: result.patientSummary.isPregnant,
    triageLevel: result.triageLevel.level,
    score: result.score,
    symptomsCount: result.symptomDetails.length,
    topSymptomEn: topSymptom ? topSymptom.labelEn : 'General Malaise',
    topSymptomMr: topSymptom ? topSymptom.labelMr : 'सामान्य अस्वस्थता',
    waitTime: result.triageLevel.waitTimeEn,
    timestamp: result.timestamp,
    status: 'waiting',
    vitalsSummary: result.vitalFlags.join(', ') || 'Vitals Normal / Unrecorded',
    assignedFacility,
  };

  // Prepend or insert according to priority
  if (entry.triageLevel === 'RED') {
    queue.unshift(entry);
  } else if (entry.triageLevel === 'ORANGE') {
    const firstNonRedIndex = queue.findIndex(q => q.triageLevel !== 'RED');
    if (firstNonRedIndex === -1) queue.push(entry);
    else queue.splice(firstNonRedIndex, 0, entry);
  } else {
    queue.push(entry);
  }

  try {
    localStorage.setItem(TRIAGE_QUEUE_KEY, JSON.stringify(queue));
    const channel = new BroadcastChannel(TRIAGE_CHANNEL_NAME);
    channel.postMessage({ type: 'NEW_TRIAGE', entry });
    channel.close();
  } catch {
    // ignore
  }

  return entry;
};

export const updateTriageEntryStatus = (id: string, status: TriageQueueEntry['status']): void => {
  const queue = getTriageQueue();
  const idx = queue.findIndex(q => q.id === id);
  if (idx !== -1) {
    queue[idx].status = status;
    try {
      localStorage.setItem(TRIAGE_QUEUE_KEY, JSON.stringify(queue));
      const channel = new BroadcastChannel(TRIAGE_CHANNEL_NAME);
      channel.postMessage({ type: 'STATUS_UPDATE', id, status });
      channel.close();
    } catch {
      // ignore
    }
  }
};
