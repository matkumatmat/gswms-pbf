// source/tests/unit/batch/BatchMasterT.js

/**
 * Unit tests untuk BatchMasterService.
 * Menguji seluruh operasi CRUD + pagination + filter statues.
 * Update diuji dengan pengecekan adanya dua baris (DELETED dan ACTIVE) dengan ID yang sama.
 */
function runAllBatchMasterTests() {
  Logger.log('=== START BATCH MASTER UNIT TESTS ===');
  testBatch_GetAll();
  testBatch_Create();
  testBatch_Update();
  testBatch_Delete();
  testBatch_Pagination();
  testBatch_FindByField();
  Logger.log('=== END BATCH MASTER UNIT TESTS ===');
}

function getBatchService() {
  return BatchMasterFactory.getService();
}

function testBatch_GetAll() {
  var service = getBatchService();
  var batches = service.getAll();   // default tanpa DELETED
  assert(Array.isArray(batches), 'getAll harus mengembalikan array');
  Logger.log('✓ getAll batches -> success, count=' + batches.length);
}

function testBatch_Create() {
  var service = getBatchService();
  var uniqueBatch = 'BTCH-' + Date.now();
  var created = service.create({
    batch: uniqueBatch,
    productId: 'dummy-product-id',
    kodeBarang: 'KB' + Date.now().toString().slice(-5),
    namaBarang: 'Batch Test',
    mfgDate: '2025-01-01',
    expireDate: '2026-06-30',
    status: 'RECEIVED'
  });
  assert(!!created.id, 'Created batch harus punya ID');
  assert(created.batch === uniqueBatch, 'batch tidak cocok');
  assert(created.statues === 'ACTIVE', 'Statues harus ACTIVE');
  Logger.log('✓ create batch -> success, id=' + created.id);

  // cleanup
  service.delete(created.id);
}

function testBatch_Update() {
  var service = getBatchService();

  var created = service.create({
    batch: 'UPD-BTCH-' + Date.now(),
    productId: 'dummy-product-id',
    kodeBarang: 'KBUP',
    namaBarang: 'Old Name',
    alokasi: 'Gudang Lama'
  });

  var updated = service.update(created.id, {
    namaBarang: 'New Name',
    alokasi: 'Gudang Baru',
    notes: 'Updated via test'
  });
  assert(updated.namaBarang === 'New Name', 'namaBarang harus terupdate');
  assert(updated.alokasi === 'Gudang Baru', 'alokasi harus terupdate');
  assert(updated.notes === 'Updated via test', 'notes harus terupdate');
  assert(updated.statues === 'ACTIVE', 'Record baru harus ACTIVE');

  // Verifikasi record lama DELETED
  var allRecords = service.repo.getAll();
  var deletedRecord = allRecords.filter(function(r) {
    return r.id === created.id && r.statues === 'DELETED';
  })[0];
  var activeRecord = allRecords.filter(function(r) {
    return r.id === created.id && r.statues === 'ACTIVE';
  })[0];

  assert(deletedRecord != null, 'Harus ada record lama dengan statues DELETED');
  assert(activeRecord != null, 'Harus ada record baru dengan statues ACTIVE');
  Logger.log('✓ update batch -> success, old deleted, new active');

  // cleanup
  service.delete(created.id);
}

function testBatch_Delete() {
  var service = getBatchService();
  var created = service.create({
    batch: 'DEL-BTCH-' + Date.now(),
    productId: 'dummy-product-id'
  });

  var result = service.delete(created.id);
  assert(result.success === true, 'delete harus success');

  var allDeleted = service.getAll('DELETED');
  var found = allDeleted.filter(function(r) { return r.id === created.id; })[0];
  assert(found != null, 'Record harus ditemukan dengan statues DELETED');
  Logger.log('✓ delete batch -> success (soft delete verified)');
}

function testBatch_Pagination() {
  var service = getBatchService();
  var result = service.getPaginated(1, 3, 'ACTIVE');
  assert(Array.isArray(result.data), 'result.data harus array');
  assert(result.data.length <= 3, 'Jumlah data <= limit');
  assert(result.total > 0, 'total harus > 0');
  assert(result.totalPages > 0, 'totalPages harus > 0');
  Logger.log('✓ pagination batch -> success, total=' + result.total);
}

function testBatch_FindByField() {
  var service = getBatchService();
  var uniqueBatch = 'FBYF-BATCH-' + Date.now();
  var created = service.create({
    batch: uniqueBatch,
    productId: 'dummy-pid'
  });

  var found = service.findByField('batch', uniqueBatch);
  assert(found.length > 0, 'Harus menemukan batch');
  assert(found[0].id === created.id, 'ID harus cocok');
  Logger.log('✓ findByField batch -> success');

  // cleanup
  service.delete(created.id);
}

function assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}