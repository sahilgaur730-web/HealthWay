/**
 * HealthWay Patient & Beneficiary Domain Models
 */

export type PatientRiskLevel = 'normal' | 'moderate' | 'high';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  abhaId: string;
  aadhaarLast4?: string;
  nameEn: string;
  nameMr: string;
  age: number;
  gender: Gender;
  phone: string;
  village: string;
  block: string;
  district: string;
  bloodGroup?: string;
  conditions: string[];
  riskLevel: PatientRiskLevel;
  isPregnant?: boolean;
  lmpDate?: string;
  eddDate?: string;
  gravida?: number;
  parity?: number;
  ncdStatus?: string[];
  lastVisit?: string;
  nextFollowUp?: string;
  photoUri?: string;
  registeredBy?: string;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

export interface VisitRecord {
  id: string;
  patientId: string;
  date: string;
  facility: string;
  facilityType: 'PHC' | 'Sub-Centre' | 'District Hospital' | 'Rural Hospital';
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  vitals: {
    bp: string;
    pulse: string;
    sugar: string;
    weight: string;
    spo2?: string;
  };
}
