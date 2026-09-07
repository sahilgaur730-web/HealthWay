## 2026-09-07T16:41:10Z

You are m4_explorer_3, an exploration agent for Milestone 4 (Doctor Clinical Portal & District Admin Module).
Your identity: M4 District Admin Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m4_explorer_3\

MANDATORY: Read the requirements and project documents first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier1_features\doctor_admin.test.ts
- c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile\__tests__\tier4_workloads\outbreak_response.test.ts

Objective:
Investigate and formulate the exact implementation blueprint for District Admin Features (Features 34, 35, 36, 37):
1. `mobile/src/screens/admin/AdminDistrictOverviewScreen.tsx` (F34):
   - Key district health metrics & KPIs (Total Daily OPD, Active Teleconsults, Emergency Dispatches 24h, Critical Referrals 24h).
   - Facility performance index across all 7 certified facilities (`FAC001`–`FAC007`).
   - Bed occupancy computation (`(occupiedBeds / totalBeds) * 100`) and health index percentage.
   - Taluka / Block filters (Satara, Karad, Wai, Mahabaleshwar, Jawali).
   - 1-tap direct phone call action (`tel:...`) to doctor-in-charge.
2. `mobile/src/screens/admin/AdminOutbreakTrackerScreen.tsx` (F35):
   - Vector-borne and epidemic disease monitoring (Dengue, Malaria, Cholera, Leptospirosis).
   - Dynamic severity tiers: `WATCH` (<20 cases), `ALERT` (>=20 cases), `CRITICAL_EPIDEMIC` (>=50 cases).
   - Geographic coordinates map/list for heatmap representation across Satara talukas.
   - Emergency containment mobilization action (rapid test kits, fever clinics dispatch).
   - Trilingual ASHA outbreak advisory broadcast alert.
3. `mobile/src/screens/admin/AdminDrugInventoryScreen.tsx` (F36):
   - Consolidated stock count across 18+ EDL medications.
   - Critical stockout identification (`OUT_OF_STOCK`, `CRITICAL`, `LOW`, `ADEQUATE`).
   - Central warehouse indent requisition form (`IND-WH-2026-XXXX`, CMSO Pune).
   - Daily consumption rate and days of remaining supply calculation (`stock / dailyConsumption`).
   - Pharmaceutical batch numbers and expiry date warnings (<90 days).
4. `mobile/src/screens/admin/AdminInteropMonitorScreen.tsx` (F37):
   - Real-time monitor for 7 national/state health platforms (`ABDM`, `NHM`, `HMIS`, `MCTS`, `NIKSHAY`, `COWIN`, `NCD`).
   - Heartbeat latency (ms), status (`ONLINE`, `DEGRADED`, `OFFLINE`), and uptime percentage.
   - ABDM M1/M2/M3 certification status.
   - HMIS Monthly Indicator (Forms 1–12) submission status.
   - Gateway outage alert notification and manual "Sync Now" trigger.
5. Services & Data:
   - `mobile/src/services/adminAnalyticsService.ts` or `adminData.ts`.
6. Navigation integration in `mobile/src/navigation/AdminNavigator.tsx`.

Scope Boundaries:
- Read-only! Do NOT modify any source files directly.
- Formulate the exact code structures, props, and file paths for the Worker.
- Write your findings to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m4_explorer_3\report.md` and `handoff.md`.
- Send a completion message to parent when done.
