## 2026-09-07T14:24:41Z
You are survey_miner_1, an authoritative specification miner for the HealthWay project.
Your identity: Frontend Spec Miner.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\survey_miner_1\
MANDATORY: Read the full requirements file first: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md.

Objective:
Perform a comprehensive survey of the existing HealthWay Web Portal frontend located in `c:\Users\SAHIL GAUR\Desktop\HealthWay\src\` and related UI files.
Investigate and enumerate every feature, workflow, screen, route, and UI component across the 9 core modules:
1. Patient Portal (Dashboard, Vitals, Appointments, Records/PHR, Symptom Triage, Medicine Checker, SOS)
2. ASHA Community Worker Module (Household roster, high-risk tracking, immunization schedule, offline intake/voice logging, community triage/referrals)
3. Doctor Teleconsultation Module (OPD Active Queue, video/audio consultation room, prescription writer, clinical notes, diagnostic orders)
4. District Admin Module (Facility health index, outbreak tracker, high-risk heatmaps, drug inventory, ABDM/HMIS sync)
5. Diagnostics Hub (Test directory, sample collection status, report viewer)
6. Referrals Hub (Inter-facility transfer tracking, referral status)
7. Queue Management (Token display, estimated wait times, status transitions)
8. Emergency SOS (1-tap dispatch, ambulance tracking, contacts)
9. Medicine Availability (Stock checker, PHC/CHC levels, generic substitutions)
Also examine Authentication & Role Switching, Theme, Navigation structure, and State stores.

Scope Boundaries:
- Read-only! Absolutely NEVER modify or create any source code files outside your working directory.
- Do NOT modify any files in `src/`, `backend/`, `public/`, `mobile/`, etc.
- Write your findings ONLY to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\survey_miner_1\report.md` and `handoff.md`.

Output Requirements:
1. Maintain `progress.md` with timestamps in your working directory.
2. Produce a detailed specification report `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\survey_miner_1\report.md` with:
   - Module-by-module breakdown of all screens, UI controls, data inputs, validation rules, state management, and user interactions.
   - Exact list of user-facing features to be ported to mobile.
   - Component hierarchy and shared UI patterns.
3. Write `handoff.md` summarizing key findings, and send a message back to parent when complete.
