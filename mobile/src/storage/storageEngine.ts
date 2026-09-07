/**
 * HealthWay Unified Storage Engine
 * Auto-detects and gracefully falls back between SQLite and AsyncStorage
 */

import { StorageAdapter, StoreName } from './types';
import { SQLiteStorageAdapter } from './sqliteAdapter';
import { AsyncStorageAdapter } from './asyncStorageAdapter';
import { SyncQueueItem, OfflineStorageAPI } from '../types/sync';

export class StorageEngine implements OfflineStorageAPI {
  private activeAdapter: StorageAdapter;
  private backendType: 'sqlite' | 'async_storage' = 'async_storage';
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.activeAdapter = new AsyncStorageAdapter();
  }

  public async initialize(): Promise<'sqlite' | 'async_storage'> {
    if (this.initPromise) {
      await this.initPromise;
      return this.backendType;
    }

    this.initPromise = (async () => {
      try {
        const sqlite = new SQLiteStorageAdapter();
        await sqlite.init();
        this.activeAdapter = sqlite;
        this.backendType = 'sqlite';
        console.log('[StorageEngine] Successfully initialized Primary SQLite Storage');
      } catch (err) {
        console.warn(
          '[StorageEngine] SQLite unavailable or failed to initialize, falling back to AsyncStorage:',
          err
        );
        const asyncStore = new AsyncStorageAdapter();
        await asyncStore.init();
        this.activeAdapter = asyncStore;
        this.backendType = 'async_storage';
      }
    })();

    await this.initPromise;
    return this.backendType;
  }

  public getBackendType(): 'sqlite' | 'async_storage' {
    return this.backendType;
  }

  /**
   * Normalizes store names across snake_case and legacy camelCase
   */
  public normalizeStore(store: string): StoreName {
    const map: Record<string, StoreName> = {
      sync_queue: 'sync_queue',
      syncQueue: 'sync_queue',
      patient_cache: 'patient_cache',
      patientCache: 'patient_cache',
      triage_drafts: 'triage_drafts',
      triageDrafts: 'triage_drafts',
      medicine_stock: 'medicine_stock',
      medicineStock: 'medicine_stock',
      facility_data: 'facility_data',
      facilityData: 'facility_data',
      referral_drafts: 'referral_drafts',
      referralDrafts: 'referral_drafts',
      settings: 'settings',
      sync_log: 'sync_log',
      syncLog: 'sync_log',
    };
    return map[store] || (store as StoreName);
  }

  public async getItem<T>(store: string, id: string): Promise<T | null> {
    await this.initialize();
    return this.activeAdapter.getItem<T>(this.normalizeStore(store), id);
  }

  public async getAll<T>(store: string): Promise<T[]> {
    await this.initialize();
    return this.activeAdapter.getAll<T>(this.normalizeStore(store));
  }

  public async saveItem<T>(store: string, id: string, data: T): Promise<void> {
    await this.initialize();
    return this.activeAdapter.saveItem<T>(this.normalizeStore(store), id, data);
  }

  public async deleteItem(store: string, id: string): Promise<void> {
    await this.initialize();
    return this.activeAdapter.deleteItem(this.normalizeStore(store), id);
  }

  public async clearStore(store: string): Promise<void> {
    await this.initialize();
    return this.activeAdapter.clearStore(this.normalizeStore(store));
  }

  public async clearAll(): Promise<void> {
    await this.initialize();
    return this.activeAdapter.clearAll();
  }

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

  public async removeSyncItem(id: string): Promise<void> {
    await this.initialize();
    return this.activeAdapter.removeSyncItem(id);
  }

  public async getStoreCount(store: string): Promise<number> {
    await this.initialize();
    return this.activeAdapter.getStoreCount(this.normalizeStore(store));
  }
}

export const storageEngine = new StorageEngine();

