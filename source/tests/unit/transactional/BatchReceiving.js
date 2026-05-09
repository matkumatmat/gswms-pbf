// source/tests/unit/transactional/ProductReceivingT.js

function runProductReceivingTests() {
  Logger.log('=== PRODUCT RECEIVING FULL FLOW TESTS ===');
  testReceiving_By_BatchId();   // Skenario Web/AppSheet
  testReceiving_By_BatchNo();   // Skenario Spreadsheet/Manual
  Logger.log('=== ALL PRODUCT RECEIVING TESTS PASSED ===');
}

function testReceiving_By_BatchId() {
  Logger.log('\n[SCENARIO 1] Receiving via batchId (Web/AppSheet)');
  
  // ╔══════════════════════════════════════════════════════════╗
  // ║  DATA PLACEHOLDER – SESUAIKAN                            ║
  // ╚══════════════════════════════════════════════════════════╝
  var productData = {
    kodeBarang: "PRD-WEB-" + Date.now().toString().slice(-4),
    namaBarang: "Produk Web " + Date.now(),
    kategori: "Obat Bebas",
    jenis: "Tablet",
    tahun: "2025"
  };

  var batchData = {
    batch: "BTCH-WEB-" + Date.now(),
    mfgDate: "2025-01-01",
    expireDate: "2026-06-01",
    status: "RECEIVED"
  };

  var receivingData = {
    // batchId akan diisi setelah batch terbuat
    type: "RECEIVING",
    jumlahBucket: 4,
    jumlahPerBucket: 25,
    kondisiKemasan: "BAIK",
    placement: "Rak Web"
  };
  // ═══════════════════════════════════════════════════════════

  var createdProductId, createdBatchId;

  try {
    // STEP 1: Create Product
    Logger.log('[1] Creating product...');
    var prodSvc = ProductMasterFactory.getService();
    var product = prodSvc.create(productData);
    createdProductId = product.id;
    Logger.log('    Product ID: ' + product.id);

    // STEP 2: Create Batch
    Logger.log('[2] Creating batch...');
    batchData.productId = product.id;
    var batchSvc = BatchMasterFactory.getService();
    var batch = batchSvc.create(batchData);
    createdBatchId = batch.id;
    Logger.log('    Batch ID: ' + batch.id + ', Batch No: ' + batch.batch);

    // STEP 3: Create Receiving with batchId
    Logger.log('[3] Creating receiving (batchId)...');
    var rcvSvc = ProductReceivingFactory.getService('2025');
    receivingData.batchId = batch.id;   // <-- KRITIS: kirim ID
    var result = rcvSvc.create(receivingData);
    Logger.log('    Receiving ID: ' + result.id);

    // ASSERTIONS
    Logger.log('[4] Assertions...');
    assert(result.productId === product.id,
      'productId harus ' + product.id + ', tapi dapat ' + result.productId);
    assert(result.kodeBarang === product.kodeBarang,
      'kodeBarang harus "' + product.kodeBarang + '", dapat "' + result.kodeBarang + '"');
    assert(result.namaBarang === product.namaBarang,
      'namaBarang harus "' + product.namaBarang + '", dapat "' + result.namaBarang + '"');
    assert(result.jumlahFisik === 100,
      'jumlahFisik harus 100, dapat ' + result.jumlahFisik);
    assert(result.type === 'RECEIVING', 'type RECEIVING');
    Logger.log('    ✓ All assertions passed');

    // UPDATE
    Logger.log('[5] Update receiving...');
    var updated = rcvSvc.update(result.id, { placement: 'Rak Web-2' });
    assert(updated.placement === 'Rak Web-2', 'Update placement gagal');
    Logger.log('    ✓ Update OK');

    // SOFT DELETE
    Logger.log('[6] Soft delete...');
    var del = rcvSvc.delete(result.id);
    assert(del.success, 'Delete gagal');
    var after = rcvSvc.repo.findById(result.id);
    assert(after && after.statues === 'DELETED', 'Status tidak DELETED');
    Logger.log('    ✓ Soft delete OK');

  } catch(e) {
    Logger.log('✗ FAILED: ' + e.message);
    throw e;
  } finally {
    // Cleanup
    if (createdBatchId) try { BatchMasterFactory.getService().delete(createdBatchId); } catch(e) {}
    if (createdProductId) try { ProductMasterFactory.getService().delete(createdProductId); } catch(e) {}
  }
}

function testReceiving_By_BatchNo() {
  Logger.log('\n[SCENARIO 2] Receiving via batchNo (Spreadsheet/Manual)');
  
  var productData = {
    kodeBarang: "PRD-SS-" + Date.now().toString().slice(-4),
    namaBarang: "Produk SS " + Date.now(),
    kategori: "Obat Bebas",
    jenis: "Tablet",
    tahun: "2025"
  };

  var batchData = {
    batch: "BTCH-SS-" + Date.now(),
    mfgDate: "2025-01-01",
    expireDate: "2026-06-01",
    status: "RECEIVED"
  };

  var receivingData = {
    // batchNo akan diisi setelah batch terbuat
    type: "RECEIVING",
    jumlahBucket: 3,
    jumlahPerBucket: 30,
    kondisiKemasan: "BAIK",
    placement: "Rak Manual"
  };

  var createdProductId, createdBatchId;

  try {
    // Product
    Logger.log('[1] Creating product...');
    var prodSvc = ProductMasterFactory.getService();
    var product = prodSvc.create(productData);
    createdProductId = product.id;
    Logger.log('    Product ID: ' + product.id);

    // Batch
    Logger.log('[2] Creating batch...');
    batchData.productId = product.id;
    var batchSvc = BatchMasterFactory.getService();
    var batch = batchSvc.create(batchData);
    createdBatchId = batch.id;
    Logger.log('    Batch No: ' + batch.batch);

    // Receiving with batchNo
    Logger.log('[3] Creating receiving (batchNo)...');
    var rcvSvc = ProductReceivingFactory.getService('2025');
    receivingData.batchNo = batch.batch;   // <-- KRITIS: kirim batchNo
    var result = rcvSvc.create(receivingData);
    Logger.log('    Receiving ID: ' + result.id);

    // Assertions
    Logger.log('[4] Assertions...');
    assert(result.productId === product.id,
      'productId harus ' + product.id + ', tapi dapat ' + result.productId);
    assert(result.kodeBarang === product.kodeBarang,
      'kodeBarang harus "' + product.kodeBarang + '", dapat "' + result.kodeBarang + '"');
    assert(result.namaBarang === product.namaBarang,
      'namaBarang harus "' + product.namaBarang + '", dapat "' + result.namaBarang + '"');
    assert(result.jumlahFisik === 90,
      'jumlahFisik harus 90, dapat ' + result.jumlahFisik);
    Logger.log('    ✓ All assertions passed');

    // Update
    Logger.log('[5] Update receiving...');
    var updated = rcvSvc.update(result.id, { kondisiKemasan: 'RUSAK' });
    assert(updated.kondisiKemasan === 'RUSAK', 'Update kondisi gagal');
    Logger.log('    ✓ Update OK');

    // Soft delete
    Logger.log('[6] Soft delete...');
    var del = rcvSvc.delete(result.id);
    assert(del.success, 'Delete gagal');
    var after = rcvSvc.repo.findById(result.id);
    assert(after && after.statues === 'DELETED', 'Status2 tidak DELETED');
    Logger.log('    ✓ Soft delete OK');

  } catch(e) {
    Logger.log('✗ FAILED: ' + e.message);
    throw e;
  } finally {
    if (createdBatchId) try { BatchMasterFactory.getService().delete(createdBatchId); } catch(e) {}
    if (createdProductId) try { ProductMasterFactory.getService().delete(createdProductId); } catch(e) {}
  }
}

function assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}