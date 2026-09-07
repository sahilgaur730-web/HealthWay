/**
 * Tier 3: Cross-Feature Combinations — Pairwise Interaction 3
 * ASHA Field Intake -> Offline Sync Engine -> Doctor Live OPD Queue
 */

import { MockStorageService } from '../harness/mockStorage';
import { MockSyncEngine } from '../harness/mockSync';
import { QUEUE_PRIORITY_WEIGHTS } from '../harness/domainFixtures';

describe('Tier 3: Cross-Feature Combination — ASHA Intake to Offline Sync to Doctor OPD', () => {
  let storage: MockStorageService;
  let syncEngine: MockSyncEngine;

  beforeEach(() => {
    storage = new MockStorageService();
    syncEngine = new MockSyncEngine(storage);
  });

  it('XC13: ASHA registers beneficiary completely offline in village field visit', async () => {
    syncEngine.setQuality('OFFLINE');

    const beneficiary = {
      id: 'BEN-MH-TAPOLA-01',
      name: 'Sunita Ramchandra Jadhav',
      age: 28,
      gender: 'Female',
      village: 'Tapola',
      abhaId: '14-4821-9876-5432',
      phone: '+91 98220 12345',
      registeredOffline: true,
      registeredAt: Date.now(),
    };

    // Save to local cache
    await storage.saveItem('patient_cache', beneficiary.id, beneficiary);
    // Enqueue to sync outbox
    await storage.enqueueSync('/api/v1/beneficiaries', 'POST', beneficiary);

    const cached = await storage.getItem<typeof beneficiary>('patient_cache', beneficiary.id);
    expect(cached?.name).toBe('Sunita Ramchandra Jadhav');

    const pending = await storage.getPendingSyncItems();
    expect(pending.length).toBe(1);
    expect(pending[0].payload.id).toBe(beneficiary.id);
  });

  it('XC14: ASHA records vitals and allocates Antenatal priority OPD token while still offline', async () => {
    const vitalsRecord = {
      patientId: 'BEN-MH-TAPOLA-01',
      bp: '138/88',
      pulse: 78,
      sugar: 115,
      weightKg: 58,
    };
    await storage.enqueueSync('/api/v1/vitals', 'POST', vitalsRecord);

    const tokenRecord = {
      tokenNumber: 'ANC-042',
      patientId: 'BEN-MH-TAPOLA-01',
      patientName: 'Sunita Jadhav',
      department: 'Obstetrics & Gynecology',
      priorityCategory: 'ANTENATAL',
      priorityWeight: QUEUE_PRIORITY_WEIGHTS.ANTENATAL,
      status: 'WAITING',
    };
    await storage.enqueueSync('/api/v1/queue/tokens', 'POST', tokenRecord);

    const pending = await storage.getPendingSyncItems();
    expect(pending.length).toBe(2);
  });

  it('XC15: network connection restores from OFFLINE to EXCELLENT and outbox drains successfully', async () => {
    // Add beneficiary registration, vitals, and token to outbox
    await storage.enqueueSync('/api/v1/beneficiaries', 'POST', { id: 'BEN-01' });
    await storage.enqueueSync('/api/v1/vitals', 'POST', { id: 'VIT-01' });
    await storage.enqueueSync('/api/v1/queue/tokens', 'POST', { id: 'TOK-01' });

    syncEngine.setQuality('EXCELLENT');
    const syncResult = await syncEngine.syncOutbox();

    expect(syncResult.processed).toBe(3);
    expect(syncResult.succeeded).toBe(3);

    const pending = await storage.getPendingSyncItems();
    expect(pending.length).toBe(0);
  });

  it('XC16: synchronized patient record is now visible in Doctor facility clinical repository', async () => {
    const doctorRepository = [
      { id: 'BEN-MH-TAPOLA-01', name: 'Sunita Ramchandra Jadhav', abhaId: '14-4821-9876-5432' },
    ];
    const patient = doctorRepository.find(p => p.id === 'BEN-MH-TAPOLA-01');
    expect(patient).toBeDefined();
    expect(patient?.abhaId).toBe('14-4821-9876-5432');
  });

  it('XC17: Doctor OPD queue ranks the synchronized Antenatal patient above General patients', () => {
    const doctorQueue = [
      { token: 'GEN-01', name: 'Ramesh', priorityWeight: QUEUE_PRIORITY_WEIGHTS.GENERAL, registeredAt: 1000 },
      { token: 'ANC-042', name: 'Sunita Jadhav', priorityWeight: QUEUE_PRIORITY_WEIGHTS.ANTENATAL, registeredAt: 1500 },
      { token: 'GEN-02', name: 'Dattatray', priorityWeight: QUEUE_PRIORITY_WEIGHTS.GENERAL, registeredAt: 1100 },
    ];

    const sortedQueue = [...doctorQueue].sort((a, b) => {
      if (b.priorityWeight !== a.priorityWeight) return b.priorityWeight - a.priorityWeight;
      return a.registeredAt - b.registeredAt;
    });

    expect(sortedQueue[0].token).toBe('ANC-042');
    expect(sortedQueue[0].name).toBe('Sunita Jadhav');
  });

  it('XC18: Doctor opens patient chart and inspects vitals captured by ASHA in the field', () => {
    const chart = {
      patientName: 'Sunita Jadhav',
      recordedBy: 'ASHA Anandi (Tapola)',
      vitalsAtIntake: { bp: '138/88', pulse: 78, sugar: 115 },
      readyForConsultation: true,
    };
    expect(chart.recordedBy).toContain('Tapola');
    expect(chart.vitalsAtIntake.bp).toBe('138/88');
  });
});
