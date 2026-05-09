// source/tests/unit/cache/CacheManagerT.js

/**
 * Unit test untuk CacheManager
 * - resolveCacheGroup
 * - invalidate + getVersion
 * - forceClearAll
 */
function runCacheManagerTests() {
  Logger.log('=== START CacheManager Tests ===');
  test_resolveMaster();
  test_resolveTransactional();
  test_resolveArchive();
  test_invalidateAndVersion();
  test_forceClearAll();
  Logger.log('=== END CacheManager Tests ===');
}

function test_resolveMaster() {
  Logger.log('[test] resolveCacheGroup master');
  var result = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: 'SPREADSHEET_ID',
    sheetName: 'SHEET_NAME'
  });
  var expected = 'MASTER_SPREADSHEET_ID_SHEET_NAME';
  _assert(result === expected, 'Master resolver failed. Got: ' + result);
  Logger.log('  ✓ PASS');
}

function test_resolveTransactional() {
  Logger.log('[test] resolveCacheGroup transactional');
  var result = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: 'SPREADSHEET_ID',
    sheetName: 'SHEET_NAME',
    year: '2025',
    type: 'ALL_DIST'
  });
  var expected = 'TRANS_2025_ALL_DIST';
  _assert(result === expected, 'Transactional resolver failed. Got: ' + result);
  Logger.log('  ✓ PASS');
}

function test_resolveArchive() {
  Logger.log('[test] resolveCacheGroup archive');
  var result = CacheManager.resolveCacheGroup({
    domain: 'archive',
    spreadsheetId: 'SPREADSHEET_ID',
    sheetName: 'SHEET_NAME'
  });
  var expected = 'ARCHIVE_SPREADSHEET_ID_SHEET_NAME';
  _assert(result === expected, 'Archive resolver failed. Got: ' + result);
  Logger.log('  ✓ PASS');
}

function test_invalidateAndVersion() {
  Logger.log('[test] invalidate + getVersion');
  var testGroup = 'TEST_GROUP_' + Date.now();
  
  // Initial version should be 0 (never set)
  var v0 = CacheManager.getVersion(testGroup);
  _assert(v0 === 0, 'Initial version must be 0, got: ' + v0);

  // Invalidate
  CacheManager.invalidate(testGroup);
  var v1 = CacheManager.getVersion(testGroup);
  _assert(v1 > 0, 'Version must increase after invalidate, got: ' + v1);

  // Second invalidate must increase again
  Utilities.sleep(10); // ensure timestamp different
  CacheManager.invalidate(testGroup);
  var v2 = CacheManager.getVersion(testGroup);
  _assert(v2 > v1, 'Version must increase on second invalidate, v1=' + v1 + ' v2=' + v2);

  // Cleanup
  PropertiesService.getScriptProperties().deleteProperty('VERSION_' + testGroup);
  Logger.log('  ✓ PASS');
}

function test_forceClearAll() {
  Logger.log('[test] forceClearAll');
  var testGroup = 'CLEAR_TEST_' + Date.now();
  CacheManager.invalidate(testGroup);
  var v1 = CacheManager.getVersion(testGroup);
  _assert(v1 > 0, 'Version must be set before clear');

  CacheManager.forceClearAll();
  var v2 = CacheManager.getVersion(testGroup);
  _assert(v2 === 0, 'Version must be 0 after forceClearAll, got: ' + v2);
  Logger.log('  ✓ PASS');
}

function _assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}