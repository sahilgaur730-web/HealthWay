/**
 * HealthWay Offline Persistence & Sync Engine Types
 * Complies with PROJECT.md § Interface Contracts (2. OfflineStorage)
 */

export type SyncMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type SyncItemStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type StoreName =
  | 'sync_queue'
  | 'patient_cache'
  | 'triage_drafts'
  | 'medicine_stock'
  | 'facility_data'
  | 'referral_drafts'
  | 'settings'
  | 'sync_log';

export interface OfflineStoreItem<T> {
  id: string;
  data: T;
  updatedAt: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: SyncMethod;
  payload: any;
  timestamp: number;
  retries: number;
  status: SyncItemStatus;
  lastAttempt?: number;
  error?: string;
  type?: string;
  priority?: number; // 1 = Emergency, 2 = Standard, 3 = Background
}

export interface OfflineStorageAPI {
  getItem: <T>(store: string, id: string) => Promise<T | null>;
  getAll: <T>(store: string) => Promise<T[]>;
  saveItem: <T>(store: string, id: string, data: T) => Promise<void>;
  deleteItem: (store: string, id: string) => Promise<void>;
  enqueueSync: (endpoint: string, method: string, payload: any) => Promise<SyncQueueItem | void>;
  getPendingSyncItems: () => Promise<SyncQueueItem[]>;
}

export type ConnectionQuality = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'OFFLINE';

export type SyncEventType =
  | 'ONLINE'
  | 'OFFLINE'
  | 'QUALITY_CHANGE'
  | 'SYNC_START'
  | 'ITEM_SYNCED'
  | 'ITEM_FAILED'
  | 'SYNC_COMPLETE'
  | 'SYNC_ERROR'
  | 'QUEUED';

export interface SyncEvent {
  type: SyncEventType;
  quality?: ConnectionQuality;
  syncedCount?: number;
  failedCount?: number;
  itemId?: string;
  dataType?: string;
  error?: string;
  timestamp?: number;
}
