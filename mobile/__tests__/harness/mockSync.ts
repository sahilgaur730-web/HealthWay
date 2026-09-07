/**
 * HealthWay Connection Quality & Sync Engine Test Harness
 * Implements Network Observer & Outbox Replay specified in PROJECT.md
 */

import { MockStorageService, SyncQueueItem } from './mockStorage';

export type ConnectionQuality = 'EXCELLENT' | 'MODERATE' | 'POOR' | 'OFFLINE';

export interface SyncResult {
  processed: number;
  succeeded: number;
  failed: number;
  items: Array<{ id: string; status: 'SUCCESS' | 'RETRY' | 'FAILED' }>;
}

export class MockSyncEngine {
  private quality: ConnectionQuality = 'EXCELLENT';
  private storage: MockStorageService;
  private isSyncing: boolean = false;
  private networkListeners: Array<(quality: ConnectionQuality) => void> = [];

  constructor(storage: MockStorageService) {
    this.storage = storage;
  }

  public getQuality(): ConnectionQuality {
    return this.quality;
  }

  public setQuality(quality: ConnectionQuality): void {
    this.quality = quality;
    for (const listener of this.networkListeners) {
      listener(quality);
    }
  }

  public onQualityChange(listener: (quality: ConnectionQuality) => void): () => void {
    this.networkListeners.push(listener);
    return () => {
      this.networkListeners = this.networkListeners.filter(l => l !== listener);
    };
  }

  public calculateBackoff(retries: number, baseMs: number = 1000, maxMs: number = 32000): number {
    const exponent = Math.min(retries, 6);
    return Math.min(baseMs * Math.pow(2, exponent), maxMs);
  }

  public async syncOutbox(
    apiHandler?: (item: SyncQueueItem) => Promise<boolean>
  ): Promise<SyncResult> {
    if (this.quality === 'OFFLINE') {
      return { processed: 0, succeeded: 0, failed: 0, items: [] };
    }

    if (this.isSyncing) {
      return { processed: 0, succeeded: 0, failed: 0, items: [] };
    }

    this.isSyncing = true;
    const pending = await this.storage.getPendingSyncItems();
    const result: SyncResult = {
      processed: pending.length,
      succeeded: 0,
      failed: 0,
      items: [],
    };

    for (const item of pending) {
      // If quality degraded to OFFLINE mid-sync, abort
      if (this.quality === 'OFFLINE') {
        break;
      }

      let success = false;
      try {
        if (apiHandler) {
          success = await apiHandler(item);
        } else {
          // Default: succeeding if not OFFLINE, but with 20% random drop if POOR
          if (this.quality === 'POOR') {
            success = item.retries > 0; // Succeeds on retry
          } else {
            success = true;
          }
        }
      } catch (err: any) {
        success = false;
      }

      if (success) {
        await this.storage.updateSyncStatus(item.id, 'COMPLETED');
        result.succeeded += 1;
        result.items.push({ id: item.id, status: 'SUCCESS' });
      } else {
        if (item.retries >= 2) {
          await this.storage.updateSyncStatus(item.id, 'FAILED', 'Max retries exceeded');
          result.failed += 1;
          result.items.push({ id: item.id, status: 'FAILED' });
        } else {
          await this.storage.updateSyncStatus(item.id, 'FAILED', 'Transient network error');
          result.failed += 1;
          result.items.push({ id: item.id, status: 'RETRY' });
        }
      }
    }

    this.isSyncing = false;
    return result;
  }
}
