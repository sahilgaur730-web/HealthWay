/**
 * HealthWay 7-Stage Inter-Facility Referral Models
 * Complies with PROJECT.md § Domain Models & Features 13-14
 */

export type ReferralStage =
  | 'CREATED'
  | 'NOTIFIED'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'REACHED'
  | 'ADMITTED'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export type ReferralUrgency = 'IMMEDIATE' | 'URGENT' | 'PRIORITY' | 'ROUTINE';

export type TransportType = '108_AMBULANCE' | '102_JANANI' | 'OWN_VEHICLE' | 'PUBLIC_TRANSPORT';

export interface StageHistoryItem {
  stage: ReferralStage;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface DoctorFeedbackData {
  doctorName: string;
  hospitalName: string;
  date: string;
  counterReferralNotes: string;
  treatmentGiven: string;
  dischargeAdvice: string;
}

export interface Referral {
  id: string; // REF-YYYYMMDD-RANDOM
  patientId: string;
  patientName: string;
  patientNameMr?: string;
  patientPhone: string;
  patientVillage: string;
  patientAge: number;
  patientGender: string;
  abhaId?: string;

  fromFacilityId: string;
  fromFacilityName: string;
  fromDoctorName: string;

  toFacilityId: string;
  toFacilityName: string;
  department: string;

  urgency: ReferralUrgency;
  primaryReason: string;
  provisionalDiagnosis: string;
  vitalsSummary?: {
    bp: string;
    pulse: string;
    spO2: string;
    sugar?: string;
  };

  transportNeeded: boolean;
  transportType?: TransportType;
  transportStatus?: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    etaMinutes: number;
    liveStatus: string;
  };

  ashaEscortAssigned: boolean;
  ashaName?: string;
  ashaPhone?: string;

  stage: ReferralStage;
  createdAt: string;
  updatedAt: string;
  stageHistory: StageHistoryItem[];

  slaDeadline: string; // ISO string
  isOverdue: boolean;
  overdueHours?: number;

  feedback?: DoctorFeedbackData;
}
