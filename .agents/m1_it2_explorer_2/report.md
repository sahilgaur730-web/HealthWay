# Investigation & Fix Specification Report: DEF-M1-03 & DEF-M1-04

**Agent**: `m1_it2_explorer_2` (M1 Sync Defect Fix Explorer)  
**Milestone**: Milestone 1 Iteration 2  
**Assigned Scope**: 
1. **DEF-M1-03**: Timer Resource Leak in `mobile/src/services/syncEngine.ts:267-285`
2. **DEF-M1-04**: Store Index Race Condition in `mobile/src/storage/asyncStorageAdapter.ts:61-70`  
**Date**: 2026-09-07  

---

## 1. Executive Summary

Milestone 1 Iteration 1 concluded with a **FAIL** verdict from Adversarial Challenger 1 (`m1_challenger_1`) due to four defects identified in the storage and synchronization engines. This report provides the complete, read-only architectural investigation, root-cause forensic analysis, and exact drop-in implementation code specifications for **DEF-M1-03** and **DEF-M1-04** to enable the Worker (`m1_worker_1`) to apply clean, bug-free fixes with zero regressions.

- **DEF-M1-03 Fix**: Enclose the native `fetch` execution inside an inner `try ... finally` block within `SyncEngine.syncOutbox()`, ensuring `clearTimeout(timeoutId)` is deterministically executed whether `fetch` succeeds, encounters HTTP error responses, or rejects due to network/socket/DNS failures.
- **DEF-M1-04 Fix**: Introduce a store-level Promise serialization queue (`enqueueIndexOp`) in `AsyncStorageAdapter` that guarantees atomic read-modify-write cycles on store indexes during concurrent `saveItem`, `deleteItem`, and `clearStore` invocations. This resolves the empirical defect where 5 concurrent writes resulted in 4 dropped keys (`indexed count: 1, getAll: 1`), restoring 100% data integrity (`indexed count: 5, getAll: 5`).

---

## 2. DEF-M1-03: Timer Resource Leak in `SyncEngine.syncOutbox`

### 2.1 Component & Line Location
- **File**: `mobile/src/services/syncEngine.ts`
- **Method**: `public async syncOutbox(apiHandler?: (item: SyncQueueItem) => Promise<boolean>): Promise<SyncSummary>`
- **Line Range**: 265–297

### 2.2 Verbatim Existing Code
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
285:               // Unrecoverable 4xx client error
286:               success = false;
287:               errorMessage = `Client Error ${response.status}`;
288:             } else {
289:               // 5xx server error
290:               success = false;
291:               errorMessage = `Server Error ${response.status}`;
292:             }
293:           }
294:         } catch (err: any) {
295:           success = false;
296:           errorMessage = err?.message || 'Network request failed';
297:         }
```

### 2.3 Root Cause & Failure Mechanism
1. Line 267 creates a 10,000ms timer handle: `const timeoutId = setTimeout(() => controller.abort(), 10000);`.
2. Line 280 clears the timer: `clearTimeout(timeoutId);`.
3. However, line 280 is situated sequentially **after** `await fetch(item.endpoint, ...)`.
4. If `fetch()` throws or rejects (which occurs on any standard network anomaly: device going offline mid-batch, DNS failure, connection refused, SSL failure, or AbortError), the runtime immediately short-circuits execution and jumps to line 294: `catch (err: any)`.
5. As a direct consequence, `clearTimeout(timeoutId)` at line 280 is **never reached**.
6. The uncollected 10-second timer handle remains active in the V8 / Node.js / React Native JavaScript event loop.
7. Impact:
   - In Node.js / Jest test environments, active open handles prevent the test runner from exiting cleanly, triggering `--detectOpenHandles` warnings and slowing suite completion.
   - On mobile devices (Android / iOS), orphaned background timers keep threads awake, degrade battery efficiency, and consume timer queue slots during repeated failed sync attempts.
   - When the 10-second timer eventually expires, it invokes `controller.abort()` on an already aborted or dead request, generating redundant callback noise.

### 2.4 Exact Code Fix Specification
In `mobile/src/services/syncEngine.ts`, wrap the `compressPayload`, `fetch`, and status resolution inside a `try ... finally` block, placing `clearTimeout(timeoutId)` inside the `finally` block.

#### Target File: `mobile/src/services/syncEngine.ts`
**StartLine**: 264  
**EndLine**: 294

#### Replacement Content:
```typescript
          if (apiHandler) {
            success = await apiHandler(item);
          } else {
            // Native fetch execution
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
              const compressed = this.compressPayload(item.payload);
              const response = await fetch(item.endpoint, {
                method: item.method,
                headers: {
                  'Content-Type': 'application/json',
                  'X-HealthWay-Sync': 'Outbox-V1',
                  'X-Idempotency-Key': item.id,
                },
                body: item.method !== 'DELETE' ? JSON.stringify(compressed) : undefined,
                signal: controller.signal,
              });

              if (response.ok) {
                success = true;
              } else if (response.status >= 400 && response.status < 500) {
                // Unrecoverable 4xx client error
                success = false;
                errorMessage = `Client Error ${response.status}`;
              } else {
                // 5xx server error
                success = false;
                errorMessage = `Server Error ${response.status}`;
              }
            } finally {
              clearTimeout(timeoutId);
            }
          }
```

### 2.5 Analysis of Fix Behavior Across All Scenarios
| Scenario | Behavior with Fix |
|---|---|
| **HTTP 200 OK** | `response.ok` is true -> `finally` executes `clearTimeout(timeoutId)` -> continues to line 299 with `success = true`. |
| **HTTP 4xx Client Error** | `response.status` 400-499 -> `finally` executes `clearTimeout(timeoutId)` -> continues to line 299 with `success = false`, `errorMessage = 'Client Error 4xx'`. |
| **HTTP 5xx Server Error** | `response.status` 500+ -> `finally` executes `clearTimeout(timeoutId)` -> continues to line 299 with `success = false`, `errorMessage = 'Server Error 5xx'`. |
| **Network Failure (DNS, offline, TCP reset)** | `fetch` throws `TypeError` -> `finally` executes `clearTimeout(timeoutId)` immediately -> outer `catch` sets `errorMessage = err?.message || 'Network request failed'` -> timer is canceled within milliseconds. |
| **10s Request Timeout** | Timer fires at 10s, calls `controller.abort()` -> `fetch` throws `AbortError` -> `finally` executes `clearTimeout(timeoutId)` (safe idempotent call) -> outer `catch` handles error -> no dangling handles. |

---

## 3. DEF-M1-04: Store Index Race Condition in `AsyncStorageAdapter`

### 3.1 Component & Line Location
- **File**: `mobile/src/storage/asyncStorageAdapter.ts`
- **Methods**: `saveItem` (lines 61–70), `deleteItem` (lines 72–79), `clearStore` (lines 81–88), `clearAll` (lines 90–96)

### 3.2 Verbatim Existing Code
```typescript
26:   private async getIndex(store: string): Promise<string[]> {
27:     const raw = await AsyncStorage.getItem(this.getIndexKey(store));
28:     return raw ? JSON.parse(raw) : [];
29:   }
30: 
31:   private async saveIndex(store: string, index: string[]): Promise<void> {
32:     await AsyncStorage.setItem(this.getIndexKey(store), JSON.stringify(index));
33:   }
...
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
71: 
72:   public async deleteItem(store: string, id: string): Promise<void> {
73:     const key = this.getItemKey(store, id);
74:     await AsyncStorage.removeItem(key);
75: 
76:     const index = await this.getIndex(store);
77:     const updated = index.filter((item) => item !== id);
78:     await this.saveIndex(store, updated);
79:   }
```

### 3.3 Root Cause & Empirical Evidence
1. `@react-native-async-storage/async-storage` is an asynchronous key-value store lacking native SQL table indexing.
2. To support `getAll(store)` and `getStoreCount(store)`, `AsyncStorageAdapter` maintains an index key `@healthway:index:<store>` containing a JSON array of keys.
3. In `saveItem(store, id, data)`:
   - Line 63 asynchronously writes the item payload: `await AsyncStorage.setItem(key, ...)`.
   - Line 65 asynchronously fetches the index: `const index = await this.getIndex(store);`.
   - Line 67 mutates the array: `index.push(id)`.
   - Line 68 asynchronously saves the mutated array: `await this.saveIndex(store, index);`.
4. When multiple `saveItem()` calls are issued concurrently (e.g. via `Promise.all`), all concurrent executions read the index before any execution writes the updated index.
5. Every execution receives the same stale initial snapshot (e.g. `[]`), appends only its own single key, and overwrites the index key. The last write clobbers all preceding concurrent writes.
6. **Empirical Reproduction Finding**:
   In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts:205-223` (`ADV-DEFECT-CONCURRENT-WRITES`):
   ```
   [EMPIRICAL CONCURRENCY FINDING] 5 concurrent writes -> indexed count: 1, getAll: 1
   ```
   Out of 5 concurrent writes (`c1`, `c2`, `c3`, `c4`, `c5`), **4 keys were dropped from the store index**.
   Although the individual keys `@healthway:store:patient_cache:c1..c5` existed in AsyncStorage, `storage.getAll('patient_cache')` only returned 1 item, and `storage.getStoreCount('patient_cache')` reported 1 instead of 5.
7. The same race condition exists in `deleteItem(store, id)` (lines 76–78): concurrent `deleteItem` and `saveItem` calls clobber each other's updates.

### 3.4 Architecture Selection: Store-Level Promise Queue vs In-Memory Key Cache

| Criteria | In-Memory Set Cache (`Map<string, Set<string>>`) | Store-Level Promise Queue (`indexQueues: Map<string, Promise<any>>`) |
|---|---|---|
| **Concurrency Protection** | Only protects synchronous mutations; still races on initial async load from AsyncStorage | **100% serializes read-modify-write cycles** per store |
| **External State Sync** | Stale if `AsyncStorage.clear()` or external resets occur | **Always reads persistent AsyncStorage**; single source of truth |
| **Multi-Store Concurrency** | Blocks or tracks sets globally | Independent queue per store: concurrent writes to `patient_cache` and `medicine_stock` run in parallel |
| **Memory Management** | Retains all IDs indefinitely in RAM | Automatically cleans up promise handles when queue is idle |
| **Verdict** | Prone to cache drift across tests | **RECOMMENDED & ADOPTED** |

### 3.5 Exact Code Fix Specification
In `mobile/src/storage/asyncStorageAdapter.ts`:
1. Add `private indexQueues: Map<string, Promise<any>> = new Map();` as a class property.
2. Add a private helper `enqueueIndexOp<T>(store: string, op: () => Promise<T>): Promise<T>`:
   - Chains the new operation onto the existing Promise for that store.
   - Catches any error on the previous promise so one failed write does not halt subsequent queued operations.
   - Cleans up the queue map entry in `finally` if the queue has drained.
3. Wrap the index read-modify-write logic in `saveItem`, `deleteItem`, and `clearStore` using `enqueueIndexOp`.
4. In `clearAll()`, clear `this.indexQueues.clear()`.

#### Target File: `mobile/src/storage/asyncStorageAdapter.ts`

```typescript
export class AsyncStorageAdapter implements StorageAdapter {
  private keyPrefix = '@healthway:store:';
  private indexPrefix = '@healthway:index:';
  private indexQueues: Map<string, Promise<any>> = new Map();

  public async init(): Promise<void> {
    // AsyncStorage does not require explicit DDL initialization
  }

  /**
   * Serializes index operations per store to prevent concurrent read-modify-write races
   */
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

  private getItemKey(store: string, id: string): string {
    return `${this.keyPrefix}${store}:${id}`;
  }

  private getIndexKey(store: string): string {
    return `${this.indexPrefix}${store}`;
  }

  private async getIndex(store: string): Promise<string[]> {
    const raw = await AsyncStorage.getItem(this.getIndexKey(store));
    return raw ? JSON.parse(raw) : [];
  }

  private async saveIndex(store: string, index: string[]): Promise<void> {
    await AsyncStorage.setItem(this.getIndexKey(store), JSON.stringify(index));
  }

  public async getItem<T>(store: string, id: string): Promise<T | null> {
    const key = this.getItemKey(store, id);
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  public async getAll<T>(store: string): Promise<T[]> {
    const ids = await this.getIndex(store);
    if (ids.length === 0) return [];

    const keys = ids.map((id) => this.getItemKey(store, id));
    const pairs = await AsyncStorage.multiGet(keys);
    const results: T[] = [];

    for (const [, value] of pairs) {
      if (value) {
        try {
          results.push(JSON.parse(value));
        } catch {
          // Skip corrupted entries
        }
      }
    }
    return results;
  }

  public async saveItem<T>(store: string, id: string, data: T): Promise<void> {
    const key = this.getItemKey(store, id);
    await AsyncStorage.setItem(key, JSON.stringify(data));

    await this.enqueueIndexOp(store, async () => {
      const index = await this.getIndex(store);
      if (!index.includes(id)) {
        index.push(id);
        await this.saveIndex(store, index);
      }
    });
  }

  public async deleteItem(store: string, id: string): Promise<void> {
    const key = this.getItemKey(store, id);
    await AsyncStorage.removeItem(key);

    await this.enqueueIndexOp(store, async () => {
      const index = await this.getIndex(store);
      const updated = index.filter((item) => item !== id);
      await this.saveIndex(store, updated);
    });
  }

  public async clearStore(store: string): Promise<void> {
    await this.enqueueIndexOp(store, async () => {
      const ids = await this.getIndex(store);
      if (ids.length > 0) {
        const keys = ids.map((id) => this.getItemKey(store, id));
        await AsyncStorage.multiRemove(keys);
      }
      await AsyncStorage.removeItem(this.getIndexKey(store));
    });
  }

  public async clearAll(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter((k) => k.startsWith('@healthway:'));
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
    }
    this.indexQueues.clear();
  }
```

### 3.6 Trace of Concurrent Writes with `enqueueIndexOp`
When 5 concurrent writes run via `Promise.all`:
1. **Item Payloads**: All 5 call `AsyncStorage.setItem(key, ...)` concurrently. Each writes to a distinct key (`...:c1`, `...:c2`, etc.), which is fully safe.
2. **Index Queue**:
   - `c1` enters `enqueueIndexOp`: reads `[]`, writes `['c1']`.
   - `c2` waits for `c1`: reads `['c1']`, writes `['c1', 'c2']`.
   - `c3` waits for `c2`: reads `['c1', 'c2']`, writes `['c1', 'c2', 'c3']`.
   - `c4` waits for `c3`: reads `['c1', 'c2', 'c3']`, writes `['c1', 'c2', 'c3', 'c4']`.
   - `c5` waits for `c4`: reads `['c1', 'c2', 'c3', 'c4']`, writes `['c1', 'c2', 'c3', 'c4', 'c5']`.
3. **Outcome**:
   - `getStoreCount('patient_cache')` returns **5** (was 1).
   - `getAll('patient_cache').length` returns **5** (was 1).
   - Zero dropped keys.
   - `this.indexQueues` entry for `'patient_cache'` is automatically cleaned up when the last promise resolves.

---

## 4. Inter-Explorer Synergy & Non-Interference Plan

`mobile/src/storage/asyncStorageAdapter.ts` is referenced in both Explorer 1's and Explorer 2's assignments:
- **Explorer 1 (`m1_it2_explorer_1`)**:
  - `DEF-M1-01`: Persist `retries` count in `updateSyncStatus()` when updating to `'PENDING'`.
  - `DEF-M1-02`: Priority ordering in `getPendingSyncItems()` (`priority ASC, timestamp ASC`).
  - Target lines: Lines 118–136.
- **Explorer 2 (`m1_it2_explorer_2` — this report)**:
  - `DEF-M1-04`: Store index concurrency protection via `enqueueIndexOp` in `saveItem`, `deleteItem`, `clearStore`, `clearAll`.
  - Target lines: Lines 10–96.

**Result**: Zero overlap or conflict! The Worker can apply both sets of changes to `asyncStorageAdapter.ts` without merge friction.

---

## 5. Verification Plan for Worker (`m1_worker_1`)

### 5.1 Verification Commands
```bash
# 1. Typecheck: Must produce zero errors
cd mobile
npm run typecheck

# 2. Run Tier 5 Adversarial Stress Suite: All 27 tests must pass
npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts --verbose

# 3. Run Full Test Suite: All 18 suites (468 tests) must pass
npm test
```

### 5.2 Specific Test Assertions to Upgrade in `storage_and_sync_stress.test.ts`
In `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts:205-223` (`ADV-DEFECT-CONCURRENT-WRITES`), the Worker should assert the fixed behavior:
```typescript
    expect(count).toBe(5);
    expect(all).toHaveLength(5);
    expect(all.map((p: any) => p.name).sort()).toEqual([
      'Patient 1',
      'Patient 2',
      'Patient 3',
      'Patient 4',
      'Patient 5',
    ]);
```

### 5.3 Unit Test for DEF-M1-03 Timer Leak Prevention
The Worker should add an explicit test in `storage_and_sync_stress.test.ts` to guarantee `clearTimeout` is called on network failure:
```typescript
  it('ADV-DEF-M1-03: clears timeoutId in finally block when fetch rejects with network error', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED: Network failure'));

    try {
      await storage.enqueueSync('/api/v1/network-fail', 'POST', { test: true });
      const summary = await syncEngine.syncOutbox();
      expect(summary.failed).toBe(1);
      // Verify clearTimeout was deterministically invoked
      expect(clearTimeoutSpy).toHaveBeenCalled();
    } finally {
      clearTimeoutSpy.mockRestore();
      global.fetch = originalFetch;
    }
  });
```

---

## 6. Summary of Target Modifications for Worker

| Defect ID | Target File | Action | Code Summary |
|---|---|---|---|
| **DEF-M1-03** | `mobile/src/services/syncEngine.ts` | Wrap lines 269–293 in `try ... finally` | Move `clearTimeout(timeoutId)` into `finally` block |
| **DEF-M1-04** | `mobile/src/storage/asyncStorageAdapter.ts` | Add `enqueueIndexOp` method and wrap index logic in `saveItem`, `deleteItem`, `clearStore` | Serializes read-modify-write on index per store |
