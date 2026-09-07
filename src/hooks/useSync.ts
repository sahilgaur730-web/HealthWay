import { useState, useEffect, useCallback } from 'react';
import offlineDB, { SyncQueueItem, StorageEstimateInfo, SyncLogItem } from '../services/offlineDB';
import syncService from '../services/syncService';

export function useSync() {
  const [items, setItems] = useState<SyncQueueItem[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageEstimateInfo | null>(null);
  const [logs, setLogs] = useState<SyncLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allItems, storage, syncLogs] = await Promise.all([
        offlineDB.getAllSyncItems(),
        offlineDB.getStorageInfo(),
        offlineDB.getSyncLogs(20)
      ]);
      setItems(allItems);
      setStorageInfo(storage);
      setLogs(syncLogs);
    } catch (err) {
      console.error('[useSync] Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Subscribe to sync events
    const unsub = syncService.subscribe(() => {
      refresh();
    });

    return unsub;
  }, [refresh]);

  const syncNow = useCallback(async () => {
    return syncService.forceSync();
  }, []);

  const removeItem = useCallback(async (id: number) => {
    await offlineDB.removeSyncItem(id);
    refresh();
  }, [refresh]);

  const clearCompleted = useCallback(async () => {
    const all = await offlineDB.getAllSyncItems();
    for (const it of all) {
      if (it.status === 'COMPLETED') {
        await offlineDB.removeSyncItem(it.id!);
      }
    }
    refresh();
  }, [refresh]);

  return {
    items,
    storageInfo,
    logs,
    isLoading,
    syncNow,
    removeItem,
    clearCompleted,
    refresh
  };
}

export default useSync;
