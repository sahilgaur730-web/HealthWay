# Handoff Report: M1 Storage Defect Fix Exploration (DEF-M1-01 & DEF-M1-02)

**Agent**: `m1_it2_explorer_1`  
**Role**: M1 Storage Defect Fix Explorer  
**Task**: Formulate exact code fix recommendations for DEF-M1-01 and DEF-M1-02  
**Date**: 2026-09-07  
**Type**: Hard Handoff (Task Complete)  

---

## 1. Observation

### 1.1 Baseline Health Check
- Ran `npm test` in `mobile/`:
  - Result: `Test Suites: 18 passed, 18 total | Tests: 468 passed, 468 total`.
- Ran `npm run typecheck` (`tsc --noEmit`) in `mobile/`:
  - Result: Exited 0 with zero errors.

### 1.2 Observation on DEF-M1-01 (Retry Persistence)
- In `mobile/src/services/syncEngine.ts:311-330`:
  ```typescript
  311: } else {
  312:   failed++;
  313:   const newRetries = (item.retries || 0) + 1;
  314:   if (newRetries >= 5 || (errorMessage && errorMessage.startsWith('Client Error'))) {
  315:     await this.storage.updateSyncStatus(item.id, 'FAILED', errorMessage || 'Max retries exceeded');
  ...
  326:   } else {
  327:     // Restore to PENDING with incremented retries for next cycle
  328:     await this.storage.updateSyncStatus(item.id, 'PENDING', errorMessage);
  329:     itemResults.push({ id: item.id, status: 'RETRY' });
  330:   }
  331: }
  ```
- In `mobile/src/storage/asyncStorageAdapter.ts:123-136`:
  ```typescript
  128: const item = await this.getItem<SyncQueueItem>('sync_queue', id);
  129: if (item) {
  130:   item.status = status;
  131:   item.lastAttempt = Date.now();
  132:   if (error) item.error = error;
  133:   if (status === 'FAILED') item.retries = (item.retries || 0) + 1;
  134:   await this.saveItem('sync_queue', id, item);
  135: }
  ```
- In `mobile/src/storage/sqliteAdapter.ts:203-217`:
  ```typescript
  203: if (status === 'FAILED') {
  204:   await this.db.runAsync(
  205:     `UPDATE sync_queue
  206:      SET status = ?, retries = retries + 1, last_attempt = ?, error = ?
  207:      WHERE id = ?`,
  208:     [status, Date.now(), error || null, id]
  209:   );
  210: } else {
  211:   await this.db.runAsync(
  212:     `UPDATE sync_queue
  213:      SET status = ?, last_attempt = ?, error = ?
  214:      WHERE id = ?`,
  215:     [status, Date.now(), error || null, id]
  216:   );
  217: }
  ```
- Directly observed: Both adapters only increment `retries` when `status === 'FAILED'`. When `status === 'PENDING'`, `retries` remains unchanged (0).
- In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts:406`:
  `expect(storedItem?.retries).toBe(0);` asserts this defective behavior directly.

### 1.3 Observation on DEF-M1-02 (Priority Ordering in Outbox)
- In `mobile/src/storage/asyncStorageAdapter.ts:118-121`:
  ```typescript
  118: public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
  119:   const all = await this.getAll<SyncQueueItem>('sync_queue');
  120:   return all.filter((item) => item.status === 'PENDING' || item.status === 'FAILED');
  121: }
  ```
  Items are filtered without any priority or timestamp sorting.
- In `mobile/src/storage/sqliteAdapter.ts:184-190`:
  ```typescript
  186: const rows = await this.db.getAllAsync(
  187:   `SELECT * FROM sync_queue
  188:    WHERE status IN ('PENDING', 'FAILED')
  189:    ORDER BY priority ASC, timestamp ASC`
  190: );
  ```
  `sqliteAdapter` sorts by priority ascending, but `asyncStorageAdapter` does not.
- In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts:469-472`:
  ```typescript
  469: if (storage.getBackendType() === 'async_storage') {
  470:   expect(pending[0].id).toBe(routineId);
  471:   expect(pending[1].id).toBe(emergencyId);
  472: }
  ```
  Directly asserts that `AsyncStorageAdapter` returns `routineId` before `emergencyId`.

---

## 2. Logic Chain

1. **Step 1 (DEF-M1-01 Mechanism)**:
   - Observation 1.2 shows that `syncEngine.ts:328` calls `updateSyncStatus(item.id, 'PENDING', errorMessage)` for temporary retries.
   - Observation 1.2 shows that neither `asyncStorageAdapter` nor `sqliteAdapter` updates `retries` when `status === 'PENDING'`.
   - Therefore, `item.retries` in storage stays at 0 indefinitely.
   - On every retry attempt, `newRetries` evaluates to `0 + 1 = 1`. The condition `newRetries >= 5` is never satisfied, and backoff `if (item.retries > 0)` is bypassed.
   - **Remediation**: Modifying `updateSyncStatus` in both adapters to increment `retries` when `status === 'PENDING'` (or when explicit `retries` is passed) ensures `item.retries` progresses `0 -> 1 -> 2 -> 3 -> 4 -> 5` and hits `FAILED` at attempt 5.

2. **Step 2 (DEF-M1-02 Mechanism)**:
   - Observation 1.3 shows `asyncStorageAdapter.getPendingSyncItems()` returns items in storage insertion order.
   - If a standard/routine payload (`priority: 2`) is queued before an emergency SOS payload (`priority: 1`), `asyncStorageAdapter` returns the standard item first.
   - In rural clinics or fallback mode, if connection drops after transmitting one payload, the emergency SOS payload is blocked.
   - **Remediation**: Adding `.sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3) || a.timestamp - b.timestamp)` to `asyncStorageAdapter.ts:120` and `COALESCE(priority, 3)` to `sqliteAdapter.ts:189` ensures emergency priority 1 payloads are always evaluated first, with strict FIFO tie-breaking on equal priority tiers.

3. **Step 3 (Adversarial Test Assertion Inversion)**:
   - Observation 1.2 & 1.3 show that `storage_and_sync_stress.test.ts` lines 406 and 470-471 assert the defective behavior (`retries === 0` and `routineId` before `emergencyId`).
   - When the Worker implements the code fixes, these tests will fail unless their assertions are updated to assert the fixed behavior (`retries === 1` and `emergencyId` before `routineId`).

---

## 3. Caveats

1. **Scope Boundaries**: This investigation is strictly read-only. No application source code or test files were modified during this turn.
2. **Other Defects (DEF-M1-03 & DEF-M1-04)**: Challenger 1 also reported DEF-M1-03 (Timer leak in `syncEngine.syncOutbox`) and DEF-M1-04 (AsyncStorage index race condition). These are documented in `report.md` for situational awareness but are dispatched separately or handled alongside storage fixes.
3. **Mock Storage Alignment**: `mobile/__tests__/harness/mockStorage.ts` contains an in-memory mock of `updateSyncStatus` which only increments on `'FAILED'`. While Tier 1–4 tests pass with mockStorage, updating `mockStorage.ts` to match `asyncStorageAdapter.ts` will prevent drift.

---

## 4. Conclusion

1. **DEF-M1-01 Fix Recommendation**:
   - In `mobile/src/storage/asyncStorageAdapter.ts`: Modify `updateSyncStatus(id, status, error, retries?: number)`:
     ```typescript
     if (retries !== undefined) {
       item.retries = retries;
     } else if (status === 'FAILED' || status === 'PENDING') {
       item.retries = (item.retries || 0) + 1;
     }
     ```
   - In `mobile/src/storage/sqliteAdapter.ts`:
     ```typescript
     if (retries !== undefined) {
       await this.db.runAsync(
         `UPDATE sync_queue SET status = ?, retries = ?, last_attempt = ?, error = ? WHERE id = ?`,
         [status, retries, Date.now(), error || null, id]
       );
     } else if (status === 'FAILED' || status === 'PENDING') {
       await this.db.runAsync(
         `UPDATE sync_queue SET status = ?, retries = retries + 1, last_attempt = ?, error = ? WHERE id = ?`,
         [status, Date.now(), error || null, id]
       );
     } else {
       await this.db.runAsync(
         `UPDATE sync_queue SET status = ?, last_attempt = ?, error = ? WHERE id = ?`,
         [status, Date.now(), error || null, id]
       );
     }
     ```
   - Update `StorageAdapter` in `types.ts` and `StorageEngine` in `storageEngine.ts`.

2. **DEF-M1-02 Fix Recommendation**:
   - In `mobile/src/storage/asyncStorageAdapter.ts:120`:
     ```typescript
     return all
       .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
       .sort(
         (a, b) =>
           (a.priority ?? 3) - (b.priority ?? 3) || a.timestamp - b.timestamp
       );
     ```
   - In `mobile/src/storage/sqliteAdapter.ts:189`: Use `ORDER BY COALESCE(priority, 3) ASC, timestamp ASC`.
   - In both adapters and `StorageEngine`, update `enqueueSync` to accept optional `priority: number = 2`.

3. **Test Suite Inversion**:
   - Update line 406 of `storage_and_sync_stress.test.ts` to `expect(storedItem?.retries).toBe(1);`.
   - Update lines 469–472 of `storage_and_sync_stress.test.ts` to expect `emergencyId` before `routineId`.

---

## 5. Verification Method

### 5.1 Commands for Worker Verification
```bash
# 1. Verify TypeScript types cleanly
cd c:/Users/SAHIL GAUR/Desktop/HealthWay/mobile
npm run typecheck

# 2. Run Tier 5 Adversarial tests
npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts --verbose

# 3. Run complete test suite
npm test
```

### 5.2 Files to Inspect
- `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m1_it2_explorer_1\report.md` (Detailed before/after diffs)
- `mobile/src/storage/asyncStorageAdapter.ts`
- `mobile/src/storage/sqliteAdapter.ts`
- `mobile/src/storage/types.ts`
- `mobile/src/storage/storageEngine.ts`
- `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`

### 5.3 Invalidation Conditions
- If `npm test` fails with open-handle warnings or assertion mismatches, check whether lines 406 and 470 of `storage_and_sync_stress.test.ts` were updated to assert the fixed behavior.
