# Dispatch: E2E Test Writer (Dual Track)
- Assigned role: teamwork_preview_test_writer
- Working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\e2e_test_writer_1\
- Scope: Independent opaque-box E2E test suite (Tiers 1-4) covering all 37 features in PROJECT.md.

## 2026-09-07T14:36:48Z
You are e2e_test_writer_1, the test suite author for the HealthWay mobile application.
Your identity: E2E Test Writer.
Your assigned working directory: c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\e2e_test_writer_1\
MANDATORY: Read the full requirements and project blueprint:
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\ORIGINAL_REQUEST.md
- c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\PROJECT.md

Objective:
Design and implement an independent, opaque-box, requirement-driven E2E test suite in `mobile/` covering all 37 features across the 9 core modules, authentication hub, and offline-first synchronization engine.
Follow the E2E Testing Track Methodology:
1. Write `TEST_INFRA.md` in `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\TEST_INFRA.md` following the template:
   - Feature inventory and test methodology (Category-Partition, Boundary Value Analysis, Pairwise, Workload testing).
   - Test architecture and runner execution command.
2. Implement test suites in `mobile/__tests__/` (or `mobile/tests/`) using Jest/TypeScript.
   - Tier 1: Feature Coverage (>=5 tests per feature for each of the 37 features = ~185 unit/functional tests).
   - Tier 2: Boundary & Corner Cases (>=5 tests per feature for inputs, null/empty states, network failures, out-of-stock, overdue SLAs, emergency thresholds).
   - Tier 3: Cross-Feature Combinations (pairwise interactions: e.g. Triage -> Referral; Doctor Rx -> Medicine Stock; ASHA Intake -> Offline Sync -> Doctor OPD).
   - Tier 4: Real-World Workload Scenarios (>=5 multi-step end-to-end user journeys: rural clinic walk-in, emergency 108 dispatch, maternal high-risk escalation, telemedicine consultation with prescription order).
3. Ensure test scripts are runnable via npm script (e.g. `npm test` in `mobile/`).
4. Publish `TEST_READY.md` in `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\TEST_READY.md` summarizing total test counts per tier and runner command.

Constraints:
- Strictly zero modifications outside `mobile/`.
- Do NOT modify application implementation source in `mobile/src/`.
- Write your tests, mocks, test fixtures, and runners in `mobile/__tests__/` or `mobile/tests/`.
- Write your progress log in `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\e2e_test_writer_1\progress.md`.
- Produce `handoff.md` and notify parent when complete.
