// source/server/adapters/shippingEmbalage/ShippingEmbalageMasterAdapter.js

/**
 * Adapter untuk sheet master SEMB (PMS_SEMB).
 * Menggunakan MasterSheetAdapter generik dengan konfigurasi master.shippingEmbalage.
 */
function ShippingEmbalageMasterAdapter() {
  const masterConfig = ApplicationConfig.dataSources.master.shippingEmbalage;
  const sembConfig = masterConfig.configs.find(c => c.type === 'SEMB');
  if (!sembConfig) throw new Error('SEMB config not found in master.shippingEmbalage');

  const adapterConfig = {
    spreadsheetId: masterConfig.spreadsheetId,
    sheetName:      sembConfig.sheetName,          // "PMS_SEMB"
    headerRow:      sembConfig.headerRow,          // 5
    startRow:       sembConfig.startRow,           // 6
    fieldMapping:   sembConfig.fieldMapping,
    globalCells: {
      updatedAt: sembConfig.globalUpdatedAtCell,  // "B2"
      lastSync:  sembConfig.globalLastSyncAtCell, // "B1"
      updatedBy: sembConfig.globalUpdatedByCell   // "B3"
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