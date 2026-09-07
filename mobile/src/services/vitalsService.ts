/**
 * Clinical Vitals Evaluation & BMI Engine
 * HealthWay Native Mobile Platform - Features 22, 25, 28, 30
 * Strict compliance with Tier 1 Feature 22 & WHO clinical guidelines
 */

export interface VitalsReading {
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spo2: number;
  bloodSugarRandom?: number;
  bloodSugarFasting?: number;
  bloodSugarPostPrandial?: number;
  temperatureF: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  recordedAt?: string;
  notes?: string;
}

export interface VitalsAlertResult {
  isCritical: boolean;
  warnings: string[];
  color: 'GREEN' | 'YELLOW' | 'RED';
}

/**
 * Calculates Body Mass Index (BMI) to 1 decimal place.
 * Formula: weight (kg) / [height (m)]^2
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

/**
 * Returns descriptive classification for BMI
 */
export function getBmiCategory(bmi: number): { labelEn: string; labelMr: string; color: string } {
  if (bmi <= 0) return { labelEn: 'N/A', labelMr: 'लागू नाही', color: '#546E7A' };
  if (bmi < 18.5) return { labelEn: 'Underweight', labelMr: 'कमी वजन', color: '#D97706' };
  if (bmi < 25) return { labelEn: 'Normal', labelMr: 'सामान्य वजन', color: '#16A34A' };
  if (bmi < 30) return { labelEn: 'Overweight', labelMr: 'जास्त वजन', color: '#EA580C' };
  return { labelEn: 'Obese', labelMr: 'लठ्ठपणा', color: '#DC2626' };
}

/**
 * Evaluates clinical vitals and returns status alert (GREEN, YELLOW, RED)
 * Tested against F22-1, F22-3, F22-4, CL01-CL50
 */
export function evaluateVitalsAlert(vitals: VitalsReading): VitalsAlertResult {
  const warnings: string[] = [];
  let isCritical = false;

  // 1. Blood Pressure Check
  if (
    vitals.systolicBp >= 160 ||
    vitals.diastolicBp >= 100 ||
    (vitals.systolicBp > 0 && vitals.systolicBp <= 85) ||
    (vitals.diastolicBp > 0 && vitals.diastolicBp <= 50)
  ) {
    warnings.push(`Critical Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
    isCritical = true;
  } else if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) {
    warnings.push(`Elevated Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
  }

  // 2. Oxygen Saturation (SpO2) Check
  if (vitals.spo2 > 0 && vitals.spo2 < 90) {
    warnings.push(`Critical Hypoxia: SpO2 ${vitals.spo2}%`);
    isCritical = true;
  } else if (vitals.spo2 > 0 && vitals.spo2 < 95) {
    warnings.push(`Low Oxygen Saturation: SpO2 ${vitals.spo2}%`);
  }

  // 3. Blood Sugar Check (Random, Fasting, or Post-Prandial)
  const sugarVal = vitals.bloodSugarRandom ?? vitals.bloodSugarPostPrandial ?? vitals.bloodSugarFasting ?? 0;
  if (sugarVal > 0) {
    if (sugarVal > 250 || sugarVal < 60) {
      warnings.push(`Critical Glycemia: ${sugarVal} mg/dL`);
      isCritical = true;
    } else if (sugarVal > 140) {
      warnings.push(`Elevated Blood Sugar: ${sugarVal} mg/dL`);
    }
  }

  // 4. Body Temperature Check
  if (vitals.temperatureF > 102.5) {
    warnings.push(`High Grade Fever: ${vitals.temperatureF}°F`);
    if (vitals.temperatureF >= 104) isCritical = true;
  }

  // 5. Heart Rate / Pulse Check
  if (vitals.heartRate > 0) {
    if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      warnings.push(`Abnormal Heart Rate: ${vitals.heartRate} bpm`);
      if (vitals.heartRate > 140 || vitals.heartRate < 40) isCritical = true;
    }
  }

  const color: 'GREEN' | 'YELLOW' | 'RED' = isCritical ? 'RED' : warnings.length > 0 ? 'YELLOW' : 'GREEN';
  return { isCritical, warnings, color };
}
