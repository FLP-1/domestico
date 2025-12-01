/**
 * Cache Offline para eSocial usando IndexedDB
 * Componente reutilizável e centralizado
 */

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number; // Time to live em ms
}

export interface CacheConfig {
  dbName?: string;
  dbVersion?: number;
  defaultTTL?: number; // TTL padrão em ms (24 horas)
}

/**
 * Cache Offline reutilizável e centralizado
 */
export class ESocialOfflineCache {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly dbVersion: number;
  private readonly defaultTTL: number;

  private initPromise: Promise<void> | null = null;

  constructor(config: CacheConfig = {}) {
    this.dbName = config.dbName ?? 'esocial_cache';
    this.dbVersion = config.dbVersion ?? 1;
    this.defaultTTL = config.defaultTTL ?? 24 * 60 * 60 * 1000; // 24 horas
  }

  /**
   * Inicializa IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.db) {
      return; // Já inicializado
    }

    if (this.initPromise) {
      return this.initPromise; // Já está inicializando
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // Servidor-side: não há IndexedDB
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        this.initPromise = null;
        reject(new Error(`Erro ao abrir IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para empregador
        if (!db.objectStoreNames.contains('empregador')) {
          db.createObjectStore('empregador', { keyPath: 'key' });
        }

        // Store para empregados
        if (!db.objectStoreNames.contains('empregados')) {
          db.createObjectStore('empregados', { keyPath: 'key' });
        }

        // Store para eventos
        if (!db.objectStoreNames.contains('eventos')) {
          const store = db.createObjectStore('eventos', { keyPath: 'key' });
          store.createIndex('protocolo', 'protocolo', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para folhas
        if (!db.objectStoreNames.contains('folhas')) {
          const store = db.createObjectStore('folhas', { keyPath: 'key' });
          store.createIndex('mesAno', 'mesAno', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store genérico para outros dados
        if (!db.objectStoreNames.contains('generic')) {
          db.createObjectStore('generic', { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Obtém valor do cache
   */
  async get<T>(key: string, store: string): Promise<T | null> {
    await this.initialize();

    if (!this.db || typeof window === 'undefined') {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Verificar TTL
        const age = Date.now() - entry.timestamp;
        const ttl = entry.ttl ?? this.defaultTTL;

        if (age > ttl) {
          // Cache expirado - remover e retornar null
          this.delete(key, store).catch(() => {});
          resolve(null);
          return;
        }

        resolve(entry.value);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Armazena valor no cache
   */
  async set<T>(
    key: string,
    value: T,
    store: string,
    ttl?: number
  ): Promise<void> {
    await this.initialize();

    if (!this.db || typeof window === 'undefined') {
      return; // Servidor-side: não há cache
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);

      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL,
      };

      const request = objectStore.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove valor do cache
   */
  async delete(key: string, store: string): Promise<void> {
    await this.initialize();

    if (!this.db || typeof window === 'undefined') {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpa todo o cache de uma store
   */
  async clear(store: string): Promise<void> {
    await this.initialize();

    if (!this.db || typeof window === 'undefined') {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém com fallback: tenta cache, depois API, depois cache expirado
   */
  async getWithFallback<T>(
    key: string,
    store: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<{ data: T; source: 'CACHE' | 'API' | 'EXPIRED_CACHE' }> {
    // 1. Tentar cache válido
    const cached = await this.get<T>(key, store);
    if (cached !== null) {
      return { data: cached, source: 'CACHE' };
    }

    // 2. Tentar API
    try {
      const fresh = await fetchFn();
      await this.set(key, fresh, store, ttl);
      return { data: fresh, source: 'API' };
    } catch (error) {
      // 3. Se API falhar, tentar cache expirado
      const expired = await this.getExpired<T>(key, store);
      if (expired !== null) {
        return { data: expired, source: 'EXPIRED_CACHE' };
      }

      throw error;
    }
  }

  /**
   * Obtém cache mesmo se expirado
   */
  private async getExpired<T>(key: string, store: string): Promise<T | null> {
    await this.initialize();

    if (!this.db || typeof window === 'undefined') {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        resolve(entry ? entry.value : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém todas as chaves de uma store
   */
  async getAllKeys(store: string): Promise<string[]> {
    await this.initialize();

    if (!this.db || typeof window === 'undefined') {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Instância singleton centralizada
 */
let cacheInstance: ESocialOfflineCache | null = null;

/**
 * Obtém instância do Cache (singleton)
 */
export function getESocialOfflineCache(
  config?: CacheConfig
): ESocialOfflineCache {
  if (!cacheInstance) {
    cacheInstance = new ESocialOfflineCache(config);
  }
  return cacheInstance;
}

/**
 * Reseta instância do Cache
 */
export function resetESocialOfflineCache(): void {
  if (cacheInstance) {
    cacheInstance = null;
  }
}
