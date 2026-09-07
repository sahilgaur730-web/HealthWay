# Comprehensive Mobile Architectural Survey & Blueprint
**Target Directory:** `c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\`  
**Agent:** `survey_explorer_3` (Mobile Architecture Explorer)  
**Date:** 2026-09-07  
**Integrity Mode:** Development (Read-Only Survey)  

---

## 1. Executive Summary & Baseline Status

The target directory `mobile/` currently contains a clean, minimal Expo SDK 57 base project initialized with TypeScript. No application screens, navigators, business logic, offline engines, or UI components have been implemented yet.

### Current Directory Contents (`mobile/`)
```
mobile/
├── .expo/                   # Expo local CLI cache
├── assets/                  # Default starter icons & splash graphics
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── node_modules/            # Installed base dependencies
├── .gitignore               # Standard Expo gitignore
├── AGENTS.md                # Note specifying Expo SDK 57 docs
├── App.tsx                  # Single placeholder screen (21 lines)
├── app.json                 # Minimal Expo config (26 lines)
├── CLAUDE.md                # Reference to AGENTS.md
├── index.ts                 # Entry point registering App component
├── LICENSE                  # MIT license
├── package-lock.json        # NPM lockfile (227 KB)
├── package.json             # Minimal manifest (23 lines)
└── tsconfig.json            # Base tsconfig extending expo/tsconfig.base
```

### Baseline Dependencies & Versions
| Dependency | Version in `package.json` | Installed / CLI Version | Status |
|---|---|---|---|
| `expo` | `~57.0.20` | `57.0.20` (CLI `57.0.22`) | Up to date (SDK 57) |
| `expo-status-bar` | `~57.0.1` | `57.0.1` | Up to date |
| `react` | `19.2.3` | `19.2.3` | Modern React 19 |
| `react-native` | `0.86.3` | `0.86.3` | React Native 0.86 |
| `@types/react` | `~19.2.2` | `19.2.18` | Compatible with React 19 |
| `typescript` | `~6.0.3` | `6.0.3` | Compatible with Expo 57 |

### Baseline Verification Results
- **TypeScript Check (`npx tsc --noEmit`)**: **PASSED** (Exit code 0, 0 errors).
- **Expo Diagnostics (`npx expo-doctor`)**: **PASSED** (21 of 21 checks passed without issues).
- **Expo Config Validation (`npx expo config`)**: **PASSED** (Parses cleanly without syntax or schema errors).
- **Expo Dependency Check (`npx expo install --check`)**: **PASSED** ("Dependencies are up to date").

---

## 2. Dependency Gap Analysis

Currently, `mobile/package.json` contains **only 4 production dependencies** (`expo`, `expo-status-bar`, `react`, `react-native`). To fulfill the 9 core modules, native capabilities, offline-first sync, and role-based navigation, the following packages are required.

### 2.1 Navigation Architecture: `@react-navigation` vs `expo-router`
| Criteria | `@react-navigation` (Recommended) | `expo-router` |
|---|---|---|
| **Role-Based Guards** | **Superior**: Explicit conditional rendering of `AuthNavigator`, `PatientNavigator`, `AshaNavigator`, `DoctorNavigator`, `AdminNavigator` based on `userRole` state in `AuthContext`. | Complex file-based groups `(patient)`, `(asha)` with manual URL redirection and middleware hurdles. |
| **Directory Coupling** | Decoupled. Screens and navigation definitions reside cleanly in `src/screens` and `src/navigation`. | Tied strictly to the `app/` filesystem directory. Moving files breaks URLs. |
| **Native Modals & Tabs** | Mature stack & bottom-tabs API with battle-tested transitions and gesture handling. | Wraps react-navigation under the hood with additional abstractions. |
| **Offline Teleconsultation** | Simple programmatic navigation to dynamic call rooms with parameter passing. | Deep linking route constraints. |

**Recommendation:** Adopt `@react-navigation/native` (v7) with `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`.

### 2.2 Missing Packages Categorized by Capability

#### A. Core Navigation & Safe Area Gestures
- `@react-navigation/native`: Standard routing container and state management.
- `@react-navigation/native-stack`: Native platform transition animations (iOS UINavigationController / Android Fragment).
- `@react-navigation/bottom-tabs`: Persistent bottom navigation for Patient, ASHA, Doctor, and Admin workflows.
- `react-native-screens`: Native view primitives for high performance.
- `react-native-safe-area-context`: Notched devices, home indicator bar, and dynamic status bar padding.
- `react-native-gesture-handler`: Native pan, swipe, and modal sheet gesture recognition.

#### B. Storage, Security & Biometrics (R1 & R6)
- `expo-secure-store`: Keychain (iOS) & Keystore (Android) for encrypted ABHA tokens, doctor credentials, and session keys.
- `expo-sqlite`: Fast embedded relational database for local offline caching of patients, triage drafts, medicine inventory, and referral records.
- `@react-native-async-storage/async-storage`: Lightweight key-value store for app settings, cached preferences, and temporary drafts.
- `expo-local-authentication`: Biometric authentication (Fingerprint, TouchID, FaceID) for instant patient and clinician re-login.

#### C. Connectivity & Offline Sync (R6)
- `@react-native-community/netinfo`: Real-time network reachability and cellular/WiFi/offline detection.
- Sync engine adapter to mirror web's `src/services/syncService.ts` and `src/services/offlineDB.ts`.

#### D. Hardware & Multimedia (R2, R3, R4)
- `expo-camera`: Camera view for ASHA beneficiary photo capture and prescription scanning.
- `expo-location`: High-accuracy GPS coordinates for 1-tap SOS, ambulance dispatch tracking, and nearest PHC/CHC distance calculation.
- `expo-notifications`: Push notifications for appointment reminders, queue token callouts, and epidemic outbreak alerts.
- Vector Icons (`@expo/vector-icons`): Feather, Ionicons, MaterialCommunityIcons matching web's `lucide-react` icon set.

#### E. Document Generation & Export (R4 & R5)
- `expo-print`: HTML-to-PDF rendering for digital prescriptions, referral transfer slips, and lab reports.
- `expo-sharing`: Native Android/iOS share sheet integration to export PDFs to WhatsApp, Bluetooth, or files.
- `expo-file-system`: Local file download and temporary report caching.

### 2.3 Exact Package Installation Plan
When implementing, the following commands should be executed:
```bash
# 1. Expo-managed modules (guaranteed version compatibility with SDK 57)
npx expo install expo-secure-store expo-sqlite expo-notifications expo-camera expo-local-authentication expo-location expo-print expo-sharing expo-file-system @expo/vector-icons react-native-screens react-native-safe-area-context react-native-gesture-handler @react-native-async-storage/async-storage @react-native-community/netinfo

# 2. React Navigation packages
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

---

## 3. Configuration Readiness & Adjustments Needed

### 3.1 `mobile/app.json` Enhancements
The current `app.json` lacks bundle IDs, permission declarations, plugins, and deep linking schemes. The following configuration must be applied:
```json
{
  "expo": {
    "name": "HealthWay",
    "slug": "healthway-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "healthway",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.healthway.mobile",
      "infoPlist": {
        "NSCameraUsageDescription": "HealthWay needs camera access for beneficiary photo registration and prescription capture.",
        "NSMicrophoneUsageDescription": "HealthWay needs microphone access for teleconsultation and ASHA voice triage.",
        "NSLocationWhenInUseUsageDescription": "HealthWay needs location access for emergency ambulance tracking and nearest health facility routing.",
        "NSFaceIDUsageDescription": "HealthWay uses Face ID for fast and secure biometric login."
      }
    },
    "android": {
      "package": "com.healthway.mobile",
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "USE_BIOMETRIC",
        "POST_NOTIFICATIONS"
      ]
    },
    "plugins": [
      "expo-secure-store",
      "expo-camera",
      "expo-location",
      "expo-notifications",
      "expo-local-authentication",
      "expo-sqlite"
    ],
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### 3.2 `mobile/tsconfig.json` Path Aliases
To enable clean imports like `@/components/common/Header` and avoid brittle `../../` paths:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3.3 `mobile/package.json` Scripts
Add `"typecheck": "tsc --noEmit"` to scripts for automated validation:
```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "typecheck": "tsc --noEmit"
}
```

---

## 4. Feature Parity Mapping: 9 Core Modules

The mobile application must achieve 100% feature parity with the web portal without touching web/backend files.

| Module | Web Source (`src/`) | Mobile Target Screen (`mobile/src/screens/`) | Key Native Mobile Capabilities |
|---|---|---|---|
| **M1: Public Gateway & Role Switcher** | `pages/public/LandingPage.tsx`, `components/common/PortalSwitcher.tsx` | `screens/public/LandingScreen.tsx`, `screens/auth/RoleSelectModal.tsx`, `screens/auth/PatientLoginScreen.tsx` | Instant role switcher modal, ABHA ID login, OTP verification, biometric (Fingerprint/FaceID) bypass via `expo-local-authentication`, encrypted token storage with `expo-secure-store`. |
| **M2: Patient & Emergency Care** | `pages/patient/PatientDashboard.tsx`, `BookAppointment.tsx`, `MyRecords.tsx`, `MedicineCheck.tsx`, `ReferralStatus.tsx`, `Triage.tsx`, `EmergencyPage.tsx`, `AmbulanceTracker.tsx`, `EmergencyContacts.tsx` | `screens/patient/PatientDashboardScreen.tsx`, `BookAppointmentScreen.tsx`, `MyRecordsScreen.tsx`, `MedicineCheckScreen.tsx`, `ReferralStatusScreen.tsx`, `TriageScreen.tsx`, `EmergencySosScreen.tsx`, `AmbulanceTrackerScreen.tsx`, `EmergencyContactsScreen.tsx` | 1-Tap SOS red button with GPS coordinate dispatch via `expo-location`, real-time animated ambulance location tracker, offline PHR health locker with cached PDF prescriptions via `expo-print`/`expo-sharing`, AI triage step-by-step assessment with urgency score. |
| **M3: ASHA Community Worker** | `pages/asha/AshaDashboard.tsx`, `AshaPatients.tsx`, `AshaRegister.tsx`, `AshaTriage.tsx`, `components/language/ASHAWorkerMode.tsx` | `screens/asha/AshaDashboardScreen.tsx`, `AshaPatientsScreen.tsx`, `BeneficiaryRegisterScreen.tsx`, `AshaTriageScreen.tsx`, `AshaVoiceModeScreen.tsx` | Fast offline beneficiary registration with native camera photo capture (`expo-camera`), high-risk pregnant women tracker, immunization timeline, voice-assisted clinical intake mode, offline queueing of field entries. |
| **M4: Doctor Teleconsultation** | `pages/doctor/DoctorDashboard.tsx`, `DoctorCall.tsx`, `DoctorPatients.tsx`, `DoctorReferrals.tsx`, `components/teleconsultation/TeleconsultationRoom.tsx` | `screens/doctor/DoctorDashboardScreen.tsx`, `DoctorQueueScreen.tsx`, `DoctorCallScreen.tsx`, `ClinicalNotesScreen.tsx`, `DoctorPatientsScreen.tsx`, `DoctorReferralsScreen.tsx` | Live OPD patient queue with waiting status, native video & audio consultation room with front-camera preview (`expo-camera`), digital prescription & clinical notes generator with ABDM/FHIR compliant referral generation. |
| **M5: Queue & OPD Management** | `pages/queue/QueueDisplay.tsx`, `HealthCenterDashboard.tsx`, `services/queueEngine.ts` | `screens/queue/QueueDisplayScreen.tsx`, `screens/queue/HealthCenterQueueScreen.tsx` | Live OPD token display, calling next patient, token status filtering (Waiting, In-Consultation, Completed, Skipped), wait time estimation algorithms adapted from `queueEngine.ts`. |
| **M6: Dedicated Diagnostic Hub** | `pages/DiagnosticPage.tsx`, `components/diagnostic/`, `services/diagnosticService.ts` | `screens/diagnostic/DiagnosticHubScreen.tsx`, `screens/diagnostic/LabReportsScreen.tsx` | Test catalog (Blood, Sputum, CBC, Malarial smear), sample collection tracking, status badge indicators, PDF test report generation and offline viewing. |
| **M7: Dedicated Referral Hub** | `pages/ReferralPage.tsx`, `components/referral/`, `services/referralService.ts` | `screens/referral/ReferralHubScreen.tsx`, `screens/referral/ReferralDetailScreen.tsx` | 3-tier inter-facility referral pipeline (Sub-Center -> PHC/CHC -> District Hospital), clinical justification review, ambulance linkage, print/share referral slip. |
| **M8: District Admin & Facility Health** | `pages/admin/AdminOverview.tsx`, `FacilitiesPage.tsx`, `DistrictDashboardPage.tsx`, `MedicineStock.tsx`, `HighRiskTracker.tsx`, `InteroperabilityPage.tsx` | `screens/admin/AdminOverviewScreen.tsx`, `FacilitiesScreen.tsx`, `DistrictDashboardScreen.tsx`, `MedicineStockScreen.tsx`, `HighRiskTrackerScreen.tsx`, `InteroperabilityScreen.tsx` | Facility health index (beds, staffing, oxygen), epidemic outbreak surveillance tracker, high-risk patient heatmaps, medicine stock monitoring with low-stock alerts, ABDM/HMIS sync status monitor. |
| **M9: Offline-First Synchronization** | `services/offlineDB.ts`, `services/syncService.ts`, `components/offline/OfflineIndicator.tsx` | `src/storage/sqliteDB.ts`, `src/services/mobileSyncService.ts`, `components/common/OfflineBanner.tsx` | Persistent SQLite storage for 8 stores, automatic network connectivity listener (`NetInfo`), queue-and-replay synchronization mechanism, push notifications via `expo-notifications`. |

---

## 5. Recommended Mobile Architecture Blueprint

### 5.1 Directory Structure Blueprint
All mobile code will be housed strictly within `c:/Users/SAHIL GAUR/Desktop/HealthWay/mobile/src/`:

```
mobile/src/
├── components/
│   ├── common/
│   │   ├── Header.tsx              # Role badge, language selector, network status
│   │   ├── OfflineBanner.tsx       # Amber/Red low-connectivity warning bar
│   │   ├── Button.tsx              # Primary, secondary, danger, outline variants
│   │   ├── Card.tsx                # Consistent elevated card container
│   │   ├── Badge.tsx               # Status pills (Urgent, Normal, Completed, etc.)
│   │   ├── Input.tsx               # Text input with validation & error states
│   │   ├── StatCard.tsx            # KPI metric cards with icons and trend arrows
│   │   └── EmptyState.tsx          # Clean empty state graphics & guidance
│   ├── emergency/
│   │   ├── SosButton.tsx           # Large animated 1-Tap emergency button
│   │   └── LiveTrackerMap.tsx      # Native coordinates tracking component
│   ├── consultation/
│   │   ├── VideoRoom.tsx           # Camera preview + call controls
│   │   └── PrescriptionModal.tsx   # Digital Rx formulation modal
│   └── camera/
│       └── CameraCaptureModal.tsx  # Native photo intake for beneficiaries
├── context/
│   ├── AuthContext.tsx             # Current user, active role, ABHA session, biometrics
│   ├── LanguageContext.tsx         # Multilingual state (English, Marathi, Hindi)
│   └── OfflineSyncContext.tsx      # Network status, pending sync count, manual sync trigger
├── data/
│   ├── mockData.ts                 # Full mobile dataset matching web mock data
│   └── translations.ts             # Comprehensive EN, MR, HI clinical dictionaries
├── hooks/
│   ├── useAuth.ts                  # Access auth credentials and role switcher
│   ├── useLanguage.ts              # Translation hook t('key')
│   ├── useNetworkStatus.ts         # Connectivity listener
│   └── useSyncQueue.ts             # Enqueue offline actions and read sync states
├── navigation/
│   ├── RootNavigator.tsx           # Top-level switcher: Public / Patient / ASHA / Doctor / Admin
│   ├── AuthNavigator.tsx           # Login, OTP, Role selection screens
│   ├── PatientNavigator.tsx        # Bottom tab navigator for Patient portal
│   ├── AshaNavigator.tsx           # Bottom tab navigator for ASHA field worker portal
│   ├── DoctorNavigator.tsx         # Bottom tab navigator for Doctor clinical portal
│   ├── AdminNavigator.tsx          # Bottom tab navigator for District Admin portal
│   └── types.ts                    # Strongly-typed NavigationProps and route param lists
├── screens/
│   ├── public/
│   │   └── LandingScreen.tsx
│   ├── auth/
│   │   ├── RoleSelectModal.tsx
│   │   ├── PatientLoginScreen.tsx
│   │   └── OtpVerificationScreen.tsx
│   ├── patient/
│   │   ├── PatientDashboardScreen.tsx
│   │   ├── BookAppointmentScreen.tsx
│   │   ├── MyRecordsScreen.tsx
│   │   ├── MedicineCheckScreen.tsx
│   │   ├── ReferralStatusScreen.tsx
│   │   ├── TriageScreen.tsx
│   │   ├── EmergencySosScreen.tsx
│   │   ├── AmbulanceTrackerScreen.tsx
│   │   └── EmergencyContactsScreen.tsx
│   ├── asha/
│   │   ├── AshaDashboardScreen.tsx
│   │   ├── AshaPatientsScreen.tsx
│   │   ├── BeneficiaryRegisterScreen.tsx
│   │   ├── AshaTriageScreen.tsx
│   │   └── AshaVoiceModeScreen.tsx
│   ├── doctor/
│   │   ├── DoctorDashboardScreen.tsx
│   │   ├── DoctorQueueScreen.tsx
│   │   ├── DoctorCallScreen.tsx
│   │   ├── ClinicalNotesScreen.tsx
│   │   ├── DoctorPatientsScreen.tsx
│   │   └── DoctorReferralsScreen.tsx
│   ├── queue/
│   │   ├── QueueDisplayScreen.tsx
│   │   └── HealthCenterQueueScreen.tsx
│   ├── diagnostic/
│   │   ├── DiagnosticHubScreen.tsx
│   │   └── LabReportsScreen.tsx
│   ├── referral/
│   │   ├── ReferralHubScreen.tsx
│   │   └── ReferralDetailScreen.tsx
│   └── admin/
│       ├── AdminOverviewScreen.tsx
│       ├── FacilitiesScreen.tsx
│       ├── DistrictDashboardScreen.tsx
│       ├── MedicineStockScreen.tsx
│       ├── HighRiskTrackerScreen.tsx
│       └── InteroperabilityScreen.tsx
├── services/
│   ├── queueEngine.ts              # OPD queue algorithms adapted for mobile
│   ├── riskEngine.ts               # Clinical high-risk algorithms
│   ├── triageEngine.ts             # Emergency triage scoring
│   ├── medicineEngine.ts           # Pharmacy inventory and alternative suggestions
│   ├── referralService.ts          # Referral lifecycle management
│   ├── diagnosticService.ts        # Diagnostic order and report pipeline
│   ├── abhaService.ts              # ABHA ID validation and mock verification
│   ├── notificationService.ts      # Push notifications scheduler
│   └── mobileSyncService.ts        # Offline queue processor
├── storage/
│   ├── secureStorage.ts            # expo-secure-store token encryption
│   └── sqliteDB.ts                 # expo-sqlite relational persistence
├── theme/
│   ├── colors.ts                   # Brand navy, emerald, red, neutrals
│   ├── typography.ts               # Scales, font sizes, weights
│   ├── spacing.ts                  # Standard margins & paddings (4, 8, 12, 16, 24, 32)
│   └── shadows.ts                  # Elevation & shadow styles
└── types/
    ├── patient.ts
    ├── asha.ts
    ├── doctor.ts
    ├── admin.ts
    ├── queue.ts
    ├── triage.ts
    └── sync.ts
```

### 5.2 Design System & Theming Tokens
To match the web application's clean Government of Maharashtra healthcare aesthetic:
- **Primary Navy**: `#1A4B8C` (Header bars, primary action buttons, key navigators)
- **Secondary Blue**: `#2563EB` (Accent links, interactive pills)
- **Emerald Green**: `#059669` / `#10B981` (Completed status, low risk, available medicines)
- **Warning Amber**: `#D97706` / `#F59E0B` (Moderate risk, pending sync, low stock)
- **Critical Red**: `#DC2626` / `#EF4444` (Emergency SOS, high-risk triage, stockout)
- **Background**: `#F5F7FA` (Neutral light page background)
- **Card Surface**: `#FFFFFF` with `#E2E8F0` border and subtle shadow elevation.

---

## 6. Implementation Phasing Strategy

1. **Phase 1: Dependencies & Configuration**
   - Install required Expo SDK 57 packages and React Navigation via `npx expo install` / `npm install`.
   - Update `app.json` with bundle identifiers, permissions, and plugins.
   - Configure `tsconfig.json` with path aliases.
   - Add `"typecheck"` script to `package.json`.
   - Verify initial build with `npx tsc --noEmit`.

2. **Phase 2: Core Infrastructure & State**
   - Create theme tokens (`colors.ts`, `spacing.ts`, `typography.ts`).
   - Implement storage engines (`secureStorage.ts`, `sqliteDB.ts`).
   - Implement contexts: `AuthContext.tsx`, `LanguageContext.tsx`, `OfflineSyncContext.tsx`.
   - Adapt domain services (`queueEngine.ts`, `triageEngine.ts`, `riskEngine.ts`, `medicineEngine.ts`, etc.).
   - Build common components (`Header`, `OfflineBanner`, `Button`, `Card`, `Badge`, `Input`).

3. **Phase 3: Navigation Framework**
   - Build `RootNavigator.tsx` with role switching (`AuthNavigator`, `PatientNavigator`, `AshaNavigator`, `DoctorNavigator`, `AdminNavigator`).
   - Implement common `RoleSelectModal` and `PortalSwitcher` header integration.

4. **Phase 4: Screen Implementation for 9 Modules**
   - Implement all Patient screens (Dashboard, Appointments, PHR, Medicines, Triage, Emergency SOS, Ambulance Tracker).
   - Implement all ASHA screens (Dashboard, Beneficiaries, Camera Registration, Field Triage, Voice Intake).
   - Implement all Doctor screens (Dashboard, Queue, Call Room, Clinical Notes/Rx, Referrals).
   - Implement Queue, Diagnostics, and Referral Hub screens.
   - Implement Admin screens (Overview, Facilities, District Dashboard, High-Risk Tracker, Interoperability).

5. **Phase 5: Verification & Zero-Diff Validation**
   - Run `npx tsc --noEmit` in `mobile/`.
   - Run `npx expo-doctor` in `mobile/`.
   - Verify `git status` shows **0 modified or added files** in `src/`, `public/`, `backend/`, `package.json`, etc.

---

## 7. Verification Commands Summary

| Target | Command | Expected Outcome |
|---|---|---|
| TypeScript Typechecking | `cd mobile && npx tsc --noEmit` | Exit code 0, 0 compilation errors. |
| Expo Health & Config | `cd mobile && npx expo-doctor` | 21/21 checks passing. |
| Expo App Config Dump | `cd mobile && npx expo config` | JSON config with bundle ID and permissions. |
| Dependency Parity Check | `cd mobile && npx expo install --check` | All dependencies matched to SDK 57. |
| Zero Web Diff Assurance | `git status --porcelain` (root) | Zero modifications outside `mobile/` or `.agents/`. |
