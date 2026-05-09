// source/server/adapters/product/ProductMasterAdapter.js

/**
 * Adapter untuk sheet master product (PMS_PRODUCT).
 * Menggunakan MasterSheetAdapter dengan konfigurasi dari AppConfig.
 */
function ProductMasterAdapter() {
  const masterConfig = ApplicationConfig.dataSources.master.product;
  const productConfig = masterConfig.configs.find(c => c.type === 'PRODUCT');
  if (!productConfig) throw new Error('PRODUCT config not found in master.product');

  const config = {
    spreadsheetId: masterConfig.spreadsheetId,
    sheetName: productConfig.sheetName,          // "PMS_PRODUCT"
    headerRow: productConfig.headerRow,          // 5
    startRow: productConfig.startRow,            // 6
    fieldMapping: productConfig.fieldMapping,
    globalCells: {
      updatedAt: productConfig.globalUpdatedAtCell,  // "B2"
      lastSync:  productConfig.globalLastSyncAtCell, // "B1"
      updatedBy: productConfig.globalUpdatedByCell   // "B3"
    }
  };

  const adapter = new MasterSheetAdapter(config);

  // Delegasi seluruh operasi ke adapter generik
  this.getAll = () => adapter.getAll();
  this.findById = (id) => adapter.findById(id);
  this.findByField = (field, value) => adapter.findByField(field, value);
  this.append = (data) => adapter.append(data);
  this.updateById = (id, data) => adapter.updateById(id, data);
  this.updateGlobalCells = () => adapter.updateGlobalCells();
}