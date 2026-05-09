function hardResetAllCache() {
  CacheManager.forceClearAll();
  TransactionalFactory.clearCache();
  TransactionalShippingEmbalageFactory.clearCache();
  TransactionalProductEmbalageFactory.clearCache();
  ProductMasterFactory.clearCache();
  BatchMasterFactory.clearCache();
  CustomerMasterFactory.clearCache();
  ShippingEmbalageMasterFactory.clearCache();
  ProductEmbalageMasterFactory.clearCache();
  Logger.log('🔥 All caches cleared');
}

// source/init/Cache.js

/**
 * Hard reset seluruh cache yang digunakan aplikasi.
 * Digunakan hanya untuk development/testing.
 * Membersihkan:
 *  - Semua version properties (VERSION_*) di ScriptProperties.
 *  - In-memory factory cache.
 *  - (Opsional) Google Apps Script CacheService.
 */
function hardResetAllCache() {
  // 1. Hapus semua properti version, sehingga semua cache grup menjadi invalid
  _wipeAllVersionProperties();

  // 2. Bersihkan in-memory cache semua factory yang ada
  _clearAllFactoryCaches();

  // 3. (Opsional) Bersihkan ScriptCache – hanya jika perlu, karena sudah di-cover oleh version
  // _wipeScriptCache();

  Logger.log('🔥 All cache cleared: properties, factories, and optional ScriptCache.');
}

// ─────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Menghapus semua ScriptProperties yang diawali 'VERSION_'.
 * Ini memaksa seluruh chunk cache di history adapter terefresh.
 */
function _wipeAllVersionProperties() {
  var props = PropertiesService.getScriptProperties();
  var allKeys = props.getKeys();
  allKeys.forEach(function(key) {
    if (key.indexOf('VERSION_') === 0) {
      props.deleteProperty(key);
    }
  });
  Logger.log('✅ All VERSION_* properties deleted.');
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
  CustomerMasterFactory.clearCache();          // ← uncomment
  ShippingEmbalageMasterFactory.clearCache();  // ← uncomment
  ProductEmbalageMasterFactory.clearCache();   // ← uncomment
  Logger.log('✅ All factory in-memory caches cleared.');
}

/**
 * (Optional) Benar-benar menghapus semua konten CacheService.
 * Hanya diperlukan jika kita menyimpan data langsung ke CacheService
 * tanpa mekanisme versioning. Saat ini tidak digunakan.
 */
function _wipeScriptCache() {
  var cache = CacheService.getScriptCache();
  // Tidak ada bulk delete, jadi kita gunakan trik: taruh key dummy dan
  // atur semua keys yang kita tahu? Atau gunakan properti "global version".
  // Untuk sekarang, dikosongkan karena version property sudah cukup.
  Logger.log('ℹ️ ScriptCache wipe skipped – version properties sudah cukup.');
}

// ====================================================================
// Ekspos fungsi untuk memudahkan pemanggilan dari editor / menu
// ====================================================================

/**
 * Fungsi yang bisa dipanggil dari editor Apps Script untuk debug.
 * Jalankan: `devClearAllCaches()`
 */
function devClearAllCaches() {
  hardResetAllCache();
}