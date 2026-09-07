/**
 * ExternalSystem Model & Schema Specification (Backend Node/Express Spec)
 * National Interoperability Linker & Gateway Connectors
 * Strictly zero unicode emojis.
 */

const SupportedSystemsEnum = [
  'ABDM',     // Ayushman Bharat Digital Mission (NHA)
  'NHM',      // National Health Mission Portal
  'HMIS',     // Health Management Information System (MoHFW)
  'MCTS',     // Mother and Child Tracking System
  'NIKSHAY',  // National Tuberculosis Elimination Program (NTEP)
  'COWIN',    // Universal Immunization & Vaccination Portal
  'NCD'       // National Non-Communicable Diseases Portal
];

const ExternalSystemSchemaDefinition = {
  systemId: { type: String, required: true, unique: true, index: true },
  systemCode: { type: String, enum: SupportedSystemsEnum, required: true, unique: true, index: true },
  systemName: { type: String, required: true },
  description: { type: String },
  baseUrl: { type: String, required: true },
  authType: { 
    type: String, 
    enum: ['OAUTH2', 'API_KEY', 'MTLS', 'BEARER'], 
    default: 'OAUTH2' 
  },
  
  status: { 
    type: String, 
    enum: ['ACTIVE', 'CONNECTED', 'DISCONNECTED', 'ERROR', 'DEGRADED'], 
    default: 'CONNECTED',
    index: true 
  },

  lastSyncTimestamp: { type: Date },
  pendingRecordsCount: { type: Number, default: 0 },
  syncErrorsCount: { type: Number, default: 0 },
  syncIntervalMinutes: { type: Number, default: 60 },

  credentials: {
    clientId: { type: String },
    clientSecretMasked: { type: String },
    apiKeyMasked: { type: String },
    facilityHfrCode: { type: String }
  },

  metrics: {
    totalTransferred: { type: Number, default: 0 },
    successRate: { type: Number, default: 100.0 },
    lastLatencyMs: { type: Number, default: 120 }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  SupportedSystemsEnum,
  ExternalSystemSchemaDefinition
};
