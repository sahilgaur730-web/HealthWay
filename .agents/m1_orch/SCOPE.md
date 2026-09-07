# Scope: Milestone 1 — Mobile Core Architecture & Foundation

## Objective
Establish the foundational production architecture of the HealthWay mobile application in `mobile/`:
1. Dependencies: Install Expo SDK 57 compatible packages (`npx expo install` for navigation, icons, storage, native APIs).
2. Configuration: Update `app.json` (bundle identifier `com.healthway.mobile`, scheme `healthway`, native permissions), `tsconfig.json` (path aliases `@/*`), and `package.json` (`"typecheck": "tsc --noEmit"`).
3. Core Layout & Types: Create `mobile/src/types/` containing domain interfaces (Patient, Vitals, Referral, QueueToken, Emergency, Medicine, LabTest).
4. Theme System: Create `mobile/src/theme/` with Maharashtra Gov color palette (`#1A4B8C` Navy Blue, `#F57C00` Saffron, `#1C2B3A` Dark Slate), spacing, typography, and card/button styles. Zero Unicode emojis (all icons use `@expo/vector-icons`).
5. Trilingual i18n: Create `mobile/src/context/LanguageContext.tsx` supporting English, Marathi, Hindi with phrase dictionaries and audio hooks.
6. Offline Storage: Create `mobile/src/storage/` implementing the 8-store storage engine (`sync_queue`, `patient_cache`, `triage_drafts`, `medicine_stock`, `facility_data`, `referral_drafts`, `settings`, `sync_log`) with AsyncStorage / SQLite.
7. Sync Engine: Create `mobile/src/services/syncEngine.ts` with connection quality observer, exponential backoff, and outbox synchronization.
8. Secure Session & Auth: Create `mobile/src/context/AuthContext.tsx` with role switching (Patient, ASHA, Doctor, Admin) and `expo-secure-store` token persistence.
9. Shared UI Components: Create `mobile/src/components/` (Header, Button, Card, Badge, Modal, FormInput, EmptyState, PortalSwitcher).

## Code Layout Ownership
- `mobile/package.json`
- `mobile/app.json`
- `mobile/tsconfig.json`
- `mobile/App.tsx`
- `mobile/src/theme/**`
- `mobile/src/types/**`
- `mobile/src/context/**`
- `mobile/src/storage/**`
- `mobile/src/services/syncEngine.ts`
- `mobile/src/components/**`

## Verification Criteria
- `npx tsc --noEmit` in `mobile/` exits with 0 errors.
- `npx expo-doctor` in `mobile/` passes all checks.
- All core modules (theme, i18n, storage, auth, shared components) export clean TypeScript APIs matching `PROJECT.md § Interface Contracts`.
