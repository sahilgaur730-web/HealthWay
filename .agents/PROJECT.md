# Project: HealthWay Native Cross-Platform Mobile Application

## Architecture
- **Framework**: React Native 0.86.3 with Expo SDK 57 (managed workflow) in `mobile/`.
- **Language & Types**: TypeScript (strict mode enabled), zero lint/type errors (`tsc --noEmit`).
- **Navigation Architecture**: `@react-navigation/native` (v7) with `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`. Supports 4 dedicated role-based navigators (Patient, ASHA, Doctor, Admin) plus a top-level Evaluator/Portal Switcher and Auth Stack.
- **Offline Persistence Architecture**: 8-store storage engine (`sync_queue`, `patient_cache`, `triage_drafts`, `medicine_stock`, `facility_data`, `referral_drafts`, `settings`, `sync_log`) using SQLite (`expo-sqlite`) and `@react-native-async-storage/async-storage`.
- **Security**: `expo-secure-store` for cryptographic tokens, ABHA credentials, and session keys; `expo-local-authentication` for biometrics.
- **Native Hardware Capabilities**:
  - `expo-camera` for beneficiary registration photos and document scanning.
  - `expo-location` for emergency SOS coordinates and ambulance tracking.
  - `expo-speech` for trilingual audio guidance.
  - `expo-print` and `expo-sharing` for diagnostic and prescription PDF downloads.
- **Trilingual i18n & Accessibility**: Native trilingual engine supporting English (`en`), Marathi (`mr`), and Hindi (`hi`) with instant switching.
- **Design System & Tokens**: Maharashtra Government Navy Blue (`#1A4B8C`), Saffron (`#F57C00`), Dark Slate (`#1C2B3A`), Neutral Gray (`#546E7A`), crisp typography, zero Unicode emojis (all icons rendered via `@expo/vector-icons` Ionicons/MaterialIcons).

---

## Feature Inventory
Every feature identified during the comprehensive survey is mapped to a specific implementation milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Expo SDK 57 Native Setup & Config | Install required Expo packages, configure app.json (permissions, bundle ID), tsconfig aliases, scripts | M1 | Survey |
| 2 | Design System & Theme Engine | Government palette (`#1A4B8C`, `#F57C00`), typography, spacing, card/button styles, vector icons | M1 | Survey |
| 3 | Trilingual i18n System | LanguageContext with English, Marathi, Hindi translations and audio guidance hooks | M1 | Survey |
| 4 | Offline Storage & 8-Store Engine | SQLite / AsyncStorage implementation of 8 stores matching web IndexedDB schema | M1 | Survey |
| 5 | Connection Quality & Sync Engine | Network observer (`EXCELLENT` to `OFFLINE`), exponential backoff, sync outbox replay | M1 | Survey |
| 6 | Secure Session & Auth Context | AuthContext with `expo-secure-store` persistence, role switching, user session state | M1 | Survey |
| 7 | Shared UI Components | Header, BottomNav, Card, Button, Badge, Modal, FormInput, EmptyState, PortalSwitcher | M1 | Survey |
| 8 | Role-Based Navigation Architecture | RootNavigator with dynamic switching between Patient, ASHA, Doctor, and Admin stacks | M2 | Survey |
| 9 | Patient Login & ABHA Authentication | 14-digit ABHA login, Mobile OTP verification, biometric authentication | M2 | Survey |
| 10 | Diagnostics Hub: Test Directory | 48-test searchable directory categorized across 5 clinical specialties | M2 | Survey |
| 11 | Diagnostics Hub: Sample Tracker | 4-stage status tracker (`ORDERED`, `COLLECTED`, `ANALYZING`, `RESULT_READY`) with barcodes | M2 | Survey |
| 12 | Diagnostics Hub: Report Viewer | Lab report viewer with normal/critical flags, PDF preview and sharing | M2 | Survey |
| 13 | Referrals Hub: 7-Stage Pipeline | Tracking inter-facility transfer stages (`CREATED` to `COMPLETED`) with timeline | M2 | Survey |
| 14 | Referrals Hub: SLA & Counter-Referrals | Urgency tiers (`IMMEDIATE` to `ROUTINE`), overdue flags, closing doctor feedback | M2 | Survey |
| 15 | Queue Hub: Priority Token Engine | Emergency > Antenatal > Senior > General priority weighting, dynamic wait times | M2 | Survey |
| 16 | Queue Hub: Waiting Room TV Screen | High-contrast TV mode with token callout, audio announcement chime | M2 | Survey |
| 17 | Medicine Hub: EDL Catalog & Stock | 18+ Essential Drug List search, real-time stock levels across PHCs/CHCs | M2 | Survey |
| 18 | Medicine Hub: Generic Substitutions | Active salt equivalence matcher, low-stock warnings, auto-indent reorder | M2 | Survey |
| 19 | Emergency SOS: 1-Tap Dispatch | Siren feedback, automatic GPS coordinates beacon, pre-arrival CASUALTY alert | M2 | Survey |
| 20 | Emergency SOS: Live Ambulance Tracking | 14-min countdown, 5-stage status telemetry, 24/7 national/state helplines | M2 | Survey |
| 21 | Patient Portal: Main Dashboard | Health stats, ABHA card display, upcoming appointments, active prescriptions | M3 | Survey |
| 22 | Patient Portal: Vitals Tracker | BP, Sugar, SpO2, Heart Rate, BMI logging with visual alerts and history | M3 | Survey |
| 23 | Patient Portal: Appointment Booking | Center/PHC selector, doctor specialization, date/slot picker, token generation | M3 | Survey |
| 24 | Patient Portal: Digital PHR Locker | Categorized health records (Lab, Rx, Discharge, Immunization), offline access | M3 | Survey |
| 25 | Patient Portal: AI Symptom Triage | 4-symptom step-by-step questionnaire with vitals integration and color-coded risk | M3 | Survey |
| 26 | ASHA Portal: Field Dashboard | Household roster summary, high-risk pregnant women, pending immunizations | M3 | Survey |
| 27 | ASHA Portal: Beneficiary Registration | Offline registration form with camera photo capture and ABHA linkage | M3 | Survey |
| 28 | ASHA Portal: High-Risk Antenatal & NCD | Trimester tracking, danger sign checklists, ANC visit schedules | M3 | Survey |
| 29 | ASHA Portal: Voice Intake / STT Mode | Multilingual voice recording and speech-to-text logging for low-literacy intake | M3 | Survey |
| 30 | ASHA Portal: Field Triage & Referral Slip | Quick community assessment, generate priority referral slip with QR/barcode | M3 | Survey |
| 31 | Doctor Portal: Clinical Dashboard & OPD Queue | Live OPD list, waiting room status, priority badges, patient chart view | M4 | Survey |
| 32 | Doctor Portal: Teleconsultation Room | Front camera preview, microphone/speaker toggles, call timer, low-bandwidth fallback | M4 | Survey |
| 33 | Doctor Portal: Digital Rx & Clinical Notes | Drug selector, dosage instructions, diagnostic lab order placement, ABDM referral | M4 | Survey |
| 34 | Admin Portal: District Health Overview | Key district metrics, facility performance index for 7 facilities (`FAC001`-`FAC007`) | M4 | Survey |
| 35 | Admin Portal: Outbreak Tracker & Heatmap | Dengue/Malaria epidemic alerts, severity tiers, facility resource availability map | M4 | Survey |
| 36 | Admin Portal: Drug Inventory & Indents | EDL stock levels across all facilities, warehouse requisitions, consumption rates | M4 | Survey |
| 37 | Admin Portal: ABDM & National Interop | Status monitor for 7 national health systems (ABDM, NHM, HMIS, MCTS, etc.) | M4 | Survey |
| 38 | Dual-Track Acceptance & Bundling | 100% E2E test suite pass, clean `tsc --noEmit`, Expo bundle verification | M5 | Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Mobile Core Architecture & Theme System | Features 1-7 (Dependencies, app.json, tsconfig, theme, i18n, offline storage, sync, auth store, shared components) | None | DONE |
| M2 | Navigation Hub, Auth & Shared Hubs | Features 8-20 (Role navigation, ABHA login, Diagnostics, Referrals, Queue, Medicines, Emergency SOS) | M1 | DONE |
| M3 | Patient Portal & ASHA Community Module | Features 21-30 (Patient dashboard, vitals, appointments, PHR, triage; ASHA dashboard, registration, high-risk, voice intake) | M1, M2 | DONE |
| M4 | Doctor Teleconsultation & District Admin | Features 31-37 (Doctor dashboard, OPD queue, video room, Rx writer; Admin overview, outbreaks, drug inventory, ABDM interop) | M1, M2, M3 | IN_PROGRESS |
| M5 | E2E Verification & Adversarial Hardening | Feature 38 (Pass 100% E2E test suite Tiers 1-4, Tier 5 adversarial testing, `tsc --noEmit`, Expo bundling) | M1, M2, M3, M4, E2E_READY | PLANNED |

In parallel:
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Independent opaque-box test suite (Tiers 1-4 covering all 37 features), test harness, publishes `TEST_READY.md` | None | DONE |

---

## Interface Contracts

### 1. AuthContext ↔ Navigators & Screens
```typescript
interface UserSession {
  role: 'patient' | 'asha' | 'doctor' | 'admin';
  token?: string;
  user: {
    id: string;
    name: string;
    abhaId?: string;
    phone?: string;
    facilityId?: string;
    facilityName?: string;
    registrationNo?: string;
  };
}

interface AuthContextType {
  session: UserSession;
  setRole: (role: 'patient' | 'asha' | 'doctor' | 'admin') => Promise<void>;
  loginWithAbha: (abhaId: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
```

### 2. OfflineStorage ↔ SyncEngine ↔ Domain Services
```typescript
interface OfflineStoreItem<T> {
  id: string;
  data: T;
  updatedAt: number;
  synced: boolean;
}

interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: number;
  retries: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface OfflineStorageAPI {
  getItem: <T>(store: string, id: string) => Promise<T | null>;
  getAll: <T>(store: string) => Promise<T[]>;
  saveItem: <T>(store: string, id: string, data: T) => Promise<void>;
  deleteItem: (store: string, id: string) => Promise<void>;
  enqueueSync: (endpoint: string, method: string, payload: any) => Promise<void>;
  getPendingSyncItems: () => Promise<SyncQueueItem[]>;
}
```

### 3. LanguageContext ↔ All Screens & Components
```typescript
type Language = 'en' | 'mr' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  speak: (text: string) => void;
}
```

### 4. Domain Models
- **Diagnostic Order**: id, patientId, testCode, category, priority, status (`ORDERED`|`SAMPLE_COLLECTED`|`ANALYZING`|`RESULT_READY`), barcode, results, normalRange.
- **Referral**: id, patientId, fromFacility, toFacility, urgency, stage (`CREATED`...`COMPLETED`), transportType, slaDeadline, feedback.
- **Queue Token**: tokenNumber, patientName, department, priorityWeight, status (`WAITING`|`IN_CONSULTATION`|`COMPLETED`), estWaitMinutes.
- **Emergency Event**: id, patientName, lat, lng, dispatchTime, etaMinutes, status (`DISPATCHED`|`EN_ROUTE`|`ON_SCENE`|`TRANSPORTING`|`ARRIVED`).
- **Medicine Item**: code, name, category, stockLevel, minBuffer, status (`ADEQUATE`|`LOW`|`CRITICAL`|`OUT_OF_STOCK`), genericSubstitutes.

---

## Code Layout
All application code MUST reside exclusively inside `mobile/src/`:
```
mobile/
├── app.json                     # Native config, bundle ID, permissions
├── tsconfig.json                # Strict TypeScript + path aliases
├── package.json                 # Expo SDK 57 dependencies and scripts
├── App.tsx                      # Root App entry point
└── src/
    ├── theme/                   # Theme tokens, colors, typography, styles
    ├── types/                   # TypeScript interfaces and domain models
    ├── context/                 # AuthContext, LanguageContext, SyncContext
    ├── storage/                 # SQLite & AsyncStorage 8-store implementation
    ├── services/                # Triage, risk, queue, medicine, sync, voice engines
    ├── navigation/              # Root, Auth, Patient, ASHA, Doctor, Admin navigators
    ├── components/              # Reusable UI cards, headers, buttons, inputs, modals
    ├── screens/
    │   ├── auth/                # Login, ABHA OTP, Role selection
    │   ├── patient/             # Dashboard, Vitals, Appointments, Records, Triage
    │   ├── asha/                # Dashboard, Register, HighRisk, VoiceIntake, Referral
    │   ├── doctor/              # Dashboard, OPDQueue, VideoRoom, PrescriptionWriter
    │   ├── admin/               # Overview, Facilities, Outbreaks, Inventory, ABDM
    │   └── hubs/                # DiagnosticsHub, ReferralsHub, QueueHub, MedicineHub, EmergencySOS
    └── data/                    # Mock datasets, EDL master list, test catalog
```
