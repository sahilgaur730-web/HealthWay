/**
 * Referral Schema & Model (Backend Node/Express/Mongoose Spec)
 */

const ReferralStages = [
  'CREATED',
  'NOTIFIED',
  'ACCEPTED',
  'IN_TRANSIT',
  'REACHED',
  'ADMITTED',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED'
];

const UrgencyLevels = ['EMERGENCY', 'URGENT', 'ROUTINE', 'ELECTIVE'];

const ReferralSchemaDefinition = {
  token: { type: String, required: true, unique: true }, // Format: REF-YYYYMMDD-RANDOM
  patientId: { type: String, required: true, index: true },
  patientNameMr: { type: String, required: true },
  patientNameEn: { type: String, required: true },
  patientPhone: { type: String, required: true },
  abhaId: { type: String, required: true, index: true },

  referringFacility: {
    facilityId: String,
    nameMr: String,
    nameEn: String,
    doctorNameMr: String,
    doctorNameEn: String
  },

  targetHospital: {
    hospitalId: String,
    nameMr: String,
    nameEn: String,
    departmentMr: String,
    departmentEn: String
  },

  urgency: { type: String, enum: UrgencyLevels, default: 'ROUTINE' },
  maxHoursThreshold: { type: Number, required: true },
  primaryReasonMr: { type: String, required: true },
  primaryReasonEn: { type: String, required: true },
  provisionalDiagnosis: String,

  vitalsSnapshot: {
    bp: String,
    pulse: String,
    spO2: String,
    sugar: String
  },

  transportNeeded: { type: Boolean, default: false },
  transportType: { type: String, enum: ['108_AMBULANCE', '102_JANANI', 'OWN_VEHICLE'] },
  transportDetails: {
    vehicleNumber: String,
    driverName: String,
    driverPhone: String,
    etaMinutes: Number,
    status: String
  },

  ashaEscortAssigned: { type: Boolean, default: false },
  ashaName: String,
  ashaPhone: String,

  stage: { type: String, enum: ReferralStages, default: 'CREATED', index: true },
  isOverdue: { type: Boolean, default: false, index: true },
  overdueHours: { type: Number, default: 0 },

  stageHistory: [
    {
      stage: String,
      timestamp: { type: Date, default: Date.now },
      location: String,
      notes: String
    }
  ],

  reminders: [
    {
      recipient: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
      status: String
    }
  ],

  feedback: {
    receivingDoctorName: String,
    receivingHospital: String,
    specialty: String,
    outcomeStatus: String,
    finalDiagnosisMr: String,
    finalDiagnosisEn: String,
    treatmentSummaryMr: String,
    treatmentSummaryEn: String,
    counterReferralAdviceMr: String,
    counterReferralAdviceEn: String,
    date: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  ReferralStages,
  UrgencyLevels,
  ReferralSchemaDefinition
};
