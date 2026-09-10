import { openDB, IDBPDatabase } from 'idb';
import { ModelMetadata } from '../../types/model';

const DB_NAME = 'binaire_models_offline_db';
const STORE_NAME = 'models_cache';
const META_STORE = 'cache_metadata';

/**
 * Singleton OOP CacheManager for IndexedDB offline persistence.
 */
export class CacheManager {
  private static _instance: CacheManager | null = null;
  private _dbPromise: Promise<IDBPDatabase> | null = null;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager._instance) {
      CacheManager._instance = new CacheManager();
    }
    return CacheManager._instance;
  }

  private initDB(): void {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return;
    }
    this._dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }
      },
    });
  }

  /**
   * Saves model metadata array into IndexedDB.
   */
  public async cacheModels(models: ModelMetadata[]): Promise<void> {
    if (!this._dbPromise) return;
    const db = await this._dbPromise;
    const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const model of models) {
      await store.put(model);
    }

    const metaStore = tx.objectStore(META_STORE);
    await metaStore.put({
      key: 'last_updated',
      timestamp: Date.now(),
      count: models.length,
    });

    await tx.done;
  }

  /**
   * Retrieves all cached models from IndexedDB.
   */
  public async getCachedModels(): Promise<ModelMetadata[]> {
    if (!this._dbPromise) return [];
    try {
      const db = await this._dbPromise;
      return await db.getAll(STORE_NAME);
    } catch (err) {
      console.warn('Failed to read IndexedDB cache', err);
      return [];
    }
  }

  /**
   * Returns cache metadata (last updated timestamp, model count).
   */
  public async getCacheMetadata(): Promise<{ timestamp: number; count: number } | null> {
    if (!this._dbPromise) return null;
    try {
      const db = await this._dbPromise;
      const meta = await db.get(META_STORE, 'last_updated');
      return meta ? { timestamp: meta.timestamp, count: meta.count } : null;
    } catch {
      return null;
    }
  }

  /**
   * Clears IndexedDB cache.
   */
  public async clearCache(): Promise<void> {
    if (!this._dbPromise) return;
    const db = await this._dbPromise;
    const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.objectStore(META_STORE).clear();
    await tx.done;
  }
}
