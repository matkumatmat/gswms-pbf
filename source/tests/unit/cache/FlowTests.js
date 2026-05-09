// source/tests/unit/cache/TriggerFlowT.js

function runTriggerFlowTests() {
  Logger.log('=== START Trigger Flow Tests ===');
  testTrigger_MasterCustomer();
  testTrigger_MasterProduct();
  testTrigger_MasterBatch();
  testTrigger_MasterShippingEmbalage();
  testTrigger_MasterProductEmbalage();
  testTrigger_TransactionalAllDist();
  testTrigger_TransactionalAllRcv();
  testTrigger_TransactionalAllCons();
  testTrigger_TransactionalAllSemb();
  testTrigger_TransactionalAllPemb();
  Logger.log('=== END Trigger Flow Tests ===');
}

function _buildFakeEvent(spreadsheetId, sheetName, headerRow) {
  // Header dummy dengan kolom 'UPDATED AT' dan 'UPDATED BY'
  var dummyHeaders = ['ID', 'CREATED AT', 'UPDATED AT', 'UPDATED BY'];
  var lastCol = dummyHeaders.length;

  // Range mock untuk pembacaan header
  var headerRange = {
    getValues: function() {
      return [dummyHeaders];
    }
  };

  // Range mock untuk penulisan audit row dan global cells (no-op)
  var auditRange = {
    setValue: function() {}
  };

  // Sheet mock
  var sheet = {
    _name: sheetName,
    getName: function() { return this._name; },
    getLastColumn: function() { return lastCol; },
    getRange: function(row, col, numRows, numCols) {
      // Jika baris = headerRow dan col = 1, return headerRange
      if (row === headerRow && col === 1) {
        return headerRange;
      }
      // Selain itu, return auditRange (untuk setValue)
      return auditRange;
    }
  };

  // Range mock untuk event asli
  var range = {
    getRow: function() { return headerRow + 1; },
    getSheet: function() { return sheet; },
    getColumn: function() { return 1; }
  };

  return {
    source: {
      getId: function() { return spreadsheetId; }
    },
    range: range
  };
}

function _simulateOnEdit(spreadsheetId, sheetName, cacheGroup, headerRow) {
  var vBefore = CacheManager.getVersion(cacheGroup);

  var fakeEvent = _buildFakeEvent(spreadsheetId, sheetName, headerRow || 5);
  onEditHandler(fakeEvent);

  var vAfter = CacheManager.getVersion(cacheGroup);
  var passed = vAfter > vBefore;
  Logger.log('  ' + (passed ? 'PASS' : 'FAIL') +
    ' : ' + cacheGroup +
    ' | vBefore=' + vBefore + ' vAfter=' + vAfter);
}

function testTrigger_MasterCustomer() {
  Logger.log('[test] Trigger onEdit Master Customer');
  var cfg = ApplicationConfig.dataSources.master.customer;
  var sheetCfg = cfg.configs[0];
  var group = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: cfg.spreadsheetId,
    sheetName: sheetCfg.sheetName
  });
  _simulateOnEdit(cfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_MasterProduct() {
  Logger.log('[test] Trigger onEdit Master Product');
  var cfg = ApplicationConfig.dataSources.master.product;
  var sheetCfg = cfg.configs.find(function(c) { return c.type === 'PRODUCT'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: cfg.spreadsheetId,
    sheetName: sheetCfg.sheetName
  });
  _simulateOnEdit(cfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_MasterBatch() {
  Logger.log('[test] Trigger onEdit Master Batch');
  var cfg = ApplicationConfig.dataSources.master.product;
  var sheetCfg = cfg.configs.find(function(c) { return c.type === 'BATCH'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: cfg.spreadsheetId,
    sheetName: sheetCfg.sheetName
  });
  _simulateOnEdit(cfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_MasterShippingEmbalage() {
  Logger.log('[test] Trigger onEdit Master Shipping Embalage');
  var cfg = ApplicationConfig.dataSources.master.shippingEmbalage;
  var sheetCfg = cfg.configs[0];
  var group = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: cfg.spreadsheetId,
    sheetName: sheetCfg.sheetName
  });
  _simulateOnEdit(cfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_MasterProductEmbalage() {
  Logger.log('[test] Trigger onEdit Master Product Embalage');
  var cfg = ApplicationConfig.dataSources.master.productEmbalage;
  var sheetCfg = cfg.configs[0];
  var group = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: cfg.spreadsheetId,
    sheetName: sheetCfg.sheetName
  });
  _simulateOnEdit(cfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_TransactionalAllDist() {
  Logger.log('[test] Trigger onEdit ALL_DIST 2025');
  var yearCfg = ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === '2025'; });
  var sheetCfg = yearCfg.configs.find(function(c) { return c.type === 'ALL_DIST'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearCfg.spreadsheetId,
    sheetName: sheetCfg.sheetName,
    year: '2025',
    type: 'ALL_DIST'
  });
  _simulateOnEdit(yearCfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_TransactionalAllRcv() {
  Logger.log('[test] Trigger onEdit ALL_RCV 2025');
  var yearCfg = ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === '2025'; });
  var sheetCfg = yearCfg.configs.find(function(c) { return c.type === 'ALL_RCV'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearCfg.spreadsheetId,
    sheetName: sheetCfg.sheetName,
    year: '2025',
    type: 'ALL_RCV'
  });
  _simulateOnEdit(yearCfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_TransactionalAllCons() {
  Logger.log('[test] Trigger onEdit ALL_CONS 2025');
  var yearCfg = ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === '2025'; });
  var sheetCfg = yearCfg.configs.find(function(c) { return c.type === 'ALL_CONS'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearCfg.spreadsheetId,
    sheetName: sheetCfg.sheetName,
    year: '2025',
    type: 'ALL_CONS'
  });
  _simulateOnEdit(yearCfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_TransactionalAllSemb() {
  Logger.log('[test] Trigger onEdit ALL_SEMB 2025');
  var yearCfg = ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === '2025'; });
  var sheetCfg = yearCfg.configs.find(function(c) { return c.type === 'ALL_SEMB'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearCfg.spreadsheetId,
    sheetName: sheetCfg.sheetName,
    year: '2025',
    type: 'ALL_SEMB'
  });
  _simulateOnEdit(yearCfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}

function testTrigger_TransactionalAllPemb() {
  Logger.log('[test] Trigger onEdit ALL_PEMB 2025');
  var yearCfg = ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === '2025'; });
  var sheetCfg = yearCfg.configs.find(function(c) { return c.type === 'ALL_PEMB'; });
  var group = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearCfg.spreadsheetId,
    sheetName: sheetCfg.sheetName,
    year: '2025',
    type: 'ALL_PEMB'
  });
  _simulateOnEdit(yearCfg.spreadsheetId, sheetCfg.sheetName, group, sheetCfg.headerRow);
}