// source/server/factories/ArchieveFactory.js

/**
 * Singleton factory for Archieve domain.
 * Assembles Adapter → Repository → Service.
 */
const ArchieveFactory = (function() {
  let serviceInstance = null;

  /** @returns {ArchieveService} */
  function getService() {
    if (serviceInstance) return serviceInstance;
    const adapter = new ArchieveSheetAdapter();
    const repository = new ArchieveRepository(adapter);
    serviceInstance = new ArchieveService(repository);
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