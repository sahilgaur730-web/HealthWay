# Dispatch: M2 Explorer 2 (Diagnostics, Referrals & Medicines Hubs)
- Assigned role: teamwork_preview_explorer
- Working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_2\
- Scope: Formulate implementation blueprint for DiagnosticsHubScreen, ReferralsHubScreen, MedicineHubScreen, and mock datasets.

## 2026-09-07T15:28:33Z
You are m2_explorer_2, an exploration agent for Milestone 2 (Navigation Hub, Auth & Shared Hubs).
Your identity: M2 Clinical Hubs Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_2\

MANDATORY: Read the requirements and project scope first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_orch\SCOPE.md

Objective:
Formulate the exact implementation blueprint for:
1. `mobile/src/screens/hubs/DiagnosticsHubScreen.tsx`:
   - 48-test searchable directory with category tabs (Hematology, Biochemistry, Microbiology, Radiology, Pathology).
   - 4-stage sample tracking (`ORDERED`, `SAMPLE_COLLECTED`, `ANALYZING`, `RESULT_READY`) with `MH-LAB-XXXXXX` barcodes.
   - Lab report modal/viewer with normal/critical parameter flags and PDF download/share action (`expo-print`/`expo-sharing`).
2. `mobile/src/screens/hubs/ReferralsHubScreen.tsx`:
   - 7-stage pipeline tracking (`CREATED` -> `ACCEPTED` -> `IN_TRANSIT` -> `ARRIVED` -> `UNDER_TREATMENT` -> `DISCHARGED` -> `COMPLETED`).
   - SLA urgency tiers (`IMMEDIATE` <= 2h, `URGENT` <= 24h, `PRIORITY` <= 72h, `ROUTINE` <= 7d) with countdown badges and overdue alerts.
   - Closed-loop counter-referral feedback cards.
3. `mobile/src/screens/hubs/MedicineHubScreen.tsx`:
   - Searchable Essential Drug List (EDL) catalog with real-time stock levels across PHCs/CHCs.
   - Stock status indicators (`ADEQUATE`, `LOW`, `CRITICAL`, `OUT_OF_STOCK`).
   - Active salt generic substitution engine and warehouse reorder indent form.
4. Mock datasets in `mobile/src/data/` (EDL drugs, diagnostic catalog, facility transfers).

Scope Boundaries:
- Read-only! Do NOT implement code directly.
- Formulate the exact code structures and interfaces for the Worker.
- Write your findings to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_2\report.md` and `handoff.md`.
