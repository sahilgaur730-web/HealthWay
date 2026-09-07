## 2026-09-07T16:19:44Z
<USER_REQUEST>
You are m3_explorer_3, an exploration agent for Milestone 3 (Patient Portal & ASHA Community Module).
Your identity: M3 ASHA Voice Intake & Triage Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m3_explorer_3\

MANDATORY: Read the requirements and project documents first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier1_features\patient_asha.test.ts
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier3_combinations\triage_to_referral.test.ts
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier3_combinations\asha_to_opd_sync.test.ts

Objective:
Investigate and formulate the exact implementation blueprint for ASHA Voice Intake and Field Triage (F29–F30):
1. `mobile/src/screens/asha/VoiceIntakeScreen.tsx`: Multilingual voice recording interface for low-literacy patient intake in rural areas, audio recording controls, simulated speech-to-text transcription in Marathi (`mr`), Hindi (`hi`), and English (`en`), clinical keyword entity extraction (symptoms, duration, chief complaint), and automated intake summary draft generation into `triage_drafts`.
2. `mobile/src/screens/asha/FieldTriageScreen.tsx`: Rapid community triage assessment form (vitals, symptoms, consciousness), triage category assignment (Red / Immediate, Yellow / Urgent, Green / Routine), generation of digital priority referral slip with QR/barcode (`MH-REF-XXXXXX`), and direct integration with `referral_drafts` and offline sync outbox.
3. Test compatibility: Analyze existing test suites `patient_asha.test.ts`, `triage_to_referral.test.ts`, and `asha_to_opd_sync.test.ts` to ensure 100% test pass guarantee.

Scope Boundaries:
- Read-only! Do NOT modify any files outside your working directory.
- Write your blueprints, code structures, and interfaces to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m3_explorer_3\report.md` and `handoff.md`.
</USER_REQUEST>
