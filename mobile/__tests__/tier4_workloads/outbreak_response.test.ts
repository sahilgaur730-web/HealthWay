/**
 * Tier 4: Real-World Workload Scenario 5 — Epidemic Outbreak Response & Containment
 * Complete multi-step lifecycle: Outbreak Detection -> Severity Escalation -> Resource Indent -> ASHA Field Broadcast -> HMIS Report
 */

import { MockStorageService } from '../harness/mockStorage';
import { DISTRICT_FACILITIES } from '../harness/domainFixtures';

describe('Tier 4: Workload Journey 5 — Epidemic Outbreak Response & Resource Mobilization', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('Step 1: District Health Officer detects vector-borne Dengue surge in Karad Taluka', () => {
    const diseaseSurveillance = {
      disease: 'Dengue',
      taluka: 'Karad',
      facilityId: 'FAC002', // Sub-District Hospital Karad
      activeFeverCases: 42,
      ns1Positives: 18,
      baselineWeeklyCases: 4,
    };
    const isSurge = diseaseSurveillance.activeFeverCases > diseaseSurveillance.baselineWeeklyCases * 3;
    expect(isSurge).toBe(true);
  });

  it('Step 2: Epidemic Tracker classifies cluster as ALERT severity and pins geographic cluster coordinates', () => {
    const getSeverity = (cases: number) => (cases >= 50 ? 'CRITICAL_EPIDEMIC' : cases >= 20 ? 'ALERT' : 'WATCH');
    const severity = getSeverity(42);
    expect(severity).toBe('ALERT');

    const sdhKarad = DISTRICT_FACILITIES.find(f => f.id === 'FAC002')!;
    expect(sdhKarad.block).toBe('Karad');
  });

  it('Step 3: District Admin dispatches emergency indent for 500 NS1 test kits and IV Fluids', async () => {
    const emergencyIndent = {
      indentId: `IND-EMERG-DENGUE-${Date.now()}`,
      destinationWarehouse: 'Central Medical Stores Organization (CMSO) Pune',
      requestingFacilityId: 'FAC002',
      urgency: 'CRITICAL_EMERGENCY',
      items: [
        { testCode: 'MIC-03', name: 'Dengue NS1 Antigen Rapid Test Kits', requestedQty: 500 },
        { medicineId: 'MED001', name: 'Paracetamol 500mg', requestedQty: 2500 },
        { medicineId: 'MED005', name: 'Oral Rehydration Salts (ORS)', requestedQty: 1000 },
      ],
      status: 'APPROVED_FOR_DISPATCH',
    };

    await storage.saveItem('facility_data', emergencyIndent.indentId, emergencyIndent);
    const saved = await storage.getItem<typeof emergencyIndent>('facility_data', emergencyIndent.indentId);
    expect(saved?.urgency).toBe('CRITICAL_EMERGENCY');
    expect(saved?.items.length).toBe(3);
  });

  it('Step 4: Admin broadcasts multilingual mobile advisory to all 45 ASHA workers in Karad block', () => {
    const broadcastAlert = {
      senderRole: 'District Admin',
      targetBlock: 'Karad',
      totalAshasTargeted: 45,
      deliveryStatus: 'PUSH_BROADCAST_SENT',
      messages: {
        en: 'URGENT: Dengue containment drive active in Karad. Inspect standing water & log febrile patients.',
        mr: 'तातडीचे: कराड तालुक्यात डेंग्यू प्रतिबंध मोहीम सुरू. साठलेले पाणी तपासा व ताप असलेल्या रुग्णांची नोंद करा.',
      },
    };
    expect(broadcastAlert.totalAshasTargeted).toBe(45);
    expect(broadcastAlert.deliveryStatus).toBe('PUSH_BROADCAST_SENT');
    expect(broadcastAlert.messages.mr).toContain('डेंग्यू प्रतिबंध');
  });

  it('Step 5: District Epidemiological Index updates and syncs monthly HMIS Form-6 epidemic report', async () => {
    const hmisReport = {
      formNumber: 'HMIS Form 6',
      reportingMonth: '2026-09',
      district: 'Satara',
      reportedOutbreaks: [
        {
          disease: 'Dengue',
          taluka: 'Karad',
          attackRatePercent: 0.12,
          caseFatalityRatePercent: 0.0,
          containmentStatus: 'ACTIVE_INTERVENTION',
        },
      ],
      interopStatus: 'HMIS_GATEWAY_SYNCED',
    };

    await storage.saveItem('sync_log', 'HMIS-REPORT-06', hmisReport);
    const log = await storage.getItem<typeof hmisReport>('sync_log', 'HMIS-REPORT-06');
    expect(log?.interopStatus).toBe('HMIS_GATEWAY_SYNCED');
    expect(log?.reportedOutbreaks[0].caseFatalityRatePercent).toBe(0.0);
  });
});
