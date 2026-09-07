/**
 * Medicine Stock Schema & Model (Backend Spec)
 * Tracks live inventory, consumption rate, and expiry across rural facilities
 */

const StockTiers = ['ADEQUATE', 'LOW', 'CRITICAL', 'OUT_OF_STOCK', 'EXPIRING_SOON'];

const MedicineStockSchemaDefinition = {
  stockId: { type: String, required: true, unique: true, index: true },
  facilityId: { type: String, required: true, index: true },
  facilityName: { type: String, required: true },
  facilityType: { type: String, enum: ['Sub-Centre', 'PHC', 'CHC', 'Rural Hospital', 'District Hospital'], required: true },
  medicineId: { type: String, required: true, index: true },
  quantity: { type: Number, required: true, min: 0 },
  minimumStock: { type: Number, required: true },
  batchNumber: { type: String, required: true },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date, required: true, index: true },
  dailyConsumptionRate: { type: Number, default: 5 },
  daysOfSupply: { type: Number },
  status: { type: String, enum: StockTiers, required: true, index: true },
  lastStockAuditDate: { type: Date, default: Date.now },
  updatedBy: {
    userId: String,
    userName: String,
    role: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  StockTiers,
  MedicineStockSchemaDefinition
};
