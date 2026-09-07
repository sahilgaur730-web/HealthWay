# M1 Storage and Sync Engine Adversarial Challenge Report

**Agent**: `m1_challenger_1` (M1 Storage & Sync Adversarial Challenger)  
**Target Milestone**: Milestone 1 (M1) — Mobile Core Architecture & Foundation  
**Target Artifacts**:
- `mobile/src/storage/storageEngine.ts`
- `mobile/src/storage/asyncStorageAdapter.ts`
- `mobile/src/storage/sqliteAdapter.ts`
- `mobile/src/storage/types.ts`
- `mobile/src/services/syncEngine.ts`
**Adversarial Test Suite**: `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`  
**Date**: 2026-09-07  
**Verdict**: **FAIL (Actionable Defect Findings)**

---

## 1. Observation

### 1.1 Test Suite & Typecheck Execution
- `npm test`: Ran complete test suite across 18 test suites and 468 test cases:
  - Output: `Test Suites: 18 passed, 18 total | Tests: 468 passed, 468 total | Time: 1.227 s`.
  - Added Tier 5 adversarial stress suite (`mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`): 27/27 tests executed.
- `npm run typecheck` (`tsc --noEmit`): Clean run with 0 errors.

### 1.2 Observation 1: Retry Counter Unpersisted on Temporary Failure (Infinite Retry Loop)
- In `mobile/src/services/syncEngine.ts` lines 311–330:
```typescript
311: } else {
312:   failed++;
313:   const newRetries = (item.retries || 0) + 1;
314:   if (newRetries >= 5 || (errorMessage && errorMessage.startsWith('Client Error'))) {
315:     await this.storage.updateSyncStatus(item.id, 'FAILED', errorMessage || 'Max retries exceeded');
316:     ...
326:   } else {
327:     // Restore to PENDING with incremented retries for next cycle
328:     await this.storage.updateSyncStatus(item.id, 'PENDING', errorMessage);
329:     itemResults.push({ id: item.id, status: 'RETRY' });
330:   }
331: }
```
- In `mobile/src/storage/asyncStorageAdapter.ts` lines 123–136:
```typescript
123: public async updateSyncStatus(
124:   id: string,
125:   status: SyncQueueItem['status'],
126:   error?: string
127: ): Promise<void> {
128:   const item = await this.getItem<SyncQueueItem>('sync_queue', id);
129:   if (item) {
130:     item.status = status;
131:     item.lastAttempt = Date.now();
132:     if (error) item.error = error;
133:     if (status === 'FAILED') item.retries = (item.retries || 0) + 1;
134:     await this.saveItem('sync_queue', id, item);
135:   }
136: }
```
- In `mobile/src/storage/sqliteAdapter.ts` lines 197–218:
```typescript
197: public async updateSyncStatus(
198:   id: string,
199:   status: SyncQueueItem['status'],
200:   error?: string
201: ): Promise<void> {
202:   this.ensureReady();
203:   if (status === 'FAILED') {
204:     await this.db.runAsync(
205:       `UPDATE sync_queue
206:        SET status = ?, retries = retries + 1, last_attempt = ?, error = ?
207:        WHERE id = ?`,
208:       [status, Date.now(), error || null, id]
209:     );
210:   } else {
211:     await this.db.runAsync(
212:       `UPDATE sync_queue
213:        SET status = ?, last_attempt = ?, error = ?
214:        WHERE id = ?`,
215:       [status, Date.now(), error || null, id]
216:     );
217:   }
218: }
```
- Both adapters ONLY increment `retries` when `status === 'FAILED'`.
- When `status === 'PENDING'` (a retry attempt), neither adapter increments `retries`, nor does `updateSyncStatus` accept an explicit `retries` argument.
- Empirical test `ADV-DEFECT-RETRY-PERSISTENCE`: After a failed sync attempt, `storedItem.retries` remains `0`.
- In consequence, `item.retries` is perpetually read as `0`, `newRetries` is perpetually calculated as `1`, `newRetries >= 5` is NEVER satisfied, and `if (item.retries > 0)` in `syncEngine.ts` line 251 is NEVER true.

### 1.3 Observation 2: Missing Priority Ordering in `AsyncStorageAdapter`
- In `mobile/src/storage/sqliteAdapter.ts` lines 184–195:
```typescript
184: public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
185:   this.ensureReady();
186:   const rows = await this.db.getAllAsync(
187:     `SELECT * FROM sync_queue
188:      WHERE status IN ('PENDING', 'FAILED')
189:      ORDER BY priority ASC, timestamp ASC`
190:   );
```
- In `mobile/src/storage/asyncStorageAdapter.ts` lines 118–121:
```typescript
118: public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
119:   const all = await this.getAll<SyncQueueItem>('sync_queue');
120:   return all.filter((item) => item.status === 'PENDING' || item.status === 'FAILED');
121: }
```
- In `sqliteAdapter`, items are explicitly ordered by `priority ASC, timestamp ASC` (Emergency `priority: 1` first).
- In `asyncStorageAdapter`, items are returned in insertion order without sorting by priority.
- Empirical test `ADV-DEFECT-PRIORITY-ORDERING`: When a routine vitals item (`priority: 2`) is enqueued followed by an emergency SOS item (`priority: 1`), `asyncStorageAdapter.getPendingSyncItems()` returns the routine item first (`pending[0].id === 'SYNC-ROUTINE-001'`).

### 1.4 Observation 3: Timer Resource Leak in `SyncEngine.syncOutbox`
- In `mobile/src/services/syncEngine.ts` lines 266–281:
```typescript
266: const controller = new AbortController();
267: const timeoutId = setTimeout(() => controller.abort(), 10000);
268: 
269: const compressed = this.compressPayload(item.payload);
270: const response = await fetch(item.endpoint, {
271:   method: item.method,
272:   headers: {
273:     'Content-Type': 'application/json',
274:     'X-HealthWay-Sync': 'Outbox-V1',
275:     'X-Idempotency-Key': item.id,
276:   },
277:   body: item.method !== 'DELETE' ? JSON.stringify(compressed) : undefined,
278:   signal: controller.signal,
279: });
280: clearTimeout(timeoutId);
```
- `clearTimeout(timeoutId)` is placed after `await fetch(...)` in the try block, not in a `finally` block.
- When `fetch(...)` rejects (e.g. DNS failure, ECONNREFUSED, or offline network error), execution jumps directly to `catch (err)` at line 294, bypassing `clearTimeout(timeoutId)`.
- The 10,000ms timer handle remains active in the event loop, triggering Jest open-handle warnings.

### 1.5 Observation 4: Index Race Condition in `AsyncStorageAdapter.saveItem`
- In `mobile/src/storage/asyncStorageAdapter.ts` lines 61–70:
```typescript
61: public async saveItem<T>(store: string, id: string, data: T): Promise<void> {
62:   const key = this.getItemKey(store, id);
63:   await AsyncStorage.setItem(key, JSON.stringify(data));
64: 
65:   const index = await this.getIndex(store);
66:   if (!index.includes(id)) {
67:     index.push(id);
68:     await this.saveIndex(store, index);
69:   }
70: }
```
- Concurrent calls to `saveItem()` (`Promise.all`) execute `getIndex()` concurrently. Both read the same stale index snapshot and overwrite each other's additions during `saveIndex()`.
- Empirical test `ADV-DEFECT-CONCURRENT-WRITES`: 5 concurrent `saveItem` calls resulted in index loss (fewer than 5 items indexed).

---

## 2. Logic Chain

1. **Premise 1**: The sync engine is specified to retry transient network failures up to 5 times using exponential backoff, and cap failures by marking them as terminal `FAILED` in `sync_queue` and logging an audit entry in `sync_log`.
2. **Observation 1**: `syncEngine.ts:327` updates transient failures to status `'PENDING'`, but neither `AsyncStorageAdapter` nor `SQLiteStorageAdapter` increments `retries` for `'PENDING'` items.
3. **Inference 1**: `item.retries` is never persisted as non-zero for pending retries. Thus:
   - `item.retries` remains 0 on every sync pass.
   - `newRetries` is perpetually evaluated as 1.
   - The queue item loops infinitely and never reaches `newRetries >= 5`.
   - The exponential backoff formula `min(2^retries * 500ms, 5000ms)` is never triggered (`item.retries > 0` is false).
4. **Premise 2**: Offline persistence must support priority queuing where emergency operations (`priority: 1`, e.g. Emergency SOS, critical triage) take precedence over routine operations (`priority: 2` or `3`).
5. **Observation 2**: While `SQLiteStorageAdapter` queries `ORDER BY priority ASC, timestamp ASC`, `AsyncStorageAdapter` (the fallback and primary in-memory/web adapter) executes `all.filter(...)` without sorting.
6. **Inference 2**: In environments using `AsyncStorageAdapter`, emergency events queued after non-emergency events are delayed behind routine sync jobs. If connectivity drops after the first item, emergency SOS dispatches fail to transmit.
7. **Premise 3**: Native and background sync processes must not leak timers or retain open handles that degrade battery or prevent app suspension.
8. **Observation 3**: `syncEngine.ts:280` calls `clearTimeout(timeoutId)` only on successful `fetch()` resolution.
9. **Inference 3**: Every failed HTTP network request leaves an uncollected 10-second timeout callback in the runtime event loop.
10. **Conclusion**: The implementation satisfies basic single-pass CRUD across all 8 stores, but contains four critical/high architectural defects in retry persistence, priority ordering, timer lifecycle, and concurrency that must be resolved.

---

## 3. Caveats

1. **Native Device Hardware Testing**: Tests were executed in the Node.js / Jest headless environment with simulated AsyncStorage and SQLite drivers. Native SQLite C-extensions (`expo-sqlite` on Android/iOS native runtime) were verified via adapter mocking and unit inspection, but not on a physical ARM binary build.
2. **Backoff Delay Mocking**: In test scenarios, `syncEngine.calculateBackoff` was spied to return 0 to prevent real-time 5-second thread blocking in the automated test runner. The mathematical formula itself was verified directly in isolated unit tests.
3. **Existing Feature Tests**: The existing 412 Tier 1–4 tests in `mobile/__tests__/` passed 100% because they run against the in-memory mock harness (`mobile/__tests__/harness/mockStorage.ts`), which bypassed the real `storageEngine` and `syncEngine`.

---

## 4. Conclusion & Explicit Verdict

### **VERDICT: FAIL**

The offline storage engine (`mobile/src/storage/`) and synchronization engine (`mobile/src/services/syncEngine.ts`) **FAIL** adversarial validation due to the following critical defects:

| Defect ID | Severity | Component | Summary |
|---|---|---|---|
| **DEF-M1-01** | **CRITICAL** | `syncEngine.ts` / `storageAdapters` | **Infinite Retry Loop**: Retry count is never persisted when status is set to `PENDING`. Queue items loop forever and never transition to terminal `FAILED`. Exponential backoff delay is never applied. |
| **DEF-M1-02** | **CRITICAL** | `asyncStorageAdapter.ts` | **Priority Inversion in Outbox**: `getPendingSyncItems()` does not sort by `priority ASC, timestamp ASC`. Emergency items are blocked behind routine items. |
| **DEF-M1-03** | **HIGH** | `syncEngine.ts` | **Timer Resource Leak**: `timeoutId` from `setTimeout` is not cleared in a `finally` block, leaking 10s timers on failed fetches. |
| **DEF-M1-04** | **MEDIUM** | `asyncStorageAdapter.ts` | **Index Race Condition**: Concurrent `saveItem` calls corrupt the store index key due to lack of write synchronization. |

### Recommended Remediations:
1. **Fix DEF-M1-01**: In `StorageAdapter` interface and implementations, allow `updateSyncStatus(id, status, error, retries?: number)` or increment `retries` on every call where `status === 'PENDING'` or explicitly persist `newRetries`.
2. **Fix DEF-M1-02**: In `asyncStorageAdapter.ts:120`, sort pending items:
   ```typescript
   return all
     .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
     .sort((a, b) => (a.priority || 2) - (b.priority || 2) || a.timestamp - b.timestamp);
   ```
3. **Fix DEF-M1-03**: In `syncEngine.ts:266`, place `clearTimeout(timeoutId)` in a `finally` block.
4. **Fix DEF-M1-04**: In `asyncStorageAdapter.ts`, implement a Promise-chain queue or mutex for store index modifications.

---

## 5. Verification Method

### 5.1 Run the Full Test Suite
```bash
cd mobile
npm test
```
Expected: 18 test suites, 468 tests passed, exiting with code 0.

### 5.2 Run Only Tier 5 Adversarial Stress Tests
```bash
cd mobile
npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts --verbose
```
Expected: 27 passed tests reproducing and asserting the exact behaviors documented above.

### 5.3 Verify TypeScript Compilation
```bash
cd mobile
npm run typecheck
```
Expected: `tsc --noEmit` exits with code 0 (zero errors).

### 5.4 Files to Inspect
- `mobile/src/storage/asyncStorageAdapter.ts` (lines 61-70, 118-121, 123-136)
- `mobile/src/storage/sqliteAdapter.ts` (lines 184-195, 203-217)
- `mobile/src/services/syncEngine.ts` (lines 266-281, 311-331)
- `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`
