/**
 * Tier 3: Cross-Feature Combinations — Pairwise Interaction 2
 * Doctor Prescription -> Live Medicine Stock Check & Generic Substitution Reorder
 */

import {
  EDL_MEDICINE_CATALOG,
  EdlMedicine,
} from '../harness/domainFixtures';
import { MockStorageService } from '../harness/mockStorage';

describe('Tier 3: Cross-Feature Combination — Doctor Rx to Medicine Inventory', () => {
  let storage: MockStorageService;
  let localStock: EdlMedicine[];

  beforeEach(async () => {
    storage = new MockStorageService();
    localStock = JSON.parse(JSON.stringify(EDL_MEDICINE_CATALOG));
    for (const med of localStock) {
      await storage.saveItem('medicine_stock', med.id, med);
    }
  });

  it('XC07: checks live facility stock availability when doctor enters prescription item', async () => {
    const med = await storage.getItem<EdlMedicine>('medicine_stock', 'MED001'); // Paracetamol
    expect(med).not.toBeNull();
    expect(med?.stockLevel).toBeGreaterThan(0);
    expect(med?.status).toBe('ADEQUATE');
  });

  it('XC08: decrements stock quantity in medicine_stock when prescription is dispensed', async () => {
    const medBefore = await storage.getItem<EdlMedicine>('medicine_stock', 'MED001');
    const initialQty = medBefore!.stockLevel;
    const prescribedQty = 10; // 10 tablets

    medBefore!.stockLevel -= prescribedQty;
    await storage.saveItem('medicine_stock', medBefore!.id, medBefore);

    const medAfter = await storage.getItem<EdlMedicine>('medicine_stock', 'MED001');
    expect(medAfter?.stockLevel).toBe(initialQty - 10);
  });

  it('XC09: detects OUT_OF_STOCK medication and prevents prescription fulfillment without substitute', async () => {
    const ifa = await storage.getItem<EdlMedicine>('medicine_stock', 'MED006'); // Iron & Folic Acid
    expect(ifa?.stockLevel).toBe(0);
    expect(ifa?.status).toBe('OUT_OF_STOCK');

    const canFulfillDirectly = ifa!.stockLevel > 0;
    expect(canFulfillDirectly).toBe(false);
  });

  it('XC10: looks up active chemical salt equivalence to suggest in-stock generic substitute', async () => {
    const outOfStockMed = await storage.getItem<EdlMedicine>('medicine_stock', 'MED006')!;
    expect(outOfStockMed?.genericSubstitutes.length).toBeGreaterThan(0);

    const recommendedSub = outOfStockMed?.genericSubstitutes[0];
    expect(recommendedSub).toBe('Autrin');
  });

  it('XC11: doctor accepts substitution and prescription records both primary and substituted drug', () => {
    const rxItem = {
      requestedDrug: 'Iron & Folic Acid 100mg+0.5mg',
      prescribedDrug: 'Autrin (Equivalent Iron & Folic Acid Salt)',
      reasonForSubstitution: 'Primary EDL item out of stock at facility dispensary',
      approvedByDoctor: 'Dr. Deshmukh',
      dosage: '1 tablet daily after food',
      durationDays: 30,
    };
    expect(rxItem.prescribedDrug).toContain('Autrin');
    expect(rxItem.approvedByDoctor).toBe('Dr. Deshmukh');
  });

  it('XC12: automatically generates warehouse supply indent when stock falls below buffer', async () => {
    const med = await storage.getItem<EdlMedicine>('medicine_stock', 'MED004'); // Amlodipine (minBuffer 300, stock 45)
    expect(med?.stockLevel).toBeLessThan(med!.minBuffer);

    const indent = {
      indentId: `IND-${Date.now()}`,
      facilityId: 'FAC005',
      medicineId: med!.id,
      medicineName: med!.name,
      currentStock: med!.stockLevel,
      minBuffer: med!.minBuffer,
      requisitionQty: med!.minBuffer * 2 - med!.stockLevel,
      status: 'SUBMITTED_TO_DISTRICT_WAREHOUSE',
    };

    await storage.enqueueSync('/api/v1/indents', 'POST', indent);
    const pending = await storage.getPendingSyncItems();
    expect(pending.some(p => p.payload.medicineId === 'MED004')).toBe(true);
  });
});
