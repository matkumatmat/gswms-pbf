// source/_module/workspace/CacheVersion.js
const CacheVersion = (function() {
  function invalidateCache(cacheGroup) {
    var versionKey = 'VERSION_' + cacheGroup;
    PropertiesWrapper.set(versionKey, Date.now());
  }

  function getCacheVersion(cacheGroup) {
    return PropertiesWrapper.get('VERSION_' + cacheGroup) || 0;
  }

  return {
    invalidateCache: invalidateCache,
    getCacheVersion: getCacheVersion
  };
})();