# Scope: Milestone 2 — Navigation Hub, Authentication & Shared Operational Hubs

## Objective
Implement role-based navigation, ABHA authentication, and the shared cross-cutting hubs in `mobile/src/`:
1. **Navigation Architecture (`mobile/src/navigation/`)**:
   - `RootNavigator.tsx`: Coordinates between `AuthNavigator`, `PatientNavigator`, `AshaNavigator`, `DoctorNavigator`, `AdminNavigator`, and evaluator `PortalSwitcher`.
   - `AuthNavigator.tsx`: Screens for Public Gateway, Role Selector, and ABHA Login.
   - Screen wrappers ensuring `SafeAreaProvider` and safe area insets.
2. **Authentication Screens (`mobile/src/screens/auth/`)**:
   - `LoginScreen.tsx`: ABHA 14-digit ID input, 6-digit OTP verification, saved biometric login button, instant role switcher for evaluator demo testing.
   - `RoleSelectionScreen.tsx`: Direct role switcher gateway.
3. **Diagnostics Hub (`mobile/src/screens/hubs/DiagnosticsHubScreen.tsx`)**:
   - 48-test searchable directory with category filters (Hematology, Biochemistry, Microbiology, Radiology, Pathology).
   - Sample collection tracker with 4 stages (`ORDERED`, `SAMPLE_COLLECTED`, `ANALYZING`, `RESULT_READY`) and `MH-LAB-XXXXXX` barcodes.
   - Lab report modal/viewer with normal/critical parameter flags and PDF download simulation (`expo-print`/`expo-sharing`).
4. **Referrals Hub (`mobile/src/screens/hubs/ReferralsHubScreen.tsx`)**:
   - 7-stage pipeline tracking (`CREATED` -> `ACCEPTED` -> `IN_TRANSIT` -> `ARRIVED` -> `UNDER_TREATMENT` -> `DISCHARGED` -> `COMPLETED`).
   - Urgency badges (`IMMEDIATE` <= 2h, `URGENT` <= 24h, `PRIORITY` <= 72h, `ROUTINE` <= 7d) with SLA countdown timers and overdue indicators.
   - Closed-loop counter-referral feedback view.
5. **Queue Management Hub (`mobile/src/screens/hubs/QueueHubScreen.tsx`)**:
   - Live department queue list with priority weights (Emergency: 100, Antenatal: 75, Senior: 50, General: 25).
   - Dynamic estimated wait time calculation.
   - Waiting Room TV Screen mode (`QueueTVScreen.tsx`) with high-contrast dark slate (`#1C2B3A`), large token callout, and audio announcement chime.
6. **Medicine Availability Hub (`mobile/src/screens/hubs/MedicineHubScreen.tsx`)**:
   - Searchable Essential Drug List (EDL) catalog with real-time stock levels across PHCs/CHCs.
   - Stock status badges (`ADEQUATE`, `LOW`, `CRITICAL`, `OUT_OF_STOCK`).
   - Active salt generic substitution engine and auto-indent requisition.
7. **Emergency SOS Hub (`mobile/src/screens/hubs/EmergencySOSScreen.tsx`)**:
   - 1-Tap SOS dispatch with instant visual/siren feedback.
   - GPS coordinate beacon with fallback coordinates (`18.6534° N, 74.1352° E`).
   - Live 14-minute ALS ambulance telemetry countdown tracking 5 states (`DISPATCHED` -> `EN_ROUTE` -> `ON_SCENE` -> `TRANSPORTING` -> `ARRIVED`).
   - Pre-arrival hospital casualty alert card and 24/7 helplines (`108`, `102`, `104`, `1091`).

## Code Layout Ownership
- `mobile/src/navigation/**`
- `mobile/src/screens/auth/**`
- `mobile/src/screens/hubs/**`
- `mobile/src/data/**` (EDL catalog, diagnostic test catalog, mock facilities, queue mock seed)
- `mobile/App.tsx` (wire RootNavigator)

## Verification Criteria
- `npx tsc --noEmit` exits with 0 errors.
- `npx expo-doctor` passes all 21/21 checks.
- All 19 test suites and 479 tests pass cleanly via `npm test`.
- All 5 hubs (Diagnostics, Referrals, Queue, Medicines, Emergency) and Auth/Nav screens are fully functional and navigable.
