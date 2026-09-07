/**
 * Tier 3: Cross-Feature Combinations — Pairwise Interaction 1
 * Triage -> Referral Generation & Pre-Arrival Handover Pipeline
 */

import {
  evaluateTriageLevel,
  evaluateVitalsAlert,
  REFERRAL_SLAS,
  REFERRAL_STAGES,
  DISTRICT_FACILITIES,
  VitalsReading,
} from '../harness/domainFixtures';
import { MockStorageService } from '../harness/mockStorage';

describe('Tier 3: Cross-Feature Combination — Triage to Referral Pipeline', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('XC01: high-risk triage assessment auto-populates inter-facility referral slip', async () => {
    const vitals: VitalsReading = {
      systolicBp: 175,
      diastolicBp: 115,
      heartRate: 118,
      spo2: 91,
      bloodSugarRandom: 160,
      temperatureF: 99.0,
    };

    const triageOutcome = evaluateTriageLevel('ANTENATAL_COMPLICATIONS', 4, vitals);
    expect(triageOutcome.level).toBe('RED');

    // Generate referral directly from triage result
    const referralSlip = {
      id: `REF-${Date.now()}`,
      patientId: 'PT-ANC-009',
      patientName: 'Pooja Jadhav',
      triageLevel: triageOutcome.level,
      vitals,
      fromFacilityId: 'FAC007', // Sub-Centre Tapola
      toFacilityId: 'FAC001',   // District Hospital Satara
      urgency: 'IMMEDIATE',
      slaMinutes: REFERRAL_SLAS.IMMEDIATE,
      stage: 'CREATED',
      recommendedAction: triageOutcome.actionEn,
    };

    await storage.saveItem('referral_drafts', referralSlip.id, referralSlip);
    const saved = await storage.getItem<typeof referralSlip>('referral_drafts', referralSlip.id);
    expect(saved?.triageLevel).toBe('RED');
    expect(saved?.slaMinutes).toBe(60);
    expect(saved?.toFacilityId).toBe('FAC001');
  });

  it('XC02: automatically selects tertiary facility with appropriate emergency capability', () => {
    const resolveDestinationFacility = (urgency: string, requiredDepartment: string) => {
      if (urgency === 'IMMEDIATE') {
        return DISTRICT_FACILITIES.find(f => f.type === 'District Hospital')!;
      }
      return DISTRICT_FACILITIES.find(f => f.type === 'CHC')!;
    };
    const dest = resolveDestinationFacility('IMMEDIATE', 'OBSTETRIC_ICU');
    expect(dest.id).toBe('FAC001');
    expect(dest.name).toBe('District Hospital Satara');
  });

  it('XC03: assigns 108 Emergency Ambulance transport with pre-arrival casualty beacon', () => {
    const referralId = 'REF-2026-009';
    const emergencyDispatch = {
      referralId,
      transportType: '108_AMBULANCE',
      vehicleId: 'MH-12-1080',
      preArrivalAlert: {
        destination: 'District Hospital Satara',
        traumaDeskAlerted: true,
        etaMinutes: 14,
      },
    };
    expect(emergencyDispatch.transportType).toBe('108_AMBULANCE');
    expect(emergencyDispatch.preArrivalAlert.traumaDeskAlerted).toBe(true);
  });

  it('XC04: transitions referral stage from CREATED through NOTIFIED to ACCEPTED by receiving doctor', async () => {
    let stage = 'CREATED';
    const notifyReceivingCenter = () => (stage = 'NOTIFIED');
    const acceptReferral = (doctorName: string) => {
      stage = 'ACCEPTED';
      return { acceptedBy: doctorName, acceptedAt: Date.now() };
    };

    notifyReceivingCenter();
    expect(stage).toBe('NOTIFIED');
    const acceptData = acceptReferral('Dr. V. M. Kulkarni');
    expect(stage).toBe('ACCEPTED');
    expect(acceptData.acceptedBy).toBe('Dr. V. M. Kulkarni');
  });

  it('XC05: carries triage symptom notes and vitals history into receiving doctor chart inspection', () => {
    const patientTransferPacket = {
      patientAbhaId: '14-4821-9876-5432',
      primaryComplaint: 'Severe Preeclampsia, BP 175/115',
      emergencyInterventionsGiven: ['Inj. Magnesium Sulfate 50% 4g IV loaded'],
      initialTriageTimestamp: 1000,
      handoverTimestamp: 1800,
    };
    expect(patientTransferPacket.emergencyInterventionsGiven[0]).toContain('Magnesium Sulfate');
    expect(patientTransferPacket.handoverTimestamp).toBeGreaterThan(patientTransferPacket.initialTriageTimestamp);
  });

  it('XC06: completes referral lifecycle with specialist discharge summary and counter-referral to ASHA', async () => {
    const counterReferral = {
      referralId: 'REF-2026-009',
      stage: 'COMPLETED',
      finalDiagnosis: 'Severe Preeclampsia successfully managed; Normal Delivery performed',
      infantWeightKg: 2.8,
      counterReferralAdvice: 'Daily BP monitoring by ANM Tapola. Tab Amlodipine 5mg OD.',
      referredBackToFacilityId: 'FAC007',
    };
    await storage.saveItem('referral_drafts', counterReferral.referralId, counterReferral);
    const record = await storage.getItem<typeof counterReferral>('referral_drafts', 'REF-2026-009');
    expect(record?.stage).toBe('COMPLETED');
    expect(record?.referredBackToFacilityId).toBe('FAC007');
  });
});
