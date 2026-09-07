# HealthWay Platform — Authoritative Backend, API, Data Model & Synchronization Specification

**Author**: `survey_miner_2` (Backend & Data Spec Miner)  
**Date**: September 7, 2026  
**Status**: Comprehensive Specification Mining Complete  
**Scope**: Backend Architecture (`backend/`), Frontend Services (`src/services/`), Mock Data (`src/data/mockData.ts`), and Mobile Storage/Sync Contract  

---

## Table of Contents
1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [Complete REST & Backend Endpoint Catalog](#2-complete-rest--backend-endpoint-catalog)
3. [Data Models & TypeScript Interface Specifications](#3-data-models--typescript-interface-specifications)
4. [Authentication, Session & Security Protocols](#4-authentication-session--security-protocols)
5. [Real-Time Communication Protocols (Teleconsultation & SOS)](#5-real-time-communication-protocols-teleconsultation--sos)
6. [Offline-First Synchronization Engine & Native Mobile Storage Contract](#6-offline-first-synchronization-engine--native-mobile-storage-contract)
7. [Features Discovered Table](#7-features-discovered-table)
8. [Edge Cases & Observed Behaviors Table](#8-edge-cases--observed-behaviors-table)

---

## 1. Executive Architecture Overview

The HealthWay platform is designed for public health infrastructure in rural Maharashtra, operating across five facility tiers:
1. **Sub-Centre (SC)**: Frontline village health post run by Auxiliary Nurse Midwives (ANMs) and supported by ASHA workers.
2. **Primary Health Centre (PHC)**: 24x7 medical officer post serving clusters of 20,000–30,000 rural citizens.
3. **Community Health Centre (CHC)**: 30-bed secondary unit with basic surgical and obstetric capabilities.
4. **Sub-District Hospital (SDH)**: 50–100 bed first referral unit (FRU) for specialized interventions.
5. **District Hospital (DH)**: 300–1200 bed apex tertiary hospital (e.g., Sassoon General Hospital, Aundh DH, Pune).

### Architecture Components:
- **Backend Services (`backend/services/` & `backend/routes/`)**: Node.js CommonJS Express routers implementing the ABDM (Ayushman Bharat Digital Mission) Gateway v0.5/v1.0 specification, HL7 FHIR R4 document builders conforming to NRCES India profiles, National Health Mission (NHM/HMIS) reporting engines, 108 Emergency Dispatch telemetry, and offline sync gateways.
- **Client Service Layer (`src/services/`)**: High-performance TypeScript clinical engines including `offlineDB.ts` (IndexedDB 8-store storage engine), `syncService.ts` (offline queue management and network quality observer), `webrtcHandler.ts` (adaptive bandwidth WebRTC teleconsultation), `emergencyService.ts` (1-tap SOS and 108 dispatch), `queueEngine.ts` (priority queue and predictive wait time calculation), `diagnosticService.ts` (48-test diagnostic directory and barcode tracker), and `riskEngine.ts` (high-risk cohort surveillance).
- **Interoperability Links**: Active bridges to ABDM (NHA), HMIS (MoHFW Forms 1–12), MCTS (Mother & Child Tracking System), NIKSHAY (TB DOTS & DBT Poshan Yojana), CoWIN/U-WIN (Universal Immunization), and NCD (Hypertension & Diabetes screening).

---

## 2. Complete REST & Backend Endpoint Catalog

### 2.1 ABDM Gateway & Care Context Linkage (`/api/abdm`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/abdm/status` | `GET` | None | None | `{ success: true, service: string, version: string, milestones: { M1, M2, M3 }, gatewayConnected: true, bridgeToken: string }` | 500 | Check ABDM Gateway bridge health & milestone certifications (M1, M2, M3). |
| `/api/abdm/sessions` | `POST` | None | None | `{ accessToken: string, tokenType: "Bearer", expiresIn: 3600 }` | 500 | Authenticate with NHA ABDM Gateway sandbox. |
| `/api/abdm/users/auth/init` | `POST` | Bearer Token | `{ authMethod: "AADHAAR" \| "MOBILE", identifier: string }` | `{ success: true, txnId: string, message: string, authMethod: string, expiresInSeconds: 600 }` | 400 (missing identifier), 500 | Dispatch 6-digit OTP to mobile linked with Aadhaar or ABHA. |
| `/api/abdm/users/auth/confirmWithAadhaarOtp` | `POST` | Bearer Token | `{ txnId: string, otp: string }` | `{ success: true, message: string, abhaProfile: AbhaProfile }` | 400 (invalid OTP / expired txn), 500 | Verify Aadhaar OTP and issue verified ABHA profile. |
| `/api/abdm/users/auth/confirmWithMobileOtp` | `POST` | Bearer Token | `{ txnId: string, otp: string }` | `{ success: true, message: string, abhaProfile: AbhaProfile }` | 400 (invalid OTP), 500 | Verify Mobile OTP and issue verified ABHA profile. |
| `/api/abdm/patients/search` | `GET` | Bearer Token | Query: `query` (14-digit ABHA ID or `@abdm` address) | `{ success: true, patient: { abhaNumber, abhaAddress, name, gender, yearOfBirth, mobile, state, district, kycStatus, linkedCareContextsCount } }` | 400 (missing query), 500 | Lookup citizen by ABHA number or PHR virtual address. |
| `/api/abdm/links/link/init` | `POST` | Bearer Token | `{ abhaAddress: string, patientIdentifier: string }` | `{ success: true, matchedPatient: { referenceNumber, display, careContexts: Array<{ referenceNumber, display }> } }` | 500 | Discover unlinked care contexts (ANC, Lab, Referrals) for HIP linkage. |
| `/api/abdm/links/link/confirm` | `POST` | Bearer Token | `{ patientReference: string, careContexts: string[] }` | `{ success: true, linkRefNumber: string, message: string, linkedCount: number }` | 500 | Finalize care context binding to patient ABHA account. |
| `/api/abdm/consent-requests/init` | `POST` | Bearer Token | `{ patientAbhaId, purposeCode, hipId, hiuId, dataTypes, dateFrom, dateTo }` | `{ success: true, consentRequestId: string, consentId: string, status: "REQUESTED", message: string }` | 500 | Create electronic consent request from HIU to patient. |
| `/api/abdm/consents` | `GET` | Bearer Token | Query: `patientAbhaId`, `status` | `{ success: true, count: number, consents: ConsentArtifact[] }` | 500 | List consent artifacts filtered by patient ABHA or status. |
| `/api/abdm/consents/:id/grant` | `POST` | Bearer Token | None | `{ success: true, consent: ConsentArtifact, message: "Consent granted" }` | 404 (not found), 500 | Patient signs consent with electronic SHA-256 digital signature. |
| `/api/abdm/consents/:id/revoke` | `POST` | Bearer Token | None | `{ success: true, consent: ConsentArtifact, message: "Consent revoked" }` | 404 (not found), 500 | Immediately revoke active consent and cut HIU access. |
| `/api/abdm/health-information/hip/request` | `POST` | Bearer Token | `{ consentId: string }` | `{ success: true, transactionId: string, consentId: string, status: "ACKNOWLEDGED", message: string }` | 400 (missing consentId), 500 | Request encrypted FHIR bundle from HIP via ABDM Gateway. |

---

### 2.2 District Facility Dashboard & Administration (`/api/dashboard`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/dashboard/district` | `GET` | Bearer Token | None | `{ success: true, district: DistrictInfo, summary: DistrictSummary, facilities: Facility[], trends: { consultations, referrals, stockAlerts } }` | 500 | Retrieve comprehensive district health metrics, attendance, inventory alerts, and 7-day consultation trends. |
| `/api/dashboard/facility/:id` | `GET` | Bearer Token | None | `{ success: true, facility: Facility }` | 404 (facility not found) | Individual facility operational view: staff breakdown, consultations target, out-of-stock count, TB compliance score. |
| `/api/dashboard/facility/:id/action` | `POST` | Bearer Token | `{ actionType: string, notes: string }` | `{ success: true, actionId: string, facilityId: string, actionType: string, status: "DISPATCHED", messageEn: string, messageMr: string }` | 400, 500 | Register administrative intervention (e.g. emergency staff deployment or medicine replenishment). |

---

### 2.3 Diagnostic Lab Orders & Directory (`/api/diagnostics`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/diagnostics/orders` | `GET` | Bearer Token | Query: `patientId`, `status` | `{ success: true, message: string, count: number, data?: TestOrderItem[] }` | 500 | List active diagnostic orders across facilities. |
| `/api/diagnostics/orders/:id` | `GET` | Bearer Token | None | `{ success: true, orderId: string, barcode: string, status: TestOrderStatus, hasCriticalValue: boolean, results?: ParameterResult[] }` | 404, 500 | Fetch detailed test order, tracking status, and verified lab values. |
| `/api/diagnostics/orders` | `POST` | Bearer Token | `{ patientId, abhaId, tests, priority, collectionMethod, clinicalNotes, prescribedByDoctor }` | `201 Created`: `{ success: true, barcode: string, data: TestOrderItem }` | 400, 500 | Create new diagnostic requisition; auto-generates barcode `MH-LAB-XXXXXX`. |
| `/api/diagnostics/orders/:id/status` | `PATCH` | Bearer Token | `{ status: TestOrderStatus }` | `{ success: true, orderId: string, newStatus: string, updatedAt: string }` | 400, 500 | Update specimen pipeline (`ORDERED` -> `SAMPLE_COLLECTED` -> `IN_TRANSIT` -> `PROCESSING` -> `COMPLETED`). |
| `/api/diagnostics/orders/:id/results` | `POST` | Bearer Token | `{ results: ParameterResult[], impression: string, verifiedBy: string }` | `201 Created`: `{ success: true, orderId: string, status: "COMPLETED", results, impression, verifiedBy, abhaRecordSyncId: string, pdfDownloadUrl: string }` | 400, 500 | Upload pathologist-verified results and trigger ABHA record sync. |
| `/api/diagnostics/labs` | `GET` | Bearer Token | Query: `empanelled`, `homeCollection`, `openNow`, `govtOnly` | `{ success: true, count: number, filters: object, filtersSupported: string[] }` | 500 | Search nearby empanelled NABL / government diagnostic labs. |
| `/api/diagnostics/tests` | `GET` | None | None | `{ success: true, totalTests: 48, categories: ['Hematology', 'Biochemistry', 'Urine', 'Microbiology', 'Radiology'] }` | 500 | Catalog directory of 48+ diagnostic tests. |

---

### 2.4 Emergency SOS & 108 Ambulance Dispatch (`/api/emergency`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/emergency/dispatch` | `POST` | None (Public SOS) | `{ emergencyId?: string, type?: string, location: { lat, lng, accuracy }, patient?: { name, phone, abhaId, category }, timestamp?: string }` | `201 Created`: `{ success: true, message: string, data: EmergencySosSession }` | 400, 500 | Trigger 1-Tap SOS dispatch; allocates 108 BLS/ALS ambulance and reserves hospital trauma bay. |
| `/api/emergency/track/:emergencyId` | `GET` | None | None | `{ success: true, emergencyId: string, status: string, ambulance: AmbulanceDispatchUnit, destinationHospital: object, estimatedEtaMinutes: number, lastTelemetryPing: string }` | 500 | Stream real-time GPS telemetry, vehicle speed (km/h), driver contact, and remaining ETA. |
| `/api/emergency/cancel/:emergencyId` | `POST` | None | `{ reason: string }` | `{ success: true, emergencyId: string, status: "CANCELLED", message: string }` | 500 | Cancel or resolve emergency session. |
| `/api/emergency/contacts` | `GET` | None | None | `{ success: true, helplines: Array<{ number: string, service: string, agency: string }> }` | 500 | Official Maharashtra emergency helplines (`108`, `100`, `101`, `181`, `1098`, `1077`). |

---

### 2.5 HL7 FHIR R4 Interoperability (`/api/fhir`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/fhir/metadata` | `GET` | None | None | `{ resourceType: "CapabilityStatement", fhirVersion: "4.0.1", ... }` | 500 | NRCES India compliant FHIR CapabilityStatement defining supported resources. |
| `/api/fhir/Patient/:id` | `GET` | Bearer Token | None | NRCES FHIR `Patient` JSON Resource | 404, 500 | Query patient demographics and ABHA identifier in standard FHIR format. |
| `/api/fhir/generate/:docType` | `POST` | Bearer Token | Document payload | `{ success: true, documentType: string, bundle: FHIRBundle }` | 400 (invalid docType), 500 | Build NRCES-compliant document bundle (`OPConsultation`, `DischargeSummary`, `DiagnosticReport`, `Prescription`, `ImmunizationRecord`, `WellnessRecord`). |
| `/api/fhir/Bundle/:id` | `GET` | Bearer Token | None | FHIR `Bundle` JSON Resource | 404, 500 | Fetch complete longitudinal clinical document bundle. |
| `/api/fhir/Bundle` | `POST` | Bearer Token | FHIR Bundle payload | `201 Created`: `{ resourceType: "OperationOutcome", issue: [...] }` | 400 (invalid FHIR payload), 500 | Ingest and validate external FHIR bundle. |
| `/api/fhir/Observation` | `GET` | Bearer Token | Query: `patient`, `category`, `code` | FHIR `Bundle` of type `searchset` containing LOINC Observations (BP, Hb, Glucose, SpO2, Pulse). | 500 | Query clinical observations. |
| `/api/fhir/Condition` | `GET` | Bearer Token | Query: `patient` | FHIR `Bundle` containing ICD-10 / SNOMED Conditions. | 500 | Query patient medical conditions. |
| `/api/fhir/MedicationRequest` | `GET` | Bearer Token | Query: `patient` | FHIR `Bundle` containing SNOMED MedicationRequests. | 500 | Query active electronic prescriptions. |

---

### 2.6 High-Risk Patient Surveillance (`/api/highrisk`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/highrisk/patients` | `GET` | Bearer Token | Query: `category`, `urgency`, `ashaName`, `village` | `{ success: true, count: number, data: HighRiskPatient[] }` | 500 | Retrieve high-risk surveillance cohort (ANC, Newborn, Diabetes, HTN, TB, Malnutrition). |
| `/api/highrisk/patients` | `POST` | Bearer Token | `{ abhaId, nameEn, nameMr, age, category, severity, assignedAsha, nextFollowUpDate }` | `201 Created`: `{ success: true, patientId: string, message: string }` | 400 (missing fields), 500 | Enroll patient into high-risk register. |
| `/api/highrisk/visit` | `POST` | Bearer Token | `{ patientId, vitals, medicineAdherence, dangerSigns, nextScheduledDate }` | `{ success: true, message: string }` | 400, 500 | Log frontline ASHA/ANM home visit and confirm next appointment. |
| `/api/highrisk/escalate` | `POST` | Bearer Token | `{ patientId: string, level: "ASHA_ALERT" \| "MO_ALERT" \| "DHO_CRITICAL", notes: string }` | `{ success: true, escalationLevel: string, alertDispatched: boolean }` | 400, 500 | Escalate overdue patient to Medical Officer or DHO. |
| `/api/highrisk/analytics` | `GET` | Bearer Token | None | `{ success: true, analytics: { totalCohort, overdueCount, criticalCount, avgAdherence } }` | 500 | High-risk district analytics and adherence summary. |

---

### 2.7 National Interoperability Connectors (`/api/interop`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/interop/systems` | `GET` | Bearer Token | None | `{ success: true, total: number, systems: ExternalSystem[] }` | 500 | Status of all 7 national gateways (ABDM, NHM, HMIS, MCTS, NIKSHAY, COWIN, NCD). |
| `/api/interop/systems/:systemCode/sync` | `POST` | Bearer Token | None | `{ success: true, systemCode: string, message: string, lastSyncTimestamp: string, system: ExternalSystem }` | 404 (system not found) | Force manual synchronization batch with specific national system. |
| `/api/interop/systems/:systemCode/test-connection` | `POST` | Bearer Token | None | `{ success: true, systemCode: string, connectionStatus: "ONLINE", latencyMs: number, message: string }` | 404, 500 | Perform TLS 1.3 ping and latency test against external gateway. |
| `/api/interop/nhm/hmis-report` | `GET` | Bearer Token | Query: `month` | `{ success: true, reportingMonth: string, totalIndicators: number, indicators: HmisIndicator[] }` | 500 | Generate MoHFW HMIS Forms 1-12 monthly indicator report. |
| `/api/interop/nhm/hmis-report/submit` | `POST` | Bearer Token | Report JSON payload | `{ success: boolean, submissionId: string, status: string, ackNumber?: string }` | 500 | Ingest monthly indicators into NHM Central Gateway (auto-queues on 503). |
| `/api/interop/nhm/mcts-report` | `GET` | Bearer Token | Query: `month` | `{ success: true, report: MctsReport }` | 500 | Mother & Child Tracking System line-list report. |
| `/api/interop/nhm/nikshay-report` | `GET` | Bearer Token | Query: `month` | `{ success: true, report: NikshayReport }` | 500 | Nikshay TB surveillance and DBT Poshan Yojana disbursal report. |
| `/api/interop/nhm/ncd-report` | `GET` | Bearer Token | Query: `month` | `{ success: true, report: NcdReport }` | 500 | Universal 30+ NCD screening and referral linkage report. |
| `/api/interop/queue/failed` | `GET` | Bearer Token | None | `{ success: true, total: number, queue: FailedQueueItem[] }` | 500 | List failed outbound transmissions awaiting retry. |
| `/api/interop/queue/retry` | `POST` | Bearer Token | None | `{ success: true, recoveredCount: number, remainingFailedCount: number, recoveredItems: any[] }` | 500 | Execute retry engine over failed transmission queue. |
| `/api/interop/export/:format` | `GET` | Bearer Token | Param: `csv` or `json` | File attachment (`text/csv`) or JSON data stream | 500 | Export HMIS monthly data in CSV or JSON format. |

---

### 2.8 Medicine Inventory & Essential Drug List (`/api/medicines`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/medicines` | `GET` | None | Query: `category`, `search` | `{ success: true, count: number, data: MedicineMaster[] }` | 500 | Catalog of 18+ Essential Drug List (EDL) medicines. |
| `/api/medicines/stock` | `GET` | None | Query: `facilityId`, `status`, `medicineId` | `{ success: true, facilityId: string, data: FacilityStockItem[] }` | 500 | Search live inventory across Sub-Centres, PHCs, and CHCs. |
| `/api/medicines/stock/update` | `POST` | Bearer Token | `{ facilityId, medicineId, quantity, batchNumber, expiryDate, updateType }` | `{ success: true, message: string, updatedStock: object }` | 400 (missing parameters), 500 | Adjust stock balance, record batch number, and update expiry dates. |
| `/api/medicines/indent` | `POST` | Bearer Token | `{ facilityId, items: Array<{ medicineId, requestedQuantity }>, urgency }` | `201 Created`: `{ success: true, indentNumber: string, status: "SUBMITTED", warehouseDestination: string }` | 400 (empty indent), 500 | Submit emergency drug requisition indent to Central Warehouse. |
| `/api/medicines/subscribe-alert` | `POST` | None | `{ phone: string, medicineId: string, facilityId: string }` | `{ success: true, message: "SMS stock subscription active" }` | 400 (missing phone/medicineId) | Subscribe patient for SMS notification when out-of-stock drug arrives. |

---

### 2.9 Referral Pipeline & SLA Management (`/api/referrals`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/referrals` | `GET` | Bearer Token | Query: `urgency`, `stage` | `{ success: true, message: string, total: number, stages: string[] }` | 500 | List active referrals across the 7-stage pipeline. |
| `/api/referrals/overdue` | `GET` | Bearer Token | None | `{ success: true, count: number, overdueReferrals: Array<{ token, isOverdue: true, overdueHours: number, recommendedAction: string }> }` | 500 | Query referrals that have exceeded SLA threshold hours. |
| `/api/referrals/:id` | `GET` | Bearer Token | None | `{ success: true, referralId: string, token: string, stage: ReferralStage, slaMet: boolean }` | 404, 500 | Get detailed referral tracking record. |
| `/api/referrals/patient/:patientId` | `GET` | Bearer Token | None | `{ success: true, patientId: string, count: number, data: ReferralItem[] }` | 500 | Fetch referrals initiated for a specific patient. |
| `/api/referrals` | `POST` | Bearer Token | Referral payload | `201 Created`: `{ success: true, token: string, data: ReferralItem }` | 400, 500 | Create referral slip; auto-generates token `REF-YYYYMMDD-XXXX`. |
| `/api/referrals/:id/stage` | `PATCH` | Bearer Token | `{ stage: ReferralStage, notes?: string }` | `{ success: true, referralId: string, newStage: string, notes: string, updatedAt: string }` | 400, 500 | Transition referral through pipeline steps. |
| `/api/referrals/:id/feedback` | `POST` | Bearer Token | Receiving doctor clinical notes & outcome status | `{ success: true, referralId: string, feedback: object, stage: "COMPLETED", updatedAt: string }` | 400, 500 | Ingest receiving specialist feedback & counter-referral advice. |
| `/api/referrals/:id/reminders` | `POST` | Bearer Token | `{ recipient: string, message: string, channel: "SMS" \| "APP" }` | `201 Created`: `{ success: true, reminderId: string, status: "DELIVERED" }` | 400, 500 | Log reminder dispatched to patient or escorting ASHA worker. |
| `/api/referrals/:id/escalate` | `POST` | Bearer Token | `{ reason: string }` | `201 Created`: `{ success: true, ticketId: string, escalatedTo: "District Health Officer (DHO, Pune Zone)", status: "OPEN" }` | 400, 500 | Escalate overdue emergency referral directly to DHO desk. |

---

### 2.10 Offline Sync & Connectivity Probes (`/api/sync`)

| Endpoint | Method | Headers / Auth | Request Body / Query | Success Response (200/201) | Error Codes | Description |
|---|---|---|---|---|---|---|
| `/api/ping` | `ALL` | None | None | `200 OK`: `{ status: "pong", timestamp: number }` | None | Ultra-lightweight latency probe to measure connection quality. |
| `/api/sync/status` | `GET` | None | None | `{ success: true, service: string, version: string, serverTime: string, status: "OPERATIONAL", supportedProtocols: string[] }` | 500 | Server replication engine operational status. |
| `/api/sync/batch` | `POST` | Bearer Token | `{ clientId: string, items: Array<{ id, type, url, method, data }> }` | `{ success: true, batchId: string, clientId: string, totalReceived: number, processedCount: number, results: Array<{ itemId, type, status: "SUCCESS", serverAck: string }> }` | 400 (invalid batch), 500 | Idempotent bulk ingestion of client offline queue mutations. |

---

## 3. Data Models & TypeScript Interface Specifications

### 3.1 Patient & ABHA Profile Data Models

```typescript
export interface AbhaProfile {
  abhaNumber: string;        // 14-digit format: "14-8842-1928-3011"
  abhaAddress: string;       // e.g. "sunita.jadhav@abdm"
  name: string;              // "Sunita Ramchandra Jadhav"
  nameMr?: string;           // "सुनीता रामचंद्र जाधव"
  gender: 'Female' | 'Male' | 'Other';
  dateOfBirth: string;       // "14/05/1996"
  age?: number;
  mobile: string;            // "+91 98230 12345"
  address: string;
  district: string;
  state: string;
  pincode?: string;
  linkedAadhaarLast4?: string;
  kycVerified: boolean;
  token?: string;
}

export interface PatientProfile {
  id: string;                // "PT-001"
  nameMr: string;
  nameEn: string;
  abhaId: string;
  aadhaarLast4: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  village: string;
  block: string;
  district: string;
  bloodGroup: string;
  phone: string;
  conditions: string[];
  riskLevel: 'normal' | 'moderate' | 'high';
  lastVisit: string;
  nextFollowUp: string;
}

export interface PatientLongitudinalData {
  patient: AbhaProfile;
  conditions: ConditionRecord[];
  allergies: AllergyRecord[];
  vitalsHistory: VitalTrendRecord[];
  immunizations: ImmunizationRecord[];
  visits: VisitHistoryRecord[];
  medications: MedicationRecord[];
  labReports: LabReportRecord[];
  documents: DocumentRecord[];
}
```

### 3.2 High-Risk Surveillance & Frontline ASHA Models

```typescript
export type ClinicalRiskCategory = 
  | 'PREGNANT' 
  | 'NEWBORN' 
  | 'DIABETES' 
  | 'HYPERTENSION' 
  | 'TUBERCULOSIS' 
  | 'MENTAL_HEALTH' 
  | 'MALNUTRITION';

export type RiskUrgencyTier = 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'DUE_WEEK' | 'ON_TRACK';
export type EscalationLevel = 'NONE' | 'ASHA_ALERT' | 'MO_ALERT' | 'DHO_CRITICAL';

export interface HomeVisitLog {
  id: string;
  visitDate: string;
  visitedBy: string;
  role: 'ASHA' | 'ANM' | 'Medical Officer';
  vitals: {
    bp?: string;
    bloodGlucose?: string;
    weightKg?: number;
    hbGdl?: number;
    muacMm?: number;
    spo2?: number;
    tempF?: number;
  };
  medicineAdherence: 'FULL' | 'PARTIAL' | 'MISSED';
  dangerSignsObserved: string[];
  clinicalObservationsEn: string;
  clinicalObservationsMr: string;
  actionTakenEn: string;
  actionTakenMr: string;
  nextScheduledVisit: string;
}

export interface HighRiskPatient {
  id: string;                // "HRP-001"
  abhaId: string;
  nameEn: string;
  nameMr: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  village: string;
  block: string;
  district: string;
  category: ClinicalRiskCategory;
  categoryLabelEn: string;
  categoryLabelMr: string;
  severity: 'MODERATE' | 'HIGH' | 'CRITICAL';
  clinicalRiskFactorsEn: string[];
  clinicalRiskFactorsMr: string[];
  dangerSignsEn: string[];
  dangerSignsMr: string[];
  assignedAshaName: string;
  assignedAshaPhone: string;
  assignedPhcName: string;
  assignedPhcNameMr: string;
  assignedDoctorName: string;
  registrationDate: string;
  lastVisitDate: string;
  nextFollowUpDate: string;
  daysOverdue: number;
  urgency: RiskUrgencyTier;
  escalationLevel: EscalationLevel;
  adherencePercentage: number;
  status: 'ACTIVE' | 'STABILIZED' | 'TRANSFERRED' | 'DELIVERED';
  vitalsSnapshot: {
    bp?: string;
    bloodSugar?: string;
    hb?: string;
    weight?: string;
    muacMm?: number;
    gestationalAgeWeeks?: number;
    eddDate?: string;
    spo2?: number;
  };
  visitsHistory: HomeVisitLog[];
  escalationNotes?: string;
}

export interface AshaTask {
  id: string;
  patientName: string;
  patientId: string;
  taskMr: string;
  taskEn: string;
  priority: 'high' | 'medium' | 'normal';
  time: string;
  condition: 'pregnant' | 'diabetic' | 'tb' | 'hypertensive' | 'newborn';
  done: boolean;
}
```

### 3.3 Doctor, OPD Queue & Appointment Models

```typescript
export interface DoctorModel {
  _id: string;
  name: string;
  nameMr: string;
  registrationNumber: string;
  specialization: string;
  specializationMr: string;
  qualifications: string[];
  healthCenterId: string;
  department: string;
  schedule: Array<{
    day: string;
    slots: Array<{
      startTime: string;
      endTime: string;
      maxPatients: number;
      bookedPatients: number;
      slotType: 'general' | 'emergency' | 'antenatal' | 'immunization';
    }>;
  }>;
  avgConsultationTime: number; // minutes
  isAvailable: boolean;
  languages: string[];
}

export interface AppointmentModel {
  appointmentId: string;     // e.g. "APT-20240907-9102"
  patient: {
    name: string;
    phone: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    abhaId?: string;
    address?: string;
  };
  healthCenterId: string;
  healthCenterName: string;
  doctorId?: string;
  doctorName?: string;
  department: string;
  appointmentDate: string;   // ISO string
  timeSlot: {
    startTime: string;       // e.g. "10:00 AM"
    endTime: string;         // e.g. "10:30 AM"
    slotIndex?: number;
  };
  tokenNumber?: number;
  type: 'regular' | 'emergency' | 'follow-up' | 'antenatal' | 'immunization' | 'teleconsultation';
  status: 'booked' | 'confirmed' | 'waiting' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'normal' | 'urgent' | 'emergency';
  symptoms: string[];
  chiefComplaint?: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  checkInTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  isAshaAssisted?: boolean;
  ashaWorkerId?: string;
  notes?: string;
  cancellationReason?: string;
}

export interface QueueEntryModel {
  tokenNumber: number;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'waiting' | 'called' | 'in-consultation' | 'completed' | 'skipped' | 'absent';
  checkInTime: string;
  calledTime?: string;
  completionTime?: string;
  waitDuration?: number;
  consultationDuration?: number;
  position: number;
  estimatedWait: number;
}

export interface QueueModel {
  healthCenterId: string;
  department: string;
  date: string;
  currentToken: number;
  entries: QueueEntryModel[];
  stats: {
    totalTokensIssued: number;
    totalCompleted: number;
    totalSkipped: number;
    avgWaitTime: number;
    avgConsultationTime: number;
    lastUpdated: string;
  };
  isActive: boolean;
  pausedAt?: string;
  pauseReason?: string;
}
```

### 3.4 Diagnostic Lab & Barcode Models

```typescript
export type DiagnosticCategory = 'Hematology' | 'Biochemistry' | 'Urine' | 'Microbiology' | 'Radiology';
export type TestPriority = 'STAT' | 'URGENT' | 'ROUTINE';
export type SampleCollectionMethod = 'VISIT_LAB' | 'HOME_COLLECTION' | 'AT_FACILITY';
export type TestOrderStatus = 'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_TRANSIT' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface ParameterResult {
  parameterId: string;
  name: string;
  nameMr: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'BORDERLINE' | 'CRITICAL';
  criticalReasonMr?: string;
  criticalReasonEn?: string;
}

export interface CatalogTestItem {
  id: string;
  code: string;
  nameMr: string;
  nameEn: string;
  category: DiagnosticCategory;
  categoryLabelMr: string;
  categoryLabelEn: string;
  sampleType: string;
  fastingRequired: boolean;
  tatHours: number;
  isEmpanelledGovt: boolean;
  defaultParameters?: ParameterResult[];
}

export interface TestOrderItem {
  id: string;                // "ORD-20240907-8841"
  barcode: string;           // "MH-LAB-849201"
  patientId: string;
  patientNameMr: string;
  patientNameEn: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;
  prescribedByDoctorMr: string;
  prescribedByDoctorEn: string;
  facilityMr: string;
  facilityEn: string;
  targetLabId: string;
  targetLabNameMr: string;
  targetLabNameEn: string;
  tests: CatalogTestItem[];
  priority: TestPriority;
  collectionMethod: SampleCollectionMethod;
  clinicalNotes: string;
  status: TestOrderStatus;
  createdAt: string;
  updatedAt: string;
  sampleCollectedAt?: string;
  inTransitAt?: string;
  processingAt?: string;
  completedAt?: string;
  results?: ParameterResult[];
  overallImpressionMr?: string;
  overallImpressionEn?: string;
  hasCriticalValue: boolean;
  verifiedByPathologistMr?: string;
  verifiedByPathologistEn?: string;
  nablCertNumber?: string;
  abhaRecordSyncId?: string;
  pdfDownloadUrl?: string;
}
```

### 3.5 Inter-Facility Referral Models

```typescript
export type ReferralStage = 
  | 'CREATED'
  | 'NOTIFIED'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'REACHED'
  | 'ADMITTED'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'ELECTIVE';

export interface StageHistoryItem {
  stage: ReferralStage;
  timestamp: string;
  locationMr: string;
  locationEn: string;
  notesMr: string;
  notesEn: string;
}

export interface DoctorFeedbackData {
  id: string;
  receivingDoctorName: string;
  receivingHospital: string;
  specialty: string;
  date: string;
  outcomeStatus: 'ADMITTED' | 'OPD_TREATED' | 'TRANSFERRED' | 'DISCHARGED';
  finalDiagnosisMr: string;
  finalDiagnosisEn: string;
  treatmentSummaryMr: string;
  treatmentSummaryEn: string;
  counterReferralAdviceMr: string;
  counterReferralAdviceEn: string;
  followUpDate: string;
}

export interface ReferralItem {
  id: string;                // Token: "REF-20240907-1192"
  patientId: string;
  patientNameMr: string;
  patientNameEn: string;
  patientPhone: string;
  patientVillage: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;
  referringFacilityMr: string;
  referringFacilityEn: string;
  referringDoctorMr: string;
  referringDoctorEn: string;
  targetHospitalId: string;
  targetHospitalNameMr: string;
  targetHospitalNameEn: string;
  departmentMr: string;
  departmentEn: string;
  urgency: UrgencyLevel;
  primaryReasonMr: string;
  primaryReasonEn: string;
  provisionalDiagnosis: string;
  vitalsSummary: {
    bp: string;
    pulse: string;
    spO2: string;
    sugar?: string;
  };
  transportNeeded: boolean;
  transportType?: '108_AMBULANCE' | '102_JANANI' | 'OWN_VEHICLE';
  transportStatus?: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    etaMinutes: number;
    liveStatusMr: string;
    liveStatusEn: string;
  };
  ashaEscortAssigned: boolean;
  ashaName?: string;
  ashaPhone?: string;
  stage: ReferralStage;
  isOverdue: boolean;
  overdueHours: number;
  stageHistory: StageHistoryItem[];
  reminders: any[];
  feedback?: DoctorFeedbackData;
  createdAt: string;
  updatedAt: string;
}
```

### 3.6 Emergency SOS & 108 Dispatch Models

```typescript
export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  villageEn: string;
  villageMr: string;
  talukaEn: string;
  talukaMr: string;
  districtEn: string;
  districtMr: string;
}

export interface AmbulanceDispatchUnit {
  vehicleId: string;         // "MH-12-HE-1080"
  vehicleType: 'Basic Life Support (BLS)' | 'Advanced Life Support (ALS)';
  driverName: string;
  driverPhone: string;
  paramedicName: string;
  equipment: {
    oxygenCylinder: boolean;
    defibrillatorAed: boolean;
    emergencyDeliveryKit: boolean;
    ventilator: boolean;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    landmarkEn: string;
    landmarkMr: string;
  };
  initialEtaMinutes: number;
}

export interface EmergencyPreArrivalAlert {
  alertId: string;
  destinationHospitalEn: string;
  destinationHospitalMr: string;
  casualtyDeskPhone: string;
  traumaLevel: 'Level 1' | 'Level 2' | 'Level 3';
  patientAbhaId: string;
  patientName: string;
  clinicalCategory: 'Severe Trauma / Accident' | 'Cardiac Emergency' | 'Maternal Labor Crisis' | 'Respiratory Distress';
  vitalsReported: {
    bp: string;
    pulse: number;
    spo2: number;
  };
  sentAt: string;
  status: 'RECEIVED' | 'BED_RESERVED' | 'TEAM_READY';
}

export interface EmergencySosSession {
  sosId: string;             // "SOS-108-MH-849201"
  triggeredAt: string;
  gps: GpsCoordinates;
  ambulance: AmbulanceDispatchUnit;
  preArrivalAlert: EmergencyPreArrivalAlert;
  codeRedTriageToken: string;// "CODE-RED-MH-4921"
  stage: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING' | 'ARRIVED_HOSPITAL';
  currentEtaMinutes: number;
}
```

### 3.7 Medicine Stock & Supply Chain Models

```typescript
export type StockStatusTier = 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK' | 'EXPIRING_SOON';
export type MedicineCategory = 'ESSENTIAL' | 'MATERNAL_CHILD' | 'CHRONIC_NCD' | 'ANTIBIOTIC' | 'VACCINE' | 'EMERGENCY' | 'OTC';

export interface MedicineMaster {
  id: string;                // "MED-001"
  code: string;              // "EDL-PCM-500"
  nameEn: string;
  nameMr: string;
  genericName: string;
  category: MedicineCategory;
  form: 'Tablet' | 'Syrup' | 'Injection' | 'Sachet' | 'Drops' | 'Ointment';
  formMr: string;
  strength: string;
  program: 'NHM EDL' | 'PMSMA' | 'JSSK' | 'NPCDCS' | 'NTEP' | 'UIP';
  dosageGuidelineEn: string;
  dosageGuidelineMr: string;
  standardPackUnit: string;
  standardPackUnitMr: string;
  minBufferThreshold: number;
  dailyConsumptionEstimate: number;
}

export interface FacilityStockItem {
  facilityId: string;
  facilityName: string;
  facilityNameMr: string;
  facilityType: 'Sub-Centre' | 'PHC' | 'Rural Hospital' | 'District Hospital';
  distanceKm: number;
  phone: string;
  dispensaryHoursEn: string;
  dispensaryHoursMr: string;
  medicineId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  currentStock: number;
  unit: string;
  unitMr: string;
  lastUpdated: string;
  monthlyAllocation: number;
  status: StockStatusTier;
  daysOfSupplyRemaining: number;
  daysUntilExpiry: number;
}

export interface StockIndentRequest {
  id: string;
  indentNumber: string;      // "IND-2024-MH-4821"
  facilityId: string;
  facilityName: string;
  dateCreated: string;
  urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY';
  items: Array<{
    medicineId: string;
    medicineName: string;
    currentStock: number;
    requestedQuantity: number;
    unit: string;
    reason: string;
  }>;
  status: 'SUBMITTED' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED';
  warehouseDestination: string;
  dispatchedAt?: string;
  trackingNumber?: string;
}
```

### 3.8 Facility, Health Index & Outbreak Alert Models

```typescript
export type FacilityTypeKey = 'SC' | 'PHC' | 'CHC' | 'SDH' | 'DH';
export type GradeKey = 'A' | 'B' | 'C' | 'D' | 'F';

export interface AlertItem {
  id?: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'medicine' | 'staff' | 'performance' | 'highrisk' | 'referral';
  messageEn: string;
  messageMr: string;
  timestamp?: string;
  facilityId?: string;
  facilityName?: string;
}

export interface FacilityMetrics {
  consultationsToday: number;
  consultationsTarget: number;
  consultationsMonth: number;
  referralsSent: number;
  referralsCompleted: number;
  medicinesOutOfStock: number;
  highRiskPatients: number;
  overdueFollowUps: number;
  deliveries: number;
  vaccinationsToday: number;
  tbPatientsActive: number;
  tbCompliance: number;      // 0-100 percentage
}

export interface Facility {
  id: string;                // "FAC001"
  name: string;
  nameMr: string;
  type: FacilityTypeKey;
  block: string;
  blockMr: string;
  inCharge: string;
  inChargeMr: string;
  inChargeRole: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  staffTotal: number;
  staffPresent: number;
  metrics: FacilityMetrics;
  performance: {
    score?: number;          // 0-100 weighted
    trend: string;           // "+3", "-8"
    lastMonth: number;
  };
  alerts: AlertItem[];
  lastDataSync: string;
}

export interface OutbreakAlert {
  alertId: string;
  village: string;
  block: string;
  suspectedDisease: 'Dengue' | 'Malaria' | 'Cholera' | 'Measles' | 'Food Poisoning';
  caseCount: number;
  dateReported: string;
  status: 'INVESTIGATING' | 'CONFIRMED' | 'CONTAINED';
  rapidResponseTeamDispatched: boolean;
  quarantineRadiusKm: number;
}
```

---

## 4. Authentication, Session & Security Protocols

### 4.1 ABHA ID & Mobile/Aadhaar OTP Flow
1. **Initiation (`/api/abdm/users/auth/init`)**:
   - Client sends 14-digit ABHA ID, 12-digit Aadhaar, or 10-digit Mobile Number.
   - Server registers transaction state `txnId = TXN-<timestamp>-<hex>`, generates sandbox demo OTP `789123` (or `432101` / `123456`), and sets 10-minute expiry (`600s`).
2. **Confirmation (`/confirmWithAadhaarOtp` or `/confirmWithMobileOtp`)**:
   - Client submits `{ txnId, otp }`.
   - On match, server issues:
     - `accessToken`: Standard JWT Bearer token signed with HMAC-SHA256 containing claims (`sub: abhaNumber`, `role: patient`, `iat`, `exp: 3600`).
     - `abhaProfile`: KYC-verified demographic profile.
3. **Session Persistence**:
   - On Web: Session cached in `localStorage` under `hw_abha_active_session_v1`.
   - On Native Mobile: MUST be stored securely using `expo-secure-store` (`SecureStore.setItemAsync('hw_session_jwt', token)`) with biometric hardware encryption (FaceID/Fingerprint).

### 4.2 Role-Based Access Control (RBAC) Matrix

| Resource / Module | Patient Role | ASHA Worker Role | Doctor / Medical Officer | District Admin / DHO |
|---|---|---|---|---|
| Self ABHA Profile & PHR | Full (Read/Write) | Read-only | Read with Consent | Read-only de-identified |
| Community Household Registry | No access | Full (Read/Write) | Read assigned block | Read District Aggregate |
| OPD Queue Calling & Consultation | View own Token | Register Beneficiary | Full Call/Complete | Monitor All Queues |
| Prescription & Clinical Note Writer | View own Rx | View instructions | Full (Create/Sign) | Audit access |
| High-Risk Surveillance Escalations | View own advice | Log home visit | Clinical management | District-wide escalation |
| 1-Tap SOS 108 Emergency Dispatch | Trigger SOS | Trigger for Citizen | Casualty Bay Access | Central ERSS Dispatch |
| Medicine Inventory Indents | View stock status | View local kit | Raise Indent | Approve District Supply |
| HMIS / ABDM Interop Gateways | View Consent status | No access | Link Care Context | Full Sync & Export |

---

## 5. Real-Time Communication Protocols (Teleconsultation & SOS)

### 5.1 WebRTC Teleconsultation Architecture (`webrtcHandler.ts`)

#### Dual-Signaling Protocol:
1. **Local Cross-Tab / Development Mode**: `BroadcastChannel` with channel name `hw_tele_${roomId}` allowing seamless peer-to-peer testing without requiring a dedicated external server.
2. **Production Native Mobile Mode**: WebSocket client connecting to `wss://healthway.maharashtra.gov.in/ws/teleconsult?roomId=${roomId}&role=${role}`.

#### PeerMessage Protocol Specification:
```typescript
export interface PeerMessage {
  type: 
    | 'join'                // Broadcast presence when entering teleconsult room
    | 'offer'               // WebRTC SDP Offer from initiating doctor
    | 'answer'              // WebRTC SDP Answer from ASHA/patient
    | 'candidate'           // ICE Candidate exchange (Google STUN)
    | 'chat'                // In-call text messaging
    | 'vitals'              // Live clinical telemetry stream (BP, SpO2, Pulse)
    | 'audio-only-switch'   // Peer requested degradation due to poor connectivity
    | 'end-consultation';   // Disconnect and trigger clinical note generation
  senderId: string;
  senderRole: 'doctor' | 'asha' | 'patient';
  payload: any;
  timestamp: string;
}
```

#### Rural Low-Bandwidth Optimization:
- **Audio Sample Rate**: 16 kHz low-complexity Opus codec (32 kbps cap).
- **Dynamic Bitrate Control**:
  - `low`: 100 kbps, downscaled resolution `scaleResolutionDownBy = 4`.
  - `medium`: 300 kbps, `scaleResolutionDownBy = 2`.
  - `high`: 800 kbps, 720p 30fps.
  - `auto`: Starts at 300 kbps, adapts based on `getStats()` telemetry.
- **Auto Audio-Only Fallback**: WebRTC handler polls `peerConnection.getStats()` every 3 seconds. If `totalBitrate < 60 kbps` or `packetsLost > 10`, it stops video tracks immediately and broadcasts `'audio-only-switch'`.

---

### 5.2 Emergency SOS & 108 Ambulance GPS Telemetry (`emergencyService.ts`)

#### 108 Dispatch Telemetry State Machine:
```
[User Taps SOS]
       │
       ▼
 [DISPATCHED] ────► 108 Ambulance Unit Allocated (`MH-12-HE-1080`)
       │            Hospital Trauma Bay Reserved (`BED_RESERVED`)
       ▼
  [EN_ROUTE]  ────► Live GPS ping every 3-5 seconds
       │            Calculated remaining ETA (Initial: 14 mins)
       ▼
  [ON_SCENE]  ────► Paramedic evaluates vitals at doorstep
       │            Code Red Triage Token activated
       ▼
 [TRANSPORTING] ──► Continuous vital transmission to Casualty Desk
       │
       ▼
[ARRIVED_HOSPITAL] ► Immediate handover to trauma emergency team
```

---

## 6. Offline-First Synchronization Engine & Native Mobile Storage Contract

In rural Indian regions (e.g., Shirur, Khed, Daund blocks), frontline workers frequently operate in zero-connectivity 2G shadow zones. HealthWay implements an offline-first architecture.

### 6.1 Eight-Store Native Storage Schema (SQLite / AsyncStorage)

```sql
-- Store 1: sync_queue (Mutations awaiting upload)
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,                  -- 'TRIAGE_CREATE', 'REFERRAL_SUBMIT', 'VISIT_LOG', 'STOCK_DISPENSE'
  url TEXT NOT NULL,                   -- Target REST endpoint URL
  method TEXT NOT NULL,                -- 'POST', 'PUT', 'PATCH', 'DELETE'
  data TEXT NOT NULL,                  -- JSON serialized compressed payload
  status TEXT DEFAULT 'PENDING',       -- 'PENDING', 'SYNCING', 'FAILED', 'COMPLETED'
  retries INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  lastAttempt TEXT,
  error TEXT
);
CREATE INDEX idx_sync_status ON sync_queue(status);
CREATE INDEX idx_sync_type ON sync_queue(type);

-- Store 2: patient_cache (Cached demographics & PHR)
CREATE TABLE patient_cache (
  id TEXT PRIMARY KEY,                 -- ABHA ID or Local Beneficiary ID
  patientData TEXT NOT NULL,           -- Full JSON PatientProfile / Longitudinal Data
  cachedAt TEXT NOT NULL,
  ttl INTEGER DEFAULT 604800000        -- 7 days expiry in ms
);

-- Store 3: triage_drafts (Unsubmitted clinical questionnaires)
CREATE TABLE triage_drafts (
  id TEXT PRIMARY KEY,                 -- Draft UUID
  triageData TEXT NOT NULL,            -- Form state, selected symptoms, vitals
  timestamp TEXT NOT NULL
);

-- Store 4: medicine_stock (Offline facility drug inventory)
CREATE TABLE medicine_stock (
  id TEXT PRIMARY KEY,                 -- facilityId
  facilityId TEXT NOT NULL,
  inventory TEXT NOT NULL,             -- JSON array of FacilityStockItem
  updatedAt TEXT NOT NULL
);

-- Store 5: facility_data (Operational metrics & doctor schedules)
CREATE TABLE facility_data (
  id TEXT PRIMARY KEY,                 -- facilityId
  facilityMetrics TEXT NOT NULL,       -- JSON Facility object
  updatedAt TEXT NOT NULL
);

-- Store 6: referral_drafts (Pending referral transfer forms)
CREATE TABLE referral_drafts (
  id TEXT PRIMARY KEY,                 -- Draft UUID
  referralData TEXT NOT NULL,          -- JSON ReferralItem
  timestamp TEXT NOT NULL
);

-- Store 7: settings (Session & device config)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Store 8: sync_log (Auditing and synchronization history)
CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,                -- 'SUCCESS', 'FAILURE', 'INFO'
  timestamp TEXT NOT NULL,
  details TEXT
);
```

### 6.2 Network Quality Classifier & Dynamic Sync Rules

| Quality Tier | Downlink / Latency | Behavior |
|---|---|---|
| **Excellent** | 4G/WiFi (>3 Mbps, <150ms) | Direct API submission. Background queue syncs immediately. Full media enabled. |
| **Good** | 3G/4G stable (1–3 Mbps, <450ms) | Direct API submission. Low-bandwidth payload compression applied. Standard media. |
| **Poor** | 2G (<1 Mbps, 450–1200ms) | Auto-queues non-critical mutations into `sync_queue`. Video teleconsultation downgrades to 100 kbps. |
| **Very Poor** | Slow-2G (>1200ms latency) | Instantly saves all mutations to `sync_queue`. Teleconsultation forces audio-only. |
| **Offline** | 0 bps (navigator.onLine = false) | 100% offline mode. Reads from SQLite/AsyncStorage cache. Writes to `sync_queue`. |

### 6.3 Exponential Backoff & Conflict Resolution Policy

1. **Backoff Schedule**:
   $$\text{Delay} = \min(2^{\text{retries}} \times 500\,\text{ms},\, 5000\,\text{ms})$$
2. **Conflict Resolution Matrix**:
   - **Triage Intake & Registration**: **Client-Wins**. Field worker's on-the-ground observation is the definitive source of truth.
   - **Medicine Stock Levels**: **Server-Wins with Delta Reapplication**. Stock balance is recalculated by subtracting the client's dispensed count from the current central warehouse balance.
   - **Queue Positions**: **Server-Wins**. Queue tokens are strictly sequenced by the central server; client's local draft receives the server's official token upon synchronization.
   - **Referral Transfers**: **Merged History**. Status transitions are appended to the referral's `stageHistory` array based on timestamps.

---

## 7. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | ABDM | ABHA OTP Generation | Issues Aadhaar/Mobile OTP for digital health account creation | `authMethod`, `identifier` | `txnId`, `expiresInSeconds: 600` | HTTP 400 on missing identifier | `backend/routes/abdm.js` |
| 2 | ABDM | ABHA OTP Verification | Validates 6-digit code and produces official ABHA demographic card | `txnId`, `otp` | `abhaProfile`, JWT Bearer token | HTTP 400 on invalid or expired OTP | `backend/routes/abdm.js`, `abhaService.ts` |
| 3 | ABDM | Care Context Discovery | Discovers local clinical encounters linked to patient ABHA | `abhaAddress`, `patientIdentifier` | List of care contexts with descriptions | HTTP 500 on gateway error | `backend/services/abdmGateway.js` |
| 4 | ABDM | Electronic Consent Manager | Initializes, grants, signs, and revokes FHIR data sharing consents | `patientAbhaId`, `purpose`, `hip`, `hiu`, `dataTypes` | `consentId`, cryptographic digital signature | HTTP 404 on invalid consent ID | `backend/services/consentService.js` |
| 5 | FHIR R4 | Document Bundle Builder | Assembles NRCES India-compliant bundles for 6 document types | `docType`, clinical JSON payload | FHIR R4 Document `Bundle` | HTTP 400 on unsupported docType | `backend/services/fhirBuilder.js` |
| 6 | Emergency | 1-Tap 108 SOS Dispatch | Allocates emergency vehicle and notifies receiving hospital trauma bay | Location coordinates, patient demographics | `EmergencySosSession`, `initialEtaMinutes` | Offline fallback queue | `backend/routes/emergency.js`, `emergencyService.ts` |
| 7 | Emergency | Real-time Ambulance Telemetry | Streams vehicle GPS coordinates, speed, and remaining ETA | `emergencyId` | Lat/Lng, speed (km/h), updated stage | Default simulated vehicle progression | `backend/routes/emergency.js` |
| 8 | High-Risk | Overdue Visit Escalation | Evaluates overdue days and escalates to ASHA, MO, or DHO | `patientId`, `daysOverdue`, `severity` | `escalationLevel: ASHA_ALERT \| MO_ALERT \| DHO_CRITICAL` | HTTP 400 on invalid patient ID | `backend/services/followUpService.js`, `riskEngine.ts` |
| 9 | Referrals | 7-Stage Transfer Pipeline | Tracks patient transfer from Sub-Centre to District Hospital | `token`, `newStage`, clinical notes | Updated `ReferralItem`, stage timestamps | HTTP 404 on missing token | `backend/routes/referrals.js`, `referralService.ts` |
| 10 | Referrals | Overdue SLA Monitor | Identifies referrals exceeding SLA (Emergency: 2h, Urgent: 24h, Routine: 72h) | Active referral registry | List of overdue referrals with recommended actions | Evaluates SLA dynamically | `backend/services/reminderService.js` |
| 11 | Diagnostics | Barcode Order Requisition | Generates tracking barcode and orders diagnostic panel | Patient info, test list, priority, collection method | `barcode: MH-LAB-XXXXXX`, `TestOrderItem` | HTTP 400 on empty tests | `backend/routes/diagnostics.js`, `diagnosticService.ts` |
| 12 | Diagnostics | Pathologist Result Verification | Enters verified lab parameters, critical flags, and triggers ABHA sync | `results`, `impression`, `verifiedBy` | `TestOrderItem` with `status: COMPLETED` | Rejects missing verifiedBy | `diagnosticService.ts` |
| 13 | Queue | Priority OPD Triage Engine | Calculates token position and AI predictive wait time | Patient info, urgency, priority, symptoms | `tokenNumber`, `queuePosition`, `estimatedWaitTime` | Falls back to default OPD wait | `src/services/queueEngine.ts` |
| 14 | Queue | Audio Chime & Ticket Export | Plays hospital calling chime (D5-A5-D6) and prints Marathi/English text ticket | `AppointmentModel`, language preference | Audio playback, text ticket blob | Gracefully catches audio block | `src/services/queueNotificationService.ts` |
| 15 | Teleconsult | Adaptive WebRTC Teleconsult | Video/audio call with adaptive codec control and dual signaling | Room ID, user role, media tracks | PeerConnection, live media streams | Auto-downgrades to audio-only | `src/services/webrtcHandler.ts` |
| 16 | Teleconsult | Screen Sharing Track Swapping | Swaps camera video track with display media without breaking connection | Screen capture stream | Updated video track on peer connection | Restores camera on cancel | `src/services/webrtcHandler.ts` |
| 17 | Medicines | Stock Availability Checker | Real-time stock audit across facilities with generic alternatives | `facilityId`, `medicineId`, `status` | Stock quantity, days of supply, status tier | Returns empty list if unknown | `backend/routes/medicines.js`, `medicineEngine.ts` |
| 18 | Medicines | Warehouse Auto-Indent | Dispatches emergency replenishment indent to Central Medical Store | `facilityId`, critical items array, urgency | `indentNumber: IND-2024-MH-XXXX` | Rejects empty items array | `backend/services/stockAlertService.js` |
| 19 | National Interop | HMIS Monthly Report Generator | Compiles MoHFW Forms 1-12 monthly health indicators | Reporting month | 8 standard national indicators with target/achieved | Queues on external gateway failure | `backend/services/nhmReporter.js` |
| 20 | National Interop | Nikshay & MCTS Trackers | Generates TB DOTS/DBT Poshan records and antenatal line-lists | Reporting month | MCTS & Nikshay structured metrics | Defaults to standard monthly counts | `backend/services/nhmReporter.js` |
| 21 | Offline DB | 8-Store Local Persistence | Offline caching across 8 dedicated stores | Store name, key, data, TTL | Cached records, storage usage estimate | Graceful error catch on quota | `src/services/offlineDB.ts` |
| 22 | Sync Engine | Low-Bandwidth Compression | Recursively strips empty values, nulls, and trailing whitespace | Raw JSON mutation payload | Compacted JSON payload | Returns raw if not an object | `src/services/syncService.ts` |
| 23 | Voice | Multilingual Speech Engine | STT intake and TTS speech synthesis in Marathi, Hindi, and Indian English | Text string, locale (`mr-IN`, `hi-IN`, `en-IN`) | SpeechSynthesis audio or transcript | Voice fallback to Indian English | `src/services/voiceService.ts` |
| 24 | Dashboard | Weighted Facility Health Score | Computes 0-100 score based on OPD, staff, medicine stock, referrals, TB | `FacilityMetrics`, staff attendance | `score: number (0-100)`, `grade: A|B|C|D|F` | Clamps score between 0 and 100 | `src/services/dashboardService.ts` |

---

## 8. Edge Cases & Observed Behaviors Table

| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | ABDM OTP | Entered OTP is `789123` or `432101` | Authentication succeeds; sandbox returns Sunita Ramchandra Jadhav's verified profile. |
| 2 | ABDM OTP | Entered OTP is incorrect (e.g. `999999`) | Returns HTTP 400: `"Incorrect OTP. Please enter the 6-digit code received."` |
| 3 | ABDM OTP | Expired Transaction ID | Returns HTTP 400: `"OTP has expired. Please request a new one."` |
| 4 | Consent Verification | Requested docType NOT in granted `dataTypes` | `consentService.isAuthorized()` returns `false`, preventing unauthorized document release. |
| 5 | Consent Expiry | Current date is past `expiresAt` | Consent status is automatically updated to `EXPIRED` and authorization is denied. |
| 6 | Emergency Geolocation | Browser/device GPS denied or times out | Automatically falls back to Pune Rural default coordinates (`18.6534, 74.1352`). |
| 7 | Emergency ETA | Elapsed time > 10 minutes | Session status transitions through stages from `DISPATCHED` to `ARRIVED_HOSPITAL`. |
| 8 | WebRTC Bandwidth | Telemetry bitrate drops below 60 kbps or packetsLost > 10 | Handler automatically stops video tracks and emits `'audio-only-switch'` to peer. |
| 9 | Offline Submission | Device offline (`navigator.onLine === false`) | `syncService.submitData()` writes payload to `syncQueue` in IndexedDB and resolves `{ queued: true }`. |
| 10 | Offline Batch Sync | Network restores with 5 items in `syncQueue` | `startSync()` iterates queue, fires requests sequentially with exponential backoff on retries. |
| 11 | Referral SLA | Emergency referral elapsed hours > 2 | `evaluateReferralSla()` flags `isOverdue: true` and sets action to `ALERT_DHO_AND_108`. |
| 12 | Diagnostic Result | Any test parameter has `flag === 'CRITICAL'` | `hasCriticalValue` is set to `true`, triggering red banner alert and priority MO review. |
| 13 | High-Risk Urgency | Next visit is 2 days in the past | `evaluateUrgencyTier()` classifies patient as `OVERDUE` with `daysOverdue: 2`. |
| 14 | High-Risk Escalation | Days overdue >= 7 or severity is `CRITICAL` | `evaluateEscalationLevel()` immediately assigns `DHO_CRITICAL` tier. |
| 15 | Facility Scoring | Consultations exceed target (e.g. 85/50) | Consultations sub-score is clamped at 100% so over-achievement does not distort other weights. |

---

## Conclusion & Recommendations for Mobile Implementation
1. **Zero Web Disruption**: All backend endpoints and web service contracts remain immutable. The React Native / Expo application in `mobile/` will consume these identical REST routes, WebSocket/WebRTC signaling conventions, and data schemas.
2. **Native Secure Storage**: Use `expo-secure-store` for JWT and ABHA authentication tokens, and `@react-native-async-storage/async-storage` or `expo-sqlite` for the 8 offline object stores.
3. **Hardware Sensors**: Leverage Expo Location (`expo-location`), Expo Speech (`expo-speech`), and native WebRTC (`react-native-webrtc`) to fulfill the teleconsultation and SOS requirements.
