## 2026-09-07T15:28:33Z
You are m2_explorer_3, an exploration agent for Milestone 2 (Navigation Hub, Auth & Shared Hubs).
Your identity: M2 Queue & Emergency Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_3\

MANDATORY: Read the requirements and project scope first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_orch\SCOPE.md

Objective:
Formulate the exact implementation blueprint for:
1. `mobile/src/screens/hubs/QueueHubScreen.tsx`:
   - Department token list with priority weights (Emergency: 100, Antenatal: 75, Senior: 50, General: 25).
   - Dynamic estimated wait time calculation.
   - Department filters and token status transitions (`WAITING`, `IN_CONSULTATION`, `COMPLETED`).
2. `mobile/src/screens/hubs/QueueTVScreen.tsx`:
   - High-contrast dark slate (`#1C2B3A`) waiting room display with huge typography for token callout.
   - Now Serving, Next in Line, and audio chime / speech callout (`expo-speech`).
3. `mobile/src/screens/hubs/EmergencySOSScreen.tsx`:
   - 1-Tap SOS dispatch button with immediate visual siren feedback.
   - GPS coordinate beacon with rural fallback (`18.6534° N, 74.1352° E`).
   - 14-minute live ALS ambulance countdown with 5-stage status telemetry (`DISPATCHED` -> `EN_ROUTE` -> `ON_SCENE` -> `TRANSPORTING` -> `ARRIVED`).
   - Pre-arrival hospital casualty alert card and direct-call emergency helplines (`108`, `102`, `104`, `1091`).

Scope Boundaries:
- Read-only! Do NOT implement code directly.
- Formulate the exact code structures and interfaces for the Worker.
- Write your findings to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_3\report.md` and `handoff.md`.
