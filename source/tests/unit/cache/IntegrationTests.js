// source/tests/unit/cache/IntegrationT.js

/**
 * Integration test seluruh domain dengan service layer nyata.
 * Validasi end‑to‑end: create → get → update → get → delete → verify.
 * Semua domain diuji: Customer, Product, Batch, SEMB, PEMB, Archieve,
 * Transactional (DIST, RCV, CONS, SEMB, PEMB), History (Product, SEMB, PEMB).
 * Setiap test membersihkan data yang dibuat.
 */
function runIntegrationTests() {
  Logger.log('=== START Integration Tests ===');
  integration_MasterCustomer();
  integration_MasterProduct();
  integration_MasterBatch();
  integration_MasterShippingEmbalage();
  integration_MasterProductEmbalage();
  integration_Archieve();
  integration_TransactionalDist();
  integration_TransactionalRcv();
  integration_TransactionalCons();
  integration_TransactionalSemb();
  integration_TransactionalPemb();
  integration_HistoryProduct();
  integration_HistoryShippingEmbalage();
  integration_HistoryProductEmbalage();
  Logger.log('=== END Integration Tests ===');
}

// ─── HELPERS ───────────────────────────────────────────

function _iassert(condition, msg) {
  if (!condition) throw new Error('Integration assert failed: ' + msg);
}

function _icleanup(service, id) {
  if (id) try { service.delete(id); } catch(e) {}
}

// ─── MASTER ────────────────────────────────────────────

function integration_MasterCustomer() {
  Logger.log('[integration] Customer: create → find → update → delete');
  var svc = CustomerMasterFactory.getService();
  var uniq = 'INT_CUST_' + Date.now();
  var created = svc.create({ namaKonsumen: uniq, kotaCabang: 'Int City', typeKonsumen: 'REGULER' });
  _iassert(!!created.id, 'Customer create failed');

  var found = svc.findByField('namaKonsumen', uniq);
  _iassert(found.length === 1, 'Customer find failed');

  var updated = svc.update(created.id, { kotaCabang: 'Updated City' });
  _iassert(updated.kotaCabang === 'Updated City', 'Customer update failed');

  svc.delete(created.id);
  var del = svc.getById(created.id);
  _iassert(del.statues === 'DELETED', 'Customer soft delete failed');
  Logger.log('  PASS');
}

function integration_MasterProduct() {
  Logger.log('[integration] Product: create → find → update → delete');
  var svc = ProductMasterFactory.getService();
  var uniq = 'INT_PROD_' + Date.now();
  var created = svc.create({ kodeBarang: uniq, namaBarang: 'Int Product', tahun: '2025', kategori: 'Test' });
  _iassert(!!created.id, 'Product create failed');

  var found = svc.findByField('kodeBarang', uniq);
  _iassert(found.length === 1, 'Product find failed');

  svc.update(created.id, { namaBarang: 'Updated Product' });
  var updated = svc.getById(created.id);
  _iassert(updated.namaBarang === 'Updated Product', 'Product update failed');

  svc.delete(created.id);
  var del = svc.getById(created.id);
  _iassert(del.statues === 'DELETED', 'Product soft delete failed');
  Logger.log('  PASS');
}

function integration_MasterBatch() {
  Logger.log('[integration] Batch: create → find → update → delete');
  var prodSvc = ProductMasterFactory.getService();
  var prod = prodSvc.create({ kodeBarang: 'INT_BATPRD_' + Date.now(), namaBarang: 'BatchInt Prod', tahun: '2025' });
  var batchSvc = BatchMasterFactory.getService();
  var uniq = 'INT_BATCH_' + Date.now();
  var created = batchSvc.create({ batch: uniq, productId: prod.id, mfgDate: '2025-01-01', expireDate: '2026-01-01', status: 'RECEIVED' });
  _iassert(!!created.id, 'Batch create failed');

  var found = batchSvc.findByField('batch', uniq);
  _iassert(found.length === 1, 'Batch find failed');

  batchSvc.update(created.id, { alokasi: 'Int Gudang' });
  var updated = batchSvc.getById(created.id);
  _iassert(updated.alokasi === 'Int Gudang', 'Batch update failed');

  batchSvc.delete(created.id);
  var del = batchSvc.getById(created.id);
  _iassert(del.statues === 'DELETED', 'Batch soft delete failed');
  _icleanup(prodSvc, prod.id);
  Logger.log('  PASS');
}

function integration_MasterShippingEmbalage() {
  Logger.log('[integration] ShippingEmbalage: create → find → update → delete');
  var svc = ShippingEmbalageMasterFactory.getService();
  var uniq = 'INT_SEMB_' + Date.now();
  var created = svc.create({ kodeBarang: uniq, namaBarang: 'Int SEMB', kategori: 'Kemasan', satuan: 'Pcs' });
  _iassert(!!created.id, 'SEMB create failed');

  var found = svc.findByField('kodeBarang', uniq);
  _iassert(found.length === 1, 'SEMB find failed');

  svc.update(created.id, { keterangan: 'Updated SEMB' });
  var updated = svc.getById(created.id);
  _iassert(updated.keterangan === 'Updated SEMB', 'SEMB update failed');

  svc.delete(created.id);
  var del = svc.getById(created.id);
  _iassert(del.statues === 'DELETED', 'SEMB soft delete failed');
  Logger.log('  PASS');
}

function integration_MasterProductEmbalage() {
  Logger.log('[integration] ProductEmbalage: create → find → update → delete');
  var svc = ProductEmbalageMasterFactory.getService();
  var uniq = 'INT_PEMB_' + Date.now();
  var created = svc.create({ kodeBarang: uniq, namaBarang: 'Int PEMB', kategori: 'Kemasan', satuan: 'Pcs' });
  _iassert(!!created.id, 'PEMB create failed');

  var found = svc.findByField('kodeBarang', uniq);
  _iassert(found.length === 1, 'PEMB find failed');

  svc.update(created.id, { keterangan: 'Updated PEMB' });
  var updated = svc.getById(created.id);
  _iassert(updated.keterangan === 'Updated PEMB', 'PEMB update failed');

  svc.delete(created.id);
  var del = svc.getById(created.id);
  _iassert(del.statues === 'DELETED', 'PEMB soft delete failed');
  Logger.log('  PASS');
}

function integration_Archieve() {
  Logger.log('[integration] Archieve: upload → find → update → delete');
  var svc = ArchieveFactory.getService();
  var testBase64 = Utilities.base64Encode('Integration test file content');
  var created = svc.uploadFile({
    fileName: 'int_test.txt',
    mimeType: 'text/plain',
    base64Data: testBase64,
    entityType: 'TEST',
    notes: 'Integration test'
  });
  _iassert(!!created.id, 'Archieve upload failed');

  var found = svc.getFileMetadata(created.id);
  _iassert(found.fileName === 'int_test.txt', 'Archieve find failed');

  svc.updateFileMetadata(created.id, { remarks: 'Updated remarks' });
  var updated = svc.getFileMetadata(created.id);
  _iassert(updated.remarks === 'Updated remarks', 'Archieve update failed');

  svc.deleteFile(created.id);
  var del = svc.getFileMetadata(created.id);
  _iassert(del.statues === 'DELETED', 'Archieve soft delete failed');
  Logger.log('  PASS');
}

// ─── TRANSACTIONAL ─────────────────────────────────────

function integration_TransactionalDist() {
  Logger.log('[integration] ALL_DIST: create → find → update → delete');
  var svc = TransactionalFactory.getService('2025', 'ALL_DIST');
  var created = svc.create({ tanggal: new Date().toISOString(), namaKonsumen: 'IntDist', kodeBarang: 'INTD001', batch: 'INTDBATCH', penerimaan: 100, type: 'REGULER' });
  _iassert(!!created.id, 'DIST create failed');

  var found = svc.getById(created.id);
  _iassert(found.namaKonsumen === 'IntDist', 'DIST find failed');

  svc.update(created.id, { distribusi: 30 });
  var updated = svc.getById(created.id);
  _iassert(updated.distribusi === 30, 'DIST update failed');

  svc.delete(created.id);
  Logger.log('  PASS');
}

function integration_TransactionalRcv() {
  Logger.log('[integration] ALL_RCV: create via batchId → verify enrichment');
  var prodSvc = ProductMasterFactory.getService();
  var prod = prodSvc.create({ kodeBarang: 'INTRCV_PROD_' + Date.now(), namaBarang: 'IntRcv Product', tahun: '2025' });
  var batchSvc = BatchMasterFactory.getService();
  var batch = batchSvc.create({ batch: 'INTRCV_BATCH_' + Date.now(), productId: prod.id, mfgDate: '2025-01-01', expireDate: '2026-01-01', status: 'RECEIVED' });
  var rcvSvc = ProductReceivingFactory.getService('2025');
  var created = rcvSvc.create({ batchId: batch.id, type: 'RECEIVING', jumlahBucket: 2, jumlahPerBucket: 10, kondisiKemasan: 'BAIK', placement: 'IntRack' });
  _iassert(!!created.id, 'RCV create failed');
  _iassert(created.kodeBarang === prod.kodeBarang, 'RCV enrichment kodeBarang failed');
  _iassert(created.namaBarang === prod.namaBarang, 'RCV enrichment namaBarang failed');

  rcvSvc.delete(created.id);
  _icleanup(batchSvc, batch.id);
  _icleanup(prodSvc, prod.id);
  Logger.log('  PASS');
}

function integration_TransactionalCons() {
  Logger.log('[integration] ALL_CONS: create → find');
  var svc = TransactionalFactory.getService('2025', 'ALL_CONS');
  var created = svc.create({ tanggal: new Date().toISOString(), namaKonsumen: 'IntCons', kodeBarang: 'INTC001', batch: 'INTCBATCH', penerimaan: 50, type: 'CONS' });
  _iassert(!!created.id, 'CONS create failed');

  var found = svc.getById(created.id);
  _iassert(found.namaKonsumen === 'IntCons', 'CONS find failed');
  svc.delete(created.id);
  Logger.log('  PASS');
}

function integration_TransactionalSemb() {
  Logger.log('[integration] ALL_SEMB: create → find → update → delete');
  var svc = TransactionalShippingEmbalageFactory.getService('2025');
  var created = svc.create({ tanggal: new Date().toISOString(), noDok: 'INT_SEMB_DOK', kodeBarang: 'INTS001', namaBarang: 'Int SEMB', penerimaan: 200 });
  _iassert(!!created.id, 'SEMB create failed');

  svc.update(created.id, { distribusi: 50 });
  var updated = svc.getById(created.id);
  _iassert(updated.distribusi === 50, 'SEMB update failed');

  svc.delete(created.id);
  Logger.log('  PASS');
}

function integration_TransactionalPemb() {
  Logger.log('[integration] ALL_PEMB: create → find → update → delete');
  var svc = TransactionalProductEmbalageFactory.getService('2025');
  var created = svc.create({ tanggal: new Date().toISOString(), noDok: 'INT_PEMB_DOK', kodeBarang: 'INTP001', namaBarang: 'Int PEMB', batch: 'INTPBATCH', penerimaan: 150 });
  _iassert(!!created.id, 'PEMB create failed');

  svc.update(created.id, { distribusi: 25 });
  var updated = svc.getById(created.id);
  _iassert(updated.distribusi === 25, 'PEMB update failed');

  svc.delete(created.id);
  Logger.log('  PASS');
}

// ─── HISTORY ──────────────────────────────────────────

function integration_HistoryProduct() {
  Logger.log('[integration] History Product: fetch by batch');
  var adapter = new ProductHistoryReaderAdapter();
  var repo = new ProductHistoryRepository(adapter);
  var svc = new ProductHistoryService(repo);
  var results = svc.getHistoryByBatch('NON_EXISTENT_BATCH_12345', { limit: 1 });
  _iassert(Array.isArray(results), 'History Product must return array');
  Logger.log('  PASS');
}

function integration_HistoryShippingEmbalage() {
  Logger.log('[integration] History Shipping Embalage: fetch by year');
  var adapter = new HistoryShippingEmbalageReaderAdapter();
  var repo = new HistoryShippingEmbalageRepository(adapter);
  var svc = new HistoryShippingEmbalageService(repo);
  var results = svc.getHistoryByYear('2025', { limit: 1 });
  _iassert(Array.isArray(results), 'History SEMB must return array');
  Logger.log('  PASS');
}

function integration_HistoryProductEmbalage() {
  Logger.log('[integration] History Product Embalage: fetch by year');
  var adapter = new HistoryProductEmbalageReaderAdapter();
  var repo = new HistoryProductEmbalageRepository(adapter);
  var svc = new HistoryProductEmbalageService(repo);
  var results = svc.getHistoryByYear('2025', { limit: 1 });
  _iassert(Array.isArray(results), 'History PEMB must return array');
  Logger.log('  PASS');
}