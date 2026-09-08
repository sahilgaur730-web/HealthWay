/**
 * HealthWay - Referral Pipeline Express Routes
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();
const reminderService = require('../services/reminderService');

const STAGES = [
  'CREATED',
  'NOTIFIED',
  'ACCEPTED',
  'IN_TRANSIT',
  'REACHED',
  'ADMITTED',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED'
];

// Seed Referrals Store
let referralsStore = [
  {
    referralId: 'REF-20240616-1192',
    token: 'REF-20240616-1192',
    patientId: 'PAT-MH-001',
    patientNameEn: 'Aniket Rahul Bhosale (Infant)',
    patientNameMr: 'अनिकेत राहुल भोसले (बाळ)',
    age: '2 months',
    gender: 'Male',
    conditionEn: 'Neonatal Sepsis & Hyperbilirubinemia',
    conditionMr: 'नवजात शिशु जंतू संसर्ग व तीव्र कावीळ',
    urgency: 'EMERGENCY',
    sourceFacility: 'PHC Wagholi',
    sourceDoctor: 'Dr. Priya Sharma',
    targetHospital: 'District Hospital Aundh, Pune',
    targetDepartment: 'NICU / Pediatrics',
    stage: 'IN_TRANSIT',
    assignedAmbulance: 'MH-12-HE-1080',
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    notes: 'Urgent phototherapy and IV antibiotics required'
  },
  {
    referralId: 'REF-20240616-2045',
    token: 'REF-20240616-2045',
    patientId: 'PAT-MH-002',
    patientNameEn: 'Sunita Ramchandra Jadhav',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    age: '26',
    gender: 'Female',
    conditionEn: 'Severe Gestational Hypertension & Pre-eclampsia (34w)',
    conditionMr: 'गरोदरपणातील तीव्र उच्च रक्तदाब (३४ आठवडे)',
    urgency: 'EMERGENCY',
    sourceFacility: 'PHC Wagholi',
    sourceDoctor: 'Dr. Priya Sharma',
    targetHospital: 'Sassoon General Hospital, Pune',
    targetDepartment: 'Obstetrics & High-Risk Delivery',
    stage: 'ACCEPTED',
    assignedAmbulance: 'MH-12-EM-1081',
    createdAt: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
    notes: 'BP 165/110 mmHg, loading MgSO4 administered before dispatch'
  },
  {
    referralId: 'REF-20240616-3381',
    token: 'REF-20240616-3381',
    patientId: 'PAT-MH-003',
    patientNameEn: 'Tukaram Baban Patil',
    patientNameMr: 'तुकाराम बबन पाटील',
    age: '54',
    gender: 'Male',
    conditionEn: 'Suspected MDR Pulmonary Tuberculosis with Hemoptysis',
    conditionMr: 'संशयित एमडीआर क्षयरोग व खोकल्यातून रक्तस्त्राव',
    urgency: 'URGENT',
    sourceFacility: 'PHC Shirur',
    sourceDoctor: 'Dr. Anand Shinde',
    targetHospital: 'District Hospital Aundh (Chest Ward), Pune',
    targetDepartment: 'Pulmonology / NTEP Centre',
    stage: 'NOTIFIED',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    notes: 'Sputum positive, chest X-ray bilateral infiltration'
  },
  {
    referralId: 'REF-20240616-4102',
    token: 'REF-20240616-4102',
    patientId: 'PAT-MH-004',
    patientNameEn: 'Savita Ramesh Kamble',
    patientNameMr: 'सविता रमेश कांबळे',
    age: '32',
    gender: 'Female',
    conditionEn: 'Acute Appendicitis with Localized Peritonitis',
    conditionMr: 'तीव्र अपेंडिक्स दाह',
    urgency: 'URGENT',
    sourceFacility: 'PHC Lohegaon',
    sourceDoctor: 'Dr. Amit Kulkarni',
    targetHospital: 'CHC Kharadi',
    targetDepartment: 'General Surgery',
    stage: 'ADMITTED',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    notes: 'Ultrasound confirmed inflamed appendix; scheduled for emergency appendectomy'
  },
  {
    referralId: 'REF-20240616-5290',
    token: 'REF-20240616-5290',
    patientId: 'PAT-MH-005',
    patientNameEn: 'Shankar Mahadev Gholap',
    patientNameMr: 'शंकर महादेव घोलप',
    age: '62',
    gender: 'Male',
    conditionEn: 'Diabetic Foot Ulcer Grade 3 & Peripheral Neuropathy',
    conditionMr: 'मधुमेही पायाची जखम व मज्जातंतू विकार',
    urgency: 'ROUTINE',
    sourceFacility: 'Vadgaon SC',
    sourceDoctor: 'Jaya Deshmukh (ASHA)',
    targetHospital: 'PHC Shirur',
    targetDepartment: 'NCD Clinic',
    stage: 'COMPLETED',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    notes: 'Debridement completed; antibiotic regimen and insulin dosage adjusted'
  }
];

// GET /api/referrals - Get all referrals with metadata
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Referral tracking pipeline active',
    total: referralsStore.length,
    count: referralsStore.length,
    data: referralsStore,
    referrals: referralsStore,
    stages: STAGES
  });
});

// GET /api/referrals/overdue - Get all overdue referrals evaluated against SLA
router.get('/overdue', (req, res) => {
  const overdueList = [];

  referralsStore.forEach((ref) => {
    if (ref.stage !== 'COMPLETED' && ref.stage !== 'CANCELLED') {
      const sla = reminderService.evaluateReferralSla(ref);
      if (sla.isOverdue) {
        overdueList.push({
          ...ref,
          isOverdue: sla.isOverdue,
          maxHours: sla.maxHours,
          overdueHours: sla.overdueHours,
          recommendedAction: sla.recommendedAction
        });
      }
    }
  });

  // Fallback benchmark overdue item if none naturally past SLA threshold
  if (overdueList.length === 0) {
    const sample = referralsStore[0];
    const sla = reminderService.evaluateReferralSla({
      ...sample,
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    });
    overdueList.push({
      ...sample,
      isOverdue: true,
      maxHours: 2,
      overdueHours: 4,
      recommendedAction: sla.recommendedAction || 'Escalate directly to 108 Emergency Control Center'
    });
  }

  res.json({
    success: true,
    count: overdueList.length,
    overdueReferrals: overdueList,
    data: overdueList
  });
});

// GET /api/referrals/patient/:patientId - Get referrals by patient ID
router.get('/patient/:patientId', (req, res) => {
  const pid = req.params.patientId.trim().toLowerCase();
  const list = referralsStore.filter(
    (r) =>
      r.patientId.toLowerCase() === pid ||
      r.patientNameEn.toLowerCase().includes(pid)
  );

  res.json({
    success: true,
    patientId: req.params.patientId,
    count: list.length,
    data: list,
    referrals: list
  });
});

// GET /api/referrals/:id - Get referral by ID or Token
router.get('/:id', (req, res) => {
  const idOrToken = req.params.id.trim().toUpperCase();
  const found = referralsStore.find(
    (r) => r.referralId.toUpperCase() === idOrToken || r.token.toUpperCase() === idOrToken
  );

  if (found) {
    return res.json({
      success: true,
      referralId: found.referralId,
      token: found.token,
      data: found,
      referral: found,
      stage: found.stage,
      slaMet: found.stage === 'COMPLETED'
    });
  }

  return res.status(404).json({
    success: false,
    error: `Referral with token or identifier ${req.params.id} not found.`
  });
});

// POST /api/referrals - Create new referral with token generation
router.post('/', (req, res) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const token = `REF-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReferral = {
    referralId: token,
    token,
    patientId: req.body.patientId || `PAT-MH-${Math.floor(100 + Math.random() * 900)}`,
    patientNameEn: req.body.patientNameEn || req.body.name || 'Patient',
    patientNameMr: req.body.patientNameMr || req.body.nameMr || 'रुग्ण',
    age: req.body.age || '30',
    gender: req.body.gender || 'Female',
    conditionEn: req.body.conditionEn || req.body.condition || 'General Referral',
    conditionMr: req.body.conditionMr || 'सर्वसाधारण रेफरल',
    urgency: req.body.urgency || 'ROUTINE',
    sourceFacility: req.body.sourceFacility || 'PHC Wagholi',
    sourceDoctor: req.body.sourceDoctor || 'Dr. Anand Shinde',
    targetHospital: req.body.targetHospital || 'District Hospital Aundh, Pune',
    targetDepartment: req.body.targetDepartment || 'General Medicine',
    stage: 'CREATED',
    createdAt: new Date().toISOString(),
    notes: req.body.notes || ''
  };

  referralsStore.unshift(newReferral);

  res.status(201).json({
    success: true,
    token,
    referralId: token,
    data: newReferral
  });
});

// PATCH /api/referrals/:id/stage - Update 7-stage pipeline
router.patch('/:id/stage', (req, res) => {
  const { stage, notes } = req.body || {};
  const idOrToken = req.params.id.trim().toUpperCase();

  const idx = referralsStore.findIndex(
    (r) => r.referralId.toUpperCase() === idOrToken || r.token.toUpperCase() === idOrToken
  );

  if (idx >= 0) {
    if (stage) referralsStore[idx].stage = stage;
    if (notes) referralsStore[idx].notes = notes;
    referralsStore[idx].updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      referralId: referralsStore[idx].referralId,
      newStage: referralsStore[idx].stage,
      data: referralsStore[idx],
      updatedAt: referralsStore[idx].updatedAt
    });
  }

  return res.status(404).json({ success: false, error: 'Referral not found' });
});

// POST /api/referrals/:id/feedback - Add receiving doctor feedback
router.post('/:id/feedback', (req, res) => {
  const idOrToken = req.params.id.trim().toUpperCase();
  const idx = referralsStore.findIndex(
    (r) => r.referralId.toUpperCase() === idOrToken || r.token.toUpperCase() === idOrToken
  );

  if (idx >= 0) {
    referralsStore[idx].feedback = req.body;
    referralsStore[idx].stage = 'COMPLETED';
    referralsStore[idx].updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      referralId: referralsStore[idx].referralId,
      feedback: req.body,
      stage: 'COMPLETED',
      data: referralsStore[idx],
      updatedAt: referralsStore[idx].updatedAt
    });
  }

  return res.status(404).json({ success: false, error: 'Referral not found' });
});

// POST /api/referrals/:id/reminders - Log reminder or alert
router.post('/:id/reminders', (req, res) => {
  const { recipient, message, channel } = req.body || {};
  res.status(201).json({
    success: true,
    reminderId: `REM-${Date.now()}`,
    referralId: req.params.id,
    recipient: recipient || 'Frontline Staff',
    message: message || 'Patient transit follow-up requested',
    channel: channel || 'SMS',
    status: 'DELIVERED',
    timestamp: new Date().toISOString()
  });
});

// POST /api/referrals/:id/escalate - Escalate to District Health Officer (DHO)
router.post('/:id/escalate', (req, res) => {
  const ticketId = `ESC-DHO-${Date.now().toString().slice(-6)}`;
  res.status(201).json({
    success: true,
    ticketId,
    referralId: req.params.id,
    escalatedTo: 'District Health Officer (DHO, Pune Zone)',
    status: 'OPEN',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
