# HealthWay Web Portal: Comprehensive Frontend Specification Report
**Author:** survey_miner_1 (Authoritative Frontend Spec Miner)  
**Date:** 2026-09-07  
**Project:** HealthWay (Government of Maharashtra - Integrated Rural Health Platform)  
**Target Parity Workspace:** `c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\` (React Native / Expo)

---

## Table of Contents
1. [Executive Summary & Global Architecture](#1-executive-summary--global-architecture)
2. [Global Systems & Infrastructure](#2-global-systems--infrastructure)
   - 2.1 [Authentication & Role Switching](#21-authentication--role-switching)
   - 2.2 [Multilingual i18n System & Speech Engine](#22-multilingual-i18n-system--speech-engine)
   - 2.3 [Theme, Colors, Typography & Design Tokens](#23-theme-colors-typography--design-tokens)
   - 2.4 [Navigation Structure & Layout Architecture](#24-navigation-structure--layout-architecture)
   - 2.5 [State Stores, Offline Persistence & Synchronization](#25-state-stores-offline-persistence--synchronization)
3. [Deep-Dive Module-by-Module Survey](#3-deep-dive-module-by-module-survey)
   - 3.1 [Module 1: Patient Portal](#31-module-1-patient-portal)
   - 3.2 [Module 2: ASHA Community Worker Module](#32-module-2-asha-community-worker-module)
   - 3.3 [Module 3: Doctor Teleconsultation Module](#33-module-3-doctor-teleconsultation-module)
   - 3.4 [Module 4: District Admin Module](#34-module-4-district-admin-module)
   - 3.5 [Module 5: Diagnostics Hub](#35-module-5-diagnostics-hub)
   - 3.6 [Module 6: Referrals Hub](#36-module-6-referrals-hub)
   - 3.7 [Module 7: Queue Management System](#37-module-7-queue-management-system)
   - 3.8 [Module 8: Emergency SOS & Ambulance Dispatch](#38-module-8-emergency-sos--ambulance-dispatch)
   - 3.9 [Module 9: Medicine Availability & Inventory](#39-module-9-medicine-availability--inventory)
4. [Authoritative Features Discovered Table](#4-authoritative-features-discovered-table)
5. [Edge Cases & Error Handling Inventory](#5-edge-cases--error-handling-inventory)
6. [Component Hierarchy & Shared UI Patterns](#6-component-hierarchy--shared-ui-patterns)
7. [Exact Mobile Feature Parity Specification (React Native / Expo)](#7-exact-mobile-feature-parity-specification-react-native--expo)

---

## 1. Executive Summary & Global Architecture

HealthWay is a digital healthcare operating platform engineered specifically for the rural public healthcare system of Maharashtra, India (Department of Public Health & National Health Mission). It connects the 4 primary stakeholders of rural healthcare delivery:
1. **Citizens / Patients:** Self-service health portal, digital ABHA cards, appointment bookings, PHR health locker, real-time medicine availability search, AI symptom triage, and 1-tap 108 emergency ambulance dispatch.
2. **ASHA Workers (Accredited Social Health Activists):** Field worker portal with offline-first support, doorstep beneficiary registration, daily visit task checklists, maternal ANC & newborn tracking, speech-to-text logging, and teleconsultation assistance.
3. **Medical Officers / Doctors:** Digital OPD consultation queue, low-bandwidth WebRTC video/audio calls, digital prescription writer, clinical notes, diagnostic test ordering, and specialist referral generation.
4. **District Health Administrators (DHO / NHM):** Real-time command dashboard monitoring 36+ facilities across Shirur, Khed, and Haveli blocks, epidemic outbreak detection, high-risk patient surveillance, drug supply chain logistics, and ABDM/FHIR/HMIS interoperability gateways.

The web application is built on **React 18.3**, **TypeScript 5.5**, **Vite 5.4**, **React Router v6**, **Tailwind CSS 3.4**, **Lucide React**, **Recharts 2.12**, and **IndexedDB**. It employs strict clinical styling, zero unicode emojis, multilingual text in Marathi, Hindi, and English, and an offline-first state synchronization engine.

---

## 2. Global Systems & Infrastructure

### 2.1 Authentication & Role Switching

#### Roles Supported:
- **Patient (Citizen):** Default public persona (`CURRENT_PATIENT`: Sunita Ramchandra Jadhav, ABHA: `MH-PN-24-00000001`, Age: 28, Vadgaon).
- **ASHA Worker:** Field worker persona (`ASHA_USER`: Suman Tai Patil, ID: `ASHA-PN-2024-0847`, Vadgaon Sub-Centre).
- **Doctor (Medical Officer):** Clinical provider persona (Dr. Meera Deshmukh / Dr. Rajesh Kulkarni, MMC Reg: `MMC-2016-08492`, PHC Shirur).
- **District Admin:** Governance persona (District Health Officer, Nodal ID: `DHO-PUNE-ZONE`, Pune Zilla Parishad).

#### Authentication Workflows (`/patient/login`):
1. **Method Selector:**
   - Option A: Mobile Number Login (OTP-based).
   - Option B: ABHA Number / ABHA Address Login (`@abdm`).
   - Quick Demo Bypass Button: Direct jump to demo patient Sunita's dashboard.
2. **Mobile OTP Flow:**
   - Input: 10-digit Indian phone number (`/^\d{10}$/`). Prefix locked to `+91`.
   - Action: Triggers simulated SMS OTP dispatch (`generateAbhaOtp`), returns transaction ID.
   - OTP Input: 6-digit split inputs with auto-focus and backspace navigation.
   - Validation: Accepts `123456` or `789123` for demo; rejects incomplete or incorrect OTPs.
3. **ABHA Verification Flow:**
   - Input: 14-digit ABHA ID (`XX-XXXX-XXXX-XXXX`) or PHR address (`name@abdm`). Min length 8 chars.
   - Submits to ABDM mock service (`abdmService.ts`), returns authenticated session profile with JWT-style token, KYC status, and care contexts.
4. **Role Switching:**
   - Evaluator top bar (`PortalSwitcher.tsx`) remains persistent across all screens.
   - Portal-specific shortcuts: Direct jump buttons for Facility Matrix, Referrals, Diagnostics, ABDM/FHIR, and Queue TV.
   - In `DashboardLayout.tsx`, header ribbon changes color and title based on path prefix (`/patient`, `/asha`, `/doctor`, `/admin`).

### 2.2 Multilingual i18n System & Speech Engine

#### Language Capabilities (`LanguageContext.tsx`, `translations/`):
- **Supported Languages:**
  - `en`: Indian English (`en-IN`)
  - `mr`: Marathi (`mr-IN`, Noto Sans Devanagari)
  - `hi`: Hindi (`hi-IN`, Noto Sans Devanagari)
- **CSS-Based Zero-Flicker Language Isolation:**
  - In `src/index.css`, body classes `body.lang-en`, `body.lang-mr`, `body.lang-hi` control `.lang-content`, `.mr-only`, `.hi-only`, `.en-only` to prevent text disappearing during dynamic hydration.
- **Deep Translation Engine:**
  - Key-based translation via `t('key')`.
  - Comprehensive fallback lookup dictionary with 330+ exact phrase mappings.
  - Ordered regex phrase replacement engine (`HINDI_PHRASE_RULES`) for dynamic text translation.

#### Web Speech API Voice Engine (`voiceService.ts`):
- **Text-to-Speech (TTS):**
  - Rate: 0.9 (slow, clear pronunciation for rural audiences). Pitch: 1.0.
  - Native voice selection prioritization: Marathi (`mr-IN`), Hindi (`hi-IN`), Indian English (`en-IN`).
  - Emergency audio prompt playback (`playEmergencySosPrompt`).
- **Speech-to-Text (STT):**
  - Native `webkitSpeechRecognition` / `SpeechRecognition` listener.
  - Automatic fallback simulation when microphone permissions are unavailable in browser.
  - Transcribes spoken symptoms into text fields in real time.

### 2.3 Theme, Colors, Typography & Design Tokens

Defined in `tailwind.config.js` and `index.css`:
- **Primary Color:** `#1A4B8C` (Maharashtra Govt Deep Blue), dark: `#0D3470`, light: `#E8F0FE`
- **Slate / Neutral Palette:**
  - Dark: `#1C2B3A` (Primary text color)
  - Gray: `#546E7A` (Secondary metadata text)
  - Border: `#CFD8DC` (Card & input borders)
  - Background: `#F5F7FA` (Page canvas background)
- **Saffron / State Accent:** DEFAULT: `#F57C00`, light: `#FFF3E0`, dark: `#E65100`
- **Clinical Functional Colors:**
  - Clinical Green (Success, Normal): `#2E7D32`, light: `#E8F5E9`
  - Clinical Red (Emergency, STAT, Critical): `#C62828` / `#DC2626`, light: `#FFEBEE` / `#FEF2F2`
  - Clinical Yellow/Amber (Warning, Urgent): `#F9A825` / `#EA580C`, light: `#FFF8E1` / `#FFF7ED`
  - Clinical Teal (Diagnostic): `#00695C`, light: `#E0F2F1`
  - Clinical Purple (ASHA / Maternity): `#6A1B9A` / `#7C3AED`, light: `#F3E5F5`
- **Typography:**
  - Sans: `Inter`, `Noto Sans Devanagari`, `system-ui`, `sans-serif`
  - Monospace (Tokens, Vitals, ABHA IDs): `JetBrains Mono`, `monospace`
- **Styling Rules:**
  - Strict absence of unicode emojis throughout all UI text (replaced with Lucide icons).
  - High contrast for outdoor sunlight readability in rural environments.

### 2.4 Navigation Structure & Layout Architecture

1. **Persistent Top Evaluator Switcher (`PortalSwitcher.tsx`):**
   - Left: Maharashtra Govt emblem (`MH`), Health Dept title.
   - Center: Offline/Online network simulator toggle with pulsing status dot.
   - Hub shortcuts: Facility Matrix, Referrals, Diagnostics, ABDM/FHIR, Queue TV.
   - Right: Notification Bell (overdue alerts count), LanguageSwitcher (EN/MR/HI), 1-Tap SOS 108 button.
2. **Global Low-Connectivity PWA Indicator Bar (`OfflineIndicator.tsx`):**
   - Automatically detects offline status or network quality degradation.
   - Displays pending sync queue count and manual "Sync Now" trigger.
3. **Master Dashboard Layout (`DashboardLayout.tsx`):**
   - Role-specific color ribbons:
     - Patient: `#1A4B8C` (Citizen Health Portal)
     - ASHA: `#2E7D32` (ASHA Field Worker Portal)
     - Doctor: `#1A4B8C` (Doctor Teleconsultation Portal)
     - Admin: `#1C2B3A` (District Health Admin Portal)
   - User Profile Sidebar (Desktop 64px width, expandable): User avatar, name, designation, health ID badge, navigation links, and 24x7 emergency helpline card.
   - Mobile Navigation Drawer (Hamburger button, slide-in modal backdrop).

### 2.5 State Stores, Offline Persistence & Synchronization

HealthWay implements a multi-tiered persistence architecture:
1. **IndexedDB Engine (`offlineDB.ts` - `HealthWayOfflineDB` v3):**
   - `syncQueue`: Stores pending mutation requests (type, url, method, data, status: PENDING | SYNCING | FAILED | COMPLETED, retries, timestamps).
   - `patientCache`: Cached longitudinal patient records indexed by ABHA ID.
   - `triageDrafts`: Offline drafts of symptom questionnaires.
   - `medicineStock`: Cached facility inventories.
   - `facilityData`: District facility metrics & attendance.
   - `referralDrafts`: Offline referral orders.
   - `settings`: Local app configurations.
   - `syncLog`: Comprehensive audit trail of synchronization events.
2. **Synchronization Engine (`syncService.ts`):**
   - Pub-Sub event emitter for network state (`ONLINE`, `OFFLINE`, `SYNC_STARTED`, `ITEM_SYNCED`, `SYNC_COMPLETE`).
   - Connection Quality Monitor: Uses `navigator.connection` (`effectiveType`, `downlink`) and latency ping to classify: `excellent`, `good`, `poor`, `very-poor`, `offline`.
   - Periodic queue flusher (checks every 60s when online).
3. **BroadcastChannel Real-Time Multi-Tab Synchronization:**
   - Channel `hw_tele_[roomId]`: Coordinates WebRTC signaling, chat messages, and vitals updates across browser tabs.
   - Queue engine channel: Broadcasts token advance events from operator console to waiting room TV screen (`QueueDisplay.tsx`).
4. **LocalStorage Storage:**
   - Active SOS session (`hw_active_sos`), language selection (`healthway_lang`), simulated offline mode flag.

---

## 3. Deep-Dive Module-by-Module Survey

### 3.1 Module 1: Patient Portal

#### Screens & Routes:
- `/patient/login` — Patient Authentication (Mobile OTP & ABHA ID)
- `/patient` or `/patient/dashboard` — Patient Central Dashboard
- `/patient/book` — Appointment Booking System (4-Step Wizard)
- `/patient/records` — Digital Health Records (PHR 5-Tab Viewer)
- `/patient/medicines` — Real-Time Medicine Availability Search
- `/patient/referral` — Live Referral Tracking Journey
- `/patient/triage` — AI Symptom Triage Questionnaire
- `/patient/emergency` — 1-Tap SOS Emergency Dispatch & Ambulance Tracking
- `/patient/consultation` — Universal Teleconsultation Room (Patient persona)

#### Screen 1: Patient Dashboard (`PatientDashboard.tsx`)
- **UI Controls & Elements:**
  - *ABHA Digital Health Card:* Gradient background, photo avatar, citizen name in Marathi and English, ABHA ID (`MH-PN-24-00000001`), Age (28 Yrs), Gender (Female), Blood Group (B+), Village/Block/District, active clinical conditions tags ("Antenatal 7th Month", "Mild Anemia Hb 10.2").
  - *Upcoming Appointment Card:* Saffron highlight banner, clinic name (PHC Shirur), doctor name (Dr. Meera Deshmukh), token number (`#07`), scheduled time ("Tomorrow at 10:30 AM"), "View Details" button.
  - *Quick Services Grid (6 Cards):*
    1. Teleconsultation (Live Doctor Call) -> `/patient/consultation`
    2. Book Appointment (PHC or District Hospital) -> `/patient/book`
    3. Live Queue TV (Current token & wait time) -> `/queue-display`
    4. View Records (Prescriptions & lab reports) -> `/patient/records`
    5. Medicine Stock (Nearby PHC inventory) -> `/patient/medicines`
    6. Symptom Triage (Severity assessment) -> `/patient/triage`
  - *Live Referral Status Journey:* 4-step progress line (Referred [Done] -> Reached Hospital [Done] -> Specialist Consult [Active] -> Treatment Complete [Pending]). Shows referring doctor, receiving hospital (Sassoon General Hospital, Pune), transport type (102 Janani Express), and assigned ASHA escort.
  - *Recent Consultations List:* Accordion cards with facility name, visit date, doctor, diagnosis, prescribed drugs, vitals snapshot (BP, Pulse, Sugar, Weight), and clinical notes.

#### Screen 2: Book Appointment (`BookAppointment.tsx`)
- **4-Step Wizard Workflow:**
  - *Step 1: Facility & Department Selection:*
    - Health Center list filtered by type (`all`, `sub-centre`, `phc`, `rural-hospital`, `district-hospital`) and search query.
    - Department selector: General Medicine, Maternal & Antenatal (ANC), Pediatrics & Immunization, NCD Clinic.
  - *Step 2: Date, Doctor & Slot Selection:*
    - Interactive monthly calendar with previous/next month navigation, disabled past dates.
    - Doctor selection card with doctor photo, qualifications, specialization, and average consult time.
    - Morning and Afternoon slot cards showing available vs max patient capacity (e.g. "12 seats left").
  - *Step 3: Patient Demographics & Symptoms:*
    - Inputs: Full Name (required), Mobile (10 digits validation), Age (>0), Gender (Male/Female/Other), ABHA ID (optional), Address.
    - Appointment Type: Regular, Emergency, Follow-up, Antenatal, Immunization.
    - Symptom Checklist: Fever, Cough, Body Pain, Vomiting, Headache, Antenatal Checkup, Child Vaccination, BP Check.
    - Chief complaint free-text area, ASHA-assisted toggle.
  - *Step 4: Summary & Token Receipt:*
    - Token generation receipt card: Token number, QR code, facility address, doctor name, estimated wait time, PDF download / Print button, simulated SMS confirmation alert.
    - Track Appointment modal: Lookup past appointments by phone number or appointment ID.

#### Screen 3: My Health Records / PHR (`MyRecords.tsx`)
- **5 Master Tabs:**
  1. *Overview & Summary:* Longitudinal vitals trend graphs (BP, Blood Glucose, SpO2, Weight, Hb), known allergies list, active chronic conditions, immediate medical alerts.
  2. *Visit History Timeline:* Chronological cards spanning Sub-Centres to District Hospitals. Filterable by facility tier. Displays doctor name, diagnosis (Marathi & English), prescribed medications, vitals recorded, and discharge notes.
  3. *Prescriptions:* Active vs Completed medication list. Shows drug brand & generic salt, dosage form, frequency timing cues (morning, afternoon, night), duration, prescribing doctor, and refills remaining.
  4. *Diagnostic Labs:* Complete list of lab reports (CBC, HbA1c, Blood Sugar, Urine Routine, USG Anomaly Scan). Displays test date, accredited laboratory name, NABL badge, and parameter breakdown table (Parameter, Value, Unit, Reference Range, Flag: Normal/Borderline/Critical). Full PDF report preview and download.
  5. *Clinical Documents:* Uploaded document repository (scan images, PDFs, ultrasound films, discharge summaries).
- **Embedded Modals:**
  - *ABHA Account Switcher Modal:* Generate OTP, verify OTP, connect another family member's ABHA ID.
  - *ABHA QR Card Modal:* Displays official ABHA QR code with download option.
  - *ABDM Consent & Share Modal:* View active consent requests from healthcare providers, grant consent, set expiration date, revoke consent.

---

### 3.2 Module 2: ASHA Community Worker Module

#### Screens & Routes:
- `/asha` or `/asha/dashboard` — Field Worker Central Command
- `/asha/patients` — Village Beneficiary Registry (127+ patients)
- `/asha/register` — Fast Rural Patient Registration with ABHA generation
- `/asha/triage` — Field Triage & Teleconsultation Escalation
- `/asha/consultation` — Assisted Teleconsultation with Doctor
- `/asha/mode` or `/voice` — ASHA Dedicated Touch & Multilingual Voice Mode

#### Screen 1: ASHA Dashboard (`AshaDashboard.tsx`)
- **Controls & Key Metrics:**
  - *Network Connectivity Status Bar:* Displays live connection state, synced status, and "Simulate Offline" toggle button for testing offline queuing.
  - *ASHA Profile Header:* Suman Tai Patil, ID `ASHA-PN-2024-0847`, Vadgaon Sub-Centre, Shirur Block, Pune.
  - *KPI Counters:* 127 Patients Tracked, 14 High-Risk Cohort Cases, Today's Field Visits completion count (e.g. "3 / 5 Done").
  - *Action Shortcuts:* Doctor Teleconsult, Register Patient, Village Registry, Field Triage, 108 Emergency Ambulance.
  - *Today's Field Tasks Checklist:*
    - Interactive task items (ANC checkups, NCD blood glucose follow-ups, TB DOTS directly observed therapy, infant pentavalent immunization).
    - Filter by: All, Pending, High Priority.
    - Checkbox toggle marks task complete and logs audit record.

#### Screen 2: Beneficiary Registration (`AshaRegister.tsx`)
- **Inputs & Validation:**
  - *Section 1: Demographics:* Full Name in Marathi (`nameMr`), Full Name in English (`nameEn`), Aadhaar last 4 digits (`/^\d{4}$/`), Mobile number (`/^\d{10}$/`), Age, Gender, Blood Group (8 options), Village/Wasti name.
  - *Section 2: Baseline Health Vitals:* Blood Pressure (e.g. "120/80"), Blood Glucose (mg/dL), Hemoglobin (g/dL), Weight (kg).
  - *Section 3: High-Risk Category Tagging:* Pregnant ANC, Hypertension, Type 2 Diabetes, TB DOTS suspect.
  - *Outcome:* Automatically generates 14-digit ABHA ID (`MH-PN-24-0000XXXX`), creates printable digital health ID card with QR code, and caches beneficiary locally in IndexedDB.

#### Screen 3: ASHA Dedicated Voice & High-Touch Mode (`ASHAWorkerMode.tsx`)
- **Key Features for Low-Literacy Frontline Field Workers:**
  - Simplified, high-contrast, large-button layout designed for mobile screen width (`max-w-md`).
  - *3 High-Impact Cards:* My Patients (12), Visits Today (2), Overdue Visits (3 - Highlighted in Rose Red).
  - *Audio Guidance via Web Speech API:* Tap the speaker button to hear the list of overdue high-risk patients spoken aloud in clear Marathi or Hindi.
  - *Voice Note Recording Tab:* Frontline speech-to-text logging allows the ASHA worker to dictate clinical visit notes ("रुग्णाला कालपासून ताप आहे आणि खोकला सुरू आहे") without manual typing.
  - *Quick Action Slips:* Generate priority referral slip, call patient directly, or log vital signs with 1 tap.

---

### 3.3 Module 3: Doctor Teleconsultation Module

#### Screens & Routes:
- `/doctor` or `/doctor/dashboard` — Doctor OPD Consultation Queue
- `/doctor/call` — Video & Audio Teleconsultation Room
- `/doctor/patients` — PHC Patient EHR Longitudinal Archive
- `/doctor/referrals` — Specialist Referral Tracking & Counter-Referral Feedback
- `/consultation` — Universal Multi-Role Teleconsultation Gateway

#### Screen 1: Doctor Dashboard & Active Queue (`DoctorDashboard.tsx`)
- **Controls & Metrics:**
  - *Doctor Profile Header:* Dr. Meera Deshmukh (Medical Officer MBBS, DGO), MMC Registration `MMC-2016-08492`, PHC Shirur, OPD Room 02, Status: On Duty.
  - *Live Consultation Queue Counter:* Waiting Patients count, Urgent Cases count.
  - *Active Queue Filter:* All Calls vs Urgent Cases.
  - *Queue Cards:* Displays patient name, gender, age, ABHA ID, waiting duration, referring ASHA worker name, village name, chief complaint, and vital signs grid (BP, Blood Sugar, Pulse, Temp, SpO2).
  - *Action Buttons:* "Start Consult" (opens `/doctor/call`), "Generate Rx", "Send Referral".

#### Screen 2: Teleconsultation Room (`TeleconsultationRoom.tsx`)
- **WebRTC Video/Audio Infrastructure (`webrtcHandler.ts`):**
  - PeerConnection management with STUN servers (`stun.l.google.com`).
  - Adaptive resolution: 640x480 (15-30fps) downscaling, 16kHz audio sampling for rural cellular connections.
  - Bandwidth Telemetry: Real-time calculation of bitrate (kbps) and packet loss via `peerConnection.getStats()`.
  - Automatic Quality Fallback: Switches to Audio-Only mode when bitrate drops below 50 kbps or packet loss exceeds 10 packets.
  - Screen sharing support with media track replacement.
- **Doctor Clinical Workspace (Right-Side Drawer & Panels):**
  1. *Real-Time Multilingual Chat Tab:*
     - Live messaging between Doctor, ASHA Worker, and Patient.
     - Auto-translation toggle: Instantly translates Marathi/Hindi messages to English and vice versa using `aiConsultationService.ts`.
     - Voice typing input button for hands-free clinical messaging.
  2. *Live Transcription & Clinical Notes Tab:*
     - Automated speech transcription stream with speaker tags (`doctor`, `patient`, `asha`).
     - Editable clinical notes text area with pre-filled maternal/NCD templates.
  3. *AI Clinical Assistant Tab:*
     - Symptom Pre-Assessment: Evaluates entered symptoms against WHO emergency guidelines, returns urgency level (Immediate, Urgent, Routine), possible clinical concerns, and immediate triage actions.
     - Prescription Simplifier: Translates medical drug Latin abbreviations (e.g. `Tab. IFA 100mg OD night`) into patient-friendly daily timing cues (Morning, Afternoon, Night icons with food instructions in Marathi/Hindi).
  4. *Live Vitals Telemetry Tab:*
     - Real-time vitals sync from Sub-Centre field monitor (Temperature, BP Systolic/Diastolic, Heart Rate, SpO2, Weight).
     - Automated Vitals Clinical Risk Analysis: Flags critical values (e.g. SpO2 < 90%, BP > 160/100).
  5. *Consultation Summary & Digital Rx Modal:*
     - Generates structured summary: Chief complaint, diagnosis, digital prescriptions table, patient instructions, follow-up date, and referral recommendations.
     - Digital Signature & ABHA EHR sync button.

---

### 3.4 Module 4: District Admin Module

#### Screens & Routes:
- `/admin` or `/admin/dashboard` — District Health Administration Overview
- `/admin/facilities` or `/facilities` — 36 Facilities Operational Matrix
- `/admin/district-dashboard` or `/facility-dashboard` — District Facility Command Center
- `/admin/medicines` or `/medicine-stock` — District Medicine Supply Chain
- `/admin/high-risk` or `/high-risk` — District High-Risk Surveillance Tracker
- `/admin/interop` or `/abdm` / `/fhir` / `/hmis` — ABDM, FHIR & HMIS Interoperability Hub

#### Key Features & Controls:
1. **Executive Overview & HMIS Trends (`AdminOverview.tsx`):**
   - 4 District KPIs: 36 Active Facilities (100% digitally synced), 1,248 Today's Consultations (342 teleconsults), 41 Active Referrals, 94.6% Drug Availability Index.
   - 7-Day Recharts AreaChart comparing total OPD consultations against teleconsultations volume.
   - Facilities Operational Status Table: Patient footfall, doctor attendance ratio (e.g. `4/5`), medicine stock adequacy, and pending referrals.
2. **District Facility Command Center (`DistrictDashboard.tsx`):**
   - Interactive facility map & card grid representing 36 PHCs and Sub-Centres across Pune District.
   - Filter by block (Shirur, Khed, Haveli) and facility tier.
   - Facility Detail Modal: Bed capacity, doctor in-charge, active OPD queue, essential drug stock breakdown.
   - Outbreak Tracker & Alerts Panel: Epidemiological clusters (Dengue, Malaria, Gastroenteritis, Viral Fever) with affected village tags.
   - Top Facilities Leaderboard based on teleconsult adoption and high-risk compliance.
3. **High-Risk Clinical Surveillance (`HighRiskTracker.tsx`, `HighRiskDashboard.tsx`):**
   - Cohort categories: Pregnant ANC, Newborn LBW, Uncontrolled Diabetes, Grade 2 Hypertension, Active TB DOTS, Severe Malnutrition (SAM/MAM), Mental Health.
   - Automated Overdue SLA Engine (`evaluateUrgencyTier`): Calculates days overdue and assigns escalation tiers (`ASHA_ALERT`, `MO_ALERT`, `DHO_CRITICAL`).
   - Action buttons: Send ASHA reminder SMS, dispatch MO inquiry, escalate ticket to DHO.
4. **Interoperability & Data Export (`InteroperabilityPage.tsx`, `InteropDashboard.tsx`):**
   - ABDM Milestones Certification (M1, M2, M3 status check).
   - Dynamic Consent Lifecycle Manager.
   - FHIR R4 JSON Bundle Viewer (Patient, Condition, Encounter, Observation, DiagnosticReport).
   - National Portal Sync Connectors: e-Sanjeevani, HMIS, CoWIN, Nikshay (NTEP), RCH Portal.
   - Monthly HMIS Standard Report Exporter (Form 9 & Form 12 in CSV/XML).

---

### 3.5 Module 5: Diagnostics Hub

#### Screens & Routes:
- `/diagnostic` or `/diagnostics` — Dedicated Diagnostic Coordination Center
- `/patient/diagnostics` / `/doctor/diagnostics` — Contextual diagnostic pipeline aliases

#### Architecture & Capabilities (`diagnosticService.ts`, `DiagnosticDashboard.tsx`):
- **48+ Diagnostic Test Catalog across 5 Categories:**
  1. *Hematology (12 tests):* CBC with ESR, PoCT Digital Hemoglobin, Blood Grouping & Rh, Peripheral Blood Smear for Malaria, HbA1c, Sickle Cell Solubility & HPLC, Dengue NS1 & Duo, PT/INR, Reticulocyte Count, Bleeding & Clotting Time, Coombs Test, Serum Ferritin & Iron.
  2. *Biochemistry (12 tests):* FBS & PPBS, Random Blood Sugar PoCT, LFT (Bilirubin, SGOT, SGPT, ALP), KFT/RFT (Creatinine, Urea, BUN, Uric Acid), Lipid Profile, Thyroid Profile (TSH, FT3, FT4), Serum Electrolytes (Na+, K+, Cl-), Serum Calcium & Phosphorus, High-Sensitivity Cardiac Troponin I STAT, Serum Amylase & Lipase, Vitamin D3 & B12, hs-CRP.
  3. *Clinical Pathology / Urine (8 tests):* Urine Routine & Microscopy, Rapid Urine Pregnancy Card Test (UPT), Urine Albumin & Sugar Strip, Urine Albumin-to-Creatinine Ratio (UACR), 24-Hour Urinary Protein, Stool Routine & Occult Blood (FOBT), Urine Bile Salts & Pigments, Bence Jones Protein.
  4. *Microbiology & Serology (8 tests):* GeneXpert CBNAAT MTB/RIF for TB, Sputum Smear for AFB (ZN Stain), Widal Slide & Tube for Typhoid, HIV 1 & 2 Rapid Triline, Hepatitis B (HBsAg), Hepatitis C (HCV), Syphilis VDRL/RPR, Urine Bacterial Culture & Sensitivity.
  5. *Radiology & Imaging (8 tests):* Obstetric Level-II USG Anomaly Scan (20-22 wks), Feto-Maternal Color Doppler, Digital Chest X-Ray PA View, USG Whole Abdomen & Pelvis, 12-Lead Digital ECG with AI Tele-Analysis, 2D Echocardiography, Non-Contrast Head CT Brain (Emergency), Screening Mammography.
- **Accredited Lab Finder (`LabFinder.tsx`):**
  - Lists government and empanelled NABL diagnostic centers (PHC Shirur Lab, District Hospital Aundh, Sub-Centre Vadgaon PoCT).
  - Filter by distance, home collection availability, emergency hours (24x7).
- **Test Order Creation (`CreateTestOrder.tsx`):**
  - Multi-test selection from catalog, Priority selector (`STAT`, `URGENT`, `ROUTINE`), Collection Method (`VISIT_LAB`, `HOME_COLLECTION`, `AT_FACILITY`), clinical indication notes.
  - Generates barcode tracking token (e.g. `ORD-20240907-8841`).
- **Sample Tracking & Lab Result Viewer (`LabResultViewer.tsx`):**
  - Real-time status lifecycle: `ORDERED` -> `SAMPLE_COLLECTED` -> `IN_TRANSIT` -> `PROCESSING` -> `COMPLETED`.
  - Comprehensive parameter reporting with color-coded critical value alerts, verified pathologist signature, and PDF report download.

---

### 3.6 Module 6: Referrals Hub

#### Screens & Routes:
- `/referral` or `/referrals` — Inter-Facility Referral Pipeline
- `/patient/referral` or `/patient/referral-status` — Citizen Referral Tracking View
- `/doctor/referrals` — Doctor Specialist Transfer Desk

#### Architecture & Capabilities (`referralService.ts`, `ReferralTracker.tsx`):
- **7-Stage Finite State Machine:**
  1. `CREATED`: Doctor generates referral slip with provisional diagnosis.
  2. `NOTIFIED`: Automated SMS sent to Patient and local ASHA worker.
  3. `ACCEPTED`: Receiving tertiary hospital casualty desk confirms bed/slot reservation.
  4. `IN_TRANSIT`: 108/102 ambulance dispatched and en route with live driver details.
  5. `REACHED`: Patient physically checks in at destination hospital triage.
  6. `ADMITTED`: Patient undergoes specialist evaluation/inpatient admission.
  7. `COMPLETED`: Specialist enters diagnosis, treatment summary, and counter-referral instructions back to referring PHC.
  *(Additional states: `OVERDUE` when exceeding SLA, `CANCELLED`).*
- **SLA Urgency Configurations:**
  - `EMERGENCY`: SLA <= 2 hours (Red badge)
  - `URGENT`: SLA <= 24 hours (Amber badge)
  - `ROUTINE`: SLA <= 72 hours (Blue badge)
  - `ELECTIVE`: SLA <= 7 days (Green badge)
- **Hospital Directory with Live Bed Availability:**
  - District Hospital Aundh (350 beds, 8 ICU available)
  - Sassoon General Hospital & BJ Medical College (1,290 beds, 22 ICU available)
  - Sub-District Hospital Shirur (50 beds, 3 ICU available)
  - Rural Hospital Khed (30 beds, 2 ICU available)
  - District TB Center & Chest Hospital Aundh (100 beds, 4 ICU available)
- **Closed-Loop Doctor Counter-Referral Feedback (`DoctorFeedback.tsx`):**
  - Receiving doctor logs outcome: `ADMITTED`, `OPD_TREATED`, `TRANSFERRED`, `DISCHARGED`.
  - Final diagnosis, clinical summary, and counter-referral home care advice synchronized back to ASHA field worker.

---

### 3.7 Module 7: Queue Management System

#### Screens & Routes:
- `/queue` or `/queue-display` — Waiting Room TV Live Display
- `/staff/queue` or `/health-center/queue` — Staff Queue Management Console

#### Capabilities & Algorithms (`queueEngine.ts`):
- **Waiting Room TV Screen (`QueueDisplay.tsx`):**
  - Designed for large-format clinic waiting room wall displays with dark background (`#070D1E`).
  - Giant "NOW SERVING" token number (160px bold font) with ambient pulse rings.
  - Masked patient name for ABHA HIPAA-compliant privacy (e.g. "Sunita J***").
  - Target room destination prompt ("Please proceed to Room 02").
  - Upcoming queue table with token numbers, priority badges, and estimated wait times.
  - Audio chime: Web Audio API sound chime triggers automatically on every token transition.
  - Fullscreen toggle, display settings drawer, and live date/time clock.
- **Staff Queue Management Console (`HealthCenterDashboard.tsx`):**
  - Operations: "Call Next Patient", "Complete Consultation", "Skip / No-Show", "Pause Queue" (with reason prompt), "Resume Queue".
  - "Add Walk-In Patient" drawer: Instant token issuance for illiterate or unregistered walk-in citizens.
  - Scheduled appointment check-in: Issues live queue token upon physical patient arrival.
  - Real-time multi-tab sync using `BroadcastChannel`.
  - Hourly patient flow analytics chart.

---

### 3.8 Module 8: Emergency SOS & Ambulance Dispatch

#### Screens & Routes:
- `/emergency` or `/sos` or `/patient/emergency` — 1-Tap Emergency SOS Console
- `/emergency/tracker` or `/ambulance` — Live Ambulance Telemetry Tracking
- `/emergency/contacts` or `/helplines` — 24/7 Government Helplines Directory

#### Capabilities & Logic (`emergencyService.ts`, `EmergencyPage.tsx`):
- **1-Tap SOS Dispatch Session:**
  - Emergency clinical category selector: Maternal Labor Crisis, Cardiac Emergency, Severe Trauma / Accident, Respiratory Distress.
  - Huge 44px circular red pulsating button.
  - Real-time GPS Geolocation Capture via `navigator.geolocation` with rural fallback coordinates (`18.6534° N, 74.1352° E`, accuracy ±8.5m).
  - Transmits SOS beacon to MEMS (Maharashtra Emergency Medical Services) dispatch desk.
  - Code Red Emergency Triage Token generated (e.g. `CODE-RED-MH-8419`).
- **Live Ambulance Telemetry (`AmbulanceTracker.tsx`):**
  - Real-time ETA countdown timer (starts at 14 minutes and ticks down).
  - 5-stage progress indicator: `DISPATCHED` -> `EN_ROUTE` -> `ON_SCENE` -> `TRANSPORTING` -> `ARRIVED_HOSPITAL`.
  - Assigned Vehicle Details: MH-12-HE-1080 (Basic Life Support BLS), Driver Santosh Vitthal Shinde (`+91 98220 10801` with direct call button), EMT Paramedic Ramesh Patil.
  - Equipment Manifest: Oxygen Cylinder, Defibrillator AED, Emergency Delivery Kit.
- **Hospital Pre-Arrival Casualty Alert:**
  - Automatically notifies destination hospital casualty desk (District Hospital Aundh, Trauma Level 1, `020-25881080`).
  - Status transitions: `RECEIVED` -> `BED_RESERVED` -> `TEAM_READY`.
- **Emergency Directory (`EmergencyContacts.tsx`):**
  - 108 Ambulance (MEMS), 102 Janani Shishu Express (Maternal), 100 Police, 101 Fire, 181 Women Helpline, 1098 Child Helpline, 1077 Disaster Management.

---

### 3.9 Module 9: Medicine Availability & Inventory

#### Screens & Routes:
- `/medicines` or `/patient/medicines` — Patient Medicine Stock & Generic Alternatives Search
- `/admin/medicines` or `/medicine-stock` — District Supply Chain & Warehouse Indent Desk

#### Capabilities & Logic (`medicineEngine.ts`, `MedicineSearch.tsx`, `StockDashboard.tsx`):
- **18+ Essential Drug Master Catalog (Maharashtra NHM EDL):**
  - Essential drugs: Paracetamol (500mg tab & 120mg syrup), Iron & Folic Acid (large red tabs), Calcium Carbonate with Vit D3, ORS Sachet (WHO formula), Zinc Sulfate 20mg dispersible, Metformin 500mg, Amlodipine 5mg, Enalapril 5mg, Atorvastatin 10mg, Amoxicillin 250mg, Albendazole 400mg, Tetanus Toxoid (TT), Insulin Regular 40IU.
  - Categorized under national health programs: `NHM EDL`, `PMSMA`, `JSSK`, `NPCDCS`, `NTEP`, `UIP`.
- **Facility-Level Real-Time Inventory:**
  - Current stock count, standard pack units (tablets, bottles, sachets, vials), batch number, manufacturing date, expiry date.
  - Calculated Metrics: `daysOfSupplyRemaining` (based on daily consumption rate), `daysUntilExpiry`.
  - Stock Status Tiers: `ADEQUATE`, `LOW`, `CRITICAL`, `EXPIRING_SOON`, `OUT_OF_STOCK`.
- **Generic Substitution Recommendation Engine:**
  - When a prescribed medicine is out of stock at the nearest facility, the engine matches by generic salt formulation and strength, recommending the available generic alternative in stock at nearby centers.
- **Patient Restock SMS Notification (`subscribeStockNotification`):**
  - Patients can register their phone number for out-of-stock medications to receive a free SMS alert when the pharmacy is restocked.
- **District Supply Chain & Indent Management (`StockUpdateForm.tsx`, `LowStockAlerts.tsx`):**
  - Buffer threshold breach alerts.
  - Automated stock indent generator (`StockIndentRequest`): Auto-creates purchase indents to the State Central Warehouse when inventory drops below safety buffer.

---

## 4. Authoritative Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | Patient Mobile OTP Login | Authenticates patients using 10-digit mobile number and SMS OTP | Mobile number (`10 digits`), 6-digit OTP | Session token, redirect to dashboard | Shows inline red error banner on invalid phone or wrong OTP | `PatientLogin.tsx:26-51` |
| 2 | Auth | Patient ABHA ID Login | Authenticates patient via 14-digit ABHA ID or PHR address | ABHA ID / address string | ABHA profile object, care contexts | Rejects strings < 8 chars with error message | `PatientLogin.tsx:53-64` |
| 3 | Auth | Evaluator Portal Switcher | Top navigation bar allowing instant switching between Patient, ASHA, Doctor, and Admin personas | Button click | Updates route, changes layout ribbon color & persona | None (fail-safe client routing) | `PortalSwitcher.tsx:18-135` |
| 4 | Layout | Multilingual Dynamic Selector | Global language toggle between English, Marathi, and Hindi | Language code (`en`, `mr`, `hi`) | Updates `LanguageContext`, switches HTML classes & text | Falls back to English if translation key missing | `LanguageSwitcher.tsx:1-120` |
| 5 | Audio | Text-to-Speech Guidance | Reads instructions and health advice aloud in selected language | Text string, language code | Audio speech synthesis playback | Fails silently with console warning on unsupported browsers | `voiceService.ts:55-115` |
| 6 | Voice | Speech-to-Text Input | Dictation input for symptom search and clinical note logging | Microphone audio input | String transcript inserted into form | Employs demo text simulation fallback on mic permission denial | `voiceService.ts:132-196` |
| 7 | Patient | Longitudinal Health Dashboard | Master view displaying patient ABHA card, upcoming appointments, and vitals | User session ID | Rendered ABHA card, alert banners, quick action grid | Defaults to demo patient `CURRENT_PATIENT` if unauthenticated | `PatientDashboard.tsx:26-360` |
| 8 | Patient | 4-Step Appointment Booking | Facility, department, doctor, time slot, and patient symptom intake wizard | Center ID, Dept, Date, Slot, Patient Info, Symptoms | Appointment booking confirmation, Token QR code, SMS notification | Enforces step-by-step form validation with warning alerts | `BookAppointment.tsx:46-238` |
| 9 | Patient | PHR Longitudinal Records | 5-tab digital health locker (Overview, Timeline, Prescriptions, Labs, Docs) | Tab selection, search query, facility filter | Filtered clinical visit records, medication cards, lab report parameters | Shows empty state placeholder when no records match filter | `MyRecords.tsx:49-249` |
| 10 | Patient | Real-Time Medicine Availability | Search drug stock across PHCs/Sub-Centres with generic substitutions | Search term, facility filter, category filter, availability toggle | Ranked medicine stock cards with days-of-supply badge | Displays generic alternative card if selected drug is out of stock | `MedicineSearch.tsx:32-250` |
| 11 | Patient | Restock SMS Alert Subscription | Registers patient mobile to receive SMS when an out-of-stock drug is replenished | Patient phone number, Medicine ID, Facility ID | Subscription record, success toast banner | Validates 10-digit phone number format | `MedicineSearch.tsx:96-104` |
| 12 | Patient | Digital Clinical Triage (CDSS) | 5-step clinical severity prioritization based on WHO ETAT standards | Patient info, duration, symptoms list, vitals, chronic history | Color-coded Triage Level (Red/Orange/Yellow/Green), score, immediate actions | Age & duration risk modifiers dynamically adjust severity | `Triage.tsx:52-250` |
| 13 | Patient | 1-Tap SOS Emergency Dispatch | 1-tap button to dispatch 108 ambulance with GPS coordinates | Emergency category, button tap | Active SOS session, live ETA countdown, pre-arrival casualty alert | Uses rural fallback coordinates if device GPS fails | `EmergencyPage.tsx:57-75` |
| 14 | Patient | Live Ambulance Telemetry | Real-time tracking of assigned emergency vehicle and paramedic | Active SOS session | Vehicle plate, driver phone with direct call, equipment checklist, ETA | Countdown pauses at hospital arrival stage | `AmbulanceTracker.tsx:1-240` |
| 15 | Patient | Referral Journey Tracker | Real-time 4-step progress tracker for active inter-facility hospital transfers | Patient ID / Referral token | Visual stage pipeline, receiving facility details, escort info | Flags case as overdue if SLA hours exceeded | `PatientDashboard.tsx:246-290` |
| 16 | ASHA | ASHA Field Task Checklist | Daily task checklist for home visits, ANC checks, immunization, and TB DOTS | Task checkbox click, filter selection (`all`, `pending`, `high`) | Updates task completion state, recalculates progress counter | Persists task completion state in local state | `AshaDashboard.tsx:32-79` |
| 17 | ASHA | Offline Beneficiary Registration | Doorstep registration form generating ABHA ID and caching records offline | Patient name, Aadhaar last 4, mobile, age, gender, blood group, vitals | 14-digit ABHA ID, digital ABHA ID card, IndexedDB cached record | Enforces Aadhaar 4-digit and mobile 10-digit validation | `AshaRegister.tsx:23-88` |
| 18 | ASHA | Field Triage & Teleconsult Dispatch | Records field vitals and dispatches urgent consultation request to doctor | Patient selection, vitals (BP, Sugar, Pulse, Temp, SpO2), emergency toggle | Triage score, consultation queue entry in doctor's portal | Validates numeric vitals inputs | `AshaTriage.tsx:50-89` |
| 19 | ASHA | Dedicated Touch & Voice Mode | High-contrast, large-button interface with audio guidance and voice note capture | Voice speech input, screen taps | Spoken audio instructions, dictated note transcription | Fallback speech recognition synthesis | `ASHAWorkerMode.tsx:44-250` |
| 20 | Doctor | Live Teleconsultation Queue | OPD waiting queue with patient vitals and urgency indicators | Queue filter (`all`, `urgent`) | Patient cards with vitals grid and chief complaints | Real-time queue count badge | `DoctorDashboard.tsx:28-89` |
| 21 | Doctor | Low-Bandwidth WebRTC Video Room | Video and audio consultation with automatic audio-only fallback on poor network | Media stream, mic/cam toggle, quality setting | Two-way audio/video stream, bandwidth telemetry display | Auto-switches to audio-only if bitrate < 50kbps | `webrtcHandler.ts:153-198` |
| 22 | Doctor | Multilingual Teleconsult Chat | Multi-party chat with automatic language translation | Text message, target translation language | Bilingual message stream with timestamp and role badge | Fallback translation lookup | `TeleconsultationRoom.tsx:112-134` |
| 23 | Doctor | AI Clinical Notes & Summary Writer | Generates structured consultation summary and digital prescription | Doctor notes, prescription input, vitals | Structured summary card, digital Rx, follow-up date | Disclaimers attached per clinical AI safety protocols | `aiConsultationService.ts:245-250` |
| 24 | Doctor | Prescription Simplifier | Translates complex Latin medical prescriptions into daily timing cues | Prescription string (e.g. `Tab. IFA 100mg OD`) | Simplified cards with Morning, Afternoon, Night icons & meal instructions | Heuristic drug dosage parsing | `aiConsultationService.ts:245-250` |
| 25 | Admin | District Facility Command Center | Matrix view monitoring 36 public facilities, staff attendance, and bed counts | Block filter, facility tier filter | Facility cards, operational index, bed availability counters | Highlights facilities with low attendance | `DistrictDashboard.tsx:1-250` |
| 26 | Admin | Epidemiological Outbreak Tracker | Real-time tracker for disease clusters (Dengue, Malaria, Gastro) across villages | Village case reports | Active outbreak alert cards with severity tags and response status | Escalates when outbreak threshold breached | `AlertsPanel.tsx:1-180` |
| 27 | Admin | High-Risk Surveillance Tracker | District surveillance for pregnant ANC, NCD, TB, and malnutrition cohorts | Patient cohort filter, urgency filter | High-risk patient cards with SLA countdown and escalation tier | Auto-escalates overdue cases to `ASHA_ALERT`, `MO_ALERT`, `DHO_CRITICAL` | `riskEngine.ts:87-120` |
| 28 | Admin | Supply Chain & Indent Generator | Central drug inventory monitoring with automated warehouse indents | Facility filter, stock threshold | Stock depletion charts, low-stock warning banners, indent slips | Auto-generates indent when stock < minBufferThreshold | `medicineEngine.ts:57-76` |
| 29 | Admin | ABDM, FHIR & HMIS Gateway | Pan-India health interoperability hub with FHIR R4 Bundle viewer | Milestone tab, FHIR bundle selector, HMIS export format | Interactive FHIR JSON tree, downloadable HMIS Form 9/12 reports | Validates FHIR R4 resource compliance | `InteropDashboard.tsx:1-250` |
| 30 | Diagnostics | 48-Test Catalog & Lab Finder | Directory of 48 clinical tests across 5 categories and nearby accredited labs | Category filter, search query, distance filter | Test detail cards (sample type, fasting, TAT, parameters) | Shows turnaround time warning | `diagnosticService.ts:112-758` |
| 31 | Diagnostics | Digital Test Order Tracker | Barcode tracking for lab orders from sample collection to pathologist verification | Order token / Barcode query | 5-stage status progress, parameter result table with critical flags | Highlights critical abnormal parameters in red | `TestOrderTracker.tsx:1-250` |
| 32 | Referrals | 7-Stage Inter-Facility Transfer | End-to-end referral state machine with transport dispatch and counter-referrals | Referral token, next stage transition button | Status timeline, transport driver details, feedback form | Overdue timer fires when exceeding SLA (2h, 24h, 72h, 7d) | `referralService.ts:276-297` |
| 33 | Referrals | Closed-Loop Doctor Feedback | Specialist counter-referral recording final diagnosis and follow-up advice | Outcome status, final diagnosis, treatment summary, follow-up date | Synchronized feedback card on referring doctor and ASHA portals | Requires final diagnosis before completion | `DoctorFeedback.tsx:1-200` |
| 34 | Queue | Waiting Room TV Display | High-contrast fullscreen clinic TV screen with giant token and chime | Center ID, Department selector, sound toggle, fullscreen button | Now Serving token (160px), masked patient name, audio chime | Broadcasts token changes across browser tabs | `QueueDisplay.tsx:28-250` |
| 35 | Queue | Operator Queue Console | Staff dashboard to call next patient, pause queue, or add walk-in patients | "Call Next", "Complete", "Skip", "Pause" buttons, walk-in form | Real-time queue advance, SMS alert dispatch, wait time recalculation | Prompt required to pause queue with reason | `HealthCenterDashboard.tsx:100-182` |
| 36 | Offline | IndexedDB 8-Store Storage | Client-side database providing full offline read/write capabilities | Mutation payloads (triage, registrations, indents, referrals) | IndexedDB storage objects across 8 dedicated stores | Automatically queues offline writes in `syncQueue` | `offlineDB.ts:11-20` |
| 37 | Offline | Background Sync Engine | Syncs queued offline actions and measures connection quality | Network online event, timer trigger | Uploads pending mutations, fires sync complete events | Retries with exponential backoff on network failure | `syncService.ts:143-200` |

---

## 5. Edge Cases & Error Handling Inventory

| # | Feature | Input / Condition | Observed Behavior |
|---|---------|-------------------|-------------------|
| 1 | Patient Login | Mobile number < 10 digits | Validation stops submission; displays inline error: "Please enter valid 10-digit mobile number". |
| 2 | Patient Login | Invalid OTP entered (not `123456` or `789123`) | Displays red error banner: "Invalid OTP. Please enter the 6-digit code received on your mobile." |
| 3 | Offline Mode | User performs action while network disconnected | Action intercepted by `offlineDB.addToSyncQueue`; item marked `PENDING` with retry counter 0; notification toast confirms offline safe storage. |
| 4 | Offline Mode | Network restored after offline operations | `syncService` detects `online` event; measures connection quality; flushes `syncQueue` items sequentially; logs success to `syncLog`. |
| 5 | Speech Input | Browser denies microphone permission | `voiceService` catches error; switches to fallback simulation mode; generates representative clinical transcript after 2.5s delay. |
| 6 | Teleconsultation | Network bandwidth drops below 50 kbps or packet loss > 10 | `webrtcHandler` triggers `onQualityChange('audio-only')`; stops video tracks; switches to 16kHz audio-only stream; displays banner: "Low cellular network detected. Switched to audio mode." |
| 7 | Symptom Triage | Patient inputs critical symptom (e.g. Chest Pain, Loss of Consciousness) | `triageEngine` assigns maximum weight (10); marks `hasCritical = true`; calculates Red Level; overrides standard appointment advice with immediate "Call 108 Emergency Ambulance" prompt. |
| 8 | Symptom Triage | Infant patient (< 1 year old) | `getAgeModifier` applies 2.0x multiplier to raw symptom score; escalates borderline symptoms to urgent status. |
| 9 | Symptom Triage | Abnormal Vitals (SpO2 < 90% or Systolic BP > 180) | `calculateTriage` adds 10 vital risk points; appends critical vital flag; forces Red emergency level regardless of reported symptom severity. |
| 10 | Emergency SOS | Geolocation API fails or permission denied | `EmergencyService.captureCurrentLocation` catches error; falls back gracefully to default Pune rural coordinates (`18.6534° N, 74.1352° E`) with accuracy tag. |
| 11 | Medicine Stock | Prescribed drug is out of stock (quantity = 0) | `MedicineSearch` renders red "Out of Stock" badge; activates Generic Substitution engine to suggest equivalent formulation in stock at nearby center; displays "Notify Me When Available" button. |
| 12 | Referrals | Referral exceeds urgency SLA (e.g. Emergency > 2 hours) | `referralService.runOverdueCheck` marks `isOverdue = true`; recalculates overdue hours; triggers red Overdue alert banner; surfaces rapid action buttons: "Call Patient", "Alert ASHA Escort", "Escalate to DHO". |
| 13 | Queue Display | Operator calls next patient while queue is empty | `queueEngine.callNextPatient` returns `{ success: false, message: 'No patients waiting in queue' }`; UI displays "Waiting for patients...". |
| 14 | Queue Display | Multiple tabs open simultaneously | `BroadcastChannel` synchronizes token updates across tabs; chime plays and token updates in real time without page reload. |
| 15 | Appointment Booking | User tries to book past date or already booked slot | Interactive calendar disables all previous calendar dates; slot button displays "0 seats left" and disables click handler. |
| 16 | ASHA Registration | Duplicate or invalid Aadhaar last 4 digits | Form restricts input to 4 numeric digits (`maxLength={4}`); prevents non-numeric character entry. |

---

## 6. Component Hierarchy & Shared UI Patterns

```
src/
├── App.tsx                              # Central Route Manifest & Providers
│   ├── PortalSwitcher.tsx               # Persistent Top Evaluator Switcher Bar
│   ├── OfflineIndicator.tsx             # Global Low-Connectivity & Sync Bar
│   └── Routes                           # 30+ Application Routes
│
├── layouts/
│   └── DashboardLayout.tsx              # Master Role Layout (Top Ribbon, Sidebar, Mobile Drawer)
│       ├── LanguageSwitcher.tsx         # Multilingual Dropdown
│       └── NotificationBell.tsx         # Real-time Overdue Notification Bell
│
├── components/
│   ├── common/
│   │   ├── Header.tsx                   # Public Landing Page Header
│   │   ├── Footer.tsx                   # Public Government Footer & Compliance
│   │   ├── AbdmInteroperabilityModal.tsx# ABDM Care Context & Gateway Modal
│   │   └── ErrorBoundary.tsx            # React Component Error Catcher
│   │
│   ├── emergency/
│   │   ├── EmergencyButton.tsx          # 1-Tap Circular SOS Dispatch Button
│   │   ├── EmergencyAlert.tsx           # Casualty Pre-Arrival Alert Card
│   │   ├── AmbulanceTracker.tsx         # Live Vehicle Coordinates & Paramedic Card
│   │   └── EmergencyContacts.tsx        # 24/7 Government Helpline Directory
│   │
│   ├── diagnostic/
│   │   ├── DiagnosticDashboard.tsx      # Hub Overview & Master Tabs
│   │   ├── TestOrderTracker.tsx         # Barcode Test Order Tracker
│   │   ├── LabFinder.tsx                # Accredited Lab Network Map & Cards
│   │   ├── CreateTestOrder.tsx          # Prescription Lab Order Modal
│   │   └── LabResultViewer.tsx          # Parameter Result Breakdown & PDF Downloader
│   │
│   ├── referral/
│   │   ├── ReferralTracker.tsx          # Specialist Referral Pipeline
│   │   ├── ReferralCard.tsx             # Individual Transfer Card with SLA Badge
│   │   ├── CreateReferral.tsx           # Inter-Facility Referral Slip Modal
│   │   ├── DoctorFeedback.tsx           # Closed-Loop Counter-Referral Feedback Form
│   │   └── PatientReferralView.tsx      # Patient-Facing Referral Tracker
│   │
│   ├── queue/ (pages/queue/)
│   │   ├── QueueDisplay.tsx             # Waiting Room TV Screen (Ambient dark theme)
│   │   └── HealthCenterDashboard.tsx    # Staff Operator Queue Console
│   │
│   ├── medicine/
│   │   ├── MedicineSearch.tsx           # Patient Drug Availability Search
│   │   ├── MedicineCard.tsx             # Drug Item Card with Days-of-Supply Badge
│   │   ├── StockDashboard.tsx           # District Central Inventory Overview
│   │   ├── LowStockAlerts.tsx           # Buffer Threshold Breach Warnings
│   │   ├── StockUpdateForm.tsx          # Facility Stock Reconciliation Form
│   │   └── SupplyChainView.tsx          # Warehouse Indents Pipeline
│   │
│   ├── highrisk/
│   │   ├── HighRiskDashboard.tsx        # District Surveillance Overview
│   │   ├── PatientRiskCard.tsx          # High-Risk Patient Detail Card
│   │   ├── ASHAWorkerView.tsx           # Frontline ASHA Risk Tracking View
│   │   ├── FollowUpSchedule.tsx         # Home Visit Calendar & Overdue SLA
│   │   ├── RiskAnalytics.tsx            # Cohort Breakdown Charts
│   │   └── RiskFlagForm.tsx             # Clinical Risk Assessment Form
│   │
│   ├── interop/
│   │   ├── InteropDashboard.tsx         # Standards & Interoperability Hub
│   │   ├── ABDMConnect.tsx              # ABHA M1/M2/M3 Verification
│   │   ├── ConsentManager.tsx           # Electronic Health Consent Lifecycle
│   │   ├── FhirBundleViewer.tsx         # FHIR R4 JSON Tree Viewer
│   │   ├── HmisReportExporter.tsx       # Standard HMIS Monthly Report Exporter
│   │   └── SystemLinker.tsx             # e-Sanjeevani / CoWIN / Nikshay Connectors
│   │
│   ├── teleconsultation/
│   │   └── TeleconsultationRoom.tsx     # WebRTC Video Room, AI Rx Simplifier, Chat
│   │
│   ├── voice/
│   │   ├── AudioGuidanceButton.tsx      # Text-to-Speech Speaker Button
│   │   └── VoiceAssistantModal.tsx      # Multilingual Voice Assistant Modal
│   │
│   ├── language/
│   │   ├── ASHAWorkerMode.tsx           # Simplified High-Touch Touch & Voice Mode
│   │   └── VoiceInput.tsx               # Web Speech API Speech-to-Text Button
│   │
│   └── shared/
│       ├── NotificationBell.tsx         # Unread Overdue Alert Counter
│       └── StatusTimeline.tsx           # 7-Stage Visual Milestone Line
```

---

## 7. Exact Mobile Feature Parity Specification (React Native / Expo)

To achieve 100% feature parity in the native cross-platform mobile application (`mobile/`), the mobile architecture must port the following modules and native capabilities:

### Mobile Porting Matrix

| Web Portal Module | Required Native Screen in `mobile/` | Core Native Capabilities to Integrate |
|---|---|---|
| **Auth & Role Switcher** | `screens/auth/LoginScreen.tsx`<br>`screens/auth/RoleSelectScreen.tsx` | Secure Token Storage (`expo-secure-store`), Biometric Auth (`expo-local-authentication`), SMS OTP auto-fill |
| **Patient Dashboard** | `screens/patient/PatientDashboardScreen.tsx` | ABHA card rendering, pull-to-refresh, appointment cards, quick navigation grid |
| **Appointment Booking** | `screens/patient/BookAppointmentScreen.tsx` | Native calendar date-picker, doctor selection cards, token receipt generation with native share |
| **Medical Records (PHR)** | `screens/patient/MyRecordsScreen.tsx` | Longitudinal health profile, interactive vitals graphs, lab report PDF viewer, offline caching |
| **Medicine Stock Checker** | `screens/patient/MedicineCheckScreen.tsx` | Search filter with debouncing, distance sorting, generic alternative recommendation cards, restock alert registration |
| **AI Symptom Triage** | `screens/patient/TriageScreen.tsx` | Multi-step form wizard, age/duration/vitals modifiers, color-coded severity banner, direct SOS call link |
| **Emergency SOS & Ambulance** | `screens/patient/EmergencySosScreen.tsx` | Native GPS Location (`expo-location`), 1-tap SOS button with haptic feedback (`expo-haptics`), live ETA countdown, direct phone call (`Linking.openURL('tel:108')`) |
| **ASHA Field Portal** | `screens/asha/AshaDashboardScreen.tsx`<br>`screens/asha/AshaRegisterScreen.tsx`<br>`screens/asha/AshaPatientsScreen.tsx` | Full offline SQLite/AsyncStorage storage, camera photo capture (`expo-camera`), daily visit checklist, high-risk flags |
| **ASHA Multilingual Voice** | `screens/asha/AshaVoiceModeScreen.tsx` | Native Speech-to-Text (`@react-native-voice/voice` or Expo Audio speech recognition) and Native Text-to-Speech (`expo-speech`) |
| **Doctor OPD & Queue** | `screens/doctor/DoctorDashboardScreen.tsx`<br>`screens/doctor/DoctorQueueScreen.tsx` | Live consultation queue, patient EHR archive inspection, filter by urgency |
| **Doctor Consultation Room** | `screens/doctor/DoctorCallScreen.tsx` | Native WebRTC video/audio call (`react-native-webrtc`), audio-only low bandwidth fallback, live prescription writer |
| **District Admin & Heatmaps** | `screens/admin/DistrictAdminScreen.tsx`<br>`screens/admin/FacilityMatrixScreen.tsx` | Facility operational status, epidemic outbreak tracking, drug inventory alerts, ABDM/HMIS sync indicators |
| **Diagnostics Hub** | `screens/diagnostic/DiagnosticHubScreen.tsx` | 48-test catalog search, accredited lab finder, barcode sample tracker, critical parameter alerts |
| **Referrals Hub** | `screens/referral/ReferralTrackerScreen.tsx` | 7-stage state machine visual timeline, urgency SLA overdue alerts, doctor feedback and counter-referral slip |
| **Queue Management** | `screens/queue/QueueDisplayScreen.tsx`<br>`screens/queue/StaffQueueScreen.tsx` | Waiting Room TV display with large token display, operator console to call next patient / add walk-ins |
| **Offline Synchronization** | `services/sync/SyncEngine.ts` | Local SQLite database, background sync task (`expo-task-manager`), network status monitor (`@react-native-community/netinfo`) |

---
*End of Authoritative Specification Survey Report.*
