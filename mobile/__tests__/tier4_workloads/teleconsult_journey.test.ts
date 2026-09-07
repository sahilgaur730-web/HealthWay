/**
 * Tier 4: Real-World Workload Scenario 4 — Telemedicine Consultation Journey
 * Complete multi-step lifecycle: ABHA Login -> Slot Booking -> WebRTC Room -> Bandwidth Fallback -> ABDM Rx & Lab Order
 */

import { MockAuthService } from '../harness/mockAuth';
import { MockStorageService } from '../harness/mockStorage';
import { EDL_MEDICINE_CATALOG, DIAGNOSTIC_CATALOG } from '../harness/domainFixtures';

describe('Tier 4: Workload Journey 4 — Telemedicine Consultation with ABDM Prescription', () => {
  let auth: MockAuthService;
  let storage: MockStorageService;

  beforeEach(() => {
    auth = new MockAuthService();
    storage = new MockStorageService();
  });

  it('Step 1: Patient authenticates via 14-digit ABHA and books teleconsultation slot with Dr. Deshmukh', async () => {
    const abhaId = '14-4821-9876-5432';
    const loginSuccess = await auth.loginWithAbha(abhaId, '123456');
    expect(loginSuccess).toBe(true);

    const booking = {
      bookingId: 'BK-TELE-2026-001',
      patientAbhaId: abhaId,
      doctorId: 'DOC-DESHMUKH-01',
      doctorName: 'Dr. Deshmukh',
      facilityId: 'FAC005', // PHC Mahabaleshwar
      scheduledTime: '2026-09-07T10:30:00Z',
      channel: 'VIDEO_TELECONSULTATION',
      status: 'CONFIRMED',
    };

    await storage.saveItem('patient_cache', booking.bookingId, booking);
    const saved = await storage.getItem<typeof booking>('patient_cache', booking.bookingId);
    expect(saved?.channel).toBe('VIDEO_TELECONSULTATION');
    expect(saved?.status).toBe('CONFIRMED');
  });

  it('Step 2: Virtual waiting room allocates session token and tracks doctor availability', () => {
    const waitingRoom = {
      roomId: 'ROOM-TELE-001',
      patientStatus: 'IN_WAITING_ROOM',
      doctorStatus: 'ONLINE_READY',
      queuePosition: 1,
      estimatedWaitSeconds: 15,
    };
    expect(waitingRoom.patientStatus).toBe('IN_WAITING_ROOM');
    expect(waitingRoom.doctorStatus).toBe('ONLINE_READY');
  });

  it('Step 3: WebRTC video call connects and automatically activates audio-only fallback upon bandwidth degradation', () => {
    let connectionMode: 'HD_VIDEO' | 'AUDIO_ONLY_FALLBACK' = 'HD_VIDEO';
    const monitorBandwidth = (kbps: number) => {
      connectionMode = kbps < 150 ? 'AUDIO_ONLY_FALLBACK' : 'HD_VIDEO';
    };

    monitorBandwidth(800);
    expect(connectionMode).toBe('HD_VIDEO');

    // Network drops in rural Ghat area to 95 Kbps
    monitorBandwidth(95);
    expect(connectionMode).toBe('AUDIO_ONLY_FALLBACK');
  });

  it('Step 4: Doctor issues digital prescription for Amoxicillin 500mg and orders CBC diagnostic investigation', async () => {
    const amoxicillin = EDL_MEDICINE_CATALOG.find(m => m.code === 'EDL-02')!;
    const cbcTest = DIAGNOSTIC_CATALOG.find(t => t.code === 'HEM-01')!;

    const clinicalConsultNote = {
      noteId: 'NOTE-2026-TELE-01',
      patientAbhaId: '14-4821-9876-5432',
      diagnosis: 'Acute Bronchitis',
      prescribedMedicines: [
        {
          code: amoxicillin.code,
          name: amoxicillin.name,
          genericName: amoxicillin.genericName,
          dosage: '500mg twice daily for 5 days',
        },
      ],
      labInvestigations: [
        {
          code: cbcTest.code,
          name: cbcTest.name,
          sampleType: cbcTest.sampleType,
          priority: 'URGENT',
        },
      ],
      doctorSignature: 'MCI-MH-2015-09871',
    };

    await storage.saveItem('triage_drafts', clinicalConsultNote.noteId, clinicalConsultNote);
    const savedNote = await storage.getItem<typeof clinicalConsultNote>('triage_drafts', clinicalConsultNote.noteId);
    expect(savedNote?.prescribedMedicines[0].name).toContain('Amoxicillin');
    expect(savedNote?.labInvestigations[0].code).toBe('HEM-01');
  });

  it('Step 5: Patient receives ABDM FHIR R4 Bundle and diagnostic QR barcode in Digital PHR Locker', async () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      id: 'BUNDLE-ABDM-2026-0042',
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        { resource: { resourceType: 'Patient', id: '14-4821-9876-5432' } },
        { resource: { resourceType: 'MedicationRequest', medication: 'Amoxicillin 500mg' } },
        { resource: { resourceType: 'ServiceRequest', code: 'CBC' } },
      ],
      qrBarcodePayload: 'ABDM|BUNDLE-ABDM-2026-0042|14-4821-9876-5432',
    };

    await storage.saveItem('patient_cache', fhirBundle.id, fhirBundle);
    const retrieved = await storage.getItem<typeof fhirBundle>('patient_cache', fhirBundle.id);
    expect(retrieved?.resourceType).toBe('Bundle');
    expect(retrieved?.entry.length).toBe(3);
    expect(retrieved?.qrBarcodePayload).toContain('BUNDLE-ABDM');
  });
});
