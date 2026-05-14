// source/server/service/transactional/ProductReceivingService.js

function ProductReceivingService(yearConfig, sheetConfig, repository, batchService, productService) {
  this.repo = repository;
  this.batchService = batchService;
  this.productService = productService;
  this.fieldMapping = sheetConfig.fieldMapping;
  this.currentUser = null;
  this.yearConfig = yearConfig;

  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'transactional',
    spreadsheetId: yearConfig.spreadsheetId,
    sheetName: sheetConfig.sheetName,
    year: yearConfig.year,
    type: sheetConfig.type
  });

  function _invalidateCache() {
    CacheManager.invalidate(cacheGroup);
  }

  var constants = DomainConstants.constants;

  var reverseMapping = {};
  Object.keys(this.fieldMapping).forEach(function(stdField) {
    var headerName = this.fieldMapping[stdField];
    reverseMapping[headerName] = stdField;
  }, this);

  var toStandard = function(rawObj) {
    if (!rawObj) return null;
    var std = {};
    Object.keys(rawObj).forEach(function(header) {
      var stdField = reverseMapping[header];
      if (stdField) std[stdField] = rawObj[header];
    });
    return std;
  };

  var toRaw = function(stdObj) {
    var raw = {};
    Object.keys(this.fieldMapping).forEach(function(stdField) {
      var header = this.fieldMapping[stdField];
      if (stdObj[stdField] !== undefined) raw[header] = stdObj[stdField];
    }, this);
    return raw;
  }.bind(this);

  var prepareRecord = function(data) {
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var now = audit.updatedAt;
    var record = {
      id: data.id || AppUtils.generateUUID(),
      createdAt: data.createdAt || now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      statues: data.statues || 'ACTIVE'
    };
    Object.keys(data).forEach(function(k) { record[k] = data[k]; });
    return record;
  }.bind(this);

  var resolveBatch = function(data) {
    if (data.batchId) {
      var batch = this.batchService.getById(data.batchId);
      if (!batch) throw new Error('Batch dengan ID "' + data.batchId + '" tidak ditemukan.');
      return batch;
    }
    if (data.batchNo) {
      var batchNo = data.batchNo.trim();
      var batches = this.batchService.findByField('batch', batchNo);
      if (batches.length === 0) throw new Error('Batch "' + batchNo + '" tidak ditemukan.');
      return batches[0];
    }
    throw new Error('Kirim batchId (web) atau batchNo (spreadsheet).');
  }.bind(this);

  var resolveProduct = function(batch) {
    if (!batch.productId) throw new Error('Batch "' + batch.batch + '" tidak memiliki productId.');
    var product = this.productService.getById(batch.productId);
    if (!product) throw new Error('Produk dengan ID "' + batch.productId + '" tidak ditemukan.');
    return product;
  }.bind(this);

  this.setCurrentUser = function(user) { this.currentUser = user; };

  this.create = function(data) {
    var batch   = resolveBatch(data);
    var product = resolveProduct(batch);

    var type = (data.type || constants.receivingType.RECEIVING).toUpperCase();
    if (Object.values(constants.receivingType).indexOf(type) === -1)
      throw new Error('Tipe penerimaan tidak valid: ' + type);

    var jenisKemasan = (data.jenisKemasan || '').toUpperCase();
    if (jenisKemasan && Object.values(constants.kemasanType).indexOf(jenisKemasan) === -1)
      throw new Error('Jenis kemasan tidak valid: ' + data.jenisKemasan);

    var kodeBarang = product.kodeBarangNew || product.kodeBarang;
    var namaBarang = product.namaBarangNew || product.namaBarang;

    var jumlahFisik     = NumberUtils.toNumber(data.jumlahFisik);
    var jumlahBucket    = NumberUtils.toNumber(data.jumlahBucket);
    var jumlahPerBucket = NumberUtils.toNumber(data.jumlahPerBucket);

    if ((!jumlahFisik || jumlahFisik === 0) && jumlahBucket > 0 && jumlahPerBucket > 0) {
      jumlahFisik = jumlahBucket * jumlahPerBucket;
    } else if (jumlahFisik === 0 && jumlahBucket === 0 && jumlahPerBucket === 0) {
      throw new Error('Jumlah fisik atau jumlah bucket harus diisi.');
    }

    var enriched = {
      type: type,
      tanggal: data.tanggal || new Date().toISOString(),
      jam: data.jam || null,
      noDokumen: data.noDokumen || null,
      namaKonsumen: data.namaKonsumen || null,
      kotaCabang: data.kotaCabang || null,
      kodeBarang: kodeBarang,
      namaBarang: namaBarang,
      batch: batch.batch || data.batchNo,
      mfgDate: batch.mfgDate || null,
      expireDate: batch.expireDate || null,
      kondisiKemasan: data.kondisiKemasan || null,
      nomorIzinEdar: batch.nomorIzinEdar || null,
      jenisKemasan: jenisKemasan,
      jumlahFisik: jumlahFisik,
      jumlahPerBucket: jumlahPerBucket,
      jumlahBucket: jumlahBucket,
      catatanFisik: data.catatanFisik || null,
      placement: data.placement || null,
      productId: product.id,
      batchId: batch.id
    };

    var record = prepareRecord(enriched);
    this.repo.create(toRaw(record));
    this.repo.updateGlobalCells(this.currentUser ? this.currentUser.email : null);
    _invalidateCache();
    return record;
  };

  this.update = function(id, updates) {
    var rawExisting = this.repo.findById(id);
    if (!rawExisting) throw new Error('Record dengan ID ' + id + ' tidak ditemukan');
    var existing = toStandard(rawExisting);

    if (updates.type && Object.values(constants.receivingType).indexOf(updates.type.toUpperCase()) === -1)
      throw new Error('Tipe penerimaan tidak valid');
    if (updates.jenisKemasan && Object.values(constants.kemasanType).indexOf(updates.jenisKemasan.toUpperCase()) === -1)
      throw new Error('Jenis kemasan tidak valid');

    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var allowed = [
      'type','tanggal','jam','noDokumen','namaKonsumen','kotaCabang',
      'kondisiKemasan','jenisKemasan','jumlahFisik','jumlahPerBucket',
      'jumlahBucket','catatanFisik','placement'
    ];

    var updated = {};
    Object.keys(existing).forEach(function(k) { updated[k] = existing[k]; });
    allowed.forEach(function(f) {
      if (updates[f] !== undefined) updated[f] = updates[f];
    });
    updated.updatedAt = audit.updatedAt;
    updated.updatedBy = audit.updatedBy;

    this.repo.update(id, toRaw(updated));
    this.repo.updateGlobalCells(this.currentUser ? this.currentUser.email : null);
    _invalidateCache();
    return updated;
  };

  this.delete = function(id) {
    var rawExisting = this.repo.findById(id);
    if (!rawExisting) throw new Error('Record dengan ID ' + id + ' tidak ditemukan');
    var existing = toStandard(rawExisting);
    existing.statues = 'DELETED';
    this.repo.update(id, toRaw(existing));
    this.repo.updateGlobalCells(this.currentUser ? this.currentUser.email : null);
    _invalidateCache();
    return { success: true, id: id };
  };
}