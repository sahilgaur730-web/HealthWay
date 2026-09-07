/**
 * ConsentArtifact Model & Schema Specification (Backend Node/Express Spec)
 * ABDM (Ayushman Bharat Digital Mission) Electronic Consent Framework
 * Strictly zero unicode emojis.
 */

const ConsentStatusEnum = [
  'REQUESTED',
  'GRANTED',
  'REVOKED',
  'EXPIRED',
  'DENIED'
];

const ConsentPurposeEnum = [
  'CARE_MANAGEMENT', // Care Management / Outpatient / Inpatient treatment
  'SELF',            // Self-requested health locker PHR download
  'RESEARCH',        // De-identified public health research & epidemiology
  'BILLING'          // Insurance claims and PMJAY reimbursement processing
];

const FHIRDataTypesEnum = [
  'OPConsultation',
  'DischargeSummary',
  'DiagnosticReport',
  'Prescription',
  'ImmunizationRecord',
  'WellnessRecord'
];

const ConsentArtifactSchemaDefinition = {
  consentId: { type: String, required: true, unique: true, index: true },
  consentRequestId: { type: String, required: true, index: true },
  patientAbhaId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  
  purpose: {
    code: { type: String, enum: ConsentPurposeEnum, required: true },
    text: { type: String, required: true },
    refUri: { type: String, default: 'https://ndhm.gov.in/consent/purpose' }
  },

  hip: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    facilityType: { type: String, default: 'PHC' }
  },

  hiu: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    facilityType: { type: String, default: 'DH' }
  },

  requester: {
    name: { type: String, required: true },
    identifier: { type: String, required: true },
    type: { type: String, default: 'HEALTH_PROFESSIONAL' }
  },

  dataTypes: [{ type: String, enum: FHIRDataTypesEnum }],

  permission: {
    accessMode: { type: String, enum: ['VIEW', 'STORE', 'STREAM', 'QUERY'], default: 'VIEW' },
    dateRange: {
      from: { type: Date, required: true },
      to: { type: Date, required: true }
    },
    dataEraseAt: { type: Date, required: true },
    frequency: {
      unit: { type: String, enum: ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'], default: 'MONTH' },
      value: { type: Number, default: 1 },
      repeats: { type: Number, default: 0 }
    }
  },

  status: { type: String, enum: ConsentStatusEnum, default: 'REQUESTED', index: true },
  grantedAt: { type: Date },
  revokedAt: { type: Date },
  expiresAt: { type: Date, required: true },
  
  digitalSignature: {
    algorithm: { type: String, default: 'SHA256withRSA' },
    value: { type: String },
    keyId: { type: String }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  ConsentStatusEnum,
  ConsentPurposeEnum,
  FHIRDataTypesEnum,
  ConsentArtifactSchemaDefinition
};
