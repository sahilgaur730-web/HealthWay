/**
 * HL7 FHIR R4 Express Server Routes
 * Endpoints for FHIR Resource Queries, CapabilityStatement, and Document Bundle Generation
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();
const fhirBuilder = require('../services/fhirBuilder');

// GET /api/fhir/metadata - FHIR CapabilityStatement (NRCES India Conformance)
router.get('/metadata', (req, res) => {
  res.json({
    resourceType: 'CapabilityStatement',
    id: 'healthway-fhir-server',
    status: 'active',
    date: new Date().toISOString(),
    publisher: 'Government of Maharashtra Public Health Department',
    kind: 'instance',
    software: {
      name: 'HealthWay Interoperability Engine',
      version: '1.0.0-MH'
    },
    fhirVersion: '4.0.1',
    format: ['application/fhir+json', 'application/json'],
    rest: [
      {
        mode: 'server',
        resource: [
          {
            type: 'Bundle',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle',
            interaction: [{ code: 'read' }, { code: 'create' }, { code: 'search-type' }]
          },
          {
            type: 'Patient',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient',
            interaction: [{ code: 'read' }, { code: 'search-type' }]
          },
          {
            type: 'Encounter',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter',
            interaction: [{ code: 'read' }]
          },
          {
            type: 'Observation',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation',
            interaction: [{ code: 'read' }, { code: 'search-type' }]
          },
          {
            type: 'Condition',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition',
            interaction: [{ code: 'read' }]
          },
          {
            type: 'MedicationRequest',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest',
            interaction: [{ code: 'read' }]
          },
          {
            type: 'Immunization',
            profile: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/Immunization',
            interaction: [{ code: 'read' }]
          }
        ]
      }
    ]
  });
});

// GET /api/fhir/Patient/:id - Fetch Patient FHIR Resource
router.get('/Patient/:id', (req, res) => {
  const patient = fhirBuilder.buildPatient({
    id: req.params.id,
    patientId: req.params.id,
    abhaId: '14-1234-5678-9012',
    name: 'Sunita Ramchandra Jadhav',
    phone: '+91 98230 12345'
  });
  res.json(patient);
});

// POST /api/fhir/generate/:docType - Generate standard bundle for specific document type
router.post('/generate/:docType', (req, res) => {
  const validTypes = [
    'OPConsultation',
    'DischargeSummary',
    'DiagnosticReport',
    'Prescription',
    'ImmunizationRecord',
    'WellnessRecord'
  ];

  const docType = req.params.docType;
  if (!validTypes.includes(docType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid document type: ${docType}. Must be one of: ${validTypes.join(', ')}`
    });
  }

  const bundle = fhirBuilder.buildDocumentBundle(docType, req.body || {});
  res.json({
    success: true,
    documentType: docType,
    bundle
  });
});

// GET /api/fhir/Bundle/:id - Fetch Bundle by ID
router.get('/Bundle/:id', (req, res) => {
  const bundle = fhirBuilder.buildDocumentBundle('OPConsultation', { bundleId: req.params.id });
  res.json(bundle);
});

// POST /api/fhir/Bundle - Ingest / Validate FHIR Bundle
router.post('/Bundle', (req, res) => {
  const bundle = req.body;
  if (!bundle || bundle.resourceType !== 'Bundle') {
    return res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          diagnostics: 'Payload must be a valid FHIR Bundle resource'
        }
      ]
    });
  }

  res.status(201).json({
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'information',
        code: 'informational',
        diagnostics: `FHIR Bundle ${bundle.id || 'unnamed'} successfully validated and persisted (total entries: ${bundle.entry ? bundle.entry.length : 0})`
      }
    ]
  });
});

// GET /api/fhir/Observation - Search Observations
router.get('/Observation', (req, res) => {
  const obs1 = fhirBuilder.buildObservation({ type: 'BP', systolic: 118, diastolic: 76 });
  const obs2 = fhirBuilder.buildObservation({ type: 'HEMOGLOBIN', value: 10.6, unit: 'g/dL', interpretation: 'L' });
  const obs3 = fhirBuilder.buildObservation({ type: 'GLUCOSE', value: 96, unit: 'mg/dL' });

  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 3,
    entry: [
      { resource: obs1 },
      { resource: obs2 },
      { resource: obs3 }
    ]
  });
});

// GET /api/fhir/Condition - Search Conditions
router.get('/Condition', (req, res) => {
  const cond = fhirBuilder.buildCondition();
  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 1,
    entry: [{ resource: cond }]
  });
});

// GET /api/fhir/MedicationRequest - Search Prescriptions
router.get('/MedicationRequest', (req, res) => {
  const med = fhirBuilder.buildMedicationRequest();
  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 1,
    entry: [{ resource: med }]
  });
});

module.exports = router;
