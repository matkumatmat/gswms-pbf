// source/server/factories/TransactionalProductEmbalageFactory.js

/**
 * Factory singleton untuk ProductEmbalage (ALL_PEMB).
 * Mengelola lifecycle service per tahun dengan in-memory cache.
 * Merakit dependency chain: adapter → repository → service.
 *
 * Pattern identik dengan TransactionalShippingEmbalageFactory,
 * masing-masing factory berdiri sendiri (separate domain).
 */
const TransactionalProductEmbalageFactory = (function() {
  /** @type {Object.<string, TransactionalProductEmbalageService>} */
  const servicesCache = {};

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  /**
   * Resolve yearConfig dari ApplicationConfig.
   * @param {string} year
   * @returns {Object}
   * @throws jika tahun tidak dikonfigurasi
   */
  function _getYearConfig(year) {
    const yearConfig = ApplicationConfig.dataSources.transactional
      .find(y => y.year === String(year));
    if (!yearConfig) throw new Error('[TransactionalProductEmbalageFactory] Year ' + year + ' not configured');
    return yearConfig;
  }

  /**
   * Resolve sheetConfig ALL_PEMB dari yearConfig.
   * @param {Object} yearConfig
   * @returns {Object}
   * @throws jika ALL_PEMB tidak ditemukan
   */
  function _getPembConfig(yearConfig) {
    const sheetConfig = yearConfig.configs.find(c => c.type === 'ALL_PEMB');
    if (!sheetConfig) {
      throw new Error('[TransactionalProductEmbalageFactory] Sheet type ALL_PEMB not found for year ' + yearConfig.year);
    }
    return sheetConfig;
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────

  /**
   * Dapatkan service untuk tahun tertentu.
   * Service di-cache per tahun untuk menghindari re-instantiation.
   *
   * @param {string|number} year
   * @returns {TransactionalProductEmbalageService}
   */
  function getService(year) {
    const cacheKey = String(year);
    if (servicesCache[cacheKey]) return servicesCache[cacheKey];

    const yearConfig   = _getYearConfig(year);
    const sheetConfig  = _getPembConfig(yearConfig);
    const adapter      = new TransactionalProductEmbalageSheetAdapter(yearConfig, sheetConfig);
    const repository   = new TransactionalProductEmbalageRepository(adapter);
    const service      = new TransactionalProductEmbalageService(yearConfig, sheetConfig, repository);

    servicesCache[cacheKey] = service;
    Logger.log('[TransactionalProductEmbalageFactory] Service created for year ' + year);
    return service;
  }

  /**
   * Dapatkan semua tahun yang dikonfigurasi.
   * @returns {string[]}
   */
  function getAllYears() {
    return ApplicationConfig.dataSources.transactional.map(y => y.year);
  }

  /**
   * Clear in-memory service cache.
   * Dipanggil saat cache invalidation diperlukan (e.g. dari test atau trigger).
   */
  function clearCache() {
    for (const key in servicesCache) delete servicesCache[key];
    Logger.log('[TransactionalProductEmbalageFactory] Service cache cleared');
  }

  return {
    getService:  getService,
    getAllYears:  getAllYears,
    clearCache:  clearCache
  };
})();