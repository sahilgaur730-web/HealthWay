/**
 * ABDM (Ayushman Bharat Digital Mission) Express Routes
 * ABDM Gateway v0.5 / v1.0 API Endpoints
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();
const abdmGateway = require('../services/abdmGateway');
const consentService = require('../services/consentService');

// GET /api/abdm/status - Gateway health & node certification status
router.get('/status', async (req, res) => {
  try {
    const token = await abdmGateway.getGatewayToken();
    res.json({
      success: true,
      service: 'ABDM NHA Sandbox Gateway Bridge',
      version: 'v0.5-R4',
      milestones: {
        M1: { certified: true, name: 'ABHA Creation & Verification' },
        M2: { certified: true, name: 'HFR & HPR Registry Integration' },
        M3: { certified: true, name: 'HIP & HIU Health Data Exchange' }
      },
      gatewayConnected: true,
      bridgeToken: token.substring(0, 16) + '...'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/sessions - Authenticate with ABDM Gateway
router.post('/sessions', async (req, res) => {
  try {
    const token = await abdmGateway.getGatewayToken();
    res.json({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/users/auth/init - Send OTP for ABHA authentication
router.post('/users/auth/init', async (req, res) => {
  try {
    const { authMethod = 'AADHAAR', identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Identifier (Aadhaar or Mobile) is required' });
    }
    const result = await abdmGateway.generateAbhaOtp(authMethod, identifier);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/users/auth/confirmWithAadhaarOtp - Verify Aadhaar OTP
router.post('/users/auth/confirmWithAadhaarOtp', async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    if (!txnId || !otp) {
      return res.status(400).json({ success: false, error: 'txnId and otp are required' });
    }
    const result = await abdmGateway.verifyAbhaOtp(txnId, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/users/auth/confirmWithMobileOtp - Verify Mobile OTP
router.post('/users/auth/confirmWithMobileOtp', async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    if (!txnId || !otp) {
      return res.status(400).json({ success: false, error: 'txnId and otp are required' });
    }
    const result = await abdmGateway.verifyAbhaOtp(txnId, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/abdm/patients/search - Search patient by ABHA number or address
router.get('/patients/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }
    const result = await abdmGateway.searchByAbha(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/links/link/init - Discover Care Contexts
router.post('/links/link/init', async (req, res) => {
  try {
    const { abhaAddress, patientIdentifier } = req.body;
    const result = await abdmGateway.discoverCareContexts(abhaAddress, patientIdentifier);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/links/link/confirm - Confirm Care Context Linking
router.post('/links/link/confirm', async (req, res) => {
  try {
    const { patientReference, careContexts } = req.body;
    const result = await abdmGateway.linkCareContext(patientReference, careContexts);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/consent-requests/init - Create consent request
router.post('/consent-requests/init', (req, res) => {
  try {
    const newConsent = consentService.createConsentRequest(req.body);
    res.status(201).json({
      success: true,
      consentRequestId: newConsent.consentRequestId,
      consentId: newConsent.consentId,
      status: newConsent.status,
      message: 'Consent request initialized successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/abdm/consents - List all consents
router.get('/consents', (req, res) => {
  try {
    const { patientAbhaId, status } = req.query;
    const consents = consentService.listConsents({ patientAbhaId, status });
    res.json({ success: true, count: consents.length, consents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/consents/:id/grant - Grant patient consent
router.post('/consents/:id/grant', (req, res) => {
  try {
    const consent = consentService.grantConsent(req.params.id);
    res.json({ success: true, consent, message: 'Consent granted' });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/consents/:id/revoke - Revoke consent
router.post('/consents/:id/revoke', (req, res) => {
  try {
    const consent = consentService.revokeConsent(req.params.id);
    res.json({ success: true, consent, message: 'Consent revoked' });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/abdm/health-information/hip/request - HIU data request
router.post('/health-information/hip/request', async (req, res) => {
  try {
    const { consentId } = req.body;
    if (!consentId) {
      return res.status(400).json({ success: false, error: 'consentId required' });
    }
    const result = await abdmGateway.requestHealthInformation(consentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
