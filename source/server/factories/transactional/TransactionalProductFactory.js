// source/server/factories/TransactionalFactory.js

const TransactionalFactory = (function() {
  const configs = ApplicationConfig.dataSources.transactional;
  const servicesCache = {};

  function getService(year, sheetType) {
    const cacheKey = `${year}_${sheetType}`;
    if (servicesCache[cacheKey]) return servicesCache[cacheKey];

    const yearConfig = configs.find(y => y.year === year);
    if (!yearConfig) throw new Error(`Year ${year} not configured`);

    const sheetConfig = yearConfig.configs.find(c => c.type === sheetType);
    if (!sheetConfig) throw new Error(`Sheet type ${sheetType} not found for year ${year}`);

    const adapter = new TransactionalSheetAdapter(yearConfig, sheetConfig);
    const repository = new TransactionalRepository(adapter);
    const service = new TransactionalService(yearConfig, sheetConfig, repository);
    servicesCache[cacheKey] = service;
    return service;
  }

  // NEW: clear cache untuk testing
  function clearCache() {
    for (var key in servicesCache) {
      delete servicesCache[key];
    }
  }

  return {
    getService: getService,
    getAllYears: function() { return configs.map(y => y.year); },
    getAllSheetTypes: function(year) {
      const yearConfig = configs.find(y => y.year === year);
      return yearConfig ? yearConfig.configs.map(c => c.type) : [];
    },
    clearCache: clearCache
  };
})();