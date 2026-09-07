/**
 * HL7 FHIR R4 Client Service
 * Implements NRCES India Profiles for ABDM Ecosystem
 * Strictly zero unicode emojis.
 */

import { ABDM_STANDARDS, FHIR_DOCUMENT_TYPES } from './interopStandards';

export interface FhirResourceSummary {
  id: string;
  resourceType: 'Patient' | 'Encounter' | 'Observation' | 'Condition' | 'MedicationRequest' | 'DiagnosticReport' | 'Immunization' | 'Composition';
  documentType: 'OPConsultation' | 'DischargeSummary' | 'DiagnosticReport' | 'Prescription' | 'ImmunizationRecord' | 'WellnessRecord';
  profile: string;
  patientName: string;
  patientAbhaId: string;
  date: string;
  facility: string;
  doctor: string;
  title: string;
  titleMr: string;
  summary: string;
  summaryMr: string;
  coding: {
    system: string;
    code: string;
    display: string;
  };
  rawJson: Record<string, any>;
}

export const MOCK_FHIR_RESOURCES: FhirResourceSummary[] = [
  {
    id: 'FHIR-OPC-2024-001',
    resourceType: 'Composition',
    documentType: 'OPConsultation',
    profile: ABDM_STANDARDS.profiles.COMPOSITION,
    patientName: 'Sunita D. Patil',
    patientAbhaId: '14-2536-7890-1234',
    date: '2024-11-20T10:30:00Z',
    facility: 'PHC Wagholi (Haveli Block)',
    doctor: 'Dr. Rahul Shinde (MBBS, DNB)',
    title: 'Second Trimester Antenatal Care Consultation',
    titleMr: 'दुसरा तिमाही प्रसूतीपूर्व तपासणी गोषवारा',
    summary: '24-week ANC follow-up. Gestational hypertension observed (BP 142/92). IFA and Calcium supplements prescribed.',
    summaryMr: '२४ आठवड्यांची प्रसूतीपूर्व तपासणी. सौम्य उच्च रक्तदाब (१४२/९२). आयर्न-फॉलिक अॅसिड व कॅल्शियम गोळ्या देण्यात आल्या.',
    coding: {
      system: ABDM_STANDARDS.terminologies.SNOMED_CT,
      code: '371530004',
      display: 'Clinical consultation report'
    },
    rawJson: {
      resourceType: 'Composition',
      id: 'FHIR-OPC-2024-001',
      meta: {
        profile: [ABDM_STANDARDS.profiles.COMPOSITION],
        lastUpdated: '2024-11-20T10:30:00Z'
      },
      status: 'final',
      type: {
        coding: [{
          system: ABDM_STANDARDS.terminologies.SNOMED_CT,
          code: '371530004',
          display: 'Clinical consultation report'
        }]
      },
      subject: { reference: 'Patient/14-2536-7890-1234', display: 'Sunita D. Patil' },
      encounter: { reference: 'Encounter/ENC-2024-0982' },
      author: [{ reference: 'Practitioner/DOC-MH-4421', display: 'Dr. Rahul Shinde' }],
      title: 'OPD Antenatal Clinical Summary',
      section: [
        {
          title: 'Chief Complaints',
          text: { status: 'generated', div: '<div>Mild headache, lower back pain, bilateral foot edema.</div>' }
        },
        {
          title: 'Vital Signs',
          entry: [{ reference: 'Observation/OBS-BP-142-92' }, { reference: 'Observation/OBS-HR-82' }]
        }
      ]
    }
  },
  {
    id: 'FHIR-OBS-2024-002',
    resourceType: 'Observation',
    documentType: 'WellnessRecord',
    profile: ABDM_STANDARDS.profiles.OBSERVATION,
    patientName: 'Sunita D. Patil',
    patientAbhaId: '14-2536-7890-1234',
    date: '2024-11-20T10:35:00Z',
    facility: 'PHC Wagholi (Haveli Block)',
    doctor: 'Dr. Rahul Shinde (MBBS)',
    title: 'Blood Pressure & Maternal Vitals Observation',
    titleMr: 'रक्तदाब व माता आरोग्य मानके निरीक्षण',
    summary: 'Systolic 142 mmHg, Diastolic 92 mmHg, Heart Rate 82 bpm, SpO2 98%.',
    summaryMr: 'सिस्टोलिक १४२ मिमी, डायस्टोलिक ९२ मिमी, नाडी ८२/मिनिट, ऑक्सिजन ९८%.',
    coding: {
      system: ABDM_STANDARDS.terminologies.LOINC,
      code: '8480-6',
      display: 'Systolic blood pressure'
    },
    rawJson: {
      resourceType: 'Observation',
      id: 'FHIR-OBS-2024-002',
      meta: { profile: [ABDM_STANDARDS.profiles.OBSERVATION] },
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{ system: ABDM_STANDARDS.terminologies.LOINC, code: '8480-6', display: 'Systolic blood pressure' }]
      },
      subject: { reference: 'Patient/14-2536-7890-1234' },
      effectiveDateTime: '2024-11-20T10:35:00Z',
      valueQuantity: { value: 142, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
    }
  },
  {
    id: 'FHIR-LAB-2024-003',
    resourceType: 'DiagnosticReport',
    documentType: 'DiagnosticReport',
    profile: ABDM_STANDARDS.profiles.DIAGNOSTIC_REPORT,
    patientName: 'Sunita D. Patil',
    patientAbhaId: '14-2536-7890-1234',
    date: '2024-11-19T14:15:00Z',
    facility: 'District Hospital Pune Central Lab',
    doctor: 'Dr. Smita Kulkarni (Pathologist)',
    title: 'Complete Hemogram & Blood Glucose Diagnostic Report',
    titleMr: 'रक्त तपासणी व साखर निदान प्रयोगशाळा अहवाल',
    summary: 'Hemoglobin 9.4 g/dL (Mild Anemia flagged). Fasting Blood Glucose 98 mg/dL. Urine Albumin trace.',
    summaryMr: 'हिमोग्लोबिन ९.४ ग्रॅम/डेली (अशक्तपणा). उपाशीपोटी रक्त शर्करा ९८ मिग्रॅ/डेली. लघवीत अल्ब्युमिन सूक्ष्म.',
    coding: {
      system: ABDM_STANDARDS.terminologies.LOINC,
      code: '718-7',
      display: 'Hemoglobin [Mass/volume] in Blood'
    },
    rawJson: {
      resourceType: 'DiagnosticReport',
      id: 'FHIR-LAB-2024-003',
      meta: { profile: [ABDM_STANDARDS.profiles.DIAGNOSTIC_REPORT] },
      status: 'final',
      code: {
        coding: [{ system: ABDM_STANDARDS.terminologies.LOINC, code: '58410-2', display: 'CBC panel' }]
      },
      subject: { reference: 'Patient/14-2536-7890-1234' },
      conclusion: 'Mild gestational anemia (Hb 9.4 g/dL). Advised nutritional counselling and double dose IFA.',
      result: [
        { reference: 'Observation/OBS-HB-94', display: 'Hemoglobin: 9.4 g/dL (Low)' },
        { reference: 'Observation/OBS-GLU-98', display: 'Fasting Blood Sugar: 98 mg/dL (Normal)' }
      ]
    }
  },
  {
    id: 'FHIR-RX-2024-004',
    resourceType: 'MedicationRequest',
    documentType: 'Prescription',
    profile: ABDM_STANDARDS.profiles.MEDICATION_REQUEST,
    patientName: 'Sunita D. Patil',
    patientAbhaId: '14-2536-7890-1234',
    date: '2024-11-20T10:45:00Z',
    facility: 'PHC Wagholi (Haveli Block)',
    doctor: 'Dr. Rahul Shinde (MBBS)',
    title: 'Maternal Micronutrient & Iron Supplementation Prescription',
    titleMr: 'आयर्न व कॅल्शियम पोषण पूरक औषधोपचार',
    summary: 'Iron Folic Acid (100mg elemental iron + 500mcg folic acid) 1 OD x 60 days, Calcium Carbonate 500mg 1 BD x 60 days.',
    summaryMr: 'आयर्न फोलिक अॅसिड गोळी रोज १ x ६० दिवस, कॅल्शियम ५०० मिग्रॅ रोज २ वेळेस x ६० दिवस.',
    coding: {
      system: ABDM_STANDARDS.terminologies.RxNorm,
      code: '310430',
      display: 'Ferrous sulfate 200 MG Oral Tablet'
    },
    rawJson: {
      resourceType: 'MedicationRequest',
      id: 'FHIR-RX-2024-004',
      meta: { profile: [ABDM_STANDARDS.profiles.MEDICATION_REQUEST] },
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [{ system: ABDM_STANDARDS.terminologies.RxNorm, code: '310430', display: 'Iron Folic Acid Tablet' }],
        text: 'Iron Folic Acid (IFA) Red Tablet'
      },
      subject: { reference: 'Patient/14-2536-7890-1234' },
      authoredOn: '2024-11-20T10:45:00Z',
      dosageInstruction: [{
        text: 'Take 1 tablet daily after food with lemon water',
        timing: { code: { text: 'Once Daily (OD)' } }
      }]
    }
  },
  {
    id: 'FHIR-IMM-2024-005',
    resourceType: 'Immunization',
    documentType: 'ImmunizationRecord',
    profile: ABDM_STANDARDS.profiles.IMMUNIZATION,
    patientName: 'Sunita D. Patil',
    patientAbhaId: '14-2536-7890-1234',
    date: '2024-09-14T11:00:00Z',
    facility: 'Sub-Centre Vadgaon (Haveli)',
    doctor: 'ASHA Surekha Jadhav / ANM Kavita More',
    title: 'Tetanus and Adult Diphtheria (Td-1) Maternal Vaccine',
    titleMr: 'धनुर्वात व घटसर्प (Td-1) माता लसीकरण',
    summary: 'Td Booster Dose 1 administered in left deltoid. Batch: TD-MH-9942. No adverse events observed.',
    summaryMr: 'डाव्या हातावर Td डोस १ देण्यात आला. बॅच: TD-MH-9942. कोणतीही दुष्परिणाम तक्रार नाही.',
    coding: {
      system: 'http://hl7.org/fhir/sid/cvx',
      code: '138',
      display: 'Td (adult) preservative free'
    },
    rawJson: {
      resourceType: 'Immunization',
      id: 'FHIR-IMM-2024-005',
      meta: { profile: [ABDM_STANDARDS.profiles.IMMUNIZATION] },
      status: 'completed',
      vaccineCode: {
        coding: [{ system: 'http://hl7.org/fhir/sid/cvx', code: '138', display: 'Td Adult Vaccine' }]
      },
      patient: { reference: 'Patient/14-2536-7890-1234' },
      occurrenceDateTime: '2024-09-14T11:00:00Z',
      lotNumber: 'TD-MH-9942',
      site: { coding: [{ system: ABDM_STANDARDS.terminologies.SNOMED_CT, code: '368209003', display: 'Left upper arm' }] }
    }
  },
  {
    id: 'FHIR-DIS-2024-006',
    resourceType: 'Composition',
    documentType: 'DischargeSummary',
    profile: ABDM_STANDARDS.profiles.COMPOSITION,
    patientName: 'Kishore B. Chavan',
    patientAbhaId: '91-4432-1109-8765',
    date: '2024-10-18T16:00:00Z',
    facility: 'District Hospital Pune',
    doctor: 'Dr. Anand Deshmukh (MD General Medicine)',
    title: 'Acute Gastroenteritis Hospital Inpatient Discharge Summary',
    titleMr: 'तीव्र गॅस्ट्रोइंटेस्टाइनल आजार डिस्चार्ज सारांश',
    summary: '3-day in-patient stabilization with IV Ringer Lactate and oral rehydration. Vitals normal at discharge.',
    summaryMr: '३ दिवस रुग्णालय भरती, आयव्ही फ्लुइड्स आणि ओआरएस उपचार. सुट्टीच्या वेळी प्रकृती स्थिर.',
    coding: {
      system: ABDM_STANDARDS.terminologies.SNOMED_CT,
      code: '373942005',
      display: 'Discharge summary'
    },
    rawJson: {
      resourceType: 'Composition',
      id: 'FHIR-DIS-2024-006',
      meta: { profile: [ABDM_STANDARDS.profiles.COMPOSITION] },
      status: 'final',
      type: { coding: [{ system: ABDM_STANDARDS.terminologies.SNOMED_CT, code: '373942005', display: 'Discharge summary' }] },
      subject: { reference: 'Patient/91-4432-1109-8765', display: 'Kishore B. Chavan' },
      date: '2024-10-18T16:00:00Z',
      title: 'In-patient Discharge Summary'
    }
  }
];

export class FhirService {
  public static getAllRecords(): FhirResourceSummary[] {
    return MOCK_FHIR_RESOURCES;
  }

  public static filterRecords(docType?: string, search?: string): FhirResourceSummary[] {
    return MOCK_FHIR_RESOURCES.filter(r => {
      const matchType = !docType || docType === 'ALL' || r.documentType === docType;
      const matchSearch = !search || 
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.patientAbhaId.includes(search) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }

  public static validateResource(resource: Record<string, any>): { valid: boolean; profile: string; errors: string[] } {
    const errors: string[] = [];
    if (!resource.resourceType) errors.push('Missing resourceType');
    if (!resource.id) errors.push('Missing unique identifier id');
    if (!resource.meta || !resource.meta.profile || resource.meta.profile.length === 0) {
      errors.push('Missing NRCES India profile validation meta');
    }
    return {
      valid: errors.length === 0,
      profile: resource.meta?.profile?.[0] || 'Unknown',
      errors
    };
  }
}
