/**
 * Government Interoperability Standards, Profiles and Registry Definitions
 * Ayushman Bharat Digital Mission (ABDM v2.0) & HL7 FHIR R4 (4.0.1)
 * Strictly zero unicode emojis.
 */

export interface AbdmStandardsConfig {
  version: string;
  fhirVersion: string;
  terminologies: {
    SNOMED_CT: string;
    ICD_10: string;
    LOINC: string;
    RxNorm: string;
    ICD_11: string;
  };
  profiles: {
    ABHA_PROFILE: string;
    ENCOUNTER: string;
    OBSERVATION: string;
    CONDITION: string;
    MEDICATION_REQUEST: string;
    DIAGNOSTIC_REPORT: string;
    IMMUNIZATION: string;
    COMPOSITION: string;
  };
  endpoints: {
    SANDBOX: string;
    PRODUCTION: string;
    HIP: string;
    HIU: string;
  };
}

export const ABDM_STANDARDS: AbdmStandardsConfig = {
  version: 'ABDM v2.0',
  fhirVersion: 'R4 (4.0.1)',
  terminologies: {
    SNOMED_CT: 'http://snomed.info/sct',
    ICD_10: 'http://hl7.org/fhir/sid/icd-10',
    LOINC: 'http://loinc.org',
    RxNorm: 'http://www.nlm.nih.gov/research/umls/rxnorm',
    ICD_11: 'http://hl7.org/fhir/sid/icd-11'
  },
  profiles: {
    ABHA_PROFILE: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient',
    ENCOUNTER: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter',
    OBSERVATION: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation',
    CONDITION: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition',
    MEDICATION_REQUEST: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest',
    DIAGNOSTIC_REPORT: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReport',
    IMMUNIZATION: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Immunization',
    COMPOSITION: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Composition'
  },
  endpoints: {
    SANDBOX: 'https://dev.abdm.gov.in/gateway',
    PRODUCTION: 'https://live.abdm.gov.in/gateway',
    HIP: 'https://healthid.ndhm.gov.in',
    HIU: 'https://healthid.ndhm.gov.in'
  }
};

export interface FhirDocTypeDefinition {
  code: string;
  display: string;
  system: string;
  label: string;
  labelMr: string;
  iconName: 'Stethoscope' | 'Hospital' | 'Microscope' | 'Pill' | 'Syringe' | 'Sprout';
  descriptionEn: string;
  descriptionMr: string;
}

export const FHIR_DOCUMENT_TYPES: Record<string, FhirDocTypeDefinition> = {
  OPConsultation: {
    code: '371530004',
    display: 'Clinical consultation report',
    system: 'http://snomed.info/sct',
    label: 'OPD Consultation',
    labelMr: 'बाह्यरुग्ण तपासणी अहवाल',
    iconName: 'Stethoscope',
    descriptionEn: 'Summary for OPD visits, teleconsultations, and primary care encounters',
    descriptionMr: 'ओपीडी तपासणी, टेलिकन्सल्टेशन आणि प्राथमिक उपचारांचा वैद्यकीय गोषवारा'
  },
  DischargeSummary: {
    code: '373942005',
    display: 'Discharge summary',
    system: 'http://snomed.info/sct',
    label: 'Discharge Summary',
    labelMr: 'डिस्चार्ज सारांश',
    iconName: 'Hospital',
    descriptionEn: 'In-patient hospitalization summary, procedures, and discharge advice',
    descriptionMr: 'रुग्णालयातील भरती, उपचार प्रक्रिया आणि सुट्टीच्या वेळेस दिलेल्या सूचना'
  },
  DiagnosticReport: {
    code: '4241000179101',
    display: 'Diagnostic report',
    system: 'http://snomed.info/sct',
    label: 'Lab/Diagnostic Report',
    labelMr: 'प्रयोगशाळा / निदान अहवाल',
    iconName: 'Microscope',
    descriptionEn: 'Pathology, microbiology, biochemistry and imaging test results',
    descriptionMr: 'रक्त तपासणी, लघवी, एक्स-रे आणि इतर निदान चाचण्यांचे प्रमाणित अहवाल'
  },
  Prescription: {
    code: '440545006',
    display: 'Prescription record',
    system: 'http://snomed.info/sct',
    label: 'Prescription',
    labelMr: 'औषधोपचार चिठ्ठी',
    iconName: 'Pill',
    descriptionEn: 'Digital prescription with drug names, dosage, duration, and instructions',
    descriptionMr: 'डॉक्टरांनी दिलेली औषध योजना, डोस, दिवसांची संख्या आणि खाण्याच्या सूचना'
  },
  ImmunizationRecord: {
    code: '41000179103',
    display: 'Immunization record',
    system: 'http://snomed.info/sct',
    label: 'Vaccination Record',
    labelMr: 'लसीकरण नोंद',
    iconName: 'Syringe',
    descriptionEn: 'Universal Immunization Programme (UIP) and COVID-19 vaccination history',
    descriptionMr: 'राष्ट्रीय लसीकरण कार्यक्रम आणि इतर प्रतिबंधक लसींच्या नोंदी'
  },
  WellnessRecord: {
    code: '371531000',
    display: 'Report of clinical encounter',
    system: 'http://snomed.info/sct',
    label: 'Wellness Record',
    labelMr: 'आरोग्य व कल्याण नोंद',
    iconName: 'Sprout',
    descriptionEn: 'Preventive health checkups, vitals monitoring, and lifestyle metrics',
    descriptionMr: 'प्रतिबंधात्मक आरोग्य तपासणी, जीवनशैली आणि आरोग्य मानके'
  }
};

export interface ConsentPurposeDefinition {
  code: string;
  display: string;
  displayMr: string;
  description: string;
  descriptionMr: string;
}

export const CONSENT_PURPOSES: Record<string, ConsentPurposeDefinition> = {
  CARE_MANAGEMENT: {
    code: 'CAREMGT',
    display: 'Care Management',
    displayMr: 'उपचार व आरोग्य व्यवस्थापन',
    description: 'Access records for patient care and clinical treatment at this facility',
    descriptionMr: 'रुग्णाच्या प्रत्यक्ष वैद्यकीय उपचारांसाठी आरोग्य नोंदी पाहण्याची परवानगी'
  },
  SELF: {
    code: 'PATRQT',
    display: 'Patient Request',
    displayMr: 'रुग्ण स्वतःच्या वापरासाठी',
    description: 'Patient viewing or downloading own personal health records',
    descriptionMr: 'रुग्णाने स्वतःच्या आरोग्य नोंदी पाहणे किंवा डाउनलोड करणे'
  },
  RESEARCH: {
    code: 'HRESCH',
    display: 'Healthcare Research',
    displayMr: 'वैद्यकीय संशोधन व सर्वेक्षण',
    description: 'Anonymized aggregate health data for public health research',
    descriptionMr: 'सार्वजनिक आरोग्य संशोधनासाठी निनावी स्वरूपातील माहिती वापरणे'
  },
  BILLING: {
    code: 'COVERAGE',
    display: 'Insurance / Billing',
    displayMr: 'विमा व बिलिंग प्रक्रिया',
    description: 'Insurance claim verification and government scheme processing (MJPJAY)',
    descriptionMr: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना व विमा दाव्याच्या पडताळणीसाठी'
  }
};

export interface ExternalSystemDefinition {
  id: string;
  name: string;
  shortName: string;
  iconName: 'Building2' | 'BarChart2' | 'Baby' | 'Activity' | 'Syringe' | 'Heart' | 'Hospital';
  color: string;
  bgColor: string;
  description: string;
  descriptionMr: string;
  baseUrl: string;
  dataTypes: string[];
  reportingFrequency: string;
  reportingFrequencyMr: string;
  status: 'CONNECTED' | 'PENDING' | 'SYNCING';
  lastSync?: string;
  latencyMs?: number;
}

export const EXTERNAL_SYSTEMS: Record<string, ExternalSystemDefinition> = {
  NHM: {
    id: 'NHM',
    name: 'National Health Mission',
    shortName: 'NHM Portal',
    iconName: 'Building2',
    color: '#1E40AF',
    bgColor: '#DBEAFE',
    description: 'Central government health reporting and public health governance',
    descriptionMr: 'केंद्रीय व राज्य आरोग्य अभियान समन्वयन आणि कार्यक्रम अहवाल प्रणाली',
    baseUrl: 'https://nhm.gov.in/api',
    dataTypes: ['HMIS Reports', 'RCH Data', 'MCTS', 'ASHA Performance'],
    reportingFrequency: 'Monthly',
    reportingFrequencyMr: 'मासिक',
    status: 'CONNECTED',
    lastSync: '12 minutes ago',
    latencyMs: 42
  },
  HMIS: {
    id: 'HMIS',
    name: 'Health Management Information System',
    shortName: 'HMIS',
    iconName: 'BarChart2',
    color: '#059669',
    bgColor: '#D1FAE5',
    description: 'Hospital and health facility operational indicator reporting',
    descriptionMr: 'रुग्णालय व प्राथमिक आरोग्य केंद्र स्तरावरील मासिक कामकाज निर्देशांक',
    baseUrl: 'https://hmis.nhp.gov.in/api',
    dataTypes: ['OPD/IPD', 'Surgery', 'Beds', 'Staff Attendance'],
    reportingFrequency: 'Monthly',
    reportingFrequencyMr: 'मासिक',
    status: 'CONNECTED',
    lastSync: '8 minutes ago',
    latencyMs: 38
  },
  MCTS: {
    id: 'MCTS',
    name: 'Mother & Child Tracking System',
    shortName: 'MCTS/RCH',
    iconName: 'Baby',
    color: '#BE185D',
    bgColor: '#FCE7F3',
    description: 'Maternal and child health tracking with high-risk pregnancy surveillance',
    descriptionMr: 'माता आणि बाल आरोग्य संरक्षण, गरोदर महिला तपासणी व लसीकरण ट्रॅकिंग',
    baseUrl: 'https://mcts.nic.in/api',
    dataTypes: ['ANC Visits', 'Institutional Delivery', 'PNC Care', 'Child Immunization'],
    reportingFrequency: 'Real-time',
    reportingFrequencyMr: 'तात्काळ (रियल-टाइम)',
    status: 'CONNECTED',
    lastSync: '4 minutes ago',
    latencyMs: 29
  },
  NIKSHAY: {
    id: 'NIKSHAY',
    name: 'Nikshay — TB Notification System',
    shortName: 'Nikshay',
    iconName: 'Activity',
    color: '#059669',
    bgColor: '#D1FAE5',
    description: 'National TB case notification, treatment adherence and DBT Poshan tracking',
    descriptionMr: 'क्षयरोग रुग्ण नोंदणी, नियमित औषधोपचार पडताळणी आणि पोषण अनुदान ट्रॅकिंग',
    baseUrl: 'https://nikshay.in/api',
    dataTypes: ['TB Cases', 'DOTS Adherence', 'Treatment Outcome', 'Nikshay Poshan'],
    reportingFrequency: 'Real-time',
    reportingFrequencyMr: 'तात्काळ (रियल-टाइम)',
    status: 'CONNECTED',
    lastSync: 'Just now',
    latencyMs: 34
  },
  COWIN: {
    id: 'COWIN',
    name: 'Co-WIN Vaccination Platform',
    shortName: 'Co-WIN',
    iconName: 'Syringe',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    description: 'National vaccination management and digitally signed certificates',
    descriptionMr: 'राष्ट्रीय लसीकरण व्यवस्थापन आणि डिजिटल स्वाक्षरीयुक्त प्रमाणपत्रे',
    baseUrl: 'https://cdn-api.co-vin.in/api',
    dataTypes: ['Vaccination Records', 'Dose Verification', 'Certificates'],
    reportingFrequency: 'Real-time',
    reportingFrequencyMr: 'तात्काळ (रियल-टाइम)',
    status: 'CONNECTED',
    lastSync: '18 minutes ago',
    latencyMs: 51
  },
  NCD: {
    id: 'NCD',
    name: 'NCD Control Programme',
    shortName: 'NCD Portal',
    iconName: 'Heart',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    description: 'Non-communicable disease screening (Hypertension, Diabetes, Oral Cancer)',
    descriptionMr: 'अंसंसर्गजन्य रोग नियंत्रण (रक्तदाब, मधुमेह, कर्करोग तपासणी व नियंत्रण)',
    baseUrl: 'https://ncdportal.mohfw.gov.in/api',
    dataTypes: ['Hypertension', 'Diabetes', 'Cancer Screening', 'Lifestyle Advice'],
    reportingFrequency: 'Monthly',
    reportingFrequencyMr: 'मासिक',
    status: 'PENDING',
    lastSync: 'Pending Sync',
    latencyMs: 65
  },
  ABDM: {
    id: 'ABDM',
    name: 'Ayushman Bharat Digital Mission',
    shortName: 'ABDM Gateway',
    iconName: 'Hospital',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: 'National federated digital health network (ABHA, HIP, HIU, Health Locker)',
    descriptionMr: 'राष्ट्रीय डिजिटल आरोग्य परिसंस्था (ABHA ओळख, सुरक्षित आरोग्य माहिती देवाणघेवाण)',
    baseUrl: 'https://live.abdm.gov.in',
    dataTypes: ['ABHA ID', 'PHR Address', 'FHIR Bundles', 'Consent Artifacts'],
    reportingFrequency: 'Real-time',
    reportingFrequencyMr: 'तात्काळ (रियल-टाइम)',
    status: 'CONNECTED',
    lastSync: 'Active live',
    latencyMs: 25
  }
};
