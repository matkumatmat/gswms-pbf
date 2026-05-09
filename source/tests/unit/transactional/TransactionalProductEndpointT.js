// source/tests/unit/transactional/TransactionalEndpointT.js

function testTransactionalEndpoints() {
  Logger.log('=== TESTING TRANSACTIONAL ENDPOINTS (VIA doGet/doPost) ===');
  
  // Log konfigurasi
  var configs = ApplicationConfig.dataSources.transactional;
  Logger.log('Config loaded: years = ' + configs.map(c => c.year).join(', '));
  
  var years = ['2025', '2026'];
  var sheetTypes = ['ALL_DIST', 'ALL_CONS', 'ALL_RCV', 'ALL_SEMB', 'ALL_PEMB'];
  
  years.forEach(function(year) {
    sheetTypes.forEach(function(sheetType) {
      try {
        testEndpoint(year, sheetType);
      } catch(e) {
        Logger.log('❌ ENDPOINT FAILED for ' + year + '/' + sheetType + ': ' + e.message);
      }
    });
  });
  
  Logger.log('=== END TRANSACTIONAL ENDPOINT TESTS ===');
}

function testEndpoint(year, sheetType) {
  // Dapatkan fieldMapping
  var service = TransactionalFactory.getService(year, sheetType);
  var fieldMapping = service.fieldMapping;
  var hasDistribusi = fieldMapping.hasOwnProperty('distribusi');
  
  // 1. GET paginated (limit kecil agar cepat)
  var getEvent = { parameter: { action: 'getTransactional', year: year, sheet: sheetType, page: '1', limit: '10' } };
  var getResponse = doGet(getEvent);
  var getJson = JSON.parse(getResponse.getContent());
  if (getJson.status !== 'success' || !Array.isArray(getJson.data.data)) {
    throw new Error('GET paginated failed');
  }
  Logger.log('✅ GET paginated ' + year + '/' + sheetType + ' OK, total=' + getJson.data.total);
  
  // 2. CREATE
  var createData = {};
  if (fieldMapping.type) createData.type = 'ENDPT_TEST';
  if (fieldMapping.tanggal) createData.tanggal = new Date().toISOString();
  if (fieldMapping.namaKonsumen) createData.namaKonsumen = 'Endpoint Customer';
  if (fieldMapping.kodeBarang) createData.kodeBarang = 'ENDPT001';
  if (fieldMapping.batch) createData.batch = 'ENDPTBATCH';
  if (fieldMapping.penerimaan) createData.penerimaan = 200;
  if (fieldMapping.distribusi) createData.distribusi = 0;
  
  var createPayload = {
    action: 'createTransactional',
    data: {
      year: year,
      sheet: sheetType,
      data: createData
    }
  };
  var createResponse = doPost({ postData: { contents: JSON.stringify(createPayload) } });
  var createJson = JSON.parse(createResponse.getContent());
  if (createJson.status !== 'success' || !createJson.data.id) {
    throw new Error('CREATE failed: ' + JSON.stringify(createJson));
  }
  var id = createJson.data.id;
  Logger.log('✅ CREATE ' + year + '/' + sheetType + ' OK, id=' + id);
  
  // 3. GET by id
  var getByIdEvent = { parameter: { action: 'getTransactional', year: year, sheet: sheetType, id: id } };
  var getByIdResponse = doGet(getByIdEvent);
  var getByIdJson = JSON.parse(getByIdResponse.getContent());
  if (getByIdJson.status !== 'success' || getByIdJson.data.id !== id) {
    throw new Error('GET by id failed');
  }
  Logger.log('✅ GET by id ' + year + '/' + sheetType + ' OK');
  
  // 4. UPDATE (jika ada distribusi)
  if (hasDistribusi) {
    var updatePayload = {
      action: 'updateTransactional',
      data: {
        year: year,
        sheet: sheetType,
        id: id,
        data: { distribusi: 75, keterangan: 'Updated via endpoint' }
      }
    };
    var updateResponse = doPost({ postData: { contents: JSON.stringify(updatePayload) } });
    var updateJson = JSON.parse(updateResponse.getContent());
    if (updateJson.status !== 'success' || updateJson.data.distribusi !== 75) {
      throw new Error('UPDATE failed');
    }
    Logger.log('✅ UPDATE ' + year + '/' + sheetType + ' OK');
  } else {
    Logger.log('⚠ UPDATE skipped for ' + year + '/' + sheetType + ' (no distribusi field)');
  }
  
  // 5. DELETE (soft)
  var deletePayload = {
    action: 'deleteTransactional',
    data: {
      year: year,
      sheet: sheetType,
      id: id
    }
  };
  var deleteResponse = doPost({ postData: { contents: JSON.stringify(deletePayload) } });
  var deleteJson = JSON.parse(deleteResponse.getContent());
  if (deleteJson.status !== 'success') {
    throw new Error('DELETE failed');
  }
  // Verifikasi jika ada STATUS
  var hasStatus = fieldMapping.hasOwnProperty('status');
  if (hasStatus) {
    var checkEvent = { parameter: { action: 'getTransactional', year: year, sheet: sheetType, id: id } };
    var checkResponse = doGet(checkEvent);
    var checkJson = JSON.parse(checkResponse.getContent());
    if (checkJson.data && checkJson.data.status === 'DELETED') {
      Logger.log('✅ DELETE ' + year + '/' + sheetType + ' OK (soft delete verified)');
    } else {
      Logger.log('⚠ DELETE soft not verified for ' + year + '/' + sheetType);
    }
  } else {
    Logger.log('✅ DELETE ' + year + '/' + sheetType + ' OK (hard delete assumed)');
  }
}