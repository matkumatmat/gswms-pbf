// source/server/adapters/batch/BatchMasterAdapter.js

/**
 * Adapter untuk sheet master BATCH (PMS_BATCH).
 * Menggunakan MasterSheetAdapter dengan konfigurasi dari master.product configs type=BATCH.
 */
function BatchMasterAdapter() {
  const masterConfig = ApplicationConfig.dataSources.master.product;   // same spreadsheet
  const batchConfig = masterConfig.configs.find(c => c.type === 'BATCH');
  if (!batchConfig) throw new Error('BATCH config not found in master.product');

  const adapterConfig = {
    spreadsheetId: masterConfig.spreadsheetId,
    sheetName:      batchConfig.sheetName,          // "PMS_BATCH"
    headerRow:      batchConfig.headerRow,          // 5
    startRow:       batchConfig.startRow,           // 6
    fieldMapping:   batchConfig.fieldMapping,
    globalCells: {
      updatedAt: batchConfig.globalUpdatedAtCell,  // "B2"
      lastSync:  batchConfig.globalLastSyncAtCell, // "B1"
      updatedBy: batchConfig.globalUpdatedByCell   // "B3"
    }
  };

  const adapter = new MasterSheetAdapter(adapterConfig);

  this.getAll             = () => adapter.getAll();
  this.findById           = (id) => adapter.findById(id);
  this.findByField        = (field, value) => adapter.findByField(field, value);
  this.append             = (data) => adapter.append(data);
  this.updateById         = (id, data) => adapter.updateById(id, data);
  this.updateGlobalCells  = (userEmail) => adapter.updateGlobalCells(userEmail);
}