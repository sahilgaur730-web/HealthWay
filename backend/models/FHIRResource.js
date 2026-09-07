/**
 * FHIRResource Model & Schema Specification (Backend Node/Express Spec)
 * HL7 FHIR R4 Clinical Document & Resource Registry (NRCES India Profiles)
 * Strictly zero unicode emojis.
 */

const FHIRResourceTypes = [
  'Bundle',
  'Composition',
  'Patient',
  'Encounter',
  'Observation',
  'Condition',
  'MedicationRequest',
  'Immunization',
  'DiagnosticReport',
  'DocumentReference',
  'Binary'
];

const FHIRDocumentTypes = [
  'OPConsultation',
  'DischargeSummary',
  'DiagnosticReport',
  'Prescription',
  'ImmunizationRecord',
  'WellnessRecord'
];

const FHIRResourceSchemaDefinition = {
  resourceId: { type: String, required: true, unique: true, index: true },
  resourceType: { type: String, enum: FHIRResourceTypes, required: true, index: true },
  fhirVersion: { type: String, default: '4.0.1' },
  
  // Clinical Context Links
  abhaId: { type: String, required: true, index: true },
  patientId: { type: String, required: true, index: true },
  encounterId: { type: String, index: true },
  careContextReference: { type: String, index: true },
  documentType: { type: String, enum: FHIRDocumentTypes },
  
  // NRCES India Profile Metadata
  meta: {
    versionId: { type: String, default: '1' },
    lastUpdated: { type: Date, default: Date.now },
    profile: [{ type: String }]
  },

  // Raw FHIR JSON Payload
  resourcePayload: { type: Object, required: true },

  // Verification & Status
  status: { type: String, enum: ['preliminary', 'final', 'amended', 'entered-in-error'], default: 'final' },
  hashSha256: { type: String },
  isSigned: { type: Boolean, default: false },
  signatureKeyId: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  FHIRResourceTypes,
  FHIRDocumentTypes,
  FHIRResourceSchemaDefinition
};
