// source/server/adapters/customer/CustomerMasterAdapter.js

/**
 * Adapter untuk sheet master CUSTOMER (PMS_CUSTOMER).
 * Menggunakan MasterSheetAdapter generik dengan konfigurasi dari master.customer.
 */
function CustomerMasterAdapter() {
  const masterConfig = ApplicationConfig.dataSources.master.customer;
  const customerConfig = masterConfig.configs.find(c => c.type === 'CUSTOMER');
  if (!customerConfig) throw new Error('CUSTOMER config not found in master.customer');

  const adapterConfig = {
    spreadsheetId: masterConfig.spreadsheetId,
    sheetName:      customerConfig.sheetName,          // "PMS_CUSTOMER"
    headerRow:      customerConfig.headerRow,          // 5
    startRow:       customerConfig.startRow,           // 6
    fieldMapping:   customerConfig.fieldMapping,
    globalCells: {
      updatedAt: customerConfig.globalUpdatedAtCell,  // "B2"
      lastSync:  customerConfig.globalLastSyncAtCell, // "B1"
      updatedBy: customerConfig.globalUpdatedByCell   // "B3"
    }
  };

  const adapter = new MasterSheetAdapter(adapterConfig);

  this.getAll             = () => adapter.getAll();
  this.findById           = (id) => adapter.findById(id);
  this.findByField        = (field, value) => adapter.findByField(field, value);
  this.append             = (data) => adapter.append(data);
  this.updateById         = (id, data) => adapter.updateById(id, data);
  this.updateGlobalCells  = () => adapter.updateGlobalCells();
}