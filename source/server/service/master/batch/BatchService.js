// source/server/service/batch/BatchMasterService.js

function BatchMasterService(repository) {
  this.repo = repository;
  this.currentUser = null;

  // Resolve cache group dari AppConfig (satu kali di constructor)
  var masterCfg = ApplicationConfig.dataSources.master.product;
  var batchCfg = masterCfg.configs.find(function(c) { return c.type === 'BATCH'; });
  if (!batchCfg) throw new Error('BATCH config not found');

  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'master',
    spreadsheetId: masterCfg.spreadsheetId,
    sheetName: batchCfg.sheetName
  });

  function _invalidateCache() {
    CacheManager.invalidate(cacheGroup);
  }

  this.setCurrentUser = function (user) {
    this.currentUser = user;
  };

  this._prepareNewRecord = function (data) {
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var now = audit.updatedAt;
    var newRec = {
      id: data.id || AppUtils.generateUUID(),
      createdAt: data.createdAt || now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      statues: data.statues || 'ACTIVE'
    };
    Object.keys(data).forEach(function(k) { newRec[k] = data[k]; });
    return newRec;
  };

  this._filterByStatues = function (records, statues) {
    if (!statues) {
      return records.filter(function(r) { return (r.statues || '').toUpperCase() !== 'DELETED'; });
    }
    if (Array.isArray(statues)) {
      var set = {};
      statues.forEach(function(s) { set[s.toUpperCase()] = true; });
      return records.filter(function(r) { return set[(r.statues || '').toUpperCase()]; });
    }
    var target = statues.toUpperCase();
    return records.filter(function(r) { return (r.statues || '').toUpperCase() === target; });
  };

  this.getAll = function (statues) {
    var all = this.repo.getAll();
    return this._filterByStatues(all, statues);
  };

  this.getById = function (id) {
    return this.repo.findById(id);
  };

  this.getPaginated = function (page, limit, statues) {
    var all = this.getAll(statues);
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    var start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      page: page,
      limit: limit,
      total: all.length,
      totalPages: Math.ceil(all.length / limit)
    };
  };

  this.findByField = function (field, value) {
    return this.repo.findByField(field, value);
  };

  this.create = function (data) {
    var newRec = this._prepareNewRecord(data);
    this.repo.create(newRec);
    this.repo.touchGlobalCells(this.currentUser ? this.currentUser.email : null); // <-- tambahkan
    _invalidateCache();
    return newRec;
  };

  this.update = function (id, data) {
    var existing = this.repo.findById(id);
    if (!existing) throw new Error('Batch not found');
    existing.statues = 'DELETED';
    this.repo.update(id, existing);

    var newData = {};
    Object.keys(existing).forEach(function(k) { newData[k] = existing[k]; });
    Object.keys(data).forEach(function(k) { newData[k] = data[k]; });
    newData.id = id;
    newData.statues = 'ACTIVE';
    var updatedRec = this._prepareNewRecord(newData);
    this.repo.create(updatedRec);
    this.repo.touchGlobalCells(this.currentUser ? this.currentUser.email : null); // <-- tambahkan
    _invalidateCache();
    return updatedRec;
  };

  this.delete = function (id) {
    var existing = this.repo.findById(id);
    if (!existing) throw new Error('Batch not found');
    existing.statues = 'DELETED';
    this.repo.update(id, existing);
    this.repo.touchGlobalCells(this.currentUser ? this.currentUser.email : null); // <-- tambahkan
    _invalidateCache();
    return { success: true, id: id };
  };
}