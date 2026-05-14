/**
 * Factory singleton untuk mendapatkan OlapBatchDailyPipelineService.
 * Menyusun dependency dengan benar.
 */
const OlapBatchDailyFactory = (function() {
  let serviceInstance = null;

  /** @returns {OlapBatchDailyPipelineService} */
  function getService() {
    if (serviceInstance) return serviceInstance;

    const historyAdapter = new ProductHistoryReaderAdapter();
    const batchService = BatchMasterFactory.getService();
    const productService = ProductMasterFactory.getService();

    const olapCfg = ApplicationConfig.dataSources.olap.configs.find(c => c.type === 'OLAP_BATCH_DAILY');
    if (!olapCfg) throw new Error('Konfigurasi OLAP_BATCH_DAILY tidak ditemukan di AppConfig');

    const adapterConfig = {
      spreadsheetId: ApplicationConfig.dataSources.olap.spreadsheetId,
      sheetName: olapCfg.sheetName,
      headerRow: olapCfg.headerRow,
      startRow: olapCfg.startRow,
      fieldMapping: olapCfg.fieldMapping,
      globalCells: {
        lastSync: olapCfg.globalLastSyncAtCell,
        updatedAt: olapCfg.globalUpdatedAtCell,
        updatedBy: olapCfg.globalUpdatedByCell
      }
    };

    const adapter = new OlapBatchDailyAdapter(adapterConfig);
    const repo = new OlapBatchDailyRepository(adapter);
    serviceInstance = new OlapBatchDailyPipelineService(historyAdapter, batchService, productService, repo);
    return serviceInstance;
  }

  function clearCache() { serviceInstance = null; }

  return { getService, clearCache };
})();