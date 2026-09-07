export type ReferralStage = 
  | 'CREATED'
  | 'NOTIFIED'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'REACHED'
  | 'ADMITTED'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'ELECTIVE';

export interface UrgencyConfig {
  level: UrgencyLevel;
  maxHours: number;
  labelMr: string;
  labelEn: string;
  badgeClass: string;
}

export const URGENCY_CONFIGS: Record<UrgencyLevel, UrgencyConfig> = {
  EMERGENCY: {
    level: 'EMERGENCY',
    maxHours: 2,
    labelMr: 'तात्काळ (Emergency <=२ तास)',
    labelEn: 'Emergency (<=2h)',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
  },
  URGENT: {
    level: 'URGENT',
    maxHours: 24,
    labelMr: 'तातडीचे (Urgent <=२४ तास)',
    labelEn: 'Urgent (<=24h)',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  ROUTINE: {
    level: 'ROUTINE',
    maxHours: 72,
    labelMr: 'नियमित (Routine <=७२ तास)',
    labelEn: 'Routine (<=72h)',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  ELECTIVE: {
    level: 'ELECTIVE',
    maxHours: 168,
    labelMr: 'नियोजित (Elective <=७ दिवस)',
    labelEn: 'Elective (<=7 days)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
};

export interface HospitalFacility {
  id: string;
  nameMr: string;
  nameEn: string;
  typeMr: string;
  typeEn: string;
  distanceKm: number;
  totalBeds: number;
  icuBedsAvailable: number;
  generalBedsAvailable: number;
  specialties: string[];
  ambulanceAvailable: boolean;
  ambulanceType: '108 ALS' | '108 BLS' | '102 Janani Express' | 'ALS & BLS';
  phone: string;
  address: string;
}

export const HOSPITALS_DIRECTORY: HospitalFacility[] = [
  {
    id: 'HOSP-01',
    nameMr: 'जिल्हा रुग्णालय औंध, पुणे',
    nameEn: 'District Hospital Aundh, Pune',
    typeMr: 'तृतीयक शासकीय रुग्णालय',
    typeEn: 'Tertiary District Hospital',
    distanceKm: 42,
    totalBeds: 350,
    icuBedsAvailable: 8,
    generalBedsAvailable: 45,
    specialties: [
      'स्त्रीरोग व प्रसूती (OBGYN)',
      'हृदयरोग (Cardiology)',
      'बालरोग (Pediatrics)',
      'जनरल सर्जरी (General Surgery)',
      'अस्थिव्यंग (Orthopedics)',
      'नेफ्रॉलॉजी (Nephrology)',
    ],
    ambulanceAvailable: true,
    ambulanceType: 'ALS & BLS',
    phone: '+91 20 2727 3400',
    address: 'औंध छावणी, पुणे - ४११०२७',
  },
  {
    id: 'HOSP-02',
    nameMr: 'ससून सर्वोपचार रुग्णालय व बी.जे. मेडिकल कॉलेज, पुणे',
    nameEn: 'Sassoon General Hospital & B.J. Medical College, Pune',
    typeMr: 'अतिविशेषोपचार वैद्यकीय महाविद्यालय रुग्णालय',
    typeEn: 'Apex Tertiary Medical College Hospital',
    distanceKm: 48,
    totalBeds: 1290,
    icuBedsAvailable: 22,
    generalBedsAvailable: 110,
    specialties: [
      'सर्व सुपर स्पेशालिटी (All Super-Specialties)',
      'कार्डिओलॉजी व सीटीव्हीएस (Cardiology & CTVS)',
      'न्यूरोसर्जरी (Neurosurgery)',
      'उच्च जोखीम प्रसूती (High-Risk Maternal Unit)',
      'NICU / PICU (नवजात अतिदक्षता)',
    ],
    ambulanceAvailable: true,
    ambulanceType: '108 ALS',
    phone: '+91 20 2612 8000',
    address: 'स्टेशन रोड, पुणे - ४११००१',
  },
  {
    id: 'HOSP-03',
    nameMr: 'उपजिल्हा रुग्णालय शिरूर',
    nameEn: 'Sub-District Hospital Shirur',
    typeMr: 'द्वितीयक उपजिल्हा रुग्णालय',
    typeEn: 'Sub-District Hospital',
    distanceKm: 3.5,
    totalBeds: 50,
    icuBedsAvailable: 3,
    generalBedsAvailable: 14,
    specialties: [
      'जनरल मेडिसिन (General Medicine)',
      'स्त्रीरोग व प्रसूती (OBGYN)',
      'बालरोग (Pediatrics)',
      'नेत्ररोग (Ophthalmology)',
    ],
    ambulanceAvailable: true,
    ambulanceType: '102 Janani Express',
    phone: '+91 2138 222108',
    address: 'नगर-पुणे महामार्ग, शिरूर - ४१२२१०',
  },
  {
    id: 'HOSP-04',
    nameMr: 'ग्रामीण रुग्णालय खेड',
    nameEn: 'Rural Hospital Khed',
    typeMr: 'ग्रामीण रुग्णालय',
    typeEn: 'Rural Hospital (FRU)',
    distanceKm: 14,
    totalBeds: 30,
    icuBedsAvailable: 2,
    generalBedsAvailable: 8,
    specialties: [
      'जनरल मेडिसिन (General Medicine)',
      'जनरल सर्जरी (General Surgery)',
      'स्त्रीरोग (Obstetrics)',
      'बालरोग (Pediatrics)',
    ],
    ambulanceAvailable: true,
    ambulanceType: '108 BLS',
    phone: '+91 2135 244100',
    address: 'चाकण चौक, राजगुरुनगर (खेड) - ४१०५०५',
  },
  {
    id: 'HOSP-05',
    nameMr: 'जिल्हा क्षयरोग केंद्र व छाती रुग्णालय, औंध',
    nameEn: 'District Tuberculosis Center & Chest Hospital, Aundh',
    typeMr: 'विशेष श्वसनरोग रुग्णालय',
    typeEn: 'Specialized Pulmonology & MDR-TB Hospital',
    distanceKm: 43,
    totalBeds: 100,
    icuBedsAvailable: 4,
    generalBedsAvailable: 28,
    specialties: [
      'श्वसनरोग (Pulmonology)',
      'MDR / XDR क्षयरोग (Drug-Resistant TB)',
      'थोरॅसिक मेडिसिन (Thoracic Medicine)',
    ],
    ambulanceAvailable: true,
    ambulanceType: '108 BLS',
    phone: '+91 20 2727 1822',
    address: 'औंध चेस्ट हॉस्पिटल कॅम्पस, पुणे - ४११०२७',
  },
];

export interface StageHistoryItem {
  stage: ReferralStage;
  timestamp: string;
  locationMr: string;
  locationEn: string;
  notesMr: string;
  notesEn: string;
}

export interface DoctorFeedbackData {
  id: string;
  receivingDoctorName: string;
  receivingHospital: string;
  specialty: string;
  date: string;
  outcomeStatus: 'ADMITTED' | 'OPD_TREATED' | 'TRANSFERRED' | 'DISCHARGED';
  finalDiagnosisMr: string;
  finalDiagnosisEn: string;
  treatmentSummaryMr: string;
  treatmentSummaryEn: string;
  counterReferralAdviceMr: string;
  counterReferralAdviceEn: string;
  followUpDate: string;
}

export interface ReminderEntry {
  id: string;
  timestamp: string;
  recipient: 'PATIENT' | 'ASHA' | 'HOSPITAL';
  recipientName: string;
  channel: 'SMS' | 'APP' | 'VOICE';
  messageMr: string;
  messageEn: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
}

export interface ReferralItem {
  id: string; // Token format: REF-YYYYMMDD-RANDOM
  patientId: string;
  patientNameMr: string;
  patientNameEn: string;
  patientPhone: string;
  patientVillage: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;

  referringFacilityMr: string;
  referringFacilityEn: string;
  referringDoctorMr: string;
  referringDoctorEn: string;

  targetHospitalId: string;
  targetHospitalNameMr: string;
  targetHospitalNameEn: string;
  departmentMr: string;
  departmentEn: string;

  urgency: UrgencyLevel;
  primaryReasonMr: string;
  primaryReasonEn: string;
  provisionalDiagnosis: string;
  vitalsSummary: {
    bp: string;
    pulse: string;
    spO2: string;
    sugar?: string;
  };

  transportNeeded: boolean;
  transportType?: '108_AMBULANCE' | '102_JANANI' | 'OWN_VEHICLE';
  transportStatus?: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    etaMinutes: number;
    liveStatusMr: string;
    liveStatusEn: string;
  };

  ashaEscortAssigned: boolean;
  ashaName?: string;
  ashaPhone?: string;

  stage: ReferralStage;
  createdAt: string; // ISO string
  updatedAt: string;
  stageHistory: StageHistoryItem[];

  isOverdue: boolean;
  overdueHours?: number;

  reminders: ReminderEntry[];
  feedback?: DoctorFeedbackData;
}

export const STAGES_ORDER: ReferralStage[] = [
  'CREATED',
  'NOTIFIED',
  'ACCEPTED',
  'IN_TRANSIT',
  'REACHED',
  'ADMITTED',
  'COMPLETED',
];

export const STAGE_CONFIGS: Record<ReferralStage, { labelMr: string; labelEn: string; stepNumber: number }> = {
  CREATED: { labelMr: 'नोंदणीकृत (Created)', labelEn: 'Token Created', stepNumber: 1 },
  NOTIFIED: { labelMr: 'एसएमएस पाठवला (Notified)', labelEn: 'Patient & ASHA Notified', stepNumber: 2 },
  ACCEPTED: { labelMr: 'रुग्णालयाने स्वीकारले (Accepted)', labelEn: 'Hospital Desk Accepted', stepNumber: 3 },
  IN_TRANSIT: { labelMr: 'वाहतुकीत (In Transit)', labelEn: 'In Transit / Dispatched', stepNumber: 4 },
  REACHED: { labelMr: 'रुग्णालयात पोहोचले (Reached)', labelEn: 'Reached Destination', stepNumber: 5 },
  ADMITTED: { labelMr: 'दाखल / तपासणी सुरू (Admitted)', labelEn: 'Admitted / In Consultation', stepNumber: 6 },
  COMPLETED: { labelMr: 'उपचार पूर्ण व फीडबॅक (Completed)', labelEn: 'Treatment Complete & Counter-Referral', stepNumber: 7 },
  OVERDUE: { labelMr: 'मुदत उलटून गेलेली (Overdue)', labelEn: 'Overdue Alert', stepNumber: 0 },
  CANCELLED: { labelMr: 'रद्द केले (Cancelled)', labelEn: 'Cancelled', stepNumber: -1 },
};

export function generateReferralToken(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REF-${dateStr}-${randomSuffix}`;
}

const STORAGE_KEY = 'hw_referrals_v1';

const INITIAL_REFERRALS: ReferralItem[] = [
  {
    id: 'REF-20240615-9102',
    patientId: 'PT-001',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    patientNameEn: 'Sunita Ramchandra Jadhav',
    patientPhone: '9822304912',
    patientVillage: 'वडगाव, शिरूर',
    patientAge: 28,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000001',

    referringFacilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    referringFacilityEn: 'Primary Health Centre Shirur',
    referringDoctorMr: 'डॉ. मीरा देशमुख (वैद्यकीय अधिकारी)',
    referringDoctorEn: 'Dr. Meera Deshmukh (MO, PHC Shirur)',

    targetHospitalId: 'HOSP-01',
    targetHospitalNameMr: 'जिल्हा रुग्णालय औंध, पुणे',
    targetHospitalNameEn: 'District Hospital Aundh, Pune',
    departmentMr: 'स्त्रीरोग व प्रसूती विभाग (OBGYN)',
    departmentEn: 'Department of Obstetrics & Gynecology (OBGYN)',

    urgency: 'URGENT',
    primaryReasonMr: '७वा महिना उच्च जोखीम गरोदरपण आणि तज्ञ डॉपलर सोनोग्राफी',
    primaryReasonEn: 'High-risk antenatal (7th month) with suspected intrauterine growth lag, requiring tertiary Doppler USG.',
    provisionalDiagnosis: 'High-Risk Pregnancy (O36.5) / Mild Anemia',
    vitalsSummary: {
      bp: '११८/७६ mmHg',
      pulse: '७६ bpm',
      spO2: '९९%',
      sugar: '९४ mg/dL',
    },

    transportNeeded: true,
    transportType: '102_JANANI',
    transportStatus: {
      vehicleNumber: 'MH-12-AH-8419',
      driverName: 'गजानन शिंदे (Gajanan Shinde)',
      driverPhone: '9890123450',
      etaMinutes: 18,
      liveStatusMr: 'रुग्णवाहिकेतून जिल्हा रुग्णालयाकडे प्रवास सुरू',
      liveStatusEn: 'Ambulance en route on Pune-Nagar Highway',
    },

    ashaEscortAssigned: true,
    ashaName: 'सुमन ताई पाटील (Suman Tai Patil)',
    ashaPhone: '9423180912',

    stage: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    stageHistory: [
      {
        stage: 'CREATED',
        timestamp: '१५ जून, स. १०:००',
        locationMr: 'PHC शिरूर',
        locationEn: 'PHC Shirur',
        notesMr: 'डॉक्टरांनी डिजिटल रेफरल स्लिप तयार केली.',
        notesEn: 'Digital referral initiated by Dr. Meera Deshmukh.',
      },
      {
        stage: 'NOTIFIED',
        timestamp: '१५ जून, स. १०:०२',
        locationMr: 'एसएमएस गेटवे',
        locationEn: 'SMS Gateway',
        notesMr: 'रुग्ण आणि आशा कार्यकर्तीला एसएमएस पाठवला.',
        notesEn: 'Automated SMS sent with token and 102 transport tracking.',
      },
      {
        stage: 'ACCEPTED',
        timestamp: '१५ जून, स. १०:४५',
        locationMr: 'जिल्हा रुग्णालय औंध',
        locationEn: 'District Hospital Aundh Desk',
        notesMr: 'स्त्रीरोग विभागाने केस स्वीकारली आणि वेळ निश्चित केली.',
        notesEn: 'OBGYN central coordinator confirmed bed and priority slot.',
      },
      {
        stage: 'IN_TRANSIT',
        timestamp: '१५ जून, दु. ०१:१५',
        locationMr: '१०२ जननी रुग्णवाहिका',
        locationEn: '102 Janani Ambulance',
        notesMr: 'आशा कार्यकर्त्यासह रुग्ण प्रवासात आहे.',
        notesEn: 'Patient departed from Vadgaon accompanied by ASHA escort.',
      },
    ],

    isOverdue: false,
    reminders: [
      {
        id: 'REM-01',
        timestamp: '१५ जून, स. १०:०५',
        recipient: 'PATIENT',
        recipientName: 'सुनीता जाधव',
        channel: 'SMS',
        messageMr: 'आपला रेफरल टोकन REF-20240615-9102 जिल्हा रुग्णालय पुणे येथे आरक्षित आहे. मोफत १०२ रुग्णवाहिका संपर्क: 9890123450.',
        messageEn: 'Your referral REF-20240615-9102 is booked at District Hospital Pune. 102 Driver: 9890123450.',
        status: 'DELIVERED',
      },
      {
        id: 'REM-02',
        timestamp: '१५ जून, दु. १२:००',
        recipient: 'ASHA',
        recipientName: 'सुमन ताई पाटील',
        channel: 'SMS',
        messageMr: 'स्मरणपत्र: सुनीता जाधव यांची जिल्हा रुग्णालयातील तपासणी आज दु. २:०० वाजता नियोजित आहे.',
        messageEn: 'Reminder: Sunita Jadhav scheduled for 2:00 PM at District Hospital Pune.',
        status: 'DELIVERED',
      },
    ],
  },
  {
    id: 'REF-20240612-8840',
    patientId: 'PT-002',
    patientNameMr: 'महादेव विठ्ठल पाटील',
    patientNameEn: 'Mahadev Vitthal Patil',
    patientPhone: '9822451001',
    patientVillage: 'वडगाव, शिरूर',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: 'MH-PN-24-00000002',

    referringFacilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    referringFacilityEn: 'Primary Health Centre Shirur',
    referringDoctorMr: 'डॉ. मीरा देशमुख',
    referringDoctorEn: 'Dr. Meera Deshmukh',

    targetHospitalId: 'HOSP-02',
    targetHospitalNameMr: 'ससून सर्वोपचार रुग्णालय, पुणे',
    targetHospitalNameEn: 'Sassoon General Hospital, Pune',
    departmentMr: 'हृदयरोग विभाग (Cardiology)',
    departmentEn: 'Department of Cardiology & Emergency ICCU',

    urgency: 'EMERGENCY',
    primaryReasonMr: 'अनियंत्रित मधुमेह (३८० mg/dL) आणि छातीत तीव्र कळ (ECG बदल)',
    primaryReasonEn: 'Acute coronary syndrome suspect with severe hyperglycaemia (380 mg/dL) & ST-T changes on ECG.',
    provisionalDiagnosis: 'Acute Coronary Syndrome / Severe Uncontrolled Diabetes',
    vitalsSummary: {
      bp: '१५०/९८ mmHg',
      pulse: '९२ bpm',
      spO2: '९७%',
      sugar: '३८० mg/dL',
    },

    transportNeeded: true,
    transportType: '108_AMBULANCE',
    transportStatus: {
      vehicleNumber: 'MH-12-EM-1088',
      driverName: 'सचिन गायकवाड (Sachin Gaikwad)',
      driverPhone: '9822119988',
      etaMinutes: 0,
      liveStatusMr: 'ससून आपत्कालीन विभागात यशस्वी दाखल',
      liveStatusEn: 'Completed drop to Sassoon Emergency Resuscitation',
    },

    ashaEscortAssigned: false,
    stage: 'COMPLETED',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    stageHistory: [
      {
        stage: 'CREATED',
        timestamp: '१२ जून, स. ०८:३०',
        locationMr: 'PHC शिरूर',
        locationEn: 'PHC Shirur',
        notesMr: 'तात्काळ आपत्कालीन रेफरल तयार केले.',
        notesEn: 'Emergency referral generated with STAT ECG alert.',
      },
      {
        stage: 'NOTIFIED',
        timestamp: '१२ जून, स. ०८:३२',
        locationMr: '१०८ कंट्रोल रूम',
        locationEn: '108 Emergency Control',
        notesMr: '१०८ ALS रुग्णवाहिका तात्काळ पाठवली.',
        notesEn: '108 Advanced Life Support ambulance dispatched.',
      },
      {
        stage: 'ACCEPTED',
        timestamp: '१२ जून, स. ०८:४०',
        locationMr: 'ससून हॉस्पिटल',
        locationEn: 'Sassoon ICCU Desk',
        notesMr: 'ICCU बेड आरक्षित करण्यात आला.',
        notesEn: 'ICCU emergency team prepared for triage.',
      },
      {
        stage: 'IN_TRANSIT',
        timestamp: '१२ जून, स. ०८:५०',
        locationMr: '१०८ रुग्णवाहिका',
        locationEn: '108 Ambulance en route',
        notesMr: 'ऑक्सिजन व मॉनिटरिंगसह जलद प्रवास.',
        notesEn: 'Oxygen and telemetry monitoring underway.',
      },
      {
        stage: 'REACHED',
        timestamp: '१२ जून, स. ०९:५५',
        locationMr: 'ससून आपत्कालीन विभाग',
        locationEn: 'Sassoon Emergency Gate',
        notesMr: 'रुग्ण कॅज्युअल्टीमध्ये पोहोचला.',
        notesEn: 'Arrived at Sassoon emergency casualty.',
      },
      {
        stage: 'ADMITTED',
        timestamp: '१२ जून, स. १०:१०',
        locationMr: 'ससून कॅथ लॅब / ICCU',
        locationEn: 'Sassoon Cath Lab / ICCU',
        notesMr: 'अँजिओग्राफी व इन्सुलिन ड्रिप सुरू.',
        notesEn: 'Coronary angiography and IV insulin stabilization initiated.',
      },
      {
        stage: 'COMPLETED',
        timestamp: '१४ जून, दु. ०४:००',
        locationMr: 'ससून डिस्चार्ज डेस्क',
        locationEn: 'Sassoon Discharge Counter',
        notesMr: 'तपासणी पूर्ण, डिस्चार्ज व PHC कडे फॉलो-अप शिफारस.',
        notesEn: 'Patient stabilized, discharged with counter-referral to PHC.',
      },
    ],

    isOverdue: false,
    reminders: [],
    feedback: {
      id: 'FB-001',
      receivingDoctorName: 'डॉ. अविनाश सावंत (MD, DM Cardiology)',
      receivingHospital: 'ससून सर्वोपचार रुग्णालय, पुणे',
      specialty: 'हृदयरोग व कॅथ लॅब (Cardiology)',
      date: '१४ जून २०२४',
      outcomeStatus: 'DISCHARGED',
      finalDiagnosisMr: 'तीव्र इस्केमिक हृदयरोग (Single Vessel Disease - LAD Stenosis) व प्रकार २ मधुमेह',
      finalDiagnosisEn: 'Unstable Angina / Single Vessel CAD (70% LAD stenosis managed medically) with uncontrolled Type 2 Diabetes.',
      treatmentSummaryMr: 'कोरोनरी अँजिओग्राफी करण्यात आली. वैद्यकीय व्यवस्थापन (Antiplatelets, Statin, Metformin + Glimepiride). प्रकृती स्थिर.',
      treatmentSummaryEn: 'Coronary angiography performed. Medical stabilization with dual antiplatelets, statin therapy, and adjusted insulin titration.',
      counterReferralAdviceMr: 'PHC शिरूरमध्ये आठवड्यातून एकदा ईसीजी व बीपी तपासणी. दर १५ दिवसांनी उपाशीपोटी रक्तातील साखर नोंदवावी.',
      counterReferralAdviceEn: 'Weekly BP check and 12-lead ECG review at PHC Shirur. Fasting blood sugar monitoring twice monthly.',
      followUpDate: '२८ जून २०२४',
    },
  },
  {
    id: 'REF-20240608-7719',
    patientId: 'PT-003',
    patientNameMr: 'रुक्मिणी बबन शिंदे',
    patientNameEn: 'Rukmini Baban Shinde',
    patientPhone: '9822890043',
    patientVillage: 'वडगाव, शिरूर',
    patientAge: 42,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000003',

    referringFacilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    referringFacilityEn: 'Primary Health Centre Shirur',
    referringDoctorMr: 'डॉ. मीरा देशमुख',
    referringDoctorEn: 'Dr. Meera Deshmukh',

    targetHospitalId: 'HOSP-05',
    targetHospitalNameMr: 'जिल्हा क्षयरोग केंद्र व छाती रुग्णालय, औंध',
    targetHospitalNameEn: 'District Tuberculosis Center & Chest Hospital, Aundh',
    departmentMr: 'श्वसनरोग विभाग (Pulmonology)',
    departmentEn: 'Pulmonology & GeneXpert Molecular Lab',

    urgency: 'ROUTINE',
    primaryReasonMr: 'MDR-TB संशय व जन-एक्स्पर्ट चाचणी तपासणी',
    primaryReasonEn: 'Suspected multidrug-resistant pulmonary tuberculosis follow-up, CBNAAT line-probe assay required.',
    provisionalDiagnosis: 'Pulmonary Tuberculosis (A15.0) - High Resistance Suspect',
    vitalsSummary: {
      bp: '११२/७२ mmHg',
      pulse: '८० bpm',
      spO2: '९६%',
      sugar: '१०४ mg/dL',
    },

    transportNeeded: false,
    ashaEscortAssigned: true,
    ashaName: 'छाया शिंदे (Chhaya Shinde)',
    ashaPhone: '9822001122',

    stage: 'COMPLETED',
    createdAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    stageHistory: [
      {
        stage: 'CREATED',
        timestamp: '०८ जून, स. ११:००',
        locationMr: 'PHC शिरूर',
        locationEn: 'PHC Shirur',
        notesMr: 'रेफरल सुरू केले.',
        notesEn: 'Referral initiated for second-line molecular assay.',
      },
      {
        stage: 'COMPLETED',
        timestamp: '०९ जून, दु. ०३:००',
        locationMr: 'DTC औंध',
        locationEn: 'DTC Aundh',
        notesMr: 'CBNAAT चाचणी पूर्ण, रिफाम्पिसिन संवेदनशील.',
        notesEn: 'CBNAAT confirmed Rifampicin Sensitive, Category 1 continued.',
      },
    ],
    isOverdue: false,
    reminders: [],
  },
  {
    id: 'REF-20240614-3319',
    patientId: 'PT-004',
    patientNameMr: 'राधाबाई नामदेव कदम',
    patientNameEn: 'Radhabai Namdev Kadam',
    patientPhone: '9420112890',
    patientVillage: 'वडगाव, शिरूर',
    patientAge: 64,
    patientGender: 'Female',
    abhaId: 'MH-PN-24-00000004',

    referringFacilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    referringFacilityEn: 'Primary Health Centre Shirur',
    referringDoctorMr: 'डॉ. मीरा देशमुख',
    referringDoctorEn: 'Dr. Meera Deshmukh',

    targetHospitalId: 'HOSP-01',
    targetHospitalNameMr: 'जिल्हा रुग्णालय औंध, पुणे',
    targetHospitalNameEn: 'District Hospital Aundh, Pune',
    departmentMr: 'नेत्ररोग विभाग (Ophthalmology)',
    departmentEn: 'Department of Ophthalmology',

    urgency: 'ELECTIVE',
    primaryReasonMr: 'दोन्ही डोळ्यांत मोतीबिंदू शस्त्रक्रिया नियोजन (Cataract Surgery)',
    primaryReasonEn: 'Bilateral mature senile cataract evaluation for Phacoemulsification surgery under NPCB.',
    provisionalDiagnosis: 'Senile Cataract Bilateral (H25.9)',
    vitalsSummary: {
      bp: '१३६/८४ mmHg',
      pulse: '७२ bpm',
      spO2: '९८%',
    },

    transportNeeded: false,
    ashaEscortAssigned: false,
    stage: 'ACCEPTED',
    createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
    stageHistory: [
      {
        stage: 'CREATED',
        timestamp: '१४ जून, स. ०९:३०',
        locationMr: 'PHC शिरूर',
        locationEn: 'PHC Shirur',
        notesMr: 'मोतीबिंदू तपासणीसाठी रेफरल तयार केले.',
        notesEn: 'Referral generated for elective cataract workup.',
      },
      {
        stage: 'ACCEPTED',
        timestamp: '१४ जून, दु. १२:००',
        locationMr: 'जिल्हा रुग्णालय नेत्र कक्ष',
        locationEn: 'District Hospital Eye OPD',
        notesMr: 'शस्त्रक्रियेची पूर्वतपासणी तारीख निश्चित.',
        notesEn: 'Pre-op cataract slot allocated.',
      },
    ],
    isOverdue: false,
    reminders: [],
  },
  {
    id: 'REF-20240616-1192',
    patientId: 'PT-005',
    patientNameMr: 'अनिकेत राहुल भोसले (बाळ)',
    patientNameEn: 'Aniket Rahul Bhosale (Infant)',
    patientPhone: '9850123901',
    patientVillage: 'वडगाव, शिरूर',
    patientAge: 1,
    patientGender: 'Male',
    abhaId: 'MH-PN-24-00000005',

    referringFacilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    referringFacilityEn: 'Primary Health Centre Shirur',
    referringDoctorMr: 'डॉ. मीरा देशमुख',
    referringDoctorEn: 'Dr. Meera Deshmukh',

    targetHospitalId: 'HOSP-01',
    targetHospitalNameMr: 'जिल्हा रुग्णालय औंध, पुणे',
    targetHospitalNameEn: 'District Hospital Aundh, Pune',
    departmentMr: 'बालरोग विभाग (Pediatrics - SNCU)',
    departmentEn: 'Department of Pediatrics & SNCU',

    urgency: 'EMERGENCY',
    primaryReasonMr: 'तीव्र ताप, श्वास घेण्यास अडचण आणि झटके (Febrile Seizure suspect)',
    primaryReasonEn: 'High fever, respiratory distress and suspected febrile convulsions in 1-year infant.',
    provisionalDiagnosis: 'Severe Acute Respiratory Infection (SARI) / Febrile Seizures',
    vitalsSummary: {
      bp: '—',
      pulse: '१३० bpm',
      spO2: '९१%',
    },

    transportNeeded: true,
    transportType: '108_AMBULANCE',
    transportStatus: {
      vehicleNumber: 'MH-12-EM-2290',
      driverName: 'संतोष मोरे (Santosh More)',
      driverPhone: '9822334455',
      etaMinutes: 12,
      liveStatusMr: 'रुग्णवाहिका बाळाच्या घराजवळ पोहोचत आहे',
      liveStatusEn: '108 Ambulance arriving at village pickup',
    },

    ashaEscortAssigned: true,
    ashaName: 'सुमन ताई पाटील',
    ashaPhone: '9423180912',

    stage: 'CREATED',
    // Created 3.5 hours ago for an EMERGENCY (threshold 2h) => OVERDUE!
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    stageHistory: [
      {
        stage: 'CREATED',
        timestamp: '३.५ तासांपूर्वी',
        locationMr: 'PHC शिरूर',
        locationEn: 'PHC Shirur',
        notesMr: 'तातडीचे आपत्कालीन रेफरल तयार केले.',
        notesEn: 'Emergency pediatric referral created.',
      },
    ],
    isOverdue: true,
    overdueHours: 1.5,
    reminders: [
      {
        id: 'REM-05',
        timestamp: '२ तासांपूर्वी',
        recipient: 'ASHA',
        recipientName: 'सुमन ताई पाटील',
        channel: 'SMS',
        messageMr: 'तातडीचा इशारा: बाळ अनिकेत भोसले यांचा रेफरल वेळ ओलांडला आहे. तात्काळ १०८ संपर्क साधा.',
        messageEn: 'URGENT: Aniket Bhosale referral overdue. Contact 108 immediately.',
        status: 'DELIVERED',
      },
    ],
  },
];

class ReferralService {
  private referrals: ReferralItem[] = [];

  constructor() {
    this.loadFromStorage();
    this.runOverdueCheck();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.referrals = JSON.parse(stored);
      } else {
        this.referrals = INITIAL_REFERRALS;
        this.saveToStorage();
      }
    } catch {
      this.referrals = INITIAL_REFERRALS;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.referrals));
    } catch {
      // storage unavailable fallback
    }
  }

  public runOverdueCheck(): void {
    const now = Date.now();
    let updated = false;

    this.referrals.forEach((ref) => {
      if (ref.stage === 'COMPLETED' || ref.stage === 'CANCELLED') {
        if (ref.isOverdue) {
          ref.isOverdue = false;
          ref.overdueHours = 0;
          updated = true;
        }
        return;
      }

      const urgencyCfg = URGENCY_CONFIGS[ref.urgency] || URGENCY_CONFIGS.ROUTINE;
      const createdTime = new Date(ref.createdAt).getTime();
      const elapsedHours = (now - createdTime) / (3600 * 1000);

      if (elapsedHours > urgencyCfg.maxHours) {
        const calculatedHours = Math.round((elapsedHours - urgencyCfg.maxHours) * 10) / 10;
        if (!ref.isOverdue || ref.overdueHours !== calculatedHours) {
          ref.isOverdue = true;
          ref.overdueHours = calculatedHours;
          updated = true;
        }
      } else {
        if (ref.isOverdue) {
          ref.isOverdue = false;
          ref.overdueHours = 0;
          updated = true;
        }
      }
    });

    if (updated) {
      this.saveToStorage();
    }
  }

  public getAllReferrals(): ReferralItem[] {
    this.runOverdueCheck();
    return [...this.referrals];
  }

  public getReferralById(id: string): ReferralItem | undefined {
    this.runOverdueCheck();
    const cleanId = id.trim().toUpperCase();
    return this.referrals.find((r) => r.id.toUpperCase() === cleanId);
  }

  public getReferralByToken(token: string): ReferralItem | undefined {
    return this.getReferralById(token);
  }

  public getReferralsByPatientId(patientId: string): ReferralItem[] {
    this.runOverdueCheck();
    return this.referrals.filter((r) => r.patientId === patientId);
  }

  public createReferral(data: Omit<ReferralItem, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory' | 'isOverdue' | 'reminders'>): ReferralItem {
    const token = generateReferralToken();
    const nowIso = new Date().toISOString();

    const initialHistoryItem: StageHistoryItem = {
      stage: 'CREATED',
      timestamp: 'आत्ता (Just now)',
      locationMr: data.referringFacilityMr,
      locationEn: data.referringFacilityEn,
      notesMr: `रेफरल टोकन ${token} यशस्वीरित्या तयार केले.`,
      notesEn: `Digital referral token ${token} generated.`,
    };

    const newRef: ReferralItem = {
      ...data,
      id: token,
      stage: 'CREATED',
      createdAt: nowIso,
      updatedAt: nowIso,
      stageHistory: [initialHistoryItem],
      isOverdue: false,
      reminders: [
        {
          id: `REM-${Date.now()}`,
          timestamp: 'आत्ता (Just now)',
          recipient: 'PATIENT',
          recipientName: data.patientNameMr,
          channel: 'SMS',
          messageMr: `आपला रेफरल टोकन ${token} तयार झाला आहे. रुग्णालय: ${data.targetHospitalNameMr}.`,
          messageEn: `Referral token ${token} generated for ${data.targetHospitalNameEn}.`,
          status: 'DELIVERED',
        },
      ],
    };

    this.referrals = [newRef, ...this.referrals];
    this.saveToStorage();
    return newRef;
  }

  public updateStage(
    referralId: string,
    newStage: ReferralStage,
    notesMr: string = '',
    notesEn: string = ''
  ): ReferralItem | null {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) return null;

    ref.stage = newStage;
    ref.updatedAt = new Date().toISOString();

    if (newStage === 'COMPLETED') {
      ref.isOverdue = false;
    }

    const newHistoryItem: StageHistoryItem = {
      stage: newStage,
      timestamp: 'आत्ता (Just now)',
      locationMr: ref.targetHospitalNameMr,
      locationEn: ref.targetHospitalNameEn,
      notesMr: notesMr || `टप्पा अपडेट: ${STAGE_CONFIGS[newStage]?.labelMr || newStage}`,
      notesEn: notesEn || `Stage updated to: ${STAGE_CONFIGS[newStage]?.labelEn || newStage}`,
    };

    ref.stageHistory.push(newHistoryItem);
    this.saveToStorage();
    return ref;
  }

  public addDoctorFeedback(referralId: string, feedback: Omit<DoctorFeedbackData, 'id' | 'date'>): ReferralItem | null {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) return null;

    ref.feedback = {
      ...feedback,
      id: `FB-${Date.now()}`,
      date: 'आज (Today)',
    };
    ref.stage = 'COMPLETED';
    ref.isOverdue = false;
    ref.updatedAt = new Date().toISOString();

    ref.stageHistory.push({
      stage: 'COMPLETED',
      timestamp: 'आज (Today)',
      locationMr: feedback.receivingHospital,
      locationEn: feedback.receivingHospital,
      notesMr: 'तज्ञ डॉक्टरांचा अभिप्राय व काऊंटर-रेफरल प्राप्त झाले.',
      notesEn: 'Specialist feedback and counter-referral synchronized with EHR.',
    });

    this.saveToStorage();
    return ref;
  }

  public triggerReminder(referralId: string, recipient: 'PATIENT' | 'ASHA' | 'HOSPITAL', customMsgMr?: string, customMsgEn?: string): ReminderEntry | null {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) return null;

    const recipientName = recipient === 'PATIENT' ? ref.patientNameMr : recipient === 'ASHA' ? (ref.ashaName || 'आशा कार्यकर्ती') : ref.targetHospitalNameMr;

    const reminder: ReminderEntry = {
      id: `REM-${Date.now()}`,
      timestamp: 'आत्ता (Just now)',
      recipient,
      recipientName,
      channel: 'SMS',
      messageMr: customMsgMr || `इशारा: रेफरल टोकन ${ref.id} ची स्थिती: ${STAGE_CONFIGS[ref.stage]?.labelMr}. कृपया तातडीने पाठपुरावा करा.`,
      messageEn: customMsgEn || `Alert: Referral token ${ref.id} status is ${STAGE_CONFIGS[ref.stage]?.labelEn}. Please take urgent action.`,
      status: 'DELIVERED',
    };

    ref.reminders.unshift(reminder);
    this.saveToStorage();
    return reminder;
  }

  public resetToDefaults(): void {
    this.referrals = INITIAL_REFERRALS;
    this.saveToStorage();
  }
}

export const referralService = new ReferralService();
