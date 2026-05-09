// source/server/ports/CacheRegistry.js

const CacheRegistry = (function() {
  // Konfigurasi default TTL (detik)
  const DEFAULT_TTL = 600; // 10 menit
  const LONG_TTL = 86400;  // 1 hari untuk data cold

  // Mapping cacheGroup ke TTL
  const ttlMap = {
    // Customer, product, batch (hot)
    // [ApplicationConfig.dataSources.customer.sheetName]: DEFAULT_TTL,
    // [ApplicationConfig.dataSources.product.sheetName]: DEFAULT_TTL,
    // [ApplicationConfig.dataSources.batch.sheetName]: DEFAULT_TTL,
    // [ApplicationConfig.dataSources.shippingLabel.sheetName]: DEFAULT_TTL,
    // [ApplicationConfig.dataSources.shippingEmbalage.lookupSheetName]: DEFAULT_TTL,
    // Cold transactional (2025) bisa LONG_TTL, hot (2026) DEFAULT_TTL
  };

  /**
   * Mendapatkan TTL untuk cacheGroup tertentu
   * @param {string} cacheGroup
   * @returns {number}
   */
  function getTTL(cacheGroup) {
    if (ttlMap[cacheGroup]) return ttlMap[cacheGroup];
    // Jika cacheGroup mengandung '2025', anggap cold
    if (cacheGroup && cacheGroup.includes('2025')) return LONG_TTL;
    return DEFAULT_TTL;
  }

  /**
   * Invalidasi cache untuk cacheGroup tertentu (update version)
   * @param {string} cacheGroup
   */
  function invalidate(cacheGroup) {
    if (!cacheGroup) return;
    CacheVersion.invalidateCache(cacheGroup);
  }

  /**
   * Mendapatkan version terbaru untuk cacheGroup
   * @param {string} cacheGroup
   * @returns {number}
   */
  function getVersion(cacheGroup) {
    return CacheVersion.getCacheVersion(cacheGroup);
  }

  /**
   * Membuat cache key dengan version
   * @param {string} baseKey
   * @param {string} cacheGroup
   * @returns {string}
   */
  function makeKey(baseKey, cacheGroup) {
    var version = getVersion(cacheGroup);
    return baseKey + '_V' + version;
  }

  return {
    getTTL: getTTL,
    invalidate: invalidate,
    getVersion: getVersion,
    makeKey: makeKey
  };
})();