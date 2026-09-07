/**
 * Tier 5: Adversarial Stress Suite — Storage Engine & Sync Engine
 * M1 Empirical Challenge:
 * 1. Storage CRUD operations across all 8 stores (sync_queue, patient_cache, triage_drafts,
 *    medicine_stock, facility_data, referral_drafts, settings, sync_log).
 * 2. Sync queue enqueueing, priority ordering (emergency first), and exponential backoff retry math.
 * 3. Fallback behavior when primary storage encounters faults.
 * 4. Stress, boundary payloads, and concurrency resilience.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { StorageEngine } from '../../src/storage/storageEngine';
import { SQLiteStorageAdapter } from '../../src/storage/sqliteAdapter';
import { SyncEngine } from '../../src/services/syncEngine';
import { StoreName, SyncQueueItem } from '../../src/types/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_8_STORES: StoreName[] = [
  'sync_queue',
  'patient_cache',
  'triage_drafts',
  'medicine_stock',
  'facility_data',
  'referral_drafts',
  'settings',
  'sync_log',
];

describe('Tier 5 Adversarial: 8-Store CRUD Operations on Real Storage Engine', () => {
  let storage: StorageEngine;

  beforeEach(async () => {
    await AsyncStorage.clear();
    storage = new StorageEngine();
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.clearAll();
  });

  // Test 1: CRUD verification across each of the 8 stores
  test.each(ALL_8_STORES)(
    'ADV-CRUD-%s: executes full CRUD cycle on store "%s"',
    async (store) => {
      const id = `item-${store}-001`;
      const initialPayload = { storeName: store, active: true, count: 42 };
      const updatedPayload = { storeName: store, active: false, count: 99, notes: 'updated' };

      // 1. Initial count is 0
      expect(await storage.getStoreCount(store)).toBe(0);

      // 2. Save item
      await storage.saveItem(store, id, initialPayload);
      expect(await storage.getStoreCount(store)).toBe(1);

      // 3. Get item
      const fetched = await storage.getItem<typeof initialPayload>(store, id);
      expect(fetched).toEqual(initialPayload);

      // 4. Update item
      await storage.saveItem(store, id, updatedPayload);
      expect(await storage.getStoreCount(store)).toBe(1); // count should still be 1 (upsert)
      const fetchedUpdated = await storage.getItem<typeof updatedPayload>(store, id);
      expect(fetchedUpdated).toEqual(updatedPayload);

      // 5. GetAll items
      const allItems = await storage.getAll<typeof updatedPayload>(store);
      expect(allItems).toHaveLength(1);
      expect(allItems[0]).toEqual(updatedPayload);

      // 6. Delete item
      await storage.deleteItem(store, id);
      expect(await storage.getItem(store, id)).toBeNull();
      expect(await storage.getStoreCount(store)).toBe(0);
    }
  );

  // Test 2: Store Name Normalization (snake_case and camelCase)
  it('ADV-NORM: normalizes camelCase store variants to canonical store names', async () => {
    const pairs: Array<[string, StoreName]> = [
      ['syncQueue', 'sync_queue'],
      ['patientCache', 'patient_cache'],
      ['triageDrafts', 'triage_drafts'],
      ['medicineStock', 'medicine_stock'],
      ['facilityData', 'facility_data'],
      ['referralDrafts', 'referral_drafts'],
      ['syncLog', 'sync_log'],
      ['settings', 'settings'],
    ];

    for (const [camel, canonical] of pairs) {
      await storage.saveItem(camel, 'norm-test-1', { data: 'test-value' });
      const itemFromCanonical = await storage.getItem(canonical, 'norm-test-1');
      expect(itemFromCanonical).toEqual({ data: 'test-value' });
      await storage.deleteItem(camel, 'norm-test-1');
    }
  });

  // Test 3: ClearStore isolation
  it('ADV-ISOLATION: clearStore clears only target store and leaves other 7 stores intact', async () => {
    // Populate all 8 stores with 1 item
    for (const store of ALL_8_STORES) {
      await storage.saveItem(store, `id-${store}`, { tag: store });
    }

    // Verify all 8 stores have count 1
    for (const store of ALL_8_STORES) {
      expect(await storage.getStoreCount(store)).toBe(1);
    }

    // Clear only triage_drafts
    await storage.clearStore('triage_drafts');
    expect(await storage.getStoreCount('triage_drafts')).toBe(0);

    // Verify the remaining 7 stores still have count 1
    const otherStores = ALL_8_STORES.filter((s) => s !== 'triage_drafts');
    for (const store of otherStores) {
      expect(await storage.getStoreCount(store)).toBe(1);
      const item = await storage.getItem(store, `id-${store}`);
      expect(item).toEqual({ tag: store });
    }
  });

  // Test 4: ClearAll wipes every store
  it('ADV-CLEARALL: clearAll removes all keys across all stores', async () => {
    for (const store of ALL_8_STORES) {
      await storage.saveItem(store, `item-${store}`, { val: 123 });
    }
    await storage.clearAll();

    for (const store of ALL_8_STORES) {
      expect(await storage.getStoreCount(store)).toBe(0);
      expect(await storage.getItem(store, `item-${store}`)).toBeNull();
      expect(await storage.getAll(store)).toEqual([]);
    }
  });

  // Test 5: Adversarial Payloads (deep nesting, unicode, special characters, large payload)
  it('ADV-PAYLOADS: handles deeply nested objects, multilingual unicode, and large data without corruption', async () => {
    // Deeply nested object (15 levels)
    let deepObj: any = { depth: 15, value: 'bottom' };
    for (let i = 14; i >= 0; i--) {
      deepObj = { level: i, child: deepObj };
    }
    await storage.saveItem('patient_cache', 'nested-patient', deepObj);
    const retrievedNested = await storage.getItem('patient_cache', 'nested-patient');
    expect(retrievedNested).toEqual(deepObj);

    // Multilingual Marathi, Hindi, and special characters
    const multilingual = {
      marathi: 'रुग्ण नोंदणी आणि आरोग्य केंद्र',
      hindi: 'प्राथमिक स्वास्थ्य केंद्र एवं आपातकालीन सेवा',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-= \n\t\\',
      quotes: '"Single \' and "Double" quotes',
    };
    await storage.saveItem('settings', 'i18n-test', multilingual);
    const retrievedI18n = await storage.getItem('settings', 'i18n-test');
    expect(retrievedI18n).toEqual(multilingual);

    // Large payload: 100KB string
    const largeString = 'X'.repeat(100 * 1024);
    await storage.saveItem('facility_data', 'large-record', { blob: largeString });
    const retrievedLarge = await storage.getItem<any>('facility_data', 'large-record');
    expect(retrievedLarge?.blob.length).toBe(100 * 1024);
  });

  // Test 6: Boundary key conditions (non-existent, repeated deletes, empty ids)
  it('ADV-BOUNDARIES: handles non-existent keys, repeated deletes, and missing items gracefully', async () => {
    expect(await storage.getItem('medicine_stock', 'non-existent-id')).toBeNull();
    // Deleting non-existent should not throw
    await expect(storage.deleteItem('medicine_stock', 'non-existent-id')).resolves.toBeUndefined();
    // Clearing already empty store should not throw
    await expect(storage.clearStore('referral_drafts')).resolves.toBeUndefined();
  });

  // Test 7: Sequential high-volume write and read stress (100 items)
  it('ADV-STRESS-100: handles 100 sequential write-read-delete operations cleanly', async () => {
    const BATCH_SIZE = 100;
    for (let i = 0; i < BATCH_SIZE; i++) {
      await storage.saveItem('medicine_stock', `MED-${i}`, {
        code: `MED-${i}`,
        stock: i * 10,
        name: `Medicine Item ${i}`,
      });
    }

    expect(await storage.getStoreCount('medicine_stock')).toBe(BATCH_SIZE);
    const all = await storage.getAll('medicine_stock');
    expect(all).toHaveLength(BATCH_SIZE);

    // Spot check
    const med50 = await storage.getItem<any>('medicine_stock', 'MED-50');
    expect(med50?.stock).toBe(500);

    // Clean up
    await storage.clearStore('medicine_stock');
    expect(await storage.getStoreCount('medicine_stock')).toBe(0);
  });

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
});

describe('Tier 5 Adversarial: Sync Queue, Priority Ordering, and Retry Math', () => {
  let storage: StorageEngine;
  let syncEngine: SyncEngine;

  beforeEach(async () => {
    await AsyncStorage.clear();
    storage = new StorageEngine();
    await storage.initialize();
    syncEngine = new SyncEngine(storage);
    syncEngine.setQuality('EXCELLENT');
  });

  afterEach(async () => {
    if (syncEngine) syncEngine.destroy();
    await storage.clearAll();
  });

  // Test 9: EnqueueSync basic mechanics
  it('ADV-SYNC-ENQUEUE: enqueueSync adds pending items with SYNC- prefix and metadata', async () => {
    const item = await storage.enqueueSync('/api/v1/patients', 'POST', { name: 'Sanjay' });
    expect(item.id).toMatch(/^SYNC-\d+-[a-z0-9]+$/);
    expect(item.endpoint).toBe('/api/v1/patients');
    expect(item.method).toBe('POST');
    expect(item.status).toBe('PENDING');
    expect(item.retries).toBe(0);
    expect(item.timestamp).toBeGreaterThan(0);

    const pending = await storage.getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe(item.id);
  });

  // Test 10: updateSyncStatus and removeSyncItem
  it('ADV-SYNC-STATUS: updateSyncStatus transitions through lifecycle and increments retries on failure', async () => {
    const item = await storage.enqueueSync('/api/v1/test', 'POST', { test: true });

    // Transition to PROCESSING
    await storage.updateSyncStatus(item.id, 'PROCESSING');
    let fetched = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(fetched?.status).toBe('PROCESSING');

    // Transition to FAILED with error
    await storage.updateSyncStatus(item.id, 'FAILED', 'Network 503 Service Unavailable');
    fetched = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(fetched?.status).toBe('FAILED');
    expect(fetched?.retries).toBe(1);
    expect(fetched?.error).toBe('Network 503 Service Unavailable');

    // Second failure increments retries again
    await storage.updateSyncStatus(item.id, 'FAILED', 'Timeout');
    fetched = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(fetched?.retries).toBe(2);

    // Transition to COMPLETED
    await storage.updateSyncStatus(item.id, 'COMPLETED');
    fetched = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(fetched?.status).toBe('COMPLETED');

    // COMPLETED item should not appear in getPendingSyncItems()
    const pending = await storage.getPendingSyncItems();
    expect(pending.find((p) => p.id === item.id)).toBeUndefined();

    // Remove sync item
    await storage.removeSyncItem(item.id);
    fetched = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
    expect(fetched).toBeNull();
  });

  // Test 11: Exponential Backoff Formula Math Stress
  it('ADV-BACKOFF-MATH: calculates exact exponential backoff values and caps at 5000ms', () => {
    // Formula: min(2^retries * 500ms, 5000ms)
    expect(syncEngine.calculateBackoff(0)).toBe(500); // 2^0 * 500 = 500
    expect(syncEngine.calculateBackoff(1)).toBe(1000); // 2^1 * 500 = 1000
    expect(syncEngine.calculateBackoff(2)).toBe(2000); // 2^2 * 500 = 2000
    expect(syncEngine.calculateBackoff(3)).toBe(4000); // 2^3 * 500 = 4000
    expect(syncEngine.calculateBackoff(4)).toBe(5000); // 2^4 * 500 = 8000 -> capped at 5000
    expect(syncEngine.calculateBackoff(5)).toBe(5000); // capped
    expect(syncEngine.calculateBackoff(10)).toBe(5000); // capped
    expect(syncEngine.calculateBackoff(50)).toBe(5000); // capped, no overflow
    expect(syncEngine.calculateBackoff(1000)).toBe(5000); // capped
    expect(syncEngine.calculateBackoff(-1)).toBe(250); // 2^-1 * 500 = 250
  });

  // Test 12: Low-bandwidth payload compression
  it('ADV-COMPRESS: compressPayload trims whitespace and strips null/undefined/empty string properties', () => {
    const rawPayload = {
      name: '  Sunita Patil  ',
      notes: '',
      nullField: null,
      undefinedField: undefined,
      validNumber: 120,
      validBool: false,
      nested: {
        city: '  Satara  ',
        emptyVal: '',
      },
    };

    const compressed = syncEngine.compressPayload(rawPayload);
    expect(compressed).toEqual({
      name: 'Sunita Patil',
      validNumber: 120,
      validBool: false,
      nested: {
        city: 'Satara',
      },
    });

    // Primitive values pass through
    expect(syncEngine.compressPayload(null)).toBeNull();
    expect(syncEngine.compressPayload(undefined)).toBeNull();
    expect(syncEngine.compressPayload('text')).toBe('text');
  });

  // Test 13: Sync Outbox Reentrancy Lock & Offline Prevention
  it('ADV-SYNC-REENTRANCY: prevents duplicate concurrent sync runs and blocks sync while offline', async () => {
    // 1. When OFFLINE, syncOutbox halts immediately
    syncEngine.setQuality('OFFLINE');
    await storage.enqueueSync('/api/v1/sos-off', 'POST', { alert: 'EMERGENCY' });
    const offlineResult = await syncEngine.syncOutbox();
    expect(offlineResult.processed).toBe(0);

    // 2. Clear outbox and set connection to EXCELLENT
    await storage.clearStore('sync_queue');
    syncEngine.setQuality('EXCELLENT');

    // 3. Enqueue fresh item for reentrancy test
    await storage.enqueueSync('/api/v1/slow', 'POST', { slow: true });

    let finishHandler: (() => void) | null = null;
    const slowHandlerPromise = new Promise<void>((resolve) => {
      finishHandler = resolve;
    });

    // First sync run starts and pauses in handler
    const run1 = syncEngine.syncOutbox(async () => {
      await slowHandlerPromise;
      return true;
    });

    // Wait until run 1 is active
    while (!syncEngine.getIsSyncing()) {
      await new Promise((r) => setTimeout(r, 5));
    }

    // Second sync run attempted concurrently
    const run2 = await syncEngine.syncOutbox();
    expect(run2.processed).toBe(0); // Guarded by isSyncing

    // Complete run 1
    if (finishHandler) finishHandler();
    const result1 = await run1;
    expect(result1.processed).toBe(1);
    expect(result1.succeeded).toBe(1);
  });

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

  // Test 15: Client 4xx errors terminate immediately without 5 retries
  it('ADV-CLIENT-ERROR: unrecoverable 4xx client errors terminate immediately as FAILED', async () => {
    jest.spyOn(syncEngine, 'calculateBackoff').mockReturnValue(0);

    const item = await storage.enqueueSync('/api/v1/bad-req', 'POST', { bad: true });

    // Mock native fetch response with 400 Bad Request
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
    }) as any;

    try {
      const summary = await syncEngine.syncOutbox();
      expect(summary.failed).toBe(1);

      const finalItem = await storage.getItem<SyncQueueItem>('sync_queue', item.id);
      expect(finalItem?.status).toBe('FAILED');
      expect(finalItem?.error).toContain('Client Error 400');
    } finally {
      global.fetch = originalFetch;
    }
  });

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
});

describe('Tier 5 Adversarial: Fault Injection & Fallback Behavior', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  // Test 17: Primary storage failure gracefully falls back to AsyncStorageAdapter
  it('ADV-FALLBACK-INIT: falls back to AsyncStorageAdapter when SQLite fails during initialization', async () => {
    const engine = new StorageEngine();
    // Default in Node environment is that expo-sqlite is unavailable
    const backend = await engine.initialize();
    expect(backend).toBe('async_storage');
    expect(engine.getBackendType()).toBe('async_storage');

    // Verify fallback adapter works for standard CRUD
    await engine.saveItem('settings', 'fallback_key', { fallbackWorks: true });
    const item = await engine.getItem<any>('settings', 'fallback_key');
    expect(item?.fallbackWorks).toBe(true);
  });

  // Test 18: Fallback adapter initialization idempotency
  it('ADV-FALLBACK-IDEMPOTENT: repeated initialize() calls return identical backend and do not reset state', async () => {
    const engine = new StorageEngine();
    const backend1 = await engine.initialize();
    await engine.saveItem('patient_cache', 'id-idem', { name: 'Stateful' });

    const backend2 = await engine.initialize();
    const backend3 = await engine.initialize();

    expect(backend1).toBe('async_storage');
    expect(backend2).toBe('async_storage');
    expect(backend3).toBe('async_storage');

    // State is preserved across initialize() calls
    const item = await engine.getItem<any>('patient_cache', 'id-idem');
    expect(item?.name).toBe('Stateful');
  });

  // Test 19: SQLiteStorageAdapter Direct Unit & Priority Verification with Mock Driver
  it('ADV-SQLITE-ADAPTER: SQLiteStorageAdapter enforces priority-first ordering with mock SQLite database', async () => {
    // Mock SQLite database implementation
    const kvStore = new Map<string, string>();
    const syncTable = new Map<string, any>();

    const mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn(async (query: string, params: any[]) => {
        if (query.includes('INSERT OR REPLACE INTO sync_queue')) {
          const [id, endpoint, method, payload, timestamp, retries, status, lastAttempt, error, priority] = params;
          syncTable.set(id, {
            id,
            endpoint,
            method,
            payload,
            timestamp,
            retries,
            status,
            last_attempt: lastAttempt,
            error,
            priority,
          });
        } else if (query.includes('INSERT OR REPLACE INTO kv_stores')) {
          const [store, id, data] = params;
          kvStore.set(`${store}:${id}`, data);
        } else if (query.includes('DELETE FROM sync_queue WHERE id = ?')) {
          syncTable.delete(params[0]);
        } else if (query.includes('DELETE FROM kv_stores WHERE store = ? AND id = ?')) {
          kvStore.delete(`${params[0]}:${params[1]}`);
        } else if (query.includes('DELETE FROM sync_queue')) {
          syncTable.clear();
        } else if (query.includes('DELETE FROM kv_stores')) {
          kvStore.clear();
        }
      }),
      getFirstAsync: jest.fn(async (query: string, params: any[]) => {
        if (query.includes('FROM sync_queue WHERE id = ?')) {
          const row = syncTable.get(params[0]);
          return row || null;
        }
        if (query.includes('FROM kv_stores WHERE store = ? AND id = ?')) {
          const data = kvStore.get(`${params[0]}:${params[1]}`);
          return data ? { data } : null;
        }
        if (query.includes('COUNT(*) as count FROM sync_queue')) {
          return { count: syncTable.size };
        }
        if (query.includes('COUNT(*) as count FROM kv_stores WHERE store = ?')) {
          let count = 0;
          for (const k of kvStore.keys()) {
            if (k.startsWith(`${params[0]}:`)) count++;
          }
          return { count };
        }
        return null;
      }),
      getAllAsync: jest.fn(async (query: string, params?: any[]) => {
        if (query.includes('FROM sync_queue') && query.includes('ORDER BY priority ASC, timestamp ASC')) {
          const items = Array.from(syncTable.values()).filter(
            (r) => r.status === 'PENDING' || r.status === 'FAILED'
          );
          // SQL ORDER BY priority ASC, timestamp ASC
          items.sort((a, b) => a.priority - b.priority || a.timestamp - b.timestamp);
          return items;
        }
        if (query.includes('FROM kv_stores WHERE store = ?')) {
          const results: any[] = [];
          for (const [k, val] of kvStore.entries()) {
            if (k.startsWith(`${params?.[0]}:`)) results.push({ data: val });
          }
          return results;
        }
        return [];
      }),
    };

    const sqliteAdapter = new SQLiteStorageAdapter();
    // Inject mock db directly
    (sqliteAdapter as any).db = mockDb;
    (sqliteAdapter as any).isInitialized = true;

    // Test priority ordering in SQLite:
    // 1. Enqueue Standard priority item first
    await sqliteAdapter.saveItem('sync_queue', 'routine-01', {
      id: 'routine-01',
      endpoint: '/api/v1/routine',
      method: 'POST',
      payload: { data: 'std' },
      timestamp: 1000,
      priority: 2,
    });

    // 2. Enqueue Emergency priority item second
    await sqliteAdapter.saveItem('sync_queue', 'emergency-01', {
      id: 'emergency-01',
      endpoint: '/api/v1/sos',
      method: 'POST',
      payload: { alert: 'SOS' },
      timestamp: 2000,
      priority: 1,
    });

    // 3. getPendingSyncItems() MUST return emergency first due to ORDER BY priority ASC
    const pendingItems = await sqliteAdapter.getPendingSyncItems();
    expect(pendingItems).toHaveLength(2);
    expect(pendingItems[0].id).toBe('emergency-01');
    expect(pendingItems[0].priority).toBe(1);
    expect(pendingItems[1].id).toBe('routine-01');
    expect(pendingItems[1].priority).toBe(2);
  });

  // Test 20: Fault tolerance - uninitialized adapter access throws descriptive error
  it('ADV-UNINITIALIZED: uninitialized SQLite adapter access throws explicit error before use', async () => {
    const uninitAdapter = new SQLiteStorageAdapter();
    await expect(uninitAdapter.getItem('patient_cache', 'p1')).rejects.toThrow(
      'SQLiteStorageAdapter not initialized. Call init() first.'
    );
  });
});
