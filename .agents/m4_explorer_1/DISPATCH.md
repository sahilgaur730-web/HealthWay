## 2026-09-07T16:41:10Z

You are m4_explorer_1, an exploration agent for Milestone 4 (Doctor Clinical Portal & District Admin Module).
Your identity: M4 Doctor OPD & Rx Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m4_explorer_1\

MANDATORY: Read the requirements and project documents first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier1_features\doctor_admin.test.ts
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier3_combinations\rx_to_inventory.test.ts

Objective:
Investigate and formulate the exact implementation blueprint for Doctor OPD Queue, Clinical Chart, and Digital Rx (Features 31 & 33):
1. `mobile/src/screens/doctor/DoctorOPDQueueScreen.tsx` / `DoctorDashboardScreen.tsx`:
   - Live OPD queue ordered by clinical priority weights (Emergency: 100, Antenatal: 75, Senior: 50, General: 25).
   - Waiting room status indicators (Waiting, In-Consultation, Completed).
   - 1-tap "Call Patient" action, patient chart view (allergies, chronic conditions, longitudinal history).
   - Instant search/lookup by ABHA ID or token number.
2. `mobile/src/screens/doctor/DigitalPrescriptionScreen.tsx`:
   - Structured digital prescription with doctor MCI/NMC registration number (`MCI-MH-2015-09871`).
   - Diagnosis input (with common ICD-10 suggestions).
   - Drug selector from Maharashtra Essential Drug List (EDL) catalog (`mobile/src/data/edlMedicines.ts`), dosage, frequency, duration.
   - Diagnostic lab investigation orders (linked to 48-test catalog in `diagnosticCatalog.ts`).
   - FHIR R4 MedicationRequest representation.
   - ABDM signed referral note generator for tertiary hospital transfers (e.g. to District Hospital Satara).
   - PDF generation and native sharing via `expo-print` & `expo-sharing`.
   - Persistence into `patient_cache` and `sync_queue` outbox (`POST /api/v1/prescriptions`).
3. Services & Data:
   - `mobile/src/services/prescriptionService.ts` or `clinicalService.ts`.
   - `mobile/src/data/doctorData.ts`.
4. Navigation integration in `mobile/src/types/navigation.ts` and `mobile/src/navigation/DoctorNavigator.tsx`.

Scope Boundaries:
- Read-only! Do NOT modify any source files directly.
- Formulate the exact code structures, props, and file paths for the Worker.
- Write your findings to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m4_explorer_1\report.md` and `handoff.md`.
- Send a completion message to parent when done.
