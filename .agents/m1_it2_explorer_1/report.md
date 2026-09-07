# M1 Storage Defect Fix Strategy Report (DEF-M1-01 & DEF-M1-02)

**Agent**: `m1_it2_explorer_1` (M1 Storage Defect Fix Explorer)  
**Milestone**: Milestone 1 (M1) Iteration 2  
**Target Subsystem**: Offline Storage & Sync Engine (`mobile/src/storage/`, `mobile/src/services/`)  
**Target Defects**:
- **DEF-M1-01**: Retry Counter Unpersisted on Temporary Failure (`updateSyncStatus` with `'PENDING'`)
- **DEF-M1-02**: Priority Inversion in Outbox (`AsyncStorageAdapter.getPendingSyncItems()` missing priority sort)

---

## 1. Executive Summary

This report establishes the complete root-cause analysis and exact, machine-applicable code remediation strategy for defects **DEF-M1-01** and **DEF-M1-02**, identified during Iteration 1 adversarial validation by `m1_challenger_1`.

1. **DEF-M1-01 Fix**: In both `AsyncStorageAdapter` and `SQLiteStorageAdapter`, `updateSyncStatus` will persist incremented `retries` when updating an item to status `'PENDING'` (or when explicit `retries` is supplied). This ensures that exponential backoff delay (`2^retries * 500ms`) is executed on subsequent attempts and guarantees terminal exit at `newRetries >= 5` (`FAILED`), preventing infinite retry loops.
2. **DEF-M1-02 Fix**: In `AsyncStorageAdapter.getPendingSyncItems()`, items will be ordered by `(priority ?? 3) ASC, timestamp ASC`, matching `SQLiteStorageAdapter` (with `COALESCE(priority, 3)`). This ensures Priority 1 (Emergency SOS) payloads are always dispatched before Priority 2 (Routine Vitals) and Priority 3 (Background/Unspecified) payloads, preventing critical emergency dispatch starvation in low-connectivity rural environments.
3. **Test Invalidation & Alignment**: Identifies that Tier 5 tests `ADV-DEFECT-RETRY-PERSISTENCE` and `ADV-DEFECT-PRIORITY-ORDERING` in `storage_and_sync_stress.test.ts` were written by Challenger 1 to assert the buggy state. These assertions must be inverted to assert the corrected behavior as part of the remediation.

---

## 2. Deep-Dive Defect Analysis

### 2.1 DEF-M1-01: Retry Counter Unpersisted on Temporary Failure

#### Evidence Chain & Root Cause:
1. **Sync Engine Retry Branch** (`mobile/src/services/syncEngine.ts:311-330`):
   ```typescript
   failed++;
   const newRetries = (item.retries || 0) + 1;
   if (newRetries >= 5 || (errorMessage && errorMessage.startsWith('Client Error'))) {
     await this.storage.updateSyncStatus(item.id, 'FAILED', errorMessage || 'Max retries exceeded');
     // ...
   } else {
     // Restore to PENDING with incremented retries for next cycle
     await this.storage.updateSyncStatus(item.id, 'PENDING', errorMessage);
     itemResults.push({ id: item.id, status: 'RETRY' });
   }
   ```
   The engine attempts to restore the item to `'PENDING'` for the next outbox cycle.
2. **AsyncStorage Adapter Defect** (`mobile/src/storage/asyncStorageAdapter.ts:128-135`):
   ```typescript
   const item = await this.getItem<SyncQueueItem>('sync_queue', id);
   if (item) {
     item.status = status;
     item.lastAttempt = Date.now();
     if (error) item.error = error;
     if (status === 'FAILED') item.retries = (item.retries || 0) + 1; // <--- ONLY increments on FAILED!
     await this.saveItem('sync_queue', id, item);
   }
   ```
   When `status === 'PENDING'`, `item.retries` is untouched and remains `0`.
3. **SQLite Adapter Defect** (`mobile/src/storage/sqliteAdapter.ts:203-217`):
   ```typescript
   if (status === 'FAILED') {
     await this.db.runAsync(
       `UPDATE sync_queue
        SET status = ?, retries = retries + 1, last_attempt = ?, error = ?
        WHERE id = ?`,
       [status, Date.now(), error || null, id]
     );
   } else {
     await this.db.runAsync(
       `UPDATE sync_queue
        SET status = ?, last_attempt = ?, error = ?
        WHERE id = ?`, // <--- retries untouched on PENDING!
       [status, Date.now(), error || null, id]
     );
   }
   ```
4. **Cascading Failure**:
   - On the next sync pass, `getPendingSyncItems()` retrieves the item with `retries = 0`.
   - Line 251: `if (item.retries > 0)` evaluates to `false` -> Exponential backoff delay is NEVER executed.
   - Line 312: `const newRetries = (item.retries || 0) + 1` evaluates to `0 + 1 = 1` repeatedly.
   - Line 313: `newRetries >= 5` is NEVER met.
   - The queue item loops infinitely on transient network outages.

---

### 2.2 DEF-M1-02: Missing Priority Ordering in `AsyncStorageAdapter`

#### Evidence Chain & Root Cause:
1. **AsyncStorage Adapter Defect** (`mobile/src/storage/asyncStorageAdapter.ts:118-121`):
   ```typescript
   public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
     const all = await this.getAll<SyncQueueItem>('sync_queue');
     return all.filter((item) => item.status === 'PENDING' || item.status === 'FAILED');
   }
   ```
   Items are returned in key iteration order (FIFO insertion order), ignoring `priority`.
2. **SQLite Adapter Implementation** (`mobile/src/storage/sqliteAdapter.ts:184-190`):
   ```typescript
   const rows = await this.db.getAllAsync(
     `SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
      ORDER BY priority ASC, timestamp ASC`
   );
   ```
   `sqliteAdapter` sorts by `priority ASC, timestamp ASC`.
3. **Impact**:
   - In rural clinics or headless/mock environments operating under `AsyncStorageAdapter`, an Emergency SOS dispatch (`priority: 1`, e.g. cardiac arrest, maternal hemorrhage) enqueued after routine vitals (`priority: 2`) is queued behind the vitals payload.
   - If connectivity drops after syncing 1 item, the emergency transmission is blocked.

---

## 3. Exact Code Fix Proposals

### 3.1 Target: `mobile/src/storage/asyncStorageAdapter.ts`

#### Proposed Change A: Fix DEF-M1-02 (Priority & Timestamp Ordering)
Lines 118–121:
```typescript
<<<<
  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const all = await this.getAll<SyncQueueItem>('sync_queue');
    return all.filter((item) => item.status === 'PENDING' || item.status === 'FAILED');
  }
====
  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const all = await this.getAll<SyncQueueItem>('sync_queue');
    return all
      .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
      .sort(
        (a, b) =>
          (a.priority ?? 3) - (b.priority ?? 3) || a.timestamp - b.timestamp
      );
  }
>>>>
```

#### Proposed Change B: Fix DEF-M1-01 (Retry Counter Persistence)
Lines 123–136:
```typescript
<<<<
  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string
  ): Promise<void> {
    const item = await this.getItem<SyncQueueItem>('sync_queue', id);
    if (item) {
      item.status = status;
      item.lastAttempt = Date.now();
      if (error) item.error = error;
      if (status === 'FAILED') item.retries = (item.retries || 0) + 1;
      await this.saveItem('sync_queue', id, item);
    }
  }
====
  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string,
    retries?: number
  ): Promise<void> {
    const item = await this.getItem<SyncQueueItem>('sync_queue', id);
    if (item) {
      item.status = status;
      item.lastAttempt = Date.now();
      if (error !== undefined) item.error = error;
      if (retries !== undefined) {
        item.retries = retries;
      } else if (status === 'FAILED' || status === 'PENDING') {
        item.retries = (item.retries || 0) + 1;
      }
      await this.saveItem('sync_queue', id, item);
    }
  }
>>>>
```

#### Proposed Change C: Support Priority in `enqueueSync`
Lines 98–116:
```typescript
<<<<
  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any
  ): Promise<SyncQueueItem> {
    const id = `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const item: SyncQueueItem = {
      id,
      endpoint,
      method: method as any,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'PENDING',
    };

    await this.saveItem('sync_queue', id, item);
    return item;
  }
====
  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any,
    priority: number = 2
  ): Promise<SyncQueueItem> {
    const id = `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const item: SyncQueueItem = {
      id,
      endpoint,
      method: method as any,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'PENDING',
      priority,
    };

    await this.saveItem('sync_queue', id, item);
    return item;
  }
>>>>
```

---

### 3.2 Target: `mobile/src/storage/sqliteAdapter.ts`

#### Proposed Change A: Fix DEF-M1-01 (Retry Persistence in SQLite)
Lines 197–218:
```typescript
<<<<
  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string
  ): Promise<void> {
    this.ensureReady();
    if (status === 'FAILED') {
      await this.db.runAsync(
        `UPDATE sync_queue
         SET status = ?, retries = retries + 1, last_attempt = ?, error = ?
         WHERE id = ?`,
        [status, Date.now(), error || null, id]
      );
    } else {
      await this.db.runAsync(
        `UPDATE sync_queue
         SET status = ?, last_attempt = ?, error = ?
         WHERE id = ?`,
        [status, Date.now(), error || null, id]
      );
    }
  }
====
  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string,
    retries?: number
  ): Promise<void> {
    this.ensureReady();
    if (retries !== undefined) {
      await this.db.runAsync(
        `UPDATE sync_queue
         SET status = ?, retries = ?, last_attempt = ?, error = ?
         WHERE id = ?`,
        [status, retries, Date.now(), error || null, id]
      );
    } else if (status === 'FAILED' || status === 'PENDING') {
      await this.db.runAsync(
        `UPDATE sync_queue
         SET status = ?, retries = retries + 1, last_attempt = ?, error = ?
         WHERE id = ?`,
        [status, Date.now(), error || null, id]
      );
    } else {
      await this.db.runAsync(
        `UPDATE sync_queue
         SET status = ?, last_attempt = ?, error = ?
         WHERE id = ?`,
        [status, Date.now(), error || null, id]
      );
    }
  }
>>>>
```

#### Proposed Change B: Fix DEF-M1-02 & SQLite NULL Safety
Lines 184–195:
```typescript
<<<<
  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    this.ensureReady();
    const rows = await this.db.getAllAsync(
      `SELECT * FROM sync_queue
       WHERE status IN ('PENDING', 'FAILED')
       ORDER BY priority ASC, timestamp ASC`
    );
    return rows.map((r: any) => ({
      ...r,
      payload: JSON.parse(r.payload),
    }));
  }
====
  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    this.ensureReady();
    const rows = await this.db.getAllAsync(
      `SELECT * FROM sync_queue
       WHERE status IN ('PENDING', 'FAILED')
       ORDER BY COALESCE(priority, 3) ASC, timestamp ASC`
    );
    return rows.map((r: any) => ({
      ...r,
      payload: JSON.parse(r.payload),
    }));
  }
>>>>
```

#### Proposed Change C: Support Priority in `enqueueSync`
Lines 163–182:
```typescript
<<<<
  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any
  ): Promise<SyncQueueItem> {
    const id = `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const item: SyncQueueItem = {
      id,
      endpoint,
      method: method as any,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'PENDING',
    };

    await this.saveItem('sync_queue', id, item);
    return item;
  }
====
  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any,
    priority: number = 2
  ): Promise<SyncQueueItem> {
    const id = `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const item: SyncQueueItem = {
      id,
      endpoint,
      method: method as any,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'PENDING',
      priority,
    };

    await this.saveItem('sync_queue', id, item);
    return item;
  }
>>>>
```

---

### 3.3 Supporting File: `mobile/src/storage/types.ts`

Update interface signature for `StorageAdapter`:
Lines 16–23:
```typescript
<<<<
export interface StorageAdapter extends OfflineStorageAPI {
  init(): Promise<void>;
  clearStore(store: string): Promise<void>;
  clearAll(): Promise<void>;
  updateSyncStatus(id: string, status: SyncQueueItem['status'], error?: string): Promise<void>;
  removeSyncItem(id: string): Promise<void>;
  getStoreCount(store: string): Promise<number>;
}
====
export interface StorageAdapter extends OfflineStorageAPI {
  init(): Promise<void>;
  clearStore(store: string): Promise<void>;
  clearAll(): Promise<void>;
  updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string,
    retries?: number
  ): Promise<void>;
  removeSyncItem(id: string): Promise<void>;
  getStoreCount(store: string): Promise<number>;
}
>>>>
```

---

### 3.4 Supporting File: `mobile/src/storage/storageEngine.ts`

Update forwarding methods:
Lines 107–128:
```typescript
<<<<
  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any
  ): Promise<SyncQueueItem> {
    await this.initialize();
    return this.activeAdapter.enqueueSync(endpoint, method, payload) as Promise<SyncQueueItem>;
  }

  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    await this.initialize();
    return this.activeAdapter.getPendingSyncItems();
  }

  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string
  ): Promise<void> {
    await this.initialize();
    return this.activeAdapter.updateSyncStatus(id, status, error);
  }
====
  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any,
    priority?: number
  ): Promise<SyncQueueItem> {
    await this.initialize();
    return (this.activeAdapter as any).enqueueSync(endpoint, method, payload, priority) as Promise<SyncQueueItem>;
  }

  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    await this.initialize();
    return this.activeAdapter.getPendingSyncItems();
  }

  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string,
    retries?: number
  ): Promise<void> {
    await this.initialize();
    return this.activeAdapter.updateSyncStatus(id, status, error, retries);
  }
>>>>
```

---

## 4. Test Alignment & Invalidation Analysis

### 4.1 Update Assertions in `mobile/__tests__/tier5_adversarial/storage_and_sync_stress.test.ts`

1. **Test 14 (`ADV-DEFECT-RETRY-PERSISTENCE`)**:
   - Lines 383–407:
   - Line 406 currently asserts `expect(storedItem?.retries).toBe(0);`
   - **Fix Action**: Change assertion to:
     ```typescript
     // Verified remediation of DEF-M1-01: retries increments to 1 on PENDING status
     expect(storedItem?.retries).toBe(1);
     ```
2. **Test 16 (`ADV-DEFECT-PRIORITY-ORDERING`)**:
   - Lines 469–472 currently assert:
     ```typescript
     if (storage.getBackendType() === 'async_storage') {
       expect(pending[0].id).toBe(routineId);
       expect(pending[1].id).toBe(emergencyId);
     }
     ```
   - **Fix Action**: Change assertion to:
     ```typescript
     // Verified remediation of DEF-M1-02: emergency (priority 1) comes before routine (priority 2)
     expect(pending[0].id).toBe(emergencyId);
     expect(pending[0].priority).toBe(1);
     expect(pending[1].id).toBe(routineId);
     expect(pending[1].priority).toBe(2);
     ```

### 4.2 Add New Comprehensive Regression Tests
Add two dedicated tests in `storage_and_sync_stress.test.ts`:
1. **Full 5-cycle exponential retry test**:
   Enqueue item, fail 5 consecutive `syncOutbox()` runs, verify `retries` progresses `1 -> 2 -> 3 -> 4 -> 5`, backoff increases progressively, and item transitions to terminal `'FAILED'` after cycle 5.
2. **Complex 5-item priority sorting test**:
   Enqueue `[unspecified, priority 2, priority 1, priority 3, priority 1 (later)]`.
   Verify `getPendingSyncItems()` returns exact order:
   `[priority 1 (t1), priority 1 (t2), priority 2, priority 3 / unspecified]`.

---

## 5. Verification Matrix

| Step | Verification Command | Target / Expected Result |
|---|---|---|
| 1 | `npm run typecheck` | 0 errors across entire `mobile/` workspace (`tsc --noEmit`). |
| 2 | `npx jest __tests__/tier5_adversarial/storage_and_sync_stress.test.ts` | All 27 tests pass including updated DEF-M1-01 and DEF-M1-02 assertions. |
| 3 | `npm test` | All 18 test suites and 468+ tests pass cleanly. |
| 4 | Manual diff inspection | Zero changes outside `mobile/`. |
