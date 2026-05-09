// source/tests/unit/transactional/TransactionalPEmbApiMockT.js

/**
 * API Mock tests untuk Product Embalage — menguji semua tahun yang dikonfigurasi.
 * Setiap tahun ditest full cycle: CREATE → GET → UPDATE → DELETE.
 * Menggunakan fieldMapping dari service untuk menentukan field yang tersedia.
 */
function runProductEmbalageApiMockTests() {
  Logger.log('=== START PRODUCT EMBALAGE API MOCK TESTS ===');

  // Test semua tahun yang dikonfigurasi
  var years = TransactionalProductEmbalageFactory.getAllYears();
  Logger.log('Configured years: ' + years.join(', '));

  years.forEach(function(year) {
    try {
      _runPEmbApiMockForYear(year);
    } catch(e) {
      Logger.log('✗ API MOCK FAILED for year=' + year + ': ' + e.message);
    }
  });

  // Test flow khusus: findByField via endpoint
  _testPEmbApiMock_FindByField();

  Logger.log('=== END PRODUCT EMBALAGE API MOCK TESTS ===');
}

// ─── PRIVATE ─────────────────────────────────────────────────────────────────

/**
 * Full CRUD cycle untuk satu tahun.
 * @param {string} year
 */
function _runPEmbApiMockForYear(year) {
  var service      = TransactionalProductEmbalageFactory.getService(year);
  var fieldMapping = service.fieldMapping;
  var uniqueSuffix = year + '-' + Date.now();

  // Susun create data berdasarkan fieldMapping yang tersedia
  var createData = {};
  if (fieldMapping.tanggal)      createData.tanggal      = new Date().toISOString();
  if (fieldMapping.noDok)        createData.noDok        = 'MOCK-DOK-' + uniqueSuffix;
  if (fieldMapping.namaKonsumen) createData.namaKonsumen = 'Mock Konsumen ' + year;
  if (fieldMapping.kotaCabang)   createData.kotaCabang   = 'Mock City';
  if (fieldMapping.kodeBarang)   createData.kodeBarang   = 'MOCK-' + uniqueSuffix;
  if (fieldMapping.namaBarang)   createData.namaBarang   = 'Mock Embalage ' + year;
  if (fieldMapping.batch)        createData.batch        = 'MOCK-BATCH-' + uniqueSuffix;
  if (fieldMapping.kategori)     createData.kategori     = 'Kemasan';
  if (fieldMapping.satuan)       createData.satuan       = 'Pcs';
  if (fieldMapping.penerimaan)   createData.penerimaan   = 200;
  if (fieldMapping.distribusi)   createData.distribusi   = 0;
  if (fieldMapping.catatan)      createData.catatan      = 'API mock test ' + year;

  // ─── CREATE ───────────────────────────────────────────────────────────────
  var createPayload  = { action: 'createProductEmbalage', data: { year: year, data: createData } };
  var createResponse = doPost({ postData: { contents: JSON.stringify(createPayload) } });
  var createJson     = JSON.parse(createResponse.getContent());

  if (createJson.status !== 'success' || !createJson.data.id) {
    throw new Error('CREATE failed: ' + JSON.stringify(createJson));
  }
  var id = createJson.data.id;
  Logger.log('✓ CREATE year=' + year + ' OK, id=' + id);

  // ─── GET BY ID ────────────────────────────────────────────────────────────
  var getEvent    = { parameter: { action: 'getProductEmbalageById', year: year, id: id } };
  var getResponse = doGet(getEvent);
  var getJson     = JSON.parse(getResponse.getContent());

  if (getJson.status !== 'success' || getJson.data.id !== id) {
    throw new Error('GET by id failed: ' + JSON.stringify(getJson));
  }
  Logger.log('✓ GET_BY_ID year=' + year + ' OK');

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  var updateData = {};
  if (fieldMapping.distribusi) {
    updateData.distribusi = 75;
  }
  if (fieldMapping.catatan) {
    updateData.catatan = 'Updated via API mock ' + year;
  }

  if (Object.keys(updateData).length > 0) {
    var updatePayload  = { action: 'updateProductEmbalage', data: { year: year, id: id, data: updateData } };
    var updateResponse = doPost({ postData: { contents: JSON.stringify(updatePayload) } });
    var updateJson     = JSON.parse(updateResponse.getContent());

    if (updateJson.status !== 'success') {
      throw new Error('UPDATE failed: ' + JSON.stringify(updateJson));
    }
    if (updateData.distribusi !== undefined && updateJson.data.distribusi !== updateData.distribusi) {
      throw new Error('UPDATE distribusi value mismatch');
    }
    Logger.log('✓ UPDATE year=' + year + ' OK');
  } else {
    Logger.log('⚠ UPDATE skipped year=' + year + ' (no updatable field)');
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  var deletePayload  = { action: 'deleteProductEmbalage', data: { year: year, id: id } };
  var deleteResponse = doPost({ postData: { contents: JSON.stringify(deletePayload) } });
  var deleteJson     = JSON.parse(deleteResponse.getContent());

  if (deleteJson.status !== 'success') {
    throw new Error('DELETE failed: ' + JSON.stringify(deleteJson));
  }

  // Verifikasi soft delete
  var checkEvent    = { parameter: { action: 'getProductEmbalageById', year: year, id: id } };
  var checkResponse = doGet(checkEvent);
  var checkJson     = JSON.parse(checkResponse.getContent());

  if (checkJson.data && checkJson.data.statues === 'DELETED') {
    Logger.log('✓ DELETE year=' + year + ' OK (soft delete verified)');
  } else if (!checkJson.data) {
    Logger.log('✓ DELETE year=' + year + ' OK (hard delete)');
  } else {
    Logger.log('⚠ DELETE year=' + year + ': soft delete mungkin tidak apply');
  }
}

/**
 * Test findByField via endpoint getProductEmbalageByField.
 */
function _testPEmbApiMock_FindByField() {
  Logger.log('');
  Logger.log('─── findByField mock test ───');

  var year         = String(new Date().getFullYear());
  var uniqueKode   = 'FBYF-' + Date.now();
  var service      = TransactionalProductEmbalageFactory.getService(year);

  // Buat data dengan kodeBarang unik
  var created = service.create({
    noDok:      'FBYF-DOK-' + Date.now(),
    kodeBarang: uniqueKode,
    namaBarang: 'FindByField Test',
    penerimaan: 10
  });

  // Hit endpoint getProductEmbalageByField
  var getEvent = {
    parameter: {
      action: 'getProductEmbalageByField',
      year:   year,
      field:  'kodeBarang',
      value:  uniqueKode
    }
  };
  var getResponse = doGet(getEvent);
  var getJson     = JSON.parse(getResponse.getContent());

  if (getJson.status === 'success' && Array.isArray(getJson.data) && getJson.data.length > 0) {
    Logger.log('✓ getProductEmbalageByField OK, found=' + getJson.data.length);
  } else {
    Logger.log('✗ getProductEmbalageByField FAILED: ' + JSON.stringify(getJson));
  }

  // Cleanup
  service.delete(created.id);
}