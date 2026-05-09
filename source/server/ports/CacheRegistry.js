// source/server/ports/CacheRegistry.js

const CacheRegistry = (function() {
  const DEFAULT_TTL = 600;   // 10 menit
  const LONG_TTL    = 86400; // 1 hari (data cold)

  /**
   * Mendapatkan TTL untuk cache group tertentu.
   * @param {string} cacheGroup
   * @returns {number}
   */
  function getTTL(cacheGroup) {
    if (cacheGroup && cacheGroup.indexOf('2025') !== -1) return LONG_TTL;
    return DEFAULT_TTL;
  }

  /**
   * Invalidasi cache group + cascade (delegasi ke CacheManager).
   * @param {string} cacheGroup
   */
  function invalidate(cacheGroup) {
    if (!cacheGroup) return;
    CacheManager.invalidate(cacheGroup);
  }

  /**
   * Mendapatkan versi terbaru cache group (delegasi ke CacheManager).
   * @param {string} cacheGroup
   * @returns {number}
   */
  function getVersion(cacheGroup) {
    return CacheManager.getVersion(cacheGroup);
  }

  /**
   * Membuat cache key dengan version.
   * @param {string} baseKey
   * @param {string} cacheGroup
   * @returns {string}
   */
  function makeKey(baseKey, cacheGroup) {
    var version = getVersion(cacheGroup);
    return baseKey + '_V' + version;
  }

  return {
    getTTL:     getTTL,
    invalidate: invalidate,
    getVersion: getVersion,
    makeKey:    makeKey
  };
})();