/**
 * HealthWay Data Synchronization Engine (Demand 10 & Feature 5)
 * Manages network quality monitoring, offline queueing, exponential backoff, and outbox synchronization.
 * Strictly zero unicode emojis.
 */

import storage, { StorageEngine } from '../storage';
import {
  ConnectionQuality,
  SyncEvent,
  SyncEventType,
  SyncQueueItem,
} from '../types/sync';

export type SyncListener = (event: SyncEvent) => void;

export interface SyncSummary {
  processed: number;
  succeeded: number;
  failed: number;
  items: Array<{ id: string; status: 'SUCCESS' | 'RETRY' | 'FAILED' }>;
}

export class SyncEngine {
  private quality: ConnectionQuality = 'EXCELLENT';
  private isSyncing: boolean = false;
  private isSimulatedOffline: boolean = false;
  private listeners: SyncListener[] = [];
  private qualityListeners: Array<(quality: ConnectionQuality) => void> = [];
  private lastSyncTime: number | null = null;
  private storage: StorageEngine;
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor(customStorage?: StorageEngine) {
    this.storage = customStorage || storage;
    this.initNetworkObserver();
  }

  /**
   * Initializes network listener via @react-native-community/netinfo
   * Includes fallback for headless test runners and browsers
   */
  private initNetworkObserver(): void {
    try {
      const NetInfo = require('@react-native-community/netinfo');
      if (NetInfo && NetInfo.addEventListener) {
        this.unsubscribeNetInfo = NetInfo.addEventListener((state: any) => {
          this.handleNetInfoChange(state);
        });
        NetInfo.fetch().then((state: any) => this.handleNetInfoChange(state));
        return;
      }
    } catch {
      // NetInfo not available (e.g. Node/Jest environment)
    }

    // Web fallback
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => this.updateQuality('EXCELLENT'));
      window.addEventListener('offline', () => this.updateQuality('OFFLINE'));
      this.quality = typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'EXCELLENT';
    }
  }

  private handleNetInfoChange(state: any): void {
    if (this.isSimulatedOffline) {
      this.updateQuality('OFFLINE');
      return;
    }

    if (!state.isConnected || state.isInternetReachable === false) {
      this.updateQuality('OFFLINE');
      return;
    }

    const type = state.type;
    const details = state.details;

    if (type === 'wifi') {
      this.updateQuality('EXCELLENT');
    } else if (type === 'cellular') {
      const gen = details?.cellularGeneration;
      if (gen === '5g') {
        this.updateQuality('EXCELLENT');
      } else if (gen === '4g') {
        this.updateQuality('GOOD');
      } else if (gen === '3g') {
        this.updateQuality('MODERATE');
      } else if (gen === '2g') {
        this.updateQuality('POOR');
      } else {
        this.updateQuality('GOOD');
      }
    } else {
      this.updateQuality('GOOD');
    }
  }

  private updateQuality(newQuality: ConnectionQuality): void {
    const prevQuality = this.quality;
    this.quality = newQuality;

    if (prevQuality !== newQuality) {
      this.notifyQualityListeners(newQuality);
      this.emit({
        type: newQuality === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
        quality: newQuality,
      });
      this.emit({
        type: 'QUALITY_CHANGE',
        quality: newQuality,
      });

      // Auto-trigger sync on reconnect
      if (prevQuality === 'OFFLINE' && newQuality !== 'OFFLINE') {
        this.syncOutbox().catch((err) =>
          console.error('[SyncEngine] Auto-sync on reconnect error:', err)
        );
      }
    }
  }

  // ==========================================
  // SUBSCRIPTION & PUB-SUB
  // ==========================================

  public subscribe(listener: SyncListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public onQualityChange(listener: (quality: ConnectionQuality) => void): () => void {
    this.qualityListeners.push(listener);
    return () => {
      this.qualityListeners = this.qualityListeners.filter((l) => l !== listener);
    };
  }

  private emit(event: SyncEvent): void {
    event.timestamp = event.timestamp || Date.now();
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[SyncEngine] Listener error:', err);
      }
    }
  }

  private notifyQualityListeners(quality: ConnectionQuality): void {
    for (const listener of this.qualityListeners) {
      try {
        listener(quality);
      } catch (err) {
        console.error('[SyncEngine] Quality listener error:', err);
      }
    }
  }

  // ==========================================
  // CONNECTION CONTROLS & STATUS
  // ==========================================

  public getQuality(): ConnectionQuality {
    return this.isSimulatedOffline ? 'OFFLINE' : this.quality;
  }

  public setQuality(quality: ConnectionQuality): void {
    this.updateQuality(quality);
  }

  public isOnline(): boolean {
    return this.getQuality() !== 'OFFLINE';
  }

  public setSimulatedOffline(simulated: boolean): void {
    this.isSimulatedOffline = simulated;
    this.updateQuality(simulated ? 'OFFLINE' : 'EXCELLENT');
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  public getLastSyncTime(): number | null {
    return this.lastSyncTime;
  }

  // ==========================================
  // EXPONENTIAL BACKOFF FORMULA
  // ==========================================

  /**
   * Exponential Backoff Retry Formula: min(2^retries * 500ms, 5000ms)
   */
  public calculateBackoff(retries: number): number {
    return Math.min(Math.pow(2, retries) * 500, 5000);
  }

  // ==========================================
  // LOW-BANDWIDTH PAYLOAD OPTIMIZATION
  // ==========================================

  public compressPayload(data: any): any {
    if (data === null || data === undefined) return null;
    if (typeof data !== 'object') return data;

    return JSON.parse(
      JSON.stringify(data, (_, val) => {
        if (val === null || val === undefined || val === '') return undefined;
        if (typeof val === 'string') return val.trim();
        return val;
      })
    );
  }

  // ==========================================
  // OUTBOX QUEUE PROCESSING
  // ==========================================

  public async syncOutbox(
    apiHandler?: (item: SyncQueueItem) => Promise<boolean>
  ): Promise<SyncSummary> {
    if (!this.isOnline()) {
      return { processed: 0, succeeded: 0, failed: 0, items: [] };
    }

    if (this.isSyncing) {
      return { processed: 0, succeeded: 0, failed: 0, items: [] };
    }

    this.isSyncing = true;
    this.emit({ type: 'SYNC_START' });

    let succeeded = 0;
    let failed = 0;
    const itemResults: Array<{ id: string; status: 'SUCCESS' | 'RETRY' | 'FAILED' }> = [];

    try {
      const pendingItems = await this.storage.getPendingSyncItems();

      for (const item of pendingItems) {
        // Halt if connection drops mid-batch
        if (!this.isOnline()) {
          break;
        }

        // Apply exponential backoff delay if retrying
        if (item.retries > 0) {
          const delayMs = this.calculateBackoff(item.retries);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        await this.storage.updateSyncStatus(item.id, 'PROCESSING');

        let success = false;
        let errorMessage: string | undefined;

        try {
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
        } catch (err: any) {
          success = false;
          errorMessage = err?.message || 'Network request failed';
        }

        if (success) {
          await this.storage.updateSyncStatus(item.id, 'COMPLETED');
          await this.storage.saveItem('sync_log', `LOG-${Date.now()}-${item.id}`, {
            syncId: item.id,
            endpoint: item.endpoint,
            status: 'COMPLETED',
            timestamp: Date.now(),
          });
          succeeded++;
          itemResults.push({ id: item.id, status: 'SUCCESS' });
          this.emit({ type: 'ITEM_SYNCED', itemId: item.id });
        } else {
          failed++;
          const newRetries = (item.retries || 0) + 1;
          if (newRetries >= 5 || (errorMessage && errorMessage.startsWith('Client Error'))) {
            await (this.storage as any).updateSyncStatus(item.id, 'FAILED', errorMessage || 'Max retries exceeded', newRetries);
            await this.storage.saveItem('sync_log', `LOG-${Date.now()}-${item.id}`, {
              syncId: item.id,
              endpoint: item.endpoint,
              status: 'FAILED',
              retries: newRetries,
              error: errorMessage,
              timestamp: Date.now(),
            });
            itemResults.push({ id: item.id, status: 'FAILED' });
            this.emit({ type: 'ITEM_FAILED', itemId: item.id, error: errorMessage });
          } else {
            // Restore to PENDING with incremented retries for next cycle
            await (this.storage as any).updateSyncStatus(item.id, 'PENDING', errorMessage, newRetries);
            itemResults.push({ id: item.id, status: 'RETRY' });
          }
        }
      }

      this.lastSyncTime = Date.now();
      this.emit({
        type: 'SYNC_COMPLETE',
        syncedCount: succeeded,
        failedCount: failed,
      });
    } catch (err: any) {
      console.error('[SyncEngine] Batch sync exception:', err);
      this.emit({ type: 'SYNC_ERROR', error: err?.message || 'Sync failed' });
    } finally {
      this.isSyncing = false;
    }

    return {
      processed: itemResults.length,
      succeeded,
      failed,
      items: itemResults,
    };
  }

  public destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.listeners = [];
    this.qualityListeners = [];
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
