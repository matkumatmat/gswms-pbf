// source/tests/unit/batch/BatchEndpointT.js

function testBatchEndpoints() {
  Logger.log('=== TESTING BATCH ENDPOINTS (VIA doGet/doPost) ===');

  // 1. GET all batches
  var getEvent = { parameter: { action: 'getBatches' } };
  var getResponse = doGet(getEvent);
  var getJson = JSON.parse(getResponse.getContent());
  if (getJson.status === 'success' && Array.isArray(getJson.data)) {
    Logger.log('✅ GET getBatches OK, count=' + getJson.data.length);
  } else {
    Logger.log('❌ GET getBatches FAILED: ' + JSON.stringify(getJson));
    return;
  }

  // 2. POST create batch (butuh productId)
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('❌ No products, cannot test batch endpoints');
    return;
  }
  var productId = products[0].id;
  var testBatchNo = 'ENDPT-TEST-' + Date.now();
  var postPayload = {
    action: 'createBatch',
    data: {
      batch: testBatchNo,
      productId: productId,
      mfgDate: '2025-01-01',
      expireDate: '2026-12-31'
    }
  };
  var postEvent = { postData: { contents: JSON.stringify(postPayload) } };
  var postResponse = doPost(postEvent);
  var postJson = JSON.parse(postResponse.getContent());
  if (postJson.status === 'success' && postJson.data && postJson.data.id) {
    var createdId = postJson.data.id;
    Logger.log('✅ POST createBatch OK, id=' + createdId);
    
    // 3. GET by id
    var getByIdEvent = { parameter: { action: 'getBatchById', id: createdId } };
    var getByIdResponse = doGet(getByIdEvent);
    var getByIdJson = JSON.parse(getByIdResponse.getContent());
    if (getByIdJson.status === 'success' && getByIdJson.data.id === createdId) {
      Logger.log('✅ GET getBatchById OK');
    } else {
      Logger.log('❌ GET getBatchById FAILED');
    }
    
    // 4. POST update
    var updatePayload = {
      action: 'updateBatch',
      data: { id: createdId, data: { alokasi: 'Updated Endpoint', sysStatus: 'INACTIVE' } }
    };
    var updateEvent = { postData: { contents: JSON.stringify(updatePayload) } };
    var updateResponse = doPost(updateEvent);
    var updateJson = JSON.parse(updateResponse.getContent());
    if (updateJson.status === 'success' && updateJson.data.alokasi === 'Updated Endpoint') {
      Logger.log('✅ POST updateBatch OK');
    } else {
      Logger.log('❌ POST updateBatch FAILED');
    }
    
    // 5. POST delete (soft)
    var deletePayload = { action: 'deleteBatch', data: { id: createdId } };
    var deleteEvent = { postData: { contents: JSON.stringify(deletePayload) } };
    var deleteResponse = doPost(deleteEvent);
    var deleteJson = JSON.parse(deleteResponse.getContent());
    if (deleteJson.status === 'success') {
      var checkEvent = { parameter: { action: 'getBatchById', id: createdId } };
      var checkResponse = doGet(checkEvent);
      var checkJson = JSON.parse(checkResponse.getContent());
      if (checkJson.data.sysStatus === 'CLOSED') {
        Logger.log('✅ POST deleteBatch OK (soft delete verified)');
      } else {
        Logger.log('❌ deleteBatch soft delete not applied');
      }
    } else {
      Logger.log('❌ POST deleteBatch FAILED: ' + JSON.stringify(deleteJson));
    }
  } else {
    Logger.log('❌ POST createBatch FAILED: ' + JSON.stringify(postJson));
  }
  
  Logger.log('=== END BATCH ENDPOINT TESTS ===');
}