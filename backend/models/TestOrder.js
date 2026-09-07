/**
 * TestOrder Schema & Model (Backend Node/Express/Mongoose Spec)
 */

const TestOrderStatus = ['ORDERED', 'SAMPLE_COLLECTED', 'IN_TRANSIT', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const TestPriority = ['STAT', 'URGENT', 'ROUTINE'];
const CollectionMethods = ['VISIT_LAB', 'HOME_COLLECTION', 'AT_FACILITY'];

const TestOrderSchemaDefinition = {
  orderId: { type: String, required: true, unique: true },
  barcode: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  patientNameMr: String,
  patientNameEn: String,
  patientPhone: String,
  abhaId: { type: String, required: true, index: true },

  prescribedByDoctor: String,
  facilityName: String,

  targetLab: {
    labId: String,
    nameMr: String,
    nameEn: String
  },

  tests: [
    {
      testId: String,
      code: String,
      nameMr: String,
      nameEn: String,
      category: String,
      sampleType: String
    }
  ],

  priority: { type: String, enum: TestPriority, default: 'ROUTINE' },
  collectionMethod: { type: String, enum: CollectionMethods, default: 'VISIT_LAB' },
  clinicalNotes: String,

  status: { type: String, enum: TestOrderStatus, default: 'ORDERED', index: true },
  
  results: [
    {
      parameterId: String,
      name: String,
      value: String,
      unit: String,
      referenceRange: String,
      flag: { type: String, enum: ['NORMAL', 'BORDERLINE', 'CRITICAL'] },
      criticalReason: String
    }
  ],

  overallImpression: String,
  hasCriticalValue: { type: Boolean, default: false },
  verifiedByPathologist: String,
  nablCertNumber: String,
  abhaRecordSyncId: String,

  createdAt: { type: Date, default: Date.now },
  completedAt: Date
};

module.exports = {
  TestOrderStatus,
  TestPriority,
  CollectionMethods,
  TestOrderSchemaDefinition
};
