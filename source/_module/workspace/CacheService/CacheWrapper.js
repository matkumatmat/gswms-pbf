// source/_module/workspace/CacheService/CacheWrapper.js
const CacheWrapper = (function() {
  function getCache() {
    return CacheService.getScriptCache();
  }

  return {
    get: function(key) {
      const cached = getCache().get(key);
      return cached ? JSON.parse(cached) : null;
    },
    put: function(key, value, ttlSeconds = 2100) {
      const json = JSON.stringify(value);
      getCache().put(key, json, ttlSeconds);
    },
    remove: function(key) {
      getCache().remove(key);
    },
    // untuk bulk operation
    getAll: function(keys) {
      const cache = getCache();
      const result = {};
      keys.forEach(k => {
        const val = cache.get(k);
        if (val) result[k] = JSON.parse(val);
      });
      return result;
    },
    putAll: function(items, ttlSeconds = 2100) {
      const cache = getCache();
      Object.keys(items).forEach(key => {
        cache.put(key, JSON.stringify(items[key]), ttlSeconds);
      });
    }
  };
})();