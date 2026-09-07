# Original User Request

## 2026-09-07T14:23:22Z

Build a production-grade, native cross-platform mobile application (Android & iOS) using React Native and Expo in the `mobile` workspace, achieving 100% feature parity with the existing HealthWay web portal without modifying or disturbing any web/backend codebase files.

Working directory: c:/Users/SAHIL GAUR/Desktop/HealthWay/mobile
Integrity mode: development

## Strict Constraints
- **Zero Website Code Modification:** Absolutely NEVER modify, delete, or touch any files outside the `mobile/` directory (specifically `src/`, `public/`, `backend/`, `index.html`, `vite.config.ts`, `package.json`).
- **Clean Architecture:** All mobile application code, screens, navigators, hooks, types, and assets must reside strictly inside `c:/Users/SAHIL GAUR/Desktop/HealthWay/mobile/`.

## Requirements

### R1. Navigation & Authentication Hub
Implement full navigation structure (using `@react-navigation` or Expo Router) supporting role-based access:
- Public Gateway & Role Switcher (Patient, ASHA Worker, Doctor, Admin).
- Patient Login with ABHA ID, Mobile OTP, and biometric/saved session.
- Secure token storage with `expo-secure-store`.

### R2. Patient & Emergency Care Module
Implement all patient-facing modules matching the web experience:
- Patient Dashboard: Upcoming consultations, active prescriptions, recent vitals, diagnostic summaries.
- Appointment Booking: Center selection, doctor specialization, slot picker, token generation.
- Medical Records (PHR): Digital health locker, lab reports, prescription viewer, offline caching.
- Medicine Availability Checker: Real-time stock status across PHCs/CHCs with generic alternatives.
- AI Symptom Triage: Step-by-step diagnostic questionnaire with urgency risk scoring.
- Emergency SOS & Ambulance Tracking: 1-Tap SOS dispatch, live ambulance coordinates, emergency hospital contacts.

### R3. ASHA Community Worker Module
Implement the field worker portal with offline-first capabilities:
- ASHA Field Dashboard: Target households, high-risk pregnant women, immunization schedules.
- Beneficiary Registration: Fast offline patient registration with photo capture.
- Multilingual Voice Input Mode: Speech-to-text intake for low-literacy clinical logging.
- Community Triage & Referral Generation: Field assessment and priority referral slips.

### R4. Doctor Teleconsultation Module
Implement doctor clinical workflows:
- Doctor Dashboard & Active Queue: Live OPD list, waiting room statuses, patient history inspection.
- Video & Audio Consultation Room: Native WebRTC / Expo Camera & Audio call integration.
- Clinical Note & Prescription Writer: Digital Rx generator, diagnostic orders, ABDM/FHIR compliant referrals.

### R5. Diagnostics, Referrals & District Admin Module
- Diagnostic Hub: Test directory, sample collection status, PDF test report downloader.
- Referral Hub: Inter-facility transfer tracking from Sub-Center to District Hospital.
- District Admin Overview: Facility health index, epidemic outbreak tracker, high-risk patient heatmaps, drug inventory levels, ABDM/HMIS sync indicators.

### R6. Offline-First Synchronization & Native Capabilities
- Local SQLite / AsyncStorage persistence for full offline functionality in low-connectivity rural areas.
- Background sync engine to synchronize queued actions when network restores.
- Push notifications via Expo Notifications for appointment reminders and critical health alerts.

## Acceptance Criteria

### Parity & Architecture
- [ ] All 9 core functional modules (Patient, ASHA, Doctor, Admin, Diagnostics, Referrals, Queue, Emergency, Medicines) have dedicated, fully navigable screens in `mobile/`.
- [ ] Web application files (`src/**`, `public/**`, `backend/**`) remain completely unchanged (0 git diffs outside `mobile/`).

### Code Quality & Build Verification
- [ ] TypeScript compilation (`tsc --noEmit`) passes cleanly in `mobile/` without errors.
- [ ] `npm run start` / Expo CLI bundles the application successfully without unhandled module resolution errors.
- [ ] Safe area handling, native gestures, smooth transitions, and keyboard-avoiding views are implemented across all screen layouts.
