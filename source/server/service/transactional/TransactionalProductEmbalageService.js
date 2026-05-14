// source/server/service/transactional/TransactionalProductEmbalageService.js

function TransactionalProductEmbalageService(yearConfig, sheetConfig, repository) {
  this.yearConfig   = yearConfig;
  this.sheetConfig  = sheetConfig;
  this.repo         = repository;
  this.fieldMapping = sheetConfig.fieldMapping;
  this.currentUser  = null;

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

  this.setCurrentUser = function(user) { this.currentUser = user; };

  this._toRaw = function(std) {
    var raw = {};
    var mapping = this.fieldMapping;
    Object.keys(mapping).forEach(function(stdField) {
      var headerName = mapping[stdField];
      if (std[stdField] !== undefined) raw[headerName] = std[stdField];
    });
    return raw;
  };

  this._toStandard = function(raw) {
    if (!raw) return null;
    var std = {};
    var mapping = this.fieldMapping;
    Object.keys(mapping).forEach(function(stdField) {
      var headerName = mapping[stdField];
      std[stdField] = raw[headerName] !== undefined ? raw[headerName] : null;
    });
    std._year      = this.yearConfig.year;
    std._sheetType = this.sheetConfig.type;
    return std;
  };

  this._prepareNewRecord = function(data) {
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var now = audit.updatedAt;
    var std = {
      id: AppUtils.generateUUID(),
      createdAt: now,
      updatedAt: now,
      updatedBy: audit.updatedBy
    };
    Object.keys(data).forEach(function(k) { std[k] = data[k]; });
    return this._toRaw(std);
  };

  this._prepareUpdate = function(id, data) {
    var existingStd = this.getById(id);
    if (!existingStd) throw new Error('Record with ID ' + id + ' not found');
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var updatedStd = {};
    Object.keys(existingStd).forEach(function(k) { updatedStd[k] = existingStd[k]; });
    Object.keys(data).forEach(function(k) { updatedStd[k] = data[k]; });
    updatedStd.updatedAt = audit.updatedAt;
    updatedStd.updatedBy = audit.updatedBy;
    return this._toRaw(updatedStd);
  };

  this._resolveHeaderName = function(standardField) {
    return this.fieldMapping[standardField] || standardField;
  };

  this.getAll = function() {
    return this.repo.adapter.getPaginated(1, 999999).data.map(function(r) { return this._toStandard(r); }, this);
  };

  this.getPaginated = function(page, limit) {
    var result = this.repo.adapter.getPaginated(page, limit);
    return {
      data:       result.data.map(function(r) { return this._toStandard(r); }, this),
      page:       page,
      limit:      limit,
      total:      result.total,
      totalPages: Math.ceil(result.total / limit)
    };
  };

  this.getById = function(id) {
    return this._toStandard(this.repo.findById(id));
  };

  this.findByField = function(standardField, value) {
    var headerName = this._resolveHeaderName(standardField);
    return this.repo.findByField(headerName, value).map(function(r) { return this._toStandard(r); }, this);
  };

  this.findByKodeBarang = function(kodeBarang) {
    return this.findByField('kodeBarang', kodeBarang);
  };

  this.findByNamaBarang = function(namaBarang) {
    return this.findByField('namaBarang', namaBarang);
  };

  this.findByBatch = function(batch) {
    return this.findByField('batch', batch);
  };

  this.findByNoDok = function(noDok) {
    return this.findByField('noDok', noDok);
  };

  this.create = function(data) {
    var raw = this._prepareNewRecord(data);
    this.repo.create(raw);
    this.repo.updateGlobalCells(this.currentUser ? this.currentUser.email : null);
    _invalidateCache();
    return this._toStandard(raw);
  };

  this.update = function(id, data) {
    var raw = this._prepareUpdate(id, data);
    this.repo.update(id, raw);
    this.repo.updateGlobalCells(this.currentUser ? this.currentUser.email : null);
    _invalidateCache();
    return this.getById(id);
  };

  this.delete = function(id) {
    this.repo.delete(id);
    this.repo.updateGlobalCells(this.currentUser ? this.currentUser.email : null);
    _invalidateCache();
    return { success: true, id: id };
  };
}