/**
 * Diagnostics Express Routes
 */

const express = require('express');
const router = express.Router();

// GET /api/diagnostics/orders - List test orders
router.get('/orders', (req, res) => {
  res.json({ success: true, message: 'Diagnostic test orders active', count: 4 });
});

// GET /api/diagnostics/orders/:id - Get specific test order
router.get('/orders/:id', (req, res) => {
  res.json({
    success: true,
    orderId: req.params.id,
    barcode: `MH-LAB-849201`,
    status: 'COMPLETED',
    hasCriticalValue: false
  });
});

// POST /api/diagnostics/orders - Prescribe new diagnostic order
router.post('/orders', (req, res) => {
  const barcode = `MH-LAB-${Math.floor(100000 + Math.random() * 900000)}`;
  res.status(201).json({
    success: true,
    barcode,
    data: { ...req.body, barcode, status: 'ORDERED' }
  });
});

// PATCH /api/diagnostics/orders/:id/status - Update order workflow step
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  res.json({
    success: true,
    orderId: req.params.id,
    newStatus: status,
    updatedAt: new Date().toISOString()
  });
});

// POST /api/diagnostics/orders/:id/results - Upload verified lab results & sync ABHA
router.post('/orders/:id/results', (req, res) => {
  const { results, impression, verifiedBy } = req.body;
  res.status(201).json({
    success: true,
    orderId: req.params.id,
    status: 'COMPLETED',
    results,
    impression,
    verifiedBy,
    abhaRecordSyncId: `ABHA-FHIR-DIAG-${Date.now()}`,
    pdfDownloadUrl: `/reports/${req.params.id}.pdf`
  });
});

// GET /api/diagnostics/labs - Search nearby labs with filters
router.get('/labs', (req, res) => {
  res.json({ 
    success: true, 
    count: 6, 
    filters: req.query,
    filtersSupported: ['empanelled', 'homeCollection', 'openNow', 'govtOnly']
  });
});

// GET /api/diagnostics/tests - 40+ tests directory
router.get('/tests', (req, res) => {
  res.json({
    success: true,
    totalTests: 48,
    categories: ['Hematology', 'Biochemistry', 'Urine', 'Microbiology', 'Radiology']
  });
});

module.exports = router;
