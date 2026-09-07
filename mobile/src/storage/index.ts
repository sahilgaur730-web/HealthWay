/**
 * HealthWay Storage Module Entry Point
 * Exports singleton storage engine and constants
 */

import { StorageEngine } from './storageEngine';

export * from './types';
export * from './sqliteAdapter';
export * from './asyncStorageAdapter';
export * from './storageEngine';

export const storage = new StorageEngine();
export const storageEngine = storage;
export const offlineStorage = storage;
export default storage;
