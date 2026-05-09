// source/server/factories/BatchMasterFactory.js

const BatchMasterFactory = (function () {
  let serviceInstance = null;

  function getService() {
    if (serviceInstance) return serviceInstance;
    const adapter = new BatchMasterAdapter();
    const repo = new BatchMasterRepository(adapter);
    serviceInstance = new BatchMasterService(repo);
    return serviceInstance;
  }

  function clearCache() {
    serviceInstance = null;
  }

  return {
    getService: getService,
    clearCache: clearCache
  };
})();