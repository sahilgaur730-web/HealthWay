/**
 * HealthWay AsyncStorage Adapter
 * Fallback storage utilizing @react-native-async-storage/async-storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from './types';
import { SyncQueueItem } from '../types/sync';

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

  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const all = await this.getAll<SyncQueueItem>('sync_queue');
    return all
      .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
      .sort(
        (a, b) =>
          (a.priority ?? 3) - (b.priority ?? 3) || a.timestamp - b.timestamp
      );
  }

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

  public async removeSyncItem(id: string): Promise<void> {
    await this.deleteItem('sync_queue', id);
  }

  public async getStoreCount(store: string): Promise<number> {
    const index = await this.getIndex(store);
    return index.length;
  }
}
