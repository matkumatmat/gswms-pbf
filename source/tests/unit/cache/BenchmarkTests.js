// source/tests/unit/cache/BenchmarkT.js

function runBenchmarkTests() {
  Logger.log('=== START Benchmark Tests ===');
  benchmarkMasterRead();
  benchmarkTransactionalRead();
  Logger.log('=== END Benchmark Tests ===');
}

function benchmarkMasterRead() {
  Logger.log('[bench] Master read (Customer)');
  var service = BatchMasterFactory.getService();
  
  var t0 = new Date();
  service.getAll();
  var t1 = new Date();
  var coldMs = t1 - t0;
  
  var t2 = new Date();
  service.getAll();
  var t3 = new Date();
  var warmMs = t3 - t2;
  
  Logger.log('  Cold: ' + coldMs + 'ms, Warm: ' + warmMs + 'ms');
}

function benchmarkTransactionalRead() {
  Logger.log('[bench] Transactional read (ALL_DIST 2025)');
  var service = TransactionalFactory.getService('2025', 'ALL_DIST');
  
  var t0 = new Date();
  var cold = service.getPaginated(1, 100);
  var t1 = new Date();
  var coldMs = t1 - t0;
  
  var t2 = new Date();
  var warm = service.getPaginated(1, 100);
  var t3 = new Date();
  var warmMs = t3 - t2;
  
  Logger.log('  Cold: ' + coldMs + 'ms (records: ' + cold.total + '), Warm: ' + warmMs + 'ms');
}