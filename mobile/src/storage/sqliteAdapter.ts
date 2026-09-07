/**
 * HealthWay SQLite Storage Adapter
 * Primary persistent storage utilizing Expo SDK 57 SQLite API
 */

import { StorageAdapter } from './types';
import { SyncQueueItem } from '../types/sync';

export class SQLiteStorageAdapter implements StorageAdapter {
  private db: any = null;
  private isInitialized: boolean = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    // Dynamically require expo-sqlite to avoid hard crash if missing in certain test runners
    let SQLite: any;
    try {
      SQLite = require('expo-sqlite');
    } catch {
      throw new Error('expo-sqlite is not available');
    }

    if (!SQLite || (!SQLite.openDatabaseAsync && !SQLite.openDatabaseSync)) {
      throw new Error('expo-sqlite modern API not found');
    }

    this.db = await SQLite.openDatabaseAsync('healthway.db');

    // Create tables
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS kv_stores (
        store TEXT NOT NULL,
        id TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (store, id)
      );
      CREATE INDEX IF NOT EXISTS idx_kv_store ON kv_stores(store);

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retries INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING',
        last_attempt INTEGER,
        error TEXT,
        priority INTEGER DEFAULT 2
      );
      CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_timestamp ON sync_queue(timestamp);
    `);

    this.isInitialized = true;
  }

  private ensureReady(): void {
    if (!this.isInitialized || !this.db) {
      throw new Error('SQLiteStorageAdapter not initialized. Call init() first.');
    }
  }

  public async getItem<T>(store: string, id: string): Promise<T | null> {
    this.ensureReady();
    if (store === 'sync_queue') {
      const row = await this.db.getFirstAsync(
        'SELECT * FROM sync_queue WHERE id = ?',
        [id]
      );
      if (!row) return null;
      return {
        ...row,
        payload: JSON.parse(row.payload),
      } as T;
    }

    const row = await this.db.getFirstAsync(
      'SELECT data FROM kv_stores WHERE store = ? AND id = ?',
      [store, id]
    );
    if (!row) return null;
    return JSON.parse(row.data) as T;
  }

  public async getAll<T>(store: string): Promise<T[]> {
    this.ensureReady();
    if (store === 'sync_queue') {
      const rows = await this.db.getAllAsync('SELECT * FROM sync_queue ORDER BY timestamp ASC');
      return rows.map((r: any) => ({
        ...r,
        payload: JSON.parse(r.payload),
      })) as T[];
    }

    const rows = await this.db.getAllAsync(
      'SELECT data FROM kv_stores WHERE store = ?',
      [store]
    );
    return rows.map((r: any) => JSON.parse(r.data)) as T[];
  }

  public async saveItem<T>(store: string, id: string, data: T): Promise<void> {
    this.ensureReady();
    if (store === 'sync_queue') {
      const item = data as any;
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sync_queue (id, endpoint, method, payload, timestamp, retries, status, last_attempt, error, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.endpoint,
          item.method,
          JSON.stringify(item.payload),
          item.timestamp || Date.now(),
          item.retries || 0,
          item.status || 'PENDING',
          item.lastAttempt || null,
          item.error || null,
          item.priority || 2,
        ]
      );
      return;
    }

    const serialized = JSON.stringify(data);
    await this.db.runAsync(
      `INSERT OR REPLACE INTO kv_stores (store, id, data, updated_at, synced)
       VALUES (?, ?, ?, ?, 0)`,
      [store, id, serialized, Date.now()]
    );
  }

  public async deleteItem(store: string, id: string): Promise<void> {
    this.ensureReady();
    if (store === 'sync_queue') {
      await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
      return;
    }
    await this.db.runAsync('DELETE FROM kv_stores WHERE store = ? AND id = ?', [store, id]);
  }

  public async clearStore(store: string): Promise<void> {
    this.ensureReady();
    if (store === 'sync_queue') {
      await this.db.runAsync('DELETE FROM sync_queue');
      return;
    }
    await this.db.runAsync('DELETE FROM kv_stores WHERE store = ?', [store]);
  }

  public async clearAll(): Promise<void> {
    this.ensureReady();
    await this.db.runAsync('DELETE FROM kv_stores');
    await this.db.runAsync('DELETE FROM sync_queue');
  }

  public async enqueueSync(
    endpoint: string,
    method: string,
    payload: any,
    priority: number = 2
  ): Promise<SyncQueueItem> {
    this.ensureReady();
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

  public async removeSyncItem(id: string): Promise<void> {
    await this.deleteItem('sync_queue', id);
  }

  public async getStoreCount(store: string): Promise<number> {
    this.ensureReady();
    if (store === 'sync_queue') {
      const res = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue');
      return res ? res.count : 0;
    }
    const res = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM kv_stores WHERE store = ?',
      [store]
    );
    return res ? res.count : 0;
  }
}
