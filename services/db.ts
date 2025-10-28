/**
 * @fileoverview IndexedDB wrapper for client-side data persistence
 * Handles storage of encrypted API keys, cached model lists, app settings, and logs
 */

import { StoredKey, CachedModels, AppSettings, LogEntry } from '../types';

/** Name of the IndexedDB database */
const DB_NAME = 'AIStudioAppDB';
/** Version of the IndexedDB database */
const DB_VERSION = 1;

/** Cached promise for database connection */
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Gets a connection to the IndexedDB database
 * Creates the database and its object stores if they don't exist
 * 
 * @returns Promise<IDBDatabase> - The database connection
 */
function getDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('models')) {
         const store = db.createObjectStore('models', { keyPath: 'provider' });
         store.createIndex('fetchedAtIndex', 'fetchedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('logs')) {
        db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
  return dbPromise;
}

/**
 * Gets an object store from the database
 * Helper function to simplify database operations
 * 
 * @param storeName - Name of the object store to access
 * @param mode - Read/write mode for the transaction
 * @returns Promise<IDBObjectStore> - The requested object store
 */
async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await getDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

/**
 * Database access object with methods for all database operations
 */
export const db = {
  /**
   * Adds a new encrypted API key to the database
   * 
   * @param key - The API key object to store (without ID, which is auto-generated)
   * @returns Promise<number> - The ID of the newly added key
   */
  addKey: async (key: Omit<StoredKey, 'id'>): Promise<number> => {
    const store = await getStore('keys', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.add(key);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  },
  
  /**
   * Retrieves a stored API key by its ID
   * 
   * @param id - The ID of the key to retrieve
   * @returns Promise<StoredKey | undefined> - The requested key or undefined if not found
   */
  getKey: async (id: number): Promise<StoredKey | undefined> => {
    const store = await getStore('keys', 'readonly');
    return new Promise((resolve, reject) => {
       const req = store.get(id);
       req.onsuccess = () => resolve(req.result);
       req.onerror = () => reject(req.error);
    });
  },
  
  /**
   * Retrieves all stored API keys
   * 
   * @returns Promise<StoredKey[]> - Array of all stored keys
   */
  getAllKeys: async (): Promise<StoredKey[]> => {
    const store = await getStore('keys', 'readonly');
     return new Promise((resolve, reject) => {
       const req = store.getAll();
       req.onsuccess = () => resolve(req.result);
       req.onerror = () => reject(req.error);
    });
  },
  
  // Models
  /**
   * Retrieves cached model list for a specific provider
   * 
   * @param provider - The AI provider to get cached models for
   * @returns Promise<CachedModels | undefined> - The cached models or undefined if not found
   */
  getCachedModels: async (provider: string): Promise<CachedModels | undefined> => {
    const store = await getStore('models', 'readonly');
    return new Promise((resolve, reject) => {
       const req = store.get(provider);
       req.onsuccess = () => resolve(req.result);
       req.onerror = () => reject(req.error);
    });
  },
  
  /**
   * Caches model list for a specific provider
   * 
   * @param models - The models object to cache
   * @returns Promise<string> - The provider name (result of the put operation)
   */
  cacheModels: async (models: CachedModels): Promise<string> => {
    const store = await getStore('models', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(models);
      req.onsuccess = () => resolve(req.result as string);
      req.onerror = () => reject(req.error);
    });
  },

  // Settings
  /**
   * Retrieves application settings from the database
   * Settings are stored as a singleton with ID=1
   * 
   * @returns Promise<AppSettings | undefined> - The application settings or undefined if not found
   */
  getSettings: async (): Promise<AppSettings | undefined> => {
    const store = await getStore('settings', 'readonly');
     return new Promise((resolve, reject) => {
       const req = store.get(1); // Use a fixed key for singleton settings
       req.onsuccess = () => resolve(req.result);
       req.onerror = () => reject(req.error);
    });
  },
  
  /**
   * Saves application settings to the database
   * Settings are stored as a singleton with ID=1
   * 
   * @param settings - The settings object to save
   * @returns Promise<number> - The ID of the saved settings (always 1)
   */
  saveSettings: async (settings: AppSettings): Promise<number> => {
      const store = await getStore('settings', 'readwrite');
      return new Promise((resolve, reject) => {
          const req = store.put({ ...settings, id: 1 });
          req.onsuccess = () => resolve(req.result as number);
          req.onerror = () => reject(req.error);
      });
  },

  // Logs
  /**
   * Adds a new log entry to the database
   * 
   * @param log - The log entry to store (without ID, which is auto-generated)
   * @returns Promise<number> - The ID of the newly added log entry
   */
  addLog: async (log: Omit<LogEntry, 'id'>): Promise<number> => {
    const store = await getStore('logs', 'readwrite');
     return new Promise((resolve, reject) => {
      const req = store.add(log);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }
};
