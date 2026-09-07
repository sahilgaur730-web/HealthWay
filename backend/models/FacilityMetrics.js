/**
 * Facility Metrics Schema & Model (Backend Spec)
 * Tracks daily operational KPIs, staff attendance, OPD targets, and performance score.
 */

const FacilityTypeEnum = ['SC', 'PHC', 'CHC', 'SDH', 'DH'];
const PerformanceGradeEnum = ['A', 'B', 'C', 'D', 'F'];

const FacilityMetricsSchemaDefinition = {
  facilityId: { type: String, required: true, unique: true, index: true },
  facilityName: { type: String, required: true },
  facilityNameMr: { type: String },
  facilityType: { type: String, enum: FacilityTypeEnum, required: true, index: true },
  block: { type: String, required: true, index: true },
  district: { type: String, default: 'Pune District', index: true },
  state: { type: String, default: 'Maharashtra' },
  inCharge: {
    name: { type: String, required: true },
    designation: { type: String },
    phone: { type: String, required: true }
  },
  staff: {
    total: { type: Number, required: true, default: 0 },
    present: { type: Number, required: true, default: 0 },
    breakdown: {
      medicalOfficers: { present: Number, total: Number },
      staffNurses: { present: Number, total: Number },
      anmWorkers: { present: Number, total: Number },
      pharmacists: { present: Number, total: Number },
      labTechnicians: { present: Number, total: Number }
    }
  },
  metrics: {
    consultationsToday: { type: Number, default: 0 },
    consultationsTarget: { type: Number, default: 50 },
    consultationsMonth: { type: Number, default: 0 },
    referralsSent: { type: Number, default: 0 },
    referralsCompleted: { type: Number, default: 0 },
    medicinesOutOfStock: { type: Number, default: 0 },
    highRiskPatients: { type: Number, default: 0 },
    overdueFollowUps: { type: Number, default: 0 },
    deliveries: { type: Number, default: 0 },
    vaccinationsToday: { type: Number, default: 0 },
    tbPatientsActive: { type: Number, default: 0 },
    tbCompliance: { type: Number, default: 100 }
  },
  performance: {
    score: { type: Number, default: 75, index: true },
    grade: { type: String, enum: PerformanceGradeEnum, default: 'B', index: true },
    trend: { type: String, default: '+0' },
    lastMonthScore: { type: Number, default: 70 }
  },
  activeAlerts: [
    {
      type: { type: String, enum: ['CRITICAL', 'WARNING', 'INFO'], required: true },
      category: { type: String, enum: ['medicine', 'staff', 'performance', 'highrisk', 'referral'] },
      messageEn: String,
      messageMr: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  lastDataSync: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  FacilityTypeEnum,
  PerformanceGradeEnum,
  FacilityMetricsSchemaDefinition
};
