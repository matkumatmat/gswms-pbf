// source/server/factories/ProductMasterFactory.js

const ProductMasterFactory = (function () {
  let serviceInstance = null;

  function getService() {
    if (serviceInstance) return serviceInstance;
    const adapter = new ProductMasterAdapter();
    const repository = new ProductMasterRepository(adapter);
    serviceInstance = new ProductMasterService(repository);
    return serviceInstance;
  }

  function clearCache() {
    serviceInstance = null;
  }

  return { getService, clearCache };
})();