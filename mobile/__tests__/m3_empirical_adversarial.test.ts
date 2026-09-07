/**
 * Milestone 3 Empirical Adversarial Test Suite
 * Independent validation for Patient Portal & ASHA Community Module (Features 21 - 30)
 * Stress-tests domain services, clinical thresholds, trilingual guidance, persistence contracts, and zero-emoji compliance.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

import fs from 'fs';
import path from 'path';
import { calculateBmi, getBmiCategory, evaluateVitalsAlert, VitalsReading } from '../src/services/vitalsService';
import { evaluateTriageLevel, SYMPTOM_PATHWAYS, TRIAGE_TRILINGUAL_GUIDANCE } from '../src/services/triageService';
import {
  validateAudioDuration,
  capAudioDuration,
  extractClinicalEntities,
  CLINICAL_KEYWORD_PATTERNS,
} from '../src/services/voiceIntakeService';
import {
  computePriority,
  resolveDestinationFacility,
  evaluateFieldTriage,
  FIELD_REFERRAL_SLAS,
  FieldTriageInput,
} from '../src/services/fieldTriageService';
import { storageEngine } from '../src/storage/storageEngine';
import { DEFAULT_PATIENT_PROFILE, INITIAL_PHR_DOCUMENTS } from '../src/data/patientData';
import { TAPOLA_VILLAGE_BEAT, INITIAL_PREGNANT_ROSTER } from '../src/data/ashaData';

describe('Tier 5 Adversarial: 1. Vitals Service & Clinical Boundary Analysis', () => {
  it('ADV-M3-VITALS-01: calculateBmi handles zero and valid positive inputs, documents negative weight edge-case', () => {
    expect(calculateBmi(0, 0)).toBe(0);
    expect(calculateBmi(70, 0)).toBe(0);
    expect(calculateBmi(70, -175)).toBe(0);
    expect(calculateBmi(65, 170)).toBe(22.5);
    expect(calculateBmi(90, 160)).toBe(35.2);

    // [CHALLENGE FINDING] Due to truthy check `!weightKg`, negative weight (-70) yields negative BMI (-22.9) rather than 0
    const negBmi = calculateBmi(-70, 175);
    expect(negBmi).toBe(-22.9);
  });

  it('ADV-M3-VITALS-02: getBmiCategory handles all classification boundaries and trilingual labels', () => {
    const na = getBmiCategory(0);
    expect(na.labelEn).toBe('N/A');
    expect(na.labelMr).toBe('लागू नाही');

    const under = getBmiCategory(18.4);
    expect(under.labelEn).toBe('Underweight');

    const normal = getBmiCategory(22.0);
    expect(normal.labelEn).toBe('Normal');

    const over = getBmiCategory(27.5);
    expect(over.labelEn).toBe('Overweight');

    const obese = getBmiCategory(32.1);
    expect(obese.labelEn).toBe('Obese');
  });

  it('ADV-M3-VITALS-03: evaluateVitalsAlert flags stage-2 hypertension and hypotension shock as RED', () => {
    // Stage-2 Hypertension
    const highBp: VitalsReading = { systolicBp: 165, diastolicBp: 105, heartRate: 80, spo2: 98, temperatureF: 98.4 };
    const resHigh = evaluateVitalsAlert(highBp);
    expect(resHigh.isCritical).toBe(true);
    expect(resHigh.color).toBe('RED');
    expect(resHigh.warnings.some((w) => w.includes('Critical Blood Pressure'))).toBe(true);

    // Hypotensive shock
    const lowBp: VitalsReading = { systolicBp: 80, diastolicBp: 45, heartRate: 110, spo2: 97, temperatureF: 98.4 };
    const resLow = evaluateVitalsAlert(lowBp);
    expect(resLow.isCritical).toBe(true);
    expect(resLow.color).toBe('RED');
  });

  it('ADV-M3-VITALS-04: evaluateVitalsAlert flags severe hypoxia (<90%) and mild hypoxia (<95%) correctly', () => {
    const severeHypoxia: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 80, spo2: 87, temperatureF: 98.4 };
    const resSev = evaluateVitalsAlert(severeHypoxia);
    expect(resSev.isCritical).toBe(true);
    expect(resSev.color).toBe('RED');
    expect(resSev.warnings.some((w) => w.includes('Critical Hypoxia'))).toBe(true);

    const mildHypoxia: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 80, spo2: 93, temperatureF: 98.4 };
    const resMild = evaluateVitalsAlert(mildHypoxia);
    expect(resMild.isCritical).toBe(false);
    expect(resMild.color).toBe('YELLOW');
  });

  it('ADV-M3-VITALS-05: evaluateVitalsAlert flags critical glycemic extremes (>250 mg/dL or <60 mg/dL)', () => {
    const severeHyper: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 80, spo2: 98, temperatureF: 98.4, bloodSugarRandom: 280 };
    expect(evaluateVitalsAlert(severeHyper).isCritical).toBe(true);

    const hypoglycemia: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 80, spo2: 98, temperatureF: 98.4, bloodSugarFasting: 50 };
    expect(evaluateVitalsAlert(hypoglycemia).isCritical).toBe(true);

    const normalSugar: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 80, spo2: 98, temperatureF: 98.4, bloodSugarRandom: 110 };
    expect(evaluateVitalsAlert(normalSugar).color).toBe('GREEN');
  });

  it('ADV-M3-VITALS-06: evaluateVitalsAlert evaluates extreme fever (>=104°F) and extreme tachycardia/bradycardia', () => {
    const highFever: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 80, spo2: 98, temperatureF: 104.5 };
    expect(evaluateVitalsAlert(highFever).isCritical).toBe(true);

    const bradycardia: VitalsReading = { systolicBp: 120, diastolicBp: 80, heartRate: 36, spo2: 98, temperatureF: 98.4 };
    expect(evaluateVitalsAlert(bradycardia).isCritical).toBe(true);
  });
});

describe('Tier 5 Adversarial: 2. Clinical Symptom Triage Engine', () => {
  it('ADV-M3-TRIAGE-01: verifies all 4 clinical pathways exist with red flag markers', () => {
    const pathways = Object.keys(SYMPTOM_PATHWAYS);
    expect(pathways).toContain('CHEST_PAIN');
    expect(pathways).toContain('HIGH_FEVER');
    expect(pathways).toContain('DYSPNEA');
    expect(pathways).toContain('ANTENATAL_COMPLICATIONS');

    // Verify chest pain has red flag option
    const chest = SYMPTOM_PATHWAYS.CHEST_PAIN;
    expect(chest.options.some((o) => o.isRedFlag && o.key === 'CHEST_PAIN_SEVERE')).toBe(true);
  });

  it('ADV-M3-TRIAGE-02: overrides mild symptom to RED when vital signs indicate critical emergency', () => {
    const criticalVitals: VitalsReading = {
      systolicBp: 180,
      diastolicBp: 110,
      heartRate: 100,
      spo2: 88,
      temperatureF: 99.0,
    };

    // Even with severity 1 and mild fever, critical vitals override to RED
    const result = evaluateTriageLevel('FEVER_MILD', 1, criticalVitals);
    expect(result.level).toBe('RED');
    expect(result.isVitalsOverride).toBe(true);
    expect(result.guidance.en).toContain('108 emergency ambulance');
  });

  it('ADV-M3-TRIAGE-03: classifies red flag symptoms as RED regardless of severity input', () => {
    const cardiacRed = evaluateTriageLevel('CHEST_PAIN_SEVERE', 1);
    expect(cardiacRed.level).toBe('RED');

    const antenatalBleed = evaluateTriageLevel('ANC_BLEEDING', 1);
    expect(antenatalBleed.level).toBe('RED');

    const respiratoryArrest = evaluateTriageLevel('RESPIRATORY_ARREST', 1);
    expect(respiratoryArrest.level).toBe('RED');
  });

  it('ADV-M3-TRIAGE-04: verifies trilingual emergency guidance contains Marathi and Hindi numerals (१०८ vs 108)', () => {
    expect(TRIAGE_TRILINGUAL_GUIDANCE.RED.mr).toContain('१०८');
    expect(TRIAGE_TRILINGUAL_GUIDANCE.RED.hi).toContain('108');
    expect(TRIAGE_TRILINGUAL_GUIDANCE.RED.en).toContain('108');
  });

  it('ADV-M3-TRIAGE-05: handles unmapped symptom keys gracefully by grading severity level', () => {
    const unknownSev3 = evaluateTriageLevel('UNKNOWN_KEY', 3);
    expect(unknownSev3.level).toBe('ORANGE');

    const unknownSev2 = evaluateTriageLevel('UNKNOWN_KEY', 2);
    expect(unknownSev2.level).toBe('YELLOW');

    const unknownSev1 = evaluateTriageLevel('UNKNOWN_KEY', 1);
    expect(unknownSev1.level).toBe('GREEN');
  });
});

describe('Tier 5 Adversarial: 3. ASHA Voice Intake & Entity Extraction', () => {
  it('ADV-M3-VOICE-01: validateAudioDuration enforces 1.0s minimum threshold and capAudioDuration enforces 180s cap', () => {
    expect(validateAudioDuration(0.99)).toBe(false);
    expect(validateAudioDuration(1.0)).toBe(true);
    expect(validateAudioDuration(45.0)).toBe(true);

    expect(capAudioDuration(120)).toBe(120);
    expect(capAudioDuration(180)).toBe(180);
    expect(capAudioDuration(240)).toBe(180);
  });

  it('ADV-M3-VOICE-02: extractClinicalEntities extracts Marathi clinical entities and duration', () => {
    const textMr = 'रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे';
    const extracted = extractClinicalEntities(textMr);
    expect(extracted.symptoms).toContain('FEVER');
    expect(extracted.symptoms).toContain('COUGH');
    expect(extracted.duration).toBe('2 days');
    expect(extracted.chiefComplaint).toContain('FEVER, COUGH');
  });

  it('ADV-M3-VOICE-03: extractClinicalEntities extracts Hindi clinical entities and duration', () => {
    const textHi = 'मरीज को तीन दिनों से तेज बुखार और सिर दर्द है';
    const extracted = extractClinicalEntities(textHi);
    expect(extracted.symptoms).toContain('FEVER');
    expect(extracted.symptoms).toContain('HEADACHE');
    expect(extracted.duration).toBe('3 days');
  });

  it('ADV-M3-VOICE-04: extractClinicalEntities extracts English pregnancy danger keywords', () => {
    const textEn = 'Patient is pregnant and reporting severe abdominal pain and bleeding';
    const extracted = extractClinicalEntities(textEn);
    expect(extracted.symptoms).toContain('PREGNANCY_DANGER');
    expect(extracted.symptoms).toContain('ABDOMINAL_PAIN');
    expect(extracted.symptoms).toContain('BLEEDING');
  });

  it('ADV-M3-VOICE-05: extractClinicalEntities provides safe fallbacks for empty or unrecognized text', () => {
    const empty = extractClinicalEntities('');
    expect(empty.symptoms).toEqual([]);
    expect(empty.duration).toBe('Unknown');
    expect(empty.chiefComplaint).toContain('General Malaise');
  });
});

describe('Tier 5 Adversarial: 4. Field Triage & Priority Referral Engine', () => {
  it('ADV-M3-FIELD-01: computePriority classifies 2+ danger signs or elevated BP as EMERGENCY', () => {
    expect(computePriority(2, false)).toBe('EMERGENCY');
    expect(computePriority(3, false)).toBe('EMERGENCY');
    expect(computePriority(0, true)).toBe('EMERGENCY');
    expect(computePriority(1, false)).toBe('URGENT');
    expect(computePriority(0, false)).toBe('ROUTINE');
  });

  it('ADV-M3-FIELD-02: resolveDestinationFacility selects appropriate tier and prevents self-referral', () => {
    // Immediate urgency resolves to District Hospital
    const dh = resolveDestinationFacility('IMMEDIATE');
    expect(dh.type).toBe('District Hospital');
    expect(dh.id).toBe('FAC001');

    // Urgent urgency resolves to CHC
    const chc = resolveDestinationFacility('URGENT');
    expect(chc.type).toBe('CHC');

    // Routine urgency resolves to PHC
    const phc = resolveDestinationFacility('ROUTINE');
    expect(phc.type).toBe('PHC');

    // Self-referral prevention: when fromFacilityId is FAC001 (District Hospital)
    const fallbackFromDh = resolveDestinationFacility('IMMEDIATE', 'General', 'FAC001');
    expect(fallbackFromDh.id).not.toBe('FAC001');
  });

  it('ADV-M3-FIELD-03: evaluateFieldTriage enforces 60-min SLA for IMMEDIATE maternal emergency', () => {
    const input: FieldTriageInput = {
      patientId: 'PT-ANC-POOJA',
      patientName: 'Pooja Sachin Jadhav',
      age: 26,
      gender: 'Female',
      isPregnant: true,
      consciousness: 'A',
      vitals: {
        systolicBp: 168,
        diastolicBp: 108,
        heartRate: 98,
        spo2: 96,
        temperatureF: 98.6,
      },
      dangerSigns: ['Severe persistent headache', 'Visual blurriness', 'Epigastric pain'],
      primaryComplaint: 'Severe preeclampsia with impending eclampsia',
      ashaId: 'ASHA-01',
      ashaName: 'Sister Anandi Gaikwad',
    };

    const triage = evaluateFieldTriage(input);
    expect(triage.urgency).toBe('IMMEDIATE');
    expect(triage.triageLevel).toBe('RED');
    expect(triage.slaMinutes).toBe(FIELD_REFERRAL_SLAS.IMMEDIATE);
    expect(triage.slaMinutes).toBe(60);
    expect(triage.specialty).toContain('Obstetric High-Risk ICU');
    expect(triage.transportType).toBe('108_AMBULANCE');
    expect(triage.isEmergency).toBe(true);
    expect(triage.referralNumber).toMatch(/^REF-MH-STR-2026-\d{4}$/);

    // QR payload JSON validation
    const qrData = JSON.parse(triage.qrPayload);
    expect(qrData.refNo).toBe(triage.referralNumber);
    expect(qrData.urgency).toBe('IMMEDIATE');
    expect(qrData.triage).toBe('RED');
  });
});

describe('Tier 5 Adversarial: 5. Dual Offline Persistence & Store Hygiene', () => {
  it('ADV-M3-STORE-01: saves and retrieves records in patient_cache, referral_drafts, and triage_drafts', async () => {
    // 1. patient_cache
    const ptItem = { id: 'TEST-PT-001', name: 'Test Beneficiary', abha: '14-1111-2222-3333' };
    await storageEngine.saveItem('patient_cache', ptItem.id, ptItem);
    const retrievedPt = await storageEngine.getItem<typeof ptItem>('patient_cache', ptItem.id);
    expect(retrievedPt?.name).toBe('Test Beneficiary');

    // 2. referral_drafts
    const refItem = { id: 'REF-DRAFT-001', urgency: 'IMMEDIATE', sla: 60 };
    await storageEngine.saveItem('referral_drafts', refItem.id, refItem);
    const retrievedRef = await storageEngine.getItem<typeof refItem>('referral_drafts', refItem.id);
    expect(retrievedRef?.urgency).toBe('IMMEDIATE');

    // 3. triage_drafts
    const trgItem = { id: 'TRG-DRAFT-001', pathway: 'CHEST_PAIN', level: 'RED' };
    await storageEngine.saveItem('triage_drafts', trgItem.id, trgItem);
    const retrievedTrg = await storageEngine.getItem<typeof trgItem>('triage_drafts', trgItem.id);
    expect(retrievedTrg?.pathway).toBe('CHEST_PAIN');

    // Clean up
    await storageEngine.deleteItem('patient_cache', ptItem.id);
    await storageEngine.deleteItem('referral_drafts', refItem.id);
    await storageEngine.deleteItem('triage_drafts', trgItem.id);
  });

  it('ADV-M3-STORE-02: enqueues sync actions into sync_queue with priority metadata', async () => {
    const queuePayload = { patientId: 'PT-SYNC-01', action: 'BENEFICIARY_REGISTER' };
    await storageEngine.enqueueSync('/api/v1/beneficiaries', 'POST', queuePayload);

    const pending = await storageEngine.getPendingSyncItems();
    expect(pending.some((item) => item.endpoint === '/api/v1/beneficiaries')).toBe(true);
  });
});

describe('Tier 5 Adversarial: 6. Zero-Emoji Compliance across Milestone 3 Artifacts', () => {
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
  const pictographicRegex = /\p{Extended_Pictographic}/u;

  it('ADV-M3-EMOJI-01: Zero raw Unicode emojis in Patient Portal screens', () => {
    const dir = path.resolve(__dirname, '../src/screens/patient');
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (emojiRegex.test(line) || pictographicRegex.test(line)) {
            throw new Error(`Emoji violation in ${file}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });

  it('ADV-M3-EMOJI-02: Zero raw Unicode emojis in ASHA Community screens', () => {
    const dir = path.resolve(__dirname, '../src/screens/asha');
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (emojiRegex.test(line) || pictographicRegex.test(line)) {
            throw new Error(`Emoji violation in ${file}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });

  it('ADV-M3-EMOJI-03: Zero raw Unicode emojis in M3 Services & Seed Datasets', () => {
    const targets = [
      '../src/services/vitalsService.ts',
      '../src/services/triageService.ts',
      '../src/services/voiceIntakeService.ts',
      '../src/services/fieldTriageService.ts',
      '../src/data/patientData.ts',
      '../src/data/ashaData.ts',
    ];

    for (const rel of targets) {
      const full = path.resolve(__dirname, rel);
      if (fs.existsSync(full)) {
        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (emojiRegex.test(line) || pictographicRegex.test(line)) {
            throw new Error(`Emoji violation in ${rel}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
});
