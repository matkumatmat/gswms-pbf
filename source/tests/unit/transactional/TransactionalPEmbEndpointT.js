// source/tests/unit/transactional/TransactionalPEmbEndpointT.js

/**
 * Endpoint tests untuk Product Embalage via doGet/doPost.
 * Mensimulasikan HTTP request seperti dari client frontend.
 * Menguji seluruh alur: create → getById → update → getByField → delete.
 */
function testProductEmbalageEndpoints() {
  Logger.log('=== TESTING PRODUCT EMBALAGE ENDPOINTS (VIA doGet/doPost) ===');

  var year = String(new Date().getFullYear());

  // ─── 1. GET paginated ───────────────────────────────────────────────────────
  var getEvent    = { parameter: { action: 'getProductEmbalage', year: year, page: '1', limit: '5' } };
  var getResponse = doGet(getEvent);
  var getJson     = JSON.parse(getResponse.getContent());

  if (getJson.status === 'success' && Array.isArray(getJson.data.data)) {
    Logger.log('✅ GET getProductEmbalage OK, total=' + getJson.data.total);
  } else {
    Logger.log('❌ GET getProductEmbalage FAILED: ' + JSON.stringify(getJson));
    return;
  }

  // ─── 2. POST create ─────────────────────────────────────────────────────────
  var uniqueSuffix = Date.now();
  var createPayload = {
    action: 'createProductEmbalage',
    data: {
      year: year,
      data: {
        tanggal:      new Date().toISOString(),
        noDok:        'ENDPT-DOK-' + uniqueSuffix,
        namaKonsumen: 'Endpoint Customer',
        kotaCabang:   'Endpoint City',
        kodeBarang:   'ENDPT-' + uniqueSuffix,
        namaBarang:   'Endpoint Embalage',
        batch:        'ENDPT-BATCH-' + uniqueSuffix,
        expireDate:   '2027-06-30',
        kategori:     'Kemasan',
        satuan:       'Box',
        penerimaan:   150,
        distribusi:   0,
        catatan:      'Endpoint test'
      }
    }
  };

  var createEvent    = { postData: { contents: JSON.stringify(createPayload) } };
  var createResponse = doPost(createEvent);
  var createJson     = JSON.parse(createResponse.getContent());

  if (createJson.status !== 'success' || !createJson.data.id) {
    Logger.log('❌ POST createProductEmbalage FAILED: ' + JSON.stringify(createJson));
    return;
  }
  var createdId = createJson.data.id;
  Logger.log('✅ POST createProductEmbalage OK, id=' + createdId);

  // ─── 3. GET by id ───────────────────────────────────────────────────────────
  var getByIdEvent    = { parameter: { action: 'getProductEmbalageById', year: year, id: createdId } };
  var getByIdResponse = doGet(getByIdEvent);
  var getByIdJson     = JSON.parse(getByIdResponse.getContent());

  if (getByIdJson.status === 'success' && getByIdJson.data.id === createdId) {
    Logger.log('✅ GET getProductEmbalageById OK');
  } else {
    Logger.log('❌ GET getProductEmbalageById FAILED: ' + JSON.stringify(getByIdJson));
  }

  // ─── 4. GET by field (kodeBarang) ───────────────────────────────────────────
  var getByFieldEvent = {
    parameter: {
      action: 'getProductEmbalageByField',
      year:   year,
      field:  'kodeBarang',
      value:  'ENDPT-' + uniqueSuffix
    }
  };
  var getByFieldResponse = doGet(getByFieldEvent);
  var getByFieldJson     = JSON.parse(getByFieldResponse.getContent());

  if (getByFieldJson.status === 'success' && Array.isArray(getByFieldJson.data)
      && getByFieldJson.data.length > 0) {
    Logger.log('✅ GET getProductEmbalageByField OK, found=' + getByFieldJson.data.length);
  } else {
    Logger.log('❌ GET getProductEmbalageByField FAILED: ' + JSON.stringify(getByFieldJson));
  }

  // ─── 5. POST update ─────────────────────────────────────────────────────────
  var updatePayload = {
    action: 'updateProductEmbalage',
    data: {
      year: year,
      id:   createdId,
      data: { distribusi: 50, catatan: 'Updated via endpoint test' }
    }
  };

  var updateEvent    = { postData: { contents: JSON.stringify(updatePayload) } };
  var updateResponse = doPost(updateEvent);
  var updateJson     = JSON.parse(updateResponse.getContent());

  if (updateJson.status === 'success' && updateJson.data.distribusi === 50) {
    Logger.log('✅ POST updateProductEmbalage OK');
  } else {
    Logger.log('❌ POST updateProductEmbalage FAILED: ' + JSON.stringify(updateJson));
  }

  // ─── 6. POST delete ─────────────────────────────────────────────────────────
  var deletePayload = {
    action: 'deleteProductEmbalage',
    data:   { year: year, id: createdId }
  };

  var deleteEvent    = { postData: { contents: JSON.stringify(deletePayload) } };
  var deleteResponse = doPost(deleteEvent);
  var deleteJson     = JSON.parse(deleteResponse.getContent());

  if (deleteJson.status === 'success') {
    // Verifikasi soft delete
    var checkEvent    = { parameter: { action: 'getProductEmbalageById', year: year, id: createdId } };
    var checkResponse = doGet(checkEvent);
    var checkJson     = JSON.parse(checkResponse.getContent());

    if (checkJson.data && checkJson.data.statues === 'DELETED') {
      Logger.log('✅ POST deleteProductEmbalage OK (soft delete verified)');
    } else if (!checkJson.data) {
      Logger.log('✅ POST deleteProductEmbalage OK (hard delete)');
    } else {
      Logger.log('⚠ deleteProductEmbalage: record masih ada, soft delete mungkin tidak apply');
    }
  } else {
    Logger.log('❌ POST deleteProductEmbalage FAILED: ' + JSON.stringify(deleteJson));
  }

  Logger.log('=== END PRODUCT EMBALAGE ENDPOINT TESTS ===');
}