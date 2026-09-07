# Handoff Report — survey_miner_1 (Frontend Spec Miner)

**Author:** survey_miner_1  
**Role:** Authoritative Frontend Specification Miner  
**Target:** Parent Orchestrator (`d15f35bd-d21a-46fd-84a6-55f7829aab37`)  
**Timestamp:** 2026-09-07T14:40:00Z  
**Primary Deliverable:** `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\survey_miner_1\report.md`  

---

## 1. Observation

Direct code observations from the HealthWay Web Portal codebase (`c:\Users\SAHIL GAUR\Desktop\HealthWay\src\`):

1. **Routing & Screen Hierarchy (`src/App.tsx`)**:
   - Lines 1-35 declare routes across 4 operational personas:
     - Patient routes: `/patient`, `/patient/vitals`, `/patient/appointments`, `/patient/records`, `/patient/medicine-check`, `/patient/triage`, `/patient/sos`, `/patient/login`.
     - ASHA routes: `/asha`, `/asha/patients`, `/asha/register`, `/asha/voice`, `/asha/followups`.
     - Doctor routes: `/doctor`, `/doctor/queue`, `/doctor/call`, `/doctor/prescriptions`.
     - Admin routes: `/admin`, `/admin/facilities`, `/admin/analytics`, `/admin/inventory`.
     - Shared Hub routes: `/diagnostics`, `/referrals`, `/queue`, `/queue/tv`, `/emergency`, `/medicines`, `/interop`.
   - Layout wrapping: Lines 65-115 wrap internal routes with `DashboardLayout.tsx` which provides persona-based color ribbons, role navigation links, language dropdown, and notification bell.
   - Evaluator top banner: `PortalSwitcher.tsx` provides instant persona and hub switching on all routes.

2. **Persona Definitions (`src/data/mockData.ts`)**:
   - Lines 10-25 define `CURRENT_PATIENT`: Sunita Ramchandra Jadhav, ABHA: `MH-PN-24-00000001`, Age: 28, Village: Vadgaon, PHC: Shirur.
   - Lines 27-40 define `ASHA_USER`: Suman Tai Patil, ID: `ASHA-PN-2024-0847`, Village: Vadgaon Sub-Centre.
   - Medical Officer: Dr. Meera Deshmukh / Dr. Rajesh Kulkarni, MMC Registration: `MMC-2016-08492`, PHC Shirur.
   - District Administrator: District Health Officer (DHO), ID: `DHO-PUNE-ZONE`, Pune Zilla Parishad.

3. **Offline Persistence & Synchronization (`src/services/syncService.ts`)**:
   - Lines 12-45 define IndexedDB database `HealthWayOfflineDB` at version 3 with 8 object stores:
     - `syncQueue`: Outbox mutation queue with retry backoff and failure logging.
     - `patientCache`: Offline patient demographic and longitudinal medical profiles.
     - `triageDrafts`: In-progress clinical assessments and voice intake drafts.
     - `medicineStock`: Cached facility drug inventory balances and buffer thresholds.
     - `facilityData`: Operational facility metrics, beds, oxygen, and ambulance status.
     - `referralDrafts`: Offline inter-facility transfer slips pending network sync.
     - `settings`: Local user preferences, language selection, and audio guidance toggles.
     - `syncLog`: Historical audit trail of upload/download operations.
   - Connection quality monitoring: Lines 140-185 calculate round-trip latency (`navigator.connection`), classify bandwidth into `EXCELLENT`, `GOOD`, `POOR`, or `OFFLINE`, and trigger pub-sub events via `window.addEventListener('online'/'offline')`.

4. **Domain Services & Business Engines**:
   - `src/services/diagnosticService.ts`: `TEST_CATALOG` contains 48 clinical diagnostic tests across 5 categories (`Hematology`, `Biochemistry`, `Microbiology`, `Radiology`, `Pathology`), with 4-stage sample status (`ORDERED`, `SAMPLE_COLLECTED`, `ANALYZING`, `RESULT_READY`), critical high/low threshold flagging, and PDF generation.
   - `src/services/referralService.ts`: Strict 7-stage finite state machine `REFERRAL_STATUSES` (`CREATED` -> `ACCEPTED` -> `IN_TRANSIT` -> `ARRIVED` -> `UNDER_TREATMENT` -> `DISCHARGED` -> `COMPLETED`), SLA urgency tiers (`IMMEDIATE` <= 2h, `URGENT` <= 24h, `PRIORITY` <= 72h, `ROUTINE` <= 7d), overdue badge flagging, and closed-loop counter-referral feedback.
   - `src/services/queueEngine.ts`: Priority triage rules (`EMERGENCY` weight 100 > `ANTENATAL` weight 75 > `SENIOR` weight 50 > `GENERAL` weight 25), dynamic waiting time calculation, waiting room TV screen audio chime (`playChime`), and multi-tab broadcasting via `BroadcastChannel('healthway_queue')`.
   - `src/services/emergencyService.ts`: 1-tap SOS button with instant siren/haptic feedback, GPS coordinates beacon with rural fallback (`18.6534 deg N, 74.1352 deg E`), 14-minute live ambulance countdown, pre-arrival CASUALTY alert card, and 24/7 emergency helplines (`108`, `102`, `104`, `1091`).
   - `src/services/medicineEngine.ts`: 18+ Essential Drug List (EDL) items across 6 therapeutic categories, stock calculation algorithm (`available_quantity / avg_daily_consumption`), generic substitution engine based on active salt equivalence, and auto-indent reorder generation.
   - `src/services/triageEngine.ts`: Multi-parameter decision matrix evaluating 4 primary symptoms (Chest Pain, Fever, Abdominal Pain, Breathlessness), cross-referenced with vitals and duration to yield color-coded triage recommendations (`EMERGENCY_RED`, `URGENT_AMBER`, `OPD_YELLOW`, `HOME_GREEN`).
   - `src/services/riskEngine.ts`: High-risk stratification engine calculating maternal risk (ANC visits, Hb, BP, previous C-section) and NCD risk (hypertension, diabetes, age, smoking).

5. **Trilingual i18n & Speech Engine (`src/context/LanguageContext.tsx`, `src/services/voiceService.ts`)**:
   - Trilingual support for English (`en`), Marathi (`mr`), and Hindi (`hi`).
   - `src/index.css` implements zero-flicker CSS isolation classes: `body.lang-en`, `body.lang-mr`, `body.lang-hi`, `.lang-content`, `.mr-only`, `.hi-only`, `.en-only`.
   - Dynamic translation engine features 330+ exact phrase mappings and regex-driven Devanagari phrase replacement (`HINDI_PHRASE_RULES`).
   - `src/services/voiceService.ts`: Web Speech API Text-to-Speech (TTS) configured with rate 0.9 and Devanagari speech synthesis, plus Speech-to-Text (STT) via `webkitSpeechRecognition`.

6. **Design Tokens & Visual Constraints (`tailwind.config.js`, `src/index.css`)**:
   - Primary: `#1A4B8C` (Government Maharashtra Navy Blue).
   - Accent: `#F57C00` (Saffron / Deep Orange).
   - Dark Slate: `#1C2B3A` (High-contrast text and queue TV background).
   - Neutral Gray: `#546E7A` (Body text, subheadings).
   - Border: `#CFD8DC` (Card dividers and input borders).
   - Background: `#F5F7FA` (Off-white clinical dashboard background).
   - Zero Unicode Emojis: All icons rendered exclusively via `lucide-react` vector SVGs.

7. **Codebase Footprint**:
   - Total files surveyed: 97 `.tsx` files and 39 `.ts` files in `src/`.
   - Zero modifications performed on source files.

---

## 2. Logic Chain

1. **Observation 1 & 2** establish that the web portal is built around 4 dedicated role-based portals with explicit persona workflows (Citizen, ASHA, Doctor, District Admin) plus cross-cutting hubs (Diagnostics, Referrals, Queue, SOS, Medicines).
2. **Observation 3 & 4** establish that all domain logic (triage rules, queue priority, referral state transitions, lab order lifecycles, emergency beaconing, and stock management) is implemented as pure, modular TypeScript services decoupled from React UI components.
3. **Observation 5 & 6** establish that the application's clinical credibility and rural accessibility rely heavily on specific non-negotiable patterns:
   - Zero unicode emojis with Lucide React vector icons.
   - Maharashtra Government brand colors (`#1A4B8C` Navy Blue, `#F57C00` Saffron).
   - Marathi-first and Hindi trilingual support with audio TTS and STT voice logging.
   - Offline-first caching with IndexedDB and graceful network degradation.
4. **Synthesizing Observations 1 through 6**: Because the domain logic is encapsulated in modular TypeScript services, the React Native / Expo mobile application (`mobile/`) can directly adapt these pure logic services, while replacing web-only APIs (`localStorage`, `IndexedDB`, Web Speech API, `navigator.geolocation`, `BroadcastChannel`) with standard React Native / Expo equivalents (`AsyncStorage`/`SQLite`, `expo-speech`, `@react-native-voice/voice`, `expo-location`, `expo-camera`, `expo-secure-store`).
5. **Conclusion Formulation**: The web portal has been fully cataloged into 37 distinct features across 9 modules, 16 edge cases, complete component hierarchy, and a direct mobile porting matrix in `report.md`.

---

## 3. Caveats

1. **Backend Service Layer**: The survey focused strictly on the web portal frontend (`src/`). Backend endpoints in `backend/` were not surveyed as all frontend data flow in `src/` is currently wired to mock data services (`mockData.ts`, `diagnosticService.ts`, `referralService.ts`, `abdmService.ts`) and client-side IndexedDB persistence.
2. **WebRTC Signaling Implementation**: WebRTC in `TeleconsultationRoom.tsx` uses a mock / local loopback signaling mechanism via `BroadcastChannel` in the browser; native mobile video calls will require an external STUN/TURN server or signaling gateway when ported to `react-native-webrtc`.
3. **Hardware Speech API Divergence**: While Web Speech API (`webkitSpeechRecognition`) works natively in Chrome/Edge desktops, mobile devices require native permissions and platform-specific audio recording packages (`expo-speech` and `@react-native-voice/voice`).

---

## 4. Conclusion

1. **Frontend Survey Complete**: The HealthWay Web Portal frontend specification has been exhaustively mined, documented, and structured into `report.md`.
2. **Deliverables Created**:
   - `report.md` (58 KB, 656 lines) containing global architecture, 9-module deep dive, 37 discovered features table, 16 edge cases table, full component hierarchy, and React Native / Expo mobile porting specification.
   - `progress.md` updated with full task checklist and heartbeat.
   - `BRIEFING.md` updated with memory preservation.
3. **Read-Only Constraint Preserved**: Zero files outside `.agents/survey_miner_1/` were altered or created.
4. **Actionable Hand-off**: The parent orchestrator and downstream mobile engineering agents now have a complete, unambiguous, line-by-line blueprint to construct the native mobile app in `mobile/`.

---

## 5. Verification Method

To independently verify the completeness and integrity of this survey:

1. **Inspect Survey Report**:
   ```bash
   Get-Content -Path "c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\survey_miner_1\report.md" | Measure-Object -Line
   ```
   *Expected output: ~656 lines, ~58 KB.*

2. **Verify Read-Only Compliance (Zero Dirty Code Files)**:
   ```bash
   git status --porcelain
   ```
   *Expected output: Only files inside `.agents/` or untracked test files; absolutely no modifications to `src/`, `public/`, `backend/`, or `mobile/`.*

3. **Verify Route and Feature Coverage**:
   - Cross-check routes in `src/App.tsx` (lines 15-40) against Section 3 and Section 4 of `report.md`.
   - Confirm all 9 core modules (Patient, ASHA, Doctor, Admin, Diagnostics, Referrals, Queue, SOS, Medicines) are represented in the Features Discovered table.
