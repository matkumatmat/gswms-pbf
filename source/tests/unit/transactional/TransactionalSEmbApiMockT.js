// source/tests/unit/transactional/TransactionalSEmbApiMockT.js
function runShippingEmbalageApiMockTests() {
  Logger.log('=== START SHIPPING EMBALAGE API MOCK TESTS ===');
  
  var createdId = testMockCreateShippingEmbalage();
  if (createdId) {
    testMockGetShippingEmbalageById(createdId);
    testMockUpdateShippingEmbalage(createdId);
    testMockDeleteShippingEmbalage(createdId);
  }
  testMockGetShippingEmbalage();
  
  Logger.log('=== END SHIPPING EMBALAGE API MOCK TESTS ===');
}

function testMockGetShippingEmbalage() {
  var year = String(new Date().getFullYear());
  var mockEvent = { parameter: { action: 'getShippingEmbalage', year: year, page: '1', limit: '10' } };
  var response = doGet(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && Array.isArray(json.data.data)) {
    Logger.log('✓ GET getShippingEmbalage -> success, total=' + json.data.total);
  } else {
    Logger.log('✗ GET getShippingEmbalage failed: ' + JSON.stringify(json));
  }
}

function testMockCreateShippingEmbalage() {
  var year = String(new Date().getFullYear());
  // Perbaikan: masukkan year, data ke dalam properti data
  var payload = {
    action: 'createShippingEmbalage',
    data: {
      year: year,
      data: {
        tanggal: new Date().toISOString(),
        noDokumen: 'API-MOCK-DOC-001',
        kodeBarang: 'SEMB001',
        namaBarang: 'Kardus Besar',
        kategori: 'Kemasan',
        satuan: 'Pcs',
        penerimaan: 100,
        distribusi: 0,
        catatan: 'Test API Mock'
      }
    }
  };
  var mockEvent = { postData: { contents: JSON.stringify(payload) } };
  var response = doPost(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data && json.data.id) {
    Logger.log('✓ POST createShippingEmbalage -> success, id=' + json.data.id);
    return json.data.id;
  } else {
    Logger.log('✗ POST createShippingEmbalage failed: ' + JSON.stringify(json));
    return null;
  }
}

function testMockGetShippingEmbalageById(id) {
  var year = String(new Date().getFullYear());
  var mockEvent = { parameter: { action: 'getShippingEmbalageById', year: year, id: id } };
  var response = doGet(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data && json.data.id === id) {
    Logger.log('✓ GET getShippingEmbalageById -> success');
  } else {
    Logger.log('✗ GET getShippingEmbalageById failed: ' + JSON.stringify(json));
  }
}

function testMockUpdateShippingEmbalage(id) {
  var year = String(new Date().getFullYear());
  var payload = {
    action: 'updateShippingEmbalage',
    data: {
      year: year,
      id: id,
      data: { distribusi: 20, catatan: 'Updated via API mock' }
    }
  };
  var mockEvent = { postData: { contents: JSON.stringify(payload) } };
  var response = doPost(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data.distribusi === 20) {
    Logger.log('✓ POST updateShippingEmbalage -> success');
  } else {
    Logger.log('✗ POST updateShippingEmbalage failed: ' + JSON.stringify(json));
  }
}

function testMockDeleteShippingEmbalage(id) {
  var year = String(new Date().getFullYear());
  var payload = {
    action: 'deleteShippingEmbalage',
    data: {
      year: year,
      id: id
    }
  };
  var mockEvent = { postData: { contents: JSON.stringify(payload) } };
  var response = doPost(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success') {
    var checkEvent = { parameter: { action: 'getShippingEmbalageById', year: year, id: id } };
    var checkResponse = doGet(checkEvent);
    var checkJson = JSON.parse(checkResponse.getContent());
    if (checkJson.data && checkJson.data.status === 'DELETED') {
      Logger.log('✓ POST deleteShippingEmbalage -> success (soft delete verified)');
    } else if (!checkJson.data) {
      Logger.log('✓ POST deleteShippingEmbalage -> success (hard delete assumed)');
    } else {
      Logger.log('⚠ POST deleteShippingEmbalage -> record still exists, delete may not be applied');
    }
  } else {
    Logger.log('✗ POST deleteShippingEmbalage failed: ' + JSON.stringify(json));
  }
}