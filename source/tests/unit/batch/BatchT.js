// source/tests/unit/batch/BatchT.js

function runAllBatchTests() {
  Logger.log('=== START BATCH UNIT TESTS ===');
  testGetAllBatches();
  testCreateBatch();
  testUpdateBatch();
  testGetBatchById();
  testGetBatchesPaginated();
  testGetBatchesByProductId();
  testDeleteBatch();
  testAttachments();
  Logger.log('=== END BATCH UNIT TESTS ===');
}

function testGetAllBatches() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var batches = batchService.getAllBatches();
  assert(Array.isArray(batches), 'getAllBatches should return array');
  Logger.log('✓ testGetAllBatches passed, count: ' + batches.length);
}

function testCreateBatch() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('⚠ testCreateBatch skipped – no products');
    return;
  }
  var testProduct = products[0];
  var uniqueBatch = 'BATCH-' + Date.now();
  var newBatch = batchService.createBatch({
    batch: uniqueBatch,
    productId: testProduct.id,
    mfgDate: '2025-01-01',
    expireDate: '2026-12-31',
    status: 'RECEIVED'
  });
  assert(newBatch.id && newBatch.id.length > 0, 'Created batch should have ID');
  assert(newBatch.batch === uniqueBatch, 'Batch number mismatch');
  Logger.log('✓ testCreateBatch passed, ID: ' + newBatch.id);
  return newBatch.id;
}

function testUpdateBatch() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('⚠ testUpdateBatch skipped – no products');
    return;
  }
  var testProduct = products[0];
  var newBatch = batchService.createBatch({
    batch: 'UPDATE-TEST-' + Date.now(),
    productId: testProduct.id
  });
  var updated = batchService.updateBatch(newBatch.id, { alokasi: 'Gudang A', sysStatus: 'INACTIVE' });
  assert(updated.alokasi === 'Gudang A', 'Update failed for alokasi');
  assert(updated.sysStatus === 'INACTIVE', 'Update failed for sysStatus');
  Logger.log('✓ testUpdateBatch passed');
}

function testGetBatchById() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var all = batchService.getAllBatches();
  if (all.length === 0) {
    Logger.log('⚠ testGetBatchById skipped – no batches');
    return;
  }
  var first = all[0];
  var found = batchService.getBatchById(first.id);
  assert(found !== null, 'Batch should be found by ID');
  assert(found.id === first.id, 'ID mismatch');
  Logger.log('✓ testGetBatchById passed');
}

function testGetBatchesPaginated() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var result = batchService.getBatchesPaginated(1, 5);
  assert(result.data.length <= 5, 'Pagination limit not respected');
  assert(result.totalPages > 0, 'Total pages > 0');
  Logger.log('✓ testGetBatchesPaginated passed, total: ' + result.total);
}

function testGetBatchesByProductId() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('⚠ testGetBatchesByProductId skipped – no products');
    return;
  }
  var testProduct = products[0];
  var batches = batchService.getBatchesByProductId(testProduct.id);
  assert(Array.isArray(batches), 'Should return array');
  Logger.log('✓ testGetBatchesByProductId passed, found: ' + batches.length);
}

function testDeleteBatch() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('⚠ testDeleteBatch skipped – no products');
    return;
  }
  var testProduct = products[0];
  var newBatch = batchService.createBatch({
    batch: 'DELETE-TEST-' + Date.now(),
    productId: testProduct.id
  });
  batchService.deleteBatch(newBatch.id);
  var deleted = batchService.getBatchById(newBatch.id);
  assert(deleted.sysStatus === 'CLOSED', 'Delete should set sysStatus to CLOSED');
  Logger.log('✓ testDeleteBatch passed');
}

function testAttachments() {
  var productService = new ProductService(new ProductRepository(new ProductSheetAdapter()));
  var batchService = new BatchServiceV2(new BatchRepository(new BatchSheetAdapter()), productService);
  var products = productService.getAllProducts();
  if (products.length === 0) {
    Logger.log('⚠ testAttachments skipped – no products');
    return;
  }
  var testProduct = products[0];
  var newBatch = batchService.createBatch({
    batch: 'ATTACH-TEST-' + Date.now(),
    productId: testProduct.id
  });
  var attach = batchService.createAttachment(newBatch.id, {
    driveId: 'test-drive-id',
    fileName: 'test.jpg',
    url: 'https://example.com/test.jpg'
  });
  assert(attach.id && attach.id.length > 0, 'Attachment created');
  var attachments = batchService.getAttachments(newBatch.id);
  assert(attachments.length > 0, 'Attachments found');
  Logger.log('✓ testAttachments passed');
}

function assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}