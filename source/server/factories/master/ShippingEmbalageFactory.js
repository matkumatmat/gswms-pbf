// source/server/factories/ShippingEmbalageMasterFactory.js

const ShippingEmbalageMasterFactory = (function () {
  let serviceInstance = null;

  function getService() {
    if (serviceInstance) return serviceInstance;
    const adapter = new ShippingEmbalageMasterAdapter();
    const repo = new ShippingEmbalageMasterRepository(adapter);
    serviceInstance = new ShippingEmbalageMasterService(repo);
    return serviceInstance;
  }

  function clearCache() { serviceInstance = null; }

  return { getService, clearCache };
})();