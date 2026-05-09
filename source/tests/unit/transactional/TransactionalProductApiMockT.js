// source/tests/unit/transactional/TransactionalApiMockT.js

function runTransactionalApiMockTests() {
  Logger.log('=== START TRANSACTIONAL API MOCK TESTS ===');
  
  // Log konfigurasi
  var configs = ApplicationConfig.dataSources.transactional;
  Logger.log('Config loaded: years = ' + configs.map(c => c.year).join(', '));
  
  var years = ['2025', '2026'];
  var sheetTypes = ['ALL_DIST', 'ALL_CONS', 'ALL_RCV', 'ALL_SEMB', 'ALL_PEMB'];
  
  years.forEach(function(year) {
    sheetTypes.forEach(function(sheetType) {
      try {
        testApiMock(year, sheetType);
      } catch(e) {
        Logger.log('✗ API MOCK FAILED for ' + year + '/' + sheetType + ': ' + e.message);
      }
    });
  });
  
  Logger.log('=== END TRANSACTIONAL API MOCK TESTS ===');
}

function testApiMock(year, sheetType) {
  // Dapatkan fieldMapping dari service untuk mengetahui field yang ada
  var service = TransactionalFactory.getService(year, sheetType);
  var fieldMapping = service.fieldMapping;
  var hasDistribusi = fieldMapping.hasOwnProperty('distribusi');
  
  // Prepare create data
  var createData = {};
  if (fieldMapping.type) createData.type = 'API_MOCK';
  if (fieldMapping.tanggal) createData.tanggal = new Date().toISOString();
  if (fieldMapping.namaKonsumen) createData.namaKonsumen = 'Mock Customer';
  if (fieldMapping.kodeBarang) createData.kodeBarang = 'MOCK001';
  if (fieldMapping.batch) createData.batch = 'MOCKBATCH';
  if (fieldMapping.penerimaan) createData.penerimaan = 100;
  if (fieldMapping.distribusi) createData.distribusi = 0;
  
  // CREATE
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
    throw new Error('Create failed: ' + JSON.stringify(createJson));
  }
  var id = createJson.data.id;
  Logger.log('✓ CREATE ' + year + '/' + sheetType + ' OK, id=' + id);
  
  // GET by id
  var getEvent = { parameter: { action: 'getTransactional', year: year, sheet: sheetType, id: id } };
  var getResponse = doGet(getEvent);
  var getJson = JSON.parse(getResponse.getContent());
  if (getJson.status !== 'success' || getJson.data.id !== id) {
    throw new Error('Get by id failed');
  }
  Logger.log('✓ GET_BY_ID ' + year + '/' + sheetType + ' OK');
  
  // UPDATE (hanya jika ada distribusi)
  if (hasDistribusi) {
    var updatePayload = {
      action: 'updateTransactional',
      data: {
        year: year,
        sheet: sheetType,
        id: id,
        data: { distribusi: 50, keterangan: 'Updated via API mock' }
      }
    };
    var updateResponse = doPost({ postData: { contents: JSON.stringify(updatePayload) } });
    var updateJson = JSON.parse(updateResponse.getContent());
    if (updateJson.status !== 'success' || updateJson.data.distribusi !== 50) {
      throw new Error('Update failed');
    }
    Logger.log('✓ UPDATE ' + year + '/' + sheetType + ' OK');
  } else {
    Logger.log('⚠ UPDATE skipped for ' + year + '/' + sheetType + ' (no distribusi field)');
  }
  
  // DELETE (soft)
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
    throw new Error('Delete failed');
  }
  // Verifikasi soft delete jika ada field STATUS
  var hasStatus = fieldMapping.hasOwnProperty('status');
  if (hasStatus) {
    var checkEvent = { parameter: { action: 'getTransactional', year: year, sheet: sheetType, id: id } };
    var checkResponse = doGet(checkEvent);
    var checkJson = JSON.parse(checkResponse.getContent());
    if (checkJson.data && checkJson.data.status === 'DELETED') {
      Logger.log('✓ DELETE ' + year + '/' + sheetType + ' OK (soft delete verified)');
    } else {
      Logger.log('⚠ DELETE soft not verified for ' + year + '/' + sheetType);
    }
  } else {
    Logger.log('⚠ DELETE soft not verified for ' + year + '/' + sheetType + ' (no STATUS field)');
  }
}