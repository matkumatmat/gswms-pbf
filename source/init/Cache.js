// source/init/Cache.js

/**
 * Hard reset seluruh cache yang digunakan aplikasi.
 * Digunakan hanya untuk development/testing.
 * Membersihkan:
 *  - Semua version properties (VERSION_*) di ScriptProperties via CacheManager.
 *  - In-memory factory cache.
 */
function hardResetAllCache() {
  CacheManager.forceClearAll();
  _clearAllFactoryCaches();
  Logger.log('🔥 All caches cleared');
}

/**
 * Mengosongkan in-memory cache di seluruh factory singleton.
 * Setelah ini, pemanggilan service akan membuat instance baru dan
 * membaca sheet dari awal.
 */
function _clearAllFactoryCaches() {
  TransactionalFactory.clearCache();
  TransactionalShippingEmbalageFactory.clearCache();
  TransactionalProductEmbalageFactory.clearCache();
  ProductMasterFactory.clearCache();
  BatchMasterFactory.clearCache();
  CustomerMasterFactory.clearCache();
  ShippingEmbalageMasterFactory.clearCache();
  ProductEmbalageMasterFactory.clearCache();
  Logger.log('✅ All factory in-memory caches cleared.');
}

/**
 * Fungsi yang bisa dipanggil dari editor Apps Script untuk debug.
 * Jalankan: `devClearAllCaches()`
 */
function devClearAllCaches() {
  hardResetAllCache();
}