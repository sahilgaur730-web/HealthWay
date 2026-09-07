/**
 * Field Triage & Priority Referral Service
 * HealthWay Native Mobile Platform - Feature 30
 * Complies with WHO ETAT and Maharashtra NHM Community Referral protocols
 */

import { DISTRICT_FACILITIES, FacilityInfo } from '../data/facilitiesData';
import { ReferralUrgency } from '../types/referral';
import { VitalsReading, evaluateVitalsAlert } from './vitalsService';

export const FIELD_REFERRAL_SLAS: Record<ReferralUrgency, number> = {
  IMMEDIATE: 60, // 1 hour
  URGENT: 360, // 6 hours
  PRIORITY: 1440, // 24 hours
  ROUTINE: 4320, // 72 hours
};

export interface FieldTriageInput {
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  isPregnant?: boolean;
  consciousness: 'A' | 'V' | 'P' | 'U'; // AVPU
  vitals: VitalsReading;
  dangerSigns: string[];
  primaryComplaint: string;
  ashaId: string;
  ashaName: string;
  fromFacilityId?: string; // Default: 'FAC007' (Sub-Centre Tapola)
}

export interface FieldTriageResult {
  referralId: string;
  referralNumber: string;
  displayCode: string;
  urgency: ReferralUrgency;
  triageLevel: 'RED' | 'YELLOW' | 'GREEN';
  slaMinutes: number;
  slaDeadline: string;
  destinationFacility: FacilityInfo;
  specialty: string;
  provisionalDiagnosis: string;
  recommendedAction: string;
  qrPayload: string;
  isEmergency: boolean;
  transportType: '108_AMBULANCE' | '102_JANANI' | 'OWN_VEHICLE';
}

/**
 * Computes urgency priority based on danger sign count and blood pressure status (F30-1)
 */
export function computePriority(dangerSignsCount: number, bpElevated: boolean): 'EMERGENCY' | 'URGENT' | 'ROUTINE' {
  if (dangerSignsCount >= 2 || bpElevated) return 'EMERGENCY';
  if (dangerSignsCount === 1) return 'URGENT';
  return 'ROUTINE';
}

/**
 * Resolves destination facility tier based on urgency and specialty (XC02, B33)
 */
export function resolveDestinationFacility(
  urgency: ReferralUrgency,
  _specialty = 'General',
  originatingFacilityId = 'FAC007'
): FacilityInfo {
  let target: FacilityInfo | undefined;

  if (urgency === 'IMMEDIATE') {
    target = DISTRICT_FACILITIES.find((f) => f.type === 'District Hospital');
  } else if (urgency === 'URGENT') {
    target = DISTRICT_FACILITIES.find((f) => f.type === 'CHC');
  } else {
    target = DISTRICT_FACILITIES.find((f) => f.type === 'PHC');
  }

  // Fallback if not found or identical to originating facility
  if (!target || target.id === originatingFacilityId) {
    target = DISTRICT_FACILITIES.find((f) => f.id !== originatingFacilityId) || DISTRICT_FACILITIES[0];
  }

  return target;
}

/**
 * Evaluates field triage parameters and generates digital priority referral slip (F30-1 to F30-5)
 */
export function evaluateFieldTriage(input: FieldTriageInput): FieldTriageResult {
  const fromFacilityId = input.fromFacilityId || 'FAC007';
  const vitalsAlert = evaluateVitalsAlert(input.vitals);
  const bpElevated = input.vitals.systolicBp >= 140 || input.vitals.diastolicBp >= 90;
  const isConsciousAbnormal = input.consciousness !== 'A';
  const dangerSignsCount = input.dangerSigns.length;

  let urgency: ReferralUrgency = 'ROUTINE';
  let triageLevel: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';

  if (vitalsAlert.isCritical || isConsciousAbnormal || dangerSignsCount >= 2 || (bpElevated && dangerSignsCount >= 1)) {
    urgency = 'IMMEDIATE';
    triageLevel = 'RED';
  } else if (dangerSignsCount === 1 || bpElevated || vitalsAlert.color === 'YELLOW') {
    urgency = 'URGENT';
    triageLevel = 'YELLOW';
  }

  const slaMinutes = FIELD_REFERRAL_SLAS[urgency];
  const slaDeadline = new Date(Date.now() + slaMinutes * 60 * 1000).toISOString();

  // Specialty mapping
  let specialty = 'General Medicine';
  if (input.isPregnant) {
    specialty = urgency === 'IMMEDIATE' ? 'Obstetric High-Risk ICU' : 'Obstetrics & Gynecology';
  } else if (input.vitals.systolicBp >= 160) {
    specialty = 'Cardiology & Intensive Care';
  } else if (input.vitals.spo2 > 0 && input.vitals.spo2 < 90) {
    specialty = 'Emergency Pulmonology & Casualty';
  }

  // Destination resolution
  const destinationFacility = resolveDestinationFacility(urgency, specialty, fromFacilityId);

  // Generate reference numbers matching /^REF-MH-/ (F30-2)
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const referralNumber = `REF-MH-STR-2026-${randomCode}`;
  const displayCode = `MH-REF-${randomCode}`;

  // QR Barcode payload JSON (F30-3, XC03)
  const qrPayload = JSON.stringify({
    refNo: referralNumber,
    ptName: input.patientName,
    urgency,
    ashaId: input.ashaId,
    dest: destinationFacility.id,
    triage: triageLevel,
  });

  const recommendedAction =
    urgency === 'IMMEDIATE'
      ? 'Call 108 emergency ambulance immediately or proceed to Emergency Room'
      : urgency === 'URGENT'
      ? 'Transfer to Community Health Centre or PHC OPD today'
      : 'Can be managed with primary home care advice or routine appointment';

  return {
    referralId: referralNumber,
    referralNumber,
    displayCode,
    urgency,
    triageLevel,
    slaMinutes,
    slaDeadline,
    destinationFacility,
    specialty,
    provisionalDiagnosis: input.isPregnant
      ? `High-Risk Pregnancy with Danger Signs (${input.dangerSigns.join(', ') || 'Severe PIH'})`
      : `Acute Community Condition Requiring ${urgency} Facility Care`,
    recommendedAction,
    qrPayload,
    isEmergency: urgency === 'IMMEDIATE',
    transportType: urgency === 'IMMEDIATE' ? '108_AMBULANCE' : input.isPregnant ? '102_JANANI' : 'OWN_VEHICLE',
  };
}
