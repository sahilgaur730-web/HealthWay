# Milestone 1 Iteration 2 Explorer 2 Handoff Report

**Agent**: `m1_it2_explorer_2` (M1 Sync Defect Fix Explorer)  
**Role**: Teamwork Explorer (Read-only Investigation & Synthesis)  
**Assigned Directory**: `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m1_it2_explorer_2\`  
**Target Milestone**: Milestone 1 (M1 Iteration 2)  
**Scope**: DEF-M1-03 (Timer leak in `syncEngine.ts`) and DEF-M1-04 (Store index race condition in `asyncStorageAdapter.ts`)  
**Detailed Report Reference**: `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m1_it2_explorer_2\report.md`  

---

## 1. Observation

### 1.1 Observation 1: Timer Resource Leak in `SyncEngine.syncOutbox` (DEF-M1-03)
- In `mobile/src/services/syncEngine.ts` lines 265–297:
```typescript
265:             // Native fetch execution
266:             const controller = new AbortController();
267:             const timeoutId = setTimeout(() => controller.abort(), 10000);
268: 
269:             const compressed = this.compressPayload(item.payload);
270:             const response = await fetch(item.endpoint, {
271:               method: item.method,
272:               headers: {
273:                 'Content-Type': 'application/json',
274:                 'X-HealthWay-Sync': 'Outbox-V1',
275:                 'X-Idempotency-Key': item.id,
276:               },
277:               body: item.method !== 'DELETE' ? JSON.stringify(compressed) : undefined,
278:               signal: controller.signal,
279:             });
280:             clearTimeout(timeoutId);
281: 
282:             if (response.ok) {
283:               success = true;
284:             } else if (response.status >= 400 && response.status < 500) {
...
294:         } catch (err: any) {
295:           success = false;
296:           errorMessage = err?.message || 'Network request failed';
297:         }
```
- Direct tool command: `view_file` on `mobile/src/services/syncEngine.ts` lines 250–285 confirmed:
  `clearTimeout(timeoutId)` at line 280 is called only when `await fetch(...)` resolves normally.
  When `fetch` rejects or throws (e.g. DNS failure, network error, or timeout), execution jumps straight to `catch (err: any)` at line 294, bypassing line 280.
  The 10-second timer handle remains active in the JavaScript event loop.

### 1.2 Observation 2: Store Index Race Condition under Concurrent Writes (DEF-M1-04)
- In `mobile/src/storage/asyncStorageAdapter.ts` lines 61–70:
```typescript
61:   public async saveItem<T>(store: string, id: string, data: T): Promise<void> {
62:     const key = this.getItemKey(store, id);
63:     await AsyncStorage.setItem(key, JSON.stringify(data));
64: 
65:     const index = await this.getIndex(store);
66:     if (!index.includes(id)) {
67:       index.push(id);
68:       await this.saveIndex(store, index);
69:     }
70:   }
```
- Direct execution of `npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts -t "ADV-DEFECT-CONCURRENT-WRITES"`:
```
[EMPIRICAL CONCURRENCY FINDING] 5 concurrent writes -> indexed count: 1, getAll: 1
```
- When 5 concurrent `saveItem` calls executed via `Promise.all`:
  All 5 called `this.getIndex(store)` concurrently when the index was empty (`[]`).
  Each pushed only its own ID and wrote `[id]` back to AsyncStorage.
  4 out of 5 items were dropped from the store index, leaving `count: 1` and `getAll().length: 1`.

---

## 2. Logic Chain

1. **Premise 1 (Timer Cleanliness)**: Mobile applications and headless test runners require all timer handles created via `setTimeout` to be cleared upon completion or abort of an asynchronous task to prevent event-loop starvation, open handle leaks, and unnecessary background wakeups.
2. **Observation 1 Reference**: In `syncEngine.ts:280`, `clearTimeout(timeoutId)` is placed in the sequential path following `await fetch(...)`.
3. **Inference 1**: Any rejected promise from `fetch()` (network drop, offline state, connection refused, DNS timeout) routes control flow directly to `catch (err: any)` at line 294, skipping `clearTimeout(timeoutId)`.
4. **Deduction 1 (DEF-M1-03 Solution)**: Wrapping the `fetch` and response handling inside `try ... finally { clearTimeout(timeoutId); }` guarantees that the timer is cleared under every possible execution outcome (HTTP 200, HTTP 4xx, HTTP 5xx, or network exception).
5. **Premise 2 (Index Integrity)**: An offline storage adapter must accurately index all stored items so that `getAll(store)` and `getStoreCount(store)` reflect every item written, even when items are saved concurrently.
6. **Observation 2 Reference**: In `asyncStorageAdapter.ts:65-68`, index reading and writing is non-atomic and un-synchronized. Five concurrent writes empirically resulted in only 1 item being indexed (`count: 1`).
7. **Inference 2**: The race condition stems from overlapping asynchronous reads of `@healthway:index:<store>` before previous mutations are committed.
8. **Deduction 2 (DEF-M1-04 Solution)**: Serializing index operations per store using a Promise queue (`enqueueIndexOp<T>(store, op)`) ensures that each index modification waits for the preceding operation on that store to commit before reading the index, while allowing independent stores to operate concurrently.

---

## 3. Caveats

1. **Native SQLite vs AsyncStorage**: DEF-M1-04 is specific to `AsyncStorageAdapter`. `SQLiteStorageAdapter` uses atomic SQL `INSERT OR REPLACE` and SQL `COUNT(*)`, which does not suffer from index race conditions.
2. **No Code Implementation in this Step**: In accordance with the Explorer archetype rules, no production source code has been edited. The Worker (`m1_worker_1`) will apply the exact code changes specified in `report.md`.
3. **Explorer 1 Coordination**: Explorer 1 is addressing DEF-M1-01 (retry counter persistence) and DEF-M1-02 (priority sorting). Lines 118–136 of `asyncStorageAdapter.ts` will be modified by Explorer 1's recommendations; our changes to lines 10–96 have zero collision with Explorer 1.

---

## 4. Conclusion

Both defects have been comprehensively investigated, root-caused, and formulated into exact drop-in code specifications:

1. **DEF-M1-03**:
   - In `mobile/src/services/syncEngine.ts`, wrap lines 269–293 in `try { ... } finally { clearTimeout(timeoutId); }`.
2. **DEF-M1-04**:
   - In `mobile/src/storage/asyncStorageAdapter.ts`, add property `private indexQueues: Map<string, Promise<any>> = new Map();` and private method `enqueueIndexOp<T>(store: string, op: () => Promise<T>): Promise<T>`.
   - Wrap index modification logic in `saveItem`, `deleteItem`, and `clearStore` within `enqueueIndexOp(store, ...)`.
   - In `clearAll()`, add `this.indexQueues.clear()`.

---

## 5. Verification Method

### 5.1 Verification Commands
The Worker can verify the fixes using the following commands:
```bash
# 1. Typecheck: Zero TypeScript errors
cd mobile
npm run typecheck

# 2. Run Tier 5 Adversarial Stress Test Suite
npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts --verbose

# 3. Run Full Test Suite (18 suites, 468+ tests)
npm test
```

### 5.2 Files to Inspect
- `mobile/src/services/syncEngine.ts` (lines 265–298)
- `mobile/src/storage/asyncStorageAdapter.ts` (lines 10–96)
- `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts` (lines 205–223)

### 5.3 Invalidation Conditions
- If `ADV-DEFECT-CONCURRENT-WRITES` reports fewer than 5 indexed items after running 5 concurrent `saveItem` calls, the queue synchronization is invalid.
- If `npm run typecheck` produces any error, the fix syntax is invalid.
- If a rejected `fetch` in `syncOutbox` fails to invoke `clearTimeout`, the DEF-M1-03 fix is invalid.
