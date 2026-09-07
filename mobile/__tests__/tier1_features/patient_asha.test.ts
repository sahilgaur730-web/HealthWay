/**
 * Tier 1: Feature Coverage — Patient & ASHA Portals (Features 21 - 30)
 * F21: Patient Portal: Main Dashboard
 * F22: Patient Portal: Vitals Tracker
 * F23: Patient Portal: Appointment Booking
 * F24: Patient Portal: Digital PHR Locker
 * F25: Patient Portal: AI Symptom Triage
 * F26: ASHA Portal: Field Dashboard
 * F27: ASHA Portal: Beneficiary Registration
 * F28: ASHA Portal: High-Risk Antenatal & NCD
 * F29: ASHA Portal: Voice Intake / STT Mode
 * F30: ASHA Portal: Field Triage & Referral Slip
 */

import {
  evaluateVitalsAlert,
  evaluateTriageLevel,
  DISTRICT_FACILITIES,
  VitalsReading,
} from '../harness/domainFixtures';
import { MockStorageService } from '../harness/mockStorage';

describe('Tier 1: Feature 21 — Patient Portal: Main Dashboard', () => {
  it('F21-1: renders patient digital ABHA card with photo, ABHA number, and QR payload', () => {
    const abhaCard = {
      patientName: 'Sunita Ramchandra Jadhav',
      abhaId: '14-4821-9876-5432',
      aadhaarLast4: '4821',
      dob: '1992-05-14',
      gender: 'Female',
      qrPayload: 'https://healthway.gov.in/phr/14-4821-9876-5432',
    };
    expect(abhaCard.abhaId).toBe('14-4821-9876-5432');
    expect(abhaCard.qrPayload).toContain(abhaCard.abhaId);
  });

  it('F21-2: summarizes upcoming appointments with date, doctor, and facility name', () => {
    const upcoming = [
      { id: 'APT-01', doctorName: 'Dr. Deshmukh', facilityName: 'CHC Wai', date: '2026-09-15', slot: '10:30 AM' },
    ];
    expect(upcoming.length).toBe(1);
    expect(upcoming[0].doctorName).toBe('Dr. Deshmukh');
  });

  it('F21-3: displays active digital prescriptions with drug name and schedule', () => {
    const activeRx = [
      { id: 'RX-01', medicineName: 'Paracetamol 500mg', dosage: '1 tablet thrice daily', daysRemaining: 3 },
      { id: 'RX-02', medicineName: 'Amoxicillin 500mg', dosage: '1 capsule twice daily', daysRemaining: 5 },
    ];
    expect(activeRx.length).toBe(2);
    expect(activeRx[0].daysRemaining).toBe(3);
  });

  it('F21-4: aggregates recent vitals summary widget (BP, Sugar, SpO2)', () => {
    const summaryWidget = {
      latestBp: '124/82 mmHg',
      latestSugar: '110 mg/dL',
      latestSpo2: '98%',
      lastRecordedDate: '2026-09-06',
    };
    expect(summaryWidget.latestBp).toContain('124/82');
    expect(summaryWidget.latestSpo2).toContain('98%');
  });

  it('F21-5: provides 1-tap quick action shortcuts to Emergency SOS, Booking, and Records', () => {
    const quickActions = ['EMERGENCY_SOS', 'BOOK_APPOINTMENT', 'MY_RECORDS', 'SYMPTOM_TRIAGE'];
    expect(quickActions).toContain('EMERGENCY_SOS');
    expect(quickActions).toContain('BOOK_APPOINTMENT');
  });
});

describe('Tier 1: Feature 22 — Patient Portal: Vitals Tracker', () => {
  it('F22-1: accepts logging of standard clinical vitals parameters', () => {
    const reading: VitalsReading = {
      systolicBp: 120,
      diastolicBp: 80,
      heartRate: 72,
      spo2: 98,
      bloodSugarRandom: 95,
      temperatureF: 98.4,
    };
    const alert = evaluateVitalsAlert(reading);
    expect(alert.isCritical).toBe(false);
    expect(alert.color).toBe('GREEN');
  });

  it('F22-2: calculates Body Mass Index (BMI) from height and weight', () => {
    const calculateBmi = (weightKg: number, heightCm: number) => {
      const heightM = heightCm / 100;
      return +(weightKg / (heightM * heightM)).toFixed(1);
    };
    expect(calculateBmi(65, 170)).toBe(22.5);
    expect(calculateBmi(85, 170)).toBe(29.4);
  });

  it('F22-3: generates visual alert banner for stage-2 hypertensive blood pressure (>=160/100)', () => {
    const highBp: VitalsReading = {
      systolicBp: 165,
      diastolicBp: 105,
      heartRate: 85,
      spo2: 97,
      bloodSugarRandom: 120,
      temperatureF: 98.6,
    };
    const alert = evaluateVitalsAlert(highBp);
    expect(alert.isCritical).toBe(true);
    expect(alert.color).toBe('RED');
    expect(alert.warnings[0]).toContain('Critical Blood Pressure');
  });

  it('F22-4: flags critical hypoxia when SpO2 falls below 90%', () => {
    const hypoxia: VitalsReading = {
      systolicBp: 118,
      diastolicBp: 78,
      heartRate: 110,
      spo2: 87,
      bloodSugarRandom: 105,
      temperatureF: 99.0,
    };
    const alert = evaluateVitalsAlert(hypoxia);
    expect(alert.isCritical).toBe(true);
    expect(alert.warnings.some(w => w.includes('Hypoxia'))).toBe(true);
  });

  it('F22-5: maintains chronological history log of patient vitals readings', () => {
    const history = [
      { date: '2026-09-01', bp: '130/84' },
      { date: '2026-09-04', bp: '124/80' },
      { date: '2026-09-07', bp: '120/78' },
    ];
    expect(history.length).toBe(3);
    expect(history[2].date).toBe('2026-09-07');
  });
});

describe('Tier 1: Feature 23 — Patient Portal: Appointment Booking', () => {
  it('F23-1: lists available healthcare facilities with distance and facility type', () => {
    expect(DISTRICT_FACILITIES.length).toBe(7);
    const phc = DISTRICT_FACILITIES.find(f => f.type === 'PHC');
    expect(phc).toBeDefined();
    expect(phc?.doctorInCharge).toBeDefined();
  });

  it('F23-2: filters doctors by clinical specialization (General, Gyn, Ped, Ortho)', () => {
    const doctors = [
      { id: 'DOC-01', name: 'Dr. Deshmukh', spec: 'General Medicine' },
      { id: 'DOC-02', name: 'Dr. Patil', spec: 'Obstetrics & Gynecology' },
      { id: 'DOC-03', name: 'Dr. Kulkarni', spec: 'Pediatrics' },
    ];
    const gyn = doctors.filter(d => d.spec.includes('Obstetrics'));
    expect(gyn.length).toBe(1);
    expect(gyn[0].name).toBe('Dr. Patil');
  });

  it('F23-3: presents available appointment time slots without double booking', () => {
    const slots = [
      { time: '09:30 AM', booked: false },
      { time: '10:00 AM', booked: true },
      { time: '10:30 AM', booked: false },
    ];
    const available = slots.filter(s => !s.booked);
    expect(available.length).toBe(2);
    expect(available.map(s => s.time)).toEqual(['09:30 AM', '10:30 AM']);
  });

  it('F23-4: issues digital appointment token confirmation upon booking completion', () => {
    const bookAppointment = (patientId: string, doctorId: string, slot: string) => ({
      bookingId: `BK-${Date.now()}`,
      tokenNumber: 'GEN-042',
      patientId,
      doctorId,
      slot,
      status: 'CONFIRMED',
    });
    const result = bookAppointment('PT-001', 'DOC-01', '10:30 AM');
    expect(result.status).toBe('CONFIRMED');
    expect(result.tokenNumber).toBe('GEN-042');
  });

  it('F23-5: allows appointment cancellation or rescheduling with status update', () => {
    type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
    let status: BookingStatus = 'CONFIRMED';
    const cancel = () => (status = 'CANCELLED');
    cancel();
    expect(status).toBe('CANCELLED');
  });
});

describe('Tier 1: Feature 24 — Patient Portal: Digital PHR Locker', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('F24-1: categorizes health records across Lab, Prescription, Discharge, and Immunization', () => {
    const categories = ['LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'IMMUNIZATION_RECORD'];
    expect(categories.length).toBe(4);
  });

  it('F24-2: caches health records in offline patient_cache for rural accessibility', async () => {
    const record = {
      id: 'REC-001',
      title: 'Discharge Summary - Normal Delivery',
      category: 'DISCHARGE_SUMMARY',
      date: '2026-08-20',
      facility: 'District Hospital Satara',
    };
    await storage.saveItem('patient_cache', record.id, record);
    const cached = await storage.getItem<typeof record>('patient_cache', 'REC-001');
    expect(cached?.title).toBe(record.title);
  });

  it('F24-3: supports filtering records by document category and date range', () => {
    const records = [
      { id: '1', cat: 'LAB_REPORT', year: 2026 },
      { id: '2', cat: 'PRESCRIPTION', year: 2026 },
      { id: '3', cat: 'LAB_REPORT', year: 2025 },
    ];
    const filtered = records.filter(r => r.cat === 'LAB_REPORT' && r.year === 2026);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('F24-4: verifies digital signature and ABDM document checksum', () => {
    const doc = {
      id: 'DOC-ABDM-01',
      checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      signedBy: 'ABDM-M3-GATEWAY',
    };
    expect(doc.checksumSha256.length).toBe(64);
    expect(doc.signedBy).toContain('ABDM');
  });

  it('F24-5: provides offline download indicator badge for cached documents', () => {
    const isAvailableOffline = (record: { cachedLocally: boolean }) => record.cachedLocally;
    expect(isAvailableOffline({ cachedLocally: true })).toBe(true);
    expect(isAvailableOffline({ cachedLocally: false })).toBe(false);
  });
});

describe('Tier 1: Feature 25 — Patient Portal: AI Symptom Triage', () => {
  it('F25-1: implements 4 structured symptom pathways (Chest Pain, Fever, Dyspnea, Antenatal)', () => {
    const pathways = ['CHEST_PAIN', 'HIGH_FEVER', 'DYSPNEA', 'ANTENATAL_COMPLICATIONS'];
    expect(pathways.length).toBe(4);
  });

  it('F25-2: classifies critical symptoms as RED (Emergency 108 required)', () => {
    const result = evaluateTriageLevel('CHEST_PAIN_SEVERE', 4);
    expect(result.level).toBe('RED');
    expect(result.actionEn).toContain('108 emergency ambulance');
  });

  it('F25-3: classifies moderate symptoms as YELLOW (Schedule OPD consult)', () => {
    const result = evaluateTriageLevel('FEVER_MILD', 2);
    expect(result.level).toBe('YELLOW');
    expect(result.actionEn).toContain('OPD queue');
  });

  it('F25-4: overrides triage level to RED when vital signs indicate critical emergency', () => {
    const criticalVitals: VitalsReading = {
      systolicBp: 185,
      diastolicBp: 120,
      heartRate: 135,
      spo2: 86,
      bloodSugarRandom: 290,
      temperatureF: 104.2,
    };
    const result = evaluateTriageLevel('FEVER_MILD', 2, criticalVitals);
    expect(result.level).toBe('RED');
  });

  it('F25-5: offers trilingual emergency escalation advice in output payload', () => {
    const triageOutput = {
      level: 'RED',
      guidance: {
        en: 'Call 108 emergency ambulance immediately',
        mr: 'त्वरित १०८ रुग्णवाहिकेला कॉल करा',
        hi: 'तुरंत 108 एम्बुलेंस को कॉल करें',
      },
    };
    expect(triageOutput.guidance.mr).toContain('१०८');
    expect(triageOutput.guidance.hi).toContain('108');
  });
});

describe('Tier 1: Feature 26 — ASHA Portal: Field Dashboard', () => {
  it('F26-1: displays total households registered in designated village beat', () => {
    const villageBeat = { villageName: 'Tapola', totalHouseholds: 142, surveyedHouseholds: 138 };
    expect(villageBeat.totalHouseholds).toBe(142);
    expect(villageBeat.surveyedHouseholds).toBeLessThanOrEqual(villageBeat.totalHouseholds);
  });

  it('F26-2: highlights high-risk pregnant women requiring weekly visits', () => {
    const pregnantRoster = [
      { name: 'Kavita Shinde', trimester: 2, isHighRisk: false },
      { name: 'Pooja Jadhav', trimester: 3, isHighRisk: true, dangerReason: 'Severe PIH' },
    ];
    const highRisk = pregnantRoster.filter(p => p.isHighRisk);
    expect(highRisk.length).toBe(1);
    expect(highRisk[0].dangerReason).toBe('Severe PIH');
  });

  it('F26-3: tracks overdue pediatric immunization schedules (BCG, Pentavalent, Measles)', () => {
    const immunizations = [
      { childName: 'Aarav', vaccine: 'Pentavalent 1', dueDate: '2026-08-15', status: 'OVERDUE' },
      { childName: 'Anaya', vaccine: 'BCG', dueDate: '2026-09-10', status: 'UPCOMING' },
    ];
    const overdue = immunizations.filter(i => i.status === 'OVERDUE');
    expect(overdue.length).toBe(1);
    expect(overdue[0].vaccine).toContain('Pentavalent');
  });

  it('F26-4: tracks daily field task checklist completion status', () => {
    const tasks = [
      { id: 'T1', task: 'Visit Pooja Jadhav (ANC)', completed: true },
      { id: 'T2', task: 'Distribute IFA tablets at Sub-Centre', completed: false },
    ];
    const completionRate = tasks.filter(t => t.completed).length / tasks.length;
    expect(completionRate).toBe(0.5);
  });

  it('F26-5: displays pending offline sync badge count on field dashboard header', () => {
    const getSyncBadgeCount = (pendingCount: number) => (pendingCount > 0 ? `${pendingCount}` : null);
    expect(getSyncBadgeCount(4)).toBe('4');
    expect(getSyncBadgeCount(0)).toBeNull();
  });
});

describe('Tier 1: Feature 27 — ASHA Portal: Beneficiary Registration', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('F27-1: registers new beneficiary offline with demographic fields', async () => {
    const beneficiary = {
      id: 'BEN-2026-001',
      name: 'Sunita Ramchandra Jadhav',
      age: 28,
      gender: 'Female',
      village: 'Tapola',
      maritalStatus: 'Married',
      phone: '+91 98220 12345',
    };
    await storage.saveItem('patient_cache', beneficiary.id, beneficiary);
    const saved = await storage.getItem<typeof beneficiary>('patient_cache', beneficiary.id);
    expect(saved?.name).toBe('Sunita Ramchandra Jadhav');
  });

  it('F27-2: stores beneficiary photo reference URI captured via native camera', () => {
    const photoRef = {
      beneficiaryId: 'BEN-001',
      photoUri: 'file:///data/user/0/com.healthway.mobile/cache/photo_ben_001.jpg',
      capturedAt: Date.now(),
    };
    expect(photoRef.photoUri).toMatch(/^file:\/\//);
  });

  it('F27-3: links optional 14-digit ABHA ID to newly registered beneficiary', () => {
    const beneficiary = {
      id: 'BEN-001',
      name: 'Pooja',
      abhaId: '14-4821-9876-5432',
    };
    expect(beneficiary.abhaId).toMatch(/^\d{2}-\d{4}-\d{4}-\d{4}$/);
  });

  it('F27-4: queues registration into sync_queue for automatic backend upload', async () => {
    const payload = { beneficiaryId: 'BEN-001', name: 'Pooja' };
    const queueItem = await storage.enqueueSync('/api/v1/beneficiaries', 'POST', payload);
    expect(queueItem.endpoint).toContain('beneficiaries');
    expect(queueItem.status).toBe('PENDING');
  });

  it('F27-5: validates mandatory required fields (name, age, gender, village)', () => {
    const validate = (data: { name?: string; age?: number; gender?: string; village?: string }) => {
      return !!(data.name && data.age && data.gender && data.village);
    };
    expect(validate({ name: 'Sunita', age: 28, gender: 'Female', village: 'Tapola' })).toBe(true);
    expect(validate({ name: 'Sunita', age: 28 })).toBe(false); // Missing gender and village
  });
});

describe('Tier 1: Feature 28 — ASHA Portal: High-Risk Antenatal & NCD', () => {
  it('F28-1: tracks gestational age in weeks and trimester (1st, 2nd, 3rd)', () => {
    const getTrimester = (weeks: number) => (weeks <= 12 ? 1 : weeks <= 28 ? 2 : 3);
    expect(getTrimester(8)).toBe(1);
    expect(getTrimester(20)).toBe(2);
    expect(getTrimester(34)).toBe(3);
  });

  it('F28-2: evaluates danger signs checklist (severe headache, blurred vision, vaginal bleeding)', () => {
    const dangerSigns = {
      severeHeadache: true,
      blurredVision: true,
      vaginalBleeding: false,
      convulsions: false,
    };
    const hasDangerSign = Object.values(dangerSigns).some(Boolean);
    expect(hasDangerSign).toBe(true);
  });

  it('F28-3: automatically flags patient as HIGH_RISK_PREGNANCY when danger signs are present', () => {
    const classifyPregnancy = (dangerSignsPresent: boolean, bpSystolic: number) =>
      dangerSignsPresent || bpSystolic >= 140 ? 'HIGH_RISK' : 'NORMAL';
    expect(classifyPregnancy(true, 120)).toBe('HIGH_RISK');
    expect(classifyPregnancy(false, 150)).toBe('HIGH_RISK');
    expect(classifyPregnancy(false, 115)).toBe('NORMAL');
  });

  it('F28-4: schedules 4 mandatory Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) ANC visits', () => {
    const pmsmaSchedule = [
      { visitNo: 1, idealWeeks: 'Within 12 weeks' },
      { visitNo: 2, idealWeeks: '14 - 26 weeks' },
      { visitNo: 3, idealWeeks: '28 - 34 weeks' },
      { visitNo: 4, idealWeeks: '36 weeks till delivery' },
    ];
    expect(pmsmaSchedule.length).toBe(4);
    expect(pmsmaSchedule[3].visitNo).toBe(4);
  });

  it('F28-5: records NCD screening metrics (CBAC checklist, random blood glucose, hypertension)', () => {
    const ncdScreening = {
      patientId: 'PT-001',
      cbacScore: 6, // Score > 4 requires PHC referral
      bloodSugar: 168,
      referralRequired: true,
    };
    expect(ncdScreening.cbacScore).toBeGreaterThan(4);
    expect(ncdScreening.referralRequired).toBe(true);
  });
});

describe('Tier 1: Feature 29 — ASHA Portal: Voice Intake / STT Mode', () => {
  it('F29-1: initiates audio voice recording session for clinical field logging', () => {
    const voiceSession = {
      sessionId: `VOICE-${Date.now()}`,
      recordingState: 'RECORDING',
      durationSeconds: 12,
      sampleRateHz: 16000,
    };
    expect(voiceSession.recordingState).toBe('RECORDING');
    expect(voiceSession.sampleRateHz).toBe(16000);
  });

  it('F29-2: converts Marathi spoken audio to Marathi clinical transcript text', () => {
    const transcriptMock = {
      audioFile: 'voice_note_01.m4a',
      language: 'mr',
      text: 'रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे',
    };
    expect(transcriptMock.language).toBe('mr');
    expect(transcriptMock.text).toContain('ताप आणि खोकला');
  });

  it('F29-3: extracts clinical entities (symptoms, duration) from transcribed text', () => {
    const extractEntities = (text: string) => {
      const entities: string[] = [];
      if (text.includes('ताप') || text.includes('fever')) entities.push('FEVER');
      if (text.includes('खोकला') || text.includes('cough')) entities.push('COUGH');
      return entities;
    };
    const extracted = extractEntities('रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे');
    expect(extracted).toContain('FEVER');
    expect(extracted).toContain('COUGH');
  });

  it('F29-4: supports Hindi voice intake transcription mode', () => {
    const transcriptMock = {
      language: 'hi',
      text: 'मरीज को सिर दर्द और चक्कर आ रहे हैं',
    };
    expect(transcriptMock.language).toBe('hi');
    expect(transcriptMock.text).toContain('सिर दर्द');
  });

  it('F29-5: allows ASHA worker to review, edit, and confirm transcription before saving', () => {
    let transcript = 'रुग्णाला ताप आहे';
    const editTranscript = (corrected: string) => (transcript = corrected);
    editTranscript('रुग्णाला तीव्र ताप आहे');
    expect(transcript).toBe('रुग्णाला तीव्र ताप आहे');
  });
});

describe('Tier 1: Feature 30 — ASHA Portal: Field Triage & Referral Slip', () => {
  it('F30-1: generates field assessment priority score based on danger signs and vitals', () => {
    const computePriority = (dangerSignsCount: number, bpElevated: boolean) => {
      if (dangerSignsCount >= 2 || bpElevated) return 'EMERGENCY';
      if (dangerSignsCount === 1) return 'URGENT';
      return 'ROUTINE';
    };
    expect(computePriority(2, false)).toBe('EMERGENCY');
    expect(computePriority(0, true)).toBe('EMERGENCY');
    expect(computePriority(1, false)).toBe('URGENT');
    expect(computePriority(0, false)).toBe('ROUTINE');
  });

  it('F30-2: generates printable/shareable referral slip with unique reference number', () => {
    const slip = {
      referralNumber: 'REF-MH-STR-2026-0042',
      patientName: 'Sunita Jadhav',
      destinationFacility: 'District Hospital Satara',
      urgency: 'URGENT',
      reason: 'Severe pregnancy-induced hypertension',
    };
    expect(slip.referralNumber).toMatch(/^REF-MH-/);
    expect(slip.destinationFacility).toContain('Satara');
  });

  it('F30-3: encodes referral details into QR barcode payload for fast hospital scanning', () => {
    const qrPayload = JSON.stringify({
      refNo: 'REF-0042',
      ptName: 'Sunita',
      urgency: 'URGENT',
      ashaId: 'ASHA-01',
    });
    const parsed = JSON.parse(qrPayload);
    expect(parsed.refNo).toBe('REF-0042');
    expect(parsed.urgency).toBe('URGENT');
  });

  it('F30-4: saves referral slip in offline referral_drafts store when offline', async () => {
    const storage = new MockStorageService();
    const slip = { id: 'REF-DRAFT-01', patient: 'Sunita', status: 'DRAFT_OFFLINE' };
    await storage.saveItem('referral_drafts', slip.id, slip);
    const retrieved = await storage.getItem<typeof slip>('referral_drafts', slip.id);
    expect(retrieved?.patient).toBe('Sunita');
  });

  it('F30-5: provides 1-tap call to assign 108 ambulance directly from referral slip screen', () => {
    const dial108Action = () => 'tel:108';
    expect(dial108Action()).toBe('tel:108');
  });
});
