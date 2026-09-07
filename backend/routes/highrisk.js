/**
 * High-Risk Patient Surveillance API Routes (Express Router Spec)
 */

const express = require('express');
const router = express.Router();

// GET /api/highrisk/patients - List registered high-risk cohort
router.get('/patients', (req, res) => {
  const { category, urgency, ashaName, village } = req.query;
  res.json({
    success: true,
    count: 8,
    data: []
  });
});

// POST /api/highrisk/patients - Flag and register new high-risk patient
router.post('/patients', (req, res) => {
  const { abhaId, nameEn, nameMr, age, category, severity, assignedAsha } = req.body;
  if (!nameEn || !category || !assignedAsha) {
    return res.status(400).json({ success: false, error: 'Mandatory clinical fields missing' });
  }

  const patientId = `HRP-${Math.floor(100 + Math.random() * 900)}`;
  res.status(201).json({
    success: true,
    patientId,
    message: 'Patient flagged and enrolled in surveillance register'
  });
});

// POST /api/highrisk/visit - Log frontline ASHA/ANM home visit
router.post('/visit', (req, res) => {
  const { patientId, vitals, medicineAdherence, dangerSigns, nextScheduledDate } = req.body;
  if (!patientId || !nextScheduledDate) {
    return res.status(400).json({ success: false, error: 'Patient ID and next follow-up date required' });
  }

  res.json({
    success: true,
    message: 'Home visit logged and next appointment confirmed'
  });
});

// POST /api/highrisk/escalate - Escalate overdue patient to MO or DHO
router.post('/escalate', (req, res) => {
  const { patientId, level, notes } = req.body;
  if (!patientId || !level) {
    return res.status(400).json({ success: false, error: 'Patient ID and escalation level required' });
  }

  res.json({
    success: true,
    escalationLevel: level,
    alertDispatched: true
  });
});

// GET /api/highrisk/analytics - Summary metrics for district surveillance
router.get('/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalCohort: 8,
      overdueCount: 2,
      criticalCount: 3,
      avgAdherence: 84
    }
  });
});

module.exports = router;
