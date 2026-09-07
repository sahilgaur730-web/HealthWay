import { SyncQueueItem, StoreName, OfflineStorageAPI } from '../types/sync';

export { StoreName, SyncQueueItem, OfflineStorageAPI };

export const ALL_STORE_NAMES: StoreName[] = [
  'sync_queue',
  'patient_cache',
  'triage_drafts',
  'medicine_stock',
  'facility_data',
  'referral_drafts',
  'settings',
  'sync_log',
];

export interface StorageAdapter extends OfflineStorageAPI {
  init(): Promise<void>;
  clearStore(store: string): Promise<void>;
  clearAll(): Promise<void>;
  updateSyncStatus(id: string, status: SyncQueueItem['status'], error?: string): Promise<void>;
  removeSyncItem(id: string): Promise<void>;
  getStoreCount(store: string): Promise<number>;
}
