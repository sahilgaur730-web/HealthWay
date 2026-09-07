/**
 * Sync Queue Schema & Model (Backend Spec)
 * Manages client batch submissions, offline conflict resolution, and idempotency.
 */

const SyncStatusEnum = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CONFLICT'];

const SyncQueueSchemaDefinition = {
  syncId: { type: String, required: true, unique: true, index: true },
  clientId: { type: String, required: true, index: true },
  facilityId: { type: String, required: true, index: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  operationType: { type: String, required: true, index: true }, // e.g., 'TRIAGE_CREATE', 'MEDICINE_DISPENSE', 'REFERRAL_SUBMIT'
  endpoint: { type: String, required: true },
  httpMethod: { type: String, enum: ['POST', 'PUT', 'PATCH', 'DELETE'], default: 'POST' },
  payload: { type: Object, required: true },
  status: { type: String, enum: SyncStatusEnum, default: 'PENDING', index: true },
  clientTimestamp: { type: Date, required: true },
  serverTimestamp: { type: Date, default: Date.now },
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 5 },
  errorMessage: { type: String },
  resolutionNotes: { type: String }
};

module.exports = {
  SyncStatusEnum,
  SyncQueueSchemaDefinition
};
