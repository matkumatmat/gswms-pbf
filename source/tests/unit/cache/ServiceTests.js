// source/tests/unit/cache/ServiceCacheT.js

/**
 * Unit test untuk Service Layer Cache Invalidation.
 * Menguji bahwa setelah create/update/delete, cache group di-invalidasi,
 * dan data yang dibaca berikutnya selalu up-to-date.
 */
function runServiceCacheTests() {
  Logger.log('=== START Service Cache Tests ===');
  testMasterCreateInvalidatesCache();
  testMasterUpdateInvalidatesCache();
  testMasterDeleteInvalidatesCache();
  testTransactionalCreateInvalidatesCache();
  testReceivingDeleteInvalidatesCache();
  Logger.log('=== END Service Cache Tests ===');
}

// ─── MASTER ────────────────────────────────────────────────

function testMasterCreateInvalidatesCache() {
  Logger.log('[test] Master create invalidates cache');
  var service = CustomerMasterFactory.getService();
  
  // Ambil version sebelum create
  var masterCfg = ApplicationConfig.dataSources.master.customer;
  var custCfg = masterCfg.configs[0];
  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: masterCfg.spreadsheetId,
    sheetName: custCfg.sheetName
  });
  var vBefore = CacheManager.getVersion(cacheGroup);

  // Buat data test
  var testName = 'CACHE_TEST_' + Date.now();
  var created = service.create({
    namaKonsumen: testName,
    kotaCabang: 'Test City',
    typeKonsumen: 'REGULER'
  });

  var vAfter = CacheManager.getVersion(cacheGroup);
  _assert(vAfter > vBefore, 
    'Version must increase after create. Before: ' + vBefore + ', After: ' + vAfter);
  
  // Baca ulang — harus langsung ketemu
  var found = service.findByField('namaKonsumen', testName);
  _assert(found.length > 0, 'Created record must be findable immediately');
  _assert(found[0].id === created.id, 'ID mismatch: ' + found[0].id + ' vs ' + created.id);

  // Cleanup
  service.delete(created.id);
  Logger.log('  ✓ PASS');
}

function testMasterUpdateInvalidatesCache() {
  Logger.log('[test] Master update invalidates cache');
  var service = CustomerMasterFactory.getService();

  var created = service.create({
    namaKonsumen: 'UPDATE_TEST_' + Date.now(),
    kotaCabang: 'Test City',
    typeKonsumen: 'REGULER'
  });

  var masterCfg = ApplicationConfig.dataSources.master.customer;
  var custCfg = masterCfg.configs[0];
  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: masterCfg.spreadsheetId,
    sheetName: custCfg.sheetName
  });
  var vBefore = CacheManager.getVersion(cacheGroup);

  // Update
  var updated = service.update(created.id, { kotaCabang: 'Updated City' });
  var vAfter = CacheManager.getVersion(cacheGroup);
  _assert(vAfter > vBefore, 'Version must increase after update');

  // Baca ulang — harus dapat data baru
  var found = service.getById(created.id);
  _assert(found !== null, 'Updated record must exist');
  _assert(found.kotaCabang === 'Updated City', 'Update not reflected');

  // Cleanup
  service.delete(created.id);
  Logger.log('  ✓ PASS');
}

function testMasterDeleteInvalidatesCache() {
  Logger.log('[test] Master delete invalidates cache');
  var service = CustomerMasterFactory.getService();

  var created = service.create({
    namaKonsumen: 'DELETE_TEST_' + Date.now(),
    kotaCabang: 'Test City',
    typeKonsumen: 'REGULER'
  });

  var masterCfg = ApplicationConfig.dataSources.master.customer;
  var custCfg = masterCfg.configs[0];
  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: masterCfg.spreadsheetId,
    sheetName: custCfg.sheetName
  });
  var vBefore = CacheManager.getVersion(cacheGroup);

  // Soft delete
  service.delete(created.id);
  var vAfter = CacheManager.getVersion(cacheGroup);
  _assert(vAfter > vBefore, 'Version must increase after delete');

  // Baca ulang — harus DELETED
  var found = service.getById(created.id);
  _assert(found !== null, 'Soft-deleted record must still exist');
  _assert(found.statues === 'DELETED', 'Status must be DELETED, got: ' + found.statues);

  Logger.log('  ✓ PASS');
}

// ─── TRANSACTIONAL ──────────────────────────────────────────

function testTransactionalCreateInvalidatesCache() {
  Logger.log('[test] Transactional create invalidates cache');
  var year = '2025';
  var service = TransactionalFactory.getService(year, 'ALL_DIST');

  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === year; }).spreadsheetId,
    sheetName: 'ALL_DIST',
    year: year,
    type: 'ALL_DIST'
  });
  var vBefore = CacheManager.getVersion(cacheGroup);

  var created = service.create({
    tanggal: new Date().toISOString(),
    namaKonsumen: 'CACHE_TEST_DIST',
    kodeBarang: 'CACHE001',
    batch: 'CACHEBATCH',
    penerimaan: 100,
    type: 'REGULER'
  });

  var vAfter = CacheManager.getVersion(cacheGroup);
  _assert(vAfter > vBefore, 'Version must increase after create');

  var found = service.getById(created.id);
  _assert(found !== null, 'Created record must be findable');

  // Cleanup
  service.delete(created.id);
  Logger.log('  ✓ PASS');
}

function testReceivingDeleteInvalidatesCache() {
  Logger.log('[test] ProductReceiving delete invalidates cache');
  var year = '2025';
  var service = ProductReceivingFactory.getService(year);

  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === year; }).spreadsheetId,
    sheetName: 'ALL_RCV',
    year: year,
    type: 'ALL_RCV'
  });

  // Buat product + batch dulu (pakai data dummy minimal)
  var prodSvc = ProductMasterFactory.getService();
  var product = prodSvc.create({
    kodeBarang: 'RCVDEL_' + Date.now(),
    namaBarang: 'Receiving Delete Test',
    tahun: '2025'
  });

  var batchSvc = BatchMasterFactory.getService();
  var batch = batchSvc.create({
    batch: 'RCVDEL_BATCH_' + Date.now(),
    productId: product.id,
    mfgDate: '2025-01-01',
    expireDate: '2026-01-01',
    status: 'RECEIVED'
  });

  var created = service.create({
    batchId: batch.id,
    type: 'RECEIVING',
    jumlahBucket: 1,
    jumlahPerBucket: 5,
    kondisiKemasan: 'BAIK',
    placement: 'Test'
  });

  var vBefore = CacheManager.getVersion(cacheGroup);

  // Soft delete
  service.delete(created.id);
  var vAfter = CacheManager.getVersion(cacheGroup);
  _assert(vAfter > vBefore, 'Version must increase after delete');

  var rawAfter = service.repo.findById(created.id);
  _assert(rawAfter !== null, 'Soft-deleted record must exist in raw');
  // Cek field STATUES (raw, header sheet)
  _assert(rawAfter.STATUES === 'DELETED' || rawAfter.statues === 'DELETED', 
    'Status must be DELETED, got: ' + rawAfter.STATUES);

  // Cleanup
  try { batchSvc.delete(batch.id); } catch(e) {}
  try { prodSvc.delete(product.id); } catch(e) {}

  Logger.log('  ✓ PASS');
}

function _assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}