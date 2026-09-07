/**
 * Consent Management Service (Backend Node/Express Spec)
 * Ayushman Bharat Digital Mission (ABDM) Consent Manager Specification
 * Strictly zero unicode emojis.
 */

const crypto = require('crypto');
const { ConsentPurposeEnum, ConsentStatusEnum, FHIRDataTypesEnum } = require('../models/ConsentArtifact.js');

class ConsentService {
  constructor() {
    this.consents = new Map();
    this.auditLogs = [];
    this.seedDefaultConsents();
  }

  seedDefaultConsents() {
    const defaults = [
      {
        consentId: 'CONSENT-MH-2024-0019',
        consentRequestId: 'CR-2024-0019',
        patientAbhaId: 'MH-PN-24-00000001',
        patientName: 'Sunita Ramchandra Jadhav',
        purpose: {
          code: 'CARE_MANAGEMENT',
          text: 'Care Management / Treatment'
        },
        hip: {
          id: 'PHC-SHIRUR',
          name: 'PHC Shirur (Govt of MH)'
        },
        hiu: {
          id: 'DH-PUNE',
          name: 'District Hospital Pune (Tertiary Referral)'
        },
        dataTypes: ['OPConsultation', 'DiagnosticReport', 'Prescription'],
        permission: {
          accessMode: 'VIEW',
          dateRange: {
            from: '2024-06-15T09:45:00.000Z',
            to: '2024-07-15T09:45:00.000Z'
          },
          dataEraseAt: '2024-08-15T09:45:00.000Z',
          frequency: { unit: 'MONTH', value: 1, repeats: 0 }
        },
        status: 'GRANTED',
        grantedAt: '2024-06-15T09:45:00.000Z',
        expiresAt: '2024-07-15T09:45:00.000Z',
        digitalSignature: 'SHA256:7f9a2b4c6e8d1a3f5b7e9c1d3f5a7b9e2c4d6f8a'
      },
      {
        consentId: 'CONSENT-MH-2024-0020',
        consentRequestId: 'CR-2024-0020',
        patientAbhaId: 'MH-PN-24-00000001',
        patientName: 'Sunita Ramchandra Jadhav',
        purpose: {
          code: 'CARE_MANAGEMENT',
          text: 'Emergency Medical Care'
        },
        hip: {
          id: 'DH-PUNE',
          name: 'District Hospital Pune'
        },
        hiu: {
          id: '108-MEMS',
          name: '108 MEMS Emergency Trauma Bay'
        },
        dataTypes: ['OPConsultation', 'WellnessRecord'],
        permission: {
          accessMode: 'VIEW',
          dateRange: {
            from: '2024-06-01T10:00:00.000Z',
            to: '2025-06-01T10:00:00.000Z'
          },
          dataEraseAt: '2025-07-01T10:00:00.000Z',
          frequency: { unit: 'YEAR', value: 1, repeats: 0 }
        },
        status: 'GRANTED',
        grantedAt: '2024-06-01T10:00:00.000Z',
        expiresAt: '2025-06-01T10:00:00.000Z',
        digitalSignature: 'SHA256:3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f'
      }
    ];

    for (const c of defaults) {
      this.consents.set(c.consentId, c);
    }
  }

  /**
   * List all consent artifacts with optional filters
   */
  listConsents(filter = {}) {
    let list = Array.from(this.consents.values());
    if (filter.patientAbhaId) {
      list = list.filter(c => c.patientAbhaId === filter.patientAbhaId);
    }
    if (filter.status) {
      list = list.filter(c => c.status === filter.status);
    }
    return list;
  }

  /**
   * Get consent by ID
   */
  getConsentById(consentId) {
    return this.consents.get(consentId) || null;
  }

  /**
   * Create a new consent request
   */
  createConsentRequest(data) {
    const consentRequestId = `CR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const consentId = `CONSENT-MH-${Date.now()}`;

    // Validate purpose
    const purposeCode = data.purposeCode || 'CARE_MANAGEMENT';
    const purposeTextMap = {
      'CARE_MANAGEMENT': 'Care Management / Outpatient / Inpatient treatment',
      'SELF': 'Self-requested health locker download',
      'RESEARCH': 'De-identified public health research',
      'BILLING': 'Insurance claims & PMJAY reimbursement'
    };

    const newConsent = {
      consentId,
      consentRequestId,
      patientAbhaId: data.patientAbhaId || 'MH-PN-24-00000001',
      patientName: data.patientName || 'Sunita Ramchandra Jadhav',
      purpose: {
        code: purposeCode,
        text: data.purposeText || purposeTextMap[purposeCode] || 'Care Management'
      },
      hip: {
        id: data.hipId || 'PHC-WAGHOLI',
        name: data.hipName || 'Primary Health Centre Wagholi'
      },
      hiu: {
        id: data.hiuId || 'DH-PUNE',
        name: data.hiuName || 'District Hospital Pune'
      },
      requester: {
        name: data.requesterName || 'Dr. Rajesh Deshmukh',
        identifier: data.requesterId || 'DOC-MH-0921',
        type: 'HEALTH_PROFESSIONAL'
      },
      dataTypes: data.dataTypes && data.dataTypes.length > 0 ? data.dataTypes : ['OPConsultation', 'DiagnosticReport', 'Prescription'],
      permission: {
        accessMode: data.accessMode || 'VIEW',
        dateRange: {
          from: data.dateFrom || new Date().toISOString(),
          to: data.dateTo || new Date(Date.now() + 30 * 86400000).toISOString()
        },
        dataEraseAt: data.eraseAt || new Date(Date.now() + 60 * 86400000).toISOString(),
        frequency: { unit: 'MONTH', value: 1, repeats: 0 }
      },
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      expiresAt: data.dateTo || new Date(Date.now() + 30 * 86400000).toISOString()
    };

    this.consents.set(consentId, newConsent);
    this.logAudit(consentId, 'CONSENT_REQUESTED', 'Consent requested by HIU');
    return newConsent;
  }

  /**
   * Grant consent
   */
  grantConsent(consentId) {
    const consent = this.consents.get(consentId);
    if (!consent) {
      throw new Error(`Consent not found: ${consentId}`);
    }

    const signature = crypto.createHash('sha256').update(`${consentId}-${consent.patientAbhaId}-${Date.now()}`).digest('hex');
    consent.status = 'GRANTED';
    consent.grantedAt = new Date().toISOString();
    consent.digitalSignature = `SHA256:${signature}`;
    this.logAudit(consentId, 'CONSENT_GRANTED', 'Patient granted electronic consent');
    return consent;
  }

  /**
   * Revoke consent
   */
  revokeConsent(consentId) {
    const consent = this.consents.get(consentId);
    if (!consent) {
      throw new Error(`Consent not found: ${consentId}`);
    }
    consent.status = 'REVOKED';
    consent.revokedAt = new Date().toISOString();
    this.logAudit(consentId, 'CONSENT_REVOKED', 'Patient revoked electronic consent');
    return consent;
  }

  /**
   * Verify if HIU is authorized to view a specific document type
   */
  isAuthorized(consentId, docType) {
    const consent = this.consents.get(consentId);
    if (!consent) return false;
    if (consent.status !== 'GRANTED') return false;
    if (new Date(consent.expiresAt) < new Date()) {
      consent.status = 'EXPIRED';
      return false;
    }
    return consent.dataTypes.includes(docType);
  }

  logAudit(consentId, action, notes) {
    this.auditLogs.push({
      logId: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      consentId,
      action,
      notes,
      timestamp: new Date().toISOString()
    });
  }

  getAuditLogs(consentId) {
    if (!consentId) return this.auditLogs;
    return this.auditLogs.filter(l => l.consentId === consentId);
  }
}

module.exports = new ConsentService();
