// source/server/factories/ProductEmbalageMasterFactory.js

const ProductEmbalageMasterFactory = (function () {
  let instance = null;
  function getService() {
    if (instance) return instance;
    const adapter = new ProductEmbalageMasterAdapter();
    const repo = new ProductEmbalageMasterRepository(adapter);
    instance = new ProductEmbalageMasterService(repo);
    return instance;
  }
  function clearCache() { instance = null; }
  return { getService, clearCache };
})();