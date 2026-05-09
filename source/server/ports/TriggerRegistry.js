// source/server/ports/TriggerRegistry.js

const TriggerRegistry = (function() {
  // Daftar semua spreadsheet target beserta konfigurasi trigger
  const triggers = [
    {
      spreadsheetId: ApplicationConfig.dataSources.master.customer.spreadsheetId,
      sheetName: ApplicationConfig.dataSources.master.customer.configs[0].sheetName,
      cacheGroup: 'MASTER_CUSTOMER',
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: ApplicationConfig.dataSources.master.product.spreadsheetId,
      sheetName: ApplicationConfig.dataSources.master.product.configs.find(c => c.type === 'PRODUCT').sheetName,
      cacheGroup: 'MASTER_PRODUCT',
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: ApplicationConfig.dataSources.master.product.spreadsheetId,
      sheetName: ApplicationConfig.dataSources.master.product.configs.find(c => c.type === 'BATCH').sheetName,
      cacheGroup: 'MASTER_BATCH',
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: ApplicationConfig.dataSources.master.shippingEmbalage.spreadsheetId,
      sheetName: ApplicationConfig.dataSources.master.shippingEmbalage.configs[0].sheetName,
      cacheGroup: 'MASTER_SEMB',
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: ApplicationConfig.dataSources.master.productEmbalage.spreadsheetId,
      sheetName: ApplicationConfig.dataSources.master.productEmbalage.configs[0].sheetName,
      cacheGroup: 'MASTER_PEMB',
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    }
  ];

  // Tambahan untuk transactional sheets (bisa dinamis dari config)
  function getTransactionalTriggers() {
    var transactionalTriggers = [];
    var configs = ApplicationConfig.dataSources.transactional;
    configs.forEach(function(yearConfig) {
      yearConfig.configs.forEach(function(sheetConfig) {
        transactionalTriggers.push({
          spreadsheetId: yearConfig.spreadsheetId,
          sheetName: sheetConfig.sheetName,
          cacheGroup: 'TRANS_' + yearConfig.year + '_' + sheetConfig.type,
          onEditHandler: 'onEditHandler',
          onChangeHandler: 'onChangeHandler'
        });
      });
    });
    return transactionalTriggers;
  }

  function getAllTriggers() {
    return triggers.concat(getTransactionalTriggers());
  }

  function getBySpreadsheetId(spreadsheetId) {
    return getAllTriggers().find(function(t) { return t.spreadsheetId === spreadsheetId; });
  }

  function getCacheGroup(sheetName, year, sheetType) {
    // fallback: cari dari triggers berdasarkan sheetName
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].sheetName === sheetName) return triggers[i].cacheGroup;
    }
    // jika tidak ditemukan, untuk transactional
    if (year && sheetType) {
      return 'TRANS_' + year + '_' + sheetType;
    }
    return null;
  }

  return {
    getAllTriggers: getAllTriggers,
    getBySpreadsheetId: getBySpreadsheetId,
    getCacheGroup: getCacheGroup
  };
})();