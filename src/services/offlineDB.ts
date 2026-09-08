/**
 * HealthWay Offline IndexedDB Storage Engine
 * Government of Maharashtra - Integrated Rural Health Platform
 * Supports 8 specialized object stores for low-connectivity & offline operations.
 * Strictly zero unicode emojis.
 */

export const DB_NAME = 'HealthWayOfflineDB';
export const DB_VERSION = 4;

export const STORES = {
  SYNC_QUEUE: 'syncQueue',
  PATIENT_CACHE: 'patientCache',
  TRIAGE_DRAFTS: 'triageDrafts',
  MEDICINE_STOCK: 'medicineStock',
  FACILITY_DATA: 'facilityData',
  REFERRAL_DRAFTS: 'referralDrafts',
  SETTINGS: 'settings',
  SYNC_LOG: 'syncLog',
  USERS: 'users',
  SESSIONS: 'sessions'
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

export type SyncItemStatus = 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED';

export interface SyncQueueItem {
  id?: number;
  type: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: any;
  status: SyncItemStatus;
  retries: number;
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

export interface PatientCacheItem {
  id: string; // ABHA ID or registration ID
  patientData: any;
  cachedAt: string;
  ttl?: number; // expiry in ms
}

export interface TriageDraftItem {
  id: string; // draft UUID
  triageData: any;
  timestamp: string;
}

export interface MedicineStockItem {
  id: string; // facilityId
  facilityId: string;
  inventory: any;
  updatedAt: string;
}

export interface FacilityDataItem {
  id: string; // facilityId
  facilityMetrics: any;
  updatedAt: string;
}

export interface ReferralDraftItem {
  id: string;
  referralData: any;
  timestamp: string;
}

export interface SettingItem {
  key: string;
  value: any;
}

export interface SyncLogItem {
  id?: number;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'INFO';
  timestamp: string;
  details?: any;
}

export interface StorageEstimateInfo {
  usedBytes: number;
  totalBytes: number;
  usedMB: string;
  totalMB: string;
  percentage: number;
}

export type UserRole = 'patient' | 'asha' | 'doctor' | 'admin';

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  nameMr: string;
  phone: string;
  email?: string;
  village?: string;
  villageMr?: string;
  subCentre?: string;
  subCentreMr?: string;
  facility?: string;
  designation?: string;
  designationMr?: string;
  abhaId?: string;
  registrationNo?: string;
  createdAt: string;
  avatar?: string;
}

export interface SessionRecord {
  id: string; // e.g. 'ACTIVE_SESSION'
  userId: string;
  username: string;
  name: string;
  nameMr: string;
  role: UserRole;
  token: string;
  loginTime: string;
  village?: string;
  villageMr?: string;
  subCentre?: string;
  subCentreMr?: string;
  facility?: string;
  designation?: string;
  designationMr?: string;
  abhaId?: string;
}

class HealthWayOfflineDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initPromise = this.init();
    }
  }

  private async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OfflineDB] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. syncQueue
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncQueue = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true
          });
          syncQueue.createIndex('status', 'status', { unique: false });
          syncQueue.createIndex('type', 'type', { unique: false });
          syncQueue.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 2. patientCache
        if (!db.objectStoreNames.contains(STORES.PATIENT_CACHE)) {
          const patientCache = db.createObjectStore(STORES.PATIENT_CACHE, { keyPath: 'id' });
          patientCache.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // 3. triageDrafts
        if (!db.objectStoreNames.contains(STORES.TRIAGE_DRAFTS)) {
          const triageStore = db.createObjectStore(STORES.TRIAGE_DRAFTS, { keyPath: 'id' });
          triageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 4. medicineStock
        if (!db.objectStoreNames.contains(STORES.MEDICINE_STOCK)) {
          const medicineStock = db.createObjectStore(STORES.MEDICINE_STOCK, { keyPath: 'id' });
          medicineStock.createIndex('facilityId', 'facilityId', { unique: false });
        }

        // 5. facilityData
        if (!db.objectStoreNames.contains(STORES.FACILITY_DATA)) {
          db.createObjectStore(STORES.FACILITY_DATA, { keyPath: 'id' });
        }

        // 6. referralDrafts
        if (!db.objectStoreNames.contains(STORES.REFERRAL_DRAFTS)) {
          const referralStore = db.createObjectStore(STORES.REFERRAL_DRAFTS, { keyPath: 'id' });
          referralStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 7. settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // 8. syncLog
        if (!db.objectStoreNames.contains(STORES.SYNC_LOG)) {
          const syncLog = db.createObjectStore(STORES.SYNC_LOG, {
            keyPath: 'id',
            autoIncrement: true
          });
          syncLog.createIndex('timestamp', 'timestamp', { unique: false });
          syncLog.createIndex('status', 'status', { unique: false });
        }

        // 9. users
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('role', 'role', { unique: false });
          userStore.createIndex('phone', 'phone', { unique: false });
        }

        // 10. sessions
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  public async ensureReady(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new Error('IndexedDB is not supported in this environment');
    }
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.init();
    return this.initPromise;
  }

  // ==========================================
  // 1. SYNC QUEUE OPERATIONS
  // ==========================================

  public async addToSyncQueue(
    item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt' | 'retries'>
  ): Promise<number> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const record: SyncQueueItem = {
        ...item,
        status: 'PENDING',
        retries: 0,
        createdAt: new Date().toISOString()
      };
      const request = store.add(record);
      request.onsuccess = () => {
        this.addSyncLog('QUEUE_ITEM_ADDED', 'INFO', { type: item.type, url: item.url });
        resolve(request.result as number);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const index = store.index('status');
      const request = index.getAll('PENDING');
      request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllSyncItems(): Promise<SyncQueueItem[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async updateSyncItemStatus(
    id: number,
    status: SyncItemStatus,
    error?: string
  ): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as SyncQueueItem;
        if (item) {
          item.status = status;
          item.lastAttempt = new Date().toISOString();
          if (error) item.error = error;
          if (status === 'FAILED') item.retries = (item.retries || 0) + 1;
          const updateReq = store.put(item);
          updateReq.onsuccess = () => resolve();
          updateReq.onerror = () => reject(updateReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  public async removeSyncItem(id: number): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getSyncQueueCount(): Promise<number> {
    const db = await this.ensureReady();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const index = store.index('status');
        const request = index.count('PENDING');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }

  // ==========================================
  // 2. PATIENT CACHE
  // ==========================================

  public async savePatient(patient: any): Promise<void> {
    const id = patient.abhaId || patient.id || `PAT-${Date.now()}`;
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENT_CACHE, 'readwrite');
      const store = tx.objectStore(STORES.PATIENT_CACHE);
      const record: PatientCacheItem = {
        id,
        patientData: patient,
        cachedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getPatient(id: string): Promise<any | null> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENT_CACHE, 'readonly');
      const store = tx.objectStore(STORES.PATIENT_CACHE);
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result as PatientCacheItem;
        resolve(record ? record.patientData : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async searchPatients(query: string): Promise<any[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENT_CACHE, 'readonly');
      const store = tx.objectStore(STORES.PATIENT_CACHE);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result as PatientCacheItem[]).map((r) => r.patientData);
        if (!query.trim()) {
          resolve(records);
          return;
        }
        const q = query.toLowerCase();
        const filtered = records.filter(
          (p) =>
            p?.name?.toLowerCase()?.includes(q) ||
            p?.nameMr?.includes(q) ||
            p?.abhaId?.includes(q) ||
            p?.phone?.includes(q)
        );
        resolve(filtered);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 3. TRIAGE DRAFTS
  // ==========================================

  public async saveTriageDraft(draft: any): Promise<string> {
    const id = draft.id || `TRG-DRAFT-${Date.now()}`;
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TRIAGE_DRAFTS, 'readwrite');
      const store = tx.objectStore(STORES.TRIAGE_DRAFTS);
      const record: TriageDraftItem = {
        id,
        triageData: { ...draft, id },
        timestamp: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  }

  public async getTriageDrafts(): Promise<any[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TRIAGE_DRAFTS, 'readonly');
      const store = tx.objectStore(STORES.TRIAGE_DRAFTS);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve((req.result as TriageDraftItem[]).map((d) => d.triageData));
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteTriageDraft(id: string): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TRIAGE_DRAFTS, 'readwrite');
      const store = tx.objectStore(STORES.TRIAGE_DRAFTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 4. MEDICINE STOCK CACHE
  // ==========================================

  public async saveMedicineStock(facilityId: string, inventory: any): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEDICINE_STOCK, 'readwrite');
      const store = tx.objectStore(STORES.MEDICINE_STOCK);
      const record: MedicineStockItem = {
        id: facilityId,
        facilityId,
        inventory,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getMedicineStock(facilityId: string): Promise<any | null> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEDICINE_STOCK, 'readonly');
      const store = tx.objectStore(STORES.MEDICINE_STOCK);
      const req = store.get(facilityId);
      req.onsuccess = () => {
        const item = req.result as MedicineStockItem;
        resolve(item ? item.inventory : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 5. FACILITY DATA CACHE
  // ==========================================

  public async saveFacilityData(facilityId: string, facilityMetrics: any): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.FACILITY_DATA, 'readwrite');
      const store = tx.objectStore(STORES.FACILITY_DATA);
      const record: FacilityDataItem = {
        id: facilityId,
        facilityMetrics,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getFacilityData(facilityId: string): Promise<any | null> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.FACILITY_DATA, 'readonly');
      const store = tx.objectStore(STORES.FACILITY_DATA);
      const req = store.get(facilityId);
      req.onsuccess = () => {
        const item = req.result as FacilityDataItem;
        resolve(item ? item.facilityMetrics : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 6. REFERRAL DRAFTS
  // ==========================================

  public async saveReferralDraft(draft: any): Promise<string> {
    const id = draft.id || `REF-DRAFT-${Date.now()}`;
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.REFERRAL_DRAFTS, 'readwrite');
      const store = tx.objectStore(STORES.REFERRAL_DRAFTS);
      const record: ReferralDraftItem = {
        id,
        referralData: { ...draft, id },
        timestamp: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  }

  public async getReferralDrafts(): Promise<any[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.REFERRAL_DRAFTS, 'readonly');
      const store = tx.objectStore(STORES.REFERRAL_DRAFTS);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve((req.result as ReferralDraftItem[]).map((r) => r.referralData));
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteReferralDraft(id: string): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.REFERRAL_DRAFTS, 'readwrite');
      const store = tx.objectStore(STORES.REFERRAL_DRAFTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 7. SETTINGS
  // ==========================================

  public async setSetting(key: string, value: any): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getSetting<T = any>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const db = await this.ensureReady();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? req.result.value : defaultValue);
      };
      req.onerror = () => resolve(defaultValue);
    });
  }

  // ==========================================
  // 8. SYNC LOG
  // ==========================================

  public async addSyncLog(
    action: string,
    status: 'SUCCESS' | 'FAILURE' | 'INFO',
    details?: any
  ): Promise<void> {
    try {
      const db = await this.ensureReady();
      const tx = db.transaction(STORES.SYNC_LOG, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_LOG);
      const record: SyncLogItem = {
        action,
        status,
        timestamp: new Date().toISOString(),
        details
      };
      store.add(record);
    } catch {
      // ignore logging errors
    }
  }

  public async getSyncLogs(limit = 50): Promise<SyncLogItem[]> {
    const db = await this.ensureReady();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.SYNC_LOG, 'readonly');
      const store = tx.objectStore(STORES.SYNC_LOG);
      const req = store.getAll();
      req.onsuccess = () => {
        const logs = req.result as SyncLogItem[];
        resolve(logs.slice(-limit).reverse());
      };
      req.onerror = () => resolve([]);
    });
  }

  // ==========================================
  // 9. GENERIC CACHE HELPERS (saveToCache / getFromCache)
  // ==========================================

  public async saveToCache(
    storeOrKey: StoreName | string,
    keyOrData: string | any,
    optionalData?: any,
    ttl?: number
  ): Promise<void> {
    const db = await this.ensureReady();
    let targetStore: StoreName = STORES.PATIENT_CACHE;
    let key: string;
    let value: any;

    if (optionalData !== undefined && Object.values(STORES).includes(storeOrKey as StoreName)) {
      targetStore = storeOrKey as StoreName;
      key = String(keyOrData);
      value = optionalData;
    } else {
      key = String(storeOrKey);
      value = keyOrData;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(targetStore, 'readwrite');
      const store = tx.objectStore(targetStore);
      let record: any;

      if (targetStore === STORES.SETTINGS) {
        record = { key, value };
      } else if (targetStore === STORES.MEDICINE_STOCK) {
        record = { id: key, facilityId: key, inventory: value, updatedAt: new Date().toISOString() };
      } else if (targetStore === STORES.FACILITY_DATA) {
        record = { id: key, facilityMetrics: value, updatedAt: new Date().toISOString() };
      } else {
        record = {
          id: key,
          patientData: value,
          cachedAt: new Date().toISOString(),
          ttl
        };
      }

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getFromCache<T = any>(
    storeOrKey: StoreName | string,
    optionalKey?: string
  ): Promise<T | null> {
    const db = await this.ensureReady();
    let targetStore: StoreName = STORES.PATIENT_CACHE;
    let key: string;

    if (optionalKey !== undefined && Object.values(STORES).includes(storeOrKey as StoreName)) {
      targetStore = storeOrKey as StoreName;
      key = optionalKey;
    } else {
      key = String(storeOrKey);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(targetStore, 'readonly');
      const store = tx.objectStore(targetStore);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result;
        if (!result) return resolve(null);
        if (targetStore === STORES.SETTINGS) return resolve(result.value);
        if (targetStore === STORES.MEDICINE_STOCK) return resolve(result.inventory);
        if (targetStore === STORES.FACILITY_DATA) return resolve(result.facilityMetrics);
        if (result.patientData !== undefined) return resolve(result.patientData);
        resolve(result as T);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 10. SPEC-ALIGNED CONVENIENCE ALIASES
  // ==========================================

  public async addToQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'retries' | 'createdAt'>): Promise<number> {
    return this.addToSyncQueue(item);
  }

  public async getQueue(): Promise<SyncQueueItem[]> {
    return this.getAllSyncItems();
  }

  public async removeFromQueue(id: number): Promise<void> {
    return this.removeSyncItem(id);
  }

  public async updateQueueItem(item: Partial<SyncQueueItem> & { id: number }): Promise<void> {
    if (item.status) {
      await this.updateSyncItemStatus(item.id, item.status, item.error);
    }
  }

  public async getQueueCount(): Promise<number> {
    return this.getSyncQueueCount();
  }

  public async saveDraft(formType: string, data: any): Promise<string> {
    if (formType === 'referral') {
      return this.saveReferralDraft(data);
    }
    return this.saveTriageDraft(data);
  }

  public async getDraft(formType: string, id?: string): Promise<any | null> {
    if (formType === 'referral') {
      const drafts = await this.getReferralDrafts();
      return id ? drafts.find((d) => d.id === id) || null : drafts[0] || null;
    }
    const drafts = await this.getTriageDrafts();
    return id ? drafts.find((d) => d.id === id) || null : drafts[0] || null;
  }

  public async deleteDraft(formType: string, id: string): Promise<void> {
    if (formType === 'referral') {
      await this.deleteReferralDraft(id);
    } else {
      await this.deleteTriageDraft(id);
    }
  }

  public async savePatients(patients: any[]): Promise<void> {
    for (const p of patients) {
      await this.savePatient(p);
    }
  }

  public async getPatients(): Promise<any[]> {
    return this.searchPatients('');
  }

  public async saveFacilities(facilities: any[]): Promise<void> {
    for (const f of facilities) {
      if (f.id) {
        await this.saveFacilityData(f.id, f);
      }
    }
  }

  public async getFacilities(): Promise<any[]> {
    const db = await this.ensureReady();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.FACILITY_DATA, 'readonly');
      const store = tx.objectStore(STORES.FACILITY_DATA);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve((req.result as FacilityDataItem[]).map((r) => r.facilityMetrics));
      };
      req.onerror = () => resolve([]);
    });
  }

  public async saveAnalytics(data: any): Promise<void> {
    await this.setSetting('analytics_cache', data);
  }

  public async getAnalytics(): Promise<any | null> {
    return this.getSetting('analytics_cache', null);
  }

  public async saveMedicines(medicines: any[], facilityId = 'default'): Promise<void> {
    await this.saveMedicineStock(facilityId, medicines);
  }

  public async getMedicines(facilityId = 'default'): Promise<any | null> {
    return this.getMedicineStock(facilityId);
  }

  public async getStorageUsage(): Promise<StorageEstimateInfo> {
    return this.getStorageInfo();
  }

  // ==========================================
  // STORAGE INFO & MAINTENANCE
  // ==========================================

  public async getStorageInfo(): Promise<StorageEstimateInfo> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 1;
        return {
          usedBytes: used,
          totalBytes: total,
          usedMB: (used / (1024 * 1024)).toFixed(2),
          totalMB: (total / (1024 * 1024)).toFixed(0),
          percentage: Math.min(100, Math.round((used / total) * 100))
        };
      } catch (err) {
        console.warn('[OfflineDB] storage.estimate error:', err);
      }
    }

    // Default estimate fallback
    return {
      usedBytes: 15 * 1024 * 1024,
      totalBytes: 500 * 1024 * 1024,
      usedMB: '15.4',
      totalMB: '500',
      percentage: 3
    };
  }

  public async clearExpiredCache(daysOld = 7): Promise<number> {
    const db = await this.ensureReady();
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

    return new Promise((resolve) => {
      const tx = db.transaction(STORES.PATIENT_CACHE, 'readwrite');
      const store = tx.objectStore(STORES.PATIENT_CACHE);
      const request = store.openCursor();
      let deleted = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.cachedAt < cutoff) {
            cursor.delete();
            deleted++;
          }
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      request.onerror = () => resolve(0);
    });
  }

  // ==========================================
  // 11. USER DATABASE OPERATIONS
  // ==========================================

  public async saveUser(user: UserRecord): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      const req = store.put(user);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getUserById(id: string): Promise<UserRecord | null> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as UserRecord) || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async getUserByUsername(username: string): Promise<UserRecord | null> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const index = store.index('username');
      const req = index.get(username.trim().toLowerCase());
      req.onsuccess = () => resolve((req.result as UserRecord) || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllUsers(): Promise<UserRecord[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as UserRecord[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getUsersByRole(role: UserRole): Promise<UserRecord[]> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const index = store.index('role');
      const req = index.getAll(role);
      req.onsuccess = () => resolve((req.result as UserRecord[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteUser(id: string): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // 12. SESSION PERSISTENCE OPERATIONS
  // ==========================================

  public async saveSession(session: SessionRecord): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SESSIONS, 'readwrite');
      const store = tx.objectStore(STORES.SESSIONS);
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getCurrentSession(): Promise<SessionRecord | null> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SESSIONS, 'readonly');
      const store = tx.objectStore(STORES.SESSIONS);
      const req = store.get('ACTIVE_SESSION');
      req.onsuccess = () => resolve((req.result as SessionRecord) || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async clearSession(): Promise<void> {
    const db = await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SESSIONS, 'readwrite');
      const store = tx.objectStore(STORES.SESSIONS);
      const req = store.delete('ACTIVE_SESSION');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async clearAllData(): Promise<void> {
    const db = await this.ensureReady();
    const storeNames = Object.values(STORES);
    const tx = db.transaction(storeNames, 'readwrite');
    storeNames.forEach((name) => {
      tx.objectStore(name).clear();
    });
  }
}

const offlineDB = new HealthWayOfflineDB();
export default offlineDB;
export { offlineDB, HealthWayOfflineDB };
