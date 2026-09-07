# HealthWay — Integrated Rural Healthcare Access Platform

[![Government of Maharashtra](https://img.shields.io/badge/Govt%20of%20Maharashtra-Public%20Health%20Dept-0B2545.svg)](https://arogya.maharashtra.gov.in/)
[![National Health Mission](https://img.shields.io/badge/NHM-Maharashtra-1A4B8C.svg)](https://nhm.gov.in/)
[![ABDM Certified](https://img.shields.io/badge/ABDM-M1%20%7C%20M2%20%7C%20M3-10B981.svg)](https://abdm.gov.in/)
[![FHIR R4 Compliant](https://img.shields.io/badge/FHIR-R4%20Standard-0284C7.svg)](https://hl7.org/fhir/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An institutional, multilingual digital healthcare ecosystem connecting rural patients, frontline ASHA workers, Primary Health Centres (PHC), Community Health Centres (CHC), and District Tertiary Hospitals across rural Maharashtra.

---

## Key Pillars & Capabilities

1. **Assisted Teleconsultation**: Low-bandwidth video & audio consultation connecting Sub-Centres to PHC Medical Officers with frontline ASHA assistance.
2. **Digital Appointment & Queue Management**: Token generation, real-time waiting times, and digital Queue TV screen (`/queue-display`).
3. **Digital Clinical Triage**: 5-step standardized severity scoring (Emergency RED, Urgent ORANGE, Medium YELLOW, Routine GREEN).
4. **Longitudinal Patient Records (ABHA)**: Universal 14-digit Ayushman Bharat Health Account integration, past visit history, and verified EHR archive.
5. **7-Stage Referral Tracking Pipeline**: Real-time status tracker from PHC referral to 108 ambulance transit and district hospital admission.
6. **Diagnostic Coordination & Lab Hub**: 40+ pathology test orders, nearby empanelled lab locator, and automated NABL report synchronization.
7. **Real-Time Medicine Stock Visibility**: Live inventory tracking across 36 government health facilities with low-stock alerts.
8. **High-Risk Maternal & NCD Cohort Monitoring**: Automated surveillance for pregnant mothers (ANC), hypertension, diabetes, and TB patients.
9. **District Facility Command Center**: Real-time KPIs, staff attendance tracking, and performance grading across 847 health facilities in Pune district.
10. **Low-Connectivity & Offline PWA**: IndexedDB local storage cache with automatic background sync when connectivity is restored.
11. **Trilingual & Voice Assistance**: Native support for **मराठी (Marathi)**, **हिंदी (Hindi)**, and **English**, with Web Speech audio readouts.
12. **108 Emergency Escalation**: 1-Tap SOS dispatch with GPS coordinate transmission.
13. **Pan-India Interoperability (ABDM / FHIR R4 / HMIS)**: Full compliance with NHA standards, DPDP consent management, and monthly NHM reporting.

---

## Tech Stack

- **Frontend Web & PWA**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React, Recharts
- **Mobile Application**: React Native, Expo, TypeScript
- **Backend Services**: Node.js, Express, CommonJS
- **Data & Standards**: HL7 FHIR R4, ABDM Milestones 1-3, IndexedDB, Service Workers

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Clone repository
git clone https://github.com/sahilgaur730-web/HealthWay.git
cd HealthWay

# Install dependencies
npm install

# Run web application locally
npm run dev
```

The web application will be accessible at: `http://localhost:3000/`

### Mobile App (Expo)

```bash
cd mobile
npm install
npx expo start
```

---

## License

This project is licensed under the MIT License.
