// function doGet(e) {
//   try {
//     var params = e.parameter;
//     var action = params.action;
//     if (!action) throw new Error('Missing action parameter');
//     return ResponseBuilder.build(GetsRegistryV2.execute(action, params));
//   } catch (err) {
//     return ResponseBuilder.buildError(err);
//   }
// }

// function doPost(e) {
//   try {
//     var body = JSON.parse(e.postData.contents);
//     var user = null; // TODO: validasi token nanti
//     return ResponseBuilder.build(PostsRegistryV2.execute(body.action, body.data, user));
//   } catch (err) {
//     return ResponseBuilder.buildError(err);
//   }
// }

// function onEditHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetId(ssId);
//   if (triggerInfo && triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
// }

// function onChangeHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetId(ssId);
//   if (triggerInfo && triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
// }

// function scheduledDailyStockSync() {
//   Logger.log('Daily stock sync executed');
// }

// function onEditHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var sheetName = e.range.getSheet().getName();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (triggerInfo && triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
// }

// function onChangeHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var sheetName = e.source.getActiveSheet().getName();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (triggerInfo && triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
// }


// v4
// function onEditHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var sheet = e.range.getSheet();
//   var sheetName = sheet.getName();
//   var rowNum = e.range.getRow();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (!triggerInfo) return;

//   // 1. Invalidasi cache
//   if (triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }

//   // 2. Audit per baris (jika di bawah headerRow)
//   if (triggerInfo.headerRow && rowNum > triggerInfo.headerRow && triggerInfo.globalCells) {
//     var lastCol = sheet.getLastColumn();
//     var headerValues = sheet.getRange(triggerInfo.headerRow, 1, 1, lastCol).getValues()[0];
//     var colUpdatedAt = -1;
//     var colUpdatedBy = -1;

//     for (var c = 0; c < headerValues.length; c++) {
//       var h = headerValues[c];
//       if (h === 'UPDATED AT' || h === 'updatedAt') colUpdatedAt = c + 1;
//       if (h === 'UPDATED BY' || h === 'updatedBy') colUpdatedBy = c + 1;
//     }

//     var now = new Date();
//     var userEmail = 'Manual';
//     try {
//       var activeUser = Session.getActiveUser();
//       if (activeUser && activeUser.getEmail()) userEmail = activeUser.getEmail();
//     } catch(e) {}

//     if (colUpdatedAt !== -1) sheet.getRange(rowNum, colUpdatedAt).setValue(now);
//     if (colUpdatedBy !== -1) sheet.getRange(rowNum, colUpdatedBy).setValue(userEmail);

//     // 3. Update global cells
//     if (triggerInfo.globalCells.updatedAt) sheet.getRange(triggerInfo.globalCells.updatedAt).setValue(now);
//     if (triggerInfo.globalCells.lastSync)  sheet.getRange(triggerInfo.globalCells.lastSync).setValue(now);
//     if (triggerInfo.globalCells.updatedBy) sheet.getRange(triggerInfo.globalCells.updatedBy).setValue(userEmail);
//   }
// }

// v5
// function onEditHandler(e) {
//   if (!e) { Logger.log('No event'); return; }
//   var ssId = e.source.getId();
//   var sheet = e.range.getSheet();
//   var sheetName = sheet.getName();
//   var rowNum = e.range.getRow();
//   Logger.log('onEdit: sheet=' + sheetName + ' row=' + rowNum);

//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (!triggerInfo) {
//     Logger.log('No triggerInfo found for ' + sheetName);
//     return;
//   }
//   Logger.log('triggerInfo.cacheGroup=' + triggerInfo.cacheGroup);

//   // Invalidasi cache
//   if (triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
//   // Audit per baris
//   if (triggerInfo.headerRow && rowNum > triggerInfo.headerRow && triggerInfo.globalCells) {
//     Logger.log('Audit row: headerRow=' + triggerInfo.headerRow + ' globalCells=' + JSON.stringify(triggerInfo.globalCells));
//     var lastCol = sheet.getLastColumn();
//     var headerValues = sheet.getRange(triggerInfo.headerRow, 1, 1, lastCol).getValues()[0];
//     Logger.log('Headers: ' + JSON.stringify(headerValues));
//     var colUpdatedAt = -1, colUpdatedBy = -1;
//     for (var c = 0; c < headerValues.length; c++) {
//       if (headerValues[c] === 'UPDATED AT' || headerValues[c] === 'updatedAt') colUpdatedAt = c + 1;
//       if (headerValues[c] === 'UPDATED BY' || headerValues[c] === 'updatedBy') colUpdatedBy = c + 1;
//     }
//     Logger.log('Cols: updatedAt=' + colUpdatedAt + ' updatedBy=' + colUpdatedBy);

//     var now = new Date();
//     var userEmail = 'Manual';
//     try {
//       var activeUser = Session.getActiveUser();
//       if (activeUser && activeUser.getEmail()) userEmail = activeUser.getEmail();
//     } catch(e) { Logger.log('Session error: ' + e.message); }

//     if (colUpdatedAt !== -1) {
//       sheet.getRange(rowNum, colUpdatedAt).setValue(now);
//       Logger.log('Set UPDATED AT at row=' + rowNum + ' col=' + colUpdatedAt + ' value=' + now);
//     }
//     if (colUpdatedBy !== -1) {
//       sheet.getRange(rowNum, colUpdatedBy).setValue(userEmail);
//       Logger.log('Set UPDATED BY at row=' + rowNum + ' col=' + colUpdatedBy + ' value=' + userEmail);
//     }

//     // Global cells
//     if (triggerInfo.globalCells.updatedAt) {
//       sheet.getRange(triggerInfo.globalCells.updatedAt).setValue(now);
//       Logger.log('Set global updatedAt ' + triggerInfo.globalCells.updatedAt);
//     }
//     if (triggerInfo.globalCells.lastSync) {
//       sheet.getRange(triggerInfo.globalCells.lastSync).setValue(now);
//       Logger.log('Set global lastSync ' + triggerInfo.globalCells.lastSync);
//     }
//     if (triggerInfo.globalCells.updatedBy) {
//       sheet.getRange(triggerInfo.globalCells.updatedBy).setValue(userEmail);
//       Logger.log('Set global updatedBy ' + triggerInfo.globalCells.updatedBy);
//     }
//   } else {
//     Logger.log('Skipped audit: headerRow=' + triggerInfo.headerRow + ' rowNum=' + rowNum + ' globalCells=' + JSON.stringify(triggerInfo.globalCells));
//   }
// }


// v2
// function doGet(e) {
//   try {
//     var params = e.parameter;
//     var action = params.action;
//     if (!action) throw new Error('Missing action parameter');
//     return ResponseBuilder.build(GetsRegistryV2.execute(action, params));
//   } catch (err) {
//     return ResponseBuilder.buildError(err);
//   }
// }

// function doPost(e) {
//   try {
//     var body = JSON.parse(e.postData.contents);
//     var user = null;
//     return ResponseBuilder.build(PostsRegistryV2.execute(body.action, body.data, user));
//   } catch (err) {
//     return ResponseBuilder.buildError(err);
//   }
// }


// function onEditHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var sheetName = e.range.getSheet().getName();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (triggerInfo && triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
// }

// // User‑installed handler untuk audit trail + global cells
// function onUserEditHandler(e) {
//   if (!e) return;
//   var sheet = e.range.getSheet();
//   var sheetName = sheet.getName();
//   var ssId = e.source.getId();
//   var rowNum = e.range.getRow();

//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (!triggerInfo) return;

//   // Hanya baris di bawah header yang diaudit
//   if (!triggerInfo.headerRow || rowNum <= triggerInfo.headerRow) return;

//   var userEmail = Session.getEffectiveUser().getEmail(); // dari user trigger
//   var now = new Date();

//   // Audit per baris
//   var lastCol = sheet.getLastColumn();
//   var headerValues = sheet.getRange(triggerInfo.headerRow, 1, 1, lastCol).getValues()[0];
//   var colUpdatedAt = -1, colUpdatedBy = -1;
//   for (var c = 0; c < headerValues.length; c++) {
//     var h = headerValues[c];
//     if (h === 'UPDATED AT' || h === 'updatedAt') colUpdatedAt = c + 1;
//     if (h === 'UPDATED BY' || h === 'updatedBy') colUpdatedBy = c + 1;
//   }
//   if (colUpdatedAt !== -1) sheet.getRange(rowNum, colUpdatedAt).setValue(now);
//   if (colUpdatedBy !== -1) sheet.getRange(rowNum, colUpdatedBy).setValue(userEmail);

//   // Global cells
//   if (triggerInfo.globalCells) {
//     if (triggerInfo.globalCells.updatedAt) sheet.getRange(triggerInfo.globalCells.updatedAt).setValue(now);
//     if (triggerInfo.globalCells.lastSync)  sheet.getRange(triggerInfo.globalCells.lastSync).setValue(now);
//     if (triggerInfo.globalCells.updatedBy) sheet.getRange(triggerInfo.globalCells.updatedBy).setValue(userEmail);
//   }
// }

// function onChangeHandler(e) {
//   if (!e) return;
//   var ssId = e.source.getId();
//   var sheetName = e.source.getActiveSheet().getName();
//   var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
//   if (triggerInfo && triggerInfo.cacheGroup) {
//     CacheManager.invalidate(triggerInfo.cacheGroup);
//   }
// }

// function scheduledDailyStockSync() {
//   Logger.log('Daily stock sync executed');
// }


// source/main.js

// source/main.js

function doGet(e) {
  try {
    var params = e.parameter;
    var action = params.action;

    // Jika tidak ada action, tampilkan halaman login dari source/clients/Login
    // if (!action) {
    //   return HtmlService.createHtmlOutputFromFile('source/clients/Login')
    //     .setTitle('PBF Manage - Login')
    //     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    // }
    //test react
    if (!action) {
  return HtmlService.createHtmlOutputFromFile('source/clients/dist/index')
    .setTitle('PBF Manage')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

    return ResponseBuilder.build(GetsRegistryV2.execute(action, params));
  } catch (err) {
    return ResponseBuilder.buildError(err);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var data = body.data;
    var email = body.email;
    var _e = body._e;
    
    var user = null;
    // Aksi yang tidak perlu validasi _e
    if (action === 'login' || action === 'register') {
      // langsung proses, user selalu null (belum login)
    } else if (email && _e) {
      user = AuthService.validateRequest(email, _e);
    } else {
      throw new Error('Autentikasi diperlukan. Kirim email dan _e.');
    }
    
    return ResponseBuilder.build(PostsRegistryV2.execute(action, data, user));
  } catch (err) {
    return ResponseBuilder.buildError(err);
  }
}

// ... sisa file sama

/**
 * Simple trigger onEdit – hanya invalidasi cache.
 * Tidak bisa akses Session.getActiveUser() karena batasan simple trigger.
 */
function onEditHandler(e) {
  if (!e) return;
  var ssId = e.source.getId();
  var sheetName = e.range.getSheet().getName();
  var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
  if (triggerInfo && triggerInfo.cacheGroup) {
    CacheManager.invalidate(triggerInfo.cacheGroup);
  }
}

/**
 * Installable trigger onUserEditHandler – untuk audit trail.
 * Dipasang oleh user melalui menu "Izinkan Script".
 * Bisa mengakses Session.getActiveUser() karena trigger milik user.
 */
function onUserEditHandler(e) {
  if (!e) return;
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  var ssId = e.source.getId();
  var rowNum = e.range.getRow();

  var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
  if (!triggerInfo) return;

  // Invalidasi cache juga (opsional, simple trigger juga akan melakukannya)
  if (triggerInfo.cacheGroup) {
    CacheManager.invalidate(triggerInfo.cacheGroup);
  }

  // Audit trail hanya untuk baris data (di bawah header)
  if (!triggerInfo.headerRow || rowNum <= triggerInfo.headerRow) return;

  var userEmail;
  try {
    userEmail = Session.getActiveUser().getEmail();
  } catch(e) {
    Logger.log('[onUserEditHandler] Gagal mendapatkan email user: ' + e.message);
    return;
  }
  
  if (!userEmail) {
    Logger.log('[onUserEditHandler] Email user tidak tersedia.');
    return;
  }

  var now = new Date();

  // Audit per baris: UPDATED AT, UPDATED BY
  var lastCol = sheet.getLastColumn();
  var headerValues = sheet.getRange(triggerInfo.headerRow, 1, 1, lastCol).getValues()[0];
  var colUpdatedAt = -1, colUpdatedBy = -1;
  for (var c = 0; c < headerValues.length; c++) {
    var h = headerValues[c];
    if (h === 'UPDATED AT' || h === 'updatedAt') colUpdatedAt = c + 1;
    if (h === 'UPDATED BY' || h === 'updatedBy') colUpdatedBy = c + 1;
  }

  if (colUpdatedAt !== -1) {
    sheet.getRange(rowNum, colUpdatedAt).setValue(now);
    Logger.log('[onUserEditHandler] Set UPDATED AT row=' + rowNum + ' col=' + colUpdatedAt);
  }
  if (colUpdatedBy !== -1) {
    sheet.getRange(rowNum, colUpdatedBy).setValue(userEmail);
    Logger.log('[onUserEditHandler] Set UPDATED BY row=' + rowNum + ' col=' + colUpdatedBy + ' value=' + userEmail);
  }

  // Update global cells
  if (triggerInfo.globalCells) {
    if (triggerInfo.globalCells.updatedAt) {
      sheet.getRange(triggerInfo.globalCells.updatedAt).setValue(now);
      Logger.log('[onUserEditHandler] Set global updatedAt ' + triggerInfo.globalCells.updatedAt);
    }
    if (triggerInfo.globalCells.lastSync) {
      sheet.getRange(triggerInfo.globalCells.lastSync).setValue(now);
      Logger.log('[onUserEditHandler] Set global lastSync ' + triggerInfo.globalCells.lastSync);
    }
    if (triggerInfo.globalCells.updatedBy) {
      sheet.getRange(triggerInfo.globalCells.updatedBy).setValue(userEmail);
      Logger.log('[onUserEditHandler] Set global updatedBy ' + triggerInfo.globalCells.updatedBy);
    }
  }
}

function onChangeHandler(e) {
  if (!e) return;
  var ssId = e.source.getId();
  var sheetName = e.source.getActiveSheet().getName();
  var triggerInfo = TriggerRegistry.getBySpreadsheetAndSheet(ssId, sheetName);
  if (triggerInfo && triggerInfo.cacheGroup) {
    CacheManager.invalidate(triggerInfo.cacheGroup);
  }
}

// moved to new method below
// function scheduledDailyStockSync() {
//   Logger.log('Daily stock sync executed');
// }

/**
 * Time-triggered: rebuild OLAP_BATCH_DAILY setiap malam.
 * Dipanggil oleh time trigger yang dipasang di SetupTriggers.
 */
function rebuildOlapBatchDaily() {
  try {
    Logger.log('[rebuildOlapBatchDaily] Starting rebuild...');
    OlapBatchDailyFactory.getService().rebuild();
    Logger.log('[rebuildOlapBatchDaily] Rebuild completed successfully.');
  } catch(e) {
    Logger.log('[rebuildOlapBatchDaily] FAILED: ' + e.message);
    throw e;
  }
}