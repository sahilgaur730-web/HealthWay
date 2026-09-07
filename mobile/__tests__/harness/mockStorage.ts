/**
 * HealthWay In-Memory 8-Store Engine Test Harness
 * Implements the full 8-store persistence contract specified in PROJECT.md:
 * 1. sync_queue
 * 2. patient_cache
 * 3. triage_drafts
 * 4. medicine_stock
 * 5. facility_data
 * 6. referral_drafts
 * 7. settings
 * 8. sync_log
 */

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: number;
  retries: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export type StoreName =
  | 'sync_queue'
  | 'patient_cache'
  | 'triage_drafts'
  | 'medicine_stock'
  | 'facility_data'
  | 'referral_drafts'
  | 'settings'
  | 'sync_log';

export class MockStorageService {
  private stores: Map<StoreName, Map<string, any>> = new Map();

  constructor() {
    this.reset();
  }

  public reset(): void {
    const storeNames: StoreName[] = [
      'sync_queue',
      'patient_cache',
      'triage_drafts',
      'medicine_stock',
      'facility_data',
      'referral_drafts',
      'settings',
      'sync_log',
    ];
    this.stores.clear();
    for (const name of storeNames) {
      this.stores.set(name, new Map<string, any>());
    }
  }

  public async getItem<T>(store: StoreName, id: string): Promise<T | null> {
    const targetStore = this.stores.get(store);
    if (!targetStore) {
      throw new Error(`Store '${store}' does not exist.`);
    }
    const val = targetStore.get(id);
    return val !== undefined ? JSON.parse(JSON.stringify(val)) : null;
  }

  public async getAll<T>(store: StoreName): Promise<T[]> {
    const targetStore = this.stores.get(store);
    if (!targetStore) {
      throw new Error(`Store '${store}' does not exist.`);
    }
    return Array.from(targetStore.values()).map(v => JSON.parse(JSON.stringify(v)));
  }

  public async saveItem<T>(store: StoreName, id: string, data: T): Promise<void> {
    const targetStore = this.stores.get(store);
    if (!targetStore) {
      throw new Error(`Store '${store}' does not exist.`);
    }
    targetStore.set(id, JSON.parse(JSON.stringify(data)));
  }

  public async deleteItem(store: StoreName, id: string): Promise<void> {
    const targetStore = this.stores.get(store);
    if (targetStore) {
      targetStore.delete(id);
    }
  }

  public async clearStore(store: StoreName): Promise<void> {
    const targetStore = this.stores.get(store);
    if (targetStore) {
      targetStore.clear();
    }
  }

  public async enqueueSync(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    payload: any
  ): Promise<SyncQueueItem> {
    const queueItem: SyncQueueItem = {
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      endpoint,
      method,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'PENDING',
    };
    await this.saveItem('sync_queue', queueItem.id, queueItem);
    return queueItem;
  }

  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const all = await this.getAll<SyncQueueItem>('sync_queue');
    return all.filter(item => item.status === 'PENDING' || item.status === 'FAILED');
  }

  public async updateSyncStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string
  ): Promise<void> {
    const item = await this.getItem<SyncQueueItem>('sync_queue', id);
    if (item) {
      item.status = status;
      if (error) item.error = error;
      if (status === 'FAILED') item.retries += 1;
      await this.saveItem('sync_queue', id, item);

      // Also append to sync_log
      await this.saveItem('sync_log', `LOG-${Date.now()}-${id}`, {
        syncId: id,
        endpoint: item.endpoint,
        status,
        timestamp: Date.now(),
        retries: item.retries,
      });
    }
  }
}
