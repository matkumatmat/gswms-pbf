/**
 * test_BatchService.gs
 * Test script untuk BatchService refactor.
 * Langsung run dari Apps Script editor, output JSON raw.
 */

// ============================================================================
// TEST ENTRY POINTS
// ============================================================================

function test_ServiceInstantiation() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    var result = {
      status: 'success',
      message: 'Service instantiated successfully',
      hasBatchRepo: !!service.batchRepo,
      hasProductRepo: !!service.productRepo,
      defaultLimit: service.defaultLimit
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function test_JoinLogic() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    // Ambil raw data kecil untuk tes join
    var rawBatch = batchRepo.getPaginatedRawData(1, 10);
    var joined = service._joinBatchWithProduct(rawBatch);
    
    var result = {
      status: 'success',
      rawCount: rawBatch.length,
      joinedCount: joined.length,
      sample: joined.length > 0 ? joined[0] : null,
      hasProductFields: joined.length > 0 ? {
        hasKodeBarangOld: joined[0].kodeBarangOld !== undefined,
        hasNamaBarangDagang: joined[0].namaBarangDagang !== undefined,
        hasHjp: joined[0].hjp !== undefined
      } : null
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function test_GetShortBatchLookup() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    // Tes method dengan filter status + schema 'short'
    var data = service.getShortBatchLookup(1, 20);
    
    // Validasi: pastikan tidak ada CLOSED yang lolos
    var hasClosed = data.some(function(item) {
      return String(item.sysStatus || '').toUpperCase() === 'CLOSED';
    });
    
    // Validasi: pastikan output sesuai schema 'short'
    var schemaFields = ['id', 'productId', 'kodeBarangOld', 'kodeBarangNew', 'namaBarangDagang', 'batch', 'expiryDate', 'perBucket'];
    var hasExtraFields = false;
    if (data.length > 0) {
      var first = data[0];
      for (var key in first) {
        if (schemaFields.indexOf(key) === -1) {
          hasExtraFields = true;
          break;
        }
      }
    }
    
    var result = {
      status: 'success',
      count: data.length,
      hasClosedStatus: hasClosed,
      hasExtraFields: hasExtraFields,
      schemaUsed: 'short',
      sample: data.length > 0 ? data[0] : null
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function test_GetTableData() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    var data = service.getTableData(1, 10);
    
    var result = {
      status: 'success',
      count: data.length,
      schemaUsed: 'table',
      sample: data.length > 0 ? data[0] : null
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function test_GetDetail() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    // Coba cari detail by batch (ganti dengan batch valid di data kamu)
    var payload = { batch: 'M202404027' };
    var detail = service.getDetail(payload, 'detail');
    
    var result = {
      status: detail ? 'success' : 'not_found',
      schemaUsed: 'detail',
      data: detail
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function test_QueryMethod() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    // Tes query dengan filter dinamis
    var params = {
      page: 1,
      limit: 15,
      schema: 'dropdown',
      filters: {
        batch: ['M202404027']
      }
    };
    
    var data = service.query(params);
    
    // Validasi: semua item harus sektor=PBF dan sysStatus in allowed list
    var allMatch = data.every(function(item) {
      var sectorOk = String(item.sektor || '').toUpperCase() === 'PBF';
      var status = String(item.sysStatus || '').toUpperCase();
      var statusOk = ['ACTIVE', 'NTC'].indexOf(status) !== -1;
      return sectorOk && statusOk;
    });
    
    var result = {
      status: 'success',
      count: data.length,
      allMatchFilter: allMatch,
      schemaUsed: 'dropdown',
      sample: data.length > 0 ? data[0] : null
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function test_FullFlow() {
  try {
    var batchRepo = new BatchRepo();
    var productRepo = new ProductRepo();
    var service = new BatchService(batchRepo, productRepo);
    
    // 1. Join
    var raw = batchRepo.getPaginatedRawData(1, 50);
    var joined = service._joinBatchWithProduct(raw);
    
    // 2. Process JSON fields
    var processed = service._processJsonFields(joined);
    
    // 3. Filter
    var filterConfig = {
      allowedStatuses: ['ACTIVE', 'INACTIVE', 'NTC', 'ANOMALI']
    };
    var filtered = service._applyFilters(processed, filterConfig);
    
    // 4. Project to schema
    var projected = projectArrayToSchema(filtered, 'table');
    
    var result = {
      status: 'success',
      steps: {
        raw: raw.length,
        joined: joined.length,
        processed: processed.length,
        filtered: filtered.length,
        projected: projected.length
      },
      sample: projected.length > 0 ? projected[0] : null
    };
    Logger.log(JSON.stringify(result));
    // Di dalam test_FullFlow, setelah join:
  var sampleRaw = raw[0];
  var sampleJoined = joined[0];
  Logger.log('DEBUG: Raw batch productId: ' + sampleRaw[1]); // index 1 = productId
  Logger.log('DEBUG: Joined productId: ' + sampleJoined.productId);

  // Cek apakah product-nya ketemu
  var productRepo = new ProductRepo();
  var allProducts = productRepo.getAllProductRaw();
  var foundProduct = allProducts.find(function(p) {
    return p[0] === sampleRaw[1]; // p[0] = product id
  });
  Logger.log('DEBUG: Product found: ' + !!foundProduct);
  if (foundProduct) {
    Logger.log('DEBUG: Product kodeBarangOld: ' + foundProduct[1]); // sesuaikan index
  }
    return result;
  } catch (e) {
    var result = { status: 'error', message: e.toString(), stack: e.stack };
    Logger.log(JSON.stringify(result));
    return result;
  }
  
}