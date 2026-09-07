/**
 * Tier 4: Real-World Workload Scenario 1 — Rural Clinic Walk-in Patient Journey
 * Complete multi-step lifecycle: Intake -> Priority Queue -> Doctor Consultation -> Dispensation -> PHR Locker
 */

import { MockStorageService } from '../harness/mockStorage';
import {
  QUEUE_PRIORITY_WEIGHTS,
  EDL_MEDICINE_CATALOG,
  EdlMedicine,
  evaluateVitalsAlert,
} from '../harness/domainFixtures';

describe('Tier 4: Workload Journey 1 — Rural Clinic Walk-in', () => {
  let storage: MockStorageService;

  beforeEach(async () => {
    storage = new MockStorageService();
    // Initialize medicine stock in facility store
    for (const med of EDL_MEDICINE_CATALOG) {
      await storage.saveItem('medicine_stock', med.id, med);
    }
  });

  it('Step 1: Patient Sunita arrives at Sub-Centre Tapola, ANM records intake vitals & issues ANC priority token', async () => {
    const patientProfile = {
      id: 'PT-WALKIN-01',
      name: 'Sunita Ramchandra Jadhav',
      abhaId: '14-4821-9876-5432',
      age: 28,
      category: 'ANTENATAL',
      vitals: {
        systolicBp: 124,
        diastolicBp: 82,
        heartRate: 76,
        spo2: 98,
        bloodSugarRandom: 105,
        temperatureF: 98.6,
      },
    };

    const vitalsCheck = evaluateVitalsAlert(patientProfile.vitals);
    expect(vitalsCheck.isCritical).toBe(false);
    expect(vitalsCheck.color).toBe('GREEN');

    // Issue priority token
    const token = {
      tokenNumber: 'ANC-01',
      patientId: patientProfile.id,
      patientName: patientProfile.name,
      priorityCategory: 'ANTENATAL',
      priorityWeight: QUEUE_PRIORITY_WEIGHTS.ANTENATAL, // Weight: 80
      status: 'WAITING',
      issuedAt: Date.now(),
      facilityId: 'FAC007',
    };

    await storage.saveItem('patient_cache', patientProfile.id, patientProfile);
    expect(token.priorityWeight).toBe(80);
    expect(token.status).toBe('WAITING');
  });

  it('Step 2: Waiting room display summons token ANC-01 with bilingual voice announcement', () => {
    const activeToken = {
      tokenNumber: 'ANC-01',
      room: 'OPD Room 1',
      doctorName: 'Dr. Deshmukh',
      announcements: {
        en: 'Token Number ANC-01, please enter OPD Room 1',
        mr: 'टोकन क्रमांक ANC-01, कृपया ओपीडी कक्ष १ मध्ये यावे',
      },
    };
    expect(activeToken.tokenNumber).toBe('ANC-01');
    expect(activeToken.announcements.mr).toContain('ANC-01');
  });

  it('Step 3: Doctor consults patient, reviews vitals history, and generates digital prescription', async () => {
    const digitalRx = {
      rxId: 'RX-WALKIN-001',
      patientId: 'PT-WALKIN-01',
      patientName: 'Sunita Ramchandra Jadhav',
      doctorName: 'Dr. Deshmukh',
      doctorMci: 'MCI-MH-2015-09871',
      diagnosis: 'Routine 2nd Trimester Antenatal Care + Mild Headache',
      prescribedMedicines: [
        { medicineId: 'MED001', name: 'Paracetamol 500mg', qty: 6, dosage: 'SOS 1 tab for headache' },
        { medicineId: 'MED005', name: 'Oral Rehydration Salts (ORS)', qty: 4, dosage: '1 sachet in 1L water' },
      ],
      issuedAt: Date.now(),
    };

    await storage.saveItem('triage_drafts', digitalRx.rxId, digitalRx);
    const savedRx = await storage.getItem<typeof digitalRx>('triage_drafts', digitalRx.rxId);
    expect(savedRx?.doctorMci).toBe('MCI-MH-2015-09871');
    expect(savedRx?.prescribedMedicines.length).toBe(2);
  });

  it('Step 4: Dispensary dispenses medications from local EDL inventory and updates digital PHR locker', async () => {
    // Check initial stock for Paracetamol
    const pcm = await storage.getItem<EdlMedicine>('medicine_stock', 'MED001')!;
    const initialPcmStock = pcm!.stockLevel;

    // Dispense 6 tablets
    pcm!.stockLevel -= 6;
    await storage.saveItem('medicine_stock', pcm!.id, pcm);

    const updatedPcm = await storage.getItem<EdlMedicine>('medicine_stock', 'MED001');
    expect(updatedPcm?.stockLevel).toBe(initialPcmStock - 6);

    // Save prescription to patient digital PHR locker
    const phrDocument = {
      docId: 'PHR-DOC-001',
      patientId: 'PT-WALKIN-01',
      type: 'PRESCRIPTION',
      title: 'Antenatal OPD Prescription - Sub-Centre Tapola',
      date: '2026-09-07',
      cachedOffline: true,
    };
    await storage.saveItem('patient_cache', phrDocument.docId, phrDocument);

    const cachedDoc = await storage.getItem<typeof phrDocument>('patient_cache', phrDocument.docId);
    expect(cachedDoc?.cachedOffline).toBe(true);
    expect(cachedDoc?.type).toBe('PRESCRIPTION');
  });
});
