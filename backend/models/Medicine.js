/**
 * Medicine Master Schema & Model (Backend Spec)
 * Essential Drugs List (EDL) - Government of Maharashtra & NHM
 */

const MedicineCategories = [
  'ESSENTIAL',
  'CHRONIC',
  'MATERNAL',
  'ANTIBIOTIC',
  'VACCINE',
  'EMERGENCY',
  'OTC'
];

const MedicineSchemaDefinition = {
  medicineId: { type: String, required: true, unique: true, index: true },
  nameEn: { type: String, required: true, index: true },
  nameMr: { type: String, required: true },
  genericName: { type: String, required: true, index: true },
  category: { type: String, enum: MedicineCategories, required: true, index: true },
  form: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Sachet', 'Drops', 'Ampoules', 'Vials'], required: true },
  strength: { type: String, required: true },
  unit: { type: String, required: true },
  minimumStockDefault: { type: Number, default: 100 },
  dailyConsumptionEstimate: { type: Number, default: 10 },
  useFor: [{ type: String }],
  program: { type: String, enum: ['NCD', 'PMSMA', 'JSSK', 'RNTCP', 'UIP', 'EDL', null], default: null },
  storageRequirements: {
    coldChain: { type: Boolean, default: false },
    temperatureRange: { type: String, default: '15-25 C' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  MedicineCategories,
  MedicineSchemaDefinition
};
