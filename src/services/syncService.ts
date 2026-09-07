/**
 * HealthWay Data Synchronization Engine (Demand 10)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Background sync, network quality monitoring, offline queueing, and low-bandwidth payload compression.
 * Strictly zero unicode emojis.
 */

import offlineDB, { SyncQueueItem } from './offlineDB';

export type ConnectionQuality =
  | 'excellent'   // 4G / WiFi (> 5Mbps)
  | 'good'        // 3G / 4G stable
  | 'poor'        // 2G
  | 'very-poor'   // slow-2g
  | 'offline'     // no network
  | 'unknown';

export type SyncEventType =
  | 'ONLINE'
  | 'OFFLINE'
  | 'CONNECTION_QUALITY'
  | 'SYNC_STARTED'
  | 'ITEM_SYNCED'
  | 'SYNC_COMPLETE'
  | 'SYNC_ERROR'
  | 'QUEUED'
  | 'SUBMIT_SUCCESS'
  | 'DATA_REFRESHED';

export interface SyncEvent {
  type: SyncEventType;
  quality?: ConnectionQuality;
  itemId?: number;
  dataType?: string;
  queueId?: number;
  syncedCount?: number;
  failedCount?: number;
  timestamp?: Date;
  error?: string;
  url?: string;
}

export type SyncListener = (event: SyncEvent) => void;

export interface SubmitResult {
  success: boolean;
  online?: boolean;
  queued?: boolean;
  queueId?: number;
  data?: any;
  message?: string;
}

class SyncService {
  private isSyncing = false;
  private isSimulatedOffline = false;
  private listeners: SyncListener[] = [];
  private connectionQuality: ConnectionQuality = 'unknown';
  private lastSyncTime: Date | null = null;
  private syncIntervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Listen for messages from Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleSWMessage(event.data);
        });
      }

      // Initial connection detection
      this.measureConnectionQuality();

      // Periodic queue check every 60 seconds if online
      this.syncIntervalId = setInterval(() => {
        if (this.getIsOnline() && !this.isSyncing) {
          offlineDB.getSyncQueueCount().then((count) => {
            if (count > 0) {
              this.startSync();
            }
          });
        }
      }, 60000);
    }
  }

  // ==========================================
  // SUBSCRIPTION / PUB-SUB
  // ==========================================

  public subscribe(callback: SyncListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[SyncService] Listener error:', err);
      }
    });
  }

  // ==========================================
  // ONLINE / OFFLINE HANDLERS
  // ==========================================

  private handleOnline(): void {
    console.log('[SyncService] Connection detected online.');
    this.notify({ type: 'ONLINE' });
    this.measureConnectionQuality().then(() => {
      this.startSync();
    });
  }

  private handleOffline(): void {
    console.log('[SyncService] Connection went offline.');
    this.connectionQuality = 'offline';
    this.notify({ type: 'OFFLINE', quality: 'offline' });
  }

  private handleSWMessage(data: any): void {
    if (!data) return;
    if (data.type === 'TRIGGER_BACKGROUND_SYNC') {
      this.startSync();
    }
    if (data.type === 'DATA_UPDATED') {
      this.notify({ type: 'DATA_REFRESHED', url: data.url });
    }
  }

  // ==========================================
  // CONNECTION QUALITY DETECTION
  // ==========================================

  public async measureConnectionQuality(): Promise<ConnectionQuality> {
    if (this.isSimulatedOffline || typeof navigator === 'undefined' || !navigator.onLine) {
      this.connectionQuality = 'offline';
      this.notify({ type: 'CONNECTION_QUALITY', quality: 'offline' });
      return 'offline';
    }

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink || 0;

      if (effectiveType === '4g' && downlink >= 3) {
        this.connectionQuality = 'excellent';
      } else if (effectiveType === '4g' || effectiveType === '3g') {
        this.connectionQuality = 'good';
      } else if (effectiveType === '2g') {
        this.connectionQuality = 'poor';
      } else if (effectiveType === 'slow-2g') {
        this.connectionQuality = 'very-poor';
      } else {
        this.connectionQuality = 'good';
      }
    } else {
      // Fallback ping check with latency measurement
      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        await fetch('/api/ping', {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const latency = Date.now() - start;
        if (latency < 150) this.connectionQuality = 'excellent';
        else if (latency < 450) this.connectionQuality = 'good';
        else if (latency < 1200) this.connectionQuality = 'poor';
        else this.connectionQuality = 'very-poor';
      } catch {
        // If ping fails or aborts, we check if navigator is still online
        if (navigator.onLine) {
          this.connectionQuality = 'poor';
        } else {
          this.connectionQuality = 'offline';
        }
      }
    }

    this.notify({
      type: 'CONNECTION_QUALITY',
      quality: this.connectionQuality
    });

    return this.connectionQuality;
  }

  public getIsOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return (
      typeof navigator !== 'undefined' &&
      navigator.onLine &&
      this.connectionQuality !== 'offline'
    );
  }

  public getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality;
  }

  public setSimulatedOffline(simulated: boolean): void {
    this.isSimulatedOffline = simulated;
    if (simulated) {
      this.connectionQuality = 'offline';
      this.notify({ type: 'OFFLINE', quality: 'offline' });
    } else {
      this.measureConnectionQuality().then(() => {
        this.notify({ type: 'ONLINE' });
        this.startSync();
      });
    }
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  // ==========================================
  // DATA SUBMISSION (ONLINE OR OFFLINE QUEUE)
  // ==========================================

  public async submitData(
    type: string,
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data: any
  ): Promise<SubmitResult> {
    const isOnline = this.getIsOnline();
    const quality = this.connectionQuality;

    // Compress payload to save bandwidth in low-connectivity areas
    const compressedData = this.compressForLowBandwidth(data);

    // If online with good/excellent connection, attempt direct submission
    if (isOnline && (quality === 'excellent' || quality === 'good')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-HealthWay-Sync': 'Direct'
          },
          body: JSON.stringify(compressedData),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          this.notify({ type: 'SUBMIT_SUCCESS', dataType: type });
          return { success: true, online: true, data: result };
        }
        // If 4xx client error, don't crash, queue or return error
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client submission error: ${response.status}`);
        }
        throw new Error(`Server error: ${response.status}`);
      } catch (error) {
        // Network timeout or server error -> save locally to syncQueue
        return this.queueForSync(type, url, method, compressedData);
      }
    } else {
      // Offline or poor/very-poor connection -> instantly save to syncQueue
      return this.queueForSync(type, url, method, compressedData);
    }
  }

  private async queueForSync(
    type: string,
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data: any
  ): Promise<SubmitResult> {
    try {
      const queueId = await offlineDB.addToSyncQueue({
        type,
        url,
        method,
        data
      });

      this.notify({
        type: 'QUEUED',
        dataType: type,
        queueId
      });

      // Request background sync from Service Worker if supported
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const regAny = registration as any;
          if (regAny.sync && regAny.sync.register) {
            await regAny.sync.register('sync-healthway-data');
          }
        } catch (swErr) {
          // ignore sync registration error
        }
      }

      return {
        success: true,
        queued: true,
        queueId,
        message: 'Saved locally in offline queue. Will sync automatically when connection restores.'
      };
    } catch (err: any) {
      return {
        success: false,
        queued: false,
        message: err?.message || 'Failed to save to offline storage'
      };
    }
  }

  // ==========================================
  // SYNC PROCESSING ENGINE
  // ==========================================

  public async startSync(): Promise<{ syncedCount: number; failedCount: number }> {
    if (this.isSyncing) {
      return { syncedCount: 0, failedCount: 0 };
    }

    if (!this.getIsOnline()) {
      return { syncedCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;
    this.notify({ type: 'SYNC_STARTED' });

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await offlineDB.getPendingSyncItems();

      if (pendingItems.length === 0) {
        this.notify({ type: 'SYNC_COMPLETE', syncedCount: 0, failedCount: 0 });
        this.isSyncing = false;
        return { syncedCount: 0, failedCount: 0 };
      }

      for (const item of pendingItems) {
        if (!this.getIsOnline()) break; // pause if connection drops midway

        try {
          await offlineDB.updateSyncItemStatus(item.id!, 'SYNCING');

          // Exponential backoff delay for retries
          if (item.retries > 0) {
            const delayMs = Math.min(Math.pow(2, item.retries) * 500, 5000);
            await new Promise((r) => setTimeout(r, delayMs));
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(item.url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              'X-HealthWay-Sync': 'Batched-Queue'
            },
            body: JSON.stringify(item.data),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            await offlineDB.removeSyncItem(item.id!);
            syncedCount++;
            this.notify({
              type: 'ITEM_SYNCED',
              itemId: item.id,
              dataType: item.type
            });
            await offlineDB.addSyncLog('ITEM_SYNC_SUCCESS', 'SUCCESS', {
              id: item.id,
              type: item.type
            });
          } else if (response.status >= 400 && response.status < 500) {
            // Unrecoverable client error
            await offlineDB.updateSyncItemStatus(
              item.id!,
              'FAILED',
              `Server rejected with code ${response.status}`
            );
            failedCount++;
          } else {
            // Temporary server error: restore to PENDING with backoff count
            await offlineDB.updateSyncItemStatus(
              item.id!,
              'PENDING',
              `Server returned error ${response.status}`
            );
            failedCount++;
          }
        } catch (itemErr: any) {
          await offlineDB.updateSyncItemStatus(
            item.id!,
            'PENDING',
            itemErr?.message || 'Network timeout'
          );
          failedCount++;
        }
      }

      this.lastSyncTime = new Date();
      this.notify({
        type: 'SYNC_COMPLETE',
        syncedCount,
        failedCount,
        timestamp: this.lastSyncTime
      });

      await offlineDB.addSyncLog('BATCH_SYNC_COMPLETED', 'INFO', {
        synced: syncedCount,
        failed: failedCount
      });
    } catch (err: any) {
      console.error('[SyncService] Sync error:', err);
      this.notify({ type: 'SYNC_ERROR', error: err?.message || 'Sync failed' });
    } finally {
      this.isSyncing = false;
    }

    return { syncedCount, failedCount };
  }

  public async forceSync(): Promise<{ syncedCount: number; failedCount: number }> {
    await this.measureConnectionQuality();
    return this.startSync();
  }

  // ==========================================
  // DATA COMPRESSION (LOW-BANDWIDTH OPTIMIZATION)
  // ==========================================

  public compressForLowBandwidth(data: any): any {
    if (data === null || data === undefined) return null;
    if (typeof data !== 'object') return data;

    // Recursively strip empty strings, nulls, undefined values
    const cleaned = JSON.parse(
      JSON.stringify(data, (_, val) => {
        if (val === null || val === undefined || val === '') return undefined;
        if (typeof val === 'string') return val.trim();
        return val;
      })
    );

    return cleaned;
  }

  // ==========================================
  // STATUS GETTERS
  // ==========================================

  public async getSyncStatus() {
    const pendingCount = await offlineDB.getSyncQueueCount();
    const storageInfo = await offlineDB.getStorageInfo();

    return {
      isOnline: this.getIsOnline(),
      connectionQuality: this.connectionQuality,
      isSyncing: this.isSyncing,
      pendingCount,
      lastSyncTime: this.lastSyncTime,
      storageInfo
    };
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  public getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }
}

const syncService = new SyncService();
export default syncService;
export { SyncService };
