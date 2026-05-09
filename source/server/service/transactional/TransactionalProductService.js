// source/server/service/transactional/TransactionalService.js

function TransactionalService(yearConfig, sheetConfig, repository) {
  this.yearConfig = yearConfig;
  this.sheetConfig = sheetConfig;
  this.repo = repository;
  this.fieldMapping = sheetConfig.fieldMapping; // { standardField: "Header Name" }
  this.currentUser = null;

  this.setCurrentUser = function(user) { this.currentUser = user; };

  // Standard → Raw (key = header)
  this._toRaw = function(std) {
    const raw = {};
    for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
      if (std[stdField] !== undefined) {
        raw[headerName] = std[stdField];
      }
    }
    return raw;
  };

  // Raw → Standard
  this._toStandard = function(raw) {
    if (!raw) return null;
    const std = {};
    for (const [stdField, headerName] of Object.entries(this.fieldMapping)) {
      std[stdField] = raw[headerName] !== undefined ? raw[headerName] : null;
    }
    std._year = this.yearConfig.year;
    std._sheetType = this.sheetConfig.type;
    return std;
  };

  this._prepareNewRecord = function(data) {
    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const now = audit.updatedAt;
    const newStd = {
      id: AppUtils.generateUUID(),
      createdAt: now,
      updatedAt: now,
      updatedBy: audit.updatedBy,
      ...data
    };
    return this._toRaw(newStd);
  };

  this._prepareUpdate = function(id, data) {
    const existingStd = this.getById(id);
    if (!existingStd) throw new Error('Record not found');
    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const updatedStd = { ...existingStd, ...data, updatedAt: audit.updatedAt, updatedBy: audit.updatedBy };
    return this._toRaw(updatedStd);
  };

  this.getAll = function() {
    // Untuk getAll kita bisa ambil page besar, misal page=1, limit=999999
    const result = this.repo.adapter.getPaginated(1, 999999);
    return result.data.map(r => this._toStandard(r));
  };

  this.getById = function(id) {
    const raw = this.repo.findById(id);
    return this._toStandard(raw);
  };

  this.findByField = function(fieldName, value) {
    const raws = this.repo.findByField(fieldName, value);
    return raws.map(r => this._toStandard(r));
  };

  this.create = function(data) {
    const raw = this._prepareNewRecord(data);
    this.repo.create(raw);
    // Langsung konversi raw yang sudah kita buat tanpa baca ulang dari sheet
    return this._toStandard(raw);
  };

  this.update = function(id, data) {
    const raw = this._prepareUpdate(id, data);
    this.repo.update(id, raw);
    return this.getById(id);
  };

  this.delete = function(id) {
    this.repo.delete(id);
    return { success: true, id };
  };

  this.getByType = function(type) {
    const all = this.getAll();
    return all.filter(record => (record.type || '').toUpperCase() === type.toUpperCase());
  };

  this.getPaginated = function(page, limit, filterType = null) {
    let result = this.repo.adapter.getPaginated(page, limit);
    let data = result.data.map(r => this._toStandard(r));
    if (filterType) {
      data = data.filter(r => (r.type || '').toUpperCase() === filterType.toUpperCase());
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