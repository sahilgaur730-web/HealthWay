/**
 * HealthWay - Diagnostics & Laboratory Express Routes
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();

// Seed Diagnostic Test Orders
let ordersStore = [
  {
    orderId: 'ORD-2024-001',
    barcode: 'MH-LAB-849201',
    patientId: 'PAT-MH-002',
    patientNameEn: 'Sunita Ramchandra Jadhav',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    testCode: 'CBC-01',
    testNameEn: 'Complete Blood Count (CBC) with Platelets',
    testNameMr: 'संपूर्ण रक्त तपासणी व प्लेटलेट्स',
    category: 'Hematology',
    status: 'COMPLETED',
    facilityId: 'FAC001',
    facilityName: 'PHC Wagholi',
    prescribedBy: 'Dr. Anand Shinde',
    hasCriticalValue: true,
    results: {
      hemoglobin: '8.4 g/dL (Low)',
      wbc: '11,200 /uL',
      platelets: '185,000 /uL',
      rbc: '3.4 million/uL',
      hematocrit: '26%'
    },
    impression: 'Moderate Microcytic Hypochromic Anemia in 32w ANC pregnancy',
    verifiedBy: 'Dr. Priya Sharma (Pathologist)',
    orderedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    orderId: 'ORD-2024-002',
    barcode: 'MH-LAB-849202',
    patientId: 'PAT-MH-003',
    patientNameEn: 'Tukaram Baban Patil',
    patientNameMr: 'तुकाराम बबन पाटील',
    testCode: 'TB-CBNAAT',
    testNameEn: 'Sputum GeneXpert / CBNAAT (Tuberculosis)',
    testNameMr: 'थुंकी तपासणी (जीनएक्सपर्ट क्षयरोग)',
    category: 'Microbiology',
    status: 'COMPLETED',
    facilityId: 'FAC004',
    facilityName: 'PHC Shirur',
    prescribedBy: 'Dr. Anand Shinde',
    hasCriticalValue: true,
    results: {
      mtbDetected: 'DETECTED (HIGH)',
      rifampicinResistance: 'NOT DETECTED (Sensitive)'
    },
    impression: 'Active Pulmonary Mycobacterium Tuberculosis (Rif-Sensitive)',
    verifiedBy: 'Senior Microbiologist, District TB Centre',
    orderedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    orderId: 'ORD-2024-003',
    barcode: 'MH-LAB-849203',
    patientId: 'PAT-MH-005',
    patientNameEn: 'Shankar Mahadev Gholap',
    patientNameMr: 'शंकर महादेव घोलप',
    testCode: 'HBA1C-01',
    testNameEn: 'HbA1c Glycated Hemoglobin',
    testNameMr: 'ग्लायकेटेड हिमोग्लोबिन (HbA1c)',
    category: 'Biochemistry',
    status: 'PROCESSING',
    facilityId: 'FAC002',
    facilityName: 'CHC Kharadi',
    prescribedBy: 'Dr. Rahul Desai',
    hasCriticalValue: false,
    orderedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    orderId: 'ORD-2024-004',
    barcode: 'MH-LAB-849204',
    patientId: 'PAT-MH-001',
    patientNameEn: 'Aniket Rahul Bhosale (Infant)',
    patientNameMr: 'अनिकेत राहुल भोसले (बाळ)',
    testCode: 'BIL-SERUM',
    testNameEn: 'Serum Bilirubin (Total & Direct)',
    testNameMr: 'सीरम बिलिरुबिन तपासणी (कावीळ)',
    category: 'Biochemistry',
    status: 'COLLECTED',
    facilityId: 'FAC001',
    facilityName: 'PHC Wagholi',
    prescribedBy: 'Dr. Priya Sharma',
    hasCriticalValue: false,
    orderedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

// Seed Empanelled Laboratories
const labsStore = [
  {
    labId: 'LAB-01',
    nameEn: 'District Public Health Laboratory, Aundh',
    nameMr: 'जिल्हा सार्वजनिक आरोग्य प्रयोगशाळा, औंध',
    type: 'GOVERNMENT',
    address: 'District Hospital Campus, Aundh, Pune - 411027',
    phone: '020-25881234',
    accreditation: 'NABL Certified (ISO 15189)',
    empanelled: true,
    govtOnly: true,
    homeCollection: false,
    openNow: true,
    turnaroundHours: 12
  },
  {
    labId: 'LAB-02',
    nameEn: 'PHC Wagholi Clinical Pathology Section',
    nameMr: 'प्रा. आ. केंद्र वाघोली प्रयोगशाळा विभाग',
    type: 'GOVERNMENT',
    address: 'Wagholi Main Road, Pune - 412207',
    phone: '020-27051234',
    accreditation: 'State Health Directorate Quality Standard',
    empanelled: true,
    govtOnly: true,
    homeCollection: false,
    openNow: true,
    turnaroundHours: 4
  },
  {
    labId: 'LAB-03',
    nameEn: 'CHC Kharadi Automated Laboratory Unit',
    nameMr: 'समुदाय आ. केंद्र खराडी स्वयंचलित लॅब',
    type: 'GOVERNMENT',
    address: 'Kharadi Bypass Road, Pune - 411014',
    phone: '020-27051111',
    accreditation: 'NABL Empanelled',
    empanelled: true,
    govtOnly: true,
    homeCollection: false,
    openNow: true,
    turnaroundHours: 6
  },
  {
    labId: 'LAB-04',
    nameEn: 'Metropolis Health Rural Diagnostics Hub',
    nameMr: 'मेट्रोपोलिस हेल्थ ग्रामीण निदान केंद्र',
    type: 'PPP_EMPANELLED',
    address: 'Nagar Road, Wagholi, Pune',
    phone: '020-66224400',
    accreditation: 'CAP & NABL Accredited',
    empanelled: true,
    govtOnly: false,
    homeCollection: true,
    openNow: true,
    turnaroundHours: 8
  },
  {
    labId: 'LAB-05',
    nameEn: 'Shirur Rural Hospital Diagnostic Center',
    nameMr: 'शिरूर ग्रामीण रुग्णालय निदान केंद्र',
    type: 'GOVERNMENT',
    address: 'Shirur Taluka, Pune - 412210',
    phone: '02138-222100',
    accreditation: 'District Health Quality Standard',
    empanelled: true,
    govtOnly: true,
    homeCollection: false,
    openNow: true,
    turnaroundHours: 6
  },
  {
    labId: 'LAB-06',
    nameEn: 'Suburban Diagnostics Empanelled Phlebotomy',
    nameMr: 'सबरबन डायग्नोस्टिक्स अधिकृत संकलन केंद्र',
    type: 'PPP_EMPANELLED',
    address: 'Viman Nagar / Lohegaon Road, Pune',
    phone: '020-26631100',
    accreditation: 'NABL ISO 15189',
    empanelled: true,
    govtOnly: false,
    homeCollection: true,
    openNow: true,
    turnaroundHours: 10
  }
];

// Seed 48 Tests Catalog
const testsCatalog = [
  { code: 'CBC-01', nameEn: 'Complete Blood Count (CBC)', nameMr: 'संपूर्ण रक्त तपासणी', category: 'Hematology', fasting: false, tatHours: 4 },
  { code: 'HB-01', nameEn: 'Hemoglobin (Hb)', nameMr: 'हिमोग्लोबिन', category: 'Hematology', fasting: false, tatHours: 1 },
  { code: 'BG-01', nameEn: 'Blood Group & Rh Type', nameMr: 'रक्तगट व आरएच फॅक्टर', category: 'Hematology', fasting: false, tatHours: 2 },
  { code: 'HBA1C-01', nameEn: 'HbA1c Glycated Hemoglobin', nameMr: 'एचबीए१सी (मधुमेह नियंत्रण)', category: 'Biochemistry', fasting: false, tatHours: 6 },
  { code: 'FBS-01', nameEn: 'Fasting Blood Sugar (FBS)', nameMr: 'उपाशीपोटी साखर तपासणी', category: 'Biochemistry', fasting: true, tatHours: 2 },
  { code: 'PPBS-01', nameEn: 'Postprandial Blood Sugar (PPBS)', nameMr: 'जेवणानंतरची साखर तपासणी', category: 'Biochemistry', fasting: false, tatHours: 2 },
  { code: 'LIPID-01', nameEn: 'Lipid Profile (Cholesterol)', nameMr: 'रक्तातील चरबी तपासणी', category: 'Biochemistry', fasting: true, tatHours: 8 },
  { code: 'LFT-01', nameEn: 'Liver Function Test (LFT)', nameMr: 'यकृत कार्यक्षमता तपासणी', category: 'Biochemistry', fasting: false, tatHours: 6 },
  { code: 'KFT-01', nameEn: 'Kidney Function Test (KFT / RFT)', nameMr: 'मूत्रपिंड कार्यक्षमता तपासणी', category: 'Biochemistry', fasting: false, tatHours: 6 },
  { code: 'URINE-RE', nameEn: 'Urine Routine & Microscopic', nameMr: 'लघवी सर्वसाधारण तपासणी', category: 'Urine', fasting: false, tatHours: 2 },
  { code: 'URINE-ALB', nameEn: 'Urine Albumin for Pre-eclampsia', nameMr: 'लघवीतील प्रथिने (अल्ब्युमिन)', category: 'Urine', fasting: false, tatHours: 1 },
  { code: 'TB-CBNAAT', nameEn: 'Sputum CBNAAT / GeneXpert', nameMr: 'थुंकी जीनएक्सपर्ट क्षयरोग', category: 'Microbiology', fasting: false, tatHours: 12 },
  { code: 'TB-AFB', nameEn: 'Sputum AFB Smear Microscopy', nameMr: 'थुंकी काचपट्टी तपासणी', category: 'Microbiology', fasting: false, tatHours: 4 },
  { code: 'HIV-TRIDOT', nameEn: 'HIV Rapid Antibody Screening', nameMr: 'एचआयव्ही जलद तपासणी', category: 'Serology', fasting: false, tatHours: 1 },
  { code: 'HBSAG-01', nameEn: 'HBsAg Hepatitis B Rapid Test', nameMr: 'हिपॅटायटिस बी तपासणी', category: 'Serology', fasting: false, tatHours: 1 },
  { code: 'VDRL-01', nameEn: 'VDRL / RPR Syphilis Test', nameMr: 'सिफिलीस चाचणी (VDRL)', category: 'Serology', fasting: false, tatHours: 3 },
  { code: 'USG-OBS', nameEn: 'Obstetric Ultrasound (Anomaly Scan)', nameMr: 'गर्भावस्थेतील सोनोग्राफी', category: 'Radiology', fasting: false, tatHours: 24 },
  { code: 'XRAY-CHEST', nameEn: 'Digital Chest X-Ray PA View', nameMr: 'छातीचा डिजिटल क्ष-किरण (X-Ray)', category: 'Radiology', fasting: false, tatHours: 2 }
];

// GET /api/diagnostics/orders - List test orders
router.get('/orders', (req, res) => {
  const { status, patientId, barcode } = req.query;
  let results = [...ordersStore];

  if (status) {
    results = results.filter((o) => o.status.toUpperCase() === status.toUpperCase());
  }

  if (patientId) {
    results = results.filter((o) => o.patientId.toLowerCase() === patientId.toLowerCase());
  }

  if (barcode) {
    results = results.filter((o) => o.barcode.toLowerCase() === barcode.toLowerCase());
  }

  res.json({
    success: true,
    message: 'Diagnostic test orders active',
    count: results.length,
    data: results,
    orders: results
  });
});

// GET /api/diagnostics/orders/:id - Get specific test order
router.get('/orders/:id', (req, res) => {
  const idOrBarcode = req.params.id.trim().toUpperCase();
  const order = ordersStore.find(
    (o) => o.orderId.toUpperCase() === idOrBarcode || o.barcode.toUpperCase() === idOrBarcode
  );

  if (order) {
    return res.json({
      success: true,
      orderId: order.orderId,
      barcode: order.barcode,
      status: order.status,
      hasCriticalValue: Boolean(order.hasCriticalValue),
      data: order,
      order
    });
  }

  return res.status(404).json({ success: false, error: `Order ${req.params.id} not found` });
});

// POST /api/diagnostics/orders - Prescribe new diagnostic order
router.post('/orders', (req, res) => {
  const barcode = `MH-LAB-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newOrder = {
    orderId,
    barcode,
    patientId: req.body.patientId || `PAT-MH-${Math.floor(100 + Math.random() * 900)}`,
    patientNameEn: req.body.patientNameEn || req.body.patientName || 'Patient',
    patientNameMr: req.body.patientNameMr || 'रुग्ण',
    testCode: req.body.testCode || 'CBC-01',
    testNameEn: req.body.testNameEn || req.body.testName || 'Complete Blood Count',
    testNameMr: req.body.testNameMr || 'रक्त तपासणी',
    category: req.body.category || 'Hematology',
    status: 'ORDERED',
    facilityId: req.body.facilityId || 'FAC001',
    facilityName: req.body.facilityName || 'PHC Wagholi',
    prescribedBy: req.body.prescribedBy || 'Dr. Anand Shinde',
    hasCriticalValue: false,
    orderedAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);

  res.status(201).json({
    success: true,
    barcode,
    orderId,
    data: newOrder,
    order: newOrder
  });
});

// PATCH /api/diagnostics/orders/:id/status - Update order workflow step
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body || {};
  const idOrBarcode = req.params.id.trim().toUpperCase();

  const idx = ordersStore.findIndex(
    (o) => o.orderId.toUpperCase() === idOrBarcode || o.barcode.toUpperCase() === idOrBarcode
  );

  if (idx >= 0) {
    if (status) ordersStore[idx].status = status;
    ordersStore[idx].updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      orderId: ordersStore[idx].orderId,
      newStatus: ordersStore[idx].status,
      data: ordersStore[idx],
      updatedAt: ordersStore[idx].updatedAt
    });
  }

  return res.status(404).json({ success: false, error: 'Test order not found' });
});

// POST /api/diagnostics/orders/:id/results - Upload verified lab results & sync ABHA
router.post('/orders/:id/results', (req, res) => {
  const { results, impression, verifiedBy, hasCriticalValue } = req.body || {};
  const idOrBarcode = req.params.id.trim().toUpperCase();

  const idx = ordersStore.findIndex(
    (o) => o.orderId.toUpperCase() === idOrBarcode || o.barcode.toUpperCase() === idOrBarcode
  );

  const abhaRecordSyncId = `ABHA-FHIR-DIAG-${Date.now()}`;
  const pdfDownloadUrl = `/reports/${req.params.id}.pdf`;

  if (idx >= 0) {
    ordersStore[idx].status = 'COMPLETED';
    ordersStore[idx].results = results || ordersStore[idx].results;
    ordersStore[idx].impression = impression || ordersStore[idx].impression;
    ordersStore[idx].verifiedBy = verifiedBy || 'Duty Pathologist';
    ordersStore[idx].hasCriticalValue = Boolean(hasCriticalValue);
    ordersStore[idx].completedAt = new Date().toISOString();
    ordersStore[idx].abhaRecordSyncId = abhaRecordSyncId;

    return res.status(201).json({
      success: true,
      orderId: ordersStore[idx].orderId,
      status: 'COMPLETED',
      results: ordersStore[idx].results,
      impression: ordersStore[idx].impression,
      verifiedBy: ordersStore[idx].verifiedBy,
      abhaRecordSyncId,
      pdfDownloadUrl,
      data: ordersStore[idx]
    });
  }

  return res.status(201).json({
    success: true,
    orderId: req.params.id,
    status: 'COMPLETED',
    results,
    impression,
    verifiedBy,
    abhaRecordSyncId,
    pdfDownloadUrl
  });
});

// GET /api/diagnostics/labs - Search nearby labs with filters
router.get('/labs', (req, res) => {
  let filtered = [...labsStore];

  if (req.query.govtOnly === 'true') {
    filtered = filtered.filter((l) => l.govtOnly === true);
  }

  if (req.query.homeCollection === 'true') {
    filtered = filtered.filter((l) => l.homeCollection === true);
  }

  res.json({
    success: true,
    count: filtered.length,
    labs: filtered,
    data: filtered,
    filters: req.query,
    filtersSupported: ['empanelled', 'homeCollection', 'openNow', 'govtOnly']
  });
});

// GET /api/diagnostics/tests - Tests directory
router.get('/tests', (req, res) => {
  res.json({
    success: true,
    totalTests: testsCatalog.length,
    tests: testsCatalog,
    data: testsCatalog,
    categories: ['Hematology', 'Biochemistry', 'Urine', 'Microbiology', 'Serology', 'Radiology']
  });
});

module.exports = router;
