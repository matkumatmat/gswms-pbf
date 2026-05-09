// source/tests/unit/transactional/TransactionalPEmbT.js

/**
 * Unit tests untuk TransactionalProductEmbalageService.
 * Test langsung ke service layer tanpa melalui HTTP endpoint.
 * Setiap test membersihkan data yang dibuat (soft delete) agar tidak polusi sheet.
 */
function runAllProductEmbalageTests() {
  Logger.log('=== START PRODUCT EMBALAGE UNIT TESTS ===');
  testPEmb_GetAllPaginated();
  testPEmb_Create();
  testPEmb_Update();
  testPEmb_GetById();
  testPEmb_FindByKodeBarang();
  testPEmb_FindByNamaBarang();
  testPEmb_FindByBatch();
  testPEmb_FindByNoDok();
  testPEmb_FindByField();
  testPEmb_Delete();
  Logger.log('=== END PRODUCT EMBALAGE UNIT TESTS ===');
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function _getPEmbService() {
  var year = String(new Date().getFullYear());
  return TransactionalProductEmbalageFactory.getService(year);
}

function _buildPEmbTestData(suffix) {
  suffix = suffix || Date.now();
  return {
    tanggal:      new Date().toISOString(),
    noDok:        'UNIT-TEST-' + suffix,
    namaKonsumen: 'Unit Test Customer',
    kotaCabang:   'Test City',
    alokasi:      'Test Alokasi',
    sektor:       'Test Sektor',
    kodeBarang:   'PEMB-' + suffix,
    namaBarang:   'Test Embalage ' + suffix,
    batch:        'BATCH-' + suffix,
    expireDate:   '2027-12-31',
    kategori:     'Kemasan',
    satuan:       'Pcs',
    penerimaan:   100,
    distribusi:   0,
    catatan:      'Unit test record'
  };
}

function _assertPEmb(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

function testPEmb_GetAllPaginated() {
  try {
    var service = _getPEmbService();
    var result  = service.getPaginated(1, 10);
    _assertPEmb(result && typeof result === 'object', 'getPaginated harus return object');
    _assertPEmb(Array.isArray(result.data),           'result.data harus array');
    _assertPEmb(result.data.length <= 10,             'limit tidak direspek');
    _assertPEmb(typeof result.total === 'number',     'result.total harus number');
    Logger.log('✓ testPEmb_GetAllPaginated passed, total=' + result.total);
  } catch(e) {
    Logger.log('✗ testPEmb_GetAllPaginated FAILED: ' + e.message);
  }
}

function testPEmb_Create() {
  try {
    var service   = _getPEmbService();
    var testData  = _buildPEmbTestData();
    var created   = service.create(testData);

    _assertPEmb(created && created.id && created.id.length > 0, 'Record harus punya ID');
    _assertPEmb(created.kodeBarang === testData.kodeBarang,      'kodeBarang mismatch');
    _assertPEmb(created.namaBarang === testData.namaBarang,      'namaBarang mismatch');
    _assertPEmb(created.batch      === testData.batch,           'batch mismatch');
    _assertPEmb(created.penerimaan === testData.penerimaan,      'penerimaan mismatch');
    _assertPEmb(created._year      !== undefined,                '_year metadata harus ada');
    _assertPEmb(created._sheetType === 'ALL_PEMB',              '_sheetType harus ALL_PEMB');

    Logger.log('✓ testPEmb_Create passed, id=' + created.id);

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_Create FAILED: ' + e.message);
  }
}

function testPEmb_Update() {
  try {
    var service = _getPEmbService();
    var created = service.create(_buildPEmbTestData());

    var updated = service.update(created.id, {
      distribusi: 25,
      catatan:    'Updated via unit test'
    });

    _assertPEmb(updated.distribusi === 25,                 'distribusi tidak terupdate');
    _assertPEmb(updated.catatan    === 'Updated via unit test', 'catatan tidak terupdate');
    _assertPEmb(updated.penerimaan === created.penerimaan, 'penerimaan tidak boleh berubah');

    Logger.log('✓ testPEmb_Update passed');

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_Update FAILED: ' + e.message);
  }
}

function testPEmb_GetById() {
  try {
    var service = _getPEmbService();
    var created = service.create(_buildPEmbTestData());

    var fetched = service.getById(created.id);
    _assertPEmb(fetched !== null,           'Record harus ditemukan');
    _assertPEmb(fetched.id === created.id,  'ID mismatch');
    _assertPEmb(fetched.kodeBarang === created.kodeBarang, 'kodeBarang mismatch');

    // Test ID tidak ada
    var notFound = service.getById('NON-EXISTENT-ID-' + Date.now());
    _assertPEmb(notFound === null, 'ID tidak ada harus return null');

    Logger.log('✓ testPEmb_GetById passed');

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_GetById FAILED: ' + e.message);
  }
}

function testPEmb_FindByKodeBarang() {
  try {
    var service      = _getPEmbService();
    var uniqueKode   = 'KODE-' + Date.now();
    var testData     = _buildPEmbTestData();
    testData.kodeBarang = uniqueKode;
    var created      = service.create(testData);

    var results = service.findByKodeBarang(uniqueKode);
    _assertPEmb(Array.isArray(results),  'findByKodeBarang harus return array');
    _assertPEmb(results.length > 0,      'Harus menemukan minimal 1 record');
    _assertPEmb(results.some(function(r) { return r.id === created.id; }),
      'Record yang dibuat harus ada di hasil');

    Logger.log('✓ testPEmb_FindByKodeBarang passed, found=' + results.length);

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_FindByKodeBarang FAILED: ' + e.message);
  }
}

function testPEmb_FindByNamaBarang() {
  try {
    var service      = _getPEmbService();
    var uniqueNama   = 'NamaEmb-' + Date.now();
    var testData     = _buildPEmbTestData();
    testData.namaBarang = uniqueNama;
    var created      = service.create(testData);

    var results = service.findByNamaBarang(uniqueNama);
    _assertPEmb(Array.isArray(results), 'findByNamaBarang harus return array');
    _assertPEmb(results.length > 0,     'Harus menemukan minimal 1 record');

    Logger.log('✓ testPEmb_FindByNamaBarang passed, found=' + results.length);

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_FindByNamaBarang FAILED: ' + e.message);
  }
}

function testPEmb_FindByBatch() {
  try {
    var service      = _getPEmbService();
    var uniqueBatch  = 'BTCH-' + Date.now();
    var testData     = _buildPEmbTestData();
    testData.batch   = uniqueBatch;
    var created      = service.create(testData);

    var results = service.findByBatch(uniqueBatch);
    _assertPEmb(Array.isArray(results), 'findByBatch harus return array');
    _assertPEmb(results.length > 0,     'Harus menemukan minimal 1 record');
    _assertPEmb(results[0].batch === uniqueBatch, 'batch value mismatch');

    Logger.log('✓ testPEmb_FindByBatch passed, found=' + results.length);

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_FindByBatch FAILED: ' + e.message);
  }
}

function testPEmb_FindByNoDok() {
  try {
    var service     = _getPEmbService();
    var uniqueNoDok = 'DOK-' + Date.now();
    var testData    = _buildPEmbTestData();
    testData.noDok  = uniqueNoDok;
    var created     = service.create(testData);

    var results = service.findByNoDok(uniqueNoDok);
    _assertPEmb(Array.isArray(results), 'findByNoDok harus return array');
    _assertPEmb(results.length > 0,     'Harus menemukan minimal 1 record');

    Logger.log('✓ testPEmb_FindByNoDok passed, found=' + results.length);

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_FindByNoDok FAILED: ' + e.message);
  }
}

function testPEmb_FindByField() {
  try {
    var service       = _getPEmbService();
    var uniqueKonsumen = 'Konsumen-Generic-' + Date.now();
    var testData      = _buildPEmbTestData();
    testData.namaKonsumen = uniqueKonsumen;
    var created       = service.create(testData);

    var results = service.findByField('namaKonsumen', uniqueKonsumen);
    _assertPEmb(Array.isArray(results), 'findByField harus return array');
    _assertPEmb(results.length > 0,     'Harus menemukan minimal 1 record');
    _assertPEmb(results[0].namaKonsumen === uniqueKonsumen, 'namaKonsumen mismatch');

    Logger.log('✓ testPEmb_FindByField passed, found=' + results.length);

    // Cleanup
    service.delete(created.id);
  } catch(e) {
    Logger.log('✗ testPEmb_FindByField FAILED: ' + e.message);
  }
}

function testPEmb_Delete() {
  try {
    var service = _getPEmbService();
    var created = service.create(_buildPEmbTestData());

    var result = service.delete(created.id);
    _assertPEmb(result.success === true, 'delete harus return success=true');
    _assertPEmb(result.id === created.id, 'delete harus return id yang sama');

    // Verifikasi soft delete
    var afterDelete = service.getById(created.id);
    if (afterDelete) {
      // Soft delete: STATUES = 'DELETED'
      _assertPEmb(afterDelete.statues === 'DELETED', 'Soft delete tidak terapply');
      Logger.log('✓ testPEmb_Delete passed (soft delete verified)');
    } else {
      // Hard delete: record tidak ada
      Logger.log('✓ testPEmb_Delete passed (hard delete)');
    }
  } catch(e) {
    Logger.log('✗ testPEmb_Delete FAILED: ' + e.message);
  }
}