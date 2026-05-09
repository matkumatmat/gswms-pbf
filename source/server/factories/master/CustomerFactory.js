// source/server/factories/CustomerMasterFactory.js

const CustomerMasterFactory = (function () {
  let serviceInstance = null;

  function getService() {
    if (serviceInstance) return serviceInstance;
    const adapter = new CustomerMasterAdapter();
    const repo = new CustomerMasterRepository(adapter);
    serviceInstance = new CustomerMasterService(repo);
    return serviceInstance;
  }

  function clearCache() {
    serviceInstance = null;
  }

  return { getService, clearCache };
})();