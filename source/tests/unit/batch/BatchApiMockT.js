// source/tests/unit/batch/BatchApiMockT.js

function runBatchApiMockTests() {
  Logger.log('=== START BATCH API MOCK TESTS ===');
  var createdId = testMockCreateBatch();
  if (createdId) {
    testMockGetBatchById(createdId);
    testMockUpdateBatch(createdId);
    testMockDeleteBatch(createdId);
  }
  testMockGetBatches();
  testMockGetBatchesPaginated();
  testMockGetBatchesByProductId();
  Logger.log('=== END BATCH API MOCK TESTS ===');
}

function testMockGetBatches() {
  var mockEvent = { parameter: { action: 'getBatches' } };
  var response = doGet(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && Array.isArray(json.data)) {
    Logger.log('✓ GET getBatches -> success, count=' + json.data.length);
  } else {
    Logger.log('✗ GET getBatches failed: ' + JSON.stringify(json));
  }
}

function testMockCreateBatch() {
  // perlu productId yang valid, asumsikan ada product dengan id tertentu
  // atau buat product dulu
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('✗ testMockCreateBatch skipped – no products');
    return null;
  }
  var productId = products[0].id;
  var payload = {
    action: 'createBatch',
    data: {
      batch: 'API-MOCK-' + Date.now(),
      productId: productId,
      mfgDate: '2025-01-01',
      expireDate: '2026-12-31'
    }
  };
  var mockEvent = { postData: { contents: JSON.stringify(payload) } };
  var response = doPost(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data && json.data.id) {
    Logger.log('✓ POST createBatch -> success, id=' + json.data.id);
    return json.data.id;
  } else {
    Logger.log('✗ POST createBatch failed: ' + JSON.stringify(json));
    return null;
  }
}

function testMockGetBatchById(id) {
  var mockEvent = { parameter: { action: 'getBatchById', id: id } };
  var response = doGet(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data && json.data.id === id) {
    Logger.log('✓ GET getBatchById -> success');
  } else {
    Logger.log('✗ GET getBatchById failed: ' + JSON.stringify(json));
  }
}

function testMockUpdateBatch(id) {
  var payload = {
    action: 'updateBatch',
    data: { id: id, data: { alokasi: 'Updated via API', sysStatus: 'INACTIVE' } }
  };
  var mockEvent = { postData: { contents: JSON.stringify(payload) } };
  var response = doPost(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data.alokasi === 'Updated via API') {
    Logger.log('✓ POST updateBatch -> success');
  } else {
    Logger.log('✗ POST updateBatch failed: ' + JSON.stringify(json));
  }
}

function testMockDeleteBatch(id) {
  var payload = { action: 'deleteBatch', data: { id: id } };
  var mockEvent = { postData: { contents: JSON.stringify(payload) } };
  var response = doPost(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success') {
    var checkEvent = { parameter: { action: 'getBatchById', id: id } };
    var checkResponse = doGet(checkEvent);
    var checkJson = JSON.parse(checkResponse.getContent());
    if (checkJson.data.sysStatus === 'CLOSED') {
      Logger.log('✓ POST deleteBatch -> success (soft delete verified)');
    } else {
      Logger.log('✗ POST deleteBatch -> soft delete not applied');
    }
  } else {
    Logger.log('✗ POST deleteBatch failed: ' + JSON.stringify(json));
  }
}

function testMockGetBatchesPaginated() {
  var mockEvent = { parameter: { action: 'getBatchesPaginated', page: '1', limit: '3' } };
  var response = doGet(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && json.data.data && json.data.data.length <= 3) {
    Logger.log('✓ GET getBatchesPaginated -> success, total=' + json.data.total);
  } else {
    Logger.log('✗ GET getBatchesPaginated failed: ' + JSON.stringify(json));
  }
}

function testMockGetBatchesByProductId() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('✗ testMockGetBatchesByProductId skipped – no products');
    return;
  }
  var productId = products[0].id;
  var mockEvent = { parameter: { action: 'getBatchesByProductId', productId: productId } };
  var response = doGet(mockEvent);
  var json = JSON.parse(response.getContent());
  if (json.status === 'success' && Array.isArray(json.data)) {
    Logger.log('✓ GET getBatchesByProductId -> success, count=' + json.data.length);
  } else {
    Logger.log('✗ GET getBatchesByProductId failed: ' + JSON.stringify(json));
  }
}