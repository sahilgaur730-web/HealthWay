/**
 * Sync & Offline Replication API Routes (Express Router Spec)
 * Zero unicode emojis.
 */

const express = require('express');
const router = express.Router();

// GET /api/ping - Fast connectivity probe
router.all('/ping', (req, res) => {
  res.status(200).json({ status: 'pong', timestamp: Date.now() });
});

// GET /api/sync/status - Server sync gateway health
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'HealthWay State Sync Gateway',
    version: '1.0.0-MH',
    serverTime: new Date().toISOString(),
    status: 'OPERATIONAL',
    supportedProtocols: ['REST-JSON', 'IndexedDB-Replication']
  });
});

// POST /api/sync/batch - Batch ingestion of client offline queue
router.post('/batch', (req, res) => {
  const { clientId, items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid batch submission: items array required'
    });
  }

  const results = items.map((item, idx) => {
    // Simulated idempotent processing
    return {
      itemId: item.id || idx,
      type: item.type,
      status: 'SUCCESS',
      serverAck: `ACK-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString()
    };
  });

  res.json({
    success: true,
    batchId: `BATCH-${Date.now()}`,
    clientId: clientId || 'ANONYMOUS-CLIENT',
    totalReceived: items.length,
    processedCount: results.length,
    results
  });
});

module.exports = router;
