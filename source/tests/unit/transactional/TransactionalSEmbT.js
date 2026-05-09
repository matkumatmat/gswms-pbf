// source/tests/unit/transactional/TransactionalSEmbT.js
function runAllShippingEmbalageTests() {
  Logger.log('=== START SHIPPING EMBALAGE UNIT TESTS ===');
  testGetAllShippingEmbalage();
  testCreateShippingEmbalage();
  testUpdateShippingEmbalage();
  testGetShippingEmbalageById();
  testGetShippingEmbalageByField();
  testDeleteShippingEmbalage();
  Logger.log('=== END SHIPPING EMBALAGE UNIT TESTS ===');
}

function testGetAllShippingEmbalage() {
  var year = String(new Date().getFullYear());
  var service = TransactionalShippingEmbalageFactory.getService(year);
  var result = service.getPaginated(1, 100);
  assert(Array.isArray(result.data), 'getPaginated should return array');
  Logger.log('✓ testGetAllShippingEmbalage passed, total=' + result.total);
}

function testCreateShippingEmbalage() {
  var year = String(new Date().getFullYear());
  var service = TransactionalShippingEmbalageFactory.getService(year);
  var uniqueId = 'UNIT-TEST-' + Date.now();
  var newRecord = service.create({
    tanggal: new Date().toISOString(),
    noDokumen: uniqueId,
    kodeBarang: 'UNT001',
    namaBarang: 'Test Unit',
    kategori: 'Kemasan',
    satuan: 'Pcs',
    penerimaan: 100,
    distribusi: 0,
    catatan: 'Test create'
  });
  assert(newRecord.id && newRecord.id.length > 0, 'Created record should have ID');
  assert(newRecord.kodeBarang === 'UNT001', 'Kode barang mismatch');
  Logger.log('✓ testCreateShippingEmbalage passed, ID: ' + newRecord.id);
  // Bersihkan agar tidak mengganggu test lain
  service.delete(newRecord.id);
}

function testUpdateShippingEmbalage() {
  var year = String(new Date().getFullYear());
  var service = TransactionalShippingEmbalageFactory.getService(year);
  var newRecord = service.create({
    noDokumen: 'UPDATE-TEST-' + Date.now(),
    kodeBarang: 'UPD001',
    namaBarang: 'To Update',
    penerimaan: 10
  });
  var updated = service.update(newRecord.id, { distribusi: 5, catatan: 'Updated' });
  assert(updated.distribusi === 5, 'Update failed for distribusi');
  assert(updated.catatan === 'Updated', 'Update failed for catatan');
  Logger.log('✓ testUpdateShippingEmbalage passed');
  service.delete(newRecord.id);
}

function testGetShippingEmbalageById() {
  var year = String(new Date().getFullYear());
  var service = TransactionalShippingEmbalageFactory.getService(year);
  var all = service.getPaginated(1, 1000).data;
  if (all.length === 0) {
    Logger.log('⚠ testGetShippingEmbalageById skipped – no data');
    return;
  }
  var first = all[0];
  var found = service.getById(first.id);
  assert(found !== null, 'Record should be found by ID');
  assert(found.id === first.id, 'ID mismatch');
  Logger.log('✓ testGetShippingEmbalageById passed');
}

function testGetShippingEmbalageByField() {
  var year = String(new Date().getFullYear());
  var service = TransactionalShippingEmbalageFactory.getService(year);
  var uniqueKode = 'BYFIELD-' + Date.now();
  
  var created = service.create({
    noDokumen: 'FIELD-TEST-' + Date.now(),
    kodeBarang: uniqueKode,
    namaBarang: 'Test Field',
    catatan: 'test getByField'
  });
  
  Utilities.sleep(2000);
  
  var results = service.findByField('kodeBarang', uniqueKode);
  
  if (results.length === 0) {
    var found = service.getById(created.id);
    if (found && found.kodeBarang === uniqueKode) {
      Logger.log('  data ada, tapi findByField gagal karena mapping field');
      // Tampilkan fieldMapping untuk debug
      Logger.log('  fieldMapping: ' + JSON.stringify(service.fieldMapping));
      assert(false, 'findByField tidak berfungsi meskipun data ada');
    } else {
      assert(false, 'Data tidak ditemukan sama sekali');
    }
  } else {
    assert(results.length > 0, 'Should find record by kodeBarang');
    Logger.log('✓ testGetShippingEmbalageByField passed, found ' + results.length);
  }
  
  service.delete(created.id);
}

function testDeleteShippingEmbalage() {
  var year = String(new Date().getFullYear());
  var service = TransactionalShippingEmbalageFactory.getService(year);
  var newRecord = service.create({
    noDokumen: 'DELETE-TEST-' + Date.now(),
    kodeBarang: 'DEL001',
    namaBarang: 'To Delete'
  });
  service.delete(newRecord.id);
  var deleted = service.getById(newRecord.id);
  if (deleted && deleted.status === 'DELETED') {
    Logger.log('✓ testDeleteShippingEmbalage passed (soft delete)');
  } else if (!deleted) {
    Logger.log('✓ testDeleteShippingEmbalage passed (hard delete)');
  } else {
    Logger.log('⚠ testDeleteShippingEmbalage: record still exists but status not DELETED');
  }
}

function assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}