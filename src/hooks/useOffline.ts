import { useState, useEffect, useCallback } from 'react';
import syncService, { ConnectionQuality, SubmitResult } from '../services/syncService';
import offlineDB from '../services/offlineDB';

export interface UseOfflineReturn {
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncProgress: { current: number; total: number } | null;
  isSimulatedOffline: boolean;
  setSimulatedOffline: (simulated: boolean) => void;
  forceSync: () => Promise<{ syncedCount: number; failedCount: number }>;
  submitData: (
    type: string,
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data: any
  ) => Promise<SubmitResult>;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() => syncService.getIsOnline());
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(() =>
    syncService.getConnectionQuality()
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(() => syncService.getIsSyncing());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => syncService.getLastSyncTime());
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    // Initial fetch of pending queue count
    offlineDB.getSyncQueueCount().then(setPendingCount);

    // Subscribe to real-time events from SyncService
    const unsubscribe = syncService.subscribe((event) => {
      switch (event.type) {
        case 'ONLINE':
          setIsOnline(true);
          break;
        case 'OFFLINE':
          setIsOnline(false);
          setConnectionQuality('offline');
          break;
        case 'CONNECTION_QUALITY':
          if (event.quality) {
            setConnectionQuality(event.quality);
            setIsOnline(event.quality !== 'offline');
          }
          break;
        case 'SYNC_STARTED':
          setIsSyncing(true);
          offlineDB.getSyncQueueCount().then((total) => {
            setSyncProgress({ current: 0, total });
          });
          break;
        case 'ITEM_SYNCED':
          offlineDB.getSyncQueueCount().then((count) => {
            setPendingCount(count);
            setSyncProgress((prev) =>
              prev ? { ...prev, current: Math.max(0, prev.total - count) } : null
            );
          });
          break;
        case 'SYNC_COMPLETE':
          setIsSyncing(false);
          setSyncProgress(null);
          setPendingCount(0);
          if (event.timestamp) {
            setLastSyncTime(event.timestamp);
          }
          break;
        case 'SYNC_ERROR':
          setIsSyncing(false);
          setSyncProgress(null);
          offlineDB.getSyncQueueCount().then(setPendingCount);
          break;
        case 'QUEUED':
          offlineDB.getSyncQueueCount().then(setPendingCount);
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  const forceSync = useCallback(async () => {
    return syncService.forceSync();
  }, []);

  const submitData = useCallback(
    async (
      type: string,
      url: string,
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      data: any
    ) => {
      return syncService.submitData(type, url, method, data);
    },
    []
  );

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() =>
    syncService.getIsSimulatedOffline()
  );

  const setSimulatedOffline = useCallback((simulated: boolean) => {
    syncService.setSimulatedOffline(simulated);
    setIsSimulatedOffline(simulated);
    setIsOnline(!simulated && syncService.getIsOnline());
  }, []);

  return {
    isOnline,
    connectionQuality,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncProgress,
    isSimulatedOffline,
    setSimulatedOffline,
    forceSync,
    submitData
  };
}

export default useOffline;
