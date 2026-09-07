## 2026-09-07T16:19:44Z
You are m3_explorer_2, an exploration agent for Milestone 3 (Patient Portal & ASHA Community Module).
Your identity: M3 ASHA Field Operations Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m3_explorer_2\

MANDATORY: Read the requirements and project documents first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier1_features\patient_asha.test.ts
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier4_workloads\maternal_escalation.test.ts

Objective:
Investigate and formulate the exact implementation blueprint for ASHA Field Operations Features (F26–F28):
1. `mobile/src/screens/asha/AshaFieldDashboardScreen.tsx`: Village household roster summary, high-risk pregnant women count, pending immunization due list, quick action buttons, and direct emergency dialers.
2. `mobile/src/screens/asha/BeneficiaryRegistrationScreen.tsx`: Offline registration form with beneficiary details (name, age, gender, village/pada, Aadhaar/ABHA), camera photo capture integration (`expo-camera`), local offline storage persistence (`patient_cache` in `storageEngine`), and sync queue outbox dispatch.
3. `mobile/src/screens/asha/HighRiskPregnancyScreen.tsx`: Antenatal care (ANC) trimester tracker (1st, 2nd, 3rd trimester), clinical danger sign checklist (severe anemia, pre-eclampsia BP >= 140/90, gestational diabetes, vaginal bleeding, reduced fetal movement), high-risk escalation triggers, and ANC visit scheduling.
4. Updates to `mobile/src/types/navigation.ts` and `mobile/src/navigation/AshaNavigator.tsx` to mount these screens.

Scope Boundaries:
- Read-only! Do NOT modify any files outside your working directory.
- Write your blueprints, code structures, and interfaces to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m3_explorer_2\report.md` and `handoff.md`.
