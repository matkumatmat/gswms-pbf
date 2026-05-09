// source/tests/unit/transactional/TransactionalSEmbEndpointT.js
function testShippingEmbalageEndpoints() {
  Logger.log('=== TESTING SHIPPING EMBALAGE ENDPOINTS (VIA doGet/doPost) ===');

  var year = String(new Date().getFullYear());

  // 1. GET all (paginated)
  var getEvent = { parameter: { action: 'getShippingEmbalage', year: year, page: '1', limit: '5' } };
  var getResponse = doGet(getEvent);
  var getJson = JSON.parse(getResponse.getContent());
  if (getJson.status === 'success' && Array.isArray(getJson.data.data)) {
    Logger.log('✅ GET getShippingEmbalage OK, total=' + getJson.data.total);
  } else {
    Logger.log('❌ GET getShippingEmbalage FAILED: ' + JSON.stringify(getJson));
    return;
  }

  // 2. POST create
  var testData = {
    tanggal: new Date().toISOString(),
    noDokumen: 'ENDPT-TEST-001',
    kodeBarang: 'SEMB002',
    namaBarang: 'Plastik Kemasan',
    kategori: 'Kemasan',
    satuan: 'Roll',
    penerimaan: 50,
    distribusi: 0,
    catatan: 'Test endpoint'
  };
  var createPayload = {
    action: 'createShippingEmbalage',
    data: {
      year: year,
      data: testData
    }
  };
  var createEvent = { postData: { contents: JSON.stringify(createPayload) } };
  var createResponse = doPost(createEvent);
  var createJson = JSON.parse(createResponse.getContent());
  if (createJson.status !== 'success' || !createJson.data.id) {
    Logger.log('❌ POST createShippingEmbalage FAILED: ' + JSON.stringify(createJson));
    return;
  }
  var createdId = createJson.data.id;
  Logger.log('✅ POST createShippingEmbalage OK, id=' + createdId);

  // 3. GET by id
  var getByIdEvent = { parameter: { action: 'getShippingEmbalageById', year: year, id: createdId } };
  var getByIdResponse = doGet(getByIdEvent);
  var getByIdJson = JSON.parse(getByIdResponse.getContent());
  if (getByIdJson.status === 'success' && getByIdJson.data.id === createdId) {
    Logger.log('✅ GET getShippingEmbalageById OK');
  } else {
    Logger.log('❌ GET getShippingEmbalageById FAILED');
  }

  // 4. POST update
  var updatePayload = {
    action: 'updateShippingEmbalage',
    data: {
      year: year,
      id: createdId,
      data: { distribusi: 10, catatan: 'Updated via endpoint test' }
    }
  };
  var updateEvent = { postData: { contents: JSON.stringify(updatePayload) } };
  var updateResponse = doPost(updateEvent);
  var updateJson = JSON.parse(updateResponse.getContent());
  if (updateJson.status === 'success' && updateJson.data.distribusi === 10) {
    Logger.log('✅ POST updateShippingEmbalage OK');
  } else {
    Logger.log('❌ POST updateShippingEmbalage FAILED: ' + JSON.stringify(updateJson));
  }

  // 5. POST delete (soft)
  var deletePayload = {
    action: 'deleteShippingEmbalage',
    data: {
      year: year,
      id: createdId
    }
  };
  var deleteEvent = { postData: { contents: JSON.stringify(deletePayload) } };
  var deleteResponse = doPost(deleteEvent);
  var deleteJson = JSON.parse(deleteResponse.getContent());
  if (deleteJson.status === 'success') {
    var checkEvent = { parameter: { action: 'getShippingEmbalageById', year: year, id: createdId } };
    var checkResponse = doGet(checkEvent);
    var checkJson = JSON.parse(checkResponse.getContent());
    if (checkJson.data && checkJson.data.status === 'DELETED') {
      Logger.log('✅ POST deleteShippingEmbalage OK (soft delete verified)');
    } else if (!checkJson.data) {
      Logger.log('✅ POST deleteShippingEmbalage OK (hard delete assumed)');
    } else {
      Logger.log('⚠ deleteShippingEmbalage may not have applied soft delete');
    }
  } else {
    Logger.log('❌ POST deleteShippingEmbalage FAILED: ' + JSON.stringify(deleteJson));
  }

  Logger.log('=== END SHIPPING EMBALAGE ENDPOINT TESTS ===');
}