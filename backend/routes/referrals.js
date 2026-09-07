/**
 * Referral Express Routes
 */

const express = require('express');
const router = express.Router();
const reminderService = require('../services/reminderService');

// GET /api/referrals - Get all referrals with optional overdue check
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Referral tracking pipeline active',
    total: 5,
    stages: ['CREATED', 'NOTIFIED', 'ACCEPTED', 'IN_TRANSIT', 'REACHED', 'ADMITTED', 'COMPLETED', 'OVERDUE', 'CANCELLED']
  });
});

// GET /api/referrals/overdue - Get all overdue referrals
router.get('/overdue', (req, res) => {
  const sampleReferral = {
    token: 'REF-20240616-1192',
    patientNameMr: 'अनिकेत राहुल भोसले (बाळ)',
    urgency: 'EMERGENCY',
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    targetHospital: 'District Hospital Aundh, Pune'
  };
  const sla = reminderService.evaluateReferralSla(sampleReferral);
  res.json({
    success: true,
    count: 1,
    overdueReferrals: [
      {
        ...sampleReferral,
        isOverdue: sla.isOverdue,
        maxHours: sla.maxHours,
        overdueHours: sla.overdueHours,
        recommendedAction: sla.recommendedAction
      }
    ]
  });
});

// GET /api/referrals/:id - Get referral by ID/Token
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    referralId: req.params.id,
    token: req.params.id,
    stage: 'IN_TRANSIT',
    slaMet: true
  });
});

// GET /api/referrals/patient/:patientId - Get referrals by patient ID
router.get('/patient/:patientId', (req, res) => {
  res.json({
    success: true,
    patientId: req.params.patientId,
    count: 1,
    data: []
  });
});

// POST /api/referrals - Create new referral with token generation
router.post('/', (req, res) => {
  const token = `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  res.status(201).json({
    success: true,
    token,
    data: { ...req.body, token, stage: 'CREATED' }
  });
});

// PATCH /api/referrals/:id/stage - Update 7-stage pipeline
router.patch('/:id/stage', (req, res) => {
  const { stage, notes } = req.body;
  res.json({
    success: true,
    referralId: req.params.id,
    newStage: stage,
    notes,
    updatedAt: new Date().toISOString()
  });
});

// POST /api/referrals/:id/feedback - Add receiving doctor feedback
router.post('/:id/feedback', (req, res) => {
  res.json({
    success: true,
    referralId: req.params.id,
    feedback: req.body,
    stage: 'COMPLETED',
    updatedAt: new Date().toISOString()
  });
});

// POST /api/referrals/:id/reminders - Log reminder or alert
router.post('/:id/reminders', (req, res) => {
  const { recipient, message, channel } = req.body;
  res.status(201).json({
    success: true,
    reminderId: `REM-${Date.now()}`,
    referralId: req.params.id,
    recipient,
    message,
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
