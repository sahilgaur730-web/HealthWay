/**
 * HealthWay - High-Risk Patient Surveillance API Routes
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();

// Seed High-Risk Cohort Registry
let highRiskCohort = [
  {
    patientId: 'HRP-101',
    abhaId: 'MH-PN-24-00000001',
    nameEn: 'Sunita Ramchandra Jadhav',
    nameMr: 'सुनीता रामचंद्र जाधव',
    age: '26',
    gender: 'Female',
    village: 'Wagholi',
    villageMr: 'वाघोली',
    subCentre: 'Wagholi SC',
    facility: 'PHC Wagholi',
    category: 'Maternal High-Risk',
    conditionEn: 'Severe Pre-eclampsia & Gestational Hypertension (32w)',
    conditionMr: 'गरोदरपणातील अति-उच्च रक्तदाब (३२ आठवडे)',
    severity: 'CRITICAL',
    urgency: 'EMERGENCY',
    assignedAsha: 'Prachi Patil',
    assignedAshaUsername: 'prachi-ashaworker',
    assignedAshaPhone: '9822101001',
    vitals: { bp: '160/105', pulse: 88, weight: 62, hemoglobin: '8.4 g/dL', bloodSugar: 98 },
    medicineAdherence: 90,
    lastVisitDate: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: [
      {
        date: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
        bp: '160/105',
        adherence: 90,
        dangerSigns: ['Swollen ankles', 'Mild headache'],
        loggedBy: 'Prachi Patil (ASHA)'
      }
    ]
  },
  {
    patientId: 'HRP-102',
    abhaId: 'MH-PN-24-00000002',
    nameEn: 'Ramesh Shankar Jadhav',
    nameMr: 'रमेश शंकर जाधव',
    age: '58',
    gender: 'Male',
    village: 'Kharadi',
    villageMr: 'खराडी',
    subCentre: 'Kharadi SC',
    facility: 'PHC Kharadi',
    category: 'Chronic NCD',
    conditionEn: 'Uncontrolled Type 2 Diabetes with Peripheral Neuropathy & HTN',
    conditionMr: 'अनियंत्रित मधुमेह व रक्तदाब विकार',
    severity: 'HIGH',
    urgency: 'URGENT',
    assignedAsha: 'Rohit Kamble',
    assignedAshaUsername: 'rohit-ashaworker',
    assignedAshaPhone: '9822101002',
    vitals: { bp: '155/95', pulse: 76, weight: 72, bloodSugar: 242 },
    medicineAdherence: 74,
    lastVisitDate: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    isOverdue: true,
    escalationLevel: 'MO_ESCALATED',
    visits: [
      {
        date: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
        bp: '155/95',
        adherence: 74,
        dangerSigns: ['Tingling in feet', 'Nocturia'],
        loggedBy: 'Rohit Kamble (ASHA)'
      }
    ]
  },
  {
    patientId: 'HRP-103',
    abhaId: 'MH-PN-24-00000003',
    nameEn: 'Lata Anant Kamble',
    nameMr: 'लता अनंत कांबळे',
    age: '22',
    gender: 'Female',
    village: 'Lohegaon',
    villageMr: 'लोहगाव',
    subCentre: 'Lohegaon SC',
    facility: 'PHC Lohegaon',
    category: 'Maternal High-Risk',
    conditionEn: 'Severe Gestational Anemia (Hb 7.1 g/dL, 28w)',
    conditionMr: 'गरोदरपणातील तीव्र पांडुरोग / रक्ताल्पता (७.१ ग्रॅम)',
    severity: 'CRITICAL',
    urgency: 'EMERGENCY',
    assignedAsha: 'Anjali Shinde',
    assignedAshaUsername: 'anjali-ashaworker',
    assignedAshaPhone: '9822101003',
    vitals: { bp: '110/70', pulse: 94, weight: 46, hemoglobin: '7.1 g/dL' },
    medicineAdherence: 65,
    lastVisitDate: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() + 1 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: []
  },
  {
    patientId: 'HRP-104',
    abhaId: 'MH-PN-24-00000004',
    nameEn: 'Baby Aarav Sachin Shinde (Infant)',
    nameMr: 'आरव सचिन शिंदे (बालक)',
    age: '11 months',
    gender: 'Male',
    village: 'Lohegaon',
    villageMr: 'लोहगाव',
    subCentre: 'Lohegaon SC',
    facility: 'PHC Lohegaon',
    category: 'Child Nutrition',
    conditionEn: 'Severe Acute Malnutrition (SAM, Weight 6.1 kg, MUAC 11.2 cm)',
    conditionMr: 'तीव्र कुपोषित बालक (सॅम)',
    severity: 'HIGH',
    urgency: 'URGENT',
    assignedAsha: 'Anjali Shinde',
    assignedAshaUsername: 'anjali-ashaworker',
    assignedAshaPhone: '9822101003',
    vitals: { weight: 6.1, muac: '11.2 cm', height: '68 cm' },
    medicineAdherence: 85,
    lastVisitDate: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() + 4 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: []
  },
  {
    patientId: 'HRP-105',
    abhaId: 'MH-PN-24-00000005',
    nameEn: 'Tukaram Baban Patil',
    nameMr: 'तुकाराम बबन पाटील',
    age: '54',
    gender: 'Male',
    village: 'Vadgaon',
    villageMr: 'वडगाव',
    subCentre: 'Vadgaon SC',
    facility: 'PHC Shirur',
    category: 'Infectious Disease',
    conditionEn: 'Active Pulmonary Tuberculosis under NTEP DOTS',
    conditionMr: 'सक्रिय फुफ्फुसीय क्षयरोग (डॉट उपचार)',
    severity: 'HIGH',
    urgency: 'URGENT',
    assignedAsha: 'Jaya Deshmukh',
    assignedAshaUsername: 'jaya-ashaworker',
    assignedAshaPhone: '9822101004',
    vitals: { weight: 48, spo2: 96, temperature: '99.2 F' },
    medicineAdherence: 95,
    lastVisitDate: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() + 6 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: []
  },
  {
    patientId: 'HRP-106',
    abhaId: 'MH-PN-24-00000006',
    nameEn: 'Parvati Dnyaneshwar Pawar',
    nameMr: 'पार्वती ज्ञानेश्वर पवार',
    age: '68',
    gender: 'Female',
    village: 'Wagholi',
    villageMr: 'वाघोली',
    subCentre: 'Wagholi SC',
    facility: 'PHC Wagholi',
    category: 'Geriatric Cardiac',
    conditionEn: 'Congestive Cardiac Failure & Chronic Hypertension',
    conditionMr: 'हृदयविकार व जुनाट उच्च रक्तदाब',
    severity: 'CRITICAL',
    urgency: 'EMERGENCY',
    assignedAsha: 'Prachi Patil',
    assignedAshaUsername: 'prachi-ashaworker',
    assignedAshaPhone: '9822101001',
    vitals: { bp: '170/110', pulse: 82, spo2: 93 },
    medicineAdherence: 80,
    lastVisitDate: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    isOverdue: true,
    escalationLevel: 'DHO_ESCALATED',
    visits: []
  },
  {
    patientId: 'HRP-107',
    abhaId: 'MH-PN-24-00000007',
    nameEn: 'Meena Santosh Bhosale',
    nameMr: 'मीना संतोष भोसले',
    age: '24',
    gender: 'Female',
    village: 'Kharadi',
    villageMr: 'खराडी',
    subCentre: 'Kharadi SC',
    facility: 'PHC Kharadi',
    category: 'Maternal High-Risk',
    conditionEn: 'Primigravida with Gestational Diabetes Mellitus (GDM 26w)',
    conditionMr: 'गरोदरपणातील मधुमेह (२६ आठवडे)',
    severity: 'MEDIUM',
    urgency: 'ROUTINE',
    assignedAsha: 'Rohit Kamble',
    assignedAshaUsername: 'rohit-ashaworker',
    assignedAshaPhone: '9822101002',
    vitals: { bp: '118/76', fastingSugar: 128, ppSugar: 172 },
    medicineAdherence: 88,
    lastVisitDate: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: []
  },
  {
    patientId: 'HRP-108',
    abhaId: 'MH-PN-24-00000008',
    nameEn: 'Eknath Vishnu Shinde',
    nameMr: 'एकनाथ विष्णू शिंदे',
    age: '49',
    gender: 'Male',
    village: 'Vadgaon',
    villageMr: 'वडगाव',
    subCentre: 'Vadgaon SC',
    facility: 'PHC Shirur',
    category: 'Chronic NCD',
    conditionEn: 'Chronic Kidney Disease Stage 3 & Resistant Hypertension',
    conditionMr: 'दीर्घकालीन मूत्रपिंड विकार व रक्तदाब',
    severity: 'HIGH',
    urgency: 'URGENT',
    assignedAsha: 'Jaya Deshmukh',
    assignedAshaUsername: 'jaya-ashaworker',
    assignedAshaPhone: '9822101004',
    vitals: { bp: '162/98', serumCreatinine: '2.1 mg/dL' },
    medicineAdherence: 82,
    lastVisitDate: new Date(Date.now() - 6 * 86400 * 1000).toISOString(),
    nextScheduledDate: new Date(Date.now() + 1 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: []
  }
];

// GET /api/highrisk/patients - List registered high-risk cohort with filtering
router.get('/patients', (req, res) => {
  const { category, urgency, severity, ashaName, village } = req.query;
  let results = [...highRiskCohort];

  if (category) {
    results = results.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (urgency) {
    results = results.filter((p) => p.urgency.toUpperCase() === urgency.toUpperCase());
  }

  if (severity) {
    results = results.filter((p) => p.severity.toUpperCase() === severity.toUpperCase());
  }

  if (ashaName) {
    results = results.filter(
      (p) =>
        p.assignedAsha.toLowerCase().includes(ashaName.toLowerCase()) ||
        p.assignedAshaUsername.toLowerCase().includes(ashaName.toLowerCase())
    );
  }

  if (village) {
    results = results.filter(
      (p) =>
        p.village.toLowerCase().includes(village.toLowerCase()) ||
        p.villageMr.includes(village)
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
    patients: results
  });
});

// GET /api/highrisk/patients/:id - Get single patient record
router.get('/patients/:id', (req, res) => {
  const id = req.params.id.trim().toUpperCase();
  const found = highRiskCohort.find(
    (p) => p.patientId.toUpperCase() === id || p.abhaId.toUpperCase() === id
  );

  if (found) {
    return res.json({ success: true, data: found, patient: found });
  }

  return res.status(404).json({ success: false, error: `High risk patient ${req.params.id} not found` });
});

// POST /api/highrisk/patients - Flag and register new high-risk patient
router.post('/patients', (req, res) => {
  const { nameEn, category, assignedAsha } = req.body || {};
  if (!nameEn || !category || !assignedAsha) {
    return res.status(400).json({ success: false, error: 'Mandatory clinical fields (nameEn, category, assignedAsha) missing' });
  }

  const patientId = `HRP-${Math.floor(100 + Math.random() * 900)}`;
  const record = {
    patientId,
    abhaId: req.body.abhaId || `MH-PN-26-${Date.now().toString().slice(-8)}`,
    nameEn: nameEn.trim(),
    nameMr: req.body.nameMr ? req.body.nameMr.trim() : nameEn.trim(),
    age: req.body.age || '30',
    gender: req.body.gender || 'Female',
    village: req.body.village || 'Wagholi',
    villageMr: req.body.villageMr || 'वाघोली',
    subCentre: req.body.subCentre || 'Wagholi SC',
    facility: req.body.facility || 'PHC Wagholi',
    category,
    conditionEn: req.body.conditionEn || 'High Risk Surveillance',
    conditionMr: req.body.conditionMr || 'अतिजोखमीचे रुग्ण सनियंत्रण',
    severity: req.body.severity || 'HIGH',
    urgency: req.body.urgency || 'URGENT',
    assignedAsha: assignedAsha.trim(),
    assignedAshaUsername: req.body.assignedAshaUsername || 'prachi-ashaworker',
    assignedAshaPhone: req.body.assignedAshaPhone || '9822101001',
    vitals: req.body.vitals || {},
    medicineAdherence: Number(req.body.medicineAdherence) || 85,
    lastVisitDate: new Date().toISOString(),
    nextScheduledDate: req.body.nextScheduledDate || new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
    isOverdue: false,
    escalationLevel: 'NONE',
    visits: []
  };

  highRiskCohort.unshift(record);

  res.status(201).json({
    success: true,
    patientId,
    message: 'Patient flagged and enrolled in surveillance register',
    data: record
  });
});

// POST /api/highrisk/visit - Log frontline ASHA/ANM home visit
router.post('/visit', (req, res) => {
  const { patientId, vitals, medicineAdherence, dangerSigns, nextScheduledDate, loggedBy } = req.body || {};
  if (!patientId || !nextScheduledDate) {
    return res.status(400).json({ success: false, error: 'Patient ID and next follow-up date required' });
  }

  const patient = highRiskCohort.find(
    (p) => p.patientId.toUpperCase() === patientId.trim().toUpperCase()
  );

  const visitRecord = {
    date: new Date().toISOString(),
    vitals: vitals || {},
    medicineAdherence: Number(medicineAdherence) || 85,
    dangerSigns: Array.isArray(dangerSigns) ? dangerSigns : [],
    nextScheduledDate,
    loggedBy: loggedBy || 'Frontline ASHA Worker'
  };

  if (patient) {
    patient.visits = patient.visits || [];
    patient.visits.unshift(visitRecord);
    patient.lastVisitDate = visitRecord.date;
    patient.nextScheduledDate = nextScheduledDate;
    patient.isOverdue = false;
    if (medicineAdherence) patient.medicineAdherence = Number(medicineAdherence);
    if (vitals) patient.vitals = { ...patient.vitals, ...vitals };
  }

  res.json({
    success: true,
    message: 'Home visit logged and next appointment confirmed',
    visit: visitRecord
  });
});

// POST /api/highrisk/escalate - Escalate overdue patient to MO or DHO
router.post('/escalate', (req, res) => {
  const { patientId, level, notes } = req.body || {};
  if (!patientId || !level) {
    return res.status(400).json({ success: false, error: 'Patient ID and escalation level required' });
  }

  const patient = highRiskCohort.find(
    (p) => p.patientId.toUpperCase() === patientId.trim().toUpperCase()
  );
  if (patient) {
    patient.escalationLevel = level;
    patient.escalationNotes = notes;
    patient.escalatedAt = new Date().toISOString();
  }

  res.json({
    success: true,
    patientId,
    escalationLevel: level,
    alertDispatched: true,
    message: `Patient ${patientId} successfully escalated to ${level}`
  });
});

// GET /api/highrisk/analytics - Summary metrics for district surveillance
router.get('/analytics', (req, res) => {
  const total = highRiskCohort.length;
  const overdue = highRiskCohort.filter((p) => p.isOverdue).length;
  const critical = highRiskCohort.filter((p) => p.severity === 'CRITICAL').length;
  const avgAdh = Math.round(
    highRiskCohort.reduce((acc, p) => acc + (p.medicineAdherence || 80), 0) / (total || 1)
  );

  res.json({
    success: true,
    analytics: {
      totalCohort: total,
      overdueCount: overdue,
      criticalCount: critical,
      avgAdherence: avgAdh,
      highSeverityCount: highRiskCohort.filter((p) => p.severity === 'HIGH').length,
      escalatedCount: highRiskCohort.filter((p) => p.escalationLevel !== 'NONE').length
    }
  });
});

module.exports = router;
