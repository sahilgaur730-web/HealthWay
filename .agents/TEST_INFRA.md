# Test Infrastructure & Methodology Specification
## HealthWay Cross-Platform Native Mobile Application

**Author**: `e2e_test_writer_1` (Dual-Track E2E Test Suite Author)  
**Target Workspace**: `mobile/`  
**Test Harness Location**: `mobile/__tests__/`  
**Execution Command**: `npm test` (or `npx jest`)  
**Specification Date**: 2026-09-07  

---

### 1. Executive Summary & Strategy
The HealthWay mobile application provides critical clinical, community outreach, telemedicine, emergency response, and administrative functionality across rural and semi-urban health facilities. To ensure zero-defect reliability in life-critical and low-connectivity environments, the testing suite adopts an **independent, opaque-box, requirement-driven architecture**.

All tests are verified against authoritative requirements from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and clinical service logic from the Maharashtra HealthWay specifications. Test cases do not rely on fragile UI internals or private implementation state; instead, they rigorously assert against interface contracts, domain invariants, state machines, offline persistence guarantees, and real-world multi-step end-to-end patient/clinician workflows.

---

### 2. Feature Inventory & Coverage Mapping (37 Features)

The test suite systematically maps 100% of the 37 identified functional features across 4 testing tiers:

| # | Feature Identifier | Domain / Module | Core Functional Scope |
|---|--------------------|-----------------|-----------------------|
| 1 | `F01_NATIVE_SETUP` | Core Foundation | Expo SDK 57 configuration, bundle ID `com.healthway.mobile`, scheme, permissions |
| 2 | `F02_DESIGN_THEME` | Design System | Maharashtra Govt palette (`#1A4B8C`, `#F57C00`, `#1C2B3A`), typography, zero Unicode emojis |
| 3 | `F03_TRILINGUAL_I18N` | Localization | Trilingual dictionary (`en`, `mr`, `hi`), dynamic switching, speech guidance hooks |
| 4 | `F04_OFFLINE_STORAGE` | Persistence | 8-store storage engine (`sync_queue`, `patient_cache`, `triage_drafts`, etc.) |
| 5 | `F05_SYNC_ENGINE` | Offline Engine | Network observer (`EXCELLENT` to `OFFLINE`), exponential backoff, sync outbox replay |
| 6 | `F06_SECURE_AUTH` | Security & Session | Role-based sessions (Patient, ASHA, Doctor, Admin), token storage, auth state |
| 7 | `F07_SHARED_UI` | UI Foundation | Reusable components: Header, BottomNav, Card, Button, Badge, Modal, FormInput |
| 8 | `F08_ROLE_NAV` | Navigation Hub | Dynamic navigation routing, role-based screen stacks, unauthorized access prevention |
| 9 | `F09_ABHA_LOGIN` | Authentication Hub | 14-digit ABHA validation, OTP verification, biometric auth simulation |
| 10 | `F10_DIAG_DIRECTORY` | Diagnostics Hub | 48-test searchable directory, 5 clinical specialties, sample requirements |
| 11 | `F11_DIAG_TRACKER` | Diagnostics Hub | 4-stage tracking (`ORDERED` -> `COLLECTED` -> `ANALYZING` -> `RESULT_READY`), barcodes |
| 12 | `F12_DIAG_REPORTS` | Diagnostics Hub | Report viewer, normal/critical value range flags, PDF preview and sharing |
| 13 | `F13_REF_PIPELINE` | Referrals Hub | 7-stage inter-facility transfer pipeline (`CREATED` to `COMPLETED`), transit timeline |
| 14 | `F14_REF_SLA` | Referrals Hub | Urgency tiers (`IMMEDIATE` to `ROUTINE`), overdue SLA flags, counter-referral feedback |
| 15 | `F15_QUEUE_TOKEN` | Queue Hub | Priority token engine (Emergency > Antenatal > Senior > General), dynamic wait times |
| 16 | `F16_QUEUE_TV` | Queue Hub | Waiting room TV mode, high-contrast token display, audio chime triggers |
| 17 | `F17_MED_CATALOG` | Medicine Hub | 18+ Essential Drug List (EDL) search, multi-facility real-time stock levels |
| 18 | `F18_MED_GENERIC` | Medicine Hub | Active salt equivalence matcher, low-stock alerts, auto-indent reordering |
| 19 | `F19_EMERG_SOS` | Emergency SOS | 1-Tap SOS dispatch, siren feedback, GPS coordinate beacon, casualty alert |
| 20 | `F20_EMERG_TRACKING` | Emergency SOS | 14-minute countdown, 5-stage status telemetry, 24/7 national/state helplines |
| 21 | `F21_PATIENT_DASH` | Patient Portal | Main dashboard, ABHA card display, vitals overview, upcoming consults |
| 22 | `F22_PATIENT_VITALS` | Patient Portal | BP, Sugar, SpO2, Heart Rate, BMI logging with clinical warning thresholds |
| 23 | `F23_PATIENT_APPT` | Patient Portal | Center/PHC selector, doctor specialization, date/slot picker, token generation |
| 24 | `F24_PATIENT_PHR` | Patient Portal | Digital health locker (Lab, Rx, Discharge, Immunization), offline caching |
| 25 | `F25_PATIENT_TRIAGE` | Patient Portal | 4-symptom step-by-step AI triage, vitals integration, risk classification |
| 26 | `F26_ASHA_DASH` | ASHA Portal | Household roster, high-risk pregnant women list, immunization schedule |
| 27 | `F27_ASHA_REGISTER` | ASHA Portal | Fast offline beneficiary registration, camera photo capture, ABHA linkage |
| 28 | `F28_ASHA_HIGHRISK` | ASHA Portal | Trimester tracking, danger sign checklists, ANC visit schedules |
| 29 | `F29_ASHA_VOICE` | ASHA Portal | Multilingual voice intake mode, speech-to-text logging for low-literacy users |
| 30 | `F30_ASHA_TRIAGE_REF`| ASHA Portal | Quick community triage assessment, generate priority referral slip with QR code |
| 31 | `F31_DOC_DASH_QUEUE` | Doctor Portal | Live OPD queue, waiting room statuses, priority triage badges, chart inspection |
| 32 | `F32_DOC_TELECONSULT`| Doctor Portal | Video consultation room, audio/mic toggles, call timer, low-bandwidth fallback |
| 33 | `F33_DOC_RX_NOTES` | Doctor Portal | Digital prescription generator, dosage instructions, lab orders, ABDM referral |
| 34 | `F34_ADMIN_DISTRICT` | District Admin | District health index, performance tracking across 7 facilities (`FAC001`-`FAC007`) |
| 35 | `F35_ADMIN_OUTBREAK` | District Admin | Dengue/Malaria epidemic alerts, severity tiers, facility resource heatmap |
| 36 | `F36_ADMIN_INVENTORY`| District Admin | EDL drug inventory levels, warehouse requisitions, consumption rate tracker |
| 37 | `F37_ADMIN_ABDM` | District Admin | Status monitor for 7 national health systems (ABDM, NHM, HMIS, MCTS, etc.) |

---

### 3. Test Methodology & Derivation

The test suite employs four formal testing methodologies to achieve rigorous opaque-box coverage:

#### A. Category-Partition Method
Input parameters across all modules are systematically decomposed into disjoint equivalence classes. For example:
- **ABHA Identification**: Valid 14-digit format (`14-XXXX-XXXX-XXXX`), 14 digits unhyphenated, invalid lengths (<14, >14), non-numeric inputs, empty string.
- **Vitals Clinical Boundaries**: Normal (`BP 120/80`, `SpO2 98%`), Moderate Warning (`BP 140/95`, `SpO2 92%`), Critical Emergency (`BP 185/120`, `SpO2 86%`, `Random Glucose 380 mg/dL`).
- **Queue Priority Weighting**: Emergency trauma (Priority Weight 100), High-risk Antenatal (Priority Weight 80), Senior Citizen (Priority Weight 60), General OPD (Priority Weight 40).
- **Referral Urgency Tiers**: `IMMEDIATE` (1 hr SLA), `URGENT` (6 hr SLA), `PRIORITY` (24 hr SLA), `ROUTINE` (72 hr SLA).

#### B. Boundary Value Analysis (BVA)
Assessing edge conditions at exact operational and domain thresholds:
- Minimum buffer thresholds in drug inventory (`stockLevel == minBuffer`, `stockLevel < minBuffer`, `stockLevel == 0`).
- SLA expiration boundaries (`timeRemaining == +1 sec`, `timeRemaining == 0`, `timeRemaining == -1 sec` triggering overdue flags).
- Network transition states (`EXCELLENT` -> `MODERATE` -> `POOR` -> `OFFLINE` -> `EXCELLENT`).
- Offline outbox queue capacity, retry limits (`retries >= 3` leading to backoff escalation).

#### C. Pairwise & Combinatorial Testing
Inter-module dependency validation ensuring state transitions preserve transactional integrity:
- **Triage -> Referral Pipeline**: Severe triage outcome automatically populates destination PHC/CHC referral slip with urgent SLA.
- **Doctor Rx -> Medicine Inventory**: Prescribing Paracetamol & Amoxicillin verifies local facility EDL stock, triggers low-stock warning, and suggests generic salt alternatives if out of stock.
- **ASHA Registration -> Offline Storage -> Sync Engine -> Doctor OPD**: Beneficiary registered offline in field is stored in `patient_cache`, queued in `sync_queue`, replayed upon network restoration, and immediately visible in the Doctor's OPD waiting queue.

#### D. Real-World Workload Testing (E2E Journeys)
High-fidelity, multi-step stateful workflows reflecting real clinical practice in rural Maharashtra:
1. **Rural Walk-in Journey**: Patient arrives at Sub-Centre -> Checked in by ASHA -> Priority token allocated -> Vitals recorded -> Teleconsultation with Doctor -> Prescription generated -> Dispensed from EDL stock.
2. **Emergency 108 Dispatch**: Patient triggers 1-Tap SOS -> Siren & GPS Beacon active -> 108 Ambulance assigned (14-min telemetry countdown) -> Casualty ward alerted -> Arrival transition.
3. **Maternal High-Risk Escalation**: ASHA field visit logs 3rd trimester pregnancy with danger signs (BP 160/110, severe headache) -> High-risk flagged -> Immediate referral generated to District Hospital -> Inter-facility transit tracked.
4. **Telemedicine Consult with Lab & Rx**: Patient books slot -> Waiting room queue management -> Doctor starts teleconsultation -> Diagnostic lab order (`CBC` + `LFT`) placed -> ABDM digital prescription issued.
5. **Epidemic Outbreak Response**: District Admin detects Dengue surge in Taluka B -> Severity escalated to CRITICAL -> Emergency drug indent created -> Bed capacity reallocated -> Field workers alerted.

---

### 4. Test Suite Architecture & Tiers

The test suite is partitioned into four structured tiers within `mobile/__tests__/`:

```
mobile/__tests__/
├── harness/
│   ├── mockStorage.ts            # High-fidelity in-memory 8-store storage engine
│   ├── mockAuth.ts               # Secure token & session state simulation
│   ├── mockSync.ts               # Network quality & offline outbox simulator
│   └── domainFixtures.ts         # Authoritative test datasets (EDL, Lab, Facilities, Vitals)
├── tier1_features/
│   ├── core_foundations.test.ts  # F01-F07 (Setup, Theme, i18n, Storage, Sync, Auth, UI)
│   ├── shared_hubs.test.ts       # F08-F20 (Nav, ABHA, Diag, Referral, Queue, Meds, SOS)
│   ├── patient_asha.test.ts      # F21-F30 (Patient & ASHA portals, Vitals, Triage, STT)
│   └── doctor_admin.test.ts      # F31-F37 (Doctor OPD, Video, Rx; Admin Overview, Outbreaks, ABDM)
├── tier2_boundaries/
│   ├── input_boundaries.test.ts  # Input validation, null/empty states, corrupt formats
│   ├── clinical_limits.test.ts   # Critical vital thresholds, emergency triage cutoffs
│   ├── stock_and_sla.test.ts     # Out-of-stock zero levels, SLA expirations, overdue flags
│   └── network_resilience.test.ts# Disconnections, timeout retries, outbox replay conflicts
├── tier3_combinations/
│   ├── triage_to_referral.test.ts# Seamless data flow from risk assessment to referral slip
│   ├── rx_to_inventory.test.ts   # Prescriptions validating against real-time EDL stock & alternatives
│   └── asha_to_opd_sync.test.ts  # Offline field registration replaying into doctor's live queue
└── tier4_workloads/
    ├── rural_walkin.test.ts      # End-to-end rural clinic patient lifecycle
    ├── emergency_108.test.ts     # End-to-end SOS dispatch, GPS telemetry, hospital handover
    ├── maternal_escalation.test.ts # High-risk ANC identification to tertiary care admission
    ├── teleconsult_journey.test.ts# Remote booking to video consult to ABDM lab/Rx generation
    └── outbreak_response.test.ts # District epidemic detection to facility supply mobilization
```

### Summary of Test Metrics:
- **Tier 1 (Feature Coverage)**: 37 features x >=5 tests = **185+ tests**
- **Tier 2 (Boundary & Corner Cases)**: 37 features x >=5 boundary tests = **185+ tests**
- **Tier 3 (Cross-Feature Combinations)**: 5 comprehensive pairwise workflows = **15+ tests**
- **Tier 4 (Real-World Workloads)**: 5 end-to-end multi-step user journeys = **10+ tests**
- **Total Expected Assertions / Tests**: **395+ verified tests**

---

### 5. Execution & Verification Command
To run the complete test suite:
```bash
cd mobile
npm test
```
Or to run with full verbosity and coverage summary:
```bash
cd mobile
npx jest --verbose --runInBand
```
