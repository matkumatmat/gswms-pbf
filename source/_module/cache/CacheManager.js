// source/_module/cache/CacheManager.js

const CacheManager = (function() {
  // Gunakan spreadsheetId dari AppConfig yang sama untuk semua master
  const MASTER_SPREADSHEET_ID = '1Rdb0Zx0py2ygOEDnNE1LHv4Xfdu0HHqEM2-sDmDruGM';

  const DEPENDENCY_MAP = {
    // Master: Product -> Batch (jika product berubah, batch perlu invalidasi)
    ['MASTER_' + MASTER_SPREADSHEET_ID + '_PMS_PRODUCT']: [
      'MASTER_' + MASTER_SPREADSHEET_ID + '_PMS_BATCH'
    ],
    // Master: Batch -> BatchRecord (opsional cascade ke export)
    ['MASTER_' + MASTER_SPREADSHEET_ID + '_PMS_BATCH']: [
      'BATCH_RECORD'
    ],
    // Transactional: semua DIST/RCV/CONS -> history product terpengaruh
    'TRANS_2025_ALL_DIST':  ['HISTORY_PRODUCT'],
    'TRANS_2025_ALL_RCV':   ['HISTORY_PRODUCT'],
    'TRANS_2025_ALL_CONS':  ['HISTORY_PRODUCT'],
    'TRANS_2026_ALL_DIST':  ['HISTORY_PRODUCT'],
    'TRANS_2026_ALL_RCV':   ['HISTORY_PRODUCT'],
    'TRANS_2026_ALL_CONS':  ['HISTORY_PRODUCT'],
    // SEMB dan PEMB tidak punya dependen history khusus (pakai chunk cache sendiri)
    'TRANS_2025_ALL_SEMB':  [],
    'TRANS_2025_ALL_PEMB':  [],
    'TRANS_2026_ALL_SEMB':  [],
    'TRANS_2026_ALL_PEMB':  [],
    // Archive
    ['ARCHIVE_13l_jPfddoJFaklJpFwDRfsupdAmZjslbh1Y3LQvaXNw_ALL_ARCHIEVE']: [],
    // Shipping label (jika diperlukan)
    ['SHIPPING_LABEL']: []
  };

  /**
   * Resolve nama cache group dari konfigurasi sheet.
   * Tidak hardcode – semua dari AppConfig.
   */
  function resolveCacheGroup(config) {
    if (config.domain === 'master') {
      return 'MASTER_' + config.spreadsheetId + '_' + config.sheetName;
    } else if (config.domain === 'transactional') {
      return 'TRANS_' + config.year + '_' + config.type;
    } else if (config.domain === 'archive') {
      return 'ARCHIVE_' + config.spreadsheetId + '_' + config.sheetName;
    }
    // fallback
    return config.spreadsheetId + '_' + config.sheetName;
  }

  /**
   * Invalidasi cache group dan semua dependensinya (cascade).
   */
  function invalidate(cacheGroup) {
    if (!cacheGroup) return;
    const queue = [cacheGroup];
    const visited = {};

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited[current]) continue;
      visited[current] = true;

      // Bump versi via CacheVersion module
      CacheVersion.invalidateCache(current);
      Logger.log('[CacheManager] Invalidated: ' + current);

      // Tambahkan dependents ke queue
      const deps = DEPENDENCY_MAP[current] || [];
      deps.forEach(function(dep) {
        if (!visited[dep]) queue.push(dep);
      });
    }
  }

  /**
   * Ambil versi terbaru suatu cache group.
   */
  function getVersion(cacheGroup) {
    return CacheVersion.getCacheVersion(cacheGroup);
  }

  /**
   * Hapus semua VERSION_ properties (development only).
   */
  function forceClearAll() {
    const props = PropertiesService.getScriptProperties();
    const keys = props.getKeys();
    keys.forEach(function(key) {
      if (key.indexOf('VERSION_') === 0) {
        props.deleteProperty(key);
      }
    });
    Logger.log('[CacheManager] All VERSION_ properties deleted.');
  }

  return {
    invalidate: invalidate,
    getVersion: getVersion,
    forceClearAll: forceClearAll,
    resolveCacheGroup: resolveCacheGroup
  };
})();