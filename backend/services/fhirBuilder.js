/**
 * HL7 FHIR R4 Resource Builder Service (Backend Spec)
 * Implements National Resource Centre for EHR Standards (NRCES) India Profiles
 * Document Types: OPConsultation, DischargeSummary, DiagnosticReport, Prescription, ImmunizationRecord, WellnessRecord
 * Strictly zero unicode emojis.
 */

class FhirBuilder {
  /**
   * Build FHIR Patient Resource (NRCES India Profile)
   */
  static buildPatient(patientData = {}) {
    const timestamp = new Date().toISOString();
    return {
      resourceType: 'Patient',
      id: patientData.id || `PT-${Date.now()}`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient']
      },
      identifier: [
        {
          type: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical record number' }]
          },
          system: 'https://healthway.maharashtra.gov.in/patient-id',
          value: patientData.patientId || 'HW-PAT-001'
        },
        {
          type: {
            coding: [{ system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code', code: 'ABHA', display: 'Ayushman Bharat Health Account' }]
          },
          system: 'https://healthid.ndhm.gov.in',
          value: patientData.abhaId || '14-1234-5678-9012'
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          text: patientData.name || 'Sunita Ramchandra Jadhav',
          family: patientData.familyName || 'Jadhav',
          given: patientData.givenNames || ['Sunita', 'Ramchandra']
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: patientData.phone || '+91 98230 12345',
          use: 'mobile'
        }
      ],
      gender: patientData.gender || 'female',
      birthDate: patientData.birthDate || '1996-05-14',
      address: [
        {
          use: 'home',
          line: patientData.addressLine || ['Sub-Centre Vadgaon, Shirur'],
          city: patientData.city || 'Shirur',
          district: patientData.district || 'Pune',
          state: patientData.state || 'Maharashtra',
          postalCode: patientData.postalCode || '412210',
          country: 'IND'
        }
      ]
    };
  }

  /**
   * Build FHIR Encounter Resource
   */
  static buildEncounter(encounterData = {}) {
    const start = encounterData.start || new Date().toISOString();
    return {
      resourceType: 'Encounter',
      id: encounterData.id || `ENC-${Date.now()}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter']
      },
      status: encounterData.status || 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: encounterData.classCode || 'AMB',
        display: encounterData.classDisplay || 'ambulatory'
      },
      subject: {
        reference: `Patient/${encounterData.patientId || 'PT-001'}`,
        display: encounterData.patientName || 'Sunita Ramchandra Jadhav'
      },
      serviceProvider: {
        display: encounterData.facilityName || 'Primary Health Centre Wagholi, Pune'
      },
      period: {
        start,
        end: encounterData.end || new Date(Date.now() + 1800000).toISOString()
      }
    };
  }

  /**
   * Build FHIR Vital Signs Observation
   */
  static buildObservation(obsData = {}) {
    const loincMap = {
      'BP': { code: '85354-9', display: 'Blood pressure panel with all children optional' },
      'HEMOGLOBIN': { code: '718-7', display: 'Hemoglobin [Mass/volume] in Blood' },
      'GLUCOSE': { code: '2339-0', display: 'Glucose [Mass/volume] in Blood' },
      'SPO2': { code: '59408-5', display: 'Oxygen saturation in Arterial blood by Pulse oximetry' },
      'PULSE': { code: '8867-4', display: 'Heart rate' },
      'TEMPERATURE': { code: '8310-5', display: 'Body temperature' },
      'WEIGHT': { code: '29463-7', display: 'Body weight' },
      'BMI': { code: '39156-5', display: 'Body mass index (BMI) [Ratio]' }
    };

    const type = (obsData.type || 'BP').toUpperCase();
    const config = loincMap[type] || loincMap['BP'];

    if (type === 'BP') {
      return {
        resourceType: 'Observation',
        id: obsData.id || `OBS-BP-${Date.now()}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{ system: 'http://loinc.org', code: config.code, display: config.display }],
          text: 'Blood Pressure'
        },
        subject: { reference: `Patient/${obsData.patientId || 'PT-001'}` },
        component: [
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
            valueQuantity: { value: obsData.systolic || 120, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
          },
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
            valueQuantity: { value: obsData.diastolic || 80, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
          }
        ]
      };
    }

    return {
      resourceType: 'Observation',
      id: obsData.id || `OBS-${type}-${Date.now()}`,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{ system: 'http://loinc.org', code: config.code, display: config.display }],
        text: obsData.label || type
      },
      subject: { reference: `Patient/${obsData.patientId || 'PT-001'}` },
      valueQuantity: {
        value: obsData.value || 10.6,
        unit: obsData.unit || 'g/dL',
        system: 'http://unitsofmeasure.org',
        code: obsData.unit || 'g/dL'
      },
      interpretation: obsData.interpretation ? [{
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: obsData.interpretation, display: obsData.interpretation }]
      }] : undefined
    };
  }

  /**
   * Build FHIR Condition Resource
   */
  static buildCondition(condData = {}) {
    return {
      resourceType: 'Condition',
      id: condData.id || `COND-${Date.now()}`,
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: condData.clinicalStatus || 'active' }]
      },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
      },
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: condData.icd10 || 'O26.9',
            display: condData.icd10Display || 'Pregnancy-related condition, unspecified'
          },
          {
            system: 'http://snomed.info/sct',
            code: condData.snomed || '77386006',
            display: condData.snomedDisplay || 'Pregnant'
          }
        ],
        text: condData.text || 'Antenatal Care - Second Trimester'
      },
      subject: { reference: `Patient/${condData.patientId || 'PT-001'}` }
    };
  }

  /**
   * Build FHIR MedicationRequest Resource
   */
  static buildMedicationRequest(medData = {}) {
    return {
      resourceType: 'MedicationRequest',
      id: medData.id || `MED-${Date.now()}`,
      status: medData.status || 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: medData.snomedCode || '319864009',
          display: medData.name || 'Ferrous fumarate + Folic acid'
        }],
        text: medData.fullDescription || 'Iron Folic Acid (IFA) Tablets IP - 100mg elemental iron + 500mcg folic acid'
      },
      subject: { reference: `Patient/${medData.patientId || 'PT-001'}` },
      dosageInstruction: [
        {
          text: medData.instructions || 'One tablet daily after dinner with water for 90 days',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } }
        }
      ]
    };
  }

  /**
   * Build FHIR Immunization Resource
   */
  static buildImmunization(immData = {}) {
    return {
      resourceType: 'Immunization',
      id: immData.id || `IMM-${Date.now()}`,
      status: 'completed',
      vaccineCode: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: immData.snomed || '333598008',
          display: immData.vaccineName || 'Tetanus and adult diphtheria vaccine'
        }],
        text: immData.vaccineName || 'Td Vaccine (Dose 1)'
      },
      patient: { reference: `Patient/${immData.patientId || 'PT-001'}` },
      occurrenceDateTime: immData.date || new Date().toISOString(),
      lotNumber: immData.lotNumber || 'LOT-MH-2024-81',
      doseQuantity: {
        value: 0.5,
        unit: 'mL',
        system: 'http://unitsofmeasure.org',
        code: 'mL'
      }
    };
  }

  /**
   * Build FHIR Composition Resource (Document Header)
   */
  static buildComposition(compData = {}) {
    const timestamp = new Date().toISOString();
    return {
      resourceType: 'Composition',
      id: compData.id || `COMP-${Date.now()}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Composition']
      },
      status: 'final',
      type: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: compData.docTypeCode || '371530004',
          display: compData.docTypeDisplay || 'Clinical consultation report'
        }],
        text: compData.docTypeName || 'Outpatient Consultation Note'
      },
      subject: { reference: `Patient/${compData.patientId || 'PT-001'}` },
      date: timestamp,
      author: [
        {
          display: compData.doctorName || 'Dr. Rajesh Deshmukh, MBBS (Reg: MMC-2015-0842)'
        }
      ],
      title: compData.title || 'PHC Wagholi Outpatient Record',
      custodian: {
        display: 'Public Health Department, Government of Maharashtra'
      },
      section: compData.sections || [
        {
          title: 'Chief Complaint & History',
          text: { status: 'generated', div: '<div>Routine ANC checkup at 26 weeks gestation</div>' }
        },
        {
          title: 'Vital Signs & Clinical Observations',
          text: { status: 'generated', div: '<div>BP 118/76 mmHg, Hemoglobin 10.6 g/dL</div>' }
        },
        {
          title: 'Prescribed Medications',
          text: { status: 'generated', div: '<div>Iron Folic Acid (IFA) 100mg/500mcg - 90 days</div>' }
        }
      ]
    };
  }

  /**
   * Build Full FHIR R4 Bundle for any of the 6 Document Types
   */
  static buildDocumentBundle(documentType = 'OPConsultation', data = {}) {
    const bundleId = `HW-FHIR-${documentType}-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const patient = this.buildPatient(data.patient || {});
    const encounter = this.buildEncounter({ ...data.encounter, patientId: patient.id });
    const composition = this.buildComposition({
      ...data.composition,
      patientId: patient.id,
      docTypeName: documentType,
      title: `${documentType} - ${patient.name[0].text}`
    });

    const entries = [
      { fullUrl: `urn:uuid:${composition.id}`, resource: composition },
      { fullUrl: `urn:uuid:${patient.id}`, resource: patient },
      { fullUrl: `urn:uuid:${encounter.id}`, resource: encounter }
    ];

    if (documentType === 'OPConsultation') {
      const cond = this.buildCondition({ patientId: patient.id });
      const bp = this.buildObservation({ type: 'BP', systolic: 118, diastolic: 76, patientId: patient.id });
      const hb = this.buildObservation({ type: 'HEMOGLOBIN', value: 10.6, unit: 'g/dL', patientId: patient.id, interpretation: 'L' });
      const med = this.buildMedicationRequest({ patientId: patient.id });
      entries.push(
        { fullUrl: `urn:uuid:${cond.id}`, resource: cond },
        { fullUrl: `urn:uuid:${bp.id}`, resource: bp },
        { fullUrl: `urn:uuid:${hb.id}`, resource: hb },
        { fullUrl: `urn:uuid:${med.id}`, resource: med }
      );
    } else if (documentType === 'DischargeSummary') {
      const cond = this.buildCondition({ patientId: patient.id, text: 'Normal Spontaneous Vaginal Delivery', icd10: 'O80' });
      const med = this.buildMedicationRequest({ patientId: patient.id, name: 'Amoxicillin 500mg + Paracetamol 650mg' });
      entries.push(
        { fullUrl: `urn:uuid:${cond.id}`, resource: cond },
        { fullUrl: `urn:uuid:${med.id}`, resource: med }
      );
    } else if (documentType === 'DiagnosticReport') {
      const hb = this.buildObservation({ type: 'HEMOGLOBIN', value: 10.6, unit: 'g/dL', patientId: patient.id });
      const glucose = this.buildObservation({ type: 'GLUCOSE', value: 94, unit: 'mg/dL', patientId: patient.id, label: 'Fasting Blood Sugar' });
      entries.push(
        { fullUrl: `urn:uuid:${hb.id}`, resource: hb },
        { fullUrl: `urn:uuid:${glucose.id}`, resource: glucose }
      );
    } else if (documentType === 'Prescription') {
      const med1 = this.buildMedicationRequest({ patientId: patient.id, name: 'Iron Folic Acid IP', instructions: '1 tablet daily at night' });
      const med2 = this.buildMedicationRequest({ patientId: patient.id, name: 'Calcium + Vitamin D3', instructions: '1 tablet twice daily' });
      entries.push(
        { fullUrl: `urn:uuid:${med1.id}`, resource: med1 },
        { fullUrl: `urn:uuid:${med2.id}`, resource: med2 }
      );
    } else if (documentType === 'ImmunizationRecord') {
      const imm1 = this.buildImmunization({ patientId: patient.id, vaccineName: 'Td Vaccine (Booster)', snomed: '333598008' });
      const imm2 = this.buildImmunization({ patientId: patient.id, vaccineName: 'Hepatitis B Dose 1', snomed: '384810002' });
      entries.push(
        { fullUrl: `urn:uuid:${imm1.id}`, resource: imm1 },
        { fullUrl: `urn:uuid:${imm2.id}`, resource: imm2 }
      );
    } else if (documentType === 'WellnessRecord') {
      const pulse = this.buildObservation({ type: 'PULSE', value: 72, unit: 'beats/minute', patientId: patient.id });
      const spo2 = this.buildObservation({ type: 'SPO2', value: 99, unit: '%', patientId: patient.id });
      const bmi = this.buildObservation({ type: 'BMI', value: 21.4, unit: 'kg/m2', patientId: patient.id });
      entries.push(
        { fullUrl: `urn:uuid:${pulse.id}`, resource: pulse },
        { fullUrl: `urn:uuid:${spo2.id}`, resource: spo2 },
        { fullUrl: `urn:uuid:${bmi.id}`, resource: bmi }
      );
    }

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle']
      },
      identifier: {
        system: 'https://healthway.maharashtra.gov.in/fhir',
        value: bundleId
      },
      type: 'document',
      timestamp,
      total: entries.length,
      entry: entries
    };
  }
}

module.exports = FhirBuilder;
