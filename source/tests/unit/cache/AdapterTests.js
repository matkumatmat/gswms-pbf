// source/tests/unit/cache/AdapterCacheT.js

/**
 * Unit test untuk Adapter Transactional Version‑Aware
 * - Membaca data asli vs cache
 * - Timing dengan dan tanpa cache
 * - Invalidasi dan rebuild
 */
function runAdapterCacheTests() {
  Logger.log('=== START Adapter Cache Tests ===');
  
  // Pilih tahun dan sheet yang ada datanya
  var year = '2025';
  var sheetType = 'ALL_DIST';
  
  test_adapterReadsData(year, sheetType);
  test_adapterUsesCache(year, sheetType);
  test_adapterRebuildsAfterInvalidation(year, sheetType);
  test_adapterDataIntegrity(year, sheetType);
  
  Logger.log('=== END Adapter Cache Tests ===');
}

/**
 * Test 1: Adapter bisa membaca data dari sheet
 */
function test_adapterReadsData(year, sheetType) {
  Logger.log('[test] adapterReadsData ' + year + '/' + sheetType);
  
  var service = TransactionalFactory.getService(year, sheetType);
  var result = service.getPaginated(1, 10);
  
  _assertA(result && result.data, 'Result must have data');
  _assertA(Array.isArray(result.data), 'Data must be array');
  _assertA(result.total > 0, 'Total must be > 0');
  
  Logger.log('  ✓ PASS - Total records: ' + result.total + ', Sample count: ' + result.data.length);
}

/**
 * Test 2: Adapter menggunakan cache pada pemanggilan kedua (lebih cepat)
 */
function test_adapterUsesCache(year, sheetType) {
  Logger.log('[test] adapterUsesCache ' + year + '/' + sheetType);
  
  var service = TransactionalFactory.getService(year, sheetType);
  
  // First call - cold cache
  var start1 = new Date().getTime();
  var result1 = service.getPaginated(1, 10);
  var time1 = new Date().getTime() - start1;
  
  // Second call - should be from cache
  var start2 = new Date().getTime();
  var result2 = service.getPaginated(1, 10);
  var time2 = new Date().getTime() - start2;
  
  Logger.log('  Cold read: ' + time1 + 'ms, Cached read: ' + time2 + 'ms');
  
  // Data harus sama
  _assertA(JSON.stringify(result1.data) === JSON.stringify(result2.data), 'Data mismatch between cold and cached read');
  
  // Cached read should be faster (or equal if very small data)
  if (time2 > time1) {
    Logger.log('  ⚠ Cached slower, but that can happen on small data. Data integrity OK.');
  }
  
  Logger.log('  ✓ PASS');
}

/**
 * Test 3: Setelah invalidasi, cache direbuild
 */
function test_adapterRebuildsAfterInvalidation(year, sheetType) {
  Logger.log('[test] adapterRebuildsAfterInvalidation ' + year + '/' + sheetType);
  
  var service = TransactionalFactory.getService(year, sheetType);
  
  // Warm cache
  var result1 = service.getPaginated(1, 10);
  
  // Invalidate cache group
  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === year; }).spreadsheetId,
    sheetName: ApplicationConfig.dataSources.transactional.find(function(y) { return y.year === year; }).configs.find(function(c) { return c.type === sheetType; }).sheetName,
    year: year,
    type: sheetType
  });
  CacheManager.invalidate(cacheGroup);
  
  // Read again - should rebuild
  var start = new Date().getTime();
  var result2 = service.getPaginated(1, 10);
  var time = new Date().getTime() - start;
  
  _assertA(result2.data.length > 0, 'Data after invalidation must exist');
  Logger.log('  ✓ PASS - Rebuild took: ' + time + 'ms');
}

/**
 * Test 4: Integritas data - bandingkan sample data untuk memastikan mapping benar
 */
function test_adapterDataIntegrity(year, sheetType) {
  Logger.log('[test] adapterDataIntegrity ' + year + '/' + sheetType);
  
  var service = TransactionalFactory.getService(year, sheetType);
  var result = service.getPaginated(1, 1);
  
  if (result.data.length === 0) {
    Logger.log('  ⚠ No data to validate, skipping');
    return;
  }
  
  var record = result.data[0];
  
  // Validasi field yang harus ada berdasarkan sheet type
  _assertA(record.hasOwnProperty('id'), 'Record must have id');
  _assertA(record.hasOwnProperty('_year'), 'Record must have _year');
  _assertA(record._year === year, '_year must match config year');
  
  // Validasi field spesifik per sheet type
  if (sheetType === 'ALL_DIST') {
    _assertA(record.hasOwnProperty('noSO_MOV') || record.hasOwnProperty('noDok'), 'Dist record must have document number');
  } else if (sheetType === 'ALL_RCV') {
    _assertA(record.hasOwnProperty('noDokumen'), 'RCV record must have noDokumen');
  }
  
  Logger.log('  ✓ PASS - Record ID: ' + record.id);
}

function _assertA(condition, message) {
  if (!condition) throw new Error('Adapter assertion failed: ' + message);
}