/**
 * High-Risk Patient Schema & Model (Backend Spec)
 * Surveillance protocols for Maternal ANC, NCDs, TB DOTS, and Malnutrition
 */

const ClinicalRiskCategories = [
  'PREGNANT',
  'NEWBORN',
  'DIABETES',
  'HYPERTENSION',
  'TUBERCULOSIS',
  'MENTAL_HEALTH',
  'MALNUTRITION'
];

const UrgencyTiers = [
  'OVERDUE',
  'DUE_TODAY',
  'DUE_SOON',
  'DUE_WEEK',
  'ON_TRACK'
];

const EscalationLevels = [
  'NONE',
  'ASHA_ALERT',
  'MO_ALERT',
  'DHO_CRITICAL'
];

const HighRiskPatientSchemaDefinition = {
  patientId: { type: String, required: true, unique: true, index: true },
  abhaId: { type: String, required: true, index: true },
  nameEn: { type: String, required: true },
  nameMr: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Female', 'Male', 'Other'], required: true },
  phone: { type: String, required: true },
  village: { type: String, required: true },
  block: { type: String, required: true },
  district: { type: String, required: true },
  category: { type: String, enum: ClinicalRiskCategories, required: true, index: true },
  severity: { type: String, enum: ['MODERATE', 'HIGH', 'CRITICAL'], default: 'HIGH', index: true },
  clinicalRiskFactors: [{ type: String }],
  dangerSigns: [{ type: String }],
  assignedAsha: {
    name: String,
    phone: String,
    village: String
  },
  assignedFacility: {
    facilityId: String,
    facilityName: String,
    medicalOfficerName: String
  },
  registrationDate: { type: Date, default: Date.now },
  lastVisitDate: { type: Date },
  nextFollowUpDate: { type: Date, required: true, index: true },
  daysOverdue: { type: Number, default: 0 },
  urgency: { type: String, enum: UrgencyTiers, default: 'ON_TRACK', index: true },
  escalationLevel: { type: String, enum: EscalationLevels, default: 'NONE', index: true },
  adherenceRate: { type: Number, default: 100 },
  status: { type: String, enum: ['ACTIVE', 'STABILIZED', 'TRANSFERRED', 'DELIVERED'], default: 'ACTIVE' },
  vitalsHistory: [
    {
      date: { type: Date, default: Date.now },
      recordedBy: String,
      role: String,
      bp: String,
      bloodSugar: String,
      weightKg: Number,
      hbGdl: Number,
      muacMm: Number,
      dangerSignsChecked: [String],
      medicationAdherence: { type: String, enum: ['FULL', 'PARTIAL', 'MISSED'] },
      clinicalNotes: String,
      nextScheduledDate: Date
    }
  ],
  escalationLogs: [
    {
      level: String,
      timestamp: { type: Date, default: Date.now },
      triggeredBy: String,
      actionTaken: String
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  ClinicalRiskCategories,
  UrgencyTiers,
  EscalationLevels,
  HighRiskPatientSchemaDefinition
};
