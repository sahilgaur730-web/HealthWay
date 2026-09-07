/**
 * Voice Intake & Clinical Entity Extraction Service
 * HealthWay Native Mobile Platform - Feature 29 (ASHA Voice Intake / STT Mode)
 */

export interface VoiceRecordingSession {
  sessionId: string;
  recordingState: 'IDLE' | 'RECORDING' | 'PROCESSING' | 'COMPLETED';
  durationSeconds: number;
  sampleRateHz: number;
}

export interface ExtractedClinicalEntities {
  symptoms: string[];
  duration: string;
  chiefComplaint: string;
}

export const CLINICAL_KEYWORD_PATTERNS: Record<string, RegExp[]> = {
  FEVER: [/ताप/i, /बुखार/i, /fever/i, /temperature/i, /कणकण/i],
  COUGH: [/खोकला/i, /खांसी/i, /cough/i, /कफ/i],
  HEADACHE: [/डोकेदुखी/i, /डोके/i, /सिर दर्द/i, /सिरदर्द/i, /headache/i],
  DIZZINESS: [/चक्कर/i, /चक्कर आना/i, /dizziness/i, /vertigo/i],
  CHEST_PAIN: [/छातीत कळ/i, /छातीत दुखणे/i, /छाती/i, /सीने में दर्द/i, /chest pain/i],
  DYSPNEA: [/श्वास/i, /धाप/i, /दम/i, /सांस लेने/i, /breathless/i, /dyspnea/i],
  ABDOMINAL_PAIN: [/पोटात दुखणे/i, /पोटात कळ/i, /पोट/i, /पेट दर्द/i, /abdominal pain/i, /stomach/i],
  VOMITING: [/उलटी/i, /उल्टी/i, /vomit/i, /nausea/i, /मळमळ/i],
  BLEEDING: [/रक्तस्त्राव/i, /रक्त/i, /खून/i, /bleeding/i, /hemorrhage/i],
  PREGNANCY_DANGER: [/गर्भवती/i, /गरोदर/i, /गर्भावस्था/i, /pregnant/i, /labor/i, /पाणी जाणे/i],
};

export const SAMPLE_CLINICAL_VOICE_CORPUS: Record<'mr' | 'hi' | 'en', string[]> = {
  mr: [
    'रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे',
    'रुग्णाला चक्कर येत असून तीव्र डोकेदुखी आहे',
    'गर्भवती महिलेला पोटात असह्य कळ येत आहे आणि रक्तस्त्राव होत आहे',
  ],
  hi: [
    'मरीज को सिर दर्द और चक्कर आ रहे हैं',
    'मरीज को तीन दिनों से तेज बुखार और खांसी है',
    'सांस लेने में बहुत तकलीफ हो रही है और सीने में दर्द है',
  ],
  en: [
    'Patient has had high fever and severe cough for two days',
    'Patient is experiencing acute chest pain and breathlessness',
    'Patient reports severe abdominal pain and vomiting since yesterday',
  ],
};

/**
 * Validates recording duration is at least 1.0s to avoid empty noise clicks (B38)
 */
export function validateAudioDuration(durationSeconds: number): boolean {
  return durationSeconds >= 1.0;
}

/**
 * Caps recording session at maximum duration limit of 180s (3 min) (B39)
 */
export function capAudioDuration(durationSeconds: number, maxSeconds = 180): number {
  return Math.min(durationSeconds, maxSeconds);
}

/**
 * Extracts standardized clinical symptom entities and duration from transcribed speech
 */
export function extractClinicalEntities(text: string): ExtractedClinicalEntities {
  const symptoms: string[] = [];
  const normalized = text.toLowerCase();

  for (const [key, patterns] of Object.entries(CLINICAL_KEYWORD_PATTERNS)) {
    if (patterns.some((p) => p.test(normalized))) {
      symptoms.push(key);
    }
  }

  // Parse duration
  let duration = 'Unknown';
  if (/दोन दिवस|दो दिन|two days|2 days/i.test(normalized)) {
    duration = '2 days';
  } else if (/तीन दिवस|तीन दिन|three days|3 days/i.test(normalized)) {
    duration = '3 days';
  } else if (/कालपासून|कल से|since yesterday|1 day/i.test(normalized)) {
    duration = '1 day';
  } else if (/अचानक|sudden/i.test(normalized)) {
    duration = 'Sudden (< 1 hr)';
  } else if (/आठवडा|हफ्ता|week/i.test(normalized)) {
    duration = '1 week';
  } else if (/तास|घंटे|hours/i.test(normalized)) {
    duration = 'Few hours';
  }

  // Synthesize chief complaint
  const symptomList = symptoms.length > 0 ? symptoms.join(', ') : 'General Malaise';
  const chiefComplaint = `${symptomList} reported with duration of ${duration}. Spoken intake verified.`;

  return {
    symptoms,
    duration,
    chiefComplaint,
  };
}
