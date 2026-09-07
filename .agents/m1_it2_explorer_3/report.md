# M1 Iteration 2 Adversarial Regression Guard & Re-Verification Report

**Agent**: `m1_it2_explorer_3` (M1 Adversarial Regression Guard Explorer)  
**Assigned Working Directory**: `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m1_it2_explorer_3\`  
**Target Milestone**: Milestone 1 (M1) Iteration 2 — Storage & Sync Engine Remediation  
**Target Files**:
- `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`
- `mobile/src/storage/storageEngine.ts`
- `mobile/src/storage/asyncStorageAdapter.ts`
- `mobile/src/storage/sqliteAdapter.ts`
- `mobile/src/storage/types.ts`
- `mobile/src/services/syncEngine.ts`
- `mobile/__tests__/` (16 baseline suites, 412 tests + `m1_empirical_adversarial.test.ts`, 29 tests)

---

## 1. Executive Summary & Verification Strategy

During Milestone 1 Iteration 1, challenger `m1_challenger_1` identified four critical/high architectural defects in the offline storage and sync engine:
1. **DEF-M1-01** (CRITICAL): Infinite Retry Loop caused by unpersisted retry counter when status is `'PENDING'`.
2. **DEF-M1-02** (CRITICAL): Priority Inversion in `AsyncStorageAdapter` where `getPendingSyncItems()` fails to sort emergency items before routine items.
3. **DEF-M1-03** (HIGH): Timer Resource Leak in `SyncEngine.syncOutbox` where `timeoutId` is not cleared in a `finally` block on network rejection.
4. **DEF-M1-04** (MEDIUM): Index Race Condition in `AsyncStorageAdapter.saveItem` where concurrent calls drop store keys from the index.

This report establishes the **complete re-verification plan** for Worker (`m1_worker_1`) to guarantee:
1. **Clean Tier 5 Test Execution**: Resolution of the "defect assertion paradox" in `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts` so that all Tier 5 tests cleanly validate the fixed behavior instead of breaking on defect assertions.
2. **Zero Baseline Regressions**: Absolute stability across all 16 baseline test suites (412 tests) and the companion adversarial suite (29 tests).
3. **Zero Breaking Contract Changes**: 100% compliance with `PROJECT.md § Interface Contracts (2. OfflineStorage)`.
4. **Exact Deterministic Verification Protocol**: Concrete command sequence for the Worker to run and verify code quality.

---

## 2. Analysis of Tier 5 Adversarial Test Suite (`storage_and_sync_stress.test.ts`)

### 2.1 The "Defect Assertion Paradox" & Test Refactoring
In Iteration 1, `m1_challenger_1` proved the defects empirically by writing tests that **asserted the buggy behavior**:
- **Test 14 (`ADV-DEFECT-RETRY-PERSISTENCE`)**: Asserted `expect(storedItem?.retries).toBe(0)`. When DEF-M1-01 is fixed, `storedItem.retries` will be `1`. **If left unchanged, Test 14 will fail!**
- **Test 16 (`ADV-DEFECT-PRIORITY-ORDERING`)**: Asserted `expect(pending[0].id).toBe(routineId)`. When DEF-M1-02 is fixed, `pending[0].id` will be `emergencyId`. **If left unchanged, Test 16 will fail!**
- **Test 8 (`ADV-DEFECT-CONCURRENT-WRITES`)**: Merely logged the dropped indexes without asserting `count === 5` or `all.length === 5`.

Therefore, the Worker MUST update these tests in `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts` to transform them into active regression guards.

### 2.2 Comprehensive Review of All 20 Test Blocks (27 Tests)

| Test # | Test Identifier / Scope | Current Behavior in Test | Impact of Planned Fixes (DEF-M1-01..04) | Required Action in Test File |
|---|---|---|---|---|
| **1-8** | `ADV-CRUD-[store]` (8 stores) | Sequential CRUD, upsert, count, getAll, delete | `withIndexLock` in DEF-M1-04 guarantees serialized index operations. | No change needed; passes cleanly. |
| **9** | `ADV-NORM` | Validates store name canonicalization | Unaffected by storage fixes. | No change needed; passes cleanly. |
| **10** | `ADV-ISOLATION` | Isolated store clearing (`clearStore`) | Index clearing remains isolated per store. | No change needed; passes cleanly. |
| **11** | `ADV-CLEARALL` | Complete wipe of all 8 stores | Keys and index prefixes wiped. | No change needed; passes cleanly. |
| **12** | `ADV-PAYLOADS` | 15-level nesting, Marathi/Hindi unicode, 100KB payload | JSON serialization untouched. | No change needed; passes cleanly. |
| **13** | `ADV-BOUNDARIES` | Non-existent keys, duplicate deletes, empty stores | Handled gracefully without throw. | No change needed; passes cleanly. |
| **14** | `ADV-STRESS-100` | 100 sequential write-read-delete cycles | Serialized index operations pass cleanly. | No change needed; passes cleanly. |
| **15** | `ADV-DEFECT-CONCURRENT-WRITES` | 5 concurrent `saveItem` calls via `Promise.all` | With DEF-M1-04 index lock, all 5 items are indexed without loss. | **Update assertions**: assert `count === 5` and `all.length === 5`. Rename to `ADV-CONCURRENT-WRITES`. |
| **16** | `ADV-SYNC-ENQUEUE` | Enqueue `SYNC-` prefix, status PENDING, retries 0 | Untouched by fixes. | No change needed; passes cleanly. |
| **17** | `ADV-SYNC-STATUS` | Lifecycle transitions (`PROCESSING` -> `FAILED` -> `COMPLETED`) | Calls `updateSyncStatus(id, 'FAILED')` without 4th argument. Fix must increment retries if 4th argument omitted! | **Verify backward compatibility** in adapter code; test passes cleanly. |
| **18** | `ADV-BACKOFF-MATH` | Exponential backoff formula `min(2^r * 500ms, 5000ms)` | Pure math function; unaffected. | No change needed; passes cleanly. |
| **19** | `ADV-COMPRESS` | Low-bandwidth payload compression | Trims whitespace, strips nulls/empty strings; unaffected. | No change needed; passes cleanly. |
| **20** | `ADV-SYNC-REENTRANCY` | Prevents concurrent sync runs and sync while offline | Reentrancy guard in `finally` untouched. | No change needed; passes cleanly. |
| **21** | `ADV-DEFECT-RETRY-PERSISTENCE` | Failing syncOutbox cycle | Asserts `storedItem.retries === 0`. With DEF-M1-01 fixed, retries will be 1! | **Update assertion**: expect `storedItem.retries === 1`. Add multi-cycle check to terminal `FAILED` at retries=5. Rename to `ADV-RETRY-PERSISTENCE`. |
| **22** | `ADV-CLIENT-ERROR` | 4xx unrecoverable error terminates as `FAILED` | With DEF-M1-03 (clearTimeout in finally), continues to pass. | No change needed; passes cleanly. |
| **23** | `ADV-DEFECT-PRIORITY-ORDERING` | Emergency (priority 1) vs Routine (priority 2) | Asserts `pending[0].id === routineId`. With DEF-M1-02 fixed, emergency is first! | **Update assertion**: expect `pending[0].id === emergencyId` across all backends. Rename to `ADV-PRIORITY-ORDERING`. |
| **24** | `ADV-FALLBACK-INIT` | Fallback to `async_storage` when SQLite unavailable | Fallback mechanism preserved. | No change needed; passes cleanly. |
| **25** | `ADV-FALLBACK-IDEMPOTENT` | Repeated initialize() idempotency | State preserved. | No change needed; passes cleanly. |
| **26** | `ADV-SQLITE-ADAPTER` | Direct SQLite mock adapter priority verification | SQLite adapter priority ORDER BY untouched. | No change needed; passes cleanly. |
| **27** | `ADV-UNINITIALIZED` | Accessing uninitialized SQLite adapter throws | Error guard preserved. | No change needed; passes cleanly. |
| **28** | *(NEW)* `ADV-TIMER-CLEANUP` | Fetch rejection timer cleanup | DEF-M1-03 ensures timer is cancelled in `finally`. | **Add new test** verifying `clearTimeout` called on fetch network rejection. |

### 2.3 Concrete Code Edits for Worker in `storage_and_sync_stress.test.ts`

#### Edit 1: Update Test 14 (`ADV-RETRY-PERSISTENCE`)
In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`:
```typescript
<<<< BEFORE:
  // Test 14: Empirical verification of Retry Counter Persistence Defect
  it('ADV-DEFECT-RETRY-PERSISTENCE: demonstrates retry counter persistence defect in sync queue', async () => {
    jest.spyOn(syncEngine, 'calculateBackoff').mockReturnValue(0);

    const item = await storage.enqueueSync('/api/v1/flaky', 'POST', { data: 'critical' });
    expect(item.retries).toBe(0);

    // Execute 1 failing syncOutbox cycle
    await syncEngine.syncOutbox(async () => {
      return false; // Fail
    });

    const storedItem = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(storedItem?.status).toBe('PENDING');

    // EMPIRICALLY CONFIRMED DEFECT:
    // retries remains 0 because updateSyncStatus does not increment retries for 'PENDING'
    expect(storedItem?.retries).toBe(0);
  });
==== AFTER:
  // Test 14: Verified Retry Counter Persistence & Terminal Transition (DEF-M1-01 Fix)
  it('ADV-RETRY-PERSISTENCE: persists retry counter on retryable failure and transitions to FAILED after 5 retries', async () => {
    jest.spyOn(syncEngine, 'calculateBackoff').mockReturnValue(0);

    const item = await storage.enqueueSync('/api/v1/flaky', 'POST', { data: 'critical' });
    expect(item.retries).toBe(0);

    // Execute 1 failing syncOutbox cycle
    await syncEngine.syncOutbox(async () => {
      return false; // Fail
    });

    const storedItem = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(storedItem?.status).toBe('PENDING');
    // DEF-M1-01 Resolved: retries counter is incremented and persisted on PENDING status
    expect(storedItem?.retries).toBe(1);

    // Execute 4 more failing cycles (total 5)
    for (let i = 0; i < 4; i++) {
      await syncEngine.syncOutbox(async () => false);
    }

    // After 5 total attempts, item must be marked terminal FAILED
    const finalItem = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(finalItem?.status).toBe('FAILED');
    expect(finalItem?.retries).toBe(5);
  });
>>>>
```

#### Edit 2: Update Test 16 (`ADV-PRIORITY-ORDERING`)
In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`:
```typescript
<<<< BEFORE:
  // Test 16: Empirical Challenge on Priority Ordering (Emergency First)
  it('ADV-DEFECT-PRIORITY-ORDERING: demonstrates missing priority sorting in AsyncStorageAdapter', async () => {
    // Enqueue a standard/routine item (priority 2) first
    const routineId = 'SYNC-ROUTINE-001';
    await storage.saveItem('sync_queue', routineId, {
      id: routineId,
      endpoint: '/api/v1/routine-vitals',
      method: 'POST',
      payload: { bp: '120/80' },
      timestamp: 1000,
      retries: 0,
      status: 'PENDING',
      priority: 2, // Standard
    });

    // Enqueue an emergency SOS item (priority 1) second
    const emergencyId = 'SYNC-EMERGENCY-001';
    await storage.saveItem('sync_queue', emergencyId, {
      id: emergencyId,
      endpoint: '/api/v1/emergency-sos',
      method: 'POST',
      payload: { lat: 17.68, lng: 74.01, alert: 'CARDIAC_ARREST' },
      timestamp: 2000,
      retries: 0,
      status: 'PENDING',
      priority: 1, // Emergency
    });

    // Get pending items
    const pending = await storage.getPendingSyncItems();
    expect(pending.length).toBe(2);

    // EMPIRICAL FINDING:
    // In SQLiteStorageAdapter: ORDER BY priority ASC, timestamp ASC returns emergency first.
    // In AsyncStorageAdapter: getPendingSyncItems() does NOT sort by priority, returning routine first.
    if (storage.getBackendType() === 'async_storage') {
      expect(pending[0].id).toBe(routineId);
      expect(pending[1].id).toBe(emergencyId);
    }
  });
==== AFTER:
  // Test 16: Priority Ordering Verification (DEF-M1-02 Fix)
  it('ADV-PRIORITY-ORDERING: ensures emergency priority items (priority 1) are returned before routine items across all storage adapters', async () => {
    // Enqueue a standard/routine item (priority 2) first
    const routineId = 'SYNC-ROUTINE-001';
    await storage.saveItem('sync_queue', routineId, {
      id: routineId,
      endpoint: '/api/v1/routine-vitals',
      method: 'POST',
      payload: { bp: '120/80' },
      timestamp: 1000,
      retries: 0,
      status: 'PENDING',
      priority: 2, // Standard
    });

    // Enqueue an emergency SOS item (priority 1) second
    const emergencyId = 'SYNC-EMERGENCY-001';
    await storage.saveItem('sync_queue', emergencyId, {
      id: emergencyId,
      endpoint: '/api/v1/emergency-sos',
      method: 'POST',
      payload: { lat: 17.68, lng: 74.01, alert: 'CARDIAC_ARREST' },
      timestamp: 2000,
      retries: 0,
      status: 'PENDING',
      priority: 1, // Emergency
    });

    // Get pending items
    const pending = await storage.getPendingSyncItems();
    expect(pending.length).toBe(2);

    // DEF-M1-02 Resolved: Emergency item (priority 1) MUST appear before Routine (priority 2)
    expect(pending[0].id).toBe(emergencyId);
    expect(pending[0].priority).toBe(1);
    expect(pending[1].id).toBe(routineId);
    expect(pending[1].priority).toBe(2);
  });
>>>>
```

#### Edit 3: Update Test 8 (`ADV-CONCURRENT-WRITES`)
In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`:
```typescript
<<<< BEFORE:
  // Test 8: Concurrent write race condition investigation on AsyncStorageAdapter index
  it('ADV-DEFECT-CONCURRENT-WRITES: observes index race condition under concurrent AsyncStorageAdapter writes', async () => {
    await Promise.all([
      storage.saveItem('patient_cache', 'c1', { name: 'Patient 1' }),
      storage.saveItem('patient_cache', 'c2', { name: 'Patient 2' }),
      storage.saveItem('patient_cache', 'c3', { name: 'Patient 3' }),
      storage.saveItem('patient_cache', 'c4', { name: 'Patient 4' }),
      storage.saveItem('patient_cache', 'c5', { name: 'Patient 5' }),
    ]);

    const count = await storage.getStoreCount('patient_cache');
    const all = await storage.getAll('patient_cache');
    // Note: Due to lack of write mutex around getIndex -> saveIndex, concurrent writes race
    console.log(
      `[EMPIRICAL CONCURRENCY FINDING] 5 concurrent writes -> indexed count: ${count}, getAll: ${all.length}`
    );
    // All individual items are persisted in AsyncStorage keys even if index misses some
    expect(await storage.getItem('patient_cache', 'c1')).toBeDefined();
    expect(await storage.getItem('patient_cache', 'c5')).toBeDefined();
  });
==== AFTER:
  // Test 8: Concurrent write race condition elimination on AsyncStorageAdapter index (DEF-M1-04 Fix)
  it('ADV-CONCURRENT-WRITES: preserves all index entries without key loss under concurrent AsyncStorageAdapter writes', async () => {
    await Promise.all([
      storage.saveItem('patient_cache', 'c1', { name: 'Patient 1' }),
      storage.saveItem('patient_cache', 'c2', { name: 'Patient 2' }),
      storage.saveItem('patient_cache', 'c3', { name: 'Patient 3' }),
      storage.saveItem('patient_cache', 'c4', { name: 'Patient 4' }),
      storage.saveItem('patient_cache', 'c5', { name: 'Patient 5' }),
    ]);

    const count = await storage.getStoreCount('patient_cache');
    const all = await storage.getAll('patient_cache');
    
    // DEF-M1-04 Resolved: Synchronized index operations ensure zero key loss
    expect(count).toBe(5);
    expect(all).toHaveLength(5);
    expect(await storage.getItem('patient_cache', 'c1')).toBeDefined();
    expect(await storage.getItem('patient_cache', 'c5')).toBeDefined();
  });
>>>>
```

#### Edit 4: Add New Test 21 for DEF-M1-03 Timer Leak Cleanup
In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts` (inside describe `'Sync Queue, Priority Ordering, and Retry Math'`):
```typescript
  // Test 21: Timer Resource Leak Guard (DEF-M1-03 Fix)
  it('ADV-TIMER-CLEANUP: guarantees fetch timeout is cleared in finally block even on network rejection', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network ECONNREFUSED')) as any;

    await storage.enqueueSync('/api/v1/network-fail', 'POST', { fail: true });

    try {
      await syncEngine.syncOutbox();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
      clearTimeoutSpy.mockRestore();
    }
  });
```

---

## 3. Baseline Regression Guard (16 Baseline Suites, 412 Tests)

### 3.1 Exact Inventory of the 16 Baseline Test Suites (412 Tests)

| Tier | Suite File | Tests | Core Scope |
|---|---|---|---|
| **Tier 1** | `__tests__/tier1_features/core_foundations.test.ts` | 35 | F01 Expo Config, F02 Theme, F03 i18n, F04 8-Store Engine, F05 Sync Engine, F06 AuthContext, F07 UI Components |
| **Tier 1** | `__tests__/tier1_features/shared_hubs.test.ts` | 25 | F08 Role Navigation, F09 ABHA Login, F10-12 Diagnostics, F13-14 Referrals, F15-16 Queue, F17-18 Medicines, F19-20 SOS |
| **Tier 1** | `__tests__/tier1_features/patient_asha.test.ts` | 20 | F21-25 Patient Portal (Vitals, Appointments, PHR, Triage), F26-30 ASHA Portal (Registration, High-Risk ANC, Voice Intake) |
| **Tier 1** | `__tests__/tier1_features/doctor_admin.test.ts` | 20 | F31-33 Doctor Portal (OPD Queue, Video Room, Rx Writer), F34-37 Admin Portal (Overview, Outbreaks, Inventory, ABDM) |
| **Tier 2** | `__tests__/tier2_boundaries/clinical_limits.test.ts` | 50 | Physiological limits (BP, SpO2, Glucose, Pulse, Temperature, Pediatric/Obstetric Triage Tiers) |
| **Tier 2** | `__tests__/tier2_boundaries/input_boundaries.test.ts` | 50 | Boundary strings, Unicode Devanagari, SQL/XSS injections, null/undefined safety, empty arrays |
| **Tier 2** | `__tests__/tier2_boundaries/network_resilience.test.ts` | 50 | Network flap resilience, outbox queueing, exponential backoff formulas, reentrancy guards |
| **Tier 2** | `__tests__/tier2_boundaries/stock_and_sla.test.ts` | 50 | EDL stock levels, buffer reorders, generic chemical substitutions, referral SLAs (1h to 72h) |
| **Tier 3** | `__tests__/tier3_combinations/triage_to_referral.test.ts` | 6 | Cross-feature workflow: AI Triage -> High-risk detection -> 108 SOS Ambulance -> Referral Slip |
| **Tier 3** | `__tests__/tier3_combinations/rx_to_inventory.test.ts` | 6 | Cross-feature workflow: Doctor digital Rx -> Stock check -> Generic substitution -> Stock decrement -> Supply indent |
| **Tier 3** | `__tests__/tier3_combinations/asha_to_opd_sync.test.ts` | 6 | Cross-feature workflow: Offline ASHA intake -> Outbox queue -> Connectivity restoration -> Doctor OPD Queue |
| **Tier 4** | `__tests__/tier4_workloads/rural_walkin.test.ts` | 5 | End-to-end patient journey: Walk-in -> ANM Vitals -> ANC Priority Token -> OPD Consultation -> Pharmacy Dispense |
| **Tier 4** | `__tests__/tier4_workloads/emergency_108.test.ts` | 5 | End-to-end emergency journey: 1-Tap SOS -> GPS Beacon -> ALS Ambulance MH-12-HE-1080 -> 14-min Telemetry -> Trauma Bay |
| **Tier 4** | `__tests__/tier4_workloads/maternal_escalation.test.ts` | 5 | End-to-end maternal journey: ASHA field visit -> Danger sign checklist -> 1h SLA Obstetric ICU -> Counter-referral |
| **Tier 4** | `__tests__/tier4_workloads/teleconsult_journey.test.ts` | 5 | End-to-end telemedicine journey: 14-digit ABHA login -> Video room -> Audio fallback -> Digital Rx -> ABDM FHIR Bundle |
| **Tier 4** | `__tests__/tier4_workloads/outbreak_response.test.ts` | 5 | End-to-end epidemic journey: Dengue cluster detection -> Outbreak Alert -> 500 NS1 test kit indent -> ASHA mobile broadcast |
| **TOTAL** | **16 Suites** | **412** | **100% Pass Rate Required — Zero Regressions** |

*(Note: Companion adversarial suite `m1_empirical_adversarial.test.ts` adds 29 tests, and `storage_and_sync_stress.test.ts` adds 27 tests, giving 468 tests total).*

### 3.2 Regression Independence Verification
- **Test Harness Decoupling**: All 16 baseline test suites (Tiers 1-4) execute against `MockStorageService` (`__tests__/harness/mockStorage.ts`) and `MockSyncEngine` (`__tests__/harness/mockSync.ts`).
- **Domain Verification**: Because Tiers 1-4 verify domain rules (clinical thresholds, triage logic, drug substitution algorithms, referral workflows, and session models), modifying the low-level production adapters (`sqliteAdapter.ts`, `asyncStorageAdapter.ts`, `syncEngine.ts`) has **zero negative interference** on the baseline suites.
- **Empirical Proof**: The baseline suites were executed via:
  ```powershell
  npx jest __tests__/tier1_features __tests__/tier2_boundaries __tests__/tier3_combinations __tests__/tier4_workloads
  ```
  Result: **16 passed, 16 total | Tests: 412 passed, 412 total (Time: 0.701s)**.

---

## 4. Interface Contract Preservation (`PROJECT.md § Interface Contracts`)

### 4.1 Strict Preservation of `OfflineStorageAPI`
In `PROJECT.md § Interface Contracts (2. OfflineStorage ↔ SyncEngine ↔ Domain Services)`:
```typescript
interface OfflineStorageAPI {
  getItem: <T>(store: string, id: string) => Promise<T | null>;
  getAll: <T>(store: string) => Promise<T[]>;
  saveItem: <T>(store: string, id: string, data: T) => Promise<void>;
  deleteItem: (store: string, id: string) => Promise<void>;
  enqueueSync: (endpoint: string, method: string, payload: any) => Promise<void>;
  getPendingSyncItems: () => Promise<SyncQueueItem[]>;
}
```

The planned fixes to resolve DEF-M1-01 through DEF-M1-04 strictly preserve this contract:
1. `getItem`, `getAll`, `saveItem`, `deleteItem`, `enqueueSync`, and `getPendingSyncItems` retain identical parameters and return types.
2. In `mobile/src/storage/types.ts`:
   The internal adapter method `updateSyncStatus` will be updated from:
   ```typescript
   updateSyncStatus(id: string, status: SyncQueueItem['status'], error?: string): Promise<void>;
   ```
   to:
   ```typescript
   updateSyncStatus(id: string, status: SyncQueueItem['status'], error?: string, retries?: number): Promise<void>;
   ```
   Because `retries?: number` is **optional**, any existing call sites that omit `retries` continue to compile cleanly and remain 100% backward compatible.
3. In both `AsyncStorageAdapter` and `SQLiteStorageAdapter`:
   ```typescript
   if (retries !== undefined) {
     item.retries = retries;
   } else if (status === 'FAILED') {
     item.retries = (item.retries || 0) + 1;
   }
   ```
   This guarantees that callers who invoke `updateSyncStatus(id, 'FAILED')` without explicit retries (such as in `ADV-SYNC-STATUS`) continue to increment the retry counter as expected.

### 4.2 Zero Breaking Changes Across All Other Contracts
- **AuthContext Contract** (`UserSession`, `AuthContextType`): Untouched.
- **LanguageContext Contract** (`LanguageContextType`): Untouched.
- **Domain Models** (`Diagnostic Order`, `Referral`, `Queue Token`, `Emergency Event`, `Medicine Item`): Untouched.

---

## 5. Step-by-Step Re-Verification Protocol for the Worker

The Worker MUST follow this precise sequence during Milestone 1 Iteration 2 implementation and verification:

### Stage 1: Pre-Implementation Sanity Check
Confirm working tree is clean and baseline tests pass:
```powershell
cd c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile
npm run typecheck
npx jest __tests__/tier1_features __tests__/tier2_boundaries __tests__/tier3_combinations __tests__/tier4_workloads
```
*Expected: `tsc --noEmit` exits with code 0; 16 test suites pass, 412 tests pass.*

### Stage 2: Code Implementation
Apply fixes for DEF-M1-01 through DEF-M1-04:
1. **DEF-M1-01**: In `mobile/src/storage/types.ts`, `mobile/src/storage/storageEngine.ts`, `mobile/src/storage/asyncStorageAdapter.ts`, and `mobile/src/storage/sqliteAdapter.ts`, accept optional `retries?: number` in `updateSyncStatus` and persist it. In `mobile/src/services/syncEngine.ts:327`, pass `newRetries` when setting status `'PENDING'`.
2. **DEF-M1-02**: In `mobile/src/storage/asyncStorageAdapter.ts:120`, sort pending sync items by `(a.priority ?? 2) - (b.priority ?? 2) || a.timestamp - b.timestamp`.
3. **DEF-M1-03**: In `mobile/src/services/syncEngine.ts:266-281`, enclose `fetch()` in `try ... finally { clearTimeout(timeoutId); }`.
4. **DEF-M1-04**: In `mobile/src/storage/asyncStorageAdapter.ts`, implement serialized index locking (`withIndexLock`) around store index read/write operations.

### Stage 3: Refactor Tier 5 Test Expectations
In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`:
1. Update Test 14 to assert `storedItem.retries === 1` on retryable failure and verify transition to `FAILED` with `retries === 5`.
2. Update Test 16 to assert `pending[0].id === emergencyId` (priority 1) and `pending[1].id === routineId` (priority 2).
3. Update Test 8 to assert `count === 5` and `all.length === 5`.
4. Add Test 21 (`ADV-TIMER-CLEANUP`) to verify `clearTimeout` call on fetch rejection.

### Stage 4: Run Tier 5 Adversarial Stress Suite
```powershell
cd c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile
npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts --verbose
```
*Expected: 1 test suite passed, 28 passed, 0 failed.*

### Stage 5: Run Baseline Regression Guard (16 Suites, 412 Tests)
```powershell
cd c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile
npx jest __tests__/tier1_features __tests__/tier2_boundaries __tests__/tier3_combinations __tests__/tier4_workloads
```
*Expected: 16 test suites passed, 412 passed, 0 failed.*

### Stage 6: Run Challenger 2 Adversarial Suite
```powershell
cd c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile
npx jest __tests__/m1_empirical_adversarial.test.ts --verbose
```
*Expected: 1 test suite passed, 29 passed, 0 failed.*

### Stage 7: Run Full Unified Test Suite
```powershell
cd c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile
npm test
```
*Expected: 18 test suites passed, 469 passed, 0 failed.*

### Stage 8: Verify TypeScript Compilation
```powershell
cd c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile
npm run typecheck
```
*Expected: `tsc --noEmit` exits with code 0 (zero errors).*

### Stage 9: Git Hygiene & Scope Boundaries
Verify that zero files were modified outside the `mobile/` directory:
```powershell
git status --porcelain
```
*Expected: No modified files outside `mobile/src/` and `mobile/__tests__/`.*
