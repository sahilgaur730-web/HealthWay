/**
 * Medicine & Stock Inventory API Routes (Express Router Spec)
 */

const express = require('express');
const router = express.Router();

// GET /api/medicines - List all essential medicines
router.get('/', (req, res) => {
  const { category, search } = req.query;
  res.json({
    success: true,
    count: 18,
    data: []
  });
});

// GET /api/medicines/stock - Search inventory across facilities
router.get('/stock', (req, res) => {
  const { facilityId, status, medicineId } = req.query;
  res.json({
    success: true,
    facilityId: facilityId || 'ALL',
    data: []
  });
});

// POST /api/medicines/stock/update - Update stock quantity & batch
router.post('/stock/update', (req, res) => {
  const { facilityId, medicineId, quantity, batchNumber, expiryDate, updateType } = req.body;
  if (!facilityId || !medicineId || quantity === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required inventory parameters' });
  }

  res.json({
    success: true,
    message: 'Stock updated successfully',
    updatedStock: { facilityId, medicineId, quantity, batchNumber, expiryDate }
  });
});

// POST /api/medicines/indent - Dispatch emergency reorder indent to warehouse
router.post('/indent', (req, res) => {
  const { facilityId, items, urgency } = req.body;
  if (!facilityId || !items || !items.length) {
    return res.status(400).json({ success: false, error: 'Empty indent requisition' });
  }

  const indentNumber = `IND-2024-MH-${Math.floor(1000 + Math.random() * 9000)}`;
  res.status(201).json({
    success: true,
    indentNumber,
    status: 'SUBMITTED',
    warehouseDestination: 'District Central Medical Store (Aundh, Pune)'
  });
});

// POST /api/medicines/subscribe-alert - Patient SMS stock arrival alert
router.post('/subscribe-alert', (req, res) => {
  const { phone, medicineId, facilityId } = req.body;
  if (!phone || !medicineId) {
    return res.status(400).json({ success: false, error: 'Phone and medicineId required' });
  }

  res.json({
    success: true,
    message: 'SMS stock subscription active'
  });
});

module.exports = router;
