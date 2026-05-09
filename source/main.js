function doGet(e) {
  try {
    var params = e.parameter;
    var action = params.action;
    if (!action) throw new Error('Missing action parameter');
    return ResponseBuilder.build(GetsRegistryV2.execute(action, params));
  } catch (err) {
    return ResponseBuilder.buildError(err);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var user = null; // TODO: validasi token nanti
    return ResponseBuilder.build(PostsRegistryV2.execute(body.action, body.data, user));
  } catch (err) {
    return ResponseBuilder.buildError(err);
  }
}

// Global handler untuk trigger onEdit
// function onEditHandler(e) {
//   if (!e) return;
//   var range = e.range;
//   var sheet = range.getSheet();
//   var sheetName = sheet.getName();
//   var spreadsheetId = e.source.getId();  
//   var triggerInfo = TriggerRegistry.getBySpreadsheetId(spreadsheetId);
//   var cacheGroup = triggerInfo ? triggerInfo.cacheGroup : null;  
//   if (!cacheGroup) {
//     var configs = ApplicationConfig.dataSources.transactional;
//     for (var i = 0; i < configs.length; i++) {
//       var yearConfig = configs[i];
//       for (var j = 0; j < yearConfig.configs.length; j++) {
//         var sheetConfig = yearConfig.configs[j];
//         if (sheetConfig.sheetName === sheetName) {
//           cacheGroup = 'TRANS_' + yearConfig.year + '_' + sheetConfig.type;
//           break;
//         }
//       }
//       if (cacheGroup) break;
//     }
//   }
  
//   if (cacheGroup) {
//     CacheRegistry.invalidate(cacheGroup);
//     Logger.log('Cache invalidated for group: ' + cacheGroup);
//   }
  
//   // Panggil sistem audit atau fungsi lain jika diperlukan
//   // SystemTrigger.runAudit(sheet, range.getRow()); // opsional
// }

// function onChangeHandler(e) {
//   if (!e) return;
//   var sheet = e.source.getActiveSheet();
//   var sheetName = sheet.getName();
//   var spreadsheetId = e.source.getId();  
//   var triggerInfo = TriggerRegistry.getBySpreadsheetId(spreadsheetId);
//   var cacheGroup = triggerInfo ? triggerInfo.cacheGroup : null;  
//   if (!cacheGroup) {
//     var configs = ApplicationConfig.dataSources.transactional;
//     for (var i = 0; i < configs.length; i++) {
//       var yearConfig = configs[i];
//       for (var j = 0; j < yearConfig.configs.length; j++) {
//         var sheetConfig = yearConfig.configs[j];
//         if (sheetConfig.sheetName === sheetName) {
//           cacheGroup = 'TRANS_' + yearConfig.year + '_' + sheetConfig.type;
//           break;
//         }
//       }
//       if (cacheGroup) break;
//     }
//   }
  
//   if (cacheGroup) {
//     CacheRegistry.invalidate(cacheGroup);
//     Logger.log('Cache invalidated for group: ' + cacheGroup);
//   }
// }


// v2
function onEditHandler(e) {
  if (!e) return;
  var ssId = e.source.getId();
  var triggerInfo = TriggerRegistry.getBySpreadsheetId(ssId);
  if (triggerInfo && triggerInfo.cacheGroup) {
    CacheManager.invalidate(triggerInfo.cacheGroup);
  }
}

function onChangeHandler(e) {
  if (!e) return;
  var ssId = e.source.getId();
  var triggerInfo = TriggerRegistry.getBySpreadsheetId(ssId);
  if (triggerInfo && triggerInfo.cacheGroup) {
    CacheManager.invalidate(triggerInfo.cacheGroup);
  }
}

// Fungsi untuk daily sync (cukup panggil StockAggregatorService nanti)
function scheduledDailyStockSync() {
  // Placeholder: nanti panggil service agregasi
  Logger.log('Daily stock sync executed');
  // Contoh: new StockAggregatorService().executeDailySync();
}