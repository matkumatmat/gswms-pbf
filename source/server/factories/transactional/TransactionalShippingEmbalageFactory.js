// source/server/factories/TransactionalShippingEmbalageFactory.js
const TransactionalShippingEmbalageFactory = (function() {
  const servicesCache = {};

  function getService(year) {
    const cacheKey = String(year);
    if (servicesCache[cacheKey]) return servicesCache[cacheKey];

    const yearConfig = ApplicationConfig.dataSources.transactional.find(y => y.year === String(year));
    if (!yearConfig) throw new Error('Year ' + year + ' not configured');

    const sheetConfig = yearConfig.configs.find(c => c.type === 'ALL_SEMB');
    if (!sheetConfig) throw new Error('Sheet type ALL_SEMB not found for year ' + year);

    const adapter = new TransactionalShippingEmbalageSheetAdapter(yearConfig, sheetConfig);
    const repository = new TransactionalShippingEmbalageRepository(adapter);
    const service = new TransactionalShippingEmbalageService(yearConfig, sheetConfig, repository);
    servicesCache[cacheKey] = service;
    return service;
  }

  function getAllYears() {
    return ApplicationConfig.dataSources.transactional.map(y => y.year);
  }

  function clearCache() {
    for (var key in servicesCache) delete servicesCache[key];
  }

  return {
    getService: getService,
    getAllYears: getAllYears,
    clearCache: clearCache
  };
})();