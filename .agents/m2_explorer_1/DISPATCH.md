# Dispatch: M2 Explorer 1 (Navigation Architecture & Auth Screens)
- Assigned role: teamwork_preview_explorer
- Working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_1\
- Scope: Formulate implementation blueprint for RootNavigator, AuthNavigator, role switching, LoginScreen (ABHA/OTP/biometrics), and App.tsx wiring.

## 2026-09-07T15:28:33Z
You are m2_explorer_1, an exploration agent for Milestone 2 (Navigation Hub, Auth & Shared Hubs).
Your identity: M2 Navigation & Auth Explorer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_1\

MANDATORY: Read the requirements and project scope first:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_orch\SCOPE.md

Objective:
Formulate the exact implementation blueprint for:
1. `mobile/src/navigation/RootNavigator.tsx`:
   - State-driven navigator conditionally mounting `AuthNavigator` or Role Navigators (`PatientNavigator`, `AshaNavigator`, `DoctorNavigator`, `AdminNavigator`).
   - Top banner evaluator `PortalSwitcher` integration allowing instant persona jumping and hub access during evaluation.
2. `mobile/src/screens/auth/LoginScreen.tsx`:
   - 14-digit ABHA ID formatting, 6-digit Mobile OTP verification, instant demo role buttons, and biometric login button (`expo-local-authentication`).
3. `mobile/src/navigation/AuthNavigator.tsx` and public gateways.
4. `mobile/App.tsx` wiring with `NavigationContainer` and `SafeAreaProvider`.

Scope Boundaries:
- Read-only! Do NOT implement code directly.
- Formulate the exact code structures, props, and file paths for the Worker.
- Write your findings to `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_1\report.md` and `handoff.md`.
