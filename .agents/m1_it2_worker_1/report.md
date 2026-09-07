# Technical Remediation Report: Milestone 1 Iteration 2

**Agent**: `m1_it2_worker_1` (Milestone 1 Remediation Worker)  
**Assigned Working Directory**: `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m1_it2_worker_1\`  
**Milestone**: Milestone 1 (M1) Iteration 2  
**Target Subsystems**: Storage Adapters (`SQLiteStorageAdapter`, `AsyncStorageAdapter`), `SyncEngine`, and Tier 5 Stress Suite.  
**Date**: 2026-09-07  

---

## 1. Executive Summary

In Milestone 1 Iteration 1, adversarial evaluation identified 4 critical/high architectural defects in the mobile storage and sync engines:
- **DEF-M1-01**: Infinite retry loop caused by unpersisted retry counter when status was restored to `'PENDING'`.
- **DEF-M1-02**: Priority inversion in `AsyncStorageAdapter.getPendingSyncItems()` returning routine payloads ahead of emergency SOS payloads.
- **DEF-M1-03**: Timer handle leak in `SyncEngine.syncOutbox()` on network request rejections.
- **DEF-M1-04**: Index race condition in `AsyncStorageAdapter` where concurrent writes dropped keys from the store index.

As `m1_it2_worker_1`, all four defects have been completely remediated with genuine, robust, and minimal code changes strictly adhering to write boundaries. The Tier 5 stress test assertions were aligned to assert corrected behavior, and a new test was added for timer leak prevention. 

Verification confirms:
1. `npx tsc --noEmit` exits with code 0 (zero TypeScript errors).
2. `npx jest __tests__/tier5_adversarial/` passes 28/28 tests cleanly.
3. `npm test` passes all 18 test suites and 469/469 tests cleanly.
4. Exactly 0 git diffs exist outside `mobile/`.
5. Only the 4 permitted files were modified.

---

## 2. Remediation Details

### 2.1 DEF-M1-01: Retry Counter Persistence in SQLite & AsyncStorage
- **Files Modified**:
  - `mobile/src/storage/sqliteAdapter.ts`
  - `mobile/src/storage/asyncStorageAdapter.ts`
  - `mobile/src/services/syncEngine.ts`
- **Root Cause**:
  `updateSyncStatus` previously only incremented `retries` when `status === 'FAILED'`. When `SyncEngine` rescheduled an item for retry via `updateSyncStatus(id, 'PENDING', error)`, the retry count remained `0`. Thus exponential backoff was bypassed, `newRetries >= 5` was never triggered, and the queue looped infinitely on network outages.
- **Remediation**:
  1. Updated `updateSyncStatus` in both `SQLiteStorageAdapter` and `AsyncStorageAdapter` to accept optional `retries?: number`.
  2. If `retries !== undefined`, the provided `retries` value is persisted directly.
  3. If `retries === undefined`, `retries` is incremented for both `status === 'FAILED'` and `status === 'PENDING'` (`item.retries = (item.retries || 0) + 1` in AsyncStorage; `retries = retries + 1` in SQLite SQL UPDATE).
  4. In `SyncEngine.syncOutbox()`, passed `newRetries` when calling `updateSyncStatus` to restore status to `'PENDING'`, as well as on terminal `'FAILED'`.

### 2.2 DEF-M1-02: Priority-First Ordering in `AsyncStorageAdapter`
- **File Modified**: `mobile/src/storage/asyncStorageAdapter.ts`
- **Root Cause**:
  `AsyncStorageAdapter.getPendingSyncItems()` filtered items by status but did not sort them, resulting in FIFO key insertion order. Emergency SOS payloads (`priority: 1`) were returned behind routine vitals (`priority: 2`), starving emergency dispatches under poor connectivity.
- **Remediation**:
  Updated `AsyncStorageAdapter.getPendingSyncItems()` to sort pending items:
  ```typescript
  return all
    .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
    .sort(
      (a, b) =>
        (a.priority ?? 3) - (b.priority ?? 3) || a.timestamp - b.timestamp
    );
  ```
  Now, priority 1 (Emergency SOS) items are deterministically returned before priority 2 (Routine) and priority 3 (Unspecified) items, with FIFO ordering preserved among items of identical priority.

### 2.3 DEF-M1-03: Timer Resource Leak Prevention in `SyncEngine`
- **File Modified**: `mobile/src/services/syncEngine.ts`
- **Root Cause**:
  `clearTimeout(timeoutId)` was positioned sequentially after `await fetch(...)`. When `fetch()` threw an error (e.g. `ECONNREFUSED`, offline, DNS failure, TCP reset), execution bypassed `clearTimeout(timeoutId)` and jumped straight into the catch block, leaving orphaned 10-second timers in the JavaScript runtime.
- **Remediation**:
  Enclosed the fetch execution inside an inner `try ... finally` block:
  ```typescript
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const compressed = this.compressPayload(item.payload);
    const response = await fetch(item.endpoint, { ... });
    // evaluate response status...
  } finally {
    clearTimeout(timeoutId);
  }
  ```
  This guarantees that `clearTimeout(timeoutId)` runs synchronously on all paths (HTTP success, HTTP error, or network exception).

### 2.4 DEF-M1-04: Index Race Condition Prevention in `AsyncStorageAdapter`
- **File Modified**: `mobile/src/storage/asyncStorageAdapter.ts`
- **Root Cause**:
  AsyncStorage lacks atomic multi-key read-modify-write. Concurrent `saveItem` calls read the store index array asynchronously before preceding writes finished persisting the updated index. The last write clobbered earlier writes, dropping keys from `getAll()` and `getStoreCount()`.
- **Remediation**:
  Implemented an asynchronous queue per store using a Promise serialization chain:
  ```typescript
  private indexQueues: Map<string, Promise<any>> = new Map();

  private async enqueueIndexOp<T>(store: string, op: () => Promise<T>): Promise<T> {
    const prev = this.indexQueues.get(store) || Promise.resolve();
    const current = (async () => {
      await prev.catch(() => {});
      return await op();
    })();
    this.indexQueues.set(store, current);
    try {
      return await current;
    } finally {
      if (this.indexQueues.get(store) === current) {
        this.indexQueues.delete(store);
      }
    }
  }
  ```
  All index mutations in `saveItem`, `deleteItem`, and `clearStore` are serialized through `enqueueIndexOp`. In `clearAll()`, `this.indexQueues.clear()` ensures memory is reclaimed.

---

## 3. Tier 5 Test Suite Alignment (`storage_and_sync_stress.test.ts`)

In Iteration 1, the challenger verified the defects by writing tests asserting the defective behavior. These were updated to assert the remediated behavior per `m1_it2_explorer_3`:
1. **Test 8 (`ADV-CONCURRENT-WRITES`)**:
   Updated from observing dropped indexes to asserting full index integrity:
   ```typescript
   expect(count).toBe(5);
   expect(all).toHaveLength(5);
   ```
2. **Test 14 (`ADV-RETRY-PERSISTENCE`)**:
   Updated from expecting `retries === 0` to asserting:
   - `expect(storedItem?.retries).toBe(1)` after 1 failed cycle.
   - Transitions to terminal `'FAILED'` with `retries === 5` after 5 total cycles.
3. **Test 16 (`ADV-PRIORITY-ORDERING`)**:
   Updated from expecting routine first to asserting:
   - `expect(pending[0].id).toBe(emergencyId)` (priority 1).
   - `expect(pending[1].id).toBe(routineId)` (priority 2).
4. **Test 21 (`ADV-TIMER-CLEANUP`)**:
   Added new test verifying `clearTimeout` is called in the `finally` block when `fetch` rejects with a network error.

---

## 4. Verification Results

### 4.1 TypeScript Strict Compilation
```powershell
npx tsc --noEmit
# Exit code: 0 (Zero type errors)
```

### 4.2 Tier 5 Adversarial Stress Suite
```powershell
npx jest __tests__/tier5_adversarial/
```
Output:
```
PASS __tests__/tier5_adversarial/storage_and_sync_stress.test.ts
  Tier 5 Adversarial: 8-Store CRUD Operations on Real Storage Engine
    √ ADV-CRUD-sync_queue: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-patient_cache: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-triage_drafts: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-medicine_stock: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-facility_data: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-referral_drafts: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-settings: executes full CRUD cycle on store "%s"
    √ ADV-CRUD-sync_log: executes full CRUD cycle on store "%s"
    √ ADV-NORM: normalizes camelCase store variants to canonical store names
    √ ADV-ISOLATION: clearStore clears only target store and leaves other 7 stores intact
    √ ADV-CLEARALL: clearAll removes all keys across all stores
    √ ADV-PAYLOADS: handles deeply nested objects, multilingual unicode, and large data without corruption
    √ ADV-BOUNDARIES: handles non-existent keys, repeated deletes, and missing items gracefully
    √ ADV-STRESS-100: handles 100 sequential write-read-delete operations cleanly
    √ ADV-CONCURRENT-WRITES: preserves all index entries without key loss under concurrent AsyncStorageAdapter writes
  Tier 5 Adversarial: Sync Queue, Priority Ordering, and Retry Math
    √ ADV-SYNC-ENQUEUE: enqueueSync adds pending items with SYNC- prefix and metadata
    √ ADV-SYNC-STATUS: updateSyncStatus transitions through lifecycle and increments retries on failure
    √ ADV-BACKOFF-MATH: calculates exact exponential backoff values and caps at 5000ms
    √ ADV-COMPRESS: compressPayload trims whitespace and strips null/undefined/empty string properties
    √ ADV-SYNC-REENTRANCY: prevents duplicate concurrent sync runs and blocks sync while offline
    √ ADV-RETRY-PERSISTENCE: persists retry counter on retryable failure and transitions to FAILED after 5 retries
    √ ADV-CLIENT-ERROR: unrecoverable 4xx client errors terminate immediately as FAILED
    √ ADV-PRIORITY-ORDERING: ensures emergency priority items (priority 1) are returned before routine items across all storage adapters
    √ ADV-TIMER-CLEANUP: guarantees fetch timeout is cleared in finally block even on network rejection
  Tier 5 Adversarial: Fault Injection & Fallback Behavior
    √ ADV-FALLBACK-INIT: falls back to AsyncStorageAdapter when SQLite fails during initialization
    √ ADV-FALLBACK-IDEMPOTENT: repeated initialize() calls return identical backend and do not reset state
    √ ADV-SQLITE-ADAPTER: SQLiteStorageAdapter enforces priority-first ordering with mock SQLite database
    √ ADV-UNINITIALIZED: uninitialized SQLite adapter access throws explicit error before use

Test Suites: 1 passed, 1 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        0.427 s
```

### 4.3 Full Unified Test Suite
```powershell
npm test
```
Output:
```
Test Suites: 18 passed, 18 total
Tests:       469 passed, 469 total
Snapshots:   0 total
Time:        0.897 s
```

### 4.4 Boundary Compliance
- Modifications strictly restricted to:
  1. `mobile/src/storage/sqliteAdapter.ts`
  2. `mobile/src/storage/asyncStorageAdapter.ts`
  3. `mobile/src/services/syncEngine.ts`
  4. `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`
- 0 git diffs outside `mobile/`. Zero changes to web or backend files.
