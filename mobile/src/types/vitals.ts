/**
 * HealthWay Clinical Vitals & Alert Types
 */

export interface Vitals {
  id?: string;
  patientId?: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodPressure?: string; // formatted e.g. "120/80"
  pulse?: number; // bpm
  heartRate?: number;
  bloodSugar?: number; // mg/dL
  sugarType?: 'FASTING' | 'RANDOM' | 'POST_PRANDIAL';
  spo2?: number; // percentage
  temperature?: number; // °F
  respiratoryRate?: number; // breaths/min
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  recordedAt: string;
  recordedBy?: string;
  isAbnormal?: boolean;
  alerts?: string[];
}

export interface VitalSignRange {
  name: string;
  minNormal: number;
  maxNormal: number;
  unit: string;
  criticalLow?: number;
  criticalHigh?: number;
}
