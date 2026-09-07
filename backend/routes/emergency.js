/**
 * HealthWay - Emergency 108 Dispatch & Telemetry Express Routes (Demand 12)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();

// Mock active emergencies in-memory state
const activeEmergencies = new Map();

/**
 * POST /api/emergency/dispatch
 * Receives one-tap SOS dispatch request from patient or ASHA worker
 */
router.post('/dispatch', (req, res) => {
  const { emergencyId, type, location, patient, timestamp } = req.body;

  const id = emergencyId || `EMG-${Date.now().toString(36).toUpperCase()}`;

  const dispatchRecord = {
    emergencyId: id,
    type: type || 'CRITICAL_MEDICAL_EMERGENCY',
    location: location || { lat: 18.5614, lng: 73.9838, accuracy: 8.5 },
    patient: patient || {
      name: 'Sunita Ramchandra Jadhav',
      phone: '+91 98220 12345',
      abhaId: 'MH-PN-24-00000001',
      category: 'Maternal Labor Crisis'
    },
    status: 'DISPATCHED',
    ambulance: {
      vehicleId: 'MH-12-HE-1080',
      vehicleType: 'Basic Life Support (BLS)',
      driverName: 'Santosh Vitthal Shinde (संतोष शिंदे)',
      driverPhone: '+91 98220 10801',
      paramedicName: 'Ramesh Patil (EMT Certified)',
      equipment: {
        oxygenCylinder: true,
        defibrillatorAed: true,
        emergencyDeliveryKit: true,
        ventilator: false
      },
      currentLocation: {
        latitude: 18.6210,
        longitude: 74.1120,
        landmarkEn: 'Koregaon Bhima Bypass Road (Near PHC Wagholi)',
        landmarkMr: 'कोरेगाव भीमा बायपास (प्रा.आ. केंद्र वाघोली जवळ)'
      },
      speedKmh: 58
    },
    destinationHospital: {
      nameEn: 'District Hospital Aundh, Pune',
      nameMr: 'जिल्हा रुग्णालय औंध, पुणे',
      casualtyDeskPhone: '020-25881080',
      traumaLevel: 'Level 1',
      bedStatus: 'BED_RESERVED',
      teamStatus: 'CASUALTY_TEAM_NOTIFIED'
    },
    initialEtaMinutes: 14,
    createdAt: timestamp || new Date().toISOString(),
    stages: ['DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING', 'ARRIVED_HOSPITAL'],
    currentStageIndex: 0
  };

  activeEmergencies.set(id, dispatchRecord);

  console.log(`[108 EMERGENCY DISPATCH] Created SOS ticket #${id} for ${dispatchRecord.patient.name}`);

  return res.status(201).json({
    success: true,
    message: '108 Central ERSS Emergency Unit Dispatched Successfully',
    data: dispatchRecord
  });
});

/**
 * GET /api/emergency/track/:emergencyId
 * Returns real-time GPS telemetry and vehicle progress
 */
router.get('/track/:emergencyId', (req, res) => {
  const { emergencyId } = req.params;
  const existing = activeEmergencies.get(emergencyId);

  if (existing) {
    // Dynamic progress calculation based on elapsed time
    const elapsedMinutes = (Date.now() - new Date(existing.createdAt).getTime()) / 60000;
    const remainingEta = Math.max(1, Math.round(existing.initialEtaMinutes - elapsedMinutes));
    
    let stageIndex = 0;
    if (elapsedMinutes > 10) stageIndex = 4;
    else if (elapsedMinutes > 7) stageIndex = 3;
    else if (elapsedMinutes > 4) stageIndex = 2;
    else if (elapsedMinutes > 1) stageIndex = 1;

    existing.currentStageIndex = stageIndex;
    existing.status = existing.stages[stageIndex];

    return res.json({
      success: true,
      emergencyId,
      status: existing.status,
      ambulance: existing.ambulance,
      destinationHospital: existing.destinationHospital,
      estimatedEtaMinutes: remainingEta,
      lastTelemetryPing: new Date().toISOString()
    });
  }

  // Default simulated response if not found in active session
  return res.json({
    success: true,
    emergencyId,
    status: 'EN_ROUTE',
    ambulance: {
      vehicleId: 'MH-12-HE-1080',
      vehicleType: 'Basic Life Support (BLS)',
      driverName: 'Santosh Vitthal Shinde',
      driverPhone: '+91 98220 10801',
      paramedicName: 'Ramesh Patil (EMT Certified)',
      currentLocation: {
        latitude: 18.6210,
        longitude: 74.1120,
        landmarkEn: 'Koregaon Bhima Bypass Road'
      },
      speedKmh: 56
    },
    destinationHospital: {
      nameEn: 'District Hospital Aundh, Pune',
      casualtyDeskPhone: '020-25881080',
      bedStatus: 'BED_RESERVED'
    },
    estimatedEtaMinutes: 9,
    lastTelemetryPing: new Date().toISOString()
  });
});

/**
 * POST /api/emergency/cancel/:emergencyId
 * Cancels or resolves an active emergency session
 */
router.post('/cancel/:emergencyId', (req, res) => {
  const { emergencyId } = req.params;
  const { reason } = req.body;

  if (activeEmergencies.has(emergencyId)) {
    const item = activeEmergencies.get(emergencyId);
    item.status = 'CANCELLED';
    item.cancelledAt = new Date().toISOString();
    item.cancelReason = reason || 'User requested resolution';
    activeEmergencies.set(emergencyId, item);
  }

  return res.json({
    success: true,
    emergencyId,
    status: 'CANCELLED',
    message: 'Emergency session successfully resolved or cancelled'
  });
});

/**
 * GET /api/emergency/contacts
 * Returns official Maharashtra Government emergency helplines
 */
router.get('/contacts', (req, res) => {
  res.json({
    success: true,
    helplines: [
      { number: '108', service: 'Ambulance Emergency Response', agency: 'Govt of Maharashtra / MEMS' },
      { number: '100', service: 'Police Control Room', agency: 'Maharashtra Police' },
      { number: '101', service: 'Fire Brigade', agency: 'Fire and Rescue Services' },
      { number: '181', service: 'Women Helpline', agency: 'Women & Child Development Dept' },
      { number: '1098', service: 'Child Helpline', agency: 'Childline India Foundation' },
      { number: '1077', service: 'Disaster Management Control Room', agency: 'Disaster Management Dept' }
    ]
  });
});

module.exports = router;

