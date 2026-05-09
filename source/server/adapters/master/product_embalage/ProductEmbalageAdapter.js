// source/server/adapters/productEmbalage/ProductEmbalageMasterAdapter.js

function ProductEmbalageMasterAdapter() {
  const masterConfig = ApplicationConfig.dataSources.master.productEmbalage;
  const pembConfig = masterConfig.configs.find(c => c.type === 'PEMB');
  if (!pembConfig) throw new Error('PEMB config not found');

  const adapterConfig = {
    spreadsheetId: masterConfig.spreadsheetId,
    sheetName:      pembConfig.sheetName,          // "PMS_PEMB"
    headerRow:      pembConfig.headerRow,          // 5
    startRow:       pembConfig.startRow,           // 6
    fieldMapping:   pembConfig.fieldMapping,
    globalCells: {
      updatedAt: pembConfig.globalUpdatedAtCell,
      lastSync:  pembConfig.globalLastSyncAtCell,
      updatedBy: pembConfig.globalUpdatedByCell
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