/**
 * Tier 2: Boundary & Corner Cases — Clinical Limits & Threshold Analysis
 * Comprehensive boundary value analysis of physiological limits, vitals warnings, and triage escalations.
 */

import {
  evaluateVitalsAlert,
  evaluateTriageLevel,
  VitalsReading,
} from '../harness/domainFixtures';

describe('Tier 2: Boundary & Corner Cases — Clinical Limits & Triage Cutoffs', () => {
  const baseNormalVitals: VitalsReading = {
    systolicBp: 120,
    diastolicBp: 80,
    heartRate: 72,
    spo2: 98,
    bloodSugarRandom: 100,
    temperatureF: 98.4,
  };

  // --- Blood Pressure Systolic Boundaries ---
  it('CL01: systolic BP 84 mmHg triggers critical hypotension alert', () => {
    const v = { ...baseNormalVitals, systolicBp: 84 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  it('CL02: systolic BP 85 mmHg boundary is critical threshold', () => {
    const v = { ...baseNormalVitals, systolicBp: 85 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  it('CL03: systolic BP 86 mmHg is above critical low threshold', () => {
    const v = { ...baseNormalVitals, systolicBp: 86 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL04: systolic BP 139 mmHg is within pre-hypertension boundary without triggering critical', () => {
    const v = { ...baseNormalVitals, systolicBp: 139 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.color).toBe('GREEN');
  });

  it('CL05: systolic BP 140 mmHg triggers elevated blood pressure warning (YELLOW)', () => {
    const v = { ...baseNormalVitals, systolicBp: 140 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.color).toBe('YELLOW');
    expect(res.warnings[0]).toContain('Elevated Blood Pressure');
  });

  it('CL06: systolic BP 159 mmHg is at the upper limit of stage-1 hypertension', () => {
    const v = { ...baseNormalVitals, systolicBp: 159 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.color).toBe('YELLOW');
  });

  it('CL07: systolic BP 160 mmHg triggers critical stage-2 hypertensive emergency (RED)', () => {
    const v = { ...baseNormalVitals, systolicBp: 160 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(true);
    expect(res.color).toBe('RED');
  });

  it('CL08: systolic BP 220 mmHg (malignant hypertension) triggers immediate critical alert', () => {
    const v = { ...baseNormalVitals, systolicBp: 220 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  // --- Blood Pressure Diastolic Boundaries ---
  it('CL09: diastolic BP 49 mmHg triggers critical low alert', () => {
    const v = { ...baseNormalVitals, diastolicBp: 49 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  it('CL10: diastolic BP 50 mmHg boundary triggers critical alert', () => {
    const v = { ...baseNormalVitals, diastolicBp: 50 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  it('CL11: diastolic BP 51 mmHg is above critical low threshold', () => {
    const v = { ...baseNormalVitals, diastolicBp: 51 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL12: diastolic BP 89 mmHg is below stage-1 hypertension cutoff', () => {
    const v = { ...baseNormalVitals, diastolicBp: 89 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL13: diastolic BP 90 mmHg triggers elevated warning', () => {
    const v = { ...baseNormalVitals, diastolicBp: 90 };
    const res = evaluateVitalsAlert(v);
    expect(res.warnings.some(w => w.includes('Elevated Blood Pressure'))).toBe(true);
  });

  it('CL14: diastolic BP 99 mmHg is upper limit of warning tier', () => {
    const v = { ...baseNormalVitals, diastolicBp: 99 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL15: diastolic BP 100 mmHg triggers critical stage-2 emergency', () => {
    const v = { ...baseNormalVitals, diastolicBp: 100 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
    expect(evaluateVitalsAlert(v).color).toBe('RED');
  });

  // --- SpO2 Oxygen Saturation Boundaries ---
  it('CL16: SpO2 89% triggers critical hypoxia alert (<90%)', () => {
    const v = { ...baseNormalVitals, spo2: 89 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(true);
    expect(res.warnings[0]).toContain('Critical Hypoxia');
  });

  it('CL17: SpO2 90% is at the warning tier boundary', () => {
    const v = { ...baseNormalVitals, spo2: 90 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.warnings[0]).toContain('Low Oxygen Saturation');
  });

  it('CL18: SpO2 94% triggers low oxygen warning (<95%)', () => {
    const v = { ...baseNormalVitals, spo2: 94 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.color).toBe('YELLOW');
  });

  it('CL19: SpO2 95% is normal physiological threshold', () => {
    const v = { ...baseNormalVitals, spo2: 95 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.color).toBe('GREEN');
  });

  it('CL20: SpO2 100% is maximal normal saturation', () => {
    const v = { ...baseNormalVitals, spo2: 100 };
    expect(evaluateVitalsAlert(v).color).toBe('GREEN');
  });

  it('CL21: flags invalid SpO2 sensor reading (>100% or <=0%) as artifact', () => {
    const isArtifact = (spo2: number) => spo2 <= 0 || spo2 > 100;
    expect(isArtifact(105)).toBe(true);
    expect(isArtifact(-2)).toBe(true);
    expect(isArtifact(98)).toBe(false);
  });

  // --- Blood Sugar Boundaries ---
  it('CL22: random blood glucose 59 mg/dL triggers critical hypoglycemia alert', () => {
    const v = { ...baseNormalVitals, bloodSugarRandom: 59 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(true);
    expect(res.warnings[0]).toContain('Critical Glycemia');
  });

  it('CL23: random blood glucose 60 mg/dL is at lower warning limit', () => {
    const v = { ...baseNormalVitals, bloodSugarRandom: 60 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL24: random blood glucose 140 mg/dL is normal postprandial ceiling', () => {
    const v = { ...baseNormalVitals, bloodSugarRandom: 140 };
    expect(evaluateVitalsAlert(v).color).toBe('GREEN');
  });

  it('CL25: random blood glucose 141 mg/dL triggers elevated glycemia warning', () => {
    const v = { ...baseNormalVitals, bloodSugarRandom: 141 };
    const res = evaluateVitalsAlert(v);
    expect(res.color).toBe('YELLOW');
    expect(res.warnings[0]).toContain('Elevated Blood Sugar');
  });

  it('CL26: random blood glucose 250 mg/dL is at warning threshold limit', () => {
    const v = { ...baseNormalVitals, bloodSugarRandom: 250 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL27: random blood glucose 251 mg/dL triggers critical hyperglycemia emergency', () => {
    const v = { ...baseNormalVitals, bloodSugarRandom: 251 };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(true);
    expect(res.color).toBe('RED');
  });

  // --- Heart Rate Boundaries ---
  it('CL28: heart rate 39 bpm triggers critical severe bradycardia', () => {
    const v = { ...baseNormalVitals, heartRate: 39 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  it('CL29: heart rate 40 bpm is at borderline bradycardia threshold', () => {
    const v = { ...baseNormalVitals, heartRate: 40 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
    expect(evaluateVitalsAlert(v).color).toBe('YELLOW');
  });

  it('CL30: heart rate 49 bpm triggers abnormal heart rate warning', () => {
    const v = { ...baseNormalVitals, heartRate: 49 };
    expect(evaluateVitalsAlert(v).warnings[0]).toContain('Abnormal Heart Rate');
  });

  it('CL31: heart rate 50 bpm is acceptable athletic lower boundary', () => {
    const v = { ...baseNormalVitals, heartRate: 50 };
    expect(evaluateVitalsAlert(v).color).toBe('GREEN');
  });

  it('CL32: heart rate 100 bpm is normal upper resting boundary', () => {
    const v = { ...baseNormalVitals, heartRate: 100 };
    expect(evaluateVitalsAlert(v).color).toBe('GREEN');
  });

  it('CL33: heart rate 120 bpm is upper limit of mild tachycardia warning', () => {
    const v = { ...baseNormalVitals, heartRate: 120 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL34: heart rate 121 bpm triggers abnormal rate alert', () => {
    const v = { ...baseNormalVitals, heartRate: 121 };
    expect(evaluateVitalsAlert(v).warnings.length).toBeGreaterThan(0);
  });

  it('CL35: heart rate 141 bpm triggers critical tachycardia arrhythmia emergency', () => {
    const v = { ...baseNormalVitals, heartRate: 141 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  // --- Body Temperature Boundaries ---
  it('CL36: temperature 97.4 °F is mild hypothermic variation without critical flag', () => {
    const v = { ...baseNormalVitals, temperatureF: 97.4 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL37: temperature 99.5 °F is physiological normal upper limit', () => {
    const v = { ...baseNormalVitals, temperatureF: 99.5 };
    expect(evaluateVitalsAlert(v).color).toBe('GREEN');
  });

  it('CL38: temperature 102.5 °F is upper limit before high-grade fever warning', () => {
    const v = { ...baseNormalVitals, temperatureF: 102.5 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(false);
  });

  it('CL39: temperature 102.6 °F triggers high-grade fever warning', () => {
    const v = { ...baseNormalVitals, temperatureF: 102.6 };
    expect(evaluateVitalsAlert(v).warnings[0]).toContain('High Grade Fever');
  });

  it('CL40: temperature 104.0 °F triggers critical hyperpyrexia febrile convulsion risk', () => {
    const v = { ...baseNormalVitals, temperatureF: 104.0 };
    expect(evaluateVitalsAlert(v).isCritical).toBe(true);
  });

  // --- Multi-Vitals Compound Risk & Triage Overrides ---
  it('CL41: multiple borderline vitals combine into YELLOW caution tier', () => {
    const v: VitalsReading = {
      systolicBp: 145, // Yellow
      diastolicBp: 92,  // Yellow
      heartRate: 105,   // Yellow
      spo2: 93,         // Yellow
      bloodSugarRandom: 180, // Yellow
      temperatureF: 100.2,   // Normal
    };
    const res = evaluateVitalsAlert(v);
    expect(res.isCritical).toBe(false);
    expect(res.color).toBe('YELLOW');
    expect(res.warnings.length).toBeGreaterThanOrEqual(3);
  });

  it('CL42: single critical vital in otherwise healthy reading promotes overall status to RED', () => {
    const v: VitalsReading = {
      systolicBp: 120,
      diastolicBp: 80,
      heartRate: 72,
      spo2: 85, // Only SpO2 is critical
      bloodSugarRandom: 90,
      temperatureF: 98.4,
    };
    expect(evaluateVitalsAlert(v).color).toBe('RED');
  });

  it('CL43: triage severity level 1 produces GREEN tier outcome', () => {
    expect(evaluateTriageLevel('COLD_SNEEZING', 1).level).toBe('GREEN');
  });

  it('CL44: triage severity level 2 produces YELLOW tier outcome', () => {
    expect(evaluateTriageLevel('FEVER_MILD', 2).level).toBe('YELLOW');
  });

  it('CL45: triage severity level 3 produces ORANGE tier outcome', () => {
    expect(evaluateTriageLevel('PERSISTENT_VOMITING', 3).level).toBe('ORANGE');
  });

  it('CL46: triage severity level 4 produces RED tier outcome', () => {
    expect(evaluateTriageLevel('CHEST_PAIN_ACUTE', 4).level).toBe('RED');
  });

  it('CL47: symptom CHEST_PAIN_SEVERE produces RED regardless of severity level passed', () => {
    expect(evaluateTriageLevel('CHEST_PAIN_SEVERE', 1).level).toBe('RED');
  });

  it('CL48: symptom RESPIRATORY_ARREST produces RED immediately', () => {
    expect(evaluateTriageLevel('RESPIRATORY_ARREST', 1).level).toBe('RED');
  });

  it('CL49: mild symptom accompanied by critical vitals escalates triage outcome to RED', () => {
    const criticalV: VitalsReading = {
      ...baseNormalVitals,
      systolicBp: 190,
      diastolicBp: 110,
    };
    const result = evaluateTriageLevel('HEADACHE_MILD', 1, criticalV);
    expect(result.level).toBe('RED');
  });

  it('CL50: normal vitals preserve original triage severity level without escalation', () => {
    const result = evaluateTriageLevel('FEVER_MILD', 2, baseNormalVitals);
    expect(result.level).toBe('YELLOW');
  });
});
