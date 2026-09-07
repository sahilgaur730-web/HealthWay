/**
 * Clinical Symptom Triage Engine
 * HealthWay Native Mobile Platform - Feature 25
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

export const SYMPTOM_PATHWAYS: Record<
  SymptomPathwayKey,
  {
    nameEn: string;
    nameMr: string;
    nameHi: string;
    icon: string;
    options: SymptomOption[];
  }
> = {
  CHEST_PAIN: {
    nameEn: 'Chest Pain / Cardiac',
    nameMr: 'छातीत कळ / हृदय विकार',
    nameHi: 'सीने में दर्द / हृदय',
    icon: 'heartPulse',
    options: [
      {
        key: 'CHEST_PAIN_SEVERE',
        nameEn: 'Severe crushing chest pain radiating to left arm/jaw',
        nameMr: 'डाव्या हाताकडे जाणारी तीव्र छातीत कळ',
        nameHi: 'बाएं हाथ में फैलता गंभीर सीने का दर्द',
        severityDefault: 5,
        isRedFlag: true,
      },
      {
        key: 'CHEST_HEAVY',
        nameEn: 'Chest heaviness with sweating and cold clammy skin',
        nameMr: 'घाम व छातीवर प्रचंड जडपणा',
        nameHi: 'पसीने के साथ सीने में भारीपन',
        severityDefault: 4,
        isRedFlag: true,
      },
      {
        key: 'CHEST_DISCOMFORT',
        nameEn: 'Mild chest discomfort worsening with deep breath',
        nameMr: 'श्वास घेताना हलकी कळ',
        nameHi: 'सांस लेने पर हल्का दर्द',
        severityDefault: 2,
      },
    ],
  },
  HIGH_FEVER: {
    nameEn: 'High Fever / Infection',
    nameMr: 'तीव्र ताप / संसर्ग',
    nameHi: 'तेज बुखार / संक्रमण',
    icon: 'thermometer',
    options: [
      {
        key: 'FEVER_SEVERE',
        nameEn: 'High grade fever (>103°F) with rigors, chills, or altered sensorium',
        nameMr: '१०३°F पेक्षा जास्त ताप व प्रचंड हुडहुडी',
        nameHi: '103°F से अधिक बुखार और कंपकंपी',
        severityDefault: 4,
        isRedFlag: true,
      },
      {
        key: 'FEVER_MODERATE',
        nameEn: 'Fever lasting >3 days with severe headache and joint pain',
        nameMr: '३ दिवसांहून अधिक ताप, डोकेदुखी व सांधेदुखी',
        nameHi: '3 दिन से अधिक बुखार और जोड़ों में दर्द',
        severityDefault: 3,
      },
      {
        key: 'FEVER_MILD',
        nameEn: 'Mild low-grade fever with runny nose and mild fatigue',
        nameMr: 'हलका ताप, सर्दी व थकवा',
        nameHi: 'हल्का बुखार, जुकाम और थकान',
        severityDefault: 2,
      },
    ],
  },
  DYSPNEA: {
    nameEn: 'Breathing Difficulty / Respiratory',
    nameMr: 'श्वास घेण्यास त्रास / श्वसनविकार',
    nameHi: 'सांस लेने में तकलीफ',
    icon: 'lungs',
    options: [
      {
        key: 'RESPIRATORY_ARREST',
        nameEn: 'Severe respiratory distress, stridor, cyanosis (blue lips)',
        nameMr: 'श्वास घेण्यास तीव्र अडथळा व ओठ निळे पडणे',
        nameHi: 'गंभीर सांस की तकलीफ व होंठ नीले पड़ना',
        severityDefault: 5,
        isRedFlag: true,
      },
      {
        key: 'DYSPNEA_MODERATE',
        nameEn: 'Shortness of breath on mild exertion or wheezing',
        nameMr: 'किंचित चालल्यावर दम भरणे किंवा घरघर',
        nameHi: 'हल्का चलने पर सांस फूलना',
        severityDefault: 3,
      },
      {
        key: 'COUGH_PRODUCTIVE',
        nameEn: 'Persistent productive cough for 2+ weeks (TB screening)',
        nameMr: '२ आठवड्यांहून अधिक खोकला व कफ',
        nameHi: '2 सप्ताह से अधिक खांसी व बलगम',
        severityDefault: 2,
      },
    ],
  },
  ANTENATAL_COMPLICATIONS: {
    nameEn: 'Antenatal & Maternal Complications',
    nameMr: 'प्रसूतीपूर्व व माता आरोग्य धोके',
    nameHi: 'प्रसवपूर्व और मातृ जटिलताएं',
    icon: 'patient',
    options: [
      {
        key: 'ANC_BLEEDING',
        nameEn: 'Vaginal bleeding or fluid leakage in pregnancy',
        nameMr: 'गर्भधारणेदरम्यान रक्तस्त्राव किंवा पाणी जाणे',
        nameHi: 'गर्भावस्था में रक्तस्राव या पानी आना',
        severityDefault: 5,
        isRedFlag: true,
      },
      {
        key: 'ANC_SEIZURE',
        nameEn: 'Severe headache, blurred vision, or convulsions (Eclampsia)',
        nameMr: 'तीव्र डोकेदुखी, अंधुक दृष्टी किंवा झटके',
        nameHi: 'सिरदर्द, धुंधली दृष्टि या दौरे',
        severityDefault: 5,
        isRedFlag: true,
      },
      {
        key: 'ANC_REDUCED_MOVEMENT',
        nameEn: 'Decreased fetal movements in 3rd trimester',
        nameMr: 'गर्भाची हालचाल कमी जाणवणे',
        nameHi: 'गर्भ में बच्चे की हलचल कम होना',
        severityDefault: 3,
      },
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
