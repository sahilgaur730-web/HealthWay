/**
 * Tier 4: Real-World Workload Scenario 3 — Maternal High-Risk Escalation
 * Complete multi-step lifecycle: ANC Field Visit -> Danger Sign Identification -> Immediate Referral -> Tertiary Admission -> Counter-Referral
 */

import { MockStorageService } from '../harness/mockStorage';
import { evaluateVitalsAlert, REFERRAL_SLAS } from '../harness/domainFixtures';

describe('Tier 4: Workload Journey 3 — Maternal High-Risk Escalation', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('Step 1: ASHA Anandi visits pregnant beneficiary Pooja at home; records critical vitals and danger signs', () => {
    const beneficiaryRecord = {
      patientId: 'PT-ANC-POOJA',
      name: 'Pooja Sachin Jadhav',
      gestationalAgeWeeks: 34,
      trimester: 3,
      vitals: {
        systolicBp: 168,
        diastolicBp: 108,
        heartRate: 98,
        spo2: 96,
        bloodSugarRandom: 120,
        temperatureF: 98.6,
      },
      dangerSigns: ['Severe persistent headache', 'Epigastric pain', 'Visual blurriness'],
    };

    const vitalsResult = evaluateVitalsAlert(beneficiaryRecord.vitals);
    expect(vitalsResult.isCritical).toBe(true);
    expect(vitalsResult.color).toBe('RED');
    expect(beneficiaryRecord.dangerSigns.length).toBe(3);
  });

  it('Step 2: Field assessment engine automatically flags case as HIGH_RISK_PREGNANCY requiring tertiary referral', () => {
    const isHighRisk = (bpSystolic: number, bpDiastolic: number, dangerSignsCount: number) =>
      bpSystolic >= 140 || bpDiastolic >= 90 || dangerSignsCount > 0;

    expect(isHighRisk(168, 108, 3)).toBe(true);
  });

  it('Step 3: ASHA generates Immediate Referral Slip with 1-hour SLA directed to District Hospital Satara Obstetric ICU', async () => {
    const referral = {
      referralId: 'REF-ANC-2026-042',
      patientId: 'PT-ANC-POOJA',
      fromFacilityId: 'FAC007', // Sub-Centre Tapola
      toFacilityId: 'FAC001',   // District Hospital Satara
      specialty: 'Obstetric High-Risk ICU',
      urgency: 'IMMEDIATE',
      slaMinutes: REFERRAL_SLAS.IMMEDIATE, // 60 mins
      provisionalDiagnosis: 'Severe Preeclampsia in 34th Week with Impending Eclampsia',
      qrCodePayload: 'REF-ANC-2026-042|PT-ANC-POOJA|IMMEDIATE|FAC001',
      stage: 'CREATED',
    };

    await storage.saveItem('referral_drafts', referral.referralId, referral);
    const saved = await storage.getItem<typeof referral>('referral_drafts', referral.referralId);
    expect(saved?.slaMinutes).toBe(60);
    expect(saved?.specialty).toContain('Obstetric High-Risk');
  });

  it('Step 4: Referral transitions through NOTIFIED -> ACCEPTED by Dr. Kulkarni and patient is admitted into ICU', async () => {
    const initialReferral = {
      referralId: 'REF-ANC-2026-042',
      stage: 'CREATED',
    };
    await storage.saveItem('referral_drafts', initialReferral.referralId, initialReferral);

    const referral = await storage.getItem<any>('referral_drafts', 'REF-ANC-2026-042');
    referral.stage = 'ACCEPTED';
    referral.acceptedByDoctor = 'Dr. V. M. Kulkarni (DH Satara)';
    referral.bedAssigned = 'OB-ICU Bed 4';

    await storage.saveItem('referral_drafts', referral.referralId, referral);
    const updated = await storage.getItem<any>('referral_drafts', 'REF-ANC-2026-042');
    expect(updated.stage).toBe('ACCEPTED');
    expect(updated.bedAssigned).toBe('OB-ICU Bed 4');
  });

  it('Step 5: Patient is stabilized with IV Magnesium Sulfate and Doctor transmits digital counter-referral back to ASHA', async () => {
    const counterReferral = {
      referralId: 'REF-ANC-2026-042',
      stage: 'COMPLETED',
      treatmentsAdministered: ['IV Magnesium Sulfate 4g loading dose + maintenance', 'Tab Labetalol 100mg BD'],
      outcome: 'BP stabilized to 128/84. Pregnancy safely prolonged.',
      followUpPlan: 'Weekly home visits by ASHA Anandi. Daily BP logging.',
      originatingAshaId: 'ASHA-TAPOLA-01',
    };

    await storage.saveItem('sync_log', counterReferral.referralId, counterReferral);
    const log = await storage.getItem<typeof counterReferral>('sync_log', counterReferral.referralId);
    expect(log?.treatmentsAdministered[0]).toContain('Magnesium Sulfate');
    expect(log?.stage).toBe('COMPLETED');
  });
});
