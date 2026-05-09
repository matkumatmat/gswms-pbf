// // source/server/ports/TriggerRegistry.js(v1)
// const TriggerRegistry = (function() {

//   // Resolver helper — satu gaya dengan yang dipakai di service/adapter
//   function _resolveMasterCacheGroup(spreadsheetId, sheetName) {
//     return CacheManager.resolveCacheGroup({
//       domain: 'master',
//       spreadsheetId: spreadsheetId,
//       sheetName: sheetName
//     });
//   }

//   function _resolveTransactionalCacheGroup(spreadsheetId, sheetName, year, type) {
//     return CacheManager.resolveCacheGroup({
//       domain: 'transactional',
//       spreadsheetId: spreadsheetId,
//       sheetName: sheetName,
//       year: year,
//       type: type
//     });
//   }

//   // Semua master sheet
//   var masterCustomerCfg = ApplicationConfig.dataSources.master.customer.configs[0];
//   var masterProductCfg  = ApplicationConfig.dataSources.master.product.configs.find(function(c) { return c.type === 'PRODUCT'; });
//   var masterBatchCfg    = ApplicationConfig.dataSources.master.product.configs.find(function(c) { return c.type === 'BATCH'; });
//   var masterSembCfg     = ApplicationConfig.dataSources.master.shippingEmbalage.configs[0];
//   var masterPembCfg     = ApplicationConfig.dataSources.master.productEmbalage.configs[0];

//   var masterCustomerSpreadsheetId = ApplicationConfig.dataSources.master.customer.spreadsheetId;
//   var masterProductSpreadsheetId  = ApplicationConfig.dataSources.master.product.spreadsheetId;
//   var masterSembSpreadsheetId     = ApplicationConfig.dataSources.master.shippingEmbalage.spreadsheetId;
//   var masterPembSpreadsheetId     = ApplicationConfig.dataSources.master.productEmbalage.spreadsheetId;

//   var triggers = [
//     {
//       spreadsheetId: masterCustomerSpreadsheetId,
//       sheetName: masterCustomerCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterCustomerSpreadsheetId, masterCustomerCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterProductSpreadsheetId,
//       sheetName: masterProductCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterProductSpreadsheetId, masterProductCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterProductSpreadsheetId,
//       sheetName: masterBatchCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterProductSpreadsheetId, masterBatchCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterSembSpreadsheetId,
//       sheetName: masterSembCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterSembSpreadsheetId, masterSembCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterPembSpreadsheetId,
//       sheetName: masterPembCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterPembSpreadsheetId, masterPembCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     }
//   ];

//   // Transactional sheets (dinamis dari config)
//   function getTransactionalTriggers() {
//     var transactionalTriggers = [];
//     var configs = ApplicationConfig.dataSources.transactional;
//     configs.forEach(function(yearConfig) {
//       yearConfig.configs.forEach(function(sheetConfig) {
//         transactionalTriggers.push({
//           spreadsheetId: yearConfig.spreadsheetId,
//           sheetName: sheetConfig.sheetName,
//           cacheGroup: _resolveTransactionalCacheGroup(
//             yearConfig.spreadsheetId,
//             sheetConfig.sheetName,
//             yearConfig.year,
//             sheetConfig.type
//           ),
//           onEditHandler: 'onEditHandler',
//           onChangeHandler: 'onChangeHandler'
//         });
//       });
//     });
//     return transactionalTriggers;
//   }

//   function getAllTriggers() {
//     return triggers.concat(getTransactionalTriggers());
//   }

//   function getBySpreadsheetId(spreadsheetId) {
//     return getAllTriggers().find(function(t) { return t.spreadsheetId === spreadsheetId; });
//   }

//   return {
//     getAllTriggers: getAllTriggers,
//     getBySpreadsheetId: getBySpreadsheetId
//   };
// })();

const dividerzzzzzz = null

// source/server/ports/TriggerRegistry.js(v2)
// const TriggerRegistry = (function() {

//   function _resolveMasterCacheGroup(spreadsheetId, sheetName) {
//     return CacheManager.resolveCacheGroup({
//       domain: 'master',
//       spreadsheetId: spreadsheetId,
//       sheetName: sheetName
//     });
//   }

//   function _resolveTransactionalCacheGroup(spreadsheetId, sheetName, year, type) {
//     return CacheManager.resolveCacheGroup({
//       domain: 'transactional',
//       spreadsheetId: spreadsheetId,
//       sheetName: sheetName,
//       year: year,
//       type: type
//     });
//   }

//   var masterCustomerCfg = ApplicationConfig.dataSources.master.customer.configs[0];
//   var masterProductCfg  = ApplicationConfig.dataSources.master.product.configs.find(function(c) { return c.type === 'PRODUCT'; });
//   var masterBatchCfg    = ApplicationConfig.dataSources.master.product.configs.find(function(c) { return c.type === 'BATCH'; });
//   var masterSembCfg     = ApplicationConfig.dataSources.master.shippingEmbalage.configs[0];
//   var masterPembCfg     = ApplicationConfig.dataSources.master.productEmbalage.configs[0];

//   var masterCustomerSpreadsheetId = ApplicationConfig.dataSources.master.customer.spreadsheetId;
//   var masterProductSpreadsheetId  = ApplicationConfig.dataSources.master.product.spreadsheetId;
//   var masterSembSpreadsheetId     = ApplicationConfig.dataSources.master.shippingEmbalage.spreadsheetId;
//   var masterPembSpreadsheetId     = ApplicationConfig.dataSources.master.productEmbalage.spreadsheetId;

//   var triggers = [
//     {
//       spreadsheetId: masterCustomerSpreadsheetId,
//       sheetName: masterCustomerCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterCustomerSpreadsheetId, masterCustomerCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterProductSpreadsheetId,
//       sheetName: masterProductCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterProductSpreadsheetId, masterProductCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterProductSpreadsheetId,
//       sheetName: masterBatchCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterProductSpreadsheetId, masterBatchCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterSembSpreadsheetId,
//       sheetName: masterSembCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterSembSpreadsheetId, masterSembCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     },
//     {
//       spreadsheetId: masterPembSpreadsheetId,
//       sheetName: masterPembCfg.sheetName,
//       cacheGroup: _resolveMasterCacheGroup(masterPembSpreadsheetId, masterPembCfg.sheetName),
//       onEditHandler: 'onEditHandler',
//       onChangeHandler: 'onChangeHandler'
//     }
//   ];

//   function getTransactionalTriggers() {
//     var transactionalTriggers = [];
//     var configs = ApplicationConfig.dataSources.transactional;
//     configs.forEach(function(yearConfig) {
//       yearConfig.configs.forEach(function(sheetConfig) {
//         transactionalTriggers.push({
//           spreadsheetId: yearConfig.spreadsheetId,
//           sheetName: sheetConfig.sheetName,
//           cacheGroup: _resolveTransactionalCacheGroup(
//             yearConfig.spreadsheetId,
//             sheetConfig.sheetName,
//             yearConfig.year,
//             sheetConfig.type
//           ),
//           onEditHandler: 'onEditHandler',
//           onChangeHandler: 'onChangeHandler'
//         });
//       });
//     });
//     return transactionalTriggers;
//   }

//   function getAllTriggers() {
//     return triggers.concat(getTransactionalTriggers());
//   }

//   /**
//    * Mencari trigger berdasarkan spreadsheetId DAN sheetName.
//    * @returns {Object|undefined}
//    */
//   function getBySpreadsheetAndSheet(spreadsheetId, sheetName) {
//     return getAllTriggers().find(function(t) {
//       return t.spreadsheetId === spreadsheetId && t.sheetName === sheetName;
//     });
//   }

//   return {
//     getAllTriggers: getAllTriggers,
//     getBySpreadsheetAndSheet: getBySpreadsheetAndSheet
//   };
// })();


const dividerzzz = null

// source/server/ports/TriggerRegistry.js

const TriggerRegistry = (function() {

  function _resolveMasterCacheGroup(spreadsheetId, sheetName) {
    return CacheManager.resolveCacheGroup({
      domain: 'master',
      spreadsheetId: spreadsheetId,
      sheetName: sheetName
    });
  }

  function _resolveTransactionalCacheGroup(spreadsheetId, sheetName, year, type) {
    return CacheManager.resolveCacheGroup({
      domain: 'transactional',
      spreadsheetId: spreadsheetId,
      sheetName: sheetName,
      year: year,
      type: type
    });
  }

  // Master configs
  var masterCustomerCfg = ApplicationConfig.dataSources.master.customer.configs[0];
  var masterProductCfg  = ApplicationConfig.dataSources.master.product.configs.find(function(c) { return c.type === 'PRODUCT'; });
  var masterBatchCfg    = ApplicationConfig.dataSources.master.product.configs.find(function(c) { return c.type === 'BATCH'; });
  var masterSembCfg     = ApplicationConfig.dataSources.master.shippingEmbalage.configs[0];
  var masterPembCfg     = ApplicationConfig.dataSources.master.productEmbalage.configs[0];

  var masterCustomerSpreadsheetId = ApplicationConfig.dataSources.master.customer.spreadsheetId;
  var masterProductSpreadsheetId  = ApplicationConfig.dataSources.master.product.spreadsheetId;
  var masterSembSpreadsheetId     = ApplicationConfig.dataSources.master.shippingEmbalage.spreadsheetId;
  var masterPembSpreadsheetId     = ApplicationConfig.dataSources.master.productEmbalage.spreadsheetId;

  var triggers = [
    {
      spreadsheetId: masterCustomerSpreadsheetId,
      sheetName: masterCustomerCfg.sheetName,
      cacheGroup: _resolveMasterCacheGroup(masterCustomerSpreadsheetId, masterCustomerCfg.sheetName),
      headerRow: masterCustomerCfg.headerRow,
      globalCells: {
        updatedAt: masterCustomerCfg.globalUpdatedAtCell,
        lastSync:  masterCustomerCfg.globalLastSyncAtCell,
        updatedBy: masterCustomerCfg.globalUpdatedByCell
      },
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: masterProductSpreadsheetId,
      sheetName: masterProductCfg.sheetName,
      cacheGroup: _resolveMasterCacheGroup(masterProductSpreadsheetId, masterProductCfg.sheetName),
      headerRow: masterProductCfg.headerRow,
      globalCells: {
        updatedAt: masterProductCfg.globalUpdatedAtCell,
        lastSync:  masterProductCfg.globalLastSyncAtCell,
        updatedBy: masterProductCfg.globalUpdatedByCell
      },
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: masterProductSpreadsheetId,
      sheetName: masterBatchCfg.sheetName,
      cacheGroup: _resolveMasterCacheGroup(masterProductSpreadsheetId, masterBatchCfg.sheetName),
      headerRow: masterBatchCfg.headerRow,
      globalCells: {
        updatedAt: masterBatchCfg.globalUpdatedAtCell,
        lastSync:  masterBatchCfg.globalLastSyncAtCell,
        updatedBy: masterBatchCfg.globalUpdatedByCell
      },
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: masterSembSpreadsheetId,
      sheetName: masterSembCfg.sheetName,
      cacheGroup: _resolveMasterCacheGroup(masterSembSpreadsheetId, masterSembCfg.sheetName),
      headerRow: masterSembCfg.headerRow,
      globalCells: {
        updatedAt: masterSembCfg.globalUpdatedAtCell,
        lastSync:  masterSembCfg.globalLastSyncAtCell,
        updatedBy: masterSembCfg.globalUpdatedByCell
      },
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    },
    {
      spreadsheetId: masterPembSpreadsheetId,
      sheetName: masterPembCfg.sheetName,
      cacheGroup: _resolveMasterCacheGroup(masterPembSpreadsheetId, masterPembCfg.sheetName),
      headerRow: masterPembCfg.headerRow,
      globalCells: {
        updatedAt: masterPembCfg.globalUpdatedAtCell,
        lastSync:  masterPembCfg.globalLastSyncAtCell,
        updatedBy: masterPembCfg.globalUpdatedByCell
      },
      onEditHandler: 'onEditHandler',
      onChangeHandler: 'onChangeHandler'
    }
  ];

  function getTransactionalTriggers() {
    var transactionalTriggers = [];
    var configs = ApplicationConfig.dataSources.transactional;
    configs.forEach(function(yearConfig) {
      yearConfig.configs.forEach(function(sheetConfig) {
        transactionalTriggers.push({
          spreadsheetId: yearConfig.spreadsheetId,
          sheetName: sheetConfig.sheetName,
          cacheGroup: _resolveTransactionalCacheGroup(
            yearConfig.spreadsheetId,
            sheetConfig.sheetName,
            yearConfig.year,
            sheetConfig.type
          ),
          headerRow: sheetConfig.headerRow,
          globalCells: {
            updatedAt: sheetConfig.globalUpdatedAtCell,
            lastSync:  sheetConfig.globalLastSyncAtCell,
            updatedBy: sheetConfig.globalUpdatedByCell
          },
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

  function getBySpreadsheetAndSheet(spreadsheetId, sheetName) {
    return getAllTriggers().find(function(t) {
      return t.spreadsheetId === spreadsheetId && t.sheetName === sheetName;
    });
  }

  return {
    getAllTriggers: getAllTriggers,
    getBySpreadsheetAndSheet: getBySpreadsheetAndSheet
  };
})();