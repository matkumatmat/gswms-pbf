// source/server/service/transactional/TransactionalService.js

function TransactionalService(yearConfig, sheetConfig, repository) {
  this.yearConfig = yearConfig;
  this.sheetConfig = sheetConfig;
  this.repo = repository;
  this.fieldMapping = sheetConfig.fieldMapping;
  this.currentUser = null;

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
    std._year = this.yearConfig.year;
    std._sheetType = this.sheetConfig.type;
    return std;
  };

  this._prepareNewRecord = function(data) {
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var now = audit.updatedAt;
    var newStd = {
      id: AppUtils.generateUUID(),
      createdAt: now,
      updatedAt: now,
      updatedBy: audit.updatedBy
    };
    Object.keys(data).forEach(function(k) { newStd[k] = data[k]; });
    return this._toRaw(newStd);
  };

  this._prepareUpdate = function(id, data) {
    var existingStd = this.getById(id);
    if (!existingStd) throw new Error('Record not found');
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var updatedStd = {};
    Object.keys(existingStd).forEach(function(k) { updatedStd[k] = existingStd[k]; });
    Object.keys(data).forEach(function(k) { updatedStd[k] = data[k]; });
    updatedStd.updatedAt = audit.updatedAt;
    updatedStd.updatedBy = audit.updatedBy;
    return this._toRaw(updatedStd);
  };

  this.getAll = function() {
    var result = this.repo.adapter.getPaginated(1, 999999);
    return result.data.map(function(r) { return this._toStandard(r); }, this);
  };

  this.getById = function(id) {
    var raw = this.repo.findById(id);
    return this._toStandard(raw);
  };

  this.findByField = function(fieldName, value) {
    var raws = this.repo.findByField(fieldName, value);
    return raws.map(function(r) { return this._toStandard(r); }, this);
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

  this.getByType = function(type) {
    var all = this.getAll();
    return all.filter(function(record) { return (record.type || '').toUpperCase() === type.toUpperCase(); });
  };

  this.getPaginated = function(page, limit, filterType) {
    var result = this.repo.adapter.getPaginated(page, limit);
    var data = result.data.map(function(r) { return this._toStandard(r); }, this);
    if (filterType) {
      data = data.filter(function(r) { return (r.type || '').toUpperCase() === filterType.toUpperCase(); });
    }
    return {
      data: data,
      page: page,
      limit: limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    };
  };
}