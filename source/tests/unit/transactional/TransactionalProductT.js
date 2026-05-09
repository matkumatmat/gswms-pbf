// source/tests/unit/transactional/TransactionalT.js

function runAllTransactionalTests() {
  Logger.log('=== START TRANSACTIONAL UNIT TESTS ===');
  var config = ApplicationConfig.dataSources.transactional;
  var years = config.map(function(y) { return y.year; });
  Logger.log('Config loaded: years = ' + years.join(', '));
  config.forEach(function(yearConfig) {
    var year = yearConfig.year;
    var sheets = yearConfig.configs.map(function(c) { return c.type; });
    Logger.log('Year ' + year + ' sheets: ' + sheets.join(', '));
    yearConfig.configs.forEach(function(sheetConfig) {
      var mapping = sheetConfig.fieldMapping;
      var keys = Object.keys(mapping);
      Logger.log('  Sheet ' + sheetConfig.type + ' fieldMapping keys: ' + keys.join(', '));
    });
  });
  var sheetConfigs = [];
  for (var i = 0; i < config.length; i++) {
    var yearConfig = config[i];
    for (var j = 0; j < yearConfig.configs.length; j++) {
      var sheetConfig = yearConfig.configs[j];
      sheetConfigs.push({
        year: yearConfig.year,
        type: sheetConfig.type,
        fieldMapping: sheetConfig.fieldMapping,
        startRow: sheetConfig.startRow,
        sheetName: sheetConfig.sheetName,
        spreadsheetId: yearConfig.spreadsheetId
      });
    }
  }
  sheetConfigs.forEach(function(cfg) {
    try {
      testService(cfg.year, cfg.type, cfg.fieldMapping, cfg.spreadsheetId, cfg.sheetName, cfg.startRow);
    } catch(e) {
      Logger.log(' FAILED for ' + cfg.year + '/' + cfg.type + ': ' + e.message);
    }
  });
  Logger.log('=== END TRANSACTIONAL UNIT TESTS ===');
}
function testService(year, sheetType, fieldMapping, spreadsheetId, sheetName, startRow) {
  var service = TransactionalFactory.getService(year, sheetType);
  // ========== LOG HEADER ASLI SHEET ==========
  try {
    var sheet = SheetReader.openSheet(spreadsheetId, sheetName);
    var headerRow = startRow - 1; // baris 5
    var lastCol = sheet.getLastColumn();
    if (lastCol > 0) {
      var headerValues = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
      var headers = headerValues.filter(function(h) { return h && typeof h === 'string'; });
      Logger.log('  Sheet ' + sheetType + ' actual headers: ' + headers.join(', '));
    } else {
      Logger.log('  Sheet ' + sheetType + ' has no columns');
    }
  } catch(e) {
    Logger.log('  Could not read headers for ' + sheetType + ': ' + e.message);
  }  
  var validType = null;
  if (fieldMapping.type) {
    if (sheetType === 'ALL_DIST') {
      validType = 'REGULER';
    } else {
      validType = 'TEST';
    }
  }
  var testData = {
    tanggal: new Date().toISOString(),
    namaKonsumen: 'Test Customer',
    kodeBarang: 'TEST001',
    batch: 'BATCH001',
    penerimaan: 100
  };
  if (validType) testData.type = validType;
  
  // CREATE
  var created = service.create(testData);
  if (!created.id) throw new Error('Create failed: no id');
  Logger.log(' CREATE ' + year + '/' + sheetType + ' OK, id=' + created.id);
  
  // GET BY ID
  var fetched = service.getById(created.id);
  if (!fetched || fetched.id !== created.id) throw new Error('Get by id failed');
  Logger.log(' GET_BY_ID ' + year + '/' + sheetType + ' OK');
  
  // UPDATE - coba update field yang ada di mapping
  var updateFields = {};
  if (fieldMapping.distribusi) {
    updateFields.distribusi = 50;
    Logger.log('  Updating distribusi field');
  } else if (fieldMapping.keterangan) {
    updateFields.keterangan = 'Updated via test';
    Logger.log('  Updating keterangan field');
  } else if (fieldMapping.catatan) {
    updateFields.catatan = 'Updated via test';
    Logger.log('  Updating catatan field');
  } else {
    Logger.log(' UPDATE skipped for ' + year + '/' + sheetType + ' (no updatable field)');
    service.delete(created.id);
    return;
  }
  
  try {
    var updated = service.update(created.id, updateFields);
    Logger.log(' UPDATE ' + year + '/' + sheetType + ' OK');
  } catch(e) {
    Logger.log(' FAILED for ' + year + '/' + sheetType + ': Update failed - ' + e.message);
    service.delete(created.id);
    return;
  }
  
  // DELETE (soft)
  try {
    service.delete(created.id);
    var deleted = service.getById(created.id);
    Logger.log(' DELETE ' + year + '/' + sheetType + ' OK');
  } catch(e) {
    Logger.log(' DELETE failed for ' + year + '/' + sheetType + ': ' + e.message);
  }
}